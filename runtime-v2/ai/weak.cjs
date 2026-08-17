/* runtime-v2/ai/weak.cjs — weak/strong topic detection, file-backed.
   Port of ai/weak.js: history (file user-store) joined to mcq taxonomy via
   the NDJSON query engine; weak_topics/strong_topics in the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const US = require("../user-store.cjs");
const Q = require("../query-engine.cjs");

const WEAK_ACC = 60;
const STRONG_ACC = 80;
const MIN_ATTEMPTS = 3;
const MIN_STRONG_ATTEMPTS = 5;

async function rebuild(deviceId) {
  const hist = US.history().filter((h) => h.device_id === deviceId);
  const ids = hist.map((h) => h.mcq_id);
  const { byId } = await Q.fetchRows(ids);
  const perTopic = new Map();
  for (const h of hist) {
    const m = byId.get(h.mcq_id);
    const topic = m ? m.topic_id : null;
    if (!topic) continue;
    let g = perTopic.get(topic);
    if (!g) { g = { topic_id: topic, subject_id: m.subject_id || "", total: 0, skipped: 0, correct: 0, secs: [] }; perTopic.set(topic, g); }
    g.total++;
    if (h.skipped) g.skipped++;
    else if (h.correct) g.correct++;
    const t = Number(h.time_taken_sec) || 0;
    if (t > 0 && t < 600) g.secs.push(t);
  }

  await S.remove("weak_topics", { device_id: deviceId });
  await S.remove("strong_topics", { device_id: deviceId });
  for (const g of perTopic.values()) {
    const answered = g.total - g.skipped;
    const acc = U.pct(g.correct, answered);
    const avgSec = g.secs.length ? Math.round(g.secs.reduce((a, b) => a + b, 0) / g.secs.length) : null;
    if (answered >= MIN_ATTEMPTS && acc < WEAK_ACC) {
      const slowPenalty = avgSec && avgSec > 60 ? Math.min(0.15, (avgSec - 60) / 600) : 0;
      const skipPenalty = g.total > 0 ? Math.min(0.1, g.skipped / g.total) : 0;
      const weakness = U.round2(1 - acc / 100 + skipPenalty + slowPenalty);
      const priority = U.round2(weakness * 100);
      await S.upsert("weak_topics", { device_id: deviceId, topic_id: g.topic_id }, {
        device_id: deviceId, topic_id: g.topic_id, subject_id: g.subject_id,
        weakness_score: weakness, incorrect: answered - g.correct, total: g.total,
        skipped: g.skipped, slow_avg_sec: Math.round(avgSec || 0), priority, updated_at: U.utcNow()
      });
    } else if (answered >= MIN_STRONG_ATTEMPTS && acc >= STRONG_ACC) {
      await S.upsert("strong_topics", { device_id: deviceId, topic_id: g.topic_id }, {
        device_id: deviceId, topic_id: g.topic_id, subject_id: g.subject_id,
        strength_score: U.round2(acc / 100), correct: g.correct, total: g.total, streak: 0, updated_at: U.utcNow()
      });
    }
  }
  return {
    weak: S.count("weak_topics", { device_id: deviceId }),
    strong: S.count("strong_topics", { device_id: deviceId })
  };
}

async function weakTopics(deviceId, limit = 50) {
  const rows = S.all("weak_topics", {
    match: { device_id: deviceId }, order: [["priority", "desc"]], limit: Math.min(500, limit || 50)
  });
  return attachNames(rows);
}

async function strongTopics(deviceId, limit = 50) {
  const rows = S.all("strong_topics", {
    match: { device_id: deviceId }, order: [["strength_score", "desc"]], limit: Math.min(500, limit || 50)
  });
  return attachNames(rows);
}

async function attachNames(rows) {
  const topics = (await Q.topics()).reduce((m, t) => (m[t.id] = t, m), {});
  const subjects = (await Q.subjects()).reduce((m, s) => (m[s.id] = s, m), {});
  return rows.map((r) => ({
    ...r,
    topic_name: topics[r.topic_id] ? topics[r.topic_id].name : null,
    subject_name: subjects[r.subject_id] ? subjects[r.subject_id].name : null
  }));
}

module.exports = { rebuild, weakTopics, strongTopics };
