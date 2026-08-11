/* ============================================================
   Phase 14 — Knowledge Graph engine: question blueprints
   Classifies the real MCQs matched to each concept into 18
   blueprint families (definition, calculation, exception, ...).
   For every concept the dominant family becomes a
   kg_question_blueprints row with a real stem pattern and the
   distractor strategy that family demands. Structure only —
   no MCQs are generated here.
   ============================================================ */
"use strict";
const U = require("./util.js");

const CHUNK = 150000;
const MAX_SAMPLE = 40;

/* ordered, priority-ranked families; first match wins */
const FAMILIES = [
  { name: "true-false", re: /which of the following (is|are|statements? is|statements? are).{0,60}(true|correct|false|incorrect)|statements? (is|are) (true|correct|false)|find (out )?(the )?(true|correct|wrong|false)|identify the (true|correct|incorrect)/i },
  { name: "exception-negative", re: /\b(not|except|incorrect|wrong|false|least)\b/i, probe: /which|following|all|one of/i },
  { name: "match", re: /match (the )?(following|list|column)|column a.*column b/i },
  { name: "order-sequence", re: /(correct )?(order|sequence)|arrange|chronolog|put (the )?(following|them).*(order)|(first|second|then|finally)/i },
  { name: "fill-blank", re: /_{2,}|\[blank\]|complete (the )?(sentence|statement)|choose the (word|option|correct).*(blank)|fill in/i },
  { name: "data-interpretation", re: /graph|chart|table below|following data|based on (the )?(graph|table|data|figure)|from (the )?(graph|table|data)/i },
  { name: "calculation", re: /calculate|compute|find (the )?(value|number|sum|average|area|volume|perimeter)|evaluate|solve|how many|what (is|will be|would be) (the )?(result|total|value)|per cent|percent|profit|ratio|^[0-9]/i },
  { name: "formula", re: /formula|equation|expression|derive|\[a-z\]\s*=\s*|x\s*\+\s*\d/i },
  { name: "comparison", re: /difference (between|of)|compare(d)? (with|to|between)|unlike|rather than|vs\.|than\b.{0,30}or\b/i },
  { name: "cause-effect", re: /due to|because of|as a result|results? in|caused by|leads? to|owing to|attributable to|consequence of/i },
  { name: "classification", re: /belongs? to|classif(y|ied)|groups? (of|in)|category|categor|types? of|part of|which (of the following|one).*(is|are) (a |an )?(type|kind|class|group)/i },
  { name: "process-mechanism", re: /mechanism|steps? (in|of)|process of|stage(s|s)? of|phase(s)? of|pathway|how does|how is/i },
  { name: "scenario-application", re: /if a |suppose|imagine|a patient|in practice|applied to|real[- ]world|what would happen|consider (a|the|this)/i },
  { name: "definition", re: /^what (is|are|was|were)|^which (is|are)|define|means? (that|by)|refers? to|is called|is known as|is termed|is defined as|^the term/i },
  { name: "terminology-translation", re: /meaning of|stands for|abbreviation|full form|synonym|antonym|opposite of|urdu meaning|meaning of the/i },
  { name: "diagnostic-clinical", re: /diagnos|clinical feature|symptom|signs? (of|and)|present(s|ed)? with|treatment of|management of|investigation of|drug of choice|first[- ]line/i },
  { name: "recall-fact", re: /who (is|was|invented|discovered|founded)|when (was|did|is)|where (is|was)|in which (year|century|country|city)|which country|which year|who founded/i },
  { name: "memory-mnemonic", re: /mnemonic|trick to remember|easy way to remember/i }
];

const DISTRACTOR_STRATEGY = {
  "definition": "Near-synonyms of the defined term from the same domain pool",
  "true-false": "Plausible statements that are actually true or subtly inverted",
  "exception-negative": "Correct statements rephrased as lures; the one false statement is the answer",
  "match": "Swapped pairings from the same lists",
  "order-sequence": "Reversed or partially correct sequences",
  "fill-blank": "Words fitting the sentence grammatically but semantically wrong",
  "data-interpretation": "Values read from the wrong row/column or misread units",
  "calculation": "Arithmetic slips: decimal shifts, unit conversion errors, swapped formula terms",
  "formula": "Common formula variants with missing or inverted terms",
  "comparison": "Attributes swapped between the compared items",
  "cause-effect": "Plausible causes that are correlated but not causal",
  "classification": "Members of neighbouring groups or categories",
  "process-mechanism": "Steps from related but different processes; wrong order",
  "scenario-application": "Same scenario with a subtle parameter change",
  "terminology-translation": "Close-sounding or semantically related terms",
  "diagnostic-clinical": "Features of the most similar differential diagnosis",
  "recall-fact": "Nearby dates, names and places from the same period",
  "memory-mnemonic": "Sound-alike terms likely to be confused",
  "general": "Plausible alternatives from the same subject context"
};

function classify(question) {
  const q = String(question || "");
  for (const f of FAMILIES) {
    const m = q.match(f.re);
    if (!m) continue;
    if (f.name === "exception-negative" && !f.probe.test(q)) continue;
    return f.name;
  }
  return "general";
}

function blueprintSubject(db, subjectId, log) {
  const concepts = db.all("SELECT id, name FROM kg_concepts WHERE subject_id = ? ORDER BY id", [subjectId]);
  if (!concepts.length) return 0;
  const byName = new Map();
  for (const c of concepts) byName.set(c.name.toLowerCase(), c.id);
  const firstLo = new Map();
  for (const r of db.all("SELECT concept_id, MIN(id) mid FROM kg_learning_objectives WHERE subject_id = ? GROUP BY concept_id", [subjectId])) {
    firstLo.set(r.concept_id, r.mid);
  }

  /* sample pass over this subject's mcqs (chunked) */
  const counts = new Map(); /* conceptId -> Map(type -> n) */
  const samples = new Map(); /* conceptId -> first sample question */
  const diff = new Map(); /* conceptId -> [difficulty...] */
  const bloom = new Map();
  let lastRowId = 0;
  while (true) {
    const rows = db.all(
      `SELECT rowid, tags, question, difficulty, bloom_taxonomy FROM mcqs
       WHERE subject_id = ? AND status = 'active' AND rowid > ? ORDER BY rowid LIMIT ${CHUNK}`,
      [subjectId, lastRowId]
    );
    if (!rows.length) break;
    for (const r of rows) {
      for (const t of U.parseTags(r.tags)) {
        const cid = byName.get(t.toLowerCase());
        if (!cid) continue;
        if (!counts.has(cid)) counts.set(cid, new Map());
        const type = classify(r.question);
        counts.get(cid).set(type, (counts.get(cid).get(type) || 0) + 1);
        if (!samples.has(cid)) samples.set(cid, String(r.question).replace(/\s+/g, " ").slice(0, 220));
        if (!diff.has(cid)) diff.set(cid, []);
        const d = diff.get(cid);
        if (d.length < 30) d.push(r.difficulty || "");
        if (!bloom.has(cid)) bloom.set(cid, []);
        const b = bloom.get(cid);
        if (b.length < 30) b.push(r.bloom_taxonomy || "");
      }
    }
    lastRowId = rows[rows.length - 1].rowid;
  }

  let n = 0;
  const ins = db.prepare(
    `INSERT OR IGNORE INTO kg_question_blueprints
       (objective_id, concept_id, subject_id, blueprint_type, stem_pattern, answer_shape,
        distractor_strategy, difficulty, bloom)
     VALUES (?,?,?,?,?,?,?,?,?)`
  );
  for (const [cid, cm] of counts) {
    let best = "general", bestN = 0;
    for (const [type, k] of cm) if (k > bestN) { bestN = k; best = type; }
    const difficulty = U.majority(diff.get(cid) || [], "medium");
    const b = U.majority(bloom.get(cid) || [], "Understand");
    ins.run(firstLo.get(cid) || null, cid, subjectId, best, samples.get(cid) || "",
      "single-letter", DISTRACTOR_STRATEGY[best] || DISTRACTOR_STRATEGY.general, difficulty, b);
    n++;
  }
  return n;
}

function blueprintAll(db, log) {
  const subjects = db.all("SELECT DISTINCT subject_id FROM kg_concepts");
  let total = 0, active = 0;
  for (const s of subjects) {
    const n = blueprintSubject(db, s.subject_id, log);
    total += n;
    if (n) active++;
  }
  if (log) log(`[blueprint] ${total} blueprints across ${active} subjects`);
  return { blueprints: total, subjects: active };
}

module.exports = { classify, blueprintSubject, blueprintAll, DISTRACTOR_STRATEGY };
