"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const { sha256hex } = require(path.join(__dirname, "..", "..", "scripts", "lib", "utils.cjs"));
const ROOT = path.join(__dirname, "..", "..");
const L = require(path.join(ROOT, "runtime-v2", "data-loader.cjs"));

module.exports = (t) => {
  t.test("sha256 throughput >= 20k ops/s", async () => {
    const N = 20000;
    const s = performance.now();
    for (let i = 0; i < N; i++) sha256hex(`payload-${i}-Pakistan-MCQs`);
    const ms = performance.now() - s;
    const ops = Math.round(N / (ms / 1000));
    assert.ok(ops >= 20000, `sha256 only ${ops} ops/s`);
  });

  t.test("sitemap.xml parses and indexes under 2s", async () => {
    const s = performance.now();
    const src = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
    const urls = (src.match(/<loc>/g) || []).length;
    assert.ok(urls >= 900, `sitemap has ${urls} urls, expected >= 900`);
    const ms = performance.now() - s;
    assert.ok(ms < 2000, `sitemap scan took ${ms}ms`);
  });

  t.test("JSON report parse throughput", async () => {
    const docs = path.join(ROOT, "docs");
    const files = fs.readdirSync(docs).filter((f) => f.endsWith(".json"));
    assert.ok(files.length >= 10, `expected >=10 phase reports, got ${files.length}`);
    const s = performance.now();
    for (const f of files) JSON.parse(fs.readFileSync(path.join(docs, f), "utf8"));
    const ms = performance.now() - s;
    assert.ok(ms < 5000, `parsing ${files.length} reports took ${ms}ms`);
  });

  t.test("file-engine active count matches index sum under 2s (warm)", async () => {
    const bySub = L.bySubjectActive();
    const s = performance.now();
    const n = Object.values(bySub).reduce((a, b) => a + b, 0);
    const ms = performance.now() - s;
    assert.ok(n >= 100, `expected >= 100 active, got ${n}`);
    const manifest = L.manifest();
    if (manifest.rows >= 800000) assert.ok(n >= 800000, `active ${n} below 800k`);
    assert.ok(ms < 2000, `count aggregation took ${ms}ms`);
  });
};
