/* runtime-v2/server.cjs
   JSON/NDJSON file-engine runtime API server. Every route is served from
   deterministic indexes built from the NDJSON/JSON banks (runtime-v2/indexes
   + database/data). No SQLite, no SQL, no database file.

   Production-safe behavior:
     - PORT / HOST configurable via env (binds 0.0.0.0 in production)
     - CORS origins configurable (never "*" unless CORS_ORIGIN="*" explicitly)
     - bounded JSON bodies, per-IP rate limits, sanitized error responses
     - GET /health + GET /ready for platform health checks
     - graceful shutdown on SIGTERM/SIGINT
     - admin routes (import/backup/restore/export) require Bearer token when
       MCQS_ADMIN_TOKEN is set
   Local development default: 127.0.0.1:8766 (no external exposure). */
"use strict";
const http = require("http");
const path = require("path");
const fs = require("fs");
const { config } = require("./config.cjs");
const H = require("./http-util.cjs");
const Q = require("./query-engine.cjs");
const U = require("./user-store.cjs");
const KG = require("./kg-query.cjs");
const AI = require("./ai/router.cjs");
const Admin = require("./ai/admin.cjs");
const AIRecord = require("./ai/record.cjs");
const ACH = require("./ai/achievements.cjs");
const AIProvider = require("./providers/ai-provider.cjs");
const CQ = require("./content-query.cjs");
const CML = require("./content-mcq-link.cjs");

function parseUrl(req) {
  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const query = {};
  for (const [k, v] of parsed.searchParams.entries()) query[k] = v;
  return { pathname: parsed.pathname, query };
}

function notMigrated(res, what, req) {
  H.json(res, 501, { error: `unknown ${what} route on this runtime` }, req);
}

/* Routes that exist as GET-only / POST-only (used for 405 responses). */
const GET_ONLY = new Set([
  "/api/stats", "/api/search", "/api/browse", "/api/mcqs", "/api/random",
  "/api/subjects", "/api/chapters", "/api/topics", "/api/categories",
  "/api/exams", "/api/quizzes", "/api/mocktests", "/api/pastpapers",
  "/api/leaderboard", "/api/analytics", "/api/kg/stats", "/api/kg/concepts",
  "/api/kg/micro-concepts", "/api/kg/learning-objectives",
  "/api/kg/learning-paths", "/api/export",
  "/api/content/search", "/api/content/subjects", "/api/content/types",
  "/health", "/ready", "/api/health"
]);
const POST_ONLY = new Set([
  "/api/import", "/api/backup", "/api/restore"
]);

/* Admin-only routes: protected by MCQS_ADMIN_TOKEN when configured. */
const ADMIN_PATHS = ["/api/import", "/api/backup", "/api/restore", "/api/export"];

function isAdminAuthorized(req) {
  if (!config.adminToken) return true; /* local development: no token required */
  const auth = String(req.headers.authorization || "");
  return auth === "Bearer " + config.adminToken;
}

async function databaseHealth() {
  try {
    await Q.init();
    const m = await Q.health();
    return { ok: true, mcqs: m.mcqs };
  } catch (e) {
    return { ok: false, error: "database unavailable" };
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname, query } = parseUrl(req);
  const method = req.method;

  if (method === "OPTIONS") return H.handlePreflight(req, res);

  /* Rate limit everything (cheap, in-memory); AI routes get a stricter cap. */
  const ip = H.clientIp(req);
  const limit = pathname.startsWith("/api/ai/") ? config.aiRateLimit : config.apiRateLimit;
  if (!H.rateLimit(ip, limit)) {
    H.json(res, 429, { error: "rate limit exceeded, slow down" }, req);
    return;
  }

  if (GET_ONLY.has(pathname) && method !== "GET") {
    res.writeHead(405, { Allow: "GET", ...H.corsHeaders(req) });
    return res.end();
  }
  if (POST_ONLY.has(pathname) && method !== "POST") {
    res.writeHead(405, { Allow: "POST", ...H.corsHeaders(req) });
    return res.end();
  }
  if (pathname.startsWith("/api/mcq/") && method !== "GET") {
    res.writeHead(405, { Allow: "GET", ...H.corsHeaders(req) });
    return res.end();
  }

  try {
    if (pathname === "/health" || pathname === "/api/health") {
      const db = await databaseHealth();
      const ai = AIProvider.status();
      if (pathname === "/api/health") {
        /* backward-compatible shape used by tests and tooling */
        return H.json(res, db.ok ? 200 : 503, {
          ok: db.ok,
          mcqs: db.ok ? db.mcqs : null,
          data_source: "ndjson",
          version: config.version
        }, req);
      }
      return H.json(res, db.ok ? 200 : 503, {
        server: db.ok ? "OK" : "ERROR",
        database: db.ok ? "OK" : "ERROR",
        ai: ai.configured ? "AVAILABLE" : "UNAVAILABLE",
        version: config.version,
        data_source: "ndjson"
      }, req);
    }
    if (pathname === "/ready") {
      const db = await databaseHealth();
      return H.json(res, db.ok ? 200 : 503, { ready: db.ok }, req);
    }

    await Q.init();

    if (pathname === "/api/stats") return H.json(res, 200, await Q.stats(), req);

    if (pathname === "/api/search" && method === "GET") return H.json(res, 200, await Q.search(query), req);

    if (pathname === "/api/browse" && method === "GET") return H.json(res, 200, await Q.browse(query), req);

    if (pathname.startsWith("/api/mcq/") && method === "GET") {
      const id = pathname.slice(9);
      const m = await Q.getById(id);
      if (!m) return H.json(res, 404, { error: "not found" }, req);
      return H.json(res, 200, m, req);
    }

    if (pathname === "/api/mcqs" && method === "GET") {
      const ids = (query.ids || "").split(",").filter(Boolean).slice(0, 200);
      if (!ids.length) return H.json(res, 200, [], req);
      return H.json(res, 200, await Q.batchByIds(ids), req);
    }

    if (pathname === "/api/random" && method === "GET") return H.json(res, 200, await Q.random(query), req);

    if (pathname === "/api/subjects") return H.json(res, 200, await Q.subjects(), req);
    if (pathname === "/api/chapters") return H.json(res, 200, Q.chapters(), req);
    if (pathname === "/api/topics") return H.json(res, 200, Q.topics(), req);
    if (pathname === "/api/categories") return H.json(res, 200, Q.categories(), req);

    if (pathname === "/api/exams") {
      try {
        const staticExams = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "exams.json"), "utf8"));
        return H.json(res, 200, staticExams, req);
      } catch (e) { return H.sendError(req, res, 500, "exams unavailable", e); }
    }
    if (pathname === "/api/quizzes") return H.json(res, 200, Q.quizzes(), req);
    if (pathname === "/api/mocktests") return H.json(res, 200, Q.mocktests(), req);
    if (pathname === "/api/pastpapers") return H.json(res, 200, Q.pastpapers(), req);

    /* ---------- source-content routes ---------- */
    if (pathname === "/api/content/stats") return H.json(res, 200, CQ.stats(), req);
    if (pathname === "/api/content/search" && method === "GET") {
      return H.json(res, 200, CQ.search(query.q || "", {
        subject: query.subject, content_type: query.content_type,
        source: query.source, page: +query.page || 1, limit: +query.limit || 20
      }), req);
    }
    if (pathname === "/api/content/subjects") return H.json(res, 200, CQ.listSubjects(), req);
    if (pathname === "/api/content/types") return H.json(res, 200, CQ.listTypes(), req);
    if (pathname.startsWith("/api/content/") && pathname.endsWith("/mcqs") && method === "GET") {
      const id = pathname.slice(13, -5); /* strip /api/content/ and /mcqs */
      if (id) { const mcqs = CML.findRelatedMcqsMapped(id, +query.limit || 10); return H.json(res, 200, { content_id: id, mcqs }, req); }
      return H.json(res, 404, { error: "content not found" }, req);
    }
    if (pathname.startsWith("/api/content/") && method === "GET") {
      const id = pathname.slice(13);
      if (id && !id.includes("/")) { const r = CQ.getById(id); if (r) return H.json(res, 200, r); }
      return H.json(res, 404, { error: "content not found" }, req);
    }

    if (pathname === "/api/bookmarks" && method === "GET") {
      const bms = U.bookmarks();
      const briefs = (await Q.fetchRows(bms.map((b) => b.mcq_id))).byId;
      const rows = bms.map((b) => {
        const m = briefs.get(b.mcq_id) || {};
        return { ...b, question: m.question ?? null, correct_answer: m.correct_answer ?? null, difficulty: m.difficulty ?? null, explanation: m.explanation ?? null };
      });
      return H.json(res, 200, rows, req);
    }
    if (pathname === "/api/bookmarks" && method === "POST") {
      const body = await H.readJson(req);
      try { U.addBookmark({ mcq_id: body.mcq_id, device_id: body.device_id }); H.json(res, 201, { ok: true }, req); }
      catch (e) { H.json(res, 400, { error: e.message }, req); }
      return;
    }
    if (pathname === "/api/history" && method === "GET") {
      const hist = U.history().slice().sort((a, b) => (a.answered_at < b.answered_at ? 1 : -1)).slice(0, 200);
      const briefs = (await Q.fetchRows(hist.map((h) => h.mcq_id))).byId;
      const rows = hist.map((h) => {
        const m = briefs.get(h.mcq_id) || {};
        return { ...h, question: m.question ?? null, correct_answer: m.correct_answer ?? null, subject_id: m.subject_id ?? null, chapter_id: m.chapter_id ?? null, topic_id: m.topic_id ?? null };
      });
      return H.json(res, 200, rows, req);
    }
    if (pathname === "/api/history" && method === "POST") {
      const body = await H.readJson(req);
      const { mcq_id, correct, device_id, time_taken_sec, skipped, session_id, mode } = body;
      if (!mcq_id) return H.json(res, 400, { error: "mcq_id required" }, req);
      try {
        const rec = await AIRecord.recordAnswer({ device_id, mcq_id, correct, time_taken_sec, skipped, session_id, mode: mode || "practice" });
        if (rec.correct) await ACH.check(device_id || "default");
        H.json(res, 201, { ok: true, ...rec }, req);
      } catch (e) { H.json(res, 400, { error: e.message }, req); }
      return;
    }
    if (pathname === "/api/bookmarks" || pathname === "/api/history") {
      res.writeHead(405, { Allow: "GET, POST", ...H.corsHeaders(req) });
      return res.end();
    }
    if (pathname === "/api/leaderboard") return H.json(res, 200, U.leaderboardTop(), req);
    if (pathname === "/api/analytics") return H.json(res, 200, U.analytics(), req);

    /* ---------- Knowledge Graph (read-only, NDJSON exports) ---------- */
    if (pathname === "/api/kg/stats" && method === "GET") return H.json(res, 200, await KG.kgStats(), req);
    if (pathname === "/api/kg/concepts" && method === "GET") return H.json(res, 200, await KG.searchConcepts(query.q, query.subject), req);
    if (pathname === "/api/kg/micro-concepts" && method === "GET") return H.json(res, 200, await KG.searchMicro(query.q), req);
    if (pathname === "/api/kg/learning-objectives" && method === "GET") return H.json(res, 200, await KG.searchObjectives(query.q), req);
    if (pathname === "/api/kg/learning-paths" && method === "GET") return H.json(res, 200, await KG.learningPaths(), req);
    if (pathname.startsWith("/api/kg/concepts/") && method === "GET") {
      const rest = pathname.slice("/api/kg/concepts/".length);
      const slash = rest.indexOf("/");
      const id = slash === -1 ? rest : rest.slice(0, slash);
      const sub = slash === -1 ? null : rest.slice(slash + 1);
      if (!/^\d+$/.test(id)) return H.json(res, 404, { error: "concept not found" }, req);
      if (sub === null) {
        const d = await KG.conceptById(id);
        if (!d) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, d, req);
      }
      const n = Number(id);
      if (sub === "relations") {
        const c = await KG.conceptById(id);
        if (!c) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, await KG.relations(n), req);
      }
      if (sub === "prerequisites") {
        const c = await KG.conceptById(id);
        if (!c) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, await KG.prerequisites(n), req);
      }
      if (sub === "objectives") {
        const c = await KG.conceptById(id);
        if (!c) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, await KG.objectives(n), req);
      }
      if (sub === "micro") {
        const c = await KG.conceptById(id);
        if (!c) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, await KG.microConcepts(n), req);
      }
      if (sub === "exams") {
        const c = await KG.conceptById(id);
        if (!c) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, await KG.examMappings(n), req);
      }
      if (sub === "distractors") {
        const c = await KG.conceptById(id);
        if (!c) return H.json(res, 404, { error: "concept not found" }, req);
        return H.json(res, 200, await KG.distractors(n), req);
      }
      return H.json(res, 404, { error: "not found" }, req);
    }

    /* ---------- Admin: import / backup / restore / export (token-guarded) ---------- */
    if (ADMIN_PATHS.includes(pathname)) {
      if (!isAdminAuthorized(req)) {
        return H.json(res, 401, { error: "unauthorized" }, req);
      }
      if (pathname === "/api/import" && method === "POST") return Admin.importMcqs(res, req);
      if (pathname === "/api/backup" && method === "POST") return Admin.backup(res, req);
      if (pathname === "/api/restore" && method === "POST") return Admin.restore(req, res);
      if (pathname === "/api/export" && method === "GET") return exportMcqs(res, req, query);
    }

    if (pathname.startsWith("/api/ai/")) {
      if (await AI.handle(req, res, pathname, query, method)) return;
      return notMigrated(res, pathname, req);
    }

    H.json(res, 404, { error: "not found" }, req);
  } catch (e) {
    if (e && e.status === 413) return H.json(res, 413, { error: "request body too large" }, req);
    if (e && e.status === 400) return H.json(res, 400, { error: "invalid JSON" }, req);
    H.sendError(req, res, 500, "internal error", e);
  }
});

/* Streamed export (json/csv) — memory O(1) over 872k rows. */
async function exportMcqs(res, req, query) {
  const fmt = query.format || "json";
  if (fmt === "json") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", ...H.corsHeaders(req) });
    res.write("[");
    let first = true;
    await Q.exportStream((row) => {
      const s = JSON.stringify(row);
      res.write((first ? "" : ",") + s);
      first = false;
    });
    res.end("]");
    return;
  }
  if (fmt === "csv") {
    const header = "id,question,optionA,optionB,optionC,optionD,correct_answer,difficulty,subject_id,chapter_id,topic_id,explanation,tags,exam_ids,year,references,source,status\n";
    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mcqs.csv"', ...H.corsHeaders(req) });
    res.write(header);
    await Q.exportStream((m) => {
      const csv = [m.id, m.question, m.optionA, m.optionB, m.optionC, m.optionD, m.correct_answer, m.difficulty, m.subject_id, m.chapter_id, m.topic_id, m.explanation, JSON.stringify(m.tags), m.exam_ids, m.year || "", m.references_json || "[]", m.source || "generated", m.status].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
      res.write(csv);
    });
    res.end();
    return;
  }
  H.json(res, 400, { error: "format must be json or csv" }, req);
}

module.exports = { server };

if (require.main === module) {
  (async () => {
    try {
      await Q.init();
      server.listen(config.port, config.host, () => {
        console.log(`[runtime-v2 JSON API] v${config.version} (${config.nodeEnv}) listening on http://${config.host}:${config.port} (data engine: json, data dir: ${config.dataDir})`);
      });
    } catch (e) {
      console.error("[runtime-v2] startup failed:", e);
      process.exit(1);
    }
  })();
}

/* ---------- graceful shutdown ---------- */
function shutdown(signal) {
  console.log(`[runtime-v2] ${signal} received, shutting down`);
  server.close(() => process.exit(0));
  /* force-exit if connections refuse to drain */
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
