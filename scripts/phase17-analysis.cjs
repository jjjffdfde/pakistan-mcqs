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
console.log("=== Phase 17: Analysis (Steps 4-7) ===");
console.log("Started at " + ts());

const concepts = db.all("SELECT id, subject_id, chapter_id, topic_id, name, slug, domain, difficulty, bloom, exam_frequency, tags, status FROM kg_concepts WHERE status = 'active' ORDER BY id");
const conceptMap = {};
for (const c of concepts) conceptMap[c.id] = c;

const existingRelations = db.all("SELECT from_concept, to_concept, relation_type, weight FROM kg_concept_relations");
const existingPrereqs = db.all("SELECT concept_id, requires_id, strength FROM kg_prerequisites");
const examMappings = db.all("SELECT exam_id, subject_id, concept_id, objective_id, weight, frequency FROM kg_exam_mappings");
const mcqs = db.all("SELECT id, subject_id, chapter_id, topic_id, subtopic_id, difficulty, bloom_taxonomy, learning_objective, exam_ids, tags, correct_answer, explanation_why_wrong FROM mcqs WHERE status = 'active'");

/* Step 4: Concept Similarity */
console.log("[Step 4] Concept Similarity");

const chapterConcepts = {};
for (const c of concepts) {
  if (c.chapter_id) {
    if (!chapterConcepts[c.chapter_id]) chapterConcepts[c.chapter_id] = [];
    chapterConcepts[c.chapter_id].push(c.id);
  }
}

const topicConcepts = {};
for (const c of concepts) {
  if (c.topic_id) {
    if (!topicConcepts[c.topic_id]) topicConcepts[c.topic_id] = [];
    topicConcepts[c.topic_id].push(c.id);
  }
}

const examConceptIds = {};
for (const em of examMappings) {
  if (!examConceptIds[em.exam_id]) examConceptIds[em.exam_id] = new Set();
  examConceptIds[em.exam_id].add(em.concept_id);
}

const pairScores = {};
function addScore(key, score) {
  pairScores[key] = (pairScores[key] || 0) + score;
}

for (const chId of Object.keys(chapterConcepts)) {
  const ids = chapterConcepts[chId];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const key = Math.min(ids[i], ids[j]) + "-" + Math.max(ids[i], ids[j]);
      addScore(key, 0.3);
    }
  }
}

for (const tpId of Object.keys(topicConcepts)) {
  const ids = topicConcepts[tpId];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const key = Math.min(ids[i], ids[j]) + "-" + Math.max(ids[i], ids[j]);
      addScore(key, 0.35);
    }
  }
}

for (const exam of Object.keys(examConceptIds)) {
  const ids = Array.from(examConceptIds[exam]);
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const key = Math.min(ids[i], ids[j]) + "-" + Math.max(ids[i], ids[j]);
      addScore(key, 0.2);
    }
  }
}

const relationPairs = {};
for (const r of existingRelations) {
  const key = Math.min(r.from_concept, r.to_concept) + "-" + Math.max(r.from_concept, r.to_concept);
  relationPairs[key] = (relationPairs[key] || 0) + (r.weight || 0.5);
}
for (const key of Object.keys(relationPairs)) {
  addScore(key, 0.4 * Math.min(1, relationPairs[key] / 2));
}

const prereqPairs = {};
for (const p of existingPrereqs) {
  const key = Math.min(p.concept_id, p.requires_id) + "-" + Math.max(p.concept_id, p.requires_id);
  prereqPairs[key] = (prereqPairs[key] || 0) + (p.strength || 0.5);
}
for (const key of Object.keys(prereqPairs)) {
  addScore(key, 0.5);
}

const examConceptCount = {};
for (const em of examMappings) {
  examConceptCount[em.concept_id] = (examConceptCount[em.concept_id] || 0) + 1;
}

const similarityPairs = [];
for (const key of Object.keys(pairScores)) {
  const parts = key.split("-");
  const id1 = parseInt(parts[0]);
  const id2 = parseInt(parts[1]);
  const c1 = conceptMap[id1];
  const c2 = conceptMap[id2];
  if (!c1 || !c2) continue;

  const rawScore = pairScores[key];
  const evidenceCount = (chapterConcepts[c1.chapter_id] && chapterConcepts[c1.chapter_id].includes(id2) ? 1 : 0) +
    (topicConcepts[c1.topic_id] && topicConcepts[c1.topic_id].includes(id2) ? 1 : 0) +
    (relationPairs[key] ? 1 : 0) +
    (prereqPairs[key] ? 1 : 0);
  const maxPossible = Math.max(1, evidenceCount * 0.5);
  const normalizedScore = Math.min(1.0, rawScore / maxPossible);

  similarityPairs.push({
    concept_a_id: id1, concept_a_name: c1.name,
    concept_b_id: id2, concept_b_name: c2.name,
    similarity_score: Math.round(normalizedScore * 1000) / 1000,
    evidence_sources: evidenceCount,
    same_subject: c1.subject_id === c2.subject_id,
    same_chapter: !!(chapterConcepts[c1.chapter_id] && chapterConcepts[c1.chapter_id].includes(id2)),
    same_topic: !!(topicConcepts[c1.topic_id] && topicConcepts[c1.topic_id].includes(id2)),
    has_relation: !!relationPairs[key],
    has_prerequisite: !!prereqPairs[key],
    exam_frequency_product: (examConceptCount[id1] || 0) * (examConceptCount[id2] || 0)
  });
}

similarityPairs.sort((a, b) => b.similarity_score - a.similarity_score);
const topSimilar = similarityPairs.slice(0, 200);

const step4 = {
  step: "concept_similarity", generated_at: ts(),
  summary: {
    total_concepts: concepts.length,
    total_similarity_pairs: similarityPairs.length,
    top_similar_pairs: topSimilar.length,
    avg_similarity: similarityPairs.length > 0 ? Math.round(similarityPairs.reduce((s, p) => s + p.similarity_score, 0) / similarityPairs.length * 1000) / 1000 : 0,
    max_similarity: similarityPairs.length > 0 ? Math.round(similarityPairs[0].similarity_score * 1000) / 1000 : 0,
    min_similarity: similarityPairs.length > 0 ? Math.round(similarityPairs[similarityPairs.length - 1].similarity_score * 1000) / 1000 : 0
  },
  distribution: {
    high: similarityPairs.filter((p) => p.similarity_score >= 0.7).length,
    medium: similarityPairs.filter((p) => p.similarity_score >= 0.4 && p.similarity_score < 0.7).length,
    low: similarityPairs.filter((p) => p.similarity_score < 0.4).length
  },
  top_similar_pairs: topSimilar
};
writeReport("phase17_similarity_graph.json", step4);
console.log("  Similarity pairs: " + step4.summary.total_similarity_pairs);
console.log("  Top pairs: " + topSimilar.length);
console.log("");

/* Step 5: Confusion Intelligence */
console.log("[Step 5] Confusion Intelligence");

const confusionByConcept = {};
for (const mcq of mcqs) {
  if (!mcq.explanation_why_wrong || mcq.explanation_why_wrong === "") continue;
  const cId = mcq.subtopic_id;
  if (!cId || !conceptMap[cId]) continue;
  if (!confusionByConcept[cId]) confusionByConcept[cId] = { concept_id: cId, concept_name: conceptMap[cId].name, total_mcq_with_wrong_explanations: 0, sample_explanations: [] };
  confusionByConcept[cId].total_mcq_with_wrong_explanations++;
  if (confusionByConcept[cId].sample_explanations.length < 5) {
    confusionByConcept[cId].sample_explanations.push({
      mcq_id: mcq.id, difficulty: mcq.difficulty, correct_answer: mcq.correct_answer,
      explanation_why_wrong: mcq.explanation_why_wrong.substring(0, 500)
    });
  }
}

const confusionPatterns = Object.values(confusionByConcept).sort((a, b) => b.total_mcq_with_wrong_explanations - a.total_mcq_with_wrong_explanations);

const subjectConfusion = {};
for (const p of confusionPatterns) {
  const c = conceptMap[p.concept_id];
  if (!c) continue;
  const subj = c.subject_id;
  if (!subjectConfusion[subj]) subjectConfusion[subj] = { subject_id: subj, total_concepts_with_confusion: 0, total_mcq_with_confusion: 0 };
  subjectConfusion[subj].total_concepts_with_confusion++;
  subjectConfusion[subj].total_mcq_with_confusion += p.total_mcq_with_wrong_explanations;
}

const step5 = {
  step: "confusion_intelligence", generated_at: ts(),
  summary: {
    total_mcqs_with_wrong_explanations: mcqs.filter((m) => m.explanation_why_wrong && m.explanation_why_wrong !== "").length,
    concepts_with_confusion_data: confusionPatterns.length,
    subjects_with_confusion: Object.keys(subjectConfusion).length,
    top_confused_concepts: confusionPatterns.slice(0, 20).map((p) => ({ concept_id: p.concept_id, concept_name: p.concept_name, count: p.total_mcq_with_wrong_explanations }))
  },
  confusion_by_concept: confusionPatterns.slice(0, 100),
  subject_summary: Object.values(subjectConfusion)
};
writeReport("phase17_confusion_report.json", step5);
console.log("  MCQs with wrong explanations: " + step5.summary.total_mcqs_with_wrong_explanations);
console.log("  Concepts with confusion data: " + step5.summary.concepts_with_confusion_data);
console.log("");

/* Step 6: Exam Intelligence */
console.log("[Step 6] Exam Intelligence");

const examConceptDetails = {};
for (const em of examMappings) {
  if (!examConceptDetails[em.exam_id]) examConceptDetails[em.exam_id] = { exam_id: em.exam_id, total_weight: 0, concept_count: 0, concepts: [] };
  examConceptDetails[em.exam_id].total_weight += em.weight || 0;
  examConceptDetails[em.exam_id].concept_count++;
  examConceptDetails[em.exam_id].concepts.push({ concept_id: em.concept_id, weight: em.weight || 0, frequency: em.frequency || 0 });
}
for (const exam of Object.keys(examConceptDetails)) {
  examConceptDetails[exam].concepts.sort((a, b) => b.weight - a.weight);
}

const subjectExamDistribution = {};
for (const em of examMappings) {
  if (!subjectExamDistribution[em.subject_id]) subjectExamDistribution[em.subject_id] = {};
  if (!subjectExamDistribution[em.subject_id][em.exam_id]) subjectExamDistribution[em.subject_id][em.exam_id] = { weight: 0, count: 0 };
  subjectExamDistribution[em.subject_id][em.exam_id].weight += em.weight || 0;
  subjectExamDistribution[em.subject_id][em.exam_id].count++;
}

const chapterExamFrequency = {};
for (const mcq of mcqs) {
  if (!mcq.chapter_id) continue;
  if (!chapterExamFrequency[mcq.chapter_id]) chapterExamFrequency[mcq.chapter_id] = { chapter_id: mcq.chapter_id, mcq_count: 0, subjects: new Set() };
  chapterExamFrequency[mcq.chapter_id].mcq_count++;
  chapterExamFrequency[mcq.chapter_id].subjects.add(mcq.subject_id);
}
const chapterExamFreqArray = [];
for (const ch of Object.keys(chapterExamFrequency).sort((a, b) => chapterExamFrequency[b].mcq_count - chapterExamFrequency[a].mcq_count)) {
  const data = chapterExamFrequency[ch];
  chapterExamFreqArray.push({ chapter_id: ch, mcq_count: data.mcq_count, subject_count: data.subjects.size });
}

const yearTrends = {};
for (const mcq of mcqs) {
  if (!mcq.year) continue;
  if (!yearTrends[mcq.year]) yearTrends[mcq.year] = { year: mcq.year, count: 0 };
  yearTrends[mcq.year].count++;
}
const yearTrendsArray = Object.values(yearTrends).sort((a, b) => a.year - b.year);

const difficultyDistribution = {};
for (const mcq of mcqs) {
  if (!mcq.difficulty) continue;
  difficultyDistribution[mcq.difficulty] = (difficultyDistribution[mcq.difficulty] || 0) + 1;
}

const bloomDistribution = {};
for (const mcq of mcqs) {
  if (!mcq.bloom_taxonomy) continue;
  bloomDistribution[mcq.bloom_taxonomy] = (bloomDistribution[mcq.bloom_taxonomy] || 0) + 1;
}

const step6 = {
  step: "exam_intelligence", generated_at: ts(),
  summary: {
    total_exams: Object.keys(examConceptDetails).length,
    total_exam_mappings: examMappings.length,
    total_mcqs: mcqs.length,
    year_range: yearTrendsArray.length > 0 ? { min: yearTrendsArray[0].year, max: yearTrendsArray[yearTrendsArray.length - 1].year } : null,
    top_exams_by_weight: Object.values(examConceptDetails).sort((a, b) => b.total_weight - a.total_weight).slice(0, 10).map((e) => ({ exam_id: e.exam_id, total_weight: Math.round(e.total_weight * 1000) / 1000, concept_count: e.concept_count })),
    top_chapters_by_mcq_count: chapterExamFreqArray.slice(0, 20),
    year_trends: yearTrendsArray,
    difficulty_distribution: difficultyDistribution,
    bloom_distribution: bloomDistribution
  },
  exam_details: Object.values(examConceptDetails).slice(0, 50),
  subject_exam_distribution: subjectExamDistribution
};
writeReport("phase17_exam_intelligence.json", step6);
console.log("  Exams analyzed: " + step6.summary.total_exams);
console.log("  Year range: " + (step6.summary.year_range ? step6.summary.year_range.min + "-" + step6.summary.year_range.max : "N/A"));
console.log("");

/* Step 7: Adaptive Recommendation Engine */
console.log("[Step 7] Adaptive Recommendation Engine");

const prereqData = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, "phase17_prerequisite_graph.json"), "utf8"));
const prereqGraph = {};
for (const p of prereqData.prerequisite_edges) {
  if (!prereqGraph[p.concept_id]) prereqGraph[p.concept_id] = [];
  prereqGraph[p.concept_id].push(p);
}

const similarityTop = step4.top_similar_pairs;
const confusionSet = new Set(confusionPatterns.map((p) => p.concept_id));
const conceptExamFreq = {};
for (const em of examMappings) {
  conceptExamFreq[em.concept_id] = (conceptExamFreq[em.concept_id] || 0) + (em.frequency || 0);
}

const recommendations = [];
for (const c of concepts) {
  const rec = {
    concept_id: c.id, concept_name: c.name, subject_id: c.subject_id,
    difficulty: c.difficulty, bloom: c.bloom,
    exam_frequency: c.exam_frequency || 0, exam_mapping_frequency: conceptExamFreq[c.id] || 0,
    has_prerequisites: (prereqGraph[c.id] || []).length > 0,
    prerequisite_count: (prereqGraph[c.id] || []).length,
    is_confusion_concept: confusionSet.has(c.id),
    confusion_count: confusionSet.has(c.id) ? confusionPatterns.find((p) => p.concept_id === c.id).total_mcq_with_wrong_explanations : 0,
    similar_concepts: similarityTop.filter((s) => s.concept_a_id === c.id || s.concept_b_id === c.id).slice(0, 5).map((s) => {
      const otherId = s.concept_a_id === c.id ? s.concept_b_id : s.concept_a_id;
      return { concept_id: otherId, concept_name: conceptMap[otherId] ? conceptMap[otherId].name : "Unknown", similarity_score: s.similarity_score };
    }),
    recommendation_type: [], priority_score: 0
  };

  if (rec.is_confusion_concept) { rec.recommendation_type.push("revision"); rec.priority_score += 30; }
  if (rec.has_prerequisites && rec.prerequisite_count > 2) { rec.recommendation_type.push("prerequisite_review"); rec.priority_score += 20; }
  if (rec.exam_frequency > 5) { rec.recommendation_type.push("high_frequency_review"); rec.priority_score += 15; }
  if (rec.exam_mapping_frequency > 3) { rec.recommendation_type.push("exam_relevant"); rec.priority_score += 10; }
  if (rec.difficulty === "hard" || rec.difficulty === "very_hard") { rec.recommendation_type.push("challenging_topic"); rec.priority_score += 10; }
  if (rec.similar_concepts.length > 0) { rec.recommendation_type.push("related_study"); rec.priority_score += 5; }

  recommendations.push(rec);
}

recommendations.sort((a, b) => b.priority_score - a.priority_score);

const weakConcepts = recommendations.filter((r) => r.is_confusion_concept && r.exam_frequency > 0);
const nextConcepts = recommendations.filter((r) => r.has_prerequisites && r.prerequisite_count <= 1 && r.exam_frequency > 2);
const revisionConcepts = recommendations.filter((r) => r.recommendation_type.includes("revision"));

const step7 = {
  step: "adaptive_recommendations", generated_at: ts(),
  summary: {
    total_concepts: concepts.length, total_recommendations: recommendations.length,
    weak_concepts_count: weakConcepts.length,
    next_concepts_count: nextConcepts.length,
    revision_concepts_count: revisionConcepts.length,
    avg_priority_score: recommendations.length > 0 ? Math.round(recommendations.reduce((s, r) => s + r.priority_score, 0) / recommendations.length * 100) / 100 : 0,
    top_recommendations: recommendations.slice(0, 50).map((r) => ({ concept_id: r.concept_id, concept_name: r.concept_name, priority_score: r.priority_score, recommendation_types: r.recommendation_type }))
  },
  weak_concepts: weakConcepts.slice(0, 50),
  next_concepts: nextConcepts.slice(0, 50),
  revision_concepts: revisionConcepts.slice(0, 50),
  all_recommendations: recommendations.slice(0, 200)
};
writeReport("phase17_recommendation_engine.json", step7);
console.log("  Recommendations: " + step7.summary.total_recommendations);
console.log("  Weak concepts: " + step7.summary.weak_concepts_count);
console.log("");

const totalDuration = Date.now() - startTime;
console.log("=== Analysis Complete ===");
console.log("Duration: " + totalDuration + "ms");
db.close();
