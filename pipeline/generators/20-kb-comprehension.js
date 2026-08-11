/* ============================================================
   Deep Knowledge KB — English Comprehension
   Sentence-level meaning, context vocabulary, word counts
   and short-passage inference questions.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["comprehension"],
  chapter: "English Comprehension — Deep Knowledge Bank",
  tags: ["comprehension", "deep-kb", "english", "reading"],
  topics: {

    "Context and Meaning": [
      {
        kind: "fact", name: "context word meanings",
        note: "Infer the meaning of a word from its sentence.",
        facts: [
          ["In the sentence 'The arid desert stretched for miles with no water at all', what does 'arid' mean?", "Extremely dry", "The desert has no water, so arid must mean extremely dry or lacking moisture entirely."],
          ["In the sentence 'Her lucid explanation made the topic easy for everyone', what does 'lucid' mean?", "Clear and easy to follow", "Because the explanation made the topic easy, lucid must mean clear and simple to understand."],
          ["In the sentence 'The soldier showed valour by rescuing his comrades under fire', what does 'valour' mean?", "Great courage", "Rescuing comrades under fire requires courage, so valour means bravery in the face of danger."],
          ["In the sentence 'The meeting was adjourned until the following week', what does 'adjourned' mean?", "Postponed or suspended", "A meeting moved to the following week is suspended, so adjourned means postponed."],
          ["In the sentence 'His frugal habits helped him save half his salary', what does 'frugal' mean?", "Careful with money", "Saving half the salary shows money care, so frugal means spending very sparingly."],
          ["In the sentence 'The teacher praised the pupil's diligent preparation for the test', what does 'diligent' mean?", "Hardworking and careful", "Preparation that earns praise is thorough, so diligent means steady and careful effort."],
          ["In the sentence 'The antique vase was fragile, so it was packed in layers of cloth', what does 'fragile' mean?", "Easily broken", "Packing in cloth protects breakable things, so fragile means easily damaged or shattered."],
          ["In the sentence 'His candid remarks upset those who preferred polite silence', what does 'candid' mean?", "Frankly honest", "Honest remarks that upset people who prefer silence indicate that candid means bluntly truthful."],
          ["In the sentence 'The judge remained impartial throughout the long trial', what does 'impartial' mean?", "Fair and unbiased", "A judge who favours neither side is fair, so impartial means neutral and unbiased."],
          ["In the sentence 'The storm caused havoc across the coastal villages', what does 'havoc' mean?", "Widespread destruction", "A storm that disrupts many villages causes destruction, so havoc means great damage and chaos."],
          ["In the sentence 'She gave a succinct answer that covered every point briefly', what does 'succinct' mean?", "Brief but complete", "Covering points briefly means concise, so succinct describes speech that is short yet complete."],
          ["In the sentence 'The committee reached a consensus after three hours of debate', what does 'consensus' mean?", "General agreement", "Reaching a decision after debate implies agreement, so consensus means the group's shared opinion."],
          ["In the sentence 'His tenure as principal lasted ten productive years', what does 'tenure' mean?", "Period of holding office", "Ten years of serving as principal is a period in office, so tenure means the term of holding a post."],
          ["In the sentence 'The road was obstructed by fallen trees after the windstorm', what does 'obstructed' mean?", "Blocked or hindered", "Fallen trees across a road block the way, so obstructed means blocked from passage."],
          ["In the sentence 'The scientist's hypothesis was confirmed by the experiment', what does 'hypothesis' mean?", "A testable proposed explanation", "A claim that experiments confirm is an assumption to test, so hypothesis means a proposed explanation."],
          ["In the sentence 'The river meandered slowly through the green valley', what does 'meandered' mean?", "Followed a winding course", "A river that moves slowly through a valley with turns follows a winding path, so meandered means twisted."],
          ["In the sentence 'The employees were jubilant when the bonus was announced', what does 'jubilant' mean?", "Overwhelmingly joyful", "Bonuses bring joy, so jubilant describes the great happiness and celebration of the staff."],
          ["In the sentence 'The evidence was inconclusive, so the case continued', what does 'inconclusive' mean?", "Not decisive", "Evidence that fails to settle a case is not decisive, so inconclusive means giving no final answer."],
          ["In the sentence 'The child was reluctant to enter the dark room', what does 'reluctant' mean?", "Unwilling and hesitant", "Hesitating to enter darkness shows unwillingness, so reluctant means slow or disinclined to act."],
          ["In the sentence 'The plan was feasible within the given budget and time', what does 'feasible' mean?", "Possible to carry out", "A plan that fits the budget and time can be done, so feasible means workable and practical."],
          ["In the sentence 'The company launched an aggressive marketing campaign', what does 'aggressive' here mean?", "Forceful and determined", "Marketing that pushes hard is forceful, so aggressive here describes bold, assertive effort."],
          ["In the sentence 'The lecture was tedious and the audience grew restless', what does 'tedious' mean?", "Boring and tiresome", "A lecture that makes listeners restless is dull, so tedious means long and wearisome."],
          ["In the sentence 'The mountaineers faced arduous conditions near the summit', what does 'arduous' mean?", "Very demanding and difficult", "Summit conditions that strain climbers are hard, so arduous means requiring great physical effort."],
          ["In the sentence 'The twins bear a striking resemblance to each other', what does 'resemblance' mean?", "Similarity in appearance", "Twins that look alike share appearance, so resemblance means a likeness between persons or things."],
          ["In the sentence 'The speaker's voice was audible even at the back of the hall', what does 'audible' mean?", "Able to be heard", "A voice reaching the back of a hall can be heard, so audible means loud enough to hear."],
          ["In the sentence 'The company's profits dwindled during the recession', what does 'dwindled' mean?", "Gradually decreased", "Profits falling during hard times shrink, so dwindled means to become steadily smaller."],
          ["In the sentence 'The witness's account was coherent and matched the facts', what does 'coherent' mean?", "Logical and well organised", "An account matching the facts holds together, so coherent means clear, connected and logical."],
          ["In the sentence 'The child was bewildered by the complicated instructions', what does 'bewildered' mean?", "Confused and puzzled", "Complicated instructions that cannot be followed leave a person confused, so bewildered means puzzled."],
          ["In the sentence 'The firm hired an eminent lawyer for the case', what does 'eminent' mean?", "Famous and distinguished", "Hiring a lawyer for a big case suggests renown, so eminent means highly respected and notable."],
          ["In the sentence 'The shelf collapsed under the weight of the books', what does 'collapsed' mean?", "Fell down suddenly", "A shelf that fails under weight falls suddenly, so collapsed means caved in or gave way."],
          ["In the sentence 'The river was shallow enough to wade across', what does 'shallow' mean?", "Not deep", "Wading across requires low depth, so shallow means having little depth."],
          ["In the sentence 'The plan was abandoned due to lack of funds', what does 'abandoned' mean?", "Given up completely", "Lack of funds ends a plan, so abandoned means stopped and left without further effort."],
          ["In the sentence 'The room was spacious with large windows', what does 'spacious' mean?", "Having plenty of room", "Large windows and easy movement suggest ample space, so spacious means wide and roomy."],
          ["In the sentence 'The driver was cautious on the slippery road', what does 'cautious' mean?", "Careful to avoid danger", "Driving carefully on a slippery road shows alertness, so cautious means wary and careful."],
          ["In the sentence 'The singer's voice was melodious and soothing', what does 'melodious' mean?", "Sweet sounding", "A soothing voice is pleasant to hear, so melodious means tuneful and musical."],
          ["In the sentence 'The troops advanced cautiously through the jungle', what does 'advanced' here mean?", "Moved forward", "Troops moving through terrain proceed forward, so advanced here means progressed ahead."],
          ["In the sentence 'The announcement was greeted with unanimous applause', what does 'unanimous' mean?", "Complete agreement by all", "Everyone clapping together shows one shared response, so unanimous means agreed by all without exception."],
          ["In the sentence 'The climate of the region is temperate and pleasant', what does 'temperate' mean?", "Moderate, not extreme", "A pleasant climate avoids extremes, so temperate means mild and moderate in nature."],
          ["In the sentence 'The detective scrutinised every piece of evidence', what does 'scrutinised' mean?", "Examined very closely", "Examining evidence with care means inspecting it thoroughly, so scrutinised means studied minutely."],
          ["In the sentence 'The news caused widespread consternation among the public', what does 'consternation' mean?", "Anxiety and dismay", "Disturbing news fills people with alarm, so consternation means shocked worry and confusion."]
        ],
        trick: "Read the whole sentence for clue words.",
        tip: "Context clues often follow 'so' and 'because'."
      },
      {
        kind: "pair", name: "phrase paraphrases", a: "phrase", b: "paraphrase",
        note: "Match each sentence phrase to its paraphrase.",
        pairs: [
          ["due to heavy rainfall", "because of very heavy rain"], ["in spite of the delay", "even though it was late"],
          ["on behalf of the team", "representing the whole team"], ["as a result of the merger", "because the companies combined"],
          ["in the event of an emergency", "if an emergency happens"], ["by means of technology", "through the use of technology"],
          ["with regard to your request", "concerning what you asked"], ["in accordance with the rules", "following the rules exactly"],
          ["at the expense of quality", "while sacrificing quality"], ["under no circumstances", "never at all"],
          ["in the long run", "over an extended period"], ["at the eleventh hour", "at the very last moment"],
          ["by and large", "mostly in general"], ["for the time being", "temporarily for now"],
          ["in a nutshell", "in the fewest words"], ["on the whole", "considering everything"],
          ["prior to the meeting", "before the meeting took place"], ["subsequent to the decision", "after the decision was made"],
          ["in the vicinity of the park", "near the park"], ["out of the question", "impossible to consider"],
          ["with the exception of Ali", "except for Ali"], ["beyond the scope of this study", "outside what this study covers"],
          ["on the verge of collapse", "about to fall apart"], ["at the peak of his career", "at his career's highest point"],
          ["in the light of new evidence", "considering the new evidence"], ["in terms of cost", "as far as cost is concerned"],
          ["regardless of the outcome", "no matter what the result is"], ["in lieu of payment", "instead of being paid"],
          ["by virtue of his position", "because of his position"], ["in the course of the year", "during the year"],
          ["to a certain extent", "partly but not fully"], ["from time to time", "occasionally"],
          ["in excess of the limit", "more than the allowed amount"], ["in advance of the deadline", "before the deadline"],
          ["on account of the weather", "because of the weather"], ["per se", "by itself alone"],
          ["vis a vis", "in relation to"], ["in the interim", "during the meantime"],
          ["in retrospect", "looking back"], ["in the final analysis", "after all things are considered"]
        ],
        trick: "Match the idea, not just single words.",
        tip: "Paraphrases keep the meaning, change the words."
      }
    ],

    "Word and Passage Skills": [
      {
        kind: "numeric", name: "sentence word counts", difficulty: "easy",
        note: "Counting words inside short sentences.",
        q: (v) => `How many words are in this sentence: "${v.s}"?`,
        a: (v) => `${v.n}`,
        e: (v) => `The sentence "${v.s}" contains ${v.n} words, counting each group of letters separated by spaces.`,
        distract: (v) => [`${v.n + 1}`, `${v.n - 1 >= 1 ? v.n - 1 : v.n + 2}`, `${v.n + 2}`, `${v.n - 2 >= 1 ? v.n - 2 : v.n + 3}`, `${v.n + 3}`],
        vals: (rng) => {
          const NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Bilal", "Ayesha", "Hamza", "Zainab", "Usman", "Mariam"];
          const PLACES = ["park", "market", "school", "bazaar", "garden", "library", "hospital", "playground"];
          const T = [
            (n, p) => `${n} went to the ${p} yesterday morning.`,
            (n, p) => `${n} bought fresh fruit from the ${p}.`,
            (n, p) => `${n} is waiting for a friend near the ${p}.`,
            (n, p) => `${n} will meet the whole class at the ${p}.`,
            (n, p) => `${n} visited the old ${p} with the family.`,
            (n, p) => `${n} loves to walk around the ${p} after school.`,
            (n, p) => `${n} saw a strange bird outside the ${p}.`,
            (n, p) => `${n} helped his mother carry bags from the ${p}.`,
            (n, p) => `${n} reads a book every evening near the ${p}.`,
            (n, p) => `${n} called everyone to gather near the ${p}.`
          ];
          const t = T[Math.floor(rng() * T.length)];
          const s = t(NAMES[Math.floor(rng() * NAMES.length)], PLACES[Math.floor(rng() * PLACES.length)]);
          return { s, n: s.trim().split(/\s+/).length };
        },
        whyWrong: (v) => [`Count every separate word, including short words like 'a', 'to' and 'the'.`],
        trick: "every word counts, even 'a' and 'the'.",
        tip: "Say the sentence aloud and count the words."
      },
      {
        kind: "scenario", name: "passage inference",
        note: "Short passages with inference questions.",
        facts: [
          ["Passage: 'The train left the station at dawn, carrying farmers to the city market. By noon it would return with goods and news from the capital.' What is the train's main purpose in the passage?", "To carry people and goods between the village and the city", "The train connects the farmers to the city market and brings back goods, so its purpose is transport between the two places."],
          ["Passage: 'Rain had not fallen for months. The wells ran dry and the crops turned yellow in the fields.' What is the passage mainly describing?", "The effects of a long drought", "Dry wells and yellow crops after months without rain describe the consequences of a drought."],
          ["Passage: 'She opened the envelope with trembling hands. Inside lay the letter she had awaited for a year.' How does the person most likely feel?", "Nervous but hopeful", "Trembling hands show nervousness, while a year of waiting for the letter suggests strong hope."],
          ["Passage: 'The old bridge swayed in the wind, its wooden planks creaking loudly as vehicles passed over it.' What does the passage suggest about the bridge?", "It is old and not fully safe", "Swaying and creaking planks suggest the bridge is old, worn and potentially unsafe."],
          ["Passage: 'The baker wakes at three in the morning, lights the oven and kneads dough before the city stirs.' Which quality does the baker most clearly show?", "Dedication to his work", "Waking before the city to prepare bread shows dedication and commitment to the craft."],
          ["Passage: 'The river flooded the low fields, but the village on the hill remained dry and safe.' What is the main point of the passage?", "The flood spared the higher village", "The low fields flooded while the hilltop village stayed dry, so the point is that high ground was safe."],
          ["Passage: 'The two brothers argued over the land for years. In the end they divided it exactly in half and never spoke again.' What happened to the brothers?", "They split the land but ended their relationship", "They divided the land equally yet the quarrel destroyed their bond, so they parted ways."],
          ["Passage: 'Bees visit flower after flower, carrying pollen from one bloom to the next, and farmers rely on them for fruit.' What role do bees play according to the passage?", "They help plants produce fruit", "By carrying pollen between flowers, bees enable fruiting, which is why farmers rely on them."],
          ["Passage: 'The manuscript was found in a sealed chest, its pages yellow with age, written in a script no one could read.' What is the main difficulty described?", "The writing cannot be deciphered", "The ancient script defeats every reader, so the difficulty lies in reading the unknown script."],
          ["Passage: 'Tourists crowd the ancient fort every weekend, while the surrounding bazaars hum with trade.' What does the passage suggest about the fort's area?", "It is busy and commercially active", "Crowded tourists and humming bazaars indicate the area is lively and full of commerce."],
          ["Passage: 'The goalkeeper saved three penalties and the crowd roared his name after the final whistle.' How does the crowd most likely view the goalkeeper?", "As the hero of the match", "Roaring his name after his saves shows the crowd regards him as the match's hero."],
          ["Passage: 'Night fell quickly in the valley, and the travellers built a fire to keep the cold away.' Why did the travellers light a fire?", "To stay warm against the cold", "The cold of the falling night is the reason they build a fire for warmth."],
          ["Passage: 'The factory whistle blows at noon, and hundreds of workers pour out of the gates for their break.' What does the passage describe?", "The routine at a factory", "The noon whistle and the stream of workers describe the daily routine of a factory."],
          ["Passage: 'Clouds gathered, the wind picked up, and the fishermen hurried to haul in their nets.' What are the fishermen most likely expecting?", "A storm", "Gathering clouds and rising wind are classic signs of an approaching storm, so they hurry."],
          ["Passage: 'The student reviewed her notes every evening, solved extra problems at the weekend and topped the class.' What explains her success most clearly?", "Consistent hard work", "Evening reviews and weekend practice show that steady, consistent effort brought her success."]
        ],
        trick: "Answer from the passage, not outside facts.",
        tip: "Skim the question before reading the passage."
      }
    ],

    "Passage Word Skills": [
      {
        kind: "numeric", name: "passage word letter totals", difficulty: "medium",
        note: "Adding the letter counts of two passage words.",
        q: (v) => `A passage contains the words "${v.a}" and "${v.b}". How many letters do they have together?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `The word "${v.a}" has ${v.la} letters and "${v.b}" has ${v.lb} letters, so the two words together carry ${v.la} + ${v.lb} = ${v.la + v.lb} letters.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["ball", "bank", "barn", "bell", "bird", "boat", "bone", "book", "boot", "boss", "bowl", "brick", "bush", "camp", "cart", "cave", "city", "clay", "club", "coal", "coat", "cook", "corn", "crop", "dawn", "deck", "desk", "dish", "dock", "door", "dust", "farm", "fire", "fish", "flag", "folk", "foot", "fort", "fuel", "game", "gate", "gift", "goat", "gold", "gulf", "hall", "hand", "herd", "hill", "hint", "hole", "hunt", "iron", "jail", "kite", "lane", "lava", "leaf", "lens", "lime", "lord", "lump", "mall", "map", "meal", "meat", "mill", "mine", "mist", "moat", "mole", "moss", "mud", "mule", "nail", "nest", "oak", "ore", "owl", "palm", "park", "path", "paw", "pear", "peat", "pile", "pine", "pond", "port", "post", "raft", "rake", "reed", "reef", "rice", "ridge", "rope", "rose", "ruin", "sack", "sail", "sand", "seed", "shed", "silk", "silt", "soil", "spear", "spine", "stem", "stone", "stool", "suit", "tide", "tile", "tomb", "tool", "town", "trap", "trek", "trip", "turf", "urn", "vale", "vine", "wagon", "wheat", "wool", "yarn", "yoke", "anchor", "autumn", "basket", "beacon", "blossom", "boulder", "breeze", "brook", "bundle", "butter", "candle", "canvas", "castle", "cattle", "cavern", "channel", "chapter", "cherry", "chimney", "circle", "climate", "cluster", "coast", "collar", "compass", "cottage", "courage", "cradle", "cricket", "crystal", "curtain", "cushion", "cyclone", "daffodil", "danger", "desert", "diamond", "dinner", "donkey", "dragon", "drawer", "drizzle", "echo", "elephant", "engine", "family", "feather", "fence", "finger", "flower", "forest", "fountain", "freedom", "garden", "garlic", "giraffe", "glacier", "gravel", "harbour", "harvest", "heaven", "helmet", "horizon", "journey", "jungle", "kitchen", "ladder", "lantern", "library", "lightning", "marigold", "meadow", "melody", "memory", "mirror", "monsoon", "mountain", "morning", "mystery", "nature", "needle", "ocean", "orchard", "oyster", "palace", "pasture", "pattern", "pepper", "picnic", "planet", "pocket", "prairie", "present", "pumpkin", "rainbow", "reindeer", "season", "shadow", "shelter", "silver", "skylark", "spider", "squirrel", "staircase", "station", "stranger", "stream", "sunrise", "sunset", "temple", "thunder", "treasure", "umbrella", "valley", "village", "waterfall", "weather", "willow", "winter", "wonder"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count each word's letters separately, then add the totals: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Spaces and punctuation in the passage are not letters.`, `Read the passage words carefully before counting.`],
        trick: "Add the two passage word lengths.",
        tip: "Count each word fully before adding."
      },
      {
        kind: "numeric", name: "passage word length differences", difficulty: "medium",
        note: "Comparing the letter counts of two passage words.",
        q: (v) => `In a passage, how many more letters does "${v.a}" have than "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `The word "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so "${v.a}" is longer by ${v.la} - ${v.lb} = ${v.la - v.lb} letters.`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["anchor", "autumn", "basket", "beacon", "blossom", "boulder", "breeze", "bundle", "butter", "candle", "canvas", "castle", "cattle", "cavern", "channel", "chapter", "cherry", "chimney", "circle", "climate", "cluster", "collar", "compass", "cottage", "courage", "cradle", "cricket", "crystal", "curtain", "cushion", "cyclone", "daffodil", "danger", "desert", "diamond", "dinner", "donkey", "dragon", "drawer", "drizzle", "elephant", "engine", "family", "feather", "finger", "flower", "forest", "fountain", "freedom", "garden", "garlic", "giraffe", "glacier", "gravel", "harbour", "harvest", "heaven", "helmet", "horizon", "journey", "jungle", "kitchen", "ladder", "lantern", "library", "lightning", "marigold", "meadow", "melody", "memory", "mirror", "monsoon", "mountain", "morning", "mystery", "nature", "needle", "orchard", "oyster", "palace", "pasture", "pattern", "pepper", "picnic", "planet", "pocket", "prairie", "present", "pumpkin", "rainbow", "reindeer", "season", "shadow", "shelter", "silver", "skylark", "spider", "squirrel", "staircase", "station", "stranger", "stream", "sunrise", "sunset", "temple", "thunder", "treasure", "umbrella", "valley", "village", "waterfall", "weather", "willow", "winter", "wonder"];
          const SHORT = ["ball", "bank", "barn", "bell", "bird", "boat", "bone", "book", "boot", "boss", "bowl", "brick", "bush", "camp", "cart", "cave", "city", "clay", "club", "coal", "coat", "cook", "corn", "crop", "dawn", "deck", "desk", "dish", "dock", "door", "dust", "farm", "fire", "fish", "flag", "folk", "foot", "fort", "fuel", "game", "gate", "gift", "goat", "gold", "gulf", "hall", "hand", "herd", "hill", "hint", "hole", "hunt", "iron", "jail", "kite", "lane", "lava", "leaf", "lens", "lime", "lord", "lump", "mall", "map", "meal", "meat", "mill", "mine", "mist", "moat", "mole", "moss", "mud", "mule", "nail", "nest", "oak", "ore", "owl", "palm", "park", "path", "paw", "pear", "peat", "pile", "pine", "pond", "port", "post", "raft", "rake", "reed", "reef", "rice", "ridge", "rope", "rose", "ruin", "sack", "sail", "sand", "seed", "shed", "silk", "silt", "soil", "spear", "spine", "stem", "stone", "stool", "suit", "tide", "tile", "tomb", "tool", "town", "trap", "trek", "trip", "turf", "urn", "vale", "vine", "wagon", "wheat", "wool", "yarn", "yoke"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the shorter count from the longer: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer word first to anchor the difference.`, `The first word is always longer, so the difference is positive.`],
        trick: "Subtract the smaller passage word count.",
        tip: "Compare lengths before subtracting."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
