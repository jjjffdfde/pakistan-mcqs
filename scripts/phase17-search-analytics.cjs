"use strict";
const { open } = require("../db/engine.js");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "docs");
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

function writeReport(filename, data) {
  const p = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  console.log("  -> " + p);
  return p;
}

function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}

const db = open();
const startTime = Date.now();
console.log("=== Phase 17: Search + Analytics + Integrity (Steps 8-10) ===");
console.log("Started at " + ts());

const concepts = db.all("SELECT id, subject_id, chapter_id, topic_id, name, slug, domain, difficulty, bloom, exam_frequency, tags, status FROM kg_concepts WHERE status = 'active' ORDER BY id");
const conceptMap = {};
for (const c of concepts) conceptMap[c.id] = c;

const microConcepts = db.all("SELECT id, concept_id, subject_id, name, slug, detail, difficulty, sort_order FROM kg_micro_concepts");
const learningObjectives = db.all("SELECT id, micro_concept_id, concept_id, subject_id, statement, slug, bloom, difficulty FROM kg_learning_objectives");
const blueprints = db.all("SELECT id, concept_id, subject_id, blueprint_type, difficulty, bloom FROM kg_question_blueprints");
const relations = db.all("SELECT from_concept, to_concept, relation_type, weight FROM kg_concept_relations");
const prereqs = db.all("SELECT concept_id, requires_id, strength FROM kg_prerequisites");
const examMappings = db.all("SELECT exam_id, subject_id, concept_id, objective_id, weight, frequency FROM kg_exam_mappings");
const mcqs = db.all("SELECT id, subject_id, chapter_id, topic_id, difficulty, bloom_taxonomy, learning_objective, tags, correct_answer, exam_ids, year FROM mcqs WHERE status = 'active'");
const distractorPools = db.all("SELECT id, subject_id, concept_id, category FROM kg_distractor_pools");
const distractorItems = db.all("SELECT id, pool_id, value FROM kg_distractor_items");

/* Step 8: Semantic Search Index (compact - metadata only, no full MCQ entries) */
console.log("[Step 8] Semantic Search Index");

const searchIndex = [];
for (const c of concepts) {
  const searchableText = [c.name, c.slug, c.domain, c.difficulty, c.bloom, c.tags].filter(Boolean).join(" ");
  searchIndex.push({
    id: "concept_" + c.id, type: "concept", subject_id: c.subject_id,
    name: c.name, slug: c.slug, searchable_text: searchableText,
    metadata: { domain: c.domain, difficulty: c.difficulty, bloom: c.bloom, exam_frequency: c.exam_frequency || 0, tags: c.tags ? c.tags.split(",").map((t) => t.trim()) : [] }
  });
}

for (const mc of microConcepts) {
  const searchableText = [mc.name, mc.slug, mc.detail].filter(Boolean).join(" ");
  searchIndex.push({
    id: "micro_concept_" + mc.id, type: "micro_concept", subject_id: mc.subject_id,
    name: mc.name, slug: mc.slug, searchable_text: searchableText,
    metadata: { difficulty: mc.difficulty, sort_order: mc.sort_order }
  });
}

for (const lo of learningObjectives) {
  const searchableText = [lo.statement, lo.slug, lo.bloom, lo.difficulty].filter(Boolean).join(" ");
  searchIndex.push({
    id: "objective_" + lo.id, type: "learning_objective", subject_id: lo.subject_id,
    name: lo.statement.substring(0, 200), slug: lo.slug, searchable_text: searchableText,
    metadata: { bloom: lo.bloom, difficulty: lo.difficulty }
  });
}

for (const em of examMappings) {
  const concept = conceptMap[em.concept_id];
  const searchableText = [em.exam_id, em.subject_id, concept ? concept.name : ""].filter(Boolean).join(" ");
  searchIndex.push({
    id: "exam_mapping_" + em.id, type: "exam_mapping", subject_id: em.subject_id,
    name: em.exam_id + " - " + (concept ? concept.name : "Unknown"),
    slug: em.exam_id + "-" + em.concept_id, searchable_text: searchableText,
    metadata: { exam_id: em.exam_id, weight: em.weight, frequency: em.frequency }
  });
}

const termIndex = Object.create(null);
for (const entry of searchIndex) {
  const words = entry.searchable_text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
  const uniqueWords = new Set(words);
  for (const word of uniqueWords) {
    if (!termIndex[word]) termIndex[word] = [];
    termIndex[word].push(entry.id);
  }
}

const mcqStats = {
  total_mcqs: mcqs.length,
  by_difficulty: {},
  by_bloom: {},
  by_subject: {}
};
for (const mcq of mcqs) {
  if (mcq.difficulty) mcqStats.by_difficulty[mcq.difficulty] = (mcqStats.by_difficulty[mcq.difficulty] || 0) + 1;
  if (mcq.bloom_taxonomy) mcqStats.by_bloom[mcq.bloom_taxonomy] = (mcqStats.by_bloom[mcq.bloom_taxonomy] || 0) + 1;
  if (mcq.subject_id) mcqStats.by_subject[mcq.subject_id] = (mcqStats.by_subject[mcq.subject_id] || 0) + 1;
}

const step8 = {
  step: "semantic_search_index", generated_at: ts(),
  summary: {
    index_entries: searchIndex.length,
    concept_entries: searchIndex.filter((e) => e.type === "concept").length,
    micro_concept_entries: searchIndex.filter((e) => e.type === "micro_concept").length,
    objective_entries: searchIndex.filter((e) => e.type === "learning_objective").length,
    exam_mapping_entries: searchIndex.filter((e) => e.type === "exam_mapping").length,
    unique_terms: Object.keys(termIndex).length,
    terms_per_entry_avg: searchIndex.length > 0 ? Math.round(searchIndex.reduce((s, e) => s + e.searchable_text.split(/\s+/).filter((w) => w.length > 2).length, 0) / searchIndex.length * 100) / 100 : 0,
    mcq_statistics: mcqStats
  },
  term_index: termIndex
};
writeReport("phase17_search_index.json", step8);
console.log("  Index entries: " + step8.summary.index_entries);
console.log("  Unique terms: " + step8.summary.unique_terms);
console.log("");

/* Step 9: Knowledge Analytics */
console.log("[Step 9] Knowledge Analytics");

const subjectConceptCount = {};
const subjectMicroCount = {};
const subjectObjectiveCount = {};
const subjectBlueprintCount = {};
const subjectRelationCount = {};
const subjectExamMappingCount = {};
const subjectMcqCount = {};

for (const c of concepts) { subjectConceptCount[c.subject_id] = (subjectConceptCount[c.subject_id] || 0) + 1; }
for (const mc of microConcepts) { subjectMicroCount[mc.subject_id] = (subjectMicroCount[mc.subject_id] || 0) + 1; }
for (const lo of learningObjectives) { subjectObjectiveCount[lo.subject_id] = (subjectObjectiveCount[lo.subject_id] || 0) + 1; }
for (const bp of blueprints) { subjectBlueprintCount[bp.subject_id] = (subjectBlueprintCount[bp.subject_id] || 0) + 1; }
for (const r of relations) { const c = conceptMap[r.from_concept]; if (c) subjectRelationCount[c.subject_id] = (subjectRelationCount[c.subject_id] || 0) + 1; }
for (const em of examMappings) { subjectExamMappingCount[em.subject_id] = (subjectExamMappingCount[em.subject_id] || 0) + 1; }
for (const mcq of mcqs) { subjectMcqCount[mcq.subject_id] = (subjectMcqCount[mcq.subject_id] || 0) + 1; }

const subjectDensity = {};
for (const subj of Object.keys(subjectConceptCount).sort()) {
  subjectDensity[subj] = {
    subject_id: subj,
    concepts: subjectConceptCount[subj] || 0,
    micro_concepts: subjectMicroCount[subj] || 0,
    objectives: subjectObjectiveCount[subj] || 0,
    blueprints: subjectBlueprintCount[subj] || 0,
    relations: subjectRelationCount[subj] || 0,
    exam_mappings: subjectExamMappingCount[subj] || 0,
    mcqs: subjectMcqCount[subj] || 0
  };
}

const difficultyDistribution = {};
for (const c of concepts) {
  if (!c.difficulty) continue;
  difficultyDistribution[c.difficulty] = (difficultyDistribution[c.difficulty] || 0) + 1;
}

const bloomDistribution = {};
for (const c of concepts) {
  if (!c.bloom) continue;
  bloomDistribution[c.bloom] = (bloomDistribution[c.bloom] || 0) + 1;
}

const connectivity = {};
for (const c of concepts) {
  const outR = relations.filter((r) => r.from_concept === c.id);
  const inR = relations.filter((r) => r.to_concept === c.id);
  const outP = prereqs.filter((p) => p.concept_id === c.id);
  const inP = prereqs.filter((p) => p.requires_id === c.id);
  connectivity[c.id] = {
    concept_id: c.id, concept_name: c.name, subject_id: c.subject_id,
    outgoing_relations: outR.length, incoming_relations: inR.length,
    outgoing_prereqs: outP.length, incoming_prereqs: inP.length,
    total_connections: outR.length + inR.length + outP.length + inP.length
  };
}
const highConnectivity = Object.values(connectivity).filter((c) => c.total_connections >= 5).sort((a, b) => b.total_connections - a.total_connections);

const step9 = {
  step: "knowledge_analytics", generated_at: ts(),
  summary: {
    total_concepts: concepts.length, total_micro_concepts: microConcepts.length,
    total_objectives: learningObjectives.length, total_blueprints: blueprints.length,
    total_relations: relations.length, total_prerequisites: prereqs.length,
    total_exam_mappings: examMappings.length, total_mcqs: mcqs.length,
    total_distractor_pools: distractorPools.length, total_distractor_items: distractorItems.length,
    subject_count: Object.keys(subjectConceptCount).length,
    avg_concepts_per_subject: concepts.length > 0 ? Math.round(concepts.length / Object.keys(subjectConceptCount).length * 100) / 100 : 0,
    avg_relations_per_concept: concepts.length > 0 ? Math.round(relations.length / concepts.length * 100) / 100 : 0,
    avg_mcq_per_concept: concepts.length > 0 ? Math.round(mcqs.length / concepts.length * 100) / 100 : 0,
    avg_objectives_per_concept: concepts.length > 0 ? Math.round(learningObjectives.length / concepts.length * 100) / 100 : 0
  },
  subject_density: Object.values(subjectDensity),
  connectivity_ranking: highConnectivity.slice(0, 50),
  difficulty_distribution: difficultyDistribution,
  bloom_distribution: bloomDistribution
};
writeReport("phase17_analytics.json", step9);
console.log("  Subjects: " + step9.summary.subject_count);
console.log("  Avg concepts/subject: " + step9.summary.avg_concepts_per_subject);
console.log("");

/* Step 10: Knowledge Integrity */
console.log("[Step 10] Knowledge Integrity");

const issues = [];
const conceptIds = new Set(concepts.map((c) => c.id));

for (const r of relations) {
  if (!conceptIds.has(r.from_concept)) {
    issues.push({ type: "orphan_relation", severity: "high", message: "Relation from_concept " + r.from_concept + " does not exist", source: "kg_concept_relations", from_concept: r.from_concept, to_concept: r.to_concept, relation_type: r.relation_type });
  }
  if (!conceptIds.has(r.to_concept)) {
    issues.push({ type: "orphan_relation", severity: "high", message: "Relation to_concept " + r.to_concept + " does not exist", source: "kg_concept_relations", from_concept: r.from_concept, to_concept: r.to_concept, relation_type: r.relation_type });
  }
}

for (const p of prereqs) {
  if (!conceptIds.has(p.concept_id)) {
    issues.push({ type: "orphan_prerequisite", severity: "high", message: "Prerequisite concept_id " + p.concept_id + " does not exist", source: "kg_prerequisites", concept_id: p.concept_id, requires_id: p.requires_id });
  }
  if (!conceptIds.has(p.requires_id)) {
    issues.push({ type: "orphan_prerequisite", severity: "high", message: "Prerequisite requires_id " + p.requires_id + " does not exist", source: "kg_prerequisites", concept_id: p.concept_id, requires_id: p.requires_id });
  }
  if (p.concept_id === p.requires_id) {
    issues.push({ type: "self_referencing_prerequisite", severity: "critical", message: "Concept " + p.concept_id + " references itself as prerequisite", source: "kg_prerequisites", concept_id: p.concept_id, requires_id: p.requires_id });
  }
}

const prereqGraph = {};
for (const p of prereqs) {
  if (!prereqGraph[p.concept_id]) prereqGraph[p.concept_id] = [];
  prereqGraph[p.concept_id].push(p.requires_id);
}

function hasCycle(start, graph) {
  const visited = new Set();
  const stack = new Set();
  function dfs(node) {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    const deps = graph[node] || [];
    for (const dep of deps) { if (dfs(dep)); }
    stack.delete(node);
    return false;
  }
  return dfs(start);
}

const cyclicConcepts = [];
for (const conceptId of Object.keys(prereqGraph)) {
  if (hasCycle(parseInt(conceptId), prereqGraph)) {
    cyclicConcepts.push(parseInt(conceptId));
    issues.push({ type: "circular_prerequisite", severity: "critical", message: "Circular dependency detected involving concept " + conceptId, source: "kg_prerequisites", concept_id: parseInt(conceptId) });
  }
}

const orphanExamMappings = examMappings.filter((em) => !conceptIds.has(em.concept_id));
for (const em of orphanExamMappings) {
  issues.push({ type: "orphan_exam_mapping", severity: "high", message: "Exam mapping for concept_id " + em.concept_id + " does not exist", source: "kg_exam_mappings", exam_id: em.exam_id, concept_id: em.concept_id });
}

const relationWeightIssues = relations.filter((r) => r.weight && (r.weight < 0 || r.weight > 1));
for (const r of relationWeightIssues) {
  issues.push({ type: "invalid_relation_weight", severity: "medium", message: "Relation weight " + r.weight + " out of range [0,1]", source: "kg_concept_relations", from_concept: r.from_concept, to_concept: r.to_concept, weight: r.weight });
}

const prereqStrengthIssues = prereqs.filter((p) => p.strength && (p.strength < 0 || p.strength > 1));
for (const p of prereqStrengthIssues) {
  issues.push({ type: "invalid_prerequisite_strength", severity: "medium", message: "Prerequisite strength " + p.strength + " out of range [0,1]", source: "kg_prerequisites", concept_id: p.concept_id, requires_id: p.requires_id, strength: p.strength });
}

const missingSubjects = concepts.filter((c) => !c.subject_id);
for (const c of missingSubjects) {
  issues.push({ type: "missing_subject", severity: "medium", message: "Concept " + c.id + " has no subject_id", source: "kg_concepts", concept_id: c.id });
}

const duplicateRelations = {};
for (const r of relations) {
  const key = r.from_concept + "-" + r.to_concept + "-" + r.relation_type;
  if (!duplicateRelations[key]) duplicateRelations[key] = [];
  duplicateRelations[key].push(r);
}
for (const key of Object.keys(duplicateRelations)) {
  if (duplicateRelations[key].length > 1) {
    issues.push({ type: "duplicate_relation", severity: "low", message: "Duplicate relation " + key + " (" + duplicateRelations[key].length + " instances)", source: "kg_concept_relations", key: key });
  }
}

const step10 = {
  step: "knowledge_integrity", generated_at: ts(),
  summary: {
    total_issues: issues.length,
    critical_issues: issues.filter((i) => i.severity === "critical").length,
    high_issues: issues.filter((i) => i.severity === "high").length,
    medium_issues: issues.filter((i) => i.severity === "medium").length,
    low_issues: issues.filter((i) => i.severity === "low").length,
    issue_type_counts: issues.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {}),
    concepts_validated: concepts.length,
    relations_validated: relations.length,
    prerequisites_validated: prereqs.length,
    exam_mappings_validated: examMappings.length,
    circular_dependencies_detected: cyclicConcepts.length,
    integrity_score: concepts.length > 0 ? Math.round(((concepts.length * 10 - issues.length) / (concepts.length * 10)) * 1000) / 1000 : 1.0
  },
  issues: issues,
  circular_concepts: cyclicConcepts,
  integrity_score: concepts.length > 0 ? Math.round(((concepts.length * 10 - issues.length) / (concepts.length * 10)) * 1000) / 1000 : 1.0
};
writeReport("phase17_integrity.json", step10);
console.log("  Issues: " + step10.summary.total_issues);
console.log("  Integrity score: " + step10.summary.integrity_score);
console.log("");

const totalDuration = Date.now() - startTime;
console.log("=== Search + Analytics + Integrity Complete ===");
console.log("Duration: " + totalDuration + "ms");
db.close();
