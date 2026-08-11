/* ============================================================
   Phase 12 — AI learning engine: recommendations
   Hybrid engine: weak topics -> practice, due revisions ->
   spaced session, low-coverage target exam -> mock/pastpaper,
   weak current-affairs topic -> digest, due cards -> flashcards,
   study-plan items -> daily focus. Rebuilt per device.
   ============================================================ */
"use strict";
const U = require("./util.js");
const spaced = require("./spaced.js");
const weak = require("./weak.js");
const flashcards = require("./flashcards.js");

function build(db, deviceId) {
  const weakList = weak.weakTopics(db, deviceId, 4);
  const dueRev = spaced.dueCount(db, deviceId);
  const dueCards = flashcards.stats(db, deviceId)?.due || 0;
  const prof = db.get("SELECT * FROM user_profiles WHERE device_id=?", [deviceId]) || {};

  const recs = [];
  const nowTs = Date.now();
  const push = (rec_type, target_id, title, reason, priority) => {
    recs.push({ rec_type, target_id: target_id || "", title, reason, priority });
  };

  for (const w of weakList.slice(0, 3)) {
    push("weak-topic", w.topic_id,
      "Master weak area: " + (w.topic_name || w.topic_id),
      "Accuracy " + Math.round(100 - w.weakness_score * 100) + "% on " + w.total + " attempts",
      5);
  }

  if (dueRev > 0) {
    push("revision", "", "Spaced revision session", dueRev + " questions due today", 4);
  }
  if (dueCards > 0) {
    push("flashcard", "", "Flashcard review", dueCards + " cards due today", 3);
  }

  const targetExam = prof.target_exam || "";
  if (targetExam) {
    const mock = db.get("SELECT id, title FROM mocktests WHERE exam_id=? AND status='active' LIMIT 1", [targetExam]);
    if (mock) {
      push("mock", mock.id, "Mock: " + mock.title, "Target exam " + targetExam + " — take a timed simulation", 4);
    }
  } else {
    const mock = db.get("SELECT id, title FROM mocktests WHERE status='active' ORDER BY RANDOM() LIMIT 1");
    if (mock && weakList.length) {
      push("mock", mock.id, "Mock: " + mock.title, "Test your overall readiness", 2);
    }
  }

  const weakCA = weakList.find((w) => String(w.topic_name || w.topic_id).toLowerCase().includes("current"));
  if (weakCA) {
    push("current-affairs", "", "Current affairs digest", "Weak topic: " + (weakCA.topic_name || weakCA.topic_id), 3);
  }

  const missingSubjects = db.all(
    `SELECT s.id, s.name, (SELECT COUNT(*) FROM mcqs m WHERE m.subject_id=s.id AND m.status='active') total
     FROM subjects s WHERE s.status='active' ORDER BY total DESC LIMIT 30`
  );
  const known = db.all("SELECT DISTINCT m.subject_id FROM history h JOIN mcqs m ON m.id=h.mcq_id WHERE h.device_id=?", [deviceId]);
  const knownSet = new Set(known.map((k) => k.subject_id));
  const untouched = missingSubjects.find((s) => !knownSet.has(s.id));
  if (untouched) {
    push("subject", untouched.id, "Explore: " + untouched.name,
      untouched.total + " questions you haven't touched yet", 2);
  }

  db.transaction(() => {
    db.run("DELETE FROM recommendations WHERE device_id=?", [deviceId]);
    for (const r of recs) {
      db.run(
        `INSERT INTO recommendations (device_id, rec_type, target_id, title, reason, priority, created_at)
         VALUES (?,?,?,?,?,?,datetime('now'))`,
        [deviceId, r.rec_type, r.target_id, r.title.slice(0, 200), r.reason.slice(0, 300), r.priority]
      );
    }
    db.run(`UPDATE ai_state SET value=?, built_at=datetime('now') WHERE key=?`, [String(nowTs), "recs:" + deviceId]);
  });

  return recs;
}

function list(db, deviceId, limit = 20) {
  const rows = db.all(
    `SELECT * FROM recommendations WHERE device_id=? ORDER BY priority DESC, created_at DESC LIMIT ?`,
    [deviceId, Math.min(50, limit || 20)]
  );
  if (!rows.length && !db.get("SELECT 1 FROM ai_state WHERE key=?", ["recs:" + deviceId])) {
    build(db, deviceId);
    return list(db, deviceId, limit);
  }
  db.run("UPDATE recommendations SET seen=1 WHERE device_id=? AND seen=0", [deviceId]);
  return rows.map((r) => ({
    id: r.id, rec_type: r.rec_type, target_id: r.target_id, title: r.title,
    reason: r.reason, priority: r.priority, created_at: r.created_at
  }));
}

module.exports = { build, list };
