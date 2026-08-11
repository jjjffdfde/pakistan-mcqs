/* ============================================================
   Phase 12 — AI learning engine: flashcards
   Cards are built from MCQs (front = question / learning
   objective; back = answer + memory trick + explanation).
   Same SM-2 lite scheduler; failed cards cross-schedule their
   underlying MCQ into spaced revision.
   ============================================================ */
"use strict";
const U = require("./util.js");
const spaced = require("./spaced.js");

function build(db, deviceId, limit = 25) {
  const created = [];
  const rows = db.all(
    `SELECT m.id, m.question, m.learning_objective, m.memory_trick, m.explanation, m.correct_answer, m.topic_id,
            o.label, o.text
     FROM mcqs m
     JOIN options o ON o.mcq_id = m.id AND o.label = m.correct_answer
     WHERE m.status = 'active'
       AND m.learning_objective IS NOT NULL AND m.learning_objective != ''
       AND NOT EXISTS (SELECT 1 FROM flashcards f WHERE f.device_id = ? AND f.mcq_id = m.id)
     ORDER BY (m.memory_trick IS NOT NULL) DESC, m.confidence_score ASC
     LIMIT ?`,
    [deviceId, Math.min(200, limit || 25)]
  );
  db.transaction(() => {
    for (const r of rows) {
      const front = r.learning_objective || r.question;
      const backParts = ["Answer: " + (r.text || r.correct_answer)];
      if (r.memory_trick) backParts.push("Trick: " + r.memory_trick);
      if (r.explanation) backParts.push("Why: " + r.explanation.slice(0, 400));
      const cardType = r.memory_trick ? "trick" : "fact";
      db.run(
        `INSERT INTO flashcards (device_id, mcq_id, front, back, card_type, box, ease, due_date, next_review)
         VALUES (?,?,?,?,?,1,2.5,?,?)
         ON CONFLICT(device_id, mcq_id) DO NOTHING`,
        [deviceId, r.id, front.slice(0, 500), backParts.join(" | ").slice(0, 900), cardType, U.today(), U.addDays(U.today(), 1)]
      );
      created.push(r.id);
    }
  });
  return { built: created.length };
}

function due(db, deviceId, limit = 25) {
  return db.all(
    `SELECT f.id, f.mcq_id, f.front, f.back, f.card_type, f.box, f.reviews, f.due_date
     FROM flashcards f WHERE f.device_id = ? AND f.due_date <= ? ORDER BY f.due_date ASC LIMIT ?`,
    [deviceId, U.today(), Math.min(200, limit || 25)]
  );
}

function review(db, deviceId, cardId, quality) {
  const q = U.clamp(parseInt(quality, 10) || 0, 0, 5);
  const card = db.get("SELECT * FROM flashcards WHERE id = ? AND device_id = ?", [cardId, deviceId]);
  if (!card) return { error: "card not found" };
  const st = spaced.nextState(card.box, card.ease, q);
  const next = U.addDays(U.today(), st.interval);
  db.run(
    `UPDATE flashcards SET box=?, ease=?, due_date=?, next_review=?, reviews=reviews+1 WHERE id=?`,
    [st.box, st.ease, next, next, cardId]
  );
  if (q < 3 && card.mcq_id) spaced.scheduleMcq(db, deviceId, card.mcq_id, card.topic_id || "");
  return { card_id: cardId, quality: q, box: st.box, ease: st.ease, interval_days: st.interval, next_review: next, cross_scheduled: q < 3 };
}

function stats(db, deviceId) {
  return db.get(
    `SELECT COUNT(*) total, SUM(CASE WHEN due_date <= ? THEN 1 ELSE 0 END) due, SUM(reviews) reviews FROM flashcards WHERE device_id = ?`,
    [U.today(), deviceId]
  );
}

module.exports = { build, due, review, stats };
