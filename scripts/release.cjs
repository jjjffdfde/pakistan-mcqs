/* ============================================================
   Phase 26 - STEP 6: Release Automation (deterministic)
   - Creates release/SHA256SUMS.txt over the deployable surface
   - Writes release/version.json from CHANGELOG.md latest entry
   Usage: node scripts/release.cjs [--tag v1.2.3]
   Emits: release/version.json, release/SHA256SUMS.txt,
          docs/phase26_release.json
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ROOT = path.join(__dirname, "..");

const args = process.argv.slice(2);
const tagIdx = args.indexOf("--tag");
const tag = tagIdx >= 0 ? args[tagIdx + 1] : null;

/* latest CHANGELOG entry */
const changelog = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
const head = changelog.match(/^## \[([^\]]+)\]\s*—\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/m);
const latest = head ? { title: head[1].trim(), date: head[2], entry: changelog.split("\n").slice(0, 8).join("\n") } : null;
/* prefer explicit v-style semver tag in changelog, else deterministic date-based semver */
const semverHit = changelog.match(/verbs?((\d+)\.(\d+)\.(\d+))\b/);
const fallbackVersion = () => { const t = new Date().toISOString().slice(0, 10).replace(/-/g, ""); return `0.${t.slice(0, 4)}.${t.slice(4)}`; };

/* deployable surface = static site (no backup/db to keep durable-small) */
const INCLUDE_DIRS = ["assets", "chapters", "subjects", "data", "scripts", "db", "tests"];
const INCLUDE_FILES = new Set([
  "index.html", "admin.html", "404.html", "offline.html", "robots.txt", "sitemap.xml",
  "image-sitemap.xml", "video-sitemap.xml", "sw.js", "manifest.webmanifest",
  "server.js", "CHANGELOG.md", "README.md", "CONTRIBUTING.md",
  ".editorconfig", ".eslintrc.json", ".prettierrc", ".markdownlint.json",
  "Dockerfile", "docker-compose.yml", "nginx.conf", "ecosystem.config.js",
  ".github/workflows/build.yml", ".github/workflows/test.yml", ".github/workflows/lint.yml",
  ".github/workflows/release.yml", ".github/workflows/security.yml", ".github/workflows/database-verify.yml"
]);
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "backup", "release", "database", "docs", ".claude", "kin", "pipeline", "desktop", "android", "kg", "ai"]);

function collect() {
  const out = [];
  for (const d of INCLUDE_DIRS) {
    if (!fs.existsSync(path.join(ROOT, d))) continue;
    (function walk(dir, rel) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) { const sub = EXCLUDE_DIRS.has(e.name) ? true : false; if (!sub) walk(path.join(dir, e.name), rel ? `${rel}/${e.name}` : e.name); }
        else if (!/\.(sqlite|sqlite-wal|sqlite-shm|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|mp3|zip|gz|ndjson)$/i.test(e.name)) {
          out.push(rel ? `${rel}/${e.name}` : e.name);
        }
      }
    })(path.join(ROOT, d), d);
  }
  for (const f of INCLUDE_FILES) if (fs.existsSync(path.join(ROOT, f))) out.push(f);
  return [...new Set(out)].sort();
}
const files = collect();

/* checksums */
const lines = [];
for (const f of files) {
  const p = path.join(ROOT, f);
  let h;
  try { h = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); } catch (e) { continue; }
  lines.push(`${h}  ${f.replace(/\//g, "/")}`);
}
fs.mkdirSync(path.join(ROOT, "release"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "release", "SHA256SUMS.txt"), lines.join("\n") + (lines.length ? "\n" : ""), "utf8");

/* version metadata */
const version = tag ? tag.replace(/^v/, "") : (semverHit ? `${semverHit[2]}.${semverHit[3]}.${semverHit[4]}` : fallbackVersion());
const vmeta = {
  version,
  tag: tag ? `v${version}` : null,
  released: latest?.date || new Date().toISOString().slice(0, 10),
  latest_changelog: latest?.title || null,
  files_in_manifest: lines.length,
  node_engines: ">=18"
};
fs.writeFileSync(path.join(ROOT, "release", "version.json"), JSON.stringify(vmeta, null, 2), "utf8");

const report = {
  step: "release",
  generated_at: new Date().toISOString(),
  version: vmeta.version,
  tag: vmeta.tag,
  manifest_files: files.length,
  checksum_file: "release/SHA256SUMS.txt",
  version_file: "release/version.json",
  summary: { status: "READY" }
};
fs.writeFileSync(path.join(ROOT, "docs", "phase26_release.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`release: version=${vmeta.version} files=${files.length} -> release/SHA256SUMS.txt + version.json`);
console.log(`report -> docs/phase26_release.json`);
