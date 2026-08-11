/* ============================================================
   Phase 14 — Knowledge Graph engine: shared utilities
   ============================================================ */
"use strict";

const slugify = (s) => String(s || "")
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, " ")
  .trim()
  .replace(/\s+/g, "-")
  .slice(0, 120);

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

const SENT_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9"'(])/;

function sentences(text, minWords = 8, maxLen = 160) {
  const out = [];
  for (const raw of String(text || "").split(SENT_SPLIT)) {
    const s = clean(raw);
    const wc = s.split(/\s+/).length;
    if (wc >= minWords && s.length <= maxLen && wc <= 28) out.push(s);
    if (out.length >= 12) break;
  }
  return out;
}

function parseTags(json) {
  try {
    const t = JSON.parse(json || "[]");
    return Array.isArray(t) ? t.map((x) => String(x).trim()).filter(Boolean) : [];
  } catch (e) { return []; }
}

function parseExamIds(str) {
  const out = [];
  for (const e of String(str || "").split(",")) {
    const s = e.trim();
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

function majority(arr, fallback = "") {
  if (!arr.length) return fallback;
  const m = new Map();
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
  let best = fallback, bestN = 0;
  for (const [k, n] of m) if (n > bestN) { bestN = n; best = k; }
  return best;
}

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

module.exports = { slugify, clean, sentences, parseTags, parseExamIds, majority, norm };
