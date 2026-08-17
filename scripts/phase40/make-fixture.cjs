/* ============================================================
   Phase 40 - CI file-data fixture builder (SQLite-free)
   Generates a small synthetic NDJSON.GZ dataset + deterministic
   JSON indexes under <root>/ (default .phase40-fixture/):
     <root>/data/...    (subjects, chapters, topics, mcqs parts,
                         options, quizzes, mocktests, pastpapers)
     <root>/indexes/... (built via runtime-v2/index-builder.cjs)
   Runtime then runs with MCQS_JSON_DATA_DIR=<root>/data and
   MCQS_JSON_INDEX_DIR=<root>/indexes.
   Usage: node scripts/phase40/make-fixture.cjs [--force] [--root <dir>]
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const args = process.argv.slice(2);
const root = args[args.indexOf("--root") + 1] || ".phase40-fixture";
const force = args.includes("--force");
const FIX = path.resolve(ROOT, root);
const DATA = path.join(FIX, "data");
const IDX = path.join(FIX, "indexes");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeGz(file, rows) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, zlib.gzipSync(rows.map((r) => JSON.stringify(r)).join("\n") + "\n"));
}

const CATEGORIES = [
  { id: "gk", name: "General Knowledge", slug: "general-knowledge", icon: "globe", description: "Fixture category", sort_order: 1 }
];

const SUBJECTS = [
  { id: "physics", name: "Physics", slug: "physics", category_id: "gk", icon: "atom", description: "Synthetic physics MCQs for CI", exam_ids: "ppsc,fpsc,nts", status: "active", sort_order: 1 },
  { id: "chemistry", name: "Chemistry", slug: "chemistry", category_id: "gk", icon: "flask", description: "Synthetic chemistry MCQs for CI", exam_ids: "ppsc,fpsc", status: "active", sort_order: 2 },
  { id: "general-knowledge", name: "General Knowledge", slug: "general-knowledge", category_id: "gk", icon: "book", description: "Synthetic GK MCQs for CI", exam_ids: "ppsc,fpsc,nts,ots", status: "active", sort_order: 3 }
];

const CHAPTERS = [
  { id: "ph-ch1", subject_id: "physics", name: "Physics Chapter 1", slug: "physics-chapter-1", sort_order: 1 },
  { id: "ph-ch2", subject_id: "physics", name: "Physics Chapter 2", slug: "physics-chapter-2", sort_order: 2 },
  { id: "ch-ch1", subject_id: "chemistry", name: "Chemistry Chapter 1", slug: "chemistry-chapter-1", sort_order: 1 },
  { id: "ch-ch2", subject_id: "chemistry", name: "Chemistry Chapter 2", slug: "chemistry-chapter-2", sort_order: 2 },
  { id: "gk-ch1", subject_id: "general-knowledge", name: "GK Chapter 1", slug: "gk-chapter-1", sort_order: 1 },
  { id: "gk-ch2", subject_id: "general-knowledge", name: "GK Chapter 2", slug: "gk-chapter-2", sort_order: 2 }
];

const TOPICS = [];
{
  let n = 0;
  for (const c of CHAPTERS) {
    for (let i = 1; i <= 2; i++) {
      n++;
      TOPICS.push({ id: c.id + "-t" + i, chapter_id: c.id, name: `${c.name} Topic ${i}`, slug: `${c.slug}-topic-${i}`, sort_order: i });
    }
  }
}

const QUIZZES = [
  { id: "quiz-1", name: "Physics Fixture Quiz", subject_ids: "physics,chemistry", total_questions: 20, duration_minutes: 10, description: "Synthetic quiz" },
  { id: "quiz-2", name: "GK Fixture Quiz", subject_ids: "general-knowledge", total_questions: 10, duration_minutes: 5, description: "Synthetic quiz" }
];
const MOCKTESTS = [
  { id: "mock-1", name: "PPSC Fixture Mock", subject_ids: "physics,chemistry,general-knowledge", total_questions: 30, duration_minutes: 30, pattern: "ppsc", description: "Synthetic mock" }
];
const PASTPAPERS = [
  { id: "paper-1", title: "PPSC 2024 (Fixture)", subject_ids: "physics", year: 2024, pattern: "ppsc" },
  { id: "paper-2", title: "FPSC 2025 (Fixture)", subject_ids: "chemistry", year: 2025, pattern: "fpsc" },
  { id: "paper-3", title: "NTS 2026 (Fixture)", subject_ids: "general-knowledge", year: 2026, pattern: "nts" }
];

const DIFFS = ["easy", "medium", "hard"];
const LETTERS = ["A", "B", "C", "D"];
const TOTAL = 100;

function buildMcqs() {
  const rows = [];
  const options = [];
  for (let i = 1; i <= TOTAL; i++) {
    const sub = SUBJECTS[(i - 1) % SUBJECTS.length];
    const chapter = CHAPTERS.find((c) => c.subject_id === sub.id);
    const chapterTopics = TOPICS.filter((t) => t.chapter_id === chapter.id);
    const topic = chapterTopics[(i - 1) % chapterTopics.length];
    const id = `${sub.id}-${String(i).padStart(3, "0")}`;
    const correct = LETTERS[(i - 1) % 4];
    rows.push({
      id,
      question: `Question ${i}: ${sub.name} sample MCQ?`,
      correct_answer: correct,
      difficulty: DIFFS[(i - 1) % 3],
      subject_id: sub.id,
      chapter_id: chapter.id,
      topic_id: topic.id,
      status: "active",
      tags: '["fixture"]',
      explanation: `Explanation ${i}: fixture explanation text.`,
      year: 2024 + ((i - 1) % 3),
      exam_ids: sub.exam_ids,
      created_at: new Date(Date.UTC(2026, 0, 1) + i * 3600e3).toISOString(),
      references_json: "[]",
      source: "fixture"
    });
    for (const label of LETTERS) {
      options.push({ mcq_id: id, label, text: `${label}: option text for question ${i}` });
    }
  }
  return { rows, options };
}

async function main() {
  if (fs.existsSync(FIX)) {
    if (!force) {
      console.log(`fixture already exists at ${FIX} (use --force to rebuild)`);
      process.exit(0);
    }
    fs.rmSync(FIX, { recursive: true, force: true });
  }
  ensureDir(FIX);

  writeGz(path.join(DATA, "subjects", "categories.ndjson.gz"), CATEGORIES);
  writeGz(path.join(DATA, "subjects", "subjects.ndjson.gz"), SUBJECTS);
  writeGz(path.join(DATA, "chapters", "chapters.ndjson.gz"), CHAPTERS);
  writeGz(path.join(DATA, "topics", "topics.ndjson.gz"), TOPICS);
  writeGz(path.join(DATA, "assessment", "quizzes.ndjson.gz"), QUIZZES);
  writeGz(path.join(DATA, "assessment", "mocktests.ndjson.gz"), MOCKTESTS);
  writeGz(path.join(DATA, "assessment", "pastpapers.ndjson.gz"), PASTPAPERS);

  const { rows, options } = buildMcqs();
  const perSub = new Map();
  for (const r of rows) {
    if (!perSub.has(r.subject_id)) perSub.set(r.subject_id, []);
    perSub.get(r.subject_id).push(r);
  }
  for (const [sub, subRows] of perSub) writeGz(path.join(DATA, "mcqs", sub, "part01.ndjson.gz"), subRows);
  writeGz(path.join(DATA, "mcqs", "options.ndjson.gz"), options);

  const env = { ...process.env, MCQS_JSON_DATA_DIR: DATA, MCQS_JSON_INDEX_DIR: IDX };
  const r = spawnSync(process.execPath, [path.join(ROOT, "runtime-v2", "index-builder.cjs"), "all"], { cwd: ROOT, env, stdio: "inherit" });
  if (r.status !== 0) { console.error("fixture index build FAILED"); process.exit(r.status || 1); }

  const manifest = JSON.parse(fs.readFileSync(path.join(IDX, "manifest.json"), "utf8"));
  console.log(`fixture ready at ${FIX}: ${manifest.rows} mcqs, ${Object.keys(manifest.sourceFiles).length} subjects, indexes OK`);
}

main().catch((e) => { console.error(e); process.exit(1); });
