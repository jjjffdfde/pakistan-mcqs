const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { launch } = require("E:/pAK MCQS/scripts/phase28/cdp.cjs");

const ROOT = "E:/pAK MCQS";
const PORT = 8799;
const SCRATCH = path.join(ROOT, ".audit-tmp", "chrome-profiles");

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts/phase28/server.cjs")], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
      if (out.includes("http://127.0.0.1:" + PORT)) resolve(child);
    });
    child.stderr.on("data", () => {});
    child.on("error", reject);
    setTimeout(() => reject(new Error("server start timeout:\n" + out)), 8000);
  });
}

async function runProbe(profile, opts) {
  const url = `http://127.0.0.1:${PORT}/scripts/phase33/probe33.html?u=${encodeURIComponent(opts.page)}&w=390&h=844&inter=0&sk=${opts.skip || ""}`;
  const res = await launch(url, { w: 390, h: 844, profile, offline: !!opts.offline, timeout: 90000, maxWait: 300000 });
  let out = null;
  try { out = JSON.parse(res.json); } catch (e) {}
  try { res.chrome.kill(); } catch (e) {}
  await new Promise((r) => setTimeout(r, 1500));
  return out;
}

(async () => {
  const srv = await startServer();
  fs.mkdirSync(SCRATCH, { recursive: true });
  const profile = fs.mkdtempSync(path.join(SCRATCH, "p33pwa-"));
  try {
    const online = await runProbe(profile, { page: "index.html" });
    await new Promise((r) => setTimeout(r, 1500));
    const offline = await runProbe(profile, { page: "index.html", offline: true });
    const result = {
      generated: new Date().toISOString(),
      online: online ? { errors: (online.errors || {}), cwv: online.cwv, perf: online.perf, interactions: online.interactions.length } : null,
      offline: offline ? { errors: (offline.errors || {}), cwv: offline.cwv, perf: offline.perf, interactions: offline.interactions.length, layout: offline.layout } : null,
      offline_served: !!(offline && (offline.perf || offline.layout) && offline.errors && offline.errors.console === 0),
    };
    fs.writeFileSync(path.join(ROOT, ".audit-tmp", "phase33_pwa_raw.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ offline_served: result.offline_served, online_errors: result.online && result.online.errors.console, offline_errors: result.offline && result.offline.errors.console, offline_loaded_perf: result.offline && result.offline.perf }));
  } finally {
    srv.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
  process.exit(0);
})().catch((e) => { console.error("PWA-FATAL", e); process.exit(2); });
