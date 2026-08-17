/* runtime-v2/query-engine.cjs
   Deterministic query engine over the JSON/NDJSON runtime indexes.
   Mirrors server.js API semantics exactly (filters, pagination, option
   attachment, related questions); deterministic ordering replaces SQLite
   RANDOM() tie-breaks (documented in phase 37 report). */
"use strict";
const L = require("./data-loader.cjs");

let smallTables = null;
let meta = null;        /* lazy: id -> subjectIdx (encoded int; statusIdx unused at runtime) */
let chapterMap = null, topicMap = null, subjectMap = null, categoryMap = null;
let keyIdxCache = new Map();
let subjectNames = null;

function subjectName(idx) {
  if (!subjectNames) subjectNames = Object.keys(L.manifest().sourceFiles);
  return subjectNames[idx];
}

async function init() {
  if (smallTables) return smallTables;
  const [subjects, categories, chapters, topics, subtopics, quizzes, mocktests, pastpapers] = await Promise.all([
    L.loadTable("subjects"), L.loadTable("categories"), L.loadTable("chapters"),
    L.loadTable("topics"), L.loadTable("subtopics"), L.loadTable("quizzes"),
    L.loadTable("mocktests"), L.loadTable("pastpapers")
  ]);
  chapterMap = new Map(chapters.map((c) => [c.id, c]));
  topicMap = new Map(topics.map((t) => [t.id, t]));
  subjectMap = new Map(subjects.map((s) => [s.id, s]));
  categoryMap = new Map(categories.map((c) => [c.id, c]));
  smallTables = { subjects, categories, chapters, topics, subtopics, quizzes, mocktests, pastpapers };
  return smallTables;
}

function loadMeta() {
  if (!meta) meta = L.metaById();
  return meta;
}

/* Reload all runtime caches + tables after an index rebuild (admin import). */
async function reload() {
  smallTables = null;
  meta = null;
  chapterMap = null; topicMap = null; subjectMap = null; categoryMap = null;
  keyIdxCache = new Map();
  subjectNames = null;
  L.clearCaches();
  await init();
}

function sanitizeFts(q) {
  if (!q) return "";
  const words = String(q).replace(/['"^:*?()~{}\[\]\-]/g, " ").trim().split(/\s+/).filter(Boolean);
  return words;
}

function paginate(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(q.limit, 10) || 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/* ---- candidate resolution ---- */
function buildCandidateFilters(q) {
  const filters = [];
  if (q.chapter) filters.push(["chapter", q.chapter]);
  if (q.topic) filters.push(["topic", q.topic]);
  if (q.difficulty) filters.push(["difficulty", q.difficulty]);
  if (q.year) filters.push(["year", String(q.year)]);
  if (q.exam) filters.push(["exam", q.exam]);
  if (q.status && q.status !== "active") return { impossible: true };
  return { filters };
}

function candidateIds(q) {
  const { filters, impossible } = buildCandidateFilters(q);
  if (impossible) return { ids: [], total: 0 };
  if (filters.length === 0) return null; /* subject-only or all */
  filters.sort((a, b) => { /* smallest first */
    let la = 0, lb = 0;
    try { la = L.readKeyIndex(a[0], a[1]).length; } catch {}
    try { lb = L.readKeyIndex(b[0], b[1]).length; } catch {}
    return la - lb;
  });
  let set = null;
  for (const [kind, key] of filters) {
    const arr = L.readKeyIndex(kind, key);
    if (set === null) { set = new Set(arr); continue; }
    if (set.size > arr.length) {
      const s = new Set(arr);
      for (const id of set) if (!s.has(id)) set.delete(id);
    } else {
      for (const id of set) if (!arr.includes(id)) set.delete(id);
    }
  }
  return { ids: [...set], total: set.size };
}

/* ---- row fetching ---- */
function fetchRows(ids, opts = {}) {
  if (!ids.length) return { rows: [], byId: new Map() };
  const metaMap = loadMeta();
  const bySubject = new Map();
  const subjects = subjectNames || (subjectNames = Object.keys(L.manifest().sourceFiles));
  const needed = new Set(ids);
  const rows = [];
  const byId = new Map();
  for (const id of ids) {
    const m = metaMap[id];
    if (m == null) continue;
    const sub = subjects[m];
    if (!bySubject.has(sub)) bySubject.set(sub, []);
    bySubject.get(sub).push(id);
  }
  return new Promise(async (resolve, reject) => {
    try {
      const subjects = subjectNames || (subjectNames = Object.keys(L.manifest().sourceFiles));
      for (const sub of subjects) {
        const subIds = bySubject.get(sub) || [];
        if (!subIds.length) continue;
        const want = new Set(subIds);
        if (L.isCached(sub)) {
          const { rows: part } = await L.loadSubjectPart(sub);
          for (const r of part) {
            if (want.has(r.id)) { rows.push(r); byId.set(r.id, r); want.delete(r.id); }
          }
        } else {
          await L.streamSubject(sub, (row) => {
            if (row && want.has(row.id)) {
              rows.push(row); byId.set(row.id, row);
              want.delete(row.id);
              if (want.size === 0) return false; /* abort this part early */
            }
          });
        }
      }
      resolve({ rows, byId });
    } catch (e) { reject(e); }
  });
}

/* Top-N selection with SQLite-equivalent ordering: created_at DESC, id ASC.
   Uses a bounded min-heap so memory stays O(N) even for all-872k scans. */
function makeTopNHeap(n) {
  const heap = [];
  const cmp = (a, b) => {
    if (a.created_at !== b.created_at) return a.created_at < b.created_at ? -1 : 1;
    if (a.id !== b.id) return a.id < b.id ? -1 : 1;
    return 0;
  };
  const siftUp = () => {
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (cmp(heap[i], heap[p]) >= 0) break;
      [heap[i], heap[p]] = [heap[p], heap[i]]; i = p;
    }
  };
  const siftDown = () => {
    let i = 0;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < heap.length && cmp(heap[l], heap[m]) < 0) m = l;
      if (r < heap.length && cmp(heap[r], heap[m]) < 0) m = r;
      if (m === i) break;
      [heap[i], heap[m]] = [heap[m], heap[i]]; i = m;
    }
  };
  const add = (row) => {
    heap.push(row); siftUp();
    if (heap.length > n) { heap[0] = heap.pop(); siftDown(); }
  };
  const sorted = () => heap.slice().sort((a, b) => cmp(a, b) * -1); /* best first */
  return { add, sorted };
}

/* Stream one subject part; rowFn(row, rank) is called in part (rowid) order.
   Uses the LRU-cached bank when present. Uncached parts are streamed and only
   collected for caching when small (oversized parts are never materialized). */
async function streamPart(subject, rowFn) {
  if (L.isCached(subject)) {
    const { rows } = await L.loadSubjectPart(subject);
    let rank = 0;
    for (const r of rows) { rowFn(r, rank); rank++; }
    return;
  }
  const { streamGzLines, partFile } = L;
  const mf = L.manifest().sourceFiles[subject];
  const shouldCache = !mf || mf.lines <= L.maxCacheRows();
  let rank = 0;
  const collected = shouldCache ? [] : null;
  await L.streamSubject(subject, (row) => {
    if (row) {
      if (collected) collected.push(row);
      rowFn(row, rank); rank++;
    }
  });
  if (collected) L.cachePutRaw(subject, collected);
}

/* Stream candidate rows (subject parts filtered by a Set or all), top-N by created_at DESC, id ASC. */
async function streamCandidatesTopN(subjects, setOrNull, n, countExtra) {
  const heap = makeTopNHeap(n);
  let total = 0;
  for (const sub of subjects) {
    if (setOrNull === null && countExtra) { total += countExtra[sub] || 0; }
    await streamPart(sub, (row) => {
      if (setOrNull === null || setOrNull.has(row.id)) {
        if (setOrNull) total++;
        heap.add(row);
      }
    });
  }
  return { rows: heap.sorted(), total };
}

/* ---- option + name attachment (mirrors attachOptions + JOIN aliases) ----
   Every attach function clones rows at entry so cached part rows are never
   mutated (SQLite builds fresh rows per request; contamination must not leak). */
async function attachOptions(rows) {
  return new Promise(async (resolve) => {
    rows = rows.map((r) => ({ ...r }));
    const metaMap = loadMeta();
    const subjects = subjectNames || (subjectNames = Object.keys(L.manifest().sourceFiles));
    const bySubject = new Map();
    for (const r of rows) {
      const m = metaMap[r.id];
      if (m == null) continue;
      const sub = subjects[m];
      if (!bySubject.has(sub)) bySubject.set(sub, []);
      bySubject.get(sub).push(r);
    }
    for (const [sub, subRows] of bySubject) {
      const options = L.isCached(sub) ? (await L.loadSubjectPart(sub)).options : await L.loadSubjectOptions(sub);
      for (const r of subRows) {
        const o = options[r.id] || {};
        r.optionA = o.A ?? null; r.optionB = o.B ?? null; r.optionC = o.C ?? null; r.optionD = o.D ?? null;
      }
    }
    resolve(rows);
  });
}

function attachNames(rows) {
  rows = rows.map((r) => ({ ...r }));
  for (const r of rows) {
    const c = chapterMap.get(r.chapter_id), t = topicMap.get(r.topic_id);
    r.chapter_name = c ? c.name : null;
    r.topic_name = t ? t.name : null;
  }
  return rows;
}

function attachRelated(rows) {
  return new Promise(async (resolve, reject) => {
    try {
      rows = rows.map((r) => ({ ...r }));
      const parents = rows.filter((r) => r.chapter_id);
      if (!parents.length) { for (const r of rows) r.relatedQuestions = []; return resolve(rows); }
      /* group parents by subject+chapter; stream each subject part once */
      const groups = new Map(); /* subject -> Map(chapter -> [parent rows]) */
      const metaMap = loadMeta();
      const subjects = subjectNames || (subjectNames = Object.keys(L.manifest().sourceFiles));
      for (const r of parents) {
        const m = metaMap[r.id];
        if (m == null) continue;
        const sub = subjects[m];
        if (!groups.has(sub)) groups.set(sub, new Map());
        const cm = groups.get(sub);
        if (!cm.has(r.chapter_id)) cm.set(r.chapter_id, []);
        cm.get(r.chapter_id).push(r);
      }
      for (const r of parents) r.relatedQuestions = [];
      const parentById = new Map(parents.map((p) => [p.id, p]));
      for (const [sub, cm] of groups) {
        const wantedChapters = new Set(cm.keys());
        const scored = new Map(); /* chapter -> Map(parentId -> Map(candidateId -> score)) */
        for (const [ch, prs] of cm) {
          const m = new Map();
          for (const p of prs) {
            let tags = [];
            try { tags = JSON.parse(p.tags || "[]"); } catch (e) {}
            m.set(p.id, tags.slice(0, 3).map((x) => String(x).replace(/'/g, "")));
          }
          scored.set(ch, m);
        }
        await streamPart(sub, (row) => {
          if (!wantedChapters.has(row.chapter_id)) return;
          if (row.status !== "active") return; /* sqlite: WHERE status = 'active' */
          const parentsFor = scored.get(row.chapter_id);
          let rowTags = [];
          try { rowTags = JSON.parse(row.tags || "[]"); } catch (e) {}
          for (const [pid, tags] of parentsFor) {
            if (pid === row.id) continue;
            /* sqlite relByTag: tag overlap score 0..3 (LIKE substring match), then
               zero-score rows still qualify as fillers — LIMIT 5 over score DESC */
            let s = 0;
            for (const tg of tags) if (tg && rowTags.some((rt) => rt.includes(tg))) s++;
            const cand = parentById.get(pid);
            cand.relatedQuestions.push([s, row.id]);
          }
        });
        for (const parentsFor of scored.values()) {
          for (const pid of parentsFor.keys()) {
            const cand = parentById.get(pid);
            cand.relatedQuestions.sort((a, b) => b[0] - a[0] || (a[1] < b[1] ? -1 : 1));
            cand.relatedQuestions = cand.relatedQuestions.slice(0, 5).map((x) => x[1]);
          }
        }
      }
      resolve(rows);
    } catch (e) { reject(e); }
  });
}

/* Clone + attach names/options/related in the same relative key order as SQLite
   (JOIN aliases before m.options = ...) without mutating cached rows. */
async function prepare(rows) {
  rows = attachNames(rows);
  rows = await attachOptions(rows);
  return attachRelated(rows);
}

/* ---- public API ops ---- */
async function health() {
  return { ok: true, mcqs: L.manifest().rows };
}

async function stats() {
  const m = L.manifest();
  const bySub = L.bySubjectActive();
  let examsCount = 0;
  try { examsCount = JSON.parse(require("fs").readFileSync(require("path").join(L.ROOT, "data", "exams.json"), "utf8")).length; } catch (e) {}
  const count = (t) => (smallTables[t] ? smallTables[t].length : 0);
  const user = require("./user-store.cjs").counts();
  return {
    source: "json",
    data_source: "ndjson",
    db: "runtime-v2 (NDJSON.GZ exports)",
    sqlite_version: null,
    mcqs: Object.values(bySub).reduce((a, b) => a + b, 0),
    mcqs_total: m.rows,
    options: m.optionRows,
    subjects: subjectMap ? [...subjectMap.values()].filter((s) => s.status === "active").length : 0,
    chapters: count("chapters"),
    topics: count("topics"),
    subtopics: count("subtopics"),
    papers: count("pastpapers"),
    mocktests: count("mocktests"),
    quizzes: count("quizzes"),
    exams: examsCount,
    categories: count("categories"),
    bookmarks: user.bookmarks,
    attempts: user.history,
    leaderboard_rows: user.leaderboard,
    last_updated: m.maxCreatedAt
  };
}

/* Build a filter predicate from query params; returns {match(id)->bool, totalFn} */
function buildMatcher(q) {
  const { filters, impossible } = buildCandidateFilters(q);
  if (impossible) return { matches: () => false, total: 0 };
  const checks = [];
  let subjectSet = null;
  if (q.subject) {
    subjectSet = new Set(q.subject.split(",").map((s) => s.trim()).filter(Boolean));
    checks.push((id) => subjectSet.has(metaOf(id)));
  }
  for (const [kind, key] of filters) {
    const set = new Set(L.readKeyIndex(kind, key));
    checks.push((id) => set.has(id));
  }
  if (q.related) {
    const ids = new Set(q.related.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 50));
    checks.push((id) => ids.has(id));
  }
  if (!checks.length) return null;
  return {
    matches: (id) => { for (const c of checks) if (!c(id)) return false; return true; },
    total: 0
  };
}

function metaOf(id) {
  const m = loadMeta()[id];
  if (m == null) return null;
  return subjectName(m);
}

/* Walk the global recent order (created_at DESC, id ASC), collect window [offset, offset+limit)
   of matching ids and count matches. One pass over 872k ids with Set checks. */
function walkRecent(q, offset, limit) {
  const matcher = buildMatcher(q);
  const recent = L.recentOrder();
  const picked = [];
  let total = 0;
  if (matcher) {
    for (const id of recent) {
      if (!matcher.matches(id)) continue;
      if (total >= offset && picked.length < limit) picked.push(id);
      total++;
    }
  } else {
    total = recent.length;
    picked.push(...recent.slice(offset, offset + limit));
  }
  return { picked, total };
}

async function browse(q) {
  const { page, limit, offset } = paginate(q);
  const { picked, total } = walkRecent(q, offset, limit);
  const { rows } = await fetchRows(picked);
  return { results: await prepare(rows), total, page, limit, pages: Math.ceil(total / limit) };
}

async function getById(id) {
  const metaMap = loadMeta();
  const m = metaMap[id];
  if (m == null) return null;
  const subjects = subjectNames || (subjectNames = Object.keys(L.manifest().sourceFiles));
  const sub = subjects[m];
  let found = null;
  if (L.isCached(sub)) {
    const { rows: part } = await L.loadSubjectPart(sub);
    found = part.find((r) => r.id === id) || null;
  } else {
    await L.streamSubject(sub, (row) => { if (row && row.id === id) found = row; });
  }
  if (!found) return null;
  let row = attachNames([{ ...found }])[0]; /* sqlite SELECT aliases come before m.options = ... */
  const options = L.isCached(sub) ? (await L.loadSubjectPart(sub)).options : await L.loadSubjectOptions(sub);
  const o = options[id] || {};
  row.options = ["A", "B", "C", "D"].filter((l) => o[l] != null).map((l) => ({ label: l, text: o[l] }));
  row = (await attachRelated([row]))[0];
  return row;
}

async function batchByIds(ids) {
  const { rows } = await fetchRows(ids);
  return prepare(rows);
}

async function random(q) {
  const limit = Math.min(200, Math.max(1, parseInt(q.limit, 10) || 10));
  const seed = parseInt(q.seed, 10) || 0;
  const matcher = buildMatcher(q);
  const base = seed > 0 ? L.rowidOrder() : L.recentOrder();
  let total = 0, picked = [];
  if (seed > 0) {
    /* SQLite: ORDER BY rowid LIMIT ? OFFSET ? — walk rowid order, count matches, slice window */
    const win = new Map();
    let rank = -1;
    const offsetOf = (() => {
      if (!matcher) return 0;
      let t = 0;
      for (const id of base) if (matcher.matches(id)) t++;
      return Math.abs(seed) % Math.max(1, t - limit);
    })();
    const off = matcher ? offsetOf : Math.abs(seed) % Math.max(1, base.length - limit);
    for (const id of base) {
      if (matcher && !matcher.matches(id)) continue;
      rank++;
      total++;
      if (rank >= off && rank < off + limit) win.set(rank, id);
    }
    picked = [...win.keys()].sort((a, b) => a - b).map((k) => win.get(k));
  } else {
    /* SQLite RANDOM(): uniform reservoir sample (set parity only) */
    for (const id of base) {
      if (matcher && !matcher.matches(id)) continue;
      total++;
      if (picked.length < limit) picked.push(id);
      else { const j = Math.floor(Math.random() * total); if (j < limit) picked[j] = id; }
    }
  }
  const { rows } = await fetchRows(picked);
  return { results: await prepare(rows), total, limit };
}

async function subjects() {
  const bySub = L.bySubjectActive();
  const rows = smallTables.subjects
    .map((s) => ({ id: s.id, name: s.name, slug: s.slug, category_id: s.category_id, icon: s.icon, description: s.description, exam_ids: s.exam_ids, mcqs_count: bySub[s.id] || 0, sort_order: s.sort_order }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id < b.id ? -1 : 1));
  for (const r of rows) delete r.sort_order;
  return rows;
}

function chapters() {
  return smallTables.chapters
    .map((c) => ({ id: c.id, subject_id: c.subject_id, name: c.name, slug: c.slug, sort_order: c.sort_order }))
    .sort((a, b) => (a.subject_id < b.subject_id ? -1 : a.subject_id > b.subject_id ? 1 : (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id < b.id ? -1 : 1)))
    .map(({ sort_order, ...rest }) => rest);
}

function topics() {
  return smallTables.topics
    .map((t) => ({ id: t.id, chapter_id: t.chapter_id, name: t.name, slug: t.slug, sort_order: t.sort_order }))
    .sort((a, b) => (a.chapter_id < b.chapter_id ? -1 : a.chapter_id > b.chapter_id ? 1 : (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id < b.id ? -1 : 1)))
    .map(({ sort_order, ...rest }) => rest);
}

function categories() {
  return smallTables.categories
    .map(({ id, name, slug, icon, description, sort_order }) => ({ id, name, slug, icon, description, sort_order }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.id < b.id ? -1 : 1));
}

function quizzes() { return smallTables.quizzes.slice().sort((a, b) => (a.id < b.id ? -1 : 1)); }
function mocktests() { return smallTables.mocktests.slice().sort((a, b) => (a.id < b.id ? -1 : 1)); }
function pastpapers() {
  return smallTables.pastpapers
    .map((p) => ({ ...p, pattern: !!p.pattern }))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (a.id < b.id ? -1 : 1));
}

async function search(q) {
  const { page, limit, offset } = paginate(q);
  const words = sanitizeFts(q.q);
  if (!words.length) return browse(q); /* sqlite falls back to unfiltered ORDER BY created_at DESC when FTS query is empty */
  const matcher = buildMatcher(q);
  let matched = null; /* Map id -> hits (AND semantics: id must appear in every word's expansion) */
  for (const w of words) {
    let idx = null;
    try { idx = L.searchIndex(w[0]); } catch (e) { idx = null; } /* letter bucket with no postings -> no matches */
    const perWord = new Set();
    if (idx) {
      const keys = Object.keys(idx);
      const pre = w.toLowerCase();
      let start = 0;
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] >= pre) { start = i; break; }
        start = i + 1;
      }
      for (let i = start; i < keys.length && keys[i].startsWith(pre); i++) {
        for (const id of idx[keys[i]]) perWord.add(id);
      }
    }
    if (!matched) {
      matched = new Map();
      for (const id of perWord) matched.set(id, 1);
    } else {
      for (const id of [...matched.keys()]) if (!perWord.has(id)) matched.delete(id);
    }
  }
  const ids = matched ? [...matched.keys()] : [];
  const filtered = matcher ? ids.filter((id) => matcher.matches(id)) : ids;
  const total = filtered.length;
  filtered.sort((a, b) => (a < b ? -1 : 1)); /* deterministic (count-based) relevance order */
  const rows = filtered.slice(offset, offset + limit).length ? (await fetchRows(filtered.slice(offset, offset + limit))).rows : [];
  return { results: await prepare(rows), total, page, limit, pages: Math.ceil(total / limit) };
}

async function exportRows() {
  /* mirrors /api/export: active rows ordered subject_id, chapter_id, topic_id, id */
  const out = [];
  await exportStream((row) => { out.push(row); });
  return out;
}

/* Memory-bounded export: yields one clean row at a time (never materializes
   the full 872k-row array). Order = subject_id, chapter_id, topic_id, id. */
async function exportStream(onRow) {
  let count = 0;
  const cleanRow = (r) => {
    const clean = { ...r }; /* pristine copy: strip any attachment artifacts */
    for (const k of ["optionA", "optionB", "optionC", "optionD", "options", "relatedQuestions"]) delete clean[k];
    const c = chapterMap.get(r.chapter_id), t = topicMap.get(r.topic_id);
    clean.chapter_name = c ? c.name : null;
    clean.topic_name = t ? t.name : null;
    return clean;
  };
  for (const sub of (subjectNames || (subjectNames = Object.keys(L.manifest().sourceFiles))).sort()) {
    if (L.isCached(sub)) {
      const { rows: part } = await L.loadSubjectPart(sub);
      const active = part.filter((r) => r.status === "active");
      active.sort((a, b) =>
        (a.chapter_id || "") < (b.chapter_id || "") ? -1 : (a.chapter_id || "") > (b.chapter_id || "") ? 1 :
        (a.topic_id || "") < (b.topic_id || "") ? -1 : (a.topic_id || "") > (b.topic_id || "") ? 1 :
        (a.id < b.id ? -1 : 1));
      for (const r of active) { onRow(cleanRow(r)); count++; }
    } else {
      await L.streamSubject(sub, (row) => {
        if (row && row.status === "active") { onRow(cleanRow(row)); count++; }
      });
    }
  }
  return count;
}

module.exports = {
  init, sanitizeFts, paginate, health, stats, browse, getById, batchByIds,
  random, subjects, chapters, topics, categories, quizzes, mocktests, pastpapers,
  search, exportRows, exportStream, attachOptions, attachNames, attachRelated, fetchRows,
  reload,
  cacheStats: () => ({ lru: L.cacheStats(), meta: meta ? Object.keys(meta).length : 0, keyIdx: keyIdxCache.size })
};
