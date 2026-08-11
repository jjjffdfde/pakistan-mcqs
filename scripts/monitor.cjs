#!/usr/bin/env node
/* ============================================================
   Phase 26 - STEP 10: Enterprise Monitoring / Health Check
   Read-only observability:
     - API health (starts the real server if not running)
     - DB integrity, size, active MCQs, WAL mode
     - process / uptime info
   Usage: node scripts/monitor.cjs
   Emits: docs/phase26_monitoring.json   (also prints a summary)
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_monitoring.json");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = process.env.MCQS_TEST_DB || path.join(ROOT, "db", "pakistan-mcqs.sqlite");
const PORT = process.env.MCQS_PORT || 8765;

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
  const child = spawn(process.execPath, [path.join(ROOT, "server.js")], {
    cwd: ROOT,
    env: { ...process.env, MCQS_PORT: String(PORT) },
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

async function main() {
  const startedAt = new Date().toISOString();
  const checks = {};

  checks.db = (() => {
    let db;
    try {
      db = new DatabaseSync(DB_PATH, { readOnly: true });
      const rows = {
        mcqs_total: db.prepare("SELECT COUNT(*) n FROM mcqs").get().n,
        mcqs_active: db.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n,
        subjects: db.prepare("SELECT COUNT(*) n FROM subjects").get().n,
        chapters: db.prepare("SELECT COUNT(*) n FROM chapters").get().n,
        topics: db.prepare("SELECT COUNT(*) n FROM topics").get().n,
        integrity: db.prepare("PRAGMA integrity_check").all().every((r) => Object.values(r)[0] === "ok") ? "ok" : "corrupt",
        journal_mode: db.prepare("PRAGMA journal_mode").get().journal_mode,
        page_size: db.prepare("PRAGMA page_size").get().page_size,
        page_count: db.prepare("PRAGMA page_count").get().page_count
      };
      rows.db_bytes = rows.page_count * rows.page_size;
      return { ok: true, ...rows };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      try { db && db.close(); } catch (e) {}
    }
  })();

  checks.db_file = (() => {
    try {
      const st = fs.statSync(DB_PATH);
      return { ok: true, size_bytes: st.size, modified: st.mtime.toISOString() };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  })();

  checks.api = await apiHealth();
  if (!checks.api.ok) checks.api = await bootAndCheck();

  const exitCode = checks.db.ok && checks.api.ok ? 0 : 1;
  const report = {
    step: "monitoring",
    generated_at: startedAt,
    summary: {
      db: checks.db.ok ? "ok" : "FAIL",
      api: checks.api.ok ? "ok" : "FAIL",
      status: exitCode === 0 ? "HEALTHY" : "UNHEALTHY",
      mcqs_active: checks.db.mcqs_active,
      db_size_mb: checks.db_file.ok ? Math.round(checks.db_file.size_bytes / 1048576) : 0,
      api_health_ms: checks.api.ms
    },
    checks
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(`monitor: db=${report.summary.db} api=${report.summary.api} status=${report.summary.status}`);
  console.log(`  mcqs_active=${report.summary.mcqs_active} db_size=${report.summary.db_size_mb} MB api_ms=${report.summary.api_health_ms}`);
  console.log(`report -> docs/phase26_monitoring.json`);
  process.exit(exitCode);
}

main().catch((e) => { console.error("[monitor] ERROR:", e.message); process.exit(1); });
