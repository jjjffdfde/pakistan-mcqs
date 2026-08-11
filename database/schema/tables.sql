CREATE TABLE achievements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    code       TEXT NOT NULL,
    name       TEXT NOT NULL,
    value      REAL DEFAULT 0,
    unlocked_at TEXT DEFAULT (datetime('now')),
    UNIQUE (device_id, code)
  );

CREATE TABLE ai_state (
    key   TEXT PRIMARY KEY,
    value TEXT DEFAULT '',
    built_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE analytics (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT DEFAULT '',
  event      TEXT NOT NULL,
  payload    TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE bookmarks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id  TEXT NOT NULL,
  mcq_id     TEXT NOT NULL REFERENCES mcqs(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (device_id, mcq_id)
);

CREATE TABLE categories (
  id          TEXT PRIMARY KEY,          -- slug id, e.g. 'computer-it'
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE chapters (
  id          TEXT PRIMARY KEY,          -- e.g. 'py-basics'
  subject_id  TEXT NOT NULL REFERENCES subjects(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  UNIQUE (subject_id, slug)
);

CREATE TABLE concepts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id   TEXT NOT NULL,
    name       TEXT NOT NULL,
    freq       INTEGER DEFAULT 0,
    UNIQUE (topic_id, name)
  );

CREATE TABLE current_affairs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    period        TEXT NOT NULL,
    period_date   TEXT NOT NULL,
    category      TEXT DEFAULT 'pakistan',
    title         TEXT NOT NULL,
    summary       TEXT DEFAULT '',
    source_subject TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE flashcards (
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

CREATE TABLE history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT NOT NULL,
  mcq_id      TEXT NOT NULL REFERENCES mcqs(id),
  correct     INTEGER NOT NULL DEFAULT 0,
  points      INTEGER NOT NULL DEFAULT 0,
  mode        TEXT DEFAULT 'practice',
  answered_at TEXT DEFAULT (datetime('now'))
, time_taken_sec INTEGER DEFAULT 0, skipped INTEGER DEFAULT 0, session_id INTEGER DEFAULT 0);

CREATE TABLE kg_concept_history (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER REFERENCES kg_concepts(id),
       subject_id    TEXT REFERENCES subjects(id),
       action        TEXT NOT NULL,   -- created | updated | merged | deleted | validated
       detail        TEXT DEFAULT '',
       actor         TEXT DEFAULT 'kg-engine',
       created_at    TEXT DEFAULT (datetime('now'))
     );

CREATE TABLE kg_concept_relations (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       from_concept  INTEGER NOT NULL REFERENCES kg_concepts(id),
       to_concept    INTEGER NOT NULL REFERENCES kg_concepts(id),
       relation_type TEXT NOT NULL,   -- parent | child | related | depends_on
       weight        REAL DEFAULT 1.0,
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (from_concept, to_concept, relation_type)
     );

CREATE TABLE kg_concept_statistics (
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
     );

CREATE TABLE kg_concepts (
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
     );

CREATE TABLE kg_difficulty_profiles (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       easy_pct      REAL DEFAULT 0,
       medium_pct    REAL DEFAULT 0,
       hard_pct      REAL DEFAULT 0,
       avg_time_sec  INTEGER DEFAULT 40,
       cognitive_load TEXT DEFAULT 'medium',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id)
     );

CREATE TABLE kg_distractor_items (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       pool_id       INTEGER NOT NULL REFERENCES kg_distractor_pools(id),
       value         TEXT NOT NULL,
       note          TEXT DEFAULT '',
       UNIQUE (pool_id, value)
     );

CREATE TABLE kg_distractor_pools (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       concept_id    INTEGER REFERENCES kg_concepts(id),
       category      TEXT NOT NULL,   -- the semantic class; only same-category items mix
       description   TEXT DEFAULT '',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, category)
     );

CREATE TABLE kg_exam_mappings (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       exam_id       TEXT NOT NULL,
       subject_id    TEXT REFERENCES subjects(id),
       concept_id    INTEGER REFERENCES kg_concepts(id),
       objective_id  INTEGER REFERENCES kg_learning_objectives(id),
       weight        REAL DEFAULT 1.0,
       frequency     INTEGER DEFAULT 0,
       created_at    TEXT DEFAULT (datetime('now'))
     );

CREATE TABLE kg_knowledge_packs (
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
     );

CREATE TABLE kg_learning_objectives (
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
     );

CREATE TABLE kg_learning_path_steps (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       path_id       INTEGER NOT NULL REFERENCES kg_learning_paths(id),
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       step_order    INTEGER DEFAULT 0,
       UNIQUE (path_id, concept_id)
     );

CREATE TABLE kg_learning_paths (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       subject_id    TEXT NOT NULL REFERENCES subjects(id),
       exam_id       TEXT DEFAULT '',
       name          TEXT NOT NULL,
       slug          TEXT NOT NULL,
       description   TEXT DEFAULT '',
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (subject_id, slug)
     );

CREATE TABLE kg_micro_concepts (
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
     );

CREATE TABLE kg_pending_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_type TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT,
    subject_id TEXT,
    action TEXT NOT NULL,
    rationale TEXT DEFAULT '',
    proposed_sql TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    reviewed_by TEXT DEFAULT '',
    reviewed_at TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE kg_prerequisites (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       concept_id    INTEGER NOT NULL REFERENCES kg_concepts(id),
       requires_id   INTEGER NOT NULL REFERENCES kg_concepts(id),
       strength      REAL DEFAULT 1.0,
       created_at    TEXT DEFAULT (datetime('now')),
       UNIQUE (concept_id, requires_id)
     );

CREATE TABLE kg_question_blueprints (
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
     );

CREATE TABLE kg_reference_sources (
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
     );

CREATE TABLE kg_subject_statistics (
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
     );

CREATE TABLE kg_syllabus_units (
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
     );

CREATE TABLE kg_validation_reports (
       id            INTEGER PRIMARY KEY AUTOINCREMENT,
       run_at        TEXT DEFAULT (datetime('now')),
       scope         TEXT DEFAULT 'all',
       score         REAL DEFAULT 0,
       issues_json   TEXT DEFAULT '{}',
       summary       TEXT DEFAULT ''
     );

CREATE TABLE leaderboard (
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

CREATE TABLE leaderboard_periods (
    device_id  TEXT NOT NULL,
    period     TEXT NOT NULL,
    period_key TEXT NOT NULL,
    points     INTEGER DEFAULT 0,
    correct    INTEGER DEFAULT 0,
    total      INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (device_id, period, period_key)
  );

CREATE TABLE learning_sessions (
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

CREATE TABLE mcq_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT,
    entity_id TEXT,
    action TEXT,
    actor_id TEXT,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TEXT
  );

CREATE TABLE mcq_concepts (
    mcq_id     TEXT NOT NULL,
    concept_id INTEGER NOT NULL,
    PRIMARY KEY (mcq_id, concept_id)
  );

CREATE TABLE mcq_generation_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mcq_id TEXT UNIQUE,
  subject_id TEXT,
  chapter_id TEXT,
  topic_id TEXT,
  subtopic_id INTEGER,
  concept_id INTEGER,
  blueprint_id INTEGER,
  learning_objective_id INTEGER,
  distractor_pool_id INTEGER,
  pattern_id TEXT,
  exam_mapping_id INTEGER,
  question TEXT,
  correct_answer TEXT,
  options_json TEXT,
  difficulty TEXT,
  bloom_taxonomy TEXT,
  explanation TEXT,
  explanation_why_wrong TEXT,
  confidence_score REAL,
  generation_source TEXT,
  status TEXT DEFAULT 'pending_review',
  rejection_reason TEXT,
  evidence_json TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE mcq_releases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    release_id TEXT UNIQUE,
    name TEXT,
    item_count INTEGER,
    published_count INTEGER,
    subjects_json TEXT,
    status TEXT,
    created_at TEXT
  );

CREATE TABLE mcq_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id INTEGER,
    mcq_id TEXT,
    reviewer_id TEXT,
    reviewer_name TEXT,
    subject_id TEXT,
    status TEXT,
    comments TEXT,
    assigned_at TEXT,
    reviewed_at TEXT
  );

CREATE TABLE mcq_rollback_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rollback_id TEXT UNIQUE,
    release_id TEXT,
    mcq_id TEXT,
    action_taken TEXT,
    previous_state_json TEXT,
    created_at TEXT
  );

CREATE TABLE mcq_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mcq_id TEXT,
    version TEXT,
    stage TEXT,
    content_json TEXT,
    rollback_point_id TEXT,
    created_at TEXT
  );

CREATE TABLE mcqs (
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
, learning_objective TEXT, bloom_taxonomy TEXT DEFAULT 'Understand', confidence_score REAL DEFAULT 0.9, estimated_time_sec INTEGER DEFAULT 40, memory_trick TEXT, exam_tip TEXT, explanation_why_wrong TEXT);

CREATE VIRTUAL TABLE mcqs_fts USING fts5(
  question, explanation, tags,
  content='mcqs', content_rowid='rowid',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TABLE mocktests (
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

CREATE TABLE notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    type       TEXT DEFAULT 'info',
    title      TEXT NOT NULL,
    body       TEXT DEFAULT '',
    link       TEXT DEFAULT '',
    read       INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE options (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  mcq_id   TEXT NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
  label    TEXT NOT NULL CHECK (label IN ('A','B','C','D')),
  text     TEXT NOT NULL,
  UNIQUE (mcq_id, label)
);

CREATE TABLE pastpapers (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  exam_id         TEXT DEFAULT '',
  year            INTEGER,
  subject_ids     TEXT DEFAULT '',
  total_questions INTEGER DEFAULT 0,
  duration_mins   INTEGER DEFAULT 0,
  file            TEXT DEFAULT '',
  question_ids    TEXT DEFAULT '[]',
  created_at      TEXT DEFAULT (datetime('now'))
, pattern INTEGER DEFAULT 0);

CREATE TABLE pipeline_state (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE predictions (
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

CREATE TABLE quizzes (
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

CREATE TABLE recommendations (
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

CREATE TABLE references_tbl (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  mcq_id     TEXT REFERENCES mcqs(id),
  subject_id TEXT REFERENCES subjects(id),
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  kind       TEXT DEFAULT 'documentation'
);

CREATE TABLE revision_schedule (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id     TEXT NOT NULL,
    mcq_id        TEXT NOT NULL,
    topic_id      TEXT DEFAULT '',
    box           INTEGER DEFAULT 1,
    ease          REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    due_date      TEXT DEFAULT (datetime('now')),
    last_review   TEXT DEFAULT '',
    next_review   TEXT DEFAULT '',
    reviews       INTEGER DEFAULT 0,
    status        TEXT DEFAULT 'active',
    UNIQUE (device_id, mcq_id)
  );

CREATE TABLE strong_topics (
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

CREATE TABLE study_plans (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    plan_date  TEXT NOT NULL,
    plan_type  TEXT DEFAULT 'daily',
    items_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );

CREATE TABLE subjects (
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

CREATE TABLE subtopics (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id  TEXT NOT NULL REFERENCES topics(id),
  name      TEXT NOT NULL,
  UNIQUE (topic_id, name)
);

CREATE TABLE topics (
  id          TEXT PRIMARY KEY,          -- e.g. 't-7' or slug
  chapter_id  TEXT NOT NULL REFERENCES chapters(id),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  UNIQUE (chapter_id, slug)
);

CREATE TABLE user_profiles (
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
    last_active    TEXT DEFAULT '',
    created_at     TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now'))
  , city TEXT DEFAULT '', province TEXT DEFAULT '');

CREATE TABLE weak_topics (
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
