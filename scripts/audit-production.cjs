/* ============================================================
   Production URL Audit â€” Pakistan MCQs Hub
   Checks the LIVE deployed site for:
     - wrong domain / canonical mismatches
     - localhost references
     - broken internal links (full crawl of sitemap URLs)
     - sitemap + robots.txt integrity
     - JSON-LD validity on key pages
     - config vs homepage counter consistency
   Safe to rerun any time. Usage:
     node scripts/audit-production.cjs [baseUrl]
     npm run audit:production
   Exit code 0 = PASS, 1 = FAIL (report written to docs/audit_production_report.json)
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OLD_DOMAIN = "pakistanmcqshub.github.io";
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site-config.json"), "utf8"));
/* Declared production base (source of truth) â€” domain/canonical checks use this. */
const PROD = (CONFIG.site.baseUrl || "https://jjjffdfde.github.io/pakistan-mcqs/").replace(/\/+$/, "") + "/";
const PROD_HOST = new URL(PROD).origin;
/* Audit target â€” the live deployment by default, or any local server for pre-push checks. */
const TARGET = (process.argv[2] || PROD).replace(/\/+$/, "") + "/";
const TARGET_HOST = new URL(TARGET).origin;

const report = { base: TARGET, prod: PROD, runAt: new Date().toISOString(), checks: {}, failures: [], warnings: [] };
let pass = true;
const fail = (check, msg) => { pass = false; report.failures.push({ check, msg }); };
const warn = (check, msg) => report.warnings.push({ check, msg });

const fetchText = async (url, timeout = 30000) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: "follow" });
    const body = await res.text();
    return { status: res.status, finalUrl: res.url, body };
  } finally { clearTimeout(t); }
};

async function pool(items, worker, concurrency = 10) {
  const out = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      try { out[idx] = await worker(items[idx], idx); } catch (e) { out[idx] = { error: e.message }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return out;
}

(async () => {
  /* ---------- 1. robots.txt ---------- */
  const robots = await fetchText(new URL("robots.txt", TARGET).href);
  report.checks.robots = { status: robots.status };
  if (robots.status !== 200) fail("robots", "robots.txt not reachable");
  else {
    const sitemapLines = robots.body.split(/\r?\n/).filter((l) => /^Sitemap:/i.test(l));
    if (!sitemapLines.length) fail("robots", "robots.txt has no Sitemap entries");
    for (const l of sitemapLines) {
      const u = l.replace(/^Sitemap:\s*/i, "").trim();
      if (u.startsWith(OLD_DOMAIN)) fail("robots", "sitemap URL on old domain: " + u);
      if (!u.startsWith(PROD_HOST + "/")) fail("robots", "sitemap URL not on declared production host: " + u);
    }
    if (robots.body.includes(OLD_DOMAIN)) fail("robots", "robots.txt contains old domain");
  }

  /* ---------- 2. sitemap.xml ---------- */
  const sm = await fetchText(new URL("sitemap.xml", TARGET).href);
  report.checks.sitemap = { status: sm.status };
  if (sm.status !== 200) fail("sitemap", "sitemap.xml not reachable");
  else {
    if (!sm.body.includes("<urlset")) fail("sitemap", "sitemap.xml missing <urlset> root");
    const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    report.checks.sitemap.urls = locs.length;
    if (locs.length < 900) fail("sitemap", "sitemap too small: " + locs.length);
    const dupes = locs.filter((u, i) => locs.indexOf(u) !== i);
    if (dupes.length) fail("sitemap", "duplicate URLs: " + dupes.length + " (" + dupes[0] + ")");
    const bad = locs.filter((u) => !u.startsWith(PROD_HOST + "/") || u.includes(OLD_DOMAIN) || u.includes("localhost") || u.includes("127.0.0.1"));
    if (bad.length) fail("sitemap", bad.length + " URLs outside host or on old/local domain: " + bad[0]);

    /* ---------- 3. full crawl of sitemap URLs ---------- */
    const crawlLocs = locs.map((u) => (u.startsWith(PROD) && TARGET !== PROD) ? TARGET + u.slice(PROD.length) : u);
    const results = await pool(crawlLocs, async (u) => (await fetchText(u)).status, 10);
    const broken = crawlLocs.filter((u, i) => results[i] !== 200);
    report.checks.crawl = { total: locs.length, ok: locs.length - broken.length, broken: broken.length };
    if (broken.length) fail("crawl", broken.length + " broken sitemap URLs, first: " + broken[0]);
  }

  /* ---------- 4. homepage metadata ---------- */
  const home = await fetchText(TARGET);
  report.checks.home = { status: home.status };
  if (home.status !== 200) fail("home", "homepage not reachable");
  else {
    const canon = (home.body.match(/rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canon) fail("home", "no canonical on homepage");
    else if (canon.replace(/\/+$/, "") !== PROD.replace(/\/+$/, "")) fail("home", "canonical mismatch: " + canon);
    const og = (home.body.match(/property="og:url" content="([^"]+)"/) || [])[1];
    if (og && og.replace(/\/+$/, "") !== PROD.replace(/\/+$/, "")) fail("home", "og:url mismatch: " + og);
    if (home.body.includes(OLD_DOMAIN)) fail("home", "homepage contains old domain");
    if (home.body.includes("localhost")) warn("home", "homepage contains 'localhost' (check context)");

    /* JSON-LD blocks */
    const blocks = [...home.body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    report.checks.home.jsonld = blocks.length;
    for (const [i, b] of blocks.entries()) {
      try { const j = JSON.parse(b); if (JSON.stringify(j).includes(OLD_DOMAIN)) fail("home", "JSON-LD block " + i + " contains old domain"); if (JSON.stringify(j).includes("localhost")) fail("home", "JSON-LD block " + i + " contains localhost"); }
      catch (e) { fail("home", "JSON-LD block " + i + " invalid JSON: " + e.message); }
    }

    /* config vs homepage counters */
    const st = CONFIG.dataset.staticBank;
    for (const v of [st.mcqs, st.subjects, st.chapters, st.topics]) {
      if (!home.body.includes(v.toLocaleString())) warn("home", "homepage does not contain verified count " + v.toLocaleString() + " as static fallback");
    }
  }

  /* ---------- 5. internal link crawl on key pages ---------- */
  const keyPages = ["subjects/index.html", "subjects/pakistan-affairs.html", "subjects/css-exam.html"];
  for (const p of keyPages) {
    const r = await fetchText(new URL(p, TARGET).href);
    if (r.status !== 200) { fail("links", p + " -> " + r.status); continue; }
    const links = [...r.body.matchAll(/href="([^"#][^"]*)"/g)].map((m) => m[1])
      .filter((u) => !/^https?:\/\/(?!jjjffdfde\.github\.io)/.test(u) || u.startsWith(HOST + "/"))
      .filter((u) => !u.startsWith("mailto:") && !u.startsWith("tel:") && !u.startsWith("data:") && !u.startsWith("javascript:") && !u.startsWith("http://localhost") && !u.startsWith("http://127.0.0.1"));
    const absolutes = [...r.body.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    for (const u of absolutes) {
      if (u.includes(OLD_DOMAIN)) fail("links", p + " links to old domain: " + u);
      if (u.includes("localhost") || u.includes("127.0.0.1")) fail("links", p + " links to localhost: " + u);
    }
    for (const u of links) {
      const abs = new URL(u, new URL(p, TARGET).href).href;
      if (new URL(abs).origin !== TARGET_HOST) continue;
      const rr = await fetchText(abs);
      if (rr.status !== 200) fail("links", abs + " -> " + rr.status);
    }
  }

  /* ---------- 6. local repo scan for old domain / localhost ---------- */
  const liveExt = new Set([".html", ".js", ".json", ".txt", ".xml", ".webmanifest", ".yml", ".yaml", ".css", ".cjs"]);
  const skipDirs = /^docs\/|CHANGELOG|RELEASE|^\.audit|node_modules|package-lock/;
  /* historical pipeline scripts + the audit script itself legitimately contain the old-domain constant */
  const skipFiles = (rel) => rel === "scripts/audit-production.cjs" || /^scripts\/phase\d/.test(rel);
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      const rel = p.replace(/\\/g, "/").replace(ROOT.replace(/\\/g, "/"), "").replace(/^\//, "");
      if (e.isDirectory()) { if (!skipDirs.test(rel) && !skipFiles(rel)) walk(p); continue; }
      const ext = path.extname(p).toLowerCase();
      if (!liveExt.has(ext)) continue;
      if (skipDirs.test(rel) || skipFiles(rel)) continue;
      if (fs.statSync(p).size > 4 * 1024 * 1024) continue;
      files.push(p);
    }
  })(ROOT);
  const oldDomainFiles = [], localhostFiles = [];
  for (const f of files) {
    const rel = f.replace(/\\/g, "/").replace(ROOT.replace(/\\/g, "/"), "").replace(/^\//, "");
    const txt = fs.readFileSync(f, "utf8");
    if (txt.includes(OLD_DOMAIN)) oldDomainFiles.push(rel);
    if (/localhost(?!\.)/.test(txt) && !/^\s*\/\*/.test(txt) && rel.endsWith(".js")) localhostFiles.push(rel);
  }
  report.checks.repo = { scanned: files.length, oldDomain: oldDomainFiles, localhostJs: localhostFiles };
  if (oldDomainFiles.length) fail("repo", "old domain still present in: " + oldDomainFiles.slice(0, 5).join(", "));
  if (localhostFiles.length) warn("repo", "localhost present in JS (dev-only expected): " + localhostFiles.join(", "));

  /* ---------- output ---------- */
  fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "docs", "audit_production_report.json"), JSON.stringify(report, null, 2));
  console.log("Production audit for " + TARGET);
  console.log("  failures: " + report.failures.length + "  warnings: " + report.warnings.length);
  if (report.checks.crawl) console.log("  crawl: " + report.checks.crawl.ok + "/" + report.checks.crawl.total + " OK, " + report.checks.crawl.broken + " broken");
  for (const f of report.failures) console.log("  FAIL " + f.check + ": " + f.msg);
  for (const w of report.warnings) console.log("  WARN " + w.check + ": " + w.msg);
  console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
  process.exit(pass ? 0 : 1);
})();
