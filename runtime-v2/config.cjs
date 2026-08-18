/* runtime-v2/config.cjs — central runtime configuration.
   Everything the server needs comes from environment variables with
   local-development defaults. No secrets are hard-coded here and nothing
   in this file is ever sent to clients.

   Env vars (documented in .env.example and docs/runtime-deployment.md):
     PORT | MCQS_JSON_PORT       listen port (default 8766)
     HOST | MCQS_JSON_HOST       listen host (default 127.0.0.1; 0.0.0.0 when NODE_ENV=production)
     NODE_ENV                    development | production (default development)
     DATABASE_PATH | MCQS_JSON_DATA_DIR   NDJSON payload dir (default <root>/database/data)
     MCQS_JSON_INDEX_DIR         built indexes dir (default <root>/runtime-v2/indexes)
     MCQS_JSON_USER_DIR          writable user data dir (default <root>/runtime-v2/userdata)
     CORS_ORIGIN                 comma-separated allowed origins ("*" only if explicitly set)
     MCQS_ADMIN_TOKEN            Bearer token required for admin routes (import/backup/restore/export)
     MCQS_BODY_LIMIT             max JSON request body bytes (default 2097152)
     MCQS_API_RATE_LIMIT         requests per minute per IP for the whole API (default 600)
     MCQS_AI_RATE_LIMIT          requests per minute per IP for /api/ai/* (default 120)
     AI_PROVIDER                 optional external AI provider name (e.g. "openai-compatible")
     AI_API_URL                  provider base URL (backend only; never sent to browsers)
     AI_API_KEY                  provider key (backend only; never sent to browsers)
     AI_TIMEOUT_MS               provider call timeout (default 30000)
     AI_MAX_RETRIES              provider retries (default 1; no infinite loops)
   */
"use strict";
const path = require("path");

const ROOT = path.join(__dirname, "..");
const pkg = require(path.join(ROOT, "package.json"));

function int(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

const NODE_ENV = String(process.env.NODE_ENV || "development");
const isProduction = NODE_ENV === "production";

const config = {
  version: pkg.version,
  nodeEnv: NODE_ENV,
  isProduction,
  port: int(process.env.PORT, int(process.env.MCQS_JSON_PORT, 8766)),
  host: String(process.env.HOST || process.env.MCQS_JSON_HOST || (isProduction ? "0.0.0.0" : "127.0.0.1")),
  dataDir: String(process.env.DATABASE_PATH || process.env.MCQS_JSON_DATA_DIR || path.join(ROOT, "database", "data")),
  indexDir: String(process.env.MCQS_JSON_INDEX_DIR || path.join(ROOT, "runtime-v2", "indexes")),
  userDir: String(process.env.MCQS_JSON_USER_DIR || path.join(ROOT, "runtime-v2", "userdata")),
  bodyLimit: int(process.env.MCQS_BODY_LIMIT, 2 * 1024 * 1024),
  adminToken: String(process.env.MCQS_ADMIN_TOKEN || ""),
  apiRateLimit: int(process.env.MCQS_API_RATE_LIMIT, 600),
  aiRateLimit: int(process.env.MCQS_AI_RATE_LIMIT, 120),
  ai: {
    provider: String(process.env.AI_PROVIDER || "").trim() || null,
    apiUrl: String(process.env.AI_API_URL || "").trim(),
    apiKey: String(process.env.AI_API_KEY || "").trim(),
    timeoutMs: int(process.env.AI_TIMEOUT_MS, 30000),
    maxRetries: Math.min(3, int(process.env.AI_MAX_RETRIES, 1))
  }
};

/* Allowed CORS origins. "Access-Control-Allow-Origin: *" is used ONLY when
   CORS_ORIGIN="*" is set explicitly; otherwise origins are reflected only
   if listed (or a localhost dev origin when running in development). */
const DEFAULT_ORIGINS = [
  "https://jjjffdfde.github.io",
  "http://localhost:8766",
  "http://localhost:4173",
  "http://127.0.0.1:8766",
  "http://127.0.0.1:4173"
];
const rawCors = String(process.env.CORS_ORIGIN || "").trim();
const allowAll = rawCors === "*";
const corsOrigins = allowAll
  ? ["*"]
  : Array.from(new Set([...DEFAULT_ORIGINS, ...(rawCors ? rawCors.split(",").map((s) => s.trim()).filter(Boolean) : [])]));

function isAllowedOrigin(origin) {
  if (allowAll) return true;
  if (!origin) return false;
  return corsOrigins.includes(origin) ||
    (isProduction ? false : /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin));
}

module.exports = { config, corsOrigins, isAllowedOrigin };
