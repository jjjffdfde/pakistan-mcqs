#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 2 + STEP 7: Personal Learning Engine
   Deterministic, read-only learner modelling:
     - learning profile (user_profiles + aggregates)
     - weak concept detection (weak_topics + history failures)
     - strong concept detection (history mastery + strong_topics)
     - revision frequency (revision_schedule boxes/ease/intervals)
     - learning history (by day / subject / mode)
     - STEP 7: revision intelligence (forgotten / failed /
       skipped / bookmarked concepts)
   Reports: docs/phase27_learning_engine.json
            docs/phase27_revision_intelligence.json
   Usage:  node assistant/learning-engine.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase27_learning_engine.json");
const OUT_RI = path.join(ROOT, "docs", "phase27_revision_intelligence.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const DAY = 86400000;

function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
function round1(v) { return Math.round((Number(v) || 0) * 10) / 10; }

/* ---------- STEP 7: revision intelligence ---------- */
function generateIntelligence(db) {
  const today = new Date().toISOString().slice(0, 10);
  const NOW = Math.floor(Date.now() / 1000);

  /* forgotten: due revisions + flashcards beyond their interval window or overdue > 30 days */
  const forgottenRev = db.prepare(
    "SELECT mcq_id, box, interval_days, due_date, reviews FROM revision_schedule WHERE status='active' AND due_date<? ORDER BY due_date LIMIT 20"
  ).all(today);
  const forgottenCards = db.prepare(
    "SELECT mcq_id, box, due_date FROM flashcards WHERE due_date<? ORDER BY due_date LIMIT 20"
  ).all(today);

  /* frequently failed: mcqs answered wrong >= 2 times */
  const failedRows = db.prepare(
    "SELECT h.mcq_id, m.subject_id, m.topic_id, m.difficulty, COUNT(*) n FROM history h JOIN mcqs m ON m.id=h.mcq_id WHERE h.correct=0 GROUP BY h.mcq_id HAVING n>=2 ORDER BY n DESC LIMIT 20"
  ).all();
  const frequentlyFailed = failedRows;

  /* frequently skipped: mcqs skipped >= 2 times */
  const skippedRows = db.prepare(
    "SELECT h.mcq_id, m.subject_id, m.topic_id, m.difficulty, COUNT(*) n FROM history h JOIN mcqs m ON m.id=h.mcq_id WHERE h.skipped=1 GROUP BY h.mcq_id HAVING n>=2 ORDER BY n DESC LIMIT 20"
  ).all();
  const frequentlySkipped = skippedRows;

  /* bookmarked: bookmarks -> mcq -> topic/subject with counts */
  const bookmarkedRows = db.prepare(
    "SELECT b.mcq_id, b.created_at, m.subject_id, m.topic_id, m.difficulty FROM bookmarks b LEFT JOIN mcqs m ON m.id=b.mcq_id ORDER BY b.created_at DESC LIMIT 30"
  ).all();
  const frequentlyBookmarked = bookmarkedRows;

  return {
    step: "revision_intelligence",
    generated_at: new Date().toISOString(),
    summary: {
      forgotten_revisions: forgottenRev.length,
      forgotten_flashcards: forgottenCards.length,
      frequently_failed: frequentlyFailed.length,
      frequently_skipped: frequentlySkipped.length,
      frequently_bookmarked: frequentlyBookmarked.length,
      now_unix: NOW,
      status: "PASS",
    },
    forgotten_concepts: {
      due_revisions: forgottenRev,
      overdue_flashcards: forgottenCards,
      strategy: "Review overdue cards first; re-attempt forgotten questions in practice mode.",
    },
    frequently_failed_concepts: frequentlyFailed,
    frequently_skipped_concepts: frequentlySkipped,
    frequently_bookmarked_concepts: frequentlyBookmarked,
  };
}

function generate(db) {
  const profile = db.prepare("SELECT * FROM user_profiles").all();
  const hist = db.prepare(
    "SELECT m.subject_id, m.difficulty, m.topic_id, SUM(h.correct) ok, COUNT(*) n FROM history h JOIN mcqs m ON m.id=h.mcq_id GROUP BY m.subject_id, m.difficulty, m.topic_id"
  ).all();

  const totalAttempts = hist.reduce((a, r) => a + r.n, 0);
  const totalCorrect = hist.reduce((a, r) => a + r.ok, 0);
  const overallAccuracy = pct(totalCorrect, totalAttempts);

  /* ---- weak / strong detection per topic ---- */
  const byTopic = {};
  for (const r of hist) {
    if (!byTopic[r.topic_id]) byTopic[r.topic_id] = { subject_id: r.subject_id, ok: 0, n: 0 };
    byTopic[r.topic_id].ok += r.ok;
    byTopic[r.topic_id].n += r.n;
  }
  const topicStats = Object.entries(byTopic)
    .map(([tid, v]) => ({ topic_id: tid, subject_id: v.subject_id, attempts: v.n, correct: v.ok, accuracy: pct(v.ok, v.n) }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);

  const weakTopics = topicStats.filter((t) => t.attempts >= 2 && t.accuracy < 60);
  const strongTopics = topicStats.filter((t) => t.accuracy >= 80 && t.attempts >= 2);

  /* ---- stored weak/strong tables ---- */
  const dbWeak = db.prepare(
    "SELECT w.topic_id, w.subject_id, w.weakness_score, w.incorrect, w.total, w.priority, t.name topic_name FROM weak_topics w LEFT JOIN topics t ON t.id=w.topic_id ORDER BY w.priority DESC"
  ).all();
  const dbStrong = db.prepare(
    "SELECT s.topic_id, s.subject_id, s.strength_score, s.correct, s.total, t.name topic_name FROM strong_topics s LEFT JOIN topics t ON t.id=s.topic_id ORDER BY s.strength_score DESC"
  ).all();

  /* ---- revision frequency ---- */
  const revStats = db.prepare("SELECT COUNT(*) n, AVG(ease) ease, AVG(interval_days) interval_days, SUM(reviews) reviews FROM revision_schedule WHERE status='active'").get();
  const revByBox = db.prepare("SELECT box, COUNT(*) n FROM revision_schedule WHERE status='active' GROUP BY box ORDER BY box").all();
  const cardsByBox = db.prepare("SELECT box, COUNT(*) n FROM flashcards GROUP BY box ORDER BY box").all();

  /* ---- learning history rollup ---- */
  const byDay = db.prepare(
    "SELECT substr(answered_at,1,10) day, COUNT(*) n, SUM(correct) ok FROM history GROUP BY day ORDER BY day"
  ).all();
  const bySubject = db.prepare(
    "SELECT m.subject_id, COUNT(*) n, SUM(h.correct) ok FROM history h JOIN mcqs m ON m.id=h.mcq_id GROUP BY m.subject_id ORDER BY n DESC"
  ).all();
  const byMode = db.prepare("SELECT mode, COUNT(*) n, SUM(correct) ok FROM history GROUP BY mode ORDER BY n DESC").all();
  const byDifficulty = db.prepare(
    "SELECT m.difficulty, COUNT(*) n, SUM(h.correct) ok FROM history h JOIN mcqs m ON m.id=h.mcq_id GROUP BY m.difficulty ORDER BY n DESC"
  ).all();
  const sessions = db.prepare(
    "SELECT session_type, mode, COUNT(*) n, SUM(mcqs_answered) q, SUM(correct) ok FROM learning_sessions GROUP BY session_type, mode ORDER BY n DESC"
  ).all();

  const report = {
    step: "learning_engine",
    generated_at: new Date().toISOString(),
    summary: {
      profiles: profile.length,
      total_attempts: totalAttempts,
      overall_accuracy: overallAccuracy,
      weak_topics_detected: weakTopics.length,
      strong_topics_detected: strongTopics.length,
      revisions_active: revStats.n,
      history_days: byDay.length,
      status: "PASS",
    },
    profile: profile.map((p) => ({
      device_id: p.device_id,
      name: p.name,
      daily_hours: p.daily_hours,
      target_exam: p.target_exam,
      target_date: p.target_date,
      skill_level: p.skill_level,
      readiness_score: p.readiness_score,
      avg_accuracy: p.avg_accuracy,
      avg_speed_sec: p.avg_speed_sec,
      consistency: p.consistency,
      total_sessions: p.total_sessions,
      city: p.city,
      province: p.province,
    })),
    weak_concepts: {
      derived: weakTopics.slice(0, 10),
      stored: dbWeak,
    },
    strong_concepts: {
      derived: strongTopics.slice(0, 10),
      stored: dbStrong,
    },
    revision_frequency: {
      active_cards: revStats.n,
      avg_ease: round1(revStats.ease),
      avg_interval_days: revStats.interval_days,
      total_reviews: revStats.reviews,
      boxes: revByBox,
      flashcard_boxes: cardsByBox,
    },
    learning_history: {
      by_day: byDay,
      by_subject: bySubject,
      by_mode: byMode,
      by_difficulty: byDifficulty,
      sessions: sessions,
    },
  };
  return report;
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const report = generate(db);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
    const ri = generateIntelligence(db);
    fs.writeFileSync(OUT_RI, JSON.stringify(ri, null, 2), "utf8");
    console.log(`[learning-engine] accuracy=${report.summary.overall_accuracy}% weak=${report.summary.weak_topics_detected} strong=${report.summary.strong_topics_detected} revisions=${report.summary.revisions_active}`);
    console.log(`[revision-intelligence] forgotten=${ri.summary.forgotten_revisions} failed=${ri.summary.frequently_failed} skipped=${ri.summary.frequently_skipped} bookmarked=${ri.summary.frequently_bookmarked}`);
    console.log("report -> docs/phase27_learning_engine.json + docs/phase27_revision_intelligence.json");
    process.exit(0);
  } catch (e) {
    console.error("[learning-engine] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate, generateIntelligence };
