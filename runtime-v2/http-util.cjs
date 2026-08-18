/* runtime-v2/http-util.cjs — shared HTTP helpers for the runtime API server.
   Centralizes JSON responses, CORS handling, sanitized errors, bounded body
   reading and a per-IP rate limiter so every route behaves identically in
   development and production. */
"use strict";
const { config, corsOrigins, isAllowedOrigin } = require("./config.cjs");

/* ---------- CORS ---------- */
function corsHeaders(req) {
  const origin = req.headers.origin || "";
  if (!origin) return {};
  if (!isAllowedOrigin(origin)) return {}; /* disallowed origin: no CORS headers at all */
  const allowOrigin = corsOrigins.includes("*") ? "*" : origin;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function handlePreflight(req, res) {
  res.writeHead(204, corsHeaders(req));
  res.end();
}

/* ---------- JSON responses ---------- */
function json(res, status, data, req) {
  const headers = { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(req || { headers: {} }) };
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

/* Sanitized error responses: never leak internal paths, stack traces or
   environment details to clients. In development the real message is
   returned to help local debugging; in production a generic message is
   sent and the detail is logged server-side. */
function sendError(req, res, status, message, err) {
  if (err && config.nodeEnv !== "production") message = message + ": " + (err && err.message ? err.message : "");
  json(res, status, { error: message }, req);
  if (err) console.error("[runtime-v2]", status, message, err.stack || err);
}

/* ---------- bounded JSON body reader ---------- */
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    req.on("data", (c) => {
      if (tooLarge) return;
      if (Buffer.byteLength(body) + c.length > config.bodyLimit) {
        tooLarge = true;
        body = "";
        reject(Object.assign(new Error("request body too large"), { status: 413 }));
        return;
      }
      body += c;
    });
    req.on("end", () => {
      if (tooLarge) return;
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(Object.assign(new Error("invalid JSON"), { status: 400, cause: e })); }
    });
    req.on("error", (e) => reject(e));
  });
}

/* ---------- per-IP sliding-window rate limiter (in-memory, single instance) ---------- */
const buckets = new Map(); /* ip -> {windowStart, count} */
const WINDOW_MS = 60000;

function rateLimit(ip, limitPerMin) {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now - b.windowStart >= WINDOW_MS) {
    b = { windowStart: now, count: 0 };
    buckets.set(ip, b);
  }
  b.count++;
  if (b.count > limitPerMin) return false;
  /* opportunistic cleanup so the map never grows unboundedly */
  if (buckets.size > 10000) {
    for (const [k, v] of buckets) if (now - v.windowStart >= WINDOW_MS) buckets.delete(k);
  }
  return true;
}

function clientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket.remoteAddress || "unknown";
}

module.exports = { corsHeaders, handlePreflight, json, sendError, readJson, rateLimit, clientIp };
