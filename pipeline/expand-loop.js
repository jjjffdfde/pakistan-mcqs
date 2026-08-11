#!/usr/bin/env node
/* ============================================================
   Deep Knowledge Expansion Loop
   Runs pipeline/run.js --expand repeatedly (fresh seed per
   minute) for every under-target subject until each reaches
   --per-subject or growth plateaus (0 new for N passes).
   Usage: node pipeline/expand-loop.js [--per-subject 5000]
          [--subjects a,b] [--max-passes 40] [--plateau 3]
   ============================================================ */
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");
const { open } = require("../db/engine.js");

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? (args[i + 1] || d) : d; };
const PER_SUBJECT = parseInt(get("per-subject", "5000"), 10);
const SUBJECTS = get("subjects", null);
const MAX_PASSES = parseInt(get("max-passes", "40"), 10);
const PLATEAU = parseInt(get("plateau", "3"), 10);
const ROOT = path.join(__dirname, "..");

const db = open();
const subjectIds = SUBJECTS
  ? SUBJECTS.split(",").map((s) => s.trim())
  : db.all(`SELECT DISTINCT s.id FROM subjects s
      WHERE (SELECT COUNT(*) FROM mcqs m WHERE m.subject_id=s.id AND m.status='active') < ${PER_SUBJECT}`).map((r) => r.id);
db.close();

console.log(`Expansion loop: ${subjectIds.length} subjects, target ${PER_SUBJECT}, max ${MAX_PASSES} passes`);

let prev = {};
const noGain = {};
for (const s of subjectIds) noGain[s] = 0;
const started = Date.now();

for (let pass = 1; pass <= MAX_PASSES; pass++) {
  if (Date.now() - started > 1000 * 60 * 55) { console.log("TIME BUDGET reached — stopping loop"); break; }
  const nextMinute = new Date();
  nextMinute.setSeconds(60);
  const wait = nextMinute - Date.now() + 1000;
  if (wait > 0 && wait < 61000) {
    console.log(`[pass ${pass}] waiting ${Math.ceil(wait / 1000)}s for a fresh seed minute...`);
    const { execSync } = require("child_process");
    execSync(`powershell -Command "Start-Sleep -Seconds ${Math.ceil(wait / 1000)}"`);
  }
  const r = spawnSync(process.execPath, [path.join(ROOT, "pipeline", "run.js"), "--expand", "--per-subject", String(PER_SUBJECT), "--target", "10000000", "--subjects", subjectIds.join(",")], { cwd: ROOT, encoding: "utf8", timeout: 60 * 60 * 1000 });
  if (r.status !== 0) { console.error("run.js failed:\n" + (r.stderr || r.stdout)); break; }
  const lines = (r.stdout || "").split("\n");
  const subjectLines = lines.filter((l) => l.includes("SUBJECT "));
  const db2 = open();
  let anyGain = false;
  for (const s of subjectIds) {
    const n = db2.get(`SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'`, [s]).n;
    const gain = n - (prev[s] || 0);
    if (gain > 0) { anyGain = true; noGain[s] = 0; } else noGain[s]++;
    console.log(`  ${s}: ${n} (+${gain})`);
    prev[s] = n;
  }
  db2.close();
  for (const l of subjectLines.slice(0, 3)) console.log("  " + l);
  const done = subjectIds.filter((s) => prev[s] >= PER_SUBJECT);
  const stalled = subjectIds.filter((s) => noGain[s] >= PLATEAU);
  if (done.length === subjectIds.length) { console.log("ALL SUBJECTS AT TARGET"); break; }
  if (stalled.length === subjectIds.length) { console.log(`PLATEAU after ${pass} passes (${PLATEAU} no-gain passes)`); break; }
  console.log(`[pass ${pass}] done ${done.length}/${subjectIds.length}, stalled ${stalled.length}/${subjectIds.length}${anyGain ? "" : " (no gain this pass)"}`);
}
console.log("EXPANSION LOOP FINISHED");
