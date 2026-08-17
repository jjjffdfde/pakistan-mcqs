/* runtime-v2/ai/admin.cjs — admin operations, file-backed.
   Ports server.js /api/import, /api/backup, /api/restore.
   Import: qhash-deduped MCQs appended to the gitignored userdata overlay
   (userdata/imports/<subject>.ndjson.gz + options/<subject>.json), indexes
   rebuilt, runtime caches reloaded — imported rows become queryable exactly
   like the SQLite import made them part of mcqs. Backup: snapshot of the
   userdata directory under backup/. Restore: validated directory restore. */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { execFileSync } = require("child_process");
const L = require("../data-loader.cjs");
const Q = require("../query-engine.cjs");
const S = require("./store.cjs");
const U = require("./util.cjs");

const BACKUP_ROOT = path.join(L.ROOT, "backup");
const importsOptDir = path.join(L.IMPORTS_DIR, "options");

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}
function readBody(req, res, cb) {
  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch (e) { json(res, 400, { error: "invalid JSON: " + e.message }); }
  });
}

function qhashOf(question) {
  return crypto.createHash("sha256").update(String(question).toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");
}

/* global qhash set: committed parts + user imports (oracle dedupes against all mcqs) */
async function knownQhashes() {
  const set = new Set();
  for (const sub of Object.keys(L.manifest().sourceFiles)) {
    await L.streamSubject(sub, (row) => { if (row && row.qhash) set.add(row.qhash); });
  }
  return set;
}

async function appendGzLines(file, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const prev = fs.existsSync(file) ? fs.readFileSync(file) : null;
  const tmp = file + ".tmp";
  await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(tmp);
    w.on("error", reject); w.on("close", resolve);
    if (prev) w.write(prev);
    const gz = zlib.createGzip();
    gz.pipe(w);
    for (const row of rows) gz.write(JSON.stringify(row) + "\n");
    gz.end();
  });
  fs.renameSync(tmp, file);
}

function rebuildIndexes() {
  execFileSync(process.execPath, [path.join(L.ROOT, "runtime-v2", "index-builder.cjs")], { cwd: path.join(L.ROOT, "runtime-v2"), stdio: "ignore", timeout: 30 * 60 * 1000 });
}

async function importMcqs(res, req) {
  readBody(req, res, async (data) => {
    try {
      if (!Array.isArray(data)) return json(res, 400, { error: "expected array" });
      const known = await knownQhashes();
      const nowIso = U.utcNow();
      let inserted = 0, skipped = 0;
      const bySubject = new Map();
      const bySubjectOpts = new Map();
      for (const m of data) {
        const h = qhashOf(m.question);
        if (known.has(h)) { skipped++; continue; }
        known.add(h);
        const id = `imp-${Date.now()}-${inserted}`;
        const subject = String(m.subjectId || "").slice(0, 60);
        const row = {
          id, question: String(m.question || "").slice(0, 2000),
          correct_answer: String(m.correctAnswer || "").slice(0, 10),
          difficulty: String(m.difficulty || "medium").slice(0, 20),
          subject_id: subject, chapter_id: String(m.chapterId || "").slice(0, 40),
          topic_id: String(m.topicId || "").slice(0, 40),
          exam_ids: String(m.examIds || "").slice(0, 200),
          tags: JSON.stringify(m.tags || []),
          references_json: "[]", explanation: String(m.explanation || "").slice(0, 4000),
          source: "imported", status: "active", qhash: h,
          created_at: nowIso, updated_at: nowIso
        };
        const opts = { A: m.optionA, B: m.optionB, C: m.optionC, D: m.optionD };
        if (!bySubject.has(subject)) bySubject.set(subject, []);
        bySubject.get(subject).push(row);
        if (!bySubjectOpts.has(subject)) bySubjectOpts.set(subject, {});
        bySubjectOpts.get(subject)[id] = opts;
        inserted++;
      }
      for (const [subject, rows] of bySubject) {
        if (!fs.existsSync(L.partFile(subject))) {
          /* unknown subject: create the part dir + empty part01 so the subject
             becomes a first-class (file) subject — superset of the oracle rows */
          fs.mkdirSync(path.dirname(L.partFile(subject)), { recursive: true });
          await appendGzLines(L.partFile(subject), []);
        }
        await appendGzLines(L.importsFile(subject), rows);
        fs.mkdirSync(importsOptDir, { recursive: true });
        const file = path.join(importsOptDir, subject + ".json");
        const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
        fs.writeFileSync(file, JSON.stringify(Object.assign(prev, bySubjectOpts.get(subject))));
      }
      if (inserted > 0) {
        rebuildIndexes();
        await Q.reload();
      }
      return json(res, 200, { inserted, skipped });
    } catch (e) { return json(res, 400, { error: e.message }); }
  });
}

function backup(res) {
  try {
    fs.mkdirSync(BACKUP_ROOT, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
    const dir = "backup/db-backup-" + stamp;
    const dst = path.join(L.ROOT, dir);
    fs.mkdirSync(dst, { recursive: true });
    const copy = (src, base) => {
      for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, ent.name), d = path.join(base, ent.name);
        if (ent.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copy(s, d); }
        else fs.copyFileSync(s, d);
      }
    };
    if (fs.existsSync(L.USER_DIR)) {
      fs.mkdirSync(path.join(dst, "userdata"), { recursive: true });
      copy(L.USER_DIR, path.join(dst, "userdata"));
    }
    fs.writeFileSync(path.join(dst, "backup-info.json"), JSON.stringify({ at: U.utcNow(), engine: "file", userdata: true }));
    return json(res, 200, { ok: true, dir });
  } catch (e) { return json(res, 500, { error: "backup failed: " + e.message }); }
}

function restore(req, res) {
  readBody(req, res, async (body) => {
    try {
      const { dir } = body;
      if (!dir) return json(res, 400, { error: "dir required" });
      /* dir is ROOT-relative, e.g. "backup/db-backup-..." (exactly what the
         backup API returns); resolved must stay inside the backup root */
      const resolved = path.resolve(L.ROOT, dir);
      const root = path.resolve(L.ROOT, "backup");
      if (!resolved.startsWith(root + path.sep)) return json(res, 400, { error: "invalid dir" });
      const rel = resolved.slice(root.length + 1);
      if (!rel || rel.split(path.sep).some((s) => s === "..") || path.isAbsolute(dir)) {
        return json(res, 400, { error: "invalid dir" });
      }
      const srcUser = path.join(resolved, "userdata");
      if (!fs.existsSync(path.join(resolved, "backup-info.json"))) return json(res, 404, { error: "backup not found: " + dir });
      fs.rmSync(L.USER_DIR, { recursive: true, force: true });
      if (fs.existsSync(srcUser)) {
        fs.mkdirSync(L.USER_DIR, { recursive: true });
        const copy = (src) => {
          for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
            const s = path.join(src, ent.name), d = path.join(L.USER_DIR, ent.name);
            if (ent.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copy(s); }
            else fs.copyFileSync(s, d);
          }
        };
        copy(srcUser);
      }
      for (const k of S._cache.keys()) S._cache.delete(k);
      const { _reset } = require("../user-store.cjs");
      _reset();
      await Q.reload();
      const n = Object.values(L.bySubjectActive()).reduce((a, b) => a + b, 0);
      return json(res, 200, { ok: true, mcqs: n });
    } catch (e) { console.error("[admin] restore error:", e); return json(res, 500, { error: "restore failed: " + e.message }); }
  });
}

module.exports = { importMcqs, backup, restore, qhashOf, knownQhashes, rebuildIndexes };
