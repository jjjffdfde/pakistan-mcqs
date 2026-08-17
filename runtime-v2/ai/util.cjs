/* runtime-v2/ai/util.cjs — file-based AI engine shared utilities.
   Mirrors ai/util.js semantics; adds localDate() replicating SQLite
   date(col,'localtime') for stored UTC strings "YYYY-MM-DD HH:MM:SS". */
"use strict";

const DAY = 86400000;

const did = (query, body) => String((body && body.device_id) || (query && query.device_id) || "default").slice(0, 64);

const today = () => new Date().toISOString().slice(0, 10);

const iso = (d) => new Date(d).toISOString().slice(0, 10);

const addDays = (base, n) => {
  const d = new Date(base + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const periodKey = (period, base) => {
  const d = new Date((base || today()) + "T00:00:00Z");
  if (period === "daily") return d.toISOString().slice(0, 10);
  if (period === "monthly") return d.toISOString().slice(0, 7);
  if (period === "yearly") return d.toISOString().slice(0, 4);
  if (period === "weekly") {
    /* strftime('%W') equivalent (Monday-based) — matches user-store weekKey */
    const y = d.getUTCFullYear();
    const dowJan1 = (new Date(Date.UTC(y, 0, 1)).getUTCDay() + 6) % 7;
    const doy = Math.floor((d - Date.UTC(y, 0, 1)) / DAY);
    const week = Math.floor((doy + 6 - dowJan1) / 7);
    return y + "-W" + String(week).padStart(2, "0");
  }
  return d.toISOString().slice(0, 10);
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round1 = (v) => Math.round((Number(v) || 0) * 10) / 10;
const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

function utcNow() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

/* SQLite date('now','localtime') on a UTC "YYYY-MM-DD HH:MM:SS" string -> local YYYY-MM-DD */
function localDate(utcStr) {
  const d = new Date(String(utcStr).replace(" ", "T") + "Z");
  if (isNaN(d)) return String(utcStr || "").slice(0, 10);
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

module.exports = { did, today, iso, addDays, periodKey, clamp, round1, round2, pct, utcNow, localDate, DAY };
