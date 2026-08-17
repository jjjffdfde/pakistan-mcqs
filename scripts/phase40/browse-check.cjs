const path = require("path");
const Q = require(path.join(__dirname, "..", "..", "runtime-v2", "query-engine.cjs"));
(async () => {
  await Q.init();
  const b = await Q.browse({ page: "1", limit: "10" });
  console.log("browse total:", b.total, "results:", b.results.length, "pages:", b.pages);
  console.log("ids:", b.results.map((r) => r.id).join(","));
  const b2 = await Q.browse({ page: "1", limit: "10" });
  console.log("browse2 total:", b2.total, "results:", b2.results.length);
  const r = await Q.random({ limit: 20 });
  console.log("random:", r.results.length, "of", r.total);
  process.exit(0);
})();
