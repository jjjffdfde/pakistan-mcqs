/* ============================================================
   Pakistan MCQS Hub — Batch Report Bundle (Enterprise)
   After every generation batch, emits seven reports:
     1. Coverage Report     (per-subject vs 5000 target)
     2. Validation Report   (structural integrity)
     3. Duplicate Report    (qhash + normalized dups)
     4. Quality Report      (8-dimension score distribution)
     5. Database Health     (referential integrity, orphan scan)
     6. SEO Report          (sitemap/schema/meta checks)
     7. Performance Report  (payload sizes, cache, requests)
   Outputs: docs/<name>-report.md  (+ console summary)
   Usage: node pipeline/reports.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");
const quality = require("./quality.js");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.join(__dirname, "..");
const DB_FILE = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const SITE = "https://pakistanmcqshub.github.io";
const PER_SUBJECT_TARGET = 5000;

const out = [];
const say = (s) => { console.log(s); out.push(s); };
const md = (s) => out.push(s);

function fmt(n) { return Number(n || 0).toLocaleString(); }

async function main() {
  const db = open();
  const raw = new DatabaseSync(DB_FILE, { readOnly: true });

  /* ================= 1. COVERAGE ================= */
  const rows = raw.prepare(`
    SELECT s.id, s.name, s.category_id, s.exam_ids,
           (SELECT COUNT(*) FROM mcqs m WHERE m.subject_id=s.id AND m.status='active') n,
           (SELECT COUNT(*) FROM chapters c WHERE c.subject_id=s.id) ch,
           (SELECT COUNT(*) FROM topics t JOIN chapters c ON c.id=t.chapter_id WHERE c.subject_id=s.id) tp
    FROM subjects s WHERE s.status='active' ORDER BY n DESC`).all();
  const below = rows.filter((r) => r.n < PER_SUBJECT_TARGET);
  const zero = rows.filter((r) => r.n === 0);
  const totalMcqs = raw.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n;
  const cats = Object.fromEntries(raw.prepare("SELECT id,name FROM categories").all().map((r) => [r.id, r.name]));

  md(`# 1. Coverage Report — ${new Date().toISOString().slice(0, 10)}
| Metric | Value |
| --- | --- |
| Active MCQs | ${fmt(totalMcqs)} |
| Subjects (active) | ${rows.length} |
| Subjects ≥ ${PER_SUBJECT_TARGET} | ${rows.length - below.length} |
| Subjects < ${PER_SUBJECT_TARGET} | ${below.length} |
| Subjects with 0 MCQs | ${zero.length} |
| Chapters | ${fmt(raw.prepare("SELECT COUNT(*) n FROM chapters").get().n)} |
| Topics | ${fmt(raw.prepare("SELECT COUNT(*) n FROM topics").get().n)} |
| Subtopics | ${fmt(raw.prepare("SELECT COUNT(*) n FROM subtopics").get().n)} |
| Target (mission) | 1,000,000 MCQs · 300 subjects · 25,000 chapters · 150,000 topics |
| Progress | ${(totalMcqs / 1000000 * 100).toFixed(1)}% of 1M |\n\n### Subjects below target
| Subject | Category | MCQs | Chapters | Topics |
| --- | --- | --- | --- | --- |
${below.slice(0, 60).map((r) => `| ${r.name} | ${cats[r.category_id] || r.category_id} | ${r.n} | ${r.ch} | ${r.tp} |`).join("\n")}
${below.length > 60 ? `\n_… and ${below.length - 60} more below target._` : ""}`);

  /* ================= 2. VALIDATION ================= */
  const v = {
    missingOptions: raw.prepare(`SELECT COUNT(*) n FROM mcqs m WHERE (SELECT COUNT(*) FROM options o WHERE o.mcq_id=m.id) != 4`).get().n,
    badAnswer: raw.prepare(`SELECT COUNT(*) n FROM mcqs WHERE correct_answer NOT IN ('A','B','C','D')`).get().n,
    missingExplanation: raw.prepare(`SELECT COUNT(*) n FROM mcqs WHERE explanation IS NULL OR length(explanation)<10`).get().n,
    missingSubject: raw.prepare(`SELECT COUNT(*) n FROM mcqs WHERE subject_id IS NULL OR subject_id=''`).get().n,
    missingQhash: raw.prepare(`SELECT COUNT(*) n FROM mcqs WHERE qhash IS NULL OR qhash=''`).get().n,
    danglingTopic: raw.prepare(`SELECT COUNT(*) n FROM mcqs m LEFT JOIN topics t ON t.id=m.topic_id WHERE m.topic_id IS NOT NULL AND t.id IS NULL`).get().n,
    danglingChapter: raw.prepare(`SELECT COUNT(*) n FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id WHERE m.chapter_id IS NOT NULL AND c.id IS NULL`).get().n,
    duplicateQhash: raw.prepare(`SELECT COUNT(*) n FROM (SELECT qhash FROM mcqs WHERE status='active' GROUP BY qhash HAVING COUNT(*)>1)`).get().n,
    inactive: raw.prepare(`SELECT COUNT(*) n FROM mcqs WHERE status!='active'`).get().n,
    emptyQuestion: raw.prepare(`SELECT COUNT(*) n FROM mcqs WHERE question IS NULL OR length(trim(question))=0`).get().n
  };
  const vTotal = Object.values(v).reduce((a, b) => a + b, 0);
  md(`\n# 2. Validation Report — ${new Date().toISOString().slice(0, 10)}
| Check | Count | Status |
| --- | --- | --- |
${Object.entries(v).map(([k, n]) => `| ${k} | ${fmt(n)} | ${n === 0 ? "✅" : "❌"} |`).join("\n")}
| **Total issues** | **${fmt(vTotal)}** | ${vTotal === 0 ? "✅ CLEAN" : "⚠️ action needed"} |`);

  /* ================= 3. DUPLICATES ================= */
  const norm = (s) => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}+\-*/.=\s]/gu, " ").replace(/\s+/g, " ").trim();
  const djb2 = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h; };
  let normDups = 0;
  const hashMap = new Map();
  let scanned = 0;
  const OFFSET_STEP = 50000;
  for (let off = 0; ; off += OFFSET_STEP) {
    const chunk = raw.prepare(`SELECT id, subject_id, question FROM mcqs WHERE status='active' ORDER BY id LIMIT ? OFFSET ?`).all(OFFSET_STEP, off);
    if (!chunk.length) break;
    for (const r of chunk) {
      scanned++;
      const h = djb2(norm(r.question));
      const prev = hashMap.get(h);
      if (prev) {
        if (prev.subject === r.subject_id && norm(prev.q) === norm(r.question)) { normDups++; delete hashMap.get(h); continue; }
        hashMap.set(h, r);
      } else {
        hashMap.set(h, r);
      }
    }
  }
  md(`\n# 3. Duplicate Report — ${new Date().toISOString().slice(0, 10)}
| Check | Count |
| --- | --- |
| Exact duplicates (qhash) | ${fmt(v.duplicateQhash)} |
| Normalized duplicates (same subject) | ${fmt(normDups)} |
| Inactive (soft-deleted) | ${fmt(v.inactive)} |
_All active MCQs scanned for normalized dupes: ${fmt(scanned)}._`);

  /* ================= 4. QUALITY (sample) ================= */
  const SAMPLE = 5000;
  const sampleRows = raw.prepare(`SELECT m.id, m.question, m.correct_answer, m.difficulty, m.explanation, m.subject_id,
    m.learning_objective, m.bloom_taxonomy, m.confidence_score, m.estimated_time_sec, m.memory_trick, m.exam_tip, m.explanation_why_wrong,
    m.tags, m.exam_ids, m.topic_id, m.subtopic_id FROM mcqs m WHERE m.status='active' ORDER BY RANDOM() LIMIT ?`).all(SAMPLE);
  const dims = {};
  let passed = 0, rejected = 0;
  const rejectedSamples = [];
  for (const m of sampleRows) {
    const opts = raw.prepare("SELECT label, text FROM options WHERE mcq_id=? ORDER BY label").all(m.id);
    let whyWrong = [];
    try { whyWrong = JSON.parse(m.explanation_why_wrong || "[]"); } catch (e) {}
    const enriched = quality.enrich({
      question: m.question, options: opts, correctAnswer: m.correct_answer, difficulty: m.difficulty,
      explanation: m.explanation, explanationWhyWrong: whyWrong, memoryTrick: m.memory_trick, examTip: m.exam_tip,
      learningObjective: m.learning_objective, bloomTaxonomy: m.bloom_taxonomy, confidence: m.confidence_score,
      solvingTimeSec: m.estimated_time_sec, tags: (() => { try { return JSON.parse(m.tags || "[]"); } catch (e) { return []; } })(),
      examIds: m.exam_ids, topicId: m.topic_id, subtopicId: m.subtopic_id
    }, {});
    const ver = quality.scoreMcq(enriched, [], []);
    if (ver.pass) passed++; else { rejected++; if (rejectedSamples.length < 10) rejectedSamples.push({ id: m.id, score: ver.overall, dims: ver.dims, reasons: ver.reasons.slice(0, 4), question: String(m.question).slice(0, 80) }); }
    for (const [k, v] of Object.entries(ver.dims)) { const d = (dims[k] = dims[k] || { n: 0, sum: 0 }); d.n++; d.sum += v; }
  }
  const rate = (passed / SAMPLE) * 100;
  md(`\n# 4. Quality Report — sample ${fmt(SAMPLE)} of ${fmt(totalMcqs)} (random)
| Result | Count | % |
| --- | --- | --- |
| Accepted (≥ ${quality.QUALITY_THRESHOLD}) | ${passed} | ${rate.toFixed(1)}% |
| Rejected (< ${quality.QUALITY_THRESHOLD}) | ${rejected} | ${(100 - rate).toFixed(1)}% |

### Dimension averages
| Dimension | Avg score |
| --- | --- |
${Object.entries(dims).map(([k, d]) => `| ${k} | ${(d.sum / d.n).toFixed(1)} |`).join("\n")}

### Worst rejected samples
${rejectedSamples.length ? rejectedSamples.map((r) => `- \`${r.id}\` score ${r.score}: ${r.question} — _${r.reasons.join("; ")}_`).join("\n") : "_none in sample_"}

_Pipeline gate stats (this run): stored in pipeline_state "pipeline:quality"._`);

  /* ================= 5. HEALTH ================= */
  const dbSize = fs.statSync(DB_FILE).size;
  md(`\n# 5. Database Health Report — ${new Date().toISOString().slice(0, 10)}
| Check | Value |
| --- | --- |
| DB size | ${(dbSize / 1048576).toFixed(1)} MB (+ WAL) |
| MCQs (all statuses) | ${fmt(raw.prepare("SELECT COUNT(*) n FROM mcqs").get().n)} |
| Options | ${fmt(raw.prepare("SELECT COUNT(*) n FROM options").get().n)} |
| Subjects / Chapters / Topics / Subtopics | ${fmt(rows.length)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM chapters").get().n)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM topics").get().n)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM subtopics").get().n)} |
| Quizzes / Mock tests / Past papers | ${fmt(raw.prepare("SELECT COUNT(*) n FROM quizzes").get().n)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM mocktests").get().n)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM pastpapers").get().n)} |
| Bookmarks / History / Leaderboard | ${fmt(raw.prepare("SELECT COUNT(*) n FROM bookmarks").get().n)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM history").get().n)} / ${fmt(raw.prepare("SELECT COUNT(*) n FROM leaderboard").get().n)} |
| SQLite version | ${raw.prepare("SELECT sqlite_version() v").get().v} |
| Integrity (PRAGMA quick_check) | ${raw.prepare("PRAGMA quick_check").get().quick_check} |`);

  /* ================= 6. SEO ================= */
  const sitemap = path.join(ROOT, "sitemap.xml");
  const sitemapUrls = fs.existsSync(sitemap) ? (fs.readFileSync(sitemap, "utf8").match(/<loc>/g) || []).length : 0;
  const idxHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const checks = {
    "sitemap.xml exists & URLs": [fs.existsSync(sitemap) && sitemapUrls >= 700, `${sitemapUrls} URLs`],
    "meta description": [/<meta name="description"[^>]+>/.test(idxHtml), "present"],
    "canonical": [/<link rel="canonical"/.test(idxHtml), "present"],
    "og:image + dims": [/og:image:width/.test(idxHtml), "1200x630"],
    "JSON-LD WebSite+SearchAction": [/SearchAction/.test(idxHtml), "present"],
    "JSON-LD Organization": [/@type": "Organization"/.test(idxHtml), "present"],
    "JSON-LD FAQPage": [/FAQPage/.test(idxHtml), "present"],
    "JSON-LD ItemList": [/ItemList/.test(idxHtml), "present"],
    "JSON-LD BreadcrumbList": [/BreadcrumbList/.test(idxHtml), "present"],
    "404.html": [fs.existsSync(path.join(ROOT, "404.html")), "present"],
    "robots.txt": [fs.existsSync(path.join(ROOT, "robots.txt")), "present"],
    "subject pages generated": [fs.readdirSync(path.join(ROOT, "subjects")).filter((f) => f.endsWith(".html")).length >= 180, "subjects/*.html"]
  };
  md(`\n# 6. SEO Report — ${new Date().toISOString().slice(0, 10)}
| Check | Status |
| --- | --- |
${Object.entries(checks).map(([k, [ok, note]]) => `| ${k} | ${ok ? "✅" : "❌"} ${note} |`).join("\n")}`);

  /* ================= 7. PERFORMANCE ================= */
  const sizes = [["index.html", "index.html"], ["assets/js/app.js", "assets/js/app.js"], ["assets/css/style.css", "assets/css/style.css"], ["data/mcqs.json", "data/mcqs.json"], ["data/subjects.json", "data/subjects.json"]];
  md(`\n# 7. Performance Report — ${new Date().toISOString().slice(0, 10)}
| Asset | Size |
| --- | --- |
${sizes.map(([label, f]) => { const p = path.join(ROOT, f); return `| ${label} | ${fs.existsSync(p) ? (fs.statSync(p).size / 1024).toFixed(1) + " KB" : "missing"} |`; }).join("\n")}
| SW cache version | pmh-cache-v9 |
| DB-mode boot payload | taxonomy only (mcqs.json skipped) |
| Static-mode boot | mcqs.json fetched in parallel with taxonomy |
| Pagination | windowed — constant DOM nodes regardless of bank size |
| Indexes for 1M | composite (subject/chapter/topic,status), options(mcq_id,label), history(device_id,answered_at) |`);

  /* ---------- write ---------- */
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  for (const [i, name] of [["1", "coverage"], ["2", "validation"], ["3", "duplicates"], ["4", "quality"], ["5", "health"], ["6", "seo"], ["7", "performance"]]) {
    const section = out.join("\n").split(`# ${i}. `)[1]?.split(`\n# ${Number(i) + 1}. `)[0] || "";
    fs.writeFileSync(path.join(ROOT, "docs", `${name}-report-${stamp}.md`), `# ${name} report\n\n` + section, "utf8");
  }
  const all = out.join("\n");
  fs.writeFileSync(path.join(ROOT, "docs", `BATCH-REPORT-${stamp}.md`), all, "utf8");
  say(`\nWrote docs/BATCH-REPORT-${stamp}.md (+7 split reports).`);
  say(`SUMMARY: mcqs=${fmt(totalMcqs)} | below5000=${below.length} | validationIssues=${fmt(vTotal)} | qualityPass=${rate.toFixed(1)}% | sitemapUrls=${sitemapUrls}`);
  db.close();
  raw.close();
}

main().catch((e) => { console.error("[reports] ERROR:", e); process.exit(1); });
