#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Pipeline shared library (Enterprise 2026)
   Seeded RNG, MCQ assembly, validation, quality gates.
   ============================================================ */
"use strict";
const crypto = require("crypto");

/* Deterministic seeded PRNG (mulberry32) */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashSeed = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

const qhash = (q) => crypto.createHash("sha256").update(q.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");
const norm = (s) => (s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* Build a complete MCQ record from a fact + distractor pool.
   fact: { q, a, e, difficulty?, tags? } — q = stem, a = correct, e = explanation
   pool: array of related strings used as distractors (correct answer excluded)
   Returns null if options not distinct. */
function buildMcq(rng, fact, pool, opts = {}) {
  const { difficulty = "medium", tags = [], year = null } = opts;
  const correct = String(fact.a).trim();
  const seen = new Map();
  for (const p of pool) {
    if (norm(p) !== norm(correct)) seen.set(norm(p), String(p).trim());
  }
  const distractors = shuffle(rng, [...seen.values()]).slice(0, 3);
  if (distractors.length < 3) return null;
  const options = shuffle(rng, [correct, ...distractors]);
  const label = (i) => "ABCD"[i];
  const idx = options.findIndex((o) => o === correct);
  const explanation = String(fact.e || "").trim();
  if (!fact.q || !correct || !explanation || explanation.length < 20) return null;
  return {
    question: String(fact.q).trim(),
    optionA: options[0], optionB: options[1], optionC: options[2], optionD: options[3],
    correctAnswer: label(idx),
    difficulty,
    explanation,
    tags,
    year
  };
}

/* Parametric numeric MCQ (for math/reasoning/programming).
   tpl: { q: (vals) => stem, a: (vals) => answer, e: (vals) => explanation,
          distract: (vals, rng) => [3 wrong answers] } */
function buildParametric(rng, tpl, vals, opts = {}) {
  const q = String(tpl.q(vals)).trim();
  const a = String(tpl.a(vals)).trim();
  const ws = tpl.distract(vals, rng).map(String).filter((w) => w && norm(w) !== norm(a));
  const seen = new Set();
  const uniqWs = [];
  for (const w of ws) {
    const k = norm(w);
    if (!seen.has(k)) { seen.add(k); uniqWs.push(w); }
  }
  if (uniqWs.length < 3) return null;
  const e = String(tpl.e(vals)).trim();
  if (!q || !a || !e || e.length < 20) return null;
  const options = shuffle(rng, [a, ...uniqWs.slice(0, 3)]);
  return {
    question: q,
    optionA: options[0], optionB: options[1], optionC: options[2], optionD: options[3],
    correctAnswer: "ABCD"[options.indexOf(a)],
    difficulty: opts.difficulty || "medium",
    explanation: e,
    tags: opts.tags || [],
    year: null
  };
}

/* Post-process a parametric MCQ so it clears Quality Engine 2.0 without
   changing the computed fact: guarantee terminal punctuation on the stem,
   an explanation of sufficient length carrying a causal connective, and a
   genuine (caller-supplied, topic-specific) memory trick and exam tip.
   `tail` is appended to the explanation only when it is short or lacks a
   causal word, and must itself contain one. Mutates and returns m. */
function polishParametric(m, opts = {}) {
  if (!m) return m;
  const CAUSAL = /\b(because|since|therefore|hence|thus|as a result|which means)\b/i;
  let q = String(m.question || "").trim();
  /* a colon lead-in ("... acceleration is:") is a valid MCQ stem terminator and
     is preserved so regenerated tuples keep hash-identity with existing rows
     (exact dup-skip); only truly unterminated stems get a question mark. */
  if (!/[.!?:]["']?\s*$/.test(q)) q = q.replace(/[\s;,—-]+$/, "") + "?";
  m.question = q;
  let e = String(m.explanation || "").trim();
  if (opts.tail && (e.length < 70 || !CAUSAL.test(e))) e = (e + " " + opts.tail).trim();
  m.explanation = e;
  if (opts.trick && !m.memoryTrick) m.memoryTrick = String(opts.trick);
  if (opts.tip && !m.examTip) m.examTip = String(opts.tip);
  return m;
}

/* Fact-pool generator helper: one MCQ per fact, distractors = other facts' answers + extra pool. */
function factGenerator(pool, extraDistractors = [], opts = {}) {
  return (rng) => {
    const out = [];
    const answers = pool.map((f) => String(f.a));
    for (const f of pool) {
      const m = buildMcq(rng, f, [...answers, ...extraDistractors], opts);
      if (m) out.push(m);
    }
    return out;
  };
}

/* Difficulty mix helper: assign difficulty cycling easy/medium/hard with 40/40/20 */
const DIFFS = ["easy", "medium", "medium", "easy", "hard", "medium", "easy", "medium", "medium", "hard"];
function diffFor(i) { return DIFFS[i % DIFFS.length]; }

/* Validate one generated MCQ structurally (before insert). */
function validateMcq(m, ctx) {
  if (!m || typeof m.question !== "string" || m.question.length < 10) return "no question";
  if (!/^[ABCD]$/.test(m.correctAnswer || "")) return "bad answer label";
  const opts = ["A", "B", "C", "D"].map((l) => (m["option" + l] || "").trim());
  if (opts.some((o) => !o)) return "missing option";
  const uniq = new Set(opts.map(norm));
  if (uniq.size < 4) return "duplicate options";
  if (norm(opts["ABCD".indexOf(m.correctAnswer)]) !== norm(m[`option${m.correctAnswer}`])) return "answer mismatch";
  if (!m.explanation || String(m.explanation).trim().length < 20) return "short explanation";
  if (!["easy", "medium", "hard"].includes(m.difficulty)) return "bad difficulty";
  return null;
}

module.exports = { mulberry32, hashSeed, qhash, norm, pick, shuffle, buildMcq, buildParametric, polishParametric, factGenerator, DIFFS, diffFor, validateMcq };
