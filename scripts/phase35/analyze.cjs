/* Phase 35 analyzer (DRY RUN - performs NO deletions):
   - full file inventory + SHA256
   - static + dynamic reference detection
   - Phase 35 letter classification (A-O)
   - duplicate detection
   - dead controls, broken links, API endpoint validation
   - GitHub audit (large files, secrets, env, node_modules, binaries)
   Emits docs/phase35_*.json + PHASE35_DRY_RUN_REPORT.md */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs");
const MiB = 1024 * 1024;

const TEXT_EXTS = new Set([
  "html", "htm", "js", "cjs", "mjs", "json", "css", "md", "xml", "yml", "yaml",
  "webmanifest", "txt", "conf", "cfg", "ini", "sql", "sh", "cmd", "bat", "ps1",
  "py", "ts", "tsx", "jsx", "env", "example", "properties", "gitignore",
  "gitattributes", "editorconfig", "eslintrc", "markdownlint", "prettierrc",
  "nojekyll", "dockerignore", "template"
]);
const CONTENT_MAX = 3 * MiB;

const SCAN_EXCLUDES = new Set([".audit-tmp", "backup", ".git", "node_modules", "coverage", "test-results", "playwright-report", ".cache", ".tmp", "temp"]);
const SCAN_EXCLUDE_PREFIXES = ["database/data/", "database/releases/", "database/snapshots/", "data/export/"];

const LOG_PATTERN = /\.log$/i;
const TMP_PATTERN = /\.(tmp|temp|bak|old|swp|orig|part)$/i;
const DEV_ARTIFACT_PATTERN = /(^|\/)(node_modules|dist|build|\.cache|coverage|\.tmp|temp|screenshots|test-results|playwright-report|crash[_-]?dumps?)(\/|$)/i;
const OS_JUNK_PATTERN = /(^|\/)(Thumbs\.db|\.DS_Store|Desktop\.ini)(\/|$)/i;
const ARCHIVE_PATTERN = /\.(har|zip|7z|rar)$/i;

/* ============================================================
   FILES TO PROTECT UNCONDITIONALLY (production source of truth)
   ============================================================ */
const PROTECT_ROOT = {
  "index.html": "A: main application page (SPA entry)",
  "admin.html": "A: admin panel",
  "offline.html": "A: PWA offline fallback page",
  "404.html": "A: error page",
  "sw.js": "A: service worker",
  "manifest.webmanifest": "A: PWA manifest",
  "robots.txt": "A: SEO",
  "sitemap.xml": "A: SEO",
  "image-sitemap.xml": "A: SEO",
  "video-sitemap.xml": "A: SEO",
  ".nojekyll": "A: GitHub Pages requirement",
  "server.js": "B: optional API/static server",
  "README.md": "E: documentation",
  "CHANGELOG.md": "E: documentation",
  "Dockerfile": "B: deployment",
  "docker-compose.yml": "B: deployment",
  "nginx.conf": "B: deployment",
  "ecosystem.config.js": "B: deployment (PM2)",
  "package.json": "D: project configuration",
  "package-lock.json": "D: project configuration (lockfile)",
  ".gitignore": "D: git configuration",
  ".gitattributes": "D: git configuration",
  ".editorconfig": "D: editor configuration",
  ".eslintrc.json": "D: lint configuration",
  ".markdownlint.json": "D: markdown lint configuration",
  ".prettierrc": "D: prettier configuration",
  ".env.example": "D: environment template (no secrets)"
};
const PROTECT_DIRS = {
  "assets": "A: frontend assets (CSS/JS/icons/images)",
  "subjects": "A: generated static pages (deployment + sitemap)",
  "chapters": "A: generated static pages (deployment + sitemap)",
  "data": "B/F: runtime JSON data + sectional MCQ bank (build + SW + app)",
  "db": "B/F: database tooling + schema (PRODUCTION DB protected)",
  "scripts": "C: build/generate/test/audit tooling",
  "tests": "C: automated test suites",
  "database": "F: Phase 23 rebuildable source repository (schema/scripts/manifests; payload dirs local-only)",
  "docs": "E/N: phase evidence + reports + guides",
  ".github": "C: CI/CD workflows",
  "android": "B: TWA packaging",
  "desktop": "B: Electron desktop wrapper",
  "release": "B: release checksums + version metadata",
  "pipeline": "F: content generation pipeline",
  "kg": "F: knowledge graph engine",
  "ai": "F: AI engine (server.js requires)",
  "assistant": "F: assistant engine",
  "backup": "M: historical DB snapshots (local restore feature; excluded from Git)"
};

function rel(p) { return p.split(path.sep).join("/"); }

function sha256File(p) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash("sha256");
    const s = fs.createReadStream(p);
    s.on("error", reject);
    s.on("data", (d) => h.update(d));
    s.on("end", () => resolve(h.digest("hex")));
  });
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      walk(abs, out);
    } else out.push(abs);
  }
  return out;
}

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function gitTrackedSet() {
  try {
    const r = require("child_process").execSync("git ls-files", { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * MiB });
    return new Set(r.split("\n").filter(Boolean));
  } catch { return new Set(); }
}
function gitIgnored(relp) {
  try {
    require("child_process").execSync(`git check-ignore -q -- ${JSON.stringify(relp).replace(/"/g, "")}`, { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch { return false; }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const allAbs = walk(ROOT, []);
  const files = [];
  for (const abs of allAbs) {
    const st = fs.statSync(abs);
    files.push({
      rel: rel(path.relative(ROOT, abs)), abs, name: path.basename(abs),
      dir: rel(path.dirname(path.relative(ROOT, abs))), ext: path.extname(abs).replace(/^\./, "").toLowerCase(),
      size: st.size, mtime: st.mtime.toISOString()
    });
  }

  /* ---------- hashes (bounded concurrency) ---------- */
  let idx = 0;
  async function hashWorker() {
    while (idx < files.length) {
      const f = files[idx++];
      try { f.sha256 = await sha256File(f.abs); } catch { f.sha256 = null; }
    }
  }
  await Promise.all(Array.from({ length: 6 }, hashWorker));

  /* ---------- content load for scanning ---------- */
  const isScanable = (f) => f.size > 0 && f.size <= CONTENT_MAX && (TEXT_EXTS.has(f.ext) || /^\./.test(f.name));
  const isExcludedFromScan = (f) => {
    const top = f.rel.split("/")[0];
    if (SCAN_EXCLUDES.has(top)) return true;
    return SCAN_EXCLUDE_PREFIXES.some((p) => f.rel.startsWith(p));
  };
  const textFiles = files.filter((f) => !isExcludedFromScan(f) && isScanable(f));
  for (const f of textFiles) f.content = fs.readFileSync(f.abs, "utf8");

  const isDoc = (f) => f.rel.startsWith("docs/");
  const isCodeRef = (f) => !isDoc(f) && !f.rel.startsWith("database/") && !f.rel.startsWith("backup/") && !f.rel.startsWith(".github/");

  /* ---------- reference extraction ---------- */
  const paths = files.map((f) => f.rel).sort((a, b) => b.length - a.length);
  const pathRe = new RegExp("(?:^|[/'\"`(\\s=])(" + paths.map(esc).join("|") + ")(?=[\\s)'\"`,;]|$)", "g");
  const baseMap = new Map();
  for (const f of files) {
    const key = f.name.toLowerCase();
    if (!baseMap.has(key)) baseMap.set(key, []);
    baseMap.get(key).push(f.rel);
  }
  const bases = [...baseMap.keys()].sort((a, b) => b.length - a.length);
  const baseRe = new RegExp("(?:^|[^A-Za-z0-9_-])(" + bases.map(esc).join("|") + ")(?=$|[^A-Za-z0-9_./-])", "g");

  const refs = new Map();
  const addRef = (src, tgt, kind) => {
    if (src === tgt) return;
    if (!refs.has(tgt)) refs.set(tgt, new Map());
    const m = refs.get(tgt);
    const prev = m.get(src) || { kind, count: 0 };
    prev.count++;
    m.set(src, prev);
  };

  for (const f of textFiles) {
    const c = f.content;
    pathRe.lastIndex = 0;
    let m;
    while ((m = pathRe.exec(c))) {
      const t = m[1];
      const target = t.startsWith("./") ? t.slice(2) : t;
      if (files.some((x) => x.rel === target)) addRef(f.rel, target, "path");
    }
    baseRe.lastIndex = 0;
    while ((m = baseRe.exec(c))) {
      const name = m[1].toLowerCase();
      for (const t of baseMap.get(name) || []) addRef(f.rel, t, "basename");
    }
    /* dynamic references: cache lists, template literals with path fragments */
    const tpl = c.match(/`[^`]*\$[^`]*`/g) || [];
    for (const t of tpl) {
      const stripped = t.replace(/\$\{[^}]*\}/g, "");
      for (const p of paths) {
        const slash = p.lastIndexOf("/");
        const frag = slash > 0 ? p.slice(0, slash + 1) : "";
        if (frag && stripped.includes(frag) && (stripped.includes(p.slice(slash + 1)) || stripped.includes(p.slice(0, 3)))) {
          addRef(f.rel, p, "dynamic");
        }
      }
    }
    const dyncalls = c.match(/cache\.add(?:All)?\(\s*\[([^\]]*)\]|fetch\(\s*[`'"]([^`'"]{2,})/g) || [];
    for (const d of dyncalls) {
      for (const p of paths) {
        if (d.includes(p)) addRef(f.rel, p, "cache_fetch");
      }
    }
    /* directory-level references */
    const dirSet = new Set();
    for (const p of paths) {
      const slash = p.lastIndexOf("/");
      if (slash > 0) dirSet.add(p.slice(0, slash + 1));
    }
    for (const d of dirSet) {
      const i = c.indexOf(d);
      if (i !== -1) addRef(f.rel, d.slice(0, -1), "dir");
    }
  }

  const codeRefCount = (tgt) => {
    const m = refs.get(tgt);
    if (!m) return 0;
    let n = 0;
    for (const [src, r] of m) if (isCodeRef({ rel: src }) && !/^release\/SHA256SUMS\.txt$/.test(src)) n += r.count;
    return n;
  };
  const totalRefCount = (tgt) => {
    const m = refs.get(tgt);
    if (!m) return 0;
    let n = 0;
    for (const r of m.values()) n += r.count;
    return n;
  };
  const refList = (tgt) => {
    const m = refs.get(tgt);
    if (!m) return [];
    return [...m.entries()].map(([src, r]) => ({ source: src, kind: r.kind, count: r.count }));
  };
  const isDynamicRef = (tgt) => {
    const m = refs.get(tgt);
    if (!m) return false;
    return [...m.values()].some((r) => r.kind === "dynamic" || r.kind === "cache_fetch");
  };

  /* ---------- secrets ---------- */
  const SECRET_PATTERNS = [
    { type: "aws_access_key", re: /\bAKIA[0-9A-Z]{16}\b/i, severity: "high" },
    { type: "openai_api_key", re: /\bsk-[A-Za-z0-9]{20,}\b/, severity: "high" },
    { type: "github_token", re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/, severity: "high" },
    { type: "slack_token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, severity: "high" },
    { type: "private_key", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY(?: BLOCK)?-----/, severity: "high" },
    { type: "database_credentials", re: /\b(?:postgres|mysql|mssql|mongodb(\+srv)?):\/\/[^\/\s]+:[^@\s\/]+@[^\/\s]+/i, severity: "high" },
    { type: "jwt_secret", re: /(?:jwt[_-]?secret|session[_-]?secret|signing[_-]?secret|client[_-]?secret|auth[_-]?secret)\s*[:=]\s*["'][^"']{8,}["']/i, severity: "medium" },
    { type: "api_key_assignment", re: /\b(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token|secret[_-]?key|private[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i, severity: "medium" },
    { type: "password_assignment", re: /\b(?:password|passwd|pwd|db[_-]?password|dbpass)\s*[:=]\s*["'][^"']{4,}["']/i, severity: "medium" },
    { type: "bearer_token", re: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/i, severity: "medium" }
  ];
  const PLACEHOLDER = /(xxxx+|your[-_ ]?|example|placeholder|changeme|dummy|test[-_]?token|\[.*\])/i;
  const secretHits = [];
  for (const f of textFiles) {
    if (f.size === 0 || f.size > 2 * MiB) continue;
    if (/\.sqlite/.test(f.rel)) continue;
    if (f.rel.startsWith("backup/") || f.rel.startsWith(".audit-tmp/") || f.rel.startsWith("database/data/") || f.rel.startsWith("database/releases/")) continue;
    const lines = f.content.split("\n");
    for (let li = 0; li < lines.length; li++) {
      for (const p of SECRET_PATTERNS) {
        if (p.re.test(lines[li])) {
          secretHits.push({
            file: f.rel, line: li + 1, secret_type: p.type, severity: p.severity,
            placeholder_likely: PLACEHOLDER.test(lines[li]),
            action_required: PLACEHOLDER.test(lines[li]) ? "verify (placeholder/example)" : "VERIFY + EXCLUDE from Git"
          });
          break;
        }
      }
    }
  }

  /* ---------- classification (Phase 35 letters) ---------- */
  const classify = (f) => {
    const rp = f.rel;
    const codeRefs = codeRefCount(rp);
    const refsAll = refList(rp);
    const top = rp.split("/")[0];
    const depth = rp.split("/").length;

    if (rp.startsWith(".audit-tmp/") || rp.startsWith(".claude/")) return { cls: "J", reason: "scratch directory (audit temp / IDE local state)", confidence: "high", deletable: true };
    if (rp.startsWith(".github/")) return { cls: "C", reason: "CI/CD workflows", confidence: "high" };

    if (rp.startsWith("backup/")) {
      if (LOG_PATTERN.test(rp)) return { cls: "I", reason: "log inside backup tooling", confidence: "high", deletable: true };
      const sub = rp.split("/")[1];
      if (sub && (sub.startsWith("db-backup") || /^\d{4}-\d{2}-\d{2}/.test(sub) || sub.startsWith("pre-") || sub.startsWith("normalize-"))) {
        return { cls: "M", reason: "historical DB snapshot (local restore feature; excluded from Git)", confidence: "high" };
      }
      if (/\.js$/.test(rp)) return { cls: "B", reason: "backup/restore tooling required by server.js restore route", confidence: "high" };
      return { cls: "O", reason: "unclassified backup member", confidence: "low" };
    }

    if (rp.startsWith("db/")) {
      if (/pakistan-mcqs\.sqlite(-shm|-wal)?$/.test(rp)) return { cls: "F", reason: "PRODUCTION DATABASE (2.2 GiB) - never modified; excluded from Git", confidence: "high" };
      if (/pakistan-mcqs\.rebuilt\.sqlite(-shm|-wal)?$/.test(rp)) return { cls: "L", reason: "rebuild verification artifact (reproducible via database/scripts/build-db.js)", confidence: "high", deletable: true };
      if (/^db\/_/.test(rp)) return { cls: codeRefs > 0 ? "B" : "J", reason: "underscore-prefixed scratch helper; " + (codeRefs > 0 ? "referenced" : "zero references"), confidence: "high", deletable: codeRefs === 0 };
      if (/engine\.js$/.test(rp)) return { cls: "B", reason: "DB engine required by server.js", confidence: "high" };
      if (/schema\.(sqlite|mysql|pgsql)\.sql$/.test(rp)) return { cls: "F", reason: "schema DDL required by database-verify workflow", confidence: "high" };
      return { cls: "B", reason: "database tooling (migrate/import/export/validate/restore/config)", confidence: "high" };
    }

    if (rp.startsWith("database/")) {
      if (/^(database\/data|database\/releases|database\/snapshots)\//.test(rp)) {
        return { cls: "F", reason: "Phase 23 NDJSON/GZIP payload (local-only; excluded from Git; LFS rules prepared)", confidence: "high" };
      }
      return { cls: "F", reason: "Phase 23 database source repository (rebuild system)", confidence: "high" };
    }

    if (rp.startsWith("data/export/")) return { cls: "L", reason: "regenerable export output (db/export-json.js); not consumed by app/sw/build", confidence: "high", deletable: true };
    if (rp.startsWith("data/")) return { cls: "F", reason: "runtime JSON data + sectional MCQ bank consumed by build/SW/app", confidence: "high" };

    if (rp.startsWith("docs/archive/")) return { cls: "N", reason: "archived phase evidence", confidence: "high" };
    if (rp.startsWith("docs/current/") || rp.startsWith("docs/")) return { cls: "E", reason: "phase evidence, reports and guides", confidence: "high" };

    if (rp.startsWith("assets/")) return { cls: "A", reason: "frontend assets referenced by pages/manifest/SW", confidence: "high" };
    if (rp.startsWith("subjects/") || rp.startsWith("chapters/")) return { cls: "A", reason: "generated static pages (deployment + sitemap)", confidence: "high" };
    if (rp.startsWith("android/")) return { cls: "B", reason: "TWA packaging", confidence: "high" };
    if (rp.startsWith("desktop/")) return { cls: "B", reason: "Electron wrapper", confidence: "high" };
    if (rp.startsWith("release/")) return { cls: "B", reason: "release checksums + version metadata", confidence: "high" };
    if (rp.startsWith("scripts/")) return { cls: "C", reason: "build/generate/test tooling", confidence: "high" };
    if (rp.startsWith("tests/")) return { cls: "C", reason: "automated test suites", confidence: "high" };
    if (rp.startsWith("pipeline/") || rp.startsWith("kg/") || rp.startsWith("ai/") || rp.startsWith("assistant/")) {
      if (LOG_PATTERN.test(rp)) return { cls: "I", reason: "log file", confidence: "high", deletable: true };
      return { cls: "F", reason: "content generation pipeline / KG / AI engines", confidence: "high" };
    }

    if (depth === 1 && !/^\./.test(rp)) {
      if (PROTECT_ROOT[rp]) return { cls: PROTECT_ROOT[rp][0], reason: PROTECT_ROOT[rp].slice(3), confidence: "high" };
      if (LOG_PATTERN.test(rp)) return { cls: "I", reason: "root log file", confidence: "high", deletable: true };
      if (TMP_PATTERN.test(rp)) return { cls: "I", reason: "temporary/backup-style file at root", confidence: "high", deletable: true };
      if (codeRefs === 0) return { cls: "H", reason: "root orphan with zero references", confidence: "high", deletable: true };
      return { cls: "O", reason: "root file with references but no known role", confidence: "medium" };
    }

    if (/^\./.test(rp)) return { cls: "D", reason: "project configuration", confidence: "high" };

    if (DEV_ARTIFACT_PATTERN.test(rp) || OS_JUNK_PATTERN.test(rp) || ARCHIVE_PATTERN.test(rp)) {
      return { cls: "I", reason: "dev artifact / OS junk / archive format", confidence: "high", deletable: true };
    }

    if (LOG_PATTERN.test(rp)) return { cls: "I", reason: "log file", confidence: "high", deletable: true };
    if (TMP_PATTERN.test(rp)) return { cls: "I", reason: "temp/backup-style file", confidence: "high", deletable: true };
    if (/^[._#]/.test(f.name)) return { cls: codeRefs > 0 ? "G" : "J", reason: "dot/underscore-prefixed file; " + (codeRefs > 0 ? "referenced" : "scratch-like"), confidence: "medium", deletable: codeRefs === 0 };

    if (codeRefs > 0) return { cls: "G", reason: "referenced by project code but unclassified role", confidence: "medium" };
    if (isDynamicRef(rp)) return { cls: "G", reason: "dynamic/possible reference detected", confidence: "medium" };

    if (PROTECT_DIRS[top]) return { cls: PROTECT_DIRS[top][0], reason: PROTECT_DIRS[top].slice(3), confidence: "medium" };

    return { cls: "O", reason: "no references found; manual review required", confidence: "low" };
  };

  for (const f of files) {
    const c = classify(f);
    f.classification = c.cls;
    f.classificationReason = c.reason;
    f.classificationConfidence = c.confidence;
    f.deletable = !!c.deletable;
    f.codeRefCount = codeRefCount(f.rel);
    f.totalRefCount = totalRefCount(f.rel);
    f.referenced_by = refList(f.rel);
    f.dynamicRef = isDynamicRef(f.rel);
    f.secretHits = secretHits.filter((s) => s.file === f.rel).map((s) => ({ line: s.line, secret_type: s.secret_type, severity: s.severity }));
  }

  /* ---------- duplicates ---------- */
  const byHash = new Map();
  for (const f of files) {
    if (!f.sha256) continue;
    if (!byHash.has(f.sha256)) byHash.set(f.sha256, []);
    byHash.get(f.sha256).push(f.rel);
  }
  const duplicates = [...byHash.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([hash, list]) => ({
      sha256: hash,
      size: files.find((f) => f.rel === list[0]).size,
      files: list.map((rp) => ({
        path: rp,
        code_reference_count: codeRefCount(rp),
        total_reference_count: totalRefCount(rp),
        classification: files.find((f) => f.rel === rp).classification
      }))
    }))
    .filter((d) => d.files.some((f) => f.code_reference_count === 0))
    .map((d) => ({ ...d, recommendation: "keep referenced copy; unreferenced copy(s) eligible for removal after confirmation" }));

  /* ---------- HTML link/button validation ---------- */
  const htmlFiles = files.filter((f) => /\.html?$/.test(f.rel) && f.size < CONTENT_MAX && f.rel.startsWith("docs/") === false && !isExcludedFromScan(f) && f.content !== undefined);
  const brokenLinks = [];
  const deadControls = [];
  const linkRe = /<(a|link|script|img|iframe|video|audio|source|form)\b[^>]*(?:href|src|action)=["']([^"']+)["'][^>]*>/gi;
  for (const f of htmlFiles) {
    const c = f.content;
    const dir = f.rel.startsWith("/") ? "" : path.posix.dirname(f.rel);
    const m = c.matchAll(linkRe);
    for (const hit of m) {
      const url = hit[2];
      if (/^(https?:|data:|mailto:|tel:|javascript:|#|about:)/i.test(url)) continue;
      const clean = url.split(/[?#]/)[0].trim();
      if (!clean) continue;
      const decoded = decodeURIComponent(clean).replace(/^\/+/, "");
      let target = decoded;
      if (!/^(assets|data|subjects|chapters|db|scripts|tests|docs|android|desktop|release|pipeline|kg|ai|assistant|admin|index|404|offline)/.test(target)) continue;
      const resolved = dir === "." ? target : dir + "/" + target;
      if (!files.some((x) => x.rel === resolved || x.rel === target)) {
        brokenLinks.push({ page: f.rel, element: hit[1], url, resolved, status: "MISSING" });
      }
    }
    const btnRe = /<button\b[^>]*>/gi;
    const btnMatches = [...c.matchAll(btnRe)];
    const linkedScripts = [...c.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => {
      const u = m[1];
      const clean = u.replace(/^\/+/, "").split(/[?#]/)[0];
      return clean;
    }).filter(Boolean);
    const scriptContents = [];
    for (const s of linkedScripts) {
      const sf = files.find((x) => x.rel === s || x.rel === (dir === "." ? s : dir + "/" + s));
      if (sf && sf.content !== undefined) scriptContents.push(sf.content);
    }
    for (const b of btnMatches) {
      const tag = b[0];
      const hasHandler = /\bon(click|submit|change|keydown|keyup|input)=/.test(tag);
      const before = c.slice(0, b.index);
      const lastForm = before.lastIndexOf("<form");
      const lastFormClose = before.lastIndexOf("</form>");
      const inForm = lastForm > lastFormClose;
      const idMatch = tag.match(/\bid=["']([^"']+)["']/);
      let jsBound = false;
      if (idMatch) {
        const id = idMatch[1];
        const jsRef = new RegExp("(?:getElementById|\\$)\\(['\"`]" + esc(id), "i");
        jsBound = jsRef.test(c) || scriptContents.some((sc) => jsRef.test(sc));
      }
      const dataTab = tag.match(/\bdata-tab=["']([^"']+)["']/);
      const dataBound = dataTab ? scriptContents.some((sc) => sc.includes('data-tab') && sc.includes('querySelectorAll')) || /querySelectorAll\('\[data-tab\]'/.test(c) : false;
      const hasClass = tag.match(/\bclass=["']([^"']+)["']/);
      const classBound = hasClass ? scriptContents.some((sc) => sc.includes("." + hasClass[1].split(/\s+/)[0])) : false;
      const containerBound = scriptContents.some((sc) => {
        const sels = sc.matchAll(/querySelectorAll\(['"]([^'"]+)['"]/g);
        for (const sel of sels) {
          if (!sel[1].includes("button")) continue;
          const clsNames = [...sel[1].matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
          if (clsNames.some((cn) => new RegExp('class=["\'][^"\']*\\b' + cn + "\\b").test(c))) return true;
        }
        return false;
      });
      if (!hasHandler && !inForm && !jsBound && !dataBound && !classBound && !containerBound) {
        deadControls.push({ page: f.rel, button: tag.slice(0, 120), has_handler: false, in_form: inForm, js_bound: jsBound, data_bound: dataBound, class_bound: classBound, container_bound: containerBound, status: "NO_HANDLER_FOUND (review)" });
      }
    }
  }

  /* ---------- API endpoint validation ---------- */
  const routerSources = ["server.js", "ai/router.js", "assistant/offline-api.js"];
  const apiFrontend = new Map();
  const apiServer = new Set();
  for (const rs of routerSources) {
    const rf = files.find((f) => f.rel === rs);
    if (!rf || rf.content === undefined) continue;
    const routeRe = /(?:pathname|P|p|url) (?:===|==|\.startsWith\(|\.indexOf\()\s*["'`]([^"'`]+)/g;
    let rm;
    while ((rm = routeRe.exec(rf.content))) {
      const p = rm[1].replace(/\$\{[^}]*\}/g, "*").replace(/:(\w+)/g, ":$1");
      if (p.startsWith("/api")) apiServer.add(p.split(/[?#]/)[0]);
    }
  }
  const fetchRe = /\b[a-zA-Z_$][\w$]*\(\s*[`'"]([^`'"]{2,})/g;
  for (const f of textFiles) {
    if (!/\.(js|cjs|mjs|html)$/.test(f.rel)) continue;
    if (isExcludedFromScan(f)) continue;
    let fm;
    fetchRe.lastIndex = 0;
    while ((fm = fetchRe.exec(f.content))) {
      const p = fm[1];
      if (!p.startsWith("/api")) continue;
      const clean = p.split(/[?#]/)[0];
      const templated = clean.includes("${");
      const key = templated ? clean.replace(/\$\{[^}]*\}/g, "*") : clean;
      if (!apiFrontend.has(key)) apiFrontend.set(key, { count: 0, sources: new Set() });
      apiFrontend.get(key).count++;
      apiFrontend.get(key).sources.add(f.rel);
    }
  }
  const apiFindings = [...apiFrontend.entries()].map(([p, v]) => {
    const sources = [...v.sources];
    if (p === "/api" || p === "/api/" || p === "/api/mcq/" || p === "/api/mcq") return { path: p, count: v.count, sources, status: "DYNAMIC_BASE" };
    const testOnly = sources.every((s) => s.startsWith("scripts/"));
    const matched = [...apiServer].some((s) => {
      const sParts = s.split("/").filter(Boolean);
      const pParts = p.replace(/^\//, "").split("/").filter((x) => x !== "*");
      if (sParts.length !== pParts.length) return false;
      return sParts.every((sp, i) => sp === pParts[i] || sp.startsWith(":") || sp === "*");
    });
    if (testOnly) return { path: p, count: v.count, sources, status: matched ? "WORKING_TEST_HARNESS" : "TEST_HARNESS_ONLY" };
    return { path: p, count: v.count, sources, status: matched ? "WORKING" : "UNVERIFIED_STATIC_FALLBACK" };
  });

  /* ---------- github audit ---------- */
  const trackedSet = gitTrackedSet();
  const isGitTracked = (rp) => trackedSet.has(rp);
  const sizeBuckets = [25, 50, 100].map((n) => ({
    threshold_mib: n,
    files: files.filter((f) => f.size > n * MiB).map((f) => ({ path: f.rel, size: f.size, tracked: isGitTracked(f.rel) }))
  }));
  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const trackedSize = files.filter((f) => isGitTracked(f.rel)).reduce((a, f) => a + f.size, 0);
  const envFiles = files.filter((f) => /(^|\/)\.env(\..*)?$/i.test(f.rel) && !/\.example$/.test(f.rel)).map((f) => f.rel);
  const nodeModules = files.filter((f) => f.rel.includes("node_modules/")).map((f) => f.rel);

  /* ---------- write reports ---------- */
  const inv = files.map((f) => ({
    path: f.rel, size: f.size, sha256: f.sha256, mtime: f.mtime,
    classification: f.classification, confidence: f.classificationConfidence, reason: f.classificationReason,
    code_ref_count: f.codeRefCount, total_ref_count: f.totalRefCount, dynamic_ref: f.dynamicRef,
    referenced_by: f.referenced_by.map((r) => r.source),
    git_tracked: isGitTracked(f.rel)
  }));
  fs.writeFileSync(path.join(OUT, "phase35_file_inventory.json"), JSON.stringify({ generated: new Date().toISOString(), files: inv }, null, 1));

  const depGraph = {};
  for (const f of files) if (f.referenced_by.length) depGraph[f.rel] = f.referenced_by;
  fs.writeFileSync(path.join(OUT, "phase35_dependency_graph.json"), JSON.stringify({ generated: new Date().toISOString(), graph: depGraph }, null, 1));

  const unused = files.filter((f) => f.classification === "H").map((f) => ({ file: f.rel, size: f.size, reason: f.classificationReason, refs: f.referenced_by }));
  fs.writeFileSync(path.join(OUT, "phase35_unused_candidates.json"), JSON.stringify(unused, null, 1));
  fs.writeFileSync(path.join(OUT, "phase35_duplicate_candidates.json"), JSON.stringify(duplicates, null, 1));
  const tempCandidates = files.filter((f) => f.classification === "I").map((f) => ({ file: f.rel, size: f.size, sha256: f.sha256, reason: f.classificationReason }));
  fs.writeFileSync(path.join(OUT, "phase35_temp_candidates.json"), JSON.stringify(tempCandidates, null, 1));
  fs.writeFileSync(path.join(OUT, "phase35_dead_controls.json"), JSON.stringify({ buttons: deadControls, note: "buttons with no handler attribute, not in form, not id-bound in page scripts - review only, NO deletion" }, null, 1));
  fs.writeFileSync(path.join(OUT, "phase35_broken_links.json"), JSON.stringify(brokenLinks, null, 1));
  fs.writeFileSync(path.join(OUT, "phase35_api_validation.json"), JSON.stringify(apiFindings, null, 1));
  fs.writeFileSync(path.join(OUT, "phase35_github_audit.json"), JSON.stringify({
    total_files: files.length,
    total_size: totalSize,
    git_tracked_count: trackedSet.size,
    git_tracked_size: trackedSize,
    files_over_25_mib: sizeBuckets[0].files,
    files_over_50_mib: sizeBuckets[1].files,
    files_over_100_mib: sizeBuckets[2].files,
    env_files: envFiles,
    node_modules_files: nodeModules.length,
    secret_hits: secretHits,
    binary_files_over_10_mib: files.filter((f) => f.size > 10 * MiB && !/\.(sqlite)$/.test(f.rel) && !TEXT_EXTS.has(f.ext)).map((f) => ({ path: f.rel, size: f.size, ext: f.ext }))
  }, null, 1));

  const deletable = files.filter((f) => f.deletable).map((f) => ({
    file: f.rel, size: f.size, sha256: f.sha256,
    classification: f.classification, reason: f.classificationReason, confidence: f.classificationConfidence,
    code_ref_count: f.codeRefCount, total_ref_count: f.totalRefCount, git_tracked: isGitTracked(f.rel)
  }));
  const scratch = files.filter((f) => f.classification === "J").map((f) => ({ file: f.rel, size: f.size, reason: f.classificationReason }));
  const generated = files.filter((f) => f.classification === "L").map((f) => ({ file: f.rel, size: f.size, reason: f.classificationReason }));
  const unknown = files.filter((f) => f.classification === "O").map((f) => ({ file: f.rel, size: f.size, reason: f.classificationReason, refs: f.referenced_by }));
  fs.writeFileSync(path.join(OUT, "phase35_dry_run.json"), JSON.stringify({
    generated: new Date().toISOString(),
    deletable_candidates: deletable,
    scratch_candidates: scratch,
    generated_artifacts: generated,
    unknown: unknown,
    totals: {
      total_files: files.length,
      total_size_bytes: totalSize,
      deletable_count: deletable.length,
      deletable_size_bytes: deletable.reduce((a, f) => a + f.size, 0),
      scratch_count: scratch.length,
      generated_count: generated.length,
      unknown_count: unknown.length,
      duplicate_groups: duplicates.length
    }
  }, null, 1));

  /* ---------- summary ---------- */
  const byCls = {};
  for (const f of files) byCls[f.classification] = (byCls[f.classification] || 0) + 1;
  console.log("=== PHASE 35 DRY RUN ===");
  console.log("total files:", files.length, "| total size MiB:", Math.round(totalSize / MiB));
  console.log("git tracked:", trackedSet.size, "files |", Math.round(trackedSize / MiB), "MiB");
  console.log("classification counts:", JSON.stringify(byCls));
  console.log("deletable candidates:", deletable.length, "(", Math.round(deletable.reduce((a, f) => a + f.size, 0) / MiB), "MiB )");
  console.log("unknown:", unknown.length, "| duplicate groups:", duplicates.length);
  console.log("broken links:", brokenLinks.length, "| dead controls:", deadControls.length);
  console.log("secret hits:", secretHits.length, "| env files:", envFiles.length, "| node_modules files:", nodeModules.length);
  for (const d of deletable.slice(0, 30)) console.log("  CANDIDATE:", d.file, "|", Math.round(d.size / 1024), "KiB |", d.classification, "|", d.reason);
  console.log("reports -> docs/phase35_*.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
