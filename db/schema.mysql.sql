-- ============================================================
-- Pakistan MCQs Hub — MySQL / MariaDB schema (Enterprise 2026)
-- Engine: MySQL 5.7+ / MariaDB 10.4+
-- Apply: mysql -u root -p pakistan_mcqs < db/schema.mysql.sql
-- Or via db/migrate.js when mysql2 driver is installed.
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  icon        VARCHAR(255) DEFAULT '',
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subjects (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  category_id VARCHAR(64) REFERENCES categories(id),
  icon        VARCHAR(255) DEFAULT '',
  description TEXT,
  status      VARCHAR(16) DEFAULT 'active',
  exam_ids    TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chapters (
  id          VARCHAR(64) PRIMARY KEY,
  subject_id  VARCHAR(64) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chapters (subject_id, slug),
  CONSTRAINT fk_ch_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS topics (
  id          VARCHAR(64) PRIMARY KEY,
  chapter_id  VARCHAR(64) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  sort_order  INT DEFAULT 0,
  UNIQUE KEY uq_topics (chapter_id, slug),
  CONSTRAINT fk_tp_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subtopics (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  topic_id VARCHAR(64) NOT NULL,
  name     VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_subtopics (topic_id, name),
  CONSTRAINT fk_st_topic FOREIGN KEY (topic_id) REFERENCES topics(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mcqs (
  id              VARCHAR(64) PRIMARY KEY,
  question        TEXT NOT NULL,
  correct_answer  CHAR(1) NOT NULL,
  difficulty      VARCHAR(8) NOT NULL,
  subject_id      VARCHAR(64) NOT NULL,
  chapter_id      VARCHAR(64),
  topic_id        VARCHAR(64),
  subtopic_id     INT,
  exam_ids        TEXT,
  year            INT,
  tags            TEXT,
  references_json  TEXT,
  explanation     TEXT NOT NULL,
  source          VARCHAR(64) DEFAULT 'existing',
  status          VARCHAR(16) DEFAULT 'active',
  qhash           CHAR(64) NOT NULL UNIQUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_mcqs_subject (subject_id),
  KEY ix_mcqs_chapter (chapter_id),
  KEY ix_mcqs_topic (topic_id),
  KEY ix_mcqs_diff (difficulty),
  KEY ix_mcqs_year (year),
  CONSTRAINT fk_mcq_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
  CONSTRAINT fk_mcq_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  CONSTRAINT fk_mcq_topic FOREIGN KEY (topic_id) REFERENCES topics(id),
  CONSTRAINT fk_mcq_subtopic FOREIGN KEY (subtopic_id) REFERENCES subtopics(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS options (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  mcq_id  VARCHAR(64) NOT NULL,
  label   CHAR(1) NOT NULL,
  text    TEXT NOT NULL,
  UNIQUE KEY uq_options (mcq_id, label),
  CONSTRAINT fk_opt_mcq FOREIGN KEY (mcq_id) REFERENCES mcqs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS references_tbl (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  mcq_id     VARCHAR(64),
  subject_id VARCHAR(64),
  title      VARCHAR(255) NOT NULL,
  url        VARCHAR(512) NOT NULL,
  kind       VARCHAR(32) DEFAULT 'documentation'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quizzes (
  id              VARCHAR(64) PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  subject_ids     TEXT,
  difficulty      VARCHAR(16) DEFAULT 'easy',
  total_questions INT DEFAULT 0,
  duration_mins   INT DEFAULT 0,
  tags            TEXT,
  status          VARCHAR(16) DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mocktests (
  id               VARCHAR(64) PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  exam_id          VARCHAR(64) DEFAULT '',
  subject_ids      TEXT,
  difficulty       VARCHAR(16) DEFAULT 'medium',
  total_questions  INT DEFAULT 0,
  duration_mins    INT DEFAULT 0,
  negative_marking INT DEFAULT 0,
  status           VARCHAR(16) DEFAULT 'active',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pastpapers (
  id              VARCHAR(64) PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  exam_id         VARCHAR(64) DEFAULT '',
  year            INT,
  pattern         TINYINT DEFAULT 0,
  subject_ids     TEXT,
  total_questions INT DEFAULT 0,
  duration_mins   INT DEFAULT 0,
  file            TEXT,
  question_ids    TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookmarks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  device_id  VARCHAR(64) NOT NULL,
  mcq_id     VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookmarks (device_id, mcq_id),
  CONSTRAINT fk_bm_mcq FOREIGN KEY (mcq_id) REFERENCES mcqs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  device_id   VARCHAR(64) NOT NULL,
  mcq_id      VARCHAR(64) NOT NULL,
  correct     INT NOT NULL DEFAULT 0,
  points      INT NOT NULL DEFAULT 0,
  mode        VARCHAR(32) DEFAULT 'practice',
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY ix_history_device (device_id, answered_at),
  KEY ix_history_mcq (mcq_id),
  CONSTRAINT fk_hist_mcq FOREIGN KEY (mcq_id) REFERENCES mcqs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leaderboard (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  device_id     VARCHAR(64) NOT NULL UNIQUE,
  name          VARCHAR(255) DEFAULT '',
  points        INT DEFAULT 0,
  week_key      VARCHAR(16) DEFAULT '',
  month_key     VARCHAR(16) DEFAULT '',
  correct       INT DEFAULT 0,
  total         INT DEFAULT 0,
  week_claimed  INT DEFAULT 0,
  month_claimed INT DEFAULT 0,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_leaderboard_points (points DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS analytics (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  device_id  VARCHAR(64) DEFAULT '',
  event      VARCHAR(64) NOT NULL,
  payload    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY ix_analytics_event (event, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pipeline_state (
  key   VARCHAR(128) PRIMARY KEY,
  value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Full-text search: MySQL FULLTEXT index on mcqs
ALTER TABLE mcqs ADD FULLTEXT KEY fts_mcqs (question, explanation);

-- ==== PHASE 14 KNOWLEDGE GRAPH (generated mirror — do not edit by hand) ====
-- dialect: MySQL/MariaDB. Source: db/kg-migrate.js
CREATE TABLE IF NOT EXISTS kg_knowledge_packs ( id INT AUTO_INCREMENT PRIMARY KEY, subject_id TEXT NOT NULL, version INT DEFAULT 1, overview TEXT, core_domains TEXT, sub_domains TEXT, concept_map TEXT, glossary TEXT, terminology TEXT, definitions TEXT, important_facts TEXT, rules TEXT, formulas TEXT, processes TEXT, classifications TEXT, relationships TEXT, misconceptions TEXT, memory_techniques TEXT, exam_tips TEXT, frequently_tested TEXT, difficulty_distribution TEXT, concept_count INT DEFAULT 0, source TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (subject_id, version) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_packs_subject ON kg_knowledge_packs(subject_id);
CREATE TABLE IF NOT EXISTS kg_concepts ( id INT AUTO_INCREMENT PRIMARY KEY, subject_id TEXT NOT NULL, chapter_id TEXT, topic_id TEXT, subtopic_id INT, name TEXT NOT NULL, slug TEXT NOT NULL, definition TEXT, summary TEXT, domain TEXT, difficulty TEXT, bloom TEXT, exam_frequency INT DEFAULT 0, revision_priority INT DEFAULT 3, tags TEXT, source TEXT, status TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (subject_id, slug) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_concepts_subject ON kg_concepts(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_topic ON kg_concepts(topic_id);
CREATE INDEX IF NOT EXISTS ix_kg_concepts_domain ON kg_concepts(subject_id, domain);
CREATE TABLE IF NOT EXISTS kg_micro_concepts ( id INT AUTO_INCREMENT PRIMARY KEY, concept_id INT NOT NULL, subject_id TEXT NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL, detail TEXT, difficulty TEXT, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (concept_id, slug) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_micro_concept ON kg_micro_concepts(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_micro_subject ON kg_micro_concepts(subject_id);
CREATE TABLE IF NOT EXISTS kg_learning_objectives ( id INT AUTO_INCREMENT PRIMARY KEY, micro_concept_id INT, concept_id INT NOT NULL, subject_id TEXT NOT NULL, statement TEXT NOT NULL, slug TEXT NOT NULL, bloom TEXT, difficulty TEXT, question_patterns TEXT, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (concept_id, slug) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_lo_concept ON kg_learning_objectives(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_lo_micro ON kg_learning_objectives(micro_concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_lo_subject ON kg_learning_objectives(subject_id);
CREATE TABLE IF NOT EXISTS kg_concept_relations ( id INT AUTO_INCREMENT PRIMARY KEY, from_concept INT NOT NULL, to_concept INT NOT NULL, relation_type TEXT NOT NULL, weight DOUBLE DEFAULT 1.0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (from_concept, to_concept, relation_type) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_rel_from ON kg_concept_relations(from_concept);
CREATE INDEX IF NOT EXISTS ix_kg_rel_to ON kg_concept_relations(to_concept);
CREATE INDEX IF NOT EXISTS ix_kg_rel_type ON kg_concept_relations(relation_type);
CREATE TABLE IF NOT EXISTS kg_prerequisites ( id INT AUTO_INCREMENT PRIMARY KEY, concept_id INT NOT NULL, requires_id INT NOT NULL, strength DOUBLE DEFAULT 1.0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (concept_id, requires_id) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_prereq_concept ON kg_prerequisites(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_prereq_requires ON kg_prerequisites(requires_id);
CREATE TABLE IF NOT EXISTS kg_difficulty_profiles ( id INT AUTO_INCREMENT PRIMARY KEY, concept_id INT NOT NULL, easy_pct DOUBLE DEFAULT 0, medium_pct DOUBLE DEFAULT 0, hard_pct DOUBLE DEFAULT 0, avg_time_sec INT DEFAULT 40, cognitive_load TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (concept_id) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_diff_concept ON kg_difficulty_profiles(concept_id);
CREATE TABLE IF NOT EXISTS kg_exam_mappings ( id INT AUTO_INCREMENT PRIMARY KEY, exam_id TEXT NOT NULL, subject_id TEXT, concept_id INT, objective_id INT, weight DOUBLE DEFAULT 1.0, frequency INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_exam_exam ON kg_exam_mappings(exam_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_subject ON kg_exam_mappings(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_concept ON kg_exam_mappings(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_exam_objective ON kg_exam_mappings(objective_id);
CREATE TABLE IF NOT EXISTS kg_question_blueprints ( id INT AUTO_INCREMENT PRIMARY KEY, objective_id INT, concept_id INT NOT NULL, subject_id TEXT NOT NULL, blueprint_type TEXT NOT NULL, stem_pattern TEXT, answer_shape TEXT, distractor_strategy TEXT, difficulty TEXT, bloom TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (concept_id, blueprint_type, objective_id) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_bp_concept ON kg_question_blueprints(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_objective ON kg_question_blueprints(objective_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_subject ON kg_question_blueprints(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_bp_type ON kg_question_blueprints(blueprint_type);
CREATE TABLE IF NOT EXISTS kg_distractor_pools ( id INT AUTO_INCREMENT PRIMARY KEY, subject_id TEXT NOT NULL, concept_id INT, category TEXT NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (subject_id, category) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_pool_subject ON kg_distractor_pools(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_pool_concept ON kg_distractor_pools(concept_id);
CREATE TABLE IF NOT EXISTS kg_distractor_items ( id INT AUTO_INCREMENT PRIMARY KEY, pool_id INT NOT NULL, value TEXT NOT NULL, note TEXT, UNIQUE (pool_id, value) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_ditem_pool ON kg_distractor_items(pool_id);
CREATE TABLE IF NOT EXISTS kg_reference_sources ( id INT AUTO_INCREMENT PRIMARY KEY, concept_id INT, subject_id TEXT, ref_type TEXT, title TEXT NOT NULL, edition TEXT, year INT, publisher TEXT, official_syllabus TEXT, public_curriculum TEXT, exam_mapping TEXT, objective_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_ref_concept ON kg_reference_sources(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_ref_subject ON kg_reference_sources(subject_id);
CREATE TABLE IF NOT EXISTS kg_syllabus_units ( id INT AUTO_INCREMENT PRIMARY KEY, subject_id TEXT NOT NULL, exam_id TEXT, unit_name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT, weight DOUBLE DEFAULT 1.0, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (subject_id, exam_id, slug) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_syllabus_subject ON kg_syllabus_units(subject_id);
CREATE INDEX IF NOT EXISTS ix_kg_syllabus_exam ON kg_syllabus_units(exam_id);
CREATE TABLE IF NOT EXISTS kg_learning_paths ( id INT AUTO_INCREMENT PRIMARY KEY, subject_id TEXT NOT NULL, exam_id TEXT, name TEXT NOT NULL, slug TEXT NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (subject_id, slug) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_path_subject ON kg_learning_paths(subject_id);
CREATE TABLE IF NOT EXISTS kg_learning_path_steps ( id INT AUTO_INCREMENT PRIMARY KEY, path_id INT NOT NULL, concept_id INT NOT NULL, step_order INT DEFAULT 0, UNIQUE (path_id, concept_id) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_pathstep_path ON kg_learning_path_steps(path_id);
CREATE TABLE IF NOT EXISTS kg_concept_statistics ( id INT AUTO_INCREMENT PRIMARY KEY, concept_id INT NOT NULL, micro_count INT DEFAULT 0, objective_count INT DEFAULT 0, blueprint_count INT DEFAULT 0, mcq_count INT DEFAULT 0, relation_count INT DEFAULT 0, depth_score DOUBLE DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (concept_id) ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_stat_concept ON kg_concept_statistics(concept_id);
CREATE TABLE IF NOT EXISTS kg_subject_statistics ( subject_id TEXT PRIMARY KEY, pack_version INT DEFAULT 0, concept_count INT DEFAULT 0, micro_count INT DEFAULT 0, objective_count INT DEFAULT 0, blueprint_count INT DEFAULT 0, relation_count INT DEFAULT 0, exam_map_count INT DEFAULT 0, reference_count INT DEFAULT 0, distractor_pool_count INT DEFAULT 0, depth_score DOUBLE DEFAULT 0, coverage_status TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS kg_concept_history ( id INT AUTO_INCREMENT PRIMARY KEY, concept_id INT, subject_id TEXT, action TEXT NOT NULL, detail TEXT, actor TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX IF NOT EXISTS ix_kg_hist_concept ON kg_concept_history(concept_id);
CREATE INDEX IF NOT EXISTS ix_kg_hist_subject ON kg_concept_history(subject_id);
CREATE TABLE IF NOT EXISTS kg_validation_reports ( id INT AUTO_INCREMENT PRIMARY KEY, run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, scope TEXT, score DOUBLE DEFAULT 0, issues_json TEXT, summary TEXT ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- ==== END PHASE 14 KNOWLEDGE GRAPH ====
