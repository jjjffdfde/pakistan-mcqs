/* ============================================================
   Pakistan MCQS Hub — Reference Mapper (Phase 13, offline)

   Deterministic, offline mapping from a subject (+ its category,
   tags and exam mappings) to a curated list of genuine study
   references: national textbook boards, standard university texts
   and the exam-prep publishers used across Pakistan. No network,
   no external API — a static curated table plus rule-based fallbacks.

   Output shape (stored as mcqs.references_json):
     [ { title, type }, ... ]   type ∈ book | board | exam | topic
   ============================================================ */
"use strict";

/* Board / national-curriculum anchors reused by school-level subjects. */
const FBISE = { title: "FBISE / Provincial Textbook Board syllabus", type: "board" };
const HEC = { title: "HEC-recommended undergraduate curriculum", type: "board" };

/* Per-subject curated references. Keys are subject ids (slugs). Each entry
   is real and specific enough to be useful for verification and further study. */
const SUBJECT_REFS = {
  chemistry: [{ title: "FBISE Chemistry (Classes IX–XII)", type: "book" }, { title: "Atkins' Physical Chemistry / Zumdahl, Chemistry", type: "book" }, FBISE],
  physics: [{ title: "FBISE Physics (Classes IX–XII)", type: "book" }, { title: "Halliday, Resnick & Walker, Fundamentals of Physics", type: "book" }, FBISE],
  biology: [{ title: "FBISE Biology (Classes IX–XII)", type: "book" }, { title: "Campbell Biology", type: "book" }, FBISE],
  botany: [{ title: "Pandey, A Textbook of Botany", type: "book" }, HEC],
  zoology: [{ title: "Miller & Harley, Zoology", type: "book" }, HEC],
  mathematics: [{ title: "FBISE Mathematics (Classes IX–XII)", type: "book" }, { title: "NCERT / Punjab Textbook Board Mathematics", type: "book" }, FBISE],
  statistics: [{ title: "Sher Muhammad Chaudhry, Introduction to Statistical Theory", type: "book" }, HEC],
  "pakistan-studies": [{ title: "Ikram Rabbani, Pakistan Studies", type: "book" }, { title: "Punjab Textbook Board Pakistan Studies", type: "book" }],
  "pakistan-affairs": [{ title: "Ikram Rabbani, Pakistan Affairs", type: "book" }, { title: "Caravan Pakistan Affairs", type: "book" }],
  "islamic-studies": [{ title: "Punjab Textbook Board Islamiat", type: "book" }, { title: "Emporium Islamiat for Competitive Exams", type: "book" }],
  islamic: [{ title: "Punjab Textbook Board Islamiat", type: "book" }, { title: "Emporium Islamiat for Competitive Exams", type: "book" }],
  english: [{ title: "Wren & Martin, High School English Grammar & Composition", type: "book" }, { title: "Oxford Advanced Learner's Dictionary", type: "book" }],
  "english-grammar": [{ title: "Wren & Martin, High School English Grammar & Composition", type: "book" }, { title: "Raymond Murphy, English Grammar in Use", type: "book" }],
  "general-knowledge": [{ title: "Caravan General Knowledge", type: "book" }, { title: "Dogar's Up-to-Date General Knowledge", type: "book" }],
  "current-affairs": [{ title: "JWT Current Affairs", type: "book" }, { title: "Jahangir's World Times monthly", type: "book" }],
  "computer-science": [{ title: "FBISE Computer Science", type: "book" }, { title: "Forouzan, Foundations of Computer Science", type: "book" }, FBISE],
  computer: [{ title: "FBISE Computer Science", type: "book" }, { title: "Forouzan, Foundations of Computer Science", type: "book" }],
  programming: [{ title: "Kernighan & Ritchie / language official documentation", type: "book" }, HEC],
  networking: [{ title: "Tanenbaum, Computer Networks", type: "book" }, { title: "Forouzan, Data Communications and Networking", type: "book" }],
  "computer-networks": [{ title: "Tanenbaum, Computer Networks", type: "book" }, { title: "Forouzan, Data Communications and Networking", type: "book" }],
  security: [{ title: "Stallings, Cryptography and Network Security", type: "book" }, { title: "OWASP / NIST security guidance", type: "book" }],
  "cyber-security": [{ title: "Stallings, Cryptography and Network Security", type: "book" }, { title: "OWASP / NIST security guidance", type: "book" }],
  economics: [{ title: "Samuelson & Nordhaus, Economics", type: "book" }, HEC],
  accounting: [{ title: "Meigs & Meigs, Accounting", type: "book" }, HEC],
  finance: [{ title: "Brealey & Myers, Principles of Corporate Finance", type: "book" }, HEC],
  geography: [{ title: "Punjab Textbook Board Geography", type: "book" }, { title: "Goh Cheng Leong, Physical Geography", type: "book" }],
  history: [{ title: "Caravan History of Pakistan & India", type: "book" }, HEC],
  "everyday-science": [{ title: "Caravan Everyday Science", type: "book" }, { title: "Akram's Everyday Science for Competitive Exams", type: "book" }],
  "general-science": [{ title: "Caravan Everyday Science", type: "book" }, FBISE],
  law: [{ title: "Pakistan Penal Code & Constitution of Pakistan (1973)", type: "book" }, HEC],
  constitution: [{ title: "Constitution of Pakistan (1973), as amended", type: "book" }, { title: "Hamid Khan, Constitutional and Political History of Pakistan", type: "book" }],
  "international-relations": [{ title: "Goldstein & Pevehouse, International Relations", type: "book" }, HEC],
  sociology: [{ title: "Horton & Hunt, Sociology", type: "book" }, HEC],
  psychology: [{ title: "Morgan & King, Introduction to Psychology", type: "book" }, HEC],
  "political-science": [{ title: "Andrew Heywood, Politics", type: "book" }, HEC]
};

/* Category-level fallback when a subject has no curated entry. */
const CATEGORY_REFS = {
  "computer-science": [{ title: "HEC Computer Science curriculum & official language docs", type: "board" }],
  "natural-sciences": [FBISE, HEC],
  "social-sciences": [HEC],
  "medical-sciences": [{ title: "Standard MBBS/BDS curriculum texts (Guyton, Robbins, Gray's Anatomy)", type: "book" }, HEC],
  engineering: [{ title: "HEC Engineering curriculum (PEC-accredited texts)", type: "board" }, HEC],
  "business-management": [HEC],
  "exam-preparation": [{ title: "Caravan / Dogar / JWT exam-prep series", type: "book" }],
  languages: [{ title: "Standard grammar and usage references", type: "book" }],
  "islamic-studies": [{ title: "Punjab Textbook Board Islamiat", type: "book" }]
};

/* Well-known exam-prep anchors keyed by exam id (from mcqs.exam_ids). */
const EXAM_REFS = {
  css: { title: "FPSC CSS syllabus & past papers (Caravan/JWT)", type: "exam" },
  pms: { title: "PPSC PMS syllabus & past papers", type: "exam" },
  ppsc: { title: "PPSC MCQ past papers (Dogar/Caravan)", type: "exam" },
  fpsc: { title: "FPSC MCQ past papers (Caravan)", type: "exam" },
  nts: { title: "NTS National Aptitude Test guide (Dogar/AEO)", type: "exam" },
  mdcat: { title: "PMDC/PMC MDCAT syllabus (UHS/NMDCAT)", type: "exam" },
  ecat: { title: "UET ECAT syllabus & past papers", type: "exam" },
  ib: { title: "IB / intelligence recruitment test guides", type: "exam" }
};

const norm = (s) => String(s || "").toLowerCase().trim();

/* Build a deterministic references list for one MCQ.
   subjectId — subject slug; categoryId — its category slug (optional);
   examIds — comma-joined exam slugs (optional); topicName — for a
   topic-level anchor. Returns 2–4 curated references, deduped. */
function referencesFor(subjectId, categoryId, examIds, topicName) {
  const out = [];
  const sid = norm(subjectId);
  if (SUBJECT_REFS[sid]) out.push(...SUBJECT_REFS[sid]);
  else if (categoryId && CATEGORY_REFS[norm(categoryId)]) out.push(...CATEGORY_REFS[norm(categoryId)]);

  /* first recognised exam anchor */
  const exams = String(examIds || "").split(",").map(norm).filter(Boolean);
  for (const e of exams) { if (EXAM_REFS[e]) { out.push(EXAM_REFS[e]); break; } }

  /* topic-level anchor so every row has a specific study pointer */
  if (topicName) out.push({ title: `Study focus: ${String(topicName).trim()}`, type: "topic" });

  /* absolute fallback: never emit an empty reference set */
  if (!out.length) out.push({ title: "Standard national curriculum and competitive-exam guides", type: "book" });

  /* dedupe by title, cap at 4 */
  const seen = new Set();
  const deduped = [];
  for (const r of out) {
    const k = norm(r.title);
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(r);
    if (deduped.length >= 4) break;
  }
  return deduped;
}

module.exports = { referencesFor, SUBJECT_REFS, CATEGORY_REFS, EXAM_REFS };
