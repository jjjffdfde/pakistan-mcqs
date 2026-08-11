/* ============================================================
   Phase 12 — AI learning engine: weak / strong topic detection
   Full rebuild per device (idempotent): accuracy < 60% => weak,
   accuracy >= 80% with >= 5 attempts => strong. Weakness score
   adds skip and slow-speed penalties; priority ranks urgency.
   ============================================================ */
"use strict";
const U = require("./util.js");

const WEAK_ACC = 60;
const STRONG_ACC = 80;
const MIN_ATTEMPTS = 3;
const MIN_STRONG_ATTEMPTS = 5;

function rebuild(db, deviceId) {
  const rows = db.all(
    `SELECT m.topic_id, m.subject_id,
            COUNT(*) total,
            SUM(CASE WHEN h.skipped THEN 1 ELSE 0 END) skipped,
            SUM(CASE WHEN NOT h.skipped AND h.correct THEN 1 ELSE 0 END) correct,
            AVG(CASE WHEN h.time_taken_sec > 0 AND h.time_taken_sec < 600 THEN h.time_taken_sec END) avg_sec
     FROM history h JOIN mcqs m ON m.id = h.mcq_id
     WHERE h.device_id = ? AND m.topic_id IS NOT NULL AND m.topic_id != ''
     GROUP BY m.topic_id, m.subject_id`,
    [deviceId]
  );

  db.transaction(() => {
    db.run("DELETE FROM weak_topics WHERE device_id = ?", [deviceId]);
    db.run("DELETE FROM strong_topics WHERE device_id = ?", [deviceId]);
    for (const r of rows) {
      const answered = r.total - r.skipped;
      const acc = U.pct(r.correct, answered);
      if (answered >= MIN_ATTEMPTS && acc < WEAK_ACC) {
        const slowPenalty = r.avg_sec && r.avg_sec > 60 ? Math.min(0.15, (r.avg_sec - 60) / 600) : 0;
        const skipPenalty = r.total > 0 ? Math.min(0.1, r.skipped / r.total) : 0;
        const weakness = U.round2(1 - acc / 100 + skipPenalty + slowPenalty);
        const priority = U.round2(weakness * 100);
        db.run(
          `INSERT INTO weak_topics (device_id, topic_id, subject_id, weakness_score, incorrect, total, skipped, slow_avg_sec, priority, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))
           ON CONFLICT(device_id, topic_id) DO UPDATE SET weakness_score=excluded.weakness_score, incorrect=excluded.incorrect,
             total=excluded.total, skipped=excluded.skipped, slow_avg_sec=excluded.slow_avg_sec,
             priority=excluded.priority, updated_at=datetime('now')`,
          [deviceId, r.topic_id, r.subject_id || "", weakness, answered - r.correct, r.total, r.skipped, Math.round(r.avg_sec || 0), priority]
        );
      } else if (answered >= MIN_STRONG_ATTEMPTS && acc >= STRONG_ACC) {
        db.run(
          `INSERT INTO strong_topics (device_id, topic_id, subject_id, strength_score, correct, total, streak, updated_at)
           VALUES (?,?,?,?,?,?,?,datetime('now'))
           ON CONFLICT(device_id, topic_id) DO UPDATE SET strength_score=excluded.strength_score,
             correct=excluded.correct, total=excluded.total, updated_at=datetime('now')`,
          [deviceId, r.topic_id, r.subject_id || "", U.round2(acc / 100), r.correct, r.total, 0]
        );
      }
    }
  });
  return { weak: count(db, deviceId, "weak"), strong: count(db, deviceId, "strong") };
}

function count(db, deviceId, kind) {
  return db.get(`SELECT COUNT(*) n FROM ${kind === "weak" ? "weak_topics" : "strong_topics"} WHERE device_id = ?`, [deviceId]).n;
}

function weakTopics(db, deviceId, limit = 50) {
  const rows = db.all(
    `SELECT w.*, t.name topic_name, s.name subject_name
     FROM weak_topics w
     LEFT JOIN topics t ON t.id = w.topic_id
     LEFT JOIN subjects s ON s.id = w.subject_id
     WHERE w.device_id = ? ORDER BY w.priority DESC LIMIT ?`,
    [deviceId, Math.min(500, limit || 50)]
  );
  return rows;
}

function strongTopics(db, deviceId, limit = 50) {
  return db.all(
    `SELECT s2.*, t.name topic_name, s.name subject_name
     FROM strong_topics s2
     LEFT JOIN topics t ON t.id = s2.topic_id
     LEFT JOIN subjects s ON s.id = s2.subject_id
     WHERE s2.device_id = ? ORDER BY s2.strength_score DESC LIMIT ?`,
    [deviceId, Math.min(500, limit || 50)]
  );
}

module.exports = { rebuild, weakTopics, strongTopics };
