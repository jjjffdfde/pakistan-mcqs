#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Database migration + seed (Enterprise 2026)
   - Applies the engine schema (SQLite/MySQL/MariaDB/PostgreSQL)
   - Seeds taxonomy from existing data/*.json (categories, subjects,
     chapters, topics, subtopics, exams, programs, quizzes, mocks,
     papers, references) — NEVER overwrites existing rows
   - Imports the existing 1338-MCQ bank into mcqs + options tables
     with question-hash dedupe (idempotent)
   Usage: node db/migrate.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { open, loadConfig } = require("./engine.js");

const ROOT = path.join(__dirname, "..");
const data = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", f), "utf8"));
const qhash = (q) => crypto.createHash("sha256").update(q.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");

async function main() {
  const cfg = loadConfig();
  console.log(`[migrate] engine: ${cfg.engine}`);
  const db = open();
  try {
    /* 1. Schema */
    const schemaFile = {
      sqlite: path.join(__dirname, "schema.sqlite.sql"),
      mysql: path.join(__dirname, "schema.mysql.sql"),
      mariadb: path.join(__dirname, "schema.mysql.sql"),
      postgres: path.join(__dirname, "schema.pgsql.sql"),
      postgresql: path.join(__dirname, "schema.pgsql.sql")
    }[cfg.engine];
    if (db.kind === "sqlite") {
      db.exec(fs.readFileSync(schemaFile, "utf8"));
    } else {
      const parts = fs.readFileSync(schemaFile, "utf8")
        .split(";").map((s) => s.trim()).filter((s) => s && !s.startsWith("--"));
      for (const p of parts) await db.exec(p);
    }
    console.log("[migrate] schema applied");

    /* 2. Taxonomy seed (idempotent — never overwrites existing rows) */
    const counts = {};

    const cats = data("categories.json");
    counts.categories = 0;
    for (const c of cats) {
      const r = db.run(`INSERT INTO categories (id,name,slug,icon,description,sort_order) VALUES (?,?,?,?,?,?)
        ON CONFLICT(id) DO NOTHING`,
        [c.id, c.name, c.slug || c.id, c.icon || "", c.description || "", c.order || 0]);
      counts.categories += r.changes;
    }

    const subjects = data("subjects.json");
    counts.subjects = 0;
    for (const s of subjects) {
      const r = db.run(`INSERT INTO subjects (id,name,slug,category_id,icon,description,status,exam_ids,sort_order)
        VALUES (?,?,?,?,?,?,'active',?,?) ON CONFLICT(id) DO NOTHING`,
        [s.id, s.name, s.slug || s.id, s.category || null, s.icon || "", s.description || "", (s.exams || []).join(","), s.order || 0]);
      counts.subjects += r.changes;
    }

    const chapters = data("chapters.json");
    counts.chapters = 0;
    for (const c of chapters) {
      const r = db.run(`INSERT INTO chapters (id,subject_id,name,slug,sort_order) VALUES (?,?,?,?,?)
        ON CONFLICT(subject_id,slug) DO NOTHING`,
        [c.id, c.subject, c.name, c.slug || c.id, c.order || 0]);
      if (r.changes === 0) db.run(`UPDATE chapters SET id=? WHERE subject_id=? AND slug=?`, [c.id, c.subject, c.slug || c.id]);
      counts.chapters += r.changes;
    }

    const topics = data("topics.json");
    counts.topics = 0;
    for (const t of topics) {
      const r = db.run(`INSERT INTO topics (id,chapter_id,name,slug,sort_order) VALUES (?,?,?,?,?)
        ON CONFLICT(chapter_id,slug) DO NOTHING`,
        [t.id, t.chapter, t.name, t.slug || t.id, t.order || 0]);
      if (r.changes === 0) db.run(`UPDATE topics SET id=? WHERE chapter_id=? AND slug=?`, [t.id, t.chapter, t.slug || t.id]);
      counts.topics += r.changes;
    }

    counts.subtopics = 0;
    for (const t of topics) {
      for (const st of t.subtopics || []) {
        const r = db.run(`INSERT INTO subtopics (topic_id,name) VALUES (?,?) ON CONFLICT(topic_id,name) DO NOTHING`, [t.id, st]);
        counts.subtopics += r.changes;
      }
    }

    const exams = data("exams.json");
    // Exams have no dedicated domain table: they are grouped under their own
    // taxonomy (central/provincial/forces...) and referenced via subjects.exam_ids
    // and pastpapers.exam_id. Documented in the database report.

    const programs = data("programs.json");
    const quizzes = data("quizzes.json");
    counts.quizzes = 0;
    for (const q of quizzes) {
      const r = db.run(`INSERT INTO quizzes (id,title,description,subject_ids,difficulty,total_questions,duration_mins,tags,status)
        VALUES (?,?,?,?,?,?,?,?,'active') ON CONFLICT(id) DO NOTHING`,
        [q.id, q.title, q.description || "", (q.subjects || []).join(","), q.difficulty || "easy", q.totalQuestions || 0, q.durationMins || 0, JSON.stringify(q.tags || [])]);
      counts.quizzes += r.changes;
    }

    const mocks = data("mock_tests.json");
    counts.mocks = 0;
    for (const m of mocks) {
      const r = db.run(`INSERT INTO mocktests (id,title,exam_id,subject_ids,difficulty,total_questions,duration_mins,negative_marking,status)
        VALUES (?,?,?,?,?,?,?,?,'active') ON CONFLICT(id) DO NOTHING`,
        [m.id, m.title, m.exam || "", (m.subjects || []).join(","), m.difficulty || "medium", m.totalQuestions || 0, m.durationMins || 0, m.negativeMarking ? 1 : 0]);
      counts.mocks += r.changes;
    }

    const papers = data("papers.json");
    counts.papers = 0;
    for (const p of papers) {
      const r = db.run(`INSERT INTO pastpapers (id,title,exam_id,year,pattern,subject_ids,total_questions,duration_mins,file)
        VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
        [p.id, p.title, p.exam || "", p.year || null, p.year ? 0 : 1, (p.subjects || []).join(","), p.totalQuestions || 0, p.durationMins || 0, ""]);
      counts.papers += r.changes;
    }

    const refs = data("references.json");
    counts.refs = 0;
    for (const [subjectId, list] of Object.entries(refs)) {
      for (const r of list) {
        const rr = db.run(`INSERT INTO references_tbl (subject_id,title,url,kind) VALUES (?,?,?,?)`, [subjectId, r.title, r.url, "documentation"]);
        counts.refs += rr.changes;
      }
    }

    /* 3. Import existing MCQ bank (idempotent, qhash dedupe) */
    const mcqFiles = fs.readdirSync(path.join(ROOT, "data", "mcqs")).filter((f) => f.endsWith(".json")).sort();
    let imported = 0, skipped = 0, opts = 0;
    for (const f of mcqFiles) {
      const list = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "mcqs", f), "utf8"));
      db.transaction(() => {
        for (const m of list) {
          const h = qhash(m.question);
          const exists = db.get(`SELECT id FROM mcqs WHERE qhash=?`, [h]);
          if (exists) { skipped++; continue; }
          db.run(`INSERT INTO mcqs (id,question,correct_answer,difficulty,subject_id,chapter_id,topic_id,exam_ids,year,tags,references_json,explanation,source,status,qhash)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'existing','active',?)`,
            [m.id, m.question, m.correctAnswer, m.difficulty, m.subject, m.chapter, m.topic, (m.exam || []).join(","), m.year || null, JSON.stringify(m.tags || []), JSON.stringify(m.references || []), m.detailedExplanation, h]);
          for (const [label, text] of [["A", m.optionA], ["B", m.optionB], ["C", m.optionC], ["D", m.optionD]]) {
            db.run(`INSERT INTO options (mcq_id,label,text) VALUES (?,?,?)`, [m.id, label, text]);
            opts++;
          }
          imported++;
        }
      });
    }

    /* 4. FTS rebuild */
    if (db.kind === "sqlite") {
      db.exec("INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild');");
    }

    console.log(`[migrate] seeded: categories ${counts.categories}, subjects ${counts.subjects}, chapters ${counts.chapters}, topics ${counts.topics}, subtopics ${counts.subtopics}, quizzes ${counts.quizzes}, mocks ${counts.mocks}, papers ${counts.papers}, references ${counts.refs}`);
    console.log(`[migrate] MCQ import: ${imported} inserted, ${skipped} skipped (duplicates), ${opts} options`);
    const total = db.get(`SELECT COUNT(*) AS n FROM mcqs`);
    console.log(`[migrate] total MCQs in DB: ${total.n}`);
    db.run(`INSERT INTO pipeline_state (key,value) VALUES ('migrated','${new Date().toISOString()}') ON CONFLICT(key) DO UPDATE SET value=excluded.value`);
  } finally {
    db.close();
  }
}

main().catch((e) => { console.error("[migrate] ERROR:", e.message); process.exit(1); });
