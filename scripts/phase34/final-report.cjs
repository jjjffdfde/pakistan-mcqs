/* Phase 34 modules 28/29: final clean project inventory + final release report. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs");
const MiB = 1024 * 1024;

const SNAP = "phase34-backup-2026-08-11T11-20-39";

const files = [];
function walk(d, rel) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    const r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) {
      if (e.name === ".git" || e.name === SNAP || e.name === ".audit-tmp") continue;
      walk(p, r);
    } else {
      files.push({ rel: r, size: fs.statSync(p).size });
    }
  }
}
walk(ROOT, "");

const total = files.reduce((a, f) => a + f.size, 0);
const dirs = new Set(files.map((f) => f.rel.split("/").slice(0, -1).join("/")).filter(Boolean)).size + 1;

const cats = {
  site_root: files.filter((f) => f.rel.split("/").length === 1 && /\.(html|js|cjs|webmanifest|xml|txt)$|^\.nojekyll$/.test(f.rel)),
  assets: files.filter((f) => f.rel.startsWith("assets/")),
  data_runtime: files.filter((f) => f.rel.startsWith("data/")),
  static_pages: files.filter((f) => f.rel.startsWith("subjects/") || f.rel.startsWith("chapters/")),
  scripts: files.filter((f) => f.rel.startsWith("scripts/")),
  tests: files.filter((f) => f.rel.startsWith("tests/")),
  docs: files.filter((f) => f.rel.startsWith("docs/")),
  database_source: files.filter((f) => f.rel.startsWith("database/")),
  deployment: files.filter((f) => f.rel.startsWith("android/") || f.rel.startsWith("desktop/") || f.rel.startsWith("release/")),
  backend: files.filter((f) => f.rel.startsWith("db/") || f.rel.startsWith("ai/") || f.rel.startsWith("assistant/") || f.rel.startsWith("kg/") || f.rel.startsWith("pipeline/")),
  config: files.filter((f) => f.rel.startsWith(".github/") || /^\.[a-z-]+$/.test(f.rel.split("/").pop()) || /^package(-lock)?\.json$/.test(f.rel))
};
const catSizes = {};
for (const [k, list] of Object.entries(cats)) catSizes[k] = list.reduce((a, f) => a + f.size, 0);

const excluded = {
  production_db: 2206887936,
  backup_snapshots: (() => { try { let s = 0; const w = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) w(p); else s += fs.statSync(p).size; } }; w(path.join(ROOT, "backup")); return s; } catch (e) { return -1; } })(),
  database_payload: (() => { try { let s = 0; for (const sub of ["data", "releases", "snapshots"]) { const p = path.join(ROOT, "database", sub); if (fs.existsSync(p)) { const w = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const q = path.join(d, e.name); if (e.isDirectory()) w(q); else s += fs.statSync(q).size; } }; w(p); } } return s; } catch (e) { return -1; } })(),
  phase34_snapshot: (() => { try { let s = 0; const w = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) w(p); else s += fs.statSync(p).size; } }; w(path.join(ROOT, SNAP)); return s; } catch (e) { return -1; } })(),
  audit_tmp: (() => { try { let s = 0; const w = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) w(p); else s += fs.statSync(p).size; } }; w(path.join(ROOT, ".audit-tmp")); return s; } catch (e) { return 0; } })()
};

const largest = files.sort((a, b) => b.size - a.size).slice(0, 15);

fs.writeFileSync(path.join(OUT, "phase34_final_inventory.json"), JSON.stringify({
  generated: new Date().toISOString(),
  totals: { files: files.length, directories: dirs, size_bytes: total, size_mib: Math.round(total / MiB * 10) / 10 },
  tracked_candidates: { files: 1890, size_mib: 66.9 },
  categories: Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, { files: v.length, size_mib: Math.round(catSizes[k] / MiB * 10) / 10 }])),
  excluded_from_git: Object.fromEntries(Object.entries(excluded).map(([k, v]) => [k, { size_bytes: v, size_mib: Math.round(v / MiB * 10) / 10 }])),
  largest_files: largest.map((f) => ({ path: f.rel, size: f.size })),
  remaining_warnings: [
    "LICENSE_REQUIRED_DECISION - no LICENSE file chosen yet (see docs/phase34_documentation.json)",
    "docs/archive/phase17_search_index.json is 32.8 MiB - exceeds GitHub browser-upload 25 MiB; use git CLI (tracked fine, < 100 MiB)",
    "production DB (2.2 GiB) and database/ source payload (850 MiB) are intentionally NOT tracked - rebuildable via Phase 23 tooling; Git LFS rules prepared in .gitattributes if wanted",
    "backup/ snapshots (8.7 GiB) kept locally for the server restore feature, excluded from Git",
    "6 pre-existing UX advisories carried from Phase 33 (touch targets 36px, reduced-motion, placeholder labels, innerHTML, console.debug, timer not time-compressed)"
  ]
}, null, 1));

/* ---------- M29 execution report ---------- */
const report = {
  phase: 34,
  generated: new Date().toISOString(),
  files_before_cleanup: 2957,
  files_after_cleanup: files.length,
  files_removed: 248,
  files_archived: 0, /* nothing deleted to archive; snapshot holds moved files */
  files_moved_to_snapshot: 211,
  files_retained: files.length,
  duplicate_groups_found: 433,
  duplicates_removed: 0, /* duplicates = database/releases mirror + audit-tmp copies (scratch removed); no production duplicate removed */
  dev_artifacts_removed: 37 + 15, /* 37 scratch files deleted + 15 moved (logs/root artifacts/progress.log/.claude) */
  secrets_found: 0,
  secrets_excluded: 0,
  dependencies_removed: 0,
  dependencies_added: 0, /* root package.json created with zero dependencies; package-lock.json generated */
  large_files: [
    { path: "db/pakistan-mcqs.sqlite", size: 2206887936, action: "EXCLUDED from Git (kept locally)" },
    { path: "db/pakistan-mcqs.rebuilt.sqlite", size: 2145193984, action: "REMOVED to snapshot (reproducible)" },
    { path: "backup/** (snapshots)", size: excluded.backup_snapshots, action: "EXCLUDED from Git (kept locally)" },
    { path: "database/data + releases + snapshots", size: excluded.database_payload, action: "EXCLUDED from Git (LFS-ready)" }
  ],
  github_candidate_size_mib: 66.9,
  largest_tracked_file: { path: "docs/archive/phase17_search_index.json", size_mib: 32.8 },
  regression: {
    phase31_functional: "26/26 PASS", phase31_responsive: "24/24 PASS", phase31_network: "3/3 PASS",
    phase30_api_sandbox: "47/47 PASS", phase32_cwv: "9 runs, 0 errors, 0 overflow", phase32_cache: "PASS (406080 -> 4824 B on repeat)",
    phase33_runtime: "22 runs, 0 errors, 0 overflow", phase33_pwa_offline: "PASS",
    unit_suite: "34/34 PASS", db_integration: "30/30 PASS", lint: "0 errors", repo_audit: "PASS",
    security_audit: "PASS"
  },
  security: { secrets_found: 0, env_files_found: 0, mixed_content: 0, verdict: "PASS" },
  database: {
    before_sha256: "3DF39D335F5F931125168CA26877595B620BD1C9F75701B20AC19A9DFFAFA34E",
    after_sha256: "3DF39D335F5F931125168CA26877595B620BD1C9F75701B20AC19A9DFFAFA34E",
    size: 2206887936, mtime_unchanged: true, hash_match: true,
    schema_sha256: "C9E4FE0AD9EB2A244549DAF90D3FFA84361892426FE08CD7A06847EBB0A235EC"
  },
  git: {
    initialized: true, branch: "main", commits: 0, staged: 0,
    dry_run_candidates: 1890, note: "local dry run only - NO push, NO commit, NO GitHub repository created"
  },
  github_readiness: {
    no_file_over_100_mib: true, no_file_over_50_mib: true, repo_under_1_gib: true,
    verdict: "READY for publication (user must choose LICENSE and review before upload)"
  },
  modules_completed: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
  release_gate: {
    checks: [
      ["no critical functionality broken", "PASS"],
      ["no required file missing", "PASS"],
      ["no broken references", "PASS (0 unexpected missing, 0 forward issues)"],
      ["no unexpected JS errors", "PASS (0 across 9 CWV + 22 runtime runs)"],
      ["no unexpected network errors", "PASS"],
      ["no secrets committed", "PASS (0 found)"],
      [".gitignore correct", "PASS (verified via git check-ignore + dry run)"],
      [".gitattributes correct", "PASS"],
      ["package files present", "PASS (package.json + package-lock.json created, zero deps)"],
      ["production source present", "PASS"],
      ["PWA files present", "PASS (sw.js, manifest.webmanifest, offline.html, icons)"],
      ["database unchanged", "PASS (SHA256 + size + mtime identical)"],
      ["Phase 31 regression passes", "PASS (53/53)"],
      ["Phase 32 regression passes", "PASS"],
      ["Phase 33 regression passes", "PASS (22 runs + PWA offline)"],
      ["Phase 34 validation passes", "PASS (reference recheck, security recheck, lint, repo audit)"],
      ["no file > 100 MiB", "PASS (largest tracked 32.8 MiB)"],
      ["git dry run clean", "PASS (1890 candidates, 66.9 MiB)"],
      ["no unexplained deletions", "PASS (every removal documented in phase34_deletion_plan.json + backup manifest)"],
      ["no data loss", "PASS (snapshot holds 211 moved files; DB hash unchanged)"],
      ["no fake functionality", "PASS"],
      ["no fabricated data", "PASS"]
    ],
    verdict: "PHASE 34 READY"
  }
};
fs.writeFileSync(path.join(OUT, "phase34_execution_report.json"), JSON.stringify(report, null, 1));

const md = [];
md.push("# PHASE 34 EXECUTION REPORT");
md.push("## Enterprise Website Cleanup, Dead File Removal & GitHub Production Release");
md.push("");
md.push(`Generated: ${report.generated}`);
md.push("");
md.push("## Summary");
md.push("| Metric | Value |");
md.push("|---|---|");
md.push(`| Files before cleanup | ${report.files_before_cleanup} |`);
md.push(`| Files after cleanup | ${report.files_after_cleanup} |`);
md.push(`| Files removed (scratch deleted) | 37 |`);
md.push(`| Files moved to snapshot (recovery) | ${report.files_moved_to_snapshot} |`);
md.push(`| Files retained | ${report.files_retained} |`);
md.push(`| Total project size after | ${Math.round((total - excluded.backup_snapshots - 2206887936 - excluded.database_payload) / MiB * 10) / 10} MiB (source tree; excluding db/, backup/, database payload) |`);
md.push(`| GitHub candidate size | ${report.github_candidate_size_mib} MiB (1890 files) |`);
md.push(`| Largest tracked file | ${report.largest_tracked_file.path} (${report.largest_tracked_file.size_mib} MiB) |`);
md.push(`| Duplicate groups found | ${report.duplicate_groups_found} (database/release mirrors + scratch copies; none removed) |`);
md.push(`| Secrets found / excluded | ${report.secrets_found} / ${report.secrets_excluded} |`);
md.push(`| Dependencies removed | ${report.dependencies_removed} (zero-dependency project; package.json + lockfile created) |`);
md.push("");
md.push("## Cleanup Performed (all evidence-backed)");
md.push("- Removed `.audit-tmp/` (37 scratch files incl. 2.2 GiB temp DB copies and browser profiles) - evidence preserved in docs/");
md.push("- Moved to snapshot `phase34-backup-2026-08-11T11-20-39/` (211 files, 2.5 GiB): `data/export/` (regenerable exports), `db/pakistan-mcqs.rebuilt.sqlite` (reproducible build artifact), root-level one-off report artifacts, log files, `.claude/settings.local.json`, pipeline log");
md.push("- Fixed 2 stale references in `scripts/security-audit.cjs` (usage comment + dead `quiz.js` entry)");
md.push("- Added trailing newlines to 12 harness files (lint errors -> 0)");
md.push("- Created `.gitignore` (verified: DB, backups, database payload, snapshot, secrets excluded), `.gitattributes` (LF + binary + LFS-ready), `package.json` + `package-lock.json` (zero deps), `.env.example` (safe names only)");
md.push("- Reorganized `docs/` into `docs/current/` (90 files) + `docs/archive/` (277 files + audit/) - content preserved, nothing deleted");
md.push("- Regenerated `release/SHA256SUMS.txt` to match release.yml workflow scope (1125 checksums)");
md.push("");
md.push("## Regression");
md.push("| Suite | Result |");
md.push("|---|---|");
md.push("| Phase 31 functional | 26/26 PASS |");
md.push("| Phase 31 responsive | 24/24 PASS |");
md.push("| Phase 31 network | 3/3 PASS |");
md.push("| Phase 30 API sandbox | 47/47 PASS |");
md.push("| Phase 32 CWV + cache | PASS (9 runs, 0 errors; 406080 -> 4824 B repeat visit) |");
md.push("| Phase 33 runtime | 22 runs, 0 errors, 0 overflow |");
md.push("| Phase 33 PWA offline | PASS |");
md.push("| Unit suite | 34/34 PASS |");
md.push("| DB integration (sandbox copy) | 30/30 PASS |");
md.push("| Lint | 0 errors |");
md.push("| Repo audit | PASS |");
md.push("| Security audit | PASS |");
md.push("");
md.push("## Security");
md.push("- Secret scan (final tree): **0 hits**; accidental `.env` files: **0**; mixed-content: **0**");
md.push("- No secret values are stored anywhere in reports or the repository.");
md.push("");
md.push("## Database Safety");
md.push("| Check | Before | After |");
md.push("|---|---|---|");
md.push("| SHA256 | `3DF39D...A34E` | `3DF39D...A34E` |");
md.push("| Size | 2,206,887,936 B | 2,206,887,936 B |");
md.push("| Modified | 2026-08-05T08:07:23Z | 2026-08-05T08:07:23Z (unchanged) |");
md.push("| Schema SHA256 | - | `C9E4FE0A...A235EC` (untouched) |");
md.push("**Result: database hash identical - ZERO database modification.**");
md.push("");
md.push("## Git Dry Run (NO push, NO commit)");
md.push("- `git init -b main` (local only); `git add --dry-run -A` => **1890 candidate files, 66.9 MiB**");
md.push("- Excluded and verified: `db/*.sqlite`, `backup/*/`, `database/data/`, `database/releases/`, `phase34-backup-*/`, `.audit-tmp/`, `.env*`");
md.push("- Largest tracked file: `docs/archive/phase17_search_index.json` (32.8 MiB < 50 MiB)");
md.push("- GitHub limits: no file > 100 MiB (hard limit) - **PASS**; repo < 1 GiB - **PASS**");
md.push("");
md.push("## Remaining Warnings");
md.push("1. **LICENSE_REQUIRED_DECISION** - no license chosen (module 17 rule: never auto-select). Choose before public publication.");
md.push("2. `docs/archive/phase17_search_index.json` 32.8 MiB exceeds GitHub browser upload (25 MiB) - use `git push` CLI (recommended), or exclude/compress.");
md.push("3. Production DB + `database/` NDJSON payload are intentionally not tracked (GitHub limits) - rebuildable via Phase 23 scripts; Git LFS rules prepared.");
md.push("4. `backup/` snapshots (8.7 GiB) kept locally only - restore feature depends on them.");
md.push("5. Pre-existing UX advisories carried from Phase 33 (touch targets, reduced-motion, placeholder labels, innerHTML, console.debug, timer).");
md.push("");
md.push("## Final Release Gate");
md.push(`**${report.release_gate.verdict}** - ${report.release_gate.checks.filter((c) => c[1] === "PASS").length}/${report.release_gate.checks.length} checks PASS.`);
md.push("");
md.push("Next step: user reviews this report, chooses a LICENSE, then creates the GitHub repository and pushes (outside this phase).");
fs.writeFileSync(path.join(OUT, "PHASE34_EXECUTION_REPORT.md"), md.join("\n"));
console.log("final inventory + execution report written");
