#!/usr/bin/env node
/* Phase 10 - Exam attribution expansion
   1. Adds new exam ids to core subjects (syllabus-based attribution).
   2. Backfills mcqs.exam_ids to the subject's full declared exam list.
   3. Reports per-exam supported counts.
*/
"use strict";
const fs = require("fs");
const { open } = require("E:/pAK MCQS/db/engine.js");
const db = open();

const APPEND = {
  mdcat: ["biology", "chemistry", "physics", "english", "logical-reasoning"],
  lat: ["english", "urdu", "islamic-studies", "pakistan-affairs", "law", "general-knowledge"],
  "rescue-1122": ["computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  lesco: ["aptitude-tests", "computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  mepco: ["aptitude-tests", "computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  hesco: ["aptitude-tests", "computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  sepco: ["aptitude-tests", "computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  ssgc: ["aptitude-tests", "computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  sngpl: ["aptitude-tests", "computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  "pakistan-post": ["computer-science", "current-affairs", "english", "everyday-science", "general-knowledge", "islamic-studies", "iq", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  teaching: ["computer-science", "current-affairs", "education", "english", "everyday-science", "general-knowledge", "islamic-studies", "mathematics", "pakistan-affairs", "pedagogy", "psychology", "urdu"],
  sst: ["computer-science", "current-affairs", "education", "english", "everyday-science", "general-knowledge", "islamic-studies", "mathematics", "pakistan-affairs", "pedagogy", "psychology", "urdu"],
  est: ["computer-science", "current-affairs", "education", "english", "everyday-science", "general-knowledge", "islamic-studies", "mathematics", "pakistan-affairs", "pedagogy", "psychology", "urdu"],
  headmaster: ["computer-science", "current-affairs", "education", "english", "everyday-science", "general-knowledge", "islamic-studies", "mathematics", "pakistan-affairs", "pedagogy", "psychology", "urdu"],
  inspector: ["computer-science", "constitution", "current-affairs", "english", "everyday-science", "general-knowledge", "iq", "islamic-studies", "law", "logical-reasoning", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  "sub-inspector": ["computer-science", "constitution", "current-affairs", "english", "everyday-science", "general-knowledge", "iq", "islamic-studies", "law", "logical-reasoning", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"],
  "custom-inspector": ["accounting", "computer-science", "constitution", "current-affairs", "english", "everyday-science", "finance", "general-knowledge", "islamic-studies", "law", "mathematics", "pakistan-affairs", "statistics", "urdu"],
  "income-tax-inspector": ["accounting", "computer-science", "constitution", "current-affairs", "economics", "english", "everyday-science", "finance", "general-knowledge", "islamic-studies", "law", "mathematics", "pakistan-affairs", "statistics", "urdu"],
  "assistant-director": ["computer-science", "constitution", "current-affairs", "english", "everyday-science", "general-knowledge", "iq", "islamic-studies", "law", "logical-reasoning", "mathematics", "ms-office", "pakistan-affairs", "reasoning", "urdu"]
};

/* ---- STEP 1: append new exams to subjects.exam_ids ---- */
let changed = 0;
for (const [exam, subjs] of Object.entries(APPEND)) {
  for (const sid of subjs) {
    const r = db.get(`SELECT exam_ids FROM subjects WHERE id=?`, [sid]);
    if (!r) { console.log("MISSING SUBJECT " + sid); continue; }
    const list = (r.exam_ids || "").split(",").filter(Boolean);
    if (!list.includes(exam)) {
      list.push(exam);
      db.run(`UPDATE subjects SET exam_ids=? WHERE id=?`, [list.join(","), sid]);
      changed++;
    }
  }
}
console.log("subjects updated with new exam ids:", changed);

/* ---- STEP 2: backfill mcqs.exam_ids from subject declaration ---- */
const subjects = db.all(`SELECT id, exam_ids FROM subjects`);
const examList = {};
for (const s of subjects) examList[s.id] = (s.exam_ids || "").split(",").filter((e) => e && e !== "custom-exams");
const rows = db.all(`SELECT id, subject_id, exam_ids FROM mcqs WHERE status='active'`);
let updated = 0;
db.run("BEGIN");
const stmt = db.prepare(`UPDATE mcqs SET exam_ids=? WHERE id=?`);
for (const m of rows) {
  const declared = examList[m.subject_id] || [];
  if (!declared.length) continue;
  const cur = (m.exam_ids || "").split(",").filter(Boolean);
  const missing = declared.filter((e) => !cur.includes(e));
  if (!missing.length) continue;
  stmt.run(cur.concat(missing).join(","), m.id);
  updated++;
}
db.run("COMMIT");
console.log("mcqs backfilled:", updated, "of", rows.length);

/* ---- STEP 3: report supported counts ---- */
const SUPPORTED = ["css","pms","ppsc","fpsc","kppsc","bpsc","spsc","ajkpsc","nts","ots","pts","cts","mdcat","ecat","lat","gat","gre","ielts","toefl","pma","issb","army","navy","paf","asf","anf","fia","fia-inspector","ib","mod","nab","police","punjab-police","motorway","railways","rescue-1122","nadra","fbr","sbp","wapda","lesco","mepco","hesco","sepco","ssgc","sngpl","pakistan-post","teaching","lecturer","educators","sst","est","headmaster","inspector","sub-inspector","custom-inspector","income-tax-inspector","assistant-director","election-officer","banking"];
const counts = {};
const all = db.all(`SELECT exam_ids FROM mcqs WHERE status='active'`);
for (const r of all) for (const e of (r.exam_ids || "").split(",")) { const k = e.trim(); if (k) counts[k] = (counts[k] || 0) + 1; }
const below = [];
for (const e of SUPPORTED) {
  const n = counts[e] || 0;
  console.log(String(e).padEnd(22) + String(n).padStart(8) + (n >= 5000 ? "  OK" : "  *** BELOW"));
  if (n < 5000) below.push(e);
}
console.log("\nBelow 5000 (" + below.length + "): " + below.join(", "));
db.close();
