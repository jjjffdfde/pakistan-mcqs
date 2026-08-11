#!/usr/bin/env node
/* ============================================================
   Topic Filler — Deep Knowledge Engine (first pass)
   Fills every chapter/topic with zero active MCQs by
   generating original content from the matching generator
   topic bank (exact name, then stem match), quality-gated
   (95% threshold) and inserted into the EXISTING taxonomy
   node, so Chapter/Topic Quiz buttons always return questions.
   Usage: node pipeline/fill-topics.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");
const lib = require("./lib.js");
const quality = require("./quality.js");

const ROOT = path.join(__dirname, "..");
const db = open();

const genFiles = fs.readdirSync(path.join(__dirname, "generators")).filter((f) => f.endsWith(".js")).sort();
const gens = [];
for (const f of genFiles) gens.push(...require(path.join(__dirname, "generators", f)));
/* Newest generator files (completion banks) are authored as authoritative
   for each topic name: search in REVERSE so they win over shared pools
   whose questions were already claimed by another subject (qhash race). */
const newestFirst = [...gens].reverse();

const prefix = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const stems = (s) => { const w = String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((x) => x.length > 3); return w.map((x) => x.slice(0, 6)); };

function idSeq(subjectId) {
  const p = prefix(subjectId);
  const rows = db.all(`SELECT id FROM mcqs WHERE id LIKE ?`, [p + "-%"]);
  let max = 0;
  for (const r of rows) { const n = parseInt(r.id.slice(p.length + 1), 10); if (n > max) max = n; }
  let cur = max;
  return () => { cur++; return `${p}-${String(cur).padStart(6, "0")}`; };
}

const emptyTopics = db.all(`SELECT t.id, t.name, t.chapter_id, c.subject_id FROM topics t JOIN chapters c ON c.id=t.chapter_id
  WHERE NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.topic_id=t.id AND m.status='active') ORDER BY t.id`);

const knownFor = new Map();
function knownTexts(subjectId) {
  if (!knownFor.has(subjectId)) knownFor.set(subjectId, db.all(`SELECT question FROM mcqs WHERE subject_id=? AND status='active' ORDER BY RANDOM() LIMIT 400`, [subjectId]).map((r) => r.question));
  return knownFor.get(subjectId);
}

let filled = 0, rejectedQ = 0, dupSkipped = 0, emptyPools = 0, conflictRows = 0;
const batchHashes = new Set();
const batch = [];
const seq = new Map();
const nextIdFor = (subjectId) => {
  if (!seq.has(subjectId)) seq.set(subjectId, idSeq(subjectId));
  return seq.get(subjectId)();
};
const flush = () => {
  if (!batch.length) return;
  let conflicts = 0;
  db.transaction(() => {
    for (const row of batch) {
      try {
        db.run(`INSERT INTO mcqs (id,question,correct_answer,difficulty,subject_id,chapter_id,topic_id,subtopic_id,exam_ids,tags,references_json,explanation,source,status,qhash,learning_objective,bloom_taxonomy,confidence_score,estimated_time_sec,memory_trick,exam_tip,explanation_why_wrong)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'generated','active',?,?,?,?,?,?,?,?)`,
          [row.id, row.question, row.correctAnswer, row.difficulty, row.subjectId, row.chapterId, row.topicId, row.subtopicId || null,
           row.examIds, JSON.stringify(row.tags), "[]", row.explanation, row.qhash, row.learningObjective || null, row.bloomTaxonomy || null,
           row.confidence ?? 0.9, row.solvingTimeSec || 40, row.memoryTrick || null, row.examTip || null, JSON.stringify(row.explanationWhyWrong || [])]);
      } catch (e) {
        if (String(e.message).includes("UNIQUE") || String(e.message).includes("constraint")) { conflicts++; conflictRows++; console.log(`SKIP-ROW ${e.message} :: "${row.question.slice(0, 60)}"`); continue; }
        throw e;
      }
      for (const [label, t] of [["A", row.optionA], ["B", row.optionB], ["C", row.optionC], ["D", row.optionD]]) {
        db.run(`INSERT INTO options (mcq_id,label,text) VALUES (?,?,?)`, [row.id, label, t]);
      }
    }
  });
  if (conflicts) console.log(`CONFLICT: ${conflicts} rows skipped in this flush (existing qhash/id)`);
  const liveTotal = db.get(`SELECT COUNT(*) n FROM mcqs`).n;
  console.log(`FLUSH: ${batch.length} rows attempted -> DB total now ${liveTotal}`);
  batch.length = 0;
  batchHashes.clear();
};

for (const t of emptyTopics) {
  /* find best generator pool: exact name, then stem match (newest first) */
  const subjGens = newestFirst.filter((g) => g.subjects.includes(t.subject_id));
  let pool = null, genName = null;
  for (const g of subjGens) {
    const hit = g.topics.find((tn) => tn.toLowerCase() === t.name.toLowerCase());
    if (hit) { pool = { g, tn: hit }; break; }
  }
  if (!pool) {
    const tStems = stems(t.name);
    let best = { score: 0 };
    for (const g of subjGens) {
      for (const tn of g.topics) {
        const tl = tn.toLowerCase();
        const score = tStems.filter((st) => tl.includes(st)).length;
        if (score > best.score) best = { score, g, tn };
      }
    }
    if (best.score >= 1) pool = best;
  }
  if (!pool) { emptyPools++; console.log(`EMPTY ${t.subject_id} | ${t.name} — no generator coverage (Deep Knowledge backlog)`); continue; }

  const nextId = () => nextIdFor(t.subject_id);
  const rng = lib.mulberry32(lib.hashSeed(`fill|${t.id}|${Date.now()}`));
  const candidates = pool.g.generate(rng, pool.tn, { id: t.subject_id });
  let added = 0, dup = 0, rej = 0;
  const subject = db.get(`SELECT id, name, exam_ids FROM subjects WHERE id=?`, [t.subject_id]);
  db.run(`INSERT INTO subtopics (topic_id,name) VALUES (?,'fundamentals') ON CONFLICT(topic_id,name) DO NOTHING`, [t.id]);
  const subId = db.get(`SELECT id FROM subtopics WHERE topic_id=? AND name='fundamentals'`, [t.id]).id;
  for (const m of candidates || []) {
    const err = lib.validateMcq(m, {});
    if (err) { rej++; continue; }
    const h = lib.qhash(m.question);
    if (batchHashes.has(h) || db.get(`SELECT id FROM mcqs WHERE qhash=?`, [h])) { dup++; continue; }
    const extra = {
      topicId: t.id, topicName: t.name, subtopicId: subId, subtopicName: "fundamentals",
      learningObjective: `Recall and apply ${t.name.toLowerCase()} concepts in exam-style questions.`,
      bloomTaxonomy: "Understand", confidence: 0.9, solvingTimeSec: 40, tags: [subject.name, t.name, "topic-bank"],
      examIds: (subject.exam_ids || "").split(",").filter(Boolean).slice(0, 6).join(",")
    };
    const full = quality.synthesizeMetadata({ ...m, ...extra });
    const enriched = quality.enrich(full, {});
    const ver = quality.scoreMcq(enriched, knownTexts(t.subject_id), batch.map((r) => r.question).concat(candidates.filter((x) => x.question !== m.question).map((x) => x.question)));
    if (!ver.pass) { rej++; continue; }
    batchHashes.add(h);
    batch.push({
      id: nextId(), question: m.question, correctAnswer: m.correctAnswer, difficulty: m.difficulty,
      subjectId: t.subject_id, chapterId: t.chapter_id, topicId: t.id, subtopicId: subId,
      examIds: extra.examIds, tags: extra.tags, explanation: full.explanation,
      optionA: m.optionA, optionB: m.optionB, optionC: m.optionC, optionD: m.optionD, qhash: h,
      learningObjective: extra.learningObjective, bloomTaxonomy: extra.bloomTaxonomy, confidence: extra.confidence,
      solvingTimeSec: extra.solvingTimeSec, memoryTrick: full.memoryTrick || null, examTip: full.examTip || null,
      explanationWhyWrong: full.explanationWhyWrong || []
    });
    added++;
    if (batch.length >= 500) flush();
  }
  dupSkipped += dup; rejectedQ += rej;
  if (added) { filled++; console.log(`+${String(added).padStart(3)} ${t.subject_id} | ${t.name} (pool: ${pool.g.name}/${pool.tn})`); }
  else console.log(`+  0 ${t.subject_id} | ${t.name} — all candidates rejected (dups ${dup}, quality ${rej})`);
}
flush();

/* ---- remap pass: empty topics whose bank questions already exist
   in the DB (same subject, other topic) get those MCQs repointed ---- */
let remapped = 0;
for (const t of db.all(`SELECT t.id, t.name, t.chapter_id, c.subject_id FROM topics t JOIN chapters c ON c.id=t.chapter_id
  WHERE NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.topic_id=t.id AND m.status='active') ORDER BY t.id`)) {
  const subjGens = newestFirst.filter((g) => g.subjects.includes(t.subject_id));
  let pool = null;
  for (const g of subjGens) {
    const hit = g.topics.find((tn) => tn.toLowerCase() === t.name.toLowerCase());
    if (hit) { pool = { g, tn: hit }; break; }
  }
  if (!pool) {
    const tStems = stems(t.name);
    let best = { score: 0 };
    for (const g of subjGens) for (const tn of g.topics) {
      const tl = tn.toLowerCase();
      const score = tStems.filter((st) => tl.includes(st)).length;
      if (score > best.score) best = { score, g, tn };
    }
    if (best.score >= 1) pool = best;
  }
  if (!pool) continue;
  const rng = lib.mulberry32(lib.hashSeed(`remap|${t.id}`));
  const candidates = pool.g.generate(rng, pool.tn, { id: t.subject_id }) || [];
  const qs = [...new Set(candidates.map((c) => c.question))];
  let got = 0;
  for (const q of qs) {
    const h = lib.qhash(q);
    const found = db.all(`SELECT id FROM mcqs WHERE qhash=? AND subject_id=? AND status='active' AND topic_id<>? LIMIT 1`, [h, t.subject_id, t.id]);
    if (found.length) {
      db.run(`UPDATE mcqs SET topic_id=?, chapter_id=? WHERE id=?`, [t.id, t.chapter_id, found[0].id]);
      got++;
    }
  }
  if (got) { remapped += got; console.log(`REMAP +${got} ${t.subject_id} | ${t.name} (from existing same-subject MCQs)`); }
}

db.exec(`INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')`);
const total = db.get(`SELECT COUNT(*) n FROM mcqs WHERE status='active'`).n;
const stillEmpty = db.get(`SELECT COUNT(*) n FROM topics t WHERE NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.topic_id=t.id AND m.status='active')`).n;
console.log(`\nDONE. topics filled: ${filled}/${emptyTopics.length} | dup-skipped ${dupSkipped} | quality-rejected ${rejectedQ} | empty-pools ${emptyPools} | conflict-rows ${conflictRows} | remapped ${remapped}`);
console.log(`MCQs now: ${total} | topics still empty: ${stillEmpty}`);
db.close();
