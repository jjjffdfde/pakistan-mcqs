/* ============================================================
   Phase 26 - STEP 2: Format Fixer (deterministic, cosmetic only)
   Removes trailing whitespace and guarantees a single final
   newline for source/config/doc files. Does NOT touch generated
   public pages (chapters/, subjects/, data/) or backups.
   Usage: node scripts/fix-format.cjs
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "backup", ".audit-tmp", "chapters", "subjects", "data", "assets/icons", "database/data", "database/snapshots", "database/releases", "database/manifests"]);
const EXCLUDE_FILES = /\.(sqlite|sqlite-wal|sqlite-shm|png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|zip|gz|ndjson)$/i;

let fixed = 0, changed = 0;
function walk(dir, rel) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!EXCLUDE_DIRS.has(e.name)) walk(full, rel ? `${rel}/${e.name}` : e.name); continue; }
    if (EXCLUDE_FILES.test(e.name)) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    const ext = e.name.split(".").pop().toLowerCase();
    if (!["js", "cjs", "mjs", "json", "md", "yml", "yaml", "html", "css", "webmanifest", "xml", "txt", "sh", "cmd", "sql"].includes(ext)) continue;
    let src;
    try { src = fs.readFileSync(full, "utf8"); } catch (e2) { continue; }
    fixed++;
    let out = src.split("\n").map((l) => l.replace(/[ \t]+$/, "")).join("\n");
    if (!out.endsWith("\n")) out += "\n";
    if (out !== src) { fs.writeFileSync(full, out, "utf8"); changed++; }
  }
}
walk(ROOT, "");
console.log(`format-fix: scanned ${fixed} text files, fixed ${changed}`);
