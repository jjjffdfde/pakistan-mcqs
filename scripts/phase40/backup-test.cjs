/* scripts/phase40/backup-test.cjs — phase 40 backup/restore contract check. */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const BASE = "http://localhost:8768";
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
    try { const r = await fetch(BASE + "/api/health", { signal: AbortSignal.timeout(2000) }); if (r.ok) return; } catch (e) {}
    await new Promise((r2) => setTimeout(r2, 500));
  }
  throw new Error("not healthy");
}
async function main() {
  const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
    cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, MCQS_JSON_PORT: "8768" }
  });
  let logs = "";
  child.stdout.on("data", (d) => { logs += d; });
  child.stderr.on("data", (d) => { logs += d; });
  try {
    await waitHealthy(child, 60000);
    const dev = "bk-" + Date.now();
    let r = await api("POST", "/api/history", { device_id: dev, mcq_id: "1", correct: true, time_taken_sec: 5, mode: "practice" });
    check("history before backup", r.status === 201, r);
    r = await api("POST", "/api/backup");
    check("backup", r.status === 200 && r.data.ok === true && /^backup\/db-backup-/.test(r.data.dir), r);
    const dir = r.data.dir;
    check("backup dir exists", fs.existsSync(path.join(ROOT, dir, "userdata")), path.join(ROOT, dir));
    r = await api("POST", "/api/history", { device_id: dev, mcq_id: "2", correct: false, time_taken_sec: 4, mode: "practice" });
    check("history after backup", r.status === 201, r);
    r = await api("POST", "/api/restore", { dir });
    check("restore", r.status === 200 && r.data.ok === true && typeof r.data.mcqs === "number", r);
    r = await api("POST", "/api/restore", { dir: "../../windows/system32" });
    check("restore rejects traversal", r.status === 400, r);
    r = await api("POST", "/api/restore", { dir: "backup/db-backup-2099-01-01-00-00-00" });
    check("restore rejects unknown (404)", r.status === 404, r);
    console.log("\n===== BACKUP SMOKE: " + passes + " passed, " + fails + " failed =====");
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
