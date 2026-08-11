/* Phase 34 Module 12/18: reorganize docs into current/ and archive/ (content preserved).
   phase31-33 + guides -> docs/current/; everything else -> docs/archive/.
   Phase 34 deliverables remain in docs/ root per Phase 34 spec paths. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");

const CURRENT_RE = /^(phase31|phase32|phase33|PHASE31|PHASE32|PHASE33)/;
const GUIDE = /GUIDE\.md$/i;
const CURRENT_EXTRA = new Set(["install-2026.md", "audit-2026.md", "backup-restore-2026.md"]);

const cur = path.join(DOCS, "current");
const arc = path.join(DOCS, "archive");
fs.mkdirSync(cur, { recursive: true });
fs.mkdirSync(arc, { recursive: true });

let movedCurrent = 0, movedArchive = 0;
for (const e of fs.readdirSync(DOCS, { withFileTypes: true })) {
  const src = path.join(DOCS, e.name);
  if (e.isDirectory()) {
    if (e.name === "current" || e.name === "archive") continue;
    fs.renameSync(src, path.join(arc, e.name));
    movedArchive++;
    continue;
  }
  const target = (CURRENT_RE.test(e.name) || GUIDE.test(e.name) || CURRENT_EXTRA.has(e.name)) ? cur : arc;
  fs.renameSync(src, path.join(target, e.name));
  if (target === cur) movedCurrent++; else movedArchive++;
}
console.log("moved to current:", movedCurrent, "| moved to archive:", movedArchive);
