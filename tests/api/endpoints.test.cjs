"use strict";
const assert = require("assert");
const path = require("path");
const { spawn } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

module.exports = (t) => {
  let child, base, port;
  t.test("boot API server on ephemeral port", async () => {
    port = 8800 + Math.floor(Math.random() * 400);
    base = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, ["server.js"], {
      cwd: ROOT, env: { ...process.env, MCQS_PORT: String(port) },
      stdio: "pipe"
    });
    let ok = false;
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(`${base}/api/subjects`, { signal: AbortSignal.timeout(1500) }); if (r.ok) { ok = true; break; } } catch (e) {}
      await sleep(500);
    }
    assert.ok(ok, "server did not come up within 30s");
  });

  t.test("GET /api/subjects returns array", async () => {
    const r = await fetch(`${base}/api/subjects`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    const list = Array.isArray(j) ? j : j.data;
    assert.ok(Array.isArray(list) && list.length > 100, "expected >100 subjects");
  });

  t.test("GET /api/chapters returns taxonomy", async () => {
    const r = await fetch(`${base}/api/chapters`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    const list = Array.isArray(j) ? j : j.data;
    assert.ok(Array.isArray(list) && list.length > 100, "expected >100 chapters");
  });

  t.test("GET /api/search?q= works", async () => {
    const r = await fetch(`${base}/api/search?q=pakistan&limit=3`);
    assert.ok(r.status === 200 || r.status === 404, `search status ${r.status}`);
    if (r.status === 200) {
      const j = await r.json();
      assert.ok(Array.isArray(j) || Array.isArray(j.data) || Array.isArray(j.results), "search must return list shape");
    }
  });

  t.test("unknown route returns 404", async () => {
    const r = await fetch(`${base}/api/does-not-exist-xyz`);
    assert.strictEqual(r.status, 404);
  });

  t.test("API health reports ok", async () => {
    const r = await fetch(`${base}/api/health`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    assert.strictEqual(j.ok, true);
    assert.ok(j.mcqs >= 800000, `health reported ${j.mcqs} mcqs`);
  });

  t.test("shutdown server", async () => {
    child.kill();
    await new Promise((r) => child.once("exit", r));
  });
};
