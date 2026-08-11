/* ============================================================
   Deep Knowledge KB — Sentence Correction
   Agreement, tense, word order, punctuation and style fixes.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["sentence-correction"],
  chapter: "Sentence Correction — Deep Knowledge Bank",
  tags: ["sentence-correction", "deep-kb", "english", "sentences"],
  topics: {

    "Correction by Rule": [
      {
        kind: "numeric", name: "subject-verb agreement correction", difficulty: "medium",
        note: "Choose the sentence that fixes the agreement error.",
        q: (v) => `Choose the correct sentence: "${v.s1}" or "${v.s2}"?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because ${v.rule}, while "${v.w1}" repeats the common agreement mistake.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const TIMES = ["now", "today", "this week", "at present", "right now", "every day", "every week", "at night"];
          const T = [
            ["The list of names {v} on the notice board {t}.", "is", "are", "were", "the subject is 'list', not 'names'"],
            ["Everyone in the class {v} the assignment {t}.", "has", "have", "had", "indefinite pronouns like 'everyone' are singular"],
            ["A number of students {v} absent {t}.", "were", "was", "is", "'a number of' takes a plural verb"],
            ["The number of complaints {v} growing {t}.", "is", "are", "were", "'the number of' takes a singular verb"],
            ["Neither of the answers {v} correct {t}.", "is", "are", "were", "'neither' is always singular"],
            ["Either Ali or his brothers {v} coming {t}.", "are", "is", "was", "the verb follows the nearer subject"],
            ["The jury {v} agreed on the verdict.", "has", "have", "having", "a collective noun takes a singular verb"],
            ["Mathematics {v} my weakest subject {t}.", "is", "are", "were", "subject names like 'mathematics' are singular"],
            ["The trousers {v} too tight for me.", "are", "is", "was", "plural nouns like 'trousers' take plural verbs"],
            ["Ten kilometres {v} a long distance {t}.", "is", "are", "were", "a distance as a single unit is singular"],
            ["She and I {v} good friends.", "are", "is", "was", "compound subjects joined by 'and' are plural"],
            ["The player, with his coach, {v} practising {t}.", "is", "are", "were", "the true subject is 'player', not 'coach'"]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const hasTime = t[0].includes("{t}");
          const time = hasTime ? TIMES[Math.floor(rng() * TIMES.length)] : "";
          const mk = (vb) => t[0].replace("{v}", vb).replace("{t}", time);
          const good = mk(t[1]), w1 = mk(t[2]), w2 = mk(t[3]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, rule: t[4] };
        },
        whyWrong: (v) => [`Find the true subject of the sentence and match the verb to it, ignoring other nouns in between.`],
        trick: "subject and verb must agree in number.",
        tip: "Beware phrases that hide between subject and verb."
      },
      {
        kind: "numeric", name: "tense correction", difficulty: "medium",
        note: "Choose the sentence with the correct tense.",
        q: (v) => `Choose the correct sentence: "${v.s1}" or "${v.s2}"?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because the time signal "${v.sig}" demands ${v.tense}, while "${v.w1}" mixes the tenses wrongly.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Bilal", "Ayesha", "Hamza", "Zainab", "Usman", "Mariam"];
          const T = [
            ["{N} has been living in {P} since 2015.", "{N} is living in {P} since 2015.", "{N} have been living in {P} since 2015.", "since 2015", "present perfect continuous", ["Karachi", "Lahore", "Islamabad", "Peshawar"]],
            ["{N} had already left when the guests arrived.", "{N} has already left when the guests arrived.", "{N} had already leave when the guests arrived.", "when the guests arrived", "past perfect", ["", "", "", ""]],
            ["{N} will have finished the project by Friday.", "{N} will has finished the project by Friday.", "{N} will have finish the project by Friday.", "by Friday", "future perfect", ["", "", "", ""]],
            ["{N} used to play cricket in his youth.", "{N} use to play cricket in his youth.", "{N} used to playing cricket in his youth.", "used to", "past habit", ["", "", "", ""]],
            ["{N} is interested in reading novels.", "{N} is interesting in reading novels.", "{N} was interested to reading novels.", "interested in", "adjective pattern", ["", "", "", ""]],
            ["{N} arrived after the meeting had started.", "{N} arrive after the meeting had started.", "{N} arrived after the meeting have started.", "after", "past simple", ["", "", "", ""]],
            ["{N} has worked here for five years.", "{N} has been worked here for five years.", "{N} have worked here for five years.", "for five years", "present perfect", ["", "", "", ""]],
            ["The sun rises in the east.", "The sun rose in the east every day.", "The sun rise in the east.", "general truth", "simple present", ["", "", "", ""]],
            ["{N} is going to visit {P} next month.", "{N} is going to visiting {P} next month.", "{N} are going to visit {P} next month.", "next month", "be going to", ["the museum", "the zoo", "the fort", "the coast"]],
            ["{N} prefers tea to coffee.", "{N} prefer tea to coffee.", "{N} is preferring tea to coffee.", "state verb", "simple present", ["", "", "", ""]]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const n = NAMES[Math.floor(rng() * NAMES.length)];
          const p = t[5][Math.floor(rng() * t[5].length)];
          const mk = (sent) => sent.replace("{N}", n).replace("{P}", p);
          const good = mk(t[0]), w1 = mk(t[1]), w2 = mk(t[2]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, sig: t[3], tense: t[4] };
        },
        whyWrong: (v) => [`Read the time signal first, then choose the tense that matches it, and keep the forms consistent.`],
        trick: "time words fix the tense required.",
        tip: "Since, for, by, ago each signal a tense."
      },
      {
        kind: "numeric", name: "article correction", difficulty: "easy",
        note: "Choose the sentence using the correct article.",
        q: (v) => `Which sentence uses the correct article?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because ${v.rule}, while "${v.w1}" breaks the article rule.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const T = [
            ["He ate an apple for breakfast.", "He ate a apple for breakfast.", "He ate an apples for breakfast.", "vowel sounds take 'an'"],
            ["She is an honest woman.", "She is a honest woman.", "She is an honest women.", "'honest' begins with a vowel sound"],
            ["I saw a university student.", "I saw an university student.", "I saw a university students.", "'university' starts with a 'yoo' sound"],
            ["We need an hour to finish.", "We need a hour to finish.", "We need an hours to finish.", "'hour' begins with a vowel sound"],
            ["The Nile is the longest river.", "A Nile is the longest river.", "The Nile is a longest river.", "unique rivers take 'the'"],
            ["He plays the piano well.", "He plays a piano well.", "He plays the pianos well.", "instruments take 'the'"],
            ["I met an old friend today.", "I met a old friend today.", "I met an old friends today.", "'old' begins with a vowel sound"],
            ["She bought a new umbrella.", "She bought an new umbrella.", "She bought a new umbrellas.", "consonant sound takes 'a'"],
            ["The moon shines at night.", "A moon shines at night.", "The moon shine at night.", "unique objects take 'the'"],
            ["He is an engineer.", "He is a engineer.", "He is an engineers.", "'engineer' begins with a vowel sound"],
            ["We visited the museum yesterday.", "We visited a museum yesterday.", "We visited the museums yesterday.", "a known museum takes 'the'"],
            ["There is an owl in the tree.", "There is a owl in the tree.", "There is an owls in the tree.", "'owl' begins with a vowel sound"],
            ["She wants to be a doctor.", "She wants to be an doctor.", "She wants to be a doctors.", "consonant sound takes 'a'"],
            ["The Himalayas are in Asia.", "A Himalayas are in Asia.", "The Himalayas is in Asia.", "mountain ranges take 'the'"],
            ["He bought an orange and a banana.", "He bought a orange and a banana.", "He bought an orange and an banana.", "vowel sounds take 'an'"],
            ["The sun is a star.", "A sun is a star.", "The sun is an star.", "unique objects take 'the'"],
            ["I read a book every week.", "I read an book every week.", "I read a books every week.", "consonant sound takes 'a'"],
            ["She is the best student in class.", "She is a best student in class.", "She is the best students in class.", "superlatives take 'the'"],
            ["We heard an interesting story.", "We heard a interesting story.", "We heard an interesting stories.", "'interesting' begins with a vowel sound"],
            ["He drives an expensive car.", "He drives a expensive car.", "He drives an expensive cars.", "'expensive' begins with a vowel sound"],
            ["The Pacific is a huge ocean.", "A Pacific is a huge ocean.", "The Pacific is an huge ocean.", "unique oceans take 'the'"],
            ["She gave me an honest answer.", "She gave me a honest answer.", "She gave me an honest answers.", "'honest' begins with a vowel sound"]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const flip = rng() < 0.5;
          return { s1: flip ? t[1] : t[0], s2: flip ? t[0] : t[1], good: t[0], w1: t[1], w2: t[2], rule: t[3] };
        },
        whyWrong: (v) => [`Decide by the SOUND of the next word: vowel sounds take 'an', consonant sounds take 'a', unique nouns take 'the'.`],
        trick: "an+vowel sound, a+consonant sound.",
        tip: "Sound decides the article, not the spelling."
      }
    ],

    "Word Order and Punctuation": [
      {
        kind: "numeric", name: "word order correction", difficulty: "medium",
        note: "Choose the sentence with the natural word order.",
        q: (v) => `Choose the correct sentence: "${v.s1}" or "${v.s2}"?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because ${v.rule}, while "${v.w1}" distorts the natural English word order.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Bilal", "Ayesha", "Hamza", "Zainab", "Usman", "Mariam"];
          const T = [
            ["{N} always arrives on time.", "Always {N} arrives on time.", "{N} arrives always on time.", "frequency adverbs come before the main verb"],
            ["{N} usually takes the bus to school.", "Usually {N} takes the bus to school.", "{N} takes usually the bus to school.", "frequency adverbs precede the main verb"],
            ["{N} has never visited the museum.", "{N} has visited never the museum.", "{N} never has visited the museum.", "'never' sits between 'has' and the past participle"],
            ["Why did {N} leave early?", "Why {N} did leave early?", "Why did leave {N} early?", "questions place the subject after the auxiliary"],
            ["{N} and {N2} went to the park together.", "{N} went and {N2} to the park together.", "{N} and {N2} went to the together park.", "compound subjects keep the verb after both parts"],
            ["The book was written by {N}.", "The book written was by {N}.", "Was the book written by {N}?", "passive voice keeps 'was' before the participle"],
            ["{N} hardly ever eats fast food.", "Hardly {N} ever eats fast food.", "{N} eats hardly ever fast food.", "'hardly ever' stands before the main verb"],
            ["{N} has already finished the report.", "{N} already has finished the report.", "{N} has finished already the report.", "'already' follows the auxiliary verb"],
            ["Both {N} and {N2} passed the exam.", "Both {N} passed and {N2} the exam.", "{N} and both {N2} passed the exam.", "'both ... and' pairs keep their parts together"],
            ["{N} seldom watches television.", "Seldom {N} watches television.", "{N} watches seldom television.", "'seldom' comes before the main verb"],
            ["The cake was baked by {N} yesterday.", "The cake baked was by {N} yesterday.", "The cake was baked yesterday by {N}.", "passive order places the agent last"],
            ["{N} is often late for school.", "{N} is late often for school.", "Often {N} is late for school.", "adverbs of frequency follow 'is'"]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const n = NAMES[Math.floor(rng() * NAMES.length)];
          const n2 = NAMES[Math.floor(rng() * NAMES.length)];
          const mk = (sent) => sent.replaceAll("{N2}", n2).replaceAll("{N}", n);
          const good = mk(t[0]), w1 = mk(t[1]), w2 = mk(t[2]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, rule: t[3] };
        },
        whyWrong: (v) => [`English follows Subject-Verb-Object order; adverbs of frequency sit before the main verb or after 'be'.`],
        trick: "adverb before verb, subject after 'why'.",
        tip: "Read the sentence aloud to feel the order."
      },
      {
        kind: "numeric", name: "capitalisation correction", difficulty: "easy",
        note: "Choose the sentence with correct capitalisation.",
        q: (v) => `Which sentence is correctly capitalised?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because ${v.rule}, while "${v.w1}" breaks the capitalisation rule.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Bilal", "Ayesha"];
          const T = [
            ["{N} went to school on Monday.", "{N} went to school on monday.", "{N} went to School on Monday.", "days of the week are capitalised"],
            ["{N} visited Lahore in March.", "{N} visited Lahore in march.", "{N} visited lahore in March.", "months and cities are capitalised"],
            ["{N} speaks English and Urdu.", "{N} speaks english and Urdu.", "{N} speaks English and urdu.", "language names are capitalised"],
            ["{N} lives in the North of Pakistan.", "{N} lives in the north of Pakistan.", "{N} lives in the North of pakistan.", "region names like 'the North' are capitalised"],
            ["The Nile flows through Egypt.", "The nile flows through Egypt.", "The Nile flows through egypt.", "river and country names are capitalised"],
            ["{N} reads the Quran every day.", "{N} reads the quran every day.", "{N} reads the Quran every Day.", "holy books are capitalised"],
            ["{N} met the President yesterday.", "{N} met the president yesterday.", "{N} met the president Yesterday.", "titles of officials are capitalised"],
            ["{N} bought a new car.", "{N} bought a New car.", "{N} bought a new car.", "common nouns stay lowercase"],
            ["Christmas falls in December.", "christmas falls in December.", "Christmas falls in december.", "festivals and months are capitalised"],
            ["{N} studies at the University of Karachi.", "{N} studies at the university of Karachi.", "{N} studies at the University of karachi.", "institution names are capitalised"],
            ["The Quaid-e-Azam led the nation.", "The Quaid-e-Azam led the Nation.", "The Quaid-e-Azam Led the nation.", "titles of honour are capitalised"],
            ["{N} will go to Karachi on Friday.", "{N} will go to Karachi on friday.", "{N} will Go to Karachi on Friday.", "cities and days are capitalised"]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const n = NAMES[Math.floor(rng() * NAMES.length)];
          const mk = (sent) => sent.replaceAll("{N}", n);
          const good = mk(t[0]), w1 = mk(t[1]), w2 = mk(t[2]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, rule: t[3] };
        },
        whyWrong: (v) => [`Capitalise proper nouns — names, days, months, cities, languages — but keep common nouns lowercase.`],
        trick: "proper nouns are capitalised, common are not.",
        tip: "Days, months, cities and languages are proper nouns."
      },
      {
        kind: "tf", name: "these sentences",
        note: "Pick the correct sentence from each pair.",
        statements: [
          ["The committee has decided to postpone the meeting.", "The committee have decided to postpone the meeting."],
          ["Each of the students was given a book.", "Each of the students were given a book."],
          ["She has been working here since 2020.", "She is working here since 2020."],
          ["Neither of the boys was present.", "Neither of the boys were present."],
          ["The news is very good today.", "The news are very good today."],
          ["He goes to office by bus daily.", "He go to office by bus daily."],
          ["There are many books on the shelf.", "There is many books on the shelf."],
          ["They have finished their homework.", "They has finished their homework."],
          ["I am used to getting up early.", "I am used to get up early."],
          ["She prefers tea over coffee.", "She prefers tea to coffee."],
          ["He has gone to the market.", "He has went to the market."],
          ["We were watching TV when it rained.", "We was watching TV when it rained."],
          ["The police have caught the thief.", "The police has caught the thief."],
          ["She is senior to me by two years.", "She is senior than me by two years."],
          ["I look forward to meeting you.", "I look forward to meet you."],
          ["He succeeded in passing the exam.", "He succeeded to pass the exam."],
          ["The furniture is made of wood.", "The furniture are made of wood."],
          ["She asked me where I lived.", "She asked me where did I live."],
          ["If I were you, I would accept the offer.", "If I was you, I would accept the offer."],
          ["He advised me to work hard.", "He advised me that work hard."],
          ["The scissors are on the table.", "The scissors is on the table."],
          ["It has been raining since morning.", "It is raining since morning."],
          ["She is junior to me.", "She is junior than me."],
          ["He refrained from smoking.", "He refrained to smoke."],
          ["The pair of shoes is expensive.", "The pair of shoes are expensive."],
          ["She insisted on paying the bill.", "She insisted to pay the bill."],
          ["They agreed to help us.", "They agreed helping us."],
          ["He is good at mathematics.", "He is good in mathematics."],
          ["She congratulated him on his success.", "She congratulated him for his success."],
          ["We discussed the matter at length.", "We discussed about the matter at length."]
        ],
        trick: "Test the verb form against the subject.",
        tip: "Frequently tested: since/for, prefer to, senior to."
      }
    ],

    "Word Lengths and Spelling": [
      {
        kind: "numeric", name: "combined word letter counts", difficulty: "medium",
        note: "Adding the letter counts of two words.",
        q: (v) => `When combined, how many letters do the words "${v.a}" and "${v.b}" contain?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `The word "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so combining them gives ${v.la} + ${v.lb} = ${v.la + v.lb} letters in total.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "yearn", "abate", "brusque", "cogent", "dawdle", "enigma", "florid", "garner", "hobble", "immure", "junta", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "quash", "rebuke", "sunder", "tarry", "upbraid", "vex", "waver", "yoke", "zephyr", "addle", "bilk", "churl", "dally", "errant", "fettle", "gauche", "hallow", "inure", "jape", "ken", "limpid", "mawkish", "nugatory", "ossify", "purport", "quell", "riven", "shard", "tenet", "umbrage", "verdant", "whelp", "yeoman", "zealot"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count each word's letters separately, then add: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Hyphens and apostrophes are not letters.`, `Spell both words aloud to avoid missing letters.`],
        trick: "Add the two word lengths together.",
        tip: "Count each word fully before adding."
      },
      {
        kind: "numeric", name: "word length differences", difficulty: "medium",
        note: "Comparing the letter counts of two words.",
        q: (v) => `What is the difference between the letter counts of "${v.a}" and "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `The word "${v.a}" has ${v.la} letters and "${v.b}" has ${v.lb} letters, so the difference between the two counts is ${v.la} - ${v.lb} = ${v.la - v.lb} letters.`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "brusque", "cogent", "enigma", "florid", "garner", "hobble", "immure", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "rebuke", "sunder", "upbraid", "zephyr", "errant", "fettle", "gauche", "hallow", "limpid", "mawkish", "nugatory", "ossify", "purport", "umbrage", "verdant", "yeoman", "zealot", "kaleidoscope", "sycophant", "mendacious", "lachrymose", "pusillanimous"];
          const SHORT = ["awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "vex", "ken", "jape", "bilk", "quash", "tarry", "waver", "quell", "riven", "shard", "tenet", "whelp", "addle", "churl"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the smaller count from the larger: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer word fully before comparing.`, `The difference stays positive because the first word is longer.`],
        trick: "Subtract the smaller letter count.",
        tip: "Compare lengths before subtracting."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
