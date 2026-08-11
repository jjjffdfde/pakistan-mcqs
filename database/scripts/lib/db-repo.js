"use strict";
/* ============================================================
   database/scripts/lib/db-repo.js
   Shared streaming helpers for the Phase 23 source repository.
   Read-only on production SQLite. Streaming only (max RAM 512MB).
   ============================================================ */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { pipeline } = require("stream/promises");
const readline = require("readline");

const REPO_ROOT = path.join(__dirname, "..", ".."); // database/
const PROJECT_ROOT = path.join(__dirname, "..", "..", ".."); // project root

function openDb() {
  const { open } = require(path.join(PROJECT_ROOT, "db", "engine.js"));
  return open();
}

function qid(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

/* Compat: works with engine wrapper (db.all) and raw DatabaseSync (db.prepare). */
function all(db, sql, ...params) {
  if (typeof db.prepare === "function") return db.prepare(sql).all(...params);
  return db.all(sql, ...params);
}
function get(db, sql, ...params) {
  if (typeof db.prepare === "function") return db.prepare(sql).get(...params);
  return db.get(sql, ...params);
}

function listTables(db) {
  return all(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").map((r) => r.name);
}

function listViews(db) {
  return all(db, "SELECT name, sql FROM sqlite_master WHERE type='view' AND sql IS NOT NULL ORDER BY name");
}

function listTriggers(db) {
  return all(db, "SELECT name, sql FROM sqlite_master WHERE type='trigger' AND sql IS NOT NULL ORDER BY name");
}

function listIndexes(db) {
  return all(db, "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY tbl_name, name");
}

function tableInfo(db, table) {
  return all(db, "PRAGMA table_info(" + qid(table) + ")");
}

function rowCount(db, table) {
  return get(db, "SELECT COUNT(*) n FROM " + qid(table)).n;
}

/* Streaming: write every row of a table as one NDJSON line. */
async function streamTableToNdjson(db, table, destPath, opts = {}) {
  const { onProgress, onRow } = opts;
  const stmt = db.raw.prepare("SELECT * FROM " + qid(table));
  const iter = stmt.iterate();
  const ws = fs.createWriteStream(destPath);
  let count = 0;
  const flush = () => new Promise((res) => ws.write("", res));
  for (const row of iter) {
    const line = JSON.stringify(row) + "\n";
    if (!ws.write(line)) await flush();
    count++;
    if (onRow) onRow(row);
    if (onProgress && count % 10000 === 0) await onProgress(count);
    if (count % 50000 === 0) await new Promise((r) => setImmediate(r));
  }
  await new Promise((res, rej) => { ws.end(res); ws.on("error", rej); });
  return count;
}

/* Streaming gzip compression of a file. */
async function compressFile(src, dest) {
  await pipeline(fs.createReadStream(src), zlib.createGzip({ level: 6 }), fs.createWriteStream(dest));
}

/* Streaming gunzip of a file. */
async function decompressFile(src, dest) {
  await pipeline(fs.createReadStream(src), zlib.createGunzip(), fs.createWriteStream(dest));
}

/* Streaming SHA256 of a file. */
function sha256File(filePath) {
  return new Promise((res, rej) => {
    const h = crypto.createHash("sha256");
    const rs = fs.createReadStream(filePath);
    rs.on("data", (c) => h.update(c));
    rs.on("end", () => res(h.digest("hex")));
    rs.on("error", rej);
  });
}

/* Streaming line count (NDJSON rows). */
async function countLines(filePath) {
  return new Promise((res, rej) => {
    let n = 0;
    const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
    rl.on("line", () => n++);
    rl.on("close", () => res(n));
    rl.on("error", rej);
  });
}

/* Stream lines of a (possibly compressed) NDJSON file. Auto-detects .gz. */
function openNdjsonReader(filePath) {
  const raw = filePath.endsWith(".gz")
    ? fs.createReadStream(filePath).pipe(zlib.createGunzip())
    : fs.createReadStream(filePath);
  return readline.createInterface({ input: raw, crlfDelay: Infinity });
}

async function countLinesSmart(filePath) {
  return new Promise((res, rej) => {
    let n = 0;
    const rl = openNdjsonReader(filePath);
    rl.on("line", () => n++);
    rl.on("close", () => res(n));
    rl.on("error", rej);
  });
}

async function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch (e) { return null; }
}

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

function fileSize(p) { try { return fs.statSync(p).size; } catch (e) { return 0; } }

function human(n) {
  if (n >= 1073741824) return (n / 1073741824).toFixed(2) + " GB";
  if (n >= 1048576) return (n / 1048576).toFixed(2) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(2) + " KB";
  return n + " B";
}

function detectCompression(filename) {
  if (filename.endsWith(".zst")) return "zst";
  if (filename.endsWith(".gz")) return "gz";
  return null;
}

module.exports = {
  REPO_ROOT, PROJECT_ROOT, openDb, qid, listTables, listViews, listTriggers, listIndexes,
  tableInfo, rowCount, streamTableToNdjson, compressFile, decompressFile, sha256File,
  countLines, countLinesSmart, openNdjsonReader, writeJson, readJson, mkdirp, fileSize, human, detectCompression
};
