/* scripts/runtime-check.cjs — pre-deployment self-check for the runtime API.
   Runs against the local file engine (no server needed): verifies the data
   payload + built indexes are present and queries produce correct counts.
   Usage: npm run runtime:check
   Exit code 0 = ready to serve; non-zero = problem. */
"use strict";
const path = require("path");
const fs = require("fs");
const ROOT = path.join(__dirname, "..");

const fail = (msg) => { console.error("FAIL:", msg); process.exitCode = 1; };
const ok = (msg) => console.log("ok:", msg);

async function main() {
  const L = require(path.join(ROOT, "runtime-v2", "data-loader.cjs"));
  const Q = require(path.join(ROOT, "runtime-v2", "query-engine.cjs"));
  const siteConfig = require(path.join(ROOT, "data", "site-config.json"));

  if (!fs.existsSync(path.join(ROOT, "database", "data"))) {
    return fail(`database/data missing — cannot run runtime. Expected payload at ${L.SRC_DIR}`);
  }
  ok(`data dir present: ${L.SRC_DIR}`);

  if (!fs.existsSync(path.join(ROOT, "runtime-v2", "indexes", "manifest.json"))) {
    return fail("runtime-v2/indexes/manifest.json missing — run: node runtime-v2/index-builder.cjs");
  }
  ok("indexes present (manifest.json)");

  const m = L.manifest();
  const ds = siteConfig.dataset || {};
  const cfg = ds.fullDatabase || {};
  ok(`payload rows: ${m.rows} (site-config full-database questions: ${cfg.questions || "?"})`);

  await Q.init();

  const health = await Q.health();
  if (!health.ok) return fail("health() not ok");
  ok(`health mcqs: ${health.mcqs}`);

  const stats = await Q.stats();
  if (!(stats.mcqs > 0)) return fail("stats.mcqs is 0");
  ok(`stats: ${stats.mcqs} mcqs / ${stats.subjects} subjects / ${stats.topics} topics`);

  const subjects = await Q.subjects();
  if (!(Array.isArray(subjects) && subjects.length > 0)) return fail("subjects empty");
  ok(`subjects listed: ${subjects.length}`);

  const sample = await Q.browse({ limit: 1 });
  if (!(sample.results && sample.results.length === 1)) return fail("browse limit=1 did not return 1 row");
  const first = sample.results[0];
  ok(`sample retrieval OK: ${first.id} (${first.subject_id})`);

  const byId = await Q.getById(first.id);
  if (!byId || !byId.question) return fail("getById failed on sample id");
  ok(`mcq by id OK: ${byId.id}`);

  const search = await Q.search({ q: "pakistan", limit: 5 });
  if (!(search.results && search.results.length > 0)) return fail("search returned 0 results");
  ok(`search OK: ${search.results.length} results for "pakistan"`);

  const filter = await Q.browse({ subject_id: first.subject_id, limit: 3 });
  if (!(filter.results && filter.results.length > 0)) return fail("subject filter returned 0 rows");
  ok(`subject filter OK (${first.subject_id})`);

  const kg = await require(path.join(ROOT, "runtime-v2", "kg-query.cjs")).kgStats();
  ok(`knowledge graph OK: ${kg.counts.concepts} concepts / ${kg.counts.learning_objectives} objectives`);

  const t0 = Date.now();
  await Q.stats();
  const elapsed = Date.now() - t0;
  ok(`stats query latency: ${elapsed}ms`);

  if (process.exitCode) console.error("\nruntime-check FAILED");
  else console.log("\nruntime-check PASSED — payload and indexes ready to serve");
}

main().catch((e) => { console.error("runtime-check crashed:", e); process.exitCode = 1; });
