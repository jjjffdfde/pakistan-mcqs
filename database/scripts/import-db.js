"use strict";
/* ============================================================
   database/scripts/import-db.js
   Import the entire repository (schema + data) into a fresh
   SQLite database at the given path (default .rebuilt.sqlite).
   This is the deterministic "rebuild == original" path.
   Usage: node import-db.js [--out <path>]
   ============================================================ */
const path = require("path");
const { spawnSync } = require("child_process");
const lib = require("./lib/db-repo.js");

const ARGS = process.argv.slice(2);
const oi = ARGS.indexOf("--out");
const OUT = oi > -1 ? ARGS[oi + 1] : path.join(lib.PROJECT_ROOT, "db", "pakistan-mcqs.rebuilt.sqlite");
const BUILD = path.join(__dirname, "build-db.js");

async function main() {
  console.log("[import-db] building " + OUT);
  const r = spawnSync(process.execPath, [BUILD, "--out", OUT], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
  console.log("[import-db] done: build-db exited " + r.status);
}

main().catch((e) => { console.error(e); process.exit(1); });
