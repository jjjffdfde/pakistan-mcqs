/* scripts/api-smoke-test.cjs — black-box smoke test for a running runtime API.
   Boots its own server instance on an ephemeral port with the real payload,
   then exercises the production-critical paths:
     - health checks (/health, /ready, /api/health)
     - core data endpoints (stats, subjects, browse, search, mcq by id)
     - AI engine endpoints (profile, weak-topics, planner, spaced, analytics)
     - error handling (404, 405, invalid JSON 400, oversized body 413)
     - CORS (allowed origin reflected; disallowed origin denied)
     - sanitized 500 when the database is unavailable (empty index dir)
   Usage: npm run test:api   (exit 0 = all green) */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const os = require("os");
const fs = require("fs");
const ROOT = path.join(__dirname, "..");
const L = require(path.join(ROOT, "runtime-v2", "data-loader.cjs"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, failCount = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("ok:", name); }
  else { failCount++; console.error("FAIL:", name, extra ? JSON.stringify(extra) : ""); }
}
function get(url, headers) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    }).on("error", reject);
  });
}
function request(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const r = http.request({ host: u.hostname, port: u.port, path: u.pathname + u.search, method, headers }, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    r.on("error", reject);
    if (body !== undefined) r.write(body);
    r.end();
  });
}

async function boot(env, wantReady = true) {
  const port = 9500 + Math.floor(Math.random() * 300);
  const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
    cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: String(port), ...env }, stdio: "pipe"
  });
  let stderr = "";
  child.stderr.on("data", (c) => (stderr += c));
  for (let i = 0; i < 60; i++) {
    try {
      const r = await get(`http://127.0.0.1:${port}/ready`);
      if (!wantReady || r.status === 200) return { child, port, stderr: () => stderr };
    } catch (e) {}
    await sleep(500);
  }
  return { child, port: null, stderr: () => stderr };
}

(async () => {
  console.log("[api-smoke] booting runtime API on ephemeral port (real payload)");
  const { child, port, stderr } = await boot({});
  if (!port) { console.error("server failed to boot:\n" + stderr()); process.exit(1); }
  const base = `http://127.0.0.1:${port}`;

  try {
    /* ---- health ---- */
    let r = await get(`${base}/health`);
    const h = JSON.parse(r.body);
    check("/health 200", r.status === 200);
    check("/health database OK", h.database === "OK");
    check("/health ai reported honestly", h.ai === "UNAVAILABLE" || h.ai === "AVAILABLE");

    r = await get(`${base}/ready`);
    check("/ready 200 + ready:true", r.status === 200 && JSON.parse(r.body).ready === true);

    r = await get(`${base}/api/health`);
    const hh = JSON.parse(r.body);
    check("/api/health compat {ok, mcqs}", r.status === 200 && hh.ok === true && hh.mcqs === L.manifest().rows);

    /* ---- core data ---- */
    r = await get(`${base}/api/stats`);
    const st = JSON.parse(r.body);
    check("stats.mcqs > 0", r.status === 200 && st.mcqs > 0);

    r = await get(`${base}/api/subjects`);
    const subs = JSON.parse(r.body);
    check("subjects list non-empty", r.status === 200 && Array.isArray(subs) && subs.length > 0);

    r = await get(`${base}/api/browse?limit=2`);
    const br = JSON.parse(r.body);
    check("browse returns 2 rows", r.status === 200 && br.results.length === 2);
    const firstId = br.results[0].id;

    r = await get(`${base}/api/mcq/${firstId}`);
    check("mcq by id 200 + question", r.status === 200 && JSON.parse(r.body).question);

    r = await get(`${base}/api/search?q=pakistan&limit=3`);
    const sr = JSON.parse(r.body);
    check("search non-empty", r.status === 200 && sr.results.length > 0);

    r = await get(`${base}/api/random?limit=1`);
    check("random 200", r.status === 200);

    /* ---- AI engine (file-backed) ---- */
    r = await get(`${base}/api/ai/profile?device_id=smoke-1`);
    check("ai/profile 200", r.status === 200);
    r = await get(`${base}/api/ai/weak-topics?device_id=smoke-1`);
    check("ai/weak-topics 200", r.status === 200);
    r = await get(`${base}/api/ai/planner?device_id=smoke-1`);
    check("ai/planner 200", r.status === 200);
    r = await get(`${base}/api/ai/analytics?device_id=smoke-1`);
    check("ai/analytics 200", r.status === 200);
    r = await get(`${base}/api/ai/achievements?device_id=smoke-1`);
    check("ai/achievements 200", r.status === 200);

    /* ---- error handling ---- */
    r = await get(`${base}/does-not-exist`);
    check("404 unknown route", r.status === 404);

    r = await request("POST", `${base}/api/stats`);
    check("405 POST on GET-only route", r.status === 405);

    r = await request("POST", `${base}/api/history`, { "Content-Type": "application/json" }, "{bad json");
    check("400 invalid JSON body", r.status === 400);

    const huge = JSON.stringify({ x: "a".repeat(3 * 1024 * 1024) });
    r = await request("POST", `${base}/api/history`, { "Content-Type": "application/json" }, huge);
    check("413 oversized body", r.status === 413);

    r = await request("POST", `${base}/api/history`, { "Content-Type": "application/json" }, JSON.stringify({ mcq_id: firstId, correct: true, device_id: "smoke-1" }));
    check("history record answer 201", r.status === 201);

    /* ---- CORS ---- */
    r = await get(`${base}/api/stats`, { Origin: "https://jjjffdfde.github.io" });
    check("CORS allowed origin reflected", r.headers["access-control-allow-origin"] === "https://jjjffdfde.github.io");
    r = await get(`${base}/api/stats`, { Origin: "https://evil.example.com" });
    check("CORS disallowed origin denied", !r.headers["access-control-allow-origin"]);
    r = await request("OPTIONS", `${base}/api/stats`, { Origin: "https://jjjffdfde.github.io", "Access-Control-Request-Method": "GET" });
    check("preflight 204 with CORS headers", r.status === 204 && r.headers["access-control-allow-origin"] === "https://jjjffdfde.github.io");
  } finally {
    child.kill("SIGTERM");
  }

  /* ---- sanitized 500 when database is unavailable ---- */
  console.log("[api-smoke] booting second instance with broken index dir (expect sanitized 500)");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mcqs-empty-idx-"));
  const { child: c2, port: p2, stderr: s2 } = await boot({ MCQS_JSON_INDEX_DIR: tmp }, false);
  if (p2) {
    const r = await get(`http://127.0.0.1:${p2}/api/stats`);
    const body = JSON.parse(r.body);
    check("DB-failure returns sanitized 500", r.status === 500 && typeof body.error === "string" && !/runtime-v2|__dirname|indexes/.test(body.error));
    c2.kill("SIGTERM");
  } else {
    console.error("second instance failed to boot:\n" + s2());
    failCount++;
  }
  fs.rmSync(tmp, { recursive: true, force: true });

  console.log(`\napi-smoke: ${pass} passed, ${failCount} failed`);
  process.exit(failCount ? 1 : 0);
})().catch((e) => { console.error("api-smoke crashed:", e); process.exit(1); });
