/* ============================================================
   Phase 12 — AI learning engine: leaderboard periods
   Daily / weekly / monthly / yearly / overall boards from
   leaderboard_periods, with optional city/province grouping
   when profiles carry region data.
   ============================================================ */
"use strict";
const U = require("./util.js");

function list(db, { deviceId, period, region, limit }) {
  const p = ["daily", "weekly", "monthly", "yearly", "overall"].includes(period) ? period : "weekly";
  const key = p === "overall" ? "" : U.periodKey(p === "weekly" ? "weekly" : p);
  const lim = Math.min(100, limit || 25);

  let rows;
  if (p === "overall") {
    rows = db.all(
      `SELECT l.device_id, u.name, l.points, l.correct, l.total
       FROM leaderboard l LEFT JOIN user_profiles u ON u.device_id=l.device_id
       ORDER BY l.points DESC LIMIT ?`, [lim]
    );
  } else {
    rows = db.all(
      `SELECT lp.device_id, u.name, lp.points, lp.correct, lp.total, lp.updated_at
       FROM leaderboard_periods lp LEFT JOIN user_profiles u ON u.device_id=lp.device_id
       WHERE lp.period=? AND lp.period_key=?
       ORDER BY lp.points DESC LIMIT ?`, [p, key, lim]
    );
  }

  if (region === "city" || region === "province") {
    const col = region === "city" ? "city" : "province";
    const groups = new Map();
    for (const r of rows) {
      const up = db.get(`SELECT ${col} FROM user_profiles WHERE device_id=?`, [r.device_id]);
      const g = (up && up[col]) || "Unknown";
      if (!groups.has(g)) groups.set(g, { region: g, points: 0, correct: 0, total: 0, players: 0 });
      const gr = groups.get(g);
      gr.points += r.points || 0; gr.correct += r.correct || 0; gr.total += r.total || 0; gr.players++;
    }
    return { period: p, key, region, rows: [...groups.values()].sort((a, b) => b.points - a.points).slice(0, lim) };
  }

  return { period: p, key, rows: rows.map((r, i) => ({ rank: i + 1, ...r })) };
}

module.exports = { list };
