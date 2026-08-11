#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Phase 2: Database Normalization
   - Backup DB (sqlite online backup) before touching anything
   - Create subtopics for every topic lacking them
   - Assign subtopic_id to every MCQ (keyword match, else round-robin)
   - Report empty chapters/topics; verify full-hierarchy integrity
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("./engine.js");

const BACKUP_DIR = path.join(__dirname, "..", "backup");

function timestamp() {
  return new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
}

/* ---------- Phase 2A: online backup ---------- */
const stamp = timestamp();
const bkDir = path.join(BACKUP_DIR, `normalize-pre-phase2-${stamp}`);
fs.mkdirSync(bkDir, { recursive: true });
const db = open();
if (db.kind === "sqlite") {
  db.raw.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  const snap = path.join(bkDir, "pakistan-mcqs.sqlite").replace(/\\/g, "/");
  db.raw.exec(`VACUUM INTO '${snap}'`);
  console.log(`[normalize] backup -> backup/${path.basename(bkDir)}/pakistan-mcqs.sqlite`);
}

/* ---------- 2B: derive subtopics for topics missing them ---------- */
function deriveSubtopics(topicName) {
  const parts = topicName
    .split(/\s*(?:&|,|and|vs\.?|-\s*|-)\s*/i)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 3);
  const out = [...new Set(parts)].slice(0, 4);
  if (out.length < 2) out.push("core concepts");
  if (out.length < 3 && out.length < 4) out.push("fundamentals");
  return out.slice(0, 4);
}

const missing = db.all(`
  SELECT t.id, t.name FROM topics t
  WHERE NOT EXISTS (SELECT 1 FROM subtopics s WHERE s.topic_id = t.id)
`);
let subCreated = 0;
const subInsert = db.prepare("INSERT INTO subtopics (topic_id, name) VALUES (?, ?)");
db.transaction(() => {
  for (const t of missing) {
    for (const name of deriveSubtopics(t.name)) {
      subInsert.run(t.id, name);
      subCreated++;
    }
  }
});
console.log(`[normalize] created ${subCreated} subtopics for ${missing.length} topics that had none`);

/* ---------- 2C: assign subtopic_id to every MCQ ---------- */
const subMap = new Map();
for (const s of db.all("SELECT id, topic_id, name FROM subtopics")) {
  if (!subMap.has(s.topic_id)) subMap.set(s.topic_id, []);
  subMap.get(s.topic_id).push(s);
}
const mcqs = db.all("SELECT id, question, topic_id, subtopic_id FROM mcqs");
let kw = 0, rr = 0, skipped = 0;
const upd = db.prepare("UPDATE mcqs SET subtopic_id = ? WHERE id = ?");
db.transaction(() => {
  for (const m of mcqs) {
    if (m.subtopic_id) { skipped++; continue; }
    const subs = subMap.get(m.topic_id) || [];
    if (!subs.length) { skipped++; continue; }
    let chosen = null;
    const q = m.question.toLowerCase();
    for (const s of subs) {
      if (q.includes(s.name) || s.name.split(/\s+/).some((w) => w.length > 4 && q.includes(w))) { chosen = s; kw++; break; }
    }
    if (!chosen) {
      const i = [...m.id].reduce((a, c) => a + c.charCodeAt(0), 0) % subs.length;
      chosen = subs[i];
      rr++;
    }
    upd.run(chosen.id, m.id);
  }
});
console.log(`[normalize] subtopic assignment: ${kw} keyword-matched, ${rr} round-robin, ${skipped} skipped`);

/* ---------- 2D: verification ---------- */
const orphan = db.get("SELECT COUNT(*) n FROM mcqs WHERE subtopic_id IS NULL").n;
const bad = db.get("SELECT COUNT(*) n FROM mcqs m WHERE m.subtopic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM subtopics s WHERE s.id = m.subtopic_id)").n;
const emptyCh = db.all("SELECT c.id, c.name, c.subject_id FROM chapters c WHERE NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.chapter_id = c.id)");
const emptyTp = db.all("SELECT t.id, t.name FROM topics t WHERE NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.topic_id = t.id)");
console.log(`[normalize] MCQs without subtopic: ${orphan}; dangling subtopic refs: ${bad}`);
console.log(`[normalize] empty chapters: ${emptyCh.length}; empty topics: ${emptyTp.length}`);
for (const c of emptyCh) console.log(`  empty chapter: ${c.id} | ${c.name} (${c.subject_id})`);
for (const t of emptyTp.slice(0, 20)) console.log(`  empty topic: ${t.id} | ${t.name}`);
if (emptyTp.length > 20) console.log(`  ...and ${emptyTp.length - 20} more`);

db.close();
console.log("[normalize] done");
