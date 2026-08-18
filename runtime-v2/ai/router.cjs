/* runtime-v2/ai/router.cjs — AI engine HTTP router, file-backed.
   Port of ai/router.js: identical route table (profile, weak/strong,
   planner, spaced, adaptive, mock, recommendations, flashcards,
   current affairs, analytics, leaderboard, achievements, refresh).
   Every handler is async; responses are JSON; handle() returns true
   only when a route was served.
   Production-safe: shared CORS/JSON helpers, bounded bodies, sanitized
   errors, and every async handler is wrapped so a rejected promise can
   never crash the process (unhandled rejection). */
"use strict";
const H = require("../http-util.cjs");
const S = require("./store.cjs");
const U = require("./util.cjs");
const profile = require("./profile.cjs");
const weak = require("./weak.cjs");
const spaced = require("./spaced.cjs");
const planner = require("./planner.cjs");
const adaptive = require("./adaptive.cjs");
const mock = require("./mock.cjs");
const recommend = require("./recommend.cjs");
const flashcards = require("./flashcards.cjs");
const current = require("./current.cjs");
const analytics = require("./analytics.cjs");
const leaderboard = require("./leaderboard.cjs");
const achievements = require("./achievements.cjs");

/* Wrap a handler so rejections become sanitized 500 responses instead of
   unhandled rejections (which would crash the Node process). Errors that
   carry an HTTP status (e.g. 413 body too large, 400 invalid JSON) keep it. */
function safe(fn) {
  return (req, res, ...args) => {
    return Promise.resolve()
      .then(() => fn(req, res, ...args))
      .catch((e) => {
        if (e && e.status) return H.json(res, e.status, { error: e.message }, req);
        H.sendError(req, res, 500, "ai internal error", e);
      });
  };
}

async function upsertProfile(d, body) {
  const upd = S.get("user_profiles", { device_id: d }) || {};
  const name = String(body.name || (upd && upd.name) || "Student").slice(0, 40);
  const dailyHours = U.clamp(parseFloat(body.daily_hours) || 1, 0.5, 8);
  const targetExam = String(body.target_exam || (upd && upd.target_exam) || "").slice(0, 60);
  const targetDate = String(body.target_date || (upd && upd.target_date) || "").slice(0, 10);
  const city = String(body.city || (upd && upd.city) || "").slice(0, 60);
  const province = String(body.province || (upd && upd.province) || "").slice(0, 60);
  await S.upsert("user_profiles", { device_id: d }, {
    ...upd, device_id: d, name, daily_hours: dailyHours, target_exam: targetExam,
    target_date: targetDate, city, province, updated_at: U.utcNow()
  });
}

async function handle(req, res, pathname, query, method) {
  const P = pathname.replace(/\/+$/, "");
  const dev = () => String((query && query.device_id) || "default").slice(0, 64);

  /* ----- Profile & readiness ----- */
  if (P === "/api/ai/profile" && method === "GET") {
    H.json(res, 200, await profile.get(dev()), req);
    return true;
  }
  if (P === "/api/ai/profile" && method === "POST") {
    const body = await H.readJson(req);
    const d = U.did(query, body);
    await upsertProfile(d, body);
    await planner.generate(d, 7);
    await recommend.build(d);
    H.json(res, 200, await profile.get(d), req);
    return true;
  }

  /* ----- Weak / strong topics ----- */
  if (P === "/api/ai/weak-topics" && method === "GET") {
    await weak.rebuild(dev());
    H.json(res, 200, { weak: await weak.weakTopics(dev()), strong: await weak.strongTopics(dev()) }, req);
    return true;
  }

  /* ----- Study planner ----- */
  if (P === "/api/ai/planner" && method === "GET") {
    H.json(res, 200, await planner.get(dev(), query.date || ""), req);
    return true;
  }
  if (P === "/api/ai/planner/regenerate" && method === "POST") {
    const b = await H.readJson(req);
    H.json(res, 200, await planner.generate(U.did(query, b), parseInt(b.days, 10) || 7), req);
    return true;
  }
  if (P === "/api/ai/planner/complete" && method === "POST") {
    const b = await H.readJson(req);
    const out = await planner.complete(U.did(query, b), b.date || "", b.index);
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Spaced repetition ----- */
  if (P === "/api/ai/spaced/due" && method === "GET") {
    const d = dev();
    const items = spaced.due(d, Math.min(200, parseInt(query.limit, 10) || 50));
    H.json(res, 200, { due: items, count: items.length, stats: spaced.stats(d) }, req);
    return true;
  }
  if (P === "/api/ai/spaced/review" && method === "POST") {
    const b = await H.readJson(req);
    const d = U.did(query, b);
    if (!b.mcq_id) { H.json(res, 400, { error: "mcq_id required" }, req); return true; }
    const out = await spaced.review(d, b.mcq_id, b.quality);
    await weak.rebuild(d);
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Adaptive quiz ----- */
  if (P === "/api/ai/adaptive/start" && method === "POST") {
    const b = await H.readJson(req);
    const out = await adaptive.start(U.did(query, b), b);
    H.json(res, 201, out, req);
    return true;
  }
  if (P === "/api/ai/adaptive/next" && method === "GET") {
    const out = await adaptive.nextQ(dev());
    H.json(res, 200, out, req);
    return true;
  }
  if (P === "/api/ai/adaptive/submit" && method === "POST") {
    const b = await H.readJson(req);
    const out = await adaptive.submit(U.did(query, b), b);
    H.json(res, 200, out, req);
    return true;
  }
  if (P === "/api/ai/adaptive/finish" && method === "POST") {
    const b = await H.readJson(req);
    const out = await adaptive.finish(U.did(query, b));
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Mock prediction ----- */
  if (P === "/api/ai/mock/predictions" && method === "GET") {
    H.json(res, 200, mock.list(dev()), req);
    return true;
  }
  if (P === "/api/ai/mock/predict" && method === "POST") {
    const b = await H.readJson(req);
    const d = U.did(query, b);
    if (!b.exam_id) { H.json(res, 400, { error: "exam_id required" }, req); return true; }
    const out = await mock.predict(d, b.exam_id);
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Recommendations ----- */
  if (P === "/api/ai/recommendations" && method === "GET") {
    const out = await recommend.list(dev(), Math.min(100, parseInt(query.limit, 10) || 20));
    H.json(res, 200, out, req);
    return true;
  }
  if (P === "/api/ai/recommendations/build" && method === "POST") {
    const b = await H.readJson(req);
    const out = await recommend.build(U.did(query, b));
    H.json(res, 200, { recommendations: out }, req);
    return true;
  }

  /* ----- Flashcards ----- */
  if (P === "/api/ai/flashcards/due" && method === "GET") {
    const d = dev();
    H.json(res, 200, { cards: flashcards.due(d, Math.min(200, parseInt(query.limit, 10) || 25)), stats: flashcards.stats(d) }, req);
    return true;
  }
  if (P === "/api/ai/flashcards/build" && method === "POST") {
    const b = await H.readJson(req);
    const out = await flashcards.build(U.did(query, b), Math.min(200, parseInt(b.limit, 10) || 25));
    H.json(res, 200, out, req);
    return true;
  }
  if (P === "/api/ai/flashcards/review" && method === "POST") {
    const b = await H.readJson(req);
    const d = U.did(query, b);
    if (b.card_id === undefined) { H.json(res, 400, { error: "card_id required" }, req); return true; }
    const out = await flashcards.review(d, b.card_id, b.quality);
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Current affairs ----- */
  if (P === "/api/ai/current-affairs" && method === "GET") {
    const out = await current.list({
      period: query.period || "", date: query.date || "",
      category: query.category || "", limit: Math.min(200, parseInt(query.limit, 10) || 50)
    });
    H.json(res, 200, out, req);
    return true;
  }
  if (P === "/api/ai/current-affairs/summary" && method === "GET") {
    H.json(res, 200, await current.summary(query.period || "daily"), req);
    return true;
  }

  /* ----- Analytics ----- */
  if (P === "/api/ai/analytics" && method === "GET") {
    const out = await analytics.overview(dev());
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Leaderboard periods ----- */
  if (P === "/api/ai/leaderboard" && method === "GET") {
    H.json(res, 200, leaderboard.list({
      deviceId: dev(), period: query.period || "weekly",
      region: query.region || "", limit: Math.min(100, parseInt(query.limit, 10) || 25)
    }), req);
    return true;
  }

  /* ----- Achievements & notifications ----- */
  if (P === "/api/ai/achievements" && method === "GET") {
    const d = dev();
    const ck = await achievements.check(d);
    H.json(res, 200, { achievements: achievements.list(d), unlocked: ck.unlocked }, req);
    return true;
  }
  if (P === "/api/ai/notifications" && method === "GET") {
    H.json(res, 200, achievements.notifications(dev(), Math.min(100, parseInt(query.limit, 10) || 30)), req);
    return true;
  }
  if (P === "/api/ai/notifications/read" && method === "POST") {
    const b = await H.readJson(req);
    const out = await achievements.markRead(U.did(query, b), b.id);
    H.json(res, 200, out, req);
    return true;
  }

  /* ----- Refresh (rebuild everything for this device) ----- */
  if (P === "/api/ai/refresh" && method === "POST") {
    const b = await H.readJson(req);
    const d = U.did(query, b);
    await profile.refresh(d);
    await weak.rebuild(d);
    await planner.generate(d, 7);
    await recommend.build(d);
    const ck = await achievements.check(d);
    H.json(res, 200, { ok: true, profile: await profile.get(d), unlocked: ck.unlocked }, req);
    return true;
  }

  return false;
}

module.exports = { handle: safe(handle) };
