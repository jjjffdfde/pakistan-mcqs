const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MCQS_DIR = path.join(DATA_DIR, "mcqs");
const OUT_FILE = path.join(DATA_DIR, "mcqs.json");

const errors = [];
let total = 0;
const seenIds = new Set();
const seenSubjects = new Set();

const files = fs.readdirSync(MCQS_DIR).filter((f) => f.endsWith(".json")).sort();

function checkSchema(q, file) {
  const required = ["id", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "detailedExplanation", "difficulty", "subject", "chapter", "topic"];
  for (const key of required) {
    if (!(key in q)) errors.push(`${file}: ${q.id || "?"} missing "${key}"`);
  }
  if (q.correctAnswer && !["A", "B", "C", "D"].includes(q.correctAnswer)) {
    errors.push(`${file}: ${q.id} invalid correctAnswer "${q.correctAnswer}"`);
  }
  if (q.difficulty && !["easy", "medium", "hard"].includes(q.difficulty)) {
    errors.push(`${file}: ${q.id} invalid difficulty "${q.difficulty}"`);
  }
  if (q.subtopic !== undefined && typeof q.subtopic !== "string") {
    errors.push(`${file}: ${q.id} subtopic must be a string`);
  }
  if (q.references !== undefined && !Array.isArray(q.references)) {
    errors.push(`${file}: ${q.id} references must be an array`);
  }
  if (q.relatedQuestions !== undefined && !Array.isArray(q.relatedQuestions)) {
    errors.push(`${file}: ${q.id} relatedQuestions must be an array`);
  }
}

const all = [];
for (const file of files) {
  let arr;
  try {
    arr = JSON.parse(fs.readFileSync(path.join(MCQS_DIR, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: JSON parse error - ${e.message}`);
    continue;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${file}: not an array`);
    continue;
  }
  for (const q of arr) {
    if (seenIds.has(q.id)) errors.push(`duplicate id: ${q.id}`);
    seenIds.add(q.id);
    if (q.subject) seenSubjects.add(q.subject);
    checkSchema(q, file);
    all.push(q);
  }
  total += arr.length;
  console.log(`${file}: ${arr.length} MCQs`);
}

console.log(`\nTOTAL: ${total} MCQs across ${files.length} files`);
console.log(`Subjects covered: ${[...seenSubjects].sort().join(", ")}`);

const subjects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "subjects.json"), "utf8"));
const chapters = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "chapters.json"), "utf8"));
const topics = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "topics.json"), "utf8"));

const subjectIds = new Set(subjects.map((s) => s.id));
const chapterIds = new Set(chapters.map((c) => c.id));
const topicIds = new Set(topics.map((t) => t.id));
const chapterBySubject = new Map();
chapters.forEach((c) => {
  if (!chapterBySubject.has(c.subject)) chapterBySubject.set(c.subject, []);
  chapterBySubject.get(c.subject).push(c.id);
});
const topicByChapter = new Map();
topics.forEach((t) => {
  if (!topicByChapter.has(t.chapter)) topicByChapter.set(t.chapter, []);
  topicByChapter.get(t.chapter).push(t.id);
});

for (const q of all) {
  if (!subjectIds.has(q.subject)) errors.push(`${q.id}: unknown subject "${q.subject}"`);
  if (!chapterIds.has(q.chapter)) errors.push(`${q.id}: unknown chapter "${q.chapter}"`);
  if (!topicIds.has(q.topic)) errors.push(`${q.id}: unknown topic "${q.topic}"`);
  if (q.chapter && q.subject && chapterBySubject.get(q.subject) && !chapterBySubject.get(q.subject).includes(q.chapter)) {
    errors.push(`${q.id}: chapter "${q.chapter}" does not belong to subject "${q.subject}"`);
  }
  if (q.topic && q.chapter && topicByChapter.get(q.chapter) && !topicByChapter.get(q.chapter).includes(q.topic)) {
    errors.push(`${q.id}: topic "${q.topic}" does not belong to chapter "${q.chapter}"`);
  }
}

/* enrich: ensure new schema fields on every MCQ */
for (const q of all) {
  if (q.subtopic === undefined) q.subtopic = "";
  if (q.references === undefined) q.references = [];
  if (q.relatedQuestions === undefined) q.relatedQuestions = [];
}

/* auto-compute relatedQuestions: same chapter or >=2 shared tags, top 5 */
const byChapter = new Map();
for (const q of all) {
  if (!byChapter.has(q.chapter)) byChapter.set(q.chapter, []);
  byChapter.get(q.chapter).push(q);
}
const tagMap = new Map();
for (const q of all) {
  const t = (q.tags || []).map((x) => x.toLowerCase());
  tagMap.set(q.id, t);
}
for (const q of all) {
  const myTags = tagMap.get(q.id);
  const scored = [];
  for (const other of byChapter.get(q.chapter) || []) {
    if (other.id === q.id) continue;
    const overlap = myTags.filter((t) => t && tagMap.get(other.id).includes(t)).length;
    if (overlap >= 2) scored.push([other.id, overlap]);
  }
  scored.sort((a, b) => b[1] - a[1]);
  q.relatedQuestions = scored.slice(0, 5).map(([id]) => id);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 1), "utf8");
console.log(`\nWrote master file: ${OUT_FILE} (${all.length} MCQs)`);

if (errors.length) {
  console.error(`\nVALIDATION ERRORS (${errors.length}):`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log("\nAll validation checks passed.");
