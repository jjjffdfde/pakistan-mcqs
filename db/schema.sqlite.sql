-- ============================================================
-- Pakistan MCQs Hub — SQLite schema (Enterprise 2026)
-- Engine: SQLite 3 (via node:sqlite, Node 22.5+)
-- Run automatically by db/migrate.js. Idempotent.
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

-- ---------- Taxonomy ----------
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,          -- slug id, e.g. 'computer-it'
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subjects (
  id          TEXT PRIMARY KEY,          -- e.g. 'python'
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id),
  icon        TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'active',     -- active | draft | archived
  exam_ids    TEXT DEFAULT '',           -- comma-separated exam slugs
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chapters (
  id          TEXT PRIMARY KEY,          -- e.g. 'py-basics'
  subject_id  TEXT NOT NULL REFERENCES subjects(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, slug)
);

CREATE TABLE IF NOT EXISTS topics (
  id          TEXT PRIMARY KEY,          -- e.g. 't-7' or slug
  chapter_id  TEXT NOT NULL REFERENCES chapters(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  UNIQUE (chapter_id, slug)
);

CREATE TABLE IF NOT EXISTS subtopics (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id  TEXT NOT NULL REFERENCES topics(id),
  name      TEXT NOT NULL,
  UNIQUE (topic_id, name)
);

-- ---------- Content ----------
CREATE TABLE IF NOT EXISTS mcqs (
  id              TEXT PRIMARY KEY,      -- 'pak-001', 'py-000123'...
  question        TEXT NOT NULL,
  correct_answer  TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  difficulty      TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  subject_id      TEXT NOT NULL REFERENCES subjects(id),
  chapter_id      TEXT REFERENCES chapters(id),
  topic_id        TEXT REFERENCES topics(id),
  subtopic_id     INTEGER REFERENCES subtopics(id),
  exam_ids        TEXT DEFAULT '',       -- comma-separated exam slugs
  year            INTEGER,
  tags            TEXT DEFAULT '[]',     -- JSON array
  references_json TEXT DEFAULT '[]',  -- JSON array [{title,url}]
  explanation     TEXT NOT NULL,
  source          TEXT DEFAULT 'existing', -- existing | generated-<pipeline>
  status          TEXT DEFAULT 'active',
  qhash           TEXT NOT NULL UNIQUE,  -- sha256 of normalized question (dedupe)
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_mcqs_subject ON mcqs(subject_id);
CREATE INDEX IF NOT EXISTS ix_mcqs_chapter ON mcqs(chapter_id);
CREATE INDEX IF NOT EXISTS ix_mcqs_topic   ON mcqs(topic_id);
CREATE INDEX IF NOT EXISTS ix_mcqs_diff    ON mcqs(difficulty);
CREATE INDEX IF NOT EXISTS ix_mcqs_year    ON mcqs(year);

CREATE TABLE IF NOT EXISTS options (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  mcq_id   TEXT NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
  label    TEXT NOT NULL CHECK (label IN ('A','B','C','D')),
  text     TEXT NOT NULL,
  UNIQUE (mcq_id, label)
);
CREATE INDEX IF NOT EXISTS ix_options_mcq ON options(mcq_id);

CREATE TABLE IF NOT EXISTS references_tbl (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  mcq_id     TEXT REFERENCES mcqs(id),
  subject_id TEXT REFERENCES subjects(id),
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  kind       TEXT DEFAULT 'documentation'
);

-- ---------- Exams & papers ----------
CREATE TABLE IF NOT EXISTS quizzes (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT DEFAULT '',
  subject_ids     TEXT DEFAULT '',
  difficulty      TEXT DEFAULT 'easy',
  total_questions INTEGER DEFAULT 0,
  duration_mins   INTEGER DEFAULT 0,
  tags            TEXT DEFAULT '[]',
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mocktests (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  exam_id         TEXT DEFAULT '',
  subject_ids     TEXT DEFAULT '',
  difficulty      TEXT DEFAULT 'medium',
  total_questions INTEGER DEFAULT 0,
  duration_mins   INTEGER DEFAULT 0,
  negative_marking INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pastpapers (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  exam_id         TEXT DEFAULT '',
  year            INTEGER,
  pattern         INTEGER DEFAULT 0,
  subject_ids     TEXT DEFAULT '',
  total_questions INTEGER DEFAULT 0,
  duration_mins   INTEGER DEFAULT 0,
  file            TEXT DEFAULT '',
  question_ids    TEXT DEFAULT '[]',
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ---------- Users & activity (localhost) ----------
CREATE TABLE IF NOT EXISTS bookmarks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT NOT NULL,
  mcq_id     TEXT NOT NULL REFERENCES mcqs(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (device_id, mcq_id)
);
CREATE INDEX IF NOT EXISTS ix_bookmarks_device ON bookmarks(device_id);

CREATE TABLE IF NOT EXISTS history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT NOT NULL,
  mcq_id      TEXT NOT NULL REFERENCES mcqs(id),
  correct     INTEGER NOT NULL DEFAULT 0,
  points      INTEGER NOT NULL DEFAULT 0,
  mode        TEXT DEFAULT 'practice',
  answered_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_history_device ON history(device_id, answered_at);
CREATE INDEX IF NOT EXISTS ix_history_mcq    ON history(mcq_id);

CREATE TABLE IF NOT EXISTS leaderboard (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id      TEXT NOT NULL UNIQUE,
  name           TEXT DEFAULT '',
  points         INTEGER DEFAULT 0,
  week_key       TEXT DEFAULT '',
  month_key      TEXT DEFAULT '',
  correct        INTEGER DEFAULT 0,
  total          INTEGER DEFAULT 0,
  week_claimed   INTEGER DEFAULT 0,
  month_claimed  INTEGER DEFAULT 0,
  updated_at     TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_leaderboard_points ON leaderboard(points DESC);

CREATE TABLE IF NOT EXISTS analytics (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT DEFAULT '',
  event      TEXT NOT NULL,
  payload    TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_analytics_event ON analytics(event, created_at);

-- ---------- Pipeline state (generation checkpoint) ----------
CREATE TABLE IF NOT EXISTS pipeline_state (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ---------- Phase 12: AI learning engine ----------
CREATE TABLE IF NOT EXISTS user_profiles (
  device_id      TEXT PRIMARY KEY,
  name           TEXT DEFAULT 'Student',
  daily_hours    REAL DEFAULT 1,
  target_exam    TEXT DEFAULT '',
  target_date    TEXT DEFAULT '',
  skill_level    TEXT DEFAULT 'novice',
  readiness_score REAL DEFAULT 0,
  avg_accuracy   REAL DEFAULT 0,
  avg_speed_sec  REAL DEFAULT 0,
  consistency    REAL DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  city           TEXT DEFAULT '',
  province       TEXT DEFAULT '',
  last_active    TEXT DEFAULT '',
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learning_sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id    TEXT NOT NULL,
  session_type TEXT NOT NULL,
  mode         TEXT DEFAULT '',
  mcqs_answered INTEGER DEFAULT 0,
  correct      INTEGER DEFAULT 0,
  skipped      INTEGER DEFAULT 0,
  accuracy     REAL DEFAULT 0,
  duration_sec INTEGER DEFAULT 0,
  started_at   TEXT DEFAULT (datetime('now')),
  ended_at     TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_sessions_device ON learning_sessions(device_id, started_at);

CREATE TABLE IF NOT EXISTS weak_topics (
  device_id     TEXT NOT NULL,
  topic_id      TEXT NOT NULL,
  subject_id    TEXT DEFAULT '',
  weakness_score REAL DEFAULT 0,
  incorrect     INTEGER DEFAULT 0,
  total         INTEGER DEFAULT 0,
  skipped       INTEGER DEFAULT 0,
  slow_avg_sec  REAL DEFAULT 0,
  priority      INTEGER DEFAULT 1,
  updated_at    TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (device_id, topic_id)
);
CREATE INDEX IF NOT EXISTS ix_weak_priority ON weak_topics(device_id, priority);

CREATE TABLE IF NOT EXISTS strong_topics (
  device_id     TEXT NOT NULL,
  topic_id      TEXT NOT NULL,
  subject_id    TEXT DEFAULT '',
  strength_score REAL DEFAULT 0,
  correct       INTEGER DEFAULT 0,
  total         INTEGER DEFAULT 0,
  streak        INTEGER DEFAULT 0,
  updated_at    TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (device_id, topic_id)
);

CREATE TABLE IF NOT EXISTS study_plans (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT NOT NULL,
  plan_date  TEXT NOT NULL,
  plan_type  TEXT DEFAULT 'daily',
  items_json TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_plans_device ON study_plans(device_id, plan_date);

CREATE TABLE IF NOT EXISTS revision_schedule (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id     TEXT NOT NULL,
  mcq_id        TEXT NOT NULL,
  topic_id      TEXT DEFAULT '',
  box          INTEGER DEFAULT 1,
  ease          REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  due_date      TEXT DEFAULT (datetime('now')),
  last_review   TEXT DEFAULT '',
  next_review   TEXT DEFAULT '',
  reviews       INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'active',
  UNIQUE (device_id, mcq_id)
);
CREATE INDEX IF NOT EXISTS ix_revision_due ON revision_schedule(device_id, status, due_date);

CREATE TABLE IF NOT EXISTS flashcards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT NOT NULL,
  mcq_id      TEXT NOT NULL,
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  card_type   TEXT DEFAULT 'fact',
  box         INTEGER DEFAULT 1,
  ease        REAL DEFAULT 2.5,
  due_date    TEXT DEFAULT (datetime('now')),
  next_review TEXT DEFAULT '',
  reviews     INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  UNIQUE (device_id, mcq_id)
);
CREATE INDEX IF NOT EXISTS ix_flashcards_due ON flashcards(device_id, due_date);

CREATE TABLE IF NOT EXISTS recommendations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT NOT NULL,
  rec_type   TEXT NOT NULL,
  target_id  TEXT DEFAULT '',
  title      TEXT NOT NULL,
  reason     TEXT DEFAULT '',
  priority   INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  seen       INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_recommendations_device ON recommendations(device_id, seen, priority);

CREATE TABLE IF NOT EXISTS predictions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id     TEXT NOT NULL,
  exam_id       TEXT DEFAULT '',
  exam_title    TEXT DEFAULT '',
  prob_pass     REAL DEFAULT 0,
  expected_score REAL DEFAULT 0,
  readiness     REAL DEFAULT 0,
  strong_areas  TEXT DEFAULT '[]',
  weak_areas    TEXT DEFAULT '[]',
  created_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_predictions_device ON predictions(device_id, created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT NOT NULL,
  type       TEXT DEFAULT 'info',
  title      TEXT NOT NULL,
  body       TEXT DEFAULT '',
  link       TEXT DEFAULT '',
  read       INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_notifications_device ON notifications(device_id, read);

CREATE TABLE IF NOT EXISTS achievements (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT NOT NULL,
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  value      REAL DEFAULT 0,
  unlocked_at TEXT DEFAULT (datetime('now')),
  UNIQUE (device_id, code)
);
CREATE INDEX IF NOT EXISTS ix_achievements_device ON achievements(device_id);

CREATE TABLE IF NOT EXISTS current_affairs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  period        TEXT NOT NULL,
  period_date   TEXT NOT NULL,
  category      TEXT DEFAULT 'pakistan',
  title         TEXT NOT NULL,
  summary       TEXT DEFAULT '',
  source_subject TEXT DEFAULT '',
  created_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_ca_period ON current_affairs(period, period_date);

CREATE TABLE IF NOT EXISTS concepts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id   TEXT NOT NULL,
  name       TEXT NOT NULL,
  freq       INTEGER DEFAULT 0,
  UNIQUE (topic_id, name)
);
CREATE INDEX IF NOT EXISTS ix_concepts_topic ON concepts(topic_id);

CREATE TABLE IF NOT EXISTS mcq_concepts (
  mcq_id     TEXT NOT NULL,
  concept_id INTEGER NOT NULL,
  PRIMARY KEY (mcq_id, concept_id)
);
CREATE INDEX IF NOT EXISTS ix_mc_concept ON mcq_concepts(concept_id);

CREATE TABLE IF NOT EXISTS leaderboard_periods (
  device_id  TEXT NOT NULL,
  period     TEXT NOT NULL,
  period_key TEXT NOT NULL,
  points     INTEGER DEFAULT 0,
  correct    INTEGER DEFAULT 0,
  total      INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (device_id, period, period_key)
);
CREATE INDEX IF NOT EXISTS ix_lb_period ON leaderboard_periods(period, period_key, points DESC);

CREATE TABLE IF NOT EXISTS ai_state (
  key   TEXT PRIMARY KEY,
  value TEXT DEFAULT '',
  built_at TEXT DEFAULT (datetime('now'))
);

-- ---------- Full-text search (FTS5) ----------
CREATE VIRTUAL TABLE IF NOT EXISTS mcqs_fts USING fts5(
  question, explanation, tags,
  content='mcqs', content_rowid='rowid',
  tokenize='unicode61 remove_diacritics 2'
);

-- ============================================================
-- Phase 14 — Enterprise Knowledge Graph (kg_* namespace)
-- Structure only. Canonical DDL is db/kg-migrate.js (run at open()).
-- This mirror keeps db/migrate.js and fresh installs in sync.
-- ============================================================
CREATE TABLE IF NOT EXISTS kg_knowledge_packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  version INTEGER DEFAULT 1,
  overview TEXT DEFAULT '', core_domains TEXT DEFAULT '[]', sub_domains TEXT DEFAULT '[]',
  concept_map TEXT DEFAULT '{}', glossary TEXT DEFAULT '[]', terminology TEXT DEFAULT '[]',
  definitions TEXT DEFAULT '[]', important_facts TEXT DEFAULT '[]', rules TEXT DEFAULT '[]',
  formulas TEXT DEFAULT '[]', processes TEXT DEFAULT '[]', classifications TEXT DEFAULT '[]',
  relationships TEXT DEFAULT '[]', misconceptions TEXT DEFAULT '[]', memory_techniques TEXT DEFAULT '[]',
  exam_tips TEXT DEFAULT '[]', frequently_tested TEXT DEFAULT '[]', difficulty_distribution TEXT DEFAULT '{}',
  concept_count INTEGER DEFAULT 0, source TEXT DEFAULT 'kg-pack-engine',
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, version)
);
CREATE INDEX IF NOT EXISTS ix_kg_packs_subject ON kg_knowledge_packs(subject_id);

CREATE TABLE IF NOT EXISTS kg_concepts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  chapter_id TEXT REFERENCES chapters(id), topic_id TEXT REFERENCES topics(id),
  subtopic_id INTEGER REFERENCES subtopics(id),
  name TEXT NOT NULL, slug TEXT NOT NULL, definition TEXT DEFAULT '', summary TEXT DEFAULT '',
  domain TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium', bloom TEXT DEFAULT 'Understand',
  exam_frequency INTEGER DEFAULT 0, revision_priority INTEGER DEFAULT 3, tags TEXT DEFAULT '[]',
  source TEXT DEFAULT 'kg-concept-engine', status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, slug)
);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_subject ON kg_concepts(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_topic ON kg_concepts(topic_id);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_domain ON kg_concepts(subject_id, domain);

CREATE TABLE IF NOT EXISTS kg_micro_concepts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  name TEXT NOT NULL, slug TEXT NOT NULL, detail TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium',
  sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (concept_id, slug)
);
CREATE INDEX IF NOT EXISTS ix_kg_micro_concept ON kg_micro_concepts(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_micro_subject ON kg_micro_concepts(subject_id);

CREATE TABLE IF NOT EXISTS kg_learning_objectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  micro_concept_id INTEGER REFERENCES kg_micro_concepts(id),
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  statement TEXT NOT NULL, slug TEXT NOT NULL, bloom TEXT DEFAULT 'Understand',
  difficulty TEXT DEFAULT 'medium', question_patterns TEXT DEFAULT '[]', sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (concept_id, slug)
);
CREATE INDEX IF NOT EXISTS ix_kg_lo_concept ON kg_learning_objectives(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_lo_micro ON kg_learning_objectives(micro_concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_lo_subject ON kg_learning_objectives(subject_id);

CREATE TABLE IF NOT EXISTS kg_concept_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_concept INTEGER NOT NULL REFERENCES kg_concepts(id),
  to_concept INTEGER NOT NULL REFERENCES kg_concepts(id),
  relation_type TEXT NOT NULL, weight REAL DEFAULT 1.0, created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (from_concept, to_concept, relation_type)
);
CREATE INDEX IF NOT EXISTS ix_kg_rel_from ON kg_concept_relations(from_concept);
CREATE INDEX IF NOT EXISTS ix_kg_rel_to ON kg_concept_relations(to_concept);
CREATE INDEX IF NOT EXISTS ix_kg_rel_type ON kg_concept_relations(relation_type);

CREATE TABLE IF NOT EXISTS kg_prerequisites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  requires_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  strength REAL DEFAULT 1.0, created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (concept_id, requires_id)
);
CREATE INDEX IF NOT EXISTS ix_kg_prereq_concept ON kg_prerequisites(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_prereq_requires ON kg_prerequisites(requires_id);

CREATE TABLE IF NOT EXISTS kg_difficulty_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  easy_pct REAL DEFAULT 0, medium_pct REAL DEFAULT 0, hard_pct REAL DEFAULT 0,
  avg_time_sec INTEGER DEFAULT 40, cognitive_load TEXT DEFAULT 'medium',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (concept_id)
);
CREATE INDEX IF NOT EXISTS ix_kg_diff_concept ON kg_difficulty_profiles(concept_id);

CREATE TABLE IF NOT EXISTS kg_exam_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id TEXT NOT NULL, subject_id TEXT REFERENCES subjects(id),
  concept_id INTEGER REFERENCES kg_concepts(id), objective_id INTEGER REFERENCES kg_learning_objectives(id),
  weight REAL DEFAULT 1.0, frequency INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_kg_exam_exam ON kg_exam_mappings(exam_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_subject ON kg_exam_mappings(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_concept ON kg_exam_mappings(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_objective ON kg_exam_mappings(objective_id);

CREATE TABLE IF NOT EXISTS kg_question_blueprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objective_id INTEGER REFERENCES kg_learning_objectives(id),
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  blueprint_type TEXT NOT NULL, stem_pattern TEXT DEFAULT '', answer_shape TEXT DEFAULT '',
  distractor_strategy TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium', bloom TEXT DEFAULT 'Understand',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (concept_id, blueprint_type, objective_id)
);
CREATE INDEX IF NOT EXISTS ix_kg_bp_concept ON kg_question_blueprints(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_objective ON kg_question_blueprints(objective_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_subject ON kg_question_blueprints(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_type ON kg_question_blueprints(blueprint_type);

CREATE TABLE IF NOT EXISTS kg_distractor_pools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  concept_id INTEGER REFERENCES kg_concepts(id),
  category TEXT NOT NULL, description TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, category)
);
CREATE INDEX IF NOT EXISTS ix_kg_pool_subject ON kg_distractor_pools(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_pool_concept ON kg_distractor_pools(concept_id);
CREATE TABLE IF NOT EXISTS kg_distractor_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pool_id INTEGER NOT NULL REFERENCES kg_distractor_pools(id),
  value TEXT NOT NULL, note TEXT DEFAULT '',
  UNIQUE (pool_id, value)
);
CREATE INDEX IF NOT EXISTS ix_kg_ditem_pool ON kg_distractor_items(pool_id);

CREATE TABLE IF NOT EXISTS kg_reference_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER REFERENCES kg_concepts(id), subject_id TEXT REFERENCES subjects(id),
  ref_type TEXT DEFAULT 'book', title TEXT NOT NULL, edition TEXT DEFAULT '', year INTEGER,
  publisher TEXT DEFAULT '', official_syllabus TEXT DEFAULT '', public_curriculum TEXT DEFAULT '',
  exam_mapping TEXT DEFAULT '', objective_id INTEGER REFERENCES kg_learning_objectives(id),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_kg_ref_concept ON kg_reference_sources(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_ref_subject ON kg_reference_sources(subject_id);

CREATE TABLE IF NOT EXISTS kg_syllabus_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL REFERENCES subjects(id), exam_id TEXT DEFAULT '',
  unit_name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT DEFAULT '',
  weight REAL DEFAULT 1.0, sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, exam_id, slug)
);
CREATE INDEX IF NOT EXISTS ix_kg_syllabus_subject ON kg_syllabus_units(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_syllabus_exam ON kg_syllabus_units(exam_id);

CREATE TABLE IF NOT EXISTS kg_learning_paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL REFERENCES subjects(id), exam_id TEXT DEFAULT '',
  name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, slug)
);
CREATE INDEX IF NOT EXISTS ix_kg_path_subject ON kg_learning_paths(subject_id);
CREATE TABLE IF NOT EXISTS kg_learning_path_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id INTEGER NOT NULL REFERENCES kg_learning_paths(id),
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), step_order INTEGER DEFAULT 0,
  UNIQUE (path_id, concept_id)
);
CREATE INDEX IF NOT EXISTS ix_kg_pathstep_path ON kg_learning_path_steps(path_id);

CREATE TABLE IF NOT EXISTS kg_concept_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL REFERENCES kg_concepts(id),
  micro_count INTEGER DEFAULT 0, objective_count INTEGER DEFAULT 0, blueprint_count INTEGER DEFAULT 0,
  mcq_count INTEGER DEFAULT 0, relation_count INTEGER DEFAULT 0, depth_score REAL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE (concept_id)
);
CREATE INDEX IF NOT EXISTS ix_kg_stat_concept ON kg_concept_statistics(concept_id);

CREATE TABLE IF NOT EXISTS kg_subject_statistics (
  subject_id TEXT PRIMARY KEY REFERENCES subjects(id),
  pack_version INTEGER DEFAULT 0, concept_count INTEGER DEFAULT 0, micro_count INTEGER DEFAULT 0,
  objective_count INTEGER DEFAULT 0, blueprint_count INTEGER DEFAULT 0, relation_count INTEGER DEFAULT 0,
  exam_map_count INTEGER DEFAULT 0, reference_count INTEGER DEFAULT 0, distractor_pool_count INTEGER DEFAULT 0,
  depth_score REAL DEFAULT 0, coverage_status TEXT DEFAULT 'pending', updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kg_concept_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER REFERENCES kg_concepts(id), subject_id TEXT REFERENCES subjects(id),
  action TEXT NOT NULL, detail TEXT DEFAULT '', actor TEXT DEFAULT 'kg-engine', created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_kg_hist_concept ON kg_concept_history(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_hist_subject ON kg_concept_history(subject_id);

CREATE TABLE IF NOT EXISTS kg_validation_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at TEXT DEFAULT (datetime('now')), scope TEXT DEFAULT 'all', score REAL DEFAULT 0,
  issues_json TEXT DEFAULT '{}', summary TEXT DEFAULT ''
);
