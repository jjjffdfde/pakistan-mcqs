const path = require("path");
const L = require(path.join(__dirname, "..", "..", "runtime-v2", "data-loader.cjs"));
const Q = require(path.join(__dirname, "..", "..", "runtime-v2", "query-engine.cjs"));
(async () => {
  await Q.init();
  const recent = L.recentOrder();
  const picked = recent.slice(0, 10);
  console.log("picked:", picked.join(","));
  const meta = L.metaById();
  const subs = Object.keys(L.manifest().sourceFiles);
  for (const id of picked) {
    const idx = meta[id];
    const sub = subs[idx];
    let found = false;
    await L.streamSubject(sub, (r) => { if (r && r.id === id) found = true; });
    console.log(id, "->", sub, "found in part:", found);
  }
  process.exit(0);
})();
