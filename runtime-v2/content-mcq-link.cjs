/* runtime-v2/content-mcq-link.cjs — link content blocks to related MCQs */
"use strict";
const fs = require("fs");
const path = require("path");

/* local tokenize (copied from content-query.cjs) */
function tokenize(text) {
  const out = new Set();
  if (!text) return [];
  for (const m of String(text).toLowerCase().matchAll(/[\p{L}\p{N}]+/gu)) {
    if (m[0].length >= 3) out.add(m[0]);
  }
  return [...out];
}

let _mcqs = null;
let _mcqsBySubject = null;
let _mcqTokens = null; /* id -> Set(tokens) */

function loadMcqs() {
  if (_mcqs) return _mcqs;
  const f = path.join(__dirname, "..", "data", "mcqs.json");
  if (!fs.existsSync(f)) return [];
  _mcqs = JSON.parse(fs.readFileSync(f, "utf8"));
  /* build subject index */
  _mcqsBySubject = {};
  for (const m of _mcqs) {
    if (!_mcqsBySubject[m.subject]) _mcqsBySubject[m.subject] = [];
    _mcqsBySubject[m.subject].push(m);
  }
  /* build token index for keyword matching */
  _mcqTokens = {};
  for (const m of _mcqs) {
    const text = (m.question || "") + " " + (m.detailedExplanation || "") + " " + (m.tags || []).join(" ");
    _mcqTokens[m.id] = new Set(tokenize(text));
  }
  return _mcqs;
}

function getMcqsBySubject(subject) {
  loadMcqs();
  return _mcqsBySubject[subject] || [];
}

function getAllMcqs() {
  loadMcqs();
  return _mcqs;
}

/* score MCQ relevance to content block */
function scoreMcq(content, mcq) {
  let score = 0;
  const contentSubject = content._subject || content.subject || "";
  const mcqSubject = mcq.subject || "";

  /* 1. Subject match (strongest signal) */
  if (contentSubject && contentSubject === mcqSubject) score += 10;

  /* 2. Keyword overlap */
  const contentTokens = new Set(tokenize(content.text || ""));
  const mcqTokenSet = _mcqTokens[mcq.id] || new Set();
  let overlap = 0;
  for (const t of contentTokens) if (mcqTokenSet.has(t)) overlap++;
  score += overlap * 2;

  /* 3. Content type bonus: definitions match definition-type MCQs */
  if (content.content_type === "DEFINITION" && /defined|definition|refers to|is called/.test(mcq.question.toLowerCase())) {
    score += 3;
  }

  /* 4. Length heuristic: prefer MCQs with substantial explanations */
  const explLen = (mcq.detailedExplanation || "").length;
  if (explLen > 200) score += 1;

  return score;
}

/* find top N related MCQs for a content block */
function findRelatedMcqs(contentId, limit = 10) {
  const CQ = require("./content-query.cjs");
  const content = CQ.getById(contentId);
  if (!content) return [];

  const contentSubject = content._subject || content.subject || "";
  const candidates = contentSubject
    ? getMcqsBySubject(contentSubject)
    : getAllMcqs();

  const scored = candidates.map(m => ({ mcq: m, score: scoreMcq(content, m) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.mcq);

  return scored;
}

/* map to frontend format */
function mapMcqForFrontend(m) {
  return {
    id: m.id,
    question: m.question,
    optionA: m.optionA,
    optionB: m.optionB,
    optionC: m.optionC,
    optionD: m.optionD,
    correctAnswer: m.correctAnswer,
    detailedExplanation: m.detailedExplanation || "",
    difficulty: m.difficulty || "medium",
    subject: m.subject,
    chapter: m.chapter || "",
    topic: m.topic || "",
    year: m.year || null,
    tags: m.tags || [],
    source: m.source || "static"
  };
}

function findRelatedMcqsMapped(contentId, limit = 10) {
  return findRelatedMcqs(contentId, limit).map(mapMcqForFrontend);
}

module.exports = { findRelatedMcqs, findRelatedMcqsMapped, getMcqsBySubject, getAllMcqs, loadMcqs };