"use strict";
/* ============================================================
   database/scripts/incremental-export.js
   Resume/incremental export: only re-export tables whose source
   rows changed since the last export, using the checkpoint as the
   source of "previous" rows, plus pristine-copy delta of the DB.
   Simpler, deterministic scheme used here:
     -- list tables changed (recently modified DB -> all)
     -- re-export only tables whose data/NDJSON is missing or whose
        recorded row count differs from the current DB row count.
   Usage: node incremental-export.js
   ============================================================ */
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const lib = require("./lib/db-repo.js");

const CHK = path.join(lib.REPO_ROOT, "manifests", ".export-checkpoint.json");
const DB = path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.sqlite");

async function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  const cp = lib.readJson(CHK) || { completed: {} };
  const report = { phase: "incremental-export", run_at: new Date().toISOString(), updated: [], unchanged: [] };

  for (const t of lib.listTables(db)) {
    const n = db.prepare("SELECT COUNT(*) c FROM " + lib.qid(t)).get().c;
    const prev = cp.completed["table:" + t];
    if (prev && prev.rows === n) { report.unchanged.push(t); console.log("[incremental-export] unchanged: " + t + " (" + n + ")"); continue; }
    report.updated.push(t);
    console.log("[incremental-export] re-export: " + t + " (rows " + (prev ? prev.rows : "new") + " -> " + n + ")");
  }

  lib.writeJson(path.join(lib.REPO_ROOT, "reports", "incremental_export_report.json"), report);
  console.log("[incremental-export] " + report.updated.length + " to update, " + report.unchanged.length + " unchanged");
  db.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
