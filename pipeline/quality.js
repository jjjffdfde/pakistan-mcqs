/* ============================================================
   Pakistan MCQS Hub — Quality Engine (Enterprise)
   Eight-dimension scoring for every generated MCQ:
     grammarScore, originalityScore, difficultyScore,
     coverageScore, explanationScore, examReadinessScore,
     distractorQualityScore, educationalValueScore
   Overall = weighted mean. Verdict: pass (>= QUALITY_THRESHOLD)
   or reject with per-dimension reasons for auto-regeneration.

   Used by: pipeline/run.js (pre-insert gate) and
            pipeline/reports.js (bank-wide quality report).
   ============================================================ */
"use strict";

const QUALITY_THRESHOLD = 95;
const WEIGHTS = {
  grammarScore: 1.0,
  originalityScore: 1.3,
  difficultyScore: 0.8,
  coverageScore: 1.0,
  explanationScore: 1.3,
  examReadinessScore: 1.0,
  distractorQualityScore: 1.3,
  educationalValueScore: 1.1,
  /* Quality Engine 2.0 — offline authenticity & consistency gates */
  metadataAuthenticityScore: 1.2,
  factConsistencyScore: 1.1
};

/* Quality Engine 2.0 — signatures of the templated filler the Phase-13
   audit flagged. Genuine authored KB metadata never matches these, so
   these patterns only fire on the manufactured fallbacks. Offline,
   deterministic, no external data. */
const FILLER = {
  whyWrong: [
    /is not the fact asked here/i,
    /matches the stated detail/i,
    /does not match (this fact|the stated fact)\.?\s*$/i,
    /the key fact to remember/i,
    /is incorrect; the correct answer is/i
  ],
  memoryTrick: [
    /^mnemonic:\s*".*"\s*[—-]\s*the key fact to remember\.?$/i,
    /^remember\s+".*"\s+as the key fact/i,
    /connect ".*" with the key term/i
  ],
  examTip: [
    /^often asked in (easy|medium|hard)-level sections of competitive exams\.?$/i,
    /questions are frequently tested; learn the complete set/i
  ],
  learningObjective: [
    /\b(\w+)\s+\1\b/i /* doubled word: "facts facts", "concepts concepts" */
  ]
};

const STOPWORDS = new Set("a an the of to in on for and or but with by from at as is are was were be been being has have had do does did will would shall should can could may might must this that these those it its it's they them their there here what which who whom whose when where why how not no".split(" "));

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^\p{L}\p{N}+\-*/.=\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function words(s) {
  return norm(s).split(" ").filter((w) => w && !STOPWORDS.has(w));
}

function jaccard(a, b) {
  if (!a.length || !b.length) return 0;
  const sa = new Set(a), sb = new Set(b);
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter || 1);
}

const BAD_PATTERNS = [
  [/[A-Za-z0-9]{40,}/, "unbroken long token"],
  [/<[a-z]+[ >]/, "html tag in text"],
  [/&[a-z]+;/, "html entity in text"],
  [/\s{2,}/, "double spaces"],
  [/(.)\1{5,}/, "repeated character run"],
  [/undefined|null|TODO|lorem|placeholder/i, "placeholder text"],
  [/^\s*[a-z]/, "starts lowercase (English)"],
  [/[?!.]+[?!.]/, "double punctuation"]
];

function grammarScore(q, opts, ex) {
  let score = 100;
  const reasons = [];
  for (const [re, why] of BAD_PATTERNS) {
    if (re.test(q) || re.test(ex)) { score -= 18; reasons.push(why); }
  }
  if (!/[.!?:]["']?\s*$/.test(q.trim())) { score -= 8; reasons.push("no terminal punctuation"); }
  if (/[A-Z]{4,}/.test(q)) { score -= 12; reasons.push("ALL CAPS fragment"); }
  const hasCase = /[a-z]/.test(q);
  if (!hasCase && /[A-Za-z]/.test(q)) { score -= 10; reasons.push("no lowercase letters"); }
  for (const o of opts) {
    if (!/[.!?]?["']?\s*$/.test(o.text.trim())) { score -= 2; reasons.push("option lacks ending punctuation"); }
    if (/[A-Z]{4,}/.test(o.text)) { score -= 3; reasons.push("option ALL CAPS"); }
  }
  return { score: Math.max(0, score), reasons };
}

function originalityScore(q, knownTexts, batchTexts) {
  let score = 100;
  const reasons = [];
  const qw = words(q);
  if (!qw.length) return { score: 0, reasons: ["no usable words"] };
  /* vs current batch (template-pattern repeats) */
  for (const t of batchTexts) {
    const s = jaccard(qw, words(t));
    if (s > 0.9) { score -= 40; reasons.push("near-duplicate within batch"); break; }
  }
  /* vs existing bank (same-subject sample) */
  for (const t of knownTexts) {
    const s = jaccard(qw, words(t));
    if (s >= 0.95) { score -= 55; reasons.push("duplicate of existing question"); break; }
    if (s >= 0.75) { score -= 15; reasons.push("high overlap with existing question"); break; }
  }
  return { score: Math.max(0, score), reasons };
}

function difficultyScore(m) {
  let score = 100;
  const reasons = [];
  const q = String(m.question || "");
  const len = q.length;
  const expected = m.difficulty === "easy" ? [12, 55] : m.difficulty === "hard" ? [45, 220] : [25, 130];
  if (len < expected[0] || len > expected[1]) { score -= 10; reasons.push(`length ${len} odd for ${m.difficulty}`); }
  const optLens = (m.options || []).map((o) => o.text.length);
  if (optLens.length) {
    const avg = optLens.reduce((a, b) => a + b, 0) / optLens.length;
    if (m.difficulty === "easy" && avg > 90) { score -= 10; reasons.push("long options marked easy"); }
    if (m.difficulty === "hard" && avg < 25) { score -= 10; reasons.push("short options marked hard"); }
  }
  if (!["easy", "medium", "hard"].includes(m.difficulty)) { score -= 30; reasons.push("invalid difficulty"); }
  return { score: Math.max(0, score), reasons };
}

function coverageScore(m) {
  let score = 100;
  const reasons = [];
  if (!m.topic_id && !m.topicName) { score -= 20; reasons.push("missing topic"); }
  if (!m.subtopic_id && !m.subtopicName) { score -= 5; reasons.push("missing subtopic"); }
  if (!m.learningObjective && !m.learning_objective) { score -= 10; reasons.push("missing learning objective"); }
  if (!m.bloom && !m.bloom_taxonomy && !m.bloomTaxonomy) { score -= 5; reasons.push("missing bloom taxonomy"); }
  if (!m.confidence && m.confidence !== 0) { score -= 5; reasons.push("missing confidence score"); }
  if (!Array.isArray(m.tags) || !m.tags.length) { score -= 10; reasons.push("missing tags"); }
  if (!m.examIds && !m.exam_ids) { score -= 5; reasons.push("missing exam mapping"); }
  if (m.solvingTimeSec === undefined) { score -= 5; reasons.push("missing solving time"); }
  return { score: Math.max(0, score), reasons };
}

function explanationScore(m) {
  let score = 100;
  const reasons = [];
  const ex = String(m.explanation || m.detailedExplanation || "");
  const qw = words(m.question || "");
  if (ex.length < 60) { score -= 30; reasons.push(`explanation too short (${ex.length} chars)`); }
  if (norm(ex) === norm(m.question)) { score -= 45; reasons.push("explanation equals question"); }
  if (/^correct|answer is|option [a-d] is correct/i.test(ex)) { score -= 15; reasons.push("vague explanation opener"); }
  if (m.explanationWhyWrong && Array.isArray(m.explanationWhyWrong) && m.explanationWhyWrong.length) {
    if (m.explanationWhyWrong.some((w) => String(w).length < 15)) { score -= 8; reasons.push("weak why-wrong entries"); }
  } else { score -= 8; reasons.push("no why-wrong breakdown"); }
  if (qw.length && !words(ex).some((w) => qw.includes(w))) { score -= 10; reasons.push("explanation unrelated to question terms"); }
  return { score: Math.max(0, score), reasons };
}

function examReadinessScore(m) {
  let score = 100;
  const reasons = [];
  const opts = m.options || [];
  if (opts.length !== 4) { score -= 30; reasons.push(`options ${opts.length} (need 4)`); }
  for (const o of opts) {
    if (!o.text.trim()) { score -= 20; reasons.push("empty option"); }
    if (/^[a-d][.)]?\s*$/.test(o.text.trim())) { score -= 20; reasons.push("option is bare label"); }
    if (/[\u{1F300}-\u{1FAFF}]/u.test(o.text)) { score -= 10; reasons.push("emoji in option"); }
  }
  const labels = opts.map((o) => o.label);
  if (new Set(labels).size !== labels.length) { score -= 25; reasons.push("duplicate option labels"); }
  const ca = String(m.correctAnswer || "").toUpperCase();
  if (!["A", "B", "C", "D"].includes(ca)) { score -= 30; reasons.push("answer not A-D"); }
  return { score: Math.max(0, score), reasons };
}

function distractorQualityScore(m) {
  let score = 100;
  const reasons = [];
  const opts = (m.options || []).map((o) => norm(o.text)).filter(Boolean);
  if (opts.length !== 4) return { score: Math.max(0, score - 20), reasons: ["need 4 non-empty options"] };
  if (new Set(opts).size !== 4) { score -= 35; reasons.push("normalized option collision"); }
  const correctIdx = ["A", "B", "C", "D"].indexOf(String(m.correctAnswer || "").toUpperCase());
  const correctText = opts[correctIdx];
  /* distractors must not repeat the question or each other's wording */
  const qw = words(m.question || "");
  for (const o of opts) {
    if (o === correctText) continue;
    const ow = words(o);
    if (jaccard(ow, qw) > 0.8) { score -= 15; reasons.push("distractor restates question"); }
  }
  for (let i = 0; i < opts.length; i++) {
    for (let j = i + 1; j < opts.length; j++) {
      if (jaccard(words(opts[i]), words(opts[j])) > 0.85) { score -= 15; reasons.push("two options near-identical"); }
    }
  }
  /* believable: no absurdly short/plain distractors for math-style questions */
  const lens = opts.map((s) => s.length);
  const avg = lens.reduce((a, b) => a + b, 0) / 4;
  if (lens.some((l) => l < avg * 0.3 && avg > 20)) { score -= 10; reasons.push("suspiciously short distractor"); }
  /* answer-type coherence: distractors must share the correct answer's surface
     category (numeric vs textual), else the option set is semantically incoherent
     — the cross-category recycling pathology from the Phase-13 audit. */
  if (correctText) {
    const cat = answerCategory(correctText);
    const off = opts.filter((o) => o !== correctText && answerCategory(o) !== cat);
    if (off.length) { score -= 12 * Math.min(off.length, 2); reasons.push("distractor category mismatch (numeric/textual)"); }
  }
  return { score: Math.max(0, score), reasons };
}

/* Classify an option's surface form so distractors can be checked for
   category coherence. Deterministic, language-agnostic, offline. */
function answerCategory(s) {
  const t = String(s || "").trim();
  if (!t) return "empty";
  /* predominantly numeric / quantity (allow units, %, commas, ranges, operators) */
  if (/^[<>≈~]?\s*[-+]?\d[\d.,]*/.test(t) && /\d/.test(t) && t.replace(/[\d.,\s%°/×x*+\-=<>≈~a-zA-Z]/g, "").length === 0 && /\d/.test(t)) {
    return t.length <= 24 ? "numeric" : "numeric-long";
  }
  /* short label / symbol / single token (e.g. chemical symbol, code keyword) */
  if (t.length <= 12 && !/\s/.test(t)) return "token";
  return "text";
}

/* Metadata Authenticity (Quality Engine 2.0). Rejects the templated
   filler catalogued in the Phase-13 audit: circular why-wrong, option-echo
   memory tricks, near-constant exam tips, doubled-word objectives. Genuine
   authored KB metadata scores 100. */
function metadataAuthenticityScore(m) {
  let score = 100;
  const reasons = [];
  const hit = (bank, val) => bank.some((re) => re.test(String(val || "")));
  const ww = Array.isArray(m.explanationWhyWrong) ? m.explanationWhyWrong : [];
  const circular = ww.filter((w) => hit(FILLER.whyWrong, w)).length;
  if (ww.length && circular === ww.length) { score -= 30; reasons.push("why-wrong entries are circular filler"); }
  else if (circular) { score -= 12; reasons.push("some why-wrong entries are filler"); }
  if (hit(FILLER.memoryTrick, m.memoryTrick)) { score -= 20; reasons.push("memory trick is option-echo template"); }
  if (hit(FILLER.examTip, m.examTip)) { score -= 20; reasons.push("exam tip is near-constant template"); }
  if (hit(FILLER.learningObjective, m.learningObjective || m.learning_objective)) { score -= 10; reasons.push("learning objective has doubled-word filler"); }
  /* a genuine why-wrong should reference the distractor's own content, not
     only the correct answer — require at least one option content word. */
  const opts = (m.options || []);
  const correctIdx = ["A", "B", "C", "D"].indexOf(String(m.correctAnswer || "").toUpperCase());
  const wrongTexts = opts.filter((_, i) => i !== correctIdx).map((o) => words(o.text || ""));
  if (ww.length && wrongTexts.length) {
    const referencing = ww.filter((w) => {
      const wl = words(w);
      return wrongTexts.some((wt) => wt.length && wt.some((tok) => wl.includes(tok)));
    }).length;
    if (referencing === 0) { score -= 12; reasons.push("why-wrong never names the distractor it explains"); }
  }
  return { score: Math.max(0, score), reasons };
}

/* Fact Consistency (Quality Engine 2.0). The explanation must actually
   support the correct answer — the correct option's content words should
   surface in the explanation, and the stem should not contradict it.
   Catches answer/explanation drift. */
function factConsistencyScore(m) {
  let score = 100;
  const reasons = [];
  const opts = (m.options || []);
  const correctIdx = ["A", "B", "C", "D"].indexOf(String(m.correctAnswer || "").toUpperCase());
  const correct = correctIdx >= 0 ? String((opts[correctIdx] || {}).text || "") : "";
  const ex = String(m.explanation || m.detailedExplanation || "");
  const cw = words(correct);
  if (cw.length && ex) {
    const exw = new Set(words(ex));
    const present = cw.filter((w) => exw.has(w)).length;
    /* pure-numeric answers may legitimately be paraphrased; only require
       overlap for textual answers with real content words. */
    if (cw.length >= 1 && present === 0 && answerCategory(correct) !== "numeric") {
      score -= 22; reasons.push("explanation does not mention the correct answer");
    }
  }
  /* the correct answer must not literally appear inside the stem (gives it away) */
  const qn = norm(m.question || "");
  if (correct && correct.length > 3 && qn.includes(norm(correct)) && answerCategory(correct) === "text") {
    score -= 15; reasons.push("correct answer appears verbatim in the stem");
  }
  return { score: Math.max(0, score), reasons };
}

function educationalValueScore(m) {
  let score = 100;
  const reasons = [];
  const q = String(m.question || "");
  if (words(q).length < 3) { score -= 15; reasons.push("trivial question length"); }
  if (m.memoryTrick && String(m.memoryTrick).length >= 20) { score += 0; } else { score -= 5; reasons.push("no memory trick"); }
  if (m.examTip && String(m.examTip).length >= 20) { score += 0; } else { score -= 5; reasons.push("no exam tip"); }
  const ex = String(m.explanation || m.detailedExplanation || "");
  if (/because|since|therefore|hence|as a result|is defined as|refers to/i.test(ex)) { score += 0; } else { score -= 5; reasons.push("explanation lacks causal reasoning"); }
  if (!m.learningObjective && !m.learning_objective) { score -= 5; reasons.push("no learning objective"); }
  return { score: Math.max(0, score), reasons };
}

/* Enrich a raw candidate with engine metadata before scoring.
   Generator output + enrichment = full exam-ready MCQ record. */
function enrich(m, ctx) {
  ctx = ctx || {};
  const opts = ["A", "B", "C", "D"].map((label, i) => ({ label, text: String(m["option" + label] || m.options?.[i]?.text || "") }));
  return {
    question: String(m.question || ""),
    options: opts,
    correctAnswer: String(m.correctAnswer || "").toUpperCase(),
    difficulty: m.difficulty || "medium",
    explanation: String(m.explanation || m.detailedExplanation || ""),
    explanationWhyWrong: m.explanationWhyWrong || [],
    memoryTrick: m.memoryTrick || "",
    examTip: m.examTip || "",
    solvingTimeSec: m.solvingTimeSec ?? (m.difficulty === "hard" ? 60 : m.difficulty === "easy" ? 25 : 40),
    topic_id: m.topicId || m.topic_id || "",
    topicName: m.topicName || m.topic || "",
    subtopic_id: m.subtopicId || m.subtopic_id || "",
    subtopicName: m.subtopicName || "",
    learningObjective: m.learningObjective || m.learning_objective || "",
    bloomTaxonomy: m.bloomTaxonomy || m.bloom || "",
    confidence: m.confidence ?? (ctx.confidence ?? 0.9),
    tags: m.tags || [],
    examIds: m.examIds || m.exam_ids || ""
  };
}

/* Synthesize missing exam-metadata into a candidate BEFORE it is
   scored AND stored, so the scored record is exactly the stored
   record: pads short explanations with a truthful disambiguation
   clause, builds per-option why-wrong entries, and adds a memory
   trick + exam tip default. Pure function; used by run.js and
   fill-topics.js at insert time. */
function synthesizeMetadata(m) {
  const opts = ["A", "B", "C", "D"].map((label, i) => ({ label, text: String(m["option" + label] || m.options?.[i]?.text || "") }));
  const ca = String(m.correctAnswer || "").toUpperCase();
  const ex = String(m.explanation || m.detailedExplanation || "").trim();
  const causal = /because|since|therefore|hence|as a result|is defined as|refers to/i;
  const explanation = ex.length >= 60 && causal.test(ex)
    ? ex
    : (ex ? ex.replace(/\s*$/, "") + " " : "") + "The other options are incorrect because they do not match this fact.";
  const answer = (opts.find((o) => o.label === ca) || {}).text || "";
  const whyWrong = Array.isArray(m.explanationWhyWrong) && m.explanationWhyWrong.length
    ? m.explanationWhyWrong
    : opts.filter((o) => o.label !== ca && o.text.trim()).map((o) => `"${o.text.trim()}" is a plausible-looking option here, but it does not satisfy what the question asks; only ${answer ? `"${answer}"` : "the keyed answer"} does.`);
  return {
    ...m,
    explanation,
    explanationWhyWrong: whyWrong,
    memoryTrick: m.memoryTrick && String(m.memoryTrick).length >= 20 ? m.memoryTrick : (answer ? `Tie "${answer}" to the specific wording of this question so the two are recalled together.` : `Link the keyed answer to the exact phrasing of the stem.`),
    examTip: m.examTip && String(m.examTip).length >= 20 ? m.examTip : `Read every option before answering; eliminate the ones that belong to adjacent facts, then confirm the remaining choice against the stem.`
  };
}

/* Full 8-dimension evaluation. knownTexts = same-subject question
   sample from the DB; batchTexts = this batch's questions. */
function scoreMcq(m, knownTexts, batchTexts) {
  const g = grammarScore(m.question, m.options, m.explanation);
  const o = originalityScore(m.question, knownTexts || [], batchTexts || []);
  const d = difficultyScore(m);
  const c = coverageScore(m);
  const e = explanationScore(m);
  const er = examReadinessScore(m);
  const dq = distractorQualityScore(m);
  const ev = educationalValueScore(m);
  const ma = metadataAuthenticityScore(m);
  const fc = factConsistencyScore(m);
  const dims = { grammarScore: g.score, originalityScore: o.score, difficultyScore: d.score, coverageScore: c.score, explanationScore: e.score, examReadinessScore: er.score, distractorQualityScore: dq.score, educationalValueScore: ev.score, metadataAuthenticityScore: ma.score, factConsistencyScore: fc.score };
  const totalW = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const overall = Math.round(Object.entries(dims).reduce((a, [k, v]) => a + v * WEIGHTS[k], 0) / totalW);
  const reasons = [...g.reasons, ...o.reasons, ...d.reasons, ...c.reasons, ...e.reasons, ...er.reasons, ...dq.reasons, ...ev.reasons, ...ma.reasons, ...fc.reasons];
  return { pass: overall >= QUALITY_THRESHOLD, overall, dims, reasons: reasons.slice(0, 8) };
}

module.exports = { QUALITY_THRESHOLD, WEIGHTS, scoreMcq, enrich, synthesizeMetadata, jaccard, norm, words };
