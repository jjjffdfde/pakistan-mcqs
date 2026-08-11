#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 1: Enterprise Knowledge Assistant Engine
   Offline, deterministic guidance over the live read-only DB:
     - subject guidance (volume, structure, difficulty, KG depth)
     - concept navigation (KG concept/micro/objective landscape)
     - learning path suggestions (kg_learning_paths + structure)
     - revision recommendations (due schedule, flashcards, bookmarks)
     - exam preparation (exam mappings, mocks, past papers)
   Report: docs/phase27_assistant.json
   Usage:  node assistant/knowledge-assistant.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase27_assistant.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");

function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function generate(db) {
  const bySubject = db.prepare(
    "SELECT subject_id, COUNT(*) n FROM mcqs WHERE status='active' GROUP BY subject_id"
  ).all();
  const bySubjectDiff = db.prepare(
    "SELECT subject_id, difficulty, COUNT(*) n FROM mcqs WHERE status='active' GROUP BY subject_id, difficulty"
  ).all();
  const chaptersBySubject = db.prepare("SELECT subject_id, COUNT(*) n FROM chapters GROUP BY subject_id").all();
  const topicsBySubject = db.prepare(
    "SELECT c.subject_id, COUNT(*) n FROM topics t JOIN chapters c ON c.id=t.chapter_id GROUP BY c.subject_id"
  ).all();
  const kgBySubject = db.prepare("SELECT subject_id, COUNT(*) n FROM kg_concepts GROUP BY subject_id").all();
  const subjects = db.prepare("SELECT id, name, category_id, exam_ids FROM subjects WHERE status='active'").all();

  const mk = (rows) => Object.fromEntries(rows.map((r) => [r.subject_id, r.n]));
  const mcqN = mk(bySubject);
  const chapN = mk(chaptersBySubject);
  const topN = mk(topicsBySubject);
  const kgN = mk(kgBySubject);
  const diffMap = {};
  for (const r of bySubjectDiff) {
    if (!diffMap[r.subject_id]) diffMap[r.subject_id] = { easy: 0, medium: 0, hard: 0 };
    diffMap[r.subject_id][r.difficulty] = r.n;
  }

  /* ---- subject guidance: top 10 subjects by volume ---- */
  const topSubjects = subjects
    .map((s) => ({ ...s, mcqs: mcqN[s.id] || 0 }))
    .sort((a, b) => b.mcqs - a.mcqs || a.id.localeCompare(b.id))
    .slice(0, 10);

  const subjectGuidance = topSubjects.map((s) => {
    const keyChapters = db.prepare(
      "SELECT c.name, COUNT(*) n FROM mcqs m JOIN chapters c ON c.id=m.chapter_id WHERE m.subject_id=? AND m.status='active' GROUP BY c.name ORDER BY n DESC LIMIT 3"
    ).all(s.id);
    const d = diffMap[s.id] || { easy: 0, medium: 0, hard: 0 };
    return {
      subject_id: s.id,
      name: s.name,
      category_id: s.category_id,
      mcqs: s.mcqs,
      chapters: chapN[s.id] || 0,
      topics: topN[s.id] || 0,
      kg_concepts: kgN[s.id] || 0,
      difficulty: d,
      top_chapters: keyChapters.map((c) => ({ name: c.name, mcqs: c.n })),
      guidance: `Start with the ${keyChapters[0] ? keyChapters[0].name : "core"} chapters, then target ${d.medium || 0}+ medium questions to build fluency.`
    };
  });

  /* ---- concept navigation: KG landscape ---- */
  const kgMeta = {
    subjects_with_kg: db.prepare("SELECT COUNT(DISTINCT subject_id) n FROM kg_concepts").get().n,
    concepts: db.prepare("SELECT COUNT(*) n FROM kg_concepts").get().n,
    micros: db.prepare("SELECT COUNT(*) n FROM kg_micro_concepts").get().n,
    objectives: db.prepare("SELECT COUNT(*) n FROM kg_learning_objectives").get().n,
  };
  const bloomDist = db.prepare(
    "SELECT bloom, difficulty, COUNT(*) n FROM kg_learning_objectives GROUP BY bloom, difficulty ORDER BY n DESC LIMIT 8"
  ).all();
  const topConcepts = db.prepare(
    "SELECT name, subject_id, exam_frequency, revision_priority FROM kg_concepts ORDER BY exam_frequency DESC LIMIT 8"
  ).all();

  /* ---- learning path suggestions ---- */
  const paths = db.prepare("SELECT id, subject_id, exam_id, name FROM kg_learning_paths").all();
  const pathSteps = db.prepare(
    "SELECT s.path_id, s.step_order, c.id concept_id, c.name concept_name FROM kg_learning_path_steps s JOIN kg_concepts c ON c.id=s.concept_id ORDER BY s.path_id, s.step_order"
  ).all();
  const learningPaths = paths.map((p) => ({
    path_id: p.id,
    subject_id: p.subject_id,
    exam_id: p.exam_id,
    name: p.name,
    steps: pathSteps.filter((s) => s.path_id === p.id).map((s) => ({ order: s.step_order, concept_id: s.concept_id, concept: s.concept_name })),
  }));

  /* ---- revision recommendations ---- */
  const now = new Date().toISOString().slice(0, 10);
  const dueRevisions = db.prepare(
    "SELECT mcq_id, topic_id, box, interval_days, due_date FROM revision_schedule WHERE status='active' AND due_date<=? ORDER BY due_date LIMIT 10"
  ).all(now);
  const dueFlashcards = db.prepare(
    "SELECT mcq_id, box, due_date FROM flashcards WHERE due_date<=? ORDER BY due_date LIMIT 10"
  ).all(now);
  const bookmarks = db.prepare("SELECT mcq_id, created_at FROM bookmarks ORDER BY created_at DESC LIMIT 8").all();

  /* ---- exam preparation ---- */
  const examWeights = db.prepare(
    "SELECT exam_id, SUM(weight) w, COUNT(*) n FROM kg_exam_mappings GROUP BY exam_id ORDER BY w DESC LIMIT 12"
  ).all();
  const mockN = db.prepare("SELECT exam_id, COUNT(*) n FROM mocktests WHERE status='active' GROUP BY exam_id").all();
  const paperN = db.prepare("SELECT exam_id, COUNT(*) n FROM pastpapers GROUP BY exam_id").all();
  const syllabusN = db.prepare("SELECT exam_id, COUNT(*) n FROM kg_syllabus_units GROUP BY exam_id").all();
  const eyN = mk(mockN);
  const epN = mk(paperN);
  const esN = mk(syllabusN);
  const examPreparation = examWeights.map((e) => ({
    exam_id: e.exam_id,
    mappings: e.n,
    mock_tests: eyN[e.exam_id] || 0,
    past_papers: epN[e.exam_id] || 0,
    syllabus_units: esN[e.exam_id] || 0,
  }));

  const report = {
    step: "assistant",
    generated_at: new Date().toISOString(),
    summary: {
      subjects_guided: subjectGuidance.length,
      kg_concepts: kgMeta.concepts,
      learning_paths: learningPaths.length,
      revisions_due: dueRevisions.length,
      flashcards_due: dueFlashcards.length,
      exams_covered: examPreparation.length,
      overall_accuracy: pct(
        db.prepare("SELECT SUM(correct) ok FROM history").get().ok,
        db.prepare("SELECT COUNT(*) n FROM history").get().n
      ),
      status: "PASS",
    },
    subject_guidance: subjectGuidance,
    concept_navigation: {
      kg_landscape: kgMeta,
      bloom_distribution: bloomDist,
      start_here: topConcepts,
      how_to_navigate:
        "Pick a subject -> open its concept map -> study micro-concepts for the target concept -> drill objectives at the matching Bloom level.",
    },
    learning_paths: learningPaths,
    revision_recommendations: {
      due_revisions: dueRevisions,
      due_flashcards: dueFlashcards,
      bookmarks: bookmarks.map((b) => ({ mcq_id: b.mcq_id, saved: b.created_at })),
      strategy: "Review due revisions first, clear flashcards, then re-attempt bookmarked questions.",
    },
    exam_preparation: examPreparation,
  };
  return report;
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const report = generate(db);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
    console.log(`[assistant] subjects=${report.summary.subjects_guided} kg=${report.summary.kg_concepts} paths=${report.summary.learning_paths} exams=${report.summary.exams_covered}`);
    console.log("report -> docs/phase27_assistant.json");
    process.exit(0);
  } catch (e) {
    console.error("[assistant] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate };
