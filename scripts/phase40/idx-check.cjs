const path = require("path");
const L = require(path.join(__dirname, "..", "..", "runtime-v2", "data-loader.cjs"));
const { ids, rp } = L.readJson("recent.json");
console.log("ids.length", ids.length, "rp.length", rp.length);
const seen = new Set(); let dups = 0;
for (const id of ids) { if (seen.has(id)) dups++; seen.add(id); }
console.log("duplicate ids in rowid:", dups);
let bad = 0;
for (let i = 0; i < rp.length; i++) {
  const v = rp[i];
  if (!Number.isInteger(v) || v < 0 || v >= ids.length) bad++;
}
console.log("rp out-of-range entries:", bad);
const meta = L.metaById();
let unknown = 0;
for (const id of ids) if (meta[id] == null) unknown++;
console.log("ids missing from mcq_by_id:", unknown);
const srcFiles = Object.keys(L.manifest().sourceFiles);
console.log("manifest subjects:", srcFiles.length, srcFiles.filter((s) => L.manifest().sourceFiles[s].lines === 0));
let unassignedRows = 0;
L.streamSubject("unassigned", (r) => { if (r) unassignedRows++; });
console.log("unassigned rows:", unassignedRows);
