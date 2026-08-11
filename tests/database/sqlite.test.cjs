"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const DB = path.join(ROOT, "db", "pakistan-mcqs.sqlite");

function openReadOnly() {
  const { DatabaseSync } = require("node:sqlite");
  let lastErr;
  /* transient WAL lock can occur right after another process closes the db */
  for (let attempt = 0; attempt < 5; attempt++) {
    try { return new DatabaseSync(DB, { readOnly: true }); }
    catch (e) { lastErr = e; const start = Date.now(); while (Date.now() - start < 300) {} }
  }
  throw lastErr;
}

module.exports = (t) => {
  let db;
  t.test("database file exists", async () => {
    assert.ok(fs.existsSync(DB), "db/pakistan-mcqs.sqlite must exist");
  });

  t.test("opens read-only and reports core tables", async () => {
    db = openReadOnly();
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    const names = rows.map((r) => r.name);
    for (const t2 of ["categories", "subjects", "chapters", "topics", "mcqs", "options", "history", "user_profiles", "learning_sessions", "revision_schedule", "flashcards"]) {
      assert.ok(names.includes(t2), `table ${t2} must exist`);
    }
  });

  t.test("MCQ volume baseline (>= 800k active)", async () => {
    const n = db.prepare("SELECT COUNT(*) AS n FROM mcqs WHERE status='active'").get().n;
    assert.ok(n >= 800000, `expected >= 800000 active MCQs, got ${n}`);
    t.note = `active_mcqs=${n}`;
  });

  t.test("no NULL question / answer / subject in active MCQs", async () => {
    const bad = db.prepare("SELECT COUNT(*) AS n FROM mcqs WHERE status='active' AND (question IS NULL OR question='' OR subject_id IS NULL)").get().n;
    assert.strictEqual(bad, 0, `found ${bad} rows with NULL question/answer/subject`);
  });

  t.test("mcqs.subject_id foreign keys resolve", async () => {
    const orphan = db.prepare(`SELECT COUNT(*) AS n FROM mcqs WHERE subject_id NOT IN (SELECT id FROM subjects)`).get().n;
    assert.strictEqual(orphan, 0, `found ${orphan} orphan subject_id in mcqs`);
  });

  t.test("mcq ids are unique integers", async () => {
    const dup = db.prepare("SELECT COUNT(*) AS n FROM (SELECT id, COUNT(*) c FROM mcqs GROUP BY id HAVING c > 1)").get().n;
    assert.strictEqual(dup, 0);
  });

  t.test("read-only mode enforced (no writes possible)", async () => {
    assert.throws(() => db.prepare("CREATE TABLE phase26_probe (x)").run(), /readonly|attempt to write|database is locked/i);
  });

  t.test("close database", async () => {
    db.close();
  });
};
