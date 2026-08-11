#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 4: Enterprise Recommendation Engine
   Deterministic hybrid recommender (read-only):
     - MCQ recommendations (top Flashcards topics, recent active)
     - subject recommendations (untouched + high volume)
     - concept recommendations (weak topics -> kg concepts)
     - learning objective recommendations (per concept)
     - practice set recommendations (quizzes per exam)
     - mock test recommendations (target exam)
     - revision session recommendations (due schedule)
   Report: docs/phase27_recommendations.json
   Usage:  node assistant/recommendation-engine.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase27_recommendations.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const DAY = 86400000;

function addDays(base, n) {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function generate(db) {
  const today = new Date().toISOString().slice(0, 10);
  const profile = db.prepare("SELECT * FROM user_profiles").all()[0] || {};
  const targetExam = profile.target_exam || "";
  const targetDate = profile.target_date || "";
  const daysLeft = targetDate ? Math.max(0, Math.ceil((Date.parse(targetDate + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / DAY)) : 0;

  /* ---- weak topic ids for MCQ drafting ---- */
  const weak = db.prepare(
    "SELECT w.topic_id, w.subject_id, w.priority, t.name topic_name FROM weak_topics w LEFT JOIN topics t ON t.id=w.topic_id ORDER BY w.priority DESC, w.topic_id"
  ).all();
  const topicIds = weak.map((w) => w.topic_id).filter(Boolean).slice(0, 8);

  const mcqRecs = [];
  if (topicIds.length) {
    const placeholders = topicIds.map(() => "?").join(",");
    const rows = db.prepare(
      `SELECT id, subject_id, difficulty, topic_id FROM mcqs WHERE status='active' AND topic_id IN (${placeholders}) ORDER BY id DESC LIMIT 12`
    ).all(...topicIds);
    mcqRecs.push(...rows.map((r) => ({ mcq_id: r.id, subject_id: r.subject_id, difficulty: r.difficulty, reason: "weak-topic practice" })));
  }
  const fresh = db.prepare("SELECT id, subject_id, difficulty FROM mcqs WHERE status='active' ORDER BY id DESC LIMIT 6").all();
  mcqRecs.push(...fresh.map((r) => ({ mcq_id: r.id, subject_id: r.subject_id, difficulty: r.difficulty, reason: "recently published" })));

  /* ---- subject recommendations ---- */
  const attempted = new Set(db.prepare(
    "SELECT DISTINCT m.subject_id FROM history h JOIN mcqs m ON m.id=h.mcq_id"
  ).all().map((r) => r.subject_id));
  const subjectStats = db.prepare(
    "SELECT s.id, s.name, COUNT(m.id) n FROM subjects s JOIN mcqs m ON m.subject_id=s.id AND m.status='active' GROUP BY s.id ORDER BY n DESC LIMIT 25"
  ).all();
  const untouched = subjectStats.filter((s) => !attempted.has(s.id)).slice(0, 6);
  const subjectRecs = untouched.map((s) => ({
    subject_id: s.id,
    name: s.name,
    mcqs: s.n,
    reason: "untouched high-volume subject — start with " + s.name,
  }));

  /* ---- concept recommendations per weak topic ---- */
  const conceptRecs = [];
  for (const w of weak.slice(0, 6)) {
    const concepts = db.prepare(
      "SELECT name, slug, exam_frequency FROM kg_concepts WHERE topic_id=? ORDER BY exam_frequency DESC LIMIT 3"
    ).all(w.topic_id);
    conceptRecs.push({
      topic_id: w.topic_id,
      topic_name: w.topic_name || w.topic_id,
      priority: w.priority,
      concepts: concepts.map((c) => ({ name: c.name, exam_frequency: c.exam_frequency })),
      reason: "weak topic — drill these concepts first",
    });
  }
  const objectiveRecs = db.prepare(
    "SELECT o.concept_id, o.bloom, o.difficulty, COUNT(*) n FROM kg_learning_objectives o JOIN kg_concepts c ON c.id=o.concept_id WHERE c.subject_id IN (SELECT DISTINCT subject_id FROM weak_topics) GROUP BY o.concept_id, o.bloom, o.difficulty ORDER BY n DESC LIMIT 12"
  ).all().map((o) => ({ concept_id: o.concept_id, bloom: o.bloom, difficulty: o.difficulty, objectives: o.n }));

  /* ---- practice sets (quizzes) ---- */
  const quizRecs = (() => {
    const all = db.prepare("SELECT id, title, subject_ids, total_questions, difficulty FROM quizzes WHERE status='active' ORDER BY id LIMIT 25").all();
    if (!targetExam) return all;
    const examSubjects = new Set(db.prepare(
      "SELECT subject_id FROM kg_exam_mappings WHERE exam_id=? AND subject_id IS NOT NULL"
    ).all(targetExam).map((r) => r.subject_id));
    if (!examSubjects.size) return all.slice(0, 6);
    const hit = all.filter((q) => String(q.subject_ids || "").split(",").some((s) => examSubjects.has(s))).slice(0, 6);
    return hit.length ? hit : all.slice(0, 6);
  })();
  const setRecs = quizRecs.map((q) => ({ quiz_id: q.id, title: q.title, subject_ids: q.subject_ids, total_questions: q.total_questions, difficulty: q.difficulty, reason: "targeted practice set" }));

  /* ---- mock tests ---- */
  const mockRecs = db.prepare(
    "SELECT id, title, exam_id, total_questions, duration_mins, difficulty FROM mocktests WHERE status='active' ORDER BY (exam_id=?) DESC, id LIMIT 6"
  ).all(targetExam || "");
  if (targetExam) {
    const tm = db.prepare("SELECT id, title, exam_id, total_questions, duration_mins FROM mocktests WHERE status='active' AND exam_id=? ORDER BY id LIMIT 3").all(targetExam);
    if (tm.length) mockRecs.unshift(...tm.map((m) => ({ ...m, difficulty: m.difficulty || "medium" })));
  }

  /* ---- revision sessions ---- */
  const dueRev = db.prepare("SELECT mcq_id, due_date, box FROM revision_schedule WHERE status='active' AND due_date<=? ORDER BY due_date LIMIT 15").all(today);
  const dueCards = db.prepare("SELECT mcq_id, due_date, box FROM flashcards WHERE due_date<=? ORDER BY due_date LIMIT 15").all(today);
  const revisionRecs = [
    { type: "spaced", title: "Due spaced revisions", items: dueRev, session_size: Math.min(15, dueRev.length) },
    { type: "flashcards", title: "Due flashcards", items: dueCards, session_size: Math.min(15, dueCards.length) },
  ];

  const report = {
    step: "recommendations",
    generated_at: new Date().toISOString(),
    summary: {
      mcqs: mcqRecs.length,
      subjects: subjectRecs.length,
      concepts: conceptRecs.length,
      objectives: objectiveRecs.length,
      practice_sets: setRecs.length,
      mocks: mockRecs.length,
      revision_sessions: revisionRecs.length,
      target_exam: targetExam,
      exam_days_left: daysLeft,
      status: "PASS",
    },
    mcq_recommendations: mcqRecs,
    subject_recommendations: subjectRecs,
    concept_recommendations: conceptRecs,
    objective_recommendations: objectiveRecs,
    practice_set_recommendations: setRecs,
    mock_test_recommendations: mockRecs,
    revision_session_recommendations: revisionRecs,
  };
  return report;
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const report = generate(db);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
    console.log(`[recommendation-engine] mcqs=${report.summary.mcqs} subjects=${report.summary.subjects} concepts=${report.summary.concepts} mocks=${report.summary.mocks} exam=${report.summary.target_exam}`);
    console.log("report -> docs/phase27_recommendations.json");
    process.exit(0);
  } catch (e) {
    console.error("[recommendation-engine] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate };
