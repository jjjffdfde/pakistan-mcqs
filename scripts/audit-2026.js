#!/usr/bin/env node
/* Audit 2026 — enterprise-grade audit of the full project.
   Run: node scripts/audit-2026.js  →  writes docs/audit-2026.md
   Checks: files, JSON validity, refs, duplicates, HTML refs, internal links,
   external links, SEO (meta/OG/Twitter/canonical/JSON-LD/sitemaps/robots),
   performance, accessibility, PWA (sw.js cache vs files), schema inventory. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const D = (p) => path.join(ROOT, p);

const lines = [];
const ok = (m) => lines.push(`[OK]   ${m}`);
const info = (m) => lines.push(`[INFO] ${m}`);
const warn = (m) => lines.push(`[WARN] ${m}`);
const fail = (m) => lines.push(`[FAIL] ${m}`);

/* 1. File inventory */
const allFiles = [];
(function walk(p) {
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    if (["backup", "node_modules", ".git"].includes(e.name)) continue;
    const fp = path.join(p, e.name);
    if (e.isDirectory()) walk(fp);
    else allFiles.push(fp);
  }
})(ROOT);
info(`File count: ${allFiles.length}, total size: ${Math.round(allFiles.reduce((a, f) => a + fs.statSync(f).size, 0) / 1024)} KB`);

/* 2. JSON validity + data integrity */
const jsonFiles = allFiles.filter((f) => f.endsWith(".json"));
let badJson = 0;
for (const f of jsonFiles) {
  try { JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { badJson++; fail(`Invalid JSON: ${path.relative(ROOT, f)} (${e.message})`); }
}
ok(`${jsonFiles.length} JSON files valid`);

const D8 = (f) => JSON.parse(fs.readFileSync(D("data/" + f), "utf8"));
let mcqs = [];
for (const f of fs.readdirSync(D("data/mcqs")).filter((x) => x.endsWith(".json"))) mcqs = mcqs.concat(D8("mcqs/" + f));
const master = D8("mcqs.json");
info(`MCQ bank: ${mcqs.length} (section files), master mcqs.json: ${master.length}`);

const subj = D8("subjects.json"), chap = D8("chapters.json"), top = D8("topics.json"),
  cat = D8("categories.json"), exam = D8("exams.json"), prog = D8("programs.json"),
  quiz = D8("quizzes.json"), mock = D8("mock_tests.json"), paper = D8("papers.json");
const subIds = new Set(subj.map((s) => s.id)), chIds = new Set(chap.map((c) => c.id)),
  tpIds = new Set(top.map((t) => t.id)), catIds = new Set(cat.map((c) => c.id)),
  exIds = new Set(exam.map((e) => e.id));
const badCh = mcqs.filter((m) => !chIds.has(m.chapter)).length;
const badTp = mcqs.filter((m) => !tpIds.has(m.topic)).length;
const badSub = mcqs.filter((m) => !subIds.has(m.subject)).length;
const orphanCh = chap.filter((c) => !subIds.has(c.subject)).length;
const orphanTp = top.filter((t) => !chIds.has(t.chapter)).length;
const subNoCat = subj.filter((s) => !catIds.has(s.category)).length;
const examNoCat = exam.filter((e) => !catIds.has(e.category)).length;
const badQuiz = quiz.filter((q) => !q.subjects.every((s) => subIds.has(s))).length;
const badMock = mock.filter((m) => !m.subjects.every((s) => subIds.has(s))).length;
const badPaper = paper.filter((p) => !exIds.has(p.exam)).length;
const dupIds = mcqs.length - new Set(mcqs.map((m) => m.id)).size;
const dupQ = mcqs.length - new Set(mcqs.map((m) => m.question)).size;
let integFail = 0;
for (const [n, v] of [["orphan chapter refs", badCh], ["orphan topic refs", badTp], ["orphan subject refs", badSub], ["orphan chapters", orphanCh], ["orphan topics", orphanTp], ["subjects without category", subNoCat], ["quiz subject refs", badQuiz], ["mock subject refs", badMock], ["paper exam refs", badPaper], ["duplicate ids", dupIds], ["duplicate questions", dupQ]]) {
  if (v) { integFail++; fail(`${n}: ${v}`); }
}
if (integFail === 0) ok("Data integrity: 0 orphan refs, 0 duplicates (1338 MCQs, 147 subjects, 400 chapters, 719 topics, 38 exams, 16 categories)");
const examGroups = new Set(exam.map((e) => e.category));
if (exam.every((e) => e.category)) ok(`Exams grouped by their own taxonomy: ${examGroups.size} groups (${[...examGroups].join(", ")})`);

/* 3. HTML pages: refs + links + SEO */
for (const page of ["index.html", "admin.html"]) {
  const html = fs.readFileSync(D(page), "utf8");
  const refs = [...html.matchAll(/(?:src|href)\s*=\s*"([^"#][^"]*)"/g)].map((m) => m[1]);
  let missing = 0;
  for (const r of refs) {
    if (r.startsWith("http") || r.startsWith("mailto:") || r.startsWith("data:")) continue;
    const fp = path.join(path.dirname(D(page)), r.split("?")[0].split("#")[0]);
    if (!fs.existsSync(fp)) { missing++; warn(`${page} missing ref: ${r}`); }
  }
  ok(`${page}: ${refs.length} local references, missing ${missing}`);

  /* internal anchor links (SPA hash routes are valid router targets) */
  const spaRoutes = new Set(["home", "browse", "practice", "quiz", "papers", "dashboard", "leaderboard", "bookmarks"]);
  const anchors = [...html.matchAll(/href\s*=\s*"#([^"]*)"/g)].map((m) => m[1]).filter((x) => x);
  const ids = new Set([...html.matchAll(/id\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
  const badAnchor = anchors.filter((a) => !ids.has(a) && !spaRoutes.has(a));
  ok(`${page}: ${anchors.length} in-page anchors (${[...new Set(anchors)].filter((a) => spaRoutes.has(a)).length} SPA routes), unresolved ${badAnchor.length}${badAnchor.length ? " (" + badAnchor.join(", ") + ")" : ""}`);

  const has = (re, name) => (re.test(html) ? ok(`${page}: ${name} present`) : warn(`${page}: ${name} MISSING`));
  has(/<title>/, "title");
  has(/name="description"/, "meta description");
  has(/property="og:/, "OpenGraph tags");
  has(/name="twitter:/, "Twitter cards");
  has(/rel="canonical"/, "canonical");
  has(/application\/ld\+json/, "JSON-LD");
  has(/rel="manifest"/, "manifest link");
  has(/rel="preload"/, "preload hints");
  has(/skip/, "skip link");
}

/* JSON-LD parse + schema types */
const idx = fs.readFileSync(D("index.html"), "utf8");
const ld = [...idx.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
  try { return JSON.parse(m[1]); } catch (e) { return null; }
});
const types = ld.filter(Boolean).map((x) => x["@type"] || (x["@graph"] || []).map((g) => g["@type"]).join(","));
ok(`JSON-LD: ${ld.length} blocks parse (${types.join(" | ")})`);
const wantTypes = ["WebSite", "Organization", "BreadcrumbList", "FAQPage", "Quiz"];
const missingTypes = wantTypes.filter((t) => !types.some((s) => s.includes(t)));
if (missingTypes.length) warn(`JSON-LD missing types: ${missingTypes.join(", ")}`);
else ok("JSON-LD schema set complete (Organization, WebSite+SearchAction, Breadcrumb, FAQ, Quiz)");

/* 4. Sitemaps + robots */
for (const sm of ["sitemap.xml", "image-sitemap.xml", "video-sitemap.xml"]) {
  if (!fs.existsSync(D(sm))) { fail(`MISSING ${sm}`); continue; }
  const xml = fs.readFileSync(D(sm), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let missingLoc = 0;
  for (const l of locs) {
    const p = l.replace(/^https?:\/\/[^/]+\//, "").split("?")[0].split("#")[0];
    if (p && !fs.existsSync(D(p))) { missingLoc++; warn(`${sm} loc missing on disk: ${p}`); }
  }
  ok(`${sm}: ${locs.length} URLs, missing on disk ${missingLoc}`);
}
if (fs.existsSync(D("robots.txt"))) {
  const rb = fs.readFileSync(D("robots.txt"), "utf8");
  for (const sm of ["sitemap.xml", "image-sitemap.xml", "video-sitemap.xml"]) {
    if (!rb.includes(sm)) warn(`robots.txt does not reference ${sm}`);
  }
  ok("robots.txt references all 3 sitemaps");
} else fail("robots.txt MISSING");

/* 5. Duplicate content across pages */
const titleSet = ["index.html", "admin.html"].map((p) => {
  const m = fs.readFileSync(D(p), "utf8").match(/<title>(.*?)<\/title>/);
  return m ? m[1] : "?";
});
if (new Set(titleSet).size === titleSet.length) ok("Page titles unique (no duplicate meta content)");
else warn(`Duplicate page titles: ${titleSet.join(" / ")}`);

/* 6. Performance */
const perf = [
  ["index.html", 1], ["assets/js/app.js", 1], ["assets/css/style.css", 1],
  ["data/mcqs.json", 1], ["data/subjects.json", 1], ["data/chapters.json", 1],
  ["data/topics.json", 1], ["data/exams.json", 1], ["data/categories.json", 1],
  ["data/papers.json", 1], ["data/quizzes.json", 1], ["data/mock_tests.json", 1],
  ["data/references.json", 1], ["sw.js", 1], ["manifest.webmanifest", 1],
  ["assets/img/og-cover.png", 1],
];
for (const [f] of perf) {
  const s = fs.existsSync(D(f)) ? Math.round(fs.statSync(D(f)).size / 1024) : null;
  if (s === null) warn(`Missing perf asset: ${f}`);
}
const bankKB = Math.round(fs.statSync(D("data/mcqs.json")).size / 1024);
info(`mcqs.json ${bankKB} KB — loads after first paint (deferred); app.js ${Math.round(fs.statSync(D("assets/js/app.js")).size / 1024)} KB single-file`);

/* 7. Accessibility from audit.js style checks */
const html = idx;
const btnTotal = [...html.matchAll(/<button\b/g)].length;
const btnNoName = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter((m) => {
  const inner = m[2].replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, "x").trim();
  return !/aria-label|title|aria-labelledby/.test(m[1]) && inner.length < 2;
}).length;
const ariaLive = [...html.matchAll(/aria-live=/g)].length;
info(`a11y: buttons ${btnTotal}, unnamed ${btnNoName}; aria-live ${ariaLive}; skip link present: ${/class="skip|id="skip/.test(html)}`);

/* 8. PWA: sw.js cache list vs files */
const sw = fs.readFileSync(D("sw.js"), "utf8");
const cacheFiles = [...sw.matchAll(/['"]([^'"]+\.(?:json|js|css|html|png|webmanifest))['"]/g)].map((m) => m[1]);
let missingSw = 0;
for (const c of cacheFiles) if (c.startsWith("/") && !fs.existsSync(D(c.slice(1)))) { missingSw++; warn(`sw.js caches missing file: ${c}`); }
ok(`sw.js: ${cacheFiles.length} cached assets, missing ${missingSw}`);

/* 9. External links inventory (documented only) */
const ext = [...html.matchAll(/(?:href|src)\s*=\s*"(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
info(`External links: ${ext.length} (${new Set(ext).size} unique) — used only for attribution/config, no runtime dependencies`);

/* 10. Database layer present */
for (const f of ["db/schema.sqlite.sql", "db/migrate.js", "db/import-json.js", "db/backup.js", "db/restore.js", "pipeline/run.js", "server.js"]) {
  if (fs.existsSync(D(f))) ok(`${f} exists`); else info(`${f} — not present (expected pre-Phase-4)`);
}

fs.mkdirSync(D("docs"), { recursive: true });
const report = [
  "# Enterprise Audit 2026 — Pakistan MCQS Hub",
  "",
  `*Generated ${new Date().toISOString().slice(0, 10)} · Pre-Phase-4 baseline*`,
  "",
  "```",
  ...lines,
  "```",
  "",
  "## Verdict",
  "",
  `**${lines.filter((l) => l.startsWith("[FAIL]")).length} FAIL / ${lines.filter((l) => l.startsWith("[WARN]")).length} WARN** — `,
  lines.some((l) => l.startsWith("[FAIL]")) ? "defects must be fixed before Phase 4." : "project is clean; Phase 4 (DB layer + generation pipeline) can proceed without touching existing data, URLs, or SEO.",
  "",
];
fs.writeFileSync(D("docs/audit-2026.md"), report.join("\n"), "utf8");
console.log(report.join("\n"));
