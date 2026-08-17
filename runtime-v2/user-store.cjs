/* runtime-v2/user-store.cjs
   Server-side JSON persistence for user features (bookmarks, history,
   leaderboard, analytics) with semantics mirroring the SQLite implementation
   (db tables + ai/record.js). Deterministic file layout under userdata/.
   NOTE: spaced-revision scheduling is part of the AI engine (NOT_MIGRATED);
   this store implements history + leaderboard + period leaderboards only. */
"use strict";
const fs = require("fs");
const path = require("path");
const L = require("./data-loader.cjs");

const FILE = (n) => path.join(L.USER_DIR, n + ".json");
const cache = {};

function load(name, def) {
  if (!(name in cache)) {
    try { cache[name] = JSON.parse(fs.readFileSync(FILE(name), "utf8")); }
    catch (e) { cache[name] = def; }
  }
  return cache[name];
}
function save(name) {
  fs.mkdirSync(L.USER_DIR, { recursive: true });
  fs.writeFileSync(FILE(name), JSON.stringify(cache[name], null, 1));
}

function utcNow() {
  return new Date().toISOString().replace("T", " ").slice(0, 19); /* SQL datetime('now') format (UTC) */
}
/* strftime('%W','now') equivalent (Monday-based week, UTC) */
function weekKey(now) {
  const d = new Date(now);
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dow01 = (start.getUTCDay() + 6) % 7;
  const doy = Math.floor((d - start) / 86400000);
  return String(Math.floor((doy + 6 - dow01) / 7)).padStart(2, "0");
}
function monthKey(now) {
  return now.toISOString().slice(0, 7);
}
function periodKey(period, now) {
  const d = new Date(now);
  if (period === "daily") return now.toISOString().slice(0, 10);
  if (period === "weekly") return `${d.getUTCFullYear()}-W${weekKey(now)}`;
  if (period === "monthly") return monthKey(now);
  return String(d.getUTCFullYear());
}

/* ---------- bookmarks ---------- */
function bookmarks() { return load("bookmarks", []); }
function addBookmark({ mcq_id, device_id }) {
  if (!mcq_id) throw new Error("mcq_id required");
  const dev = device_id || "default";
  const list = bookmarks();
  if (!list.some((b) => b.mcq_id === mcq_id && b.device_id === dev)) {
    list.push({ id: nextId("bookmarks"), device_id: dev, mcq_id, created_at: utcNow() });
    save("bookmarks");
  }
  return { ok: true };
}

function nextId(name) {
  const ids = load("_ids", {});
  ids[name] = (ids[name] || 0) + 1;
  save("_ids");
  return ids[name];
}

/* ---------- history + leaderboard (mirrors ai/record.js) ---------- */
function history() { return load("history", []); }
function leaderboard() { return load("leaderboard", {}); }
function periods() { return load("periods", []); }

function recordAnswer({ device_id, mcq_id, correct, time_taken_sec, skipped, mode, session_id }) {
  if (!mcq_id) throw new Error("mcq_id required");
  const dev = device_id || "default";
  const ok = correct === true || correct === 1;
  const pts = ok ? 10 : 0;
  const skip = skipped === true || skipped === 1 ? 1 : 0;
  const t = Math.min(3600, Math.max(0, parseInt(time_taken_sec, 10) || 0));
  const sess = parseInt(session_id, 10) || 0;
  const mod = String(mode || "practice").slice(0, 40);
  const now = new Date();

  const h = history();
  h.push({
    id: nextId("history"), device_id: dev, mcq_id, correct: ok ? 1 : 0, points: pts,
    mode: mod, answered_at: utcNow(), time_taken_sec: t, skipped: skip, session_id: sess
  });
  save("history");

  const lb = leaderboard();
  if (lb[dev]) {
    lb[dev].points += pts; lb[dev].correct += ok ? 1 : 0; lb[dev].total += 1;
    lb[dev].week_key = weekKey(now); lb[dev].month_key = monthKey(now);
  } else {
    lb[dev] = {
      id: nextId("leaderboard"), device_id: dev, name: "", points: pts,
      week_key: weekKey(now), month_key: monthKey(now), correct: ok ? 1 : 0, total: 1,
      week_claimed: 0, month_claimed: 0, updated_at: utcNow()
    };
  }
  save("leaderboard");

  const ps = periods();
  for (const period of ["daily", "weekly", "monthly", "yearly"]) {
    const key = periodKey(period, now);
    const idx = ps.findIndex((p) => p.device_id === dev && p.period === period && p.period_key === key);
    if (idx >= 0) {
      ps[idx].points += pts; ps[idx].correct += ok ? 1 : 0; ps[idx].total += 1;
      ps[idx].updated_at = utcNow();
    } else {
      ps.push({ device_id: dev, period, period_key: key, points: pts, correct: ok ? 1 : 0, total: 1, updated_at: utcNow() });
    }
  }
  save("periods");

  return { points: pts, correct: ok, skipped: skip };
}

function leaderboardTop() {
  return Object.values(leaderboard())
    .sort((a, b) => b.points - a.points || b.correct - a.correct || (a.device_id < b.device_id ? -1 : 1))
    .slice(0, 100);
}

function analytics() { return load("analytics", []); }
function counts() {
  return { bookmarks: bookmarks().length, history: history().length, leaderboard: Object.keys(leaderboard()).length };
}
function stats() {
  return {
    bookmarks: bookmarks().length,
    history: history().length,
    leaderboard: Object.keys(leaderboard()).length,
    periods: periods().length
  };
}

module.exports = {
  utcNow, bookmarks, addBookmark, history, recordAnswer, leaderboardTop, analytics,
  counts, stats, periods, _reset: () => { for (const k of Object.keys(cache)) delete cache[k]; }
};
