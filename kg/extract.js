/* ============================================================
   Phase 14 — Knowledge Graph engine: knowledge extraction
   Mines REAL knowledge from the 872K-MCQ corpus per subject:
   concepts (tag + LO-phrase units), micro-concepts (distinct
   learning objectives), learning objectives (key explanation
   statements), difficulty profiles, exam frequencies.
   No fabricated content — every row traces to corpus evidence.
   ============================================================ */
"use strict";
const U = require("./util.js");

const MIN_TAG_FREQ = 3;
const MAX_CONCEPTS_PER_SUBJECT = 420;
const MAX_MICRO_PER_CONCEPT = 50;
const MAX_LO_PER_MICRO = 12;

/* ---------- concept candidates from tags + learning-objective phrases ---------- */
function candidateFromLO(lo) {
  const s = U.clean(lo);
  const m = s.match(/^(?:Explain|Define|Describe|Discuss|Identify|Outline|Summarize|Distinguish|Compare|Evaluate|Analyze|State|List|Mention|Understand|Know)\s+(.+)$/i);
  if (!m) return "";
  let phrase = m[1].replace(/^the\s+/i, "").replace(/\s+in\s+(?:detail|brief|depth)$/i, "");
  if (phrase.length < 3 || phrase.length > 70) return "";
  return phrase;
}

function buildConceptIndex(rows) {
  const freq = new Map();
  const loPhrases = new Map();
  const firstQuestion = new Map();
  for (const r of rows) {
    const tags = U.parseTags(r.tags);
    for (const t of tags) {
      const k = t.toLowerCase();
      if (!freq.has(k)) freq.set(k, { name: t, freq: 0 });
      freq.get(k).freq++;
      if (!firstQuestion.has(k)) firstQuestion.set(k, r.question || "");
    }
    const lo = U.clean(r.learning_objective);
    if (lo) {
      const phrase = candidateFromLO(lo);
      if (phrase) {
        const k = phrase.toLowerCase();
        if (!loPhrases.has(k)) loPhrases.set(k, { name: phrase, freq: 0 });
        loPhrases.get(k).freq++;
        if (!firstQuestion.has(k)) firstQuestion.set(k, r.question || "");
      }
    }
  }
  const out = new Map();
  for (const [name, info] of freq) if (info.freq >= MIN_TAG_FREQ) out.set(name, { name: info.name, freq: info.freq });
  for (const [name, info] of loPhrases) {
    if (info.freq >= MIN_TAG_FREQ && !out.has(name)) {
      out.set(name, { name: info.name, freq: info.freq, fromLO: true });
    }
  }
  return { index: out, firstQuestion };
}

/* ---------- definitions mined from explanation sentences ---------- */
const TEXT_FIELDS = ["explanation", "learning_objective", "explanation_why_wrong", "memory_trick", "exam_tip"];

function mineDefinition(name, rows) {
  const needle = U.norm(name);
  const candidates = [];
  for (const r of rows) {
    for (const f of TEXT_FIELDS) {
      for (const s of U.sentences(r[f], 5, 180)) {
        const ns = U.norm(s);
        if (!ns.includes(needle)) continue;
        if (s.toLowerCase().startsWith(name.toLowerCase())) return s;
        candidates.push(s);
      }
    }
  }
  return candidates.sort((a, b) => a.length - b.length)[0] || "";
}

/* ---------- per-subject extraction (in-memory, bounded) ---------- */
function extractSubject(db, subjectId, subjectName) {
  const rows = db.all(
    `SELECT id, question, tags, learning_objective, explanation, difficulty, bloom_taxonomy,
            estimated_time_sec, exam_ids, memory_trick, exam_tip, explanation_why_wrong,
            topic_id, chapter_id, subtopic_id
     FROM mcqs WHERE subject_id = ? AND status = 'active'`,
    [subjectId]
  );
  if (!rows.length) return null;

  const topics = db.all(
    `SELECT t.id, t.name, t.chapter_id, c.subject_id
     FROM topics t JOIN chapters c ON c.id = t.chapter_id
     WHERE c.subject_id = ?`, [subjectId]
  );
  const topicName = new Map(topics.map((t) => [t.id, t.name]));
  const topicChapter = new Map(topics.map((t) => [t.id, t.chapter_id]));
  const chapters = db.all("SELECT id, name FROM chapters WHERE subject_id = ?", [subjectId]);
  const chapterName = new Map(chapters.map((c) => [c.id, c.name]));

  const { index, firstQuestion } = buildConceptIndex(rows);
  const conceptNameById = new Map();
  const conceptIdByName = new Map();

  /* pre-parse tags once per row (hot-loop optimisation) */
  const rowTags = rows.map((r) => new Set(U.parseTags(r.tags).map((t) => t.toLowerCase())));

  /* link concepts to dominant topic via question/tag evidence */
  const topicHits = new Map();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.topic_id) continue;
    for (const key of rowTags[i]) {
      if (!index.has(key)) continue;
      const map = topicHits.get(key) || new Map();
      map.set(r.topic_id, (map.get(r.topic_id) || 0) + 1);
      topicHits.set(key, map);
    }
  }

  const stats = new Map(); /* conceptKey -> {difficulty[], bloom[], time[], exams:Set, mcqCount} */
  const conceptMatches = new Map(); /* conceptKey -> mcq id[] (sample 60 for evidence) */

  const usedSlugs = new Map(); /* slug -> count (collision resolver) */
  const uniqueSlug = (s) => {
    const base = U.slugify(s).slice(0, 100);
    const n = usedSlugs.get(base) || 0;
    usedSlugs.set(base, n + 1);
    return `${base}-${n}`;
  };

  let created = 0;
  const entries = [...index.entries()].sort((a, b) => b[1].freq - a[1].freq).slice(0, MAX_CONCEPTS_PER_SUBJECT);
  for (const [key, info] of entries) {
    const topic = topicHits.get(key);
    let bestTopic = "";
    let bestN = 0;
    if (topic) for (const [tid, n] of topic) if (n > bestN) { bestN = n; bestTopic = tid; }

    const stat = { difficulty: [], bloom: [], time: [], exams: new Set(), mcqCount: 0 };
    const matches = [];
    for (let i = 0; i < rows.length; i++) {
      if (!rowTags[i].has(key)) continue;
      const r = rows[i];
      stat.mcqCount++;
      stat.difficulty.push(r.difficulty);
      stat.bloom.push(r.bloom_taxonomy || "");
      if (r.estimated_time_sec) stat.time.push(r.estimated_time_sec);
      for (const e of U.parseExamIds(r.exam_ids)) stat.exams.add(e);
      if (matches.length < 60) matches.push(r);
    }
    stats.set(key, stat);
    conceptMatches.set(key, matches);

    const chapterId = topicChapter.get(bestTopic) || "";
    const definition = mineDefinition(info.name, matches);
    const difficulty = U.majority(stat.difficulty, "medium");
    const bloom = U.majority(stat.bloom, "Understand");
    const examFreq = stat.exams.size;
    const revision = Math.min(5, Math.max(1, 1 + (examFreq >= 8 ? 2 : examFreq >= 3 ? 1 : 0) + (difficulty === "hard" ? 1 : 0)));
    const r = db.run(
      `INSERT INTO kg_concepts (subject_id, chapter_id, topic_id, name, slug, definition, summary, domain,
        difficulty, bloom, exam_frequency, revision_priority, tags, source, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'active')`,
      [subjectId, chapterId || null, bestTopic || null, info.name, uniqueSlug(subjectName + "-" + info.name),
       definition, "", chapterName.get(chapterId) || "", difficulty, bloom, examFreq, revision,
       JSON.stringify([info.name]), "mined"]
    );
    conceptNameById.set(r.lastInsertRowid, info.name);
    conceptIdByName.set(key, r.lastInsertRowid);
    created++;
  }

  /* ---------- micro-concepts + learning objectives ---------- */
  let micros = 0, los = 0;
  for (const [key, cid] of conceptIdByName) {
    const matches = conceptMatches.get(key) || [];
    const loMap = new Map();
    for (const m of matches) {
      const lo = U.clean(m.learning_objective);
      if (lo) {
        if (!loMap.has(lo)) loMap.set(lo, []);
        if (loMap.get(lo).length < 12) loMap.get(lo).push(m);
      }
    }
    const loEntries = [...loMap.entries()].slice(0, MAX_MICRO_PER_CONCEPT);
    const microNameToId = new Map();
    const usedMicroSlugs = new Map();
    const usedLoSlugs = new Map();
    const uniq = (m, s) => {
      const base = (U.slugify(s) || "st").slice(0, 100);
      const n = m.get(base) || 0;
      m.set(base, n + 1);
      return `${base}-${n}`;
    };
    for (const [lo, ms] of loEntries) {
      const diff = U.majority(ms.map((m) => m.difficulty), "medium");
      const bloom = U.majority(ms.map((m) => m.bloom_taxonomy), "Understand");
      const detail = ms[0] ? U.clean(ms[0].explanation).slice(0, 160) : "";
      const mr = db.run(
        `INSERT INTO kg_micro_concepts (concept_id, subject_id, name, slug, detail, difficulty, sort_order)
         VALUES (?,?,?,?,?,?,0)`,
        [cid, subjectId, lo, uniq(usedMicroSlugs, lo), detail, diff]
      );
      microNameToId.set(lo, mr.lastInsertRowid);
      micros++;

      const seen = new Set();
      const stmtSources = [];
      for (const m of ms) {
        for (const f of TEXT_FIELDS) {
          if (stmtSources.length >= 8) break;
          for (const st of U.sentences(m[f], 4, 180)) {
            const n = U.norm(st);
            if (seen.has(n) || stmtSources.length >= 8) continue;
            seen.add(n);
            stmtSources.push(st);
          }
        }
      }
      for (const st of stmtSources) {
        db.run(
          `INSERT INTO kg_learning_objectives (micro_concept_id, concept_id, subject_id, statement, slug, bloom, difficulty, question_patterns, sort_order)
           VALUES (?,?,?,?,?,?,?,?,0)`,
          [mr.lastInsertRowid, cid, subjectId, st, uniq(usedLoSlugs, st), bloom, diff, "[]"]
        );
        los++;
      }
    }
  }

  /* ---------- difficulty profiles ---------- */
  for (const [key, stat] of stats) {
    const cid = conceptIdByName.get(key);
    if (!cid) continue;
    const total = stat.difficulty.length;
    if (!total) continue;
    const easy = stat.difficulty.filter((d) => d === "easy").length;
    const hard = stat.difficulty.filter((d) => d === "hard").length;
    const avgTime = stat.time.length ? Math.round(stat.time.reduce((a, b) => a + b, 0) / stat.time.length) : 40;
    const bloomMap = {};
    for (const b of stat.bloom) bloomMap[b] = (bloomMap[b] || 0) + 1;
    const load = avgTime > 55 ? "high" : avgTime < 25 ? "low" : "medium";
    db.run(
      `INSERT INTO kg_difficulty_profiles (concept_id, easy_pct, medium_pct, hard_pct, avg_time_sec, cognitive_load)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(concept_id) DO UPDATE SET easy_pct=excluded.easy_pct, medium_pct=excluded.medium_pct,
         hard_pct=excluded.hard_pct, avg_time_sec=excluded.avg_time_sec, cognitive_load=excluded.cognitive_load`,
      [cid, Math.round((easy / total) * 100), Math.round(((total - easy - hard) / total) * 100), Math.round((hard / total) * 100), avgTime, load]
    );
  }

  return { subject: subjectId, mcqs: rows.length, concepts: created, micros, los };
}

module.exports = { extractSubject, buildConceptIndex, mineDefinition };
