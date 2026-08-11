/* ============================================================
   Phase 12 — AI learning engine: user profile + readiness model
   Computes skill level, accuracy, speed, consistency, streak and
   a 0-100 readiness score from the learner's history.
   ============================================================ */
"use strict";
const U = require("./util.js");

function skillLevel(acc, volume) {
  if (volume < 10) return "novice";
  if (acc >= 85) return "expert";
  if (acc >= 70) return "advanced";
  if (acc >= 50) return "intermediate";
  return "novice";
}

function refresh(db, deviceId) {
  const h = db.all(
    `SELECT h.correct, h.skipped, h.time_taken_sec, date(h.answered_at, 'localtime') d, h.mode
     FROM history h WHERE h.device_id = ? AND h.answered_at IS NOT NULL`,
    [deviceId]
  );

  const total = h.length;
  const answered = h.filter((r) => !r.skipped);
  const correct = answered.filter((r) => r.correct).length;
  const acc = U.pct(correct, answered.length);
  const times = h.map((r) => Number(r.time_taken_sec) || 0).filter((t) => t > 0 && t < 600);
  const avgSpeed = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const skipped = h.filter((r) => r.skipped).length;

  const days = [...new Set(h.map((r) => r.d))].sort();
  const activeDays = days.length;
  const first = days[0] || U.today();
  const span = Math.max(1, Math.floor((Date.parse(U.today() + "T00:00:00") - Date.parse(first + "T00:00:00")) / 86400000) + 1);
  const consistency = U.round2((activeDays / span) * 100);

  let streak = 0;
  if (days.length) {
    const check = new Date(Date.parse((days[days.length - 1] + "T00:00:00")));
    const nowD = new Date(Date.parse(U.today() + "T00:00:00"));
    if (nowD - check <= 86400000) {
      const set = new Set(days);
      let cursor = check;
      while (set.has(cursor.toISOString().slice(0, 10))) { streak++; cursor.setDate(cursor.getDate() - 1); }
    }
  }

  const recency = h.length ? (Date.now() - Date.parse((days[days.length - 1] || U.today()) + "T00:00:00")) / 86400000 : 99;
  const recencyScore = U.clamp(100 - recency * 10, 0, 100);
  const volumeScore = U.clamp(total * 2, 0, 100);
  const consistencyScore = consistency;
  const accuracyScore = acc;
  const readiness = U.round1(accuracyScore * 0.4 + consistencyScore * 0.2 + volumeScore * 0.2 + recencyScore * 0.2);
  const level = skillLevel(acc, total);

  db.run(
    `INSERT INTO user_profiles (device_id, skill_level, readiness_score, avg_accuracy, avg_speed_sec, consistency, total_sessions, last_active, updated_at)
     VALUES (?,?,?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(device_id) DO UPDATE SET
       skill_level=excluded.skill_level, readiness_score=excluded.readiness_score,
       avg_accuracy=excluded.avg_accuracy, avg_speed_sec=excluded.avg_speed_sec,
       consistency=excluded.consistency, total_sessions=excluded.total_sessions,
       last_active=excluded.last_active, updated_at=datetime('now')`,
    [deviceId, level, readiness, acc, avgSpeed, consistency, total, U.today()]
  );

  const sessions = db.all(
    `SELECT session_type, COUNT(*) n, SUM(correct) c, SUM(mcqs_answered) t
     FROM learning_sessions WHERE device_id = ? GROUP BY session_type`, [deviceId]
  );

  return {
    device_id: deviceId,
    level,
    readiness,
    accuracy: acc,
    avg_speed_sec: avgSpeed,
    consistency,
    streak,
    active_days: activeDays,
    total_answered: answered.length,
    total_questions: total,
    skipped,
    sessions: sessions.map((s) => ({ type: s.session_type, count: s.n, accuracy: U.pct(s.c, s.t) }))
  };
}

function get(db, deviceId) {
  return refresh(db, deviceId);
}

module.exports = { refresh, get };
