/* runtime-v2/kg-query.cjs
   Deterministic read-only Knowledge Graph queries over the NDJSON KG exports.
   Mirrors the /api/kg/* routes of the SQLite reference server (server.js).
   Ordering is always deterministic: id ASC (or name ASC, id ASC for search). */
"use strict";
const K = require("./kg-store.cjs");

const SEARCH_LIMIT = 50;

function norm(q) { return String(q || "").toLowerCase().trim(); }
function contains(hay, needle) { return hay && hay.toLowerCase().includes(needle); }

/* ---------- concept search: name/definition/summary/tags contain q (literal,
   no LIKE wildcards) -> name ASC, id ASC (sqlite: ORDER BY name, id) ---------- */
async function searchConcepts(q, subject) {
  const needle = norm(q);
  const subj = subject ? String(subject) : null;
  let out = [];
  if (!needle && !subj) return { results: [], total: 0 };
  for (const c of await K.load("concepts")) {
    if (subj && c.subject_id !== subj) continue;
    if (needle && !(contains(c.name, needle) || contains(c.definition, needle) || contains(c.summary, needle) || contains(c.tags, needle))) continue;
    out.push(c);
  }
  out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id - b.id));
  const total = out.length;
  return { results: out.slice(0, SEARCH_LIMIT), total };
}

async function conceptById(id) {
  const n = Number(id);
  const concept = (await K.load("concepts")).find((c) => c.id === n);
  if (!concept) return null;
  const [relations, prerequisites, micro, objectives, exams, pools, statsAll] = await Promise.all([
    K.load("concept_relations"), K.load("prerequisites"), K.load("micro_concepts"),
    K.load("learning_objectives"), K.load("exam_mappings"), K.load("distractor_pools"), K.load("difficulty_profiles")
  ]);
  const rel = relations.filter((r) => r.from_concept === n || r.to_concept === n)
    .sort((a, b) => a.id - b.id);
  const pre = prerequisites.filter((p) => p.concept_id === n).sort((a, b) => a.id - b.id);
  const mic = micro.filter((m) => m.concept_id === n).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const obj = objectives.filter((o) => o.concept_id === n).sort((a, b) => a.id - b.id);
  const exm = exams.filter((e) => e.concept_id === n).sort((a, b) => a.id - b.id);
  const diff = statsAll.find((d) => d.concept_id === n) || null;
  return {
    concept,
    stats: {
      relation_count: rel.length, prerequisite_count: pre.length,
      micro_count: mic.length, objective_count: obj.length, exam_mapping_count: exm.length
    },
    difficulty_profile: diff ? { id: diff.id, easy_pct: diff.easy_pct, medium_pct: diff.medium_pct, hard_pct: diff.hard_pct, avg_time_sec: diff.avg_time_sec, cognitive_load: diff.cognitive_load } : null,
    relations: rel.slice(0, 100),
    prerequisites: pre,
    micro: mic.slice(0, 200),
    objectives: obj.slice(0, 200),
    exams: exm.slice(0, 100)
  };
}

async function relations(id) {
  const n = Number(id);
  const relations = await K.load("concept_relations");
  const concepts = await K.load("concepts");
  const byId = new Map(concepts.map((c) => [c.id, c]));
  return relations.filter((r) => r.from_concept === n || r.to_concept === n).sort((a, b) => a.id - b.id)
    .map((r) => ({
      id: r.id, relation_type: r.relation_type, weight: r.weight,
      from_concept: r.from_concept, to_concept: r.to_concept,
      from_name: byId.get(r.from_concept)?.name ?? null, to_name: byId.get(r.to_concept)?.name ?? null
    }));
}

async function prerequisites(id) {
  const n = Number(id);
  const pre = await K.load("prerequisites");
  const concepts = await K.load("concepts");
  const byId = new Map(concepts.map((c) => [c.id, c]));
  return pre.filter((p) => p.concept_id === n).sort((a, b) => a.id - b.id)
    .map((p) => ({ id: p.id, concept_id: p.concept_id, requires_id: p.requires_id, strength: p.strength, requires_name: byId.get(p.requires_id)?.name ?? null }));
}

async function objectives(id) {
  const n = Number(id);
  return (await K.load("learning_objectives")).filter((o) => o.concept_id === n).sort((a, b) => a.id - b.id);
}

async function microConcepts(id) {
  const n = Number(id);
  return (await K.load("micro_concepts")).filter((m) => m.concept_id === n).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

async function examMappings(id) {
  const n = Number(id);
  return (await K.load("exam_mappings")).filter((e) => e.concept_id === n).sort((a, b) => a.id - b.id);
}

async function distractors(id) {
  const n = Number(id);
  const pools = await K.load("distractor_pools");
  const items = await K.load("distractor_items");
  const mine = pools.filter((p) => p.concept_id === n).sort((a, b) => a.id - b.id);
  return mine.map((p) => ({
    ...p,
    items: items.filter((i) => i.pool_id === p.id).sort((a, b) => a.id - b.id).map((i) => ({ id: i.id, value: i.value, note: i.note }))
  }));
}

/* ---------- micro-concept / objective search ---------- */
async function searchMicro(q) {
  const needle = norm(q);
  let out = [];
  for (const m of await K.load("micro_concepts")) if (!needle || contains(m.name, needle) || contains(m.detail, needle)) out.push(m);
  out.sort((a, b) => a.id - b.id);
  const total = out.length;
  return { results: out.slice(0, SEARCH_LIMIT), total };
}

async function searchObjectives(q) {
  const needle = norm(q);
  let out = [];
  for (const o of await K.load("learning_objectives")) if (!needle || contains(o.statement, needle) || contains(o.slug, needle)) out.push(o);
  out.sort((a, b) => a.id - b.id);
  const total = out.length;
  return { results: out.slice(0, SEARCH_LIMIT), total };
}

/* ---------- learning paths (with steps, concept names) ---------- */
async function learningPaths() {
  const paths = (await K.load("learning_paths")).sort((a, b) => a.id - b.id);
  const steps = (await K.load("learning_path_steps")).sort((a, b) => a.id - b.id);
  const concepts = await K.load("concepts");
  const byId = new Map(concepts.map((c) => [c.id, c]));
  return paths.map((p) => ({
    ...p,
    steps: steps.filter((s) => s.path_id === p.id).sort((a, b) => a.step_order - b.step_order || a.id - b.id)
      .map((s) => ({ id: s.id, step_order: s.step_order, concept_id: s.concept_id, concept_name: byId.get(s.concept_id)?.name ?? null }))
  }));
}

async function kgStats() {
  const tables = ["concepts", "micro_concepts", "learning_objectives", "concept_relations", "prerequisites",
    "exam_mappings", "distractor_pools", "distractor_items", "learning_paths", "learning_path_steps",
    "knowledge_packs", "syllabus_units", "question_blueprints", "reference_sources", "difficulty_profiles",
    "concepts_legacy", "mcq_concepts"];
  const counts = {};
  for (const t of tables) {
    const rows = await K.load(t);
    counts[t] = t === "mcq_concepts" ? (await K.mcqIdsByConcept()).rows : rows.length;
  }
  return { counts };
}

module.exports = {
  searchConcepts, conceptById, relations, prerequisites, objectives, microConcepts,
  examMappings, distractors, searchMicro, searchObjectives, learningPaths, kgStats
};
