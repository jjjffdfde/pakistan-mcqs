/* scripts/phase45/content-index.cjs — build persistent content search indexes */
"use strict";
const fs = require("fs");
const path = require("path");
const {
  CONTENT_DIR, CONTENT_IDX_DIR, ROOT, streamGzLines,
  contentHash, tokenize, normalizeText, nowUtc, atomicWrite, mkdirp
} = require("./common.cjs");

/* ---------- helpers ---------- */

function bucketOf(term) {
  const c = term.codePointAt(0);
  if (c >= 0x61 && c <= 0x7a) return String.fromCharCode(c); /* a-z */
  if (c >= 0x30 && c <= 0x39) return "0"; /* digits */
  return "other";
}

/* ---------- main ---------- */

async function main() {
  console.log("Phase 45 — Building Content Search Indexes");

  const subjects = fs.readdirSync(CONTENT_DIR).filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()).sort();

  /* Collect all content records with IDs */
  const allRecords = [];
  const termBuckets = {}; /* letter -> { term -> [id] } */
  const subjectIdx = {};  /* subject -> [id] */
  const typeIdx = {};     /* type -> [id] */
  const sourceIdx = {};   /* source -> [id] */

  let globalId = 0;

  for (const subj of subjects) {
    const dir = path.join(CONTENT_DIR, subj);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ndjson.gz")).sort();
    for (const file of files) {
      await streamGzLines(path.join(dir, file), (rec) => {
        const id = "c" + String(++globalId).padStart(7, "0");
        allRecords.push({ id, ...rec, _subject: subj });

        /* term index */
        const tokens = tokenize((rec.text || "") + " " + (rec.content_type || ""));
        for (const t of tokens) {
          if (t.length < 3) continue;
          const bucket = bucketOf(t);
          if (!termBuckets[bucket]) termBuckets[bucket] = {};
          if (!termBuckets[bucket][t]) termBuckets[bucket][t] = [];
          termBuckets[bucket][t].push(id);
        }

        /* subject index */
        if (!subjectIdx[subj]) subjectIdx[subj] = [];
        subjectIdx[subj].push(id);

        /* type index */
        const type = rec.content_type || "unknown";
        if (!typeIdx[type]) typeIdx[type] = [];
        typeIdx[type].push(id);

        /* source index */
        const src = path.basename(rec.pdf || rec.source_file || "unknown");
        if (!sourceIdx[src]) sourceIdx[src] = [];
        sourceIdx[src].push(id);
      });
    }
  }

  console.log(`Total records indexed: ${allRecords.length}`);
  console.log(`Term buckets: ${Object.keys(termBuckets).length}`);
  console.log(`Subjects: ${Object.keys(subjectIdx).length}`);
  console.log(`Types: ${Object.keys(typeIdx).length}`);
  console.log(`Sources: ${Object.keys(sourceIdx).length}`);

  /* ---------- write indexes ---------- */
  const idxDir = CONTENT_IDX_DIR;
  mkdirp(idxDir);

  /* by-id index (full records) */
  const byId = {};
  for (const r of allRecords) byId[r.id] = r;
  atomicWrite(path.join(idxDir, "content_by_id.json"), JSON.stringify(byId));

  /* by-subject index */
  atomicWrite(path.join(idxDir, "content_by_subject.json"), JSON.stringify(subjectIdx));

  /* by-type index */
  atomicWrite(path.join(idxDir, "content_by_type.json"), JSON.stringify(typeIdx));

  /* by-source index */
  atomicWrite(path.join(idxDir, "content_by_source.json"), JSON.stringify(sourceIdx));

  /* term buckets */
  const termDir = path.join(idxDir, "term");
  mkdirp(termDir);
  for (const [bucket, terms] of Object.entries(termBuckets)) {
    atomicWrite(path.join(termDir, `${bucket}.json`), JSON.stringify(terms));
  }

  /* manifest */
  const manifest = {
    built_at: nowUtc(),
    total_records: allRecords.length,
    subjects: Object.keys(subjectIdx).length,
    types: Object.keys(typeIdx),
    term_buckets: Object.keys(termBuckets).length,
    term_count: Object.values(termBuckets).reduce((a, b) => a + Object.keys(b).length, 0)
  };
  atomicWrite(path.join(idxDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log("\nIndexes written to:", idxDir);
  console.log("Term buckets:", Object.keys(termBuckets).sort().join(","));

  /* ---------- report ---------- */
  const report = {
    generated_at: nowUtc(),
    total_records: allRecords.length,
    index_location: idxDir,
    indexes_created: ["content_by_id.json", "content_by_subject.json", "content_by_type.json", "content_by_source.json", "term/*.json", "manifest.json"],
    subject_counts: Object.fromEntries(Object.entries(subjectIdx).map(([k, v]) => [k, v.length]).sort((a, b) => b[1] - a[1])),
    type_counts: Object.fromEntries(Object.entries(typeIdx).map(([k, v]) => [k, v.length]).sort((a, b) => b[1] - a[1]))
  };
  atomicWrite(path.join(ROOT, "docs", "phase45_content_indexes.json"), JSON.stringify(report, null, 2));
  console.log("Report -> docs/phase45_content_indexes.json");
}

main().catch((e) => { console.error(e); process.exit(1); });