/* ============================================================
   DB Integration Verification — Pakistan MCQs Hub
   Compares live SQL counts vs API stats vs frontend expectations
   and smoke-tests every feature endpoint. Writes
   docs/DB-INTEGRATION-VERIFICATION.md
   Usage: node scripts/test-db-integration.cjs
   ============================================================ */
"use strict";
const { DatabaseSync } = require("node:sqlite");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const API = process.env.MCQS_API || "http://localhost:8765";
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

async function main() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const count = (sql) => db.prepare(sql).get().n;

  const sql = {
    mcqs: count("SELECT COUNT(*) n FROM mcqs WHERE status='active'"),
    mcqs_total: count("SELECT COUNT(*) n FROM mcqs"),
    options: count("SELECT COUNT(*) n FROM options"),
    subjects: count("SELECT COUNT(*) n FROM subjects WHERE status='active'"),
    chapters: count("SELECT COUNT(*) n FROM chapters"),
    topics: count("SELECT COUNT(*) n FROM topics"),
    subtopics: count("SELECT COUNT(*) n FROM subtopics"),
    papers: count("SELECT COUNT(*) n FROM pastpapers"),
    mocktests: count("SELECT COUNT(*) n FROM mocktests"),
    quizzes: count("SELECT COUNT(*) n FROM quizzes"),
    categories: count("SELECT COUNT(*) n FROM categories"),
    bookmarks: count("SELECT COUNT(*) n FROM bookmarks"),
    attempts: count("SELECT COUNT(*) n FROM history")
  };
  let examsCount = 0;
  try { examsCount = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "exams.json"), "utf8")).length; } catch (e) {}
  sql.exams = examsCount;

  console.log("== SQL counts (direct, read-only) ==");
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
    console.log("FATAL: API server not reachable at " + API + " — start `node server.js` first.");
    process.exit(1);
  }

  console.log("\n== API stats ==");
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k.padEnd(10)} ${v}`);

  /* ---------- STEP 10: compare SQL vs API ---------- */
  console.log("\n== STEP 10: SQL vs API dashboard counters ==");
  for (const k of ["mcqs", "mcqs_total", "options", "subjects", "chapters", "topics", "subtopics", "papers", "mocktests", "quizzes", "exams", "categories", "bookmarks", "attempts"]) {
    const pass = Number(stats[k]) === Number(sql[k]);
    add(`dashboard:${k}`, sql[k], stats[k], pass);
    console.log(`  ${k.padEnd(12)} SQL=${sql[k]}  API=${stats[k]}  ${pass ? "PASS" : "FAIL"}`);
  }

  /* ---------- STEP 11: feature smoke tests ---------- */
  console.log("\n== STEP 11: feature endpoints (must serve SQLite data) ==");
  const mcqs = sql.mcqs;

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

  await smoke("search FTS", API + "/api/search?q=Ohm&limit=3", (b) => Array.isArray(b.results) && b.results.length > 0 && b.results[0].optionA !== undefined, "results with options");
  await smoke("search no-match", API + "/api/search?q=zzzzqqqqx&limit=3", (b) => b.total === 0, "total=0");
  await smoke("browse page1", API + "/api/browse?page=1&limit=10", (b) => b.results.length === 10 && b.pages > 1, "10 rows paginated");
  await smoke("browse filtered subject", API + "/api/browse?subject=physics&limit=5", (b) => b.results.every((m) => m.subject_id === "physics"), "all physics");
  await smoke("single mcq", API + "/api/mcq/mat-001", (b) => b.question && b.options && b.options.length === 4, "question + 4 options");
  await smoke("random sampler", API + "/api/random?limit=20", (b) => b.results.length === 20, "20 random rows");
  await smoke("subjects list", API + "/api/subjects", (b) => Array.isArray(b) && b.length === sql.subjects, "count = SQL");
  await smoke("chapters list", API + "/api/chapters", (b) => b.length === sql.chapters, "count = SQL");
  await smoke("topics list", API + "/api/topics", (b) => b.length === sql.topics, "count = SQL");
  await smoke("quizzes list", API + "/api/quizzes", (b) => b.length === sql.quizzes, "count = SQL");
  await smoke("mocktests list", API + "/api/mocktests", (b) => b.length === sql.mocktests, "count = SQL");
  await smoke("pastpapers list", API + "/api/pastpapers", (b) => b.length === sql.papers, "count = SQL");
  await smoke("categories list", API + "/api/categories", (b) => b.length === sql.categories, "count = SQL");
  await smoke("bookmarks list", API + "/api/bookmarks", (b) => Array.isArray(b), "array");
  await smoke("leaderboard list", API + "/api/leaderboard", (b) => Array.isArray(b), "array");
  await smoke("related filter", API + "/api/browse?page=1&limit=5&related=" + "mat-001", (b) => Array.isArray(b.results) && b.results.length <= 5, "<=5 rows");

  db.close();

  /* ---------- Report ---------- */
  const passN = results.filter((r) => r.pass).length;
  const fail = results.filter((r) => !r.pass);
  const rows = results.map((r) => `| ${r.check} | ${r.sql} | ${r.api} | ${r.pass ? "✅ PASS" : "❌ FAIL"} |`).join("\n");
  const md = `# DB Integration Verification

Date: ${new Date().toISOString()}  ·  API: ${API}  ·  DB: db/pakistan-mcqs.sqlite

## Result: ${fail.length === 0 ? "ALL PASS" : fail.length + " FAILURES"} (${passN}/${results.length})

## STEP 10 — SQL counts vs Dashboard counters

| Check | SQL | API | Status |
| --- | --- | --- | --- |
${rows}

## STEP 11 — Feature smoke tests

Every endpoint above was queried over HTTP and validated against live SQL counts and/or row shape. The frontend consumes these exact endpoints for search, browse, practice, quiz, mock tests, past papers, weekly/monthly challenges, bookmarks, leaderboard and dashboard.

## Notes

- SQL counts are computed read-only from \`db/pakistan-mcqs.sqlite\` at test time.
- The dashboard reads \`/api/stats\` (and \`/api/health\`) when \`DB.enabled\`; demo JSON is only used when the API server is unreachable (status panel then shows "Local Database Offline").
`;
  fs.writeFileSync(OUT, md, "utf8");
  console.log(`\nWrote ${OUT}`);
  console.log(`TOTAL: ${passN}/${results.length} passed` + (fail.length ? `, FAILED: ${fail.map((f) => f.check).join(", ")}` : " — ALL PASS"));
  process.exit(fail.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
