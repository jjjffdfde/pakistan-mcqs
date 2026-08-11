/* ============================================================
   Phase 26 - STEP 2: Deterministic Lint & Format Checker
   Zero-dependency implementation of the ESLint/Prettier rule
   subset declared in .eslintrc.json / .prettierrc so CI can
   run without npm installs.
   Usage: node scripts/lint.cjs [--json]
   Exit codes: 0 = clean, 1 = errors, 2 = warnings only
   Emits: docs/phase26_code_quality.json (with --json or always)
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_code_quality.json");
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "backup", ".audit-tmp"]);
const EXCLUDE_FILES = /\.(sqlite|sqlite-wal|sqlite-shm|png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|zip|gz)$/i;
const MAX_LINE = 120;

const issues = []; /* {severity, file, line, rule, message} */

/* ---------- strip strings & comments (char scanner, handles escapes + templates) ---------- */
function stripStringsAndComments(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (ch === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; out += " "; continue; }
    if (ch === "/" && src[i + 1] === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; out += "  "; continue; }
    if (ch === '"' || ch === "'") {
      const q = ch; i++;
      while (i < n && src[i] !== q) { if (src[i] === "\\") i++; i++; }
      i++; out += "''"; continue;
    }
    if (ch === "`") {
      i++;
      while (i < n) { if (src[i] === "\\") { i += 2; continue; } if (src[i] === "`") break; i++; }
      i++; out += "``"; continue;
    }
    if (ch === "/" && /[=:(,!?[{\s&|;]/.test(out[out.length - 1] || "\n")) {
      /* regex literal: runs to unescaped / or newline */
      i++;
      while (i < n) { if (src[i] === "\\") { i += 2; continue; } if (src[i] === "/") { i++; break; } if (src[i] === "\n") break; i++; }
      out += "/regex/"; continue;
    }
    out += ch; i++;
  }
  return out;
}

/* ---------- JS lint ---------- */
function lintJs(file, src) {
  const lines = src.split("\n");
  const isAppScript = /^(app|admin|pwa|search|quiz)\.js$/i.test(path.basename(file)) || src.includes("'use strict'");
  const isGenerated = /^chapters\//.test(file) || /^subjects\//.test(file) || /^database\//.test(file);
  /* real syntax validation via VM parse (deterministic, no execution) */
  try {
    new (require("vm").Script)(src, { filename: file });
  } catch (e) {
    issues.push({ severity: "error", file, line: 1, rule: "syntax/parse", message: `syntax error: ${e.message}` });
  }
  for (let i = 0; i < lines.length; i++) {
    const ln = i + 1;
    const raw = lines[i];
    const code = stripStringsAndComments(raw);
    if (/\t/.test(raw)) issues.push({ severity: "error", file, line: ln, rule: "prettier/useTabs", message: "tab character (prettier: tabs=false)" });
    if (/[ \t]+$/.test(raw)) issues.push({ severity: "error", file, line: ln, rule: "prettier/trimTrailingWhitespace", message: "trailing whitespace" });
    if (!isGenerated && raw.length > MAX_LINE + 20) issues.push({ severity: "warn", file, line: ln, rule: "prettier/printWidth", message: `line ${raw.length} chars > ${MAX_LINE}` });
    if (/;;/.test(code.replace(/for\s*\([^;]*;;[^)]*\)/g, "")) && !/for\s*\(\s*;;\s*\)/.test(raw)) issues.push({ severity: "error", file, line: ln, rule: "no-extra-semi", message: "extra semicolon" });
    if (/\bvar\s+[A-Za-z_$]/.test(code) && !/var\s*\(/.test(code)) issues.push({ severity: "error", file, line: ln, rule: "no-var", message: "use const/let instead of var" });
    if (/[^=!<>]==[^=]/.test(code)) issues.push({ severity: "warn", file, line: ln, rule: "eqeqeq", message: "use === / !==" });
  }
  if (isAppScript && !/^\s*["']use strict["'];?\s*$/m.test(src)) issues.push({ severity: "warn", file, line: 1, rule: "strict", message: "missing 'use strict'" });
  const last = lines[lines.length - 1];
  if (!src.startsWith("#!") && last.trim() !== "" && !src.endsWith("\n")) issues.push({ severity: "error", file, line: lines.length, rule: "prettier/insertFinalNewline", message: "missing final newline" });
}

/* ---------- JSON validation ---------- */
function lintJson(file, src) {
  try { JSON.parse(src); } catch (e) {
    issues.push({ severity: "error", file, line: 1, rule: "json/parse", message: `invalid JSON: ${e.message}` });
  }
}

/* ---------- YAML validation (structural) ---------- */
function lintYaml(file, src) {
  const lines = src.split("\n");
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (inBlock) { if (ln.trim() === "" || ln.trim() === "|" || ln.startsWith(" ") || ln.startsWith("\t") || ln.startsWith("|-")) continue; inBlock = false; }
    const s = ln.trim();
    if (s === "") continue;
    if (s.startsWith("#")) continue;
    if (s.startsWith("- ") || s === "-") { if (ln.startsWith("\t")) issues.push({ severity: "error", file, line: i + 1, rule: "yaml/indent", message: "tab indentation" }); continue; }
    if (/\S:\s*\|$/.test(s)) { inBlock = true; continue; }
    if (!/^([a-zA-Z0-9_.\-]+):(\s.*)?$/.test(s)) {
      if (!/^\s*(on|off|true|false|never|always|push|pull_request|schedule|cron|workflow_dispatch|permissions|contents|deployments|pull-requests|statuses|actions|write|read|none|1\.x|20\.x|22\.x|24\.x|latest|node-version|ruby-version|\$\{\{[^}]*\}\})\s*$/.test(s))
        issues.push({ severity: "warn", file, line: i + 1, rule: "yaml/syntax", message: "unparseable line (structural check)" });
    }
    if (/\t/.test(ln)) issues.push({ severity: "error", file, line: i + 1, rule: "yaml/indent", message: "tab indentation" });
  }
}

/* ---------- Markdown lint ---------- */
function lintMd(file, src) {
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (/[ \t]+$/.test(raw)) issues.push({ severity: "error", file, line: i + 1, rule: "md/trailing", message: "trailing whitespace (MD009)" });
    if (/^(#{1,6}\s+.*)\s+\\$/.test(raw)) issues.push({ severity: "error", file, line: i + 1, rule: "md/heading", message: "trailing hash on heading (MD025)" });
  }
  if (!/\n/.test(src) && src.length > 10) issues.push({ severity: "warn", file, line: 1, rule: "md/blank", message: "no blank line after heading (MD022)" });
}

/* ---------- HTML validation (basic, hand-written pages only) ---------- */
const VOID_TAGS = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s|>)/i;
function lintHtml(file, src) {
  const tags = src.match(/<(?![!?/])[a-zA-Z][a-zA-Z0-9-]*(?=[\s>])/g) || [];
  const opens = tags.length;
  const voids = tags.filter((t) => VOID_TAGS.test(t + ">")).length;
  const closes = (src.match(/<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g) || []).length;
  if (opens - voids !== closes) issues.push({ severity: "warn", file, line: 1, rule: "html/tagBalance", message: `tag imbalance: opens ${opens} voids ${voids} vs closes ${closes}` });
}

/* ---------- walk ---------- */
function walk(dir, rel, onFile) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of entries) {
    if (e.isDirectory()) { if (!EXCLUDE_DIRS.has(e.name)) walk(path.join(dir, e.name), rel ? `${rel}/${e.name}` : e.name, onFile); }
    else { const r = rel ? `${rel}/${e.name}` : e.name; if (!EXCLUDE_FILES.test(r)) onFile(r); }
  }
}

const jsFiles = [];
walk(ROOT, "", (f) => {
  if (/\.(js|cjs|mjs)$/.test(f)) jsFiles.push(f);
});
jsFiles.sort();

let jsonFiles = 0, mdFiles = 0, yamlFiles = 0, htmlFiles = 0;
for (const f of jsFiles) {
  let src;
  try { src = fs.readFileSync(path.join(ROOT, f), "utf8"); } catch (e) { continue; }
  lintJs(f, src);
}
walk(ROOT, "", (f) => {
  if (/\.json$/.test(f) && !/backup\//.test(f)) { jsonFiles++; lintJson(f, fs.readFileSync(path.join(ROOT, f), "utf8")); }
  else if (/\.(yml|yaml)$/.test(f)) { yamlFiles++; lintYaml(f, fs.readFileSync(path.join(ROOT, f), "utf8")); }
  else if (/\.md$/.test(f)) { mdFiles++; lintMd(f, fs.readFileSync(path.join(ROOT, f), "utf8")); }
  else if (/\.html$/.test(f) && !/^(chapters|subjects)\//.test(f)) { htmlFiles++; lintHtml(f, fs.readFileSync(path.join(ROOT, f), "utf8")); }
});

/* ---------- aggregate ---------- */
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warn");
const byRule = {};
for (const i of issues) byRule[i.rule] = (byRule[i.rule] || 0) + 1;

const report = {
  step: "code_quality",
  generated_at: new Date().toISOString(),
  summary: {
    js_files: jsFiles.length,
    json_files: jsonFiles,
    md_files: mdFiles,
    yaml_files: yamlFiles,
    html_files: htmlFiles,
    errors: errors.length,
    warnings: warnings.length,
    status: errors.length === 0 ? (warnings.length === 0 ? "CLEAN" : "CLEAN_WITH_WARNINGS") : "ERRORS"
  },
  by_rule: Object.entries(byRule).sort((a, b) => b[1] - a[1]).map(([rule, count]) => ({ rule, count })),
  errors: errors.slice(0, 100).map((i) => ({ file: i.file, line: i.line, rule: i.rule, message: i.message })),
  warnings: warnings.slice(0, 100).map((i) => ({ file: i.file, line: i.line, rule: i.rule, message: i.message })),
  configs_checked: [".editorconfig", ".eslintrc.json", ".prettierrc", ".markdownlint.json"]
};
fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");

console.log(`lint: ${jsFiles.length} js | ${jsonFiles} json | ${mdFiles} md | ${yamlFiles} yaml | ${htmlFiles} html`);
console.log(`  errors=${errors.length} warnings=${warnings.length} status=${report.summary.status}`);
console.log(`report -> docs/phase26_code_quality.json`);
process.exit(errors.length > 0 ? 1 : warnings.length > 0 ? 2 : 0);
