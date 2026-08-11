"use strict";
/* Faithful replica of run.js enrichment: build the same `extra` block run.js
   adds, enrich, score. This is the true gated ceiling. Read-only. */
const fs = require("fs");
const path = require("path");
const lib = require("./lib.js");
const quality = require("./quality.js");
const dir = path.join(__dirname, "generators");
const gens = [];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort()) {
  try { gens.push(...require(path.join(dir, f))); } catch (e) {}
}
const NAMES = { physics: "Physics", cpp: "C++", python: "Python", java: "Java", csharp: "C#", c: "C", chemistry: "Chemistry", electronics: "Electronics", biology: "Biology" };
const list = process.argv.slice(2);
for (const id of list) {
  const sg = gens.filter((g) => g.subjects.includes(id));
  const seen = new Set();
  let validated = 0, passed = 0; const failDim = {};
  for (const g of sg) {
    for (const tname of g.topics) {
      const rng = lib.mulberry32(lib.hashSeed(`gate2|${id}|${g.name}|${tname}`));
      let cands = [];
      try { cands = g.generate(rng, tname, { id, name: NAMES[id] || id, _cap: 9000 }) || []; } catch (e) {}
      for (const m of cands) {
        if (!m || !m.question) continue;
        const h = lib.qhash(m.question);
        if (seen.has(h)) continue;
        if (lib.validateMcq(m, {})) continue;
        validated++;
        const extra = {
          topicId: "t-x", topicName: tname, subtopicId: "s-x", subtopicName: "fundamentals",
          learningObjective: m.learningObjective || `Recall and apply ${tname.toLowerCase()} concepts in exam-style questions.`,
          bloomTaxonomy: m.bloomTaxonomy || "Understand", confidence: m.confidence ?? 0.9,
          solvingTimeSec: m.solvingTimeSec, memoryTrick: m.memoryTrick, examTip: m.examTip, explanationWhyWrong: m.explanationWhyWrong,
          tags: [NAMES[id] || id, tname, ...(g.tags || [])], examIds: "css,ppsc,fpsc,nts",
        };
        const e = quality.enrich({ ...m, ...extra }, {});
        const v = quality.scoreMcq(e, [], []);
        if (v.pass) { passed++; seen.add(h); }
        else for (const [k, val] of Object.entries(v.dims)) if (val < 95) failDim[k] = (failDim[k] || 0) + 1;
      }
    }
  }
  const topFails = Object.entries(failDim).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k}(${n})`).join(", ");
  console.log(`${id.padEnd(12)} validated ${String(validated).padStart(6)}  PASS ${String(passed).padStart(6)}  (${(100 * passed / Math.max(1, validated)).toFixed(1)}%)  reach7k=${passed >= 7000}  topFails: ${topFails}`);
}
