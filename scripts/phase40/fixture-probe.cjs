const { spawn } = require("child_process");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const PORT = 8799;
const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
  cwd: ROOT,
  env: { ...process.env, MCQS_JSON_PORT: String(PORT), MCQS_JSON_DATA_DIR: path.join(ROOT, ".phase40-fixture", "data"), MCQS_JSON_INDEX_DIR: path.join(ROOT, ".phase40-fixture", "indexes") },
  stdio: "ignore"
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  let ok = false;
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/subjects`); if (r.ok) { ok = true; break; } } catch (e) {}
    await sleep(500);
  }
  const out = [];
  const probe = async (name, url, fn) => {
    try {
      const r = await fetch("http://127.0.0.1:" + PORT + url);
      const j = await r.json();
      const pass = fn(j, r.status);
      out.push(`${pass ? "PASS" : "FAIL"}  ${name}  status=${r.status}`);
    } catch (e) { out.push("FAIL  " + name + "  " + e.message); }
  };
  await probe("subjects", "/api/subjects", (j) => Array.isArray(j) && j.length === 3 && j[0].mcqs_count > 0);
  await probe("chapters", "/api/chapters", (j) => Array.isArray(j) && j.length === 6);
  await probe("topics", "/api/topics", (j) => Array.isArray(j) && j.length === 12);
  await probe("health", "/api/health", (j) => j.ok === true && j.mcqs === 100);
  await probe("stats", "/api/stats", (j) => j.mcqs === 100 && j.subjects === 3 && j.chapters === 6 && j.topics === 12 && j.options === 400);
  await probe("search", "/api/search?q=question&limit=10", (j) => j.total > 0 && j.results.length > 0);
  await probe("browse", "/api/browse?page=1&limit=10", (j) => j.results.length === 10 && j.total === 100 && j.pages === 10);
  await probe("browse-diff", "/api/browse?difficulty=hard&limit=10", (j) => j.total === 33);
  await probe("browse-topic", "/api/browse?topic=ph-ch1-t1&limit=5", (j) => j.results.length > 0);
  await probe("mcq-by-id", "/api/mcq/physics-001", (j) => j.question && j.options && j.options.length === 4 && j.options[0].label === "A");
  await probe("random20", "/api/random?limit=20", (j) => j.results.length === 20);
  await probe("quizzes", "/api/quizzes", (j) => Array.isArray(j) && j.length === 2);
  await probe("mocktests", "/api/mocktests", (j) => Array.isArray(j) && j.length === 1);
  await probe("pastpapers", "/api/pastpapers", (j) => Array.isArray(j) && j.length === 3);
  await probe("categories", "/api/categories", (j) => Array.isArray(j) && j.length === 1);
  await probe("404", "/api/does-not-exist", (j, s) => s === 404);
  console.log(out.join("\n"));
  child.kill();
  await sleep(500);
  process.exit(out.every((l) => l.startsWith("PASS")) ? 0 : 1);
})();
