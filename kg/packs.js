/* ============================================================
   Phase 14 — Knowledge Graph engine: knowledge pack composer
   One kg_knowledge_packs row per subject. Authored sections
   (packs-data.js) are merged with mined sections from the
   extraction step (kg_concepts / kg_micro_concepts /
   kg_learning_objectives / kg_concept_relations /
   kg_difficulty_profiles). Also seeds:
     - kg_reference_sources   (metadata only)
     - kg_prerequisites       (authored concept pairs)
     - kg_learning_paths      (+ steps, authored sequences)
     - kg_syllabus_units      (real chapters as units)
   Idempotent: every write is UPSERT or INSERT OR IGNORE.
   ============================================================ */
"use strict";
const U = require("./util.js");
const { PACKS, EXAMS } = require("./packs-data.js");

const j = (v) => JSON.stringify(v || []);

/* ---------- mined sections for one subject ---------- */
function minedSections(db, subjectId) {
  const concepts = db.all(
    `SELECT id, name, slug, definition, domain, difficulty, exam_frequency, revision_priority
     FROM kg_concepts WHERE subject_id = ? ORDER BY exam_frequency DESC, id`, [subjectId]
  );
  const ids = concepts.map((c) => c.id);
  if (!ids.length) return { concepts: [], glossary: [], terminology: [], definitions: [], facts: [], rels: [], diff: { easy_pct: 0, medium_pct: 0, hard_pct: 0, avg_time_sec: 0 } };

  const inIds = ids.map(() => "?").join(",");
  const micros = db.all(`SELECT concept_id, name, detail FROM kg_micro_concepts WHERE subject_id = ? ORDER BY id`, [subjectId]);
  const los = db.all(`SELECT concept_id, statement FROM kg_learning_objectives WHERE subject_id = ? ORDER BY id`, [subjectId]);
  const rels = db.all(
    `SELECT cr.from_concept, cr.to_concept, cr.relation_type, cr.weight
     FROM kg_concept_relations cr WHERE cr.from_concept IN (${inIds})
     ORDER BY cr.weight DESC, cr.id LIMIT 10`, ids
  );
  const diffs = db.all(`SELECT easy_pct, medium_pct, hard_pct, avg_time_sec FROM kg_difficulty_profiles WHERE concept_id IN (${inIds})`, ids);

  const nameOf = new Map(concepts.map((c) => [c.id, c.name]));
  const glossary = concepts.filter((c) => c.definition).slice(0, 12)
    .map((c) => ({ term: c.name, definition: c.definition }));
  const terminology = micros.slice(0, 12).map((m) => ({ term: m.name, detail: m.detail }));
  const definitions = concepts.filter((c) => c.definition).slice(0, 8).map((c) => c.definition);
  const facts = los.slice(0, 8).map((l) => l.statement);
  const relationships = rels
    .filter((r) => nameOf.has(r.from_concept) && nameOf.has(r.to_concept))
    .map((r) => ({ from: nameOf.get(r.from_concept), to: nameOf.get(r.to_concept), type: r.relation_type, weight: r.weight }));

  const diff = { easy_pct: 0, medium_pct: 0, hard_pct: 0, avg_time_sec: 0 };
  if (diffs.length) {
    diff.easy_pct = Math.round(diffs.reduce((a, d) => a + d.easy_pct, 0) / diffs.length);
    diff.medium_pct = Math.round(diffs.reduce((a, d) => a + d.medium_pct, 0) / diffs.length);
    diff.hard_pct = Math.round(diffs.reduce((a, d) => a + d.hard_pct, 0) / diffs.length);
    diff.avg_time_sec = Math.round(diffs.reduce((a, d) => a + d.avg_time_sec, 0) / diffs.length);
  }

  return {
    concepts,
    glossary, terminology, definitions, facts, relationships, diff,
    conceptMap: Object.fromEntries(concepts.slice(0, 60).map((c) => [c.slug, {
      domain: c.domain, difficulty: c.difficulty, exam_frequency: c.exam_frequency,
      revision_priority: c.revision_priority
    }])),
    frequentlyTested: concepts.slice(0, 10).map((c) => ({
      concept: c.name, exam_frequency: c.exam_frequency, revision_priority: c.revision_priority
    }))
  };
}

/* ---------- resolve an authored prerequisite concept (possibly in another subject) ---------- */
function resolveConcept(db, subjectId, name) {
  const slug = U.slugify(name);
  let row = db.get("SELECT id FROM kg_concepts WHERE subject_id = ? AND slug = ?", [subjectId, slug]);
  if (row) return row.id;
  row = db.get("SELECT id FROM kg_concepts WHERE subject_id = ? AND name = ? COLLATE NOCASE", [subjectId, name]);
  if (row) return row.id;
  const n = U.norm(name);
  const cands = db.all("SELECT id, name FROM kg_concepts WHERE subject_id = ?", [subjectId]);
  for (const c of cands) {
    if (U.norm(c.name) === n) return c.id;
    if (U.norm(c.name).includes(n) || n.includes(U.norm(c.name))) return c.id;
  }
  return null;
}

/* ---------- one authored pack: compose + persist ---------- */
function composePack(db, subjectId) {
  const authored = PACKS[subjectId] || EXAMS[subjectId];
  if (!authored) return null;
  const m = minedSections(db, subjectId);

  const overview = authored.overview || "";
  const formulas = authored.formulas || [];
  const classifications = authored.classifications || [];
  const processes = authored.processes || [];
  const misconceptions = authored.misconceptions || [];
  const examTips = authored.exam_tips || [];
  const rules = authored.rules || [];
  const conceptCount = m.concepts.length;

  db.run(
    `INSERT INTO kg_knowledge_packs
       (subject_id, version, overview, core_domains, sub_domains, concept_map, glossary, terminology,
        definitions, important_facts, rules, formulas, processes, classifications, relationships,
        misconceptions, memory_techniques, exam_tips, frequently_tested, difficulty_distribution,
        concept_count, source, updated_at)
     VALUES (?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'kg-pack-engine', datetime('now'))
     ON CONFLICT(subject_id, version) DO UPDATE SET
       overview=excluded.overview, core_domains=excluded.core_domains, sub_domains=excluded.sub_domains,
       concept_map=excluded.concept_map, glossary=excluded.glossary, terminology=excluded.terminology,
       definitions=excluded.definitions, important_facts=excluded.important_facts, rules=excluded.rules,
       formulas=excluded.formulas, processes=excluded.processes, classifications=excluded.classifications,
       relationships=excluded.relationships, misconceptions=excluded.misconceptions,
       memory_techniques=excluded.memory_techniques, exam_tips=excluded.exam_tips,
       frequently_tested=excluded.frequently_tested, difficulty_distribution=excluded.difficulty_distribution,
       concept_count=excluded.concept_count, updated_at=datetime('now')`,
    [subjectId, overview, j(authored.core_domains), j(authored.sub_domains), JSON.stringify(m.conceptMap),
     j(m.glossary), j(m.terminology), j(m.definitions), j(m.facts), j(rules), j(formulas), j(processes),
     j(classifications), j(m.relationships), j(misconceptions), j(authored.memory_techniques || []),
     j(examTips), j(m.frequentlyTested), JSON.stringify(m.diff), conceptCount]
  );

  /* references (metadata only) */
  for (const ref of authored.references || []) {
    if (!ref.title) continue;
    db.run(
      `INSERT OR IGNORE INTO kg_reference_sources (subject_id, ref_type, title, edition, year, publisher, official_syllabus)
       VALUES (?,?,?,?,?,?,?)`,
      [subjectId, ref.type || "book", ref.title, ref.edition || "", ref.year || null,
       ref.publisher || "", ref.official_syllabus || ""]
    );
  }

  /* prerequisites: resolved concept pairs -> kg_prerequisites */
  const top = db.get(
    `SELECT id FROM kg_concepts WHERE subject_id = ? ORDER BY exam_frequency DESC, id LIMIT 1`, [subjectId]
  );
  for (const [fromSubject, conceptName] of (authored.prerequisites || [])) {
    const extId = resolveConcept(db, fromSubject, conceptName);
    if (!extId) continue;
    const packIds = db.all("SELECT id, name FROM kg_concepts WHERE subject_id = ?", [subjectId]);
    let edges = 0;
    for (const c of packIds) {
      if (U.norm(c.name).includes(U.norm(conceptName)) || U.norm(conceptName).includes(U.norm(c.name))) {
        db.run("INSERT OR IGNORE INTO kg_prerequisites (concept_id, requires_id, strength) VALUES (?,?,0.8)", [c.id, extId]);
        edges++;
      }
    }
    if (!edges && top) db.run("INSERT OR IGNORE INTO kg_prerequisites (concept_id, requires_id, strength) VALUES (?,?,0.6)", [top.id, extId]);
  }

  /* learning paths */
  for (const p of (authored.paths || [])) {
    const pr = db.run(
      `INSERT OR IGNORE INTO kg_learning_paths (subject_id, exam_id, name, slug, description)
       VALUES (?,?,?,?,?)`,
      [subjectId, p.target_exam || "", p.name, U.slugify(subjectId + "-" + p.name), p.description || ""]
    );
    const pathId = pr.lastInsertRowid ||
      db.get("SELECT id FROM kg_learning_paths WHERE subject_id = ? AND slug = ?", [subjectId, U.slugify(subjectId + "-" + p.name)]).id;
    let order = 0;
    for (const step of (p.steps || [])) {
      const cid = resolveConcept(db, subjectId, step);
      if (!cid) continue;
      db.run("INSERT OR IGNORE INTO kg_learning_path_steps (path_id, concept_id, step_order) VALUES (?,?,?)", [pathId, cid, order++]);
    }
  }

  return { subject: subjectId, overview: !!overview, concepts: conceptCount };
}

/* ---------- syllabus units from real chapters ---------- */
function seedSyllabusUnits(db) {
  const chapters = db.all(
    `SELECT ch.id, ch.subject_id, ch.name, ch.sort_order FROM chapters ch ORDER BY ch.subject_id, ch.sort_order`
  );
  let n = 0;
  for (const ch of chapters) {
    const r = db.run(
      `INSERT OR IGNORE INTO kg_syllabus_units (subject_id, exam_id, unit_name, slug, description, weight, sort_order)
       VALUES (?,?,?,?,?,?,?)`,
      [ch.subject_id, "", ch.name, U.slugify(ch.name), "", 1.0, ch.sort_order || 0]
    );
    n += r.changes;
  }
  return n;
}

/* ---------- seed every authored pack ---------- */
function seedPacks(db, log) {
  const keys = [...new Set([...Object.keys(PACKS), ...Object.keys(EXAMS)])];
  const ids = new Set(db.all("SELECT id FROM subjects").map((r) => r.id));
  let done = 0, skipped = 0, units = 0;
  db.transaction(() => {
    for (const k of keys) {
      if (!ids.has(k)) { skipped++; continue; }
      const out = composePack(db, k);
      if (out) done++;
      if (log && (done % 20 === 0)) log(`[packs] ${done}/${keys.length}`);
    }
    units = seedSyllabusUnits(db);
  });
  return { packs: done, skipped, syllabusUnits: units };
}

module.exports = { composePack, seedPacks, minedSections, resolveConcept, seedSyllabusUnits };
