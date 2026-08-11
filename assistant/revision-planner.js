#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 3: Intelligent Revision Planner
   Deterministic plan generation (no DB writes, pure derivation):
     - 7-day rolling daily plan (weak topics, revision, cards)
     - weekly plan (budgets, mocks, focus)
     - monthly plan (4-week horizon)
     - exam plan (countdown to target exam)
     - bookmark plan (bookmarked questions -> practice slots)
   Report: docs/phase27_revision.json
   Usage:  node assistant/revision-planner.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase27_revision.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const DAY = 86400000;

function addDays(base, n) {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function generate(db) {
  const today = new Date().toISOString().slice(0, 10);
  const profile = db.prepare("SELECT * FROM user_profiles").all()[0] || {};
  const weak = db.prepare(
    "SELECT w.topic_id, w.subject_id, w.priority, w.weakness_score, t.name topic_name FROM weak_topics w LEFT JOIN topics t ON t.id=w.topic_id ORDER BY w.priority DESC, w.topic_id"
  ).all();
  const dueCards = db.prepare("SELECT mcq_id, box, due_date FROM flashcards WHERE due_date<=? ORDER BY due_date LIMIT 20").all(today);
  const dueRev = db.prepare("SELECT mcq_id, box, interval_days, due_date FROM revision_schedule WHERE status='active' AND due_date<=? ORDER BY due_date LIMIT 20").all(today);
  const bookmarks = db.prepare("SELECT mcq_id, created_at FROM bookmarks ORDER BY created_at").all();
  const bmSubjects = db.prepare(
    "SELECT b.mcq_id, m.subject_id, s.name subject_name, m.difficulty FROM bookmarks b JOIN mcqs m ON m.id=b.mcq_id LEFT JOIN subjects s ON s.id=m.subject_id ORDER BY b.mcq_id"
  ).all();
  const mocks = db.prepare("SELECT id, title, exam_id, total_questions FROM mocktests WHERE status='active' ORDER BY id LIMIT 12").all();
  const currentAffairs = db.prepare("SELECT COUNT(*) n FROM current_affairs").get().n;

  const hours = Math.max(0.5, profile.daily_hours || 1);
  const dailyBudget = Math.max(10, Math.round((hours * 30) / 10) * 10);
  const targetDate = profile.target_date || "";
  const daysLeft = targetDate ? Math.max(0, Math.ceil((Date.parse(targetDate + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / DAY)) : 0;

  /* ---- daily plan: 7 days ---- */
  const daily = [];
  for (let d = 0; d < 7; d++) {
    const date = addDays(today, d);
    const w = weak[d % Math.max(1, weak.length)];
    const day = { date, items: [] };
    if (w) {
      day.items.push({
        type: "practice",
        title: "Fix weak area: " + (w.topic_name || w.topic_id),
        target: w.topic_id,
        subject_id: w.subject_id,
        questions: Math.round(dailyBudget * 0.5),
      });
    }
    if (d === 0 && dueRev.length) {
      day.items.push({ type: "revision", title: "Spaced revision", questions: Math.min(20, dueRev.length), targets: dueRev.slice(0, 5).map((r) => r.mcq_id) });
    }
    if (d === 1 && dueCards.length) {
      day.items.push({ type: "flashcards", title: "Flashcard review", questions: Math.min(15, dueCards.length) });
    }
    if (d === 0 && currentAffairs > 0) {
      day.items.push({ type: "current-affairs", title: "Current affairs digest", questions: 5 });
    }
    if (d > 0 && d % 4 === 0 && mocks.length) {
      const mock = mocks[Math.floor(d / 4) % mocks.length];
      day.items.push({ type: "mock", title: "Mock test: " + mock.title, target: mock.id, questions: mock.total_questions || 50 });
    }
    const bm = bmSubjects[d % Math.max(1, bmSubjects.length)];
    if (bm && d % 2 === 0) {
      day.items.push({ type: "bookmark", title: "Re-attempt bookmarked question", target: bm.mcq_id, questions: 1 });
    }
    if (!day.items.length) {
      day.items.push({ type: "practice", title: "Balanced practice", questions: dailyBudget });
    }
    daily.push(day);
  }

  /* ---- weekly plan ---- */
  const weekly = {
    horizon_days: 7,
    target_questions: dailyBudget * 7,
    mocks: daily.filter((d) => d.items.some((i) => i.type === "mock")).length,
    weak_focus_count: weak.length,
    revisions_queued: dueRev.length,
    flashcards_queued: dueCards.length,
    exam_days_left: daysLeft,
  };

  /* ---- monthly plan: 4 weeks ---- */
  const weeks = [];
  for (let wk = 0; wk < 4; wk++) {
    const focus = weak.slice(wk * 2, wk * 2 + 2);
    weeks.push({
      week: wk + 1,
      start_date: addDays(today, wk * 7),
      focus: focus.map((f) => (f.topic_name || f.topic_id)),
      mock: mocks[wk % Math.max(1, mocks.length)] ? { id: mocks[wk % mocks.length].id, title: mocks[wk % mocks.length].title } : null,
      target_questions: dailyBudget * 7,
    });
  }

  /* ---- exam plan ---- */
  const examPlan = (() => {
    if (!profile.target_exam) {
      return { target_exam: null, status: "no target exam set", recommendation: "Set a target_exam in your profile to unlock the exam countdown." };
    }
    const phase = daysLeft > 30 ? "foundation" : daysLeft > 14 ? "intensive" : daysLeft > 7 ? "final-sprint" : "exam-week";
    return {
      target_exam: profile.target_exam,
      target_date: targetDate,
      days_left: daysLeft,
      phase,
      weekly_mocks: daysLeft > 30 ? 1 : daysLeft > 7 ? 2 : 3,
      focus: phase === "foundation" ? "subject mastery + weak-topic repair" : phase === "intensive" ? "timed mocks + revision" : "revision + flashcards + rest",
    };
  })();

  /* ---- bookmark plan ---- */
  const bookmarkPlan = bmSubjects.map((b, i) => ({
    order: i + 1,
    mcq_id: b.mcq_id,
    subject: b.subject_name || b.subject_id,
    difficulty: b.difficulty,
    plan: "Re-attempt and read the full explanation; then add to flashcards if missed.",
    scheduled_day: daily[i % daily.length].date,
  }));

  const report = {
    step: "revision",
    generated_at: new Date().toISOString(),
    summary: {
      daily_days: daily.length,
      weak_topics: weak.length,
      revisions_queued: dueRev.length,
      flashcards_queued: dueCards.length,
      mocks_available: mocks.length,
      bookmarks_planned: bookmarkPlan.length,
      exam_days_left: daysLeft,
      status: "PASS",
    },
    daily_plan: daily,
    weekly_plan: weekly,
    monthly_plan: { weeks, total_weeks: 4 },
    exam_plan: examPlan,
    bookmark_plan: bookmarkPlan,
  };
  return report;
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const report = generate(db);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
    console.log(`[revision-planner] days=${report.summary.daily_days} weak=${report.summary.weak_topics} mocks=${report.summary.mocks_available} exam_left=${report.summary.exam_days_left}`);
    console.log("report -> docs/phase27_revision.json");
    process.exit(0);
  } catch (e) {
    console.error("[revision-planner] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate };
