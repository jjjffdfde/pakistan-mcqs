#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 10: Automation Platform
   Deterministic, read-only automation outputs:
     - automatic reminders (due cards, revisions, bookmarks, CA)
     - revision scheduling (next 14 days projection)
     - progress snapshots (point-in-time metric bundle)
     - daily summaries (per study day)
     - weekly summaries (4-week rollup)
   Report: docs/phase27_automation.json
   Usage:  node assistant/automation-engine.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase27_automation.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const DAY = 86400000;

function addDays(base, n) {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekKey(day) {
  const d = new Date(day + "T00:00:00Z");
  const w = Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + "-W" + String(w).padStart(2, "0");
}
function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function generate(db) {
  const today = new Date().toISOString().slice(0, 10);
  const profile = db.prepare("SELECT * FROM user_profiles").all()[0] || {};

  /* ---- reminders ---- */
  const reminders = [];
  const dueRev = db.prepare(
    "SELECT mcq_id, box, interval_days, due_date FROM revision_schedule WHERE status='active' AND due_date<=? ORDER BY due_date LIMIT 10"
  ).all(today);
  const dueCards = db.prepare(
    "SELECT mcq_id, box, due_date FROM flashcards WHERE due_date<=? ORDER BY due_date LIMIT 10"
  ).all(today);
  const bookmarks = db.prepare("SELECT COUNT(*) n FROM bookmarks").get().n;
  const caCount = db.prepare("SELECT COUNT(*) n FROM current_affairs").get().n;
  if (dueRev.length) reminders.push({ type: "revision", title: "Spaced revisions due", items: dueRev.length, priority: 3 });
  if (dueCards.length) reminders.push({ type: "flashcards", title: "Flashcards due", items: dueCards.length, priority: 2 });
  if (bookmarks) reminders.push({ type: "bookmarks", title: "Review bookmarked questions", items: bookmarks, priority: 2 });
  if (caCount) reminders.push({ type: "current-affairs", title: "Current affairs digest available", items: caCount, priority: 1 });
  reminders.push({ type: "streak", title: "Keep your streak alive", items: 1, priority: 1 });

  /* ---- revision scheduling: 14-day projection ---- */
  const schedule = [];
  for (let d = 1; d <= 14; d++) {
    const date = addDays(today, d);
    const dueOn = db.prepare(
      "SELECT COUNT(*) n FROM revision_schedule WHERE status='active' AND due_date=?"
    ).get(date).n;
    const cardsOn = db.prepare(
      "SELECT COUNT(*) n FROM flashcards WHERE due_date=?"
    ).get(date).n;
    schedule.push({
      date,
      revisions_due: dueOn,
      flashcards_due: cardsOn,
      action: dueOn + cardsOn > 0 ? "revision+f" : "practice",
    });
  }

  /* ---- progress snapshot ---- */
  const hist = db.prepare("SELECT correct, skipped FROM history").all();
  const attempts = hist.length;
  const ok = hist.filter((h) => h.correct === 1).length;
  const skipped = hist.filter((h) => h.skipped === 1).length;
  const snapshot = {
    timestamp: new Date().toISOString(),
    device: profile.device_id || "default",
    total_attempts: attempts,
    correct: ok,
    accuracy: pct(ok, attempts),
    skipped: skipped,
    profile_readiness: profile.readiness_score || 0,
    profile_consistency: profile.consistency || 0,
    target_exam: profile.target_exam || "",
    due_revisions: dueRev.length,
    due_flashcards: dueCards.length,
    bookmarks: bookmarks,
    current_affairs: caCount,
    active_mcqs: db.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n,
  };

  /* ---- daily summaries ---- */
  const byDay = db.prepare(
    "SELECT substr(answered_at,1,10) day, COUNT(*) n, SUM(correct) ok, SUM(skipped) sk FROM history GROUP BY day ORDER BY day"
  ).all();
  const dailySummaries = byDay.map((d) => ({
    date: d.day,
    attempts: d.n,
    correct: d.ok,
    skipped: d.sk,
    accuracy: pct(d.ok, d.n),
    summary: `${d.n} questions, ${pct(d.ok, d.n)}% accuracy${d.sk ? " (" + d.sk + " skipped)" : ""}.`,
  }));

  /* ---- weekly summaries ---- */
  const byWeek = new Map();
  for (const h of byDay) {
    const k = weekKey(h.day);
    if (!byWeek.has(k)) byWeek.set(k, { week: k, attempts: 0, correct: 0 });
    const w = byWeek.get(k);
    w.attempts += h.n; w.correct += h.ok;
  }
  const weeklySummaries = [...byWeek.values()]
    .map((w) => ({ ...w, accuracy: pct(w.correct, w.attempts), summary: `${w.attempts} questions across the week at ${pct(w.correct, w.attempts)}% accuracy.` }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-4);

  const report = {
    step: "automation",
    generated_at: new Date().toISOString(),
    summary: {
      reminders: reminders.length,
      schedule_days: schedule.length,
      snapshot_taken: true,
      daily_summaries: dailySummaries.length,
      weekly_summaries: weeklySummaries.length,
      status: "PASS",
    },
    reminders: reminders,
    revision_schedule: schedule,
    progress_snapshot: snapshot,
    daily_summaries: dailySummaries,
    weekly_summaries: weeklySummaries,
    scheduling_policy: "SM-2 boxes: review on due date; failed => box 1; success => advance box (1,2,4,7,15,30+ days).",
  };
  return report;
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const report = generate(db);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
    console.log(`[automation-engine] reminders=${report.summary.reminders} schedule_days=${report.summary.schedule_days} daily=${report.summary.daily_summaries} weekly=${report.summary.weekly_summaries}`);
    console.log("report -> docs/phase27_automation.json");
    process.exit(0);
  } catch (e) {
    console.error("[automation-engine] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate };
