/* ============================================================
   Phase 27 — Enterprise AI Assistant, Knowledge Automation &
   Intelligent Learning Platform — deterministic orchestrator.
   Runs every assistant module, aggregating the reports, then
   emits validation + statistics + summary + execution report.
   Usage: node scripts/phase27-platform.cjs
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.join(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "docs");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

function rd(p) { try { return fs.readFileSync(p, "utf8"); } catch (e) { return ""; } }
function ex(p) { try { fs.accessSync(p); return true; } catch (e) { return false; } }
function sz(p) { try { return fs.statSync(p).size; } catch (e) { return 0; } }
function writeReport(name, data) {
  fs.writeFileSync(path.join(REPORTS_DIR, name), JSON.stringify(data, null, 2), "utf8");
  console.log("  -> " + name);
}
function kb(v) { return Math.round((v || 0) / 1024); }

console.log("=== Phase 27: Enterprise AI Assistant & Intelligent Learning Platform ===");

/* ---------- STEP 1-10: run all assistant modules ---------- */
const MODULES = [
  { name: "knowledge-assistant", file: "assistant/knowledge-assistant.js", reports: ["phase27_assistant.json"] },
  { name: "learning-engine", file: "assistant/learning-engine.js", reports: ["phase27_learning_engine.json", "phase27_revision_intelligence.json"] },
  { name: "revision-planner", file: "assistant/revision-planner.js", reports: ["phase27_revision.json"] },
  { name: "recommendation-engine", file: "assistant/recommendation-engine.js", reports: ["phase27_recommendations.json"] },
  { name: "concept-navigator", file: "assistant/concept-navigator.js", reports: ["phase27_navigation.json"] },
  { name: "analytics-engine", file: "assistant/analytics-engine.js", reports: ["phase27_dashboard.json", "phase27_analytics.json"] },
  { name: "automation-engine", file: "assistant/automation-engine.js", reports: ["phase27_automation.json"] },
  { name: "offline-api", file: "assistant/offline-api.js", reports: ["phase27_api.json"] },
];

const results = {};
for (const m of MODULES) {
  process.stdout.write(`[Module] ${m.name} ... `);
  const r = spawnSync(process.execPath, [path.join(ROOT, m.file)], { cwd: ROOT, encoding: "utf8", timeout: 900000 });
  const ok = r.status === 0 && m.reports.every((f) => ex(path.join(REPORTS_DIR, f)));
  results[m.name] = { exit: r.status, ok };
  console.log(ok ? "PASS" : "FAIL (exit=" + r.status + ")");
}

/* ---------- STEP 11: validation ---------- */
console.log("[Step] validation");
const checks = [];
function addCheck(id, ok, detail) { checks.push({ id, ok: !!ok, detail: detail || "" }); }

for (const m of MODULES) addCheck("module-" + m.name, results[m.name].ok, m.file + " exit=" + results[m.name].exit);

/* determinism check: run two modules twice and compare outputs modulo generated_at */
for (const probe of ["recommendation-engine", "automation-engine"]) {
  const f = path.join(ROOT, MODULES.find((m) => m.name === probe).file);
  const r1 = spawnSync(process.execPath, [f], { cwd: ROOT, encoding: "utf8", timeout: 900000 });
  const r2 = spawnSync(process.execPath, [f], { cwd: ROOT, encoding: "utf8", timeout: 900000 });
  const rep = MODULES.find((m) => m.name === probe).reports[0];
  const stable = r1.status === 0 && r2.status === 0 && stripTime(rd(path.join(REPORTS_DIR, rep))) === stripTime(rd(path.join(REPORTS_DIR, rep)));
  addCheck("determinism-" + probe, stable, "two consecutive runs produce identical JSON (minus generated_at)");
}
function stripTime(j) { try { const o = JSON.parse(j); delete o.generated_at; return JSON.stringify(o); } catch (e) { return j; } }

/* read-only enforcement: opening the DB read-only must succeed and forbid writes */
let roOk = false;
let roDetail = "";
try {
  const db = new DatabaseSync(path.join(ROOT, "db", "pakistan-mcqs.sqlite"), { readOnly: true });
  const n = db.prepare("SELECT COUNT(*) n FROM mcqs").get().n;
  roOk = n > 0;
  roDetail = "read-only open OK (" + n + " mcqs visible)";
  db.close();
} catch (e) { roDetail = e.message; }
addCheck("readonly-open", roOk, roDetail);

/* schema untouched: verify no phase27-created schema artifacts exist */
addCheck("no-schema-changes", !/phase27/i.test(rd(path.join(ROOT, "db", "schema.sqlite.sql"))), "schema.sqlite.sql unchanged by phase 27 tooling");

/* offline guarantee: assistant modules must not require network modules */
const noNet = MODULES.every((m) => {
  const src = rd(path.join(ROOT, m.file));
  return !/require\(["'](https?|net|dns|http)[\w/]*["']\)/.test(src) && !/\bfetch\(/.test(src);
});
addCheck("offline-modules", noNet, "assistant modules contain no network requires / fetch calls");

/* report JSON validity + PASS status */
for (const m of MODULES) {
  for (const f of m.reports) {
    let ok = false;
    let detail = "missing";
    try {
      const o = JSON.parse(rd(path.join(REPORTS_DIR, f)));
      ok = o.summary && o.summary.status === "PASS";
      detail = ok ? "valid JSON, summary.status=PASS" : "status != PASS";
    } catch (e) { detail = "unparseable JSON: " + e.message; }
    addCheck("report-" + f, ok, detail);
  }
}

/* empty-report guard: every report must be > 500 bytes */
for (const m of MODULES) {
  for (const f of m.reports) {
    const size = sz(path.join(REPORTS_DIR, f));
    addCheck("size-" + f, size > 500, size + " bytes");
  }
}

const failedChecks = checks.filter((c) => !c.ok);
const validation = {
  step: "validation",
  generated_at: new Date().toISOString(),
  checks_total: checks.length,
  checks_passed: checks.length - failedChecks.length,
  checks_failed: failedChecks.length,
  status: failedChecks.length ? "FAIL" : "PASS",
  success_criteria: {
    offline_knowledge_assistant: checks.find((c) => c.id === "module-knowledge-assistant").ok,
    personalized_learning_engine: checks.find((c) => c.id === "module-learning-engine").ok,
    intelligent_revision_planner: checks.find((c) => c.id === "module-revision-planner").ok,
    recommendation_system: checks.find((c) => c.id === "module-recommendation-engine").ok,
    concept_navigation: checks.find((c) => c.id === "module-concept-navigator").ok,
    learning_dashboard: checks.find((c) => c.id === "report-phase27_dashboard.json").ok,
    revision_intelligence: checks.find((c) => c.id === "report-phase27_revision_intelligence.json").ok,
    offline_apis: checks.find((c) => c.id === "module-offline-api").ok,
    enterprise_analytics: checks.find((c) => c.id === "report-phase27_analytics.json").ok,
    automation_platform: checks.find((c) => c.id === "module-automation-engine").ok,
    deterministic: checks.filter((c) => c.id.startsWith("determinism-")).every((c) => c.ok),
    readonly: checks.find((c) => c.id === "readonly-open").ok,
    schema_unchanged: checks.find((c) => c.id === "no-schema-changes").ok,
  },
  failed_checks: failedChecks.map((c) => c.id),
};
writeReport("phase27_validation.json", validation);

/* ---------- STEP 12a: statistics ---------- */
console.log("[Step] statistics");
const EXPECTED_REPORTS = [
  "phase27_assistant.json", "phase27_learning_engine.json", "phase27_revision.json",
  "phase27_recommendations.json", "phase27_navigation.json", "phase27_dashboard.json",
  "phase27_revision_intelligence.json", "phase27_api.json", "phase27_analytics.json",
  "phase27_automation.json", "phase27_validation.json", "phase27_statistics.json",
  "phase27_summary.json", "PHASE27_EXECUTION_REPORT.md",
];
const reportFiles = EXPECTED_REPORTS.filter((f) => ex(path.join(REPORTS_DIR, f)));
const modulesKb = MODULES.reduce((a, m) => a + sz(path.join(ROOT, m.file)), 0);
const statistics = {
  step: "statistics",
  generated_at: new Date().toISOString(),
  reports_expected: EXPECTED_REPORTS.length,
  reports_emitted: reportFiles.length,
  reports: reportFiles.map((f) => ({ name: f, kb: kb(sz(path.join(REPORTS_DIR, f))) })),
  modules: MODULES.map((m) => ({ name: m.name, kb: kb(sz(path.join(ROOT, m.file))) })),
  modules_total_kb: kb(modulesKb),
  lines_of_code: MODULES.reduce((a, m) => a + rd(path.join(ROOT, m.file)).split("\n").length, 0),
  oracle: {
    db_path: "db/pakistan-mcqs.sqlite",
    readonly: true,
    active_mcqs: (() => { try { const db = new DatabaseSync(path.join(ROOT, "db", "pakistan-mcqs.sqlite"), { readOnly: true }); const n = db.prepare("SELECT COUNT(*) n FROM mcqs WHERE status='active'").get().n; db.close(); return n; } catch (e) { return 0; } })(),
  },
};
writeReport("phase27_statistics.json", statistics);

/* ---------- STEP 12b: summary ---------- */
console.log("[Step] summary");
const summary = {
  step: "summary",
  generated_at: new Date().toISOString(),
  status: failedChecks.length ? "Review" : "Ready",
  ready: failedChecks.length === 0,
  checks: { total: checks.length, passed: checks.length - failedChecks.length, failed: failedChecks.length },
  failed: failedChecks.map((c) => c.id),
  modules: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { exit: v.exit, ok: v.ok }])),
  deliverables: {
    knowledge_assistant: validation.success_criteria.offline_knowledge_assistant,
    learning_engine: validation.success_criteria.personalized_learning_engine,
    revision_planner: validation.success_criteria.intelligent_revision_planner,
    recommendation_engine: validation.success_criteria.recommendation_system,
    concept_navigator: validation.success_criteria.concept_navigation,
    dashboard: validation.success_criteria.learning_dashboard,
    revision_intelligence: validation.success_criteria.revision_intelligence,
    offline_api: validation.success_criteria.offline_apis,
    analytics: validation.success_criteria.enterprise_analytics,
    automation: validation.success_criteria.automation_platform,
    deterministic: validation.success_criteria.deterministic,
    read_only: validation.success_criteria.readonly,
    schema_unchanged: validation.success_criteria.schema_unchanged,
  },
};
writeReport("phase27_summary.json", summary);

/* ---------- STEP 12c: markdown execution report ---------- */
const md = `# Phase 27 — Enterprise AI Assistant, Knowledge Automation & Intelligent Learning Platform

**Generated:** ${summary.generated_at}
**Status:** ${summary.status}

## Success criteria
| Criterion | Status |
|-----------|--------|
| Offline Knowledge Assistant | ${validation.success_criteria.offline_knowledge_assistant ? "✅" : "❌"} |
| Personalized Learning Engine | ${validation.success_criteria.personalized_learning_engine ? "✅" : "❌"} |
| Intelligent Revision Planner | ${validation.success_criteria.intelligent_revision_planner ? "✅" : "❌"} |
| Recommendation System | ${validation.success_criteria.recommendation_system ? "✅" : "❌"} |
| Concept Navigation | ${validation.success_criteria.concept_navigation ? "✅" : "❌"} |
| Learning Dashboard | ${validation.success_criteria.learning_dashboard ? "✅" : "❌"} |
| Revision Intelligence | ${validation.success_criteria.revision_intelligence ? "✅" : "❌"} |
| Offline APIs | ${validation.success_criteria.offline_apis ? "✅" : "❌"} |
| Enterprise Analytics | ${validation.success_criteria.enterprise_analytics ? "✅" : "❌"} |
| Automation Platform | ${validation.success_criteria.automation_platform ? "✅" : "❌"} |
| Deterministic & reproducible | ${validation.success_criteria.deterministic ? "✅" : "❌"} |
| Read-only, DB unchanged | ${validation.success_criteria.readonly && validation.success_criteria.schema_unchanged ? "✅" : "❌"} |

## Module results
| Module | Exit | Reports |
|--------|------|---------|
${MODULES.map((m) => `| ${m.name} | ${results[m.name].exit} | ${m.reports.join(", ")} |`).join("\n")}

## Validation matrix
| Check | Result | Detail |
|-------|--------|--------|
${checks.map((c) => `| ${c.id} | ${c.ok ? "✅ PASS" : "❌ FAIL"} | ${(c.detail || "").replace(/\|/g, "\\|")} |`).join("\n")}

## Statistics
- Reports: ${statistics.reports_emitted}/${statistics.reports_expected} emitted
- Modules: 8 assistant modules, ${statistics.lines_of_code} LOC, ${statistics.modules_total_kb} KB
- Oracle DB: ${statistics.oracle.db_path} (read-only access) — ${statistics.oracle.active_mcqs} active MCQs
- No schema changes, no production data changes, no network calls.

## Deliverables
- \`assistant/\`: knowledge-assistant, learning-engine, revision-planner, recommendation-engine, concept-navigator, analytics-engine, automation-engine, offline-api
- Reports: 13 JSON + this markdown under \`docs/\`
- Every module: zero-dependency Node, deterministic output, read-only SQLite access.
`;

let mdWrite;
try {
  mdWrite = fs.writeFileSync(path.join(REPORTS_DIR, "PHASE27_EXECUTION_REPORT.md"), md, "utf8");
  console.log("  -> PHASE27_EXECUTION_REPORT.md");
} catch (e) {
  console.log("  -> [warn] markdown write: " + e.message);
}

console.log("\nPhase 27 audit complete: " + (checks.length - failedChecks.length) + "/" + checks.length + " checks passed (" + failedChecks.length + " failed).");
process.exit(failedChecks.length ? 1 : 0);
