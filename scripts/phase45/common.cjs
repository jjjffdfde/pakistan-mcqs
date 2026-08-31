/* scripts/phase45/common.cjs — shared Phase 45 helpers */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { StringDecoder } = require("string_decoder");
const { ROOT, normalizeText, mkdirp, atomicWrite, nowUtc } = require("../phase42/lib.cjs");

const CONTENT_DIR = path.join(ROOT, "data", "pdf-content");
const IDX_DIR = path.join(ROOT, "runtime-v2", "indexes");
const CONTENT_IDX_DIR = path.join(IDX_DIR, "content");
const SRC_DIR = path.join(ROOT, "database", "data");

mkdirp(CONTENT_IDX_DIR);

/* ---------- streaming gz line reader ---------- */
function streamGzLines(file, onLine) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(file)) return resolve(0);
    const src = fs.createReadStream(file);
    const gz = zlib.createGunzip();
    const dec = new StringDecoder("utf8");
    let pending = "", count = 0;
    gz.on("data", (chunk) => {
      pending += dec.write(chunk);
      let i;
      while ((i = pending.indexOf("\n")) !== -1) {
        const line = pending.slice(0, i); pending = pending.slice(i + 1);
        if (!line.trim()) continue;
        count++;
        try { onLine(JSON.parse(line), count); } catch {}
      }
    });
    gz.on("end", () => { pending += dec.end(); resolve(count); });
    gz.on("error", (e) => { if (count === 0) resolve(0); else reject(e); });
    src.pipe(gz);
  });
}

/* ---------- content hashing ---------- */
function contentHash(text) {
  return crypto.createHash("sha256")
    .update(normalizeText(String(text)).toLowerCase().replace(/\s+/g, " "))
    .digest("hex");
}

/* ---------- tokenize for content search (>=3 chars, unicode-aware) ---------- */
function tokenize(text) {
  const out = new Set();
  if (!text) return [];
  for (const m of String(text).toLowerCase().matchAll(/[\p{L}\p{N}]+/gu)) {
    if (m[0].length >= 3) out.add(m[0]);
  }
  return [...out];
}

module.exports = {
  ROOT, CONTENT_DIR, IDX_DIR, CONTENT_IDX_DIR, SRC_DIR,
  mkdirp, atomicWrite, nowUtc, normalizeText,
  streamGzLines, contentHash, tokenize
};