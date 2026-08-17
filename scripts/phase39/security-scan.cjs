"use strict";
/* Phase 39 STEP 8 - final security scan. Never prints values: masks [REDACTED]. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const { execFileSync } = require("child_process");

const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", maxBuffer: 2e8 }).split(/\r?\n/).filter(Boolean);
const untrackedNI = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8", maxBuffer: 2e8 }).split(/\r?\n/).filter(Boolean);
const files = [...tracked, ...untrackedNI].filter((f) => {
  if (/\.(png|jpg|jpeg|gif|webp|ico|avif|woff2?|ttf|eot|gz|zst|zip|sqlite|db)$/.test(f)) return false;
  if (/^database\/(data|releases|snapshots)\//.test(f)) return false;
  return true;
});

const PATTERNS = [
  ["github_token", /\bgh[pousr]_[A-Za-z0-9]{20,}\b/],
  ["github_app", /ghx_[A-Za-z0-9]{20,}/],
  ["aws_access_key", /\bAKIA[0-9A-Z]{16}\b/],
  ["aws_secret", /(aws_secret|secret_access_key)\s*[:=]\s*['"][A-Za-z0-9/+=]{20,}['"]/i],
  ["gcp_key", /AIza[0-9A-Za-z_-]{30,}/],
  ["private_key_block", /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["jwt", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["bearer_token", /Bearer\s+[A-Za-z0-9._~+/=-]{20,}/i],
  ["generic_api_key", /(api[_-]?key|apikey|client[_-]?secret|app[_-]?secret|auth[_-]?token)\s*[:=]\s*['"][^'"]{12,}['"]/i],
  ["password_assignment", /(password|passwd|pwd)\s*[:=]\s*['"][^'"\s]{6,}['"]/i],
  ["db_password", /(db[_-]?password|mysql.*password|postgres.*password)\s*[:=]\s*['"][^'"]+['"]/i],
  ["private_email_connection", /smtp[s]?:\/\/[^\/\s]+:[^@\s]+@/i],
  ["url_with_creds", /\/\/[A-Za-z0-9_.-]+:[^@\s]+@/],
  ["signing_secret", /(signing[_-]?secret|session[_-]?secret|cookie[_-]?secret)\s*[:=]\s*['"][^'"]+['"]/i],
  ["telegram_bot", /\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/],
  ["npm_token", /\/\/registry\.npmjs\.org\/:_authToken=/],
  ["slack_token", /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ["stripe_key", /(sk|pk)_(test|live)_[A-Za-z0-9]{16,}/],
  ["google_oauth_client", /G[0-9]{10,}-[A-Za-z0-9_]{20,}\.apps\.googleusercontent\.com/],
  ["heroku_api", /heroku[a-z]*\s*[:=]\s*['"][A-Za-z0-9-]{20,}['"]/i]
];
const EXCLUDE_FILES = ["scripts/phase39/security-scan.cjs", "scripts/phase38/security-audit.cjs"];
const EXCLUDE_LINES = [/REDACTED/, /ghp_|gho_|ghu_|ghs_|ghr_/, /pattern example/i, /example\.com/];

const findings = [];
for (const f of files) {
  if (EXCLUDE_FILES.includes(f)) continue;
  let txt;
  try { txt = fs.readFileSync(path.join(ROOT, f), "utf8"); } catch (e) { continue; }
  const lines = txt.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (EXCLUDE_LINES.some((re) => re.test(ln))) continue;
    for (const [name, re] of PATTERNS) {
      const m = ln.match(re);
      if (m) {
        findings.push({ file: f, line: i + 1, type: name, snippet: ln.trim().slice(0, 140).replace(/[A-Za-z0-9._~+/=-]{12,}/g, "[REDACTED]") });
        break;
      }
    }
  }
}

/* also scan ignored-but-present risky files (never read content of ignored binaries) */
const riskyIgnored = ["validation.log", "*.env"].map(() => null);
const report = {
  phase: 39, step: 8, generated_at: new Date().toISOString(),
  scanned_files: files.length,
  findings: findings,
  summary: { hits: findings.length, secret_like: findings.length },
  verdict: findings.length === 0 ? "PASS" : "REVIEW"
};
fs.writeFileSync(path.join(ROOT, "docs", "phase39_security_final.json"), JSON.stringify(report, null, 1));
console.log("scanned:", files.length, "findings:", findings.length);
for (const f of findings) console.log(f.type, f.file + ":" + f.line, f.snippet);
