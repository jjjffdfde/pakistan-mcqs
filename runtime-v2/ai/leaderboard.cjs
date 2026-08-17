/* runtime-v2/ai/leaderboard.cjs — leaderboard periods, file-backed.
   Port of ai/leaderboard.js: overall board from the file leaderboard,
   period boards from the file periods store, names/region joined from
   user_profiles in the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const US = require("../user-store.cjs");

function keyFor(period) {
  const now = new Date();
  const d = now.toISOString();
  const y = now.getUTCFullYear();
  if (period === "daily") return d.slice(0, 10);
  if (period === "weekly") {
    const dowJan1 = (new Date(Date.UTC(y, 0, 1)).getUTCDay() + 6) % 7;
    const doy = Math.floor((now - Date.UTC(y, 0, 1)) / 86400000);
    return y + "-W" + String(Math.floor((doy + 6 - dowJan1) / 7)).padStart(2, "0");
  }
  if (period === "monthly") return d.slice(0, 7);
  if (period === "yearly") return String(y);
  return "";
}

function names() {
  const out = new Map();
  for (const p of S.all("user_profiles")) out.set(p.device_id, p);
  return out;
}

function list({ deviceId, period, region, limit }) {
  const p = ["daily", "weekly", "monthly", "yearly", "overall"].includes(period) ? period : "weekly";
  const key = p === "overall" ? "" : keyFor(p);
  const lim = Math.min(100, limit || 25);
  const profs = names();

  let rows;
  if (p === "overall") {
    rows = US.leaderboardTop().map((r) => ({
      device_id: r.device_id, name: profs.get(r.device_id) ? profs.get(r.device_id).name || "" : "",
      points: r.points, correct: r.correct, total: r.total
    }));
  } else {
    rows = US.periods()
      .filter((r) => r.period === p && r.period_key === key)
      .sort((a, b) => (b.points - a.points))
      .slice(0, lim)
      .map((r) => ({
        device_id: r.device_id, name: profs.get(r.device_id) ? profs.get(r.device_id).name || "" : "",
        points: r.points, correct: r.correct, total: r.total, updated_at: r.updated_at
      }));
  }

  if (region === "city" || region === "province") {
    const col = region === "city" ? "city" : "province";
    const groups = new Map();
    for (const r of rows) {
      const up = profs.get(r.device_id);
      const g = (up && up[col]) || "Unknown";
      if (!groups.has(g)) groups.set(g, { region: g, points: 0, correct: 0, total: 0, players: 0 });
      const gr = groups.get(g);
      gr.points += r.points || 0; gr.correct += r.correct || 0; gr.total += r.total || 0; gr.players++;
    }
    return { period: p, key, region, rows: [...groups.values()].sort((a, b) => b.points - a.points).slice(0, lim) };
  }

  return { period: p, key, rows: rows.slice(0, lim).map((r, i) => ({ rank: i + 1, ...r })) };
}

module.exports = { list };
