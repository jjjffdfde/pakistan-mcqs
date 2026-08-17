/* runtime-v2/ai/planner.cjs — study planner, file-backed.
   Port of ai/planner.js: 7-day rolling daily plans + weekly wrap in the
   JSON table store (study_plans rows: device_id, plan_date, plan_type
   daily|weekly, items_json). Exams for mock slots via the NDJSON engine. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const Q = require("../query-engine.cjs");

function dailyBudget(hours) {
  return Math.max(10, Math.round((Math.max(0.5, hours || 1) * 30) / 10) * 10);
}

async function mocksPick(n) {
  const mocks = (await Q.mocktests()).filter((m) => m.status === "active");
  for (let i = mocks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mocks[i], mocks[j]] = [mocks[j], mocks[i]]; }
  return mocks.slice(0, Math.min(3, n || 3));
}

async function generate(deviceId, days = 7) {
  const prof = S.get("user_profiles", { device_id: deviceId }) || {};
  const budget = dailyBudget(prof.daily_hours);
  const dueRev = require("./spaced.cjs").dueCount(deviceId);
  const dueCards = (require("./flashcards.cjs").stats(deviceId) || {}).due || 0;
  const weakList = await require("./weak.cjs").weakTopics(deviceId, 5);
  const mock = (await mocksPick(3))[0];
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
      items.push({ type: "practice", title: "Fix weak area: " + (weakRound.topic_name || weakRound.topic_id), target: weakRound.topic_id, q: practiceQ, done: false });
    } else if (!reviseOnly) {
      items.push({ type: "practice", title: "Mixed practice", target: "", q: practiceQ, done: false });
    }

    if (revisionQ > 0) items.push({ type: "revision", title: "Spaced revision (due: " + dueRev + ")", target: "", q: revisionQ, done: false });
    if (cardQ > 0) items.push({ type: "flashcards", title: "Flashcard review", target: "", q: cardQ, done: false });
    if (d === 0) items.push({ type: "current-affairs", title: "Current affairs digest", target: "", q: 5, done: false });
    if (mockToday && mock) items.push({ type: "mock", title: "Mock test: " + mock.title, target: mock.id, q: 0, done: false });
    if (daysLeft > 0 && daysLeft <= 14 && d === 1) {
      items.push({ type: "mock", title: "Exam simulation (#" + daysLeft + " days left)", target: (mock || {}).id || "", q: 0, done: false });
    }
    if (!items.length) items.push({ type: "practice", title: "Daily practice", target: "", q: budget, done: false });

    await S.remove("study_plans", { device_id: deviceId, plan_date: date, plan_type: "daily" });
    await S.insert("study_plans", {
      id: S.nextId("study_plans"), device_id: deviceId, plan_date: date,
      plan_type: "daily", items_json: JSON.stringify(items), created_at: U.utcNow()
    });
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
  await S.remove("study_plans", { device_id: deviceId, plan_type: "weekly" });
  await S.insert("study_plans", {
    id: S.nextId("study_plans"), device_id: deviceId, plan_date: U.today(),
    plan_type: "weekly", items_json: JSON.stringify(weekly), created_at: U.utcNow()
  });

  return { plans, weekly };
}

async function get(deviceId, date) {
  const d = date || U.today();
  let plan = S.get("study_plans", { device_id: deviceId, plan_date: d, plan_type: "daily" });
  if (!plan) {
    await generate(deviceId, 7);
    plan = S.get("study_plans", { device_id: deviceId, plan_date: d, plan_type: "daily" });
  }
  let items = [];
  try { items = JSON.parse(plan ? plan.items_json : "[]"); } catch (e) {}
  const weeklyRow = S.get("study_plans", { device_id: deviceId, plan_type: "weekly" });
  let weekly = null;
  try { weekly = weeklyRow ? JSON.parse(weeklyRow.items_json) : null; } catch (e) {}
  return { date: d, items, weekly, generated: !plan };
}

async function complete(deviceId, date, index) {
  if (index === undefined || index === null || index === "") return { error: "index required" };
  const plan = S.get("study_plans", { device_id: deviceId, plan_date: date || U.today(), plan_type: "daily" });
  if (!plan) return { error: "no plan for date" };
  let items = [];
  try { items = JSON.parse(plan.items_json); } catch (e) { items = []; }
  const i = parseInt(index, 10);
  if (isNaN(i) || i < 0 || i >= items.length) return { error: "bad index" };
  items[i].done = true;
  await S.update("study_plans", { id: plan.id }, { items_json: JSON.stringify(items) });
  return { ok: true, item: items[i] };
}

module.exports = { generate, get, complete, dailyBudget };
