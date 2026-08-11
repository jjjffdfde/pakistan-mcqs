/* ============================================================
   Phase 26 - shared pure utilities (deterministic, zero-dep)
   Used by tests + phase26 tooling.
   ============================================================ */
"use strict";
const crypto = require("crypto");

function sha256hex(s) {
  return crypto.createHash("sha256").update(String(s), "utf8").digest("hex");
}

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fmtBytes(n) {
  const kb = n / 1024;
  if (kb < 1024) return `${Math.round(kb * 10) / 10} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${Math.round(mb * 10) / 10} MB`;
  return `${Math.round(mb / 1024 * 10) / 10} GB`;
}

function isIsoDate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(s) && !isNaN(Date.parse(s));
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function readJson(p, fs, path) {
  try { return JSON.parse(fs.readFileSync(path.resolve(p), "utf8")); } catch (e) { return null; }
}

module.exports = { sha256hex, slugify, fmtBytes, isIsoDate, esc, readJson };
