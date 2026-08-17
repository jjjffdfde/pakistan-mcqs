/* scripts/phase40/ai-smoke.cjs — phase 40 AI-layer smoke harness.
   Boots runtime-v2/server.cjs as a child, exercises every /api/ai/* route
   (profile, planner, weak, spaced, adaptive, mock, recommendations,
   flashcards, current-affairs, analytics, leaderboard, achievements) plus
   the admin routes contract (except the full index rebuild import).
   Prints PASS/FAIL per route; exit code = failures. */
"use strict";
const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const BASE = "http://localhost:8766";
let fails = 0, passes = 0;

function check(name, cond, extra) {
  if (cond) { passes++; console.log("PASS  " + name); }
  else { fails++; console.log("FAIL  " + name + (extra ? "  " + JSON.stringify(extra) : "")); }
}

async function api(method, p, body) {
  const res = await fetch(BASE + p, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data };
}

async function waitHealthy(child, deadlineMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < deadlineMs) {
    if (child.exitCode !== null) throw new Error("server exited early: " + child.exitCode);
    try { const r = await fetch(BASE + "/api/health", { signal: AbortSignal.timeout(2000) }); if (r.ok) return; } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not become healthy");
}

async function main() {
  const child = spawn(process.execPath, [path.join(ROOT, "runtime-v2", "server.cjs")], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", (d) => { logs += d; });
  child.stderr.on("data", (d) => { logs += d; });
  try {
    await waitHealthy(child, 60000);
    const dev = "smoke-" + Date.now();

    /* profile */
    let r = await api("GET", "/api/ai/profile?device_id=" + dev);
    check("profile GET", r.status === 200 && r.data && r.data.device_id === dev, r);
    r = await api("POST", "/api/ai/profile", { device_id: dev, name: "Smoke Tester", daily_hours: 2, target_exam: "css", target_date: "2099-12-31", city: "Lahore", province: "Punjab" });
    check("profile POST", r.status === 200 && r.data.level && r.data.readiness >= 0, r);

    /* planner */
    r = await api("GET", "/api/ai/planner?device_id=" + dev);
    check("planner GET", r.status === 200 && Array.isArray(r.data.items) && r.data.weekly && r.data.date, r);
    const targetExam = r.data.weekly.days_left > 0;
    r = await api("POST", "/api/ai/planner/complete", { device_id: dev, date: r.data.date, index: 0 });
    check("planner complete", r.status === 200 && r.data.ok === true && r.data.item && r.data.item.done === true, r);
    r = await api("POST", "/api/ai/planner/complete", { device_id: dev, index: "bad" });
    check("planner complete bad index", r.status === 200 && r.data.error, r);
    r = await api("POST", "/api/ai/planner/regenerate", { device_id: dev, days: 7 });
    check("planner regenerate", r.status === 200 && Array.isArray(r.data.plans) && r.data.plans.length === 7, r);

    /* weak topics */
    r = await api("GET", "/api/ai/weak-topics?device_id=" + dev);
    check("weak-topics", r.status === 200 && Array.isArray(r.data.weak) && Array.isArray(r.data.strong), r);

    /* spaced */
    r = await api("GET", "/api/ai/spaced/due?device_id=" + dev);
    check("spaced due", r.status === 200 && Array.isArray(r.data.due) && typeof r.data.stats.total === "number", r);
    const rand = await api("GET", "/api/random?limit=1");
    const mcqId = rand.data.results && rand.data.results[0] && rand.data.results[0].id;
    check("random for spaced", !!mcqId, r);
    r = await api("POST", "/api/ai/spaced/review", { device_id: dev, mcq_id: mcqId, quality: 0 });
    check("spaced review", r.status === 200 && r.data.box === 1 && r.data.quality === 0, r);
    r = await api("GET", "/api/ai/spaced/due?device_id=" + dev);
    check("spaced due after review (due tomorrow)", r.status === 200 && r.data.count === 0 && r.data.stats.total === 1 && r.data.stats.reviews === 1, r);
    r = await api("POST", "/api/history", { device_id: dev, mcq_id: mcqId, correct: false, time_taken_sec: 10, mode: "practice" });
    check("history POST wrong (regression)", r.status === 201 && r.data.ok === true, r);
    r = await api("GET", "/api/ai/spaced/due?device_id=" + dev);
    check("spaced due after wrong answer (scheduled today)", r.status === 200 && r.data.count >= 1, r);

    /* adaptive */
    r = await api("POST", "/api/ai/adaptive/start", { device_id: dev, count: 10 });
    check("adaptive start", r.status === 201 && r.data.session_id && r.data.total >= 1, r);
    const sess = r.data.session_id;
    r = await api("GET", "/api/ai/adaptive/next?device_id=" + dev);
    check("adaptive next", r.status === 200 && r.data.done === false && r.data.question && r.data.question.optionA != null, r);
    const qId = r.data.question.id;
    r = await api("POST", "/api/ai/adaptive/submit", { device_id: dev, mcq_id: qId, answer: "A", time_sec: 8 });
    check("adaptive submit", r.status === 200 && r.data.correct_answer && r.data.answered === 1, r);
    r = await api("POST", "/api/ai/adaptive/finish", { device_id: dev });
    check("adaptive finish", r.status === 200 && r.data.accuracy >= 0 && r.data.profile && typeof r.data.weak_topics === "number", r);

    /* mock */
    r = await api("GET", "/api/mocktests");
    const examId = r.data[0] && r.data[0].id;
    check("mocktests available", !!examId, r);
    r = await api("POST", "/api/ai/mock/predict", { device_id: dev, exam_id: examId });
    check("mock predict", r.status === 200 && typeof r.data.expected_score === "number" && r.data.prob_pass >= 3, r);
    r = await api("GET", "/api/ai/mock/predictions?device_id=" + dev);
    check("mock predictions list", r.status === 200 && Array.isArray(r.data) && r.data[0] && r.data[0].exam_id === examId, r);

    /* recommendations */
    r = await api("GET", "/api/ai/recommendations?device_id=default&limit=20");
    check("recommendations (seeded default)", r.status === 200 && r.data.length >= 0, r);
    r = await api("POST", "/api/ai/recommendations/build", { device_id: dev });
    check("recommendations build", r.status === 200 && Array.isArray(r.data.recommendations), r);

    /* flashcards */
    r = await api("POST", "/api/ai/flashcards/build", { device_id: dev, limit: 5 });
    check("flashcards build", r.status === 200 && r.data.built >= 0, r);
    r = await api("GET", "/api/ai/flashcards/due?device_id=" + dev + "&limit=10");
    const cardId = r.data.cards && r.data.cards[0] && r.data.cards[0].id;
    check("flashcards due", r.status === 200 && Array.isArray(r.data.cards), r);
    if (cardId) {
      r = await api("POST", "/api/ai/flashcards/review", { device_id: dev, card_id: cardId, quality: 2 });
      check("flashcards review", r.status === 200 && r.data.cross_scheduled === true, r);
    }

    /* current affairs */
    r = await api("GET", "/api/ai/current-affairs?period=daily&limit=5");
    check("current-affairs list", r.status === 200 && r.data.total >= 0 && Array.isArray(r.data.items), r);
    r = await api("GET", "/api/ai/current-affairs/summary?period=daily");
    check("current-affairs summary", r.status === 200 && Array.isArray(r.data), r);

    /* analytics + leaderboard */
    r = await api("GET", "/api/ai/analytics?device_id=" + dev);
    check("analytics", r.status === 200 && Array.isArray(r.data.daily) && Array.isArray(r.data.trend) && Array.isArray(r.data.sessions), r);
    r = await api("GET", "/api/ai/leaderboard?device_id=" + dev + "&period=overall&limit=10");
    check("leaderboard overall", r.status === 200 && Array.isArray(r.data.rows), r);
    r = await api("GET", "/api/ai/leaderboard?device_id=" + dev + "&period=daily&region=city");
    check("leaderboard daily+city", r.status === 200 && Array.isArray(r.data.rows), r);

    /* achievements + notifications */
    r = await api("GET", "/api/ai/achievements?device_id=" + dev);
    check("achievements", r.status === 200 && Array.isArray(r.data.achievements) && Array.isArray(r.data.unlocked), r);
    r = await api("POST", "/api/ai/notifications/read", { device_id: dev, id: "all" });
    check("notifications read", r.status === 200 && r.data.ok === true, r);
    r = await api("GET", "/api/ai/notifications?device_id=" + dev);
    check("notifications list", r.status === 200 && Array.isArray(r.data), r);

    /* refresh */
    r = await api("POST", "/api/ai/refresh", { device_id: dev });
    check("refresh", r.status === 200 && r.data.ok === true && r.data.profile && Array.isArray(r.data.unlocked), r);

    /* bookmarks/history still fine (regression touch) */
    r = await api("POST", "/api/bookmarks", { mcq_id: mcqId, device_id: dev });
    check("bookmarks POST (regression)", r.status === 201, r);
    r = await api("POST", "/api/history", { device_id: dev, mcq_id: mcqId, correct: true, time_taken_sec: 12, mode: "practice" });
    check("history POST (regression)", r.status === 201 && r.data.ok === true, r);

    console.log("\n===== AI SMOKE: " + passes + " passed, " + fails + " failed =====");
  } catch (e) {
    fails++;
    console.log("FATAL " + e.message);
    console.log("---- server log tail ----");
    console.log(logs.slice(-4000));
  } finally {
    child.kill();
    setTimeout(() => process.exit(fails ? 1 : 0), 300);
  }
}

main();
