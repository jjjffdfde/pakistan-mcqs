"use strict";
/* ============================================================
   database/scripts/decompress-db.js
   Decompress all .ndjson.gz (or .zst) files in the repo back to
   plain .ndjson. Streaming. Used for reading/diffing without a
   compression dependency. Writes decompress_report.json.
   Usage: node decompress-db.js [--keep]
   ============================================================ */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { pipeline } = require("stream/promises");
const lib = require("./lib/db-repo.js");

const KEEP = process.argv.includes("--keep");

async function gunzipFile(src, dst) { await pipeline(fs.createReadStream(src), zlib.createGunzip(), fs.createWriteStream(dst)); }

async function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { await walk(full, fn); continue; }
    await fn(full);
  }
}
async function main() {
  const t0 = Date.now();
  const report = { phase: "decompress", decompressed_at: new Date().toISOString(), files: [], totals: { in_bytes: 0, out_bytes: 0 } };
  let done = 0, skipped = 0, fromZst = 0;

  await walk(path.join(lib.REPO_ROOT, "data"), async (full) => {
    const name = path.basename(full);
    if (!name.endsWith(".ndjson.gz") && !name.endsWith(".ndjson.zst")) return;
    const dst = full.replace(/\.(gz|zst)$/, "");
    if (fs.existsSync(dst)) { skipped++; return; }
    const before = fs.statSync(full).size;
    if (name.endsWith(".zst")) {
      const { spawn } = require("child_process");
      await new Promise((resolve, reject) => {
        const child = spawn("zstd", ["-d", "-c"], { stdio: ["pipe", "pipe", "inherit"] });
        fs.createReadStream(full).pipe(child.stdin);
        child.stdout.pipe(fs.createWriteStream(dst));
        child.on("close", (code) => { child.stdout.destroy(); resolve(code); });
        child.on("error", reject);
      });
      fromZst++;
    } else {
      await gunzipFile(full, dst);
    }
    const after = fs.statSync(dst).size;
    report.files.push({ file: path.relative(lib.REPO_ROOT, full).split(path.sep).join("/"), before, after });
    report.totals.in_bytes += before; report.totals.out_bytes += after;
    if (!KEEP && name.endsWith(".gz")) fs.rmSync(full, { force: true });
    done++;
  });

  lib.writeJson(path.join(lib.REPO_ROOT, "reports", "decompress_report.json"), report);
  console.log("[decompress-db] done=" + done + " skipped(already plain)=" + skipped + " zst=" + fromZst + " (" + ((Date.now() - t0) / 1000).toFixed(1) + "s)");
}

main().catch((e) => { console.error(e); process.exit(1); });
