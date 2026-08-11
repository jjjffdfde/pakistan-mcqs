/* ============================================================
   Phase 14 — Knowledge Graph engine: concept relations
   Derives kg_concept_relations from REAL structure:
     - parent/child : topic-anchored concepts (topic lead = parent)
     - related      : same-topic chain (bounded, non-redundant)
     - depends_on   : chapter topic ordering (earlier topics are
                      foundation for later ones)
   Every edge references existing kg_concepts rows; nothing is
   invented beyond the corpus-derived topic anchors.
   ============================================================ */
"use strict";

const PARENT_W = 1.0;
const CHILD_W = 0.9;
const RELATED_W = 0.6;
const DEPENDS_W = 0.7;

function relateSubject(db, subjectId) {
  const concepts = db.all(
    `SELECT id, topic_id FROM kg_concepts WHERE subject_id = ? AND topic_id IS NOT NULL ORDER BY exam_frequency DESC, id`,
    [subjectId]
  );
  if (!concepts.length) return 0;

  const byTopic = new Map();
  for (const c of concepts) {
    if (!byTopic.has(c.topic_id)) byTopic.set(c.topic_id, []);
    byTopic.get(c.topic_id).push(c);
  }

  let n = 0;
  const add = (from, to, type, weight) => {
    const r = db.run(
      `INSERT OR IGNORE INTO kg_concept_relations (from_concept, to_concept, relation_type, weight) VALUES (?,?,?,?)`,
      [from, to, type, weight]
    );
    n += r.changes;
  };

  /* parent/child + same-topic related chains */
  for (const list of byTopic.values()) {
    if (list.length < 2) continue;
    const [parent, ...rest] = list;
    for (const c of rest) {
      add(parent.id, c.id, "parent", PARENT_W);
      add(c.id, parent.id, "child", CHILD_W);
    }
    for (let i = 0; i < rest.length - 1; i++) {
      add(rest[i].id, rest[i + 1].id, "related", RELATED_W);
    }
  }

  /* depends_on: concepts of an earlier topic feed later topics of the same chapter */
  const anchored = db.all(
    `SELECT kc.id, kc.topic_id, t.chapter_id, t.sort_order AS t_order
     FROM kg_concepts kc
     JOIN topics t ON t.id = kc.topic_id
     WHERE kc.subject_id = ? AND kc.topic_id IS NOT NULL`,
    [subjectId]
  );
  const chapterOrder = new Map();
  for (const a of anchored) {
    if (!chapterOrder.has(a.chapter_id)) chapterOrder.set(a.chapter_id, new Map());
    const byOrd = chapterOrder.get(a.chapter_id);
    if (!byOrd.has(a.t_order)) byOrd.set(a.t_order, []);
    byOrd.get(a.t_order).push(a.id);
  }
  for (const byOrd of chapterOrder.values()) {
    const orders = [...byOrd.keys()].sort((x, y) => x - y);
    for (let i = 0; i < orders.length - 1; i++) {
      const from = byOrd.get(orders[i]);
      const to = byOrd.get(orders[i + 1]);
      for (const f of from) {
        for (const t of to.slice(0, 3)) add(f, t, "depends_on", DEPENDS_W);
      }
    }
  }

  return n;
}

function relateAll(db, log) {
  const subjects = db.all("SELECT id FROM subjects WHERE status = 'active'");
  let total = 0, active = 0;
  db.transaction(() => {
    for (const s of subjects) {
      const n = relateSubject(db, s.id);
      total += n;
      if (n) active++;
    }
  });
  if (log) log(`[relate] ${total} edges across ${active} subjects`);
  return { edges: total, subjects: active };
}

module.exports = { relateSubject, relateAll };
