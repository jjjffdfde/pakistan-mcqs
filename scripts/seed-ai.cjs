/* ============================================================
   Phase 12 — AI learning engine: idempotent seeder
   Builds: current-affairs digest (daily/weekly/monthly/yearly),
   knowledge-graph concepts from tags, warm mock predictions,
   initial study plans, recommendations and achievements.
   Safe to re-run any time.
   ============================================================ */
"use strict";
const path = require("path");
const db = require(path.join(__dirname, "..", "db", "engine.js")).open();
const U = require(path.join(__dirname, "..", "ai", "util.js"));
const mock = require(path.join(__dirname, "..", "ai", "mock.js"));
const planner = require(path.join(__dirname, "..", "ai", "planner.js"));
const recommend = require(path.join(__dirname, "..", "ai", "recommend.js"));
const weak = require(path.join(__dirname, "..", "ai", "weak.js"));
const profile = require(path.join(__dirname, "..", "ai", "profile.js"));
const achievements = require(path.join(__dirname, "..", "ai", "achievements.js"));

const DEVICE = "default";
const counts = { ca: 0, concepts: 0, links: 0, predictions: 0, plans: 0, recs: 0, achievements: 0 };

/* ---------- 1. Current affairs digest ---------- */
function seedCurrentAffairs() {
  const topics = db.all(
    `SELECT t.id, t.name, COUNT(*) n FROM topics t
     JOIN mcqs m ON m.topic_id = t.id
     WHERE m.subject_id IN ('current-affairs','world-current-affairs','pakistan-affairs')
     GROUP BY t.id ORDER BY n DESC`
  );
  const catOf = (t) => {
    const n = (t.name || t.id || "").toLowerCase();
    return n.includes("pakistan") ? "pakistan" : "world";
  };
  const digest = (period, periodDate, rows) => {
    db.run("DELETE FROM current_affairs WHERE period=? AND period_date=?", [period, periodDate]);
    for (const r of rows) {
      const summary = [r.question, r.explanation].filter(Boolean).map((s) => String(s).replace(/\s+/g, " ").trim().slice(0, 300)).join(" ");
      db.run(
        `INSERT INTO current_affairs (period, period_date, category, title, summary, source_subject)
         VALUES (?,?,?,?,?,?)`,
        [period, periodDate, catOf(r), String(r.topic_name || r.topic_id).slice(0, 150), summary.slice(0, 800), r.subject_id || ""]
      );
      counts.ca++;
    }
  };
  const fresh = db.all(
    `SELECT m.id, m.question, m.explanation, m.created_at, t.name topic_name, m.subject_id
     FROM mcqs m LEFT JOIN topics t ON t.id = m.topic_id
     WHERE m.status='active' AND m.subject_id IN ('current-affairs','world-current-affairs','pakistan-affairs')
     ORDER BY m.created_at DESC, m.id DESC LIMIT 40`
  );
  const dailyRows = fresh.slice(0, 12);
  const weeklyRows = fresh.slice(0, 24);
  const monthlyRows = fresh.slice(0, 40);
  const yearlyRows = fresh.slice(0, 40);
  digest("daily", U.today(), dailyRows);
  digest("weekly", U.periodKey("weekly"), weeklyRows);
  digest("monthly", U.periodKey("monthly"), monthlyRows);
  digest("yearly", U.periodKey("yearly"), yearlyRows);
}

/* ---------- 2. Knowledge-graph concepts from tags ---------- */
function seedConcepts() {
  const topicRows = db.all(
    `SELECT t.id topic_id, COUNT(*) n FROM topics t
     JOIN mcqs m ON m.topic_id = t.id AND m.status='active'
     GROUP BY t.id HAVING n >= 10`
  );
  let concepts = 0;
  let links = 0;
  db.transaction(() => {
    db.run("DELETE FROM mcq_concepts");
    db.run("DELETE FROM concepts");
    const insConcept = db.prepare("INSERT OR IGNORE INTO concepts (topic_id, name, freq) VALUES (?,?,?)");
    const link = db.prepare("INSERT OR IGNORE INTO mcq_concepts (mcq_id, concept_id) VALUES (?,?)");
    for (const t of topicRows) {
      const tagRows = db.all(
        `SELECT tags FROM mcqs WHERE topic_id=? AND status='active' AND tags != '[]' LIMIT 600`,
        [t.topic_id]
      );
      const freq = new Map();
      for (const r of tagRows) {
        let tags = [];
        try { tags = JSON.parse(r.tags || "[]"); } catch (e) { continue; }
        for (const tag of tags) {
          const s = String(tag).trim();
          if (s.length >= 3 && s.length <= 40 && !/\d/.test(s)) freq.set(s, (freq.get(s) || 0) + 1);
        }
      }
      const top = [...freq.entries()].filter(([, f]) => f >= 3).sort((a, b) => b[1] - a[1]).slice(0, 12);
      const ids = [];
      for (const [name, f] of top) {
        const cid = db.get("SELECT id FROM concepts WHERE topic_id=? AND name=?", [t.topic_id, name]);
        if (cid) { ids.push(cid.id); continue; }
        const r = insConcept.run(t.topic_id, name, f);
        ids.push(r.lastInsertRowid);
        concepts++;
      }
      if (!ids.length) continue;
      for (const cid of ids) {
        const cname = db.get("SELECT name FROM concepts WHERE id=?", [cid]).name;
        const matches = db.all(
          `SELECT id FROM mcqs WHERE topic_id=? AND status='active' AND tags LIKE ? LIMIT 200`,
          [t.topic_id, '%"' + cname.replace(/"/g, "") + '"%']
        );
        for (const m of matches) { link.run(m.id, cid); links++; }
      }
    }
  });
  counts.concepts = concepts;
  counts.links = links;
}

/* ---------- 3. Warm mock predictions ---------- */
function seedPredictions() {
  const mocks = db.all(
    "SELECT id FROM mocktests WHERE status='active' ORDER BY total_questions DESC LIMIT 20"
  );
  for (const m of mocks) {
    const out = mock.predict(db, DEVICE, m.id);
    if (!out.error) counts.predictions++;
  }
}

/* ---------- 4. Plans, recommendations, profile, achievements ---------- */
function seedPlans() {
  profile.refresh(db, DEVICE);
  weak.rebuild(db, DEVICE);
  const out = planner.generate(db, DEVICE, 7);
  counts.plans = out.plans.length;
  const recs = recommend.build(db, DEVICE);
  counts.recs = recs.length;
  const unlocked = achievements.check(db, DEVICE).unlocked;
  counts.achievements = unlocked.length;
}

const marker = (k) => db.get("SELECT value FROM ai_state WHERE key=?", [k])?.value || "";
db.run("INSERT OR REPLACE INTO ai_state (key, value, built_at) VALUES ('seeded:current-affairs','1',datetime('now'))");

seedCurrentAffairs();
seedConcepts();
seedPredictions();
seedPlans();

console.log("seed complete:", JSON.stringify(counts));
console.log("ca sample:", db.get("SELECT period, period_date, category, title FROM current_affairs ORDER BY id LIMIT 3"));
console.log("concepts sample:", db.get("SELECT topic_id, name, freq FROM concepts ORDER BY freq DESC LIMIT 3"));
console.log("plan today:", (db.get("SELECT items_json FROM study_plans WHERE device_id='default' AND plan_type='daily' AND plan_date=?", [U.today()]) || {}).items_json || "none");
db.close();
