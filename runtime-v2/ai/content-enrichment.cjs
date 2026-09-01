/* runtime-v2/ai/content-enrichment.cjs — AI-powered study content enrichment */
"use strict";
const AIProvider = require("../providers/ai-provider.cjs");

/* ---------- Local Fallback Implementations (when AI not configured) ---------- */

function localFlashcards(content, count = 10) {
  /* Extract sentences with question-like patterns or key facts */
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 30 && s.length < 200);
  const cards = [];
  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const s = sentences[i];
    /* Try to create a Q&A from the sentence */
    const words = s.split(/\s+/);
    if (words.length > 10) {
      const front = `What does the text state about ${words.slice(0, 5).join(" ")}...?`;
      const back = s;
      cards.push({ front, back });
    }
  }
  /* If not enough, create generic cards */
  while (cards.length < count && sentences.length) {
    const s = sentences.shift();
    cards.push({ front: `Key point from content?`, back: s });
  }
  return cards.slice(0, count);
}

function localKeyTerms(content, count = 15) {
  /* Extract capitalized words and technical terms */
  const words = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const unique = [...new Set(words)].filter(w => w.length > 3);
  const terms = unique.slice(0, count).map(term => ({
    term,
    definition: `Referenced in the study content about ${content.slice(0, 80)}...`,
    importance: Math.random() > 0.5 ? "high" : "medium"
  }));
  return terms;
}

function localSummary(content, maxWords = 150) {
  const words = content.trim().split(/\s+/);
  if (words.length <= maxWords) return content.trim();
  return words.slice(0, maxWords).join(" ") + "...";
}

function localMCQs(content, count = 5) {
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 40 && s.length < 300);
  const mcqs = [];
  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const s = sentences[i];
    const words = s.split(/\s+/);
    if (words.length > 8) {
      const keyWord = words[Math.floor(words.length / 2)];
      mcqs.push({
        question: `According to the content, what is mentioned about ${words.slice(0, 5).join(" ")}?`,
        options: { A: s, B: "Not mentioned", C: "Opposite is true", D: "Partially correct" },
        correctAnswer: "A",
        explanation: `The content states: "${s}"`,
        difficulty: "medium",
        topic: "Content Comprehension"
      });
    }
  }
  return mcqs.slice(0, count);
}

function localConceptMap(content) {
  const words = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const unique = [...new Set(words)].slice(0, 8);
  return {
    mainConcept: "Study Content",
    connections: unique.map(w => ({ from: "Study Content", to: w, relationship: "mentions" }))
  };
}

/* ---------- Prompt Templates ---------- */

const PROMPTS = {
  flashcards: (content, count = 10) => `
You are an expert educator creating flashcards for Pakistani competitive exam preparation (PPSC, FPSC, NTS, CSS, PMS).
Generate ${count} high-quality flashcards from the following study content.

Content:
---
${content}
---

Each flashcard should have:
- A clear, specific question on the front
- A concise, accurate answer on the back
- Focus on facts, definitions, concepts, dates, names, formulas that are testable
- Avoid vague or overly broad questions

Return ONLY a JSON array of objects with "front" and "back" fields.
Example:
[{"front": "What is the capital of Pakistan?", "back": "Islamabad"}, {"front": "When was the Lahore Resolution passed?", "back": "23 March 1940"}]
`,

  keyTerms: (content, count = 15) => `
Extract the ${count} most important key terms/concepts from this study content for Pakistani competitive exams.

Content:
---
${content}
---

Return ONLY a JSON array of objects with "term", "definition", and "importance" (high/medium/low) fields.
Focus on: proper nouns, technical terms, definitions, laws, dates, names, formulas, concepts.
Example:
[{"term": "Lahore Resolution", "definition": "Demand for autonomous Muslim states in British India, passed 23 March 1940", "importance": "high"}, {"term": "Quaid-e-Azam", "definition": "Muhammad Ali Jinnah, founder of Pakistan", "importance": "high"}]
`,

  summary: (content, maxWords = 150) => `
Write a concise summary of this study content for exam preparation. Maximum ${maxWords} words.

Content:
---
${content}
---

Return ONLY the summary text. Focus on: main topic, key facts, important dates/names, conclusions. No fluff.
`,

  mcqs: (content, count = 5) => `
You are an expert creating MCQs for Pakistani competitive exams (PPSC, FPSC, NTS, CSS, PMS).
Generate ${count} high-quality MCQs from the following study content.

Content:
---
${content}
---

Each MCQ must have:
- A clear, specific question stem
- 4 options (A, B, C, D) with exactly ONE correct answer
- Plausible distractors (not obviously wrong)
- A detailed explanation for the correct answer
- Difficulty: easy/medium/hard
- Topic tag

Return ONLY a JSON array of objects with: "question", "options": {"A": "", "B": "", "C": "", "D": ""}, "correctAnswer": "A|B|C|D", "explanation": "", "difficulty": "easy|medium|hard", "topic": ""
Example:
[{"question": "The Lahore Resolution was passed on?", "options": {"A": "14 Aug 1947", "B": "23 Mar 1940", "C": "23 Mar 1956", "D": "3 Jun 1947"}, "correctAnswer": "B", "explanation": "The Lahore Resolution was passed at the 24th session of All-India Muslim League in Minto Park, Lahore on 22-24 March 1940.", "difficulty": "easy", "topic": "Pakistan Movement"}]
`,

  conceptMap: (content) => `
Create a concept map from this study content. Identify the main concept and 5-8 related sub-concepts with brief relationships.

Content:
---
${content}
---

Return ONLY a JSON object with "mainConcept" and "connections" array.
Each connection: {"from": "", "to": "", "relationship": ""}
Example:
{"mainConcept": "Constitution of 1973", "connections": [{"from": "Constitution of 1973", "to": "Fundamental Rights", "relationship": "guarantees"}, {"from": "Constitution of 1973", "to": "Parliamentary System", "relationship": "establishes"}]}
`
};

/* ---------- AI Service ---------- */

async function callAI(prompt, options = {}) {
  const provider = AIProvider.getProvider ? AIProvider.getProvider() : AIProvider;
  const st = AIProvider.status ? AIProvider.status() : { configured: false };
  
  if (!st.configured) {
    /* Return null to trigger local fallback */
    return null;
  }
  
  const model = options.model || provider.defaultModel;
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 2000;
  
  return provider.generateText(prompt, { model, temperature, maxTokens });
}

function parseJSONResponse(text) {
  /* Extract JSON from markdown code blocks or plain text */
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  const jsonStr = match ? match[1] : text;
  try {
    return JSON.parse(jsonStr.trim());
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e.message}\nRaw: ${text.slice(0, 500)}`);
  }
}

/* ---------- Public API with Local Fallbacks ---------- */

async function generateFlashcards(content, count = 10) {
  if (!content || content.length < 50) throw new Error("Content too short for flashcard generation");
  try {
    const prompt = PROMPTS.flashcards(content, count);
    const response = await callAI(prompt, { temperature: 0.3, maxTokens: 2500 });
    if (!response) return localFlashcards(content, count);
    const cards = parseJSONResponse(response);
    if (!Array.isArray(cards)) throw new Error("AI returned invalid flashcard format");
    return cards.filter(c => c.front && c.back).slice(0, count);
  } catch (e) {
    return localFlashcards(content, count);
  }
}

async function extractKeyTerms(content, count = 15) {
  if (!content || content.length < 50) throw new Error("Content too short for key term extraction");
  try {
    const prompt = PROMPTS.keyTerms(content, count);
    const response = await callAI(prompt, { temperature: 0.2, maxTokens: 2000 });
    if (!response) return localKeyTerms(content, count);
    const terms = parseJSONResponse(response);
    if (!Array.isArray(terms)) throw new Error("AI returned invalid key terms format");
    return terms.filter(t => t.term && t.definition).slice(0, count);
  } catch (e) {
    return localKeyTerms(content, count);
  }
}

async function generateSummary(content, maxWords = 150) {
  if (!content || content.length < 50) throw new Error("Content too short for summary");
  try {
    const prompt = PROMPTS.summary(content, maxWords);
    const response = await callAI(prompt, { temperature: 0.2, maxTokens: 500 });
    if (!response) return localSummary(content, maxWords);
    return response.trim();
  } catch (e) {
    return localSummary(content, maxWords);
  }
}

async function generateMCQs(content, count = 5) {
  if (!content || content.length < 100) throw new Error("Content too short for MCQ generation");
  try {
    const prompt = PROMPTS.mcqs(content, count);
    const response = await callAI(prompt, { temperature: 0.4, maxTokens: 3000 });
    if (!response) return localMCQs(content, count);
    const mcqs = parseJSONResponse(response);
    if (!Array.isArray(mcqs)) throw new Error("AI returned invalid MCQ format");
    return mcqs.filter(m => m.question && m.options && m.correctAnswer).slice(0, count);
  } catch (e) {
    return localMCQs(content, count);
  }
}

async function generateConceptMap(content) {
  if (!content || content.length < 100) throw new Error("Content too short for concept map");
  try {
    const prompt = PROMPTS.conceptMap(content);
    const response = await callAI(prompt, { temperature: 0.2, maxTokens: 1500 });
    if (!response) return localConceptMap(content);
    return parseJSONResponse(response);
  } catch (e) {
    return localConceptMap(content);
  }
}

async function enrichContent(contentId, contentText, types = ["flashcards", "keyTerms", "summary"]) {
  const results = {};
  const errors = {};
  
  for (const type of types) {
    try {
      switch (type) {
        case "flashcards":
          results.flashcards = await generateFlashcards(contentText, 10);
          break;
        case "keyTerms":
          results.keyTerms = await extractKeyTerms(contentText, 12);
          break;
        case "summary":
          results.summary = await generateSummary(contentText, 150);
          break;
        case "mcqs":
          results.mcqs = await generateMCQs(contentText, 5);
          break;
        case "conceptMap":
          results.conceptMap = await generateConceptMap(contentText);
          break;
      }
    } catch (e) {
      errors[type] = e.message;
    }
  }
  
  return { contentId, enrichedAt: new Date().toISOString(), ...results, errors: Object.keys(errors).length ? errors : null };
}

module.exports = {
  generateFlashcards,
  extractKeyTerms,
  generateSummary,
  generateMCQs,
  generateConceptMap,
  enrichContent,
  PROMPTS
};