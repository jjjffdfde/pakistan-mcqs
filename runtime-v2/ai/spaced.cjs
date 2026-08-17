/* runtime-v2/ai/spaced.cjs — spaced repetition (SM-2 lite), file-backed.
   Port of ai/spaced.js; revision_schedule lives in the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");

const BOXES = [1, 3, 7, 14, 30, 60, 90];

function nextState(box, ease, quality) {
  let e = Number(ease) || 2.5;
  if (quality >= 3) e = Math.max(1.3, e + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  else e = Math.max(1.3, e - 0.2);
  let b = box;
  if (quality < 3) b = 1;
  else if (quality === 3) b = Math.min(box + 1, BOXES.length);
  else b = Math.min(box + 1, BOXES.length);
  if (quality === 5 && box >= 2) b = Math.min(box + 1, BOXES.length);
  const interval = quality < 3 ? 1 : BOXES[Math.max(0, Math.min(b - 1, BOXES.length - 1))];
  return { box: b, ease: Math.round(e * 100) / 100, interval };
}

function dueRows(deviceId, limit) {
  return S.all("revision_schedule", {
    match: { device_id: deviceId },
    order: [["due_date", "asc"]],
    limit: Math.min(200, limit || 50)
  }).filter((r) => r.due_date <= U.today() && r.status === "active");
}

function scheduleMcq(deviceId, mcqId, topicId) {
  return S.upsert(
    "revision_schedule",
    { device_id: deviceId, mcq_id: mcqId },
    {
      device_id: deviceId, mcq_id: mcqId, topic_id: topicId || "",
      box: 1, ease: 2.5, interval_days: 1, due_date: U.today(), next_review: U.addDays(U.today(), 1), status: "active"
    }
  );
}

function review(deviceId, mcqId, quality) {
  const q = U.clamp(parseInt(quality, 10) || 0, 0, 5);
  const row = S.get("revision_schedule", { device_id: deviceId, mcq_id: mcqId });
  const st = row ? nextState(row.box, row.ease, q) : nextState(1, 2.5, q);
  const next = U.addDays(U.today(), st.interval);
  if (row) {
    return S.update("revision_schedule", { device_id: deviceId, mcq_id: mcqId }, {
      box: st.box, ease: st.ease, interval_days: st.interval, due_date: next,
      last_review: U.today(), next_review: next, reviews: (row.reviews || 0) + 1
    }).then(() => ({
      mcq_id: mcqId, quality: q, box: st.box, ease: st.ease, interval_days: st.interval, next_review: next
    }));
  }
  return scheduleMcq(deviceId, mcqId, "").then(() =>
    S.update("revision_schedule", { device_id: deviceId, mcq_id: mcqId }, {
      box: st.box, ease: st.ease, interval_days: st.interval, due_date: next,
      last_review: U.today(), next_review: next, reviews: 1
    })).then(() => ({
      mcq_id: mcqId, quality: q, box: st.box, ease: st.ease, interval_days: st.interval, next_review: next
    }));
}

function due(deviceId, limit) { return dueRows(deviceId, limit); }

function dueCount(deviceId) {
  return S.all("revision_schedule", { match: { device_id: deviceId } })
    .filter((r) => r.due_date <= U.today() && r.status === "active").length;
}

function stats(deviceId) {
  const rows = S.all("revision_schedule", { match: { device_id: deviceId } });
  return {
    total: rows.length,
    due: rows.filter((r) => r.due_date <= U.today()).length,
    reviews: rows.reduce((a, r) => a + (r.reviews || 0), 0)
  };
}

module.exports = { scheduleMcq, review, due, dueCount, stats, nextState };
