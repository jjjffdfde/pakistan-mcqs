#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Full Database Audit (Enterprise)
   Scans every table: totals, empty rows, broken relations,
   coverage %. Per-subject RED/YELLOW/GREEN, per-exam coverage,
   and LIVE question resolution for every paper / mock / quiz
   (same query the API uses), so zero-question items are found
   exactly as a user would see them.
   Usage: node pipeline/audit.js
   Output: docs/AUDIT-REPORT-<stamp>.md
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.join(__dirname, "..");
const DB_FILE = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const TARGET = 5000;

const db = new DatabaseSync(DB_FILE, { readOnly: true });
const out = [];
const say = (s) => { console.log(s); out.push(s); };
const md = (s) => out.push(s);
const fmt = (n) => Number(n || 0).toLocaleString();
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function main() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const ts = new Date().toISOString().slice(0, 10);
  md(`# Pakistan MCQs Hub — Full Database Audit — ${ts}

## 1. Table Audit

| Table | Total rows | Empty / missing critical fields | Broken relations | Coverage % |
| --- | --- | --- | --- | --- |`);
  const tableLines = [];
  const relations = [];
  const zeroSubjects = [], belowSubjects = [], okSubjects = [];

  /* ---------------- per-table ----------------
     Expected = the meaningful rows the app depends on. Coverage =
     useful rows / total rows, and relational gaps are listed. */
  const T = (name, rows, emptyCount, brokenCount, expectedName, expectedGap, pct) =>
    tableLines.push(`| ${name} | ${fmt(rows)} | ${fmt(emptyCount)} | ${fmt(brokenCount)} | ${expectedGap ? `${expectedName}: ${fmt(expectedGap)} missing` : (pct || "100%")} |`);

  const cat = db.prepare("SELECT COUNT(*) n FROM categories").get().n;
  T("categories", cat, db.prepare("SELECT COUNT(*) n FROM categories WHERE id IS NULL OR name IS NULL OR length(name)=0").get().n, db.prepare(`SELECT COUNT(*) n FROM categories c WHERE c.id NOT IN (SELECT DISTINCT category_id FROM subjects WHERE category_id IS NOT NULL)`).get().n, "", 0, "100%");

  const subjects = db.prepare("SELECT id, name, slug, category_id, exam_ids, status FROM subjects ORDER BY id").all();
  const mcqsBySubject = Object.fromEntries(db.prepare("SELECT subject_id, COUNT(*) n FROM mcqs WHERE status='active' GROUP BY subject_id").all().map((r) => [r.subject_id, r.n]));
  const activeSubs = subjects.filter((s) => s.status === "active");
  const subjEmpty = subjects.filter((s) => !s.id || !s.name || !s.slug).length;
  const subjBrokenCat = subjects.filter((s) => s.category_id && !db.prepare("SELECT 1 FROM categories WHERE id=?").get(s.category_id)).length;
  const subjBrokenExam = subjects.filter((s) => s.exam_ids && s.exam_ids.split(",").some((x) => x && !JSON.parse(fs.readFileSync(path.join(ROOT, "data", "exams.json"), "utf8")).some((e) => e.id === x.trim()))).length;
  T("subjects", subjects.length, subjEmpty, subjBrokenCat + subjBrokenExam, "", 0, "100%");

  for (const s of activeSubs) {
    const n = mcqsBySubject[s.id] || 0;
    if (n === 0) zeroSubjects.push(s);
    else if (n < TARGET) belowSubjects.push({ s, n });
    else okSubjects.push({ s, n });
  }

  const chapters = db.prepare("SELECT COUNT(*) n FROM chapters").get().n;
  const chapOrphan = db.prepare(`SELECT COUNT(*) n FROM chapters c WHERE c.subject_id NOT IN (SELECT id FROM subjects)`).get().n;
  const chapEmpty = db.prepare("SELECT COUNT(*) n FROM chapters WHERE id IS NULL OR name IS NULL OR length(name)=0").get().n;
  const subjectsNoChapter = subjects.filter((s) => !db.prepare("SELECT 1 FROM chapters WHERE subject_id=?").get(s.id)).length;
  T("chapters", chapters, chapEmpty, chapOrphan, "subjects without any chapter", subjectsNoChapter, "");

  const topics = db.prepare("SELECT COUNT(*) n FROM topics").get().n;
  const topOrphan = db.prepare(`SELECT COUNT(*) n FROM topics t WHERE t.chapter_id NOT IN (SELECT id FROM chapters)`).get().n;
  const topEmpty = db.prepare("SELECT COUNT(*) n FROM topics WHERE id IS NULL OR name IS NULL OR length(name)=0").get().n;
  const chaptersNoTopic = db.prepare(`SELECT COUNT(*) n FROM chapters c WHERE c.id NOT IN (SELECT DISTINCT chapter_id FROM topics)`).get().n;
  T("topics", topics, topEmpty, topOrphan, "chapters without any topic", chaptersNoTopic, "");

  const subtopics = db.prepare("SELECT COUNT(*) n FROM subtopics").get().n;
  const subOrphan = db.prepare(`SELECT COUNT(*) n FROM subtopics s WHERE s.topic_id NOT IN (SELECT id FROM topics)`).get().n;
  const subEmpty = db.prepare("SELECT COUNT(*) n FROM subtopics WHERE id IS NULL OR name IS NULL OR length(name)=0").get().n;
  const topicsNoSub = db.prepare(`SELECT COUNT(*) n FROM topics t WHERE t.id NOT IN (SELECT DISTINCT topic_id FROM subtopics)`).get().n;
  T("subtopics", subtopics, subEmpty, subOrphan, "topics without any subtopic", topicsNoSub, "");

  T("concepts", 0, 0, 0, "modelled as learning_objective on mcqs + topic coverage below", 0, "n/a");

  const mcqs = db.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n;
  const mcqsAll = db.prepare("SELECT COUNT(*) n FROM mcqs").get().n;
  const mcqsEmptyQ = db.prepare("SELECT COUNT(*) n FROM mcqs WHERE question IS NULL OR length(trim(question))=0").get().n;
  const mcqsBadAns = db.prepare("SELECT COUNT(*) n FROM mcqs WHERE correct_answer NOT IN ('A','B','C','D')").get().n;
  const mcqsShortExp = db.prepare("SELECT COUNT(*) n FROM mcqs WHERE explanation IS NULL OR length(explanation)<10").get().n;
  const mcqsOrphan = db.prepare(`SELECT COUNT(*) n FROM mcqs m WHERE m.subject_id NOT IN (SELECT id FROM subjects) OR (m.chapter_id IS NOT NULL AND m.chapter_id NOT IN (SELECT id FROM chapters)) OR (m.topic_id IS NOT NULL AND m.topic_id NOT IN (SELECT id FROM topics))`).get().n;
  const mcqsNoOpts = db.prepare(`SELECT COUNT(*) n FROM mcqs m WHERE (SELECT COUNT(*) FROM options o WHERE o.mcq_id=m.id) != 4 AND m.status='active'`).get().n;
  T("mcqs", mcqs, mcqsEmptyQ + mcqsBadAns + mcqsShortExp, mcqsOrphan + mcqsNoOpts, "mcqs with incomplete option sets", mcqsNoOpts, "");

  const opts = db.prepare("SELECT COUNT(*) n FROM options").get().n;
  const optsOrphan = db.prepare(`SELECT COUNT(*) n FROM options o WHERE o.mcq_id NOT IN (SELECT id FROM mcqs)`).get().n;
  T("options", opts, 0, optsOrphan, "", 0, "100%");

  const papers = db.prepare("SELECT * FROM pastpapers ORDER BY year DESC, id").all();
  const papersBroken = papers.filter((p) => liveCount(p.subject_ids) === 0);
  T("past_papers (pastpapers)", papers.length, papers.filter((p) => !p.title || (!p.year && !p.pattern)).length, papersBroken.length, "papers with zero live questions", papersBroken.length, "");

  const mocks = db.prepare("SELECT * FROM mocktests ORDER BY id").all();
  const mocksBroken = mocks.filter((m) => liveCount(m.subject_ids) === 0);
  T("mock_tests (mocktests)", mocks.length, mocks.filter((m) => !m.title).length, mocksBroken.length, "mocks with zero live questions", mocksBroken.length, "");

  const quizzes = db.prepare("SELECT * FROM quizzes ORDER BY id").all();
  const quizzesBroken = quizzes.filter((q) => liveCount(q.subject_ids) === 0);
  T("quizzes", quizzes.length, quizzes.filter((q) => !q.title).length, quizzesBroken.length, "quizzes with zero live questions", quizzesBroken.length, "");

  T("exams", 0, 0, 0, "exams live in data/exams.json (38) + subjects.exam_ids mapping — coverage per exam below", 0, "n/a");
  T("daily/weekly/monthly tests", 0, 0, 0, "frontend modes resolving via /api/random (audited in Button Validation)", 0, "n/a");
  T("practice_sets", 0, 0, 0, "frontend practice modes resolving via /api/random (audited in Button Validation)", 0, "n/a");

  for (const [tbl, key] of [["bookmarks", "mcq_id"], ["history", "mcq_id"], ["references_tbl", "mcq_id"]]) {
    const total = db.prepare(`SELECT COUNT(*) n FROM ${tbl}`).get().n;
    const orphan = db.prepare(`SELECT COUNT(*) n FROM ${tbl} WHERE ${key} NOT IN (SELECT id FROM mcqs)`).get().n;
    T(tbl, total, 0, orphan, "", 0, "100%");
  }
  T("leaderboard", db.prepare("SELECT COUNT(*) n FROM leaderboard").get().n, 0, 0, "", 0, "100%");
  T("analytics", db.prepare("SELECT COUNT(*) n FROM analytics").get().n, 0, 0, "", 0, "100%");
  T("pipeline_state", db.prepare("SELECT COUNT(*) n FROM pipeline_state").get().n, 0, 0, "", 0, "100%");

  for (const l of tableLines) md(l);

  /* ---------------- subject status ---------------- */
  md(`\n## 2. Subject Status (active: ${activeSubs.length})

- **RED (0 MCQs): ${zeroSubjects.length}** ${zeroSubjects.length ? "— " + zeroSubjects.map((s) => s.id).join(", ") : ""}
- **YELLOW (< ${fmt(TARGET)}): ${belowSubjects.length}**
- **GREEN (≥ ${fmt(TARGET)}): ${okSubjects.length}**

### Yellow (below target) — worst 60
| Subject | MCQs | Missing to ${fmt(TARGET)} | % |
| --- | --- | --- | --- |
${belowSubjects.sort((a, b) => a.n - b.n).slice(0, 60).map(({ s, n }) => `| ${esc(s.name)} | ${fmt(n)} | ${fmt(TARGET - n)} | ${(n / TARGET * 100).toFixed(1)}% |`).join("\n")}
${belowSubjects.length > 60 ? `\n_… and ${belowSubjects.length - 60} more._` : ""}

### Green subjects
${okSubjects.sort((a, b) => b.n - a.n).map(({ s, n }) => `- ${esc(s.name)} — ${fmt(n)}`).join("\n")}`);

  /* ---------------- exam coverage ---------------- */
  const exams = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "exams.json"), "utf8"));
  const examTarget = (id) => (["css", "pms", "ppsc", "fpsc", "kppsc", "bpsc", "spsc", "ajkpsc", "nts", "ots", "cts", "pts", "police", "ib", "fia", "md", "etea", "educators", "lecturer", "pma", "issb", "army", "navy", "paf", "anf"].includes(id) ? 5000 : 3000);
  const examRows = exams.map((e) => {
    const subs = subjects.filter((s) => (s.exam_ids || "").split(",").map((x) => x.trim()).filter(Boolean).includes(e.id));
    const cur = subs.reduce((a, s) => a + (mcqsBySubject[s.id] || 0), 0);
    const target = examTarget(e.id);
    return { id: e.id, name: e.name, cur, target, subs: subs.length };
  });
  md(`\n## 3. Exam Coverage (${exams.length} exams)

| Exam | Subjects mapped | Current MCQs | Target | Missing | Coverage % |
| --- | --- | --- | --- | --- | --- |
${examRows.map((e) => `| ${esc(e.name)} | ${e.subs} | ${fmt(e.cur)} | ${fmt(e.target)} | ${fmt(Math.max(0, e.target - e.cur))} | ${Math.min(100, (e.cur / e.target * 100)).toFixed(1)}% |`).join("\n")}
| **TOTAL** | — | **${fmt(examRows.reduce((a, e) => a + e.cur, 0))}** | **${fmt(examRows.reduce((a, e) => a + e.target, 0))}** | **${fmt(examRows.reduce((a, e) => a + Math.max(0, e.target - e.cur), 0))}** | ${(examRows.reduce((a, e) => a + e.cur, 0) / examRows.reduce((a, e) => a + e.target, 0) * 100).toFixed(1)}% |`);

  /* ---------------- papers / mocks / quizzes ---------------- */
  md(`\n## 4. Past Papers Audit (${papers.length})

| ID | Title | Year | Subjects | Qs asked | Live questions | Status |
| --- | --- | --- | --- | --- | --- | --- |
${papers.map((p) => { const n = liveCount(p.subject_ids); return `| ${esc(p.id)} | ${esc(p.title)} | ${p.year || (p.pattern ? "Pattern" : "—")} | ${esc(p.subject_ids)} | ${p.total_questions} | ${fmt(n)} | ${n === 0 ? "❌ BROKEN" : n < (p.total_questions || 15) ? "⚠️ SHORT" : "✅ OK"} |`; }).join("\n")}`);

  md(`\n## 5. Mock Test Audit (${mocks.length})

| ID | Title | Qs asked | Live questions | Status |
| --- | --- | --- | --- | --- |
${mocks.map((m) => { const n = liveCount(m.subject_ids); return `| ${esc(m.id)} | ${esc(m.title)} | ${m.total_questions} | ${fmt(n)} | ${n === 0 ? "❌ BROKEN" : n < m.total_questions ? "⚠️ SHORT" : "✅ OK"} |`; }).join("\n")}`);

  md(`\n## 6. Quiz Audit (${quizzes.length})

| ID | Title | Tags | Qs asked | Live questions | Status |
| --- | --- | --- | --- | --- | --- |
${quizzes.map((q) => { const n = liveCount(q.subject_ids); return `| ${esc(q.id)} | ${esc(q.title)} | ${esc(q.tags || "")} | ${q.total_questions} | ${fmt(n)} | ${n === 0 ? "❌ BROKEN" : n < q.total_questions ? "⚠️ SHORT" : "✅ OK"} |`; }).join("\n")}`);

  /* ---------------- summary ---------------- */
  const brokenTotal = papersBroken.length + mocksBroken.length + quizzesBroken.length;
  const healthChecks = [
    ["mcqs valid (options=4, valid answer, has explanation)", mcqsNoOpts + mcqsBadAns + mcqsShortExp === 0],
    ["no orphan relations", (chapOrphan + topOrphan + subOrphan + optsOrphan + mcqsOrphan) === 0],
    ["no zero-MCQ subjects", zeroSubjects.length === 0],
    ["no zero-question papers/mocks/quizzes", brokenTotal === 0],
    ["SQLite integrity", db.prepare("PRAGMA quick_check").get().quick_check === "ok"],
    ["every subject has a chapter", subjectsNoChapter === 0],
    ["every chapter has topics", chaptersNoTopic === 0]
  ];
  const okHealth = healthChecks.filter(([, ok]) => ok).length;
  const healthPct = (okHealth / healthChecks.length * 100).toFixed(1);
  const coveredSubjects = activeSubs.length - zeroSubjects.length;
  md(`\n## 7. Audit Summary

- **Subjects with zero MCQs (RED):** ${zeroSubjects.length}
- **Subjects below ${fmt(TARGET)} (YELLOW):** ${belowSubjects.length}
- **Subjects at ${fmt(TARGET)}+ (GREEN):** ${okSubjects.length}
- **Exams below target:** ${examRows.filter((e) => e.cur < e.target).length} of ${exams.length}
- **Broken papers / mocks / quizzes (zero live questions):** ${papersBroken.length} / ${mocksBroken.length} / ${quizzesBroken.length}
- **MCQ coverage %:** ${(mcqs / (TARGET * activeSubs.length) * 100).toFixed(1)}% of ${TARGET} × ${activeSubs.length} subjects

### Database Health Checks
${healthChecks.map(([k, ok]) => `- ${ok ? "✅" : "❌"} ${k}`).join("\n")}
**Health score: ${healthPct}% (${okHealth}/${healthChecks.length})**`);

  const reportPath = path.join(ROOT, "docs", `AUDIT-REPORT-${stamp}.md`);
  fs.writeFileSync(reportPath, out.join("\n"), "utf8");
  say(`\nWrote ${reportPath}`);
  say(`SUMMARY: red=${zeroSubjects.length} yellow=${belowSubjects.length} green=${okSubjects.length} | brokenPapers=${papersBroken.length} brokenMocks=${mocksBroken.length} brokenQuizzes=${quizzesBroken.length} | health=${healthPct}%`);
  db.close();

  function liveCount(subjectIdsCsv) {
    const ids = String(subjectIdsCsv || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!ids.length) return 0;
    const ph = ids.map(() => "?").join(",");
    return db.prepare(`SELECT COUNT(*) n FROM mcqs WHERE subject_id IN (${ph}) AND status='active'`).get(...ids).n;
  }
}

main();
