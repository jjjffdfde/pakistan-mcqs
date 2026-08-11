/* ============================================================
   Phase 12 — AI learning engine: achievements + notifications
   Server-side mirror of the client achievement set, derived
   deterministically from history + learning_sessions. Unlocks
   write a notification row.
   ============================================================ */
"use strict";
const U = require("./util.js");

function notify(db, deviceId, type, title, body, link) {
  db.run(
    `INSERT INTO notifications (device_id, type, title, body, link) VALUES (?,?,?,?,?)`,
    [deviceId, type, title.slice(0, 200), String(body || "").slice(0, 500), String(link || "").slice(0, 300)]
  );
}

function check(db, deviceId) {
  const total = db.get("SELECT COUNT(*) n FROM history WHERE device_id=?", [deviceId]).n;
  const answered = db.get(
    "SELECT COUNT(*) n FROM history WHERE device_id=? AND NOT skipped", [deviceId]
  ).n;
  const correct = db.get(
    "SELECT COUNT(*) n FROM history WHERE device_id=? AND NOT skipped AND correct", [deviceId]
  ).n;
  const acc = U.pct(correct, answered);
  const mockSessions = db.all(
    `SELECT session_type, SUM(mcqs_answered) t, SUM(correct) c FROM learning_sessions
     WHERE device_id=? AND session_type IN ('mock','quiz') GROUP BY session_type`, [deviceId]
  );
  const mockAcc = (mockSessions.find((s) => s.session_type === "mock") || { c: 0, t: 0 });
  const quizAcc = (mockSessions.find((s) => s.session_type === "quiz") || { c: 0, t: 0 });

  const days = db.all(
    "SELECT DISTINCT date(answered_at,'localtime') d FROM history WHERE device_id=? ORDER BY d DESC", [deviceId]
  ).map((r) => r.d);
  let streak = 0;
  if (days.length) {
    const check = new Date(Date.parse(days[0] + "T00:00:00"));
    const nowD = new Date(Date.parse(U.today() + "T00:00:00"));
    if (nowD - check <= 86400000) {
      const set = new Set(days);
      let cursor = check;
      while (set.has(cursor.toISOString().slice(0, 10))) { streak++; cursor.setDate(cursor.getDate() - 1); }
    }
  }

  const candidates = [
    { code: "first-steps", name: "First Steps", value: total, ok: total >= 10 },
    { code: "century-club", name: "Century Club", value: total, ok: total >= 100 },
    { code: "mcq-veteran", name: "MCQ Veteran", value: total, ok: total >= 500 },
    { code: "sharpshooter", name: "Sharpshooter (80%+ accuracy)", value: acc, ok: acc >= 80 && total >= 20 },
    { code: "streak-3", name: "3-Day Streak", value: streak, ok: streak >= 3 },
    { code: "streak-7", name: "Week Warrior", value: streak, ok: streak >= 7 },
    { code: "mock-master", name: "Mock Master (80%+ in a mock)", value: U.pct(mockAcc.c, mockAcc.t), ok: mockAcc.t >= 20 && U.pct(mockAcc.c, mockAcc.t) >= 80 },
    { code: "quiz-ace", name: "Quiz Ace (80%+ in a quiz)", value: U.pct(quizAcc.c, quizAcc.t), ok: quizAcc.t >= 10 && U.pct(quizAcc.c, quizAcc.t) >= 80 }
  ];

  const unlocked = [];
  for (const c of candidates) {
    if (!c.ok) continue;
    const exists = db.get("SELECT 1 FROM achievements WHERE device_id=? AND code=?", [deviceId, c.code]);
    if (!exists) {
      db.run(
        `INSERT INTO achievements (device_id, code, name, value) VALUES (?,?,?,?)`,
        [deviceId, c.code, c.name, c.value]
      );
      notify(db, deviceId, "achievement", "Achievement unlocked: " + c.name,
        "You earned " + c.name + (c.code.startsWith("streak") ? " (" + c.value + " days)." : "."), "#ai-coach");
      unlocked.push(c);
    }
  }
  return { unlocked, streak, total };
}

function list(db, deviceId) {
  return db.all(
    `SELECT a.code, a.name, a.value, a.unlocked_at FROM achievements a WHERE a.device_id=? ORDER BY a.unlocked_at DESC`,
    [deviceId]
  );
}

function notifications(db, deviceId, limit = 30) {
  return db.all(
    `SELECT * FROM notifications WHERE device_id=? ORDER BY created_at DESC LIMIT ?`,
    [deviceId, Math.min(100, limit || 30)]
  );
}

function markRead(db, deviceId, id) {
  if (id && id !== "all") {
    db.run("UPDATE notifications SET read=1 WHERE id=? AND device_id=?", [id, deviceId]);
  } else {
    db.run("UPDATE notifications SET read=1 WHERE device_id=?", [deviceId]);
  }
  return { ok: true };
}

module.exports = { check, list, notifications, markRead, notify };
