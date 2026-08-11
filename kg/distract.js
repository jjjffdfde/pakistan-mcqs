/* ============================================================
   Phase 14 — Knowledge Graph engine: distractor pools
   Real wrong options from the corpus become semantic distractor
   items. One pool per concept (category = concept slug); items
   are the actual wrong options of MCQs whose tags match the
   concept — so every distractor is category-coherent real exam
   material, never fabricated.
   ============================================================ */
"use strict";
const U = require("./util.js");

const CHUNK = 25000;
const MAX_ITEMS_PER_POOL = 40;

function distractAll(db, log) {
  const bySubject = new Map(); /* subjectId -> Map(nameLower -> {id, slug}) */
  for (const r of db.all("SELECT subject_id, id, name, slug FROM kg_concepts")) {
    if (!bySubject.has(r.subject_id)) bySubject.set(r.subject_id, new Map());
    bySubject.get(r.subject_id).set(r.name.toLowerCase(), { id: r.id, slug: r.slug });
  }

  const poolIds = new Map(); /* conceptId -> poolId */
  const poolCounts = new Map(); /* conceptId -> n */
  let items = 0, pools = 0, chunks = 0;

  const insPool = db.prepare(
    `INSERT OR IGNORE INTO kg_distractor_pools (subject_id, concept_id, category, description)
     VALUES (?,?,?,?)`
  );
  const getPool = db.prepare(
    "SELECT id FROM kg_distractor_pools WHERE subject_id = ? AND category = ?"
  );
  const insItem = db.prepare(
    `INSERT OR IGNORE INTO kg_distractor_items (pool_id, value, note) VALUES (?,?,?)`
  );

  const ensurePool = (subjectId, concept) => {
    if (poolIds.has(concept.id)) return poolIds.get(concept.id);
    insPool.run(subjectId, concept.id, concept.slug, "Real wrong options from corpus MCQs tagged " + concept.slug);
    const row = getPool.get(subjectId, concept.slug);
    poolIds.set(concept.id, row.id);
    poolCounts.set(concept.id, 0);
    pools++;
    return row.id;
  };

  db.transaction(() => {
    let lastRowId = 0;
    while (true) {
      const rows = db.all(
        `SELECT rowid, id, subject_id, tags, correct_answer FROM mcqs
         WHERE status = 'active' AND rowid > ? ORDER BY rowid LIMIT ${CHUNK}`,
        [lastRowId]
      );
      if (!rows.length) break;
      chunks++;
      const ids = rows.map((r) => r.id);
      const optsByMcq = new Map();
      for (let i = 0; i < ids.length; i += 500) {
        const batch = ids.slice(i, i + 500);
        for (const o of db.all(`SELECT mcq_id, label, text FROM options WHERE mcq_id IN (${batch.map(() => "?").join(",")})`, batch)) {
          if (!optsByMcq.has(o.mcq_id)) optsByMcq.set(o.mcq_id, []);
          optsByMcq.get(o.mcq_id).push(o);
        }
      }
      for (const r of rows) {
        const cMap = bySubject.get(r.subject_id);
        if (!cMap) continue;
        const opts = optsByMcq.get(r.id) || [];
        const wrong = opts.filter((o) => o.label !== r.correct_answer && U.clean(o.text));
        if (!wrong.length) continue;
        const seen = new Set();
        for (const t of U.parseTags(r.tags)) {
          const concept = cMap.get(t.toLowerCase());
          if (!concept) continue;
          if (poolCounts.get(concept.id) >= MAX_ITEMS_PER_POOL) continue;
          const poolId = ensurePool(r.subject_id, concept);
          for (const w of wrong) {
            const value = U.clean(w.text);
            if (seen.has(value) || value.length < 2 || value.length > 120) continue;
            seen.add(value);
            const ins = insItem.run(poolId, value, "corpus distractor from " + r.id);
            items += ins.changes;
            poolCounts.set(concept.id, poolCounts.get(concept.id) + ins.changes);
          }
        }
      }
      lastRowId = rows[rows.length - 1].rowid;
      if (log && chunks % 8 === 0) log(`[distract] ${chunks} chunks, ${items} items`);
    }
  });

  const itemCount = db.get("SELECT COUNT(*) n FROM kg_distractor_items").n;
  if (log) log(`[distract] ${pools} pools, ${itemCount} real distractor items`);
  return { pools, items: itemCount };
}

module.exports = { distractAll };
