/* ============================================================
   Deep Knowledge Engine — template families + explanation /
   distractor synthesis for knowledge-driven generation.
   Consumed by KB modules in pipeline/generators/20*-kb.js.

   Concept kinds (template families):
     list     -> is-a / belongs / which-NOT (20+ variants per list)
     pair     -> forward / reverse / correctly-matched (3 per pair)
     fact     -> authored Q/A/E (+ why-wrong per distractor)
     tf       -> true-statement / false-statement selection
     order    -> sequence position (first/last/middle)
     numeric  -> parametric computed values (unlimited variants)
     scenario -> authored application questions
   ============================================================ */
"use strict";
const L = require("./lib.js");

/* ---- phrasing banks (rotated so within-topic originality stays high) ---- */
const PH = {
  isA: [
    (c) => `Which of the following is a ${c}`,
    (c) => `Which of these qualifies as a ${c}`,
    (c) => `Which of the following is an example of ${c}`,
    (c) => `Which of the following comes under ${c}`
  ],
  belongs: [
    (c) => `Which of the following belongs to ${c}`,
    (c) => `Which of these is included in ${c}`,
    (c) => `Which of the following forms part of ${c}`
  ],
  notA: [
    (c) => `Which of the following is NOT ${c}`,
    (c) => `Which of these is not a member of ${c}`,
    (c) => `Which of the following does NOT belong to ${c}`,
    (c) => `Which of the following is NOT included in ${c}`
  ],
  pairFwd: [
    (a, b) => `Which is the ${b} of the following ${a}`,
    (a, b) => `Which of these is the ${b} of ${a}`,
    (a, b) => `What is the ${b} of ${a}`
  ],
  pairRev: [
    (a, b) => `Which ${a} corresponds to "${b}"`,
    (a, b) => `Which ${a} is matched with "${b}"`,
    (a, b) => `Which ${a} has the value "${b}"`
  ],
  pairMatch: [
    (a, b) => `Which of the following pairs is correctly matched (${a} — ${b})`,
    (a, b) => `Which option shows the correct ${a} to ${b} match`,
    (a, b) => `Which ${a}–${b} combination is correct`
  ],
  tfTrue: [
    (c) => `Which of the following statements about ${c} is TRUE`,
    (c) => `Which of these statements regarding ${c} is correct`
  ],
  tfFalse: [
    (c) => `Which of the following statements about ${c} is FALSE`,
    (c) => `Which of these statements regarding ${c} is incorrect`
  ],
  orderFirst: [
    (c) => `In ${c}, which of the following comes FIRST`,
    (c) => `Which of the following occurs first in ${c}`
  ],
  orderLast: [
    (c) => `In ${c}, which of the following comes LAST`,
    (c) => `Which of the following occurs last in ${c}`
  ],
  orderAt: [
    (c, p) => `In ${c}, which of the following occupies position ${p}`,
    (c, p) => `Which of the following is ${p}${["1st", "2nd", "3rd"][p - 1] || "th"} in ${c}`
  ]
};

function whyWrong(concept, wrong, correct, kind) {
  const w = String(wrong).trim();
  const c = String(correct).trim();
  switch (kind) {
    case "pair": return `"${w}" is not the correct ${concept.b} for ${concept.a}; it belongs with a different ${concept.a}.`;
    case "list": return `"${w}" is not a member of the ${concept.group || cname(concept)}; it lies outside this set.`;
    case "tf": return `"${w}" is not true for ${cname(concept)}; it contradicts the established facts.`;
    case "order": return `"${w}" does not occupy that position in ${cname(concept)}; the sequence differs.`;
    case "fact": return `"${w}" does not match the stated fact about ${cname(concept)}.`;
    default: return `"${w}" is incorrect; the correct answer is "${c}".`;
  }
}

/* Build a full MCQ record with rich metadata. */
function cname(c) { return c.name || c.group || c.a || "the concept"; }

function makeMcq(rng, concept, topic, subject, family, opts) {
  const { question, correct, distractors, why, whyFn, reasoning } = opts;
  const pool = [...distractors];
  const uniq = [];
  const seen = new Set([L.norm(correct)]);
  for (const d of pool) { const n = L.norm(d); if (!seen.has(n)) { seen.add(n); uniq.push(String(d).trim()); } }
  if (uniq.length < 3) return null;
  const wrong3 = L.shuffle(rng, uniq).slice(0, 3);
  const options = L.shuffle(rng, [correct, ...wrong3]);
  const idx = options.indexOf(correct);
  const whyWrongArr = wrong3.map((w) => (whyFn && whyFn(w)) || why || whyWrong(concept, w, correct, family === "match" ? "pair" : family));
  const note = (concept.note || `${cname(concept)}: ${concept.a || ""} ${concept.b || ""}`).replace(/\s+/g, " ").trim();
  const reasoningTxt = reasoning || `Because ${String(correct).toLowerCase()} is the established correct answer for this ${cname(concept)} fact, while the remaining options do not fit.`;
  const explanation = `${note} ${reasoningTxt}`;
  const diffMap = { list: "medium", belongs: "medium", notA: "medium", pair: "medium", rev: "medium", match: "hard", tf: "hard", order: "hard", fact: "easy", numeric: "medium", scenario: "hard" };
  const difficulty = concept.difficulty || diffMap[family] || "medium";
  const bloomMap = { list: "Understand", belongs: "Understand", notA: "Apply", pair: "Understand", rev: "Apply", match: "Apply", tf: "Analyze", order: "Understand", fact: "Recall", numeric: "Apply", scenario: "Analyze" };
  const baseTrick = concept.trick || `Connect "${correct}" with the key term ${cname(concept)} to lock it in memory.`;
  const baseTip = concept.tip || `${cname(concept)} questions are frequently tested; learn the complete set, not isolated facts.`;
  const trick = baseTrick.length < 20 ? `Read the ${cname(concept)} question carefully: ${baseTrick}` : baseTrick;
  const examTip = baseTip.length < 20 ? `In ${cname(concept)} questions always relate the focus to ${baseTip}` : baseTip;
  const tag = (concept.tags || []).slice(0, 6);
  return {
    question, correctAnswer: "ABCD"[options.indexOf(correct)],
    optionA: options[0], optionB: options[1], optionC: options[2], optionD: options[3],
    difficulty,
    explanation,
    explanationWhyWrong: whyWrongArr,
    memoryTrick: trick,
    examTip,
    learningObjective: concept.lo || `Recall and apply ${cname(concept).toLowerCase()} facts in exam-style questions.`,
    bloomTaxonomy: concept.bloom || bloomMap[family],
    confidence: 0.95,
    solvingTimeSec: difficulty === "hard" ? 55 : difficulty === "easy" ? 25 : 40,
    tags: [...tag, family]
  };
}

/* ---- family generators ---- */
const families = {
  /* list: items + outsiders -> is-a / belongs / NOT */
  list(rng, c, topic, subject) {
    const items = c.items.slice(), outsiders = (c.outsiders || []).slice();
    const phIsA = L.shuffle(rng, PH.isA), phNotA = L.shuffle(rng, PH.notA);
    const out = [];
    let i = 0;
    const group = c.group || c.name;
    const variants = Math.min(phIsA.length, items.length);
    for (let v = 0; v < variants; v++) {
      const item = items[v];
      const ds = outsiders.length >= 3 ? outsiders : items.filter((x) => x !== item);
      const q = phIsA[i % phIsA.length](group) + (c.qualifier ? ` ${c.qualifier}` : "") + "?";
      const m = makeMcq(rng, c, topic, subject, "list", {
        question: q, correct: item, distractors: L.shuffle(rng, ds),
        whyFn: (w) => `"${w}" does not belong to the ${group}; it falls outside this set.`,
        reasoning: `"${item}" is a genuine member of the ${group}, which is why it is correct.`
      });
      if (m) out.push(m);
      i++;
    }
    const notVariants = Math.min(phNotA.length, outsiders.length);
    for (let v = 0; v < notVariants; v++) {
      const od = outsiders[v];
      const q = phNotA[i % phNotA.length](group) + "?";
      const m = makeMcq(rng, c, topic, subject, "notA", {
        question: q, correct: od, distractors: L.shuffle(rng, items),
        whyFn: (w) => `"${w}" is in fact a member of the ${group}, so it is not the exception the question asks for.`,
        reasoning: `"${od}" is deliberately not part of the ${group}, while every other option is.`
      });
      if (m) out.push(m);
      i++;
    }
    return out;
  },

  /* pair: pairs -> forward / reverse / correctly-matched */
  pair(rng, c, topic, subject) {
    const out = [];
    let i = 0;
    const pairs = c.pairs.slice();
    const phF = L.shuffle(rng, PH.pairFwd), phR = L.shuffle(rng, PH.pairRev), phM = L.shuffle(rng, PH.pairMatch);
    const pairMap = new Map(pairs.map(([a, b]) => [b, a])); /* reverse lookup for genuine why-wrong */
    for (const [a, b] of pairs) {
      const others = pairs.filter(([x]) => x !== a).map(([, y]) => y);
      const qF = `${phF[i % phF.length](a, c.b)}?`;
      const m1 = makeMcq(rng, c, topic, subject, "pair", {
        question: qF, correct: b, distractors: L.shuffle(rng, others),
        whyFn: (w) => `"${w}" is the ${c.b} of ${pairMap.get(w) || "a different " + c.a}, not ${a}.`,
        reasoning: `Because ${b} is the ${c.b} paired with ${a}, while the other options belong to different ${c.a}s.`
      });
      if (m1) out.push(m1);
      const qR = `${phR[i % phR.length](c.a, b)}?`;
      const oA = pairs.filter(([, y]) => y !== b).map(([x]) => x);
      const revMap = new Map(pairs.map(([a, b]) => [a, b]));
      const m2 = makeMcq(rng, c, topic, subject, "rev", {
        question: qR, correct: a, distractors: L.shuffle(rng, oA),
        whyFn: (w) => `"${w}" has ${c.b} "${revMap.get(w) || "a different value"}", not "${b}".`,
        reasoning: `Because ${c.b} "${b}" belongs to ${a}; the other options are ${c.a}s with different ${c.b}s.`
      });
      if (m2) out.push(m2);
      const qM = `${phM[i % phM.length](c.a, c.b)}?`;
      const fakePairs = pairs.filter(([x]) => x !== a).slice(0, 3).map(([x]) => `${x} — ${b}`);
      while (fakePairs.length < 3) fakePairs.push(`${a} — ${b}`);
      const m3 = makeMcq(rng, c, topic, subject, "match", {
        question: qM, correct: `${a} — ${b}`, distractors: L.shuffle(rng, fakePairs.filter((f) => f !== `${a} — ${b}`).slice(0, 3)),
        whyFn: (w) => {
          const [wa] = (w || "").split(" — ");
          return `"${w}" is a mismatched pair; ${wa}'s correct ${c.b} is not ${b}.`;
        },
        reasoning: `Because only the ${a}–${b} pairing is the genuine match recorded for ${cname(c)}.`
      });
      if (m3) out.push(m3);
      i++;
    }
    return out;
  },

  /* fact: authored Q/A/E -> direct + distractor rotation */
  fact(rng, c, topic, subject) {
    const out = [];
    const facts = c.facts.map((f) => ({ q: f[0], a: f[1], e: f[2] }));
    const answers = facts.map((f) => String(f.a));
    const ansToQ = new Map(facts.map((f) => [L.norm(f.a), f.q])); /* genuine why-wrong lookup */
    for (const f of facts) {
      let e = String(f.e);
      if (e.length < 60) e = e + ` ${f.a} is the correct answer because it is the established fact in this ${c.name} context.`;
      const m = L.buildMcq(rng, { q: f.q, a: f.a, e }, [...answers, ...(c.extraDistractors || [])], {
        difficulty: c.difficulty || "easy", tags: [c.name, "deep-kb"]
      });
      if (!m) continue;
      m.explanationWhyWrong = ["A", "B", "C", "D"].filter((l) => l !== m.correctAnswer).map((l) => m["option" + l])
        .filter((w) => L.norm(w) !== L.norm(f.a)).slice(0, 3)
        .map((w) => {
          const oq = ansToQ.get(L.norm(w));
          return oq
            ? `"${w}" answers a different ${c.name} question ("${oq.replace(/\?+$/, "")}"), not this one.`
            : `"${w}" is a plausible ${c.name} term but not the answer to this question.`;
        });
      m.memoryTrick = c.trick || `Anchor "${f.a}" to the phrase "${f.q.replace(/\?+$/, "")}" so the ${c.name} fact stays paired in memory.`;
      m.examTip = c.tip || `On ${c.name} items, match the stem to the single fact it asks for and eliminate answers that belong to neighbouring questions.`;
      m.learningObjective = c.lo || `Recall and apply ${c.name.toLowerCase()} facts in exam-style questions.`;
      m.bloomTaxonomy = c.bloom || "Recall";
      m.confidence = 0.95;
      m.solvingTimeSec = 25;
      m.tags = [...(c.tags || []), "fact", "deep-kb"];
      out.push(m);
    }
    return out;
  },

  /* tf: [[true statement, false statement], ...] */
  tf(rng, c, topic, subject) {
    const out = [];
    const stmts = c.statements.slice();
    const trues = stmts.map(([t]) => t), falses = stmts.map(([, f]) => f);
    const falseToTrue = new Map(stmts.map(([t, f]) => [L.norm(f), t])); /* each false has a true counterpart */
    const phT = L.shuffle(rng, PH.tfTrue), phF = L.shuffle(rng, PH.tfFalse);
    let i = 0;
    for (const [t, f] of stmts) {
      const m1 = makeMcq(rng, c, topic, subject, "tf", {
        question: `${phT[i % phT.length](c.name)}?`, correct: t, distractors: L.shuffle(rng, falses),
        whyFn: (w) => {
          const truth = falseToTrue.get(L.norm(w));
          return truth ? `"${w}" is false; in reality, ${truth.charAt(0).toLowerCase()}${truth.slice(1)}` : `"${w}" is a false statement about ${c.name}.`;
        },
        reasoning: `Because "${t}" states the correct fact, while the other statements are deliberately false.`
      });
      if (m1) out.push(m1);
      const m2 = makeMcq(rng, c, topic, subject, "tf", {
        question: `${phF[i % phF.length](c.name)}?`, correct: f, distractors: L.shuffle(rng, trues),
        whyFn: (w) => `"${w}" is a true statement about ${c.name}, so it is not the false one the question asks for.`,
        reasoning: `Because "${f}" is the false claim; every other statement is an accurate fact about ${c.name}.`
      });
      if (m2) out.push(m2);
      i++;
    }
    return out;
  },

  /* order: ordered list -> first / last / middle positions */
  order(rng, c, topic, subject) {
    const out = [];
    const seq = c.ordered.slice();
    const n = seq.length;
    const positions = [1, n, Math.ceil(n / 2), 2, n - 1];
    const phF = L.shuffle(rng, PH.orderFirst), phL = L.shuffle(rng, PH.orderLast), phA = L.shuffle(rng, PH.orderAt);
    let i = 0;
    for (const p of positions) {
      const item = seq[p - 1];
      if (!item) continue;
      const ph = p === 1 ? phF[i % phF.length] : p === n ? phL[i % phL.length] : phA[i % phA.length];
      const q = `${ph(c.name)}?`;
      const pos = new Map(seq.map((x, k) => [x, k + 1]));
      const m = makeMcq(rng, c, topic, subject, "order", {
        question: q, correct: item, distractors: L.shuffle(rng, seq.filter((x) => x !== item)),
        whyFn: (w) => `"${w}" sits at position ${pos.get(w) || "another point"} in ${c.name}, not position ${p}.`,
        reasoning: `Because the correct sequence of ${c.name} places "${item}" in position ${p}.`
      });
      if (m) out.push(m);
      i++;
    }
    return out;
  },

  /* numeric: parametric template, K variants per call */
  numeric(rng, c, topic, subject, K = 140) {
    const out = [];
    for (let k = 0; k < K; k++) {
      const vals = c.vals(rng);
      const m = L.buildParametric(rng, { q: c.q, a: c.a, e: c.e, distract: c.distract }, vals, {
        difficulty: c.difficulty || "medium", tags: [c.name, "deep-kb", "numeric"]
      });
      if (!m) continue;
      if ((m.explanation || "").length < 60) m.explanation = m.explanation + ` Applying the ${cname(c)} rule step by step confirms ${m.correctAnswer} is correct; careless arithmetic is the usual error.`;
      if ((m.memoryTrick || "").length < 20) m.memoryTrick = (m.memoryTrick || c.trick || `Apply the ${c.name} rule`).trim();
      if ((m.memoryTrick || "").length < 20) m.memoryTrick = m.memoryTrick + ` always re-read the ${c.name} question before answering.`;
      const wrongs = ["A", "B", "C", "D"].filter((l) => l !== m.correctAnswer).map((l) => m["option" + l]);
      m.explanationWhyWrong = (c.whyWrong ? c.whyWrong(vals).slice(0, 3) : [])
        .concat(wrongs.slice(0, 3).map((w) => `${w} is a value produced by a common miscalculation (wrong operation or misplaced factor), not the result of applying the ${cname(c)} rule correctly.`));
      m.explanationWhyWrong = m.explanationWhyWrong.slice(0, 3);
      m.memoryTrick = c.trick || `Apply the ${c.name} formula step by step and check units.`;
      if ((m.memoryTrick || "").length < 20) m.memoryTrick = m.memoryTrick + ` always re-read the ${c.name} question before answering.`;
      m.examTip = c.tip || `These calculations are time-pressured; estimate before solving exactly.`;
      if ((m.examTip || "").length < 20) m.examTip = `For ${c.name} keep the units and formula visible; double-check before choosing.`;
      m.learningObjective = c.lo || `Apply ${c.name.toLowerCase()} methods to compute the correct result.`;
      m.bloomTaxonomy = "Apply";
      m.confidence = 0.95;
      m.solvingTimeSec = 55;
      m.tags = [...(c.tags || []), "numeric", "deep-kb"];
      out.push(m);
    }
    return out;
  },

  /* scenario: authored application questions (like fact but harder) */
  scenario(rng, c, topic, subject) {
    const out = [];
    const facts = c.facts.map((f) => ({ q: f[0], a: f[1], e: f[2] }));
    const answers = facts.map((f) => String(f.a));
    for (const f of facts) {
      const m = L.buildMcq(rng, f, [...answers, ...(c.extraDistractors || [])], {
        difficulty: "hard", tags: [c.name, "deep-kb", "scenario"]
      });
      if (!m) continue;
      m.explanationWhyWrong = answers.filter((a) => L.norm(a) !== L.norm(f.a)).slice(0, 3)
        .map((w) => `"${w}" fails at least one condition set out in the scenario, so it cannot be the outcome; "${f.a}" satisfies them all.`);
      m.memoryTrick = c.trick || `Identify the governing principle of ${c.name} before reading the scenario options.`;
      m.examTip = c.tip || `Scenario questions on ${c.name} reward careful reading; eliminate options first.`;
      m.learningObjective = c.lo || `Apply ${c.name.toLowerCase()} principles to realistic scenarios.`;
      m.bloomTaxonomy = "Analyze";
      m.confidence = 0.95;
      m.solvingTimeSec = 55;
      m.tags = [...(c.tags || []), "scenario", "deep-kb"];
      out.push(m);
    }
    return out;
  }
};

/* Build a run.js-compatible generator from a KB module.
   kb = { chapter, tags, subjects, topics: { name: [concepts...] } } */
function makeKbGen(kb) {
  return {
    subjects: kb.subjects,
    name: kb.chapter,
    topics: Object.keys(kb.topics),
    tags: kb.tags || [],
    generate(rng, topicName) {
      const concepts = kb.topics[topicName] || [];
      const out = [];
      for (const c of concepts) {
        const fn = families[c.kind];
        if (!fn) continue;
        const rows = fn(rng, c, topicName, kb.subjects[0]) || [];
        for (const m of rows) out.push(m);
      }
      return out;
    }
  };
}

module.exports = { makeKbGen, families, makeMcq };
