"use strict";
/* ============================================================
   database/scripts/validate-db.js
   Compare original SQLite vs rebuilt SQLite.
   Verifies row counts, schema, views, triggers, indexes,
   values (full PK-ordered comparison), missing/extra/modified rows.
   Usage: node validate-db.js [--original <db>] [--rebuilt <db>]
   ============================================================ */
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const lib = require("./lib/db-repo.js");
const { DatabaseSync } = require("node:sqlite");

const ARGS = process.argv.slice(2);
const go = (k, d) => { const i = ARGS.indexOf(k); return i > -1 ? ARGS[i + 1] : d; };
const ORIGINAL = go("--original", path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.sqlite"));
const REBUILT = go("--rebuilt", path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.rebuilt.sqlite"));
const REPORT_DIR = path.join(lib.REPO_ROOT, "reports");
const FTS_SHADOWS = new Set(["mcqs_fts", "mcqs_fts_config", "mcqs_fts_data", "mcqs_fts_docsize", "mcqs_fts_idx"]);

function tableHash(db, table) {
  const info = db.prepare("PRAGMA table_info(" + lib.qid(table) + ")").all();
  const pkCols = info.filter((c) => c.pk > 0).map((c) => c.name);
  const orderBy = pkCols.length ? pkCols.map((c) => lib.qid(c)).join(",") : "rowid";
  const stmt = db.prepare("SELECT * FROM " + lib.qid(table) + " ORDER BY " + orderBy);
  const h = crypto.createHash("sha256");
  let rows = 0;
  for (const r of stmt.iterate()) { h.update(JSON.stringify(r)); rows++; }
  return { rows, hash: h.digest("hex") };
}

async function main() {
  console.log("[validate-db] original=" + ORIGINAL);
  console.log("[validate-db] rebuilt =" + REBUILT);
  const dbA = new DatabaseSync(ORIGINAL, { readOnly: true });
  const dbB = new DatabaseSync(REBUILT, { readOnly: true });

  const results = { phase: "validate", validated_at: new Date().toISOString(), original: ORIGINAL, rebuilt: REBUILT, checks: [], passed: 0, failed: 0, diffs: [] };
  const add = (name, status, detail) => { results.checks.push({ check: name, status, detail }); if (status === "PASSED") results.passed++; else results.failed++; };

  // Tables
  const tablesA = lib.listTables(dbA).filter((t) => !FTS_SHADOWS.has(t));
  const tablesB = lib.listTables(dbB).filter((t) => !FTS_SHADOWS.has(t));
  add("table_count", tablesA.length === tablesB.length ? "PASSED" : "FAILED", tablesA.length + " vs " + tablesB.length);

  let missingRows = 0, extraRows = 0, modifiedRows = 0, hashMismatch = new Set();
  for (const t of tablesA) {
    if (!tablesB.includes(t)) { results.diffs.push({ table: t, type: "missing_table" }); continue; }
    const a = tableHash(dbA, t);
    const b = tableHash(dbB, t);
    if (a.rows !== b.rows) {
      if (a.rows > b.rows) missingRows += a.rows - b.rows; else extraRows += b.rows - a.rows;
      results.diffs.push({ table: t, type: "row_count", original: a.rows, rebuilt: b.rows });
    }
    if (a.hash !== b.hash) {
      modifiedRows += Math.min(a.rows, b.rows);
      hashMismatch.add(t);
      results.diffs.push({ table: t, type: "checksum_mismatch", original: a.hash, rebuilt: b.hash });
    }
  }
  add("row_counts_per_table", missingRows === 0 && extraRows === 0 ? "PASSED" : "FAILED", "missing=" + missingRows + " extra=" + extraRows);
  add("content_hash_per_table", hashMismatch.size === 0 ? "PASSED" : "FAILED", modifiedRows + " modified rows across " + hashMismatch.size + " tables");
  add("no_missing_rows", missingRows === 0 ? "PASSED" : "FAILED", missingRows + " missing");
  add("no_extra_rows", extraRows === 0 ? "PASSED" : "FAILED", extraRows + " extra");
  add("no_modified_rows", modifiedRows === 0 ? "PASSED" : "FAILED", modifiedRows + " modified");

  // Schema
  const sqlOf = (db, type) => db.prepare("SELECT name, sql FROM sqlite_master WHERE type=? AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY name").all(type).map(r => r.sql).join("\n");
  for (const type of ["table", "index", "view", "trigger"]) {
    const a = sqlOf(dbA, type); const b = sqlOf(dbB, type);
    add("schema_" + type, a === b ? "PASSED" : "FAILED", type);
  }

  // They meet unique/PK/NULL via identical schema + integrity
  for (const db of [dbB]) {
    const ic = db.prepare("PRAGMA integrity_check").all();
    add("rebuilt_integrity", ic.length === 1 && Object.values(ic[0])[0] === "ok" ? "PASSED" : "FAILED", JSON.stringify(ic));
  }

  const totalRowsA = tablesA.reduce((s, t) => s + dbA.prepare("SELECT COUNT(*) n FROM " + lib.qid(t)).get().n, 0);
  const totalRowsB = tablesB.reduce((s, t) => s + dbB.prepare("SELECT COUNT(*) n FROM " + lib.qid(t)).get().n, 0);
  add("total_row_count", totalRowsA === totalRowsB ? "PASSED" : "FAILED", totalRowsA + " vs " + totalRowsB);

  const report = { ...results, overall_validation_score: results.failed === 0 ? 1.0 : 0, totals: { original_rows: totalRowsA, rebuilt_rows: totalRowsB } };
  lib.writeJson(path.join(REPORT_DIR, "validate_report.json"), report);
  console.log("[validate-db] passed=" + results.passed + " failed=" + results.failed + " missing=" + missingRows + " extra=" + extraRows + " modified=" + modifiedRows);
  dbA.close(); dbB.close();
  if (results.failed > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
