/* ============================================================
   Phase 14 — Knowledge Graph & Knowledge Pack engine: seed
   Full idempotent rebuild of the kg_* layer from the real
   corpus + authored pack content. Pipeline:
     clear → extract → relate → packs → map → distract →
     blueprint → rollup → validate
   Usage: node scripts/seed-kg.cjs
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");

const CLEAR_ORDER = [
  "kg_learning_path_steps", "kg_learning_paths", "kg_syllabus_units", "kg_reference_sources",
  "kg_question_blueprints", "kg_exam_mappings", "kg_prerequisites", "kg_concept_relations",
  "kg_learning_objectives", "kg_micro_concepts", "kg_difficulty_profiles", "kg_concepts",
  "kg_knowledge_packs", "kg_distractor_items", "kg_distractor_pools",
  "kg_concept_statistics", "kg_subject_statistics", "kg_concept_history"
];

const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

function clearKg(db) {
  db.exec("PRAGMA foreign_keys = OFF");
  try {
    for (const t of CLEAR_ORDER) db.run(`DELETE FROM ${t}`);
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

function step(name) {
  const t0 = Date.now();
  console.log(`[seed] ${name} ...`);
  return () => console.log(`[seed] ${name} done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

function rollup(db, conceptTotals, buildId) {
  const get = (db2, sql) => new Map(db2.all(sql).map((r) => [r.k, r.n]));

  const micros = get(db, "SELECT concept_id k, COUNT(*) n FROM kg_micro_concepts GROUP BY concept_id");
  const los = get(db, "SELECT concept_id k, COUNT(*) n FROM kg_learning_objectives GROUP BY concept_id");
  const bps = get(db, "SELECT concept_id k, COUNT(*) n FROM kg_question_blueprints GROUP BY concept_id");
  const rels = get(db, "SELECT from_concept k, COUNT(*) n FROM kg_concept_relations GROUP BY from_concept");
  const concepts = db.all("SELECT id, subject_id FROM kg_concepts");

  const depth = new Map();
  const ins = db.prepare(
    `INSERT INTO kg_concept_statistics
       (concept_id, micro_count, objective_count, blueprint_count, mcq_count, relation_count, depth_score, updated_at)
     VALUES (?,?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(concept_id) DO UPDATE SET
       micro_count=excluded.micro_count, objective_count=excluded.objective_count,
       blueprint_count=excluded.blueprint_count, mcq_count=excluded.mcq_count,
       relation_count=excluded.relation_count, depth_score=excluded.depth_score, updated_at=datetime('now')`
  );
  for (const c of concepts) {
    const mi = micros.get(c.id) || 0;
    const lo = los.get(c.id) || 0;
    const bp = bps.get(c.id) || 0;
    const re = rels.get(c.id) || 0;
    const mcq = (conceptTotals.get(c.subject_id) || new Map()).get(c.id) || 0;
    const d = Math.min(1, (mi + lo * 0.25 + bp * 0.5) / 20);
    depth.set(c.id, d);
    ins.run(c.id, mi, lo, bp, mcq, re, Math.round(d * 1000) / 1000);
  }

  /* subject rollup */
  const agg = (table, col) =>
    new Map(db.all(`SELECT subject_id, COUNT(*) n FROM ${table} WHERE subject_id IS NOT NULL GROUP BY subject_id`).map((r) => [r.subject_id, r.n]));
  const packs = new Map(db.all("SELECT subject_id, version FROM kg_knowledge_packs").map((r) => [r.subject_id, r.version]));
  const map = agg("kg_exam_mappings", "subject_id");
  const refs = agg("kg_reference_sources", "subject_id");
  const pools = agg("kg_distractor_pools", "subject_id");
  const conceptsN = new Map(db.all("SELECT subject_id, COUNT(*) n FROM kg_concepts GROUP BY subject_id").map((r) => [r.subject_id, r.n]));
  const microsN = agg("kg_micro_concepts", "subject_id");
  const losN = agg("kg_learning_objectives", "subject_id");
  const bpsN = agg("kg_question_blueprints", "subject_id");
  const relsN = new Map(db.all(
    "SELECT kc.subject_id, COUNT(*) n FROM kg_concept_relations cr JOIN kg_concepts kc ON kc.id = cr.from_concept GROUP BY kc.subject_id"
  ).map((r) => [r.subject_id, r.n]));

  const allSubjects = new Set([...conceptsN.keys(), ...packs.keys()]);
  for (const sid of allSubjects) {
    if (typeof sid !== "string") continue;
    const cc = conceptsN.get(sid) || 0;
    const bc = bpsN.get(sid) || 0;
    const status = packs.has(sid) && cc > 0 && bc > 0 ? "ready" : cc > 0 ? "partial" : "pending";
    const avgDepth = db.get(
      "SELECT AVG(depth_score) d FROM kg_concept_statistics cs JOIN kg_concepts kc ON kc.id = cs.concept_id WHERE kc.subject_id = ?",
      [sid]
    ).d || 0;
    db.run(
      `INSERT INTO kg_subject_statistics
         (subject_id, pack_version, concept_count, micro_count, objective_count, blueprint_count,
          relation_count, exam_map_count, reference_count, distractor_pool_count, depth_score,
          coverage_status, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
       ON CONFLICT(subject_id) DO UPDATE SET
         pack_version=excluded.pack_version, concept_count=excluded.concept_count,
         micro_count=excluded.micro_count, objective_count=excluded.objective_count,
         blueprint_count=excluded.blueprint_count, relation_count=excluded.relation_count,
         exam_map_count=excluded.exam_map_count, reference_count=excluded.reference_count,
         distractor_pool_count=excluded.distractor_pool_count, depth_score=excluded.depth_score,
         coverage_status=excluded.coverage_status, updated_at=datetime('now')`,
      [sid, packs.get(sid) || 0, cc, microsN.get(sid) || 0, losN.get(sid) || 0, bc,
       relsN.get(sid) || 0, map.get(sid) || 0, refs.get(sid) || 0, pools.get(sid) || 0,
       Math.round(avgDepth * 1000) / 1000, status]
    );
  }

  /* history trail */
  for (const sid of allSubjects) {
    if (typeof sid !== "string") continue;
    db.run(
      `INSERT INTO kg_concept_history (concept_id, subject_id, action, detail, actor, created_at)
       VALUES (NULL, ?, 'rebuilt', ?, 'seed-kg', datetime('now'))`,
      [sid, `build ${buildId}: ${conceptsN.get(sid) || 0} concepts`]
    );
  }

  return {
    concepts: concepts.length,
    readySubjects: db.all("SELECT COUNT(*) n FROM kg_subject_statistics WHERE coverage_status = 'ready'")[0].n
  };
}

const extract = require("../kg/extract.js");
const relate = require("../kg/relate.js");
const packs = require("../kg/packs.js");
const mapMod = require("../kg/map.js");
const distract = require("../kg/distract.js");
const blueprint = require("../kg/blueprint.js");
const validateMod = require("../kg/validate.js");

function main() {
  const db = open();
  const buildId = "kg-" + stamp();

  console.log(`[seed] build ${buildId}`);
  let done = step("clear kg_* tables");
  clearKg(db);
  done();

  done = step("extract concepts/micros/LOs");
  const subjects = db.all("SELECT id, name FROM subjects WHERE status = 'active' ORDER BY id");
  let total = { concepts: 0, micros: 0, los: 0, subjects: 0 };
  for (const s of subjects) {
    const r = db.transaction(() => extract.extractSubject(db, s.id, s.name));
    if (!r) continue;
    total.concepts += r.concepts; total.micros += r.micros; total.los += r.los; total.subjects++;
  }
  console.log(`[seed] extracted: ${total.concepts} concepts, ${total.micros} micro-concepts, ${total.los} LOs in ${total.subjects} subjects`);
  done();

  done = step("relate concepts");
  const rel = relate.relateAll(db, console.log);
  done();

  done = step("compose knowledge packs");
  const pk = packs.seedPacks(db, console.log);
  done();

  done = step("map exams");
  const mp = mapMod.mapExams(db, console.log);
  done();

  done = step("distractor pools");
  const ds = distract.distractAll(db, console.log);
  done();

  done = step("question blueprints");
  const bp = blueprint.blueprintAll(db, console.log);
  done();

  done = step("rollup statistics");
  const rl = rollup(db, mp.conceptTotal, buildId);
  done();

  done = step("validate");
  const v = validateMod.runValidate(db);
  done();

  console.log(`\n[seed] build ${buildId} complete`);
  console.log(`  packs: ${pk.packs} (+${pk.syllabusUnits} syllabus units) | skipped: ${pk.skipped}`);
  console.log(`  concepts: ${rl.concepts} | micros: ${total.micros} | LOs: ${total.los}`);
  console.log(`  relations: ${rel.edges} | exam mappings: ${mp.mappings} | blueprints: ${bp.blueprints}`);
  console.log(`  distractor pools: ${ds.pools} | items: ${ds.items}`);
  console.log(`  ready subjects: ${rl.readySubjects} | validation score: ${v.score}% (${v.issues.filter((i) => i.pass).length}/${v.issues.length} checks)`);

  const report = path.join(__dirname, "..", "docs", "PHASE14-SEED-REPORT.md");
  fs.writeFileSync(report, [
    `# Phase 14 — Knowledge Graph seed report`,
    ``,
    `- Build: \`${buildId}\``,
    `- Date: ${new Date().toISOString()}`,
    `- MCQs in corpus: ${db.get("SELECT COUNT(*) n FROM mcqs").n}`,
    ``,
    `## Counts`,
    `| Layer | Count |`,
    `| --- | --- |`,
    `| Knowledge packs | ${pk.packs} |`,
    `| Syllabus units | ${pk.syllabusUnits} |`,
    `| Concepts | ${rl.concepts} |`,
    `| Micro-concepts | ${total.micros} |`,
    `| Learning objectives | ${total.los} |`,
    `| Concept relations | ${rel.edges} |`,
    `| Exam mappings | ${mp.mappings} |`,
    `| Question blueprints | ${bp.blueprints} |`,
    `| Distractor pools | ${ds.pools} |`,
    `| Distractor items | ${ds.items} |`,
    `| Subjects ready | ${rl.readySubjects} |`,
    ``,
    `## Validation`,
    `- Score: **${v.score}%**`,
    v.issues.map((i) => `- ${i.pass ? "PASS" : "FAIL"} \`${i.name}\` — ${i.detail}`).join("\n"),
    ``,
  ].join("\n"), "utf8");
  console.log(`[seed] report -> docs/PHASE14-SEED-REPORT.md`);

  db.close();
}

main();
