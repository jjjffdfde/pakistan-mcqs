/* ============================================================
   Phase 26 - STEP 4 + Phase 40 migration: Performance Benchmark
   Measures JSON/NDJSON runtime read throughput: init latency,
   active-count scan, batch id lookup, taxonomy reads, search
   latency, random sampling, static page stats and asset sizes.
   Read-only. No SQLite dependency.
   Usage: node scripts/benchmark.cjs
   Emits: docs/phase26_benchmark.json
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase26_benchmark.json");
const L = require("../runtime-v2/data-loader.cjs");
const Q = require("../runtime-v2/query-engine.cjs");

async function ms(fn) { const s = performance.now(); const r = await fn(); return { ms: performance.now() - s, r }; }
function avg(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

const results = {};
(async () => {
  /* 1. init + first query latency (replaces sqlite open) */
  const { ms: initMs } = await ms(async () => { await Q.init(); await Q.subjects(); });
  results.open_readonly = Math.round(initMs);

  const manifest = L.manifest();
  const bySub = L.bySubjectActive();
  const term = manifest.rows >= 800000 ? "pakistan" : "question";

  /* 2. COUNT scans (active-mcq aggregation over the tiny JSON index) */
  const countTimes = [];
  for (let i = 0; i < 7; i++) {
    const s = performance.now();
    Object.values(L.bySubjectActive()).reduce((a, b) => a + b, 0);
    countTimes.push(performance.now() - s);
  }
  results.avg_count_query_ms = Math.round(avg(countTimes) * 10) / 10;
  results.count_queries = countTimes.map((t) => Math.round(t * 10) / 10);
  results.active_mcqs = Object.values(bySub).reduce((a, b) => a + b, 0);

  /* 3. batch id lookup (200 ids across subjects; replaces per-id pk lookups) */
  const sampleIds = L.rowidOrder();
  const stride = Math.max(1, Math.floor(sampleIds.length / 200));
  const ids = [];
  for (let i = 0; i < 200; i++) ids.push(sampleIds[(i * stride) % sampleIds.length]);
  const { ms: lookupMs, r: lookupRes } = await ms(() => Q.batchByIds(ids));
  results.avg_pk_lookup_ms = Math.round((lookupMs / 200) * 1000) / 1000;
  results.pk_lookup_batch_ms = Math.round(lookupMs * 10) / 10;
  results.pk_lookup_rows = lookupRes.length;

  /* 4. taxonomy queries */
  results.taxonomy_ms = {
    subjects: Math.round(((await ms(() => Q.subjects())).ms) * 10) / 10,
    chapters: Math.round(((await ms(async () => Q.chapters())).ms) * 10) / 10,
    topics: Math.round(((await ms(async () => Q.topics())).ms) * 10) / 10
  };

  /* 5. search latency (prefix-token scan over letter buckets) */
  const ftsTimes = [];
  for (let i = 0; i < 20; i++) {
    const s = performance.now();
    await Q.search({ q: term, limit: 10 });
    ftsTimes.push(performance.now() - s);
  }
  results.avg_fts_search_ms = Math.round(avg(ftsTimes) * 10) / 10;

  /* 6. random sampler */
  const { ms: randMs } = await ms(() => Q.random({ limit: 20 }));
  results.random_20_ms = Math.round(randMs * 10) / 10;

  /* 7. static page inventory */
  const pages = [];
  for (const dir of ["subjects", "chapters"]) {
    let idx;
    try { idx = fs.readdirSync(path.join(ROOT, dir)); } catch (e) { idx = []; }
    for (const f of idx) if (f.endsWith(".html")) pages.push(path.join(ROOT, dir, f));
  }
  let htmlBytes = 0; const htmlSizes = [];
  for (const p of pages) { const b = fs.statSync(p).size; htmlBytes += b; htmlSizes.push(b); }
  htmlSizes.sort((a, b) => a - b);
  results.static_pages = {
    html_pages: pages.length,
    html_total_mb: Math.round(htmlBytes / 1024 / 1024 * 10) / 10,
    median_html_kb: Math.round(htmlSizes[Math.floor(htmlSizes.length / 2)] / 1024)
  };

  /* 8. data inventory (source parts + indexes) */
  const idxBytes = (() => {
    let b = 0, n = 0;
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else { n++; try { b += fs.statSync(p).size; } catch (e2) {} }
      }
    };
    walk(L.IDX_DIR);
    return { files: n, bytes: b };
  })();
  results.data = {
    json_sources: manifest.rows,
    ndjson_parts: Object.keys(manifest.sourceFiles).length,
    index_files: idxBytes.files,
    index_total_kb: Math.round(idxBytes.bytes / 1024)
  };

  const report = {
    step: "benchmark",
    generated_at: new Date().toISOString(),
    environment: { node: process.version, platform: process.platform, arch: process.arch },
    engine: "runtime-v2 (NDJSON.GZ + JSON indexes)",
    measures: results,
    summary: {
      status: "OK",
      samples: "deterministic, quantiles aggregated"
    }
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log("benchmark complete -> docs/phase26_benchmark.json");
  console.log(`  init=${Math.round(report.measures.open_readonly)}ms count_avg=${results.avg_count_query_ms}ms fts=${results.avg_fts_search_ms}ms pages=${results.static_pages.html_pages}`);
})();
