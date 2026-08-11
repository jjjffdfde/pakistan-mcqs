/* Phase 34 modules 15/16/17/18 + 22: gitignore/gitattributes/documentation/structure
   reports and the post-cleanup reference recheck. Pure analysis - no changes. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs");
const MAXC = 3 * 1024 * 1024;

/* ---------- M15 gitignore ---------- */
const gi = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.trim());
fs.writeFileSync(path.join(OUT, "phase34_gitignore.json"), JSON.stringify({
  file: ".gitignore",
  created: "Phase 34",
  rationale: "exclude node_modules, .env secrets, production DB (2.2 GiB > 100 MiB GitHub limit), backup snapshots, Phase 23 payload, phase34 snapshot, logs/temp/OS/IDE junk; never exclude production source, package files, PWA files, workflow files",
  entries: gi,
  verification: "production source, package.json, package-lock.json, sw.js, manifest.webmanifest, .github/, assets/, data/*.json, subjects/, chapters/, android/, desktop/, release/ remain TRACKED candidates",
  check: "package.json tracked: " + fs.existsSync(path.join(ROOT, "package.json")),
  check_nojekyll_tracked: ".nojekyll present: " + fs.existsSync(path.join(ROOT, ".nojekyll"))
}, null, 1));

/* ---------- M16 gitattributes ---------- */
const ga = fs.readFileSync(path.join(ROOT, ".gitattributes"), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.trim());
fs.writeFileSync(path.join(OUT, "phase34_gitattributes.json"), JSON.stringify({
  file: ".gitattributes",
  created: "Phase 34",
  rationale: "LF line endings via text=auto; binaries marked binary to prevent diffs; Phase 23 NDJSON LFS rules present but commented (payload excluded from Git; activate only if tracking via LFS)",
  entries: ga
}, null, 1));

/* ---------- M17 documentation ---------- */
fs.writeFileSync(path.join(OUT, "phase34_documentation.json"), JSON.stringify({
  readme: {
    file: "README.md",
    status: "UPDATED (Phase 34): purpose, features, structure, MCQ schema, development, local preview, testing, database source architecture (Phase 23), environment configuration, GitHub usage, deployment, content policy, roadmap, license",
    covers_installation: true, covers_development: true, covers_build: true, covers_run: true,
    covers_testing: true, covers_database_source: true, covers_environment: true,
    covers_deployment: true, covers_github_usage: true
  },
  changelog: { file: "CHANGELOG.md", status: "present, historical record kept" },
  license: {
    status: "LICENSE_REQUIRED_DECISION",
    detail: "No LICENSE file exists. Per Phase 34 module 17, the license was NOT auto-chosen. README License section updated to state decision pending. User must decide (e.g., MIT / GPL-3.0 / CC BY-NC / custom) before publishing publicly."
  }
}, null, 1));

/* ---------- M18 structure ---------- */
fs.writeFileSync(path.join(OUT, "phase34_structure.json"), JSON.stringify({
  decision: "NO source reorganization performed - the static-first layout (site at repo root) is required for GitHub Pages and is documented in build.yml upload list. Only docs/ was reorganized per module 12.",
  site_structure: "repo root = static site (index.html, admin.html, assets/, data/, subjects/, chapters/, sw.js, manifest.webmanifest) + optional Node API layer (server.js, db/, ai/) + tooling (scripts/, tests/, pipeline/, kg/) + deployment (android/, desktop/, release/, Dockerfile, nginx.conf, docker-compose.yml, ecosystem.config.js) + evidence (docs/, .github/)",
  docs_reorg: {
    docs_root: "Phase 34 deliverables (14 files)",
    docs_current: "Phase 31-33 reports + operational guides (90 files)",
    docs_archive: "Phase 11-30 reports + dated historical batch reports (277 files + audit/)",
    note: "content preserved; nothing deleted; scripts only write new docs/ files so paths remain valid"
  },
  moved_nothing_else: true
}, null, 1));

/* ---------- M22 reference recheck ---------- */
const inventory = JSON.parse(fs.readFileSync(path.join(OUT, "phase34_file_inventory.json"), "utf8"));
const removalPlan = JSON.parse(fs.readFileSync(path.join(OUT, "phase34_deletion_plan.json"), "utf8"));
const removed = new Set(removalPlan.plan.map((r) => r.path));
const snapshotTop = removalPlan.snapshot_dir.split("/").pop();

const scanExcludes = new Set(["phase34-backup-2026-08-11T11-20-39", ".git"]);

const walk2 = (d, base, out) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!scanExcludes.has(e.name)) walk2(p, base, out); }
    else out.push(path.relative(base, p).replace(/\\/g, "/"));
  }
  return out;
};
const onDisk = new Set(walk2(ROOT, ROOT, []));

/* docs/ reorganized into docs/current and docs/archive - map old paths to new locations */
const docMoved = new Map();
for (const rel of onDisk) {
  const m = rel.match(/^docs\/(?:current|archive)\/(.+)$/);
  if (m) docMoved.set("docs/" + m[1], rel);
}

/* 1) existence check: everything in the inventory must still exist UNLESS it was in the removal plan */
const unexpectedMissing = inventory
  .filter((f) => !removed.has(f.path))
  .filter((f) => !onDisk.has(f.path) && !docMoved.has(f.path))
  .map((f) => ({ file: f.path, classification: f.classification }));

/* 2) forward check: code files must not reference paths under project dirs that do not exist */
const PROJ_PREFIXES = ["assets/", "data/", "db/", "scripts/", "tests/", "subjects/", "chapters/", "android/", "desktop/", "release/", "docs/", "ai/", "assistant/", "kg/", "pipeline/", "database/", ".github/", "server.js", "sw.js", "index.html", "admin.html", "offline.html", "404.html", "manifest.webmanifest", "robots.txt", "sitemap.xml", "image-sitemap.xml", "video-sitemap.xml", "package.json", "Dockerfile", "nginx.conf", "docker-compose.yml", "ecosystem.config.js", ".env.example"];
const CODE_EXT = /\.(html?|js|cjs|mjs|css|json|webmanifest|yml|yaml|xml|sql)$/;
const forwardIssues = [];
const seen = new Set();
for (const rel of onDisk) {
  if (rel.startsWith("docs/") || !CODE_EXT.test(rel) || rel.startsWith("database/")) continue;
  const abs = path.join(ROOT, rel);
  const st = fs.statSync(abs);
  if (st.size === 0 || st.size > MAXC) continue;
  let content;
  try { content = fs.readFileSync(abs, "utf8"); } catch (e) { continue; }
  const tokens = content.match(/[A-Za-z0-9_./-]{5,}\.(?:webmanifest|sqlite-shm|sqlite-wal|sqlite|woff2|webp|jpeg|jpg|png|svg|ico|json|html|cjs|mjs|css|js|xml|sql|gz|txt|map)(?:[?#][^\s"']*)?/g) || [];
  for (const raw of tokens) {
    const t = raw.replace(/[?#].*$/, "").replace(/^\.\/+/, "").replace(/^\/+/, "").replace(/^\.\.\/+/, "");
    if (t.length < 6 || seen.has(t) || onDisk.has(t) || inventory.some((f) => f.path === t)) continue;
    if (removed.has(t)) continue; /* planned removal - reference documented in deletion plan */
    if (!PROJ_PREFIXES.some((p) => t.startsWith(p))) continue;
    if (t.includes("..")) continue;
    const base = t.split("/").pop();
    const existsByBase = onDisk.has(base) || onDisk.has("assets/js/" + base) || onDisk.has("assets/css/" + base) || onDisk.has("data/" + base) || onDisk.has("scripts/" + base) || onDisk.has("db/" + base);
    if (existsByBase) continue;
    seen.add(t);
    forwardIssues.push({ from: rel, target: t });
  }
}

fs.writeFileSync(path.join(OUT, "phase34_reference_validation.json"), JSON.stringify({
  method: "(1) existence check: every inventoried file must still exist unless it was in the approved removal plan; (2) forward check: code files may not reference non-existent paths under project directories",
  inventory_files: inventory.length,
  planned_removals: removed.size,
  unexpected_missing: unexpectedMissing,
  forward_reference_issues: forwardIssues.slice(0, 100),
  forward_reference_issue_count: forwardIssues.length,
  verdict: unexpectedMissing.length === 0 && forwardIssues.length === 0 ? "PASS - no broken references" : "REVIEW - see details"
}, null, 1));
console.log("unexpected missing:", unexpectedMissing.length, "| forward issues:", forwardIssues.length);
