/* ============================================================
   Phase 26 - STEP 3: Deterministic Zero-Dependency Test Runner
   Discovers tests/<dir>/*.test.cjs, runs them, aggregates.
   Usage: node scripts/test.cjs [pattern]
   Exit: 0 all pass, 1 failures
   Emits: docs/phase26_testing.json
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_testing.json");
const pattern = process.argv[2] || "";

function walk(dir, rel) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), `${rel}/${e.name}`));
    else if (e.name.endsWith(".test.cjs")) out.push(`${rel}/${e.name}`);
  }
  return out;
}
const testsDir = path.join(ROOT, "tests");
const files = fs.existsSync(testsDir) ? walk(testsDir, "tests") : [];
const selected = files.filter((f) => f.includes(pattern)).sort();

const suites = [];
async function runAll() {
  for (const f of selected) {
    const suite = { file: f, tests: [], failed: [], duration_ms: 0 };
    const s = Date.now();
    try {
      const mod = require(path.join(ROOT, f));
      if (typeof mod === "function") {
        const pending = [];
        const t = {
          test: (name, fn) => {
            const entry = { name, pass: false, ms: 0, error: null };
            suite.tests.push(entry);
            pending.push((async () => {
              const t0 = Date.now();
              try { await fn(); entry.pass = true; } catch (e) { entry.pass = false; entry.error = e.message; }
              entry.ms = Date.now() - t0;
            }));
          }
        };
        mod(t);
        /* run tests sequentially so shared setup/teardown (e.g. boot/kill a server) is stable */
        for (const p of pending) await p();
      }
      else suite.tests.push({ name: "(suite load)", pass: false, error: "module does not export a function" });
    } catch (e) {
      suite.tests.push({ name: "(suite load)", pass: false, error: e.message });
    }
    suite.duration_ms = Date.now() - s;
    suites.push(suite);
  }
}

runAll().then(() => {
  let passed = 0, failed = 0;
  const failures = [];
  for (const s of suites) {
    for (const tst of s.tests) {
      if (tst.pass) passed++;
      else { failed++; failures.push({ file: s.file, name: tst.name, error: tst.error }); }
    }
  }
  const report = {
    step: "testing",
    generated_at: new Date().toISOString(),
    summary: {
      suites: suites.length,
      tests: passed + failed,
      passed,
      failed,
      status: failed === 0 ? "PASS" : "FAIL"
    },
    suites: suites.map((s) => ({ file: s.file, tests: s.tests.length, passed: s.tests.filter((x) => x.pass).length, duration_ms: s.duration_ms })),
    failures
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(`test: ${suites.length} suites, ${passed + failed} tests, ${passed} passed, ${failed} failed`);
  if (failures.length) for (const f of failures) console.log(`  FAIL ${f.file} :: ${f.name} :: ${f.error}`);
  console.log(`report -> docs/phase26_testing.json`);
  process.exit(failed === 0 ? 0 : 1);
});
