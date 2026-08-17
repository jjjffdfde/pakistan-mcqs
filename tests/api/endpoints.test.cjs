"use strict";
const assert = require("assert");
const path = require("path");
const { spawn } = require("child_process");
const ROOT = path.join(__dirname, "..", "..");
const L = require(path.join(ROOT, "runtime-v2", "data-loader.cjs"));

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

module.exports = (t) => {
  let child, base, port, subjectsCount;
  /* subjects.ndjson is the canonical taxonomy; the manifest may list legacy
     empty part dirs (e.g. "unassigned", 0 rows) so it is not the count source */
  const expectedMcqs = L.manifest().rows;
  const expectedActive = Object.values(L.bySubjectActive()).reduce((a, b) => a + b, 0);
  const isFixture = expectedMcqs <= 5000;
  const searchTerm = isFixture ? "question" : "pakistan";

  t.test("boot runtime-v2 API server on ephemeral port", async () => {
    subjectsCount = (await L.loadTable("subjects")).length;
    port = 8800 + Math.floor(Math.random() * 400);
    base = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
      cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: String(port) },
      stdio: "pipe"
    });
    let ok = false;
    for (let i = 0; i < 80; i++) {
      try { const r = await fetch(`${base}/api/subjects`, { signal: AbortSignal.timeout(1500) }); if (r.ok) { ok = true; break; } } catch (e) {}
      await sleep(500);
    }
    assert.ok(ok, "server did not come up within 40s");
  });

  t.test("GET /api/subjects returns all subjects with counts", async () => {
    const r = await fetch(`${base}/api/subjects`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    const list = Array.isArray(j) ? j : j.data;
    assert.ok(Array.isArray(list) && list.length === subjectsCount, `expected ${subjectsCount} subjects, got ${list.length}`);
    const zero = list.filter((s) => (s.mcqs_count || 0) === 0);
    assert.strictEqual(zero.length, 0, `subjects with 0 mcqs: ${zero.length}`);
  });

  t.test("GET /api/chapters returns taxonomy", async () => {
    const r = await fetch(`${base}/api/chapters`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    const list = Array.isArray(j) ? j : j.data;
    assert.ok(Array.isArray(list) && (list.length === 6 || list.length > 100), `chapter count ${list.length} unexpected`);
  });

  t.test("GET /api/topics returns taxonomy", async () => {
    const r = await fetch(`${base}/api/topics`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    const list = Array.isArray(j) ? j : j.data;
    assert.ok(Array.isArray(list) && list.length > 0, "topics must not be empty");
  });

  t.test("GET /api/search?q= returns matches with options", async () => {
    const r = await fetch(`${base}/api/search?q=${searchTerm}&limit=3`);
    assert.ok(r.status === 200, `search status ${r.status}`);
    const j = await r.json();
    const rows = Array.isArray(j) ? j : j.results || j.data;
    assert.ok(Array.isArray(rows) && rows.length > 0, "search must return rows");
    const first = rows[0];
    assert.ok(first.optionA !== undefined || (first.options && first.options.length > 0), "search rows must include options");
  });

  t.test("GET /api/search no-match returns total 0", async () => {
    const r = await fetch(`${base}/api/search?q=zzzzqqqqx&limit=3`);
    const j = await r.json();
    assert.strictEqual(j.total, 0);
  });

  t.test("GET /api/browse paginates deterministically", async () => {
    const r = await fetch(`${base}/api/browse?page=1&limit=10`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    assert.strictEqual(j.total, expectedActive, `browse total ${j.total} != active ${expectedActive}`);
    assert.strictEqual(j.results.length, 10);
    assert.strictEqual(j.pages, Math.ceil(expectedActive / 10));
  });

  t.test("GET /api/mcq/:id returns question + 4 options", async () => {
    const b = await (await fetch(`${base}/api/browse?page=1&limit=1`)).json();
    const id = b.results[0].id;
    const r = await fetch(`${base}/api/mcq/${id}`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    assert.ok(j.question, "question missing");
    assert.strictEqual(j.options.length, 4, "expected 4 options");
    assert.strictEqual(j.options[0].label, "A");
  });

  t.test("GET /api/random?limit=20 returns 20 rows", async () => {
    const r = await fetch(`${base}/api/random?limit=20`);
    assert.strictEqual(r.status, 200);
    const j = await r.json();
    assert.strictEqual(j.results.length, 20);
  });

  t.test("API health/stats report file-data counts", async () => {
    const h = await (await fetch(`${base}/api/health`)).json();
    assert.strictEqual(h.ok, true);
    assert.strictEqual(h.mcqs, expectedMcqs, `health mcqs ${h.mcqs} != ${expectedMcqs}`);
    const s = await (await fetch(`${base}/api/stats`)).json();
    assert.strictEqual(s.mcqs, expectedActive, "stats.mcqs must equal active count");
    assert.strictEqual(s.subjects, subjectsCount, "stats.subjects mismatch");
    assert.ok(s.options >= expectedMcqs * 4, `options ${s.options} < mcqs*4`);
  });

  t.test("quizzes / mocktests / pastpapers / categories lists", async () => {
    const q = await (await fetch(`${base}/api/quizzes`)).json();
    assert.ok(Array.isArray(q) && q.length > 0, "quizzes empty");
    const m = await (await fetch(`${base}/api/mocktests`)).json();
    assert.ok(Array.isArray(m) && m.length > 0, "mocktests empty");
    const p = await (await fetch(`${base}/api/pastpapers`)).json();
    assert.ok(Array.isArray(p) && p.length > 0, "pastpapers empty");
    const c = await (await fetch(`${base}/api/categories`)).json();
    assert.ok(Array.isArray(c) && c.length > 0, "categories empty");
    const e = await (await fetch(`${base}/api/exams`)).json();
    assert.ok(Array.isArray(e) && e.length > 0, "exams empty");
  });

  t.test("bookmarks / leaderboard user-state paths", async () => {
    const bm = await (await fetch(`${base}/api/bookmarks`)).json();
    assert.ok(Array.isArray(bm), "bookmarks must be array");
    const lb = await (await fetch(`${base}/api/leaderboard`)).json();
    assert.ok(Array.isArray(lb), "leaderboard must be array");
  });

  t.test("unknown route returns 404", async () => {
    const r = await fetch(`${base}/api/does-not-exist-xyz`);
    assert.strictEqual(r.status, 404);
  });

  t.test("shutdown server", async () => {
    child.kill();
    await new Promise((r) => child.once("exit", r));
  });
};
