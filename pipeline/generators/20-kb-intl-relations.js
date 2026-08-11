/* ============================================================
   Deep Knowledge KB — International Relations
   Diplomacy, organisations, treaties + numeric arithmetic.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["international-relations"],
  chapter: "International Relations — Deep Knowledge Bank",
  tags: ["international-relations", "deep-kb", "diplomacy", "treaties", "un"],
  topics: {

    "Diplomacy and Treaties": [
      {
        kind: "fact", name: "diplomacy facts",
        note: "Core diplomatic concepts and instruments.",
        facts: [
          ["What is diplomacy?", "The conduct of relations between states", "Diplomacy uses negotiation and dialogue to manage state relations."],
          ["What is an ambassador?", "A state's top diplomat to another state", "Ambassadors represent their state and head its embassy in the host country."],
          ["What is a treaty?", "A binding agreement between states", "Treaties create legal obligations once ratified by the parties."],
          ["What is an embassy?", "A state's diplomatic mission abroad", "Embassies house diplomats and serve citizens in the host state."],
          ["What is the Vienna Convention on Diplomatic Relations?", "The 1961 treaty on diplomatic immunity", "The 1961 Vienna Convention codifies embassy and diplomat immunities."],
          ["What is ratification?", "Formal approval of a treaty", "Ratification makes a signed treaty legally binding for a state."],
          ["What is an international sanction?", "A coercive measure against a state", "Sanctions restrict trade or travel to pressure a state's behaviour."],
          ["What is a bilateral agreement?", "An agreement between two states", "Bilateral treaties bind exactly two parties, like the Simla Agreement."],
          ["What is a multilateral agreement?", "An agreement among many states", "Multilateral treaties, like the UN Charter, bind many parties."],
          ["What is diplomatic immunity?", "Legal protection for diplomats abroad", "Diplomatic immunity shields diplomats from host-state prosecution."],
          ["What is the UN Charter?", "The founding treaty of the UN", "The UN Charter was signed in San Francisco in 1945, founding the UN."],
          ["What is a veto?", "A permanent member's power to block a decision", "The five permanent members each hold a veto in the Security Council."]
        ],
        trick: "Embassy=mission, treaty=binding, 1961=Vienna, veto=permanent members, bilateral=two.",
        tip: "Instrument-definition pairs are the most asked diplomacy items."
      },
      {
        kind: "tf", name: "diplomacy statements",
        note: "True/false stems on diplomacy.",
        statements: [
          ["A bilateral agreement binds two states.", "A bilateral agreement binds fifty states."],
          ["Ratification makes a treaty binding.", "Ratification is a type of military parade."],
          ["The UN Charter was signed in 1945.", "The UN Charter was signed in 1945 BC."],
          ["Diplomatic immunity protects diplomats abroad.", "Diplomatic immunity cancels all passports."],
          ["Sanctions coerce through restrictions.", "Sanctions only award Olympic medals."],
          ["The Vienna Convention dates to 1961.", "The Vienna Convention dates to 1061."]
        ],
        trick: "bilateral=two, 1961=Vienna, 1945=Charter, veto=5 members.",
        tip: "Number and definition swaps are the traps."
      },
      {
        kind: "numeric", name: "treaty ages", difficulty: "easy",
        note: "Age of treaties from signing years.",
        q: (v) => `The UN Charter was signed in 1945. How old was it in ${v.y}?`,
        a: (v) => `${v.y - 1945}`,
        e: (v) => `Age = ${v.y} − 1945 = ${v.y - 1945} years, counting from the charter's signing in San Francisco.`,
        distract: (v) => [`${v.y - 1946}`, `${v.y - 1944}`, `${v.y - 1935}`, `${v.y - 1955}`, `${v.y - 1945 + 5}`],
        vals: (rng) => ({ y: 1950 + Math.floor(rng() * 76) }),
        whyWrong: (v) => [`Subtract 1945 from the later year; off-by-one answers are the classic traps.`],
        trick: "age = later year − signing year.",
        tip: "UN Charter signed 26 June 1945."
      },
      {
        kind: "numeric", name: "membership growth percentages", difficulty: "medium",
        note: "UN membership percentage of world states.",
        q: (v) => `The UN has ${v.m} member states out of about ${v.total} recognised states. What percentage of states belong to the UN, rounded to one decimal?`,
        a: (v) => `${(100 * v.m / v.total).toFixed(1)}%`,
        e: (v) => `Share = ${v.m} ÷ ${v.total} × 100 = ${(100 * v.m / v.total).toFixed(1)}%, because the UN counts members against the total number of states.`,
        distract: (v) => {
          const c = 100 * v.m / v.total;
          return [`${(100 - c).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 1.1).toFixed(1)}%`, `${(c * 0.9).toFixed(1)}%`, `${v.m}%`];
        },
        vals: (rng) => ({ m: 130 + Math.floor(rng() * 65), total: 195 }),
        whyWrong: (v) => [`Divide members by ALL states; the non-member share is the deliberate distractor.`],
        trick: "% = members ÷ states × 100.",
        tip: "The UN has 193 members."
      },
      {
        kind: "numeric", name: "summit cycle arithmetic", difficulty: "easy",
        note: "G7 and summit cycles.",
        q: (v) => `The G7 summit is held annually. If the ${v.n}th summit took place in ${v.y}, in which year did the first summit occur?`,
        a: (v) => `${v.y - (v.n - 1)}`,
        e: (v) => `Working back one year per summit: ${v.y} − (${v.n} − 1) = ${v.y - (v.n - 1)}, since the summits run annually from the first.`,
        distract: (v) => [`${v.y - v.n}`, `${v.y - (v.n - 2)}`, `${v.y - (v.n + 1)}`, `${v.y - (v.n - 1) + 2}`, `${v.y - (v.n - 1) - 2}`],
        vals: (rng) => {
          const n = 40 + Math.floor(rng() * 15);
          const y = 2025 - (n - 45 > 0 ? Math.floor(rng() * 5) : 0);
          return { n, y: y + (n - 40) };
        },
        whyWrong: (v) => [`Subtract one year per summit after the first; off-by-one answers are the classic traps.`],
        trick: "first year = nth year − (n − 1).",
        tip: "Annual summits shift by one year each edition."
      },
      {
        kind: "numeric", name: "peacekeeping force arithmetic", difficulty: "medium",
        note: "Troop contributions and shares.",
        q: (v) => `A peacekeeping mission fields ${v.t} troops, of which ${v.c} come from South Asia. What percentage are from South Asia, rounded to one decimal?`,
        a: (v) => `${(100 * v.c / v.t).toFixed(1)}%`,
        e: (v) => `Share = ${v.c} ÷ ${v.t} × 100 = ${(100 * v.c / v.t).toFixed(1)}%, comparing the South Asian contribution to the total mission size.`,
        distract: (v) => {
          const c = 100 * v.c / v.t;
          return [`${(100 - c).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 1.5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${v.c}%`];
        },
        vals: (rng) => {
          const t = 5000 + Math.floor(rng() * 40) * 500;
          const c = 500 + Math.floor(rng() * (t / 2));
          return { t, c };
        },
        whyWrong: (v) => [`Divide the contribution by the TOTAL force; the non-South-Asian share is the deliberate distractor.`],
        trick: "% = contribution ÷ total × 100.",
        tip: "Pakistan is among the largest troop contributors."
      }
    ],

    "Regional and Global Structures": [
      {
        kind: "fact", name: "regional facts",
        note: "Regional organisations and structures.",
        facts: [
          ["What is the Security Council?", "The UN body responsible for peace and security", "The Security Council can authorise sanctions and military action."],
          ["How many non-permanent members does the Security Council have?", "Ten", "Ten elected non-permanent members serve two-year terms alongside the five permanent ones."],
          ["What is the General Assembly?", "The UN body where all members vote", "Every member state has one vote in the General Assembly, regardless of size."],
          ["What is a regional organisation?", "A grouping of states in one region", "Regional bodies like ASEAN and SAARC promote regional cooperation."],
          ["What is the Commonwealth?", "A voluntary association of former British colonies", "The Commonwealth groups 56 states sharing historical and cultural links."],
          ["What is the Non-Aligned Movement?", "States avoiding Cold War blocs", "The NAM, founded 1961, grouped states outside both superpower camps."],
          ["What is the WTO's role in disputes?", "Settling trade disputes between members", "The WTO's dispute body rules on trade conflicts between states."],
          ["What is the ICC?", "The International Criminal Court", "The ICC in The Hague prosecutes genocide, war crimes and crimes against humanity."],
          ["What is a sovereign state?", "A state with full authority over its territory", "Sovereignty means a state governs itself without outside control."],
          ["What is the Economic Cooperation Organization?", "A regional body of Central and West Asian states", "The ECO links Pakistan, Iran, Turkey and Central Asian states."],
          ["What is the Shanghai Cooperation Organisation?", "A Eurasian security and cooperation body", "The SCO includes China, Russia, Pakistan, India and Central Asian states."],
          ["What is D-8?", "A bloc of eight Muslim-majority developing states", "The Developing-8 promotes economic cooperation among its eight members."]
        ],
        trick: "SC=10+5, GA=one vote each, NAM=1961, ICC=crimes, SCO=Eurasia, D-8=eight.",
        tip: "Body-composition pairs are the most asked structure items."
      },
      {
        kind: "tf", name: "regional statements",
        note: "True/false stems on structures.",
        statements: [
          ["The Security Council has ten non-permanent members.", "The Security Council has a hundred non-permanent members."],
          ["The ICC prosecutes war crimes.", "The ICC organises world football finals."],
          ["The NAM was founded in 1961.", "The NAM was founded in 1961 BC."],
          ["The Commonwealth links 56 states.", "The Commonwealth links 2 states."],
          ["The SCO includes China and Russia.", "The SCO includes Brazil and Chile."],
          ["D-8 groups eight developing Muslim-majority states.", "D-8 groups eighty industrialised states."]
        ],
        trick: "SC=15 total, NAM=1961, Commonwealth=56, D-8=eight.",
        tip: "Number swaps are the classic traps."
      },
      {
        kind: "numeric", name: "security council vote shares", difficulty: "hard",
        note: "Vote shares in the 15-member Council.",
        q: (v) => `A Security Council resolution needs 9 of 15 votes with no veto. If ${v.yes} members vote in favour, how many more votes are needed for adoption?`,
        a: (v) => `${9 - v.yes}`,
        e: (v) => `The threshold is 9 votes, so ${v.yes} in favour leaves ${9 - v.yes} votes still needed to adopt the resolution.`,
        distract: (v) => [`${15 - v.yes}`, `${9 - v.yes + 1}`, `${9 - v.yes - 1}`, `${v.yes + 1}`, `${10 - v.yes}`],
        vals: (rng) => ({ yes: 4 + Math.floor(rng() * 5) }),
        whyWrong: (v) => [`Subtract from the 9-vote threshold, not the 15 total; miscounting the majority is the classic error.`],
        trick: "needed = 9 − votes in favour.",
        tip: "Nine of fifteen votes, with no permanent veto."
      },
      {
        kind: "numeric", name: "regional membership percentages", difficulty: "medium",
        note: "Share calculations for regional bodies.",
        q: (v) => `SAARC has ${v.m} members out of the ${v.total} states of South Asia and its neighbourhood. What percentage of the grouping's membership is covered by these states, rounded to one decimal?`,
        a: (v) => `${(100 * v.m / v.total).toFixed(1)}%`,
        e: (v) => `Share = ${v.m} ÷ ${v.total} × 100 = ${(100 * v.m / v.total).toFixed(1)}%, comparing the member count with the total states listed.`,
        distract: (v) => {
          const c = 100 * v.m / v.total;
          return [`${(100 - c).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 1.5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${v.m}%`];
        },
        vals: (rng) => {
          const total = 8 + Math.floor(rng() * 3);
          const m = 3 + Math.floor(rng() * (total - 2));
          return { m, total };
        },
        whyWrong: (v) => [`Divide members by the total; the non-member share is the deliberate distractor.`],
        trick: "% = members ÷ total × 100.",
        tip: "SAARC has eight members."
      },
      {
        kind: "numeric", name: "founding intervals", difficulty: "easy",
        note: "Years between founding of bodies.",
        q: (v) => `The Non-Aligned Movement was founded in 1961 and the Shanghai Cooperation Organisation in ${v.y}. How many years apart?`,
        a: (v) => `${v.y - 1961}`,
        e: (v) => `Gap = ${v.y} − 1961 = ${v.y - 1961} years, counting from the NAM's founding to the SCO's establishment.`,
        distract: (v) => [`${v.y - 1962}`, `${v.y - 1960}`, `${v.y - 1951}`, `${v.y - 1971}`, `${v.y - 1961 + 10}`],
        vals: (rng) => ({ y: 1995 + Math.floor(rng() * 7) }),
        whyWrong: (v) => [`Subtract 1961 from the later founding year; off-by-one answers are the classic traps.`],
        trick: "gap = later − earlier.",
        tip: "SCO charter signed 2001, predecessor 1996."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
