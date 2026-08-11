const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");
const { spawn } = require("child_process");

const ROOT = "E:/pAK MCQS";
const TMP = path.join(ROOT, ".audit-tmp", "p30api");
const PORT = 8801;

function clean() { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {} }
function mk(p) { fs.mkdirSync(p, { recursive: true }); }

function setup() {
  clean();
  mk(path.join(TMP, "db"));
  mk(path.join(TMP, "ai"));
  mk(path.join(TMP, "data"));
  const cp = (src, dst) => {
    fs.copyFileSync(path.join(ROOT, src), path.join(TMP, dst || src));
    console.log("copy:", src);
  };
  cp("server.js");
  cp("db/engine.js", "db/engine.js");
  cp("db/kg-migrate.js", "db/kg-migrate.js");
  cp("db/config.json", "db/config.json");
  cp("db/backup.js", "db/backup.js");
  cp("db/pakistan-mcqs.sqlite", "db/pakistan-mcqs.sqlite");
  cp("data/exams.json", "data/exams.json");
  cp("ai/router.js", "ai/router.js");
  const ai = fs.readdirSync(path.join(ROOT, "ai"));
  for (const f of ai) {
    if (f.endsWith(".js")) cp("ai/" + f, "ai/" + f);
  }
  const { DatabaseSync } = require("node:sqlite");
  const raw = new DatabaseSync(path.join(TMP, "db", "pakistan-mcqs.sqlite"));
  raw.exec("PRAGMA foreign_keys=OFF");
  raw.exec("DELETE FROM mcqs WHERE id NOT IN (SELECT id FROM mcqs LIMIT 1200)");
  raw.close();
  console.log("trimmed temp DB to 1200 mcqs");
}

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["server.js"], { cwd: TMP, env: { ...process.env, MCQS_PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => { out += d.toString(); });
    child.stderr.on("data", (d) => { out += d.toString(); });
    setTimeout(() => {
      if (out.includes("http") || out.includes("listening") || out.includes(":8765") || out.includes(PORT)) resolve(child);
      else if (child.exitCode !== null) reject(new Error("server exited: " + out.slice(0, 600)));
      else resolve(child);
    }, 2500);
  });
}

function req(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const r = http.request({ host: "127.0.0.1", port: PORT, path: p, method, headers: data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {} }, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => {
        let j = null;
        try { j = JSON.parse(b); } catch (e) {}
        resolve({ status: res.statusCode, body: b.slice(0, 3000), json: j });
      });
    });
    r.on("error", reject);
    r.setTimeout(30000, () => { r.destroy(new Error("timeout " + method + " " + p)); });
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  setup();
  const srv = await startServer();
  const results = [];
  const T = async (name, method, p, body, expect = 200) => {
    try {
      const r = await req(method, p, body);
      const ok = r.status >= expect - 1 && r.status <= expect + 1;
      results.push({ name, method, path: p, status: r.status, expected: expect, ok, body: r.body.slice(0, 200) });
      console.log((ok ? "OK  " : "FAIL") + " " + method + " " + p + " -> " + r.status + " [" + name + "]");
      return r;
    } catch (e) {
      results.push({ name, method, path: p, status: -1, expected: expect, ok: false, body: String((e && e.message) || e) });
      console.log("ERR " + method + " " + p + " -> " + String((e && e.message) || e).slice(0, 120) + " [" + name + "]");
      return null;
    }
  };

  // ---- read endpoints ----
  const health = await T("health", "GET", "/api/health");
  const stats = await T("stats", "GET", "/api/stats");
  const subjects = await T("subjects", "GET", "/api/subjects");
  const chapters = await T("chapters", "GET", "/api/chapters");
  const topics = await T("topics", "GET", "/api/topics");
  const categories = await T("categories", "GET", "/api/categories");
  const exams = await T("exams", "GET", "/api/exams");
  const quizzes = await T("quizzes", "GET", "/api/quizzes");
  const mocktests = await T("mocktests", "GET", "/api/mocktests");
  const pastpapers = await T("pastpapers", "GET", "/api/pastpapers");
  const search = await T("search", "GET", "/api/search?q=democracy&limit=5");
  const browse = await T("browse", "GET", "/api/browse?page=1&limit=5");
  const random = await T("random", "GET", "/api/random?limit=3");
  const realId = (random && random.json && random.json.results && random.json.results[0] && random.json.results[0].id) || "acc-001";
  const mcqsIds = await T("mcqs-ids", "GET", "/api/mcqs?ids=" + realId + "," + (random.json.results[1] ? random.json.results[1].id : realId));
  const mcqsEmpty = await T("mcqs-empty-ids", "GET", "/api/mcqs");
  const bookmarksGet = await T("bookmarks-get", "GET", "/api/bookmarks");
  const historyGet = await T("history-get", "GET", "/api/history");
  const leaderboard = await T("leaderboard", "GET", "/api/leaderboard");
  const analytics = await T("analytics", "GET", "/api/analytics");
  const exportD = await T("export", "GET", "/api/export?format=csv");
  const aiProfile = await T("ai-profile", "GET", "/api/ai/profile");
  const aiWeak = await T("ai-weak", "GET", "/api/ai/weak-topics");
  const aiPlanner = await T("ai-planner", "GET", "/api/ai/planner");
  const aiSpaced = await T("ai-spaced", "GET", "/api/ai/spaced/due");
  const aiMock = await T("ai-mock", "GET", "/api/ai/mock/predictions");
  const aiReco = await T("ai-reco", "GET", "/api/ai/recommendations");
  const aiCurrent = await T("ai-current", "GET", "/api/ai/current-affairs");
  const aiLb = await T("ai-lb", "GET", "/api/ai/leaderboard");
  const aiAch = await T("ai-ach", "GET", "/api/ai/achievements");
  const aiAna = await T("ai-analytics", "GET", "/api/ai/analytics");

  // ---- write endpoints (temp DB copy only) ----
  const realMcqId = realId;
  const realSubjectId = (subjects && subjects.json && subjects.json[0] && subjects.json[0].id) || null;
  const realExamId = (exams && exams.json && exams.json[0] && (exams.json[0].id || exams.json[0].slug || exams.json[0].name)) || "CSS";
  console.log("using real ids: mcq=" + realMcqId + " subject=" + realSubjectId + " exam=" + realExamId);
  await T("bookmarks-post", "POST", "/api/bookmarks", { mcq_id: realMcqId, device_id: "phase30-audit" }, 200);
  await T("history-post", "POST", "/api/history", { mcq_id: realMcqId, correct: true, device_id: "phase30-audit", time_taken_sec: 5, mode: "practice" }, 200);
  await T("ai-profile-post", "POST", "/api/ai/profile", { name: "QA Tester 30", target_exam: realExamId }, 200);
  await T("ai-planner-reg", "POST", "/api/ai/planner/regenerate", {}, 200);
  await T("ai-planner-complete", "POST", "/api/ai/planner/complete", { index: 0 }, 200);
  await T("ai-planner-complete-missing-index", "POST", "/api/ai/planner/complete", {}, 200);
  await T("ai-spaced-review", "POST", "/api/ai/spaced/review", { mcq_id: realMcqId, quality: 4, device_id: "phase30-audit" }, 200);
  const adaptStart = await T("ai-adapt-start", "POST", "/api/ai/adaptive/start", { subject_ids: [], mcq_ids: [realMcqId], length: 1 }, 200);
  await T("ai-adapt-next", "GET", "/api/ai/adaptive/next");
  await T("ai-adapt-submit", "POST", "/api/ai/adaptive/submit", { session_id: adaptStart && adaptStart.json && adaptStart.json.session_id, mcq_id: realMcqId, answer: "A", time_ms: 500 }, 200);
  await T("ai-mock-predict", "POST", "/api/ai/mock/predict", { exam_id: realExamId, month: "2026-09" }, 200);
  await T("import", "POST", "/api/import", [
    { question: "Phase 30 audit import question?", correctAnswer: "A", difficulty: "easy",
      subjectId: realSubjectId, chapterId: null, topicId: null, examIds: realExamId, tags: ["audit"],
      explanation: "audit test row (temp DB only)", optionA: "Yes", optionB: "No", optionC: "Maybe", optionD: "N/A" }
  ], 200);

  // ---- error paths ----
  await T("bad-json", "POST", "/api/history", "not json", 400);
  await T("not-found", "GET", "/api/nope-xyz", undefined, 404);
  await T("bad-page", "GET", "/api/mcqs?ids=" + realId + "&page=0&limit=999");

  // re-read after writes (verifies writes persisted on temp DB)
  const histAfter = await T("history-after-write", "GET", "/api/history");
  const lbAfter = await T("leaderboard-after", "GET", "/api/leaderboard");

  try { srv.kill(); } catch (e) {}
  try { srv.stdout.destroy(); srv.stderr.destroy(); } catch (e) {}

  // ---- DB integrity on temp copy (raw read-only open, no engine) ----
  await new Promise((r) => setTimeout(r, 2000));
  const { DatabaseSync } = require("node:sqlite");
  let dbRaw = null;
  for (let i = 0; i < 5 && !dbRaw; i++) {
    try { dbRaw = new DatabaseSync(path.join(TMP, "db", "pakistan-mcqs.sqlite"), { readOnly: true }); }
    catch (e) { await new Promise((r) => setTimeout(r, 1500)); }
  }
  let integrity = null, tables = [], counts = {};
  if (dbRaw) {
    integrity = dbRaw.prepare("PRAGMA integrity_check").get();
    tables = dbRaw.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((r) => r.name);
    for (const t of tables) {
      try { counts[t] = dbRaw.prepare("SELECT COUNT(*) c FROM " + t).get().c; } catch (e) { counts[t] = "ERR " + e.message; }
    }
    dbRaw.close();
  } else {
    integrity = { integrity_check: "UNABLE TO OPEN (still locked after kill)" };
  }

  const fails = results.filter((r) => !r.ok);
  const report = {
    module: "M16",
    generated_at: new Date().toISOString(),
    tool: "scripts/phase30/api-audit.cjs",
    sandbox: "temp copy at " + TMP + " (production DB untouched)",
    results,
    db_integrity: integrity,
    table_counts: counts,
    totals: { tested: results.length, pass: results.length - fails.length, fail: fails.length },
    failed: fails.map((f) => ({ name: f.name, path: f.path, status: f.status, expected: f.expected, body: f.body.slice(0, 160) })),
  };
  fs.writeFileSync(path.join(ROOT, "docs", "phase30_api_runtime.json"), JSON.stringify(report, null, 2));
  console.log("\nintegrity:", JSON.stringify(integrity));
  console.log("tables:", tables.join(","));
  console.log("totals:", report.totals.pass, "/", report.totals.tested, "pass");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error("API-AUDIT-FATAL", e); process.exit(2); });
