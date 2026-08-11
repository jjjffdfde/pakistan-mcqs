-- ============================================================
-- Pakistan MCQS Hub — PostgreSQL schema (Enterprise 2026)
-- Engine: PostgreSQL 12+
-- Apply: psql -U postgres -d pakistan_mcqs -f db/schema.pgsql.sql
-- Or via db/migrate.js when pg driver is installed.
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  icon        VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  category_id VARCHAR(64) REFERENCES categories(id),
  icon        VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  status      VARCHAR(16) DEFAULT 'active',
  exam_ids    TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id          VARCHAR(64) PRIMARY KEY,
  subject_id  VARCHAR(64) NOT NULL REFERENCES subjects(id),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subject_id, slug)
);

CREATE TABLE IF NOT EXISTS topics (
  id          VARCHAR(64) PRIMARY KEY,
  chapter_id  VARCHAR(64) NOT NULL REFERENCES chapters(id),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  sort_order  INT DEFAULT 0,
  UNIQUE (chapter_id, slug)
);

CREATE TABLE IF NOT EXISTS subtopics (
  id       SERIAL PRIMARY KEY,
  topic_id VARCHAR(64) NOT NULL REFERENCES topics(id),
  name     VARCHAR(255) NOT NULL,
  UNIQUE (topic_id, name)
);

CREATE TABLE IF NOT EXISTS mcqs (
  id             VARCHAR(64) PRIMARY KEY,
  question       TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  difficulty     VARCHAR(8) NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  subject_id     VARCHAR(64) NOT NULL REFERENCES subjects(id),
  chapter_id     VARCHAR(64) REFERENCES chapters(id),
  topic_id       VARCHAR(64) REFERENCES topics(id),
  subtopic_id    INT REFERENCES subtopics(id),
  exam_ids       TEXT DEFAULT '',
  year           INT,
  tags           TEXT DEFAULT '[]',
  references_json TEXT DEFAULT '[]',
  explanation    TEXT NOT NULL,
  source         VARCHAR(64) DEFAULT 'existing',
  status         VARCHAR(16) DEFAULT 'active',
  qhash          CHAR(64) NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_mcqs_subject ON mcqs(subject_id);
CREATE INDEX ix_mcqs_chapter  ON mcqs(chapter_id);
CREATE INDEX ix_mcqs_topic    ON mcqs(topic_id);
CREATE INDEX ix_mcqs_diff     ON mcqs(difficulty);
CREATE INDEX ix_mcqs_year     ON mcqs(year);

CREATE TABLE IF NOT EXISTS options (
  id      SERIAL PRIMARY KEY,
  mcq_id  VARCHAR(64) NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
  label   CHAR(1) NOT NULL CHECK (label IN ('A','B','C','D')),
  text    TEXT NOT NULL,
  UNIQUE (mcq_id, label)
);
CREATE INDEX ix_options_mcq ON options(mcq_id);

CREATE TABLE IF NOT EXISTS references_tbl (
  id         SERIAL PRIMARY KEY,
  mcq_id     VARCHAR(64) REFERENCES mcqs(id),
  subject_id VARCHAR(64) REFERENCES subjects(id),
  title      VARCHAR(255) NOT NULL,
  url        VARCHAR(512) NOT NULL,
  kind       VARCHAR(32) DEFAULT 'documentation'
);

CREATE TABLE IF NOT EXISTS quizzes (
  id              VARCHAR(64) PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT DEFAULT '',
  subject_ids     TEXT DEFAULT '',
  difficulty      VARCHAR(16) DEFAULT 'easy',
  total_questions INT DEFAULT 0,
  duration_mins   INT DEFAULT 0,
  tags            TEXT DEFAULT '[]',
  status          VARCHAR(16) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mocktests (
  id               VARCHAR(64) PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  exam_id          VARCHAR(64) DEFAULT '',
  subject_ids      TEXT DEFAULT '',
  difficulty       VARCHAR(16) DEFAULT 'medium',
  total_questions  INT DEFAULT 0,
  duration_mins    INT DEFAULT 0,
  negative_marking INT DEFAULT 0,
  status           VARCHAR(16) DEFAULT 'active',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pastpapers (
  id              VARCHAR(64) PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  exam_id         VARCHAR(64) DEFAULT '',
  year            INT,
  pattern         SMALLINT DEFAULT 0,
  subject_ids     TEXT DEFAULT '',
  total_questions INT DEFAULT 0,
  duration_mins   INT DEFAULT 0,
  file            TEXT DEFAULT '',
  question_ids    TEXT DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id         SERIAL PRIMARY KEY,
  device_id  VARCHAR(64) NOT NULL,
  mcq_id     VARCHAR(64) NOT NULL REFERENCES mcqs(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (device_id, mcq_id)
);
CREATE INDEX ix_bookmarks_device ON bookmarks(device_id);

CREATE TABLE IF NOT EXISTS history (
  id          SERIAL PRIMARY KEY,
  device_id   VARCHAR(64) NOT NULL,
  mcq_id      VARCHAR(64) NOT NULL REFERENCES mcqs(id),
  correct     INT NOT NULL DEFAULT 0,
  points      INT NOT NULL DEFAULT 0,
  mode        VARCHAR(32) DEFAULT 'practice',
  answered_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_history_device ON history(device_id, answered_at);
CREATE INDEX ix_history_mcq ON history(mcq_id);

CREATE TABLE IF NOT EXISTS leaderboard (
  id            SERIAL PRIMARY KEY,
  device_id     VARCHAR(64) NOT NULL UNIQUE,
  name          VARCHAR(255) DEFAULT '',
  points        INT DEFAULT 0,
  week_key      VARCHAR(16) DEFAULT '',
  month_key     VARCHAR(16) DEFAULT '',
  correct       INT DEFAULT 0,
  total         INT DEFAULT 0,
  week_claimed  INT DEFAULT 0,
  month_claimed INT DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_leaderboard_points ON leaderboard(points DESC);

CREATE TABLE IF NOT EXISTS analytics (
  id         SERIAL PRIMARY KEY,
  device_id  VARCHAR(64) DEFAULT '',
  event      VARCHAR(64) NOT NULL,
  payload    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ix_analytics_event ON analytics(event, created_at);

CREATE TABLE IF NOT EXISTS pipeline_state (
  key   VARCHAR(128) PRIMARY KEY,
  value TEXT NOT NULL
);

-- Full-text search: PostgreSQL tsvector column + GIN index
ALTER TABLE mcqs ADD COLUMN IF NOT EXISTS search_tsv tsvector;
UPDATE mcqs SET search_tsv = to_tsvector('simple', question || ' ' || explanation);
CREATE INDEX IF NOT EXISTS fts_mcqs_gin ON mcqs USING GIN (search_tsv);

CREATE OR REPLACE FUNCTION mcqs_fts_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := to_tsvector('simple', NEW.question || ' ' || COALESCE(NEW.explanation, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mcqs_fts ON mcqs;
CREATE TRIGGER trg_mcqs_fts BEFORE INSERT OR UPDATE ON mcqs
FOR EACH ROW EXECUTE FUNCTION mcqs_fts_trigger();

-- ==== PHASE 14 KNOWLEDGE GRAPH (generated mirror — do not edit by hand) ====
-- dialect: PostgreSQL. Source: db/kg-migrate.js
CREATE TABLE IF NOT EXISTS kg_knowledge_packs ( id SERIAL PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), version INTEGER DEFAULT 1, overview TEXT DEFAULT '', core_domains TEXT DEFAULT '[]', sub_domains TEXT DEFAULT '[]', concept_map TEXT DEFAULT '{}', glossary TEXT DEFAULT '[]', terminology TEXT DEFAULT '[]', definitions TEXT DEFAULT '[]', important_facts TEXT DEFAULT '[]', rules TEXT DEFAULT '[]', formulas TEXT DEFAULT '[]', processes TEXT DEFAULT '[]', classifications TEXT DEFAULT '[]', relationships TEXT DEFAULT '[]', misconceptions TEXT DEFAULT '[]', memory_techniques TEXT DEFAULT '[]', exam_tips TEXT DEFAULT '[]', frequently_tested TEXT DEFAULT '[]', difficulty_distribution TEXT DEFAULT '{}', concept_count INTEGER DEFAULT 0, source TEXT DEFAULT 'kg-pack-engine', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (subject_id, version) );
CREATE INDEX IF NOT EXISTS ix_kg_packs_subject ON kg_knowledge_packs(subject_id);
CREATE TABLE IF NOT EXISTS kg_concepts ( id SERIAL PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), chapter_id TEXT REFERENCES chapters(id), topic_id TEXT REFERENCES topics(id), subtopic_id INTEGER REFERENCES subtopics(id), name TEXT NOT NULL, slug TEXT NOT NULL, definition TEXT DEFAULT '', summary TEXT DEFAULT '', domain TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium', bloom TEXT DEFAULT 'Understand', exam_frequency INTEGER DEFAULT 0, revision_priority INTEGER DEFAULT 3, tags TEXT DEFAULT '[]', source TEXT DEFAULT 'kg-concept-engine', status TEXT DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (subject_id, slug) );
CREATE INDEX IF NOT EXISTS ix_kg_concepts_subject ON kg_concepts(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_topic ON kg_concepts(topic_id);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_domain ON kg_concepts(subject_id, domain);
CREATE TABLE IF NOT EXISTS kg_micro_concepts ( id SERIAL PRIMARY KEY, concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), subject_id TEXT NOT NULL REFERENCES subjects(id), name TEXT NOT NULL, slug TEXT NOT NULL, detail TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium', sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (concept_id, slug) );
CREATE INDEX IF NOT EXISTS ix_kg_micro_concept ON kg_micro_concepts(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_micro_subject ON kg_micro_concepts(subject_id);
CREATE TABLE IF NOT EXISTS kg_learning_objectives ( id SERIAL PRIMARY KEY, micro_concept_id INTEGER REFERENCES kg_micro_concepts(id), concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), subject_id TEXT NOT NULL REFERENCES subjects(id), statement TEXT NOT NULL, slug TEXT NOT NULL, bloom TEXT DEFAULT 'Understand', difficulty TEXT DEFAULT 'medium', question_patterns TEXT DEFAULT '[]', sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (concept_id, slug) );
CREATE INDEX IF NOT EXISTS ix_kg_lo_concept ON kg_learning_objectives(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_lo_micro ON kg_learning_objectives(micro_concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_lo_subject ON kg_learning_objectives(subject_id);
CREATE TABLE IF NOT EXISTS kg_concept_relations ( id SERIAL PRIMARY KEY, from_concept INTEGER NOT NULL REFERENCES kg_concepts(id), to_concept INTEGER NOT NULL REFERENCES kg_concepts(id), relation_type TEXT NOT NULL, weight DOUBLE PRECISION DEFAULT 1.0, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (from_concept, to_concept, relation_type) );
CREATE INDEX IF NOT EXISTS ix_kg_rel_from ON kg_concept_relations(from_concept);
CREATE INDEX IF NOT EXISTS ix_kg_rel_to ON kg_concept_relations(to_concept);
CREATE INDEX IF NOT EXISTS ix_kg_rel_type ON kg_concept_relations(relation_type);
CREATE TABLE IF NOT EXISTS kg_prerequisites ( id SERIAL PRIMARY KEY, concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), requires_id INTEGER NOT NULL REFERENCES kg_concepts(id), strength DOUBLE PRECISION DEFAULT 1.0, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (concept_id, requires_id) );
CREATE INDEX IF NOT EXISTS ix_kg_prereq_concept ON kg_prerequisites(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_prereq_requires ON kg_prerequisites(requires_id);
CREATE TABLE IF NOT EXISTS kg_difficulty_profiles ( id SERIAL PRIMARY KEY, concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), easy_pct DOUBLE PRECISION DEFAULT 0, medium_pct DOUBLE PRECISION DEFAULT 0, hard_pct DOUBLE PRECISION DEFAULT 0, avg_time_sec INTEGER DEFAULT 40, cognitive_load TEXT DEFAULT 'medium', created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (concept_id) );
CREATE INDEX IF NOT EXISTS ix_kg_diff_concept ON kg_difficulty_profiles(concept_id);
CREATE TABLE IF NOT EXISTS kg_exam_mappings ( id SERIAL PRIMARY KEY, exam_id TEXT NOT NULL, subject_id TEXT REFERENCES subjects(id), concept_id INTEGER REFERENCES kg_concepts(id), objective_id INTEGER REFERENCES kg_learning_objectives(id), weight DOUBLE PRECISION DEFAULT 1.0, frequency INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now() );
CREATE INDEX IF NOT EXISTS ix_kg_exam_exam ON kg_exam_mappings(exam_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_subject ON kg_exam_mappings(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_concept ON kg_exam_mappings(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_objective ON kg_exam_mappings(objective_id);
CREATE TABLE IF NOT EXISTS kg_question_blueprints ( id SERIAL PRIMARY KEY, objective_id INTEGER REFERENCES kg_learning_objectives(id), concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), subject_id TEXT NOT NULL REFERENCES subjects(id), blueprint_type TEXT NOT NULL, stem_pattern TEXT DEFAULT '', answer_shape TEXT DEFAULT '', distractor_strategy TEXT DEFAULT '', difficulty TEXT DEFAULT 'medium', bloom TEXT DEFAULT 'Understand', created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (concept_id, blueprint_type, objective_id) );
CREATE INDEX IF NOT EXISTS ix_kg_bp_concept ON kg_question_blueprints(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_objective ON kg_question_blueprints(objective_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_subject ON kg_question_blueprints(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_type ON kg_question_blueprints(blueprint_type);
CREATE TABLE IF NOT EXISTS kg_distractor_pools ( id SERIAL PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), concept_id INTEGER REFERENCES kg_concepts(id), category TEXT NOT NULL, description TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (subject_id, category) );
CREATE INDEX IF NOT EXISTS ix_kg_pool_subject ON kg_distractor_pools(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_pool_concept ON kg_distractor_pools(concept_id);
CREATE TABLE IF NOT EXISTS kg_distractor_items ( id SERIAL PRIMARY KEY, pool_id INTEGER NOT NULL REFERENCES kg_distractor_pools(id), value TEXT NOT NULL, note TEXT DEFAULT '', UNIQUE (pool_id, value) );
CREATE INDEX IF NOT EXISTS ix_kg_ditem_pool ON kg_distractor_items(pool_id);
CREATE TABLE IF NOT EXISTS kg_reference_sources ( id SERIAL PRIMARY KEY, concept_id INTEGER REFERENCES kg_concepts(id), subject_id TEXT REFERENCES subjects(id), ref_type TEXT DEFAULT 'book', title TEXT NOT NULL, edition TEXT DEFAULT '', year INTEGER, publisher TEXT DEFAULT '', official_syllabus TEXT DEFAULT '', public_curriculum TEXT DEFAULT '', exam_mapping TEXT DEFAULT '', objective_id INTEGER REFERENCES kg_learning_objectives(id), created_at TIMESTAMPTZ DEFAULT now() );
CREATE INDEX IF NOT EXISTS ix_kg_ref_concept ON kg_reference_sources(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_ref_subject ON kg_reference_sources(subject_id);
CREATE TABLE IF NOT EXISTS kg_syllabus_units ( id SERIAL PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), exam_id TEXT DEFAULT '', unit_name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT DEFAULT '', weight DOUBLE PRECISION DEFAULT 1.0, sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (subject_id, exam_id, slug) );
CREATE INDEX IF NOT EXISTS ix_kg_syllabus_subject ON kg_syllabus_units(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_syllabus_exam ON kg_syllabus_units(exam_id);
CREATE TABLE IF NOT EXISTS kg_learning_paths ( id SERIAL PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), exam_id TEXT DEFAULT '', name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT now(), UNIQUE (subject_id, slug) );
CREATE INDEX IF NOT EXISTS ix_kg_path_subject ON kg_learning_paths(subject_id);
CREATE TABLE IF NOT EXISTS kg_learning_path_steps ( id SERIAL PRIMARY KEY, path_id INTEGER NOT NULL REFERENCES kg_learning_paths(id), concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), step_order INTEGER DEFAULT 0, UNIQUE (path_id, concept_id) );
CREATE INDEX IF NOT EXISTS ix_kg_pathstep_path ON kg_learning_path_steps(path_id);
CREATE TABLE IF NOT EXISTS kg_concept_statistics ( id SERIAL PRIMARY KEY, concept_id INTEGER NOT NULL REFERENCES kg_concepts(id), micro_count INTEGER DEFAULT 0, objective_count INTEGER DEFAULT 0, blueprint_count INTEGER DEFAULT 0, mcq_count INTEGER DEFAULT 0, relation_count INTEGER DEFAULT 0, depth_score DOUBLE PRECISION DEFAULT 0, updated_at TIMESTAMPTZ DEFAULT now(), UNIQUE (concept_id) );
CREATE INDEX IF NOT EXISTS ix_kg_stat_concept ON kg_concept_statistics(concept_id);
CREATE TABLE IF NOT EXISTS kg_subject_statistics ( subject_id TEXT PRIMARY KEY REFERENCES subjects(id), pack_version INTEGER DEFAULT 0, concept_count INTEGER DEFAULT 0, micro_count INTEGER DEFAULT 0, objective_count INTEGER DEFAULT 0, blueprint_count INTEGER DEFAULT 0, relation_count INTEGER DEFAULT 0, exam_map_count INTEGER DEFAULT 0, reference_count INTEGER DEFAULT 0, distractor_pool_count INTEGER DEFAULT 0, depth_score DOUBLE PRECISION DEFAULT 0, coverage_status TEXT DEFAULT 'pending', updated_at TIMESTAMPTZ DEFAULT now() );
CREATE TABLE IF NOT EXISTS kg_concept_history ( id SERIAL PRIMARY KEY, concept_id INTEGER REFERENCES kg_concepts(id), subject_id TEXT REFERENCES subjects(id), action TEXT NOT NULL, detail TEXT DEFAULT '', actor TEXT DEFAULT 'kg-engine', created_at TIMESTAMPTZ DEFAULT now() );
CREATE INDEX IF NOT EXISTS ix_kg_hist_concept ON kg_concept_history(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_hist_subject ON kg_concept_history(subject_id);
CREATE TABLE IF NOT EXISTS kg_validation_reports ( id SERIAL PRIMARY KEY, run_at TIMESTAMPTZ DEFAULT now(), scope TEXT DEFAULT 'all', score DOUBLE PRECISION DEFAULT 0, issues_json TEXT DEFAULT '{}', summary TEXT DEFAULT '' );
-- ==== END PHASE 14 KNOWLEDGE GRAPH ====
