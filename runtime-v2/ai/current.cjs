/* runtime-v2/ai/current.cjs — current affairs digest, file-backed.
   Port of ai/current.js: reads the seeded digest from
   database/data/ai/current_affairs.ndjson.gz (read-only public data,
   produced by the file-based seed). SQLite quirk kept: the period-count
   "counts" row is the first GROUP BY period row (values length used as
   `periods` count). */
"use strict";
const L = require("../data-loader.cjs");

let rowsCache = null;
async function rows() {
  if (rowsCache) return rowsCache;
  const file = require("path").join(L.SRC_DIR, "ai", "current_affairs.ndjson.gz");
  const out = [];
  if (require("fs").existsSync(file)) {
    await L.streamGzLines(file, (r) => { if (r) out.push(r); });
  }
  rowsCache = out;
  return out;
}

async function list({ period, date, category, limit }) {
  const all = await rows();
  const clauses = ["1=1"];
  const params = [];
  if (period && period !== "all") { clauses.push("period=?"); params.push(String(period).slice(0, 10)); }
  if (date) { clauses.push("period_date=?"); params.push(String(date).slice(0, 10)); }
  if (category && category !== "all") { clauses.push("category=?"); params.push(String(category).slice(0, 30)); }

  let filtered = all;
  if (params[0]) filtered = filtered.filter((r) => String(r.period) === params[0]);
  if (params[1]) filtered = filtered.filter((r) => String(r.period_date) === params[1]);
  if (params[2]) filtered = filtered.filter((r) => String(r.category) === params[2]);

  const rowsSel = filtered.slice().sort((a, b) =>
    (a.period_date < b.period_date ? 1 : a.period_date > b.period_date ? -1 :
      (a.id < b.id ? 1 : -1))).slice(0, Math.min(300, limit || 50));

  /* Oracle counts query always runs over the whole table (WHERE never applied):
     first GROUP BY period row -> periods = Object.values(first).length (2). */
  const group = new Map();
  for (const r of all) group.set(r.period, (group.get(r.period) || 0) + 1);
  const first = group.size ? { period: [...group.keys()][0], n: group.get([...group.keys()][0]) } : null;

  return {
    total: rowsSel.length,
    periods: first ? Object.values(first).length : null,
    items: rowsSel.map(({ id, period, period_date, category, title, summary, source_subject }) => ({ id, period, period_date, category, title, summary, source_subject }))
  };
}

async function summary(period) {
  const all = await rows();
  const byCat = new Map();
  for (const r of all) {
    if (r.period !== (period || "daily")) continue;
    byCat.set(r.category, (byCat.get(r.category) || 0) + 1);
  }
  return [...byCat.entries()]
    .map(([category, n]) => ({ category, n }))
    .sort((a, b) => b.n - a.n);
}

module.exports = { list, summary };
