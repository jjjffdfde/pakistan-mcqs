/* ============================================================
   Phase 12 — AI learning engine: adaptive quiz
   Server-side adaptive session: queue built from spaced-revision
   items (30%), weak topics (60%) and a fill pool; difficulty
   shifts live based on running accuracy. Each submission is
   graded server-side and recorded via the shared write path.
   ============================================================ */
"use strict";
const U = require("./util.js");
const record = require("./record.js");
const spaced = require("./spaced.js");

const STATE_KEY = (d) => "adaptive:" + d;

function getState(db, deviceId) {
  const row = db.get("SELECT value FROM ai_state WHERE key=?", [STATE_KEY(deviceId)]);
  if (!row) return null;
  try { return JSON.parse(row.value); } catch (e) { return null; }
}

function saveState(db, deviceId, st) {
  db.run(
    `INSERT INTO ai_state (key, value, built_at) VALUES (?,?,datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, built_at=datetime('now')`,
    [STATE_KEY(deviceId), JSON.stringify(st)]
  );
}

function poolForWeakTopics(db, deviceId, target, count) {
  const weak = db.all("SELECT topic_id, priority FROM weak_topics WHERE device_id=? ORDER BY priority DESC LIMIT 6", [deviceId]);
  if (!weak.length) return [];
  const topics = weak.map((w) => w.topic_id);
  const ph = topics.map(() => "?").join(",");
  return db.all(
    `SELECT id, difficulty FROM mcqs
     WHERE status='active' AND topic_id IN (${ph})
       AND (CASE WHEN ?='' THEN 1 ELSE difficulty=? END)
     ORDER BY RANDOM() LIMIT ?`,
    [...topics, target, target, Math.min(200, count * 3)]
  );
}

function fillPool(db, target, count) {
  return db.all(
    `SELECT id, difficulty FROM mcqs
     WHERE status='active' AND (CASE WHEN ?='' THEN 1 ELSE difficulty=? END)
     ORDER BY RANDOM() LIMIT ?`,
    [target, target, Math.min(200, count)]
  );
}

function start(db, deviceId, body = {}) {
  const count = U.clamp(parseInt(body.count, 10) || 10, 5, 60);
  const mode = String(body.mode || "adaptive").slice(0, 20);
  const dueCount = Math.round(count * 0.3);
  const weakCount = Math.round(count * 0.6);
  const fillCount = count - dueCount - weakCount;

  const due = db.all(
    `SELECT r.mcq_id id, m.difficulty FROM revision_schedule r
     JOIN mcqs m ON m.id = r.mcq_id
     WHERE r.device_id=? AND r.due_date <= ? AND r.status='active'
     ORDER BY r.due_date ASC LIMIT ?`,
    [deviceId, U.today(), dueCount]
  );
  const dueIds = new Set(due.map((d) => d.id));
  const weak = poolForWeakTopics(db, deviceId, "", weakCount).filter((w) => !dueIds.has(w.id)).slice(0, weakCount);
  const weakIds = new Set(weak.map((w) => w.id));
  const fill = fillPool(db, "", fillCount).filter((f) => !dueIds.has(f.id) && !weakIds.has(f.id)).slice(0, fillCount);

  const list = [
    ...due.map((d) => ({ id: d.id, difficulty: d.difficulty, source: "due" })),
    ...weak.map((w) => ({ id: w.id, difficulty: w.difficulty, source: "weak" })),
    ...fill.map((f) => ({ id: f.id, difficulty: f.difficulty, source: "fill" }))
  ];
  if (!list.length) return { error: "No questions available — answer some questions or build a plan first." };

  const sess = db.run(
    `INSERT INTO learning_sessions (device_id, session_type, mode, started_at) VALUES (?,?,?,datetime('now'))`,
    [deviceId, "adaptive", mode]
  ).lastInsertRowid;

  const st = { session_id: sess, list, i: 0, correct: 0, answered: 0, skipped: 0, start: Date.now(), active: true };
  saveState(db, deviceId, st);
  return { session_id: sess, total: list.length, started: true };
}

function qView(db, id) {
  const m = db.get(
    `SELECT id, question, difficulty, subject_id, topic_id, chapter_id, learning_objective, bloom_taxonomy
     FROM mcqs WHERE id=? AND status='active'`, [id]
  );
  if (!m) return null;
  const opts = db.all("SELECT label, text FROM options WHERE mcq_id=? ORDER BY label", [id]);
  const o = {};
  opts.forEach((x) => { o[x.label] = x.text; });
  return {
    id: m.id,
    question: m.question,
    difficulty: m.difficulty,
    subject_id: m.subject_id,
    topic_id: m.topic_id,
    chapter_id: m.chapter_id,
    learning_objective: m.learning_objective || "",
    bloom: m.bloom_taxonomy || "",
    optionA: o.A || null, optionB: o.B || null, optionC: o.C || null, optionD: o.D || null
  };
}

function nextQ(db, deviceId) {
  const st = getState(db, deviceId);
  if (!st || !st.active) return { done: true };
  if (st.i >= st.list.length) return { done: true };
  const acc = st.answered > 0 ? st.correct / st.answered : 0.5;
  const target = acc < 0.4 ? "easy" : acc > 0.75 ? "hard" : "medium";
  const idx = st.list.findIndex((q, i) => i >= st.i && q.difficulty === target);
  const pick = idx >= 0 ? idx : st.i;
  const q = st.list[pick];
  st.list.splice(pick, 1);
  saveState(db, deviceId, st);
  return { done: false, question: qView(db, q.id), source: q.source, remaining: st.list.length };
}

function submit(db, deviceId, body = {}) {
  const st = getState(db, deviceId);
  if (!st || !st.active) return { error: "No active adaptive session — start one first." };
  const mcqId = String(body.mcq_id || "");
  if (!mcqId) return { error: "mcq_id required" };
  const m = db.get("SELECT * FROM mcqs WHERE id=?", [mcqId]);
  if (!m) return { error: "unknown mcq" };

  const isSkip = body.answer === null || body.answer === undefined || body.answer === "";
  const answer = String(body.answer || "").toUpperCase();
  const correct = !isSkip && answer === m.correct_answer;

  record.recordAnswer(db, {
    device_id: deviceId,
    mcq_id: mcqId,
    correct,
    time_taken_sec: body.time_sec,
    skipped: isSkip,
    mode: "adaptive",
    session_id: st.session_id
  });

  st.answered++;
  if (isSkip) st.skipped++; else if (correct) st.correct++;
  saveState(db, deviceId, st);

  const next = nextQ(db, deviceId);
  return {
    correct,
    correct_answer: m.correct_answer,
    explanation: m.explanation || "",
    why_wrong: m.explanation_why_wrong || "",
    memory_trick: m.memory_trick || "",
    learning_objective: m.learning_objective || "",
    skipped: isSkip,
    answered: st.answered,
    remaining: next.done ? 0 : next.remaining,
    done: next.done,
    question: next.done ? null : next.question
  };
}

function finish(db, deviceId) {
  const st = getState(db, deviceId);
  if (!st || !st.active) return { error: "No active adaptive session" };
  const duration = Math.round((Date.now() - st.start) / 1000);
  const acc = st.answered > 0 ? U.pct(st.correct, st.answered) : 0;
  db.run(
    `UPDATE learning_sessions SET mcqs_answered=?, correct=?, skipped=?, accuracy=?, duration_sec=?, ended_at=datetime('now')
     WHERE id=?`,
    [st.answered, st.correct, st.skipped, acc, duration, st.session_id]
  );
  st.active = false;
  saveState(db, deviceId, st);
  const profile = require("./profile.js").refresh(db, deviceId);
  const weak = require("./weak.js").rebuild(db, deviceId);
  return {
    session_id: st.session_id,
    answered: st.answered,
    correct: st.correct,
    skipped: st.skipped,
    accuracy: acc,
    duration_sec: duration,
    profile,
    weak_topics: weak.weak
  };
}

module.exports = { start, nextQ, submit, finish };
