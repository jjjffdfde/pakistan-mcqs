#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Knowledge Graph schema (Phase 14, Step 1)

   Idempotent DDL for the Enterprise Knowledge Graph. Every object
   is namespaced `kg_` so it never collides with the taxonomy
   (categories/subjects/chapters/topics/subtopics), the inert legacy
   `concepts`/`mcq_concepts` tag tables, or the live `mcqs.learning_objective`
   path. Invoked from db/engine.js migrate() on every open().

   Design rules (from the Knowledge Architecture Report):
     - Do NOT duplicate existing data. The FK spine points at the
       existing taxonomy tables; subjects/chapters/topics are reused.
     - Additive + reversible: pure `CREATE TABLE IF NOT EXISTS` /
       `CREATE INDEX IF NOT EXISTS`. Dropping every `kg_*` object fully
       reverts the phase.
     - Portable: types chosen to translate cleanly to Postgres/MySQL
       (mirrored in db/schema.{pgsql,mysql}.sql). No SQLite-only syntax
       beyond `INTEGER PRIMARY KEY AUTOINCREMENT` (mapped per engine in
       the mirror files).

   NOTE: this creates STRUCTURE only. No MCQs are generated here and no
   rows are written — population happens in later steps.
   ============================================================ */
"use strict";

/* All DDL statements, in dependency order. Run under the caller's engine.
   `raw` is a node:sqlite DatabaseSync (exec available). */
const KG_DDL = [
    /* ---------- 1. Knowledge Packs (one independent pack per subject) ----------
       Sections are stored as JSON so a pack is a single self-contained row:
       overview, core_domains, sub_domains, concept_map, glossary, terminology,
       definitions, important_facts, rules, formulas, processes, classifications,
       relationships, misconceptions, memory_techniques, exam_tips,
       frequently_tested, difficulty_distribution. */
    `CREATE TABLE IF NOT EXISTS kg_knowledge_packs (
       id                 INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id         TEXT NOT NULL REFERENCES subjects(id),
       version            INTEGER DEFAULT 1,
       overview           TEXT DEFAULT '',
       core_domains       TEXT DEFAULT '[]',
       sub_domains        TEXT DEFAULT '[]',
       concept_map        TEXT DEFAULT '{}',
       glossary           TEXT DEFAULT '[]',
       terminology        TEXT DEFAULT '[]',
       definitions        TEXT DEFAULT '[]',
       important_facts    TEXT DEFAULT '[]',
       rules              TEXT DEFAULT '[]',
       formulas           TEXT DEFAULT '[]',
       processes          TEXT DEFAULT '[]',
       classifications    TEXT DEFAULT '[]',
       relationships      TEXT DEFAULT '[]',
       misconceptions     TEXT DEFAULT '[]',
       memory_techniques  TEXT DEFAULT '[]',
       exam_tips          TEXT DEFAULT '[]',
       frequently_tested  TEXT DEFAULT '[]',
       difficulty_distribution TEXT DEFAULT '{}',
       concept_count      INTEGER DEFAULT 0,
       source             TEXT DEFAULT 'kg-pack-engine',
       created_at         TEXT DEFAULT (datetime('now')),
       updated_at         TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, version)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_packs_subject ON kg_knowledge_packs(subject_id)`,

    /* ---------- 2. Concepts (the rich graph node — distinct from legacy `concepts`) ----------
       Hierarchy anchors: subject → chapter → topic → subtopic (all reused). */
    `CREATE TABLE IF NOT EXISTS kg_concepts (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       chapter_id    TEXT REFERENCES chapters(id),
       topic_id      TEXT REFERENCES topics(id),
       subtopic_id   INTEGER REFERENCES subtopics(id),
       name          TEXT NOT NULL,
       slug          TEXT NOT NULL,
       definition    TEXT DEFAULT '',
       summary       TEXT DEFAULT '',
       domain        TEXT DEFAULT '',
       difficulty    TEXT DEFAULT 'medium',
       bloom         TEXT DEFAULT 'Understand',
       exam_frequency INTEGER DEFAULT 0,
       revision_priority INTEGER DEFAULT 3,
       tags          TEXT DEFAULT '[]',
       source        TEXT DEFAULT 'kg-concept-engine',
       status        TEXT DEFAULT 'active',
       created_at    TEXT DEFAULT (datetime('now')),
       updated_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, slug)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_concepts_subject ON kg_concepts(subject_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_concepts_topic ON kg_concepts(topic_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_concepts_domain ON kg_concepts(subject_id, domain)`,

    /* ---------- 3. Micro-concepts (each concept → many) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_micro_concepts (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       name          TEXT NOT NULL,
       slug          TEXT NOT NULL,
       detail        TEXT DEFAULT '',
       difficulty    TEXT DEFAULT 'medium',
       sort_order    INTEGER DEFAULT 0,
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id, slug)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_micro_concept ON kg_micro_concepts(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_micro_subject ON kg_micro_concepts(subject_id)`,

    /* ---------- 4. Learning objectives (each micro-concept → many; structured) ----------
       Distinct from the free-text mcqs.learning_objective column. */
    `CREATE TABLE IF NOT EXISTS kg_learning_objectives (
       id               INTEGER PRIMARY KEY AUTOINCREMENT,
       micro_concept_id INTEGER REFERENCES kg_micro_concepts(id),
       concept_id       INTEGER NOT NULL REFERENCES kg_concepts(id),
       subject_id       TEXT NOT NULL REFERENCES subjects(id),
       statement        TEXT NOT NULL,
       slug             TEXT NOT NULL,
       bloom            TEXT DEFAULT 'Understand',
       difficulty       TEXT DEFAULT 'medium',
       question_patterns TEXT DEFAULT '[]',
       sort_order       INTEGER DEFAULT 0,
       created_at       TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id, slug)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_lo_concept ON kg_learning_objectives(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_lo_micro ON kg_learning_objectives(micro_concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_lo_subject ON kg_learning_objectives(subject_id)`,

    /* ---------- 5. Concept relations (Parent/Child/Related/DependsOn/...) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_concept_relations (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       from_concept  INTEGER NOT NULL REFERENCES kg_concepts(id),
       to_concept    INTEGER NOT NULL REFERENCES kg_concepts(id),
       relation_type TEXT NOT NULL,   -- parent | child | related | depends_on
       weight        REAL DEFAULT 1.0,
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (from_concept, to_concept, relation_type)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_rel_from ON kg_concept_relations(from_concept)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_rel_to ON kg_concept_relations(to_concept)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_rel_type ON kg_concept_relations(relation_type)`,

    /* ---------- 6. Prerequisites (directed acyclic; validated in Step 9) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_prerequisites (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       requires_id   INTEGER NOT NULL REFERENCES kg_concepts(id),
       strength      REAL DEFAULT 1.0,
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id, requires_id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_prereq_concept ON kg_prerequisites(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_prereq_requires ON kg_prerequisites(requires_id)`,

    /* ---------- 7. Difficulty profiles (per concept) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_difficulty_profiles (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       easy_pct      REAL DEFAULT 0,
       medium_pct    REAL DEFAULT 0,
       hard_pct      REAL DEFAULT 0,
       avg_time_sec  INTEGER DEFAULT 40,
       cognitive_load TEXT DEFAULT 'medium',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_diff_concept ON kg_difficulty_profiles(concept_id)`,

    /* ---------- 8. Exam mappings (LO/concept ↔ exam, weighted) ----------
       Replaces the CSV-in-a-column model with a real many-to-many. */
    `CREATE TABLE IF NOT EXISTS kg_exam_mappings (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       exam_id       TEXT NOT NULL,
       subject_id    TEXT REFERENCES subjects(id),
       concept_id    INTEGER REFERENCES kg_concepts(id),
       objective_id  INTEGER REFERENCES kg_learning_objectives(id),
       weight        REAL DEFAULT 1.0,
       frequency     INTEGER DEFAULT 0,
       created_at    TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_exam_exam ON kg_exam_mappings(exam_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_exam_subject ON kg_exam_mappings(subject_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_exam_concept ON kg_exam_mappings(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_exam_objective ON kg_exam_mappings(objective_id)`,

    /* ---------- 9. Question blueprints (per LO; structure only, NOT MCQs) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_question_blueprints (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       objective_id  INTEGER REFERENCES kg_learning_objectives(id),
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       blueprint_type TEXT NOT NULL,   -- definition | application | scenario | calculation | ...
       stem_pattern  TEXT DEFAULT '',
       answer_shape  TEXT DEFAULT '',
       distractor_strategy TEXT DEFAULT '',
       difficulty    TEXT DEFAULT 'medium',
       bloom         TEXT DEFAULT 'Understand',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id, blueprint_type, objective_id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_bp_concept ON kg_question_blueprints(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_bp_objective ON kg_question_blueprints(objective_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_bp_subject ON kg_question_blueprints(subject_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_bp_type ON kg_question_blueprints(blueprint_type)`,

    /* ---------- 10. Semantic distractor pools (subject-scoped, category-coherent) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_distractor_pools (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       concept_id    INTEGER REFERENCES kg_concepts(id),
       category      TEXT NOT NULL,   -- the semantic class; only same-category items mix
       description   TEXT DEFAULT '',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, category)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_pool_subject ON kg_distractor_pools(subject_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_pool_concept ON kg_distractor_pools(concept_id)`,
    `CREATE TABLE IF NOT EXISTS kg_distractor_items (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       pool_id       INTEGER NOT NULL REFERENCES kg_distractor_pools(id),
       value         TEXT NOT NULL,
       note          TEXT DEFAULT '',
       UNIQUE (pool_id, value)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_ditem_pool ON kg_distractor_items(pool_id)`,

    /* ---------- 11. Reference sources (metadata only — no copyrighted content) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_reference_sources (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER REFERENCES kg_concepts(id),
       subject_id    TEXT REFERENCES subjects(id),
       ref_type      TEXT DEFAULT 'book',   -- book | board | syllabus | exam | site
       title         TEXT NOT NULL,
       edition       TEXT DEFAULT '',
       year          INTEGER,
       publisher     TEXT DEFAULT '',
       official_syllabus TEXT DEFAULT '',
       public_curriculum TEXT DEFAULT '',
       exam_mapping  TEXT DEFAULT '',
       objective_id  INTEGER REFERENCES kg_learning_objectives(id),
       created_at    TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_ref_concept ON kg_reference_sources(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_ref_subject ON kg_reference_sources(subject_id)`,

    /* ---------- 12. Syllabus units ---------- */
    `CREATE TABLE IF NOT EXISTS kg_syllabus_units (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       exam_id       TEXT DEFAULT '',
       unit_name     TEXT NOT NULL,
       slug          TEXT NOT NULL,
       description   TEXT DEFAULT '',
       weight        REAL DEFAULT 1.0,
       sort_order    INTEGER DEFAULT 0,
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, exam_id, slug)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_syllabus_subject ON kg_syllabus_units(subject_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_syllabus_exam ON kg_syllabus_units(exam_id)`,

    /* ---------- 13. Learning paths (ordered concept sequences) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_learning_paths (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       exam_id       TEXT DEFAULT '',
       name          TEXT NOT NULL,
       slug          TEXT NOT NULL,
       description   TEXT DEFAULT '',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, slug)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_path_subject ON kg_learning_paths(subject_id)`,
    `CREATE TABLE IF NOT EXISTS kg_learning_path_steps (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       path_id       INTEGER NOT NULL REFERENCES kg_learning_paths(id),
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       step_order    INTEGER DEFAULT 0,
       UNIQUE (path_id, concept_id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_pathstep_path ON kg_learning_path_steps(path_id)`,

    /* ---------- 14. Concept statistics (denormalised rollup for dashboards) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_concept_statistics (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       micro_count   INTEGER DEFAULT 0,
       objective_count INTEGER DEFAULT 0,
       blueprint_count INTEGER DEFAULT 0,
       mcq_count     INTEGER DEFAULT 0,
       relation_count INTEGER DEFAULT 0,
       depth_score   REAL DEFAULT 0,
       updated_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id)
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_stat_concept ON kg_concept_statistics(concept_id)`,

    /* ---------- 15. Subject-level knowledge coverage rollup (dashboards) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_subject_statistics (
       subject_id       TEXT PRIMARY KEY REFERENCES subjects(id),
       pack_version     INTEGER DEFAULT 0,
       concept_count    INTEGER DEFAULT 0,
       micro_count      INTEGER DEFAULT 0,
       objective_count  INTEGER DEFAULT 0,
       blueprint_count  INTEGER DEFAULT 0,
       relation_count   INTEGER DEFAULT 0,
       exam_map_count   INTEGER DEFAULT 0,
       reference_count  INTEGER DEFAULT 0,
       distractor_pool_count INTEGER DEFAULT 0,
       depth_score      REAL DEFAULT 0,
       coverage_status  TEXT DEFAULT 'pending',
       updated_at       TEXT DEFAULT (datetime('now'))
     )`,

    /* ---------- 16. Concept history (audit / incremental updates) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_concept_history (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER REFERENCES kg_concepts(id),
       subject_id    TEXT REFERENCES subjects(id),
       action        TEXT NOT NULL,   -- created | updated | merged | deleted | validated
       detail        TEXT DEFAULT '',
       actor         TEXT DEFAULT 'kg-engine',
       created_at    TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE INDEX IF NOT EXISTS ix_kg_hist_concept ON kg_concept_history(concept_id)`,
    `CREATE INDEX IF NOT EXISTS ix_kg_hist_subject ON kg_concept_history(subject_id)`,

    /* ---------- 17. Validation reports (Step 9 output) ---------- */
    `CREATE TABLE IF NOT EXISTS kg_validation_reports (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       run_at        TEXT DEFAULT (datetime('now')),
       scope         TEXT DEFAULT 'all',
       score         REAL DEFAULT 0,
       issues_json   TEXT DEFAULT '{}',
       summary       TEXT DEFAULT ''
     )`
  ];

function migrateKnowledgeGraph(raw) {
  for (const stmt of KG_DDL) raw.exec(stmt);
}

/* List of every kg_* object, so a teardown/verify step can enumerate them. */
const KG_TABLES = [
  "kg_knowledge_packs", "kg_concepts", "kg_micro_concepts", "kg_learning_objectives",
  "kg_concept_relations", "kg_prerequisites", "kg_difficulty_profiles", "kg_exam_mappings",
  "kg_question_blueprints", "kg_distractor_pools", "kg_distractor_items", "kg_reference_sources",
  "kg_syllabus_units", "kg_learning_paths", "kg_learning_path_steps", "kg_concept_statistics",
  "kg_subject_statistics", "kg_concept_history", "kg_validation_reports"
];

module.exports = { migrateKnowledgeGraph, KG_DDL, KG_TABLES };
