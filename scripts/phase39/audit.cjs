"use strict";
/* Phase 39 audit collector: inventory, sizes, git state. Emits raw facts JSON. */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(__dirname, "audit-facts.json");

function git(args) {
  try { return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 2e8 }).split(/\r?\n/).filter(Boolean); }
  catch (e) { return []; }
}

const tracked = git(["ls-files"]);
const untrackedNI = git(["ls-files", "--others", "--exclude-standard"]);
const ignored = git(["ls-files", "--others", "-i", "--exclude-standard"]);

const sizes = {}; /* rel -> bytes */
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else { const s = fs.statSync(p); sizes[path.relative(ROOT, p).replace(/\\/g, "/")] = s.size; }
  }
}
walk(ROOT);

const CATS = [
  ["^runtime-v2/", "runtime_ndjson"], ["^database/(data|releases|snapshots)/", "database_data"],
  ["^database/", "database_tooling"], ["^db/", "database_core"], ["^scripts/", "scripts"],
  ["^tests/", "tests"], ["^docs/", "docs"], ["^public/", "public_pwa"], ["^assets/", "assets"],
  ["^data/", "data"], ["^\\.github/", "ci_cd"], ["^desktop/", "desktop"],
  ["^(subjects|chapters|topics|categories|exams|quizzes|mocktests|pastpapers)/", "seo_pages"],
  ["^ai/", "ai"], ["^(pipeline|assistant)/", "pipeline_assistant"]
];
const catOf = (rel) => { for (const [re, c] of CATS) if (new RegExp(re).test(rel)) return c; return "root_or_other"; };
const cats = {};
for (const rel of Object.keys(sizes)) {
  const c = catOf(rel);
  cats[c] = cats[c] || { files: 0, bytes: 0 };
  cats[c].files++; cats[c].bytes += sizes[rel];
}

const report = {
  generated_at: new Date().toISOString(),
  totals: {
    all_files: Object.keys(sizes).length, all_bytes: Object.values(sizes).reduce((a, b) => a + b, 0),
    tracked: tracked.length, untracked_not_ignored: untrackedNI.length, ignored: ignored.length
  },
  categories: cats,
  tracked_flags: {
    over_25mib: [], over_50mib: [], over_90mib: [], over_100mib: []
  },
  untracked_flags: { over_25mib: [] },
  biggest_tracked: [],
  biggest_untracked: [],
  biggest_overall: []
};
for (const rel of tracked) {
  const b = sizes[rel] || 0;
  if (b > 1048576 * 25) report.tracked_flags.over_25mib.push([rel, b]);
  if (b > 1048576 * 50) report.tracked_flags.over_50mib.push([rel, b]);
  if (b > 1048576 * 90) report.tracked_flags.over_90mib.push([rel, b]);
  if (b > 1048576 * 100) report.tracked_flags.over_100mib.push([rel, b]);
}
for (const rel of untrackedNI) {
  const b = sizes[rel] || 0;
  if (b > 1048576 * 25) report.untracked_flags.over_25mib.push([rel, b]);
}
report.biggest_tracked = tracked.map((r) => [r, sizes[r] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 15);
report.biggest_untracked = untrackedNI.map((r) => [r, sizes[r] || 0]).sort((a, b) => b[1] - a[1]).slice(0, 15);
report.biggest_overall = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 15);
report.git = {
  count_objects: git(["count-objects", "-vH"]),
  branch: git(["rev-parse", "--abbrev-ref", "HEAD"]),
  last_commit: git(["log", "-1", "--format=%H %s"]),
  remotes: git(["remote", "-v"])
};
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
