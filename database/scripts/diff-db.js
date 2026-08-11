"use strict";
/* ============================================================
   database/scripts/diff-db.js
   Compare two SQLite databases per table (streamed).
   For each table: row count + streaming SHA256 over rows in
   rowid order. Reports identical / missing / extra / modified
   per table. Memory-safe (no full-table buffering).
   Usage: node diff-db.js --a <db> --b <db> [--table <name>]
   ============================================================ */
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const lib = require("./lib/db-repo.js");

const ARGS = process.argv.slice(2);
const get = (k) => { const i = ARGS.indexOf(k); return i > -1 ? ARGS[i + 1] : null; };
const DB_A = get("--a");
const DB_B = get("--b");
const ONLY_TABLE = get("--table");
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
  if (!DB_A || !DB_B) { console.error("usage: node diff-db.js --a <db> --b <db> [--table <name>]"); process.exit(1); }
  const report = { phase: "diff", diffed_at: new Date().toISOString(), a: DB_A, b: DB_B, tables: {}, totals: { missing: 0, extra: 0, modified: 0, identical: 0 } };
  const dbA = new DatabaseSync(DB_A, { readOnly: true });
  const dbB = new DatabaseSync(DB_B, { readOnly: true });
  const tablesA = lib.listTables(dbA).filter((t) => !FTS_SHADOWS.has(t));
  const tablesB = lib.listTables(dbB).filter((t) => !FTS_SHADOWS.has(t));
  const tables = ONLY_TABLE ? [ONLY_TABLE] : tablesA.filter((t) => tablesB.includes(t));

  for (const t of tables) {
    const a = tableHash(dbA, t);
    const b = tableHash(dbB, t);
    let status = "identical";
    if (a.rows !== b.rows) status = a.rows > b.rows ? "missing_rows" : "extra_rows";
    if (a.hash !== b.hash && a.rows === b.rows) status = "modified";
    const stat = { status, a_rows: a.rows, b_rows: b.rows, a_hash: a.hash, b_hash: b.hash };
    report.tables[t] = stat;
    if (status === "identical") report.totals.identical++;
    else {
      report.totals.modified++;
      if (a.rows > b.rows) report.totals.missing += a.rows - b.rows;
      if (b.rows > a.rows) report.totals.extra += b.rows - a.rows;
    }
    console.log(t + ": " + status + " (a=" + a.rows + " b=" + b.rows + ")");
  }

  lib.writeJson(path.join(REPORT_DIR, "diff_report.json"), report);
  console.log("[diff-db] identical=" + report.totals.identical + " differing=" + report.totals.modified + " missing=" + report.totals.missing + " extra=" + report.totals.extra);
  dbA.close(); dbB.close();
  if (report.totals.modified > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
