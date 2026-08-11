/* ============================================================
   Deep Knowledge KB — English Synonyms
   Word-to-synonym pairs and definitions.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["synonyms"],
  chapter: "English Synonyms — Deep Knowledge Bank",
  tags: ["synonyms", "deep-kb", "english", "words"],
  topics: {

    "Synonym Pairs": [
      {
        kind: "pair", name: "word synonyms", a: "word", b: "synonym",
        note: "Match each word to its closest synonym.",
        pairs: [
          ["abandon", "forsake"], ["abate", "subside"], ["abbreviate", "shorten"], ["abhor", "detest"],
          ["abundant", "plentiful"], ["accomplish", "achieve"], ["accurate", "precise"], ["adverse", "unfavourable"],
          ["aggravate", "worsen"], ["agile", "nimble"], ["alter", "change"], ["ambiguous", "unclear"],
          ["amiable", "friendly"], ["amplify", "intensify"], ["ancient", "old"], ["annoy", "irritate"],
          ["apparent", "obvious"], ["arduous", "difficult"], ["arrogant", "haughty"], ["ascend", "climb"],
          ["audacious", "bold"], ["austere", "stern"], ["authentic", "genuine"], ["barren", "infertile"],
          ["benevolent", "kind"], ["bewilder", "confuse"], ["blunder", "mistake"], ["boisterous", "noisy"],
          ["brilliant", "intelligent"], ["candid", "frank"], ["cease", "stop"], ["celebrate", "commemorate"],
          ["chaotic", "disorderly"], ["courageous", "brave"], ["courteous", "polite"], ["cunning", "crafty"],
          ["curtail", "shorten"], ["dainty", "delicate"], ["daring", "bold"], ["deceitful", "dishonest"],
          ["dedicated", "devoted"], ["deficient", "lacking"], ["deliberate", "intentional"], ["demolish", "destroy"],
          ["dexterous", "skillful"], ["diligent", "hardworking"], ["diminish", "reduce"], ["dismal", "gloomy"],
          ["divert", "distract"], ["docile", "obedient"], ["dreadful", "terrible"], ["eager", "keen"],
          ["eccentric", "unusual"], ["elated", "joyful"], ["elegant", "graceful"], ["elusive", "evasive"],
          ["eminent", "distinguished"], ["enormous", "huge"], ["enthusiastic", "eager"], ["ephemeral", "short-lived"],
          ["essential", "vital"], ["exaggerate", "overstate"], ["exhausted", "tired"], ["explicit", "clear"],
          ["extravagant", "wasteful"], ["fabricate", "invent"], ["faithful", "loyal"], ["feeble", "weak"],
          ["ferocious", "fierce"], ["fertile", "fruitful"], ["flaw", "defect"], ["fragile", "delicate"],
          ["frugal", "thrifty"], ["furious", "angry"], ["garrulous", "talkative"], ["genuine", "authentic"],
          ["glamorous", "attractive"], ["gloomy", "dark"], ["gratify", "please"], ["gruesome", "horrible"],
          ["hasty", "quick"], ["haughty", "proud"], ["hazard", "danger"], ["hostile", "unfriendly"],
          ["immense", "vast"], ["impartial", "neutral"], ["impetuous", "impulsive"], ["industrious", "hardworking"],
          ["inevitable", "unavoidable"], ["inferior", "lower"], ["innocent", "blameless"], ["intrepid", "fearless"],
          ["jovial", "cheerful"], ["judicious", "wise"], ["keen", "eager"], ["laborious", "hard"],
          ["lament", "mourn"], ["lucid", "clear"], ["luminous", "bright"], ["magnificent", "splendid"],
          ["mandatory", "compulsory"], ["meticulous", "careful"], ["modest", "humble"], ["notorious", "infamous"],
          ["obstinate", "stubborn"], ["obvious", "evident"], ["opulent", "wealthy"], ["pious", "devout"],
          ["plausible", "believable"], ["profound", "deep"], ["prudent", "wise"], ["rapid", "fast"],
          ["reluctant", "unwilling"], ["resilient", "strong"], ["rigid", "stiff"], ["sagacious", "wise"],
          ["salient", "prominent"], ["sincere", "honest"], ["sparse", "scarce"], ["strenuous", "vigorous"],
          ["succinct", "brief"], ["superb", "excellent"], ["tedious", "boring"], ["tenacious", "firm"],
          ["tranquil", "calm"], ["urgent", "pressing"], ["vacant", "empty"], ["vague", "unclear"],
          ["vigilant", "watchful"], ["vivid", "bright"], ["voracious", "greedy"], ["wary", "cautious"],
          ["zealous", "enthusiastic"]
        ],
        trick: "A synonym means the same, not the opposite.",
        tip: "Learn synonyms in pairs for faster recall."
      }
    ],

    "Harder Synonyms": [
      {
        kind: "fact", name: "advanced synonym facts",
        note: "Synonyms of less common English words.",
        facts: [
          ["Which word is a synonym of 'ameliorate'?", "Improve", "Ameliorate means to make better, so improve is its exact synonym and both mean raising quality."],
          ["Which word is a synonym of 'cacophony'?", "Discordant noise", "Cacophony means a harsh mixture of sounds, so discordant noise captures its meaning precisely."],
          ["Which word is a synonym of 'dearth'?", "Scarcity", "Dearth means a lack or shortage, so scarcity is its closest synonym in any context."],
          ["Which word is a synonym of 'ebullient'?", "Enthusiastic", "Ebullient means full of energy and excitement, making enthusiastic its closest synonym."],
          ["Which word is a synonym of 'fastidious'?", "Meticulous", "Fastidious means very attentive to detail, and meticulous carries exactly the same meaning."],
          ["Which word is a synonym of 'grandiose'?", "Impressive", "Grandiose means impressively large or ambitious, so impressive is the best match here."],
          ["Which word is a synonym of 'halcyon'?", "Peaceful", "Halcyon means calm and peaceful, so peaceful is its direct synonym in daily usage."],
          ["Which word is a synonym of 'ignominious'?", "Shameful", "Ignominious means deserving disgrace, and shameful matches that meaning most closely."],
          ["Which word is a synonym of 'jubilant'?", "Overjoyed", "Jubilant means full of triumphant joy, so overjoyed is its closest synonym."],
          ["Which word is a synonym of 'laconic'?", "Terse", "Laconic means using very few words, and terse expresses that brevity of speech exactly."],
          ["Which word is a synonym of 'meticulous'?", "Scrupulous", "Meticulous and scrupulous both mean extremely careful about details and accuracy."],
          ["Which word is a synonym of 'nebulous'?", "Vague", "Nebulous means unclear and indefinite, making vague its closest synonym."],
          ["Which word is a synonym of 'obfuscate'?", "Confuse", "Obfuscate means to make something unclear, and confuse captures that intention well."],
          ["Which word is a synonym of 'palliate'?", "Ease", "Palliate means to relieve without curing, and ease matches its meaning of reducing pain."],
          ["Which word is a synonym of 'quixotic'?", "Idealistic", "Quixotic means impractically idealistic, so idealistic is its closest synonym."],
          ["Which word is a synonym of 'recalcitrant'?", "Stubborn", "Recalcitrant means resistant to authority, and stubborn expresses that defiance."],
          ["Which word is a synonym of 'sagacious'?", "Perceptive", "Sagacious means wise and perceptive, making perceptive its closest synonym."],
          ["Which word is a synonym of 'taciturn'?", "Reserved", "Taciturn means habitually silent, and reserved matches its quiet, restrained manner."],
          ["Which word is a synonym of 'ubiquitous'?", "Omnipresent", "Ubiquitous means present everywhere, and omnipresent shares that exact meaning."],
          ["Which word is a synonym of 'venerate'?", "Revere", "Venerate means to respect deeply, and revere is its closest synonym in meaning."],
          ["Which word is a synonym of 'wanton'?", "Deliberate", "Wanton means done without restraint or reason, and deliberate matches its intentional cruelty."],
          ["Which word is a synonym of 'zenith'?", "Pinnacle", "Zenith means the highest point, and pinnacle is its exact synonym of peak achievement."],
          ["Which word is a synonym of 'alacrity'?", "Eagerness", "Alacrity means cheerful readiness, and eagerness captures that willing swiftness."],
          ["Which word is a synonym of 'bucolic'?", "Rural", "Bucolic means relating to countryside life, so rural is its closest synonym."],
          ["Which word is a synonym of 'celestial'?", "Heavenly", "Celestial means of the sky or heavens, making heavenly its direct synonym."],
          ["Which word is a synonym of 'deleterious'?", "Harmful", "Deleterious means causing damage, and harmful is its closest everyday synonym."],
          ["Which word is a synonym of 'equivocate'?", "Prevaricate", "Equivocate and prevaricate both mean to avoid giving a direct answer or clear truth."],
          ["Which word is a synonym of 'fecund'?", "Fertile", "Fecund means highly fertile, so fertile matches its meaning of producing abundantly."],
          ["Which word is a synonym of 'garrulous'?", "Chatty", "Garrulous means excessively talkative, and chatty expresses that talkativeness."],
          ["Which word is a synonym of 'hirsute'?", "Hairy", "Hirsute means covered with hair, making hairy its plain and exact synonym."],
          ["Which word is a synonym of 'immutable'?", "Unchanging", "Immutable means never changing, and unchanging is its direct synonym in all contexts."],
          ["Which word is a synonym of 'juxtapose'?", "Compare", "Juxtapose means to place side by side for comparison, and compare captures the purpose."],
          ["Which word is a synonym of 'kudos'?", "Praise", "Kudos means praise and honour earned, so praise is its closest synonym."],
          ["Which word is a synonym of 'languid'?", "Listless", "Languid means lacking energy, and listless expresses that weary lack of vigour."],
          ["Which word is a synonym of 'magnanimous'?", "Generous", "Magnanimous means noble and generous, and generous captures its giving spirit."],
          ["Which word is a synonym of 'nadir'?", "Lowest point", "Nadir means the lowest point, the direct opposite of zenith, so lowest point fits."],
          ["Which word is a synonym of 'obsequious'?", "Servile", "Obsequious means excessively obedient, and servile matches its fawning behaviour."],
          ["Which word is a synonym of 'pragmatic'?", "Practical", "Pragmatic means dealing with matters practically, so practical is its exact synonym."],
          ["Which word is a synonym of 'quandary'?", "Dilemma", "Quandary means a state of uncertainty, and dilemma expresses a difficult choice."],
          ["Which word is a synonym of 'rancorous'?", "Bitter", "Rancorous means full of resentment, and bitter captures that lasting ill feeling."],
          ["Which word is a synonym of 'salubrious'?", "Healthful", "Salubrious means good for health, and healthful matches its healthy quality."],
          ["Which word is a synonym of 'timorous'?", "Timid", "Timorous means easily frightened, and timid expresses that shy fearfulness."],
          ["Which word is a synonym of 'unfathomable'?", "Incomprehensible", "Unfathomable means impossible to understand, and incomprehensible matches exactly."],
          ["Which word is a synonym of 'virtuoso'?", "Maestro", "Virtuoso means a person with outstanding skill, and maestro names such a master."],
          ["Which word is a synonym of 'wily'?", "Cunning", "Wily means skilled at deception, and cunning captures that sly cleverness."]
        ],
        trick: "Match meaning first, then choose the closest word.",
        tip: "Synonyms carry the same idea, not the same root."
      }
    ],

    "Spelling and Word Lengths": [
      {
        kind: "numeric", name: "total letter counts", difficulty: "medium",
        note: "Adding the letter counts of two synonym words.",
        q: (v) => `What is the total number of letters in "${v.a}" and "${v.b}"?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `"${v.a}" has ${v.la} letters and "${v.b}" has ${v.lb} letters, so their total letter count is ${v.la} + ${v.lb} = ${v.la + v.lb}.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "yearn", "abate", "brusque", "cogent", "dawdle", "enigma", "florid", "garner", "hobble", "immure", "junta", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "quash", "rebuke", "sunder", "tarry", "upbraid", "vex", "waver", "yoke", "zephyr", "addle", "bilk", "churl", "dally", "errant", "fettle", "gauche", "hallow", "inure", "jape", "ken", "limpid", "mawkish", "nugatory", "ossify", "purport", "quell", "riven", "shard", "tenet", "umbrage", "verdant", "whelp", "yeoman", "zealot"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count each word's letters first, then add the two totals: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Spaces, hyphens and punctuation never count as letters.`, `Spell both words aloud so that double letters are not missed.`],
        trick: "Add the letter counts of both words together.",
        tip: "Check each word separately before adding."
      },
      {
        kind: "numeric", name: "word length differences", difficulty: "medium",
        note: "Comparing the letter counts of two synonym words.",
        q: (v) => `How many more letters does the word "${v.a}" contain than the word "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `The word "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so "${v.a}" has ${v.la} - ${v.lb} = ${v.la - v.lb} more letters than "${v.b}".`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "brusque", "cogent", "enigma", "florid", "garner", "hobble", "immure", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "rebuke", "sunder", "upbraid", "zephyr", "errant", "fettle", "gauche", "hallow", "limpid", "mawkish", "nugatory", "ossify", "purport", "umbrage", "verdant", "yeoman", "zealot", "kaleidoscope", "sycophant", "mendacious", "lachrymose", "pusillanimous"];
          const SHORT = ["addle", "churl", "awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "vex", "ken", "jape", "bilk", "quash", "tarry", "waver", "quell", "riven", "shard", "tenet", "whelp"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the smaller count from the larger one: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer word fully before comparing lengths.`, `The difference is always positive because the first word is the longer one.`],
        trick: "Subtract the shorter word's letters.",
        tip: "Compare lengths before you subtract."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
