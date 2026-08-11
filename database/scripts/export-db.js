"use strict";
/* ============================================================
   database/scripts/export-db.js
   Streaming NDJSON export of the production SQLite database
   into the database/ source repository. Read-only on SQLite.
   Usage:
     node export-db.js                 (full export)
     node export-db.js --incremental   (only changed files)
     node export-db.js --snapshot      (create snapshot copy)
     node export-db.js --release       (create release package)
   ============================================================ */
const fs = require("fs");
const path = require("path");
const os = require("os");
const lib = require("./lib/db-repo.js");

const { REPO_ROOT, openDb, qid, listTables, tableInfo, rowCount, sha256File } = lib;

const ARGS = process.argv.slice(2);
const INCREMENTAL = ARGS.includes("--incremental");
const SNAPSHOT = ARGS.includes("--snapshot");
const RELEASE = ARGS.includes("--release");
const TARGET_MB = 64;
const MAX_MB = 100;

const DATA_DIR = path.join(REPO_ROOT, "data");
const SCHEMA_DIR = path.join(REPO_ROOT, "schema");
const MANIFEST_DIR = path.join(REPO_ROOT, "manifests");
const REPORT_DIR = path.join(REPO_ROOT, "reports");
const SNAPSHOT_DIR = path.join(REPO_ROOT, "snapshots");
const RELEASE_DIR = path.join(REPO_ROOT, "releases");
const CHECKPOINT_FILE = path.join(MANIFEST_DIR, ".export-checkpoint.json");

for (const d of [DATA_DIR, SCHEMA_DIR, MANIFEST_DIR, REPORT_DIR, SNAPSHOT_DIR, RELEASE_DIR]) lib.mkdirp(d);

const perf = { phases: {}, startMs: Date.now(), peakRssMB: 0, rowsExported: 0, bytesExported: 0 };
function phaseStart(name) { perf.phases[name] = { start: Date.now(), ms: 0 }; }
function phaseEnd(name) { if (perf.phases[name]) perf.phases[name].ms = Date.now() - perf.phases[name].start; }
function trackPeak() { const mb = process.memoryUsage().rss / 1048576; if (mb > perf.peakRssMB) perf.peakRssMB = Math.round(mb); }

/* ---------- 1. Schema export ---------- */
const FTS_SHADOWS = new Set(["mcqs_fts_config", "mcqs_fts_data", "mcqs_fts_docsize", "mcqs_fts_idx"]);
async function exportSchema(db) {
  phaseStart("schema");
  const tables = db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .filter((t) => !FTS_SHADOWS.has(t.name));
  const views = db.all("SELECT name, sql FROM sqlite_master WHERE type='view' AND sql IS NOT NULL ORDER BY name");
  const trigs = db.all("SELECT name, sql FROM sqlite_master WHERE type='trigger' AND sql IS NOT NULL ORDER BY name");
  const idxs = db.all("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY tbl_name, name");

  const tablesSql = tables.map((t) => t.sql + ";").join("\n\n") + "\n";
  const viewsSql = views.map((v) => v.sql + ";").join("\n\n") + "\n";
  const trigsSql = trigs.map((t) => t.sql + ";").join("\n\n") + "\n";
  const idxsSql = idxs.map((i) => i.sql + ";").join("\n\n") + "\n";

  fs.writeFileSync(path.join(SCHEMA_DIR, "tables.sql"), tablesSql, "utf8");
  fs.writeFileSync(path.join(SCHEMA_DIR, "indexes.sql"), idxsSql, "utf8");
  fs.writeFileSync(path.join(SCHEMA_DIR, "triggers.sql"), trigsSql, "utf8");
  fs.writeFileSync(path.join(SCHEMA_DIR, "views.sql"), viewsSql, "utf8");
  phaseEnd("schema");
  return { tables: tables.length, views: views.length, triggers: trigs.length, indexes: idxs.length };
}

/* ---------- 2. Table -> category directory mapping ---------- */
function categoryForTable(name) {
  const map = {
    subjects: "subjects", chapters: "chapters", topics: "topics", subtopics: "subtopics",
    categories: "subjects", concepts: "concepts", mcq_concepts: "concepts",
    options: "mcqs", mcqs: "mcqs",
    history: "analytics", analytics: "analytics", leaderboard: "analytics", leaderboard_periods: "analytics",
    learning_sessions: "analytics", ai_state: "analytics",
    quizzes: "assessment", mocktests: "assessment", pastpapers: "assessment",
    user_profiles: "users", bookmarks: "users", flashcards: "users", revision_schedule: "users",
    study_plans: "users", recommendations: "users", predictions: "users", notifications: "users",
    achievements: "users", current_affairs: "users", weak_topics: "users", strong_topics: "users",
    mcq_generation_queue: "publishing", mcq_audit_log: "publishing", mcq_releases: "publishing",
    mcq_versions: "publishing", mcq_reviews: "review", mcq_rollback_points: "publishing", kg_pending_changes: "publishing",
    kg_validation_reports: "review"
  };
  if (map[name]) return map[name];
  if (name.startsWith("kg_")) return "kg";
  return "other";
}

/* ---------- 3. Checkpoint state ---------- */
function loadCheckpoint() {
  const c = lib.readJson(CHECKPOINT_FILE);
  return c || { version: 1, completed: {}, updated_at: null };
}
function saveCheckpoint(cp) {
  cp.updated_at = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2), "utf8");
}

/* ---------- 4. Single-table NDJSON export + compression ---------- */
async function exportTable(db, table, fileEntry, cp) {
  const dir = path.join(DATA_DIR, categoryForTable(table));
  const base = table + ".ndjson";
  const ndjsonPath = path.join(dir, base);
  const gzPath = ndjsonPath + ".gz";
  lib.mkdirp(dir);

  const key = "table:" + table;
  if (cp.completed[key]) {
    fileEntry.rows = cp.completed[key].rows;
    fileEntry.skipped = true;
    if (Array.isArray(cp.completed[key].files) && cp.completed[key].files.length) {
      fileEntry.files = cp.completed[key].files;
      fileEntry.compressed_bytes = cp.completed[key].files.reduce((s, f) => s + (f.compressed_bytes || 0), 0);
      fileEntry.uncompressed_bytes = cp.completed[key].files.reduce((s, f) => s + (f.uncompressed_bytes || 0), 0);
      return;
    }
    const gz = path.join(DATA_DIR, categoryForTable(table), table + ".ndjson.gz");
    const nd = path.join(DATA_DIR, categoryForTable(table), table + ".ndjson");
    if (!fs.existsSync(gz) && fs.existsSync(path.join(DATA_DIR, categoryForTable(table), table + "-part01.ndjson.gz"))) {
      const files = [];
      let i = 1;
      for (;;) {
        const idx = String(i).padStart(2, "0");
        const p = path.join(DATA_DIR, categoryForTable(table), table + "-part" + idx + ".ndjson.gz");
        if (!fs.existsSync(p)) break;
        files.push({ table, subject: null, filename: path.relative(DATA_DIR, p).split(path.sep).join("/"), rows: 0, uncompressed_bytes: 0, compressed_bytes: lib.fileSize(p) });
        i++;
      }
      fileEntry.files = files;
      fileEntry.compressed_bytes = files.reduce((s, f) => s + f.compressed_bytes, 0);
      return;
    }
    fileEntry.compressed_bytes = cp.completed[key].compressed_bytes || lib.fileSize(gz);
    fileEntry.uncompressed_bytes = cp.completed[key].uncompressed_bytes || lib.fileSize(nd);
    return;
  }

  const rows = await lib.streamTableToNdjson(db, table, ndjsonPath);
  await lib.compressFile(ndjsonPath, gzPath);
  fileEntry.rows = rows;
  fileEntry.uncompressed_bytes = lib.fileSize(ndjsonPath);
  fileEntry.compressed_bytes = lib.fileSize(gzPath);
  perf.rowsExported += rows;
  cp.completed[key] = { rows, uncompressed_bytes: fileEntry.uncompressed_bytes, compressed_bytes: fileEntry.compressed_bytes };
  saveCheckpoint(cp);
}

/* ---------- 5. MCQs by subject, size-based part splitting ---------- */
async function exportMcqsBySubject(db, fileEntries, cp) {
  phaseStart("mcqs");
  const dir = path.join(DATA_DIR, "mcqs");
  lib.mkdirp(dir);
  const subjects = db.all("SELECT DISTINCT subject_id FROM mcqs WHERE subject_id IS NOT NULL AND subject_id != '' ORDER BY subject_id").map((r) => r.subject_id);
  subjects.push("unassigned");

  for (const subj of subjects) {
    const sdir = path.join(dir, String(subj).replace(/[\\/:*?"<>|]/g, "_"));
    lib.mkdirp(sdir);
    const key = "mcqs:" + subj;
    if (cp.completed[key]) { fileEntries.push(...(cp.completed[key].files || [])); continue; }

    const tmp = path.join(sdir, ".part.tmp");
    const where = subj === "unassigned" ? "subject_id IS NULL OR subject_id = ''" : "subject_id = ?";
    const stmt = db.raw.prepare("SELECT * FROM mcqs WHERE " + where);
    const iter = stmt.iterate(...(subj === "unassigned" ? [] : [subj]));
    const ws = fs.createWriteStream(tmp);
    let count = 0;
    for (const row of iter) {
      if (!ws.write(JSON.stringify(row) + "\n")) await new Promise((r) => ws.write("", r));
      count++;
      if (count % 50000 === 0) { trackPeak(); await new Promise((r) => setImmediate(r)); }
    }
    await new Promise((res) => ws.end(res));
    trackPeak();

    // Determine compressed size of the whole subject file
    const wholeGz = path.join(sdir, ".whole.gz");
    await lib.compressFile(tmp, wholeGz);
    const wholeSize = lib.fileSize(wholeGz);
    fs.rmSync(wholeGz, { force: true });

    const parts = [];
    if (wholeSize <= MAX_MB * 1048576) {
      parts.push({ index: 1, lineStart: 0, lineEnd: count });
    } else {
      const nParts = Math.max(2, Math.ceil(wholeSize / (TARGET_MB * 1048576)));
      const per = Math.ceil(count / nParts);
      for (let i = 0; i < nParts; i++) parts.push({ index: i + 1, lineStart: i * per, lineEnd: Math.min(count, (i + 1) * per) });
    }

    const files = [];
    for (const p of parts) {
      const idx = String(p.index).padStart(2, "0");
      const partNdjson = path.join(sdir, "part" + idx + ".ndjson");
      const partGz = partNdjson + ".gz";
      const out = fs.createWriteStream(partNdjson);
      let line = 0, written = 0;
      for await (const rowText of lib.openNdjsonReader(tmp)) {
        if (line >= p.lineEnd) break;
        if (line >= p.lineStart) {
          out.write(rowText + "\n");
          written++;
          if (written % 50000 === 0) await new Promise((r) => setImmediate(r));
        }
        line++;
      }
      await new Promise((res) => out.end(res));
      const ub = lib.fileSize(partNdjson);
      await lib.compressFile(partNdjson, partGz);
      const cb = lib.fileSize(partGz);
      fs.rmSync(partNdjson, { force: true });
      const fe = {
        table: "mcqs", subject: String(subj), filename: path.relative(DATA_DIR, partGz).split(path.sep).join("/"),
        rows: written, uncompressed_bytes: ub, compressed_bytes: cb
      };
      files.push(fe);
      fileEntries.push(fe);
      perf.rowsExported += written;
    }
    fs.rmSync(tmp, { force: true });
    cp.completed[key] = { rows: count, files };
    saveCheckpoint(cp);
  }
  phaseEnd("mcqs");
}

/* ---------- 5b. Split any oversized single files into parts ---------- */
async function splitOversizedFiles(db, fileEntries, cp) {
  const TIER = 0; // treat as empty below
  const candidates = fileEntries.filter((fe) => fe.compressed_bytes > MAX_MB * 1048576 && fe.filename && fe.filename.endsWith(".ndjson.gz") && !fe.splitDone);
  for (const fe of candidates) {
    console.log("[export-db] splitting oversized file " + fe.filename + " (" + lib.human(fe.compressed_bytes) + ")");
    const srcGz = path.join(DATA_DIR, fe.filename.split("/").join(path.sep));
    const dir = path.dirname(srcGz);
    const base = path.basename(fe.filename).replace(".ndjson.gz", "");
    const tmp = path.join(dir, ".part.tmp");
    await lib.decompressFile(srcGz, tmp);
    const totalRows = fe.rows;
    const nParts = Math.max(2, Math.ceil(fe.compressed_bytes / (TARGET_MB * 1048576)));
    const per = Math.ceil(totalRows / nParts);

    // count rows to know if per is valid (rows already known)
    const outFiles = [];
    for (let i = 0; i < nParts; i++) {
      const idx = String(i + 1).padStart(2, "0");
      const partPlain = path.join(dir, base + "-part" + idx + ".ndjson");
      const partGz = partPlain + ".gz";
      const w = fs.createWriteStream(partPlain);
      let line = 0, written = 0, started = false;
      for await (const rowText of lib.openNdjsonReader(tmp)) {
        if (line < i * per) { line++; continue; }
        started = true;
        if (line >= Math.min(totalRows, (i + 1) * per)) break;
        w.write(rowText + "\n");
        written++; line++;
      }
      w.end();
      await new Promise((res) => w.on("finish", res));
      if (written === 0) { fs.rmSync(partPlain, { force: true }); continue; }
      const ub = lib.fileSize(partPlain);
      await lib.compressFile(partPlain, partGz);
      const cb = lib.fileSize(partGz);
      fs.rmSync(partPlain, { force: true });
      outFiles.push({ table: fe.table, subject: fe.subject || null, filename: path.relative(DATA_DIR, partGz).split(path.sep).join("/"), rows: written, uncompressed_bytes: ub, compressed_bytes: cb });
      console.log("   part " + idx + ": " + lib.human(cb));
    }
    fs.rmSync(tmp, { force: true });
    // remove original, replace entry with parts
    fs.rmSync(srcGz, { force: true });
    const origIndex = fileEntries.indexOf(fe);
    if (origIndex > -1) fileEntries.splice(origIndex, 1);
    fileEntries.push(...outFiles);
    cp.completed["table:" + (fe.table || base)] = { rows: fe.rows, files: outFiles };
    saveCheckpoint(cp);
  }
}

/* ---------- 6. Manifest, row counts, checksums, files ---------- */
async function generateManifests(db, tables, fileEntries, schemaInfo, exportRows) {
  phaseStart("manifests");
  const rowCounts = {};
  for (const t of tables) rowCounts[t] = rowCount(db, t);
  // add subject-level mcq counts
  rowCounts.mcqs = rowCounts.mcqs || 0;

  // checksums for sqlite + all exported files + schema
  const checksums = {};
  const sqlitePath = path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.sqlite");
  checksums["db/pakistan-mcqs.sqlite"] = await sha256File(sqlitePath);
  for (const f of fs.readdirSync(SCHEMA_DIR)) checksums["schema/" + f] = await sha256File(path.join(SCHEMA_DIR, f));
  for (const fe of fileEntries) {
    const full = path.join(DATA_DIR, fe.filename.split("/").join(path.sep));
    checksums["data/" + fe.filename] = await sha256File(full);
  }

  const totalRows = Object.values(rowCounts).reduce((s, n) => s + n, 0);
  const totalFiles = fileEntries.length + 4;
  const totalCompressed = fileEntries.reduce((s, f) => s + f.compressed_bytes, 0);
  const totalUncompressed = fileEntries.reduce((s, f) => s + f.uncompressed_bytes, 0);

  const manifest = {
    database_version: "1.0.0",
    schema_version: schemaInfo.tables + " tables / " + schemaInfo.indexes + " indexes / " + schemaInfo.views + " views / " + schemaInfo.triggers + " triggers",
    export_version: "3.0.0",
    sqlite_version: db.get("SELECT sqlite_version() v").v,
    node_version: process.version,
    export_date: new Date().toISOString(),
    export_duration_ms: perf.phases.mcqs ? perf.phases.mcqs.ms + (perf.phases.schema ? perf.phases.schema.ms : 0) : 0,
    compression_type: "gz (zlib gzip, level 6; zst unavailable on host)",
    compression: "lossless",
    table_count: tables.length,
    row_count: totalRows,
    total_files: totalFiles,
    total_size_bytes: totalUncompressed,
    compressed_size_bytes: totalCompressed,
    repository_version: "v1",
    incremental: INCREMENTAL,
    checkpointed: true
  };

  const filesJson = fileEntries.map((f) => ({ ...f, checksum: checksums["data/" + f.filename] || "" }));

  await lib.writeJson(path.join(MANIFEST_DIR, "manifest.json"), manifest);
  await lib.writeJson(path.join(MANIFEST_DIR, "row_counts.json"), rowCounts);
  await lib.writeJson(path.join(MANIFEST_DIR, "checksums.json"), checksums);
  await lib.writeJson(path.join(MANIFEST_DIR, "files.json"), filesJson);
  phaseEnd("manifests");
  return { manifest, rowCounts, checksums, filesJson, totalRows };
}

/* ---------- 7. Snapshot + release ---------- */
function createSnapshot(manifest) {
  lib.mkdirp(path.join(SNAPSHOT_DIR, "latest"));
  const existing = fs.readdirSync(SNAPSHOT_DIR).filter((d) => /^v\d+$/.test(d));
  const v = "v" + (existing.length + 1);
  lib.mkdirp(path.join(SNAPSHOT_DIR, v));
  for (const f of ["manifest.json", "row_counts.json", "checksums.json", "files.json"]) {
    const src = path.join(MANIFEST_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(SNAPSHOT_DIR, "latest", f));
      fs.copyFileSync(src, path.join(SNAPSHOT_DIR, v, f));
    }
  }
  return v;
}

function createRelease() {
  const existing = fs.readdirSync(RELEASE_DIR).filter((d) => /^source-v\d+$/.test(d));
  const v = "v" + (existing.length + 1);
  const dest = path.join(RELEASE_DIR, "source-" + v);
  lib.mkdirp(path.join(dest, "schema"));
  lib.mkdirp(path.join(dest, "data"));
  lib.mkdirp(path.join(dest, "manifests"));
  // hard-link schema + manifests
  for (const f of fs.readdirSync(SCHEMA_DIR)) linkOrCopy(path.join(SCHEMA_DIR, f), path.join(dest, "schema", f));
  for (const f of fs.readdirSync(MANIFEST_DIR)) {
    if (f.startsWith(".")) continue;
    linkOrCopy(path.join(MANIFEST_DIR, f), path.join(dest, "manifests", f));
  }
  // hard-link all data files
  (function walk(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, path.join(rel, e.name));
      else linkOrCopy(full, path.join(dest, "data", rel, e.name));
    }
  })(DATA_DIR, "");
  return v;
}
function linkOrCopy(src, dest) {
  lib.mkdirp(path.dirname(dest));
  try { fs.linkSync(src, dest); } catch (e) { fs.copyFileSync(src, dest); }
}

/* ---------- Main ---------- */
async function main() {
  phaseStart("total");
  const db = openDb();
  trackPeak();
  const cp = loadCheckpoint();
  const start = Date.now();

  console.log("[export-db] schema export");
  const schemaInfo = await exportSchema(db);

  const tables = listTables(db);
  const fileEntries = [];
  console.log("[export-db] exporting " + tables.length + " tables (streaming NDJSON)");
  for (const t of tables) {
    if (t === "mcqs") continue;
    const fe = { table: t, subject: null, filename: null, rows: 0, uncompressed_bytes: 0, compressed_bytes: 0 };
    await exportTable(db, t, fe, cp);
    if (fe.filename === null) {
      fe.filename = path.join(categoryForTable(t), t + ".ndjson.gz").split(path.sep).join("/");
    }
    if (!fe.skipped) {
      fe.filename = path.join(categoryForTable(t), t + ".ndjson.gz").split(path.sep).join("/");
      fe.compressed_bytes = lib.fileSize(path.join(DATA_DIR, fe.filename.split("/").join(path.sep)));
      const nd = path.join(DATA_DIR, categoryForTable(t), t + ".ndjson");
      fe.uncompressed_bytes = lib.fileSize(nd);
    }
    if (fe.files && fe.files.length) {
      fileEntries.push(...fe.files);
      console.log("  " + t + ": " + fe.rows + " rows (" + fe.files.length + " parts)");
    } else {
      fileEntries.push(fe);
      console.log("  " + t + ": " + fe.rows + " rows");
    }
    trackPeak();
  }

  console.log("[export-db] exporting mcqs by subject");
  await exportMcqsBySubject(db, fileEntries, cp);

  console.log("[export-db] splitting oversized files");
  await splitOversizedFiles(db, fileEntries, cp);

  console.log("[export-db] generating manifests");
  const { manifest, rowCounts, checksums, filesJson, totalRows } = await generateManifests(db, tables, fileEntries, schemaInfo);

  if (SNAPSHOT) { const v = createSnapshot(manifest); console.log("[export-db] snapshot: " + v); }
  if (RELEASE) { const v = createRelease(); console.log("[export-db] release: " + v); }

  phaseEnd("total");
  perf.totalMs = Date.now() - start;
  trackPeak();
  perf.rowsTotal = totalRows;
  perf.files = fileEntries.length;
  await lib.writeJson(path.join(REPORT_DIR, "export_report.json"), {
    exported_at: new Date().toISOString(),
    tables: tables.length,
    rows: totalRows,
    files: fileEntries.length,
    schema: schemaInfo,
    compression: "gz",
    incremental: INCREMENTAL,
    snapshot: SNAPSHOT ? true : false,
    perf
  });

  db.close();
  console.log("[export-db] done. rows=" + totalRows + " files=" + fileEntries.length + " peakRSS=" + perf.peakRssMB + "MB");
  return { manifest, rowCounts, checksums, filesJson, totalRows, perf, tables };
}

if (require.main === module) {
  main().then((r) => process.exit(0)).catch((e) => { console.error("[export-db] ERROR", e); process.exit(1); });
} else {
  module.exports = { main, exportSchema, exportTable, exportMcqsBySubject, splitOversizedFiles, generateManifests, createSnapshot, createRelease };
}
