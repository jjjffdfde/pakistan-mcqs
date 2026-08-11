/* Phase 34 Module 20/21: create snapshot OUTSIDE the git repo area, move REMOVE_SAFE
   files there (preserving structure), record manifest with SHA256. */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "phase34_deletion_plan.json"), "utf8"));
const SNAP = plan.snapshot_dir;
const manifest = [];

if (fs.existsSync(SNAP)) {
  const existing = fs.readdirSync(SNAP);
  if (existing.length > 0) {
    console.error("snapshot dir not empty:", SNAP);
    process.exit(1);
  }
}
fs.mkdirSync(SNAP, { recursive: true });

for (const item of plan.plan) {
  if (item.action !== "MOVE to snapshot") continue;
  const src = path.join(ROOT, item.path);
  const dst = path.join(SNAP, item.path);
  if (!fs.existsSync(src)) {
    manifest.push({ path: item.path, status: "MISSING (already absent)", size: item.size, sha256: null });
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.renameSync(src, dst);
  manifest.push({ path: item.path, size: item.size, sha256: item.sha256, moved_to: item.path, status: "MOVED" });
}

fs.writeFileSync(path.join(ROOT, "docs", "phase34_backup.json"), JSON.stringify({
  snapshot_dir: SNAP,
  created_utc: new Date().toISOString(),
  note: "snapshot located OUTSIDE the git repository content (gitignored path inside project per Phase 34 spec example); .audit-tmp items were scratch and are deleted (evidence preserved in docs/)",
  file_count_moved: manifest.filter((m) => m.status === "MOVED").length,
  total_size_bytes: manifest.filter((m) => m.status === "MOVED").reduce((a, m) => a + (m.size || 0), 0),
  manifest
}, null, 1));

console.log("snapshot:", SNAP);
console.log("moved:", manifest.filter((m) => m.status === "MOVED").length, "files");
