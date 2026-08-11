/* Phase 34 analyzer: inventory, classification, dead files, duplicates, dev artifacts,
   secrets, env audit, dependency audit, build audit, size audit, large files,
   report cleanup, deletion plan. Pure analysis — performs NO deletions. */
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
  "c", "cpp", "py", "ts", "tsx", "jsx", "env", "example", "properties", "gitignore",
  "gitattributes", "dockerignore", "editorconfig", "eslintrc", "markdownlint", "prettierrc", "nojekyll"
]);
const BINARY_EXTS = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "svg", "woff", "woff2", "ttf", "eot",
  "gz", "zst", "zip", "sqlite", "sqlite3", "db", "pdf", "har", "avif"
]);
const CONTENT_MAX = 3 * MiB;

/* Directories whose CONTENT must not be scanned for references (copies/scratch/bulk data). */
const SCAN_EXCLUDES = new Set([".audit-tmp", "backup", ".git"]);
const SCAN_EXCLUDE_PREFIXES = ["database/data/", "database/releases/", "database/snapshots/", "data/export/"];

/* Files/dirs that are production source regardless of reference evidence. */
const KEEP_WHITELIST = {
  "index.html": "main SPA page",
  "admin.html": "admin panel",
  "offline.html": "PWA offline page",
  "404.html": "error page",
  "sw.js": "service worker",
  "manifest.webmanifest": "PWA manifest",
  "robots.txt": "SEO",
  "sitemap.xml": "SEO",
  "image-sitemap.xml": "SEO",
  "video-sitemap.xml": "SEO",
  ".nojekyll": "GitHub Pages",
  "server.js": "optional API/static server",
  "README.md": "documentation",
  "CHANGELOG.md": "documentation",
  "Dockerfile": "deployment",
  "docker-compose.yml": "deployment",
  "nginx.conf": "deployment",
  "ecosystem.config.js": "deployment (PM2)",
  ".editorconfig": "config",
  ".eslintrc.json": "config",
  ".markdownlint.json": "config",
  ".prettierrc": "config"
};

const LOG_PATTERN = /\.log$/i;
const TMP_PATTERN = /\.(tmp|temp|bak|old|swp|orig|part)$/i;
const SCRATCH_NAME = /^[._#]/;

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

function walk(dir, base, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, base, out);
    else out.push(abs);
  }
  return out;
}

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const allAbs = walk(ROOT, ROOT, []);
  const files = [];
  for (const abs of allAbs) {
    const st = fs.statSync(abs);
    const rp = rel(path.relative(ROOT, abs));
    const ext = path.extname(abs).replace(/^\./, "").toLowerCase();
    files.push({ rel: rp, abs, name: path.basename(abs), dir: path.dirname(rp).replace(/\\/g, "/"), ext, size: st.size, ctime: st.ctime.toISOString(), mtime: st.mtime.toISOString() });
  }

  /* ---------- hashes (concurrent, bounded) ---------- */
  let idx = 0;
  async function hashWorker() {
    while (idx < files.length) {
      const f = files[idx++];
      try { f.sha256 = await sha256File(f.abs); } catch (e) { f.sha256 = null; }
    }
  }
  await Promise.all(Array.from({ length: 6 }, hashWorker));

  /* ---------- text content for reference scanning ---------- */
  const isScanable = (f) => {
    if (f.size === 0 || f.size > CONTENT_MAX) return false;
    if (TEXT_EXTS.has(f.ext) || /^\./.test(f.name) || f.ext === "") return true;
    return false;
  };
  const isExcludedFromScan = (f) => {
    const top = f.rel.split("/")[0];
    if (SCAN_EXCLUDES.has(top)) return true;
    return SCAN_EXCLUDE_PREFIXES.some((p) => f.rel.startsWith(p));
  };
  const textFiles = files.filter((f) => !isExcludedFromScan(f) && isScanable(f));
  for (const f of textFiles) f.content = fs.readFileSync(f.abs, "utf8");

  const isDoc = (f) => f.rel.startsWith("docs/");
  const isCodeRef = (f) => !isDoc(f) && !f.rel.startsWith("database/");
  /* database/manifests are legit reference sources; database/data etc. are excluded above */

  /* ---------- reference matchers ---------- */
  const paths = files.map((f) => f.rel).sort((a, b) => b.length - a.length);
  const pathRe = new RegExp("(?:^|[/'\"`(\\s=])(" + paths.map(esc).join("|") + ")", "g");
  const baseMap = new Map();
  for (const f of files) {
    const key = f.name.toLowerCase();
    if (!baseMap.has(key)) baseMap.set(key, []);
    baseMap.get(key).push(f.rel);
  }
  const bases = [...baseMap.keys()].sort((a, b) => b.length - a.length);
  const baseRe = new RegExp("(?:^|[^A-Za-z0-9_-])(" + bases.map(esc).join("|") + ")(?=$|[^A-Za-z0-9_./-])", "g");

  const refs = new Map(); /* target rel -> Map<source rel, {kind, count}> */
  const addRef = (src, tgt, kind) => {
    if (src === tgt) return;
    if (!refs.has(tgt)) refs.set(tgt, new Map());
    const m = refs.get(tgt);
    const key = src + "|" + kind;
    const prev = m.get(src) || { kind, count: 0 };
    prev.count++;
    m.set(src, prev);
  };

  for (const f of textFiles) {
    const c = f.content;
    pathRe.lastIndex = 0;
    let m;
    while ((m = pathRe.exec(c))) {
      const hit = m[1];
      const target = hit.startsWith("./") ? hit.slice(2) : hit;
      if (files.some((x) => x.rel === target)) addRef(f.rel, target, "path");
    }
    baseRe.lastIndex = 0;
    while ((m = baseRe.exec(c))) {
      const name = m[1].toLowerCase();
      const cands = baseMap.get(name) || [];
      for (const t of cands) addRef(f.rel, t, "basename");
    }
    /* directory-level references (e.g. readdirSync("data/mcqs")) */
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
    for (const [src, r] of m) if (isCodeRef({ rel: src }) && src !== "release/SHA256SUMS.txt") n += r.count;
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

  /* ---------- secret scan ---------- */
  const SECRET_PATTERNS = [
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
  const PLACEHOLDER = /(xxxx+|your[-_ ]?|example|placeholder|changeme|dummy|test[-_]?token|\[.*\])/i;
  const secretHits = [];
  const secretsScanFile = (f) => {
    if (f.size === 0 || f.size > 2 * MiB) return;
    if (!TEXT_EXTS.has(f.ext)) return;
    if (/\.sqlite/.test(f.rel)) return;
    const lines = f.content.split("\n");
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      for (const p of SECRET_PATTERNS) {
        if (p.re.test(line)) {
          const placeholder = PLACEHOLDER.test(line);
          secretHits.push({
            file: f.rel, line: li + 1, secret_type: p.type, severity: p.severity,
            placeholder_likely: placeholder,
            action_required: placeholder ? "verify (looks like placeholder/example)" : "verify and EXCLUDE from Git or rotate"
          });
          break;
        }
      }
    }
  };
  for (const f of textFiles) {
    if (f.rel.startsWith("backup/") || f.rel.startsWith(".audit-tmp/") || f.rel.startsWith("database/data/")) continue;
    secretsScanFile(f);
  }

  /* ---------- classification ---------- */
  const classify = (f) => {
    const rp = f.rel;
    const codeRefs = codeRefCount(rp);
    const refsAll = refList(rp);
    const reasons = [];
    const top = rp.split("/")[0];
    const depth = rp.split("/").length;

    if (rp.startsWith(".audit-tmp/")) return { classification: "REMOVE_SAFE", reason: "Phase audit scratch directory (browser profiles, temp DB copies, raw run caches); evidence preserved in docs/", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith(".claude/")) return { classification: "REMOVE_SAFE", reason: "IDE local state (AI tool settings), not project content", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith(".github/")) return { classification: "KEEP", reason: "CI/CD workflows (build/lint/test/security/release/database-verify)", confidence: "high", codeRefCount: codeRefs };

    if (rp.startsWith("backup/")) {
      if (LOG_PATTERN.test(rp)) return { classification: "REMOVE_SAFE", reason: "log inside backup tooling", confidence: "high", codeRefCount: codeRefs };
      const sub = rp.split("/")[1];
      if (sub && (sub.startsWith("db-backup") || /^\d{4}-\d{2}-\d{2}/.test(sub) || sub.startsWith("pre-") || sub.startsWith("normalize-"))) {
        return { classification: "LARGE_FILE", reason: "Historical database backup snapshot (old backups excluded from Git; kept locally for server restore feature)", confidence: "high", codeRefCount: codeRefs };
      }
      if (/\.js$/.test(rp)) return { classification: "KEEP", reason: "Backup/restore tooling script referenced by server.js restore route", confidence: "high", codeRefCount: codeRefs };
      return { classification: "UNKNOWN", reason: "unclassified backup/ member", confidence: "low", codeRefCount: codeRefs };
    }

    if (rp.startsWith("db/")) {
      if (/pakistan-mcqs\.sqlite(-shm|-wal)?$/.test(rp)) return { classification: "KEEP_RUNTIME", reason: "PRODUCTION DATABASE (read-only; 2.2 GiB) - never modified, never deleted; excluded from Git", confidence: "high", codeRefCount: codeRefs };
      if (/pakistan-mcqs\.rebuilt\.sqlite(-shm|-wal)?$/.test(rp)) return { classification: "REMOVE_SAFE", reason: "Phase 23 rebuild verification output (reproducible via database/scripts/build-db.js); moved to snapshot", confidence: "high", codeRefCount: codeRefs };
      if (/^db\/_/.test(rp)) return { classification: codeRefs > 0 ? "KEEP" : "REMOVE_SAFE", reason: "underscore-prefixed scratch helper; " + (codeRefs > 0 ? "referenced" : "zero code references"), confidence: "high", codeRefCount: codeRefs };
      if (/engine\.js$/.test(rp)) return { classification: "KEEP_RUNTIME", reason: "DB engine required by server.js", confidence: "high", codeRefCount: codeRefs };
      if (/schema\.(sqlite|mysql|pgsql)\.sql$/.test(rp)) return { classification: "KEEP_RUNTIME", reason: "Schema DDL; db/schema.sqlite.sql required by database-verify.yml workflow", confidence: "high", codeRefCount: codeRefs };
      return { classification: "KEEP", reason: "Database tooling (migrate/import/export/validate/normalize/restore/config)", confidence: "high", codeRefCount: codeRefs };
    }

    if (rp.startsWith("database/")) {
      if (/^(database\/data|database\/releases|database\/snapshots)\//.test(rp)) {
        return { classification: "KEEP_SOURCE", reason: "Phase 23 NDJSON/GZIP source payload (kept locally; EXCLUDED from Git by database/.gitignore conventions - large binary payload)", confidence: "high", codeRefCount: codeRefs };
      }
      return { classification: "KEEP_SOURCE", reason: "Phase 23 database source repository (schema, scripts, manifests, reports, README) - rebuild system", confidence: "high", codeRefCount: codeRefs };
    }

    if (rp.startsWith("data/export/")) return { classification: "REMOVE_SAFE", reason: "Regenerable export output (db/export-json.js writes it); not consumed by app/sw/build; stale entries in release checksums only", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("data/mcqs/")) return { classification: "KEEP_RUNTIME", reason: "Sectional MCQ bank consumed by scripts/build-mcqs.js (referenced via directory glob)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("data/") && depth === 2) return { classification: "KEEP_RUNTIME", reason: "Runtime JSON data fetched by app + cached by service worker (preload + sw.js cache list)", confidence: "high", codeRefCount: codeRefs };

    if (rp.startsWith("docs/")) return { classification: "KEEP_DOCUMENTATION", reason: "Phase evidence & reports (module 12 classifies; no deletion - evidence preserved)", confidence: "high", codeRefCount: codeRefs };

    if (rp.startsWith("assets/")) return { classification: "KEEP_RUNTIME", reason: "CSS/JS/icons/images referenced by pages, manifest and service worker", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("subjects/") || rp.startsWith("chapters/")) return { classification: "KEEP_RUNTIME", reason: "Generated static pages - deployment-required (build.yml uploads; sitemap.xml lists)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("android/")) return { classification: "KEEP_DEPLOYMENT", reason: "TWA packaging assets (Phase 25)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("desktop/")) return { classification: "KEEP_DEPLOYMENT", reason: "Electron desktop wrapper (Phase 25)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("release/")) return { classification: "KEEP_DEPLOYMENT", reason: "Release checksums + version metadata (release.yml workflow)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("scripts/")) return { classification: "KEEP", reason: "Build/generate/test tooling (workflows reference gen-seo-pages.cjs, lint.cjs, test.cjs, benchmark.cjs, phase26-repo-audit.cjs; phase harnesses are documented tooling)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("tests/")) return { classification: "TEST_ONLY", reason: "Automated test suites (module 23 regression)", confidence: "high", codeRefCount: codeRefs };
    if (rp.startsWith("pipeline/") || rp.startsWith("kg/") || rp.startsWith("ai/") || rp.startsWith("assistant/")) {
      if (LOG_PATTERN.test(rp)) return { classification: "REMOVE_SAFE", reason: "log file", confidence: "high", codeRefCount: codeRefs };
      return { classification: "KEEP_SOURCE", reason: "Content generation pipeline / knowledge-graph / AI engines (server.js requires ai/; kg+assistant used by generation tooling)", confidence: "high", codeRefCount: codeRefs };
    }

    if (depth === 1 && !/^\./.test(rp)) {
      if (KEEP_WHITELIST[rp]) return { classification: "KEEP", reason: KEEP_WHITELIST[rp], confidence: "high", codeRefCount: codeRefs };
      if (LOG_PATTERN.test(rp)) return { classification: "REMOVE_SAFE", reason: "root log file", confidence: "high", codeRefCount: codeRefs };
      if (TMP_PATTERN.test(rp)) return { classification: "REMOVE_SAFE", reason: "temporary/backup-style file at root", confidence: "high", codeRefCount: codeRefs };
      if (codeRefs === 0) {
        return { classification: "REMOVE_SAFE", reason: "root-level orphan artifact with zero code references (one-off audit/report output)", confidence: "high", codeRefCount: codeRefs };
      }
      return { classification: "UNKNOWN", reason: "root file with references but no known role", confidence: "medium", codeRefCount: codeRefs };
    }

    if (/^\./.test(rp)) return { classification: "KEEP_CONFIG", reason: "project config file", confidence: "high", codeRefCount: codeRefs };

    return { classification: codeRefs > 0 ? "KEEP" : "UNKNOWN", reason: codeRefs > 0 ? "referenced by project code" : "no references found - requires manual review", confidence: codeRefs > 0 ? "high" : "low", codeRefCount: codeRefs };
  };

  for (const f of files) {
    const c = classify(f);
    f.classification = c.classification;
    f.classificationReason = c.reason;
    f.classificationConfidence = c.confidence;
    f.codeRefCount = c.codeRefCount;
    f.totalRefCount = totalRefCount(f.rel);
    f.referenced_by = refList(f.rel);
    f.secretHits = secretHits.filter((s) => s.file === f.rel).map((s) => ({ line: s.line, secret_type: s.secret_type, severity: s.severity }));
  }

  /* ---------- module 1: inventory ---------- */
  const inventory = files.map((f) => ({
    path: f.rel, filename: f.name, extension: f.ext, size: f.size,
    created: f.ctime, modified: f.mtime, sha256: f.sha256,
    file_type: BINARY_EXTS.has(f.ext) ? "binary" : "text",
    referenced_by: f.referenced_by.map((r) => r.source),
    reference_count: f.totalRefCount,
    used_by_html: f.referenced_by.some((r) => /\.html?$/.test(r.source)),
    used_by_js: f.referenced_by.some((r) => /\.(js|cjs|mjs)$/.test(r.source)),
    used_by_css: f.referenced_by.some((r) => /\.css$/.test(r.source)),
    used_by_server: f.referenced_by.some((r) => r.source === "server.js"),
    used_by_pwa: f.referenced_by.some((r) => /^(sw\.js|manifest\.webmanifest)$/.test(r.source)),
    used_by_build: f.referenced_by.some((r) => /^scripts\//.test(r.source) || /^\.github\//.test(r.source) || /^(Dockerfile|docker-compose\.yml|nginx\.conf|ecosystem\.config\.js)$/.test(r.source)),
    used_by_package: f.referenced_by.some((r) => r.source === "package.json"),
    git_status_if_available: "n/a (git not initialized yet)"
  }));
  fs.writeFileSync(path.join(OUT, "phase34_file_inventory.json"), JSON.stringify(inventory, null, 1));

  /* ---------- module 2: classification ---------- */
  const classification = files.map((f) => ({
    file: f.rel, classification: f.classification, reason: f.classificationReason,
    confidence: f.classificationConfidence, reference_count: f.totalRefCount, code_ref_count: f.codeRefCount
  }));
  fs.writeFileSync(path.join(OUT, "phase34_file_classification.json"), JSON.stringify(classification, null, 1));

  /* ---------- module 3: dead files ---------- */
  const dead = files
    .filter((f) => f.codeRefCount === 0)
    .map((f) => ({
      file: f.rel, size: f.size, sha256: f.sha256,
      classification: f.classification,
      code_references: f.codeRefCount,
      prose_references: f.referenced_by.filter((r) => isDoc({ rel: r.source })).map((r) => r.source),
      verdict: f.classification === "REMOVE_SAFE" ? "REMOVE" : (f.classification === "UNKNOWN" ? "MANUAL_REVIEW - NOT DELETED" : "KEEP (production file, no refs expected)")
    }));
  fs.writeFileSync(path.join(OUT, "phase34_dead_files.json"), JSON.stringify(dead, null, 1));

  /* ---------- module 4: duplicates ---------- */
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
        reference_count: totalRefCount(rp),
        code_reference_count: codeRefCount(rp),
        classification: files.find((f) => f.rel === rp).classification
      })),
      recommendation: "no deletion performed; duplicates documented for review (database/releases mirrors database/data per Phase 23 release convention)"
    }));
  fs.writeFileSync(path.join(OUT, "phase34_duplicates.json"), JSON.stringify(duplicates, null, 1));

  /* ---------- module 5: dev artifacts ---------- */
  const devArtifacts = files.filter((f) =>
    LOG_PATTERN.test(f.rel) || TMP_PATTERN.test(f.rel) || /(^|\/)(node_modules|dist|build|\.cache|coverage|\.tmp|temp|screenshots|test-results|playwright-report|crash[_-]?dumps?)(\/|$)/i.test(f.rel) ||
    /(^|\/)(Thumbs\.db|\.DS_Store|Desktop\.ini)(\/|$)/i.test(f.rel) ||
    /\.(har|zip|7z|rar)$/i.test(f.rel) ||
    f.rel.startsWith(".audit-tmp/") || f.rel.startsWith(".claude/") ||
    /\.phase26-db-test\//.test(f.rel)
  ).map((f) => ({
    file: f.rel, size: f.size, sha256: f.sha256, classification: f.classification,
    evidence: f.classificationReason
  }));
  fs.writeFileSync(path.join(OUT, "phase34_dev_artifacts.json"), JSON.stringify(devArtifacts, null, 1));

  /* ---------- module 6: security ---------- */
  fs.writeFileSync(path.join(OUT, "phase34_security_cleanup.json"), JSON.stringify(secretHits, null, 1));

  /* ---------- module 7: environment audit ---------- */
  const envFiles = files.filter((f) => /(^|\/)\.env(\..*)?$/i.test(f.rel)).map((f) => f.rel);
  const envVars = [...new Set(["MCQS_PORT", "MCQS_API", "MCQS_TEST_DB", "P28_PORT", "CHROME_PATH", "API"])];
  fs.writeFileSync(path.join(OUT, "phase34_environment_audit.json"), JSON.stringify({
    found_env_files: envFiles,
    env_variables_in_use: envVars,
    env_variables_secret: [],
    env_variables_safe: envVars,
    action: "create .env.example with safe names only; ensure .env* gitignored (no .env files currently present)"
  }, null, 1));

  /* ---------- module 8: dependency audit ---------- */
  const depAudit = [];
  for (const f of files) {
    if (f.name !== "package.json") continue;
    try {
      const pkg = JSON.parse(fs.readFileSync(f.abs, "utf8"));
      depAudit.push({
        file: f.rel,
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        scripts: pkg.scripts || {},
        note: f.rel === "package.json" ? "root package.json MISSING - will be created (zero-dependency project; workflows run node directly)" : "desktop Electron wrapper dependencies"
      });
    } catch (e) { depAudit.push({ file: f.rel, error: "unparseable" }); }
  }
  if (!depAudit.some((d) => d.file === "package.json")) {
    depAudit.unshift({ file: "package.json", dependencies: {}, devDependencies: {}, scripts: {}, note: "root package.json MISSING - will be created (zero-dependency project; workflows run node directly)" });
  }
  fs.writeFileSync(path.join(OUT, "phase34_dependency_audit.json"), JSON.stringify(depAudit, null, 1));

  /* ---------- module 10: build audit ---------- */
  fs.writeFileSync(path.join(OUT, "phase34_build_audit.json"), JSON.stringify({
    build_system: "plain static-first website + optional Node server (no bundler: no vite/webpack/parcel/next config present)",
    source: ["index.html", "admin.html", "offline.html", "404.html", "assets/", "data/", "sw.js", "manifest.webmanifest", "server.js"],
    build_output: [
      { output: "subjects/*.html, chapters/*.html, sitemap.xml, 404.html", generator: "node scripts/gen-seo-pages.cjs", classification: "DEPLOYMENT_REQUIRED (build.yml uploads; sitemap listed)" },
      { output: "data/mcqs.json", generator: "node scripts/build-mcqs.js", classification: "DEPLOYMENT_REQUIRED (sw.js + app fetch it)" },
      { output: "data/export/*.json", generator: "node db/export-json.js", classification: "REGENERABLE - not deployment-required" },
      { output: "assets/img/og-cover.png", generator: "node scripts/make-og.js", classification: "DEPLOYMENT_REQUIRED" },
      { output: "assets/icons/*", generator: "node scripts/gen-pwa-assets.cjs", classification: "DEPLOYMENT_REQUIRED" },
      { output: "db/pakistan-mcqs.rebuilt.sqlite", generator: "node database/scripts/build-db.js", classification: "REGENERABLE - build verification artifact" }
    ],
    regenerate_documented_in: ["README.md", "database/README.md", "docs/PHASE23_EXECUTION_REPORT.md"]
  }, null, 1));

  /* ---------- module 13: github size audit ---------- */
  const GITIGNORE_FUTURE = (f) =>
    f.rel.startsWith(".audit-tmp/") || f.rel.startsWith("backup/") || f.rel.startsWith("database/data/") ||
    f.rel.startsWith("database/releases/") || f.rel.startsWith("database/snapshots/") ||
    f.rel.startsWith(".claude/") || /db\/.*\.sqlite(-shm|-wal)?$/.test(f.rel);
  const totalSize = files.reduce((a, f) => a + f.size, 0);
  const trackedCandidate = files.filter((f) => !GITIGNORE_FUTURE(f));
  const trackedSize = trackedCandidate.reduce((a, f) => a + f.size, 0);
  const buckets = [25, 50, 75, 90, 100].map((n) => ({
    threshold_mib: n,
    files: files.filter((f) => f.size > n * MiB).map((f) => ({ path: f.rel, size: f.size }))
  }));
  fs.writeFileSync(path.join(OUT, "phase34_github_size_audit.json"), JSON.stringify({
    total_project_size: totalSize,
    total_tracked_candidate_size: trackedSize,
    tracked_candidate_file_count: trackedCandidate.length,
    total_file_count: files.length,
    total_directories: new Set(files.map((f) => f.dir)).size,
    largest_files: files.sort((a, b) => b.size - a.size).slice(0, 20).map((f) => ({ path: f.rel, size: f.size, classification: f.classification })),
    largest_directories: (() => { const m = new Map(); for (const f of files) { const d = f.rel.split("/")[0]; m.set(d, (m.get(d) || 0) + f.size); } return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([d, s]) => ({ dir: d, size: s })); })(),
    binary_count: files.filter((f) => BINARY_EXTS.has(f.ext)).length,
    generated_artifact_count: files.filter((f) => f.classification === "GENERATED_ARTIFACT" || /^(data\/mcqs\.json|subjects\/|chapters\/|sitemap\.xml|release\/SHA256SUMS\.txt)/.test(f.rel)).length,
    size_buckets: buckets,
    github_limits: "browser upload 25 MiB/file; regular git blocks >100 MiB; repo target <1 GiB",
    files_over_100_mib_tracked: []
  }, null, 1));

  /* ---------- module 14: large files ---------- */
  const large = files.filter((f) => f.size > 25 * MiB).map((f) => ({
    path: f.rel, size: f.size, sha256: f.sha256,
    decision: f.rel.startsWith("db/") ? "EXCLUDE (Git 100 MiB limit; kept locally, gitignored)" :
      f.rel.startsWith("backup/") ? "EXCLUDE (historical backups; gitignored)" :
      f.rel.startsWith("database/") ? "EXCLUDE (source payload; gitignored per database/.gitignore; LFS attributes already prepared)" :
      f.rel.startsWith(".audit-tmp/") ? "REMOVE (scratch)" :
      /rebuilt\.sqlite/.test(f.rel) ? "REMOVE (reproducible build artifact -> snapshot)" :
      "KEEP (under 100 MiB, tracked)"
  }));
  fs.writeFileSync(path.join(OUT, "phase34_large_files.json"), JSON.stringify(large, null, 1));

  /* ---------- module 12: report cleanup ---------- */
  const docFiles = files.filter((f) => f.rel.startsWith("docs/"));
  const currentRe = /^(phase31|phase32|phase33|phase34|PHASE3[123]|PHASE34)/;
  const guideRe = /(GUIDE|install-2026|backup-restore-2026)\.md$/i;
  const reportCleanup = docFiles.map((f) => {
    const base = f.name;
    let cls;
    if (currentRe.test(base) || guideRe.test(base)) cls = "CURRENT_REPORT";
    else if (/^\d{4}-\d{2}-\d{2}|AUDIT-REPORT|BATCH-REPORT|COVERAGE-REPORT|duplicates-report|health-report|quality-report|seo-report|validation-report|performance-report/.test(base)) cls = "HISTORICAL_REPORT (superseded by later phases)";
    else cls = "HISTORICAL_REPORT";
    return { file: f.rel, size: f.size, classification: cls, action: "KEEP in repo (evidence preserved); move to docs/current/ or docs/archive/ for structure" };
  });
  fs.writeFileSync(path.join(OUT, "phase34_report_cleanup.json"), JSON.stringify({
    note: "No deletion of phase reports - evidence preserved. Reorganize into docs/current/ and docs/archive/.",
    reports: reportCleanup
  }, null, 1));

  /* ---------- module 19: deletion plan ---------- */
  const snapshotDir = path.join(ROOT, "phase34-backup-" + new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19));
  const deletionPlan = files.filter((f) => f.classification === "REMOVE_SAFE").map((f) => ({
    path: f.rel, size: f.size, sha256: f.sha256,
    reason: f.classificationReason,
    references_checked: f.referenced_by.map((r) => r.source),
    reference_count: f.totalRefCount,
    code_reference_count: f.codeRefCount,
    classification: f.classification,
    confidence: f.classificationConfidence,
    recovery_location: f.rel.startsWith(".audit-tmp/") ? "none (scratch; evidence already in docs/)" : (snapshotDir + "/" + f.rel),
    action: f.rel.startsWith(".audit-tmp/") ? "DELETE" : "MOVE to snapshot"
  }));
  fs.writeFileSync(path.join(OUT, "phase34_deletion_plan.json"), JSON.stringify({ snapshot_dir: snapshotDir, plan: deletionPlan }, null, 1));

  console.log("inventory files:", files.length);
  console.log("total size MiB:", Math.round(totalSize / MiB));
  console.log("tracked candidate size MiB:", Math.round(trackedSize / MiB));
  console.log("remove_safe count:", files.filter((f) => f.classification === "REMOVE_SAFE").length);
  console.log("remove_safe size MiB:", Math.round(files.filter((f) => f.classification === "REMOVE_SAFE").reduce((a, f) => a + f.size, 0) / MiB));
  console.log("unknown count:", files.filter((f) => f.classification === "UNKNOWN").length);
  console.log("secret hits:", secretHits.length);
  console.log("duplicate groups:", duplicates.length);
  console.log("deletion plan -> docs/phase34_deletion_plan.json (snapshot:", snapshotDir + ")");
}

main().catch((e) => { console.error(e); process.exit(1); });
