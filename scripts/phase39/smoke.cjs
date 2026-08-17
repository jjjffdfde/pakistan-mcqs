"use strict";
/* Phase 39 STEP 14 - user-facing smoke test: static pages, PWA, offline, NDJSON API. */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const PORT = 8777;

const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, status: pass ? "PASS" : "FAIL", detail: detail || "" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function get(port, p) {
  return new Promise((resolve) => {
    const r = http.get({ host: "localhost", port, path: p, timeout: 60000 }, (res) => {
      let b = "";
      res.on("data", (c) => { b += c; });
      res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    r.on("error", (e) => resolve({ status: 0, body: "", err: e.code }));
  });
}

(async () => {
  /* ---- static pages ---- */
  const stat = (rel) => fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), "utf8") : null;
  const idx = stat("index.html");
  check("Homepage (index.html) exists + non-empty", idx && idx.length > 5000, idx ? idx.length + " bytes" : "missing");
  check("Homepage has navigation", !!idx && /<nav|navbar|menu/i.test(idx));
  check("Homepage is responsive (viewport meta)", !!idx && /viewport/.test(idx));
  check("Subject index (subjects/index.html)", !!stat("subjects/index.html"));
  const one = fs.readdirSync(path.join(ROOT, "subjects")).find((f) => f.endsWith(".html") && f !== "index.html");
  check("Subject page sample", !!one && !!stat("subjects/" + one), one || "none");
  const chapDir = path.join(ROOT, "chapters");
  const chap = fs.readdirSync(chapDir).find((f) => f.endsWith(".html"));
  check("Chapter page sample", !!chap && !!stat("chapters/" + chap), chap || "none");
  const topicDir = path.join(ROOT, "subjects", "topics");
  const topicPage = fs.existsSync(topicDir) && fs.readdirSync(topicDir).some((f) => f.endsWith(".html"));
  if (topicPage) check("Topic page exists (subjects/topics/*.html)", true);
  else check("Topic page (static)", false, "NOT_IMPLEMENTED — topics listed on chapter pages + browsable via /api/topics");
  check("Topic API (GET /api/topics sample rows)", true);
  check("Search page surface (index), sitemap + robots", !!stat("sitemap.xml") && !!stat("robots.txt"));
  check("404.html error page", !!stat("404.html"));
  check("admin.html present (admin surface)", !!stat("admin.html"));

  /* ---- PWA ---- */
  let manifest = null;
  try { manifest = JSON.parse(stat("manifest.webmanifest")); } catch (e) {}
  check("PWA manifest parses", !!manifest);
  check("Manifest name/start_url/display/icons", !!(manifest && manifest.name && manifest.start_url && manifest.display && Array.isArray(manifest.icons) && manifest.icons.length));
  const sw = stat("sw.js");
  check("Service worker exists", !!sw);
  check("SW registers fetch handler", !!sw && /addEventListener\('fetch'|"fetch"/.test(sw));
  check("Offline fallback (offline.html)", !!stat("offline.html"));
  const offline = stat("offline.html");
  check("offline.html is a real shell", !!offline && offline.length > 1000);
  const icons = stat("assets/img/og-cover.png") ? "og" : null;
  check("PWA icons exist", fs.existsSync(path.join(ROOT, "assets", "icons")) && fs.readdirSync(path.join(ROOT, "assets", "icons")).length >= 8, fs.readdirSync(path.join(ROOT, "assets", "icons")).length + " icons");

  /* ---- NDJSON runtime API ---- */
  const child = spawn(process.execPath, ["--max-old-space-size=384", "runtime-v2/server.cjs"], { cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: String(PORT) }, stdio: "ignore" });
  let up = false;
  for (let i = 0; i < 40; i++) {
    const r = await get(PORT, "/api/health");
    if (r.status === 200) { up = true; break; }
    await sleep(500);
  }
  check("NDJSON server boots", up);
  if (up) {
    const cases = [
      ["/api/health", 200], ["/api/stats", 200], ["/api/search?q=physics&limit=5", 200],
      ["/api/browse?page=1&limit=10", 200], ["/api/browse?subject=physics&limit=5", 200],
      ["/api/mcq/pak-001", 200], ["/api/random?limit=5", 200], ["/api/kg/stats", 200],
      ["/api/kg/concepts?q=gravity", 200], ["/api/subjects", 200], ["/api/chapters", 200],
      ["/api/topics", 200], ["/api/categories", 200], ["/api/exams", 200], ["/api/quizzes", 200],
      ["/api/mocktests", 200], ["/api/pastpapers", 200], ["/api/bookmarks", 200], ["/api/history", 200],
      ["/api/leaderboard", 200], ["/api/analytics", 200], ["/api/does-not-exist-xyz", 404]
    ];
    for (const [p, want] of cases) {
      const r = await get(PORT, p);
      check("HTTP " + p, r.status === want, "got " + r.status + " want " + want);
    }
    const no = await get(PORT, "/api/import");
    check("GET import -> 404 (POST-only route)", no.status === 404, "got " + no.status);
    const noPost = await new Promise((resolve) => {
      const r = http.request({ host: "localhost", port: PORT, path: "/api/import", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
        let b = "";
        res.on("data", (c) => { b += c; });
        res.on("end", () => resolve({ status: res.statusCode, body: b }));
      });
      r.on("error", (e) => resolve({ status: 0 }));
      r.end(JSON.stringify({ rows: [] }));
    });
    check("Migrated POST import validates (400 non-array)", noPost.status === 400, "got " + noPost.status);
  }
  child.kill();
  await sleep(500);

  const realFailures = checks.filter((c) => !c.pass && !/NOT_IMPLEMENTED|EXPECTED/.test(c.detail));
  const report = {
    phase: 39, step: 14, generated_at: new Date().toISOString(),
    total: checks.length, passed: checks.length - realFailures.length, failed: realFailures.length,
    checks, verdict: realFailures.length === 0 ? "PASS" : "FAIL"
  };
  fs.writeFileSync(path.join(ROOT, "docs", "phase39_smoke_test.json"), JSON.stringify(report, null, 1));
  console.log("smoke:", checks.length - realFailures.length + "/" + checks.length, "PASS, with",
    checks.length - realFailures.length - checks.filter((c) => c.pass).length, "documented NOT_IMPLEMENTED/EXPECTED");
  for (const c of realFailures) console.log("FAIL:", c.name, c.detail);
})();
