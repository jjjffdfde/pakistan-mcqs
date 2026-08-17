/* runtime-v2/ai/mock.cjs — mock/pastpaper prediction engine, file-backed.
   Port of ai/mock.js: chapter accuracy from the file history joined to the
   NDJSON engine; per-exam chapter scope via streaming exam_ids match;
   predictions appended to the JSON table store. */
"use strict";
const U = require("./util.cjs");
const S = require("./store.cjs");
const L = require("../data-loader.cjs");
const Q = require("../query-engine.cjs");

async function chapterAccuracy(deviceId) {
  const hist = require("../user-store.cjs").history().filter((h) => h.device_id === deviceId);
  const ids = hist.map((h) => h.mcq_id);
  const { byId } = await Q.fetchRows(ids);
  const chapters = (await Q.chapters()).reduce((m, c) => (m[c.id] = c, m), {});
  const subjects = (await Q.subjects()).reduce((m, s) => (m[s.id] = s, m), {});
  const per = new Map();
  for (const h of hist) {
    const m = byId.get(h.mcq_id);
    if (!m || m.chapter_id == null || m.chapter_id === "") continue;
    let g = per.get(m.chapter_id);
    if (!g) {
      g = { chapter_id: m.chapter_id, chapter_name: chapters[m.chapter_id] ? chapters[m.chapter_id].name : null, subject_id: m.subject_id, subject_name: subjects[m.subject_id] ? subjects[m.subject_id].name : null, total: 0, correct: 0, skipped: 0 };
      per.set(m.chapter_id, g);
    }
    g.total++;
    if (h.skipped) g.skipped++;
    else if (h.correct) g.correct++;
  }
  return [...per.values()];
}

const like = (examIds, examId) => {
  const ids = String(examIds || "");
  return ids.includes("," + examId + ",") || ids.startsWith(examId + ",") || ids.endsWith("," + examId) || ids === examId;
};

async function examChapters(examId) {
  const chapters = (await Q.chapters()).reduce((m, c) => (m[c.id] = c, m), {});
  const counts = new Map();
  for (const sub of Object.keys(L.manifest().sourceFiles)) {
    await L.streamSubject(sub, (row) => {
      if (row && row.status === "active" && like(row.exam_ids, examId) && row.chapter_id != null && row.chapter_id !== "") {
        counts.set(row.chapter_id, (counts.get(row.chapter_id) || 0) + 1);
      }
    });
  }
  return [...counts.entries()]
    .map(([id, n]) => ({ id, name: chapters[id] ? chapters[id].name : null, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 40);
}

async function predict(deviceId, examId) {
  const target = (await Q.mocktests()).find((t) => String(t.id) === String(examId) && t.status === "active")
    || (await Q.pastpapers()).find((t) => String(t.id) === String(examId));
  if (!target) return { error: "unknown mock / pastpaper id: " + examId };

  const chap = await chapterAccuracy(deviceId);
  const byChapter = new Map(chap.map((c) => [c.chapter_id, c]));
  const totalQuestions = target.total_questions || 50;

  const examCh = await examChapters(examId);

  let knownWeight = 0, unknownWeight = 0, expScore = 0, knownCount = 0;
  const strongAreas = [], weakAreas = [];

  const scope = examCh.length ? examCh : [{ id: "", name: "", n: totalQuestions }];
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

  await S.insert("predictions", {
    id: S.nextId("predictions"), device_id: deviceId, exam_id: target.id,
    exam_title: target.title, prob_pass: probPass, expected_score: expectedScore,
    readiness, strong_areas: JSON.stringify(strongAreas.slice(0, 6)),
    weak_areas: JSON.stringify(weakAreas.slice(0, 6)), created_at: U.utcNow()
  });

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

function list(deviceId) {
  const rows = S.all("predictions", { match: { device_id: deviceId }, order: [["created_at", "desc"]], limit: 25 });
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
