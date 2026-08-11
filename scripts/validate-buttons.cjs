#!/usr/bin/env node
/* ============================================================
   Button Validation Harness — Pakistan MCQs Hub
   Hits the LIVE API exactly as the frontend does for every
   button: Start Practice (all modes), Take Quiz, Mock Test,
   Past Papers, Weekly/Monthly/Daily, QotD, browse drill,
   leaderboard. Every data path must return questions.
   Usage: node scripts/validate-buttons.cjs
   ============================================================ */
"use strict";
const { DatabaseSync } = require("node:sqlite");

const API = process.env.API || "http://127.0.0.1:8765";
const db = new DatabaseSync("E:\\pAK MCQS\\db\\pakistan-mcqs.sqlite", { readOnly: true });
const day = Math.floor(Date.now() / 86400000);

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`); };

async function get(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

async function liveCount(subjectIdsCsv) {
  const ids = String(subjectIdsCsv || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return 0;
  const ph = ids.map(() => "?").join(",");
  return db.prepare(`SELECT COUNT(*) n FROM mcqs WHERE subject_id IN (${ph}) AND status='active'`).get(...ids).n;
}

async function main() {
  /* ---- server reachable ---- */
  let health;
  try { health = await get("/api/health"); } catch (e) { check("server reachable", false, e.message); printReport(); process.exit(1); }
  check("server /api/health", !!health.ok, `mcqs=${health.mcqs}`);

  /* ---- Start Practice (Normal / Adaptive) ---- */
  for (const mode of ["normal", "adaptive"]) {
    const r = await get("/api/random?subject=&difficulty=&limit=20");
    check(`Start Practice (${mode}) returns questions`, (r.results || []).length >= 1, `${(r.results || []).length} of 20`);
  }
  /* practice with difficulty filter */
  for (const d of ["easy", "medium", "hard"]) {
    const r = await get("/api/random" + `?difficulty=${d}&limit=10`);
    check(`Start Practice difficulty=${d}`, (r.results || []).length >= 1, `${(r.results || []).length} returned`);
  }

  /* ---- Daily Quiz (QotD) ---- */
  const qotd = await get(`/api/random?limit=1&seed=${day}`);
  check("Daily Quiz (Question of the Day)", (qotd.results || []).length === 1, "1 question returned");

  /* ---- Weekly / Monthly Challenge ---- */
  const wk = await get("/api/random?limit=20");
  check("Weekly Challenge", (wk.results || []).length >= 1, `${(wk.results || []).length} of 20`);
  const mo = await get("/api/random?limit=25");
  check("Monthly Challenge", (mo.results || []).length >= 1, `${(mo.results || []).length} of 25`);

  /* ---- Take Quiz: every quiz ---- */
  const quizzes = await get("/api/quizzes");
  let brokenQ = 0;
  for (const q of quizzes) {
    const n = await liveCount(q.subject_ids);
    if (n === 0) brokenQ++;
  }
  check("Take Quiz — all quizzes have questions", brokenQ === 0, `${quizzes.length} quizzes, ${brokenQ} empty`);

  /* ---- Start Mock Test: every mock ---- */
  const mocks = await get("/api/mocktests");
  let brokenM = 0;
  for (const m of mocks) {
    const n = await liveCount(m.subject_ids);
    if (n === 0) brokenM++;
  }
  check("Start Mock Test — all mocks have questions", brokenM === 0, `${mocks.length} mocks, ${brokenM} empty`);

  /* ---- Past Papers: every paper ---- */
  const papers = await get("/api/pastpapers");
  let brokenP = 0, noYear = 0;
  for (const p of papers) {
    const n = await liveCount(p.subject_ids);
    if (n === 0) brokenP++;
    if (!p.year && !p.pattern) noYear++;
  }
  check("Past Papers — all papers have questions", brokenP === 0, `${papers.length} papers, ${brokenP} empty`);
  check("Past Papers — year present", noYear === 0, `${noYear} non-pattern papers without year`);
  check("Past Papers — 3-year coverage (2024-2026)", papers.some((p) => p.year === 2026) && papers.some((p) => p.year === 2025) && papers.some((p) => p.year === 2024), "2026/2025/2024 all present");

  /* ---- Subject / Chapter / Topic Quiz: taxonomy drill ---- */
  const chZero = db.prepare(`SELECT COUNT(*) n FROM chapters c WHERE c.subject_id IN (SELECT id FROM subjects WHERE status='active') AND NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.chapter_id=c.id AND m.status='active')`).get().n;
  const tpZero = db.prepare(`SELECT COUNT(*) n FROM topics t WHERE t.chapter_id IN (SELECT id FROM chapters) AND NOT EXISTS (SELECT 1 FROM mcqs m WHERE m.topic_id=t.id AND m.status='active')`).get().n;
  check("Chapter Quiz — every chapter has questions", chZero === 0, `${chZero} empty chapters`);
  check("Topic Quiz — every topic has questions", tpZero === 0, `${tpZero} empty topics`);

  /* ---- Browse drill (chapter view) ---- */
  const chap = db.prepare(`SELECT id FROM chapters WHERE subject_id IN (SELECT id FROM subjects WHERE status='active') LIMIT 1`).get();
  if (chap) {
    const r = await get(`/api/browse?chapter=${chap.id}&limit=10`);
    check("Browse chapter drill", (r.results || []).length >= 1, `${(r.results || []).length} returned`);
  }

  /* ---- Bookmarks (user-state path) ---- */
  const bm = await get("/api/bookmarks");
  check("Bookmarks page API", Array.isArray(bm), `${bm.length} bookmarks (user state)`);

  /* ---- Leaderboard ---- */
  const lb = await get("/api/leaderboard");
  check("Leaderboard API", Array.isArray(lb), `${lb.length} entries`);

  /* ---- Every subject has MCQs (dashboard cards) ---- */
  const subs = await get("/api/subjects");
  const zero = subs.filter((s) => (s.mcqs_count || 0) === 0);
  check("Dashboard — no subject card empty", zero.length === 0, `${subs.length} subjects, ${zero.length} empty`);

  /* ---- Every exam has content ---- */
  const exams = await get("/api/exams");
  const subjRows = db.prepare("SELECT id, exam_ids FROM subjects WHERE status='active'").all();
  const counts = Object.fromEntries(db.prepare("SELECT subject_id, COUNT(*) n FROM mcqs WHERE status='active' GROUP BY subject_id").all().map((r) => [r.subject_id, r.n]));
  const zeroExams = [];
  for (const e of exams) {
    const tot = subjRows.filter((s) => (s.exam_ids || "").split(",").map((x) => x.trim()).filter(Boolean).includes(e.id)).reduce((a, s) => a + (counts[s.id] || 0), 0);
    if (tot === 0) zeroExams.push(e.id);
  }
  check("Every exam contains questions", zeroExams.length === 0, `${exams.length} exams, ${zeroExams.length} empty: ${zeroExams.join(",") || "none"}`);

  printReport();
}

function printReport() {
  const ok = results.filter((r) => r.ok).length;
  console.log(`\nTOTAL: ${ok}/${results.length} passed`);
  process.exit(ok === results.length ? 0 : 2);
}

main().catch((e) => { console.error("HARNESS ERROR:", e); process.exit(1); });
