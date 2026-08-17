const { spawn } = require("child_process");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const PORT = 8766;
const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
  cwd: ROOT, env: { ...process.env, MCQS_JSON_PORT: String(PORT) }, stdio: "ignore"
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/api/health`); if (r.ok) { break; } } catch (e) {}
    await sleep(500);
  }
  const { spawnSync } = require("child_process");
  let res = null;
  try { res = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-buttons.cjs")], { cwd: ROOT, encoding: "utf8", timeout: 900000 }); } catch (e) { console.error("spawn error", e.message); }
  console.log(res ? res.stdout : "NO OUTPUT");
  if (res && res.stderr) console.error(res.stderr);
  child.kill();
  await sleep(500);
  process.exit(res && res.status === 0 ? 0 : 1);
})();
