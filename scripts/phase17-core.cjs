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
console.log("=== Phase 17: Core Graph (Steps 1-3) ===");
console.log("Started at " + ts());

/* Step 1: Semantic Concept Graph */
console.log("[Step 1] Semantic Concept Graph");

const concepts = db.all("SELECT id, subject_id, chapter_id, topic_id, subtopic_id, name, slug, domain, difficulty, bloom, exam_frequency, tags, status FROM kg_concepts WHERE status = 'active' ORDER BY id");
const conceptMap = {};
for (const c of concepts) conceptMap[c.id] = c;

const existingRelations = db.all("SELECT from_concept, to_concept, relation_type, weight FROM kg_concept_relations");
const existingPrereqs = db.all("SELECT concept_id, requires_id, strength FROM kg_prerequisites");
const examMappings = db.all("SELECT exam_id, subject_id, concept_id, objective_id, weight, frequency FROM kg_exam_mappings");

const relations = [];
const relationTypes = {};
for (const r of existingRelations) {
  relations.push({ from_concept: r.from_concept, to_concept: r.to_concept, relation_type: r.relation_type, weight: r.weight || 0.5, source: "kg_concept_relations" });
  relationTypes[r.relation_type] = (relationTypes[r.relation_type] || 0) + 1;
}
for (const p of existingPrereqs) {
  relations.push({ from_concept: p.requires_id, to_concept: p.concept_id, relation_type: "prerequisite", weight: p.strength || 0.5, source: "kg_prerequisites" });
  relationTypes["prerequisite"] = (relationTypes["prerequisite"] || 0) + 1;
}

const chapterConceptCounts = {};
for (const c of concepts) {
  if (c.chapter_id) {
    chapterConceptCounts[c.chapter_id] = (chapterConceptCounts[c.chapter_id] || 0) + 1;
  }
}
const topChapters = Object.entries(chapterConceptCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);

const topicConceptCounts = {};
for (const c of concepts) {
  if (c.topic_id) {
    topicConceptCounts[c.topic_id] = (topicConceptCounts[c.topic_id] || 0) + 1;
  }
}
const topTopics = Object.entries(topicConceptCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);

const examConceptCounts = {};
for (const em of examMappings) {
  examConceptCounts[em.concept_id] = (examConceptCounts[em.concept_id] || 0) + 1;
}

const conceptRelations = {};
for (const c of concepts) {
  conceptRelations[c.id] = {
    concept_id: c.id, name: c.name, slug: c.slug, subject_id: c.subject_id,
    chapter_id: c.chapter_id, topic_id: c.topic_id, subtopic_id: c.subtopic_id,
    domain: c.domain, difficulty: c.difficulty, bloom: c.bloom,
    exam_frequency: c.exam_frequency || 0, exam_mapping_count: examConceptCounts[c.id] || 0,
    tags: c.tags, status: c.status,
    outgoing_relations: [], incoming_relations: []
  };
}
for (const r of relations) {
  if (conceptRelations[r.from_concept]) {
    conceptRelations[r.from_concept].outgoing_relations.push({ to_concept: r.to_concept, relation_type: r.relation_type, weight: r.weight, source: r.source });
  }
  if (conceptRelations[r.to_concept]) {
    conceptRelations[r.to_concept].incoming_relations.push({ from_concept: r.from_concept, relation_type: r.relation_type, weight: r.weight, source: r.source });
  }
}

const coOccurrenceSummary = {
  chapter_cooccurrence: topChapters.map(([ch, count]) => ({ chapter_id: ch, concept_count: count })),
  topic_cooccurrence: topTopics.map(([tp, count]) => ({ topic_id: tp, concept_count: count })),
  total_chapters_with_concepts: Object.keys(chapterConceptCounts).length,
  total_topics_with_concepts: Object.keys(topicConceptCounts).length
};

const totalRelations = relations.length;
const avgWeight = totalRelations > 0 ? relations.reduce((s, r) => s + r.weight, 0) / totalRelations : 0;

const step1 = {
  step: "semantic_concept_graph", generated_at: ts(),
  summary: {
    total_concepts: concepts.length, total_relations: totalRelations,
    relation_type_counts: relationTypes,
    avg_relation_weight: Math.round(avgWeight * 1000) / 1000,
    sources: ["kg_concept_relations", "kg_prerequisites"],
    cooccurrence_summary: coOccurrenceSummary
  },
  relation_type_distribution: relationTypes,
  co_occurrence_summary: coOccurrenceSummary,
  concepts: conceptRelations
};
writeReport("phase17_semantic_graph.json", step1);
console.log("  Concepts: " + step1.summary.total_concepts + ", Relations: " + step1.summary.total_relations);
console.log("  Top chapter: " + (topChapters[0] ? topChapters[0][0] + " (" + topChapters[0][1] + " concepts)" : "N/A"));
console.log("");

/* Step 2: Prerequisite Discovery */
console.log("[Step 2] Prerequisite Discovery");
const prereqs = [];
const prereqSet = new Set();
for (const p of existingPrereqs) {
  const key = p.requires_id + "->" + p.concept_id;
  prereqSet.add(key);
  prereqs.push({ concept_id: p.concept_id, prerequisite_id: p.requires_id, strength: p.strength || 0.5, source: "kg_prerequisites", confidence: p.strength && p.strength >= 0.7 ? "high" : p.strength && p.strength >= 0.4 ? "medium" : "low" });
}
for (const r of existingRelations) {
  if (r.relation_type === "depends_on") {
    const key = r.from_concept + "->" + r.to_concept;
    if (!prereqSet.has(key)) {
      prereqSet.add(key);
      prereqs.push({ concept_id: r.to_concept, prerequisite_id: r.from_concept, strength: r.weight || 0.5, source: "kg_concept_relations_depends_on", confidence: r.weight && r.weight >= 0.7 ? "high" : r.weight && r.weight >= 0.4 ? "medium" : "low" });
    }
  }
  if (r.relation_type === "parent") {
    const key = r.from_concept + "->" + r.to_concept;
    if (!prereqSet.has(key)) {
      prereqSet.add(key);
      prereqs.push({ concept_id: r.to_concept, prerequisite_id: r.from_concept, strength: r.weight || 0.6, source: "kg_concept_relations_parent", confidence: r.weight && r.weight >= 0.7 ? "high" : r.weight && r.weight >= 0.4 ? "medium" : "low" });
    }
  }
}

const chapterConceptList = {};
for (const c of concepts) {
  if (c.chapter_id) {
    if (!chapterConceptList[c.chapter_id]) chapterConceptList[c.chapter_id] = [];
    chapterConceptList[c.chapter_id].push(c);
  }
}
for (const ch of Object.keys(chapterConceptList)) {
  const chConcepts = chapterConceptList[ch];
  chConcepts.sort((a, b) => (a.exam_frequency || 0) - (b.exam_frequency || 0));
  for (let i = 0; i < chConcepts.length - 1; i++) {
    const key = chConcepts[i].id + "->" + chConcepts[i + 1].id;
    if (!prereqSet.has(key)) {
      prereqSet.add(key);
      prereqs.push({ concept_id: chConcepts[i + 1].id, prerequisite_id: chConcepts[i].id, strength: 0.3, source: "chapter_sequence", confidence: "low" });
    }
  }
}

const examConceptSeq = {};
for (const em of examMappings) {
  if (!examConceptSeq[em.exam_id]) examConceptSeq[em.exam_id] = [];
  examConceptSeq[em.exam_id].push({ concept_id: em.concept_id, weight: em.weight || 0.5, frequency: em.frequency || 0 });
}
for (const exam of Object.keys(examConceptSeq)) {
  const ems = examConceptSeq[exam];
  ems.sort((a, b) => (b.weight * b.frequency) - (a.weight * a.frequency));
  for (let i = 0; i < ems.length - 1; i++) {
    const key = ems[i + 1].concept_id + "->" + ems[i].concept_id;
    if (!prereqSet.has(key)) {
      prereqSet.add(key);
      prereqs.push({ concept_id: ems[i].concept_id, prerequisite_id: ems[i + 1].concept_id, strength: 0.25, source: "exam_mapping_sequence", confidence: "low" });
    }
  }
}

const prereqGraph = {};
const conceptPrereqCount = {};
for (const p of prereqs) {
  if (!prereqGraph[p.concept_id]) prereqGraph[p.concept_id] = [];
  prereqGraph[p.concept_id].push(p);
  conceptPrereqCount[p.concept_id] = (conceptPrereqCount[p.concept_id] || 0) + 1;
}

const step2 = {
  step: "prerequisite_discovery", generated_at: ts(),
  summary: {
    total_prerequisites: prereqs.length,
    source_breakdown: prereqs.reduce((acc, p) => { acc[p.source] = (acc[p.source] || 0) + 1; return acc; }, {}),
    confidence_breakdown: prereqs.reduce((acc, p) => { acc[p.confidence] = (acc[p.confidence] || 0) + 1; return acc; }, {}),
    concepts_with_prereqs: Object.keys(prereqGraph).length,
    avg_strength: prereqs.length > 0 ? Math.round(prereqs.reduce((s, p) => s + p.strength, 0) / prereqs.length * 1000) / 1000 : 0
  },
  prerequisite_edges: prereqs,
  concept_prereq_counts: conceptPrereqCount
};
writeReport("phase17_prerequisite_graph.json", step2);
console.log("  Prerequisites: " + step2.summary.total_prerequisites);
console.log("");

/* Step 3: Learning Path Engine */
console.log("[Step 3] Learning Path Engine");
const subjectConcepts = {};
for (const c of concepts) {
  if (!subjectConcepts[c.subject_id]) subjectConcepts[c.subject_id] = [];
  subjectConcepts[c.subject_id].push(c);
}

function topologicalSort(conceptIds, prereqGraph) {
  const visited = new Set();
  const temp = new Set();
  const result = [];
  const conceptSet = new Set(conceptIds);
  function visit(id) {
    if (visited.has(id)) return true;
    if (temp.has(id)) return false;
    temp.add(id);
    const deps = prereqGraph[id] || [];
    for (const dep of deps) {
      if (conceptSet.has(dep)) { if (!visit(dep)) return false; }
    }
    temp.delete(id);
    visited.add(id);
    result.push(id);
    return true;
  }
  for (const id of conceptIds) { if (!visited.has(id)) visit(id); }
  return result;
}

const paths = [];
for (const subject of Object.keys(subjectConcepts).sort()) {
  const subjectConceptList = subjectConcepts[subject];
  const sortedIds = topologicalSort(subjectConceptList.map((c) => c.id), prereqGraph);
  const sortedConcepts = sortedIds.map((id) => conceptMap[id]).filter(Boolean);
  const chapters = {};
  for (const c of sortedConcepts) {
    if (c.chapter_id) {
      if (!chapters[c.chapter_id]) chapters[c.chapter_id] = [];
      chapters[c.chapter_id].push(c);
    }
  }
  const pathSteps = [];
  let stepOrder = 1;
  for (const chId of Object.keys(chapters).sort()) {
    for (const c of chapters[chId]) {
      pathSteps.push({ step_order: stepOrder++, concept_id: c.id, concept_name: c.name, chapter_id: c.chapter_id, topic_id: c.topic_id, difficulty: c.difficulty, bloom: c.bloom, exam_frequency: c.exam_frequency });
    }
  }
  paths.push({ subject_id: subject, subject_name: subject, total_steps: pathSteps.length, total_chapters: Object.keys(chapters).length, path_name: "Learning Path for " + subject, path_slug: "learning-path-" + subject.toLowerCase().replace(/\s+/g, "-"), steps: pathSteps });
}

const step3 = {
  step: "learning_paths", generated_at: ts(),
  summary: { total_paths: paths.length, total_steps: paths.reduce((s, p) => s + p.total_steps, 0), subjects_covered: paths.map((p) => p.subject_id) },
  paths: paths
};
writeReport("phase17_learning_paths.json", step3);
console.log("  Learning paths: " + step3.summary.total_paths + " (" + step3.summary.total_steps + " steps)");

const totalDuration = Date.now() - startTime;
console.log("");
console.log("=== Core Graph Complete ===");
console.log("Duration: " + totalDuration + "ms");
db.close();
