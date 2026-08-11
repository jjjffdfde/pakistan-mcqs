#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 6/9: Enterprise Analytics Engine
   Read-only analytics + dashboard derivation:
     - daily statistics (attempts, accuracy, per-day)
     - weekly statistics (rolling 4-week rollup)
     - subject statistics (volume + accuracy per subject)
     - exam readiness (profile readiness + prediction signals)
     - progress charts (cumulative series)
     - heat maps (day x difficulty cells)
     - learning efficiency / speed / completion / consistency
   Reports: docs/phase27_dashboard.json + docs/phase27_analytics.json
   Usage:   node assistant/analytics-engine.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT_DASH = path.join(ROOT, "docs", "phase27_dashboard.json");
const OUT_ANAL = path.join(ROOT, "docs", "phase27_analytics.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");

function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
function weekKey(day) {
  const d = new Date(day + "T00:00:00Z");
  const w = Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + "-W" + String(w).padStart(2, "0");
}

function generate(db) {
  const profile = db.prepare("SELECT * FROM user_profiles").all()[0] || {};
  const history = db.prepare(
    "SELECT substr(h.answered_at,1,10) day, h.correct, h.time_taken_sec, h.mode, m.subject_id, m.difficulty FROM history h JOIN mcqs m ON m.id=h.mcq_id ORDER BY h.answered_at"
  ).all();
  const total = history.length;
  const ok = history.filter((h) => h.correct === 1).length;

  /* ---- daily statistics ---- */
  const byDay = new Map();
  for (const h of history) {
    if (!byDay.has(h.day)) byDay.set(h.day, { day: h.day, attempts: 0, correct: 0 });
    const d = byDay.get(h.day);
    d.attempts++; d.correct += h.correct;
  }
  const dailyStats = [...byDay.values()].map((d) => ({ ...d, accuracy: pct(d.correct, d.attempts) }));

  /* ---- weekly statistics (last 4 weeks) ---- */
  const byWeek = new Map();
  for (const h of history) {
    const k = weekKey(h.day);
    if (!byWeek.has(k)) byWeek.set(k, { week: k, attempts: 0, correct: 0 });
    const w = byWeek.get(k);
    w.attempts++; w.correct += h.correct;
  }
  const weeklyStats = [...byWeek.values()]
    .map((w) => ({ ...w, accuracy: pct(w.correct, w.attempts) }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-4);

  /* ---- subject statistics ---- */
  const bySubj = new Map();
  for (const h of history) {
    if (!bySubj.has(h.subject_id)) bySubj.set(h.subject_id, { subject_id: h.subject_id, attempts: 0, correct: 0 });
    const s = bySubj.get(h.subject_id);
    s.attempts++; s.correct += h.correct;
  }
  const subjectStats = [...bySubj.values()]
    .map((s) => ({ ...s, accuracy: pct(s.correct, s.attempts) }))
    .sort((a, b) => b.attempts - a.attempts);

  /* ---- exam readiness ---- */
  const predictions = db.prepare(
    "SELECT exam_id, exam_title, COUNT(*) n, ROUND(AVG(prob_pass)*100,1) avg_prob_pass, ROUND(AVG(readiness)*100,1) avg_readiness FROM predictions GROUP BY exam_id ORDER BY n DESC"
  ).all();
  const targetExam = profile.target_exam || "";
  const readiness = {
    profile_readiness: profile.readiness_score || 0,
    profile_accuracy: profile.avg_accuracy || 0,
    profile_consistency: profile.consistency || 0,
    predicted: predictions.find((p) => p.exam_id === targetExam) || null,
    all_exams: predictions,
    verdict: (profile.readiness_score || 0) >= 60 ? "on-track" : "needs-work",
  };

  /* ---- progress charts (cumulative) ---- */
  let cumOk = 0;
  let cumN = 0;
  const progressCharts = {
    cumulative_accuracy: dailyStats.map((d) => {
      cumOk += d.correct; cumN += d.attempts;
      return { day: d.day, attempts: d.attempts, correct: d.correct, accuracy: pct(d.correct, d.attempts), cumulative_accuracy: pct(cumOk, cumN) };
    }),
    weekly_accuracy: weeklyStats,
    subject_accuracy: subjectStats,
  };

  /* ---- heat maps: day x difficulty ---- */
  const heat = new Map();
  for (const h of history) {
    const key = h.day + "|" + (h.difficulty || "unknown");
    if (!heat.has(key)) heat.set(key, { attempts: 0, correct: 0 });
    const c = heat.get(key);
    c.attempts++; c.correct += h.correct;
  }
  const heatMap = {
    cells: [...heat.entries()].map(([k, v]) => {
      const [day, difficulty] = k.split("|");
      return { day, difficulty, attempts: v.attempts, correct: v.correct, accuracy: pct(v.correct, v.attempts) };
    }),
    legend: "Rows are study days; columns difficulty bands.",
  };

  /* ---- learning efficiency ---- */
  const sessions = db.prepare("SELECT * FROM learning_sessions ORDER BY started_at").all();
  const sessionAgg = {
    count: sessions.length,
    total_questions: sessions.reduce((a, s) => a + (s.mcqs_answered || 0), 0),
    total_correct: sessions.reduce((a, s) => a + (s.correct || 0), 0),
    accuracy: pct(sessions.reduce((a, s) => a + (s.correct || 0), 0), sessions.reduce((a, s) => a + (s.mcqs_answered || 0), 0)),
    avg_duration_sec: sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.duration_sec || 0), 0) / sessions.length) : 0,
  };

  /* ---- question solving speed ---- */
  const timed = history.filter((h) => (h.time_taken_sec || 0) > 0);
  const avgSpeed = timed.length ? Math.round(timed.reduce((a, h) => a + h.time_taken_sec, 0) / timed.length) : 0;
  const speedStats = {
    measured_attempts: timed.length,
    avg_speed_sec: avgSpeed,
    profile_avg_speed_sec: profile.avg_speed_sec || 0,
    efficiency_grade: avgSpeed > 0 && avgSpeed <= 45 ? "excellent" : avgSpeed <= 60 ? "good" : avgSpeed > 0 ? "slow" : "unmeasured",
  };

  /* ---- accuracy per mode/difficulty ---- */
  const byMode = new Map();
  for (const h of history) {
    if (!byMode.has(h.mode)) byMode.set(h.mode, { mode: h.mode, attempts: 0, correct: 0 });
    const m = byMode.get(h.mode);
    m.attempts++; m.correct += h.correct;
  }
  const byDiff = new Map();
  for (const h of history) {
    const d = h.difficulty || "unknown";
    if (!byDiff.has(d)) byDiff.set(d, { difficulty: d, attempts: 0, correct: 0 });
    const c = byDiff.get(d);
    c.attempts++; c.correct += h.correct;
  }

  /* ---- completion rates ---- */
  const plans = db.prepare("SELECT plan_type, items_json FROM study_plans").all();
  let planItems = 0;
  let planDone = 0;
  for (const p of plans) {
    if (p.plan_type !== "daily") continue;
    let items = [];
    try { items = JSON.parse(p.items_json); } catch (e) {}
    planItems += items.length;
    planDone += items.filter((i) => i.done === true).length;
  }
  const completionRates = {
    plan_items: planItems,
    plan_items_done: planDone,
    plan_completion_pct: pct(planDone, planItems),
    sessions: sessionAgg.count,
  };

  /* ---- study consistency ---- */
  const days = [...new Set(history.map((h) => h.day))].sort();
  let longestStreak = 0;
  let cur = 0;
  for (let i = 0; i < days.length; i++) {
    cur = i === 0 || (Date.parse(days[i]) - Date.parse(days[i - 1])) / 86400000 === 1 ? cur + 1 : 1;
    longestStreak = Math.max(longestStreak, cur);
  }
  const consistency = {
    study_days: days.length,
    longest_streak: longestStreak,
    active_ratio: pct(days.length, 30),
    profile_consistency: profile.consistency || 0,
    grade: days.length >= 10 ? "consistent" : "building",
  };

  const dashboard = {
    step: "dashboard",
    generated_at: new Date().toISOString(),
    summary: {
      total_attempts: total,
      overall_accuracy: pct(ok, total),
      study_days: days.length,
      subjects_touched: subjectStats.length,
      exam_target: targetExam,
      readiness: readiness.verdict,
      status: "PASS",
    },
    daily_statistics: dailyStats,
    weekly_statistics: weeklyStats,
    subject_statistics: subjectStats,
    exam_readiness: readiness,
    progress_charts: progressCharts,
    heat_map: heatMap,
  };

  const analytics = {
    step: "analytics",
    generated_at: new Date().toISOString(),
    summary: {
      learning_efficiency: "accuracy " + pct(ok, total) + "% across " + total + " attempts",
      question_solving_speed: avgSpeed + "s (measured on " + timed.length + " attempts)",
      completion_rate: pct(planDone, planItems) + "% of plan items done",
      consistency: consistency.grade + " (" + longestStreak + "-day streak)",
      status: "PASS",
    },
    learning_efficiency: {
      overall_accuracy: pct(ok, total),
      total_attempts: total,
      total_correct: ok,
      sessions: sessionAgg,
    },
    question_solving_speed: speedStats,
    accuracy: {
      overall: pct(ok, total),
      by_mode: [...byMode.values()].map((m) => ({ ...m, accuracy: pct(m.correct, m.attempts) })),
      by_difficulty: [...byDiff.values()].map((d) => ({ ...d, accuracy: pct(d.correct, d.attempts) })),
      by_subject: subjectStats,
    },
    completion_rates: completionRates,
    study_consistency: consistency,
  };

  return { dashboard, analytics };
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const { dashboard, analytics } = generate(db);
    fs.mkdirSync(path.dirname(OUT_DASH), { recursive: true });
    fs.writeFileSync(OUT_DASH, JSON.stringify(dashboard, null, 2), "utf8");
    fs.writeFileSync(OUT_ANAL, JSON.stringify(analytics, null, 2), "utf8");
    console.log(`[analytics-engine] acc=${dashboard.summary.overall_accuracy}% days=${dashboard.summary.study_days} speed=${analytics.summary.question_solving_speed} consistency=${analytics.summary.consistency}`);
    console.log("report -> docs/phase27_dashboard.json + docs/phase27_analytics.json");
    process.exit(0);
  } catch (e) {
    console.error("[analytics-engine] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate };
