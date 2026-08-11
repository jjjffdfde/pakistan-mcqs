/* ============================================================
   Phase 12 — AI learning engine: mock prediction engine
   Estimates expected score on any mock/pastpaper from per-
   chapter history accuracy, maps it to a pass probability and
   readiness %, and records strong/weak areas.
   ============================================================ */
"use strict";
const U = require("./util.js");

function chapterAccuracy(db, deviceId) {
  const rows = db.all(
    `SELECT m.chapter_id, c.name chapter_name, m.subject_id, s.name subject_name,
            COUNT(*) total,
            SUM(CASE WHEN NOT h.skipped AND h.correct THEN 1 ELSE 0 END) correct,
            SUM(CASE WHEN h.skipped THEN 1 ELSE 0 END) skipped
     FROM history h
     JOIN mcqs m ON m.id = h.mcq_id
     LEFT JOIN chapters c ON c.id = m.chapter_id
     LEFT JOIN subjects s ON s.id = m.subject_id
     WHERE h.device_id = ? AND m.chapter_id IS NOT NULL AND m.chapter_id != ''
     GROUP BY m.chapter_id`,
    [deviceId]
  );
  return rows;
}

function predict(db, deviceId, examId) {
  const target = db.get(
    `SELECT id, title, total_questions, subject_ids FROM mocktests WHERE id=? AND status='active'`,
    [examId]
  ) || db.get(
    `SELECT id, title, total_questions, subject_ids FROM pastpapers WHERE id=?`,
    [examId]
  );
  if (!target) return { error: "unknown mock / pastpaper id: " + examId };

  const chap = chapterAccuracy(db, deviceId);
  const byChapter = new Map(chap.map((c) => [c.chapter_id, c]));
  const totalQuestions = target.total_questions || 50;

  const examChapters = db.all(
    `SELECT DISTINCT m.chapter_id id, c.name name, COUNT(*) n
     FROM mcqs m LEFT JOIN chapters c ON c.id = m.chapter_id
     WHERE m.status='active'
       AND (m.exam_ids LIKE '%,' || ? || ',%' OR m.exam_ids LIKE ? || ',%' OR m.exam_ids LIKE '%,' || ?)
     GROUP BY m.chapter_id ORDER BY n DESC LIMIT 40`,
    [examId, examId, examId]
  );

  let knownWeight = 0;
  let unknownWeight = 0;
  let expScore = 0;
  let knownCount = 0;
  const strongAreas = [];
  const weakAreas = [];

  const scope = examChapters.length ? examChapters : [{ id: "", name: "", n: totalQuestions }];
  for (const ch of scope) {
    const data = byChapter.get(ch.id);
    if (data && (data.total - data.skipped) >= 2) {
      const acc = U.pct(data.correct, data.total - data.skipped);
      const w = ch.n || data.total;
      knownWeight += w;
      expScore += (acc / 100) * w;
      knownCount++;
      (acc >= 70 ? strongAreas : weakAreas).push({ chapter: ch.name || data.chapter_name || ch.id, accuracy: acc, weight: w });
    } else {
      unknownWeight += ch.n || 1;
      if (ch.name) weakAreas.push({ chapter: ch.name, accuracy: 0, weight: ch.n || 1 });
    }
  }

  const coverage = totalQuestions > 0 ? knownWeight / totalQuestions : 0;
  const baseAcc = knownWeight > 0 ? expScore / knownWeight : 0.5;
  const expectedPct = U.round2((baseAcc * (0.35 + 0.65 * coverage)) * 100);
  const expectedScore = Math.round((expectedPct / 100) * totalQuestions);
  const readiness = U.round2(expectedPct);
  const probPass = U.round2(U.clamp(50 + (expectedPct - 40) * 1.6 + Math.min(10, knownCount * 2), 3, 97));

  db.run(
    `INSERT INTO predictions (device_id, exam_id, exam_title, prob_pass, expected_score, readiness, strong_areas, weak_areas)
     VALUES (?,?,?,?,?,?,?,?)`,
    [deviceId, target.id, target.title, probPass, expectedScore, readiness,
     JSON.stringify(strongAreas.slice(0, 6)), JSON.stringify(weakAreas.slice(0, 6))]
  );

  return {
    exam: { id: target.id, title: target.title, total_questions: totalQuestions },
    expected_score: expectedScore,
    expected_pct: expectedPct,
    prob_pass: probPass,
    readiness,
    coverage: U.round2(coverage * 100),
    known_chapters: knownCount,
    strong_areas: strongAreas.slice(0, 6),
    weak_areas: weakAreas.slice(0, 6)
  };
}

function list(db, deviceId) {
  const rows = db.all(
    `SELECT * FROM predictions WHERE device_id=? ORDER BY created_at DESC LIMIT 25`, [deviceId]
  );
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    if (seen.has(r.exam_id)) continue;
    seen.add(r.exam_id);
    let strong = [], weak = [];
    try { strong = JSON.parse(r.strong_areas); } catch (e) {}
    try { weak = JSON.parse(r.weak_areas); } catch (e) {}
    out.push({
      exam_id: r.exam_id, exam_title: r.exam_title, prob_pass: r.prob_pass,
      expected_score: r.expected_score, expected_pct: r.readiness,
      readiness: r.readiness, strong_areas: strong, weak_areas: weak,
      created_at: r.created_at
    });
  }
  return out;
}

module.exports = { predict, list, chapterAccuracy };
