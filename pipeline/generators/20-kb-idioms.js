/* ============================================================
   Deep Knowledge KB — English Idioms
   Idiom-to-meaning pairs, usage and true/false checks.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["idioms"],
  chapter: "English Idioms — Deep Knowledge Bank",
  tags: ["idioms", "deep-kb", "english", "phrases"],
  topics: {

    "Idiom Meanings": [
      {
        kind: "pair", name: "idiom meanings", a: "idiom", b: "meaning",
        note: "Match each idiom to its real meaning.",
        pairs: [
          ["a blessing in disguise", "a hidden advantage in misfortune"], ["a piece of cake", "something very easy"],
          ["a slap on the wrist", "a very mild punishment"], ["add insult to injury", "make a bad situation worse"],
          ["against the clock", "working under time pressure"], ["all ears", "listening very attentively"],
          ["an arm and a leg", "a very high price"], ["at the drop of a hat", "immediately without hesitation"],
          ["back to square one", "starting over from the beginning"], ["beat around the bush", "avoid the main point"],
          ["behind someone's back", "without someone's knowledge"], ["bend over backwards", "try extremely hard to help"],
          ["bite the bullet", "face a difficulty bravely"], ["break the ice", "start a conversation to reduce tension"],
          ["burn the midnight oil", "work late into the night"], ["call it a day", "stop working for the day"],
          ["cry over spilled milk", "regret what cannot be undone"], ["cut corners", "do something poorly to save time or money"],
          ["devil's advocate", "arguing the opposite side on purpose"], ["don't judge a book by its cover", "appearances can be misleading"],
          ["down to the wire", "decided at the very last moment"], ["every cloud has a silver lining", "there is hope in every misfortune"],
          ["feel under the weather", "feel slightly ill"], ["fit as a fiddle", "in very good health"],
          ["get out of hand", "become uncontrollable"], ["give the benefit of the doubt", "trust someone despite doubts"],
          ["go the extra mile", "make more effort than expected"], ["hit the nail on the head", "be exactly right"],
          ["hit the sack", "go to bed"], ["in hot water", "in serious trouble"],
          ["it costs an arm and a leg", "it is extremely expensive"], ["keep an eye on", "watch carefully"],
          ["kill two birds with one stone", "achieve two goals at once"], ["let the cat out of the bag", "reveal a secret"],
          ["miss the boat", "lose an opportunity"], ["once in a blue moon", "very rarely"],
          ["on cloud nine", "extremely happy"], ["out of the blue", "unexpectedly"],
          ["over the moon", "delighted and thrilled"], ["play it by ear", "decide as events unfold"],
          ["pull someone's leg", "tease or joke with someone"], ["pull yourself together", "calm down and control your feelings"],
          ["put yourself in someone's shoes", "imagine another's situation"], ["raining cats and dogs", "raining very heavily"],
          ["ring a bell", "sound familiar"], ["see eye to eye", "agree completely"],
          ["sit on the fence", "avoid taking sides"], ["spill the beans", "reveal secret information"],
          ["steal someone's thunder", "take credit for another's idea"], ["take with a grain of salt", "do not fully believe"],
          ["the ball is in your court", "it is your turn to act"], ["the best of both worlds", "all the advantages"],
          ["the last straw", "the final problem that breaks patience"], ["throw in the towel", "admit defeat"],
          ["under the weather", "feeling unwell"], ["up in the air", "uncertain or undecided"],
          ["when pigs fly", "never"], ["word of mouth", "information spread by talking"],
          ["you can't judge a book by its cover", "appearances deceive"], ["a penny for your thoughts", "asking what someone is thinking"],
          ["a wild goose chase", "a hopeless search"], ["bite off more than you can chew", "take on too much"],
          ["burn bridges", "destroy relationships permanently"], ["cost a fortune", "be very expensive"],
          ["crack the code", "solve a difficult puzzle"], ["elbow room", "space to move freely"],
          ["face the music", "accept the consequences"], ["get cold feet", "become nervous before acting"],
          ["give someone a cold shoulder", "ignore someone deliberately"], ["in a nutshell", "in the fewest words"],
          ["keep your chin up", "stay cheerful in difficulties"], ["let sleeping dogs lie", "do not disturb old problems"],
          ["make a mountain out of a molehill", "exaggerate a small problem"], ["on the same page", "in full agreement"],
          ["put all your eggs in one basket", "risk everything on one plan"], ["read between the lines", "find hidden meaning"],
          ["save face", "avoid embarrassment"], ["speak of the devil", "the person just mentioned appears"],
          ["take it with a grain of salt", "be skeptical about it"], ["the tip of the iceberg", "the visible part of a bigger problem"],
          ["turn a blind eye", "deliberately ignore"], ["twist someone's arm", "pressure someone to agree"]
        ],
        trick: "Idioms never mean exactly what the words say.",
        tip: "Learn idioms in sentences, not in isolation."
      }
    ],

    "Idiom Facts": [
      {
        kind: "fact", name: "idiom definition facts",
        note: "Definitions and usage of common idioms.",
        facts: [
          ["What does the idiom 'a blessing in disguise' mean?", "A hidden benefit in trouble", "A blessing in disguise is a misfortune that turns out well, so the harm hides a hidden benefit."],
          ["What does the idiom 'once in a blue moon' mean?", "Very rarely", "Once in a blue moon means almost never, because blue moons are rare celestial events."],
          ["What does the idiom 'break the ice' mean?", "Ease a tense beginning", "Breaking the ice means making people comfortable at a first meeting by starting easy conversation."],
          ["What does the idiom 'hit the nail on the head' mean?", "To be exactly right", "Hitting the nail on the head means stating precisely the true point without any error."],
          ["What does the idiom 'let the cat out of the bag' mean?", "To reveal a secret", "Letting the cat out of the bag means carelessly revealing information that was meant to stay secret."],
          ["What does the idiom 'under the weather' mean?", "Feeling slightly unwell", "Being under the weather means feeling a little ill, as if the weather inside has turned bad."],
          ["What does the idiom 'spill the beans' mean?", "To reveal confidential information", "Spilling the beans means disclosing a secret, often by accident, before the right time."],
          ["What does the idiom 'a piece of cake' mean?", "Something very easy", "A piece of cake describes a task so easy that it feels like eating a slice of cake."],
          ["What does the idiom 'beat around the bush' mean?", "Avoid the main subject", "Beating around the bush means talking about minor details to avoid the central issue."],
          ["What does the idiom 'see eye to eye' mean?", "To agree completely", "Seeing eye to eye means two people share the same opinion and agree fully on a matter."],
          ["What does the idiom 'burn the midnight oil' mean?", "Work very late at night", "Burning the midnight oil means studying or working late into the night, often before exams."],
          ["What does the idiom 'kill two birds with one stone' mean?", "Achieve two goals at once", "Killing two birds with one stone means one action successfully accomplishes two separate aims."],
          ["What does the idiom 'in hot water' mean?", "In serious trouble", "Being in hot water means being in trouble, usually because of a mistake or misbehaviour."],
          ["What does the idiom 'raining cats and dogs' mean?", "Raining very heavily", "Raining cats and dogs is a vivid idiom for an extremely heavy downpour of rain."],
          ["What does the idiom 'on cloud nine' mean?", "Extremely happy", "Being on cloud nine means being blissfully happy, as if floating high above the world."],
          ["What does the idiom 'call it a day' mean?", "Stop work for now", "Calling it a day means deciding to stop the day's work because it is finished or late."],
          ["What does the idiom 'the last straw' mean?", "The final unbearable problem", "The last straw is the final small problem that makes a person lose patience completely."],
          ["What does the idiom 'out of the blue' mean?", "Completely unexpectedly", "Out of the blue describes something that happens suddenly, without any warning at all."],
          ["What does the idiom 'an arm and a leg' mean?", "A very high price", "Costing an arm and a leg means being extremely expensive, far beyond reasonable value."],
          ["What does the idiom 'when pigs fly' mean?", "Never", "When pigs fly is a humorous idiom meaning something will never happen under any circumstances."],
          ["What does the idiom 'cut corners' mean?", "Do a poor job to save effort", "Cutting corners means skipping essential steps to save time or money, lowering quality."],
          ["What does the idiom 'get cold feet' mean?", "Become nervous before acting", "Getting cold feet means losing courage at the last moment, right before doing something."],
          ["What does the idiom 'up in the air' mean?", "Uncertain or undecided", "Being up in the air means a matter is unresolved and no decision has been made yet."],
          ["What does the idiom 'read between the lines' mean?", "Find the hidden meaning", "Reading between the lines means understanding the unstated message behind the words."],
          ["What does the idiom 'a wild goose chase' mean?", "A hopeless search", "A wild goose chase is a useless pursuit that can never succeed, wasting time and effort."],
          ["What does the idiom 'the ball is in your court' mean?", "It is your turn to act", "The ball is in your court means the next move belongs to you, continuing the game metaphor."],
          ["What does the idiom 'speak of the devil' mean?", "Mention someone who then appears", "Speak of the devil is said when the person being talked about suddenly arrives on the scene."],
          ["What does the idiom 'every cloud has a silver lining' mean?", "Hope exists in every bad situation", "Every cloud has a silver lining means every misfortune contains some good or hopeful aspect."],
          ["What does the idiom 'take with a grain of salt' mean?", "Do not believe fully", "Taking something with a grain of salt means listening skeptically and not fully trusting it."],
          ["What does the idiom 'give someone the cold shoulder' mean?", "Ignore someone deliberately", "Giving the cold shoulder means deliberately ignoring or snubbing a person in company."],
          ["What does the idiom 'face the music' mean?", "Accept the consequences", "Facing the music means accepting the unpleasant results of one's own actions bravely."],
          ["What does the idiom 'the tip of the iceberg' mean?", "The small visible part of a big problem", "The tip of the iceberg is the tiny visible portion of a much larger hidden problem."],
          ["What does the idiom 'make a mountain out of a molehill' mean?", "Exaggerate a small problem", "Making a mountain out of a molehill means treating a tiny issue as if it were enormous."],
          ["What does the idiom 'keep your chin up' mean?", "Stay cheerful in hardship", "Keeping your chin up means remaining positive and hopeful even when facing difficulties."],
          ["What does the idiom 'cost a fortune' mean?", "Be extremely expensive", "Costing a fortune means having a very high price, far more than one would normally pay."],
          ["What does the idiom 'put all your eggs in one basket' mean?", "Risk everything on one plan", "Putting all eggs in one basket means depending entirely on a single risky plan or asset."],
          ["What does the idiom 'twist someone's arm' mean?", "Pressure someone to agree", "Twisting someone's arm means persuading or pressuring someone to do something unwillingly."],
          ["What does the idiom 'save face' mean?", "Avoid public embarrassment", "Saving face means protecting one's dignity by avoiding humiliation in front of others."],
          ["What does the idiom 'elbow room' mean?", "Space to move freely", "Elbow room means enough physical space to move comfortably without crowding or restriction."],
          ["What does the idiom 'a penny for your thoughts' mean?", "Ask what someone is thinking", "A penny for your thoughts is a friendly way of asking a quiet person what they are thinking."],
          ["What does the idiom 'in a nutshell' mean?", "In the fewest possible words", "In a nutshell means stating the essence of something briefly, as a nutshell holds the kernel."],
          ["What does the idiom 'let sleeping dogs lie' mean?", "Do not reopen old disputes", "Letting sleeping dogs lie means avoiding actions that might revive old, settled problems."],
          ["What does the idiom 'play it by ear' mean?", "Decide as events unfold", "Playing it by ear means acting flexibly, without a fixed plan, adapting to situations as they arise."],
          ["What does the idiom 'bite off more than you can chew' mean?", "Take on more than one can manage", "Biting off more than you can chew means accepting more work or responsibility than possible."],
          ["What does the idiom 'a slap on the wrist' mean?", "A very mild punishment", "A slap on the wrist is a light punishment that hardly deters the offender from repeating it."]
        ],
        trick: "Guess from context before looking up idioms.",
        tip: "Idiom tests reward memorised meanings."
      },
      {
        kind: "tf", name: "English idioms",
        note: "Separate true idiom meanings from false ones.",
        statements: [
          ["To 'bite the bullet' means to face a painful situation bravely.", "To 'bite the bullet' means to eat something very quickly."],
          ["To 'hit the sack' means to go to bed.", "To 'hit the sack' means to punch a bag of grain."],
          ["To 'pull someone's leg' means to tease or joke with someone.", "To 'pull someone's leg' means to drag a person backwards."],
          ["To 'sit on the fence' means to avoid taking sides.", "To 'sit on the fence' means to rest after climbing."],
          ["To 'ring a bell' means to sound familiar.", "To 'ring a bell' means to make a phone call."],
          ["To 'steal someone's thunder' means to take credit for another's idea.", "To 'steal someone's thunder' means to rob during a storm."],
          ["To 'throw in the towel' means to admit defeat.", "To 'throw in the towel' means to wash clothes quickly."],
          ["To 'get out of hand' means to become uncontrollable.", "To 'get out of hand' means to remove a glove."],
          ["To 'go the extra mile' means to make more effort than expected.", "To 'go the extra mile' means to travel a long distance daily."],
          ["To 'keep an eye on' means to watch carefully.", "To 'keep an eye on' means to store a spare eyeball."],
          ["To 'miss the boat' means to lose an opportunity.", "To 'miss the boat' means to fail at sailing."],
          ["To 'burn bridges' means to destroy relationships permanently.", "To 'burn bridges' means to light wooden crossings on fire."],
          ["To 'face the music' means to accept the consequences.", "To 'face the music' means to attend a concert."],
          ["To 'turn a blind eye' means to deliberately ignore something.", "To 'turn a blind eye' means to wink at a friend."],
          ["To 'speak of the devil' is said when the person mentioned arrives.", "To 'speak of the devil' is a prayer against evil spirits."],
          ["To 'bend over backwards' means to try extremely hard to help.", "To 'bend over backwards' means to exercise the spine."],
          ["To 'crack the code' means to solve a difficult puzzle.", "To 'crack the code' means to break a computer screen."],
          ["To 'give the benefit of the doubt' means to trust someone despite doubts.", "To 'give the benefit of the doubt' means to donate money to charity."],
          ["To 'feel under the weather' means to feel slightly ill.", "To 'feel under the weather' means to stand in the rain."],
          ["To 'see eye to eye' means to agree completely.", "To 'see eye to eye' means to stare at each other's eyes."],
          ["To 'play it by ear' means to decide as events unfold.", "To 'play it by ear' means to hum a song loudly."],
          ["To 'put yourself in someone's shoes' means to imagine their situation.", "To 'put yourself in someone's shoes' means to borrow footwear."],
          ["To 'add insult to injury' means to make a bad situation worse.", "To 'add insult to injury' means to apologise for a wound."],
          ["To 'call it a day' means to stop working for the day.", "To 'call it a day' means to phone the office every morning."],
          ["To 'cost an arm and a leg' means to be extremely expensive.", "To 'cost an arm and a leg' means to pay in body parts."]
        ],
        trick: "Reject the literal reading of every idiom.",
        tip: "True meanings are figurative, not literal."
      }
    ],

    "Idiom Words and Lengths": [
      {
        kind: "numeric", name: "idiom word letter totals", difficulty: "medium",
        note: "Adding the letter counts of two idiom words.",
        q: (v) => `How many letters in total do the words "${v.a}" and "${v.b}" contain?`,
        a: (v) => `${v.la + v.lb}`,
        e: (v) => `The idiom word "${v.a}" contains ${v.la} letters and "${v.b}" contains ${v.lb} letters, so the two together contain ${v.la} + ${v.lb} = ${v.la + v.lb} letters in total.`,
        distract: (v) => [v.la + v.lb + 1, v.la + v.lb + 2, v.la + v.lb + 3, v.la + v.lb - 1, v.la + v.lb - 2, v.la + v.lb - 3].filter((x) => x >= 1),
        vals: (rng) => {
          const W = ["arm", "bag", "bed", "bell", "bird", "boat", "bone", "book", "boot", "bread", "brick", "card", "cat", "coat", "coin", "cow", "cup", "date", "deck", "desk", "dish", "dog", "door", "drum", "duck", "ear", "egg", "eye", "face", "fish", "flag", "foot", "fork", "gate", "gift", "goat", "gold", "goose", "grass", "grave", "gum", "gun", "hair", "hand", "hat", "hawk", "hay", "head", "heart", "heel", "hen", "hill", "hole", "honey", "hook", "horn", "horse", "hour", "house", "ice", "iron", "jar", "jaw", "key", "king", "knee", "knot", "lake", "lamp", "land", "lane", "leaf", "leg", "lion", "lip", "lock", "log", "lord", "love", "luck", "map", "mask", "meal", "meat", "mile", "milk", "mind", "moon", "moss", "moth", "mouse", "mouth", "mud", "nail", "neck", "nest", "net", "nose", "note", "oil", "owl", "palm", "pan", "park", "path", "paw", "pea", "pen", "penny", "pie", "pig", "pin", "pipe", "pit", "pond", "pool", "post", "pot", "purse", "queen", "rail", "rain", "rat", "ray", "ring", "river", "road", "rock", "rod", "roof", "room", "root", "rope", "rose", "rug", "sack", "sail", "salt", "sand", "saw", "seed", "shade", "sheep", "sheet", "shell", "ship", "shoe", "shop", "shore", "silk", "sink", "sky", "slate", "snake", "soap", "sock", "soil", "song", "soup", "spark", "spoon", "spot", "spring", "stair", "stamp", "star", "stem", "step", "stick", "stone", "stool", "storm", "stove", "straw", "stream", "street", "string", "sugar", "sun", "swan", "sweat", "swing", "sword", "table", "tail", "tape", "tea", "team", "tear", "tent", "thread", "throne", "ticket", "tide", "tiger", "tile", "time", "tin", "tip", "toe", "tool", "tooth", "torch", "tower", "town", "toy", "track", "trail", "train", "trap", "tray", "tree", "trip", "trunk", "tube", "tune", "tunnel", "turn", "turtle", "twin", "veil", "vein", "verse", "vest", "view", "vine", "voice", "wagon", "wall", "wand", "war", "ward", "wave", "wax", "web", "weed", "week", "wheel", "whip", "widow", "wife", "wind", "window", "wine", "wing", "wire", "wish", "wolf", "wood", "wool", "word", "world", "worm", "wound", "wrist", "yard", "yarn", "year", "zone", "bucket", "candle", "carpet", "castle", "cherry", "chimney", "circle", "cloud", "collar", "cottage", "crystal", "curtain", "cushion", "danger", "diamond", "dinner", "doctor", "donkey", "dragon", "drawer", "dream", "dress", "driver", "eagle", "elephant", "engine", "family", "feather", "fence", "field", "finger", "flower", "forest", "fountain", "garden", "garlic", "ghost", "giant", "ginger", "glasses", "hammer", "harbour", "harvest", "heaven", "helmet", "hurdle", "island", "jacket", "jungle", "kitten", "ladder", "lantern", "lawyer", "leader", "letter", "library", "lily", "lizard", "lobster", "magnet", "mango", "marble", "market", "meadow", "melon", "mirror", "monkey", "monster", "morning", "mountain", "napkin", "needle", "nephew", "niece", "number", "orange", "orchard", "oyster", "palace", "panther", "parcel", "parent", "parrot", "pasture", "pattern", "peasant", "pencil", "pepper", "phoenix", "pigeon", "pillow", "planet", "pocket", "police", "popcorn", "potter", "powder", "prairie", "present", "prince", "princess", "pumpkin", "puzzle", "pyramid", "quarter", "rainbow", "raisin", "rattle", "reason", "ribbon", "riddle", "rocket", "rooster", "saddle", "sailor", "salmon", "sandal", "satchel", "saucer", "scholar", "school", "scissors", "secret", "shadow", "shelter", "sheriff", "shoulder", "signal", "skeleton", "skyline", "sleigh", "soldier", "sparrow", "spider", "squirrel", "stable", "staircase", "stallion", "station", "statue", "steeple", "stirrup", "stomach", "stranger", "student", "summer", "sunrise", "sunset", "surgeon", "swallow", "sweater", "temple", "thunder", "tiger", "timber", "tomato", "tornado", "tortoise", "tourist", "tower", "traffic", "treasure", "trouble", "trumpet", "tunnel", "turkey", "turtle", "twilight", "umbrella", "unicorn", "valley", "velvet", "village", "violet", "visitor", "voyage", "walrus", "warrior", "waterfall", "weather", "wedding", "whisper", "winter", "wizard", "wonder", "woodland", "workshop", "zebra"];
          const i = Math.floor(rng() * W.length);
          let j = Math.floor(rng() * W.length);
          while (j === i) j = Math.floor(rng() * W.length);
          const [a, b] = W[i] < W[j] ? [W[i], W[j]] : [W[j], W[i]];
          return { a, b, la: a.length, lb: b.length };
        },
        whyWrong: (v) => [`Count the letters in each word separately, then add: ${v.la} + ${v.lb} = ${v.la + v.lb}.`, `Never count spaces or punctuation as letters.`, `Sound both words out slowly to avoid missing letters.`],
        trick: "Add both idiom word lengths together.",
        tip: "Count each word fully before adding."
      },
      {
        kind: "numeric", name: "idiom word length differences", difficulty: "medium",
        note: "Comparing the letter counts of two idiom words.",
        q: (v) => `How many more letters does "${v.a}" contain than "${v.b}"?`,
        a: (v) => `${v.la - v.lb}`,
        e: (v) => `The word "${v.a}" contains ${v.la} letters while "${v.b}" contains ${v.lb}, so "${v.a}" has ${v.la} - ${v.lb} = ${v.la - v.lb} more letters than "${v.b}".`,
        distract: (v) => [v.la - v.lb + 1, v.la - v.lb + 2, v.la - v.lb + 3, v.la - v.lb - 1, v.la - v.lb - 2].filter((x) => x >= 1),
        vals: (rng) => {
          const LONG = ["bucket", "candle", "carpet", "castle", "cherry", "chimney", "circle", "collar", "cottage", "crystal", "curtain", "cushion", "danger", "diamond", "dinner", "doctor", "donkey", "dragon", "drawer", "driver", "elephant", "engine", "family", "feather", "finger", "flower", "forest", "fountain", "garden", "garlic", "ginger", "glasses", "hammer", "harbour", "harvest", "heaven", "helmet", "hurdle", "island", "jacket", "jungle", "kitten", "ladder", "lantern", "lawyer", "leader", "letter", "library", "lizard", "lobster", "magnet", "marble", "market", "meadow", "mirror", "monkey", "monster", "morning", "mountain", "napkin", "needle", "nephew", "number", "orange", "orchard", "oyster", "palace", "panther", "parcel", "parent", "parrot", "pasture", "pattern", "peasant", "pencil", "pepper", "phoenix", "pigeon", "pillow", "planet", "pocket", "police", "popcorn", "potter", "powder", "prairie", "present", "prince", "princess", "pumpkin", "puzzle", "pyramid", "quarter", "rainbow", "raisin", "rattle", "reason", "ribbon", "riddle", "rocket", "rooster", "saddle", "sailor", "salmon", "sandal", "satchel", "saucer", "scholar", "school", "scissors", "secret", "shadow", "shelter", "sheriff", "shoulder", "signal", "skeleton", "skyline", "sleigh", "soldier", "sparrow", "spider", "squirrel", "stable", "staircase", "stallion", "station", "statue", "steeple", "stirrup", "stomach", "stranger", "student", "summer", "sunrise", "sunset", "surgeon", "swallow", "sweater", "temple", "thunder", "timber", "tomato", "tornado", "tortoise", "tourist", "traffic", "treasure", "trouble", "trumpet", "tunnel", "turkey", "turtle", "twilight", "umbrella", "unicorn", "valley", "velvet", "village", "violet", "visitor", "voyage", "walrus", "warrior", "waterfall", "weather", "wedding", "whisper", "winter", "wizard", "wonder", "woodland", "workshop", ];
          const SHORT = ["arm", "bag", "bed", "bell", "bird", "boat", "bone", "book", "boot", "bread", "brick", "card", "cat", "coat", "coin", "cow", "cup", "date", "deck", "desk", "dish", "dog", "door", "drum", "duck", "ear", "egg", "eye", "face", "fish", "flag", "foot", "fork", "gate", "gift", "goat", "gold", "goose", "grass", "grave", "gum", "gun", "hair", "hand", "hat", "hawk", "hay", "head", "heart", "heel", "hen", "hill", "hole", "honey", "hook", "horn", "horse", "hour", "house", "ice", "iron", "jar", "jaw", "key", "king", "knee", "knot", "lake", "lamp", "land", "lane", "leaf", "leg", "lion", "lip", "lock", "log", "lord", "love", "luck", "map", "mask", "meal", "meat", "mile", "milk", "mind", "moon", "moss", "moth", "mouse", "mouth", "mud", "nail", "neck", "nest", "net", "nose", "note", "oil", "owl", "palm", "pan", "park", "path", "paw", "pea", "pen", "penny", "pie", "pig", "pin", "pipe", "pit", "pond", "pool", "post", "pot", "purse", "queen", "rail", "rain", "rat", "ray", "ring", "river", "road", "rock", "rod", "roof", "room", "root", "rope", "rose", "rug", "sack", "sail", "salt", "sand", "saw", "seed", "shade", "sheep", "sheet", "shell", "ship", "shoe", "shop", "shore", "silk", "sink", "sky", "slate", "snake", "soap", "sock", "soil", "song", "soup", "spark", "spoon", "spot", "stair", "stamp", "star", "stem", "step", "stick", "stone", "stool", "storm", "stove", "straw", "sugar", "sun", "swan", "sweat", "swing", "sword", "table", "tail", "tape", "tea", "team", "tear", "tent", "tide", "tiger", "tile", "time", "tin", "tip", "toe", "tool", "tooth", "torch", "tower", "town", "toy", "track", "trail", "train", "trap", "tray", "tree", "trip", "trunk", "tube", "tune", "turn", "twin", "veil", "vein", "verse", "vest", "view", "vine", "voice", "wagon", "wall", "wand", "war", "ward", "wave", "wax", "web", "weed", "week", "wheel", "whip", "widow", "wife", "wind", "wine", "wing", "wire", "wish", "wolf", "wood", "wool", "word", "world", "worm", "wound", "wrist", "yard", "yarn", "year", "zone"];
          return { a: LONG[Math.floor(rng() * LONG.length)], b: SHORT[Math.floor(rng() * SHORT.length)] };
        },
        whyWrong: (v) => [`Subtract the shorter count from the longer: ${v.la} - ${v.lb} = ${v.la - v.lb}.`, `Count the longer word first to anchor the difference.`, `The first word is always the longer one, so the difference stays positive.`],
        trick: "Subtract the smaller letter count.",
        tip: "Compare word lengths before subtracting."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
