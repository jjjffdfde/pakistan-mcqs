#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Knowledge Pack Engine (Phase 14, Step 2)

   Builds ONE independent Knowledge Pack per subject (18 sections),
   written to kg_knowledge_packs. Every section is derived from that
   subject's OWN real content — the taxonomy (chapters/topics/subtopics)
   and the subject's materialised MCQ knowledge metadata
   (learning_objective, memory_trick, exam_tip, explanation,
   explanation_why_wrong, difficulty, tags). Nothing is fabricated and
   no pack is reused across subjects: every query is scoped by subject_id.

   Sparse subjects (e.g. botany, constitution) yield genuinely smaller
   sections rather than padded placeholders — honesty over coverage-theatre,
   per the Phase-14 rule "Do NOT create placeholder concepts."

   Offline, zero-dependency. Idempotent + incremental: a pack is rewritten
   only when its content hash changes; otherwise the existing row is kept.

   Usage:
     node pipeline/kg/pack-engine.js                 # all subjects
     node pipeline/kg/pack-engine.js --subjects botany,physics
     node pipeline/kg/pack-engine.js --limit 20      # first N (by sort_order)
     node pipeline/kg/pack-engine.js --force         # rewrite even if unchanged
   ============================================================ */
"use strict";
const crypto = require("crypto");
const { open } = require("../../db/engine.js");

/* ---------- tiny arg parser ---------- */
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith("--")) {
      const key = t.slice(2);
      const nxt = argv[i + 1];
      if (nxt && !nxt.startsWith("--")) { a[key] = nxt; i++; } else a[key] = true;
    }
  }
  return a;
}

/* ---------- text helpers (dedup, clean, cap) ---------- */
const clean = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
const firstSentence = (s) => {
  const t = clean(s);
  const m = t.match(/^.*?[.?!](?:\s|$)/);
  return (m ? m[0] : t).trim();
};
function uniqCap(arr, cap, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (item == null) continue;
    const key = clean(keyFn ? keyFn(item) : item).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= cap) break;
  }
  return out;
}
const slugify = (s) => clean(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/* ============================================================
   Section builders — each takes (db, subject, ctx) and returns
   a JSON-serialisable value sourced ONLY from real subject data.
   ============================================================ */

/* Core Domains = the subject's chapters (real taxonomy spine). */
function coreDomains(db, s) {
  return db.all(
    "SELECT id, name FROM chapters WHERE subject_id=? ORDER BY sort_order, id", [s.id]
  ).map((c) => ({ id: c.id, name: clean(c.name) }));
}

/* Sub Domains = the subject's topics, tagged with their parent chapter. */
function subDomains(db, s) {
  return db.all(
    `SELECT t.id, t.name, c.name AS chapter
       FROM topics t JOIN chapters c ON t.chapter_id=c.id
      WHERE c.subject_id=? ORDER BY c.sort_order, t.sort_order, t.id`, [s.id]
  ).map((t) => ({ id: t.id, name: clean(t.name), chapter: clean(t.chapter) }));
}

/* Concept Map = chapter → topic → [subtopics] (the real hierarchy). */
function conceptMap(db, s) {
  const rows = db.all(
    `SELECT c.name AS chapter, t.name AS topic, st.name AS subtopic
       FROM chapters c
       JOIN topics t   ON t.chapter_id=c.id
       LEFT JOIN subtopics st ON st.topic_id=t.id
      WHERE c.subject_id=?
      ORDER BY c.sort_order, t.sort_order, st.id`, [s.id]
  );
  const map = {};
  for (const r of rows) {
    const ch = clean(r.chapter), tp = clean(r.topic);
    if (!map[ch]) map[ch] = {};
    if (!map[ch][tp]) map[ch][tp] = [];
    if (r.subtopic) map[ch][tp].push(clean(r.subtopic));
  }
  return map;
}

/* Glossary = subtopic names (the finest real taxonomy leaves) + a short
   gloss pulled from a matching MCQ learning-objective where one exists. */
function glossary(db, s) {
  const subs = db.all(
    `SELECT DISTINCT st.name
       FROM subtopics st JOIN topics t ON st.topic_id=t.id JOIN chapters c ON t.chapter_id=c.id
      WHERE c.subject_id=? ORDER BY st.name`, [s.id]
  ).map((r) => clean(r.name)).filter(Boolean);
  return uniqCap(subs, 120, (x) => x).map((term) => ({ term }));
}

/* Terminology = the distinct tags the subject's MCQs actually carry. */
function terminology(db, s) {
  const rows = db.all(
    "SELECT tags FROM mcqs WHERE subject_id=? AND status='active' AND tags IS NOT NULL AND tags<>'' LIMIT 6000", [s.id]
  );
  const freq = new Map();
  for (const r of rows) {
    let arr = [];
    try { arr = JSON.parse(r.tags); } catch { arr = String(r.tags).split(/[,|]/); }
    for (const raw of arr) {
      const tag = clean(raw).toLowerCase();
      if (!tag || tag.length < 2 || tag === "deep-kb") continue;
      freq.set(tag, (freq.get(tag) || 0) + 1);
    }
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80)
    .map(([term, count]) => ({ term, count }));
}

/* Definitions = MCQs whose stem is definitional; term from the stem,
   definition from the correct answer + one explanation sentence. Real Q/A. */
function definitions(db, s) {
  const rows = db.all(
    `SELECT question, correct_answer, explanation
       FROM mcqs
      WHERE subject_id=? AND status='active'
        AND (question LIKE 'What is %' OR question LIKE 'What are %'
             OR question LIKE 'Define %' OR question LIKE 'What does %mean%'
             OR question LIKE 'The term %')
      LIMIT 4000`, [s.id]
  );
  const out = [];
  for (const r of rows) {
    const term = clean(r.question)
      .replace(/^(what is|what are|define|what does|the term)\s+/i, "")
      .replace(/[?:].*$/, "").replace(/\bmean\b.*$/i, "").replace(/[?.]$/, "").trim();
    if (!term || term.length < 2 || term.length > 60) continue;
    const def = clean(r.correct_answer);
    const why = firstSentence(r.explanation);
    if (!def) continue;
    out.push({ term, definition: def, note: why && why.toLowerCase() !== def.toLowerCase() ? why : "" });
  }
  return uniqCap(out, 80, (x) => x.term);
}

/* Important Facts = the subject's distinct learning objectives — already
   concise, exam-relevant fact statements authored per question. */
function importantFacts(db, s) {
  const rows = db.all(
    `SELECT DISTINCT learning_objective AS lo
       FROM mcqs
      WHERE subject_id=? AND status='active'
        AND learning_objective IS NOT NULL AND learning_objective<>''
      LIMIT 4000`, [s.id]
  );
  return uniqCap(rows.map((r) => clean(r.lo)).filter((x) => x.length >= 8), 100, (x) => x)
    .map((fact) => ({ fact }));
}

/* Rules = explanation sentences that state a rule/law/principle. Conservative
   pattern-match on real explanations; empty when the subject has none. */
function rules(db, s) {
  const rows = db.all(
    `SELECT explanation FROM mcqs
      WHERE subject_id=? AND status='active' AND explanation IS NOT NULL AND explanation<>''
        AND (explanation LIKE '%rule%' OR explanation LIKE '%law of%' OR explanation LIKE '%principle%'
             OR explanation LIKE '% must %' OR explanation LIKE '%always %' OR explanation LIKE '%never %')
      LIMIT 3000`, [s.id]
  );
  const out = [];
  for (const r of rows) {
    const sent = firstSentence(r.explanation);
    if (sent.length >= 20 && sent.length <= 200 &&
        /\b(rule|law|principle|must|always|never|cannot|require)\b/i.test(sent)) {
      out.push(sent);
    }
  }
  return uniqCap(out, 50, (x) => x).map((rule) => ({ rule }));
}

/* Formulas = explanation sentences carrying a genuine relational expression
   (an '=' between symbolic terms). Rich for math/physics/chem, empty elsewhere. */
function formulas(db, s) {
  const rows = db.all(
    `SELECT explanation FROM mcqs
      WHERE subject_id=? AND status='active' AND explanation LIKE '%=%'
      LIMIT 4000`, [s.id]
  );
  const out = [];
  for (const r of rows) {
    const t = clean(r.explanation);
    /* pull the '=' bearing clause; require letters on the LHS so it is a formula,
       not a bare arithmetic line like "12 × 3 = 36". */
    const m = t.match(/([A-Za-z][A-Za-z0-9 ()%_/·×\-+^]{1,40}=\s*[A-Za-z0-9][^.;]{1,60})/);
    if (!m) continue;
    const expr = clean(m[1]);
    if (!/[A-Za-z]{2,}/.test(expr.split("=")[0])) continue; /* LHS must be symbolic */
    out.push(expr);
  }
  return uniqCap(out, 60, (x) => x).map((formula) => ({ formula }));
}

/* Processes = topics/subtopics whose names denote an ordered process/cycle.
   Real taxonomy names only. */
function processes(db, s) {
  const rows = db.all(
    `SELECT DISTINCT nm FROM (
        SELECT t.name AS nm FROM topics t JOIN chapters c ON t.chapter_id=c.id WHERE c.subject_id=?
        UNION
        SELECT st.name AS nm FROM subtopics st JOIN topics t ON st.topic_id=t.id JOIN chapters c ON t.chapter_id=c.id WHERE c.subject_id=?
     ) WHERE nm LIKE '%process%' OR nm LIKE '%cycle%' OR nm LIKE '%steps%'
          OR nm LIKE '%stage%' OR nm LIKE '%procedure%' OR nm LIKE '%method%'
          OR nm LIKE '%pathway%' OR nm LIKE '%workflow%' OR nm LIKE '%lifecycle%'`,
    [s.id, s.id]
  );
  return uniqCap(rows.map((r) => clean(r.nm)), 40, (x) => x).map((name) => ({ name }));
}

/* Classifications = topics/subtopics denoting a taxonomy/typology (real names). */
function classifications(db, s) {
  const rows = db.all(
    `SELECT DISTINCT nm FROM (
        SELECT t.name AS nm FROM topics t JOIN chapters c ON t.chapter_id=c.id WHERE c.subject_id=?
        UNION
        SELECT st.name AS nm FROM subtopics st JOIN topics t ON st.topic_id=t.id JOIN chapters c ON t.chapter_id=c.id WHERE c.subject_id=?
     ) WHERE nm LIKE '%type%' OR nm LIKE '%classification%' OR nm LIKE '%kinds%'
          OR nm LIKE '%categor%' OR nm LIKE '%class of%' OR nm LIKE '%taxonom%'
          OR nm LIKE '%branches%' OR nm LIKE '%forms of%'`,
    [s.id, s.id]
  );
  return uniqCap(rows.map((r) => clean(r.nm)), 40, (x) => x).map((name) => ({ name }));
}

/* Relationships = the real parent→child taxonomy edges (chapter→topic),
   the structural relationships the subject already encodes. */
function relationships(db, s) {
  const rows = db.all(
    `SELECT c.name AS parent, t.name AS child
       FROM topics t JOIN chapters c ON t.chapter_id=c.id
      WHERE c.subject_id=? ORDER BY c.sort_order, t.sort_order LIMIT 200`, [s.id]
  );
  return rows.map((r) => ({ parent: clean(r.parent), child: clean(r.child), type: "contains" }));
}

/* Common Misconceptions = distinct why-wrong explanations (authored per
   distractor: exactly the misconceptions the subject's questions target). */
function misconceptions(db, s) {
  const rows = db.all(
    `SELECT DISTINCT explanation_why_wrong AS w
       FROM mcqs
      WHERE subject_id=? AND status='active'
        AND explanation_why_wrong IS NOT NULL AND explanation_why_wrong<>''
      LIMIT 4000`, [s.id]
  );
  return uniqCap(rows.map((r) => firstSentence(r.w)).filter((x) => x.length >= 12), 60, (x) => x)
    .map((misconception) => ({ misconception }));
}

/* Memory Techniques = distinct memory_trick values (authored, subject-specific). */
function memoryTechniques(db, s) {
  const rows = db.all(
    `SELECT DISTINCT memory_trick AS m
       FROM mcqs
      WHERE subject_id=? AND status='active' AND memory_trick IS NOT NULL AND memory_trick<>''
      LIMIT 4000`, [s.id]
  );
  return uniqCap(rows.map((r) => clean(r.m)).filter((x) => x.length >= 6), 60, (x) => x)
    .map((technique) => ({ technique }));
}

/* Exam Tips = distinct exam_tip values (authored, subject-specific). */
function examTips(db, s) {
  const rows = db.all(
    `SELECT DISTINCT exam_tip AS e
       FROM mcqs
      WHERE subject_id=? AND status='active' AND exam_tip IS NOT NULL AND exam_tip<>''
      LIMIT 4000`, [s.id]
  );
  return uniqCap(rows.map((r) => clean(r.e)).filter((x) => x.length >= 6), 60, (x) => x)
    .map((tip) => ({ tip }));
}

/* Frequently Tested Areas = topics ranked by how many active MCQs target them
   (a real signal of exam frequency for this subject). */
function frequentlyTested(db, s) {
  const rows = db.all(
    `SELECT t.name AS topic, COUNT(*) AS n
       FROM mcqs m JOIN topics t ON m.topic_id=t.id
      WHERE m.subject_id=? AND m.status='active'
      GROUP BY m.topic_id ORDER BY n DESC LIMIT 40`, [s.id]
  );
  const total = rows.reduce((a, r) => a + r.n, 0) || 1;
  return rows.map((r) => ({ topic: clean(r.topic), mcq_count: r.n, share_pct: Math.round(r.n * 1000 / total) / 10 }));
}

/* Difficulty Distribution = real counts per difficulty band. */
function difficultyDistribution(db, s) {
  const rows = db.all(
    `SELECT COALESCE(NULLIF(difficulty,''),'unknown') AS d, COUNT(*) AS n
       FROM mcqs WHERE subject_id=? AND status='active' GROUP BY d`, [s.id]
  );
  const dist = { easy: 0, medium: 0, hard: 0 };
  let total = 0;
  for (const r of rows) {
    total += r.n;
    const d = String(r.d).toLowerCase();
    if (dist[d] === undefined) dist[d] = 0;
    dist[d] += r.n;
  }
  const pct = {};
  for (const k of Object.keys(dist)) pct[k] = total ? Math.round(dist[k] * 1000 / total) / 10 : 0;
  return { counts: dist, percent: pct, total };
}

/* Subject Overview = a factual, subject-specific summary sentence assembled
   from real counts and the subject's actual exam mappings. Not boilerplate:
   the numbers and domain names are this subject's own. */
function overview(db, s, sections) {
  const chN = sections.core_domains.length;
  const tpN = sections.sub_domains.length;
  const mcqN = db.get("SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'", [s.id]).n;
  const exams = clean(s.exam_ids || "").split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
  const domainList = sections.core_domains.slice(0, 6).map((d) => d.name).join(", ");
  const parts = [];
  parts.push(`${clean(s.name)} is a ${clean(s.category_id || "").replace(/-/g, " ")} subject`);
  if (chN) parts.push(`organised into ${chN} core domain${chN === 1 ? "" : "s"}${domainList ? ` (${domainList}${chN > 6 ? ", …" : ""})` : ""}`);
  if (tpN) parts.push(`spanning ${tpN} topic area${tpN === 1 ? "" : "s"}`);
  parts.push(`with ${mcqN.toLocaleString("en-US")} practice item${mcqN === 1 ? "" : "s"} in the bank`);
  if (exams.length) parts.push(`mapped to ${exams.slice(0, 8).join(", ")}${exams.length > 8 ? " and others" : ""}`);
  return parts.join(", ") + ".";
}

/* ============================================================
   Assemble the full 18-section pack for one subject.
   ============================================================ */
function buildPack(db, s) {
  const sections = {};
  sections.core_domains = coreDomains(db, s);
  sections.sub_domains = subDomains(db, s);
  sections.concept_map = conceptMap(db, s);
  sections.glossary = glossary(db, s);
  sections.terminology = terminology(db, s);
  sections.definitions = definitions(db, s);
  sections.important_facts = importantFacts(db, s);
  sections.rules = rules(db, s);
  sections.formulas = formulas(db, s);
  sections.processes = processes(db, s);
  sections.classifications = classifications(db, s);
  sections.relationships = relationships(db, s);
  sections.misconceptions = misconceptions(db, s);
  sections.memory_techniques = memoryTechniques(db, s);
  sections.exam_tips = examTips(db, s);
  sections.frequently_tested = frequentlyTested(db, s);
  sections.difficulty_distribution = difficultyDistribution(db, s);
  sections.overview = overview(db, s, sections); /* uses the sections computed above */
  return sections;
}

/* A content hash over the section payloads → drives incremental rewrite. */
function packHash(sections) {
  const h = crypto.createHash("sha1");
  h.update(JSON.stringify(sections));
  return h.digest("hex");
}

/* Column ↔ section-key map for kg_knowledge_packs (JSON columns store arrays/objects). */
const JSON_SECTIONS = [
  "core_domains", "sub_domains", "concept_map", "glossary", "terminology",
  "definitions", "important_facts", "rules", "formulas", "processes",
  "classifications", "relationships", "misconceptions", "memory_techniques",
  "exam_tips", "frequently_tested", "difficulty_distribution"
];

/* Upsert one pack. Incremental: skip write when the hash is unchanged
   (unless force). Bumps version on genuine change; records concept_count later
   in Step 3 (kept as current kg_concepts count for the subject if present). */
function upsertPack(db, s, sections, opts) {
  const hash = packHash(sections);
  const existing = db.get(
    "SELECT id, version, source FROM kg_knowledge_packs WHERE subject_id=? ORDER BY version DESC LIMIT 1", [s.id]
  );
  /* store the hash inside `source` so we can detect changes without a schema change */
  const marker = "kg-pack-engine#" + hash.slice(0, 12);
  if (existing && existing.source === marker && !opts.force) {
    return { status: "unchanged", version: existing.version };
  }

  const conceptCount = db.get("SELECT COUNT(*) n FROM kg_concepts WHERE subject_id=?", [s.id]).n;
  const version = existing ? existing.version + 1 : 1;
  const vals = {
    subject_id: s.id,
    version,
    overview: sections.overview,
    concept_count: conceptCount,
    source: marker
  };
  for (const key of JSON_SECTIONS) vals[key] = JSON.stringify(sections[key]);

  const cols = ["subject_id", "version", "overview", ...JSON_SECTIONS, "concept_count", "source", "updated_at"];
  const placeholders = cols.map((c) => (c === "updated_at" ? "datetime('now')" : "?")).join(", ");
  const params = cols.filter((c) => c !== "updated_at").map((c) => vals[c]);

  db.transaction(() => {
    /* keep a single current pack per subject: replace prior versions */
    db.run("DELETE FROM kg_knowledge_packs WHERE subject_id=?", [s.id]);
    db.run(`INSERT INTO kg_knowledge_packs (${cols.join(",")}) VALUES (${placeholders})`, params);
    /* reflect pack version into the subject rollup (created if absent) */
    db.run(
      `INSERT INTO kg_subject_statistics (subject_id, pack_version, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(subject_id) DO UPDATE SET pack_version=excluded.pack_version, updated_at=datetime('now')`,
      [s.id, version]
    );
  });
  return { status: existing ? "updated" : "created", version };
}

/* ---------- section fill count (for reporting genuine depth) ---------- */
function fillStats(sections) {
  let filled = 0;
  const detail = {};
  for (const key of JSON_SECTIONS) {
    const v = sections[key];
    const n = Array.isArray(v) ? v.length : (v && typeof v === "object" ? Object.keys(v).length : 0);
    detail[key] = n;
    if (n > 0) filled++;
  }
  detail.overview = sections.overview ? 1 : 0;
  if (detail.overview) filled++;
  return { filled, total: 18, detail };
}

/* ============================================================
   Main
   ============================================================ */
function run() {
  const args = parseArgs(process.argv.slice(2));
  const db = open();

  let subjects = db.all("SELECT id, name, slug, category_id, exam_ids FROM subjects ORDER BY sort_order, id");
  if (args.subjects) {
    const want = String(args.subjects).split(",").map((x) => x.trim());
    subjects = subjects.filter((s) => want.includes(s.id));
  }
  if (args.limit) subjects = subjects.slice(0, parseInt(args.limit, 10));

  const t0 = Date.now();
  const tally = { created: 0, updated: 0, unchanged: 0 };
  let fillSum = 0;
  const thin = [];

  for (const s of subjects) {
    const sections = buildPack(db, s);
    const res = upsertPack(db, s, sections, { force: !!args.force });
    tally[res.status]++;
    const fs = fillStats(sections);
    fillSum += fs.filled;
    if (fs.filled < 10) thin.push(`${s.id}(${fs.filled}/18)`);
    if (args.verbose) {
      console.log(`${res.status.padEnd(9)} ${s.id.padEnd(20)} v${res.version} filled=${fs.filled}/18`);
    }
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("\n=== Knowledge Pack Engine ===");
  console.log(`subjects processed : ${subjects.length}`);
  console.log(`created / updated / unchanged : ${tally.created} / ${tally.updated} / ${tally.unchanged}`);
  console.log(`avg sections filled : ${(fillSum / (subjects.length || 1)).toFixed(1)} / 18`);
  if (thin.length) console.log(`thin packs (<10/18) : ${thin.length}  [${thin.slice(0, 20).join(", ")}${thin.length > 20 ? ", …" : ""}]`);
  console.log(`elapsed : ${secs}s`);
  db.close();
}

if (require.main === module) run();
module.exports = { buildPack, packHash, fillStats, JSON_SECTIONS };
