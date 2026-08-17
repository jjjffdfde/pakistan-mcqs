/* ============================================================
   DB Integration Verification — Pakistan MCQs Hub (Phase 40)
   Compares live file-data counts (NDJSON.GZ + JSON indexes, no
   SQLite) vs API stats vs frontend expectations and smoke-tests
   every feature endpoint of runtime-v2. Boots the runtime-v2
   server itself if one is not already running.
   Writes docs/DB-INTEGRATION-VERIFICATION.md
   Usage: node scripts/test-db-integration.cjs
   Env: MCQS_API (default http://127.0.0.1:8766)
   ============================================================ */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const L = require("../runtime-v2/data-loader.cjs");
const US = require("../runtime-v2/user-store.cjs");
const API = process.env.MCQS_API || "http://127.0.0.1:8766";
const OUT = path.join(ROOT, "docs", "DB-INTEGRATION-VERIFICATION.md");

const results = []; // { check, sql, api, pass }
const add = (check, sql, api, pass) => results.push({ check, sql, api, pass: !!pass });

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { reject(new Error("bad json: " + d.slice(0, 200))); }
      });
    }).on("error", reject);
  });
}

async function ensureServer() {
  try {
    const h = await getJson(API + "/api/health");
    if (h.status === 200) return null;
  } catch (e) {}
  const { spawn } = require("child_process");
  const port = API.split(":")[2] || "8766";
  const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
    cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: port }, stdio: "ignore"
  });
  for (let i = 0; i < 80; i++) {
    try { const h = await getJson(API + "/api/health"); if (h.status === 200) return child; } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("runtime-v2 server did not become healthy at " + API);
}

async function main() {
  const child = await ensureServer();
  const manifest = L.manifest();
  const bySub = L.bySubjectActive();
  const count = async (t) => (await L.loadTable(t)).length;
  const active = Object.values(bySub).reduce((a, b) => a + b, 0);
  const users = US.counts();

  const sql = {
    mcqs: active,
    mcqs_total: manifest.rows,
    options: manifest.optionRows,
    subjects: (await L.loadTable("subjects")).filter((s) => s.status === "active").length,
    chapters: await count("chapters"),
    topics: await count("topics"),
    subtopics: await count("subtopics"),
    papers: await count("pastpapers"),
    mocktests: await count("mocktests"),
    quizzes: await count("quizzes"),
    categories: await count("categories"),
    bookmarks: users.bookmarks,
    attempts: users.history
  };
  let examsCount = 0;
  try { examsCount = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "exams.json"), "utf8")).length; } catch (e) {}
  sql.exams = examsCount;

  console.log("== File-data counts (read-only) ==");
  for (const [k, v] of Object.entries(sql)) console.log(`  ${k.padEnd(10)} ${v}`);

  /* ---------- API stats ---------- */
  let stats;
  try {
    const h = await getJson(API + "/api/health");
    console.log(`\n== health: ${h.status} ==`);
    const s = await getJson(API + "/api/stats");
    if (s.status !== 200) { console.log("FATAL: /api/stats -> " + s.status); process.exit(1); }
    stats = s.body;
  } catch (e) {
    console.log("FATAL: runtime-v2 API server not reachable at " + API + " — " + e.message);
    process.exit(1);
  }

  console.log("\n== API stats ==");
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(10)} ${v}`);

  /* ---------- STEP 10: compare file counts vs API ---------- */
  console.log("\n== STEP 10: file-data vs API dashboard counters ==");
  for (const k of ["mcqs", "mcqs_total", "options", "subjects", "chapters", "topics", "subtopics", "papers", "mocktests", "quizzes", "exams", "categories", "bookmarks", "attempts"]) {
    const pass = Number(stats[k]) === Number(sql[k]);
    add(`dashboard:${k}`, sql[k], stats[k], pass);
    console.log(`  ${k.padEnd(12)} FILE=${sql[k]}  API=${stats[k]}  ${pass ? "PASS" : "FAIL"}`);
  }

  /* ---------- STEP 11: feature smoke tests ---------- */
  console.log("\n== STEP 11: feature endpoints (must serve NDJSON data) ==");
  const browse0 = (await getJson(API + "/api/browse?page=1&limit=1")).body;
  const firstId = (browse0.results && browse0.results[0] && browse0.results[0].id) || "gk-001";
  const searchTerm = "physics"; /* present in fixture + production; >= 4 chars (engine token floor) */

  async function smoke(name, url, fn, expect) {
    try {
      const r = await getJson(url);
      const ok = r.status === 200 && fn(r.body);
      add(name, expect, r.status + (ok ? "" : " BAD"), ok);
      console.log(`  ${name.padEnd(34)} ${ok ? "PASS" : "FAIL"}`);
    } catch (e) {
      add(name, expect, "ERR " + e.message, false);
      console.log(`  ${name.padEnd(34)} FAIL (${e.message})`);
    }
  }

  await smoke("search", API + `/api/search?q=${searchTerm}&limit=3`, (b) => (b.results || []).length > 0 && b.results[0].optionA !== undefined, "results with options");
  await smoke("search no-match", API + "/api/search?q=zzzzqqqqx&limit=3", (b) => b.total === 0, "total=0");
  await smoke("browse page1", API + "/api/browse?page=1&limit=10", (b) => b.results.length === 10 && b.pages > 1, "10 rows paginated");
  await smoke("browse filtered subject", API + "/api/browse?subject=physics&limit=5", (b) => b.results.every((m) => m.subject_id === "physics"), "all physics");
  await smoke("single mcq", API + `/api/mcq/${firstId}`, (b) => b.question && b.options && b.options.length === 4, "question + 4 options");
  await smoke("random sampler", API + "/api/random?limit=20", (b) => b.results.length === 20, "20 random rows");
  await smoke("subjects list", API + "/api/subjects", (b) => Array.isArray(b) && b.length === sql.subjects, "count = FILE");
  await smoke("chapters list", API + "/api/chapters", (b) => b.length === sql.chapters, "count = FILE");
  await smoke("topics list", API + "/api/topics", (b) => b.length === sql.topics, "count = FILE");
  await smoke("quizzes list", API + "/api/quizzes", (b) => b.length === sql.quizzes, "count = FILE");
  await smoke("mocktests list", API + "/api/mocktests", (b) => b.length === sql.mocktests, "count = FILE");
  await smoke("pastpapers list", API + "/api/pastpapers", (b) => b.length === sql.papers, "count = FILE");
  await smoke("categories list", API + "/api/categories", (b) => b.length === sql.categories, "count = FILE");
  await smoke("bookmarks list", API + "/api/bookmarks", (b) => Array.isArray(b), "array");
  await smoke("leaderboard list", API + "/api/leaderboard", (b) => Array.isArray(b), "array");
  await smoke("related filter", API + `/api/browse?page=1&limit=5&related=${firstId}`, (b) => Array.isArray(b.results) && b.results.length <= 5, "<=5 rows");

  if (child) { try { child.kill(); } catch (e) {} }

  /* ---------- Report ---------- */
  const passN = results.filter((r) => r.pass).length;
  const fail = results.filter((r) => !r.pass);
  const rows = results.map((r) => `| ${r.check} | ${r.sql} | ${r.api} | ${r.pass ? "✅ PASS" : "❌ FAIL"} |`).join("\n");
  const md = `# DB Integration Verification

Date: ${new Date().toISOString()}  ·  API: ${API}  ·  Engine: runtime-v2 (NDJSON.GZ + JSON indexes)

## Result: ${fail.length === 0 ? "ALL PASS" : fail.length + " FAILURES"} (${passN}/${results.length})

## STEP 10 — File-data counts vs Dashboard counters

| Check | FILE | API | Status |
| --- | --- | --- | --- |
${rows}

## STEP 11 — Feature smoke tests

Every endpoint above was queried over HTTP and validated against live file-data counts and/or row shape. The frontend consumes these exact endpoints for search, browse, practice, quiz, mock tests, past papers, weekly/monthly challenges, bookmarks, leaderboard and dashboard.

## Notes

- Counts are computed read-only from the NDJSON.GZ exports (\`database/data\`) and JSON indexes (\`runtime-v2/indexes\`) at test time. No SQLite is involved.
- The dashboard reads \`/api/stats\` (and \`/api/health\`) from the runtime-v2 API server.
`;
  fs.writeFileSync(OUT, md, "utf8");
  console.log(`\nWrote ${OUT}`);
  console.log(`TOTAL: ${passN}/${results.length} passed` + (fail.length ? `, FAILED: ${fail.map((f) => f.check).join(", ")}` : " — ALL PASS"));
  process.exit(fail.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
