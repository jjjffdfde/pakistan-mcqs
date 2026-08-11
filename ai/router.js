/* ============================================================
   Phase 12 — AI learning engine: HTTP router
   Mounted in server.js before the 404 handler. Every route
   returns JSON and never throws into the main handler.
   handle() returns true only when a route was served.
   ============================================================ */
"use strict";
const profile = require("./profile.js");
const weak = require("./weak.js");
const spaced = require("./spaced.js");
const planner = require("./planner.js");
const adaptive = require("./adaptive.js");
const mock = require("./mock.js");
const recommend = require("./recommend.js");
const flashcards = require("./flashcards.js");
const current = require("./current.js");
const analytics = require("./analytics.js");
const leaderboard = require("./leaderboard.js");
const achievements = require("./achievements.js");
const U = require("./util.js");

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

function handle(db, req, res, pathname, query, method) {
  const P = pathname.replace(/\/+$/, "");
  const dev = () => String((query && query.device_id) || "default").slice(0, 64);

  /* ----- Profile & readiness ----- */
  if (P === "/api/ai/profile" && method === "GET") {
    json(res, 200, profile.get(db, dev()));
    return true;
  }
  if (P === "/api/ai/profile" && method === "POST") {
    readJson(req, res, (body) => {
      const d = U.did(query, body);
      const upd = db.get("SELECT * FROM user_profiles WHERE device_id=?", [d]);
      const name = String(body.name || (upd && upd.name) || "Student").slice(0, 40);
      const dailyHours = U.clamp(parseFloat(body.daily_hours) || 1, 0.5, 8);
      const targetExam = String(body.target_exam || (upd && upd.target_exam) || "").slice(0, 60);
      const targetDate = String(body.target_date || (upd && upd.target_date) || "").slice(0, 10);
      const city = String(body.city || (upd && upd.city) || "").slice(0, 60);
      const province = String(body.province || (upd && upd.province) || "").slice(0, 60);
      db.run(
        `INSERT INTO user_profiles (device_id, name, daily_hours, target_exam, target_date, city, province, updated_at)
         VALUES (?,?,?,?,?,?,?,datetime('now'))
         ON CONFLICT(device_id) DO UPDATE SET name=excluded.name, daily_hours=excluded.daily_hours,
           target_exam=excluded.target_exam, target_date=excluded.target_date,
           city=excluded.city, province=excluded.province, updated_at=datetime('now')`,
        [d, name, dailyHours, targetExam, targetDate, city, province]
      );
      require("./planner.js").generate(db, d, 7);
      require("./recommend.js").build(db, d);
      json(res, 200, profile.get(db, d));
    });
    return true;
  }

  /* ----- Weak / strong topics ----- */
  if (P === "/api/ai/weak-topics" && method === "GET") {
    weak.rebuild(db, dev());
    json(res, 200, { weak: weak.weakTopics(db, dev()), strong: weak.strongTopics(db, dev()) });
    return true;
  }

  /* ----- Study planner ----- */
  if (P === "/api/ai/planner" && method === "GET") {
    json(res, 200, planner.get(db, dev(), query.date || ""));
    return true;
  }
  if (P === "/api/ai/planner/regenerate" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, planner.generate(db, U.did(query, b), parseInt(b.days, 10) || 7)));
    return true;
  }
  if (P === "/api/ai/planner/complete" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, planner.complete(db, U.did(query, b), b.date || "", b.index)));
    return true;
  }

  /* ----- Spaced repetition ----- */
  if (P === "/api/ai/spaced/due" && method === "GET") {
    const items = spaced.due(db, dev(), parseInt(query.limit, 10) || 50);
    json(res, 200, { due: items, count: items.length, stats: spaced.stats(db, dev()) });
    return true;
  }
  if (P === "/api/ai/spaced/review" && method === "POST") {
    readJson(req, res, (b) => {
      const d = U.did(query, b);
      if (!b.mcq_id) { json(res, 400, { error: "mcq_id required" }); return; }
      const out = spaced.review(db, d, b.mcq_id, b.quality);
      require("./weak.js").rebuild(db, d);
      json(res, 200, out);
    });
    return true;
  }

  /* ----- Adaptive quiz ----- */
  if (P === "/api/ai/adaptive/start" && method === "POST") {
    readJson(req, res, (b) => json(res, 201, adaptive.start(db, U.did(query, b), b)));
    return true;
  }
  if (P === "/api/ai/adaptive/next" && method === "GET") {
    json(res, 200, adaptive.nextQ(db, dev()));
    return true;
  }
  if (P === "/api/ai/adaptive/submit" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, adaptive.submit(db, U.did(query, b), b)));
    return true;
  }
  if (P === "/api/ai/adaptive/finish" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, adaptive.finish(db, U.did(query, b))));
    return true;
  }

  /* ----- Mock prediction ----- */
  if (P === "/api/ai/mock/predictions" && method === "GET") {
    json(res, 200, mock.list(db, dev()));
    return true;
  }
  if (P === "/api/ai/mock/predict" && method === "POST") {
    readJson(req, res, (b) => {
      const d = U.did(query, b);
      if (!b.exam_id) { json(res, 400, { error: "exam_id required" }); return; }
      json(res, 200, mock.predict(db, d, b.exam_id));
    });
    return true;
  }

  /* ----- Recommendations ----- */
  if (P === "/api/ai/recommendations" && method === "GET") {
    json(res, 200, recommend.list(db, dev(), parseInt(query.limit, 10) || 20));
    return true;
  }
  if (P === "/api/ai/recommendations/build" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, { recommendations: recommend.build(db, U.did(query, b)) }));
    return true;
  }

  /* ----- Flashcards ----- */
  if (P === "/api/ai/flashcards/due" && method === "GET") {
    json(res, 200, { cards: flashcards.due(db, dev(), parseInt(query.limit, 10) || 25), stats: flashcards.stats(db, dev()) });
    return true;
  }
  if (P === "/api/ai/flashcards/build" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, flashcards.build(db, U.did(query, b), parseInt(b.limit, 10) || 25)));
    return true;
  }
  if (P === "/api/ai/flashcards/review" && method === "POST") {
    readJson(req, res, (b) => {
      const d = U.did(query, b);
      if (b.card_id === undefined) { json(res, 400, { error: "card_id required" }); return; }
      json(res, 200, flashcards.review(db, d, b.card_id, b.quality));
    });
    return true;
  }

  /* ----- Current affairs ----- */
  if (P === "/api/ai/current-affairs" && method === "GET") {
    json(res, 200, current.list(db, {
      period: query.period || "",
      date: query.date || "",
      category: query.category || "",
      limit: parseInt(query.limit, 10) || 50
    }));
    return true;
  }
  if (P === "/api/ai/current-affairs/summary" && method === "GET") {
    json(res, 200, current.summary(db, query.period || "daily"));
    return true;
  }

  /* ----- Analytics ----- */
  if (P === "/api/ai/analytics" && method === "GET") {
    json(res, 200, analytics.overview(db, dev()));
    return true;
  }

  /* ----- Leaderboard periods ----- */
  if (P === "/api/ai/leaderboard" && method === "GET") {
    json(res, 200, leaderboard.list(db, {
      deviceId: dev(),
      period: query.period || "weekly",
      region: query.region || "",
      limit: parseInt(query.limit, 10) || 25
    }));
    return true;
  }

  /* ----- Achievements & notifications ----- */
  if (P === "/api/ai/achievements" && method === "GET") {
    json(res, 200, { achievements: achievements.list(db, dev()), unlocked: achievements.check(db, dev()).unlocked });
    return true;
  }
  if (P === "/api/ai/notifications" && method === "GET") {
    json(res, 200, achievements.notifications(db, dev(), parseInt(query.limit, 10) || 30));
    return true;
  }
  if (P === "/api/ai/notifications/read" && method === "POST") {
    readJson(req, res, (b) => json(res, 200, achievements.markRead(db, U.did(query, b), b.id)));
    return true;
  }

  /* ----- Refresh (rebuild everything for this device) ----- */
  if (P === "/api/ai/refresh" && method === "POST") {
    readJson(req, res, (b) => {
      const d = U.did(query, b);
      profile.refresh(db, d);
      weak.rebuild(db, d);
      planner.generate(db, d, 7);
      recommend.build(db, d);
      const un = achievements.check(db, d).unlocked;
      json(res, 200, { ok: true, profile: profile.get(db, d), unlocked: un });
    });
    return true;
  }

  return false;
}

module.exports = { handle };
