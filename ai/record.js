/* ============================================================
   Phase 12 — AI learning engine: answer recording
   Single write path for every answer (practice, quiz, mock,
   adaptive, flashcard-backed) so history, leaderboard and
   period leaderboards stay in sync. Wrong answers are auto-
   scheduled for spaced revision.
   ============================================================ */
"use strict";
const U = require("./util.js");
const spaced = require("./spaced.js");

function recordAnswer(db, { device_id, mcq_id, correct, time_taken_sec, skipped, mode, session_id }) {
  const dev = device_id || "default";
  const ok = correct === true || correct === 1;
  const pts = ok ? 10 : 0;
  const skip = skipped === true || skipped === 1 ? 1 : 0;
  const t = U.clamp(parseInt(time_taken_sec, 10) || 0, 0, 3600);
  const sess = parseInt(session_id, 10) || 0;
  const mod = String(mode || "practice").slice(0, 40);

  db.run(
    `INSERT INTO history (device_id, mcq_id, correct, points, mode, time_taken_sec, skipped, session_id)
     VALUES (?,?,?,?,?,?,?,?)`,
    [dev, mcq_id, ok ? 1 : 0, pts, mod, t, skip, sess]
  );

  const upd = db.run(
    `UPDATE leaderboard SET points=points+?, correct=correct+?, total=total+1,
       week_key=strftime('%W','now'), month_key=strftime('%Y-%m','now')
     WHERE device_id=?`,
    [pts, ok ? 1 : 0, dev]
  );
  if (upd.changes === 0) {
    db.run(
      `INSERT OR IGNORE INTO leaderboard (device_id,points,correct,total,week_key,month_key)
       VALUES (?,?,?,?,strftime('%W','now'),strftime('%Y-%m','now'))`,
      [dev, pts, ok ? 1 : 0, 1]
    );
  }

  const today = U.today();
  for (const period of ["daily", "weekly", "monthly", "yearly"]) {
    const key = U.periodKey(period, today);
    const p = db.get("SELECT * FROM leaderboard_periods WHERE device_id=? AND period=? AND period_key=?", [dev, period, key]);
    if (p) {
      db.run(`UPDATE leaderboard_periods SET points=points+?, correct=correct+?, total=total+1, updated_at=datetime('now')
              WHERE device_id=? AND period=? AND period_key=?`, [pts, ok ? 1 : 0, dev, period, key]);
    } else {
      db.run(`INSERT INTO leaderboard_periods (device_id, period, period_key, points, correct, total)
              VALUES (?,?,?,?,?,?)`, [dev, period, key, pts, ok ? 1 : 0, 1]);
    }
  }

  if (!ok) {
    const row = db.get("SELECT topic_id FROM mcqs WHERE id=?", [mcq_id]);
    spaced.scheduleMcq(db, dev, mcq_id, row ? row.topic_id : "");
  }

  return { points: pts, correct: ok, skipped: skip };
}

module.exports = { recordAnswer };
