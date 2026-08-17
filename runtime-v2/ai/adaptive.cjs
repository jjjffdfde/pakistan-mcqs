/* runtime-v2/ai/adaptive.cjs — adaptive quiz engine, file-backed.
   Port of ai/adaptive.js (phase 12): session queue in the JSON table store
   (ai_state), pools built from the NDJSON query engine, each submission
   recorded through the shared write path. RANDOM() pool orderings use the
   query engine's seeded/random sampling (documented parity divergence). */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const Q = require("../query-engine.cjs");
const record = require("./record.cjs");

const STATE_KEY = (d) => "adaptive:" + d;

function getState(deviceId) {
  const raw = S.stateGet(STATE_KEY(deviceId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function saveState(deviceId, st) {
  return S.stateSet(STATE_KEY(deviceId), JSON.stringify(st));
}

async function poolForWeakTopics(deviceId, target, count) {
  const weak = S.all("weak_topics", { match: { device_id: deviceId }, order: [["priority", "desc"]], limit: 6 });
  if (!weak.length) return [];
  const per = Math.max(1, Math.ceil(Math.min(200, count * 3) / weak.length));
  const out = [];
  for (const w of weak) {
    try {
      const r = await Q.random({ topic_id: w.topic_id, limit: per });
      for (const m of r.results || r) {
        if (target && String(m.difficulty) !== String(target)) continue;
        out.push({ id: m.id, difficulty: m.difficulty });
      }
    } catch (e) { /* topic with no mcqs — skip */ }
  }
  return out;
}

async function fillPool(target, count) {
  const r = await Q.random({ limit: Math.min(200, count) });
  return (r.results || r)
    .filter((m) => !target || String(m.difficulty) === String(target))
    .map((m) => ({ id: m.id, difficulty: m.difficulty }));
}

async function start(deviceId, body = {}) {
  const count = U.clamp(parseInt(body.count, 10) || 10, 5, 60);
  const mode = String(body.mode || "adaptive").slice(0, 20);
  const dueCount = Math.round(count * 0.3);
  const weakCount = Math.round(count * 0.6);
  const fillCount = count - dueCount - weakCount;

  const dueRows = S.all("revision_schedule", {
    match: { device_id: deviceId }, order: [["due_date", "asc"]], limit: Math.min(200, dueCount * 3)
  }).filter((r) => r.due_date <= U.today() && r.status === "active").slice(0, dueCount);

  let due = [];
  if (dueRows.length) {
    const { byId } = await Q.fetchRows(dueRows.map((r) => r.mcq_id));
    due = dueRows.map((r) => ({ id: r.mcq_id, difficulty: byId.get(r.mcq_id) ? byId.get(r.mcq_id).difficulty : "medium", source: "due" }));
  }
  const dueIds = new Set(due.map((d) => d.id));
  const weakP = await poolForWeakTopics(deviceId, "", weakCount);
  const weak = weakP.filter((w) => !dueIds.has(w.id)).slice(0, weakCount).map((w) => ({ ...w, source: "weak" }));
  const weakIds = new Set(weak.map((w) => w.id));
  const fillP = await fillPool("", fillCount);
  const fill = fillP.filter((f) => !dueIds.has(f.id) && !weakIds.has(f.id)).slice(0, fillCount).map((f) => ({ ...f, source: "fill" }));

  const list = [...due, ...weak, ...fill];
  if (!list.length) return { error: "No questions available — answer some questions or build a plan first." };

  const sess = await S.insert("learning_sessions", {
    id: S.nextId("learning_sessions"),
    device_id: deviceId, session_type: "adaptive", mode,
    mcqs_answered: 0, correct: 0, skipped: 0, accuracy: 0, duration_sec: 0,
    status: "active", started_at: U.utcNow(), ended_at: null
  });

  const st = { session_id: sess.id, list, i: 0, correct: 0, answered: 0, skipped: 0, start: Date.now(), active: true };
  await saveState(deviceId, st);
  return { session_id: sess.id, total: list.length, started: true };
}

async function qView(id) {
  try {
    const m = await Q.getById(id);
    if (!m) return null;
    const o = {};
    for (const opt of m.options || []) o[opt.label] = opt.text;
    return {
      id: m.id, question: m.question, difficulty: m.difficulty,
      subject_id: m.subject_id, topic_id: m.topic_id, chapter_id: m.chapter_id,
      learning_objective: m.learning_objective || "", bloom: m.bloom_taxonomy || "",
      optionA: o.A || null, optionB: o.B || null, optionC: o.C || null, optionD: o.D || null
    };
  } catch (e) { return null; }
}

async function nextQ(deviceId) {
  const st = getState(deviceId);
  if (!st || !st.active) return { done: true };
  if (st.i >= st.list.length) return { done: true };
  const acc = st.answered > 0 ? st.correct / st.answered : 0.5;
  const target = acc < 0.4 ? "easy" : acc > 0.75 ? "hard" : "medium";
  const idx = st.list.findIndex((q, i) => i >= st.i && String(q.difficulty) === target);
  const pick = idx >= 0 ? idx : st.i;
  const q = st.list[pick];
  st.list.splice(pick, 1);
  await saveState(deviceId, st);
  return { done: false, question: await qView(q.id), source: q.source, remaining: st.list.length };
}

async function submit(deviceId, body = {}) {
  const st = getState(deviceId);
  if (!st || !st.active) return { error: "No active adaptive session — start one first." };
  const mcqId = String(body.mcq_id || "");
  if (!mcqId) return { error: "mcq_id required" };
  const m = await Q.getById(mcqId);
  if (!m) return { error: "unknown mcq" };

  const isSkip = body.answer === null || body.answer === undefined || body.answer === "";
  const answer = String(body.answer || "").toUpperCase();
  const correct = !isSkip && answer === m.correct_answer;

  await record.recordAnswer({
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
  await saveState(deviceId, st);

  const next = await nextQ(deviceId);
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

async function finish(deviceId) {
  const st = getState(deviceId);
  if (!st || !st.active) return { error: "No active adaptive session" };
  const duration = Math.round((Date.now() - st.start) / 1000);
  const acc = st.answered > 0 ? U.pct(st.correct, st.answered) : 0;
  await S.update("learning_sessions", { id: st.session_id }, {
    mcqs_answered: st.answered, correct: st.correct, skipped: st.skipped,
    accuracy: acc, duration_sec: duration, ended_at: U.utcNow(), status: "completed"
  });
  st.active = false;
  await saveState(deviceId, st);
  const prof = await require("./profile.cjs").refresh(deviceId);
  const weak = await require("./weak.cjs").rebuild(deviceId);
  return {
    session_id: st.session_id,
    answered: st.answered,
    correct: st.correct,
    skipped: st.skipped,
    accuracy: acc,
    duration_sec: duration,
    profile: prof,
    weak_topics: weak.weak
  };
}

module.exports = { start, nextQ, submit, finish };
