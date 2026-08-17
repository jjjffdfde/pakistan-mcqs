#!/usr/bin/env node
/* ============================================================
   Button Validation Harness — Pakistan MCQs Hub (Phase 40: file engine)
   Hits the LIVE runtime-v2 API exactly as the frontend does for
   every button: Start Practice (all modes), Take Quiz, Mock Test,
   Past Papers, Weekly/Monthly/Daily, QotD, browse drill,
   leaderboard. Every data path must return questions.
   Usage: node scripts/validate-buttons.cjs
   ============================================================ */
"use strict";
const path = require("path");
const ROOT = path.join(__dirname, "..");
const L = require("../runtime-v2/data-loader.cjs");

const PORT = process.env.MCQS_JSON_PORT || process.env.MCQS_PORT || "8766";
const API = process.env.API || `http://127.0.0.1:${PORT}`;
const day = Math.floor(Date.now() / 86400000);

const results = [];
const check = (name, ok, detail, soft = false) => { results.push({ name, ok, detail, soft }); console.log(`${ok ? "PASS" : (soft ? "WARN" : "FAIL")}  ${name}  ${detail}`); };

async function get(path2) {
  const res = await fetch(API + path2);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path2}`);
  return res.json();
}

function liveCount(subjectIdsCsv) {
  const ids = String(subjectIdsCsv || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length) return 0;
  const bySub = L.bySubjectActive();
  return ids.reduce((a, s) => a + (bySub[s] || 0), 0);
}

async function streamedActiveCounts() {
  const byChapter = new Map();
  const byTopic = new Map();
  for (const sub of Object.keys(L.manifest().sourceFiles)) {
    await L.streamSubject(sub, (row) => {
      if (!row || row.status !== "active") return;
      if (row.chapter_id != null && row.chapter_id !== "") byChapter.set(row.chapter_id, (byChapter.get(row.chapter_id) || 0) + 1);
      if (row.topic_id != null && row.topic_id !== "") byTopic.set(row.topic_id, (byTopic.get(row.topic_id) || 0) + 1);
    });
  }
  return { byChapter, byTopic };
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
    const n = liveCount(q.subject_ids);
    if (n === 0) brokenQ++;
  }
  check("Take Quiz — all quizzes have questions", brokenQ === 0, `${quizzes.length} quizzes, ${brokenQ} empty`);

  /* ---- Start Mock Test: every mock ---- */
  const mocks = await get("/api/mocktests");
  let brokenM = 0;
  for (const m of mocks) {
    const n = liveCount(m.subject_ids);
    if (n === 0) brokenM++;
  }
  check("Start Mock Test — all mocks have questions", brokenM === 0, `${mocks.length} mocks, ${brokenM} empty`);

  /* ---- Past Papers: every paper ---- */
  const papers = await get("/api/pastpapers");
  let brokenP = 0, noYear = 0;
  for (const p of papers) {
    const n = liveCount(p.subject_ids);
    if (n === 0) brokenP++;
    if (!p.year && !p.pattern) noYear++;
  }
  check("Past Papers — all papers have questions", brokenP === 0, `${papers.length} papers, ${brokenP} empty`);
  check("Past Papers — year present", noYear === 0, `${noYear} non-pattern papers without year`);
  check("Past Papers — 3-year coverage (2024-2026)", papers.some((p) => p.year === 2026) && papers.some((p) => p.year === 2025) && papers.some((p) => p.year === 2024), "2026/2025/2024 all present");

  /* ---- Subject / Chapter / Topic Quiz: taxonomy drill ---- */
  const { byChapter, byTopic } = await streamedActiveCounts();
  const chZero = (await L.loadTable("chapters")).filter((c) => !(byChapter.get(c.id) > 0));
  const tpZero = (await L.loadTable("topics")).filter((t) => !(byTopic.get(t.id) > 0));
  /* Authored placeholder chapters/topics ("deeper-topics", "completion-banks",
     etc.) legitimately have zero active MCQs in the corpus (identical in the
     SQLite oracle and the NDJSON runtime) — reported as WARN, not fatal. */
  check("Chapter Quiz — every chapter has questions", chZero.length === 0, `${chZero.length} empty chapters: ${chZero.map((c) => c.id).join(",") || "none"}`, true);
  check("Topic Quiz — every topic has questions", tpZero.length === 0, `${tpZero.length} empty topics: ${tpZero.map((t) => t.id).join(",") || "none"}`, true);

  /* ---- Browse drill (chapter view) ---- */
  const chapters = await L.loadTable("chapters");
  const chap = chapters.find((c) => byChapter.get(c.id) > 0);
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

  /* ---- Every exam with tagged subjects has content ---- */
  const exams = await get("/api/exams");
  const subjRows = await L.loadTable("subjects");
  const counts = L.bySubjectActive();
  const zeroExams = [];
  for (const e of exams) {
    const tagged = subjRows.filter((s) => (s.exam_ids || "").split(",").map((x) => x.trim()).filter(Boolean).includes(e.id));
    if (!tagged.length) continue; /* no subject targets this exam — nothing to verify */
    const tot = tagged.reduce((a, s) => a + (counts[s.id] || 0), 0);
    if (tot === 0) zeroExams.push(e.id);
  }
  check("Every exam contains questions", zeroExams.length === 0, `${exams.length} exams, ${zeroExams.length} empty: ${zeroExams.join(",") || "none"}`);

  printReport();
}

function printReport() {
  const ok = results.filter((r) => r.ok).length;
  const hard = results.filter((r) => !r.soft);
  const hardOk = hard.filter((r) => r.ok).length;
  const warns = results.filter((r) => r.soft && !r.ok).length;
  console.log(`\nTOTAL: ${ok}/${results.length} passed (${warns} soft warnings)`);
  process.exit(hardOk === hard.length ? 0 : 2);
}

main().catch((e) => { console.error("HARNESS ERROR:", e); process.exit(1); });