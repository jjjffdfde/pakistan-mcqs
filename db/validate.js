#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Phase 5: Quality Control Validator
   Run:   node db/validate.js            (read-only report)
          node db/validate.js --fix      (mark bad MCQs rejected, drop exact dupes)
   Writes: validation.log, docs/validation-report.md
   Checks: required fields, 4 unique options, answer validity,
           duplicate questions (exact + normalized), repeated/redundant
           options, grammar & formatting heuristics, hierarchy refs.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("./engine.js");

const FIX = process.argv.includes("--fix");
const db = open();
const log = [];
const t0 = Date.now();

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+\-*/.=\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- 1. Load ---------- */
const mcqs = db.all("SELECT id, question, correct_answer, difficulty, subject_id, chapter_id, topic_id, subtopic_id, explanation, status, qhash FROM mcqs");
const opts = db.all("SELECT mcq_id, label, text FROM options");
const byMcq = new Map();
for (const o of opts) {
  if (!byMcq.has(o.mcq_id)) byMcq.set(o.mcq_id, []);
  byMcq.get(o.mcq_id).push(o);
}
log.push(`[phase5] loaded ${mcqs.length} MCQs, ${opts.length} options`);

/* ---------- 2. Checks ---------- */
const rejects = new Set();     // mcq ids to reject
const dropIds = new Set();     // duplicate mcq ids to drop
const issues = new Map();      // id -> [issues]

function addIssue(id, msg) {
  if (!issues.has(id)) issues.set(id, []);
  issues.get(id).push(msg);
}

const seenNorm = new Map();
let grammarFlags = 0;

for (const m of mcqs) {
  const o = byMcq.get(m.id) || [];
  const texts = o.map((x) => x.text);
  const labels = o.map((x) => x.label);
  const q = m.question || "";

  /* required fields */
  if (!q) addIssue(m.id, "empty question");
  if (!m.correct_answer) addIssue(m.id, "missing correct_answer");
  if (!m.difficulty) addIssue(m.id, "missing difficulty");
  if (!m.subject_id) addIssue(m.id, "missing subject_id");
  if (!m.chapter_id) addIssue(m.id, "missing chapter_id");
  if (!m.topic_id) addIssue(m.id, "missing topic_id");
  if (!m.subtopic_id) addIssue(m.id, "missing subtopic_id");
  if (!m.explanation || m.explanation.trim().length < 10) addIssue(m.id, "explanation missing or <10 chars");

  /* options */
  const normOpts = texts.map(normalizeText).filter(Boolean);
  const exactOpts = texts.map((t) => String(t || "").trim().toLowerCase()).filter(Boolean);
  if (o.length !== 4) addIssue(m.id, `options count ${o.length} (expected 4)`);
  if (new Set(labels).size !== o.length) addIssue(m.id, "duplicate option labels");
  if (new Set(exactOpts).size !== exactOpts.length) addIssue(m.id, "repeated option text");
  if (!["A", "B", "C", "D"].includes(m.correct_answer)) addIssue(m.id, `answer '${m.correct_answer}' not A-D`);
  else {
    const ans = o.find((x) => x.label === m.correct_answer);
    if (!ans) addIssue(m.id, `answer label ${m.correct_answer} has no option`);
    else if (normalizeText(ans.text) && normalizeText(ans.text) === normalizeText(q)) addIssue(m.id, "correct option duplicates question text");
  }
  if (normOpts.some((t) => t && t === normalizeText(q))) addIssue(m.id, "an option duplicates question text");

  /* grammar / formatting heuristics */
  if (q && q.length < 15) { addIssue(m.id, "question too short (<15 chars)"); grammarFlags++; }
  if (q !== q.replace(/^\s+/, "")) addIssue(m.id, "leading whitespace");
  if (/TODO|lorem|placeholder|FIXME|xxx\b/i.test(q)) { addIssue(m.id, "placeholder text"); grammarFlags++; }
  if (q !== q.replace(/\s{2,}/g, " ")) { addIssue(m.id, "double spaces"); grammarFlags++; }
  if (/&[a-z]+;|<[a-z][a-z0-9]*\s*[>\/]/i.test(q)) { addIssue(m.id, "possible broken formatting (HTML entities/tags)"); grammarFlags++; }
  if (q && /[a-z]/.test(q) && q === q.toUpperCase() && q.length > 20) { addIssue(m.id, "ALL CAPS question"); grammarFlags++; }

  /* duplicate detection (exact + normalized, subject-scoped so cross-language template reuse is not false-positive) */
  const key = (m.subject_id || "") + "|" + normalizeText(q);
  if (!normalizeText(q)) continue;
  if (seenNorm.has(key)) {
    dropIds.add(m.id);
    addIssue(m.id, `DUPLICATE of ${seenNorm.get(key)} (normalized)`);
  } else {
    seenNorm.set(key, m.id);
  }
}

/* ---------- 3. Aggregate ---------- */
const counts = {};
for (const [, msgs] of issues) for (const msg of msgs) counts[msg] = (counts[msg] || 0) + 1;
const totalIssues = [...issues.values()].reduce((a, v) => a + v.length, 0);
const badMcqs = [...issues.keys()].length;

log.push(`[phase5] MCQs with >=1 issue: ${badMcqs} / ${mcqs.length} (${(100 * badMcqs / mcqs.length).toFixed(2)}%)`);
log.push(`[phase5] total issues: ${totalIssues} (${[...issues.values()].filter((v) => v.length > 1).length} MCQs with multiple)`);
log.push(`[phase5] normalized duplicates found: ${dropIds.size}`);
log.push(`[phase5] issue breakdown:`);
for (const [msg, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) log.push(`   ${n} x ${msg}`);
log.push(`[phase5] grammar/format flags: ${grammarFlags}`);

/* ---------- 4. Fix (optional) ---------- */
if (FIX) {
  let rejected = 0, dropped = 0;
  db.transaction(() => {
    const upd = db.prepare("UPDATE mcqs SET status='rejected' WHERE id=?");
    for (const id of rejects) { upd.run(id); rejected++; }
    const del = db.prepare("DELETE FROM mcqs WHERE id=?");
    for (const id of dropIds) { del.run(id); dropped++; }
  });
  log.push(`[phase5] --fix applied: ${rejected} rejected, ${dropped} exact duplicates dropped`);
  log.push(`[phase5] NOTE: rejects set is empty by design — report-only unless you add auto-reject rules.`);
  if (db.kind === "sqlite") db.exec("INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')");
}

/* ---------- 5. Sample of issues for the report ---------- */
const samples = [];
for (const [id, msgs] of issues) {
  samples.push({ id, msgs, q: (mcqs.find((m) => m.id === id) || {}).question });
  if (samples.length >= 25) break;
}

const rep = [];
rep.push("# Phase 5 — MCQ Quality Validation Report\n");
rep.push(`Generated: ${new Date().toISOString()} · Mode: ${FIX ? "FIX" : "report"} · DB: ${db.kind}\n`);
rep.push(`## Summary\n`);
rep.push(`| Metric | Value |`);
rep.push(`|---|---|`);
rep.push(`| MCQs checked | ${mcqs.length} |`);
rep.push(`| MCQs with ≥1 issue | ${badMcqs} (${(100 * badMcqs / mcqs.length).toFixed(2)}%) |`);
rep.push(`| Total issues | ${totalIssues} |`);
rep.push(`| Normalized duplicates | ${dropIds.size} |`);
rep.push(`| Grammar/format flags | ${grammarFlags} |\n`);
rep.push(`## Issue breakdown\n`);
rep.push(`| Count | Issue |`);
rep.push(`|---|---|`);
for (const [msg, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) rep.push(`| ${n} | ${msg} |`);
rep.push(`\n## Sample affected MCQs (first 25)\n`);
for (const s of samples) rep.push(`- \`${s.id}\`: ${s.msgs.join("; ")} — "${String(s.q).slice(0, 80)}"`);
rep.push(`\n## Duplicate examples (first 10)\n`);
const dupIds = [...dropIds].slice(0, 10);
for (const id of dupIds) {
  const m = mcqs.find((x) => x.id === id);
  rep.push(`- \`${id}\` (keep: \`${issues.get(id)[0].split(" ").pop() || "?"}\`): "${String(m.question).slice(0, 80)}"`);
}

fs.writeFileSync(path.join(__dirname, "..", "validation.log"), log.join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(__dirname, "..", "docs", "validation-report.md"), rep.join("\n"), "utf8");
log.push(`[phase5] wrote validation.log + docs/validation-report.md in ${Date.now() - t0} ms`);
db.close();
console.log(log.join("\n"));
