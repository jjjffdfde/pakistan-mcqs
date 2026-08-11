"use strict";
/* ============================================================
   database/scripts/storage-report.js
   Analyze storage: repo size, per-category, compression ratio,
   largest files, GitHub size limits (100MB hard / 50MB warning),
   LFS candidates. Writes storage_report.json.
   Usage: node storage-report.js
   ============================================================ */
const fs = require("fs");
const path = require("path");
const lib = require("./lib/db-repo.js");

const DATA_DIR = path.join(lib.REPO_ROOT, "data");

async function main() {
  const report = { phase: "storage-report", generated_at: new Date().toISOString(), categories: {}, total: { bytes: 0, files: 0 }, largest: [], github: { hard_limit_mb: 100, warn_limit_mb: 50, over_hard: [], over_warn: [], lfs_candidates: [] }, db: {} };

  const dbPath = path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.sqlite");
  if (fs.existsSync(dbPath)) report.db = { bytes: fs.statSync(dbPath).size, human: lib.human(fs.statSync(dbPath).size) };

  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      const size = fs.statSync(full).size;
      report.total.bytes += size;
      report.total.files++;
      const cat = path.relative(DATA_DIR, full).split(path.sep)[0];
      if (!report.categories[cat]) report.categories[cat] = { bytes: 0, files: 0 };
      report.categories[cat].bytes += size;
      report.categories[cat].files++;
      report.largest.push({ file: path.relative(lib.REPO_ROOT, full).split(path.sep).join("/"), bytes: size, human: lib.human(size) });
      if (size > 100 * 1048576) report.github.over_hard.push(path.relative(lib.REPO_ROOT, full).split(path.sep).join("/"));
      if (size > 50 * 1048576) report.github.over_warn.push(path.relative(lib.REPO_ROOT, full).split(path.sep).join("/"));
      if (size > 10 * 1048576) report.github.lfs_candidates.push({ file: path.relative(lib.REPO_ROOT, full).split(path.sep).join("/"), bytes: size, human: lib.human(size) });
    }
  })(DATA_DIR);

  report.largest.sort((a, b) => b.bytes - a.bytes);
  report.largest = report.largest.slice(0, 25);
  report.total.human = lib.human(report.total.bytes);
  for (const c of Object.keys(report.categories)) report.categories[c].human = lib.human(report.categories[c].bytes);

  // compression ratio: gz vs plain from files.json totals
  const filesJson = lib.readJson(path.join(lib.REPO_ROOT, "manifests", "files.json")) || [];
  const totalPlain = filesJson.reduce((s, f) => s + (f.uncompressed_bytes || 0), 0);
  const totalGz = filesJson.reduce((s, f) => s + (f.compressed_bytes || 0), 0);
  report.compression = { files: filesJson.length, total_plain_bytes: totalPlain, total_gz_bytes: totalGz, overall_ratio: totalPlain ? +(totalGz / totalPlain).toFixed(4) : null, saved_bytes_vs_plain: totalPlain - totalGz, db_to_repo_ratio: report.db.bytes ? +(report.total.bytes / report.db.bytes).toFixed(4) : null };

  lib.writeJson(path.join(lib.REPO_ROOT, "reports", "storage_report.json"), report);
  console.log("[storage-report] total=" + report.total.human + " files=" + report.total.files + " db=" + (report.db.human || "n/a"));
  console.log("[storage-report] gz/plain ratio=" + (report.compression.overall_ratio || "n/a") + " db->repo=" + (report.compression.db_to_repo_ratio || "n/a") + " github-over-50MB=" + report.github.over_warn.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
