#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Database engine layer (Enterprise 2026)
   Auto-detects the engine from db/config.json and provides a
   uniform prepared-statement API over:
     - SQLite   (built-in node:sqlite, zero dependencies)
     - MySQL    (mysql2 driver, optional)
     - MariaDB  (mysql2 driver, optional)
     - Postgres (pg driver, optional)
   Usage:
     const db = require('./db/engine.js').open();
     db.all(sql, params) / db.get(sql, params) / db.run(sql, params)
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const CONFIG_FILE = path.join(__dirname, "config.json");

const DEFAULT_CONFIG = {
  engine: "sqlite",
  sqlite: { file: path.join(__dirname, "pakistan-mcqs.sqlite") },
  mysql: { host: "127.0.0.1", port: 3306, user: "root", password: "", database: "pakistan_mcqs" },
  postgres: { host: "127.0.0.1", port: 5432, user: "postgres", password: "", database: "pakistan_mcqs" }
};

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return Object.assign({}, DEFAULT_CONFIG, JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")));
  }
  return DEFAULT_CONFIG;
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf8");
}

/* ---------- Schema migrations (idempotent, run at open) ---------- */
function migrate(raw) {
  const cols = (t) => raw.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
  const mcqs = cols("mcqs");
  const add = (col, def) => { if (!mcqs.includes(col)) raw.exec(`ALTER TABLE mcqs ADD COLUMN ${col} ${def}`); };
  add("learning_objective", "TEXT");
  add("bloom_taxonomy", "TEXT DEFAULT 'Understand'");
  add("confidence_score", "REAL DEFAULT 0.9");
  add("estimated_time_sec", "INTEGER DEFAULT 40");
  add("memory_trick", "TEXT");
  add("exam_tip", "TEXT");
  add("explanation_why_wrong", "TEXT");
  /* 1M+ scale: composite status indexes + label index + history time */
  raw.exec("CREATE INDEX IF NOT EXISTS ix_mcqs_subject_status ON mcqs(subject_id, status)");
  raw.exec("CREATE INDEX IF NOT EXISTS ix_mcqs_chapter_status ON mcqs(chapter_id, status)");
  raw.exec("CREATE INDEX IF NOT EXISTS ix_mcqs_topic_status ON mcqs(topic_id, status)");
  raw.exec("CREATE INDEX IF NOT EXISTS ix_options_mcq_label ON options(mcq_id, label)");
  raw.exec("CREATE INDEX IF NOT EXISTS ix_history_device_time ON history(device_id, answered_at)");

  /* ---------- Phase 12: AI learning engine ---------- */
  const hist = cols("history");
  const hadd = (col, def) => { if (!hist.includes(col)) raw.exec(`ALTER TABLE history ADD COLUMN ${col} ${def}`); };
  hadd("time_taken_sec", "INTEGER DEFAULT 0");
  hadd("skipped", "INTEGER DEFAULT 0");
  hadd("session_id", "INTEGER DEFAULT 0");

  raw.exec(`CREATE TABLE IF NOT EXISTS user_profiles (
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
  )`);
  const uprof = cols("user_profiles");
  const uadd = (col, def) => { if (!uprof.includes(col)) raw.exec(`ALTER TABLE user_profiles ADD COLUMN ${col} ${def}`); };
  uadd("city", "TEXT DEFAULT ''");
  uadd("province", "TEXT DEFAULT ''");

  raw.exec(`CREATE TABLE IF NOT EXISTS learning_sessions (
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
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_sessions_device ON learning_sessions(device_id, started_at)");

  raw.exec(`CREATE TABLE IF NOT EXISTS weak_topics (
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
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_weak_priority ON weak_topics(device_id, priority)");

  raw.exec(`CREATE TABLE IF NOT EXISTS strong_topics (
    device_id     TEXT NOT NULL,
    topic_id      TEXT NOT NULL,
    subject_id    TEXT DEFAULT '',
    strength_score REAL DEFAULT 0,
    correct       INTEGER DEFAULT 0,
    total         INTEGER DEFAULT 0,
    streak        INTEGER DEFAULT 0,
    updated_at    TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (device_id, topic_id)
  )`);

  raw.exec(`CREATE TABLE IF NOT EXISTS study_plans (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    plan_date  TEXT NOT NULL,
    plan_type  TEXT DEFAULT 'daily',
    items_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_plans_device ON study_plans(device_id, plan_date)");

  raw.exec(`CREATE TABLE IF NOT EXISTS revision_schedule (
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
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_revision_due ON revision_schedule(device_id, status, due_date)");

  raw.exec(`CREATE TABLE IF NOT EXISTS flashcards (
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
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_flashcards_due ON flashcards(device_id, due_date)");

  raw.exec(`CREATE TABLE IF NOT EXISTS recommendations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    rec_type   TEXT NOT NULL,
    target_id  TEXT DEFAULT '',
    title      TEXT NOT NULL,
    reason     TEXT DEFAULT '',
    priority   INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    seen       INTEGER DEFAULT 0
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_recommendations_device ON recommendations(device_id, seen, priority)");

  raw.exec(`CREATE TABLE IF NOT EXISTS predictions (
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
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_predictions_device ON predictions(device_id, created_at)");

  raw.exec(`CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    type       TEXT DEFAULT 'info',
    title      TEXT NOT NULL,
    body       TEXT DEFAULT '',
    link       TEXT DEFAULT '',
    read       INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_notifications_device ON notifications(device_id, read)");

  raw.exec(`CREATE TABLE IF NOT EXISTS achievements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id  TEXT NOT NULL,
    code       TEXT NOT NULL,
    name       TEXT NOT NULL,
    value      REAL DEFAULT 0,
    unlocked_at TEXT DEFAULT (datetime('now')),
    UNIQUE (device_id, code)
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_achievements_device ON achievements(device_id)");

  raw.exec(`CREATE TABLE IF NOT EXISTS current_affairs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    period        TEXT NOT NULL,
    period_date   TEXT NOT NULL,
    category      TEXT DEFAULT 'pakistan',
    title         TEXT NOT NULL,
    summary       TEXT DEFAULT '',
    source_subject TEXT DEFAULT '',
    created_at    TEXT DEFAULT (datetime('now'))
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_ca_period ON current_affairs(period, period_date)");

  raw.exec(`CREATE TABLE IF NOT EXISTS concepts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id   TEXT NOT NULL,
    name       TEXT NOT NULL,
    freq       INTEGER DEFAULT 0,
    UNIQUE (topic_id, name)
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_concepts_topic ON concepts(topic_id)");

  raw.exec(`CREATE TABLE IF NOT EXISTS mcq_concepts (
    mcq_id     TEXT NOT NULL,
    concept_id INTEGER NOT NULL,
    PRIMARY KEY (mcq_id, concept_id)
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_mc_concept ON mcq_concepts(concept_id)");

  raw.exec(`CREATE TABLE IF NOT EXISTS leaderboard_periods (
    device_id  TEXT NOT NULL,
    period     TEXT NOT NULL,
    period_key TEXT NOT NULL,
    points     INTEGER DEFAULT 0,
    correct    INTEGER DEFAULT 0,
    total      INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (device_id, period, period_key)
  )`);
  raw.exec("CREATE INDEX IF NOT EXISTS ix_lb_period ON leaderboard_periods(period, period_key, points DESC)");

  raw.exec(`CREATE TABLE IF NOT EXISTS ai_state (
    key   TEXT PRIMARY KEY,
    value TEXT DEFAULT '',
    built_at TEXT DEFAULT (datetime('now'))
  )`);

  /* ---------- Phase 14: Enterprise Knowledge Graph (isolated, kg_* namespace) ----------
     Additive + reversible; creates structure only (no rows). See db/kg-migrate.js
     and docs/PHASE14-KNOWLEDGE-ARCHITECTURE.md. */
  try {
    require("./kg-migrate.js").migrateKnowledgeGraph(raw);
  } catch (e) {
    /* never block core open() on the KG layer */
    console.error("[engine] knowledge-graph migration skipped:", e.message);
  }
}

/* ---------- SQLite (zero dependencies) ---------- */
function openSqlite(cfg) {
  const { DatabaseSync } = require("node:sqlite");
  fs.mkdirSync(path.dirname(cfg.file), { recursive: true });
  const raw = new DatabaseSync(cfg.file);
  raw.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  migrate(raw);
  const db = {
    kind: "sqlite",
    raw,
    all(sql, params = []) {
      return raw.prepare(sql).all(...params);
    },
    get(sql, params = []) {
      return raw.prepare(sql).get(...params);
    },
    run(sql, params = []) {
      const r = raw.prepare(sql).run(...params);
      return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
    },
    exec(sql) {
      raw.exec(sql);
    },
    prepare(sql) {
      return raw.prepare(sql);
    },
    transaction(fn) {
      raw.exec("BEGIN");
      try {
        const out = fn();
        raw.exec("COMMIT");
        return out;
      } catch (e) {
        raw.exec("ROLLBACK");
        throw e;
      }
    },
    close() {
      raw.close();
    }
  };
  return db;
}

/* ---------- MySQL / MariaDB (mysql2 optional driver) ---------- */
async function openMysql(cfg) {
  let mysql;
  try {
    mysql = require("mysql2/promise");
  } catch (e) {
    throw new Error("mysql2 driver not installed. Run: npm install mysql2  (for MySQL/MariaDB support)");
  }
  const conn = await mysql.createConnection(cfg);
  await conn.query("SET NAMES utf8mb4");
  const db = {
    kind: "mysql",
    raw: conn,
    async all(sql, params = []) {
      const [rows] = await conn.query(sql, params);
      return rows;
    },
    async get(sql, params = []) {
      const rows = await this.all(sql, params);
      return rows[0];
    },
    async run(sql, params = []) {
      const [r] = await conn.query(sql, params);
      return { changes: r.affectedRows, lastInsertRowid: Number(r.insertId) };
    },
    async exec(sql) {
      await conn.query(sql);
    },
    async transaction(fn) {
      await conn.beginTransaction();
      try {
        const out = await fn();
        await conn.commit();
        return out;
      } catch (e) {
        await conn.rollback();
        throw e;
      }
    },
    async close() {
      await conn.end();
    }
  };
  return db;
}

/* ---------- PostgreSQL (pg optional driver) ---------- */
async function openPostgres(cfg) {
  let pg;
  try {
    pg = require("pg");
  } catch (e) {
    throw new Error("pg driver not installed. Run: npm install pg  (for PostgreSQL support)");
  }
  const { Client } = pg;
  const client = new Client(cfg);
  await client.connect();
  const db = {
    kind: "postgres",
    raw: client,
    all: (sql, params = []) => client.query(sql, params).then((r) => r.rows),
    get: (sql, params = []) => client.query(sql, params).then((r) => r.rows[0]),
    run: async (sql, params = []) => {
      const r = await client.query(sql, params);
      return { changes: r.rowCount, lastInsertRowid: null };
    },
    exec: (sql) => client.query(sql),
    async transaction(fn) {
      await client.query("BEGIN");
      try {
        const out = await fn();
        await client.query("COMMIT");
        return out;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    },
    close: () => client.end()
  };
  return db;
}

/* ---------- Public API ---------- */
function open() {
  const cfg = loadConfig();
  switch (cfg.engine) {
    case "sqlite": return openSqlite(cfg.sqlite);
    case "mysql":
    case "mariadb": return openMysql(Object.assign({}, cfg.mysql, { database: cfg.mysql.database }));
    case "postgres":
    case "postgresql": return openPostgres(cfg.postgres);
    default: throw new Error(`Unknown DB engine "${cfg.engine}" in db/config.json (use sqlite | mysql | mariadb | postgres)`);
  }
}

module.exports = { open, loadConfig, saveConfig };
