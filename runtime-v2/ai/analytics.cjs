/* runtime-v2/ai/analytics.cjs — analytics aggregations, file-backed.
   Port of ai/analytics.js: daily curve + trend + subject mastery from
   the file history joined to the NDJSON engine; per-type session stats
   and recent predictions from the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const US = require("../user-store.cjs");
const Q = require("../query-engine.cjs");

async function overview(deviceId) {
  const hist = US.history().filter((h) => h.device_id === deviceId);
  const viewed = hist.map((h) => ({ ...h, d: U.localDate(h.answered_at) }));

  const dayMap = new Map();
  for (const r of viewed) {
    let g = dayMap.get(r.d);
    if (!g) { g = { d: r.d, total: 0, skipped: 0, correct: 0, c: 0, t: 0 }; dayMap.set(r.d, g); }
    g.total++;
    if (r.skipped) g.skipped++;
    else if (r.correct) g.correct++;
    if (!r.skipped) { g.t++; if (r.correct) g.c++; }
  }

  const daily = [...dayMap.values()]
    .sort((a, b) => (a.d < b.d ? 1 : -1))
    .slice(0, 14)
    .reverse()
    .map(({ d, total, skipped, correct }) => ({ d, total, skipped, correct }));

  const trend = [...dayMap.values()]
    .sort((a, b) => (a.d < b.d ? -1 : 1))
    .slice(0, 30)
    .map(({ d, c, t }) => ({ d, c, t }));

  const masteryRows = [];
  if (hist.length) {
    const { byId } = await Q.fetchRows(hist.map((h) => h.mcq_id));
    const subMap = new Map();
    for (const h of hist) {
      const m = byId.get(h.mcq_id);
      if (!m) continue;
      let g = subMap.get(m.subject_id);
      if (!g) { g = { subject_id: m.subject_id, total: 0, skipped: 0, correct: 0 }; subMap.set(m.subject_id, g); }
      g.total++;
      if (h.skipped) g.skipped++;
      else if (h.correct) g.correct++;
    }
    const subjects = (await Q.subjects()).reduce((m, s) => (m[s.id] = s, m), {});
    for (const g of [...subMap.values()].sort((a, b) => b.total - a.total).slice(0, 10)) {
      masteryRows.push({ subject_id: g.subject_id, subject_name: subjects[g.subject_id] ? subjects[g.subject_id].name : null, total: g.total, correct: g.correct, skipped: g.skipped, accuracy: U.pct(g.correct, g.total - g.skipped) });
    }
  }

  const byType = new Map();
  for (const s of S.all("learning_sessions", { match: { device_id: deviceId } })) {
    let g = byType.get(s.session_type);
    if (!g) { g = { session_type: s.session_type, n: 0, answered: 0, correct: 0, acc: 0 }; byType.set(s.session_type, g); }
    g.n++;
    g.answered += s.mcqs_answered || 0;
    g.correct += s.correct || 0;
    g.acc += Number(s.accuracy) || 0;
  }
  const sessions = [...byType.values()].map((g) => ({
    session_type: g.session_type, n: g.n, answered: g.answered, correct: g.correct, avg_acc: g.n ? Math.round((g.acc / g.n) * 10) / 10 : 0
  }));

  const lastPreds = S.all("predictions", { match: { device_id: deviceId }, order: [["created_at", "desc"]], limit: 10 });

  return {
    daily,
    trend,
    mastery: masteryRows,
    sessions,
    recent_predictions: lastPreds.map((p) => ({ exam_title: p.exam_title, prob_pass: p.prob_pass, expected_pct: p.readiness, created_at: p.created_at }))
  };
}

module.exports = { overview };
