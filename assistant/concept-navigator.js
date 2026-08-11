#!/usr/bin/env node
/* ============================================================
   Phase 27 — STEP 5: Enterprise Knowledge Navigation
   Deterministic navigation over the Knowledge Graph (read-only):
     - concept explorer (KG concept/micro/objective trees)
     - semantic navigation (concept relations: parent/child/related/depends_on)
     - prerequisite explorer (depends_on + prerequisites edges)
     - relationship explorer (relation statistics + top hubs)
     - learning maps (subject -> chapter -> topic -> subtopic)
   Report: docs/phase27_navigation.json
   Usage:  node assistant/concept-navigator.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "phase27_navigation.json");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");

function generate(db) {
  /* ---- concept explorer ---- */
  const kgSubjects = db.prepare(
    "SELECT c.subject_id, COUNT(DISTINCT c.id) concepts, COUNT(DISTINCT m.id) micros FROM kg_concepts c LEFT JOIN kg_micro_concepts m ON m.concept_id=c.id GROUP BY c.subject_id ORDER BY concepts DESC LIMIT 12"
  ).all();
  const objectiveBySubject = db.prepare(
    "SELECT subject_id, COUNT(*) n FROM kg_learning_objectives GROUP BY subject_id ORDER BY n DESC LIMIT 12"
  ).all();

  /* ---- semantic navigation: relations ---- */
  const relations = db.prepare("SELECT from_concept, to_concept, relation_type, weight FROM kg_concept_relations").all();
  const byType = {};
  for (const r of relations) byType[r.relation_type] = (byType[r.relation_type] || 0) + 1;
  const relTypes = Object.entries(byType).map(([relation_type, count]) => ({ relation_type, count })).sort((a, b) => b.count - a.count);

  /* ---- relationship explorer: top hubs (most edges) with neighbors ---- */
  const deg = {};
  for (const r of relations) {
    deg[r.from_concept] = (deg[r.from_concept] || 0) + 1;
    deg[r.to_concept] = (deg[r.to_concept] || 0) + 1;
  }
  const hubs = Object.entries(deg)
    .map(([id, degree]) => ({ concept_id: Number(id), degree }))
    .sort((a, b) => b.degree - a.degree || a.concept_id - b.concept_id)
    .slice(0, 8);
  const hubDetails = hubs.map((h) => {
    const c = db.prepare("SELECT name, subject_id FROM kg_concepts WHERE id=?").get(h.concept_id) || { name: "(deleted)", subject_id: "" };
    const neighbors = relations
      .filter((r) => r.from_concept === h.concept_id || r.to_concept === h.concept_id)
      .slice(0, 6)
      .map((r) => {
        const other = r.from_concept === h.concept_id ? r.to_concept : r.from_concept;
        const oc = db.prepare("SELECT name FROM kg_concepts WHERE id=?").get(other) || { name: "(deleted)" };
        return { concept_id: other, name: oc.name, relation_type: r.relation_type };
      });
    return { concept_id: h.concept_id, name: c.name, subject_id: c.subject_id, degree: h.degree, neighbors };
  });

  /* ---- prerequisite explorer ---- */
  const prereqs = db.prepare(
    "SELECT p.concept_id, p.requires_id, p.strength, c1.name concept, c2.name requires FROM kg_prerequisites p LEFT JOIN kg_concepts c1 ON c1.id=p.concept_id LEFT JOIN kg_concepts c2 ON c2.id=p.requires_id ORDER BY p.strength DESC, p.concept_id"
  ).all();
  const dependsOn = relations
    .filter((r) => r.relation_type === "depends_on")
    .map((r) => {
      const c1 = db.prepare("SELECT name FROM kg_concepts WHERE id=?").get(r.from_concept) || { name: "(deleted)" };
      const c2 = db.prepare("SELECT name FROM kg_concepts WHERE id=?").get(r.to_concept) || { name: "(deleted)" };
      return { from_concept: r.from_concept, from_name: c1.name, to_concept: r.to_concept, to_name: c2.name, weight: r.weight };
    });

  /* ---- learning maps: top 6 subjects' trees ---- */
  const topSubjects = db.prepare(
    "SELECT s.id, s.name, COUNT(m.id) n FROM subjects s JOIN mcqs m ON m.subject_id=s.id AND m.status='active' GROUP BY s.id ORDER BY n DESC LIMIT 6"
  ).all();
  const maps = topSubjects.map((s) => {
    const chapters = db.prepare(
      "SELECT c.id, c.name, (SELECT COUNT(*) FROM topics t WHERE t.chapter_id=c.id) topics, (SELECT COUNT(*) FROM subtopics st JOIN topics t2 ON t2.id=st.topic_id WHERE t2.chapter_id=c.id) subtopics FROM chapters c WHERE c.subject_id=? ORDER BY c.sort_order LIMIT 12"
    ).all(s.id);
    return { subject_id: s.id, name: s.name, mcqs: s.n, chapters: chapters.map((c) => ({ name: c.name, topics: c.topics, subtopics: c.subtopics })) };
  });

  const report = {
    step: "navigation",
    generated_at: new Date().toISOString(),
    summary: {
      kg_subjects: kgSubjects.length,
      relation_types: relTypes.length,
      total_relations: relations.length,
      prerequisite_edges: prereqs.length + dependsOn.length,
      learning_maps: maps.length,
      top_hubs: hubDetails.length,
      status: "PASS",
    },
    concept_explorer: {
      by_subject: kgSubjects,
      objectives_by_subject: objectiveBySubject,
    },
    semantic_navigation: {
      relation_types: relTypes,
      relation_sample: relations.slice(0, 10),
    },
    relationship_explorer: {
      top_hubs: hubDetails,
    },
    prerequisite_explorer: {
      explicit_prerequisites: prereqs,
      depends_on_edges: dependsOn,
      guidance: "Complete depends_on targets before attempting the dependent concept.",
    },
    learning_maps: maps,
  };
  return report;
}

function main() {
  const db = new DatabaseSync(DB, { readOnly: true });
  try {
    const report = generate(db);
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
    console.log(`[concept-navigator] kg_subjects=${report.summary.kg_subjects} relations=${report.summary.total_relations} prereqs=${report.summary.prerequisite_edges} maps=${report.summary.learning_maps}`);
    console.log("report -> docs/phase27_navigation.json");
    process.exit(0);
  } catch (e) {
    console.error("[concept-navigator] ERROR:", e.message);
    process.exit(1);
  } finally {
    try { db.close(); } catch (e) {}
  }
}

if (require.main === module) main();
module.exports = { generate };
