#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Bulk JSON import (Enterprise 2026)
   Imports MCQs from any JSON file/array (same schema as data/mcqs
   sections or DB rows) with qhash dedupe + id conflict handling.
   Usage: node db/import-json.js <file.json> [--dry-run]
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { open } = require("./engine.js");
const qhash = (q) => crypto.createHash("sha256").update(q.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");

async function main() {
  const file = process.argv[2];
  if (!file) { console.error("Usage: node db/import-json.js <file.json> [--dry-run]"); process.exit(1); }
  const dry = process.argv.includes("--dry-run");
  let raw = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  if (!Array.isArray(raw)) {
    if (raw.mcqs && Array.isArray(raw.mcqs)) raw = raw.mcqs;
    else if (raw.data && Array.isArray(raw.data)) raw = raw.data;
    else throw new Error("JSON must be an array of MCQs or {mcqs:[...]}");
  }
  console.log(`[import] ${raw.length} MCQs in file (${dry ? "DRY RUN" : "importing"})`);

  const db = open();
  try {
    let added = 0, updated = 0, skipped = 0, noOpt = 0;
    for (const m of raw) {
      const q = m.question || m.q;
      if (!q || !m.correctAnswer) { skipped++; continue; }
      const h = qhash(q);
      const id = m.id || `${(m.subject || "imp").slice(0, 4)}-${h.slice(0, 10)}`;
      const existing = db.get(`SELECT id FROM mcqs WHERE qhash=?`, [h]);
      const subj = (db.get(`SELECT id FROM subjects WHERE id=? OR slug=?`, [m.subject || m.subject_id || "", m.subject || m.subject_id || ""]) || {}).id || m.subject || "general-knowledge";
      if (existing) {
        if (!dry) db.run(`UPDATE mcqs SET question=?,correct_answer=?,difficulty=?,explanation=?,tags=?,updated_at=datetime('now') WHERE qhash=?`,
          [q, m.correctAnswer, m.difficulty || "medium", m.detailedExplanation || m.explanation || "", JSON.stringify(m.tags || []), h]);
        updated++;
        continue;
      }
      const chap = m.chapter || "", top = m.topic || "";
      if (!dry) {
        db.run(`INSERT INTO mcqs (id,question,correct_answer,difficulty,subject_id,chapter_id,topic_id,exam_ids,year,tags,references_json,explanation,source,status,qhash)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'imported','active',?)`,
          [id, q, m.correctAnswer, m.difficulty || "medium", subj, chap, top, (m.exam || []).join(","), m.year || null,
           JSON.stringify(m.tags || []), JSON.stringify(m.references || []), m.detailedExplanation || m.explanation || "", h]);
        let has = 0;
        for (const [label, key] of [["A", "optionA"], ["B", "optionB"], ["C", "optionC"], ["D", "optionD"]]) {
          const t = m[key];
          if (!t) continue;
          db.run(`INSERT INTO options (mcq_id,label,text) VALUES (?,?,?)`, [id, label, t]);
          has++;
        }
        if (has < 4) noOpt++;
      }
      added++;
    }
    if (db.kind === "sqlite") db.exec(`INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')`);
    console.log(`[import] added ${added}, updated ${updated}, skipped ${skipped}, incomplete-options ${noOpt}`);
    if (!dry) console.log(`[import] total MCQs in DB: ${db.get(`SELECT COUNT(*) n FROM mcqs`).n}`);
  } finally {
    db.close();
  }
}

main().catch((e) => { console.error("[import] ERROR:", e.message); process.exit(1); });
