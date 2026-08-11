#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Restore (Enterprise 2026)
   Usage:
     node db/restore.js                    # list available backups
     node db/restore.js <backup-dir-name>  # restore that backup
     node db/restore.js --from dump.json   # restore from a dump file
   Restore is additive+replace for content tables; taxonomy rows
   are upserted, MCQs upserted by id with qhash dedupe.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { open } = require("./engine.js");
const ROOT = path.join(__dirname, "..");
const BACKUP_DIR = path.join(ROOT, "backup");
const qhash = (q) => crypto.createHash("sha256").update(q.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");

async function main() {
  const args = process.argv.slice(2);
  const dirs = fs.existsSync(BACKUP_DIR)
    ? fs.readdirSync(BACKUP_DIR).filter((d) => d.startsWith("db-backup-"))
    : [];
  if (args.length === 0) {
    console.log("Available backups:");
    for (const d of dirs) {
      const dump = path.join(BACKUP_DIR, d, "dump.json");
      if (fs.existsSync(dump)) {
        const j = JSON.parse(fs.readFileSync(dump, "utf8"));
        console.log(`  ${d}  (${j.mcqs ? j.mcqs.length : 0} MCQs)`);
      } else console.log(`  ${d}  (no dump.json)`);
    }
    console.log('\nUsage: node db/restore.js <backup-dir-name> | node db/restore.js --from <dump.json path>');
    return;
  }

  let dump;
  if (args[0] === "--from") {
    dump = JSON.parse(fs.readFileSync(args[1], "utf8"));
  } else {
    const dir = path.join(BACKUP_DIR, args[0]);
    if (!fs.existsSync(path.join(dir, "dump.json"))) throw new Error(`No dump.json in ${args[0]}`);
    dump = JSON.parse(fs.readFileSync(path.join(dir, "dump.json"), "utf8"));
  }
  console.log(`[restore] restoring ${dump.mcqs ? dump.mcqs.length : 0} MCQs...`);

  const db = open();
  try {
    for (const t of ["categories", "subjects", "chapters", "topics", "subtopics", "quizzes", "mocktests", "pastpapers", "references_tbl"]) {
      if (!dump[t]) continue;
      let n = 0;
      for (const row of dump[t]) {
        const cols = Object.keys(row), ph = cols.map(() => "?").join(",");
        try {
          db.run(`INSERT INTO ${t} (${cols.join(",")}) VALUES (${ph}) ON CONFLICT DO NOTHING`, cols.map((c) => row[c]));
          n++;
        } catch (e) { /* skip conflicts */ }
      }
      console.log(`[restore] ${t}: ${n} rows upserted`);
    }
    let imported = 0, skipped = 0, opts = 0;
    if (dump.mcqs) {
      db.transaction(() => {
        for (const m of dump.mcqs) {
          const h = m.qhash || qhash(m.question);
          const exists = db.get(`SELECT id FROM mcqs WHERE qhash=? OR id=?`, [h, m.id]);
          if (exists) { skipped++; continue; }
          db.run(`INSERT INTO mcqs (id,question,correct_answer,difficulty,subject_id,chapter_id,topic_id,subtopic_id,exam_ids,year,tags,references_json,explanation,source,status,qhash)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [m.id, m.question, m.correct_answer || m.correctAnswer, m.difficulty, m.subject_id || m.subject,
             m.chapter_id || m.chapter, m.topic_id || m.topic, m.subtopic_id || null, m.exam_ids || "",
             m.year || null, m.tags || "[]", m.references_json || m.references || "[]",
             m.explanation || m.detailedExplanation || "", m.source || "restored", m.status || "active", h]);
          const o = dump.options.filter((x) => x.mcq_id === m.id);
          for (const [i, label] of ["A", "B", "C", "D"].entries()) {
            const t = o.find((x) => x.label === label) ? o.find((x) => x.label === label).text : (m["option" + label] || "");
            if (!t) continue;
            db.run(`INSERT INTO options (mcq_id,label,text) VALUES (?,?,?)`, [m.id, label, t]);
            opts++;
          }
          imported++;
        }
      });
    }
    if (db.kind === "sqlite") db.exec(`INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')`);
    console.log(`[restore] MCQs: ${imported} restored, ${skipped} skipped (duplicate), ${opts} options`);
    console.log(`[restore] total MCQs in DB: ${db.get(`SELECT COUNT(*) n FROM mcqs`).n}`);
  } finally {
    db.close();
  }
}

main().catch((e) => { console.error("[restore] ERROR:", e.message); process.exit(1); });
