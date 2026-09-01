/* runtime-v2/flashcards.cjs — Spaced Repetition Flashcards (SM-2 algorithm) */
"use strict";
const fs = require("fs");
const path = require("path");
const { config } = require("./config.cjs");

const FLASHCARDS_FILE = path.join(config.indexDir, "flashcards.json");

/* ---------- SM-2 Algorithm ---------- */
/*
  SM-2 parameters:
  - q: quality of response (0-5)
  - easiness: easiness factor (default 2.5, min 1.3)
  - interval: days between reviews
  - repetitions: number of successful recalls
*/

function initCard(cardId, front, back, source = "manual", sourceId = null) {
  return {
    id: cardId,
    front,
    back,
    source,
    sourceId,
    createdAt: new Date().toISOString(),
    /* SM-2 state */
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date().toISOString().slice(0, 10), /* due today */
    lastReviewed: null,
    history: [] /* {date, quality, easiness, interval} */
  };
}

function loadFlashcards() {
  if (!fs.existsSync(FLASHCARDS_FILE)) return {};
  return JSON.parse(fs.readFileSync(FLASHCARDS_FILE, "utf8"));
}

function saveFlashcards(cards) {
  fs.writeFileSync(FLASHCARDS_FILE, JSON.stringify(cards, null, 2));
}

/* SM-2 core algorithm */
function sm2Update(card, quality) {
  /* quality: 0=complete blackout, 1=incorrect but recognized, 2=incorrect but easy,
     3=correct with difficulty, 4=correct, 5=perfect */
  
  let { easiness, interval, repetitions } = card;
  
  if (quality >= 3) {
    /* Correct response */
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easiness);
    repetitions += 1;
  } else {
    /* Incorrect response - reset */
    repetitions = 0;
    interval = 1;
  }
  
  /* Update easiness factor */
  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness < 1.3) easiness = 1.3;
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  
  const updated = {
    ...card,
    easiness: Math.round(easiness * 100) / 100,
    interval,
    repetitions,
    dueDate: dueDate.toISOString().slice(0, 10),
    lastReviewed: new Date().toISOString(),
    history: [...(card.history || []).slice(-50), {
      date: new Date().toISOString().slice(0, 10),
      quality,
      easiness: Math.round(easiness * 100) / 100,
      interval
    }]
  };
  
  return updated;
}

/* Get cards due for review */
function getDueCards(cards, limit = 50) {
  const today = new Date().toISOString().slice(0, 10);
  return Object.values(cards)
    .filter(c => c.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}

/* Get all cards with stats */
function getAllCards(cards) {
  const today = new Date().toISOString().slice(0, 10);
  return Object.values(cards).map(c => ({
    ...c,
    isDue: c.dueDate <= today,
    daysOverdue: c.dueDate <= today ? Math.ceil((new Date(today) - new Date(c.dueDate)) / 86400000) : 0
  }));
}

/* Stats */
function getStats(cards) {
  const all = Object.values(cards);
  const today = new Date().toISOString().slice(0, 10);
  const due = all.filter(c => c.dueDate <= today).length;
  const newCards = all.filter(c => c.repetitions === 0).length;
  const learning = all.filter(c => c.repetitions > 0 && c.repetitions < 3).length;
  const review = all.filter(c => c.repetitions >= 3).length;
  const avgEasiness = all.length ? all.reduce((s, c) => s + c.easiness, 0) / all.length : 2.5;
  
  return { total: all.length, due, newCards, learning, review, avgEasiness: Math.round(avgEasiness * 100) / 100 };
}

/* Add cards from AI generation or manual */
function addFlashcards(newCards) {
  const cards = loadFlashcards();
  let added = 0;
  for (const c of newCards) {
    if (!c.front || !c.back) continue;
    const id = "fc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    cards[id] = initCard(id, c.front, c.back, c.source || "ai", c.sourceId || null);
    added++;
  }
  saveFlashcards(cards);
  return { added, total: Object.keys(cards).length };
}

/* Record answer */
function recordAnswer(cardId, quality) {
  const cards = loadFlashcards();
  const card = cards[cardId];
  if (!card) return { error: "Card not found" };
  if (quality < 0 || quality > 5) return { error: "Quality must be 0-5" };
  
  cards[cardId] = sm2Update(card, quality);
  saveFlashcards(cards);
  return { card: cards[cardId] };
}

/* Delete card */
function deleteCard(cardId) {
  const cards = loadFlashcards();
  if (!cards[cardId]) return { error: "Card not found" };
  delete cards[cardId];
  saveFlashcards(cards);
  return { ok: true };
}

/* Reset card */
function resetCard(cardId) {
  const cards = loadFlashcards();
  const card = cards[cardId];
  if (!card) return { error: "Card not found" };
  cards[cardId] = initCard(cardId, card.front, card.back, card.source, card.sourceId);
  saveFlashcards(cards);
  return { card: cards[cardId] };
}

module.exports = {
  initCard,
  loadFlashcards,
  saveFlashcards,
  sm2Update,
  getDueCards,
  getAllCards,
  getStats,
  addFlashcards,
  recordAnswer,
  deleteCard,
  resetCard,
  FLASHCARDS_FILE
};