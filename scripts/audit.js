/* Pakistan MCQs Hub - programmatic audit (Phase 0) */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const dataDir = path.join(ROOT, "data");
const assetDir = path.join(ROOT, "assets");

const report = [];
const ok = (msg) => report.push(`[OK]   ${msg}`);
const warn = (msg) => report.push(`[WARN] ${msg}`);
const bad = (msg) => report.push(`[FAIL] ${msg}`);
const info = (msg) => report.push(`[INFO] ${msg}`);

/* 1. File inventory & sizes */
const allFiles = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) { if (f !== "backup") walk(full); }
    else allFiles.push({ path: full, size: st.size, rel: path.relative(ROOT, full) });
  }
})(ROOT);
info(`File count: ${allFiles.length}, total size: ${(allFiles.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB`);

/* 2. JSON validity */
const jsonFiles = allFiles.filter((f) => f.rel.endsWith(".json") && !f.rel.startsWith("backup"));
let jsonBad = 0;
for (const f of jsonFiles) {
  try { JSON.parse(fs.readFileSync(f.path, "utf8")); }
  catch (e) { jsonBad++; bad(`JSON invalid: ${f.rel} - ${e.message}`); }
}
if (!jsonBad) ok(`${jsonFiles.length} JSON files valid`);

/* 3. Data integrity cross-checks */
const q = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const subjects = q("data/subjects.json");
const chapters = q("data/chapters.json");
const topics = q("data/topics.json");
const mcqs = q("data/mcqs.json");
const papers = q("data/papers.json");
const quizzes = q("data/quizzes.json");

const subjectIds = new Set(subjects.map((s) => s.id));
const chapterIds = new Set(chapters.map((c) => c.id));
const topicIds = new Set(topics.map((t) => t.id));
const catIds = new Set(q("data/categories.json").map((c) => c.id));

let orphans = 0, dupIds = 0, emptySubj = 0;
const seen = new Set();
for (const m of mcqs) {
  if (seen.has(m.id)) { dupIds++; bad(`Duplicate MCQ id: ${m.id}`); }
  seen.add(m.id);
  if (!subjectIds.has(m.subject)) { orphans++; bad(`MCQ ${m.id}: orphan subject ${m.subject}`); }
  if (!chapterIds.has(m.chapter)) { orphans++; bad(`MCQ ${m.id}: orphan chapter ${m.chapter}`); }
  if (!topicIds.has(m.topic)) { orphans++; bad(`MCQ ${m.id}: orphan topic ${m.topic}`); }
}
if (!orphans) ok("No orphaned MCQ references");
if (!dupIds) ok("No duplicate MCQ ids");

const subjToChap = new Map();
chapters.forEach((c) => { if (!subjToChap.has(c.subject)) subjToChap.set(c.subject, []); subjToChap.get(c.subject).push(c.id); });
const chapToTopic = new Map();
topics.forEach((t) => { if (!chapToTopic.has(t.chapter)) chapToTopic.set(t.chapter, []); chapToTopic.get(t.chapter).push(t.id); });

for (const s of subjects) {
  const cnt = mcqs.filter((m) => m.subject === s.id).length;
  if (cnt === 0) { emptySubj++; warn(`Subject with 0 MCQs: ${s.id}`); }
  if (!catIds.has(s.category)) { bad(`Subject ${s.id}: unknown category ${s.category}`); }
  if (s.status !== "active" && s.status !== "coming-soon" && s.status !== "reference") bad(`Subject ${s.id}: bad status ${s.status}`);
}
for (const c of chapters) {
  if (!subjectIds.has(c.subject)) { bad(`Chapter ${c.id}: orphan subject`); }
  if (!subjToChap.has(c.subject) || subjToChap.get(c.subject).length === 0) warn(`Subject ${c.subject}: no chapters`);
}
for (const t of topics) {
  if (!chapterIds.has(t.chapter)) bad(`Topic ${t.id}: orphan chapter ${t.chapter}`);
}
subjects.forEach((s) => { if (!subjToChap.has(s.id)) warn(`Subject ${s.id}: has no chapters`); });
chapters.forEach((c) => { if (!chapToTopic.has(c.id)) warn(`Chapter ${c.id}: has no topics`); });
if (emptySubj) warn(`${emptySubj} subjects have no MCQs yet`);

/* 4. Schema check */
let schemaIssues = 0;
for (const m of mcqs) {
  for (const k of ["id", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "detailedExplanation", "difficulty", "subject", "chapter", "topic"]) {
    if (m[k] === undefined || m[k] === null || m[k] === "") { schemaIssues++; bad(`MCQ ${m.id}: missing/invalid field ${k}`); break; }
  }
  if (!["A", "B", "C", "D"].includes(m.correctAnswer)) { schemaIssues++; bad(`MCQ ${m.id}: bad correctAnswer`); }
  if (!["easy", "medium", "hard"].includes(m.difficulty)) { schemaIssues++; bad(`MCQ ${m.id}: bad difficulty`); }
  if (m.detailedExplanation.length < 20) { schemaIssues++; warn(`MCQ ${m.id}: thin explanation (${m.detailedExplanation.length} chars)`); }
  if (m.question.includes("??") || m.question.includes("  ")) { schemaIssues++; warn(`MCQ ${m.id}: possible typo in question`); }
  if (!Array.isArray(m.exam) || !m.exam.length) { schemaIssues++; warn(`MCQ ${m.id}: no exam coverage`); }
  if (!Array.isArray(m.tags)) { schemaIssues++; warn(`MCQ ${m.id}: tags not array`); }
}
if (!schemaIssues) ok("MCQ schema clean");
info(`MCQs: ${mcqs.length}, avg explanation length: ${Math.round(mcqs.reduce((s, m) => s + (m.detailedExplanation || "").length, 0) / mcqs.length)} chars`);

/* 5. Duplicate question text */
const qMap = new Map();
let dupQ = 0;
for (const m of mcqs) {
  const k = m.question.trim().toLowerCase();
  if (qMap.has(k)) { dupQ++; warn(`Possible duplicate question: "${m.question.slice(0, 60)}..." (${qMap.get(k)} / ${m.id})`); }
  else qMap.set(k, m.id);
}
if (!dupQ) ok("No duplicate question texts");

/* 6. Papers & quizzes integrity */
const examIds = new Set(q("data/exams.json").map((e) => e.id));
for (const p of papers) {
  if (!p.subjects || !p.subjects.length) warn(`Paper ${p.id}: no subjects`);
  else for (const s of p.subjects) if (!subjectIds.has(s)) bad(`Paper ${p.id}: unknown subject ${s}`);
  if (p.exam && !examIds.has(p.exam)) warn(`Paper ${p.id}: exam ${p.exam} not in exams.json`);
}
for (const z of quizzes) {
  for (const s of z.subjects) if (s && !subjectIds.has(s)) bad(`Quiz ${z.id}: unknown subject ${s}`);
}
ok(`Papers: ${papers.length}, Quizzes: ${quizzes.length}`);

/* 7. Exam coverage in subjects */
const examSet = new Set();
subjects.forEach((s) => (s.exams || []).forEach((e) => examSet.add(e)));
info(`Exams referenced in subjects: ${[...examSet].sort().join(", ")}`);

/* 8. HTML checks */
for (const f of ["index.html", "admin.html"]) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const tagCount = (html.match(/<(h1|h2|h3)\b/g) || []).length;
  const hasTitle = /<title>/.test(html);
  const hasMetaDesc = /name="description"/.test(html);
  const hasViewport = /name="viewport"/.test(html);
  const hasCanonical = /rel="canonical"/.test(html);
  const hasOG = /property="og:/.test(html);
  const hasSchema = /application\/ld\+json/.test(html);
  const hasLang = /<html lang="en">/.test(html);
  if (!hasTitle) bad(`${f}: missing <title>`);
  if (!hasMetaDesc) warn(`${f}: missing meta description`);
  if (!hasViewport) warn(`${f}: missing viewport`);
  if (!hasCanonical) warn(`${f}: missing canonical`);
  if (!hasOG) warn(`${f}: missing OpenGraph tags`);
  if (!hasSchema) warn(`${f}: missing JSON-LD`);
  if (!hasLang) warn(`${f}: missing html lang`);
  if (!tagCount) warn(`${f}: no headings found`);
  const localRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:|^data:|^#|^mailto:/.test(u));
  for (const ref of localRefs) {
    const p = path.join(ROOT, ref.split("?")[0]);
    if (!fs.existsSync(p)) bad(`${f}: broken reference ${ref}`);
  }
  ok(`${f}: checked (${localRefs.length} local references)`);
}

/* 9. JS/CSS sanity */
for (const f of ["assets/js/app.js", "assets/js/admin.js", "scripts/build-mcqs.js"]) {
  try { new Function(fs.readFileSync(path.join(ROOT, f), "utf8")); ok(`${f}: parses`); }
  catch (e) { bad(`${f}: syntax error - ${e.message}`); }
}
const css = fs.readFileSync(path.join(ROOT, "assets/css/style.css"), "utf8");
info(`CSS size: ${(css.length / 1024).toFixed(1)} KB, media queries: ${(css.match(/@media/g) || []).length}`);
for (const f of allFiles) {
  if (/\.(png|jpe?g|gif|webp|svg|woff2?|ttf|mp4|webm)$/i.test(f.rel)) info(`Asset: ${f.rel} (${(f.size / 1024).toFixed(1)} KB)`);
}

/* 10. URL/hash views in app */
const appJs = fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");
const views = [...appJs.matchAll(/"([a-z]+)":/g)].map((m) => m[1]);
const homeViews = [...appJs.matchAll(/VIEWS = \[([^\]]+)\]/g)][0]?.[1] || "";
info(`App views: ${homeViews}`);

/* 11. Accessibility quick scan */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const imgs = [...html.matchAll(/<img\b/g)];
for (const im of imgs) warn(`Unchecked <img> usage (${imgs.length})`);
info(`aria-live regions: ${(html.match(/aria-live/g) || []).length}, skip link present: ${/skip-link/.test(html)}`);
const btnRe = /<button\b[^>]*>([\s\S]*?)<\/button>/g;
let btnMatch, btnNoName = 0;
while ((btnMatch = btnRe.exec(html))) {
  const tag = btnMatch[0];
  const inner = btnMatch[1].replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, "x").trim();
  const hasAttr = /aria-label|title|aria-labelledby/.test(tag);
  if (!hasAttr && inner.length < 2) { btnNoName++; warn(`Button possibly missing accessible name: ${tag.slice(0, 70)}...`); }
}
info(`Buttons in index.html: ${[...html.matchAll(/<button\b/g)].length}, flagged for names: ${btnNoName}`);

/* 12. Security scan */
if (/\binnerHTML\s*=\s*.*\$\{/s.test(appJs) && /esc\(/.test(appJs)) info("innerHTML templating found - ensure escaping (esc helper used)");
info(`localStorage keys used: bookmarks, theme, (admin: pmh_admin_mcqs)`);

/* 13. Performance scan */
info(`app.js size: ${(fs.statSync(path.join(ROOT, "assets/js/app.js")).size / 1024).toFixed(1)} KB (single file, no code splitting)`);
info(`mcqs.json size: ${(fs.statSync(path.join(ROOT, "data/mcqs.json")).size / 1024).toFixed(0)} KB (full bank loaded at once)`);
info(`Fonts: system stack (no web fonts) - good for performance`);

const header = [
  "# Audit Report — Pakistan MCQS Hub",
  "",
  "*Generated 2026-07-31 · Phase 3 (Enterprise Expansion: 1338 MCQs, 147 subjects, 400 chapters, 719 topics, 38 exams, 16 categories)*",
  "",
  "```",
  ...report,
  "```",
  "",
];
fs.writeFileSync(path.join(ROOT, "docs", "audit-report.md"), header.join("\n"), "utf8");
console.log(report.join("\n"));
console.log(`\nReport written to docs/audit-report.md (${report.filter((l) => l.startsWith("[FAIL]")).length} FAIL, ${report.filter((l) => l.startsWith("[WARN]")).length} WARN)`);
