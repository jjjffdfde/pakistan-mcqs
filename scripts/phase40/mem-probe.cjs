/* scripts/phase40/mem-probe.cjs — stage-by-stage heap profiling of the
   runtime query engine (mirrors the physical-battery memory load). */
"use strict";
const path = require("path");
const Q = require(path.join(__dirname, "..", "..", "runtime-v2", "query-engine.cjs"));
const L = require(path.join(__dirname, "..", "..", "runtime-v2", "data-loader.cjs"));

const mb = () => Math.round(process.memoryUsage().heapUsed / 1048576);
const stage = async (name, fn) => {
  const t0 = Date.now();
  await fn();
  console.log(`stage ${name.padEnd(34)} heap=${mb()}MB rss=${Math.round(process.memoryUsage().rss / 1048576)}MB in ${Date.now() - t0}ms`);
};

(async () => {
  await stage("init", () => Q.init());
  await stage("health/stats", async () => { await Q.health(); await Q.stats(); });
  await stage("browse all", async () => { await Q.browse({ limit: "10" }); });
  const b = await Q.browse({ limit: "5" });
  const subj = b.results[0].subject_id;
  await stage("browse subject filter", async () => { await Q.browse({ subject_id: subj, limit: "5" }); });
  await stage("browse chapter filter", async () => { await Q.browse({ chapter_id: b.results[0].chapter_id, limit: "5" }); });
  await stage("browse topic filter", async () => { await Q.browse({ topic_id: b.results[0].topic_id, limit: "5" }); });
  await stage("mcq_by_id.loaded", async () => { await Q.getById(b.results[0].id); });
  await stage("search physics", async () => { await Q.search({ q: "physics", limit: "5" }); });
  await stage("random 50", async () => { await Q.random({ limit: "50" }); });
  await stage("export json", async () => { await Q.exportRows(); });
  await stage("kg stats", async () => { const K = require(path.join(__dirname, "..", "..", "runtime-v2", "kg-query.cjs")); await K.kgStats(); });
  await stage("20x browse", async () => { for (let i = 0; i < 20; i++) await Q.browse({ limit: "5" }); });
  await stage("8x concurrent", async () => { await Promise.all(Array.from({ length: 8 }, () => Q.random({ limit: "3" }))); });
  console.log("cacheStats:", JSON.stringify(L.cacheStats()));
})();
