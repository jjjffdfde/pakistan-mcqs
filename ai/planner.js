/* ============================================================
   Phase 12 — AI learning engine: study planner
   Generates 7-day rolling daily plans (+ weekly wrap) from the
   learner profile: daily question budget from daily_hours,
   weak-topic practice slots, spaced-revision quotas, flashcard
   quotas, mock tests every 4th day, current-affairs on day 1,
   and an exam-countdown strategy when a target exam is set.
   ============================================================ */
"use strict";
const U = require("./util.js");
const spaced = require("./spaced.js");
const weak = require("./weak.js");
const flashcards = require("./flashcards.js");

function dailyBudget(hours) {
  return Math.max(10, Math.round((Math.max(0.5, hours || 1) * 30) / 10) * 10);
}

function generate(db, deviceId, days = 7) {
  const prof = db.get("SELECT * FROM user_profiles WHERE device_id=?", [deviceId]) || {};
  const budget = dailyBudget(prof.daily_hours);
  const dueRev = spaced.dueCount(db, deviceId);
  const dueCards = flashcards.stats(db, deviceId)?.due || 0;
  const weakList = weak.weakTopics(db, deviceId, 5);
  const mocks = db.all("SELECT id, title FROM mocktests WHERE status='active' ORDER BY RANDOM() LIMIT 3");
  const mock = mocks[0];
  const targetDate = prof.target_date || "";
  const daysLeft = targetDate ? Math.max(0, Math.ceil((Date.parse(targetDate + "T00:00:00") - Date.parse(U.today() + "T00:00:00")) / 86400000)) : 0;
  const finalWeek = daysLeft > 0 && daysLeft <= 7;
  const reviseOnly = daysLeft === 1;

  const plans = [];
  for (let d = 0; d < days; d++) {
    const date = U.addDays(U.today(), d);
    const items = [];
    const mockToday = d > 0 && (d % 4 === 0) && !finalWeek;
    const practiceQ = Math.round(budget * (mockToday ? 0.35 : 0.55));
    const revisionQ = Math.min(Math.max(1, Math.round(dueRev / Math.min(days, 7))), Math.round(budget * 0.25));
    const cardQ = Math.min(Math.max(0, Math.round(dueCards / Math.min(days, 7))), 12);

    const weakRound = weakList[d % Math.max(1, weakList.length)];
    if (weakRound && !reviseOnly) {
      items.push({
        type: "practice",
        title: "Fix weak area: " + (weakRound.topic_name || weakRound.topic_id),
        target: weakRound.topic_id,
        q: practiceQ,
        done: false
      });
    } else if (!reviseOnly) {
      items.push({ type: "practice", title: "Mixed practice", target: "", q: practiceQ, done: false });
    }

    if (revisionQ > 0) {
      items.push({ type: "revision", title: "Spaced revision (due: " + dueRev + ")", target: "", q: revisionQ, done: false });
    }
    if (cardQ > 0) {
      items.push({ type: "flashcards", title: "Flashcard review", target: "", q: cardQ, done: false });
    }
    if (d === 0) {
      items.push({ type: "current-affairs", title: "Current affairs digest", target: "", q: 5, done: false });
    }
    if (mockToday && mock) {
      items.push({ type: "mock", title: "Mock test: " + mock.title, target: mock.id, q: 0, done: false });
    }
    if (daysLeft > 0 && daysLeft <= 14 && d === 1) {
      items.push({ type: "mock", title: "Exam simulation (#" + daysLeft + " days left)", target: (mocks[1] || mock).id, q: 0, done: false });
    }
    if (!items.length) {
      items.push({ type: "practice", title: "Daily practice", target: "", q: budget, done: false });
    }

    db.run("DELETE FROM study_plans WHERE device_id=? AND plan_date=?", [deviceId, date]);
    db.run(`INSERT INTO study_plans (device_id, plan_date, plan_type, items_json) VALUES (?,?,?,?)`,
      [deviceId, date, "daily", JSON.stringify(items)]);
    plans.push({ date, items });
  }

  const weekly = {
    target_questions: budget * 7,
    weak_topics: weakList.length,
    revision_due: dueRev,
    flashcards_due: dueCards,
    mock_tests: plans.filter((p) => p.items.some((i) => i.type === "mock")).length,
    final_week: finalWeek,
    revise_only: reviseOnly,
    days_left: daysLeft
  };
  db.run("DELETE FROM study_plans WHERE device_id=? AND plan_type='weekly'", [deviceId]);
  db.run(`INSERT INTO study_plans (device_id, plan_date, plan_type, items_json) VALUES (?,?,?,?)`,
    [deviceId, U.today(), "weekly", JSON.stringify(weekly)]);

  return { plans, weekly };
}

function get(db, deviceId, date) {
  const d = date || U.today();
  let plan = db.get("SELECT * FROM study_plans WHERE device_id=? AND plan_date=? AND plan_type='daily'", [deviceId, d]);
  if (!plan) {
    generate(db, deviceId, 7);
    plan = db.get("SELECT * FROM study_plans WHERE device_id=? AND plan_date=? AND plan_type='daily'", [deviceId, d]);
  }
  let items = [];
  try { items = JSON.parse(plan ? plan.items_json : "[]"); } catch (e) {}
  const weeklyRow = db.get("SELECT * FROM study_plans WHERE device_id=? AND plan_type='weekly'", [deviceId]);
  let weekly = null;
  try { weekly = weeklyRow ? JSON.parse(weeklyRow.items_json) : null; } catch (e) {}
  return { date: d, items, weekly, generated: !plan };
}

function complete(db, deviceId, date, index) {
  if (index === undefined || index === null || index === "") return { error: "index required" };
  const plan = db.get("SELECT * FROM study_plans WHERE device_id=? AND plan_date=? AND plan_type='daily'", [deviceId, date || U.today()]);
  if (!plan) return { error: "no plan for date" };
  let items = [];
  try { items = JSON.parse(plan.items_json); } catch (e) { items = []; }
  const i = parseInt(index, 10);
  if (isNaN(i) || i < 0 || i >= items.length) return { error: "bad index" };
  items[i].done = true;
  db.run("UPDATE study_plans SET items_json=? WHERE id=?", [JSON.stringify(items), plan.id]);
  return { ok: true, item: items[i] };
}

module.exports = { generate, get, complete };
