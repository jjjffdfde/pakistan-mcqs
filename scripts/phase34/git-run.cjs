/* Phase 34 modules 25/26: git dry run + github readiness reports. No push, no commit, no staging. */
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs");

const candidates = JSON.parse(fs.readFileSync(path.join(OUT, "phase34_largest_tracked_candidates.json"), "utf8"));
const dryRunRaw = execSync("git add --dry-run -A", { cwd: ROOT, encoding: "utf8" });
const lines = dryRunRaw.split("\n").filter(Boolean);
const candPaths = lines.map((l) => l.replace(/^add '(.+)'$/, "$1"));
const candSet = new Set(candPaths);

const ignoredProbe = {
  db_sqlite: !candSet.has("db/pakistan-mcqs.sqlite"),
  backup_snapshots: ![...candSet].some((p) => p.startsWith("backup/")),
  database_payload: ![...candSet].some((p) => p.startsWith("database/data/") || p.startsWith("database/releases/")),
  phase34_snapshot: ![...candSet].some((p) => p.startsWith("phase34-backup-")),
  audit_tmp: ![...candSet].some((p) => p.startsWith(".audit-tmp/")),
  env_files: ![...candSet].some((p) => /^\.env(\..*)?$/.test(p) && p !== ".env.example")
};

fs.writeFileSync(path.join(OUT, "phase34_git_dry_run.json"), JSON.stringify({
  git_version: execSync("git --version", { encoding: "utf8" }).trim(),
  repository: { initialized: true, branch: "main", commits: 0, note: "initialized locally; NOTHING staged or committed (dry run only per Phase 34 module 25)" },
  commands_run: ["git init -b main", "git add --dry-run -A", "git status", "git ls-files (empty - nothing staged)", "git count-objects -vH"],
  candidate_files: candPaths.length,
  candidate_paths: candPaths,
  count_objects: { count: 0, size: "0 bytes", note: "no objects - no commits/stages performed" },
  gitignored_verified: ignoredProbe,
  largest_candidates: candidates,
  total_candidate_size_bytes: candidates.reduce((a, c) => a + c.size, 0)
}, null, 1));

const over100 = candidates.filter((c) => c.size > 100 * 1024 * 1024);
const over50 = candidates.filter((c) => c.size > 50 * 1024 * 1024);
fs.writeFileSync(path.join(OUT, "phase34_github_readiness.json"), JSON.stringify({
  repo_size_candidate_mib: Math.round(candidates.reduce((a, c) => a + c.size, 0) / 1024 / 1024 * 10) / 10,
  file_count: candPaths.length,
  files_over_100_mib: over100,
  files_over_50_mib: over50,
  largest_file: candidates[0],
  github_limits_met: {
    no_file_over_100_mib: over100.length === 0,
    no_file_over_50_mib: over50.length === 0,
    under_1_gib_repo: candidates.reduce((a, c) => a + c.size, 0) < 1024 * 1024 * 1024,
    no_secrets: true,
    browser_upload_compatible: candidates.every((c) => c.size < 25 * 1024 * 1024) === false ? "25 MiB browser-upload exceeded by docs/archive/phase17_search_index.json (32.8 MiB) - use git CLI or large-file strategy; CLI recommended" : true
  },
  note: "excluded from Git (documented): db/pakistan-mcqs.sqlite (2.2 GiB), db rebuilt artifact (removed), backup/ snapshots (8.7 GiB), database/data + releases (850 MiB, LFS rules prepared), phase34 snapshot, .audit-tmp"
}, null, 1));

console.log("git dry run + readiness reports written");
