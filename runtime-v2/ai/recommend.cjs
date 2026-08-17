/* runtime-v2/ai/recommend.cjs — hybrid recommendation engine, file-backed.
   Port of ai/recommend.js: weak topics, due revisions/cards, target-exam
   mock, current-affairs digest, untouched subjects; rows replaced per
   device in the JSON table store with the "recs:dev" watermark in ai_state. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const Q = require("../query-engine.cjs");

async function build(deviceId) {
  const weakList = await require("./weak.cjs").weakTopics(deviceId, 4);
  const dueRev = require("./spaced.cjs").dueCount(deviceId);
  const dueCards = (require("./flashcards.cjs").stats(deviceId) || {}).due || 0;
  const prof = S.get("user_profiles", { device_id: deviceId }) || {};

  const recs = [];
  const nowTs = Date.now();
  const push = (rec_type, target_id, title, reason, priority) => {
    recs.push({ rec_type, target_id: target_id || "", title, reason, priority });
  };

  for (const w of weakList.slice(0, 3)) {
    push("weak-topic", w.topic_id,
      "Master weak area: " + (w.topic_name || w.topic_id),
      "Accuracy " + Math.round(100 - w.weakness_score * 100) + "% on " + w.total + " attempts", 5);
  }

  if (dueRev > 0) push("revision", "", "Spaced revision session", dueRev + " questions due today", 4);
  if (dueCards > 0) push("flashcard", "", "Flashcard review", dueCards + " cards due today", 3);

  const targetExam = prof.target_exam || "";
  if (targetExam) {
    const mock = (await Q.mocktests()).find((m) => m.exam_id === targetExam && m.status === "active");
    if (mock) push("mock", mock.id, "Mock: " + mock.title, "Target exam " + targetExam + " — take a timed simulation", 4);
  } else {
    const mocks = (await Q.mocktests()).filter((m) => m.status === "active");
    const mock = mocks[Math.floor(Math.random() * mocks.length)];
    if (mock && weakList.length) push("mock", mock.id, "Mock: " + mock.title, "Test your overall readiness", 2);
  }

  const weakCA = weakList.find((w) => String(w.topic_name || w.topic_id).toLowerCase().includes("current"));
  if (weakCA) push("current-affairs", "", "Current affairs digest", "Weak topic: " + (weakCA.topic_name || weakCA.topic_id), 3);

  const missingSubjects = (await Q.subjects()).slice().sort((a, b) => (b.mcqs_count || 0) - (a.mcqs_count || 0)).slice(0, 30);
  const hist = require("../user-store.cjs").history().filter((h) => h.device_id === deviceId);
  const { byId } = await Q.fetchRows(hist.map((h) => h.mcq_id));
  const knownSet = new Set(hist.map((h) => { const m = byId.get(h.mcq_id); return m ? m.subject_id : null; }).filter(Boolean));
  const untouched = missingSubjects.find((s) => !knownSet.has(s.id));
  if (untouched) push("subject", untouched.id, "Explore: " + untouched.name, untouched.mcqs_count + " questions you haven't touched yet", 2);

  await S.remove("recommendations", { device_id: deviceId });
  for (const r of recs) {
    await S.insert("recommendations", {
      id: S.nextId("recommendations"), device_id: deviceId, rec_type: r.rec_type,
      target_id: r.target_id, title: r.title.slice(0, 200), reason: r.reason.slice(0, 300),
      priority: r.priority, seen: 0, created_at: U.utcNow()
    });
  }
  await S.stateSet("recs:" + deviceId, String(nowTs));

  return recs;
}

async function list(deviceId, limit = 20) {
  const rows = S.all("recommendations", {
    match: { device_id: deviceId }, order: [["priority", "desc"], ["created_at", "desc"]], limit: Math.min(50, limit || 20)
  });
  if (!rows.length && !S.stateHas("recs:" + deviceId)) {
    await build(deviceId);
    return list(deviceId, limit);
  }
  await S.update("recommendations", { device_id: deviceId, seen: "0" }, { seen: 1 });
  return rows.map((r) => ({
    id: r.id, rec_type: r.rec_type, target_id: r.target_id, title: r.title,
    reason: r.reason, priority: r.priority, created_at: r.created_at
  }));
}

module.exports = { build, list };
