const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const { launch } = require("E:/pAK MCQS/scripts/phase28/cdp.cjs");

const ROOT = "E:/pAK MCQS";
const OUT = path.join(ROOT, ".audit-tmp", "phase32_cwv_raw.json");
const PORT = 8799;

const RUNS = [
  { page: "index.html", w: 1366, h: 900, inter: 1 },
  { page: "admin.html", w: 1366, h: 900, inter: 1 },
  { page: "subjects/biology.html", w: 1366, h: 900, inter: 0 },
  { page: "chapters/ac-basics.html", w: 1366, h: 900, inter: 0 },
  { page: "offline.html", w: 1366, h: 900, inter: 0 },
  { page: "missing-page.html", w: 1366, h: 900, inter: 0 },
  { page: "index.html", w: 390, h: 844, inter: 1 },
  { page: "index.html", w: 1366, h: 900, inter: 0 },
  { page: "index.html", w: 390, h: 844, inter: 0 },
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

async function runOne(r, srv) {
  const url = `http://127.0.0.1:${PORT}/scripts/phase28/probe.html?u=${encodeURIComponent(r.page)}&w=${r.w}&h=${r.h}&inter=${r.inter}`;
  const res = await launch(url, { w: r.w, h: r.h, timeout: 90000, maxWait: 300000 });
  const out = (() => { try { return JSON.parse(res.json); } catch (e) { return null; } })();
  try { res.chrome.kill(); } catch (e) {}
  await new Promise((r) => setTimeout(r, 1200));
  for (let i = 0; i < 8; i++) {
    try { fs.rmSync(res.profile, { recursive: true, force: true }); break; }
    catch (e) { await new Promise((r) => setTimeout(r, 600)); }
  }
  return { run: r, out };
}

function errCount(o) {
  if (!o || !o.errors) return -1;
  return (o.errors.console || 0) + (o.errors.window_errors || 0) + (o.errors.rejections || 0);
}

(async () => {
  const srv = await startServer();
  const results = [];
  for (const r of RUNS) {
    const t0 = Date.now();
    try {
      const res = await runOne(r, srv);
      res.ms = Date.now() - t0;
      results.push(res);
      const o = res.out || {};
      console.log(`RUN ${r.page} ${r.w}x${r.h} i${r.inter} ${((Date.now() - t0) / 1000).toFixed(1)}s errs=${errCount(o)} ovf=${o.layout ? o.layout.overflowX : "-"} fatal=${o.fatal ? o.fatal.slice(0, 60) : "none"}`);
    } catch (e) {
      results.push({ run: r, out: null, error: String((e && e.message) || e), ms: Date.now() - t0 });
      console.log(`RUN FAIL ${r.page} ${r.w}x${r.h}: ${String((e && e.message) || e).slice(0, 120)}`);
    }
  }
  srv.kill();

  const audit = { generated: new Date().toISOString(), tool: "scripts/phase32/cwv.cjs", runs: [] };
  for (const res of results) {
    const r = res.run;
    audit.runs.push({
      page: r.page, w: r.w, h: r.h, inter: !!r.inter, ms: res.ms,
      errors: res.out ? errCount(res.out) : -1,
      fatal: res.out ? (res.out.fatal || null) : String(res.error || "launch failed"),
      interactions: res.out && res.out.interactions ? res.out.interactions.length : 0,
      interaction_status: res.out && res.out.interactions
        ? res.out.interactions.map((it) => it.step + ":" + (it.status || it.result || "?"))
        : [],
      layout: res.out && res.out.layout ? res.out.layout : null,
      a11y: res.out && res.out.a11y ? res.out.a11y : null,
      perf: res.out && res.out.perf ? res.out.perf : null,
      cwv: res.out && res.out.cwv ? res.out.cwv : null,
    });
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log("saved " + OUT + " with", audit.runs.length, "runs");
  process.exit(0);
})().catch((e) => { console.error("RUNTIME-DRIVER-FATAL", e); process.exit(2); });
