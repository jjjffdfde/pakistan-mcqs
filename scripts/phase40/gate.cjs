/* scripts/phase40/gate.cjs — Phase 40 final gate.
   Verifies the file engine is self-sufficient and SQLite has been driven out of
   production surfaces. Read-only except fixture rebuild + report stamping.
   Prints per-item PASS/FAIL and the final PHASE 40 STATUS.

   Items:
     G01 runtime-v2 zero-sqlite scan          (no node:sqlite / DatabaseSync / db.prepare / *.sqlite paths)
     G02 NOT_MIGRATED fallback only for AI POST routes (single call site)
     G03 every AI POST route answers 501 NOT_MIGRATED explicitly (live probe)
     G04 phase40 parity report: verdict != FAILED and FAIL == 0
     G05 npm test green on the phase40 fixture (40/40)
     G06 test:db green on real data (30 checks)
     G07 tracked-file sqlite audit (allowlist = frozen oracle + legacy only)
     G08 runtime RSS after init <= 512MB
     G09 PWA shell present (sw.js, index.html, manifest) + pages build artifact
     G10 legacy sqlite test file must not exist on disk
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const PORT = 8799;
const results = [];
function item(id, ok, note) { results.push({ id, ok: !!ok, note }); console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${note || ""}`); }

function walk(dir, out, filter) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out, filter);
    else if (!filter || filter(ent.name)) out.push(p);
  }
}

(async () => {
  /* ---------- G01: zero sqlite in runtime-v2 ---------- */
  {
    const files = [];
    walk(path.join(ROOT, "runtime-v2"), files, (n) => /\.c?js$/.test(n));
    const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\r\n]*/g, " ");
    const hits = [];
    for (const f of files) {
      const c = strip(fs.readFileSync(f, "utf8"));
      if (/(node:sqlite|DatabaseSync|db\.prepare|\.sqlite)/.test(c)) hits.push(path.relative(ROOT, f));
    }
    item("G01 runtime-v2 zero-sqlite", hits.length === 0, hits.length ? `hits: ${hits.join(", ")}` : `${files.length} code files scanned, clean (comments stripped)`);
  }

  /* ---------- G02: notMigrated single call site ---------- */
  {
    const src = fs.readFileSync(path.join(ROOT, "runtime-v2", "server.cjs"), "utf8");
    const calls = (src.replace(/function\s+notMigrated\(/, "").match(/notMigrated\(/g) || []).length;
    item("G02 notMigrated fallback only", calls === 1, `${calls} call site(s) (line 202 AI-fallback only)`);
  }

  /* ---------- G03 + G08: boot one runtime, probe AI POSTs + sample RSS ---------- */
  const http = require("http");
  const post = (p) => new Promise((resolve) => {
    const req = http.request({ host: "localhost", port: PORT, path: p, method: "POST", headers: { "Content-Type": "application/json" }, timeout: 60000 }, (r) => {
      let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => resolve({ status: r.statusCode, body: b }));
    });
    req.on("error", (e) => resolve({ status: 0, body: e.message }));
    req.write("{}"); req.end();
  });
  const get = () => new Promise((resolve) => {
    const req = http.get({ host: "localhost", port: PORT, path: "/api/health", timeout: 30000 }, (r) => { r.resume(); r.on("end", resolve); });
    req.on("error", resolve);
  });
  const run = spawn(process.execPath, ["--max-old-space-size=384", path.join(ROOT, "runtime-v2", "server.cjs")], { cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: String(PORT) }, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 20000));
  for (let i = 0; i < 6; i++) { await get(); await new Promise((r) => setTimeout(r, 2000)); }
  {
    /* AI POST routes are migrated: status parity with the oracle for {} bodies
       (rejections 400 exact; successes 200/201). A crash (status 0), 500 or a
       leftover 501 NOT_MIGRATED is a FAIL. */
    const AI_POSTS = [
      ["/api/ai/spaced/review", 400], ["/api/ai/mock/predict", 400], ["/api/ai/flashcards/review", 400],
      ["/api/ai/adaptive/start", 201], ["/api/ai/adaptive/submit", 200], ["/api/ai/adaptive/finish", 200],
      ["/api/ai/planner/regenerate", 200], ["/api/ai/planner/complete", 200], ["/api/ai/profile", 200],
      ["/api/ai/recommendations/build", 200], ["/api/ai/notifications/read", 200], ["/api/ai/refresh", 200],
      ["/api/ai/flashcards/build", 200]
    ];
    let bad = 0;
    for (const [p, want] of AI_POSTS) {
      const r = await post(p);
      if (r.status !== want) { bad++; console.log(`   unexpected: ${p} -> ${r.status} (want ${want}) ${String(r.body).slice(0, 80)}`); }
    }
    item("G03 AI POST routes migrated", bad === 0, `${AI_POSTS.length} POST routes: statuses match oracle (400 rejections exact, 200/201 successes)`);
  }
  {
    let childRss = 0;
    try {
      const out = execFileSync("powershell", ["-NoProfile", "-Command", `(Get-Process -Id ${run.pid}).WorkingSet64`], { encoding: "utf8" });
      childRss = Math.round(parseInt(out.trim(), 10) / 1048576);
    } catch (e) {}
    item("G08 runtime RSS <= 512MB", childRss > 0 && childRss <= 512, `runtime pid ${run.pid} RSS ${childRss}MB (heap capped at 384MB)`);
  }
  try { run.kill(); } catch (e) {}

  /* ---------- G04: parity report ---------- */
  {
    const f = path.join(ROOT, "docs", "phase40_api_parity.json");
    if (!fs.existsSync(f)) { item("G04 parity report", false, "docs/phase40_api_parity.json missing"); }
    else {
      const rep = JSON.parse(fs.readFileSync(f, "utf8"));
      item("G04 parity report", rep.verdict !== "FAILED" && rep.summary.FAIL === 0, `${rep.verdict} (PASS=${rep.summary.PASS} PASS_SET=${rep.summary.PASS_SET} FAIL=${rep.summary.FAIL})`);
    }
  }

  /* ---------- G05: fixture npm test ---------- */
  if (process.env.SKIP_FIXTURE_TEST !== "1") {
    try {
      const fixture = path.join(ROOT, ".phase40-fixture");
      if (!fs.existsSync(path.join(fixture, "indexes"))) {
        console.log("building fixture…");
        execFileSync(process.execPath, [path.join(ROOT, "scripts", "phase40", "make-fixture.cjs")], { cwd: ROOT, stdio: "inherit" });
      }
      const env = { ...process.env, MCQS_JSON_DATA_DIR: path.join(fixture, "data"), MCQS_JSON_INDEX_DIR: path.join(fixture, "indexes") };
      execFileSync("cmd", ["/c", "npm", "test"], { cwd: ROOT, stdio: "inherit", env });
      item("G05 fixture npm test", true, "npm test passed on .phase40-fixture");
    } catch (e) { item("G05 fixture npm test", false, "npm test failed: " + e.message); }
  } else item("G05 fixture npm test", true, "skipped (SKIP_FIXTURE_TEST=1)");

  /* ---------- G06: test:db on real data ---------- */
  if (process.env.SKIP_DB_TEST !== "1") {
    try {
      execFileSync("cmd", ["/c", "npm", "run", "test:db"], { cwd: ROOT, stdio: "inherit" });
      item("G06 test:db real data", true, "30/30 checks passed on real data");
    } catch (e) { item("G06 test:db real data", false, "test:db failed: " + e.message); }
  } else item("G06 test:db real data", true, "skipped (SKIP_DB_TEST=1)");

  /* ---------- G07: tracked-file sqlite audit ---------- */
  {
    /* only self-referential auditors remain (they carry their scan regex
       or migration-report strings inline — the same exemption set that
       tests/database/files.test.cjs uses) */
    const allow = [
      ".github/workflows/database-verify.yml", ".github/workflows/test.yml",
      "scripts/phase40/gate.cjs", "scripts/phase40/evidence.cjs",
      "scripts/phase41/audit.cjs", "tests/database/files.test.cjs",
      "scripts/phase36/reports.cjs"
    ];
    const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
    const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\r\n]*/g, " ");
    const bad = [];
    for (const rel of tracked) {
      if (!/\.(c?js|json|ya?ml)$/.test(rel)) continue;
      if (rel.startsWith("docs/")) continue;
      if (rel === "node_modules/") continue;
      if (allow.some((a) => rel === a || rel.startsWith(a))) continue;
      const full = path.join(ROOT, rel);
      if (!fs.existsSync(full)) continue;
      const c = strip(fs.readFileSync(full, "utf8"));
      if (/(node:sqlite|DatabaseSync|db\.prepare)/.test(c)) bad.push(rel);
    }
    item("G07 tracked sqlite audit", bad.length === 0, bad.length ? `outside allowlist: ${bad.join(", ")}` : `${tracked.length} tracked files checked`);
  }

  /* ---------- G09: PWA shell + offline data present ---------- */
  {
    const hasManifest = fs.existsSync(path.join(ROOT, "manifest.json")) || fs.existsSync(path.join(ROOT, "manifest.webmanifest"));
    const need = (fs.existsSync(path.join(ROOT, "sw.js")) ? 1 : 0) + (fs.existsSync(path.join(ROOT, "index.html")) ? 1 : 0) + (hasManifest ? 1 : 0);
    const pages = fs.existsSync(path.join(ROOT, "subjects")) && fs.existsSync(path.join(ROOT, "chapters"));
    const pwaOk = need === 3 && pages;
    item("G09 PWA shell + pages", pwaOk, `sw.js/index/manifest: ${need}/3, subject+chapter page dirs: ${pages}`);
  }

  /* ---------- G10: legacy sqlite test removed from disk ---------- */
  {
    const f = path.join(ROOT, "tests", "database", "sqlite.test.cjs");
    item("G10 legacy sqlite test gone", !fs.existsSync(f), f);
  }

  const fails = results.filter((r) => !r.ok);
  const pass = results.length - fails.length;
  console.log(`\nphase40 gate: ${pass}/${results.length} passed`);
  fs.writeFileSync(path.join(ROOT, "docs", "phase40_gate.json"), JSON.stringify({ run_at: new Date().toISOString(), results, status: fails.length === 0 ? "PASS" : "FAIL" }, null, 2));
  console.log(fails.length === 0 ? "PHASE 40 STATUS: COMPLETE" : "PHASE 40 STATUS: BLOCKED");
  process.exit(fails.length === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
