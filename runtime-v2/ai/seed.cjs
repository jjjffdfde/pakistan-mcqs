/* runtime-v2/ai/seed.cjs — idempotent seeder, file-backed.
   Port of scripts/seed-ai.cjs:
     1. current-affairs digest  -> database/data/ai/current_affairs.ndjson.gz
        (rebuilt from the NDJSON mcq parts; knowledge-graph concepts are
        already public NDJSON data and need no seeding in the file world)
     2. warm mock predictions   -> predictions store
     3. plans/recommendations/profile/achievements for the default device
   Safe to re-run any time. */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const L = require("../data-loader.cjs");
const Q = require("../query-engine.cjs");
const U = require("./util.cjs");
const S = require("./store.cjs");
const mock = require("./mock.cjs");
const planner = require("./planner.cjs");
const recommend = require("./recommend.cjs");
const weak = require("./weak.cjs");
const profile = require("./profile.cjs");
const achievements = require("./achievements.cjs");

const DEVICE = "default";
const counts = { ca: 0, concepts: 0, links: 0, predictions: 0, plans: 0, recs: 0, achievements: 0 };
const CA_SUBJECTS = ["current-affairs", "world-current-affairs", "pakistan-affairs"];

function catOf(name) {
  const n = String(name || "").toLowerCase();
  return n.includes("pakistan") ? "pakistan" : "world";
}

async function caSource() {
  const topics = (await Q.topics()).reduce((m, t) => (m[t.id] = t, m), {});
  const rows = [];
  for (const sub of Object.keys(L.manifest().sourceFiles)) {
    if (!CA_SUBJECTS.includes(sub)) continue;
    await L.streamSubject(sub, (row) => {
      if (row && row.status === "active") {
        rows.push({
          id: row.id, question: row.question, explanation: row.explanation,
          created_at: row.created_at, topic_name: topics[row.topic_id] ? topics[row.topic_id].name : null,
          subject_id: row.subject_id
        });
      }
    });
  }
  rows.sort((a, b) =>
    (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 :
      (a.id < b.id ? 1 : -1)));
  return rows;
}

function digestRows(period, periodDate, rows) {
  const dRows = [];
  for (const r of rows) {
    const summary = [r.question, r.explanation].filter(Boolean)
      .map((s) => String(s).replace(/\s+/g, " ").trim().slice(0, 300)).join(" ");
    dRows.push({
      period, period_date: periodDate, category: catOf(r),
      title: String(r.topic_name || r.topic_id).slice(0, 150),
      summary: summary.slice(0, 800), source_subject: r.subject_id || ""
    });
  }
  return dRows;
}

async function seedCurrentAffairs() {
  const fresh = await caSource();
  const daily = digestRows("daily", U.today(), fresh.slice(0, 12));
  const weekly = digestRows("weekly", U.periodKey("weekly"), fresh.slice(0, 24));
  const monthly = digestRows("monthly", U.periodKey("monthly"), fresh.slice(0, 40));
  const yearly = digestRows("yearly", U.periodKey("yearly"), fresh.slice(0, 40));
  const all = [...daily, ...weekly, ...monthly, ...yearly].map((r, i) => ({ id: i + 1, ...r }));
  counts.ca = all.length;

  const file = path.join(L.SRC_DIR, "ai", "current_affairs.ndjson.gz");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const gz = zlib.createGzip();
  const w = fs.createWriteStream(file);
  await new Promise((resolve, reject) => {
    gz.on("error", reject); w.on("error", reject); w.on("close", resolve);
    gz.pipe(w);
    for (const row of all) gz.write(JSON.stringify(row) + "\n");
    gz.end();
  });
}

async function seedPredictions() {
  const mocks = (await Q.mocktests())
    .filter((m) => m.status === "active")
    .sort((a, b) => (b.total_questions || 0) - (a.total_questions || 0))
    .slice(0, 20);
  for (const m of mocks) {
    const out = await mock.predict(DEVICE, m.id);
    if (!out.error) counts.predictions++;
  }
}

async function seedPlans() {
  await profile.refresh(DEVICE);
  await weak.rebuild(DEVICE);
  const out = await planner.generate(DEVICE, 7);
  counts.plans = out.plans.length;
  const recs = await recommend.build(DEVICE);
  counts.recs = recs.length;
  const unlocked = (await achievements.check(DEVICE)).unlocked;
  counts.achievements = unlocked.length;
}

async function main() {
  await Q.init();
  await S.stateSet("seeded:current-affairs", "1");
  await seedCurrentAffairs();
  await seedPredictions();
  await seedPlans();
  console.log("seed complete:", JSON.stringify(counts));
  const today = U.today();
  const plan = S.get("study_plans", { device_id: DEVICE, plan_type: "daily", plan_date: today });
  console.log("plan today:", plan ? plan.items_json : "none");
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch((e) => { console.error("seed failed:", e); process.exit(1); });
}

module.exports = { main, DEVICE };
