"use strict";
/* ============================================================
   database/scripts/compress-db.js
   Compress all .ndjson files in the repo to .ndjson.gz
   (zlib gzip level 6, streaming). Already-compressed files are
   skipped. Writes compress_report.json.
   Usage: node compress-db.js [--level <1-9>]
   ============================================================ */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const lib = require("./lib/db-repo.js");

const ARGS = process.argv.slice(2);
const li = ARGS.indexOf("--level");
const LEVEL = li > -1 ? parseInt(ARGS[li + 1], 10) : 6;

function gzipFile(src, dst, level) {
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(src);
    const ws = fs.createWriteStream(dst);
    const gz = zlib.createGzip({ level });
    rs.pipe(gz).pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });
}

async function walk(dir, fn) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { await walk(full, fn); continue; }
    await fn(full);
  }
}

async function main() {
  const t0 = Date.now();
  const report = { phase: "compress", compressed_at: new Date().toISOString(), level: LEVEL, files: [], totals: { input_bytes: 0, output_bytes: 0, saved_bytes: 0, ratio: 0 } };
  let done = 0, skipped = 0, skippedBytes = 0;

  await walk(path.join(lib.REPO_ROOT, "data"), async (full) => {
    const name = path.basename(full);
    if (name.endsWith(".gz") || name.endsWith(".zst") || !name.endsWith(".ndjson")) return;
    const dst = full + ".gz";
    if (fs.existsSync(dst)) { skipped++; skippedBytes += fs.statSync(full).size; return; }
    const before = fs.statSync(full).size;
    await gzipFile(full, dst, LEVEL);
    const after = fs.statSync(dst).size;
    fs.rmSync(full, { force: true });
    report.files.push({ file: path.relative(lib.REPO_ROOT, full).split(path.sep).join("/"), before, after });
    report.totals.input_bytes += before; report.totals.output_bytes += after;
    done++;
    console.log("[compress-db] " + name + ": " + lib.human(before) + " -> " + lib.human(after));
  });

  report.totals.saved_bytes = report.totals.input_bytes - report.totals.output_bytes;
  report.totals.ratio = report.totals.input_bytes ? +(report.totals.output_bytes / report.totals.input_bytes).toFixed(4) : 0;
  lib.writeJson(path.join(lib.REPO_ROOT, "reports", "compress_report.json"), report);
  console.log("[compress-db] done=" + done + " already-compressed=" + skipped + " saved=" + lib.human(report.totals.saved_bytes) + " ratio=" + report.totals.ratio + " (" + ((Date.now() - t0) / 1000).toFixed(1) + "s)");
}

main().catch((e) => { console.error(e); process.exit(1); });
