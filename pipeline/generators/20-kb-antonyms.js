/* ============================================================
   Deep Knowledge KB — English Antonyms
   Word-to-antonym pairs and definitions.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["antonyms"],
  chapter: "English Antonyms — Deep Knowledge Bank",
  tags: ["antonyms", "deep-kb", "english", "words"],
  topics: {

    "Antonym Pairs": [
      {
        kind: "pair", name: "word antonyms", a: "word", b: "antonym",
        note: "Match each word to its closest antonym.",
        pairs: [
          ["abundant", "scarce"], ["accept", "reject"], ["accurate", "inaccurate"], ["adversary", "ally"],
          ["aggressive", "gentle"], ["ancient", "modern"], ["anonymous", "famous"], ["apparent", "obscure"],
          ["arrival", "departure"], ["arrogant", "humble"], ["ascend", "descend"], ["attract", "repel"],
          ["authentic", "fake"], ["barren", "fertile"], ["begin", "end"], ["benevolent", "malevolent"],
          ["brave", "cowardly"], ["bright", "dim"], ["broad", "narrow"], ["candid", "evasive"],
          ["careful", "careless"], ["chaotic", "orderly"], ["cheerful", "gloomy"], ["civilised", "barbaric"],
          ["clarity", "confusion"], ["clever", "stupid"], ["coarse", "fine"], ["collect", "scatter"],
          ["comedy", "tragedy"], ["common", "rare"], ["concise", "verbose"], ["construct", "demolish"],
          ["courage", "fear"], ["courteous", "rude"], ["coward", "hero"], ["cruel", "kind"],
          ["cunning", "honest"], ["curious", "indifferent"], ["dangerous", "safe"], ["daring", "timid"],
          ["deceitful", "truthful"], ["decrease", "increase"], ["deep", "shallow"], ["deficient", "sufficient"],
          ["deliberate", "accidental"], ["demand", "supply"], ["dense", "sparse"], ["descend", "ascend"],
          ["destruction", "creation"], ["diligent", "lazy"], ["diminish", "augment"], ["discreet", "indiscreet"],
          ["dismal", "bright"], ["docile", "rebellious"], ["dull", "sharp"], ["dynamic", "static"],
          ["eager", "reluctant"], ["early", "late"], ["easy", "difficult"], ["efficient", "inefficient"],
          ["eminent", "obscure"], ["enemy", "friend"], ["enormous", "tiny"], ["enthusiasm", "apathy"],
          ["expand", "contract"], ["explicit", "vague"], ["extravagant", "frugal"], ["fail", "succeed"],
          ["faithful", "faithless"], ["famous", "unknown"], ["fast", "slow"], ["feeble", "robust"],
          ["fertile", "barren"], ["flexible", "rigid"], ["foolish", "wise"], ["forget", "remember"],
          ["fragile", "durable"], ["frank", "secretive"], ["freedom", "slavery"], ["frugal", "wasteful"],
          ["generous", "miserly"], ["genuine", "counterfeit"], ["gloomy", "cheerful"], ["gracious", "ungracious"],
          ["grateful", "ungrateful"], ["guilty", "innocent"], ["harsh", "gentle"], ["hasty", "deliberate"],
          ["hate", "love"], ["healthy", "sickly"], ["heavy", "light"], ["honest", "dishonest"],
          ["hostile", "friendly"], ["humble", "proud"], ["ignorant", "knowledgeable"], ["immense", "minute"],
          ["impartial", "biased"], ["impolite", "polite"], ["import", "export"], ["inferior", "superior"],
          ["innocent", "guilty"], ["intelligent", "stupid"], ["joy", "sorrow"], ["justice", "injustice"],
          ["keen", "indifferent"], ["kind", "cruel"], ["lament", "rejoice"], ["lenient", "strict"],
          ["liberty", "captivity"], ["lucid", "obscure"], ["luminous", "dim"], ["magnificent", "mediocre"],
          ["mandatory", "optional"], ["mature", "immature"], ["modest", "boastful"], ["notorious", "renowned"],
          ["obedient", "disobedient"], ["obstinate", "compliant"], ["obvious", "hidden"], ["optimist", "pessimist"],
          ["order", "chaos"], ["patience", "impatience"], ["permanent", "temporary"], ["polite", "rude"],
          ["poor", "wealthy"], ["praise", "criticism"], ["profound", "superficial"], ["prompt", "tardy"],
          ["prudent", "reckless"], ["rapid", "slow"], ["reliable", "unreliable"], ["reluctant", "willing"],
          ["rigid", "flexible"], ["sincere", "insincere"], ["sorrow", "joy"], ["sparse", "dense"],
          ["stern", "gentle"], ["stubborn", "yielding"], ["success", "failure"], ["sufficient", "insufficient"],
          ["superior", "inferior"], ["temporary", "permanent"], ["tenacious", "yielding"], ["thrifty", "wasteful"],
          ["tranquil", "agitated"], ["transparent", "opaque"], ["victory", "defeat"], ["vigilant", "careless"],
          ["virtue", "vice"], ["vivid", "dull"], ["vulnerable", "invulnerable"], ["wary", "reckless"],
          ["wealth", "poverty"], ["wisdom", "folly"], ["witty", "dull"], ["zealous", "indifferent"]
        ],
        trick: "An antonym means the opposite, not the same.",
        tip: "Opposites often share the same root family."
      }
    ],

    "Harder Antonyms": [
      {
        kind: "fact", name: "advanced antonym facts",
        note: "Antonyms of less common English words.",
        facts: [
          ["Which word is an antonym of 'acerbic'?", "Sweet", "Acerbic means sharp and bitter in tone, so sweet is its direct opposite."],
          ["Which word is an antonym of 'adroit'?", "Clumsy", "Adroit means skillful and dexterous, making clumsy its clear opposite."],
          ["Which word is an antonym of 'amiable'?", "Hostile", "Amiable means friendly and pleasant, so hostile is its direct opposite."],
          ["Which word is an antonym of 'bellicose'?", "Peaceful", "Bellicose means warlike and aggressive, so peaceful is its exact opposite."],
          ["Which word is an antonym of 'capricious'?", "Steady", "Capricious means impulsive and unpredictable, making steady its opposite."],
          ["Which word is an antonym of 'deleterious'?", "Beneficial", "Deleterious means harmful, so beneficial is its clear and direct opposite."],
          ["Which word is an antonym of 'ebullient'?", "Gloomy", "Ebullient means full of excited energy, making gloomy its natural opposite."],
          ["Which word is an antonym of 'fastidious'?", "Sloppy", "Fastidious means extremely careful, so sloppy is its exact opposite."],
          ["Which word is an antonym of 'garrulous'?", "Taciturn", "Garrulous means excessively talkative, and taciturn means habitually silent, its opposite."],
          ["Which word is an antonym of 'haughty'?", "Humble", "Haughty means arrogantly proud, so humble is its direct opposite."],
          ["Which word is an antonym of 'ignominious'?", "Honourable", "Ignominious means shameful and disgraceful, so honourable is its opposite."],
          ["Which word is an antonym of 'jocular'?", "Serious", "Jocular means fond of joking, making serious its natural opposite."],
          ["Which word is an antonym of 'languid'?", "Energetic", "Languid means lacking energy, so energetic is its exact opposite."],
          ["Which word is an antonym of 'magnanimous'?", "Petty", "Magnanimous means generous and noble, so petty is its opposite in spirit."],
          ["Which word is an antonym of 'nefarious'?", "Virtuous", "Nefarious means wicked and criminal, so virtuous is its clear opposite."],
          ["Which word is an antonym of 'obfuscate'?", "Clarify", "Obfuscate means to confuse or obscure, making clarify its direct opposite."],
          ["Which word is an antonym of 'parsimonious'?", "Generous", "Parsimonious means excessively stingy, so generous is its exact opposite."],
          ["Which word is an antonym of 'quiescent'?", "Active", "Quiescent means still and inactive, so active is its natural opposite."],
          ["Which word is an antonym of 'recalcitrant'?", "Compliant", "Recalcitrant means stubbornly resistant, so compliant is its opposite."],
          ["Which word is an antonym of 'sagacious'?", "Foolish", "Sagacious means wise and shrewd, making foolish its clear opposite."],
          ["Which word is an antonym of 'tenebrous'?", "Bright", "Tenebrous means dark and gloomy, so bright is its direct opposite."],
          ["Which word is an antonym of 'ubiquitous'?", "Rare", "Ubiquitous means present everywhere, so rare is its exact opposite."],
          ["Which word is an antonym of 'venal'?", "Honest", "Venal means open to bribery, so honest is its clear opposite."],
          ["Which word is an antonym of 'wanton'?", "Restrained", "Wanton means reckless and unprovoked, so restrained is its opposite."],
          ["Which word is an antonym of 'zealous'?", "Apathetic", "Zealous means passionate and devoted, making apathetic its opposite."],
          ["Which word is an antonym of 'alacrity'?", "Reluctance", "Alacrity means eager readiness, so reluctance is its exact opposite."],
          ["Which word is an antonym of 'bucolic'?", "Urban", "Bucolic means relating to the countryside, so urban is its direct opposite."],
          ["Which word is an antonym of 'celestial'?", "Earthly", "Celestial means of the heavens, making earthly its natural opposite."],
          ["Which word is an antonym of 'dearth'?", "Abundance", "Dearth means a serious shortage or lack, so abundance, meaning plenty, is its exact opposite."],
          ["Which word is an antonym of 'ephemeral'?", "Permanent", "Ephemeral means lasting a short time, so permanent is its opposite."],
          ["Which word is an antonym of 'fecund'?", "Barren", "Fecund means highly fertile, so barren is its direct opposite."],
          ["Which word is an antonym of 'gregarious'?", "Unsociable", "Gregarious means fond of company, so unsociable is its clear opposite."],
          ["Which word is an antonym of 'hirsute'?", "Bald", "Hirsute means covered in hair, so bald is its exact opposite."],
          ["Which word is an antonym of 'immutable'?", "Changeable", "Immutable means never changing, so changeable is its direct opposite."],
          ["Which word is an antonym of 'judicious'?", "Imprudent", "Judicious means showing good judgement, so imprudent is its opposite."],
          ["Which word is an antonym of 'kinetic'?", "Static", "Kinetic means relating to motion, so static is its natural opposite."],
          ["Which word is an antonym of 'lugubrious'?", "Cheerful", "Lugubrious means mournfully sad, so cheerful is its clear opposite."],
          ["Which word is an antonym of 'meticulous'?", "Careless", "Meticulous means extremely careful, so careless is its exact opposite."],
          ["Which word is an antonym of 'nadir'?", "Zenith", "Nadir means the lowest point, and zenith, the highest point, is its opposite."],
          ["Which word is an antonym of 'obsequious'?", "Assertive", "Obsequious means fawningly submissive, so assertive is its opposite."],
          ["Which word is an antonym of 'pragmatic'?", "Idealistic", "Pragmatic means practical, so idealistic is its direct opposite."],
          ["Which word is an antonym of 'quixotic'?", "Realistic", "Quixotic means impractically idealistic, so realistic is its opposite."],
          ["Which word is an antonym of 'rancorous'?", "Friendly", "Rancorous means full of bitterness, so friendly is its natural opposite."],
          ["Which word is an antonym of 'salubrious'?", "Unhealthy", "Salubrious means good for health, so unhealthy is its exact opposite."],
          ["Which word is an antonym of 'timorous'?", "Bold", "Timorous means easily frightened, so bold is its clear opposite."],
          ["Which word is an antonym of 'venerable'?", "Disreputable", "Venerable means respected for age and wisdom, so disreputable is its opposite."]
        ],
        trick: "Opposite meaning, not opposite spelling.",
        tip: "Prefixes like un-, in-, im- flip meanings."
      }
    ],

    "Word Lengths and Spelling": [
      {
        kind: "numeric", name: "combined opposite word lengths", difficulty: "medium",
        note: "Adding the letter counts of two antonym words.",
        q: (v) => `Count the letters in "${v.a}" and "${v.b}". How many letters are there in total?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `The word "${v.a}" has ${v.la} letters and "${v.b}" has ${v.lb} letters, so counting both together gives ${v.la} + ${v.lb} = ${v.la + v.lb} letters in total.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "yearn", "abate", "brusque", "cogent", "dawdle", "enigma", "florid", "garner", "hobble", "immure", "junta", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "quash", "rebuke", "sunder", "tarry", "upbraid", "vex", "waver", "yoke", "zephyr", "addle", "bilk", "churl", "dally", "errant", "fettle", "gauche", "hallow", "inure", "jape", "ken", "limpid", "mawkish", "nugatory", "ossify", "purport", "quell", "riven", "shard", "tenet", "umbrage", "verdant", "whelp", "yeoman", "zealot"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count the letters of each word separately, then add: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Punctuation and spaces are never counted as letters.`, `Say both words slowly to catch double letters.`],
        trick: "Add the two letter counts carefully.",
        tip: "Count each word in full before adding."
      },
      {
        kind: "numeric", name: "antonym word length differences", difficulty: "medium",
        note: "Comparing the letter counts of two antonym words.",
        q: (v) => `The word "${v.a}" has how many more letters than "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `Since "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, "${v.a}" is longer by ${v.la} - ${v.lb} = ${v.la - v.lb} letters.`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["alacrity", "belligerent", "capitulate", "dexterity", "ephemeral", "facetious", "fortitude", "hedonism", "iconoclast", "jurisdiction", "magnanimous", "nonchalant", "ostentatious", "pernicious", "quintessential", "recalcitrant", "serendipity", "travesty", "unequivocal", "vindictive", "wistful", "xenophobia", "brusque", "cogent", "enigma", "florid", "garner", "hobble", "immure", "kindle", "lumber", "muster", "nettle", "obviate", "pander", "rebuke", "sunder", "upbraid", "zephyr", "errant", "fettle", "gauche", "hallow", "limpid", "mawkish", "nugatory", "ossify", "purport", "umbrage", "verdant", "yeoman", "zealot", "kaleidoscope", "sycophant", "mendacious", "lachrymose", "pusillanimous"];
          const SHORT = ["addle", "churl", "awe", "bias", "calm", "deft", "dour", "glib", "hazy", "idle", "lull", "meek", "moot", "omen", "pall", "quip", "rapt", "terse", "urge", "vain", "wane", "zeal", "apt", "bland", "brisk", "curt", "drab", "elan", "feint", "gist", "haste", "hue", "iota", "knack", "lax", "mirth", "noir", "overt", "peal", "quirk", "rife", "sulk", "tacit", "unfit", "vapid", "wist", "yarn", "vex", "ken", "jape", "bilk", "quash", "tarry", "waver", "quell", "riven", "shard", "tenet", "whelp"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the shorter count from the longer: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer word first to anchor the difference.`, `The answer stays positive because the first word is longer.`],
        trick: "Subtract the smaller from the larger count.",
        tip: "Check both lengths before subtracting."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
