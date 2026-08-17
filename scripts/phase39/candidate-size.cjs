"use strict";
const { execFileSync } = require("child_process");
const fs = require("fs");
const ROOT = process.cwd();
const adds = execFileSync("git", ["add", "--dry-run", "."], { cwd: ROOT, encoding: "utf8", maxBuffer: 1e8 })
  .split(/\r?\n/).filter((l) => l.startsWith("add '")).map((l) => l.slice(5, -1));
const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1e8 }).split(/\r?\n/).filter(Boolean);
let tSize = 0, aSize = 0;
for (const f of tracked) { try { tSize += fs.statSync(f).size; } catch (e) {} }
for (const f of adds) { try { aSize += fs.statSync(f).size; } catch (e) {} }
const out = { tracked: tracked.length, addable: adds.length, candidate_files: tracked.length + adds.length, tracked_bytes: tSize, addable_bytes: aSize, candidate_bytes: tSize + aSize };
fs.writeFileSync("scripts/phase39/candidate-size.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
