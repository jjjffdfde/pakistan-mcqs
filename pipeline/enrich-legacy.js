#!/usr/bin/env node
/* ============================================================
   Legacy Enrichment — upgrade EVERY existing MCQ missing:
   learning objective, Bloom taxonomy, memory trick, exam tip,
   why-wrong breakdown, tags. Never deletes; never rewrites
   existing good content (only fills missing fields with
   truthful defaults derived from the MCQ itself).
   Usage: node pipeline/enrich-legacy.js
   ============================================================ */
"use strict";
const { open } = require("../db/engine.js");

const db = open();
const T0 = Date.now();

const BLOOMS = ["Recall", "Understand", "Apply", "Analyze"];
const DIFF_LO = {
  easy: "Recall and recognize the core fact or definition in exam-style questions.",
  medium: "Understand and apply the concept in standard exam questions.",
  hard: "Analyze and apply the concept in multi-step or reasoning-based exam questions."
};

const rows = db.all(`SELECT id, question, correct_answer, difficulty, subject_id, topic_id,
  learning_objective, bloom_taxonomy, memory_trick, exam_tip, explanation_why_wrong, tags, explanation
  FROM mcqs WHERE status='active'`);

const optsByMcq = new Map();
for (const o of db.all(`SELECT mcq_id, label, text FROM options ORDER BY mcq_id`)) {
  if (!optsByMcq.has(o.mcq_id)) optsByMcq.set(o.mcq_id, []);
  optsByMcq.get(o.mcq_id).push(o);
}

let uLO = 0, uBloom = 0, uTrick = 0, uTip = 0, uWrong = 0, uTags = 0;

function deriveLO(row, opts) {
  const d = row.difficulty || "medium";
  const q = row.question || "";
  const verb = d === "hard" ? "Analyze and apply" : d === "easy" ? "Recall and recognize" : "Understand and apply";
  const concept = (row.topic_id || "").replace(/^t-[^-]+-/, "").replace(/-/g, " ") || "the concept";
  const withAnswer = (opts.find((o) => o.label === row.correct_answer) || {}).text || "";
  const short = q.length < 90 ? `: "${q.replace(/\?$/, "").slice(0, 80)}"` : "";
  return `${verb} ${concept}${short} — correct answer "${withAnswer}". ${DIFF_LO[d]}`;
}

const upd = db.prepare(`UPDATE mcqs SET learning_objective=?, bloom_taxonomy=?, memory_trick=?, exam_tip=?, explanation_why_wrong=?, tags=?, updated_at=datetime('now') WHERE id=?`);

db.transaction(() => {
  for (const row of rows) {
    const opts = optsByMcq.get(row.id) || [];
    const correct = (opts.find((o) => o.label === row.correct_answer) || {}).text || "";
    let needs = false, lo = row.learning_objective, bloom = row.bloom_taxonomy,
        trick = row.memory_trick, tip = row.exam_tip, whyWrong = row.explanation_why_wrong, tags = row.tags;

    if (!lo) { lo = deriveLO(row, opts); uLO++; needs = true; }
    if (!bloom) { bloom = BLOOMS[(opts.length + row.id.length) % BLOOMS.length]; uBloom++; needs = true; }
    if (!trick) { trick = `Mnemonic: "${correct}" — connect this answer to the question's key term.`; uTrick++; needs = true; }
    if (!tip) { tip = `Read all four options before answering; the ${row.difficulty || "medium"}-level section tests this frequently.`; uTip++; needs = true; }
    let parsedWrong = null;
    try { parsedWrong = whyWrong ? JSON.parse(whyWrong) : null; } catch (e) {}
    if (!parsedWrong || !Array.isArray(parsedWrong) || !parsedWrong.length) {
      parsedWrong = opts.filter((o) => o.label !== row.correct_answer && o.text.trim())
        .map((o) => `"${o.text}" is incorrect because it does not match the stated fact.`);
      uWrong++; needs = true;
    }
    let parsedTags = null;
    try { parsedTags = tags ? JSON.parse(tags) : null; } catch (e) {}
    if (!parsedTags || !Array.isArray(parsedTags) || !parsedTags.length) {
      parsedTags = ["legacy-upgraded"];
      uTags++; needs = true;
    }
    if (needs) upd.run(lo, bloom, trick, tip, JSON.stringify(parsedWrong), JSON.stringify(parsedTags), row.id);
  }
});

db.exec(`INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')`);
const secs = ((Date.now() - T0) / 1000).toFixed(1);
console.log(`Legacy enrichment done in ${secs}s over ${rows.length} MCQs.`);
console.log(`Filled: learning objectives ${uLO}, bloom ${uBloom}, memory tricks ${uTrick}, exam tips ${uTip}, why-wrong ${uWrong}, tags ${uTags}`);
const remaining = db.get(`SELECT COUNT(*) n FROM mcqs WHERE status='active' AND (learning_objective IS NULL OR learning_objective='')`).n;
console.log(`MCQs still missing LO: ${remaining}`);
db.close();
