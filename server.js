/* ============================================================
   Pakistan MCQS Hub — Localhost API Server (Enterprise 2026)
   Static-first: site works without this server; enables DB features.
   ============================================================ */
"use strict";
const http = require("http");
const url = require("url");
const { open } = require("./db/engine.js");
const fs = require("fs");
const path = require("path");

const PORT = process.env.MCQS_PORT || 8765;
let db = open();
const aiRouter = require("./ai/router.js");

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

function sanitizeFts(q) {
  if (!q) return "";
  const words = String(q).replace(/['"^:*?()~{}\[\]\-]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  return words.map(w => `"${w}"*`).join(" ");
}

function paginate(q) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(q.limit, 10) || 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildWhere(q) {
  const clauses = [];
  const params = [];
  if (q.subject) {
    const subs = q.subject.split(",").map((s) => s.trim()).filter(Boolean);
    if (subs.length > 1) { clauses.push(`subject_id IN (${subs.map(() => "?").join(",")})`); params.push(...subs); }
    else { clauses.push("subject_id = ?"); params.push(subs[0]); }
  }
  if (q.chapter) { clauses.push("chapter_id = ?"); params.push(q.chapter); }
  if (q.topic) { clauses.push("topic_id = ?"); params.push(q.topic); }
  if (q.difficulty) { clauses.push("difficulty = ?"); params.push(q.difficulty); }
  if (q.year) { clauses.push("year = ?"); params.push(q.year); }
  if (q.status) { clauses.push("status = ?"); params.push(q.status); }
  if (q.exam) { clauses.push("(',' || exam_ids || ',') LIKE ?"); params.push(`%,${q.exam},%`); }
  if (q.related) {
    const ids = q.related.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 50);
    if (ids.length) { clauses.push(`id IN (${ids.map(() => "?").join(",")})`); params.push(...ids); }
  }
  return { where: clauses.length ? "WHERE " + clauses.join(" AND ") : "", params };
}

function readJson(req, res, cb) {
  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch (e) { json(res, 400, { error: "invalid JSON: " + e.message }); }
  });
}

function attachOptions(rows) {
  if (!rows || !rows.length) return rows || [];
  const ids = rows.map((r) => r.id);
  const ph = ids.map(() => "?").join(",");
  const opts = db.prepare(`SELECT mcq_id, label, text FROM options WHERE mcq_id IN (${ph})`).all(...ids);
  const byId = {};
  opts.forEach((o) => { (byId[o.mcq_id] = byId[o.mcq_id] || {})[o.label] = o.text; });
  rows.forEach((r) => {
    const o = byId[r.id] || {};
    r.optionA = o.A ?? null; r.optionB = o.B ?? null; r.optionC = o.C ?? null; r.optionD = o.D ?? null;
  });
  return rows;
}

/* Related questions: same chapter, exclude self, top 5 (tag overlap first) */
const relByTag = db.prepare(`
  SELECT id, (CASE WHEN ? != '' AND tags LIKE '%' || ? || '%' THEN 1 ELSE 0 END) + (CASE WHEN ? != '' AND tags LIKE '%' || ? || '%' THEN 1 ELSE 0 END) + (CASE WHEN ? != '' AND tags LIKE '%' || ? || '%' THEN 1 ELSE 0 END) score
  FROM mcqs WHERE chapter_id = ? AND id != ? AND status = 'active'
  ORDER BY score DESC, RANDOM() LIMIT 5
`);
function attachRelated(rows) {
  rows.forEach((r) => {
    let tags = [];
    try { tags = JSON.parse(r.tags || "[]"); } catch (e) {}
    const t = tags.slice(0, 3).map((x) => String(x).replace(/'/g, ""));
    r.relatedQuestions = r.chapter_id
      ? relByTag.all(t[0] || "", t[0] || "", t[1] || "", t[1] || "", t[2] || "", t[2] || "", r.chapter_id, r.id).map((x) => x.id)
      : [];
  });
  return rows;
}

const server = http.createServer(async (req, res) => {
  const { pathname, query } = parseUrl(req);
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
    return res.end();
  }

  try {
    /* ---------- Health ---------- */
    if (pathname === "/api/health") return json(res, 200, { ok: true, mcqs: db.prepare("SELECT COUNT(*) n FROM mcqs").get().n });

    /* ---------- Live stats (SQL counts for dashboard) ---------- */
    if (pathname === "/api/stats") {
      const count = (sql) => db.prepare(sql).get().n;
      let examsCount = 0;
      try { examsCount = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "exams.json"), "utf8")).length; } catch (e) {}
      const stats = {
        source: "sqlite",
        db: "pakistan-mcqs.sqlite",
        sqlite_version: db.prepare("SELECT sqlite_version() v").get().v,
        mcqs: count("SELECT COUNT(*) n FROM mcqs WHERE status='active'"),
        mcqs_total: count("SELECT COUNT(*) n FROM mcqs"),
        options: count("SELECT COUNT(*) n FROM options"),
        subjects: count("SELECT COUNT(*) n FROM subjects WHERE status='active'"),
        chapters: count("SELECT COUNT(*) n FROM chapters"),
        topics: count("SELECT COUNT(*) n FROM topics"),
        subtopics: count("SELECT COUNT(*) n FROM subtopics"),
        papers: count("SELECT COUNT(*) n FROM pastpapers"),
        mocktests: count("SELECT COUNT(*) n FROM mocktests"),
        quizzes: count("SELECT COUNT(*) n FROM quizzes"),
        exams: examsCount,
        categories: count("SELECT COUNT(*) n FROM categories"),
        bookmarks: count("SELECT COUNT(*) n FROM bookmarks"),
        attempts: count("SELECT COUNT(*) n FROM history"),
        leaderboard_rows: count("SELECT COUNT(*) n FROM leaderboard"),
        last_updated: (db.prepare("SELECT MAX(created_at) v FROM mcqs").get().v) || null
      };
      return json(res, 200, stats);
    }

    /* ---------- Search (FTS) ---------- */
    if (pathname === "/api/search" && method === "GET") {
      const rawQ = query.q || "";
      const ftsQ = sanitizeFts(rawQ);
      const { where, params } = buildWhere(query);
      const { page, limit, offset } = paginate(query);
      let sql, countSql, countParams, rowParams;
      if (ftsQ) {
        const extra = where ? "AND " + where.replace(/subject_id/g, "m.subject_id").replace(/chapter_id/g, "m.chapter_id").replace(/topic_id/g, "m.topic_id").replace(/id IN/g, "m.id IN").slice(6) : "";
        sql = `SELECT m.* FROM mcqs m JOIN mcqs_fts ON mcqs_fts.rowid = m.rowid WHERE mcqs_fts MATCH ? ${extra} ORDER BY bm25(mcqs_fts) LIMIT ? OFFSET ?`;
        rowParams = [ftsQ, ...params, limit, offset];
        countSql = `SELECT COUNT(*) n FROM mcqs m JOIN mcqs_fts ON mcqs_fts.rowid = m.rowid WHERE mcqs_fts MATCH ? ${extra}`;
        countParams = [ftsQ, ...params];
      } else {
        sql = `SELECT m.* FROM mcqs m ${where} ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
        rowParams = [...params, limit, offset];
        countSql = `SELECT COUNT(*) n FROM mcqs m ${where}`;
        countParams = params;
      }
      const rows = db.prepare(sql).all(...rowParams);
      const total = db.prepare(countSql).get(...countParams).n;
      return json(res, 200, { results: attachRelated(attachOptions(rows)), total, page, limit, pages: Math.ceil(total / limit) });
    }

    /* ---------- Browse (paginated, filtered) ---------- */
    if (pathname === "/api/browse" && method === "GET") {
      const { where, params } = buildWhere(query);
      const { page, limit, offset } = paginate(query);
      const sql = `SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id ${where ? where.replace(/subject_id/g, "m.subject_id").replace(/chapter_id/g, "m.chapter_id").replace(/topic_id/g, "m.topic_id").replace(/id IN/g, "m.id IN") : ""} ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
      const rows = db.prepare(sql).all(...params, limit, offset);
      const total = db.prepare(`SELECT COUNT(*) n FROM mcqs m ${where}`).get(...params).n;
      return json(res, 200, { results: attachRelated(attachOptions(rows)), total, page, limit, pages: Math.ceil(total / limit) });
    }

    /* ---------- Single MCQ ---------- */
    if (pathname.startsWith("/api/mcq/") && method === "GET") {
      const id = pathname.slice(9);
      const m = db.prepare(`SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id WHERE m.id=?`).get(id);
      if (!m) return json(res, 404, { error: "not found" });
      const opts = db.prepare("SELECT label, text FROM options WHERE mcq_id=? ORDER BY label").all(id);
      m.options = opts;
      return json(res, 200, attachRelated([m])[0]);
    }

    /* ---------- Batch lookup ---------- */
    if (pathname === "/api/mcqs" && method === "GET") {
      const ids = (query.ids || "").split(",").filter(Boolean).slice(0, 200);
      if (!ids.length) return json(res, 200, []);
      const ph = ids.map(() => "?").join(",");
      const rows = db.prepare(`SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id WHERE m.id IN (${ph})`).all(...ids);
      return json(res, 200, attachOptions(rows));
    }

    /* ---------- Random sampler ---------- */
    if (pathname === "/api/random" && method === "GET") {
      const { where, params } = buildWhere(query);
      const limit = Math.min(200, Math.max(1, parseInt(query.limit, 10) || 10));
      const seed = parseInt(query.seed, 10) || 0;
      const total = db.prepare(`SELECT COUNT(*) n FROM mcqs m ${where}`).get(...params).n;
      let rows;
      if (seed > 0 && total > 0) {
        const offset = Math.abs(seed) % Math.max(1, total - limit);
        rows = db.prepare(`SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id ${where ? where.replace(/subject_id/g, "m.subject_id").replace(/chapter_id/g, "m.chapter_id").replace(/topic_id/g, "m.topic_id").replace(/id IN/g, "m.id IN") : ""} ORDER BY m.rowid LIMIT ? OFFSET ?`).all(...params, limit, offset);
      } else {
        rows = db.prepare(`SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id ${where ? where.replace(/subject_id/g, "m.subject_id").replace(/chapter_id/g, "m.chapter_id").replace(/topic_id/g, "m.topic_id").replace(/id IN/g, "m.id IN") : ""} ORDER BY RANDOM() LIMIT ?`).all(...params, limit);
      }
      return json(res, 200, { results: attachRelated(attachOptions(rows)), total, limit });
    }

    /* ---------- Taxonomy ---------- */
    if (pathname === "/api/subjects") {
      const rows = db.prepare("SELECT s.id,s.name,s.slug,s.category_id,s.icon,s.description,s.exam_ids,(SELECT COUNT(*) FROM mcqs m WHERE m.subject_id=s.id AND m.status='active') as mcqs_count FROM subjects s ORDER BY s.sort_order, s.id").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/chapters") {
      const rows = db.prepare("SELECT id,subject_id,name,slug FROM chapters ORDER BY subject_id, sort_order, id").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/topics") {
      const rows = db.prepare("SELECT id,chapter_id,name,slug FROM topics ORDER BY chapter_id, sort_order, id").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/categories") {
      const rows = db.prepare("SELECT id,name,slug,icon,description,sort_order FROM categories ORDER BY sort_order, id").all();
      return json(res, 200, rows);
    }

    /* ---------- Exams / Quizzes / Mock Tests / Past Papers ---------- */
    if (pathname === "/api/exams") {
      try {
        const staticExams = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "exams.json"), "utf8"));
        return json(res, 200, staticExams);
      } catch (e) { return json(res, 500, { error: "exams unavailable: " + e.message }); }
    }
    if (pathname === "/api/quizzes") {
      const rows = db.prepare("SELECT * FROM quizzes ORDER BY id").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/mocktests") {
      const rows = db.prepare("SELECT * FROM mocktests ORDER BY id").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/pastpapers") {
      const rows = db.prepare("SELECT * FROM pastpapers ORDER BY year DESC, id").all();
      return json(res, 200, rows.map((p) => ({ ...p, pattern: !!p.pattern })));
    }

    /* ---------- User features (bookmarks, history, leaderboard, analytics) ---------- */
    if (pathname === "/api/bookmarks" && method === "GET") {
      const rows = db.prepare("SELECT b.*, m.question, m.correct_answer, m.difficulty, m.explanation FROM bookmarks b JOIN mcqs m ON m.id=b.mcq_id ORDER BY b.created_at DESC").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/bookmarks" && method === "POST") {
      readJson(req, res, (body) => {
        const { mcq_id, device_id } = body;
        if (!mcq_id) return json(res, 400, { error: "mcq_id required" });
        db.prepare(`INSERT INTO bookmarks (device_id,mcq_id) VALUES (?,?) ON CONFLICT(device_id,mcq_id) DO NOTHING`).run(device_id || "default", mcq_id);
        return json(res, 201, { ok: true });
      });
      return;
    }
    if (pathname === "/api/history" && method === "GET") {
      const rows = db.prepare("SELECT h.*, m.question, m.correct_answer, m.subject_id, m.chapter_id, m.topic_id FROM history h JOIN mcqs m ON m.id=h.mcq_id ORDER BY h.answered_at DESC LIMIT 200").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/history" && method === "POST") {
      readJson(req, res, (body) => {
        const { mcq_id, correct, device_id, time_taken_sec, skipped, session_id, mode } = body;
        if (!mcq_id) return json(res, 400, { error: "mcq_id required" });
        const rec = require("./ai/record.js").recordAnswer(db, {
          device_id, mcq_id, correct, time_taken_sec, skipped, session_id, mode: mode || "practice"
        });
        if (rec.correct) require("./ai/achievements.js").check(db, device_id || "default");
        return json(res, 201, { ok: true, ...rec });
      });
      return;
    }
    if (pathname === "/api/leaderboard") {
      const rows = db.prepare("SELECT * FROM leaderboard ORDER BY points DESC, correct DESC LIMIT 100").all();
      return json(res, 200, rows);
    }
    if (pathname === "/api/analytics") {
      const stats = db.prepare("SELECT * FROM analytics").all();
      return json(res, 200, stats);
    }

    /* ---------- Import (JSON bulk) ---------- */
    if (pathname === "/api/import" && method === "POST") {
      let body = ""; req.on("data", c => body += c); req.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (!Array.isArray(data)) return json(res, 400, { error: "expected array" });
          let inserted = 0, skipped = 0;
          for (const m of data) {
            const h = require("crypto").createHash("sha256").update(m.question.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");
            if (db.prepare("SELECT id FROM mcqs WHERE qhash=?").get(h)) { skipped++; continue; }
            const id = `imp-${Date.now()}-${inserted}`;
            db.prepare(`INSERT INTO mcqs (id,question,correct_answer,difficulty,subject_id,chapter_id,topic_id,exam_ids,tags,references_json,explanation,source,status,qhash) VALUES (?,?,?,?,?,?,?,?,?,?,?,'imported','active',?)`).run(
              id, m.question, m.correctAnswer, m.difficulty || "medium", m.subjectId, m.chapterId, m.topicId,
              m.examIds || "", JSON.stringify(m.tags || []), "[]", m.explanation, h
            );
            for (const [label, text] of [["A", m.optionA], ["B", m.optionB], ["C", m.optionC], ["D", m.optionD]]) {
              db.prepare(`INSERT INTO options (mcq_id,label,text) VALUES (?,?,?)`).run(id, label, text);
            }
            inserted++;
          }
          db.exec("INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')");
          return json(res, 200, { inserted, skipped });
        } catch (e) { return json(res, 400, { error: e.message }); }
      });
      return;
    }

    /* ---------- Export (DB -> static JSON) ---------- */
    if (pathname === "/api/export" && method === "GET") {
      const fmt = query.format || "json";
      const rows = db.prepare("SELECT m.*, c.name as chapter_name, t.name as topic_name FROM mcqs m LEFT JOIN chapters c ON c.id=m.chapter_id LEFT JOIN topics t ON t.id=m.topic_id WHERE m.status='active' ORDER BY m.subject_id, m.chapter_id, m.topic_id, m.id").all();
      if (fmt === "json") return json(res, 200, rows);
      if (fmt === "csv") {
        const header = "id,question,optionA,optionB,optionC,optionD,correct_answer,difficulty,subject_id,chapter_id,topic_id,explanation,tags,exam_ids,year,references,source,status\n";
        const csv = rows.map(m => [m.id, m.question, m.optionA, m.optionB, m.optionC, m.optionD, m.correct_answer, m.difficulty, m.subject_id, m.chapter_id, m.topic_id, m.explanation, JSON.stringify(m.tags), m.exam_ids, m.year || "", m.references_json || "[]", m.source || "generated", m.status].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mcqs.csv"' });
        return res.end(header + csv);
      }
      return json(res, 400, { error: "format must be json or csv" });
    }

    /* ---------- Backup / Restore ---------- */
    if (pathname === "/api/backup" && method === "POST") {
      try {
        const { execSync } = require("child_process");
        const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
        const dir = `backup/db-backup-${stamp}`;
        execSync(`node db/backup.js`, { cwd: __dirname, stdio: "ignore" });
        return json(res, 200, { ok: true, dir });
      } catch (e) { return json(res, 500, { error: "backup failed: " + e.message }); }
    }
    if (pathname === "/api/restore" && method === "POST") {
      readJson(req, res, (body) => {
        try {
          const { dir } = body;
          if (!dir) return json(res, 400, { error: "dir required" });
          const src = path.join(__dirname, "backup", dir, "pakistan-mcqs.sqlite");
          if (!fs.existsSync(src)) return json(res, 404, { error: "backup not found: " + src });
          db.close();
          fs.copyFileSync(src, path.join(__dirname, "db", "pakistan-mcqs.sqlite"));
          ["pakistan-mcqs.sqlite-wal", "pakistan-mcqs.sqlite-shm"].forEach((f) => {
            const p = path.join(__dirname, "db", f);
            if (fs.existsSync(p)) fs.unlinkSync(p);
          });
          db = open();
          if (db.kind === "sqlite") db.exec("INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')");
          const n = db.prepare("SELECT COUNT(*) n FROM mcqs").get().n;
          console.log("[server] restored from " + dir + " — " + n + " MCQs");
          return json(res, 200, { ok: true, mcqs: n });
        } catch (e) { console.error("[server] restore error:", e); return json(res, 500, { error: "restore failed: " + e.message }); }
      });
      return;
    }

    /* ---------- Phase 12 AI engine ---------- */
    if (aiRouter.handle(db, req, res, pathname, query, method)) return;

    /* ---------- 404 ---------- */
    json(res, 404, { error: "not found" });
  } catch (e) {
    console.error("[server]", e);
    json(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => console.log(`[MCQS API] listening on http://localhost:${PORT}`));
