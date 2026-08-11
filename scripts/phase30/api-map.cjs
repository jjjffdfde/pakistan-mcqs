/* ============================================================
   Phase 30 - API surface map (M16) + DB query static analysis (M15)
   Reads server.js + ai/router.js only. Never opens the DB.
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");

function mapApi() {
  const out = [];
  const s = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
  for (const m of s.matchAll(/pathname\s*===?\s*([^;]+);/g)) {
    const cond = m[1].trim();
    const route = /"([^"]+)"/.exec(cond);
    const method = cond.includes("method === ") ? /method === "([A-Z]+)"/.exec(cond)[1] : "*";
    if (route) out.push({ file: "server.js", method, path: route[1], db: s.slice(m.index, m.index + 240).includes("db.") });
  }
  const ai = fs.readFileSync(path.join(ROOT, "ai/router.js"), "utf8");
  for (const m of ai.matchAll(/P\s*===?\s*([^;]+);/g)) {
    const cond = m[1].trim();
    const route = /"([^"]+)"/.exec(cond);
    const method = cond.includes("method === ") ? /method === "([A-Z]+)"/.exec(cond)[1] : "*";
    if (route) out.push({ file: "ai/router.js", method, path: route[1], db: ai.slice(m.index, m.index + 260).includes("db.") });
  }
  for (const m of ai.matchAll(/startsWith\(["'](\/[^"']+)["']\)/g)) {
    out.push({ file: "ai/router.js", method: "GET/POST", path: m[1] + "/*", db: true });
  }
  return out;
}

/* ---------- M15 DB query analysis (recommendations only) ---------- */
function dbQueryAnalysis() {
  const files = [path.join(ROOT, "server.js"), path.join(ROOT, "ai", "router.js")];
  const dir = path.join(ROOT, "ai");
  for (const e of fs.readdirSync(dir)) {
    if (/\.js$/.test(e)) files.push(path.join(dir, e));
  }
  const out = { module: "M15", generated_at: new Date().toISOString(), totals: { queries: 0, select_star: 0, without_limit: 0, like_wildcard: 0, n_plus_one_candidates: 0 }, queries: [], recommendations: [] };
  const seen = new Set();
  for (const f of files) {
    const js = fs.readFileSync(f, "utf8");
    for (const m of js.matchAll(/db\.(?:all|get|run|prepare)\(`?["']([\s\S]{10,400}?)["']`?[,)]/g)) {
      let sql = m[1].replace(/\${[^}]*}/g, "?").replace(/\s+/g, " ").trim();
      if (seen.has(sql)) continue;
      seen.add(sql);
      const rel = path.relative(ROOT, f).replace(/\\/g, "/");
      const upper = sql.toUpperCase();
      const rec = [];
      if (/^SELECT/.test(upper)) {
        out.totals.queries++;
        if (/\*/.test(sql.split("FROM")[0] || "")) { out.totals.select_star++; rec.push("SELECT * used"); }
        if (!/\bLIMIT\b/i.test(sql) && !/COUNT\(|EXISTS\(/i.test(upper)) { out.totals.without_limit++; rec.push("no LIMIT (full scan risk)"); }
        if (/LIKE\s+'%|LIKE\s+"%|%\s*'.*LIKE/.test(sql)) { out.totals.like_wildcard++; rec.push("leading-wildcard LIKE"); }
      }
      out.queries.push({ file: rel, sql: sql.slice(0, 220), issues: rec });
    }
  }
  out.recommendations = [
    { id: "REC-1", rule: "Add LIMIT/OFFSET to admin export/leaderboard reads when dataset exceeds thousands of rows", applies_to: "SELECT * FROM leaderboard ORDER BY points DESC" },
    { id: "REC-2", rule: "Prefer FTS5 (fts_index) over LIKE %q% for /api/search once DB-backed search is enabled", applies_to: "/api/search" },
    { id: "REC-3", rule: "Index candidate: mcqs(subject_id,status), mcqs(chapter_id,status), mcqs(topic_id,status) already created by engine.migrate; no new index required on existing schema", applies_to: "existing schema" },
    { id: "REC-4", rule: "Index candidate for bookmarks/history device_id lookups: history(device_id, answered_at) already exists", applies_to: "history table" }
  ];
  return out;
}

module.exports = mapApi;
if (require.main === module) {
  const fs = require("fs");
  const api = mapApi();
  const dbq = dbQueryAnalysis();
  fs.writeFileSync(path.join(ROOT, "docs", "phase30_api_audit.json"), JSON.stringify({ module: "M16", generated_at: new Date().toISOString(), totals: { endpoints: api.length, read_only: api.filter((a) => a.method !== "POST").length, write: api.filter((a) => a.method === "POST").length }, endpoints: api }, null, 1));
  fs.writeFileSync(path.join(ROOT, "docs", "phase30_database_performance.json"), JSON.stringify(dbq, null, 1));
  console.log("phase30_api_audit.json", api.length, "endpoints");
  console.log("phase30_database_performance.json", dbq.totals.queries, "queries analyzed");
}
