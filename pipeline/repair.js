#!/usr/bin/env node
/* ============================================================
   Pakistan MCQs Hub — Auto Repair Engine (Enterprise)
   Fixes everything the audit flags:
     1. Zero-question mocks/quizzes -> explicit all-subject pool
     2. Exams with no/weak subject mapping -> honest syllabi maps
     3. Missing exam papers -> ORIGINAL year-tagged practice
        papers (2024/2025/2026) built from official-style
        subject pools. Never copies any real paper.
   Idempotent. Usage: node pipeline/repair.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");

const ROOT = path.join(__dirname, "..");
const db = open();

/* ---- 1. fix zero-question pools (empty subject_ids) ---- */
const allActive = db.all(`SELECT id FROM subjects WHERE status='active' ORDER BY id`).map((s) => s.id).join(",");
let r = db.run(`UPDATE mocktests SET subject_ids=? WHERE (subject_ids IS NULL OR subject_ids='') AND id IN ('mock-mixed-1','mock-mixed-general')`, [allActive]);
console.log(`[repair] mocks with empty pool fixed: ${r.changes}`);
r = db.run(`UPDATE quizzes SET subject_ids=? WHERE (subject_ids IS NULL OR subject_ids='') AND id='quiz-mix-challenge'`, [allActive]);
console.log(`[repair] quizzes with empty pool fixed: ${r.changes}`);

/* ---- 2. exam subject mapping (honest syllabus maps) ---- */
const EXAM_MAP = {
  "custom-exams": ["general-knowledge", "current-affairs", "english", "pakistan-affairs", "mathematics", "everyday-science", "computer-science", "islamic-studies", "urdu"],
  "lecturer": ["pedagogy", "education", "psychology", "english", "urdu", "mathematics", "computer-science", "physics", "chemistry", "biology", "everyday-science", "islamic-studies", "pakistan-affairs", "accounting", "commerce"],
  "anf": ["general-knowledge", "pakistan-affairs", "english", "mathematics", "everyday-science", "islamic-studies", "current-affairs", "urdu"],
  "fia-inspector": ["general-knowledge", "current-affairs", "law", "constitution", "computer-science", "cyber-security", "english", "pakistan-affairs", "accounting"],
  "nadra": ["general-knowledge", "current-affairs", "english", "computer-science", "ms-office", "reasoning", "islamic-studies", "pakistan-affairs"],
  "banking": ["economics", "finance", "accounting", "commerce", "business-admin", "general-knowledge", "english", "mathematics", "current-affairs", "computer-science", "pakistan-affairs"],
  "pms": ["pakistan-affairs", "current-affairs", "general-knowledge", "constitution", "english", "islamic-studies", "urdu", "everyday-science", "mathematics", "psychology", "law"]
};
let mapped = 0;
for (const [exam, subs] of Object.entries(EXAM_MAP)) {
  for (const sub of subs) {
    const row = db.get(`SELECT exam_ids FROM subjects WHERE id=?`, [sub]);
    if (!row) continue;
    const ids = (row.exam_ids || "").split(",").map((x) => x.trim()).filter(Boolean);
    if (!ids.includes(exam)) { ids.push(exam); db.run(`UPDATE subjects SET exam_ids=? WHERE id=?`, [ids.join(","), sub]); mapped++; }
  }
}
console.log(`[repair] exam mappings added: ${mapped}`);

/* ---- 3. Past Paper Engine: year-tagged ORIGINAL papers ---- */
const exams = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "exams.json"), "utf8"));
const mcqsBySubject = Object.fromEntries(db.all(`SELECT subject_id, COUNT(*) n FROM mcqs WHERE status='active' GROUP BY subject_id`).map((x) => [x.subject_id, x.n]));
const paperDefs = { "css": { q: 200, min: 180 }, "pms": { q: 100, min: 180 }, "fpsc": { q: 100, min: 90 }, "ppsc": { q: 100, min: 90 }, "spsc": { q: 100, min: 90 }, "kppsc": { q: 100, min: 90 }, "bpsc": { q: 100, min: 90 }, "ajkpsc": { q: 100, min: 90 }, "nts": { q: 100, min: 120 }, "ots": { q: 100, min: 90 }, "cts": { q: 100, min: 90 }, "pts": { q: 100, min: 90 }, "etea": { q: 100, min: 120 }, "educators": { q: 100, min: 90 }, "lecturer": { q: 100, min: 90 }, "police": { q: 100, min: 90 }, "punjab-police": { q: 100, min: 90 }, "fia": { q: 100, min: 90 }, "fia-inspector": { q: 100, min: 90 }, "asf": { q: 100, min: 90 }, "nab": { q: 100, min: 90 }, "ib": { q: 100, min: 90 }, "army": { q: 100, min: 90 }, "navy": { q: 100, min: 90 }, "paf": { q: 100, min: 90 }, "motorway": { q: 100, min: 90 }, "railways": { q: 100, min: 90 }, "nadra": { q: 100, min: 90 }, "mod": { q: 100, min: 90 }, "election-officer": { q: 100, min: 90 }, "custom-exams": { q: 100, min: 90 }, "pma": { q: 100, min: 90 }, "issb": { q: 100, min: 90 }, "anf": { q: 100, min: 90 }, "wapda": { q: 100, min: 90 }, "fbr": { q: 100, min: 90 }, "sbp": { q: 100, min: 90 }, "banking": { q: 100, min: 90 } };
const yearsByExam = {};
for (const e of exams) yearsByExam[e.id] = ["css", "pms", "fpsc", "ppsc", "kppsc", "bpsc", "spsc", "ajkpsc", "nts", "ots", "cts", "pts", "etea", "educators", "lecturer", "police"].includes(e.id) ? [2026, 2025, 2024] : [2026];
let papersCreated = 0;
for (const e of exams) {
  const def = paperDefs[e.id] || { q: 100, min: 90 };
  const pool = db.all(`SELECT id FROM subjects WHERE status='active' AND (',' || exam_ids || ',') LIKE ?`, [`%,${e.id},%`])
    .map((s) => s.id)
    .filter((id) => (mcqsBySubject[id] || 0) > 0);
  if (pool.length < 3) { console.log(`[papers] SKIP ${e.id}: only ${pool.length} content subjects`); continue; }
  for (const year of yearsByExam[e.id]) {
    const id = `paper-${e.id}-${year}`;
    const title = `${e.name} — ${year} Original Practice Paper (${def.q} Qs)`;
    r = db.run(`INSERT INTO pastpapers (id,title,exam_id,year,subject_ids,total_questions,duration_mins) VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(id) DO NOTHING`, [id, title, e.id, year, pool.join(","), def.q, def.min]);
    papersCreated += r.changes;
  }
}
console.log(`[repair] year-tagged practice papers created: ${papersCreated}`);

/* ---- summary ---- */
const n = db.get(`SELECT COUNT(*) n FROM pastpapers`).n;
console.log(`[repair] total papers now: ${n}`);
const emptyPool = db.all(`SELECT id FROM mocktests WHERE subject_ids IS NULL OR subject_ids=''`).length + db.all(`SELECT id FROM quizzes WHERE subject_ids IS NULL OR subject_ids=''`).length;
console.log(`[repair] remaining empty-pool mocks+quizzes: ${emptyPool}`);
db.close();
