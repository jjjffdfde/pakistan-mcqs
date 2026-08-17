/* runtime-v2/ai/profile.cjs — user profile + readiness model, file-backed.
   Port of ai/profile.js: history from the file user-store, sessions from the
   JSON table store, profile upsert to the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const US = require("../user-store.cjs");

function skillLevel(acc, volume) {
  if (volume < 10) return "novice";
  if (acc >= 85) return "expert";
  if (acc >= 70) return "advanced";
  if (acc >= 50) return "intermediate";
  return "novice";
}

async function refresh(deviceId) {
  const h = US.history()
    .filter((r) => r.device_id === deviceId)
    .map((r) => ({ ...r, d: U.localDate(r.answered_at) }));

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

  const cur = S.get("user_profiles", { device_id: deviceId }) || {};
  await S.upsert("user_profiles", { device_id: deviceId }, {
    ...cur,
    device_id: deviceId,
    skill_level: level, readiness_score: readiness, avg_accuracy: acc, avg_speed_sec: avgSpeed,
    consistency, total_sessions: total, last_active: U.today(), updated_at: U.utcNow()
  });

  const sessions = S.all("learning_sessions", { match: { device_id: deviceId } });
  const byType = new Map();
  for (const s of sessions) {
    if (!byType.has(s.session_type)) byType.set(s.session_type, { n: 0, c: 0, t: 0 });
    const g = byType.get(s.session_type);
    g.n++; g.c += s.correct || 0; g.t += s.mcqs_answered || 0;
  }

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
    sessions: [...byType.entries()].map(([type, g]) => ({ type, count: g.n, accuracy: U.pct(g.c, g.t) }))
  };
}

async function get(deviceId) {
  return refresh(deviceId);
}

module.exports = { refresh, get };
