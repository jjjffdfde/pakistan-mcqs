// Quick driver: run a single case with full interaction, print results
const path = require("path");
const os = require("os");
const fs = require("fs");
const { spawn } = require("child_process");
const { launch } = require("E:/pAK MCQS/scripts/phase28/cdp.cjs");

const CASE = process.argv[2] || "admin.html";
const W = process.argv[3] || "1366";
const H = process.argv[4] || "900";
const INTER = process.argv[5] === "0" ? "" : "1";
const EXTRA = process.argv[6] || "";
const PORT = 8799;

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["E:/pAK MCQS/scripts/phase28/server.cjs"], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
      console.log("SRV>", d.toString().trim());
      if (out.includes("http://127.0.0.1:" + PORT)) resolve(child);
    });
    child.stderr.on("data", (d) => console.log("SRV-ERR>", d.toString().trim()));
    child.on("error", reject);
    setTimeout(() => reject(new Error("server start timeout:\n" + out)), 8000);
  });
}

(async () => {
  const srv = await startServer();
  const url = `http://127.0.0.1:${PORT}/scripts/phase28/probe.html?u=${encodeURIComponent(CASE)}&w=${W}&h=${H}&inter=${INTER}&${EXTRA}`;
  const res = await launch(url, { w: W, h: H, timeout: 120000, maxWait: 320000, onTitle: (t) => console.log("TITLE>", t), onCrash: (m, p) => console.log("CRASH-EVENT>", m, JSON.stringify(p || {}).slice(0, 300)) });
  const json = { elapsed: 0, fatal: null, out: null };
  json.out = (() => { try { return JSON.parse(res.json); } catch (e) { return null; } })();
  json.elapsed = (json.out && json.out.elapsed) || "?";
  console.log("url:", url);
  console.log("elapsed:", json.elapsed, "s");
  console.log("fatal:", json.fatal || "none");
  console.log("errors:", JSON.stringify(json.out ? json.out.errors : null));
  const f = path.join("E:/pAK MCQS/.audit-tmp", "p28-last-" + CASE.replace(/[^a-z0-9]/gi, "_") + ".json");
  fs.mkdirSync("E:/pAK MCQS/.audit-tmp", { recursive: true });
  fs.writeFileSync(f, JSON.stringify(json, null, 2));
  console.log("saved:", f);
  if (json.out && json.out.interactions) {
    for (const it of json.out.interactions) console.log("  ", it.name + ":", it.result || it.error || "-");
  }
  try { if (res && res.chrome) res.chrome.kill(); } catch (e) {}
  try { await new Promise((r) => setTimeout(r, 1200)); for (let i = 0; i < 8; i++) { try { fs.rmSync(res.profile, { recursive: true, force: true }); break; } catch (e) { await new Promise((r) => setTimeout(r, 600)); } } } catch (e) {}
  srv.kill();
  process.exit(json.fatal ? 1 : 0);
})().catch((e) => { console.error("DRIVER-ERR", e); process.exit(2); });
