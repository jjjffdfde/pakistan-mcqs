/* ============================================================
   Deep Knowledge KB — Psychology
   Schools, cognition, development + numeric psych stats.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["psychology"],
  chapter: "Psychology — Deep Knowledge Bank",
  tags: ["psychology", "deep-kb", "schools", "cognition", "development"],
  topics: {

    "Schools of Psychology": [
      {
        kind: "fact", name: "school facts",
        note: "The major schools and their founders.",
        facts: [
          ["Who founded psychoanalysis?", "Sigmund Freud", "Freud's psychoanalysis centres on the unconscious mind and defence mechanisms."],
          ["Who founded behaviourism?", "John B. Watson", "Watson's behaviourism studies observable behaviour, ignoring inner states."],
          ["Which psychologist is known for operant conditioning?", "B.F. Skinner", "Skinner's operant conditioning uses reinforcements and punishments."],
          ["Which psychologist is known for classical conditioning?", "Ivan Pavlov", "Pavlov's dogs learned to salivate at a bell paired with food."],
          ["Who proposed the hierarchy of needs?", "Abraham Maslow", "Maslow's hierarchy runs from physiological needs to self-actualisation."],
          ["Who developed client-centred therapy?", "Carl Rogers", "Rogers' humanistic therapy emphasises unconditional positive regard."],
          ["Which school studies conscious experience as a whole?", "Gestalt psychology", "Gestaltists argue the whole perception exceeds its parts, so context shapes what we see."],
          ["Who founded modern cognitive psychology?", "Often credited to Ulric Neisser", "Neisser's 1967 book named and defined cognitive psychology, framing the mind as an information processor."],
          ["Who studied the stages of moral development?", "Lawrence Kohlberg", "Kohlberg mapped moral reasoning through preconventional to postconventional stages."],
          ["Which school measures mental processes in terms of function?", "Functionalism", "Functionalism, led by William James, asks what the mind does."]
        ],
        trick: "Freud=psychoanalysis, Watson=behaviourism, Skinner=operant, Pavlov=classical, Maslow=needs.",
        tip: "Founder-school pairs are the highest-yield psychology items."
      },
      {
        kind: "tf", name: "school statements",
        note: "True/false stems on schools.",
        statements: [
          ["Freud founded psychoanalysis.", "Pavlov founded psychoanalysis."],
          ["Skinner studied operant conditioning.", "Skinner studied the hierarchy of needs."],
          ["Pavlov demonstrated classical conditioning with dogs.", "Pavlov demonstrated classical conditioning with pigeons."],
          ["Maslow proposed the hierarchy of needs.", "Maslow proposed the theory of evolution."],
          ["Rogers developed client-centred therapy.", "Rogers developed behaviour modification."]
        ],
        trick: "Freud=psychoanalysis, Skinner=operant, Pavlov=classical/dogs, Maslow=needs, Rogers=client-centred.",
        tip: "Founder-method swaps are the classic traps."
      }
    ],

    "Cognition and Learning": [
      {
        kind: "fact", name: "cognition facts",
        note: "Memory, learning and thinking facts.",
        facts: [
          ["What is classical conditioning?", "Learning an automatic response to a new stimulus", "A neutral stimulus paired with an unconditioned one gains the power to trigger the response."],
          ["What is operant conditioning?", "Learning from consequences of behaviour", "Reinforcement increases behaviour; punishment decreases it, as Skinner's experiments showed."],
          ["What is reinforcement?", "A consequence that increases a behaviour", "Positive reinforcement adds a reward; negative removes an aversive stimulus."],
          ["What is the difference between reinforcement and punishment?", "Reinforcement increases, punishment decreases behaviour", "Reinforcement aims to repeat the behaviour; punishment aims to stop it."],
          ["What is short-term memory?", "Information held for seconds to minutes", "Short-term memory holds about 7 items briefly before loss, unless they are rehearsed."],
          ["What is long-term memory?", "Information stored for days or years", "Long-term memory stores experiences and knowledge with practice."],
          ["What is working memory?", "Actively manipulating held information", "Working memory processes and uses short-term content, not just stores it."],
          ["What is attention?", "Focusing mental resources on specific stimuli", "Attention selects what the mind processes from the flood of input."],
          ["What is problem solving?", "Finding a path from a problem state to a goal", "Problem solving uses algorithms, heuristics and insight to reach a goal state."],
          ["What is a heuristic?", "A fast mental shortcut for decisions", "Heuristics save time but can produce systematic biases, as in availability and anchoring."]
        ],
        trick: "Classical=automatic pairing, operant=consequences, reinforcement=increase, punishment=decrease.",
        tip: "Classical vs operant and reinforcement vs punishment are the anchor pairs."
      },
      {
        kind: "numeric", name: "IQ ratio calculations", difficulty: "medium",
        note: "Classic IQ = (mental age ÷ chronological age) × 100.",
        q: (v) => `A child has a mental age of ${v.m} years and a chronological age of ${v.c} years. What is the classic IQ?`,
        a: (v) => `${Math.round(v.m / v.c * 100)}`,
        e: (v) => `IQ = (mental age ÷ chronological age) × 100 = (${v.m} ÷ ${v.c}) × 100 = ${Math.round(v.m / v.c * 100)}, because the ratio of mental to actual age is scaled to 100 as the average.`,
        distract: (v) => [
          `${Math.round(v.m / v.c * 100) + 5}`, `${Math.round(v.m / v.c * 100) - 5}`, `${Math.round(v.c / v.m * 100)}`,
          `${Math.round(v.m / v.c * 100) + 15}`, `${Math.round(v.m / v.c * 100) * 2}`
        ],
        vals: (rng) => {
          const c = 6 + Math.floor(rng() * 13);
          const m = Math.max(3, c - 3 + Math.floor(rng() * 9));
          return { m, c };
        },
        whyWrong: (v) => [`IQ = mental ÷ chronological × 100; inverting the ratio or adding arbitrary points miscomputes the classic formula.`],
        trick: "IQ = (MA ÷ CA) × 100.",
        tip: "Average IQ is 100; the mental age equals chronological age at average."
      },
      {
        kind: "numeric", name: "learning trials calculations", difficulty: "easy",
        note: "Trials-to-criterion counts learning efficiency.",
        q: (v) => `A rat needs ${v.t} trials to learn a maze. It is retrained after a rest, needing ${v.r} trials. What percentage improvement occurred?`,
        a: (v) => `${(100 * (v.t - v.r) / v.t).toFixed(1)}%`,
        e: (v) => `Improvement = (first − second) ÷ first × 100 = (${v.t} − ${v.r}) ÷ ${v.t} × 100 = ${(100 * (v.t - v.r) / v.t).toFixed(1)}%, because savings in trials show the strength of the learned memory.`,
        distract: (v) => {
          const c = 100 * (v.t - v.r) / v.t;
          return [`${(100 * v.r / v.t).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(v.t - v.r)}%`];
        },
        vals: (rng) => {
          const t = 20 + Math.floor(rng() * 181);
          const r = 5 + Math.floor(rng() * (t - 10));
          return { t, r };
        },
        whyWrong: (v) => [`Improvement divides the saving by the FIRST trial count; dividing by the second count misstates the base.`],
        trick: "Improvement % = (first − second) ÷ first × 100.",
        tip: "Base the percentage on the original trial count."
      },
      {
        kind: "numeric", name: "memory span calculations", difficulty: "easy",
        note: "Digit-span tests measure short-term memory capacity.",
        q: (v) => `In a digit-span test, a person recalls ${v.correct} of ${v.total} digit sequences correctly. What is the percentage correct?`,
        a: (v) => `${(100 * v.correct / v.total).toFixed(1)}%`,
        e: (v) => `Percentage = ${v.correct} ÷ ${v.total} × 100 = ${(100 * v.correct / v.total).toFixed(1)}%, because the recalled sequences are scored against the total attempted.`,
        distract: (v) => {
          const c = 100 * v.correct / v.total;
          return [`${(100 * (v.total - v.correct) / v.total).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c * 1.5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${v.correct}%`];
        },
        vals: (rng) => {
          const total = 5 + Math.floor(rng() * 20);
          const correct = 2 + Math.floor(rng() * (total - 1));
          return { correct, total };
        },
        whyWrong: (v) => [`Divide correct by total; the complement (wrong fraction) is the classic distractor.`],
        trick: "% correct = correct ÷ total × 100.",
        tip: "The average digit span is about 7 items."
      },
      {
        kind: "numeric", name: "reaction time means", difficulty: "easy",
        note: "Mean reaction time across a set of trials.",
        q: (v) => `A participant records reaction times of ${v.a} ms, ${v.b} ms and ${v.c} ms across three trials. What is the mean reaction time in ms?`,
        a: (v) => `${(v.a + v.b + v.c) / 3}`,
        e: (v) => `Mean = (${v.a} + ${v.b} + ${v.c}) ÷ 3 = ${v.a + v.b + v.c} ÷ 3 = ${(v.a + v.b + v.c) / 3} ms, because the mean divides the total by the number of trials.`,
        distract: (v) => {
          const sum = v.a + v.b + v.c;
          const m = sum / 3;
          return [`${sum}`, `${Math.max(v.a, v.b, v.c)}`, `${Math.min(v.a, v.b, v.c)}`, `${m + 100}`, `${sum - m}`];
        },
        vals: (rng) => {
          const a = 200 + Math.floor(rng() * 70) * 10;
          const b = 200 + Math.floor(rng() * 70) * 10;
          const c = 200 + Math.floor(rng() * 70) * 10;
          return { a, b, c };
        },
        whyWrong: (v) => [`Divide the total by the number of trials (3); the raw total or the slowest trial are the classic distractors.`],
        trick: "mean = sum ÷ number of trials.",
        tip: "The mean smooths individual trial noise."
      }
    ],

    "Development and Social Psychology": [
      {
        kind: "fact", name: "development facts",
        note: "Human development stages and theorists.",
        facts: [
          ["Who proposed the stages of psychosocial development?", "Erik Erikson", "Erikson's eight stages span trust versus mistrust to integrity versus despair."],
          ["Who proposed the stages of cognitive development?", "Jean Piaget", "Piaget's stages run from sensorimotor to formal operational."],
          ["At which stage does a child learn object permanence?", "Sensorimotor stage", "Object permanence develops during the sensorimotor stage (0-2 years)."],
          ["Who proposed the stages of moral development?", "Lawrence Kohlberg", "Kohlberg's three levels run from preconventional to postconventional."],
          ["What is attachment?", "The emotional bond between infant and caregiver", "Secure attachment forms when caregivers respond consistently."],
          ["Who studied attachment in infants?", "John Bowlby", "Bowlby's attachment theory explains the child-caregiver bond."],
          ["What is conformity?", "Matching behaviour to group norms", "Asch's experiments showed people conform to majority judgements."],
          ["Who conducted the obedience experiments?", "Stanley Milgram", "Milgram's studies found most people obey authority even against conscience."],
          ["What is the bystander effect?", "People help less when others are present", "Diffusion of responsibility reduces helping in crowds, since everyone assumes someone else will act."],
          ["What is cognitive dissonance?", "Discomfort from conflicting beliefs", "People change attitudes to resolve the clash between beliefs and actions."]
        ],
        trick: "Erikson=psychosocial, Piaget=cognitive, Bowlby=attachment, Milgram=obedience, Asch=conformity.",
        tip: "Theorist-domain pairs are the highest-yield items."
      },
      {
        kind: "tf", name: "development statements",
        note: "True/false stems on development.",
        statements: [
          ["Piaget studied cognitive development.", "Piaget studied attachment bonds."],
          ["Object permanence develops in the sensorimotor stage.", "Object permanence develops in adolescence."],
          ["Bowlby studied infant attachment.", "Bowlby studied animal reflexes."],
          ["Milgram studied obedience to authority.", "Milgram studied colour perception."],
          ["The bystander effect reduces helping in crowds.", "The bystander effect increases helping in crowds."]
        ],
        trick: "Piaget=cognition, sensorimotor=object permanence, Bowlby=attachment, Milgram=obedience, bystander=less help.",
        tip: "Theorist-topic swaps are the classic traps."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
