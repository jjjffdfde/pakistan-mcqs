"use strict";
/* ============================================================
   database/scripts/build-db.js
   Rebuild an identical SQLite database from the source repo.
   Auto-detects .ndjson / .ndjson.gz / .ndjson.zst.
   Streaming, batched inserts, transactions, resume support.
   Usage:
     node build-db.js [--out <path>] [--source <repo-dir>]
   ============================================================ */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const readline = require("readline");
const { DatabaseSync } = require("node:sqlite");
const lib = require("./lib/db-repo.js");

const ARGS = process.argv.slice(2);
const outIdx = ARGS.indexOf("--out");
const OUT_PATH = outIdx > -1 ? ARGS[outIdx + 1] : path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.rebuilt.sqlite");
const srcIdx = ARGS.indexOf("--source");
const REPO = srcIdx > -1 ? ARGS[srcIdx + 1] : lib.REPO_ROOT;

const SCHEMA_DIR = path.join(REPO, "schema");
const DATA_DIR = path.join(REPO, "data");
const MANIFEST_DIR = path.join(REPO, "manifests");
const STATE_FILE = path.join(MANIFEST_DIR, ".build-state.json");

function state() { try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch (e) { return { done: {} }; } }

const FTS_SHADOWS = new Set(["mcqs_fts", "mcqs_fts_config", "mcqs_fts_data", "mcqs_fts_docsize", "mcqs_fts_idx"]);

function collectDataFiles() {
  const out = {};
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (e.name.endsWith(".ndjson") || e.name.endsWith(".ndjson.gz") || e.name.endsWith(".ndjson.zst")) {
        const base = e.name.replace(/\.(gz|zst)$/, "");
        const table = base.split(".ndjson")[0];
        const isMcq = /^part\d+$/.test(base.split(".ndjson")[0]) || base.startsWith("part");
        const key = isMcq ? "mcqs" : table;
        if (!out[key]) out[key] = [];
        out[key].push(full);
      }
    }
  })(DATA_DIR);
  for (const k of Object.keys(out)) out[k].sort();
  return out;
}

function openReader(full) {
  let raw = fs.createReadStream(full);
  if (full.endsWith(".gz")) raw = raw.pipe(zlib.createGunzip());
  else if (full.endsWith(".zst")) { const { spawn } = require("child_process"); raw = spawn("zstd", ["-d", "-c"], { stdio: ["pipe", "pipe", "inherit"] }); }
  return raw;
}

async function importTable(db, table, files, st) {
  const cols = lib.tableInfo(db, table).map((c) => c.name);
  const colList = cols.map((c) => lib.qid(c)).join(",");
  const valList = cols.map(() => "?").join(",");
  const insert = db.prepare(`INSERT INTO ${lib.qid(table)} (${colList}) VALUES (${valList})`);

  let count = 0;
  const batch = [];
  const flush = () => {
    db.exec("BEGIN");
    for (const b of batch) insert.run(...b);
    db.exec("COMMIT");
    batch.length = 0;
  };

  for (const f of files) {
    const raw = openReader(f);
    const rl = readline.createInterface({ input: raw, crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line.trim()) continue;
      const row = JSON.parse(line);
      batch.push(cols.map((c) => (row[c] === undefined ? null : row[c])));
      count++;
      if (batch.length >= 500) { flush(); if (count % 50000 === 0) console.log("  " + table + ": " + count + " rows"); }
    }
    rl.close();
  }
  flush();
  st.done[table] = count;
  fs.writeFileSync(STATE_FILE, JSON.stringify(st), "utf8");
  console.log("  " + table + ": " + count + " rows imported");
  return count;
}

function execSchemaSql(db, file) {
  const sql = fs.readFileSync(path.join(SCHEMA_DIR, file), "utf8");
  db.exec(sql);
}

async function main() {
  const st = state();
  const t0 = Date.now();
  console.log("[build-db] rebuilding " + OUT_PATH + " from " + REPO);
  if (fs.existsSync(OUT_PATH)) fs.rmSync(OUT_PATH, { force: true });
  const db = new DatabaseSync(OUT_PATH);
  db.exec("PRAGMA foreign_keys = OFF; PRAGMA journal_mode = WAL;");

  console.log("[build-db] creating schema");
  for (const f of ["tables.sql", "indexes.sql", "views.sql", "triggers.sql"]) {
    if (fs.existsSync(path.join(SCHEMA_DIR, f))) execSchemaSql(db, f);
  }

  const files = collectDataFiles();
  console.log("[build-db] importing " + Object.keys(files).length + " tables");
  for (const table of Object.keys(files)) {
    if (FTS_SHADOWS.has(table)) continue;
    if (st.done[table] !== undefined) { console.log("  " + table + ": skipped (resume, " + st.done[table] + " rows)"); continue; }
    await importTable(db, table, files[table], st);
  }

  console.log("[build-db] rebuilding FTS index (content='mcqs')");
  try {
    db.exec("INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')");
    console.log("[build-db] mcqs_fts rebuilt");
  } catch (e) { console.warn("[build-db] FTS rebuild skipped: " + e.message); }

  console.log("[build-db] vacuum + analyze + integrity");
  db.exec("PRAGMA foreign_keys = ON; VACUUM; ANALYZE;");
  const integrity = db.prepare("PRAGMA integrity_check").all().map((r) => Object.values(r)[0]);
  console.log("[build-db] integrity_check: " + integrity.join(", "));

  const total = Object.values(st.done).reduce((s, n) => s + n, 0);
  console.log("[build-db] complete. total rows=" + total + " time=" + ((Date.now() - t0) / 1000).toFixed(1) + "s");
  db.close();
  fs.writeFileSync(path.join(MANIFEST_DIR, "build_report.json"), JSON.stringify({
    built_at: new Date().toISOString(), out: OUT_PATH, rows: total, integrity,
    duration_ms: Date.now() - t0, tables: Object.keys(st.done).length
  }, null, 2));
}

main().then(() => process.exit(0)).catch((e) => { console.error("[build-db] ERROR", e); process.exit(1); });
