const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { launch } = require("E:/pAK MCQS/scripts/phase28/cdp.cjs");

const ROOT = "E:/pAK MCQS";
const PORT = 8799;

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

async function runPage(page, w, h, inter) {
  const url = `http://127.0.0.1:${PORT}/scripts/phase28/probe.html?u=${encodeURIComponent(page)}&w=${w}&h=${h}&inter=${inter}`;
  const res = await launch(url, { w, h, timeout: 90000, maxWait: 300000 });
  let out = null;
  try { out = JSON.parse(res.json); } catch (e) {}
  try { res.chrome.kill(); } catch (e) {}
  await new Promise((r2) => setTimeout(r2, 1000));
  for (let i = 0; i < 8; i++) {
    try { fs.rmSync(res.profile, { recursive: true, force: true }); break; }
    catch (e) { await new Promise((r2) => setTimeout(r2, 600)); }
  }
  return out;
}

function errCount(o) {
  if (!o || !o.errors) return -1;
  return (o.errors.console || 0) + (o.errors.window_errors || 0) + (o.errors.rejections || 0);
}

module.exports = { startServer, runPage, errCount, ROOT, PORT };
