/* ============================================================
   Phase 12 — AI learning engine: shared utilities
   ============================================================ */
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
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day);
    const week = Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / DAY) + 1) / 7);
    return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
  }
  return d.toISOString().slice(0, 10);
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round1 = (v) => Math.round((Number(v) || 0) * 10) / 10;
const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

module.exports = { did, today, iso, addDays, periodKey, clamp, round1, round2, pct };
