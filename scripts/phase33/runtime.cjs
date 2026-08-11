const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { launch } = require("E:/pAK MCQS/scripts/phase28/cdp.cjs");

const ROOT = "E:/pAK MCQS";
const OUT = path.join(ROOT, ".audit-tmp", "phase33_runtime_raw.json");
const PORT = 8799;

const RUNS = [
  { page: "index.html", w: 1366, h: 900, inter: 1 },
  { page: "admin.html", w: 1366, h: 900, inter: 1 },
  { page: "subjects/biology.html", w: 1366, h: 900, inter: 0 },
  { page: "index.html", w: 1920, h: 1080, inter: 0 },
  { page: "index.html", w: 1440, h: 900, inter: 0 },
  { page: "index.html", w: 1366, h: 768, inter: 0 },
  { page: "index.html", w: 1280, h: 720, inter: 0 },
  { page: "index.html", w: 1024, h: 768, inter: 0 },
  { page: "index.html", w: 768, h: 1024, inter: 0 },
  { page: "index.html", w: 412, h: 915, inter: 0 },
  { page: "index.html", w: 390, h: 844, inter: 0 },
  { page: "index.html", w: 375, h: 667, inter: 0 },
  { page: "index.html", w: 360, h: 640, inter: 0 },
  { page: "admin.html", w: 1024, h: 768, inter: 0 },
  { page: "admin.html", w: 768, h: 1024, inter: 0 },
  { page: "admin.html", w: 390, h: 844, inter: 0 },
  { page: "admin.html", w: 375, h: 667, inter: 0 },
  { page: "admin.html", w: 360, h: 640, inter: 0 },
  { page: "subjects/biology.html", w: 375, h: 667, inter: 0 },
  { page: "chapters/ac-basics.html", w: 390, h: 844, inter: 0 },
  { page: "offline.html", w: 375, h: 667, inter: 0 },
  { page: "missing-page.html", w: 390, h: 844, inter: 0 },
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
  const url = `http://127.0.0.1:${PORT}/scripts/phase33/probe33.html?u=${encodeURIComponent(r.page)}&w=${r.w}&h=${r.h}&inter=${r.inter ? 1 : 0}`;
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

function errCount(o) {
  if (!o || !o.errors) return -1;
  return (o.errors.console || 0) + (o.errors.window_errors || 0) + (o.errors.rejections || 0);
}

(async () => {
  const srv = await startServer();
  const audit = { generated: new Date().toISOString(), tool: "scripts/phase33/runtime.cjs", runs: [] };
  for (const r of RUNS) {
    const t0 = Date.now();
    try {
      const res = await runOne(r);
      const o = res.out || {};
      const errs = errCount(o);
      const fails = (o.interactions || []).filter((i) => i.status !== "PASS");
      audit.runs.push({
        page: r.page, w: r.w, h: r.h, inter: !!r.inter, ms: Date.now() - t0,
        errors: errs,
        fatal: o.fatal || null,
        interactions: (o.interactions || []).map((it) => it.step + ":" + it.status + (it.detail ? "::" + String(it.detail).slice(0, 120) : "")),
        interaction_failures: fails.map((f) => f.step + ":" + String(f.error || "").slice(0, 160)),
        layout: o.layout || null,
        a11y: o.a11y || null,
        perf: o.perf || null,
        cwv: o.cwv || null,
      });
      console.log(`RUN ${r.page} ${r.w}x${r.h} i${r.inter ? 1 : 0} ${((Date.now() - t0) / 1000).toFixed(1)}s errs=${errs} ovf=${o.layout ? o.layout.overflowX : "-"} fails=${fails.length}`);
      for (const f of fails.slice(0, 4)) console.log("  FAIL", f.step, String(f.error || "").slice(0, 120));
    } catch (e) {
      audit.runs.push({ page: r.page, w: r.w, h: r.h, inter: !!r.inter, error: String((e && e.message) || e) });
      console.log(`RUN FAIL ${r.page} ${r.w}x${r.h}: ${String((e && e.message) || e).slice(0, 120)}`);
    }
  }
  srv.kill();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
  console.log("saved " + OUT + " runs=" + audit.runs.length);
  process.exit(0);
})().catch((e) => { console.error("P33-DRIVER-FATAL", e); process.exit(2); });
