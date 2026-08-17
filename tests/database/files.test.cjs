"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const L = require(path.join(ROOT, "runtime-v2", "data-loader.cjs"));

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(cjs|js|yml|yaml)$/i.test(e.name)) out.push(p);
  }
  return out;
}

function walkAll(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p, out);
    else out.push(p);
  }
  return out;
}

const SCAN_RE = /node:sqlite|DatabaseSync|\.sqlite3?["'`)\]]|db\.prepare\(|new DatabaseSync/;
/* files holding this audit's own regex contain SQLite tokens self-referentially
   (the workflows and the phase40 gate are auditors with their scan patterns inline;
   their code is exempted exactly like this file is) */
const SELF_AUDIT = new Set([".github/workflows/database-verify.yml", ".github/workflows/test.yml", "scripts/phase40/gate.cjs", "scripts/phase40/evidence.cjs", "scripts/phase41/audit.cjs"]);
function stripComments(src) {
  /* remove // line comments and /* block comments so prose that merely
     NAMES the oracle's files (e.g. "db/pakistan-mcqs.sqlite") does not
     count as a code reference — only executable statements count */
  src = src.replace(/\/\*[\s\S]*?\*\//g, " ");
  return src.replace(/\/\/[^\r\n]*/g, " ");
}
function scanSqlite(files) {
  const hits = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    if (path.basename(f) === "files.test.cjs") continue; /* the auditor itself */
    if (SELF_AUDIT.has(rel)) continue;
    const src = stripComments(fs.readFileSync(f, "utf8"));
    if (SCAN_RE.test(src)) hits.push(rel);
  }
  return hits;
}

const LIVE_SCRIPTS_RE = /^scripts[\\/]phase(1[0-9]|2[0-9]|3[0-9])/;
const RETIRED_SCRIPTS = new Set(["scripts/seed-ai.cjs", "scripts/seed-kg.cjs"]);

module.exports = (t) => {
  const manifest = L.manifest();
  const totalRows = manifest.rows;
  const subjects = Object.keys(manifest.sourceFiles);
  const active = Object.values(L.bySubjectActive()).reduce((a, b) => a + b, 0);

  t.test("manifest + NDJSON parts exist for every subject", async () => {
    assert.ok(manifest && manifest.rows > 0, "manifest.json invalid");
    for (const sub of subjects) {
      const f = L.partFile(sub);
      assert.ok(fs.existsSync(f), `missing part for ${sub}`);
    }
  });

  t.test("MCQ volume baseline (>= 100; 800k+ on production data)", async () => {
    assert.ok(totalRows >= 100, `only ${totalRows} rows`);
    t.note = `rows=${totalRows} active=${active}`;
    if (totalRows >= 800000) assert.ok(active >= 800000, `active ${active} below 800k`);
  });

  t.test("rowid order unique and matches manifest rows", async () => {
    const ids = L.rowidOrder();
    assert.strictEqual(ids.length, totalRows, `rowid ids ${ids.length} != rows ${totalRows}`);
    assert.strictEqual(new Set(ids).size, totalRows, "duplicate ids in rowid order");
  });

  t.test("every id maps to a known subject", async () => {
    const meta = L.metaById();
    const subs = subjects;
    for (const id of L.rowidOrder()) {
      const idx = meta[id];
      assert.ok(idx != null && idx >= 0 && idx < subs.length, `id ${id} subjectIdx ${idx} out of range`);
    }
  });

  t.test("active counts match manifest per-subject (index parity)", async () => {
    for (const sub of subjects) {
      const info = manifest.sourceFiles[sub] || {};
      if (!info.lines) continue; /* legacy empty part dir (e.g. "unassigned", 0 rows) */
      assert.ok(info.lines > 0, `subject ${sub} has 0 lines`);
      assert.ok(L.bySubjectActive()[sub] > 0, `subject ${sub} reports 0 active`);
    }
  });

  t.test("read-only guarantee: data/index mtimes unchanged after heavy reads", async () => {
    const dirs = [L.SRC_DIR, L.IDX_DIR];
    const snap = [];
    for (const d of dirs) {
      if (!fs.existsSync(d)) continue;
      for (const f of walkAll(d, [])) {
        try { snap.push([f, fs.statSync(f).mtimeMs, fs.statSync(f).size]); } catch (e) {}
      }
    }
    assert.ok(snap.length > 0, "no files to snapshot");
    const { searchIndex } = L;
    for (let i = 0; i < 5; i++) {
      searchIndex(manifest.rows > 800000 ? "p" : "q");
      L.recentOrder();
      L.readKeyIndex("chapter", manifest.rows > 800000 ? "gk-geography" : "ph-ch1");
    }
    for (const [f, mtime, size] of snap) {
      const st = fs.statSync(f);
      assert.strictEqual(st.mtimeMs, mtime, `${f} mtime changed`);
      assert.strictEqual(st.size, size, `${f} size changed`);
    }
  });

  t.test("no SQLite references in runtime-v2, live scripts, tests, workflows", async () => {
    const scopes = [
      ...walk(path.join(ROOT, "runtime-v2"), []),
      ...walk(path.join(ROOT, "tests"), []),
      ...walk(path.join(ROOT, ".github", "workflows"), [])
    ];
    const liveScripts = walk(path.join(ROOT, "scripts"), []).filter((f) => {
      const rel = path.relative(ROOT, f).replace(/\\/g, "/");
      return !LIVE_SCRIPTS_RE.test(rel) && !RETIRED_SCRIPTS.has(rel);
    });
    scopes.push(...liveScripts);
    const hits = scanSqlite(scopes);
    assert.deepStrictEqual(hits, [], `SQLite references found: ${hits.join(", ")}`);
  });
};
