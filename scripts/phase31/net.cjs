const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { launch } = require("E:/pAK MCQS/scripts/phase28/cdp.cjs");

const ROOT = "E:/pAK MCQS";
const OUT = path.join(ROOT, ".audit-tmp", "phase31_net_raw.json");
const PORT = 8799;

const RUNS = [
  { page: "index.html", w: 1366, h: 900, inter: 1 },
  { page: "admin.html", w: 1366, h: 900, inter: 1 },
  { page: "subjects/biology.html", w: 1366, h: 900, inter: 1 },
  { page: "offline.html", w: 1366, h: 900, inter: 0 },
  { page: "missing-page.html", w: 1366, h: 900, inter: 0 },
];

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts/phase28/server.cjs")], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
      if (out.includes("http://127.0.0.1:" + PORT)) resolve(child);
    });
    child.stderr.on("data", (d) => process.stderr.write("SRV-ERR> " + d));
    child.on("error", reject);
    setTimeout(() => reject(new Error("server start timeout:\n" + out)), 8000);
  });
}

async function runOne(r) {
  const url = `http://127.0.0.1:${PORT}/scripts/phase28/probe.html?u=${encodeURIComponent(r.page)}&w=${r.w}&h=${r.h}&inter=${r.inter}`;
  const res = await launch(url, { w: r.w, h: r.h, timeout: 90000, maxWait: 300000 });
  const out = (() => { try { return JSON.parse(res.json); } catch (e) { return null; } })();
  try { res.chrome.kill(); } catch (e) {}
  await new Promise((r2) => setTimeout(r2, 1000));
  for (let i = 0; i < 8; i++) {
    try { fs.rmSync(res.profile, { recursive: true, force: true }); break; }
    catch (e) { await new Promise((r2) => setTimeout(r2, 600)); }
  }
  return { run: r, out };
}

(async () => {
  const srv = await startServer();
  const audit = { generated: new Date().toISOString(), tool: "scripts/phase31/net.cjs", runs: [] };
  for (const r of RUNS) {
    const t0 = Date.now();
    try {
      const res = await runOne(r);
      const reqs = res.out && Array.isArray(res.out.net) ? res.out.net : [];
      const failed = reqs.filter((q) => q.status >= 400 || q.error);
      audit.runs.push({
        page: r.page, w: r.w, h: r.h, inter: !!r.inter, ms: Date.now() - t0,
        requests: reqs.length,
        failed: failed.length,
        failures: failed.slice(0, 40),
        summary: (res.out && res.out.perf) || null,
      });
      console.log(`NET ${r.page} ${r.inter ? "inter" : "static"} reqs=${reqs.length} failed=${failed.length}`);
      for (const f of failed.slice(0, 10)) console.log("  FAIL", f.status, String(f.url).slice(0, 90), String(f.error || "").slice(0, 60));
    } catch (e) {
      audit.runs.push({ page: r.page, w: r.w, h: r.h, inter: !!r.inter, error: String((e && e.message) || e) });
      console.log(`NET FAIL ${r.page}: ${String((e && e.message) || e).slice(0, 120)}`);
    }
  }
  srv.kill();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log("saved " + OUT);
  process.exit(0);
})().catch((e) => { console.error("NET-DRIVER-FATAL", e); process.exit(2); });
