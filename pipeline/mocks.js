#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Mock Test Engine (Enterprise)
   Auto-generates mock tests from the live bank:
     - per-exam full-length tests   (exam subject mix, 100q)
     - per-subject tests            (50q, subjects >= 1000 MCQs)
     - per-topic tests              (15q, topics >= 50 MCQs)
     - mixed general test
   Idempotent (ON CONFLICT DO NOTHING). Re-run to expand as the
   bank grows.
   Usage: node pipeline/mocks.js
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

function main() {
  const db = open();
  const exams = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "exams.json"), "utf8")).map((e) => ({ id: e.id, name: e.name }));
  const subjects = db.all("SELECT id, name, exam_ids FROM subjects WHERE status='active' ORDER BY sort_order, id");
  const examNames = Object.fromEntries(exams.map((e) => [e.id, e.name]));
  const nameOf = (id) => subjects.find((s) => s.id === id)?.name || id;

  let added = 0;

  /* ---- 1. per-exam full-length (100q / 90 min, negative marking on) ---- */
  for (const e of exams) {
    const subs = subjects.filter((s) => (s.exam_ids || "").split(",").includes(e.id));
    const pool = subs.filter((s) => db.get("SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'", [s.id]).n >= 10);
    if (pool.length < 3) continue;
    const id = `mock-exam-${e.id}`;
    const r = db.run(`INSERT INTO mocktests (id,title,exam_id,subject_ids,difficulty,total_questions,duration_mins,negative_marking,status)
      VALUES (?,?,?,?,?,100,90,1,'active') ON CONFLICT(id) DO NOTHING`,
      [id, `${examNames[e.id]} Full-Length Mock Test`, e.id, pool.map((s) => s.id).join(","), "mixed"]);
    added += r.changes;
  }

  /* ---- 2. per-subject tests (50q / 45 min) ---- */
  for (const s of subjects) {
    const n = db.get("SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'", [s.id]).n;
    if (n < 1000) continue;
    const id = `mock-sub-${s.id}`;
    const r = db.run(`INSERT INTO mocktests (id,title,subject_ids,difficulty,total_questions,duration_mins,negative_marking,status)
      VALUES (?,?,?,?,50,45,1,'active') ON CONFLICT(id) DO NOTHING`,
      [id, `${nameOf(s.id)} — Subject Mock Test`, s.id, "mixed"]);
    added += r.changes;
  }

  /* ---- 3. per-topic tests (15q / 15 min) ---- */
  const topics = db.all(`SELECT t.id, t.name, t.chapter_id, c.subject_id FROM topics t JOIN chapters c ON c.id=t.chapter_id
    WHERE (SELECT COUNT(*) FROM mcqs m WHERE m.topic_id=t.id AND m.status='active') >= 50 ORDER BY t.id`);
  for (const t of topics) {
    const id = `mock-topic-${slug(t.id).slice(0, 50)}`;
    const r = db.run(`INSERT INTO mocktests (id,title,subject_ids,difficulty,total_questions,duration_mins,negative_marking,status)
      VALUES (?,?,?,?,15,15,0,'active') ON CONFLICT(id) DO NOTHING`,
      [id, `${nameOf(t.subject_id)}: ${t.name} — Topic Test`, t.subject_id, "medium"]);
    added += r.changes;
  }

  /* ---- 4. mixed general (50q / 45 min, all active subjects) ---- */
  const allActive = db.all("SELECT id FROM subjects WHERE status='active' ORDER BY id").map((s) => s.id).join(",");
  const r = db.run(`INSERT INTO mocktests (id,title,subject_ids,difficulty,total_questions,duration_mins,negative_marking,status)
    VALUES ('mock-mixed-general','Mixed General Knowledge — Mock Test',?, 'mixed',50,45,1,'active') ON CONFLICT(id) DO NOTHING`, [allActive]);
  added += r.changes;

  const n = db.get("SELECT COUNT(*) n FROM mocktests").n;
  console.log(`Mock Test Engine: +${added} new (total ${n} mock tests).`);
  db.close();
}

main();
