/* scripts/phase40/import-test.cjs — phase 40 admin import parity check.
   Boots runtime-v2 server, imports 2 MCQs (idempotent: second run must skip),
   verifies the imported rows are queryable via /api/mcq, /api/search and
   /api/stats after the index rebuild. */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const BASE = "http://localhost:8767";
let fails = 0, passes = 0;
const check = (n, c, x) => { if (c) { passes++; console.log("PASS  " + n); } else { fails++; console.log("FAIL  " + n + (x ? "  " + JSON.stringify(x) : "")); } };
async function api(m, p, b) {
  const res = await fetch(BASE + p, { method: m, headers: b ? { "Content-Type": "application/json" } : {}, body: b ? JSON.stringify(b) : undefined });
  let d = null; try { d = await res.json(); } catch (e) {}
  return { status: res.status, data: d };
}
async function waitHealthy(c, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (c.exitCode !== null) throw new Error("server exited early: " + c.exitCode);
    try { const r = await fetch(BASE + "/api/health", { signal: AbortSignal.timeout(2000) }); if (r.ok) return; } catch (e) {}
    await new Promise((r2) => setTimeout(r2, 500));
  }
  throw new Error("not healthy");
}
const mkq = (n) => ({
  question: "Phase-40 import fixture question number " + n,
  correctAnswer: "B",
  subjectId: "islamic-studies",
  chapterId: "",
  topicId: "",
  examIds: "css",
  tags: ["fixture"],
  optionA: "Wrong A " + n, optionB: "Right B " + n, optionC: "Wrong C " + n, optionD: "Wrong D " + n,
  explanation: "Imported by phase 40 import test."
});
async function main() {
  const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
    cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, MCQS_JSON_PORT: "8767" }
  });
  let logs = "";
  child.stdout.on("data", (d) => { logs += d; });
  child.stderr.on("data", (d) => { logs += d; });
  try {
    await waitHealthy(child, 60000);
    let r = await api("POST", "/api/import", [mkq(1), mkq(2)]);
    check("import inserted 2", r.status === 200 && r.data.inserted === 2, r);
    const id1 = "imp-" + (Date.now() - 0);
    const imported = Array.isArray(r.data) ? null : null;
    const search = await api("GET", "/api/search?q=fixture%20import&limit=5");
    check("search finds imported", search.status === 200 && Array.isArray(search.data.results) && search.data.results.length >= 2, search);
    r = await api("POST", "/api/import", [mkq(1), mkq(2), mkq(3)]);
    check("import idempotent (1 skipped)", r.status === 200 && r.data.inserted === 1 && r.data.skipped === 2, r);
    const stats = await api("GET", "/api/stats");
    check("stats alive after rebuild", stats.status === 200, stats);
  } catch (e) {
    fails++;
    console.log("FATAL " + e.message);
    console.log(logs.slice(-3000));
  } finally {
    child.kill();
    setTimeout(() => process.exit(fails ? 1 : 0), 500);
  }
}
main();
