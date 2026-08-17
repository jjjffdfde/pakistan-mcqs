/* runtime-v2/index-builder.cjs
   Builds the deterministic JSON runtime indexes from database/data NDJSON.GZ exports.
   Pass 1: id meta + by_chapter/by_topic/by_difficulty/by_year/by_exam lists + per-subject active counts + manifest.
   Pass 2: search postings (question + explanation tokens, prefix-matchable, bounded).
   Pass 3: options grouped per subject (streaming flush to keep peak memory low).
   Rebuildable: `node runtime-v2/index-builder.cjs` — output in runtime-v2/indexes/ (gitignored). */
"use strict";
const fs = require("fs");
const path = require("path");
const { streamGzLines, streamSubject, SRC_DIR, IDX_DIR, IMPORTS_DIR } = require("./data-loader.cjs");

const PARTS_DIR = path.join(SRC_DIR, "mcqs");
const STATUSES = ["active", "imported", "draft", "archived"];

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function sortUniq(arr) { arr.sort(); let j = 0; for (let i = 1; i < arr.length; i++) if (arr[i] !== arr[j]) arr[++j] = arr[i]; arr.length = j + 1; return arr; }

/* Low-memory streaming list writer: appends ids to a per-key JSON array file (insertion order = rowid order). */
function ChunkWriter(file) {
  this.file = file; this.started = false; this.n = 0; this.ws = null;
}
ChunkWriter.prototype.push = function (v) {
  if (!this.started) { this.started = true; this.ws = fs.createWriteStream(this.file); this.ws.write("["); }
  if (this.n++ > 0) this.ws.write(",");
  this.ws.write(JSON.stringify(v));
};
ChunkWriter.prototype.finish = function () {
  return new Promise((res, rej) => {
    if (!this.started) { fs.writeFileSync(this.file, "[]"); return res(); }
    this.ws.write("]");
    this.ws.end((e) => (e ? rej(e) : res()));
  });
};

/* Low-memory JSON object writer: streams {key:[...]} chunks instead of one giant stringify.
   Accepts an array of [key, value] pairs OR a lazy iterable of the same. */
async function writeJsonStreamed(file, entries) {
  const ws = fs.createWriteStream(file);
  ws.write("{");
  let first = true, buf = [];
  const flush = () => {
    if (!buf.length) return;
    ws.write((first ? "" : ",") + buf.join(","));
    first = false; buf = [];
  };
  for (const [key, value] of entries) {
    const isArr = Array.isArray(value);
    if (!isArr && (typeof value !== "object" || value === null)) {
      buf.push(JSON.stringify(key) + ":" + JSON.stringify(value));
      if (buf.length >= 40) flush();
      continue;
    }
    const items = isArr ? value : Object.entries(value);
    if (!items.length) { buf.push(JSON.stringify(key) + (isArr ? ":[]" : ":{}")); continue; }
    const closer = isArr ? "]" : "}";
    const prefix = JSON.stringify(key) + ":";
    let lastIdx = -1;
    for (let i = 0; i < items.length; i += 20000) {
      const slice = items.slice(i, i + 20000);
      const sliceJson = (isArr ? slice.map(JSON.stringify) : slice.map(([k, v]) => JSON.stringify(k) + ":" + JSON.stringify(v))).join(",");
      if (i === 0) {
        buf.push(prefix + (isArr ? "[" : "{") + sliceJson);
        lastIdx = buf.length - 1;
      } else {
        buf.push(sliceJson);
        lastIdx = buf.length - 1;
      }
    }
    buf[lastIdx] += closer;
    if (buf.length >= 40) flush();
  }
  flush();
  ws.write("}");
  return new Promise((res, rej) => { ws.end((e) => (e ? rej(e) : res())); });
}

function tokenize(text) {
  if (!text) return [];
  const out = new Set();
  for (const m of String(text).toLowerCase().matchAll(/[\p{L}\p{N}]+/gu)) {
    const t = m[0];
    if (t.length >= 4) out.add(t);
  }
  return [...out];
}

async function pass1() {
  console.log("[pass1] scanning subject parts...");
  const subjects = fs.readdirSync(PARTS_DIR).filter((d) => fs.existsSync(path.join(PARTS_DIR, d, "part01.ndjson.gz"))).sort();
  let meta = {};            /* id -> subjectIdx (encoded int — compact memory) */
  const bySubject = {};       /* subject -> active count */
  const statusCounts = {}; let maxCreated = null;
  const manifest = { builtAt: null, sourceFiles: {}, rows: 0, statusCounts: {}, maxCreatedAt: null };
  const writers = {
    chapter: new Map(), topic: new Map(), difficulty: new Map(), year: new Map(), exam: new Map()
  };
  const wdir = {
    chapter: path.join(IDX_DIR, "chapter"),
    topic: path.join(IDX_DIR, "topic"),
    difficulty: path.join(IDX_DIR, "difficulty"),
    year: path.join(IDX_DIR, "year"),
    exam: path.join(IDX_DIR, "exam")
  };
  for (const d of Object.values(wdir)) { if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); ensureDir(d); }
  const getWriter = (kind, key) => {
    let w = writers[kind].get(key);
    if (!w) { w = new ChunkWriter(path.join(wdir[kind], key + ".json")); writers[kind].set(key, w); }
    return w;
  };
  for (const sub of subjects) {
    const subIdx = subjects.indexOf(sub);
    const st = fs.statSync(path.join(PARTS_DIR, sub, "part01.ndjson.gz"));
    let lines = 0, active = 0;
    await streamSubject(sub, (row) => {
      if (!row) return;
      lines++;
      manifest.rows++;
      const stIdx = STATUSES.indexOf(row.status);
      meta[row.id] = subIdx;
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
      if (row.status === "active") active++;
      if (row.created_at && (!maxCreated || row.created_at > maxCreated)) maxCreated = row.created_at;
      if (row.chapter_id != null && row.chapter_id !== "") getWriter("chapter", row.chapter_id).push(row.id);
      if (row.topic_id != null && row.topic_id !== "") getWriter("topic", row.topic_id).push(row.id);
      if (row.difficulty != null && row.difficulty !== "") getWriter("difficulty", row.difficulty).push(row.id);
      if (row.year != null && row.year !== "") getWriter("year", String(row.year)).push(row.id);
      if (row.exam_ids) for (const e of String(row.exam_ids).split(",")) if (e) getWriter("exam", e).push(row.id);
    });
    bySubject[sub] = active;
    manifest.sourceFiles[sub] = { lines, bytes: st.size };
    console.log(`  ${sub}: ${lines} rows`);
  }
  await writeJsonStreamed(path.join(IDX_DIR, "mcq_by_id.json"), (function* () { for (const k in meta) yield [k, meta[k]]; })());
  await writeJsonStreamed(path.join(IDX_DIR, "mcq_by_subject.json"), Object.entries(bySubject));
  meta = null;
  for (const kind of Object.keys(writers)) {
    for (const w of writers[kind].values()) await w.finish();
    console.log(`  index kind '${kind}': ${writers[kind].size} keys`);
  }
  manifest.maxCreatedAt = maxCreated;
  console.log(`[pass1] ${manifest.rows} rows, ${Object.keys(bySubject).length} subjects, statuses:`, statusCounts);
  return manifest;
}

async function pass2(manifest) {
  console.log("[pass2] building search postings...");
  const sdir = path.join(IDX_DIR, "search");
  if (fs.existsSync(sdir)) fs.rmSync(sdir, { recursive: true, force: true });
  ensureDir(sdir);
  /* 2a: frequency pass -> stop list (tokens in >200k rows are near-useless discriminators;
     documented as the engine's stopword list, mirroring FTS5-minus-default-stopwords). */
  const freq = new Map();
  for (const [sub] of Object.entries(manifest.sourceFiles)) {
    await streamSubject(sub, (row) => {
      if (!row) return;
      for (const t of tokenize(row.question)) freq.set(t, (freq.get(t) || 0) + 1);
      for (const t of tokenize(row.explanation)) freq.set(t, (freq.get(t) || 0) + 1);
      try { for (const t of tokenize(JSON.parse(row.tags || "[]").join(" "))) freq.set(t, (freq.get(t) || 0) + 1); } catch (e) {}
    });
  }
  const STOP_FREQ = 200000;
  const stop = new Set();
  for (const [t, n] of freq) if (n > STOP_FREQ) stop.add(t);
  freq.clear();
  console.log(`[pass2] stop list (freq>${STOP_FREQ}): ${stop.size} tokens: ${[...stop].sort().join(", ")}`);
  /* 2b: flat "token|id" temp lines per letter bucket (postings in rowid order, no caps). */
  const tmpDir = path.join(sdir, "_tmp");
  ensureDir(tmpDir);
  const bucket = (ch) => (/[a-z0-9]/.test(ch) ? ch : "other");
  const writers = new Map();
  const getW = (b) => {
    if (!writers.has(b)) writers.set(b, fs.createWriteStream(path.join(tmpDir, b + ".txt")));
    return writers.get(b);
  };
  let postings = 0;
  for (const [sub] of Object.entries(manifest.sourceFiles)) {
    await streamSubject(sub, (row) => {
      if (!row) return;
      const toks = new Set([...tokenize(row.question), ...tokenize(row.explanation)]);
      try { for (const t of tokenize(JSON.parse(row.tags || "[]").join(" "))) toks.add(t); } catch (e) {}
      for (const t of toks) {
        if (stop.has(t)) continue;
        getW(bucket(t[0])).write(t + "|" + row.id + "\n");
        postings++;
      }
    });
  }
  for (const w of writers.values()) w.end();
  await new Promise((r) => setTimeout(r, 500));
  /* 2c: merge each letter bucket -> search/<letter>.json (tokens sorted, postings kept in rowid order). */
  let tokens = 0;
  for (const b of [...writers.keys()].sort()) {
    const groups = new Map();
    const lines = fs.readFileSync(path.join(tmpDir, b + ".txt"), "utf8").split("\n");
    for (const line of lines) {
      if (!line) continue;
      const i = line.indexOf("|");
      const t = line.slice(0, i), id = line.slice(i + 1);
      let arr = groups.get(t);
      if (!arr) { arr = []; groups.set(t, arr); }
      arr.push(id);
    }
    const words = [...groups.keys()].sort();
    tokens += words.length;
    await writeJsonStreamed(path.join(sdir, b + ".json"), words.map((w) => [w, groups.get(w)]));
    groups.clear();
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`[pass2] tokens: ${tokens}, stop: ${stop.size}, postings: ${postings}, letter buckets: ${writers.size}`);
  return { tokens, stop: stop.size, postings, letterBuckets: writers.size };
}

/* pass4: global ordering arrays — recent.json {ids, rp}: canonical `ids` in
   rowid (insertion) order + permutation rp mapping to created_at DESC, id ASC
   order. One id array instead of two → ~50MB less runtime heap. */
async function pass4() {
  console.log("[pass4] building global ordering arrays (compact)...");
  const recents = [];
  const rowids = [];
  for (const sub of Object.keys(JSON.parse(fs.readFileSync(path.join(IDX_DIR, "manifest.json"), "utf8")).sourceFiles).sort()) {
    await streamSubject(sub, (row) => {
      if (!row) return;
      recents.push((row.created_at || "").replace("T", " ").replace("Z", "") + "|" + row.id);
      rowids.push(row.id);
    });
  }
  recents.sort((a, b) => {
    const pa = a.lastIndexOf("|"), pb = b.lastIndexOf("|");
    const ta = a.slice(0, pa), tb = b.slice(0, pb);
    if (ta !== tb) return ta < tb ? 1 : -1;          /* created_at DESC */
    const ia = a.slice(pa + 1), ib = b.slice(pb + 1);
    return ia < ib ? -1 : 1;                          /* id ASC (SQLite tie = rowid ASC) */
  });
  const pos = new Map();
  for (let i = 0; i < rowids.length; i++) pos.set(rowids[i], i);
  const rp = new Array(recents.length);
  for (let i = 0; i < recents.length; i++) rp[i] = pos.get(recents[i].slice(recents[i].lastIndexOf("|") + 1));
  await writeJsonStreamed(path.join(IDX_DIR, "recent.json"), [["ids", rowids], ["rp", rp]]);
  const stale = path.join(IDX_DIR, "rowid.json");
  if (fs.existsSync(stale)) fs.unlinkSync(stale);
  console.log(`[pass4] recent.json written (${rowids.length} ids + permutation); rowid.json removed (canonical ids = rowid order)`);
}

async function pass3() {
  console.log("[pass3] grouping options per subject...");
  const optDir = path.join(IDX_DIR, "options");
  if (fs.existsSync(optDir)) fs.rmSync(optDir, { recursive: true, force: true });
  ensureDir(optDir);
  let meta = JSON.parse(fs.readFileSync(path.join(IDX_DIR, "mcq_by_id.json"), "utf8"));
  const manifest = JSON.parse(fs.readFileSync(path.join(IDX_DIR, "manifest.json"), "utf8"));
  const subjects = Object.keys(manifest.sourceFiles);
  const idToSub = new Map();
  for (const k of Object.keys(meta)) {
    const idx = Array.isArray(meta[k]) ? meta[k][0] : meta[k];
    idToSub.set(k, subjects[idx]);
  }
  meta = null;
  const optFile = path.join(SRC_DIR, "mcqs", "options.ndjson.gz");
  if (!fs.existsSync(optFile)) { console.log("[pass3] no options.ndjson.gz — skipping"); return; }
  const buf = new Map(); let buffered = 0;
  let total = 0, orphan = 0;
  const flush = async (subject, obj) => {
    const file = path.join(IDX_DIR, "options", subject + ".json");
    fs.writeFileSync(file, JSON.stringify(obj));
    return {};
  };
  await streamGzLines(optFile, async (row) => {
    if (!row) return;
    total++;
    const sub = row.mcq_id ? idToSub.get(row.mcq_id) : null;
    if (!sub) { orphan++; return; }
    let subObj = buf.get(sub);
    if (!subObj) { subObj = {}; buf.set(sub, subObj); }
    (subObj[row.mcq_id] = subObj[row.mcq_id] || {})[row.label] = row.text;
    buffered++;
    if (buffered >= 250000) {
      for (const [s, o] of buf) {
        const file = path.join(IDX_DIR, "options", s + ".json");
        const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
        fs.writeFileSync(file, JSON.stringify(Object.assign(prev, o)));
      }
      buf.clear(); buffered = 0;
    }
  });
  for (const [s, o] of buf) {
    const file = path.join(IDX_DIR, "options", s + ".json");
    const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
    fs.writeFileSync(file, JSON.stringify(Object.assign(prev, o)));
  }
  /* merge options of user-imported MCQs (userdata overlay) */
  const impOptDir = path.join(IMPORTS_DIR, "options");
  if (fs.existsSync(impOptDir)) {
    for (const f of fs.readdirSync(impOptDir).filter((x) => x.endsWith(".json"))) {
      const subj = f.slice(0, -5);
      const o = JSON.parse(fs.readFileSync(path.join(impOptDir, f), "utf8"));
      const file = path.join(IDX_DIR, "options", subj + ".json");
      const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
      fs.writeFileSync(file, JSON.stringify(Object.assign(prev, o)));
      for (const v of Object.values(o)) total += Object.keys(v).length;
    }
  }
  console.log(`[pass3] ${total} option rows grouped, orphan mcq_ids: ${orphan}`);
  return { optionRows: total, optionOrphans: orphan };
}

/* pass5: qhash.idx (qhash -> ids) + concept.idx (concept_id -> mcq ids, from
   database/data/concepts/mcq_concepts.ndjson.gz). Deterministic, exports only. */
async function pass5() {
  console.log("[pass5] building qhash + concept indexes...");
  const manifest = JSON.parse(fs.readFileSync(path.join(IDX_DIR, "manifest.json"), "utf8"));
  const out = {};
  out.qhash = path.join(IDX_DIR, "qhash.idx");
  out.concept = path.join(IDX_DIR, "concept.idx");
  for (const f of Object.values(out)) if (fs.existsSync(f)) fs.unlinkSync(f);
  /* qhash: one qhash per mcq (exports from the DB; all ids in the group listed deterministically) */
  const qhashEntries = [];
  for (const [sub] of Object.entries(manifest.sourceFiles)) {
    await streamSubject(sub, (row) => {
      if (!row || !row.qhash) return;
      qhashEntries.push([row.qhash, row.id]);
    });
  }
  const qhashGroups = new Map();
  for (const [h, id] of qhashEntries) {
    let arr = qhashGroups.get(h);
    if (!arr) { arr = []; qhashGroups.set(h, arr); }
    arr.push(id);
  }
  qhashEntries.length = 0;
  const qh = [...qhashGroups.keys()].sort();
  await writeJsonStreamed(out.qhash, qh.map((h) => [h, qhashGroups.get(h)]));
  console.log(`[pass5] qhash.idx: ${qh.length} distinct qhashes`);
  /* concept: concept_id -> mcq ids */
  const src = path.join(SRC_DIR, "concepts", "mcq_concepts.ndjson.gz");
  const groups = new Map();
  if (fs.existsSync(src)) {
    await streamGzLines(src, (row) => {
      if (!row) return;
      let arr = groups.get(row.concept_id);
      if (!arr) { arr = []; groups.set(row.concept_id, arr); }
      arr.push(row.mcq_id);
    });
  }
  const keys = [...groups.keys()].sort((a, b) => a - b);
  await writeJsonStreamed(out.concept, keys.map((k) => [k, groups.get(k)]));
  console.log(`[pass5] concept.idx: ${keys.length} concepts, ${[...groups.values()].reduce((a, v) => a + v.length, 0)} mcq links`);
}

async function main() {
  const t0 = Date.now();
  ensureDir(IDX_DIR);
  const mode = process.argv[2] || "all";
  const MANIFEST = path.join(IDX_DIR, "manifest.json");
  if (mode === "pass1" || mode === "all") {
    if (fs.existsSync(path.join(IDX_DIR, "search_index.json"))) fs.rmSync(path.join(IDX_DIR, "search_index.json"));
    for (const stale of ["mcq_by_chapter.json", "mcq_by_topic.json", "mcq_by_difficulty.json", "mcq_by_year.json", "mcq_by_exam.json"]) {
      if (fs.existsSync(path.join(IDX_DIR, stale))) fs.rmSync(path.join(IDX_DIR, stale));
    }
    const manifest = await pass1();
    manifest.builtAt = new Date().toISOString();
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
    global.gc && global.gc();
  }
  if (mode === "pass2") {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    manifest.searchTokens = await pass2(manifest);
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
    global.gc && global.gc();
  }
  if (mode === "pass3") {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const p3 = await pass3();
    manifest.optionRows = p3.optionRows; manifest.optionOrphans = p3.optionOrphans;
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
    global.gc && global.gc();
  }
  if (mode === "pass4") {
    await pass4();
    global.gc && global.gc();
  }
  if (mode === "pass5") {
    await pass5();
    global.gc && global.gc();
  }
  if (mode === "all") {
    const { spawnSync } = require("child_process");
    for (const p of ["pass2", "pass3", "pass4", "pass5"]) {
      const r = spawnSync(process.execPath, [__filename, p], { stdio: "inherit" });
      if (r.status !== 0) process.exit(r.status || 1);
    }
  }
  const rss = (process.memoryUsage().rss / 1048576).toFixed(1);
  console.log(`[done] indexes written to runtime-v2/indexes/ in ${((Date.now() - t0) / 1000).toFixed(1)}s, peak RSS ${rss}MB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
