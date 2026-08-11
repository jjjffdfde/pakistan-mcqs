/* ============================================================
   Phase 12 — AI learning engine: spaced repetition (SM-2 lite)
   Boxes 1/3/7/14/30/60/90 days with an ease factor. Quality:
   0-2 again (reset box 1), 3 hard, 4 good, 5 easy.
   ============================================================ */
"use strict";
const U = require("./util.js");

const BOXES = [1, 3, 7, 14, 30, 60, 90];

function nextState(box, ease, quality) {
  let e = Number(ease) || 2.5;
  if (quality >= 3) e = Math.max(1.3, e + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  else e = Math.max(1.3, e - 0.2);
  let b = box;
  if (quality < 3) b = 1;
  else if (quality === 3) b = Math.min(box + 1, BOXES.length);
  else b = Math.min(box + 1, BOXES.length);
  if (quality === 5 && box >= 2) b = Math.min(box + 1, BOXES.length);
  const interval = quality < 3 ? 1 : BOXES[Math.max(0, Math.min(b - 1, BOXES.length - 1))];
  return { box: b, ease: Math.round(e * 100) / 100, interval };
}

function dueQuery(db, deviceId, table, limit) {
  return db.all(
    `SELECT * FROM ${table} WHERE device_id = ? AND due_date <= ? AND status = 'active' ORDER BY due_date ASC LIMIT ?`,
    [deviceId, U.today(), Math.min(200, limit || 50)]
  );
}

function scheduleMcq(db, deviceId, mcqId, topicId) {
  db.run(
    `INSERT INTO revision_schedule (device_id, mcq_id, topic_id, box, ease, interval_days, due_date, next_review, status)
     VALUES (?,?,?,1,2.5,1,?,?, 'active')
     ON CONFLICT(device_id, mcq_id) DO NOTHING`,
    [deviceId, mcqId, topicId || "", U.today(), U.addDays(U.today(), 1)]
  );
}

function review(db, deviceId, mcqId, quality) {
  const q = U.clamp(parseInt(quality, 10) || 0, 0, 5);
  const row = db.get("SELECT * FROM revision_schedule WHERE device_id = ? AND mcq_id = ?", [deviceId, mcqId]);
  const st = row
    ? nextState(row.box, row.ease, q)
    : nextState(1, 2.5, q);
  const next = U.addDays(U.today(), st.interval);
  if (row) {
    db.run(
      `UPDATE revision_schedule SET box=?, ease=?, interval_days=?, due_date=?, last_review=?, next_review=?, reviews=reviews+1
       WHERE device_id=? AND mcq_id=?`,
      [st.box, st.ease, st.interval, next, U.today(), next, deviceId, mcqId]
    );
  } else {
    scheduleMcq(db, deviceId, mcqId, "");
    db.run(
      `UPDATE revision_schedule SET box=?, ease=?, interval_days=?, due_date=?, last_review=?, next_review=?, reviews=reviews+1
       WHERE device_id=? AND mcq_id=?`,
      [st.box, st.ease, st.interval, next, U.today(), next, deviceId, mcqId]
    );
  }
  return { mcq_id: mcqId, quality: q, box: st.box, ease: st.ease, interval_days: st.interval, next_review: next };
}

function due(db, deviceId, limit) {
  return dueQuery(db, deviceId, "revision_schedule", limit);
}

function dueCount(db, deviceId) {
  return db.get("SELECT COUNT(*) n FROM revision_schedule WHERE device_id = ? AND due_date <= ? AND status='active'", [deviceId, U.today()]).n;
}

function stats(db, deviceId) {
  return db.get(
    `SELECT COUNT(*) total, SUM(CASE WHEN due_date <= ? THEN 1 ELSE 0 END) due, SUM(reviews) reviews FROM revision_schedule WHERE device_id = ?`,
    [U.today(), deviceId]
  );
}

module.exports = { scheduleMcq, review, due, dueCount, stats, nextState };
