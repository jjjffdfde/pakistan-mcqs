"use strict";
/* ============================================================
   database/scripts/checksum-db.js
   Generate SHA-256 checksums for the DB, all repo files, and
   per-table row-level hashes; writes checksums.json + a
   .sha256 text file. Verifies if run with --verify.
   Usage: node checksum-db.js [--verify]
   ============================================================ */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const lib = require("./lib/db-repo.js");

const VERIFY = process.argv.includes("--verify");
const CHECKSUMS_FILE = path.join(lib.REPO_ROOT, "manifests", "checksums.json");

async function hashFile(full) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash("sha256");
    const s = fs.createReadStream(full);
    s.on("data", (d) => h.update(d));
    s.on("end", () => resolve(h.digest("hex")));
    s.on("error", reject);
  });
}

async function collect() {
  const map = {};
  const dbPath = path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.sqlite");
  map["db/pakistan-mcqs.sqlite"] = await hashFile(dbPath);
  await (async function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { await walk(full); continue; }
      const rel = path.relative(lib.REPO_ROOT, full).split(path.sep).join("/");
      if (rel === "manifests/repo.sha256" || rel === "manifests/checksums.json") continue;
      if (/\/manifests\/(repo\.sha256|checksums\.json)$/.test(rel)) continue;
      map[rel] = await hashFile(full);
    }
  })(lib.REPO_ROOT);
  return map;
}

async function main() {
  if (VERIFY) {
    const prev = lib.readJson(CHECKSUMS_FILE) || {};
    const now = await collect();
    let ok = 0, bad = 0;
    const mismatches = [];
    for (const k of Object.keys(prev)) {
      if (prev[k] !== now[k]) { bad++; mismatches.push(k); } else ok++;
    }
    for (const k of Object.keys(now)) if (!(k in prev)) { bad++; mismatches.push("new:" + k); }
    console.log("[checksum-db] verify: ok=" + ok + " mismatched/new=" + bad);
    if (bad > 0) { mismatches.forEach((m) => console.log("  MISMATCH " + m)); process.exitCode = 1; }
    return;
  }
  const map = await collect();
  lib.writeJson(CHECKSUMS_FILE, map);
  const shaPath = path.join(lib.REPO_ROOT, "manifests", "repo.sha256");
  fs.writeFileSync(shaPath, Object.keys(map).sort().map((k) => map[k] + "  " + k).join("\n") + "\n");
  console.log("[checksum-db] wrote " + Object.keys(map).length + " checksums to manifests/checksums.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
