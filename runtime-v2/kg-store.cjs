/* runtime-v2/kg-store.cjs
   Streaming NDJSON.GZ store for the Knowledge Graph exports
   (database/data/kg/* and database/data/concepts/*). LRU cached,
   bounded memory, deterministic ordering is enforced by the query layer.
   No SQLite dependency. */
"use strict";
const fs = require("fs");
const path = require("path");
const L = require("./data-loader.cjs");

const KG_DIR = path.join(L.SRC_DIR, "kg");
const CONCEPT_DIR = path.join(L.SRC_DIR, "concepts");

const TABLES = {
  concepts: ["kg_concepts.ndjson.gz", KG_DIR],
  micro_concepts: ["kg_micro_concepts.ndjson.gz", KG_DIR],
  learning_objectives: ["kg_learning_objectives.ndjson.gz", KG_DIR],
  concept_relations: ["kg_concept_relations.ndjson.gz", KG_DIR],
  prerequisites: ["kg_prerequisites.ndjson.gz", KG_DIR],
  exam_mappings: ["kg_exam_mappings.ndjson.gz", KG_DIR],
  distractor_pools: ["kg_distractor_pools.ndjson.gz", KG_DIR],
  distractor_items: ["kg_distractor_items.ndjson.gz", KG_DIR],
  learning_paths: ["kg_learning_paths.ndjson.gz", KG_DIR],
  learning_path_steps: ["kg_learning_path_steps.ndjson.gz", KG_DIR],
  knowledge_packs: ["kg_knowledge_packs.ndjson.gz", KG_DIR],
  syllabus_units: ["kg_syllabus_units.ndjson.gz", KG_DIR],
  question_blueprints: ["kg_question_blueprints.ndjson.gz", KG_DIR],
  reference_sources: ["kg_reference_sources.ndjson.gz", KG_DIR],
  difficulty_profiles: ["kg_difficulty_profiles.ndjson.gz", KG_DIR],
  concepts_legacy: ["concepts.ndjson.gz", CONCEPT_DIR],
  mcq_concepts: ["mcq_concepts.ndjson.gz", CONCEPT_DIR]
};

const cache = new Map(); /* table -> rows array */
const MAX_ROWS = 120000; /* mcq_concepts (330k) is handled separately: never cached whole */

async function load(table) {
  if (cache.has(table)) return cache.get(table);
  const [file, dir] = TABLES[table];
  const abs = path.join(dir, file);
  if (!fs.existsSync(abs)) return [];
  const rows = [];
  await L.streamGzLines(abs, (row) => { if (row) rows.push(row); });
  if (rows.length <= MAX_ROWS) cache.set(table, rows);
  return rows;
}

/* mcq_concepts: concept_id -> [mcq ids] (never fully cached; built once on first
   access because 330k rows are cheap to map and the map stays ~30MB) */
let conceptMcqs = null;
let conceptMcqRows = 0;
async function mcqIdsByConcept() {
  if (conceptMcqs) return { map: conceptMcqs, rows: conceptMcqRows };
  const map = new Map();
  let rows = 0;
  const [file] = TABLES.mcq_concepts;
  await L.streamGzLines(path.join(CONCEPT_DIR, file), (row) => {
    if (!row) return;
    rows++;
    let arr = map.get(row.concept_id);
    if (!arr) { arr = []; map.set(row.concept_id, arr); }
    arr.push(row.mcq_id);
  });
  for (const arr of map.values()) arr.sort();
  conceptMcqs = map;
  conceptMcqRows = rows;
  return { map, rows };
}

function reset() { cache.clear(); conceptMcqs = null; conceptMcqRows = 0; }
function stats() {
  return {
    cached: [...cache.keys()],
    cachedRows: [...cache.values()].reduce((a, r) => a + r.length, 0),
    mcqConceptMap: conceptMcqs ? conceptMcqs.size : 0
  };
}

module.exports = { load, mcqIdsByConcept, reset, stats, TABLES: Object.keys(TABLES) };
