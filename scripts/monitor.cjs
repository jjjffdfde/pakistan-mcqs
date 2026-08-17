#!/usr/bin/env node
/* ============================================================
   Phase 26 - STEP 10 + Phase 40 migration: Monitoring / Health
   Read-only observability (no SQLite):
     - API health (starts runtime-v2 if not running)
     - data / index integrity, sizes, active MCQs
     - process / uptime info
   Usage: node scripts/monitor.cjs
   Emits: docs/phase26_monitoring.json   (also prints a summary)
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_monitoring.json");
const L = require("../runtime-v2/data-loader.cjs");
const Q = require("../runtime-v2/query-engine.cjs");

const PORT = process.env.MCQS_PORT || 8766;

async function apiHealth() {
  const t0 = Date.now();
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/health`, { signal: AbortSignal.timeout(3000) });
    let body = null;
    try { body = await res.json(); } catch (e) {}
    return { ok: res.ok, status: res.status, ms: Date.now() - t0, body, server_was_running: true };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, error: e.message, server_was_running: false };
  }
}

async function bootAndCheck() {
  const { spawn } = require("child_process");
  const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], {
    cwd: ROOT,
    env: { ...process.env, MCQS_PORT: String(PORT), MCQS_JSON_PORT: String(PORT) },
    stdio: "ignore"
  });
  const t0 = Date.now();
  for (let i = 0; i < 60; i++) {
    const h = await apiHealth();
    if (h.ok) { try { child.kill("SIGTERM"); } catch (e) {} return { ...h, booted_for_check: true, boot_ms: Date.now() - t0 }; }
    await new Promise((r) => setTimeout(r, 500));
  }
  try { child.kill("SIGTERM"); } catch (e) {}
  return { ok: false, status: 0, ms: Date.now() - t0, error: "server did not become healthy within 30s", booted_for_check: true };
}

function walkBytes(d) {
  let b = 0, n = 0;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { const s = walkBytes(p); b += s.bytes; n += s.files; }
    else { n++; try { b += fs.statSync(p).size; } catch (e2) {} }
  }
  return { bytes: b, files: n };
}

async function main() {
  const startedAt = new Date().toISOString();
  const checks = {};

  checks.data = (() => {
    try {
      const manifest = L.manifest();
      const bySub = L.bySubjectActive();
      const active = Object.values(bySub).reduce((a, b) => a + b, 0);
      const subKeys = Object.keys(manifest.sourceFiles).sort();
      const idxStat = walkBytes(L.IDX_DIR);
      const partsStat = walkBytes(path.join(L.SRC_DIR, "mcqs"));
      const requiredIdx = ["manifest.json", "mcq_by_id.json", "mcq_by_subject.json", "recent.json"];
      const missing = requiredIdx.filter((f) => !fs.existsSync(path.join(L.IDX_DIR, f)));
      /* legacy empty part dirs (e.g. "unassigned", 0 rows) are not subjects */
      const populated = subKeys.filter((s) => (manifest.sourceFiles[s] || {}).lines > 0);
      const subjectOk = populated.every((s) => (bySub[s] || 0) > 0);
      const staleSubjects = populated.filter((s) => !(bySub[s] > 0));
      return {
        ok: !missing.length && subjectOk && manifest.rows > 0,
        error: missing.length ? "missing index files: " + missing.join(",") : (staleSubjects.length ? "subjects with 0 active: " + staleSubjects.join(",") : undefined),
        mcqs_total: manifest.rows,
        mcqs_active: active,
        subjects: populated.length,
        integrity: !missing.length && subjectOk ? "ok" : "corrupt",
        index_files: idxStat.files,
        index_bytes: idxStat.bytes,
        parts_bytes: partsStat.bytes,
        last_updated: manifest.maxCreatedAt,
        data_source: L.SRC_DIR
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  })();

  checks.ai_store = (() => {
    try {
      const dir = path.join(L.USER_DIR);
      if (!fs.existsSync(dir)) return { ok: false, error: "userdata dir missing" };
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
      return { ok: true, store_files: files.length, store_bytes: walkBytes(dir).bytes };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  })();

  checks.api = await apiHealth();
  if (!checks.api.ok) checks.api = await bootAndCheck();

  const exitCode = checks.data.ok && checks.api.ok ? 0 : 1;
  const report = {
    step: "monitoring",
    generated_at: startedAt,
    summary: {
      data: checks.data.ok ? "ok" : "FAIL",
      api: checks.api.ok ? "ok" : "FAIL",
      status: exitCode === 0 ? "HEALTHY" : "UNHEALTHY",
      mcqs_active: checks.data.mcqs_active,
      db_size_mb: Math.round((checks.data.parts_bytes + checks.data.index_bytes) / 1048576),
      api_health_ms: checks.api.ms
    },
    checks
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(`monitor: data=${report.summary.data} api=${report.summary.api} status=${report.summary.status}`);
  console.log(`  mcqs_active=${report.summary.mcqs_active} size=${report.summary.db_size_mb} MB api_ms=${report.summary.api_health_ms}`);
  console.log(`report -> docs/phase26_monitoring.json`);
  process.exit(exitCode);
}

main().catch((e) => { console.error("[monitor] ERROR:", e.message); process.exit(1); });