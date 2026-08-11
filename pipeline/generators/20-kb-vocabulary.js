/* ============================================================
   Deep Knowledge KB — English Vocabulary
   Word meanings, prefixes, roots, word formation and usage.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["vocabulary"],
  chapter: "English Vocabulary — Deep Knowledge Bank",
  tags: ["vocabulary", "deep-kb", "english", "words"],
  topics: {

    "Word Meanings": [
      {
        kind: "fact", name: "common word meanings",
        note: "Meanings of frequently tested vocabulary words.",
        facts: [
          ["What does 'abundant' mean?", "existing in large quantities", "Abundant describes something plentiful and ample, such as an abundant harvest or abundant rainfall."],
          ["What does 'benevolent' mean?", "kind and well meaning", "A benevolent person shows kindness and goodwill toward others, acting generously without expectation."],
          ["What does 'candid' mean?", "honest and straightforward", "Candid speech is frank and truthful, with no hiding of opinions or facts behind polite words."],
          ["What does 'diligent' mean?", "hard working and careful", "A diligent student works steadily and carefully, paying attention to every detail of the task."],
          ["What does 'eloquent' mean?", "fluent and persuasive in speech", "An eloquent speaker chooses words that flow smoothly and convince the listener with ease."],
          ["What does 'fragile' mean?", "easily broken or damaged", "Fragile objects like glass and china break easily, so they need careful handling and packing."],
          ["What does 'generous' mean?", "giving more than is expected", "A generous person shares money, time or help freely, often going beyond what is required."],
          ["What does 'humble' mean?", "modest and not proud", "A humble person does not boast about achievements and treats others with quiet respect."],
          ["What does 'immense' mean?", "extremely large or great", "Immense describes something huge in size or degree, like an immense ocean or immense effort."],
          ["What does 'jovial' mean?", "cheerful and friendly", "A jovial person is full of good humour and good cheer, making others around them smile."],
          ["What does 'keen' mean?", "very interested or sharp", "Keen can mean eager interest, as in a keen learner, or a sharp edge, as in a keen blade."],
          ["What does 'lucid' mean?", "clear and easy to understand", "Lucid writing or speech is perfectly clear, with ideas expressed simply and logically."],
          ["What does 'meticulous' mean?", "very careful about details", "A meticulous worker checks every small detail, leaving nothing to chance or carelessness."],
          ["What does 'noble' mean?", "having high moral qualities", "A noble act is honourable and selfless, reflecting courage, honesty and moral strength."],
          ["What does 'obstinate' mean?", "stubbornly refusing to change", "An obstinate person refuses to change their mind or course even when clearly wrong."],
          ["What does 'pragmatic' mean?", "practical rather than idealistic", "A pragmatic approach focuses on what works in practice rather than on perfect theories."],
          ["What does 'quaint' mean?", "attractively old fashioned", "Quaint villages and cottages have a charming, old-fashioned character that people enjoy."],
          ["What does 'resilient' mean?", "able to recover quickly", "A resilient person bounces back quickly from setbacks and keeps going through difficulties."],
          ["What does 'sincere' mean?", "genuine and honest", "Sincere feelings and words come from the heart, without pretence or hidden motives."],
          ["What does 'tenacious' mean?", "holding firmly to a purpose", "A tenacious person refuses to let go of a goal, persisting with great determination."],
          ["What does 'ubiquitous' mean?", "found everywhere at once", "Mobile phones have become ubiquitous, appearing in nearly every home and hand worldwide."],
          ["What does 'vivid' mean?", "producing strong clear images", "Vivid colours and descriptions are bright and lifelike, making strong impressions on the senses."],
          ["What does 'wary' mean?", "cautious and watchful", "A wary traveller stays alert to danger and checks carefully before trusting new situations."],
          ["What does 'zealous' mean?", "full of passionate enthusiasm", "A zealous supporter works with burning enthusiasm, devoting great energy to a cause."],
          ["What does 'arduous' mean?", "requiring great effort", "An arduous journey is long and difficult, demanding strength, patience and endurance."],
          ["What does 'brisk' mean?", "quick and energetic", "A brisk walk is fast and lively, and brisk business means trade is moving quickly."],
          ["What does 'courteous' mean?", "polite and respectful", "A courteous person uses good manners, saying please and thank you with genuine warmth."],
          ["What does 'devious' mean?", "dishonest and cunning", "A devious plan is tricky and underhanded, designed to deceive people secretly."],
          ["What does 'eminent' mean?", "famous and respected", "An eminent scientist is distinguished and highly respected for outstanding achievements."],
          ["What does 'frugal' mean?", "careful with money", "A frugal person spends money sparingly and avoids waste while still living comfortably."],
          ["What does 'gregarious' mean?", "fond of company", "A gregarious person loves being with others, sociable and at ease in large groups."],
          ["What does 'harsh' mean?", "unpleasantly rough or severe", "Harsh weather, words or punishments are severe and unkind, giving no comfort to anyone."],
          ["What does 'intrepid' mean?", "fearless and adventurous", "An intrepid explorer ventures into danger without fear, seeking new lands and knowledge."],
          ["What does 'jubilant' mean?", "feeling great joy", "Jubilant crowds celebrate victories with shouting, singing and overwhelming happiness."],
          ["What does 'kindred' mean?", "similar in nature or family", "Kindred spirits share the same tastes and outlook, and kindred are one's relatives."],
          ["What does 'lavish' mean?", "sumptuous and very generous", "A lavish feast is rich and extravagant, with food and decoration beyond all necessity."],
          ["What does 'meagre' mean?", "very small and insufficient", "A meagre income is barely enough to survive, leaving little for comfort or saving."],
          ["What does 'notorious' mean?", "famous for something bad", "A notorious criminal is widely known for wrongdoing, with a bad reputation everywhere."],
          ["What does 'obscure' mean?", "not well known or clear", "An obscure writer is little known, and an obscure meaning is difficult to discover."],
          ["What does 'profound' mean?", "very deep or intense", "Profound thoughts go far beneath the surface, and profound changes are far-reaching."],
          ["What does 'ravenous' mean?", "extremely hungry", "A ravenous appetite demands huge amounts of food, as if the person has not eaten for days."],
          ["What does 'skeptical' mean?", "doubting and questioning", "A skeptical reader questions claims and demands evidence before accepting any conclusion."],
          ["What does 'tranquil' mean?", "calm and peaceful", "A tranquil lake lies perfectly still and quiet, free from noise and disturbance."],
          ["What does 'voracious' mean?", "greedy for food or knowledge", "A voracious reader devours books rapidly, and a voracious eater consumes enormous meals."],
          ["What does 'witty' mean?", "cleverly humorous", "A witty remark combines sharp intelligence with humour, amusing people with its cleverness."],
          ["What does 'ample' mean?", "more than enough", "Ample space, time or food means there is plenty to spare, with room to manoeuvre comfortably."],
          ["What does 'brutal' mean?", "cruel and violent", "Brutal treatment is savagely harsh and merciless, showing no pity for the victim."],
          ["What does 'coherent' mean?", "logical and well organised", "A coherent argument holds together clearly, with each point following the previous one."],
          ["What does 'devoid' mean?", "entirely without something", "To be devoid of feeling means to have none at all, empty of every trace of emotion."],
          ["What does 'elated' mean?", "extremely happy and excited", "An elated winner glows with joy and excitement after a long-awaited success or victory."],
          ["What does 'feasible' mean?", "possible to do easily", "A feasible plan can be carried out in practice, with resources and time available for it."],
          ["What does 'grudging' mean?", "given unwillingly", "A grudging apology is forced and reluctant, offered without true willingness or sincerity."],
          ["What does 'hinder' mean?", "to slow down or obstruct", "To hinder progress is to make it slower or harder, placing obstacles in the path of success."],
          ["What does 'impartial' mean?", "fair and unbiased", "An impartial judge treats every side equally, letting evidence decide without favouritism."],
          ["What does 'lament' mean?", "to express deep sorrow", "To lament a loss is to mourn it with grief, often through weeping, wailing or words of regret."],
          ["What does 'meticulous' mean?", "extremely careful and precise", "Meticulous work shows painstaking care over every small detail, leaving no error unnoticed."],
          ["What does 'nurture' mean?", "to care for and encourage growth", "To nurture a talent means to feed it with time and encouragement so it can develop fully."],
          ["What does 'obsolete' mean?", "no longer in use", "Obsolete technology has been replaced by newer devices and is no longer produced or used."],
          ["What does 'precarious' mean?", "dangerously unstable", "A precarious position is unsafe and could collapse at any moment, needing constant care."],
          ["What does 'reluctant' mean?", "unwilling and hesitant", "A reluctant learner hesitates to begin, holding back because of doubt or lack of desire."],
          ["What does 'solemn' mean?", "serious and grave", "A solemn ceremony is dignified and serious, with an atmosphere of quiet respect and weight."],
          ["What does 'tedious' mean?", "boring and tiresome", "Tedious tasks repeat without interest or variety, making time feel slow and heavy."],
          ["What does 'vigorous' mean?", "strong and energetic", "Vigorous exercise is intense and active, raising the heartbeat and working the muscles hard."],
          ["What does 'wretched' mean?", "miserable and unfortunate", "A wretched life is full of suffering and hardship, deserving pity from those who see it."],
          ["What does 'yield' mean?", "to give way or produce", "To yield can mean to surrender or give way, or to produce results, as a field yields crops."]
        ],
        trick: "Link each word to a strong mental picture.",
        tip: "Roots and context clues unlock unknown words."
      },
      {
        kind: "fact", name: "roots and affixes",
        note: "Meanings of common Latin and Greek roots.",
        facts: [
          ["What does the root 'bene' mean?", "good or well", "The root 'bene' means good, as in benefit, benevolent and benefactor, all words about doing good."],
          ["What does the root 'mal' mean?", "bad or evil", "The root 'mal' means bad, as in malady, malice and malfunction, words describing harm or evil."],
          ["What does the root 'aud' mean?", "to hear", "The root 'aud' means hear, as in audible, audience and auditorium, all connected with hearing."],
          ["What does the root 'dict' mean?", "to say or speak", "The root 'dict' means speak, as in dictate, predict and verdict, words about saying or declaring."],
          ["What does the root 'scrib' mean?", "to write", "The root 'scrib' means write, as in scribble, describe and manuscript, words about writing."],
          ["What does the root 'port' mean?", "to carry", "The root 'port' means carry, as in transport, portable and export, words about carrying things."],
          ["What does the root 'spect' mean?", "to look or see", "The root 'spect' means look, as in inspect, spectator and respect, words about seeing or viewing."],
          ["What does the root 'cred' mean?", "to believe", "The root 'cred' means believe, as in credit, credible and incredible, words about belief or trust."],
          ["What does the root 'graph' mean?", "to write or draw", "The root 'graph' means write, as in autograph, biography and photograph, words about writing or drawing."],
          ["What does the root 'jur' mean?", "law or oath", "The root 'jur' means law, as in jury, justice and jurisdiction, words connected with law and judging."],
          ["What does the root 'log' mean?", "word or study", "The root 'log' means word or study, as in dialogue, biology and logic, words about speech or knowledge."],
          ["What does the root 'mort' mean?", "death", "The root 'mort' means death, as in mortal, immortal and mortuary, words about death and dying."],
          ["What does the root 'path' mean?", "feeling or suffering", "The root 'path' means feeling, as in sympathy, empathy and pathetic, words about emotion and suffering."],
          ["What does the root 'phil' mean?", "love", "The root 'phil' means love, as in philosophy, philanthropist and philharmonic, words about loving."],
          ["What does the root 'phon' mean?", "sound", "The root 'phon' means sound, as in telephone, symphony and microphone, words about sound."],
          ["What does the root 'pre' mean?", "before", "The prefix 'pre' means before, as in preview, preheat and predict, words about happening earlier."],
          ["What does the root 're' mean?", "again or back", "The prefix 're' means again, as in rebuild, rewrite and return, words about doing again or going back."],
          ["What does the root 'un' mean?", "not", "The prefix 'un' means not, as in unhappy, unable and untrue, words that reverse the base meaning."],
          ["What does the root 'inter' mean?", "between", "The prefix 'inter' means between, as in international, interview and interrupt, words about between or among."],
          ["What does the root 'trans' mean?", "across or beyond", "The prefix 'trans' means across, as in transport, translate and transatlantic, words about crossing over."]
        ],
        trick: "bene=good, mal=bad, pre=before, trans=across.",
        tip: "Learn roots to decode whole word families."
      }
    ],

    "Prefixes and Word Building": [
      {
        kind: "pair", name: "prefix meanings", a: "prefix", b: "meaning",
        note: "Match each prefix to its meaning.",
        pairs: [
          ["anti", "against"], ["auto", "self"], ["bi", "two"], ["co", "together"], ["contra", "against"],
          ["de", "down or reverse"], ["dis", "not or apart"], ["ex", "out of"], ["extra", "beyond"],
          ["fore", "before or front"], ["hyper", "over or excessive"], ["il", "not"], ["im", "not"],
          ["in", "not"], ["ir", "not"], ["macro", "large"], ["micro", "small"], ["mis", "wrongly"],
          ["mono", "one"], ["multi", "many"], ["non", "not"], ["out", "beyond or surpass"], ["over", "too much"],
          ["poly", "many"], ["post", "after"], ["semi", "half"], ["sub", "under"], ["super", "above or over"],
          ["tri", "three"], ["ultra", "beyond extreme"],           ["uni", "one"], ["vice", "deputy"], ["peri", "around"], ["hypo", "under"],
          ["inter", "between"], ["tele", "far or distant"], ["circum", "around"],
          ["a", "without"], ["ab", "away from"], ["ad", "toward"], ["ante", "before"], ["be", "completely"],
          ["di", "two or apart"], ["e", "out of"], ["epi", "upon"], ["hetero", "different"], ["homo", "same"]
        ],
        trick: "uni=one, bi=two, tri=three, multi=many.",
        tip: "Prefix meanings unlock thousands of words."
      },
      {
        kind: "fact", name: "word formation",
        note: "Words built by joining roots and suffixes.",
        facts: [
          ["Which word means 'one who benefits from charity'?", "Beneficiary", "Beneficiary joins 'bene' (good) with 'fic' (make) and '-iary' (person), meaning one who receives good."],
          ["Which word means 'the study of the stars'?", "Astronomy", "Astronomy joins 'astro' (star) with 'nomy' (law or study), meaning the study of stars and space."],
          ["Which word means 'a person who writes'?", "Scribe", "The noun scribe comes from 'scrib' (write) plus the agent suffix, naming a person who writes."],
          ["Which word means 'to carry across'?", "Transport", "Transport joins 'trans' (across) and 'port' (carry), meaning to carry people or goods across places."],
          ["Which word means 'a written record of one's life'?", "Biography", "Biography joins 'bio' (life) and 'graph' (write), meaning a written record of a person's life."],
          ["Which word means 'a device to hear at a distance'?", "Telephone", "Telephone joins 'tele' (distant) and 'phone' (sound), meaning a device carrying sound far away."],
          ["Which word means 'able to be believed'?", "Credible", "Credible joins 'cred' (believe) and '-ible' (able), meaning worthy of belief or trust."],
          ["Which word means 'the love of wisdom'?", "Philosophy", "Philosophy joins 'phil' (love) and 'soph' (wisdom), literally the love of wisdom and knowledge."],
          ["Which word means 'unable to die'?", "Immortal", "Immortal joins 'im' (not) and 'mortal' (deadly or human), meaning unable to die or fade away."],
          ["Which word means 'a person who gives money to good causes'?", "Philanthropist", "Philanthropist joins 'phil' (love) and 'anthrop' (human), meaning a lover of humankind who gives generously."],
          ["Which word means 'a formal written agreement'?", "Contract", "Contract joins 'con' (together) and 'tract' (draw), meaning a written agreement drawing parties together."],
          ["Which word means 'to speak before' or 'to foretell'?", "Predict", "Predict joins 'pre' (before) and 'dict' (speak), meaning to speak about something before it happens."],
          ["Which word means 'the study of living things'?", "Biology", "Biology joins 'bio' (life) and 'logy' (study), meaning the scientific study of living things."],
          ["Which word means 'a device for looking far away'?", "Telescope", "Telescope joins 'tele' (distant) and 'scope' (see), meaning an instrument for viewing distant objects."],
          ["Which word means 'to look at closely'?", "Inspect", "Inspect joins 'in' (into) and 'spect' (look), meaning to look into something carefully and closely."],
          ["Which word means 'a written message sent across'?", "Telegram", "Telegram joins 'tele' (distant) and 'gram' (written), meaning a written message sent over distance."],
          ["Which word means 'a person who travels to outer space'?", "Astronaut", "Astronaut joins 'astro' (star) and 'naut' (sailor), meaning a star-sailor who travels into space."],
          ["Which word means 'to carry back from a place'?", "Return", "Return joins 're' (back) and 'turn' (to go), meaning to go back or carry something back again."],
          ["Which word means 'more than one language speaker'?", "Polyglot", "Polyglot joins 'poly' (many) and 'glot' (tongue or language), meaning one who speaks many languages."],
          ["Which word means 'a device that writes distant sound'?", "Telegraph", "Telegraph joins 'tele' (distant) and 'graph' (write), naming an early device writing messages far away."]
        ],
        trick: "Prefix + root + suffix = meaning of the word.",
        tip: "Break unknown words into their parts first."
      }
    ],

    "Usage and Spelling": [
      {
        kind: "numeric", name: "word letter counts", difficulty: "easy",
        note: "Counting letters in vocabulary words.",
        q: (v) => `How many letters are in the word "${v.w}"?`,
        a: (v) => `${v.w.length}`,
        e: (v) => `The word "${v.w}" has ${v.w.length} letters: ${v.w.split("").join(", ")}. Spell it slowly, letter by letter, to avoid missing double letters.`,
        distract: (v) => [`${v.w.length + 1}`, `${v.w.length - 1 >= 1 ? v.w.length - 1 : v.w.length + 2}`, `${v.w.length + 2}`, `${v.w.length - 2 >= 1 ? v.w.length - 2 : v.w.length + 3}`, `${v.w.length + 3}`],
        vals: (rng) => {
          const W = ["abundant", "benevolent", "candid", "diligent", "eloquent", "fragile", "generous", "humble", "immense", "jovial", "keen", "lucid", "meticulous", "noble", "obstinate", "pragmatic", "quaint", "resilient", "sincere", "tenacious", "ubiquitous", "vivid", "wary", "zealous", "arduous", "brisk", "courteous", "devious", "eminent", "frugal", "gregarious", "intrepid", "jubilant", "lavish", "meagre", "notorious", "obscure", "profound", "ravenous", "skeptical", "tranquil", "voracious", "witty", "ample", "coherent", "elated", "feasible", "impartial", "precarious", "reluctant", "solemn", "tedious", "vigorous", "wretched"];
          return { w: W[Math.floor(rng() * W.length)] };
        },
        whyWrong: (v) => [`Spell the word carefully and count each letter once; double letters are the classic trap.`],
        trick: "count each letter once.",
        tip: "Say the word aloud while counting letters."
      },
      {
        kind: "numeric", name: "first letter position", difficulty: "easy",
        note: "Alphabet position of a word's first letter.",
        q: (v) => `What is the alphabet position of the first letter of the word "${v.w}"?`,
        a: (v) => `${v.p}`,
        e: (v) => `The first letter of "${v.w}" is "${v.w[0]}", which is the ${v.ord} letter of the English alphabet.`,
        distract: (v) => [`${v.p + 1}`, `${v.p - 1 >= 1 ? v.p - 1 : v.p + 2}`, `${v.p + 2}`, `${v.p - 2 >= 1 ? v.p - 2 : v.p + 3}`, `${v.p + 3}`],
        vals: (rng) => {
          const W = ["abundant", "benevolent", "candid", "diligent", "eloquent", "fragile", "generous", "humble", "immense", "jovial", "keen", "lucid", "meticulous", "noble", "obstinate", "pragmatic", "quaint", "resilient", "sincere", "tenacious", "ubiquitous", "vivid", "wary", "zealous", "arduous", "brisk", "courteous", "devious", "eminent", "frugal"];
          const ORD = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth"];
          const w = W[Math.floor(rng() * W.length)];
          return { w, p: w[0].charCodeAt(0) - 96, ord: ORD[w[0].charCodeAt(0) - 97] };
        },
        whyWrong: (v) => [`Find the letter's position in A to Z, where A is 1 and Z is 26, then check the first letter.`],
        trick: "A=1, B=2, C=3, up to Z=26.",
        tip: "Recite the alphabet order when unsure."
      }
    ],

    "Spelling and Letter Building": [
      {
        kind: "numeric", name: "combined word letter counts", difficulty: "medium",
        note: "Adding the letter counts of two vocabulary words.",
        q: (v) => `How many letters are in the word "${v.a}" and the word "${v.b}" together?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `"${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so together they contain ${v.la} + ${v.lb} = ${v.la + v.lb} letters.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "yearn", "abate", "brusque", "cogent", "dawdle", "enigma", "florid", "garner", "hobble", "immure", "junta", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "quash", "rebuke", "sunder", "tarry", "upbraid", "vex", "waver", "yoke", "zephyr", "addle", "bilk", "churl", "dally", "errant", "fettle", "gauche", "hallow", "inure", "jape", "ken", "limpid", "mawkish", "nugatory", "ossify", "purport", "quell", "riven", "shard", "tenet", "umbrage", "verdant", "whelp", "yeoman", "zealot"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count the letters of each word separately, then add the two totals: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Do not count spaces, hyphens or punctuation as letters.`, `Spell both words aloud so no double letter is missed.`],
        trick: "Add the two word lengths step by step.",
        tip: "Count each letter once; double letters are the trap."
      },
      {
        kind: "numeric", name: "letter count differences", difficulty: "medium",
        note: "Comparing the letter counts of two vocabulary words.",
        q: (v) => `How many more letters does "${v.a}" have than "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `"${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so "${v.a}" has ${v.la} - ${v.lb} = ${v.la - v.lb} more letters than "${v.b}".`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "brusque", "cogent", "enigma", "florid", "garner", "hobble", "immure", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "rebuke", "sunder", "upbraid", "zephyr", "errant", "fettle", "gauche", "hallow", "limpid", "mawkish", "nugatory", "ossify", "purport", "umbrage", "verdant", "yeoman", "zealot", "kaleidoscope", "sycophant", "mendacious", "lachrymose", "pusillanimous"];
          const SHORT = ["addle", "churl", "awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "vex", "ken", "jape", "bilk", "quash", "tarry", "waver", "quell", "riven", "shard", "tenet", "whelp"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the shorter word's letters from the longer word's: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer word first, then the shorter, and find the difference.`, `A negative difference is impossible here because the first word is the longer one.`],
        trick: "Subtract the shorter count from the longer.",
        tip: "Check lengths before subtracting."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
