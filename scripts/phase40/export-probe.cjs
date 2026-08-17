/* scripts/phase40/export-probe.cjs — isolate /api/export streaming memory:
   boots server, drains the export response to a sink, prints timing + bytes
   + heap of the child at intervals. */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const PORT = 8798;
const BASE = `http://localhost:${PORT}`;

(async () => {
  const child = spawn(process.execPath, ["--max-old-space-size=384", "runtime-v2/server.cjs"], { cwd: process.cwd(), env: { ...process.env, MCQS_JSON_PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stderr.on("data", (d) => { logs += d; });
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    try { const r = await fetch(BASE + "/api/health", { signal: AbortSignal.timeout(2000) }); if (r.ok) break; } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const t1 = Date.now();
  console.log("healthy in", t1 - t0, "ms");
  const warm = process.env.EXPORT_WARM === "1";
  if (warm) {
    for (let i = 0; i < 6; i++) {
      await fetch(BASE + "/api/" + (i % 2 ? "search?q=physics&limit=5" : "random?limit=10"));
      await fetch(BASE + "/api/browse?limit=20");
    }
    console.log("cache warmed (6x browse/search/random) in", Date.now() - t1, "ms");
  }
  const res = await fetch(BASE + "/api/export?format=json");
  console.log("status", res.status);
  let bytes = 0;
  const reader = res.body.getReader();
  const sink = new (require("stream").Writable)({ write(c, _e, cb) { bytes += c.length; cb(); } });
  await new Promise((resolve, reject) => {
    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sink.write(value);
      }
      sink.end(resolve);
    })();
  });
  console.log("export done bytes=", bytes, " in", Date.now() - t1, "ms");
  console.log("child alive:", child.exitCode === null);
  child.kill();
  setTimeout(() => {
    const tail = logs.slice(-3000);
    console.log(tail.includes("out of memory") ? "SERVER OOM DETECTED" : "no server OOM in logs");
    process.exit(0);
  }, 600);
})();
