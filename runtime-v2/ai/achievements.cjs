/* runtime-v2/ai/achievements.cjs — achievements + notifications, file-backed.
   Port of ai/achievements.js: history from the file user-store, sessions and
   achievement/notification rows in the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const US = require("../user-store.cjs");

function notify(deviceId, type, title, body, link) {
  return S.insert("notifications", {
    id: S.nextId("notifications"),
    device_id: deviceId, type,
    title: String(title).slice(0, 200), body: String(body || "").slice(0, 500),
    link: String(link || "").slice(0, 300), read: 0, created_at: U.utcNow()
  });
}

async function check(deviceId) {
  const hist = US.history().filter((h) => h.device_id === deviceId);
  const total = hist.length;
  const answered = hist.filter((h) => !h.skipped);
  const correct = answered.filter((h) => h.correct).length;
  const acc = U.pct(correct, answered.length);

  const sessions = S.all("learning_sessions", { match: { device_id: deviceId } });
  const mock = sessions.filter((s) => s.session_type === "mock");
  const quiz = sessions.filter((s) => s.session_type === "quiz");
  const mockAcc = { c: mock.reduce((a, s) => a + (s.correct || 0), 0), t: mock.reduce((a, s) => a + (s.mcqs_answered || 0), 0) };
  const quizAcc = { c: quiz.reduce((a, s) => a + (s.correct || 0), 0), t: quiz.reduce((a, s) => a + (s.mcqs_answered || 0), 0) };

  const days = [...new Set(hist.map((r) => U.localDate(r.answered_at)))].sort((a, b) => (a < b ? 1 : -1));
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
    const exists = S.get("achievements", { device_id: deviceId, code: c.code });
    if (!exists) {
      await S.insert("achievements", {
        id: S.nextId("achievements"), device_id: deviceId, code: c.code,
        name: c.name, value: c.value, unlocked_at: U.utcNow()
      });
      await notify(deviceId, "achievement", "Achievement unlocked: " + c.name,
        "You earned " + c.name + (c.code.startsWith("streak") ? " (" + c.value + " days)." : "."), "#ai-coach");
      unlocked.push(c);
    }
  }
  return { unlocked, streak, total };
}

function list(deviceId) {
  return S.all("achievements", { match: { device_id: deviceId }, order: [["unlocked_at", "desc"]] })
    .map(({ code, name, value, unlocked_at }) => ({ code, name, value, unlocked_at }));
}

function notifications(deviceId, limit = 30) {
  return S.all("notifications", {
    match: { device_id: deviceId }, order: [["created_at", "desc"]], limit: Math.min(100, limit || 30)
  });
}

function markRead(deviceId, id) {
  if (id && id !== "all") return S.update("notifications", { id, device_id: deviceId }, { read: 1 }).then(() => ({ ok: true }));
  return S.update("notifications", { device_id: deviceId }, { read: 1 }).then(() => ({ ok: true }));
}

module.exports = { check, list, notifications, markRead, notify };
