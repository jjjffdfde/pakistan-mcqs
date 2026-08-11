/* ============================================================
   Generator file 02 — Reasoning (IQ, verbal, non-verbal, analytical)
   Deterministic enumerations; honours s._cap.
   ============================================================ */
"use strict";
const L = require("../lib.js");

const ri = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const capOf = (s, dflt) => (s && s._cap) || dflt;

/* word-analogy pairs (authored, original) */
const ANALOGIES = [
  ["doctor", "hospital"], ["teacher", "school"], ["judge", "court"], ["pilot", "airplane"],
  ["chef", "kitchen"], ["farmer", "field"], ["carpenter", "wood"], ["barber", "scissors"],
  ["author", "book"], ["artist", "canvas"], ["singer", "song"], ["lawyer", "courtroom"],
  ["nurse", "ward"], ["soldier", "army"], ["captain", "ship"], ["driver", "vehicle"],
  ["dentist", "teeth"], ["surgeon", "operation"], ["mechanic", "engine"], ["tailor", "fabric"],
  ["cobbler", "shoe"], ["goldsmith", "jewellery"], ["potter", "clay"], ["weaver", "loom"],
  ["blacksmith", "iron"], ["baker", "bread"], ["butcher", "meat"], ["grocer", "provisions"],
  ["librarian", "library"], ["curator", "museum"], ["astronomer", "observatory"], ["botanist", "herbarium"],
  ["archaeologist", "excavation"], ["geologist", "rock"], ["zoologist", "fauna"], ["linguist", "language"],
  ["athlete", "stadium"], ["swimmer", "pool"], ["boxer", "ring"], ["cyclist", "track"],
  ["writer", "pen"], ["sculptor", "chisel"], ["musician", "instrument"], ["actor", "stage"],
  ["plumber", "pipes"], ["electrician", "wires"], ["mason", "bricks"], ["painter", "brush"]
];

const ODD_SETS = [
  ["Lion", "Tiger", "Leopard", "Elephant"], ["Rose", "Tulip", "Lily", "Oak"],
  ["Lahore", "Karachi", "Islamabad", "Larkana"], ["Copper", "Iron", "Gold", "Wood"],
  ["River", "Canal", "Lake", "Mountain"], ["January", "April", "Monday", "August"],
  ["Red", "Green", "Blue", "Circle"], ["Bread", "Rice", "Chapati", "Cup"],
  ["Pencil", "Eraser", "Sharper", "Window"], ["Truck", "Car", "Bus", "Tunnel"],
  ["Cricket", "Hockey", "Football", "Chess"], ["Peninsula", "Island", "Continent", "River"],
  ["Mango", "Banana", "Apple", "Carrot"], ["Islam", "Hinduism", "Christianity", "Geography"],
  ["Punjab", "Sindh", "Balochistan", "Lahore"], ["Oxygen", "Nitrogen", "Hydrogen", "Soil"],
  ["Shirt", "Trouser", "Cap", "Belt"], ["Camel", "Sheep", "Goat", "Eagle"],
  ["Doctor", "Engineer", "Teacher", "Stethoscope"], ["Summer", "Winter", "Spring", "Cloud"]
];

const BLOOD = [
  ["my father's brother", "uncle", "Father's brother is always one's uncle."],
  ["my mother's sister", "aunt", "Mother's sister is always one's aunt."],
  ["my father's father", "grandfather", "Father's father is one's grandfather (paternal)."],
  ["my mother's mother", "grandmother", "Mother's mother is one's grandmother (maternal)."],
  ["my brother's daughter", "niece", "Brother's daughter is one's niece."],
  ["my sister's son", "nephew", "Sister's son is one's nephew."],
  ["my son's son", "grandson", "Son's son is one's grandson."],
  ["my daughter's daughter", "granddaughter", "Daughter's daughter is one's granddaughter."],
  ["my father's sister", "aunt", "Father's sister is one's paternal aunt."],
  ["my uncle's son", "cousin", "Uncle's son is one's first cousin."],
  ["my wife's father", "father-in-law", "Wife's father is one's father-in-law."],
  ["my husband's mother", "mother-in-law", "Husband's mother is one's mother-in-law."],
  ["my sister's husband", "brother-in-law", "Sister's husband is one's brother-in-law."],
  ["my brother's wife", "sister-in-law", "Brother's wife is one's sister-in-law."],
  ["my daughter's husband", "son-in-law", "Daughter's husband is one's son-in-law."],
  ["my son's wife", "daughter-in-law", "Son's wife is one's daughter-in-law."],
  ["my mother's brother", "uncle", "Mother's brother is one's maternal uncle."],
  ["my wife's mother", "mother-in-law", "Wife's mother is one's mother-in-law."],
  ["my aunt's daughter", "cousin", "Aunt's daughter is one's first cousin."],
  ["my brother's son", "nephew", "Brother's son is one's nephew."]
];

const SERIES1 = {
  "Letter Series": (rng, cap) => {
    const out = [];
    for (const dir of [1, -1]) {
      for (let start = 0; start <= 12 && out.length < cap; start++) {
        for (let step = 2; step <= 12 && out.length < cap; step++) {
          for (let n = 4; n <= 7 && out.length < cap; n++) {
            const seq = Array.from({ length: n }, (_, k) => A[(((start + k * step * dir) % 26) + 26) % 26]);
            const next = A[(((start + n * step * dir) % 26) + 26) % 26];
            const m = L.buildParametric(rng, {
              q: () => `Find the next letter in the series: ${seq.join(", ")}, ?`,
              a: () => next,
              e: () => `Each letter ${dir > 0 ? "advances" : "moves back"} by ${step} positions (A=0, B=1, ...): ${seq.join(" → ")} → ${next}.`,
              distract: () => [A[(((start + (n + 1) * step * dir) % 26) + 26) % 26], A[(((start + n * step * dir + 1) % 26) + 26) % 26], A[(((start + (n - 1) * step * dir) % 26) + 26) % 26]]
            }, { difficulty: L.diffFor(out.length), tags: ["letter-series"] });
            if (m) out.push(m);
          }
        }
      }
    }
    return out;
  },
  "Number Series": (rng, cap) => {
    const out = [];
    for (const dir of [1, -1]) {
      for (let start = 1; start <= 100 && out.length < cap; start++) {
        for (let step = 2; step <= 15 && out.length < cap; step++) {
          for (let n = 4; n <= 7 && out.length < cap; n++) {
            const seq = Array.from({ length: n }, (_, k) => start + k * step * dir);
            if (seq.some((x) => x < 0)) continue;
            const next = start + n * step * dir;
            const m = L.buildParametric(rng, {
              q: () => `Find the next number: ${seq.join(", ")}, ?`,
              a: () => next,
              e: () => `The series ${dir > 0 ? "increases" : "decreases"} by ${step} each time: ${seq.join(" → ")} → ${next}.`,
              distract: () => [next + step * dir, next - step * dir, start + step * dir * (n - 2)]
            }, { difficulty: L.diffFor(out.length), tags: ["number-series"] });
            if (m) out.push(m);
          }
        }
      }
    }
    return out;
  },
  "Coding-Decoding": (rng, cap) => {
    const out = [];
    const WORDS = ["PAKISTAN", "ISLAMABAD", "KARACHI", "LAHORE", "PUNJAB", "SINDH", "URDU", "ENGLISH", "SCIENCE", "MATH", "MATHEMATICS", "QUETTA", "PESHAWAR", "MULTAN"];
    for (let sh = 1; sh <= 25 && out.length < cap; sh++) {
      for (const w of WORDS) {
        const code = [...w].map((c) => A[(A.indexOf(c) + sh) % 26]).join("");
        const m = L.buildParametric(rng, {
          q: () => `In a certain code, ${w} is written as ${code}. How is PAK written in that code?`,
          a: () => [..."PAK"].map((c) => A[(A.indexOf(c) + sh) % 26]).join(""),
          e: () => `Each letter is shifted ${sh} places forward (${A[0]}→${A[sh]}). PAK → ${[... "PAK"].map((c) => A[(A.indexOf(c) + sh) % 26]).join("")}.`,
          distract: () => [
            [..."PAK"].map((c) => A[(A.indexOf(c) + sh + 1) % 26]).join(""),
            [..."PAK"].map((c) => A[(A.indexOf(c) - sh + 26) % 26]).join(""),
            [..."PAK"].reverse().join("")
          ]
        }, { difficulty: L.diffFor(out.length), tags: ["coding"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Odd One Out": (rng, cap) => {
    const out = [];
    for (const set of ODD_SETS) {
      for (let oddIdx = 0; oddIdx < set.length && out.length < cap; oddIdx++) {
        const odd = set[oddIdx];
        const m = L.buildParametric(rng, {
          q: () => `Which word does NOT belong with the others?`,
          a: () => odd,
          e: () => `The other three form a related group (category, habitat or type); "${odd}" is different.`,
          distract: () => set.filter((x) => x !== odd)
        }, { difficulty: L.diffFor(out.length), tags: ["odd-one-out"] });
        if (m) out.push(m);
      }
    }
    return out;
  }
};

const SERIES2 = {
  "Analogies": (rng, cap) => {
    const out = [];
    for (const [ex1, ex2] of ANALOGIES) {
      for (const [q1, q2] of ANALOGIES) {
        if (q1 === ex1) continue;
        const otherPlaces = ANALOGIES.map((x) => x[1]).filter((x) => x !== q2);
        const m = L.buildParametric(rng, {
          q: () => `${ex1.charAt(0).toUpperCase() + ex1.slice(1)} : ${ex2} :: ${q1.charAt(0).toUpperCase() + q1.slice(1)} : ?`,
          a: () => q2,
          e: () => `A ${ex1} works in a ${ex2}. Similarly, a ${q1} works in a ${q2} — the same profession→place relationship is preserved.`,
          distract: () => L.shuffle(rng, otherPlaces).slice(0, 3)
        }, { difficulty: L.diffFor(out.length), tags: ["analogy"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Blood Relations": (rng, cap) => {
    const out = [];
    for (const [chain, answer, expl] of BLOOD) {
      const rels = BLOOD.map((x) => x[1]);
      const m = L.buildParametric(rng, {
        q: () => `Pointing to a man, Ali said, "He is ${chain}." What is he to Ali?`,
        a: () => answer,
        e: () => expl,
        distract: () => L.shuffle(rng, rels.filter((x) => x !== answer)).slice(0, 3)
      }, { difficulty: L.diffFor(out.length), tags: ["blood-relations"] });
      if (m) out.push(m);
    }
    return out;
  },
  "Direction Sense": (rng, cap) => {
    const out = [];
    const dirs = ["North", "South", "East", "West"];
    const turnMap = { "North-left": "West", "North-right": "East", "South-left": "East", "South-right": "West", "East-left": "North", "East-right": "South", "West-left": "South", "West-right": "North" };
    for (const first of dirs) {
      for (const turn of ["left", "right"]) {
        for (let s1 = 2; s1 <= 9 && out.length < cap; s1++) {
          for (let s2 = 2; s2 <= 9 && out.length < cap; s2++) {
            const second = turnMap[`${first}-${turn}`];
            const m = L.buildParametric(rng, {
              q: () => `A man walks ${s1} km ${first.toLowerCase()}, turns ${turn} and walks ${s2} km. In which direction is he now facing?`,
              a: () => second,
              e: () => `Facing ${first}, a ${turn} turn points ${second}. Distance does not change direction.`,
              distract: () => dirs.filter((x) => x !== second)
            }, { difficulty: L.diffFor(out.length), tags: ["direction"] });
            if (m) out.push(m);
          }
        }
      }
    }
    return out;
  },
  "Ranking and Positioning": (rng, cap) => {
    const out = [];
    for (let total = 20; total <= 90 && out.length < cap; total++) {
      for (let pos = 3; pos <= total - 4 && out.length < cap; pos++) {
        const m = L.buildParametric(rng, {
          q: () => `In a class of ${total} students, Ahmad ranks ${pos}th from the top. What is his rank from the bottom?`,
          a: () => total - pos + 1,
          e: () => `Rank from bottom = total − rank from top + 1 = ${total} − ${pos} + 1 = ${total - pos + 1}.`,
          distract: () => [total - pos, pos + 1, total - pos - 1]
        }, { difficulty: L.diffFor(out.length), tags: ["ranking"] });
        if (m) out.push(m);
      }
    }
    return out;
  }
};

module.exports = [
  {
    subjects: ["iq", "logical-reasoning"],
    name: "Reasoning — Series and Patterns",
    topics: Object.keys(SERIES1),
    tags: ["reasoning"],
    generate: (rng, t, s) => SERIES1[t] ? SERIES1[t](rng, capOf(s, 4000)) : []
  },
  {
    subjects: ["verbal-reasoning", "analytical-reasoning", "non-verbal-reasoning"],
    name: "Reasoning — Verbal and Analytical",
    topics: Object.keys(SERIES2),
    tags: ["reasoning"],
    generate: (rng, t, s) => SERIES2[t] ? SERIES2[t](rng, capOf(s, 4000)) : []
  }
];
