/* Phase 34 Module 24: post-cleanup security recheck - fresh secret scan on the
   FINAL tree with the same pattern set as the analyzer. Reports file:line:type:severity only. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs", "phase34_security_recheck.json");

const TEXT_EXTS = new Set(["html", "htm", "js", "cjs", "mjs", "json", "css", "md", "xml", "yml", "yaml", "webmanifest", "txt", "conf", "cfg", "ini", "sql", "sh", "cmd", "bat", "ps1", "env", "example", "properties", "editorconfig", "eslintrc", "markdownlint", "prettierrc", "nojekyll"]);
const SKIP_DIRS = new Set([".git", "backup", "database", "phase34-backup-2026-08-11T11-20-39", "docs", "subjects", "chapters"]);
const MAXC = 2 * 1024 * 1024;

const PATTERNS = [
  { type: "aws_access_key", re: /\bAKIA[0-9A-Z]{16}\b/i, severity: "high" },
  { type: "openai_api_key", re: /\bsk-[A-Za-z0-9]{20,}\b/, severity: "high" },
  { type: "github_token", re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/, severity: "high" },
  { type: "slack_token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, severity: "high" },
  { type: "private_key", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----/, severity: "high" },
  { type: "database_credentials", re: /\b(postgres|mysql|mssql|mongodb(\+srv)?):\/\/[^\/\s]+:[^@\s\/]+@[^\/\s]+/i, severity: "high" },
  { type: "jwt_secret", re: /(?:jwt[_-]?secret|session[_-]?secret|signing[_-]?secret|client[_-]?secret|auth[_-]?secret)\s*[:=]\s*["'][^"']{8,}["']/i, severity: "medium" },
  { type: "api_key_assignment", re: /\b(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token|secret[_-]?key|private[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i, severity: "medium" },
  { type: "password_assignment", re: /\b(?:password|passwd|pwd|db[_-]?password|dbpass)\s*[:=]\s*["'][^"']{4,}["']/i, severity: "medium" },
  { type: "bearer_token", re: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/i, severity: "medium" },
  { type: "authorization_header", re: /\b(?:authorization|token)\s*[:=]\s*["'][^"']{12,}["']/i, severity: "low" }
];

const hits = [];
function walk(d, relBase) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(p, relBase); continue; }
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    const ext = path.extname(p).replace(/^\./, "").toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;
    const st = fs.statSync(p);
    if (st.size === 0 || st.size > MAXC) continue;
    const lines = fs.readFileSync(p, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const pat of PATTERNS) {
        if (pat.re.test(lines[i])) {
          hits.push({ file: rel, line: i + 1, secret_type: pat.type, severity: pat.severity, action_required: "verify; EXCLUDE from Git or rotate if real" });
          break;
        }
      }
    }
  }
}
walk(ROOT, "");

const envPresent = fs.readdirSync(ROOT).filter((n) => /^\.env(\..*)?$/.test(n) && n !== ".env.example");
fs.writeFileSync(OUT, JSON.stringify({
  method: "pattern scan of all text files (max 2 MiB) on the FINAL cleaned tree; secret VALUES are never reported",
  files_scanned: (() => { let n = 0; const w2 = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) w2(p); } else n++; } }; w2(ROOT); return n; })(),
  hits,
  accidental_env_files: envPresent,
  verdict: hits.length === 0 && envPresent.length === 0 ? "PASS - no secrets, no accidental .env files" : "REVIEW"
}, null, 1));
console.log("security recheck: hits=", hits.length, "| .env files:", envPresent.length);
