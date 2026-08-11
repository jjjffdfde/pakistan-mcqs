#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Backup (Enterprise 2026)
   - SQLite: snapshot via VACUUM INTO (safe while WAL active)
     plus a full JSON dump of every table
   - MySQL/PostgreSQL: full JSON dump (all tables)
   Output: backup/db-backup-<timestamp>/ (snapshot + dump.json)
   Usage: node db/backup.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open, loadConfig } = require("./engine.js");
const ROOT = path.join(__dirname, "..");

const TABLES = ["categories", "subjects", "chapters", "topics", "subtopics", "mcqs", "options",
  "references_tbl", "quizzes", "mocktests", "pastpapers", "bookmarks", "history",
  "leaderboard", "analytics", "pipeline_state"];

async function main() {
  const cfg = loadConfig();
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  const dir = path.join(ROOT, "backup", `db-backup-${stamp}`);
  fs.mkdirSync(dir, { recursive: true });
  const db = open();
  try {
    if (db.kind === "sqlite") {
      const src = path.join(ROOT, cfg.sqlite.file);
      if (fs.existsSync(src)) {
        db.exec(`VACUUM INTO '${path.join(dir, "pakistan-mcqs.sqlite").replace(/'/g, "''")}'`);
        console.log(`[backup] sqlite snapshot -> backup/db-backup-${stamp}/pakistan-mcqs.sqlite`);
      }
    }
    const dump = {};
    for (const t of TABLES) {
      try { dump[t] = db.all(`SELECT * FROM ${t}`); }
      catch (e) { console.log(`[backup] skip ${t}: ${e.message}`); }
    }
    fs.writeFileSync(path.join(dir, "dump.json"), JSON.stringify(dump), "utf8");
    const kb = Math.round(fs.statSync(path.join(dir, "dump.json")).size / 1024);
    console.log(`[backup] JSON dump (${kb} KB) -> backup/db-backup-${stamp}/dump.json`);
    const m = db.get(`SELECT COUNT(*) n FROM mcqs`);
    console.log(`[backup] MCQs backed up: ${m.n}`);
  } finally {
    db.close();
  }
}

main().catch((e) => { console.error("[backup] ERROR:", e.message); process.exit(1); });
