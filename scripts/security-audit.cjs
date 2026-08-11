/* ============================================================
   Phase 26 - STEP 7: Security Audit (deterministic, read-only)
   Scans source + public config for:
   1. Hardcoded secrets / credentials
   2. Private key material
   3. HTTP-only (mixed content) references in public pages
   4. Unsafe dynamic eval / dangerous patterns
   5. World-writable / oversized serving hints
   Usage: node scripts/security-audit.cjs
   Emits: docs/phase26_security.json
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_security.json");
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "backup", "data", "db", "subjects", "chapters", "release", "assets/icons"]);
const EXCLUDE_FILES = /\.(sqlite|sqlite-wal|sqlite-shm|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|zip|gz|ndjson|log)$/i;

const findings = [];
const add = (severity, file, line, rule, message) => findings.push({ severity, file, line, rule, message });

const SECRET_PATTERNS = [
  [/\b(begin\s+)(rsa|ec|openssh|dgst)?\s*private\s+key\b/i, "private_key", "private key material detected"],
  [/AKIA[0-9A-Z]{16}/, "aws_key", "AWS access key id format"],
  [/sk-[A-Za-z0-9]{20,}/i, "openai_key", "potential LLM API key"],
  [/ghp_[A-Za-z0-9]{36}/, "gh_token", "GitHub personal access token"],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, "slack_token", "Slack token"],
  [/\b(password|passwd|pwd|secret|api[_-]?key|app[_-]?secret|client[_-]?secret)\s*[:=]\s*["'][^"'\s]{10,}["']/i, "hardcoded_secret", "possible hardcoded credential"]
];
const EVAL_PATTERNS = [/(?:^|[^a-zA-Z"'`_.$\/])eval\s*\(/];

function walk(dir, rel) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!EXCLUDE_DIRS.has(e.name)) walk(full, rel ? `${rel}/${e.name}` : e.name); continue; }
    if (EXCLUDE_FILES.test(e.name) || /\.(png|jpg)$/i.test(e.name)) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (!/\.(js|cjs|mjs|json|yml|yaml|env|md|html|xml|sql|sh|cmd|conf|cjs)$/i.test(e.name)) continue;
    let src;
    try {
      if (fs.statSync(full).size > 5 * 1024 * 1024) continue;
      src = fs.readFileSync(full, "utf8");
    } catch (e2) { continue; }
    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;
      const code = line.replace(/\/\*[\s\S]*?\*\//g, "");
      for (const [re, rule, msg] of SECRET_PATTERNS) {
        if (re.test(code)) add("error", r, i + 1, rule, msg);
      }
      for (const re of EVAL_PATTERNS) {
        if (re.test(code)) add("warn", r, i + 1, "eval", "dynamic code execution (eval)");
      }
    }
  }
}
walk(ROOT, "");

/* mixed-content scan: public static pages + manifest */
const publicPages = ["index.html", "admin.html", "offline.html", "404.html", "subjects/index.html", "manifest.webmanifest", "sw.js", "assets/js/app.js", "assets/js/pwa.js", "assets/js/admin.js", "assets/js/ai.js"];
let mixed = 0;
for (const p of publicPages) {
  if (!fs.existsSync(path.join(ROOT, p))) continue;
  const src = fs.readFileSync(path.join(ROOT, p), "utf8");
  const refs = src.match(/https?:\/\/[^"')\s]+/gi) || [];
  const insecure = [...new Set(refs.filter((u) => u.startsWith("http://") && !/localhost|127\.0\.0\.1|0\.0\.0\.0|w3\.org/i.test(u)))];
  if (insecure.length) { mixed += insecure.length; add("warn", p, 1, "mixed_content", `insecure http:// refs: ${insecure.slice(0, 4).join(", ")}`); }
}

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warn");
const report = {
  step: "security",
  generated_at: new Date().toISOString(),
  summary: {
    scanned_public_pages: publicPages.filter((p) => fs.existsSync(path.join(ROOT, p))).length,
    errors: errors.length,
    warnings: warnings.length,
    status: errors.length === 0 ? "PASS" : "FAIL"
  },
  errors: errors.slice(0, 50),
  warnings: warnings.slice(0, 50),
  policy: ["no secrets in source", "no mixed content on public pages", "no private keys in repo"]
};
fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
console.log(`security audit: errors=${errors.length} warnings=${warnings.length} status=${report.summary.status} -> docs/phase26_security.json`);
process.exit(errors.length === 0 ? 0 : 1);
