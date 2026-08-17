/* runtime-v2/ai/router.cjs — AI engine HTTP router, file-backed.
   Port of ai/router.js: identical route table (profile, weak/strong,
   planner, spaced, adaptive, mock, recommendations, flashcards,
   current affairs, analytics, leaderboard, achievements, refresh).
   Every handler is async; responses are JSON; handle() returns true
   only when a route was served. */
"use strict";
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

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}

function readJson(req, res, cb) {
  let body = "";
  req.on("data", (c) => { body += c; });
  req.on("end", () => {
    try { cb(JSON.parse(body || "{}")); }
    catch (e) { json(res, 400, { error: "invalid JSON: " + e.message }); }
  });
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
    json(res, 200, await profile.get(dev()));
    return true;
  }
  if (P === "/api/ai/profile" && method === "POST") {
    readJson(req, res, async (body) => {
      const d = U.did(query, body);
      await upsertProfile(d, body);
      await planner.generate(d, 7);
      await recommend.build(d);
      json(res, 200, await profile.get(d));
    });
    return true;
  }

  /* ----- Weak / strong topics ----- */
  if (P === "/api/ai/weak-topics" && method === "GET") {
    await weak.rebuild(dev());
    json(res, 200, { weak: await weak.weakTopics(dev()), strong: await weak.strongTopics(dev()) });
    return true;
  }

  /* ----- Study planner ----- */
  if (P === "/api/ai/planner" && method === "GET") {
    json(res, 200, await planner.get(dev(), query.date || ""));
    return true;
  }
  if (P === "/api/ai/planner/regenerate" && method === "POST") {
    readJson(req, res, async (b) => json(res, 200, await planner.generate(U.did(query, b), parseInt(b.days, 10) || 7)));
    return true;
  }
  if (P === "/api/ai/planner/complete" && method === "POST") {
    readJson(req, res, (b) => {
      planner.complete(U.did(query, b), b.date || "", b.index).then((out) => json(res, 200, out));
    });
    return true;
  }

  /* ----- Spaced repetition ----- */
  if (P === "/api/ai/spaced/due" && method === "GET") {
    const d = dev();
    const items = spaced.due(d, parseInt(query.limit, 10) || 50);
    json(res, 200, { due: items, count: items.length, stats: spaced.stats(d) });
    return true;
  }
  if (P === "/api/ai/spaced/review" && method === "POST") {
    readJson(req, res, async (b) => {
      const d = U.did(query, b);
      if (!b.mcq_id) { json(res, 400, { error: "mcq_id required" }); return; }
      const out = await spaced.review(d, b.mcq_id, b.quality);
      await weak.rebuild(d);
      json(res, 200, out);
    });
    return true;
  }

  /* ----- Adaptive quiz ----- */
  if (P === "/api/ai/adaptive/start" && method === "POST") {
    readJson(req, res, (b) => { adaptive.start(U.did(query, b), b).then((out) => json(res, 201, out)); });
    return true;
  }
  if (P === "/api/ai/adaptive/next" && method === "GET") {
    adaptive.nextQ(dev()).then((out) => json(res, 200, out));
    return true;
  }
  if (P === "/api/ai/adaptive/submit" && method === "POST") {
    readJson(req, res, (b) => { adaptive.submit(U.did(query, b), b).then((out) => json(res, 200, out)); });
    return true;
  }
  if (P === "/api/ai/adaptive/finish" && method === "POST") {
    readJson(req, res, (b) => { adaptive.finish(U.did(query, b)).then((out) => json(res, 200, out)); });
    return true;
  }

  /* ----- Mock prediction ----- */
  if (P === "/api/ai/mock/predictions" && method === "GET") {
    json(res, 200, mock.list(dev()));
    return true;
  }
  if (P === "/api/ai/mock/predict" && method === "POST") {
    readJson(req, res, (b) => {
      const d = U.did(query, b);
      if (!b.exam_id) { json(res, 400, { error: "exam_id required" }); return; }
      mock.predict(d, b.exam_id).then((out) => json(res, 200, out));
    });
    return true;
  }

  /* ----- Recommendations ----- */
  if (P === "/api/ai/recommendations" && method === "GET") {
    recommend.list(dev(), parseInt(query.limit, 10) || 20).then((out) => json(res, 200, out));
    return true;
  }
  if (P === "/api/ai/recommendations/build" && method === "POST") {
    readJson(req, res, (b) => { recommend.build(U.did(query, b)).then((out) => json(res, 200, { recommendations: out })); });
    return true;
  }

  /* ----- Flashcards ----- */
  if (P === "/api/ai/flashcards/due" && method === "GET") {
    const d = dev();
    json(res, 200, { cards: flashcards.due(d, parseInt(query.limit, 10) || 25), stats: flashcards.stats(d) });
    return true;
  }
  if (P === "/api/ai/flashcards/build" && method === "POST") {
    readJson(req, res, (b) => { flashcards.build(U.did(query, b), parseInt(b.limit, 10) || 25).then((out) => json(res, 200, out)); });
    return true;
  }
  if (P === "/api/ai/flashcards/review" && method === "POST") {
    readJson(req, res, (b) => {
      const d = U.did(query, b);
      if (b.card_id === undefined) { json(res, 400, { error: "card_id required" }); return; }
      flashcards.review(d, b.card_id, b.quality).then((out) => json(res, 200, out));
    });
    return true;
  }

  /* ----- Current affairs ----- */
  if (P === "/api/ai/current-affairs" && method === "GET") {
    const out = await current.list({
      period: query.period || "", date: query.date || "",
      category: query.category || "", limit: parseInt(query.limit, 10) || 50
    });
    json(res, 200, out);
    return true;
  }
  if (P === "/api/ai/current-affairs/summary" && method === "GET") {
    json(res, 200, await current.summary(query.period || "daily"));
    return true;
  }

  /* ----- Analytics ----- */
  if (P === "/api/ai/analytics" && method === "GET") {
    analytics.overview(dev()).then((out) => json(res, 200, out));
    return true;
  }

  /* ----- Leaderboard periods ----- */
  if (P === "/api/ai/leaderboard" && method === "GET") {
    json(res, 200, leaderboard.list({
      deviceId: dev(), period: query.period || "weekly",
      region: query.region || "", limit: parseInt(query.limit, 10) || 25
    }));
    return true;
  }

  /* ----- Achievements & notifications ----- */
  if (P === "/api/ai/achievements" && method === "GET") {
    const d = dev();
    const ck = await achievements.check(d);
    json(res, 200, { achievements: achievements.list(d), unlocked: ck.unlocked });
    return true;
  }
  if (P === "/api/ai/notifications" && method === "GET") {
    json(res, 200, achievements.notifications(dev(), parseInt(query.limit, 10) || 30));
    return true;
  }
  if (P === "/api/ai/notifications/read" && method === "POST") {
    readJson(req, res, (b) => { achievements.markRead(U.did(query, b), b.id).then((out) => json(res, 200, out)); });
    return true;
  }

  /* ----- Refresh (rebuild everything for this device) ----- */
  if (P === "/api/ai/refresh" && method === "POST") {
    readJson(req, res, async (b) => {
      const d = U.did(query, b);
      await profile.refresh(d);
      await weak.rebuild(d);
      await planner.generate(d, 7);
      await recommend.build(d);
      const ck = await achievements.check(d);
      json(res, 200, { ok: true, profile: await profile.get(d), unlocked: ck.unlocked });
    });
    return true;
  }

  return false;
}

module.exports = { handle };
