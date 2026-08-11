/* ============================================================
   Pakistan MCQS Hub — Export DB to Static JSON (Enterprise 2026)
   Generates data/export/mcqs.json + section files + taxonomy.
   NOTE: writes to data/export/ so the live static bank under
   data/ (mcqs.json, mcqs/*.json) is never overwritten.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("./engine.js");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "export");
const db = open();

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function attachOptions(rows) {
  if (!rows || !rows.length) return rows || [];
  const opts = db.prepare("SELECT mcq_id, label, text FROM options").all();
  const byId = {};
  opts.forEach((o) => { (byId[o.mcq_id] = byId[o.mcq_id] || {})[o.label] = o.text; });
  rows.forEach((r) => {
    const o = byId[r.id] || {};
    r.optionA = o.A ?? null; r.optionB = o.B ?? null; r.optionC = o.C ?? null; r.optionD = o.D ?? null;
  });
  return rows;
}

function main() {
  ensureDir(OUT);
  const rows = attachOptions(db.prepare("SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id WHERE m.status='active' ORDER BY m.subject_id, m.chapter_id, m.topic_id, m.id").all());

  /* Master mcqs.json (all MCQs) */
  const master = rows.map(m => ({
    id: m.id, question: m.question, optionA: m.optionA, optionB: m.optionB, optionC: m.optionC, optionD: m.optionD,
    correctAnswer: m.correct_answer, difficulty: m.difficulty, subjectId: m.subject_id, chapterId: m.chapter_id,
    topicId: m.topic_id, explanation: m.explanation, tags: JSON.parse(m.tags || "[]"), examIds: m.exam_ids || "",
    year: m.year, references: JSON.parse(m.references_json || "[]"), source: m.source, status: m.status
  }));
  fs.writeFileSync(path.join(OUT, "mcqs.json"), JSON.stringify(master, null, 2));
  console.log(`[export] master mcqs.json: ${master.length} MCQs`);

  /* Section files by subject */
  const bySubject = {};
  for (const m of master) {
    if (!bySubject[m.subjectId]) bySubject[m.subjectId] = [];
    bySubject[m.subjectId].push(m);
  }
  for (const [subj, arr] of Object.entries(bySubject)) {
    const safe = subj.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    fs.writeFileSync(path.join(OUT, `mcqs-${safe}.json`), JSON.stringify(arr, null, 2));
    console.log(`[export] mcqs-${safe}.json: ${arr.length} MCQs`);
  }

  /* Also export taxonomy for static browse */
  const cats = db.prepare("SELECT * FROM categories ORDER BY sort_order, id").all();
  fs.writeFileSync(path.join(OUT, "categories.json"), JSON.stringify(cats, null, 2));
  const subs = db.prepare("SELECT * FROM subjects ORDER BY sort_order, id").all();
  fs.writeFileSync(path.join(OUT, "subjects.json"), JSON.stringify(subs, null, 2));
  const chaps = db.prepare("SELECT * FROM chapters ORDER BY subject_id, sort_order, id").all();
  fs.writeFileSync(path.join(OUT, "chapters.json"), JSON.stringify(chaps, null, 2));
  const topics = db.prepare("SELECT * FROM topics ORDER BY chapter_id, sort_order, id").all();
  fs.writeFileSync(path.join(OUT, "topics.json"), JSON.stringify(topics, null, 2));
  const quizzes = db.prepare("SELECT * FROM quizzes ORDER BY id").all();
  fs.writeFileSync(path.join(OUT, "quizzes.json"), JSON.stringify(quizzes, null, 2));
  const mocks = db.prepare("SELECT * FROM mocktests ORDER BY id").all();
  fs.writeFileSync(path.join(OUT, "mocktests.json"), JSON.stringify(mocks, null, 2));
  const papers = db.prepare("SELECT * FROM pastpapers ORDER BY year DESC, id").all();
  fs.writeFileSync(path.join(OUT, "pastpapers.json"), JSON.stringify(papers, null, 2));
  // exams not in DB; copy from static if needed
  const staticExams = JSON.parse(fs.readFileSync(path.join(ROOT, "data/exams.json"), "utf8"));
  fs.writeFileSync(path.join(OUT, "exams.json"), JSON.stringify(staticExams, null, 2));

  console.log("[export] taxonomy files written (data/export/)");
  console.log(`[export] total MCQs exported: ${master.length}`);
}

main();
