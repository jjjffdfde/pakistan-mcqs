/* ============================================================
   Phase 12 — AI learning engine: analytics aggregations
   Daily activity curve, accuracy trend, subject mastery,
   consistency and prediction trend — all from history.
   ============================================================ */
"use strict";
const U = require("./util.js");

function overview(db, deviceId) {
  const daily = db.all(
    `SELECT date(answered_at, 'localtime') d,
            COUNT(*) total,
            SUM(CASE WHEN skipped THEN 1 ELSE 0 END) skipped,
            SUM(CASE WHEN NOT skipped AND correct THEN 1 ELSE 0 END) correct
     FROM history WHERE device_id=?
     GROUP BY d ORDER BY d DESC LIMIT 14`,
    [deviceId]
  ).reverse();

  const trend = db.all(
    `SELECT date(answered_at,'localtime') d, SUM(CASE WHEN NOT skipped AND correct THEN 1 ELSE 0 END) c,
            SUM(CASE WHEN skipped THEN 0 ELSE 1 END) t
     FROM history WHERE device_id=? GROUP BY d ORDER BY d ASC LIMIT 30`,
    [deviceId]
  );

  const mastery = db.all(
    `SELECT m.subject_id, s.name subject_name,
            COUNT(*) total,
            SUM(CASE WHEN NOT h.skipped AND h.correct THEN 1 ELSE 0 END) correct,
            SUM(CASE WHEN h.skipped THEN 1 ELSE 0 END) skipped
     FROM history h JOIN mcqs m ON m.id=h.mcq_id
     LEFT JOIN subjects s ON s.id=m.subject_id
     WHERE h.device_id=?
     GROUP BY m.subject_id
     ORDER BY total DESC LIMIT 10`,
    [deviceId]
  ).map((r) => ({ ...r, accuracy: U.pct(r.correct, r.total - r.skipped) }));

  const sessions = db.all(
    `SELECT session_type, COUNT(*) n, SUM(mcqs_answered) answered, SUM(correct) correct, AVG(accuracy) avg_acc
     FROM learning_sessions WHERE device_id=? GROUP BY session_type`,
    [deviceId]
  );

  const lastPreds = db.all(
    `SELECT * FROM predictions WHERE device_id=? ORDER BY created_at DESC LIMIT 10`, [deviceId]
  );

  return {
    daily,
    trend,
    mastery,
    sessions,
    recent_predictions: lastPreds.map((p) => ({ exam_title: p.exam_title, prob_pass: p.prob_pass, expected_pct: p.readiness, created_at: p.created_at }))
  };
}

module.exports = { overview };
