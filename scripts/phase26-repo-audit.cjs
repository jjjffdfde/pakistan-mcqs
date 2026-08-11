/* ============================================================
   Phase 26 - STEP 1: Repository Audit
   Deterministic analysis of folder structure, unused files,
   duplicates, large files, build artifacts and configuration.
   Usage: node scripts/phase26-repo-audit.cjs
   Emits: docs/phase26_repo_audit.json
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_repo_audit.json");
const EXCLUDE_DIRS = new Set(["node_modules", ".git"]);
const LARGE_BYTES = 10 * 1024 * 1024; /* 10 MB */

/* ---------- full walk ---------- */
const files = [];
(function walk(dir, rel) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      walk(full, r);
    } else {
      let size = 0;
      try { size = fs.statSync(full).size; } catch (e2) {}
      files.push({ path: r, size });
    }
  }
})(ROOT, "");
files.sort((a, b) => a.path.localeCompare(b.path));

const totalBytes = files.reduce((a, f) => a + f.size, 0);

/* ---------- folder structure summary ---------- */
const dirs = {};
for (const f of files) {
  const top = f.path.split("/")[0];
  const sub = f.path.split("/").slice(0, -1).join("/");
  dirs[top] = dirs[top] || { files: 0, bytes: 0, subdirs: new Set() };
  dirs[top].files++;
  dirs[top].bytes += f.size;
  if (sub) dirs[top].subdirs.add(sub);
}
const structure = Object.entries(dirs).sort((a, b) => b[1].bytes - a[1].bytes).map(([d, v]) => ({
  dir: d,
  files: v.files,
  bytes: v.bytes,
  subdirs: [...v.subdirs].sort()
}));

/* ---------- extensions ---------- */
const extCount = {};
for (const f of files) {
  const ext = (f.path.split(".").pop() || "no-ext").toLowerCase();
  extCount[ext] = (extCount[ext] || 0) + 1;
}
const extensions = Object.entries(extCount).sort((a, b) => b[1] - a[1]).map(([ext, n]) => ({ ext, count: n }));

/* ---------- duplicate files (by sha256, size>0) ---------- */
const hashGroups = {};
for (const f of files) {
  if (f.size === 0) continue;
  let h;
  try { h = crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, f.path))).digest("hex").slice(0, 20); } catch (e) { continue; }
  (hashGroups[h] = hashGroups[h] || []).push(f.path);
}
const duplicates = Object.entries(hashGroups).filter(([, v]) => v.length > 1).map(([h, v]) => ({ hash: h, files: v, bytes: files.find((f) => f.path === v[0]).size }));

/* ---------- large files ---------- */
const largeFiles = files.filter((f) => f.size >= LARGE_BYTES).sort((a, b) => b.size - a.size).map((f) => ({
  file: f.path,
  mb: Math.round(f.size / 1024 / 1024 * 10) / 10
}));

/* ---------- build artifacts / debris ---------- */
const artifactPatterns = [/\.log$/i, /\.bak$/i, /\.tmp$/i, /\.DS_Store$/i, /^Thumbs\.db$/i, /\.zip$/i, /\.tar\.gz$/i, /\.tgz$/i, /node_modules/i, /dist\//, /release\//];
const artifactKinds = ["log", "bak", "tmp", "DS_Store", "Thumbs.db", "zip", "tar.gz", "tgz", "node_modules", "dist", "release"];
/* stray sqlite not under backup/ (e.g. stale rebuilt db); live db sidecars are transient */
const straySqlite = files.filter((f) => /\.sqlite(-wal|-shm)?$/i.test(f.path) && !f.path.startsWith("backup/") && !/^db\/pakistan-mcqs\.sqlite(-wal|-shm)?$/i.test(f.path));
const buildArtifacts = files.filter((f) => artifactPatterns.some((re) => re.test(f.path))).map((f) => ({
  file: f.path,
  bytes: f.size,
  kind: artifactKinds[artifactPatterns.findIndex((re) => re.test(f.path))] || "other"
}));
/* intentional backups: sqlite snapshots under backup/ */
const backupSnapshots = files.filter((f) => f.path.startsWith("backup/") && /\.sqlite$/.test(f.path)).length;

/* ---------- unused / root debris ---------- */
const rootFiles = files.filter((f) => !f.path.includes("/"));
const referenced = new Set();
const ALL_TEXT = new Set([".js", ".cjs", ".mjs", ".html", ".json", ".md", ".css", ".webmanifest", ".xml", ".txt", ".yml", ".yaml", ".sh", ".cmd", ".sql", ".cfg", ".conf", ".cjs"]);
function collectRefs(src, baseDir) {
  const re = /["'( ]([a-z0-9_\-./]+\.(?:js|cjs|html|json|css|png|jpg|svg|webmanifest|xml|md|sql|log))["')]/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const ref = m[1].replace(/^\.\//, "");
    if (ref.startsWith("http") || ref.startsWith("data:") || ref.startsWith("#")) continue;
    const clean = ref.split("?")[0].split("#")[0];
    const joined = path.posix.normalize(path.posix.join(baseDir || ".", clean));
    referenced.add(joined.replace(/\\/g, "/"));
  }
}
for (const f of files) {
  const ext = f.path.split(".").pop().toLowerCase();
  if (!ALL_TEXT.has(ext)) continue;
  if (f.size > 5 * 1024 * 1024) continue;
  const base = f.path.includes("/") ? f.path.split("/").slice(0, -1).join("/") : "";
  try { collectRefs(fs.readFileSync(path.join(ROOT, f.path), "utf8"), base); } catch (e) {}
}
/* which html pages are linked? which assets are used? */
const usedByLinks = new Set();
for (const f of files) {
  const ext = f.path.split(".").pop().toLowerCase();
  if (!ALL_TEXT.has(ext) || f.size > 5 * 1024 * 1024) continue;
  const base = f.path.includes("/") ? f.path.split("/").slice(0, -1).join("/") : "";
  const src = fs.readFileSync(path.join(ROOT, f.path), "utf8");
  const re = /(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|#)/i.test(ref)) continue;
    const clean = ref.split("?")[0].split("#")[0];
    if (!clean) continue;
    const joined = path.posix.normalize(path.posix.join(base || ".", clean));
    usedByLinks.add(joined.replace(/\\/g, "/"));
  }
}

/* ---------- root debris: non-essential tool/report files at root ---------- */
const rootReportFiles = rootFiles.filter((f) => /^(phase|verify|quiz|subject|server|srv|validation|image-sitemap|video-sitemap)[^/]*$/.test(f.path) && !/\.(html|xml)$/i.test(f.path));
const rootReportPages = rootFiles.filter((f) => /^(phase|quiz|subject|verify)[^/]*\.html$/i.test(f.path));
const rootLogs = rootFiles.filter((f) => /\.log$/.test(f.path));

/* ---------- config inventory ---------- */
const configFiles = files.filter((f) => /(^|\/)(\.(editorconfig|eslintrc\.json|prettierrc|markdownlint|npmrc|gitignore)|(package\.json|Dockerfile|docker-compose\.yml|nginx\.conf|ecosystem\.config\.js|tsconfig\.json|jsconfig\.json))$/i.test(f.path)).map((f) => f.path);

/* ---------- report ---------- */
const report = {
  step: "repo_audit",
  generated_at: new Date().toISOString(),
  summary: {
    total_files: files.length,
    total_directories: Object.keys(dirs).length,
    total_bytes: totalBytes,
    total_mb: Math.round(totalBytes / 1024 / 1024 * 10) / 10,
    duplicate_groups: duplicates.length,
    large_files_ge_10mb: largeFiles.length,
    build_artifacts_found: buildArtifacts.length + straySqlite.length,
    intentional_backup_snapshots: backupSnapshots,
    stray_sqlite_files: straySqlite.length,
    root_log_files: rootLogs.length,
    root_report_pages: rootReportPages.length,
    config_files: configFiles.length,
    root_level_files: rootFiles.length
  },
  structure,
  extensions: extensions.slice(0, 30),
  duplicate_groups: duplicates.slice(0, 30),
  large_files: largeFiles.slice(0, 30),
  build_artifacts: [...buildArtifacts, ...straySqlite.map((f) => ({ file: f.path, bytes: f.size, kind: "stray_sqlite" }))].slice(0, 60),
  root_debris: rootReportFiles.map((f) => ({ file: f.path, bytes: f.size })),
  root_report_pages: rootReportPages.map((f) => ({ file: f.path, bytes: f.size })),
  root_logs: rootLogs.map((f) => ({ file: f.path, bytes: f.size })),
  configuration: configFiles,
  referenced_assets_total: referenced.size
};
fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
console.log("Repository audit complete -> docs/phase26_repo_audit.json");
console.log("  files:", files.length, "| duplicates:", duplicates.length, "| large(≥10MB):", largeFiles.length, "| artifacts:", buildArtifacts.length);
