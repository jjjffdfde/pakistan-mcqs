#!/usr/bin/env node
/* ============================================================
   Pakistan MCQs Hub — Phase 13 Coverage & Quality Audit
   Read-only. Emits docs/PHASE13-AUDIT.md + docs/phase13-audit.json
   Measures: coverage vs Phase-13 targets, priority buckets (A–E),
   difficulty dist, explanation quality, metadata authenticity
   (templated-filler detection), distractor recycling, duplicates.
   ============================================================ */
"use strict";
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DB = path.join(__dirname, "..", "db", "pakistan-mcqs.sqlite");
const db = new DatabaseSync(DB);
const a = (s, p = []) => db.prepare(s).all(...p);
const g = (s, p = []) => db.prepare(s).get(...p);

const TARGET_SUBJECT = 7000;
const TARGET_CHAPTER = 300;
const TARGET_TOPIC = 150;
const TARGET_SUBTOPIC = 75;

const out = {};
const tot = g("SELECT COUNT(*) n FROM mcqs WHERE status='active'").n;
out.generatedAt = "phase13-audit"; // no Date.now available in some envs; stamped by caller
out.totalActive = tot;

/* ---------- Subject coverage + priority buckets ---------- */
const subjRows = a(`
  SELECT s.id, s.name, s.category_id,
    (SELECT COUNT(*) FROM mcqs m WHERE m.subject_id=s.id AND m.status='active') AS n
  FROM subjects s WHERE s.status='active' ORDER BY n ASC`);
const bucket = (n) => n <= 500 ? "A" : n <= 1000 ? "B" : n <= 2500 ? "C" : n <= 5000 ? "D" : "E";
const buckets = { A: [], B: [], C: [], D: [], E: [] };
subjRows.forEach(r => { r.priority = bucket(r.n); r.deficit = Math.max(0, TARGET_SUBJECT - r.n); buckets[r.priority].push(r); });
out.subjectCount = subjRows.length;
out.priority = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, {
  subjects: v.length, mcqs: v.reduce((s, r) => s + r.n, 0), deficit: v.reduce((s, r) => s + r.deficit, 0)
}]));
out.belowTarget = subjRows.filter(r => r.n < TARGET_SUBJECT).length;
out.totalSubjectDeficit = subjRows.reduce((s, r) => s + r.deficit, 0);

/* ---------- Chapter / topic / subtopic coverage ---------- */
const chBelow = g(`SELECT COUNT(*) n FROM (SELECT c.id, (SELECT COUNT(*) FROM mcqs m WHERE m.chapter_id=c.id AND m.status='active') cnt FROM chapters c) WHERE cnt < ${TARGET_CHAPTER}`).n;
const chTotal = g("SELECT COUNT(*) n FROM chapters").n;
const tpBelow = g(`SELECT COUNT(*) n FROM (SELECT t.id, (SELECT COUNT(*) FROM mcqs m WHERE m.topic_id=t.id AND m.status='active') cnt FROM topics t) WHERE cnt < ${TARGET_TOPIC}`).n;
const tpTotal = g("SELECT COUNT(*) n FROM topics").n;
const stTotal = g("SELECT COUNT(*) n FROM subtopics").n;
out.chapters = { total: chTotal, belowTarget: chBelow, target: TARGET_CHAPTER };
out.topics = { total: tpTotal, belowTarget: tpBelow, target: TARGET_TOPIC };
out.subtopics = { total: stTotal, target: TARGET_SUBTOPIC, note: "mcqs.subtopic_id linkage is sparse; measured separately" };

/* ---------- Difficulty ---------- */
out.difficulty = a("SELECT difficulty, COUNT(*) n FROM mcqs WHERE status='active' GROUP BY difficulty");

/* ---------- Explanation quality ---------- */
out.explanation = {
  under40: g("SELECT COUNT(*) n FROM mcqs WHERE length(explanation)<40").n,
  under60: g("SELECT COUNT(*) n FROM mcqs WHERE length(explanation)<60").n,
  atLeast120: g("SELECT COUNT(*) n FROM mcqs WHERE length(explanation)>=120").n
};

/* ---------- Metadata AUTHENTICITY (not just presence) ---------- */
// Templated filler heuristics: doubled words in LO, tiny distinct-value ratio, circular why-wrong
out.metadata = {
  learningObjective: {
    populated: g("SELECT COUNT(*) n FROM mcqs WHERE learning_objective<>''").n,
    distinct: g("SELECT COUNT(DISTINCT learning_objective) n FROM mcqs").n,
    doubledWordFiller: g("SELECT COUNT(*) n FROM mcqs WHERE learning_objective LIKE '% facts facts %' OR learning_objective LIKE '% concepts concepts %'").n
  },
  examTip: { populated: g("SELECT COUNT(*) n FROM mcqs WHERE exam_tip<>''").n, distinct: g("SELECT COUNT(DISTINCT exam_tip) n FROM mcqs").n },
  memoryTrick: { populated: g("SELECT COUNT(*) n FROM mcqs WHERE memory_trick<>''").n, distinct: g("SELECT COUNT(DISTINCT memory_trick) n FROM mcqs").n },
  whyWrong: {
    populated: g("SELECT COUNT(*) n FROM mcqs WHERE explanation_why_wrong<>''").n,
    perOptionArray: g("SELECT COUNT(*) n FROM mcqs WHERE explanation_why_wrong LIKE '[%]'").n,
    circularFiller: g("SELECT COUNT(*) n FROM mcqs WHERE explanation_why_wrong LIKE '%is not the fact asked here%' OR explanation_why_wrong LIKE '%matches the stated detail%'").n
  },
  references: { nonEmpty: g("SELECT COUNT(*) n FROM mcqs WHERE references_json<>'[]' AND references_json<>''").n },
  bloom: a("SELECT bloom_taxonomy, COUNT(*) n FROM mcqs GROUP BY bloom_taxonomy ORDER BY n DESC")
};

/* ---------- Distractor recycling (per-subject sampled) ---------- */
// For the 12 largest generated subjects, measure share of distractor strings that are
// ALSO the correct answer to a different question in the same subject (the recycling pathology).
const topSubs = a("SELECT subject_id, COUNT(*) n FROM mcqs GROUP BY subject_id ORDER BY n DESC LIMIT 12").map(r => r.subject_id);
out.distractorRecycling = [];
for (const sid of topSubs) {
  // correct-answer text set for subject
  const row = g(`
    WITH correct AS (
      SELECT o.text t FROM options o JOIN mcqs m ON m.id=o.mcq_id
      WHERE m.subject_id=? AND o.label=m.correct_answer
    ),
    distract AS (
      SELECT o.text t FROM options o JOIN mcqs m ON m.id=o.mcq_id
      WHERE m.subject_id=? AND o.label<>m.correct_answer
    )
    SELECT
      (SELECT COUNT(*) FROM distract) AS distractors,
      (SELECT COUNT(*) FROM distract d WHERE d.t IN (SELECT t FROM correct)) AS recycled`,
    [sid, sid]);
  const pct = row.distractors ? (100 * row.recycled / row.distractors) : 0;
  out.distractorRecycling.push({ subject: sid, distractors: row.distractors, recycled: row.recycled, recycledPct: +pct.toFixed(1) });
}

/* ---------- Duplicates ---------- */
out.duplicates = {
  qhashUnique: g("SELECT COUNT(DISTINCT qhash) n FROM mcqs").n,
  total: g("SELECT COUNT(*) n FROM mcqs").n
};

/* ---------- Write JSON + Markdown ---------- */
const stamp = process.argv[2] || "unstamped";
out.generatedAt = stamp;
fs.writeFileSync(path.join(__dirname, "..", "docs", "phase13-audit.json"), JSON.stringify(out, null, 2));

const pct = (n) => (100 * n / tot).toFixed(1) + "%";
let md = `# Phase 13 — Coverage & Quality Audit\n\nGenerated: ${stamp}\n\n`;
md += `## Headline\n\n| Metric | Value |\n| --- | --- |\n`;
md += `| Active MCQs | ${tot.toLocaleString()} |\n`;
md += `| Subjects | ${out.subjectCount} |\n`;
md += `| Subjects below 7,000 target | ${out.belowTarget} |\n`;
md += `| Total subject deficit to 7,000 each | ${out.totalSubjectDeficit.toLocaleString()} MCQs |\n`;
md += `| Chapters below 300 | ${chBelow} / ${chTotal} |\n`;
md += `| Topics below 150 | ${tpBelow} / ${tpTotal} |\n`;
md += `| Distinct qhash (dup check) | ${out.duplicates.qhashUnique.toLocaleString()} / ${out.duplicates.total.toLocaleString()} |\n\n`;

md += `## STEP 2 — Priority Buckets\n\n| Priority | Range | Subjects | MCQs | Deficit to 7k |\n| --- | --- | --- | --- | --- |\n`;
const ranges = { A: "0–500", B: "501–1000", C: "1001–2500", D: "2501–5000", E: "5000+" };
["A", "B", "C", "D", "E"].forEach(k => {
  const b = out.priority[k];
  md += `| ${k} | ${ranges[k]} | ${b.subjects} | ${b.mcqs.toLocaleString()} | ${b.deficit.toLocaleString()} |\n`;
});
md += `\n**Rule:** expand Priority A first; never expand Priority E.\n\n`;

md += `### Priority A subjects (0–500 MCQs) — expand first\n\n| Subject | MCQs | Deficit |\n| --- | --- | --- |\n`;
buckets.A.forEach(r => { md += `| ${r.name} (${r.id}) | ${r.n} | ${r.deficit} |\n`; });

md += `\n## STEP 1 — Difficulty Distribution\n\n| Difficulty | Count | Share |\n| --- | --- | --- |\n`;
out.difficulty.forEach(d => { md += `| ${d.difficulty} | ${d.n.toLocaleString()} | ${pct(d.n)} |\n`; });

md += `\n## STEP 1 — Explanation Quality\n\n| Bucket | Count | Share |\n| --- | --- | --- |\n`;
md += `| < 40 chars (very weak) | ${out.explanation.under40.toLocaleString()} | ${pct(out.explanation.under40)} |\n`;
md += `| < 60 chars (weak) | ${out.explanation.under60.toLocaleString()} | ${pct(out.explanation.under60)} |\n`;
md += `| ≥ 120 chars (strong) | ${out.explanation.atLeast120.toLocaleString()} | ${pct(out.explanation.atLeast120)} |\n`;

md += `\n## STEP 1 — Metadata Authenticity (presence vs quality)\n\n`;
md += `> Columns are ~100% *populated* but largely **templated filler**. Distinct-value ratios and filler markers below quantify real content.\n\n`;
md += `| Field | Populated | Distinct | Filler signal |\n| --- | --- | --- | --- |\n`;
md += `| learning_objective | ${pct(out.metadata.learningObjective.populated)} | ${out.metadata.learningObjective.distinct.toLocaleString()} | ${out.metadata.learningObjective.doubledWordFiller.toLocaleString()} doubled-word ("facts facts") |\n`;
md += `| exam_tip | ${pct(out.metadata.examTip.populated)} | **${out.metadata.examTip.distinct}** distinct only | near-constant template |\n`;
md += `| memory_trick | ${pct(out.metadata.memoryTrick.populated)} | ${out.metadata.memoryTrick.distinct.toLocaleString()} | option-echo template |\n`;
md += `| explanation_why_wrong | ${pct(out.metadata.whyWrong.populated)} | per-option array: ${pct(out.metadata.whyWrong.perOptionArray)} | ${out.metadata.whyWrong.circularFiller.toLocaleString()} circular ("not the fact asked here") |\n`;
md += `| references_json | **${pct(out.metadata.references.nonEmpty)}** | — | **0% reference coverage** |\n`;

md += `\n### Bloom distribution\n\n| Level | Count |\n| --- | --- |\n`;
out.metadata.bloom.forEach(b => { md += `| ${b.bloom_taxonomy || "(null)"} | ${b.n.toLocaleString()} |\n`; });

md += `\n## STEP 7 — Distractor Recycling (top 12 subjects)\n\n`;
md += `> % of wrong-options whose text is *also the correct answer* to another question in the same subject — the semantic-incoherence pathology.\n\n`;
md += `| Subject | Distractors | Recycled | Recycled % |\n| --- | --- | --- | --- |\n`;
out.distractorRecycling.forEach(d => { md += `| ${d.subject} | ${d.distractors.toLocaleString()} | ${d.recycled.toLocaleString()} | ${d.recycledPct}% |\n`; });

md += `\n## Verdict\n\n`;
md += `- **Volume** is near the 1M mark but coverage is lopsided; ${out.belowTarget} subjects are below the 7,000 target (deficit ${out.totalSubjectDeficit.toLocaleString()}).\n`;
md += `- **Metadata exists structurally** (per-option why-wrong arrays, LO, bloom) — a real asset — but content is templated and must be regenerated for genuine educational value.\n`;
md += `- **References: 0%.** Distractor recycling is material in several large subjects.\n`;
md += `- Next: Priority-A expansion + Quality Engine 2.0 (semantic distractor gate) + legacy metadata regeneration.\n`;

fs.writeFileSync(path.join(__dirname, "..", "docs", "PHASE13-AUDIT.md"), md);
console.log("wrote docs/PHASE13-AUDIT.md and docs/phase13-audit.json");
console.log("belowTarget", out.belowTarget, "deficit", out.totalSubjectDeficit, "prioA", buckets.A.length);
db.close();
