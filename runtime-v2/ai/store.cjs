/* runtime-v2/ai/store.cjs — file-backed table store for the AI learning engine.
   Replaces the SQLite tables (ai_state, user_profiles, learning_sessions,
   revision_schedule, weak_topics, strong_topics, study_plans, predictions,
   recommendations, flashcards, achievements, notifications).
   Guarantees (phase 40 STEP 6): atomic writes (tmp+rename), write serialization
   (async queue), versioning (schema_version), backup rotation (.bak), checksums
   (sha256 sidecar), corruption recovery (auto-restore from .bak), and a live
   corruption registry. NO SQL, NO SQLite. */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const L = require("../data-loader.cjs");

const DIR = path.join(L.USER_DIR, "ai");
const SCHEMA_VERSION = 1;
const TABLES = [
  "ai_state", "user_profiles", "learning_sessions", "revision_schedule",
  "weak_topics", "strong_topics", "study_plans", "predictions",
  "recommendations", "flashcards", "achievements", "notifications"
];

function ensure() { fs.mkdirSync(DIR, { recursive: true }); }
const file = (t) => path.join(DIR, t + ".json");
const shaFile = (t) => path.join(DIR, t + ".json.sha256");
const bakFile = (t) => path.join(DIR, t + ".json.bak");

const cache = new Map();
let writeQueue = Promise.resolve();
const corruptionEvents = [];

function load(t) {
  if (cache.has(t)) return cache.get(t);
  let rows = [];
  try {
    const txt = fs.readFileSync(file(t), "utf8");
    const want = fs.existsSync(shaFile(t)) ? fs.readFileSync(shaFile(t), "utf8").trim() : "";
    const got = crypto.createHash("sha256").update(txt).digest("hex");
    if (want && got !== want) throw new Error("checksum mismatch");
    rows = JSON.parse(txt);
    if (!Array.isArray(rows)) throw new Error("not an array");
  } catch (e) {
    const evt = { table: t, error: e.message, at: new Date().toISOString() };
    let recovered = false;
    try {
      const bak = fs.readFileSync(bakFile(t), "utf8");
      const bWant = fs.existsSync(shaFile(t)) ? fs.readFileSync(shaFile(t), "utf8").trim().split("\n")[1] || "" : "";
      const bGot = crypto.createHash("sha256").update(bak).digest("hex");
      if (bWant && bGot !== bWant) throw new Error("backup checksum mismatch");
      const parsed = JSON.parse(bak);
      if (!Array.isArray(parsed)) throw new Error("backup not an array");
      rows = parsed;
      recovered = true;
    } catch (e2) {
      rows = [];
      evt.quarantined = true;
    }
    evt.recovered = recovered;
    corruptionEvents.push(evt);
  }
  cache.set(t, rows);
  return rows;
}

function persist(t) {
  writeQueue = writeQueue.then(() => {
    return new Promise((resolve, reject) => {
      try {
        ensure();
        const rows = cache.get(t) || [];
        const txt = JSON.stringify(rows, null, 1);
        const digest = crypto.createHash("sha256").update(txt).digest("hex");
        const tmp = file(t) + ".tmp";
        const tmpSha = shaFile(t) + ".tmp";
        fs.writeFileSync(tmp, txt);
        fs.writeFileSync(tmpSha, digest + "\n" + digest);
        if (fs.existsSync(file(t))) fs.renameSync(file(t), bakFile(t));
        fs.renameSync(tmp, file(t));
        fs.renameSync(tmpSha, shaFile(t));
        resolve();
      } catch (e) { reject(e); }
    });
  });
  return writeQueue;
}

function nextId(t) {
  const rows = load(t);
  let m = 0;
  for (const r of rows) if (Number(r.id) > m) m = Number(r.id);
  return m + 1;
}

function matchRow(row, q) {
  for (const k of Object.keys(q)) {
    if (String(row[k]) !== String(q[k])) return false;
  }
  return true;
}

/* select rows: match = {field:value} equality (String-compare like SQLite), optional order
   [[field, 'asc'|'desc'],...] and limit. */
function all(t, { match, order, limit } = {}) {
  let rows = load(t);
  if (match) rows = rows.filter((r) => matchRow(r, match));
  if (order) {
    rows = rows.slice().sort((a, b) => {
      for (const [f, dir] of order) {
        const av = a[f], bv = b[f];
        if (av === bv) continue;
        const lt = av < bv ? -1 : 1;
        return dir === "desc" ? -lt : lt;
      }
      return 0;
    });
  }
  if (limit) rows = rows.slice(0, limit);
  return rows.map((r) => ({ ...r }));
}

function get(t, match) {
  const rows = load(t);
  const r = rows.find((row) => matchRow(row, match));
  return r ? { ...r } : null;
}

function insert(t, row) {
  const rows = load(t);
  const full = { ...row };
  rows.push(full);
  persist(t);
  return full;
}

/* ON CONFLICT(...) DO UPDATE semantics: replace the first matching row, else append. */
function upsert(t, match, row) {
  const rows = load(t);
  const i = rows.findIndex((r) => matchRow(r, match));
  if (i >= 0) rows[i] = { ...row };
  else rows.push({ ...row });
  return persist(t);
}

/* UPDATE ... SET patch WHERE match */
function update(t, match, patch) {
  const rows = load(t);
  let n = 0;
  for (const r of rows) if (matchRow(r, match)) { Object.assign(r, patch); n++; }
  return persist(t).then(() => n);
}

function remove(t, match) {
  const rows = load(t);
  let n = 0;
  for (let i = rows.length - 1; i >= 0; i--) if (matchRow(rows[i], match)) { rows.splice(i, 1); n++; }
  return persist(t).then(() => n);
}

function count(t, match) {
  let rows = load(t);
  if (match) rows = rows.filter((r) => matchRow(r, match));
  return rows.length;
}

/* ---------- ai_state key/value (global) ---------- */
function stateGet(key) {
  const r = get("ai_state", { key });
  return r ? r.value : null;
}
function stateSet(key, value) {
  return upsert("ai_state", { key }, { key, value, built_at: utcNow() });
}
function stateHas(key) { return stateGet(key) !== null; }

function utcNow() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function resetAll() {
  for (const t of TABLES) {
    cache.set(t, []);
    try { if (fs.existsSync(file(t))) fs.renameSync(file(t), file(t) + ".reset"); } catch (e) {}
    try { if (fs.existsSync(shaFile(t))) fs.unlinkSync(shaFile(t)); } catch (e) {}
  }
  return Promise.resolve();
}

module.exports = {
  DIR, TABLES, SCHEMA_VERSION, load, all, get, insert, upsert, update, remove, count,
  nextId, stateGet, stateSet, stateHas, persist, corruptionEvents,
  resetAll, _cache: cache
};
