/* runtime-v2/ai/flashcards.cjs — flashcards from MCQs, file-backed.
   Port of ai/flashcards.js: card pool streamed from the NDJSON parts,
   option text for the correct label from the per-subject option maps,
   SM-2 lite scheduling in the JSON table store; failed cards cross-schedule
   their underlying MCQ into spaced revision. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const L = require("../data-loader.cjs");
const spaced = require("./spaced.cjs");

async function candidatePool(deviceId, limit) {
  const existing = new Set(S.all("flashcards", { match: { device_id: deviceId } }).map((c) => c.mcq_id));
  const subjects = Object.keys(L.manifest().sourceFiles);
  /* bounded reservoir: keep at most RESERVOIR candidates regardless of
     dataset size so flashcards/build cannot OOM on the 872k-row bank */
  const RESERVOIR = 512;
  const out = [];
  let seen = 0;
  for (const sub of subjects) {
    const options = await L.loadSubjectOptions(sub);
    await L.streamSubject(sub, (row) => {
      if (!row || row.status !== "active") return;
      if (!row.learning_objective || !String(row.learning_objective)) return;
      if (existing.has(row.id)) return;
      seen++;
      if (out.length < RESERVOIR) {
        out.push({
          id: row.id, question: row.question, learning_objective: row.learning_objective,
          memory_trick: row.memory_trick || "", explanation: row.explanation || "",
          correct_answer: row.correct_answer, topic_id: row.topic_id || "",
          confidence_score: Number(row.confidence_score) || 0, trick: row.memory_trick ? 1 : 0,
          text: (options[row.id] || {})[row.correct_answer] || null
        });
      } else if (Math.floor(Math.random() * seen) < RESERVOIR) {
        out[Math.floor(Math.random() * RESERVOIR)] = {
          id: row.id, question: row.question, learning_objective: row.learning_objective,
          memory_trick: row.memory_trick || "", explanation: row.explanation || "",
          correct_answer: row.correct_answer, topic_id: row.topic_id || "",
          confidence_score: Number(row.confidence_score) || 0, trick: row.memory_trick ? 1 : 0,
          text: (options[row.id] || {})[row.correct_answer] || null
        };
      }
    });
  }
  out.sort((a, b) =>
    (b.trick - a.trick) ||
    (a.confidence_score - b.confidence_score) ||
    (a.id < b.id ? -1 : 1));
  return out.slice(0, Math.min(200, limit || 25));
}

async function build(deviceId, limit = 25) {
  const created = [];
  const rows = await candidatePool(deviceId, limit);
  for (const r of rows) {
    const front = r.learning_objective || r.question;
    const backParts = ["Answer: " + (r.text || r.correct_answer)];
    if (r.memory_trick) backParts.push("Trick: " + r.memory_trick);
    if (r.explanation) backParts.push("Why: " + r.explanation.slice(0, 400));
    const cardType = r.memory_trick ? "trick" : "fact";
    const exists = S.get("flashcards", { device_id: deviceId, mcq_id: r.id });
    if (!exists) {
      await S.insert("flashcards", {
        id: S.nextId("flashcards"), device_id: deviceId, mcq_id: r.id, topic_id: "",
        front: front.slice(0, 500), back: backParts.join(" | ").slice(0, 900),
        card_type: cardType, box: 1, ease: 2.5, due_date: U.today(),
        next_review: U.addDays(U.today(), 1), reviews: 0, created_at: U.utcNow()
      });
      created.push(r.id);
    }
  }
  return { built: created.length };
}

function due(deviceId, limit = 25) {
  return S.all("flashcards", {
    match: { device_id: deviceId }, order: [["due_date", "asc"]], limit: Math.min(200, limit || 25)
  })
    .filter((c) => c.due_date <= U.today())
    .map(({ id, mcq_id, front, back, card_type, box, reviews, due_date }) => ({ id, mcq_id, front, back, card_type, box, reviews, due_date }));
}

async function review(deviceId, cardId, quality) {
  const q = U.clamp(parseInt(quality, 10) || 0, 0, 5);
  const card = S.get("flashcards", { id: cardId, device_id: deviceId });
  if (!card) return { error: "card not found" };
  const st = spaced.nextState(card.box, card.ease, q);
  const next = U.addDays(U.today(), st.interval);
  await S.update("flashcards", { id: cardId }, {
    box: st.box, ease: st.ease, due_date: next, next_review: next, reviews: (card.reviews || 0) + 1
  });
  if (q < 3 && card.mcq_id) await spaced.scheduleMcq(deviceId, card.mcq_id, card.topic_id || "");
  return { card_id: cardId, quality: q, box: st.box, ease: st.ease, interval_days: st.interval, next_review: next, cross_scheduled: q < 3 };
}

function stats(deviceId) {
  const rows = S.all("flashcards", { match: { device_id: deviceId } });
  return {
    total: rows.length,
    due: rows.filter((r) => r.due_date <= U.today()).length,
    reviews: rows.reduce((a, r) => a + (r.reviews || 0), 0)
  };
}

module.exports = { build, due, review, stats };
