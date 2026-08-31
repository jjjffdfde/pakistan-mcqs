/* runtime-v2/content-query.cjs — source-content search and retrieval engine */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let INDEX_DIR = null;
let _byId = null, _bySubject = null, _byType = null, _bySource = null, _termBuckets = null;
let _manifest = null;

/* ---------- lazy init ---------- */

function getIdxDir() {
  if (!INDEX_DIR) {
    const ROOT = path.join(__dirname, "..");
    INDEX_DIR = path.join(ROOT, "runtime-v2", "indexes", "content");
  }
  return INDEX_DIR;
}

function readJson(rel) {
  const f = path.join(getIdxDir(), rel);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8"));
}

function ensureLoaded() {
  if (!_byId) {
    _byId = readJson("content_by_id.json") || {};
    _bySubject = readJson("content_by_subject.json") || {};
    _byType = readJson("content_by_type.json") || {};
    _bySource = readJson("content_by_source.json") || {};
    _termBuckets = {};
    _manifest = readJson("manifest.json") || { total_records: Object.keys(_byId).length };
  }
}

function ensureTermBucket(letter) {
  if (!_termBuckets[letter]) {
    const data = readJson(path.join("term", letter + ".json"));
    _termBuckets[letter] = data || {};
  }
  return _termBuckets[letter];
}

/* ---------- public API ---------- */

function stats() {
  ensureLoaded();
  return {
    records: _manifest.total_records || Object.keys(_byId).length,
    subjects: Object.keys(_bySubject).length,
    types: Object.keys(_byType),
    sources: Object.keys(_bySource).length
  };
}

function getById(id) {
  ensureLoaded();
  return _byId[id] || null;
}

function getBySubject(subject, page = 1, limit = 20) {
  ensureLoaded();
  const ids = _bySubject[subject] || [];
  const offset = (page - 1) * limit;
  const slice = ids.slice(offset, offset + limit);
  return {
    results: slice.map((id) => _byId[id]).filter(Boolean),
    total: ids.length, page, limit,
    pages: Math.ceil(ids.length / limit)
  };
}

function getByType(contentType, page = 1, limit = 20) {
  ensureLoaded();
  const ids = _byType[contentType] || [];
  const offset = (page - 1) * limit;
  const slice = ids.slice(offset, offset + limit);
  return {
    results: slice.map((id) => _byId[id]).filter(Boolean),
    total: ids.length, page, limit,
    pages: Math.ceil(ids.length / limit)
  };
}

function listSubjects() {
  ensureLoaded();
  return Object.entries(_bySubject)
    .map(([subj, ids]) => ({ subject: subj, count: ids.length }))
    .sort((a, b) => b.count - a.count);
}

function listTypes() {
  ensureLoaded();
  return Object.entries(_byType)
    .map(([type, ids]) => ({ type, count: ids.length }))
    .sort((a, b) => b.count - a.count);
}

/* ---------- search ---------- */

/* tokenizer matching the index builder */
function tokenize(text) {
  const out = new Set();
  if (!text) return [];
  for (const m of String(text).toLowerCase().matchAll(/[\p{L}\p{N}]+/gu)) {
    if (m[0].length >= 3) out.add(m[0]);
  }
  return [...out];
}

function bucketOf(term) {
  const c = term.codePointAt(0);
  if (c >= 0x61 && c <= 0x7a) return String.fromCharCode(c);
  if (c >= 0x30 && c <= 0x39) return "0";
  return "other";
}

function search(q, filters = {}) {
  ensureLoaded();
  const query = String(q || "").trim();
  if (!query) return { results: [], total: 0, page: 1, limit: 20, pages: 0 };

  const tokens = tokenize(query);
  if (!tokens.length) return { results: [], total: 0, page: 1, limit: 20, pages: 0 };

  /* AND-intersect: for each token, load its bucket and find matching terms by prefix */
  let matchedIds = null;

  for (const token of tokens) {
    const bucket = bucketOf(token);
    const terms = ensureTermBucket(bucket);
    if (!terms || !Object.keys(terms).length) return { results: [], total: 0, page: 1, limit: 20, pages: 0 };

    /* find all terms starting with this token */
    const matchingTermKeys = Object.keys(terms).filter((t) => t.startsWith(token));
    if (!matchingTermKeys.length) return { results: [], total: 0, page: 1, limit: 20, pages: 0 };

    /* collect IDs */
    const ids = new Set();
    for (const k of matchingTermKeys) for (const id of terms[k]) ids.add(id);

    if (matchedIds === null) {
      matchedIds = ids;
    } else {
      /* AND intersection */
      for (const id of matchedIds) if (!ids.has(id)) matchedIds.delete(id);
    }
    if (matchedIds.size === 0) break;
  }

  if (!matchedIds || !matchedIds.size) return { results: [], total: 0, page: 1, limit: 20, pages: 0 };

  /* apply filters */
  let filtered = [...matchedIds];

  if (filters.subject && _bySubject[filters.subject]) {
    const subjSet = new Set(_bySubject[filters.subject]);
    filtered = filtered.filter((id) => subjSet.has(id));
  }
  if (filters.content_type && _byType[filters.content_type]) {
    const typeSet = new Set(_byType[filters.content_type]);
    filtered = filtered.filter((id) => typeSet.has(id));
  }
  if (filters.source && _bySource[filters.source]) {
    const srcSet = new Set(_bySource[filters.source]);
    filtered = filtered.filter((id) => srcSet.has(id));
  }

  /* sort: by relevance (more token matches first), then by id */
  const scored = filtered.map((id) => {
    const rec = _byId[id];
    let score = 0;
    for (const t of tokens) {
      if ((rec.text || "").toLowerCase().includes(t)) score++;
      if ((rec.content_type || "").toLowerCase().includes(t)) score += 2;
    }
    return { id, score };
  });
  scored.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));

  /* paginate */
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;
  const slice = scored.slice(offset, offset + limit);

  return {
    results: slice.map((s) => _byId[s.id]).filter(Boolean),
    total: filtered.length,
    page, limit,
    pages: Math.ceil(filtered.length / limit)
  };
}

/* ---------- cache management ---------- */

function clearCache() {
  _byId = null; _bySubject = null; _byType = null; _bySource = null; _termBuckets = {}; _manifest = null;
}

module.exports = {
  stats, getById, getBySubject, getByType, search, listSubjects, listTypes, clearCache
};