/* ============================================================
   Phase 14 — Knowledge Graph engine: exam mappings
   One chunked pass over mcqs rows derives:
     - subject x exam frequencies (all exams found in corpus)
     - concept x exam frequencies (concept tag == mcq tag)
   Written into kg_exam_mappings with weights = share of the
   subject/concept total. Fully derived data, idempotent
   (DELETE + rebuild inside one transaction).
   ============================================================ */
"use strict";
const U = require("./util.js");

const CHUNK = 150000;
const MIN_CONCEPT_FREQ = 3;

function mapExams(db, log) {
  const subjectConcepts = new Map(); /* subjectId -> Map(nameLower -> conceptId) */
  for (const row of db.all("SELECT subject_id, id, name FROM kg_concepts")) {
    if (!subjectConcepts.has(row.subject_id)) subjectConcepts.set(row.subject_id, new Map());
    subjectConcepts.get(row.subject_id).set(row.name.toLowerCase(), row.id);
  }

  const subjectExam = new Map();  /* subjectId -> Map(exam -> count) */
  const subjectTotal = new Map(); /* subjectId -> count */
  const conceptExam = new Map();  /* subjectId -> Map(conceptId -> Map(exam -> count)) */
  const conceptTotal = new Map(); /* subjectId -> Map(conceptId -> count) */

  const push = (map, k1, k2, n = 1) => {
    if (!map.has(k1)) map.set(k1, new Map());
    const m = map.get(k1);
    m.set(k2, (m.get(k2) || 0) + n);
  };

  let lastRowId = 0;
  while (true) {
    const rows = db.all(
      `SELECT rowid, subject_id, tags, exam_ids FROM mcqs
       WHERE status = 'active' AND rowid > ? ORDER BY rowid LIMIT ${CHUNK}`,
      [lastRowId]
    );
    if (!rows.length) break;
    for (const r of rows) {
      subjectTotal.set(r.subject_id, (subjectTotal.get(r.subject_id) || 0) + 1);
      const exams = U.parseExamIds(r.exam_ids);
      for (const e of exams) push(subjectExam, r.subject_id, e);
      const cMap = subjectConcepts.get(r.subject_id);
      if (cMap) {
        for (const t of U.parseTags(r.tags)) {
          const cid = cMap.get(t.toLowerCase());
          if (!cid) continue;
          if (!conceptTotal.has(r.subject_id)) conceptTotal.set(r.subject_id, new Map());
          conceptTotal.get(r.subject_id).set(cid, (conceptTotal.get(r.subject_id).get(cid) || 0) + 1);
          if (!conceptExam.has(r.subject_id)) conceptExam.set(r.subject_id, new Map());
          if (!conceptExam.get(r.subject_id).has(cid)) conceptExam.get(r.subject_id).set(cid, new Map());
          const em = conceptExam.get(r.subject_id).get(cid);
          for (const e of exams) em.set(e, (em.get(e) || 0) + 1);
        }
      }
    }
    lastRowId = rows[rows.length - 1].rowid;
  }

  /* rebuild table */
  db.transaction(() => {
    db.run("DELETE FROM kg_exam_mappings");
    let n = 0;
    const ins = db.prepare(
      `INSERT INTO kg_exam_mappings (exam_id, subject_id, concept_id, weight, frequency) VALUES (?,?,?,?,?)`
    );
    for (const [sid, em] of subjectExam) {
      const total = subjectTotal.get(sid) || 1;
      for (const [exam, freq] of em) {
        ins.run(exam, sid, null, Math.round((freq / total) * 1000) / 1000, freq);
        n++;
      }
      const ce = conceptExam.get(sid);
      if (!ce) continue;
      for (const [cid, m] of ce) {
        const ctotal = conceptTotal.get(sid).get(cid) || 1;
        for (const [exam, freq] of m) {
          if (freq < MIN_CONCEPT_FREQ) continue;
          ins.run(exam, sid, cid, Math.round((freq / ctotal) * 1000) / 1000, freq);
          n++;
        }
      }
    }
    if (log) log(`[map] ${n} exam mappings`);
  });
  return { mappings: db.get("SELECT COUNT(*) n FROM kg_exam_mappings").n, conceptTotal };
}

module.exports = { mapExams };
