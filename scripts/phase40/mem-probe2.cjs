/* scripts/phase40/mem-probe2.cjs — per-function timing/memory attribution
   for the random-50 pipeline (fetchRows / attachOptions / attachRelated /
   exportRows) to decide the optimization targets. */
"use strict";
const path = require("path");
const Q = require(path.join(__dirname, "..", "..", "runtime-v2", "query-engine.cjs"));
const L = require(path.join(__dirname, "..", "..", "runtime-v2", "data-loader.cjs"));

const mb = () => Math.round(process.memoryUsage().heapUsed / 1048576);
const step = async (name, fn) => {
  const t0 = Date.now();
  const out = await fn();
  console.log(`step ${name.padEnd(26)} heap=${mb()}MB in ${Date.now() - t0}ms`);
  return out;
};

(async () => {
  await step("init", () => Q.init());
  await step("first browse", () => Q.browse({ limit: "10" }));
  const r = await step("random walk (get ids)", () => Q.random({ limit: "50" }));
  console.log("picked:", r.results.length, "total:", r.total);
  const ids = r.results.slice(0, 50).map((x) => x.id);
  await step("fetchRows(50)", () => Q.fetchRows(ids).then((x) => x.rows.length));
  await step("attachOptions(50)", () => Q.attachOptions(ids.map((i) => ({ id: i }))).then((x) => x.length));
  await step("attachRelated(50)", () => Q.attachRelated(ids.map((i) => ({ id: i, chapter_id: "x" }))).then((x) => x.length));
  await step("exportRows (all)", () => Q.exportRows().then((x) => x.length));
  console.log("final heap:", mb() + "MB");
})();
