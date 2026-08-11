#!/usr/bin/env node
/* ============================================================
   Pakistan MCQS Hub — Generation pipeline runner (Enterprise 2026)

   STEP 1-4: taxonomy (subjects → chapters → topics → subtopics)
             is ensured from generator declarations (+ exam-prep
             expansion subjects).
   STEP 5:   MCQs are generated per topic (25-100+ per topic),
             quality-gated (8-dimension engine, reject <95%),
             deduped (qhash + normalized), and inserted via
             prepared statements in transactions. Failed candidates
             are auto-regenerated with fresh seeds. Resumable at
             topic level.

   Usage:
     node pipeline/run.js                      # continue toward target
     node pipeline/run.js --target 200000      # set target
     node pipeline/run.js --per-subject 5000   # grow every subject to 5000+
     node pipeline/run.js --subjects python,math --target 5000
     node pipeline/run.js --max-time 120       # stop after N minutes
     node pipeline/run.js --fresh              # ignore resume state
     node pipeline/run.js --expand             # reopen done topics of under-target subjects (fresh seed per minute)
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { open } = require("../db/engine.js");
const lib = require("./lib.js");
const quality = require("./quality.js");
const refs = require("./references.js");

const ROOT = path.join(__dirname, "..");
const LOG = path.join(__dirname, "progress.log");
const EXPANSION = require("./exam-subjects.js");

const args = (function () {
  const a = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      a[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true;
      if (a[k] !== true) i++;
    }
  }
  return a;
})();

const TARGET = parseInt(args.target, 10) || 500000;
const PER_SUBJECT_TARGET = parseInt(args["per-subject"], 10) || 0;
const SEED = parseInt(args.seed, 10) || 20260731;
const MAX_TIME_MIN = parseInt(args["max-time"], 10) || 0;
const SUBJECTS_ONLY = args.subjects ? args.subjects.split(",").map((s) => s.trim()) : null;
const FRESH = !!args.fresh;
const EXPAND = !!args.expand;
const RUN_STAMP = EXPAND ? Math.floor(Date.now() / 60000) : 0; /* new seed per minute in expand mode */
const startTime = Date.now();
const deadline = MAX_TIME_MIN ? startTime + MAX_TIME_MIN * 60000 : Infinity;

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
const prefix = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

function log(msg) {
  const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

async function main() {
  const db = open();
  try {
    /* ---- collect generator modules ---- */
    const genFiles = fs.readdirSync(path.join(__dirname, "generators")).filter((f) => f.endsWith(".js")).sort();
    const gens = [];
    for (const f of genFiles) gens.push(...require(path.join(__dirname, "generators", f)));
    log(`pipeline: ${gens.length} generators loaded (${genFiles.length} files)`);

    /* ---- STEP 1: expansion subjects (exam-prep) ---- */
    db.run(`INSERT INTO categories (id,name,slug,icon,description,sort_order) VALUES (?,?,?,?,?,?)
      ON CONFLICT(id) DO NOTHING`, ["exam-preparation", "Exam Preparation", "exam-preparation", "📋", "Pattern-based preparation for Pakistan's recruitment and entrance exams.", 17]);
    let expAdded = 0;
    for (const e of EXPANSION) {
      const r = db.run(`INSERT INTO subjects (id,name,slug,category_id,icon,description,status,exam_ids,sort_order)
        VALUES (?,?,?,?,?,?,'active',?,?) ON CONFLICT(id) DO NOTHING`,
        [e.id, e.name, e.id, "exam-preparation", e.icon || "📋", e.description || "", e.exams.join(","), e.order || 0]);
      expAdded += r.changes;
    }
    if (expAdded) log(`STEP 1: ${expAdded} expansion subjects added (exam-prep category)`);

    /* ---- target subjects ---- */
    const allSubjects = db.all(`SELECT id, name, exam_ids, category_id FROM subjects ORDER BY sort_order, id`);
    const subjects = SUBJECTS_ONLY
      ? allSubjects.filter((s) => SUBJECTS_ONLY.includes(s.id))
      : allSubjects;
    if (!subjects.length) throw new Error("No subjects matched (check --subjects ids)");
    log(`subjects in scope: ${subjects.length}`);

    /* ---- resume state ---- */
    const getState = (k) => { const r = db.get(`SELECT value FROM pipeline_state WHERE key=?`, [k]); return r ? JSON.parse(r.value) : null; };
    const setState = (k, v) => db.run(`INSERT INTO pipeline_state (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`, [k, JSON.stringify(v)]);
    const doneTopics = FRESH ? new Set() : new Set((getState("pipeline:done-topics") || []));
    const totals = FRESH ? {} : (getState("pipeline:counts") || {});
    const qualityStats = FRESH ? null : (getState("pipeline:quality") || null);
    if (FRESH) db.run(`DELETE FROM pipeline_state WHERE key='pipeline:expl-hashes'`);

    /* ---- per-subject id sequence ---- */
    function idSeq(subjectId) {
      const p = prefix(subjectId);
      const rows = db.all(`SELECT id FROM mcqs WHERE id LIKE ?`, [p + "-%"]);
      let max = 0;
      for (const r of rows) {
        const n = parseInt(r.id.slice(p.length + 1), 10);
        if (n > max) max = n;
      }
      let cur = max;
      return () => { cur++; return `${p}-${String(cur).padStart(6, "0")}`; };
    }

    /* ---- counters ---- */
    /* genThisRun counts only rows actually inserted this run; the global TARGET
       gate keys off (live DB count + genThisRun), never the persisted totals sum
       (which is a lifetime cumulative and would trip TARGET immediately). */
    const baselineDbTotal = db.get(`SELECT COUNT(*) n FROM mcqs WHERE status='active'`).n;
    let genThisRun = 0;
    let skippedDup = 0, skippedBad = 0, rejectedQuality = 0, regenUsed = 0;
    const qAcc = qualityStats || { attempts: 0, rejected: 0, dims: {} };
    const batch = [];
    const batchHashes = new Set();
    const flush = () => {
      if (!batch.length) return;
      batchHashes.clear();
      db.transaction(() => {
        for (const row of batch) {
          db.run(`INSERT INTO mcqs (id,question,correct_answer,difficulty,subject_id,chapter_id,topic_id,subtopic_id,exam_ids,tags,references_json,explanation,source,status,qhash,learning_objective,bloom_taxonomy,confidence_score,estimated_time_sec,memory_trick,exam_tip,explanation_why_wrong)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'generated','active',?,?,?,?,?,?,?,?)`,
            [row.id, row.question, row.correctAnswer, row.difficulty, row.subjectId, row.chapterId, row.topicId, row.subtopicId || null,
             row.examIds, JSON.stringify(row.tags), JSON.stringify(row.references || []), row.explanation, row.qhash, row.learningObjective || null, row.bloomTaxonomy || null,
             row.confidence ?? 0.9, row.solvingTimeSec || 40, row.memoryTrick || null, row.examTip || null,
             JSON.stringify(row.explanationWhyWrong || [])]);
          for (const [label, t] of [["A", row.optionA], ["B", row.optionB], ["C", row.optionC], ["D", row.optionD]]) {
            db.run(`INSERT INTO options (mcq_id,label,text) VALUES (?,?,?)`, [row.id, label, t]);
          }
        }
      });
      batch.length = 0;
    };

    /* ---- quality gate with auto-regen ---- */
    function subjectKnownTexts(subjectId) {
      return db.all(`SELECT question FROM mcqs WHERE subject_id=? AND status='active' ORDER BY RANDOM() LIMIT 400`, [subjectId]).map((r) => r.question);
    }
    let knownCache = new Map();
    const knownFor = (subjectId) => { if (!knownCache.has(subjectId)) knownCache.set(subjectId, subjectKnownTexts(subjectId)); return knownCache.get(subjectId); };

    function acceptCandidate(m, subjectId, batchTexts, extraMeta) {
      const enriched = quality.enrich({ ...m, ...extraMeta }, {});
      const ver = quality.scoreMcq(enriched, knownFor(subjectId), batchTexts);
      qAcc.attempts = (qAcc.attempts || 0) + 1;
      for (const [k, v] of Object.entries(ver.dims)) { const d = (qAcc.dims[k] = qAcc.dims[k] || { n: 0, sum: 0, min: 100 }); d.n++; d.sum += v; d.min = Math.min(d.min, v); }
      if (!ver.pass) { qAcc.rejected = (qAcc.rejected || 0) + 1; }
      return { ok: ver.pass, ver };
    }

    /* ---- STEP 2-4: taxonomy ensure + STEP 5: generate, per topic ---- */
    let subjectTotal = 0;
    for (const s of subjects) {
      const curCount = db.get(`SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'`, [s.id]).n;
      if (PER_SUBJECT_TARGET && curCount >= PER_SUBJECT_TARGET) {
        log(`SKIP ${s.id}: already at ${curCount} >= ${PER_SUBJECT_TARGET}`);
        continue;
      }
      if (EXPAND && PER_SUBJECT_TARGET) {
        /* re-open done topics so under-target subjects regenerate with a fresh seed */
        const subjectDone = [...doneTopics].filter((k) => k.startsWith(`${s.id}|`));
        subjectDone.forEach((k) => doneTopics.delete(k));
        if (subjectDone.length) log(`EXPAND ${s.id}: reopened ${subjectDone.length} done topics (${curCount} < ${PER_SUBJECT_TARGET})`);
      }
      const nextId = idSeq(s.id);
      /* size the parametric cap generously (not just to remaining need): the
         existing rows already occupy the low-index tuples, so enumeration must
         run deep past them for exact dup-skip to surface genuinely-new tuples. */
      const genScope = PER_SUBJECT_TARGET
        ? { ...s, _cap: Math.min(12000, PER_SUBJECT_TARGET + 2000) }
        : s;
      const sGens = gens.filter((g) => g.subjects.includes(s.id));
      if (!sGens.length) {
        log(`SKIP ${s.id}: no generators`);
        continue;
      }
      const subjectStart = genThisRun;
      for (const g of sGens) {
        const chapterName = `${g.name}`;
        const chapterId = `ch-${prefix(s.id)}-${slug(g.name)}`.slice(0, 60);
        let chapter = db.get(`SELECT id FROM chapters WHERE id=?`, [chapterId]);
        if (!chapter) {
          db.run(`INSERT INTO chapters (id,subject_id,name,slug,sort_order) VALUES (?,?,?,?,?) ON CONFLICT(subject_id,slug) DO NOTHING`,
            [chapterId, s.id, chapterName, slug(chapterName), 0]);
          chapter = db.get(`SELECT id FROM chapters WHERE subject_id=? AND slug=?`, [s.id, slug(chapterName)]);
        }
        for (const tname of g.topics) {
          if (Date.now() > deadline) { flush(); log(`TIME LIMIT reached (${MAX_TIME_MIN} min) — resume with the same command to continue.`); return; }
          const topicKey = `${s.id}|${g.name}|${tname}`;
          if (doneTopics.has(topicKey)) continue;
          const tsl = slug(tname);
          const topicId = `t-${chapter.id}-${tsl}`.slice(0, 70);
          let topic = db.get(`SELECT id FROM topics WHERE id=?`, [topicId]);
          if (!topic) {
            db.run(`INSERT INTO topics (id,chapter_id,name,slug,sort_order) VALUES (?,?,?,?,?) ON CONFLICT(chapter_id,slug) DO NOTHING`, [topicId, chapter.id, tname, tsl, 0]);
            topic = db.get(`SELECT id FROM topics WHERE chapter_id=? AND slug=?`, [chapter.id, tsl]);
          }
          const subtopics = ["fundamentals", "practice questions", "advanced"];
          for (const st of subtopics) {
            db.run(`INSERT INTO subtopics (topic_id,name) VALUES (?,?) ON CONFLICT(topic_id,name) DO NOTHING`, [topic.id, st]);
          }
          const subRow = db.get(`SELECT id FROM subtopics WHERE topic_id=? AND name='fundamentals'`, [topic.id]);
          const subId = subRow ? subRow.id : null;

          /* generate with quality gate + regen */
          const rng = lib.mulberry32(lib.hashSeed(`${SEED + RUN_STAMP}|${topicKey}`));
          let candidates = g.generate(rng, tname, genScope);
          if (!Array.isArray(candidates)) continue;
          let added = 0;
          let attempt = 0;
          const maxAttempts = 3;
          while (attempt < maxAttempts) {
            let insertedThisRound = 0;
            for (const m of candidates) {
              const err = lib.validateMcq(m, {});
              if (err) { skippedBad++; continue; }
              const h = lib.qhash(m.question);
              if (batchHashes.has(h)) { skippedDup++; continue; }
              if (db.get(`SELECT id FROM mcqs WHERE qhash=?`, [h])) { skippedDup++; continue; }
              const extra = {
                topicId: topic.id, topicName: tname, subtopicId: subId, subtopicName: "fundamentals",
                learningObjective: m.learningObjective || `Recall and apply ${tname.toLowerCase()} concepts in exam-style questions.`,
                bloomTaxonomy: m.bloomTaxonomy || "Understand", confidence: m.confidence ?? 0.9,
                solvingTimeSec: m.solvingTimeSec, memoryTrick: m.memoryTrick, examTip: m.examTip, explanationWhyWrong: m.explanationWhyWrong,
                tags: [s.name, tname, ...(g.tags || [])], examIds: (s.exam_ids || "").split(",").filter(Boolean).join(",")
              };
              const { ok, ver } = acceptCandidate(m, s.id, batch.map((r) => r.question).concat(candidates.filter((x) => x.question !== m.question).map((x) => x.question)), extra);
              if (!ok) { rejectedQuality++; continue; }
              batchHashes.add(h);
              const rowRefs = refs.referencesFor(s.id, s.category_id, extra.examIds, tname);
              batch.push({
                id: nextId(), question: m.question, correctAnswer: m.correctAnswer, difficulty: m.difficulty,
                subjectId: s.id, chapterId: chapter.id, topicId: topic.id, subtopicId: subId,
                examIds: extra.examIds,
                tags: extra.tags, explanation: m.explanation, references: rowRefs,
                optionA: m.optionA, optionB: m.optionB, optionC: m.optionC, optionD: m.optionD, qhash: h,
                learningObjective: extra.learningObjective, bloomTaxonomy: extra.bloomTaxonomy, confidence: extra.confidence,
                solvingTimeSec: extra.solvingTimeSec, memoryTrick: m.memoryTrick || null, examTip: m.examTip || null,
                explanationWhyWrong: m.explanationWhyWrong || []
              });
              insertedThisRound++;
              added++;
              if (batch.length >= 500) flush();
            }
            if (insertedThisRound > 0 || attempt === maxAttempts - 1) break;
            /* regenerate with a fresh seed and try again */
            regenUsed++;
            attempt++;
            candidates = g.generate(lib.mulberry32(lib.hashSeed(`${SEED + attempt * 7919}|${topicKey}`)), tname, genScope) || [];
          }
          totals[s.id] = (totals[s.id] || 0) + added;
          genThisRun += added;
          doneTopics.add(topicKey);
          setState("pipeline:done-topics", [...doneTopics]);
          setState("pipeline:counts", totals);
          setState("pipeline:quality", qAcc);
          const subjNow = db.get(`SELECT COUNT(*) n FROM mcqs WHERE subject_id=? AND status='active'`, [s.id]).n;
          log(`+${String(added).padStart(4)} ${topicKey}  [${s.id} ${subjNow} | run +${genThisRun}, db ~${baselineDbTotal + genThisRun}/${TARGET}]`);
          if (PER_SUBJECT_TARGET && subjNow >= PER_SUBJECT_TARGET) { log(`SUBJECT TARGET reached: ${s.id} at ${subjNow}`); break; }
        }
      }
      subjectTotal = genThisRun - subjectStart;
      log(`SUBJECT ${s.id}: +${subjectTotal} (run cumulative ${genThisRun})`);
      if (!PER_SUBJECT_TARGET && baselineDbTotal + genThisRun >= TARGET) { flush(); log(`TARGET ${TARGET} reached.`); break; }
    }
    flush();

    /* ---- FTS rebuild ---- */
    db.exec(`INSERT INTO mcqs_fts(mcqs_fts) VALUES('rebuild')`);
    const n = db.get(`SELECT COUNT(*) n FROM mcqs`).n;
    const passed = qAcc.attempts - qAcc.rejected;
    log(`DONE. total MCQs in DB: ${n} (generated this run: ${genThisRun}, dup-skipped ${skippedDup}, quality-skipped ${rejectedQuality}, regen-used ${regenUsed}, quality-attempts ${qAcc.attempts}, accepted ${passed})`);
    const perSubject = db.all(`SELECT subject_id, COUNT(*) n FROM mcqs GROUP BY subject_id ORDER BY n DESC LIMIT 12`);
    log("top subjects: " + perSubject.map((r) => `${r.subject_id}=${r.n}`).join(", "));
  } finally {
    db.close();
  }
}

main().catch((e) => { console.error("[pipeline] ERROR:", e); process.exit(1); });
