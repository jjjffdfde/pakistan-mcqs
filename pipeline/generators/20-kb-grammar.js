/* ============================================================
   Deep Knowledge KB — English Grammar
   Agreement, tense, articles, prepositions, pronouns + more.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["grammar"],
  chapter: "English Grammar — Deep Knowledge Bank",
  tags: ["grammar", "deep-kb", "english", "sentences"],
  topics: {

    "Parts of Speech": [
      {
        kind: "fact", name: "part of speech facts",
        note: "Definitions of the eight parts of speech.",
        facts: [
          ["What is a noun?", "A word naming a person, place or thing", "Nouns name entities such as 'teacher', 'city' and 'book'; they are the basic building blocks of every sentence."],
          ["What is a verb?", "A word showing action or state", "Verbs express actions like 'run' and 'write' or states like 'seem' and 'know', and every sentence needs one."],
          ["What is an adjective?", "A word describing a noun", "Adjectives like 'quick' and 'bright' describe or modify nouns, telling us what kind of person or thing is meant."],
          ["What is an adverb?", "A word modifying a verb or adjective", "Adverbs like 'quickly' and 'very' modify verbs, adjectives or other adverbs, telling how, when or where."],
          ["What is a pronoun?", "A word replacing a noun", "Pronouns like 'she' and 'they' stand in for nouns so we can avoid repeating the same name again and again."],
          ["What is a preposition?", "A word showing position or relation", "Prepositions like 'in', 'on' and 'under' link a noun to the rest of the sentence, showing position or time."],
          ["What is a conjunction?", "A word joining words or clauses", "Conjunctions like 'and', 'but' and 'because' join words, phrases or clauses together into longer sentences."],
          ["What is an interjection?", "A word expressing sudden emotion", "Interjections like 'wow' and 'oh' express sudden emotion and usually stand alone with an exclamation mark."],
          ["What is the subject of a sentence?", "Who or what performs the action", "The subject is the noun phrase that performs the action, so it tells who or what the sentence is about."],
          ["What is the predicate?", "The part that says something about the subject", "The predicate is the part that says something about the subject; it holds the verb and everything after it."],
          ["What is a clause?", "A group of words with a subject and verb", "A clause is a group of words containing a subject and a verb; independent clauses stand alone, dependent ones do not."],
          ["What is a phrase?", "A group of words without a subject-verb pair", "A phrase is a group of words without a subject-verb pair, and it acts as a single unit like 'under the table'."]
        ],
        trick: "noun=name, verb=action, adjective=describes noun.",
        tip: "Part-to-definition pairs are the most asked grammar items."
      },
      {
        kind: "numeric", name: "letter counts", difficulty: "easy",
        note: "Counting letters in grammatical terms.",
        q: (v) => `How many letters are in the word "${v.w}"?`,
        a: (v) => `${v.w.length}`,
        e: (v) => `Counting the letters of "${v.w}" gives ${v.w.length} letters: ${v.w.split("").join(", ")}.`,
        distract: (v) => [`${v.w.length + 1}`, `${v.w.length - 1 >= 1 ? v.w.length - 1 : v.w.length + 2}`, `${v.w.length + 2}`, `${v.w.length - 2 >= 1 ? v.w.length - 2 : v.w.length + 3}`, `${v.w.length + 3}`],
        vals: (rng) => {
          const W = ["adjective", "adverb", "conjunction", "interjection", "preposition", "pronoun", "singular", "plural", "auxiliary", "comparative", "superlative", "possessive", "indefinite", "definite", "countable", "uncountable", "transitive", "intransitive", "participle", "gerund"];
          return { w: W[Math.floor(rng() * W.length)] };
        },
        whyWrong: (v) => [`Count every letter once; off-by-one counts and double-letter slips are the classic traps.`],
        trick: "count each letter once.",
        tip: "Watch double letters like 'll' in plural."
      },
      {
        kind: "numeric", name: "sentence letter counts", difficulty: "easy",
        note: "Counting letters in short sentences.",
        q: (v) => `How many letters are in this sentence: "${v.s}"?`,
        a: (v) => `${v.n}`,
        e: (v) => `The sentence "${v.s}" contains ${v.n} letters when spaces and punctuation are not counted.`,
        distract: (v) => [`${v.n + 1}`, `${v.n - 1 >= 1 ? v.n - 1 : v.n + 2}`, `${v.n + 2}`, `${v.n - 2 >= 1 ? v.n - 2 : v.n + 3}`, `${v.n + 3}`],
        vals: (rng) => {
          const NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Bilal", "Ayesha", "Hamza", "Zainab", "Usman", "Mariam"];
          const PLACES = ["park", "market", "school", "bazaar", "garden", "library", "hospital", "playground"];
          const T = [
            (n, p) => `${n} went to the ${p} yesterday.`,
            (n, p) => `${n} bought a book from the ${p}.`,
            (n, p) => `${n} is waiting near the ${p}.`,
            (n, p) => `${n} will meet us at the ${p}.`,
            (n, p) => `${n} visited the big ${p} with friends.`,
            (n, p) => `${n} likes to walk in the ${p} every day.`,
            (n, p) => `${n} saw a bird outside the ${p}.`,
            (n, p) => `${n} helped mother carry things from the ${p}.`
          ];
          const t = T[Math.floor(rng() * T.length)];
          const s = t(NAMES[Math.floor(rng() * NAMES.length)], PLACES[Math.floor(rng() * PLACES.length)]);
          return { s, n: s.replace(/[^a-zA-Z]/g, "").length };
        },
        whyWrong: (v) => [`Count only the letters and drop spaces, commas and full stops before counting.`],
        trick: "ignore spaces and punctuation.",
        tip: "Scan for double letters when counting."
      }
    ],

    "Agreement and Tense": [
      {
        kind: "numeric", name: "subject-verb agreement", difficulty: "medium",
        note: "Choose the sentence whose verb agrees with its subject.",
        q: (v) => `Choose the correct sentence: "${v.s1}" or "${v.s2}"?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because ${v.rule}, so "${v.w1}" breaks the subject-verb agreement rule.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const TIMES = ["now", "today", "this week", "at present", "right now", "every day", "every week", "at night"];
          const T = [
            ["The committee {v} meeting {t}.", "is", "are", "be", "a collective noun takes a singular verb"],
            ["Each of the players {v} a uniform {t}.", "has", "have", "having", "'each' is always singular"],
            ["Neither answer {v} correct {t}.", "is", "are", "were", "'neither' is always singular"],
            ["The news {v} good {t}.", "is", "are", "were", "'news' is uncountable and takes a singular verb"],
            ["Physics {v} my favourite subject {t}.", "is", "are", "were", "the subject 'physics' is singular"],
            ["She {v} to school {t}.", "goes", "go", "goed", "third-person singular verbs end in 's'"],
            ["They {v} football {t}.", "play", "plays", "playing", "a plural subject takes a plural verb"],
            ["The dogs {v} loudly {t}.", "bark", "barks", "barking", "a plural subject takes a plural verb"],
            ["He {v} reading when I arrived.", "was", "were", "is", "the singular past of 'be' is 'was'"],
            ["There {v} many books on the shelf.", "are", "is", "was", "'books' is plural, so 'are' is required"],
            ["The teacher with her students {v} early.", "arrives", "arrive", "arriving", "the subject is 'teacher', not 'students'"],
            ["Bread and butter {v} a common breakfast {t}.", "is", "are", "were", "a compound unit takes a singular verb"]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const hasTime = t[0].includes("{t}");
          const time = hasTime ? TIMES[Math.floor(rng() * TIMES.length)] : "";
          const mk = (vb) => t[0].replace("{v}", vb).replace("{t}", time);
          const good = mk(t[1]), w1 = mk(t[2]), w2 = mk(t[3]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, rule: t[4] };
        },
        whyWrong: (v) => [`Match the verb to the true subject and ignore words between them; singular subjects need singular verbs.`],
        trick: "singular subject takes a singular verb.",
        tip: "Ignore phrases sitting between subject and verb."
      },
      {
        kind: "numeric", name: "tense selection", difficulty: "medium",
        note: "Pick the sentence whose tense matches the time signal.",
        q: (v) => `Choose the correct sentence: "${v.s1}" or "${v.s2}"?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because the signal "${v.sig}" requires ${v.tense}, while "${v.w1}" uses the wrong tense.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Bilal", "Ayesha", "Hamza", "Zainab", "Usman", "Mariam"];
          const PLURALS = ["They", "The students", "The children", "The workers", "The boys"];
          const T = [
            ["Yesterday, {N} visited {N2}.", "Tomorrow, {N} visited {N2}.", "{N} visits {N2} yesterday.", "yesterday", "past simple", "S", ["Lahore", "Karachi", "the museum", "the doctor"]],
            ["{N} will travel to {N2} tomorrow.", "{N} travels to {N2} tomorrow.", "{N} will travels to {N2} tomorrow.", "tomorrow", "future simple", "S", ["Lahore", "Karachi", "the market", "the bazaar"]],
            ["{N} has finished {N2} already.", "{N} finished {N2} already.", "{N} have finished {N2} already.", "already", "present perfect", "S", ["the report", "the project", "the essay", "the work"]],
            ["{N} were sleeping when {N2} rang.", "{N} are sleeping when {N2} rang.", "{N} was sleeping when {N2} rang.", "when the bell rang", "past continuous", "P", ["the bell", "the phone", "the alarm", "the clock"]],
            ["{N} has been teaching {N2} for ten years.", "{N} have been teaching {N2} for ten years.", "{N} has been teach {N2} for ten years.", "for ten years", "present perfect continuous", "S", ["in the college", "at the school", "in the academy", "at the centre"]],
            ["The train had left before {N} arrived at {N2}.", "The train has left before {N} arrived at {N2}.", "The train had leave before {N} arrived at {N2}.", "before", "past perfect", "S", ["the station", "the platform", "the stop", "the junction"]],
            ["{N} shall meet {N2} again soon.", "{N} met {N2} again soon.", "{N} shall meets {N2} again soon.", "soon", "future with shall", "S", ["us", "them", "the visitors", "the guests"]],
            ["{N} is cooking {N2} now.", "{N} was cooking {N2} now.", "{N} is cook {N2} now.", "now", "present continuous", "S", ["dinner", "lunch", "breakfast", "tea"]],
            ["{N} has gone to {N2}.", "{N} have gone to {N2}.", "{N} has went to {N2}.", "has gone", "present perfect", "S", ["the market", "the bazaar", "the shop", "the mall"]],
            ["{N} had been waiting {N2} for an hour.", "{N} have been waiting {N2} for an hour.", "{N} had been wait {N2} for an hour.", "for an hour", "past perfect continuous", "P", ["outside", "there", "here", "near the gate"]]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const n = t[5] === "P" ? PLURALS[Math.floor(rng() * PLURALS.length)] : NAMES[Math.floor(rng() * NAMES.length)];
          const n2 = t[6][Math.floor(rng() * t[6].length)];
          const mk = (sent) => sent.replace("{N}", n).replace("{N2}", n2);
          const good = mk(t[0]), w1 = mk(t[1]), w2 = mk(t[2]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, sig: t[3], tense: t[4] };
        },
        whyWrong: (v) => [`Match the tense to the time signal; mixing past signals with future verbs is the classic error.`],
        trick: "yesterday=past, tomorrow=future, now=present.",
        tip: "Time adverbs decide the tense."
      },
      {
        kind: "numeric", name: "article selection", difficulty: "easy",
        note: "Choose a, an or the before the noun.",
        q: (v) => `Which article correctly completes the sentence "${v.q}"?`,
        a: (v) => `${v.art}`,
        e: (v) => `"${v.art}" is correct before "${v.word}" because ${v.reason}, and the other options do not fit the rule.`,
        distract: (v) => {
          const O = ["a", "an", "the"].filter((x) => x !== v.art.toLowerCase());
          return [`${O[0]}`, `${O[1]}`, "some", "any", "no"];
        },
        vals: (rng) => {
          const R = [
            ["___ apple a day keeps the doctor away.", "an", "apple", "the word begins with a vowel sound"],
            ["She is ___ honest person.", "an", "honest", "'honest' begins with a vowel sound"],
            ["He bought ___ new car.", "a", "new", "the word begins with a consonant sound"],
            ["___ sun rises in the east.", "The", "sun", "there is only one sun"],
            ["He is ___ university student.", "a", "university", "'university' begins with a 'yoo' sound"],
            ["I saw ___ elephant at the zoo.", "an", "elephant", "the word begins with a vowel sound"],
            ["She plays ___ violin beautifully.", "the", "violin", "the instrument is named with 'the'"],
            ["We need ___ hour to finish.", "an", "hour", "'hour' begins with a vowel sound"],
            ["___ Himalayas are in Asia.", "The", "Himalayas", "mountain ranges take 'the'"],
            ["He wants ___ umbrella.", "an", "umbrella", "the word begins with a vowel sound"],
            ["___ orange is a citrus fruit.", "an", "orange", "the word begins with a vowel sound"],
            ["___ cat is sleeping on the sofa.", "a", "cat", "the word begins with a consonant sound"],
            ["___ owl hoots at night.", "an", "owl", "the word begins with a vowel sound"],
            ["She is ___ engineer.", "an", "engineer", "the word begins with a vowel sound"],
            ["___ Ganges flows into the sea.", "The", "Ganges", "rivers take 'the'"],
            ["He plays ___ piano.", "the", "piano", "musical instruments take 'the'"],
            ["___ moon looks beautiful tonight.", "The", "moon", "there is only one moon"],
            ["I read ___ book every month.", "a", "book", "the word begins with a consonant sound"],
            ["He is ___ one rupee note owner.", "a", "one", "'one' begins with a 'w' sound"],
            ["___ European country is near Pakistan.", "a", "European", "'European' begins with a 'y' sound"],
            ["We saw ___ old building.", "an", "old", "the word begins with a vowel sound"],
            ["___ internet is fast today.", "The", "internet", "the internet is a unique system"]
          ];
          const r = R[Math.floor(rng() * R.length)];
          return { q: r[0], art: r[1], word: r[2], reason: r[3] };
        },
        whyWrong: (v) => [`Choose by SOUND, not spelling: 'an' before vowel sounds, 'a' before consonant sounds, 'the' for unique nouns.`],
        trick: "a=consonant sound, an=vowel sound, the=unique.",
        tip: "Check the sound of the next word, not its first letter."
      }
    ],

    "Prepositions and Pronouns": [
      {
        kind: "numeric", name: "preposition selection", difficulty: "medium",
        note: "Choose the correct preposition for time and place.",
        q: (v) => `Choose the correct sentence: "${v.s1}" or "${v.s2}"?`,
        a: (v) => `${v.good}`,
        e: (v) => `"${v.good}" is correct because ${v.reason}, so "${v.w1}" misuses the preposition.`,
        distract: (v) => [`${v.w1}`, `${v.w2}`, `${v.w1.replace(/\.$/, "")}, right?`, `${v.good.replace(/\.$/, "")}!`, `${v.w2.toLowerCase()}`],
        vals: (rng) => {
          const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const CITIES = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Hyderabad"];
          const YEARS = ["2010", "2015", "2019", "2020", "2022", "2023", "2024", "2025"];
          const FURNS = ["table", "desk", "shelf", "floor", "counter", "bench"];
          const CLOCKS = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
          const T = [
            ["She arrived in {M}.", "She arrived on {M}.", "She arrived at {M}.", "months take 'in', not 'on'", "M", MONTHS],
            ["The meeting is at {T} o'clock.", "The meeting is in {T} o'clock.", "The meeting is on {T} o'clock.", "clock times take 'at'", "T", CLOCKS],
            ["I was born on {D}.", "I was born in {D}.", "I was born at {D}.", "days take 'on'", "D", DAYS],
            ["He lives in {C}.", "He lives at {C}.", "He lives on {C}.", "cities take 'in'", "C", CITIES],
            ["The cat is under the table.", "The cat is on the table.", "The cat is in the table.", "'under' means below while 'on' means on top", "", []],
            ["We went to the park.", "We went at the park.", "We went on the park.", "movement to a place takes 'to'", "", []],
            ["She is good at maths.", "She is good in maths.", "She is good on maths.", "skills take 'at'", "", []],
            ["He depends on his parents.", "He depends of his parents.", "He depends at his parents.", "'depend' takes 'on'", "", []],
            ["The book is on the shelf.", "The book is at the shelf.", "The book is in the shelf.", "surfaces take 'on'", "", []],
            ["They arrived in {Y}.", "They arrived on {Y}.", "They arrived at {Y}.", "years take 'in'", "Y", YEARS],
            ["She is afraid of dogs.", "She is afraid from dogs.", "She is afraid on dogs.", "'afraid' takes 'of'", "", []],
            ["We discussed the plan.", "We discussed about the plan.", "We discussed on the plan.", "'discuss' takes no preposition", "", []],
            ["The school reopens in {M}.", "The school reopens on {M}.", "The school reopens at {M}.", "months take 'in'", "M", MONTHS],
            ["We met on {D}.", "We met in {D}.", "We met at {D}.", "days take 'on'", "D", DAYS],
            ["The keys are on the {F}.", "The keys are at the {F}.", "The keys are in the {F}.", "surfaces take 'on'", "F", FURNS],
            ["She was born in {Y}.", "She was born on {Y}.", "She was born at {Y}.", "years take 'in'", "Y", YEARS],
            ["He arrived at {T} sharp.", "He arrived in {T} sharp.", "He arrived on {T} sharp.", "clock times take 'at'", "T", CLOCKS]
          ];
          const t = T[Math.floor(rng() * T.length)];
          const mk = (sent) => sent.replace("{" + t[4] + "}", t[5][Math.floor(rng() * t[5].length)]);
          const good = mk(t[0]), w1 = mk(t[1]), w2 = mk(t[2]);
          const flip = rng() < 0.5;
          return { s1: flip ? w1 : good, s2: flip ? good : w1, good, w1, w2, reason: t[3] };
        },
        whyWrong: (v) => [`Prepositions follow fixed rules for time and place; 'in' for periods, 'on' for days and surfaces, 'at' for points.`],
        trick: "in=months/years, on=days/surfaces, at=times.",
        tip: "Memorise verb-preposition pairs like depend on."
      },
      {
        kind: "numeric", name: "pronoun selection", difficulty: "easy",
        note: "Choose the correct pronoun case.",
        q: (v) => `Which pronoun correctly completes "${v.q}"?`,
        a: (v) => `${v.pron}`,
        e: (v) => `"${v.pron}" is correct because ${v.reason}; the other options use the wrong case.`,
        distract: (v) => {
          const O = ["I", "me", "my", "mine", "she", "her", "he", "him", "they", "them", "we", "us", "our", "ours", "you", "yours", "his", "its", "their"].filter((x) => x !== v.pron);
          let h = 0;
          for (const c of v.pron) h += c.charCodeAt(0);
          const picks = [];
          for (let k = 0; k < 5; k++) picks.push(O[(h + k * 2) % O.length]);
          return picks;
        },
        vals: (rng) => {
          const R = [
            ["___ am going to {P}.", "I", "the subject form is needed", ["school", "the market", "the office", "the park"]],
            ["Please give the book to ___.", "me", "the object form follows 'to'", []],
            ["___ is my best friend.", "She", "the subject form is needed", []],
            ["I met ___ at the market.", "her", "the object form follows the verb", []],
            ["___ are playing {P}.", "They", "the subject form is needed", ["outside", "in the park", "in the garden", "near the school"]],
            ["This gift is for ___.", "him", "the object form follows 'for'", []],
            ["___ hat is on the table.", "My", "the possessive adjective precedes the noun", []],
            ["This pen is ___.", "mine", "the possessive pronoun stands alone", []],
            ["___ will visit us tomorrow.", "He", "the subject form is needed", []],
            ["The teacher praised ___.", "us", "the object form follows the verb", []],
            ["___ are going home now.", "They", "the subject form is needed", []],
            ["Please help ___ with the work.", "me", "the object form follows the verb", []],
            ["___ am happy today.", "I", "the subject form is needed", []],
            ["Is this bag ___?", "yours", "the possessive pronoun stands alone", []],
            ["___ cat is very cute.", "Her", "the possessive adjective precedes the noun", []],
            ["Give the keys to ___.", "him", "the object form follows 'to'", []],
            ["___ know the answer.", "We", "the subject form is needed", []],
            ["This gift is for ___.", "her", "the object form follows 'for'", []],
            ["___ are my neighbours.", "They", "the subject form is needed", []],
            ["The idea was ___.", "ours", "the possessive pronoun stands alone", []]
          ];
          const r = R[Math.floor(rng() * R.length)];
          let q = r[0];
          if (r[3].length) q = q.replace("{P}", r[3][Math.floor(rng() * r[3].length)]);
          return { q, pron: r[1], reason: r[2] };
        },
        whyWrong: (v) => [`Use subject pronouns (I, she, they) for performers and object pronouns (me, her, them) after verbs and prepositions.`],
        trick: "subject=I/she/they; object=me/her/them.",
        tip: "After prepositions use object forms."
      }
    ],

    "Word Lengths and Letter Counts": [
      {
        kind: "numeric", name: "grammar term letter totals", difficulty: "medium",
        note: "Adding the letter counts of two grammar terms.",
        q: (v) => `What is the total letter count of "${v.a}" and "${v.b}" together?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `The grammar term "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so the two terms together give ${v.la} + ${v.lb} = ${v.la + v.lb} letters.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["noun", "verb", "mood", "case", "tense", "voice", "theme", "rhyme", "prose", "verse", "ode", "epic", "pun", "saga", "lyric", "fable", "drama", "essay", "idiom", "irony", "number", "object", "person", "plural", "aspect", "gerund", "stative", "cleft", "index", "modal", "affix", "blend", "gloss", "lexis", "token", "trope", "unity", "clause", "phrase", "adjective", "adverb", "anaphora", "apposition", "auxiliary", "clitic", "cohesion", "collective", "comparative", "complement", "compound", "concord", "conjunction", "consonant", "coordinate", "copular", "countable", "dative", "declension", "definite", "demonstrative", "derivation", "determiner", "digraph", "diphthong", "ditransitive", "elision", "ellipsis", "ergative", "exclamation", "feminine", "finite", "genitive", "gradable", "imperative", "indefinite", "indicative", "infinitive", "inflection", "instrumental", "interjection", "interrogative", "intransitive", "lexeme", "locative", "masculine", "modifier", "morpheme", "morphology", "nominative", "onomatopoeia", "optative", "participle", "particle", "periphrastic", "phoneme", "phonology", "possessive", "predicate", "prefix", "preposition"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count the letters of each grammar term separately, then add: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Spaces between the words of a term are not letters.`, `Spell both terms slowly so no letter is skipped.`],
        trick: "Add both grammar term lengths together.",
        tip: "Count each term fully before adding."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
