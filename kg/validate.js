/* ============================================================
   Phase 14 — Knowledge Graph engine: validation
   Runs structural + coverage checks over the whole graph and
   writes one kg_validation_reports row per run. Every check
   returns a pass ratio (0..1); score = weighted average.
   Checks include orphan references, duplicate slugs, coverage
   floors, dangling references, exam-map integrity, prerequisite
   cycles and statistics rollup completeness.
   ============================================================ */
"use strict";

function hasTable(db, name) {
  return !!db.get("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", [name]);
}

function check(issue, name, ratio, detail) {
  return { name, ratio: Math.round(ratio * 1000) / 1000, pass: ratio >= 1, detail };
}

function detectCycles(edges, n) {
  const adj = new Map();
  for (const [a, b] of edges) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }
  const color = new Map(); /* 0 = visiting, 1 = done */
  let cycles = 0;
  const stack = [];
  const visit = (u) => {
    color.set(u, 0);
    stack.push(u);
    for (const v of (adj.get(u) || [])) {
      if (color.get(v) === 0) cycles++;
      else if (!color.has(v)) visit(v);
    }
    stack.pop();
    color.set(u, 1);
  };
  for (const u of adj.keys()) if (!color.has(u)) visit(u);
  return cycles;
}

function runValidate(db) {
  const issues = [];

  /* 1. schema completeness */
  const tables = db.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'kg_%' ORDER BY name").map((r) => r.name);
  const expected = ["kg_knowledge_packs", "kg_concepts", "kg_micro_concepts", "kg_learning_objectives",
    "kg_concept_relations", "kg_prerequisites", "kg_difficulty_profiles", "kg_exam_mappings",
    "kg_question_blueprints", "kg_distractor_pools", "kg_distractor_items", "kg_reference_sources",
    "kg_syllabus_units", "kg_learning_paths", "kg_learning_path_steps", "kg_concept_statistics",
    "kg_subject_statistics", "kg_concept_history", "kg_validation_reports"];
  const missing = expected.filter((t) => !tables.includes(t));
  issues.push(check(issue(missing, "missing tables"), "kg-schema-tables", missing.length ? 0 : 1,
    missing.length ? "missing: " + missing.join(", ") : tables.length + " kg_* tables present"));

  function issue(list, kind) { return list.length ? `${kind}: ${list.slice(0, 5).join(", ")}${list.length > 5 ? " …" : ""}` : ""; }

  /* 2. orphan concept anchors */
  const orphans = db.all(
    `SELECT c.slug FROM kg_concepts c
     LEFT JOIN chapters ch ON ch.id = c.chapter_id
     LEFT JOIN topics t ON t.id = c.topic_id
     WHERE c.subject_id NOT IN (SELECT id FROM subjects)
        OR (c.chapter_id IS NOT NULL AND ch.id IS NULL)
        OR (c.topic_id IS NOT NULL AND t.id IS NULL)`
  ).map((r) => r.slug);
  issues.push(check(issue(orphans, "orphan concept anchors"), "concept-anchors", orphans.length ? 0 : 1,
    orphans.length ? `orphan anchors: ${orphans.length}` : "all anchors valid"));

  /* 3. definition coverage */
  const defCov = db.get(`SELECT COUNT(*) n, SUM(CASE WHEN length(trim(definition)) > 0 THEN 1 ELSE 0 END) d FROM kg_concepts`);
  const defRatio = defCov.n ? defCov.d / defCov.n : 1;
  issues.push(check("", "concept-definition-coverage", defRatio,
    `${defCov.d}/${defCov.n} concepts have a mined definition`));

  /* 4. micro coverage */
  const mc = db.get(
    `SELECT COUNT(DISTINCT concept_id) n FROM kg_micro_concepts
     JOIN kg_concepts c ON c.id = concept_id`
  );
  const totalConcepts = db.get("SELECT COUNT(*) n FROM kg_concepts").n;
  issues.push(check("", "micro-concept-coverage", totalConcepts ? mc.n / totalConcepts : 1,
    `${mc.n}/${totalConcepts} concepts have micro-concepts`));

  /* 5. LO coverage of micros */
  const lo = db.get(
    `SELECT COUNT(DISTINCT micro_concept_id) n FROM kg_learning_objectives WHERE micro_concept_id IS NOT NULL`
  );
  const totalMicros = db.get("SELECT COUNT(*) n FROM kg_micro_concepts").n;
  issues.push(check("", "lo-coverage", totalMicros ? lo.n / totalMicros : 1,
    `${lo.n}/${totalMicros} micro-concepts have learning objectives`));

  /* 6. empty packs */
  const emptyPacks = db.all("SELECT subject_id FROM kg_knowledge_packs WHERE length(trim(overview)) = 0").map((r) => r.subject_id);
  const totalPacks = db.get("SELECT COUNT(*) n FROM kg_knowledge_packs").n;
  issues.push(check(issue(emptyPacks, "empty packs"), "packs-complete", totalPacks ? 1 - emptyPacks.length / totalPacks : 1,
    `${totalPacks - emptyPacks.length}/${totalPacks} packs have authored overviews`));

  /* 7. dangling references */
  const dangling = db.get(
    `SELECT COUNT(*) n FROM kg_reference_sources r
     LEFT JOIN kg_concepts c ON c.id = r.concept_id
     WHERE r.subject_id NOT IN (SELECT id FROM subjects)
        OR (r.concept_id IS NOT NULL AND c.id IS NULL)`
  ).n;
  issues.push(check("", "references-valid", dangling ? 0 : 1, dangling ? `${dangling} dangling references` : "all references valid"));

  /* 8. blueprint coverage */
  const bp = db.get("SELECT COUNT(DISTINCT concept_id) n FROM kg_question_blueprints").n;
  issues.push(check("", "blueprint-coverage", totalConcepts ? bp / totalConcepts : 1,
    `${bp}/${totalConcepts} concepts have a blueprint`));

  /* 9. exam mapping integrity */
  const badMap = db.get(
    `SELECT COUNT(*) n FROM kg_exam_mappings m
     LEFT JOIN subjects s ON s.id = m.subject_id
     LEFT JOIN kg_concepts c ON c.id = m.concept_id
     WHERE (m.subject_id IS NOT NULL AND s.id IS NULL)
        OR (m.concept_id IS NOT NULL AND c.id IS NULL)`
  ).n;
  issues.push(check("", "exam-map-integrity", badMap ? 0 : 1, badMap ? `${badMap} broken exam mappings` : "exam mappings intact"));

  /* 10. prerequisite cycles */
  const edges = db.all("SELECT concept_id, requires_id FROM kg_prerequisites").map((r) => [r.concept_id, r.requires_id]);
  const cycles = detectCycles(edges, totalConcepts);
  issues.push(check("", "prerequisite-acyclic", cycles ? 0 : 1, cycles ? `${cycles} cycles` : "prerequisites acyclic"));

  /* 11. duplicate slugs (should be zero by unique constraint) */
  const dups = db.get(`SELECT COUNT(*) - COUNT(DISTINCT subject_id || '|' || slug) n FROM kg_concepts`).n;
  issues.push(check("", "unique-slugs", dups ? 0 : 1, dups ? `${dups} duplicate slugs` : "slugs unique"));

  /* 12. statistics rollup completeness */
  const statCov = db.get(`SELECT COUNT(*) n FROM kg_concepts c LEFT JOIN kg_concept_statistics s ON s.concept_id = c.id WHERE s.id IS NULL`).n;
  issues.push(check("", "stats-complete", totalConcepts ? 1 - statCov / totalConcepts : 1,
    `${totalConcepts - statCov}/${totalConcepts} concepts have statistics`));

  /* 13. subjects with MCQs but zero concepts */
  const uncovered = db.all(
    `SELECT s.id FROM subjects s
     WHERE s.status = 'active' AND EXISTS (SELECT 1 FROM mcqs m WHERE m.subject_id = s.id AND m.status = 'active')
       AND NOT EXISTS (SELECT 1 FROM kg_concepts c WHERE c.subject_id = s.id)`
  ).map((r) => r.id);
  const activeSubjects = db.get(`SELECT COUNT(DISTINCT subject_id) n FROM mcqs WHERE status = 'active'`).n;
  issues.push(check(issue(uncovered, "subjects without concepts"), "subject-coverage",
    activeSubjects ? 1 - uncovered.length / activeSubjects : 1,
    `${activeSubjects - uncovered.length}/${activeSubjects} active subjects mined`));

  /* 14. history trail */
  const hist = db.get("SELECT COUNT(*) n FROM kg_concept_history").n;
  issues.push(check("", "history-trail", hist > 0 ? 1 : 0, hist ? `${hist} history rows` : "no history recorded"));

  const weight = { "kg-schema-tables": 3, "concept-anchors": 3, "prerequisite-acyclic": 2,
    "exam-map-integrity": 2, "references-valid": 2, "unique-slugs": 2, "stats-complete": 2,
    "packs-complete": 1, "subject-coverage": 1, "history-trail": 1, "micro-concept-coverage": 1,
    "lo-coverage": 1, "concept-definition-coverage": 1, "blueprint-coverage": 1 };
  let score = 0, wsum = 0;
  for (const i of issues) { score += i.ratio * (weight[i.name] || 1); wsum += weight[i.name] || 1; }
  score = Math.round((score / wsum) * 1000) / 10;

  db.run(
    `INSERT INTO kg_validation_reports (run_at, scope, score, issues_json, summary)
     VALUES (datetime('now'), 'all', ?, ?, ?)`,
    [score, JSON.stringify(Object.fromEntries(issues.map((i) => [i.name, { pass: i.pass, ratio: i.ratio, detail: i.detail }]))),
     `score ${score}% — ${issues.filter((i) => i.pass).length}/${issues.length} checks passed`]
  );

  return { score, issues, reportId: db.get("SELECT MAX(id) id FROM kg_validation_reports").id };
}

module.exports = { runValidate, detectCycles };
