#!/usr/bin/env node
/* ============================================================
   Coverage Audit & Subject Ranking (Deep Knowledge phase)
   For EVERY subject: current MCQs, target, missing, chapters,
   topics, subtopics, concepts (n/a), learning objectives,
   coverage %, ranked weakest -> strongest.
   Usage: node pipeline/audit-coverage.js [--target 5000]
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");

const TARGET = parseInt(process.argv.find((a) => a.startsWith("--target"))?.split("=")[1], 10) || 5000;
const db = open();

const subjects = db.all(`SELECT s.id, s.name, s.category_id, c.name cat FROM subjects s LEFT JOIN categories c ON c.id=s.category_id ORDER BY s.name`);
const rows = subjects.map((s) => {
  const mcqs = db.get(`SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'`, [s.id]).n;
  const chapters = db.get(`SELECT COUNT(*) n FROM chapters WHERE subject_id=?`, [s.id]).n;
  const topics = db.get(`SELECT COUNT(*) n FROM topics t JOIN chapters c ON c.id=t.chapter_id WHERE c.subject_id=?`, [s.id]).n;
  const subtopics = db.get(`SELECT COUNT(*) n FROM subtopics st JOIN topics t ON t.id=st.topic_id JOIN chapters c ON c.id=t.chapter_id WHERE c.subject_id=?`, [s.id]).n;
  const withLO = db.get(`SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active' AND learning_objective IS NOT NULL AND learning_objective<>''`, [s.id]).n;
  const distLO = db.get(`SELECT COUNT(DISTINCT learning_objective) n FROM mcqs WHERE subject_id=? AND status='active' AND learning_objective IS NOT NULL AND learning_objective<>''`, [s.id]).n;
  const emptyTopic = db.get(`SELECT COUNT(*) n FROM topics t JOIN chapters c ON c.id=t.chapter_id WHERE c.subject_id=? AND NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.topic_id=t.id AND m.status='active')`, [s.id]).n;
  return {
    id: s.id, name: s.name, cat: s.cat || "",
    mcqs, target: TARGET, missing: Math.max(0, TARGET - mcqs),
    chapters, topics, subtopics, emptyTopic,
    concepts: 0, loSet: withLO, distLO,
    coverage: Math.min(100, Math.round((mcqs / TARGET) * 1000) / 10)
  };
});

rows.sort((a, b) => a.coverage - b.coverage || b.mcqs - a.mcqs || a.name.localeCompare(b.name));

const date = new Date().toISOString().slice(0, 10);
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-").slice(0, 16);
const file = path.join(__dirname, "..", "docs", `COVERAGE-REPORT-${stamp}.md`);
const esc = (s) => String(s).replace(/\|/g, "\\|");

const totalMcqs = db.get(`SELECT COUNT(*) n FROM mcqs WHERE status='active'`).n;
const totalTarget = TARGET * rows.length;
const met = rows.filter((r) => r.mcqs >= TARGET).length;

let md = `# Coverage Report — ${date}

- Target per subject: **${TARGET}** MCQs | Subjects: ${rows.length} | Total active MCQs: ${totalMcqs.toLocaleString()} | Total target: ${totalTarget.toLocaleString()} | Subjects meeting target: ${met}
- **Concepts:** no concepts table exists in the live DB (mission requirement) — tracked via subtopics (${rows.reduce((a, r) => a + r.subtopics, 0).toLocaleString()}) and distinct learning objectives (${rows.reduce((a, r) => a + r.distLO, 0).toLocaleString()}).
- Ranked **weakest → strongest**.

## Subject Ranking

| # | Subject | Category | MCQs | Target | Missing | Coverage % | Chapters | Topics | Subtopics | Empty topics | LO set | Distinct LOs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;
rows.forEach((r, i) => {
  md += `| ${i + 1} | ${esc(r.name)} | ${esc(r.cat)} | ${r.mcqs} | ${r.target} | ${r.missing} | ${r.coverage}% | ${r.chapters} | ${r.topics} | ${r.subtopics} | ${r.emptyTopic} | ${r.loSet} | ${r.distLO} |
`;
});

md += `\n## Summary\n\n- Weakest 20: ${rows.slice(0, 20).map((r) => `${esc(r.name)} (${r.coverage}%)`).join(", ")}
- Strongest 10: ${rows.slice(-10).map((r) => `${esc(r.name)} (${r.coverage}%)`).join(", ")}
- Total missing MCQs to target: ${rows.reduce((a, r) => a + r.missing, 0).toLocaleString()}
`;

fs.writeFileSync(file, md);
console.log(`Wrote ${file}`);
console.log(`Total missing to reach ${TARGET}/subject: ${rows.reduce((a, r) => a + r.missing, 0).toLocaleString()}`);
console.log(`Weakest 20:`);
rows.slice(0, 20).forEach((r) => console.log(`  ${String(r.coverage).padStart(5)}% ${String(r.mcqs).padStart(7)} ${r.name}`));
db.close();
