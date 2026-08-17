/* runtime-v2/server.cjs
   JSON/NDJSON file-engine runtime API server (port 8766). Every route is
   served from deterministic indexes built from the NDJSON/JSON banks
   (runtime-v2/indexes + data/). No SQLite, no SQL, no database file. */
"use strict";
const http = require("http");
const path = require("path");
const fs = require("fs");
const Q = require("./query-engine.cjs");
const U = require("./user-store.cjs");
const KG = require("./kg-query.cjs");
const AI = require("./ai/router.cjs");
const Admin = require("./ai/admin.cjs");
const AIRecord = require("./ai/record.cjs");
const ACH = require("./ai/achievements.cjs");

const PORT = process.env.MCQS_JSON_PORT || 8766;

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}
function parseUrl(req) {
  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const query = {};
  for (const [k, v] of parsed.searchParams.entries()) query[k] = v;
  return { pathname: parsed.pathname, query };
}
function readJson(req, res, cb) {
  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch (e) { json(res, 400, { error: "invalid JSON: " + e.message }); }
  });
}

function notMigrated(res, what) {
  json(res, 501, { error: `unknown ${what} route on this runtime` });
}

const server = http.createServer(async (req, res) => {
  const { pathname, query } = parseUrl(req);
  const method = req.method;
  if (method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
    return res.end();
  }
  try {
    await Q.init();

    if (pathname === "/api/health") return json(res, 200, { ...(await Q.health()), data_source: "ndjson" });

    if (pathname === "/api/stats") return json(res, 200, await Q.stats());

    if (pathname === "/api/search" && method === "GET") return json(res, 200, await Q.search(query));

    if (pathname === "/api/browse" && method === "GET") return json(res, 200, await Q.browse(query));

    if (pathname.startsWith("/api/mcq/") && method === "GET") {
      const id = pathname.slice(9);
      const m = await Q.getById(id);
      if (!m) return json(res, 404, { error: "not found" });
      return json(res, 200, m);
    }

    if (pathname === "/api/mcqs" && method === "GET") {
      const ids = (query.ids || "").split(",").filter(Boolean).slice(0, 200);
      if (!ids.length) return json(res, 200, []);
      return json(res, 200, await Q.batchByIds(ids));
    }

    if (pathname === "/api/random" && method === "GET") return json(res, 200, await Q.random(query));

    if (pathname === "/api/subjects") return json(res, 200, await Q.subjects());
    if (pathname === "/api/chapters") return json(res, 200, Q.chapters());
    if (pathname === "/api/topics") return json(res, 200, Q.topics());
    if (pathname === "/api/categories") return json(res, 200, Q.categories());

    if (pathname === "/api/exams") {
      try {
        const staticExams = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "exams.json"), "utf8"));
        return json(res, 200, staticExams);
      } catch (e) { return json(res, 500, { error: "exams unavailable: " + e.message }); }
    }
    if (pathname === "/api/quizzes") return json(res, 200, Q.quizzes());
    if (pathname === "/api/mocktests") return json(res, 200, Q.mocktests());
    if (pathname === "/api/pastpapers") return json(res, 200, Q.pastpapers());

    if (pathname === "/api/bookmarks" && method === "GET") {
      const bms = U.bookmarks();
      const briefs = (await Q.fetchRows(bms.map((b) => b.mcq_id))).byId;
      const rows = bms.map((b) => {
        const m = briefs.get(b.mcq_id) || {};
        return { ...b, question: m.question ?? null, correct_answer: m.correct_answer ?? null, difficulty: m.difficulty ?? null, explanation: m.explanation ?? null };
      });
      return json(res, 200, rows);
    }
    if (pathname === "/api/bookmarks" && method === "POST") {
      readJson(req, res, async (body) => {
        try { U.addBookmark({ mcq_id: body.mcq_id, device_id: body.device_id }); json(res, 201, { ok: true }); }
        catch (e) { json(res, 400, { error: e.message }); }
      });
      return;
    }
    if (pathname === "/api/history" && method === "GET") {
      const hist = U.history().slice().sort((a, b) => (a.answered_at < b.answered_at ? 1 : -1)).slice(0, 200);
      const briefs = (await Q.fetchRows(hist.map((h) => h.mcq_id))).byId;
      const rows = hist.map((h) => {
        const m = briefs.get(h.mcq_id) || {};
        return { ...h, question: m.question ?? null, correct_answer: m.correct_answer ?? null, subject_id: m.subject_id ?? null, chapter_id: m.chapter_id ?? null, topic_id: m.topic_id ?? null };
      });
      return json(res, 200, rows);
    }
    if (pathname === "/api/history" && method === "POST") {
      readJson(req, res, async (body) => {
        try {
          const { mcq_id, correct, device_id, time_taken_sec, skipped, session_id, mode } = body;
          if (!mcq_id) return json(res, 400, { error: "mcq_id required" });
          const rec = await AIRecord.recordAnswer({ device_id, mcq_id, correct, time_taken_sec, skipped, session_id, mode: mode || "practice" });
          if (rec.correct) await ACH.check(device_id || "default");
          json(res, 201, { ok: true, ...rec });
        } catch (e) { json(res, 400, { error: e.message }); }
      });
      return;
    }
    if (pathname === "/api/leaderboard") return json(res, 200, U.leaderboardTop());
    if (pathname === "/api/analytics") return json(res, 200, U.analytics());

    /* ---------- Knowledge Graph (read-only, NDJSON exports) ---------- */
    if (pathname === "/api/kg/stats" && method === "GET") return json(res, 200, await KG.kgStats());
    if (pathname === "/api/kg/concepts" && method === "GET") return json(res, 200, await KG.searchConcepts(query.q, query.subject));
    if (pathname === "/api/kg/micro-concepts" && method === "GET") return json(res, 200, await KG.searchMicro(query.q));
    if (pathname === "/api/kg/learning-objectives" && method === "GET") return json(res, 200, await KG.searchObjectives(query.q));
    if (pathname === "/api/kg/learning-paths" && method === "GET") return json(res, 200, await KG.learningPaths());
    if (pathname.startsWith("/api/kg/concepts/") && method === "GET") {
      const rest = pathname.slice("/api/kg/concepts/".length);
      const slash = rest.indexOf("/");
      const id = slash === -1 ? rest : rest.slice(0, slash);
      const sub = slash === -1 ? null : rest.slice(slash + 1);
      if (!/^\d+$/.test(id)) return json(res, 404, { error: "concept not found" });
      if (sub === null) {
        const d = await KG.conceptById(id);
        if (!d) return json(res, 404, { error: "concept not found" });
        return json(res, 200, d);
      }
      const n = Number(id);
      if (sub === "relations") {
        const c = await KG.conceptById(id);
        if (!c) return json(res, 404, { error: "concept not found" });
        return json(res, 200, await KG.relations(n));
      }
      if (sub === "prerequisites") {
        const c = await KG.conceptById(id);
        if (!c) return json(res, 404, { error: "concept not found" });
        return json(res, 200, await KG.prerequisites(n));
      }
      if (sub === "objectives") {
        const c = await KG.conceptById(id);
        if (!c) return json(res, 404, { error: "concept not found" });
        return json(res, 200, await KG.objectives(n));
      }
      if (sub === "micro") {
        const c = await KG.conceptById(id);
        if (!c) return json(res, 404, { error: "concept not found" });
        return json(res, 200, await KG.microConcepts(n));
      }
      if (sub === "exams") {
        const c = await KG.conceptById(id);
        if (!c) return json(res, 404, { error: "concept not found" });
        return json(res, 200, await KG.examMappings(n));
      }
      if (sub === "distractors") {
        const c = await KG.conceptById(id);
        if (!c) return json(res, 404, { error: "concept not found" });
        return json(res, 200, await KG.distractors(n));
      }
      return json(res, 404, { error: "not found" });
    }

    /* ---------- Admin: import / backup / restore (file-based) ---------- */
    if (pathname === "/api/import" && method === "POST") return Admin.importMcqs(res, req);
    if (pathname === "/api/backup" && method === "POST") return Admin.backup(res);
    if (pathname === "/api/restore" && method === "POST") return Admin.restore(req, res);

    if (pathname === "/api/export" && method === "GET") {
      const fmt = query.format || "json";
      if (fmt === "json") {
        /* streamed JSON array (memory O(1) vs 872k-row array) */
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
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
        res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mcqs.csv"' });
        res.write(header);
        await Q.exportStream((m) => {
          const csv = [m.id, m.question, m.optionA, m.optionB, m.optionC, m.optionD, m.correct_answer, m.difficulty, m.subject_id, m.chapter_id, m.topic_id, m.explanation, JSON.stringify(m.tags), m.exam_ids, m.year || "", m.references_json || "[]", m.source || "generated", m.status].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
          res.write(csv);
        });
        res.end();
        return;
      }
      return json(res, 400, { error: "format must be json or csv" });
    }

    if (pathname.startsWith("/api/ai/")) {
      if (await AI.handle(req, res, pathname, query, method)) return;
      return notMigrated(res, pathname);
    }

    json(res, 404, { error: "not found" });
  } catch (e) {
    console.error("[runtime-v2/server]", e);
    json(res, 500, { error: e.message });
  }
});

module.exports = { server };

if (require.main === module) {
  (async () => {
    try {
      await Q.init();
      server.listen(PORT, () => console.log(`[runtime-v2 JSON API] listening on http://localhost:${PORT} (data engine: json)`));
    } catch (e) { console.error(e); process.exit(1); }
  })();
}
