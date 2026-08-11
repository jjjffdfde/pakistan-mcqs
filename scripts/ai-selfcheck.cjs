/* ============================================================
   Phase 12 — AI engine self-check: boots the server, hits every
   /api/ai/* endpoint plus patched legacy endpoints, verifies
   status codes and JSON sanity, then reports PASS/FAIL.
   ============================================================ */
"use strict";
const { spawn } = require("child_process");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const API = "http://127.0.0.1:8765";

const checks = [];
let failures = 0;

function check(name, cond, extra) {
  const ok = !!cond;
  if (!ok) failures++;
  checks.push((ok ? "PASS" : "FAIL") + "  " + name + (ok ? "" : "  -> " + extra));
}

async function get(p) {
  const r = await fetch(API + p);
  return { status: r.status, body: await r.json() };
}
async function post(p, body) {
  const r = await fetch(API + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  return { status: r.status, body: await r.json() };
}

(async () => {
  const srv = spawn(process.execPath, ["server.js"], { cwd: ROOT, stdio: "ignore" });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let up = false;
  for (let i = 0; i < 20 && !up; i++) {
    await wait(500);
    try { const r = await fetch(API + "/api/health"); up = r.status === 200; } catch (e) {}
  }
  if (!up) { console.log("FAIL  server did not start"); process.exit(1); }

  const q = (p, cond, extra) => check(p, cond, extra);

  try {
    let r = await get("/api/health"); q("/api/health", r.body.mcqs > 800000, r.body.mcqs);

    r = await get("/api/ai/profile"); q("/api/ai/profile", r.status === 200 && typeof r.body.readiness === "number", JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/weak-topics"); q("/api/ai/weak-topics", Array.isArray(r.body.weak) && Array.isArray(r.body.strong), JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/planner"); q("/api/ai/planner", Array.isArray(r.body.items) && r.body.items.length > 0, JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/spaced/due"); q("/api/ai/spaced/due", Array.isArray(r.body.due) && r.body.stats && r.body.stats.total !== undefined, JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/flashcards/due"); q("/api/ai/flashcards/due", Array.isArray(r.body.cards) && r.body.stats && r.body.stats.total !== undefined, JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/current-affairs?limit=5"); q("/api/ai/current-affairs", r.body.items && r.body.items.length >= 5, JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/current-affairs/summary?period=daily"); q("/api/ai/current-affairs/summary", Array.isArray(r.body), JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/recommendations"); q("/api/ai/recommendations", Array.isArray(r.body) && r.body.length > 0, JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/analytics"); q("/api/ai/analytics", Array.isArray(r.body.daily) && Array.isArray(r.body.mastery), JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/leaderboard?period=overall"); q("/api/ai/leaderboard", Array.isArray(r.body.rows), JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/achievements"); q("/api/ai/achievements", Array.isArray(r.body.achievements) && Array.isArray(r.body.unlocked), JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/notifications"); q("/api/ai/notifications", Array.isArray(r.body), JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/ai/mock/predictions"); q("/api/ai/mock/predictions", Array.isArray(r.body), JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/profile", { name: "Selfcheck", daily_hours: 2, target_exam: "CSS", target_date: "2026-12-01", city: "Lahore", province: "Punjab" });
    q("POST /api/ai/profile", r.status === 200 && r.body.readiness >= 0, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/adaptive/start", { count: 5, mode: "adaptive" });
    q("POST /api/ai/adaptive/start", r.status === 201 && r.body.session_id > 0, JSON.stringify(r.body).slice(0, 120));
    const sid = r.body.session_id;

    r = await get("/api/ai/adaptive/next"); q("GET /api/ai/adaptive/next", r.body.question && r.body.question.id, JSON.stringify(r.body).slice(0, 120));
    const qid = r.body.question.id;
    r = await post("/api/ai/adaptive/submit", { mcq_id: qid, answer: "A", time_sec: 6 });
    q("POST /api/ai/adaptive/submit", r.status === 200 && typeof r.body.correct === "boolean", JSON.stringify(r.body).slice(0, 120));
    r = await post("/api/ai/adaptive/finish", {});
    q("POST /api/ai/adaptive/finish", r.status === 200 && r.body.accuracy >= 0, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/mock/predict", { exam_id: "mock-ppsc-assistant-1" });
    q("POST /api/ai/mock/predict", r.status === 200 && typeof r.body.expected_score === "number", JSON.stringify(r.body).slice(0, 160));

    r = await post("/api/ai/flashcards/build", { limit: 5 });
    q("POST /api/ai/flashcards/build", r.status === 200 && r.body.built >= 0, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/spaced/review", { mcq_id: qid, quality: 4 });
    q("POST /api/ai/spaced/review", r.status === 200 && r.body.interval_days >= 1, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/planner/regenerate", { days: 7 });
    q("POST /api/ai/planner/regenerate", r.status === 200 && r.body.plans.length === 7, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/notifications/read", { id: "all" });
    q("POST /api/ai/notifications/read", r.status === 200 && r.body.ok === true, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/refresh", {});
    q("POST /api/ai/refresh", r.status === 200 && r.body.ok === true && r.body.profile, JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/history", { mcq_id: "acc-001", correct: true, time_taken_sec: 9, skipped: false, mode: "selfcheck" });
    q("POST /api/history (patched)", r.status === 201 && r.body.points === 10, JSON.stringify(r.body).slice(0, 120));
    r = await get("/api/history?limit=3"); q("GET /api/history (join)", r.status === 200 && Array.isArray(r.body) && ("subject_id" in (r.body[0] || {})), JSON.stringify(r.body).slice(0, 120));

    r = await post("/api/ai/adaptive/submit", { mcq_id: "nope-xyz" });
    q("POST adaptive unknown mcq", r.status === 200 && r.body.error, JSON.stringify(r.body).slice(0, 120));

    r = await get("/api/ai/nonexistent-route");
    q("unknown AI route falls through", r.status === 404, "status " + r.status);
  } catch (e) {
    failures++;
    checks.push("FAIL  exception during checks: " + e.message);
  }

  srv.kill();
  console.log(checks.join("\n"));
  console.log("\n" + (checks.length - failures) + "/" + checks.length + " checks passed" + (failures ? " — FAILURES: " + failures : " — ALL PASS"));
  process.exit(failures ? 1 : 0);
})();
