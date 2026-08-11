/* ============================================================
   Phase 12 — AI learning engine: current affairs
   Serves the seeded digest (daily/weekly/monthly/yearly) with
   category summaries. Seeded by scripts/seed-ai.cjs.
   ============================================================ */
"use strict";

function list(db, { period, date, category, limit }) {
  const clauses = ["1=1"];
  const params = [];
  if (period && period !== "all") { clauses.push("period=?"); params.push(String(period).slice(0, 10)); }
  if (date) { clauses.push("period_date=?"); params.push(String(date).slice(0, 10)); }
  if (category && category !== "all") { clauses.push("category=?"); params.push(String(category).slice(0, 30)); }
  const rows = db.all(
    `SELECT id, period, period_date, category, title, summary, source_subject
     FROM current_affairs WHERE ${clauses.join(" AND ")}
     ORDER BY period_date DESC, id DESC LIMIT ?`,
    [...params, Math.min(300, limit || 50)]
  );
  const counts = db.get(
    `SELECT period, COUNT(*) n FROM current_affairs ${clauses[0] === "1=1" ? "" : "WHERE " + clauses.slice(0, clauses.length - 1).join(" AND ")}
     GROUP BY period`.replace(" WHERE WHERE", " WHERE").replace(" WHERE 1=1", ""),
    []
  ) || null;
  return {
    total: rows.length,
    periods: counts ? Object.values(counts).length : null,
    items: rows
  };
}

function summary(db, period) {
  return db.all(
    `SELECT category, COUNT(*) n FROM current_affairs
     WHERE period=? GROUP BY category ORDER BY n DESC`, [period || "daily"]
  );
}

module.exports = { list, summary };
