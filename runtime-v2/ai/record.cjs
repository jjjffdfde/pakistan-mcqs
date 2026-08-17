/* runtime-v2/ai/record.cjs — answer recording, file-backed.
   Port of ai/record.js: history + leaderboard + period leaderboards live in
   the file user-store (userdata/), spaced scheduling on wrong answers goes to
   the JSON table store. Public mcq lookup (topic for scheduling) via the
   NDJSON query engine. NO SQLite, NO SQL. */
"use strict";
const U = require("./util.cjs");
const US = require("../user-store.cjs");
const spaced = require("./spaced.cjs");
const Q = require("../query-engine.cjs");

async function recordAnswer({ device_id, mcq_id, correct, time_taken_sec, skipped, mode, session_id }) {
  const dev = device_id || "default";
  const out = US.recordAnswer({ device_id: dev, mcq_id, correct, time_taken_sec, skipped, mode, session_id });
  if (!out.correct) {
    let topicId = "";
    try {
      const m = await Q.getById(mcq_id);
      topicId = m ? m.topic_id || "" : "";
    } catch (e) { topicId = ""; }
    await spaced.scheduleMcq(dev, mcq_id, topicId);
  }
  return out;
}

module.exports = { recordAnswer };
