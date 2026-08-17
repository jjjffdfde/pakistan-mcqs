/* runtime-v2/data-loader.cjs
   Streaming NDJSON.GZ loader + LRU cache for the JSON/NDJSON runtime.
   Deterministic, low-memory (<512MB), lazy. No SQLite dependency. */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { StringDecoder } = require("string_decoder");

const ROOT = path.join(__dirname, "..");
const SRC_DIR = process.env.MCQS_JSON_DATA_DIR || path.join(ROOT, "database", "data");
const IDX_DIR = process.env.MCQS_JSON_INDEX_DIR || path.join(__dirname, "indexes");
const USER_DIR = path.join(__dirname, "userdata");
const MAX_CACHE_ENTRIES = 12;
const MAX_CACHE_ROWS = 20000;

/* ---------- streaming gunzip line iterator ---------- */
function streamGzLines(file, onLine, opts = {}) {
  return new Promise((resolve, reject) => {
    const src = fs.createReadStream(file);
    const g = zlib.createGunzip();
    const dec = new StringDecoder("utf8");
    let pending = "";
    let lineCount = 0;
    g.on("data", (chunk) => {
      pending += dec.write(chunk);
      let i;
      while ((i = pending.indexOf("\n")) !== -1) {
        const line = pending.slice(0, i);
        pending = pending.slice(i + 1);
        if (!line.trim()) continue;
        lineCount++;
        let parsed;
        try { parsed = JSON.parse(line); } catch { parsed = null; }
        const cont = onLine(parsed, lineCount);
        if (cont === false || (opts.maxLines && lineCount >= opts.maxLines)) {
          src.destroy(); g.destroy();
          resolve({ lines: lineCount, truncated: true });
          return;
        }
      }
    });
    g.on("end", () => { pending += dec.end(); resolve({ lines: lineCount, truncated: false }); });
    g.on("error", reject);
    src.pipe(g);
  });
}

/* ---------- small JSON index file read with cache (bounded by bytes, LRU) ---------- */
const fileCache = new Map(); /* rel -> {data, bytes, lastUsed} */
const MAX_FILE_CACHE_MB = 48;
let fileTick = 0;
function readJson(rel) {
  const hit = fileCache.get(rel);
  if (hit) { hit.lastUsed = ++fileTick; return hit.data; }
  const abs = path.join(IDX_DIR, rel);
  const data = JSON.parse(fs.readFileSync(abs, "utf8"));
  const bytes = Buffer.byteLength(JSON.stringify(data));
  fileCache.set(rel, { data, bytes, lastUsed: ++fileTick });
  let total = [...fileCache.values()].reduce((a, v) => a + v.bytes, 0);
  if (total > MAX_FILE_CACHE_MB * 1048576) {
    const entries = [...fileCache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [k, v] of entries) {
      if (total <= MAX_FILE_CACHE_MB * 1048576) break;
      fileCache.delete(k);
      total -= v.bytes;
    }
  }
  return data;
}

/* ---------- search buckets: large (212MB total); bounded LRU by bytes ---------- */
const MAX_SEARCH_CACHE_MB = 32;
const searchCache = new Map(); /* letter -> {data, bytes, lastUsed} */
let searchTick = 0;
function readSearch(letter) {
  const hit = searchCache.get(letter);
  if (hit) { hit.lastUsed = ++searchTick; return hit.data; }
  const abs = path.join(IDX_DIR, "search", letter + ".json");
  const data = JSON.parse(fs.readFileSync(abs, "utf8"));
  const bytes = Buffer.byteLength(JSON.stringify(data));
  searchCache.set(letter, { data, bytes, lastUsed: ++searchTick });
  let total = [...searchCache.values()].reduce((a, v) => a + v.bytes, 0);
  if (total > MAX_SEARCH_CACHE_MB * 1048576) {
    const entries = [...searchCache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [k, v] of entries) {
      if (total <= MAX_SEARCH_CACHE_MB * 1048576) break;
      searchCache.delete(k);
      total -= v.bytes;
    }
  }
  return data;
}

/* ---------- LRU for parsed subject MCQ banks ---------- */
const lru = new Map(); /* key -> {rows, options, lastUsed, rowCount} */
let lruTick = 0;
function evictIfNeeded() {
  if (lru.size <= MAX_CACHE_ENTRIES && [...lru.values()].reduce((a, v) => a + v.rowCount, 0) <= MAX_CACHE_ROWS) return;
  const entries = [...lru.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  while (lru.size > MAX_CACHE_ENTRIES || [...lru.values()].reduce((a, v) => a + v.rowCount, 0) > MAX_CACHE_ROWS) {
    const [k] = entries.shift();
    lru.delete(k);
  }
}
function cachePut(subject, rows, options) {
  if (rows.length > MAX_CACHE_ROWS) return;
  evictIfNeeded();
  lru.set(subject, { rows, options, lastUsed: ++lruTick, rowCount: rows.length });
}
function cacheGet(subject) {
  const v = lru.get(subject);
  if (v) v.lastUsed = ++lruTick;
  return v;
}

/* ---------- subject part loading ---------- */
function partFile(subject) {
  return path.join(SRC_DIR, "mcqs", subject, "part01.ndjson.gz");
}
/* User-imported MCQs (admin /api/import) live in the gitignored userdata
   overlay; they are streamed after the committed part (rowid order = part01
   first, imports after — matching SQLite insertion order) and indexed by the
   index builder. */
const IMPORTS_DIR = path.join(USER_DIR, "imports");
function importsFile(subject) {
  return path.join(IMPORTS_DIR, subject + ".ndjson.gz");
}
function partFiles(subject) {
  const files = [partFile(subject)];
  const imp = importsFile(subject);
  if (fs.existsSync(imp)) files.push(imp);
  return files;
}
async function streamSubject(subject, onLine, opts = {}) {
  let lines = 0, truncated = false;
  for (const f of partFiles(subject)) {
    if (truncated) break;
    const max = opts.maxLines ? Math.max(0, opts.maxLines - lines) : 0;
    const r = await streamGzLines(f, onLine, { ...opts, maxLines: max });
    lines += r.lines;
    if (r.truncated) truncated = true;
  }
  return { lines, truncated };
}
async function loadSubjectOptions(subject) {
  const optFile = path.join(IDX_DIR, "options", subject + ".json");
  if (!fs.existsSync(optFile)) return {};
  return JSON.parse(fs.readFileSync(optFile, "utf8"));
}
async function loadSubjectPart(subject) {
  const cached = cacheGet(subject);
  if (cached) {
    if (!cached.options) {
      const options = await loadSubjectOptions(subject);
      cached.options = options;
    }
    return cached;
  }
  const file = partFile(subject);
  if (!fs.existsSync(file)) return cachePut(subject, [], {});
  const rows = [];
  await streamSubject(subject, (row) => { if (row) rows.push(row); });
  const options = await loadSubjectOptions(subject);
  if (rows.length > MAX_CACHE_ROWS) return { rows, options };
  cachePut(subject, rows, options);
  return cacheGet(subject);
}

function isCached(subject) { return !!lru.get(subject); }
function cachePutRaw(subject, rows) { cachePut(subject, rows, null); }

/* ---------- small reference tables (exported, tiny) ---------- */
async function loadTable(table) {
  const rel = {
    subjects: ["subjects", "subjects.ndjson.gz"],
    categories: ["subjects", "categories.ndjson.gz"],
    chapters: ["chapters", "chapters.ndjson.gz"],
    topics: ["topics", "topics.ndjson.gz"],
    subtopics: ["subtopics", "subtopics.ndjson.gz"],
    quizzes: ["assessment", "quizzes.ndjson.gz"],
    mocktests: ["assessment", "mocktests.ndjson.gz"],
    pastpapers: ["assessment", "pastpapers.ndjson.gz"],
    concepts: ["concepts", "concepts.ndjson.gz"],
    mcq_concepts: ["concepts", "mcq_concepts.ndjson.gz"]
  }[table];
  if (!rel) throw new Error("unknown table " + table);
  const file = path.join(SRC_DIR, rel[0], rel[1]);
  if (!fs.existsSync(file)) return [];
  const rows = [];
  await streamGzLines(file, (row) => { if (row) rows.push(row); });
  return rows;
}

function manifest() { return readJson("manifest.json"); }
function metaById() { return readJson("mcq_by_id.json"); }
function bySubjectActive() { return readJson("mcq_by_subject.json"); }
function searchIndex(letter) {
  const c = /[a-z0-9]/.test(letter) ? letter : "other";
  return readSearch(c);
}
let recentOrderArr = null;
function recentOrder() {
  if (recentOrderArr) return recentOrderArr;
  const { ids, rp } = readJson("recent.json");
  const arr = new Array(rp.length);
  for (let i = 0; i < rp.length; i++) arr[i] = ids[rp[i]];
  recentOrderArr = arr;
  return arr;
}
function rowidOrder() { return readJson("recent.json").ids; }
const keyIdxCache = new Map(); /* kind/key -> ids array, FIFO-bounded */
const MAX_KEY_IDX_ENTRIES = 500;
function readKeyIndex(kind, key) {
  const ck = kind + "/" + key;
  if (keyIdxCache.has(ck)) { keyIdxCache.delete(ck); keyIdxCache.set(ck, keyIdxCache.get(ck)); return keyIdxCache.get(ck); }
  const file = path.join(IDX_DIR, kind, key + ".json");
  let arr = [];
  if (fs.existsSync(file)) arr = JSON.parse(fs.readFileSync(file, "utf8"));
  keyIdxCache.set(ck, arr);
  while (keyIdxCache.size > MAX_KEY_IDX_ENTRIES) {
    const oldest = keyIdxCache.keys().next().value;
    if (oldest === ck) break;
    keyIdxCache.delete(oldest);
  }
  return arr;
}
function clearKeyIdxCache() { keyIdxCache.clear(); }
function userFile(name) {
  return path.join(USER_DIR, name + ".json");
}

module.exports = {
  ROOT, SRC_DIR, IDX_DIR, USER_DIR, IMPORTS_DIR,
  streamGzLines, readJson, loadSubjectPart, loadSubjectOptions, loadTable, partFile,
  importsFile, partFiles, streamSubject, isCached, cachePutRaw,
  maxCacheRows: () => MAX_CACHE_ROWS,
  manifest, metaById, bySubjectActive, searchIndex, recentOrder, rowidOrder,
  readKeyIndex, clearKeyIdxCache, userFile,
  cacheStats: () => ({ entries: lru.size, rows: [...lru.values()].reduce((a, v) => a + v.rowCount, 0), fileCache: fileCache.size, keyIdxCache: keyIdxCache.size, searchCacheMB: +( [...searchCache.values()].reduce((a, v) => a + v.bytes, 0) / 1048576 ).toFixed(1) }),
  clearCaches: () => { lru.clear(); fileCache.clear(); keyIdxCache.clear(); searchCache.clear(); recentOrderArr = null; }
};
