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

async function runOnce(profile, page, w, h) {
  const url = `http://127.0.0.1:${PORT}/scripts/phase28/probe.html?u=${encodeURIComponent(page)}&w=${w}&h=${h}&inter=0`;
  const res = await launch(url, { w, h, profile, timeout: 90000, maxWait: 300000 });
  let out = null;
  try { out = JSON.parse(res.json); } catch (e) {}
  try { res.chrome.kill(); } catch (e) {}
  await new Promise((r) => setTimeout(r, 1500));
  return out;
}

(async () => {
  const srv = await startServer();
  fs.mkdirSync(SCRATCH, { recursive: true });
  const profile = fs.mkdtempSync(path.join(SCRATCH, "p32cache-"));
  try {
    const results = [];
    for (const page of ["index.html", "assets/css/style.css", "assets/js/app.js", "data/subjects.json"]) {
      const first = await runOnce(profile, page, 1366, 900);
      const second = await runOnce(profile, page, 1366, 900);
      results.push({
        page,
        first: first ? { bytes: first.perf.bytes, resources: first.perf.resources, ttfb: first.cwv && first.cwv.ttfb } : null,
        second: second ? { bytes: second.perf.bytes, resources: second.perf.resources, ttfb: second.cwv && second.cwv.ttfb } : null,
      });
      console.log("CACHE", page, "| 1st bytes", results[results.length - 1].first && results[results.length - 1].first.bytes, "| 2nd bytes", results[results.length - 1].second && results[results.length - 1].second.bytes);
    }
    fs.writeFileSync(path.join(ROOT, ".audit-tmp", "phase32_cache_raw.json"), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));
    console.log("saved .audit-tmp/phase32_cache_raw.json");
  } finally {
    srv.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
  process.exit(0);
})().catch((e) => { console.error("CACHE-FATAL", e); process.exit(2); });
