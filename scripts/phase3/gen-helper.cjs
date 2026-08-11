const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "..", "data");
const OUT = path.join(DATA, "mcqs");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));

const subjects = read("subjects.json");
const chapters = read("chapters.json");
const topics = read("topics.json");

const subjById = Object.fromEntries(subjects.map((s) => [s.id, s]));
const chapterBySubject = {};
for (const c of chapters) (chapterBySubject[c.subject] = chapterBySubject[c.subject] || []).push(c);
const topicByChapter = {};
for (const t of topics) (topicByChapter[t.chapter] = topicByChapter[t.chapter] || []).push(t);

/* resolve topic by name within a subject -> {chapterId, chapterName, topicId, topicName, subtopic} */
function resolve(subjectId, topicName) {
  for (const ch of chapterBySubject[subjectId] || []) {
    for (const t of topicByChapter[ch.id] || []) {
      if (t.name.toLowerCase() === topicName.toLowerCase()) {
        return { chapter: ch.id, chapterName: ch.name, topic: t.id, topicName: t.name, subtopic: (t.subtopics && t.subtopics[0]) || "" };
      }
    }
  }
  throw new Error(`topic "${topicName}" not found in subject "${subjectId}"`);
}

/* count existing ids per prefix to continue numbering */
const used = {};
const dir = fs.existsSync(OUT) ? fs.readdirSync(OUT).filter((f) => f.endsWith(".json")) : [];
for (const f of dir) {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8"));
    for (const m of arr) {
      const p = m.id.split("-")[0];
      const n = parseInt(m.id.split("-")[1], 10);
      used[p] = Math.max(used[p] || 0, isNaN(n) ? 0 : n);
    }
  } catch (e) { /* skip unreadable */ }
}

let totalWritten = 0;

const SUBJ_PREFIX = {
  "world-current-affairs": "wca", "iq": "iqt", "logical-reasoning": "log", "analytical-reasoning": "anr",
  "verbal-reasoning": "vbr", "non-verbal-reasoning": "nvr", "data-interpretation": "dit", "aptitude-tests": "apt",
  "vocabulary": "vcb", "grammar": "gra", "synonyms": "syn", "antonyms": "ato", "idioms": "idm",
  "sentence-correction": "sec", "comprehension": "cmp", "computer-engineering": "cpe", "mbbs": "mbs",
  "bds": "bds", "dpt": "dpt", "pharmacology": "phl", "general-anatomy": "gan", "oral-anatomy": "ora",
  "oral-histology": "ohs", "oral-pathology": "opa", "hrm": "hrm", "marketing": "mkt",
  "world-history": "whi", "pakistan-history": "phi", "machine-learning": "mln", "deep-learning": "dln",
  "ethical-hacking": "eht", "devops": "dev", "big-data": "bdt", "database": "dbb", "sql": "sql",
  "windows": "win", "linux": "lnx", "html": "htm", "css": "css", "javascript": "jss", "typescript": "tsc",
  "bootstrap": "bts", "tailwind-css": "twc", "react": "rct", "next-js": "nxt", "vue-js": "vue",
  "angular": "ang", "node-js": "nod", "express-js": "exp", "php": "php", "laravel": "lrv",
  "python": "pyt", "django": "djg", "flask": "flk", "java": "jav", "spring-boot": "spb", "c": "cpr",
  "cpp": "cpp", "csharp": "csh", "dotnet": "dot", "go": "gol", "rust": "rus", "git-github": "gth",
  "docker": "dkr", "kubernetes": "kbs", "rest-api": "rap", "graphql": "gql", "mdcat": "mdx",
  "ecat": "ect", "lat": "lat", "gat": "gat", "gre": "gre", "ielts": "iel", "toefl": "tfl", "sat": "sat",
  "civil-eng": "civ", "mechanical-eng": "mec", "electrical-eng": "ele", "software-eng": "swe",
  "sociology": "soc", "accounting": "acc", "finance": "fin", "commerce": "cmc", "statistics": "sta",
  "economics": "eco", "english": "eng", "urdu": "urd", "mathematics": "mat", "islamic-studies": "isl",
  "computer-science": "csc", "current-affairs": "cur", "general-knowledge": "gk", "pakistan-affairs": "pak",
  "reasoning": "rea", "programming": "pro", "ai": "ai", "data-science": "dsc", "cyber-security": "cyb",
  "cloud-computing": "cld", "networking": "net", "operating-systems": "os", "ms-office": "mso",
  "medical": "mdc", "nursing": "nur", "pharmacy": "pha", "anatomy": "ana", "physiology": "phs",
  "pathology": "pat", "microbiology": "mic", "biochemistry": "bic", "histology": "hst",
  "dental-materials": "den", "medicine": "med", "surgery": "srg", "community-medicine": "cme",
  "auditing": "aud", "supply-chain": "scm", "physical-education": "pse", "forestry": "for", "essay": "ess",
  "history": "his", "geography": "geo", "law": "law", "constitution": "con", "international-relations": "ir",
  "political-science": "pol", "psychology": "psy", "education": "edu", "pedagogy": "ped",
  "english-literature": "lit", "environmental-science": "env", "biotechnology": "bt", "electronics": "elx",
  "chemical-eng": "che", "industrial-eng": "ind", "environmental-eng": "enve", "mechatronics": "mecx",
  "agriculture": "agr", "veterinary": "vet", "botany": "bot", "biology": "bio", "chemistry": "chm",
  "physics": "phy", "zoology": "zoo", "everyday-science": "eds", "anthropology": "ant", "constitution": "con"
};

function build(rows) {
  /* rows: [subjectId, topicName, difficulty, question, [A,B,C,D], correct, explanation, [tags]] */
  const out = [];
  for (const r of rows) {
    const [subjectId, topicName, difficulty, question, opts, correct, explanation, tags] = r;
    if (opts.length !== 4) throw new Error(`need 4 options for ${question.slice(0, 40)}`);
    const ref = resolve(subjectId, topicName);
    const subj = subjById[subjectId];
    const prefix = SUBJ_PREFIX[subjectId];
    if (!prefix) throw new Error(`no prefix mapped for subject ${subjectId}`);
    used[prefix] = (used[prefix] || 0) + 1;
    out.push({
      id: `${prefix}-${String(used[prefix]).padStart(3, "0")}`,
      question,
      optionA: opts[0], optionB: opts[1], optionC: opts[2], optionD: opts[3],
      correctAnswer: correct,
      detailedExplanation: explanation,
      difficulty,
      subject: subjectId,
      chapter: ref.chapter,
      topic: ref.topic,
      subtopic: ref.subtopic,
      exam: (subj.exams || []).slice(0, 4),
      year: null,
      references: [],
      tags,
      createdDate: "2026-07-31",
      updatedDate: "2026-07-31"
    });
  }
  totalWritten += out.length;
  return out;
}

function writeFile(name, rows) {
  const arr = build(rows);
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(arr, null, 1));
  console.log(`${name}: ${arr.length} MCQs`);
}

module.exports = { writeFile, totalWritten: () => totalWritten };
