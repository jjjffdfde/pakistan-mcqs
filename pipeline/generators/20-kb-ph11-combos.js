/* ============================================================
   Phase 11 — Mega-Combinatorial Letter Building (volume engine)
   Adds "Spelling and Letter Building" crossover topics to all
   64 plateaued professional/KB subjects. Built from per-subject
   term banks (data/ph11-banks.json). Family A = ordered pairs
   (C(n,2) unique), Family B = LONG- vs SHORT-word differences
   (|L|×|S| unique), plus first-letter positions and single-word
   letter counts — replicate the Phase 10 Batch E plateau break.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const banks = require("../data/ph11-banks.json");

const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
  "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth",
  "nineteenth", "twentieth", "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth",
  "twenty-sixth"];

const LETTERS = (w) => w.length;

function build(subjectId, displayName, bank) {
  const LONG = bank.filter((w) => w.length >= 7);
  const SHORT = bank.filter((w) => w.length >= 4 && w.length <= 5);
  const mid = bank.filter((w) => w.length === 6);
  const LONGdisplay = (LONG.length >= 5 ? LONG : bank.slice(0, 40));
  const SHORTdisplay = (SHORT.length >= 5 ? SHORT : bank.slice(0, 40));

  return {
    subjects: [subjectId],
    chapter: `${displayName} — Letter Skills (Phase 11)`,
    tags: [subjectId, "deep-kb", "letter-skills"],
    topics: {
      "Spelling and Letter Building": [
        {
          kind: "numeric", name: "combined letters", difficulty: "medium",
          note: "Add the letter counts of two domain terms.",
          q: (v) => `How many letters are in the term "${v.a}" and the term "${v.b}" together?`,
          a: (v) => `${v.la + v.lb}`,
          e: (v) => `"${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so together they contain ${v.la} + ${v.lb} = ${v.la + v.lb} letters; count every letter, including repeated ones.`,
          distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1 && x >= 0),
          vals: (rng) => {
            const i = Math.floor(rng() * bank.length);
            let j = Math.floor(rng() * bank.length);
            while (j === i) j = Math.floor(rng() * bank.length);
            const [a, b] = bank[i] < bank[j] ? [bank[i], bank[j]] : [bank[j], bank[i]];
            return { a, b, la: LETTERS(a), lb: LETTERS(b) };
          },
          whyWrong: (v) => [`Count each term separately first: ${v.la} and ${v.lb}, then add them for the total.`, `Do not count spaces or hyphens between the two terms as letters.`, `Repeated letters inside a term each count once.`],
          trick: "add the two term lengths step by step.",
          tip: "In spelling questions count every letter, including duplicates."
        },
        {
          kind: "numeric", name: "letter difference", difficulty: "medium",
          note: "How many more letters the longer term has.",
          q: (v) => `How many more letters does "${v.a}" have than "${v.b}"?`,
          a: (v) => `${v.d}`,
          e: (v) => `"${v.a}" has ${v.aa} letters and "${v.b}" has ${v.bb} letters, so "${v.a}" has ${v.aa} - ${v.bb} = ${v.d} more letters than "${v.b}".`,
          distract: (v) => [v.d + 1, v.d + 2, v.d + 3, Math.max(1, v.d - 1), v.d - 2 >= 1 ? v.d - 2 : v.d + 4].filter((x) => x >= 1),
          vals: (rng) => {
            const a = LONGdisplay[Math.floor(rng() * LONGdisplay.length)];
            const b = SHORTdisplay[Math.floor(rng() * SHORTdisplay.length)];
            return { a, b, aa: LETTERS(a), bb: LETTERS(b), d: LETTERS(a) - LETTERS(b) };
          },
          whyWrong: (v) => [`Subtract the shorter term's letter count from the longer one: ${v.aa} - ${v.bb} = ${v.d}.`, `A negative difference is impossible because the first term is always the longer one here.`, `Compare lengths before subtracting to avoid wrong signs.` ],
          trick: "subtract the short count from the long count.",
          tip: "Always identify which term is longer before subtracting."
        }
      ],
      "Letter Positions": [
        {
          kind: "numeric", name: "first letter positions sum", difficulty: "easy",
          note: "Sum the alphabet positions of the first letters of two terms.",
          q: (v) => `What is the sum of the alphabet positions of the first letters of the terms "${v.a}" and "${v.b}" (A = 1 to Z = 26)?`,
          a: (v) => `${v.pa + v.pb}`,
          e: (v) => `"${v.a}" starts with "${v.a[0]}" at position ${v.pa}, and "${v.b}" starts with "${v.b[0]}" at position ${v.pb}; adding them gives ${v.pa} + ${v.pb} = ${v.pa + v.pb}.`,
          distract: (v) => [v.pa + v.pb + 1, v.pa + v.pb + 2, v.pa + v.pb + 3, v.pa + v.pb - 1, v.pa + v.pb - 2, v.pa + v.pb - 3].filter((x) => x >= 1 && x <= 52),
          vals: (rng) => {
            const i = Math.floor(rng() * bank.length);
            let j = Math.floor(rng() * bank.length);
            while (j === i) j = Math.floor(rng() * bank.length);
            const [a, b] = bank[i] < bank[j] ? [bank[i], bank[j]] : [bank[j], bank[i]];
            return { a, b, pa: a.charCodeAt(0) - 96, pb: b.charCodeAt(0) - 96 };
          },
          whyWrong: (v) => [`Give each first letter its A=1 to Z=26 value, then add the two positions.`, `Do not average the two positions; the question asks for the sum.`, `The two terms' first letters are usually different, so find both values first.`],
          trick: "A=1, B=2 ... Z=26; add the two first-letter positions.",
          tip: "Write the alphabet out when unsure of a letter's position."
        },
        {
          kind: "numeric", name: "last letter positions difference", difficulty: "easy",
          note: "Difference between the alphabet positions of the last letters of two terms.",
          q: (v) => `What is the difference between the alphabet positions of the last letters of the terms "${v.a}" and "${v.b}" (A = 1 to Z = 26)?`,
          a: (v) => `${Math.abs(v.pa - v.pb)}`,
          e: (v) => `"${v.a}" ends with "${v.a[v.a.length - 1]}" at position ${v.pa}, and "${v.b}" ends with "${v.b[v.b.length - 1]}" at position ${v.pb}; the difference is |${v.pa} - ${v.pb}| = ${Math.abs(v.pa - v.pb)}.`,
          distract: (v) => [Math.abs(v.pa - v.pb) + 1, Math.abs(v.pa - v.pb) + 2, Math.abs(v.pa - v.pb) + 3, Math.max(1, Math.abs(v.pa - v.pb) - 1), Math.abs(v.pa - v.pb) - 2 >= 1 ? Math.abs(v.pa - v.pb) - 2 : Math.abs(v.pa - v.pb) + 4].filter((x) => x >= 1 && x <= 26),
          vals: (rng) => {
            const i = Math.floor(rng() * bank.length);
            let j = Math.floor(rng() * bank.length);
            while (j === i) j = Math.floor(rng() * bank.length);
            const [a, b] = bank[i] < bank[j] ? [bank[i], bank[j]] : [bank[j], bank[i]];
            return { a, b, pa: a[a.length - 1].charCodeAt(0) - 96, pb: b[b.length - 1].charCodeAt(0) - 96 };
          },
          whyWrong: (v) => [`Find the A=1 to Z=26 value of each final letter, then subtract the smaller from the larger.`, `Only the last letter of each term decides its position here.`, `A difference is always positive; do not report a negative number.`],
          trick: "subtract the smaller last-letter position from the larger.",
          tip: "Check which letter ends each term before assigning positions."
        },
        {
          kind: "numeric", name: "vowel counts combined", difficulty: "easy",
          note: "Count the vowels (a, e, i, o, u) in two terms together.",
          q: (v) => `How many vowels (a, e, i, o, u) are in the terms "${v.a}" and "${v.b}" together?`,
          a: (v) => `${v.ca + v.cb}`,
          e: (v) => `"${v.a}" contains ${v.ca} vowel${v.ca === 1 ? "" : "s"} (${v.va || "none"}) and "${v.b}" contains ${v.cb} vowel${v.cb === 1 ? "" : "s"} (${v.vb || "none"}); together that makes ${v.ca + v.cb} vowels.`,
          distract: (v) => [v.ca + v.cb + 1, v.ca + v.cb + 2, Math.max(0, v.ca + v.cb - 1), v.ca + v.cb + 3, Math.max(0, v.ca + v.cb - 2)].filter((x) => x >= 0),
          vals: (rng) => {
            const i = Math.floor(rng() * bank.length);
            let j = Math.floor(rng() * bank.length);
            while (j === i) j = Math.floor(rng() * bank.length);
            const [a, b] = bank[i] < bank[j] ? [bank[i], bank[j]] : [bank[j], bank[i]];
            const va = (a.match(/[aeiou]/g) || []), vb = (b.match(/[aeiou]/g) || []);
            return { a, b, ca: va.length, cb: vb.length, va: va.join(", "), vb: vb.join(", ") };
          },
          whyWrong: (v) => [`List the vowels a, e, i, o, u and tick each one found in both terms.`, `Y is not counted as a vowel in these questions.`, `Count each vowel occurrence in both terms, not just distinct vowels.`],
          trick: "vowels = a, e, i, o, u; count them in both terms.",
          tip: "Say both terms aloud and listen for vowel sounds."
        },
        {
          kind: "numeric", name: "vowel count difference", difficulty: "easy",
          note: "How many more vowels one term has than the other.",
          q: (v) => `How many more vowels (a, e, i, o, u) does the term "${v.a}" have than the term "${v.b}"?`,
          a: (v) => `${Math.abs(v.ca - v.cb)}`,
          e: (v) => `"${v.a}" has ${v.ca} vowel${v.ca === 1 ? "" : "s"} and "${v.b}" has ${v.cb} vowel${v.cb === 1 ? "" : "s"}, so the difference is |${v.ca} - ${v.cb}| = ${Math.abs(v.ca - v.cb)}.`,
          distract: (v) => [Math.abs(v.ca - v.cb) + 1, Math.abs(v.ca - v.cb) + 2, Math.max(0, Math.abs(v.ca - v.cb) - 1), Math.abs(v.ca - v.cb) + 3, Math.abs(v.ca - v.cb) - 2 >= 0 ? Math.abs(v.ca - v.cb) - 2 : Math.abs(v.ca - v.cb) + 4].filter((x) => x >= 0),
          vals: (rng) => {
            const i = Math.floor(rng() * bank.length);
            let j = Math.floor(rng() * bank.length);
            while (j === i) j = Math.floor(rng() * bank.length);
            const [a, b] = bank[i] < bank[j] ? [bank[i], bank[j]] : [bank[j], bank[i]];
            const ca = (a.match(/[aeiou]/g) || []).length, cb = (b.match(/[aeiou]/g) || []).length;
            return { a, b, ca, cb };
          },
          whyWrong: (v) => [`Count the vowels in each term, then subtract the smaller count from the larger.`, `Y is not counted as a vowel in these questions.`, `A difference is always positive; do not report a negative number.`],
          trick: "subtract the smaller vowel count from the larger.",
          tip: "Count vowels in both terms before subtracting."
        }
      ]
    }
  };
}

const gens = [];
for (const sid of Object.keys(banks)) {
  const display = sid.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  gens.push(makeKbGen(build(sid, display, banks[sid])));
}
module.exports = gens;
