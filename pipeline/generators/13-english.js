/* ============================================================
   Generator file 13 — English language subjects
   Vocabulary (authored word lists — original definitions),
   grammar, idioms, sentence structure, comprehension, literature.
   ============================================================ */
"use strict";
const L = require("../lib.js");

function makeGen(subjectId, chapterName, facts, extraTags = []) {
  const topics = Object.keys(facts);
  return {
    subjects: [subjectId],
    name: chapterName,
    topics,
    tags: [subjectId, ...extraTags],
    generate(rng, topicName) {
      const pool = facts[topicName].map(([q, a, e]) => ({ q, a, e }));
      return L.factGenerator(pool, [])(rng);
    }
  };
}

/* [word, definition] pairs — authored original definitions */
const VOCAB_A = [
  ["Abundant", "existing in large quantities"],
  ["Benevolent", "kind and well meaning"],
  ["Candid", "truthful and straightforward"],
  ["Diligent", "hard-working and careful"],
  ["Eloquent", "fluent and persuasive in speech"],
  ["Frugal", "careful with money; economical"],
  ["Generous", "giving freely; unselfish"],
  ["Humble", "modest; not proud"],
  ["Industrious", "hard-working"],
  ["Jovial", "cheerful and friendly"],
  ["Keen", "eager or sharp"],
  ["Loyal", "faithful to commitments"],
  ["Meticulous", "extremely careful about details"],
  ["Noble", "having high moral qualities"],
  ["Optimistic", "hopeful about the future"],
  ["Prudent", "showing careful judgment"],
  ["Quiet", "making little or no noise"],
  ["Reliable", "consistently good and dependable"],
  ["Sincere", "honest in feeling or intention"],
  ["Tolerant", "accepting of difference"],
  ["Upright", "honest and moral"],
  ["Vigorous", "strong, healthy and energetic"],
  ["Wise", "showing good judgment"],
  ["Zealous", "showing great energy and enthusiasm"]
];
const VOCAB_B = [
  ["Ambiguous", "open to more than one interpretation"],
  ["Belligerent", "hostile and aggressive"],
  ["Cautious", "careful to avoid danger"],
  ["Dismal", "gloomy and depressing"],
  ["Eminent", "famous and respected"],
  ["Formidable", "inspiring fear or respect"],
  ["Gregarious", "sociable and outgoing"],
  ["Hostile", "unfriendly and aggressive"],
  ["Impartial", "fair; not biased"],
  ["Judicious", "showing sound judgment"],
  ["Lethargic", "sluggish and lacking energy"],
  ["Mundane", "ordinary and uninteresting"],
  ["Notorious", "famous for something bad"],
  ["Obsolete", "no longer in use"],
  ["Pragmatic", "dealing with things practically"],
  ["Quaint", "attractively unusual or old-fashioned"],
  ["Rigorous", "thorough and strict"],
  ["Subtle", "delicate; not obvious"],
  ["Tenacious", "holding firmly; persistent"],
  ["Urbane", "polished, courteous and refined"],
  ["Vulnerable", "open to attack or harm"],
  ["Wary", "cautious about possible dangers"],
  ["Arid", "extremely dry; lacking moisture"],
  ["Brilliant", "exceptionally clever or bright"]
];
const IDIOMS = [
  ["A piece of cake", "something very easy to do", "The exam was a piece of cake — everyone finished early."],
  ["Once in a blue moon", "very rarely", "He visits his village once in a blue moon."],
  ["Break the ice", "start a conversation to ease tension", "A simple joke broke the ice at the meeting."],
  ["Hit the nail on the head", "say exactly the right thing", "Your analysis hit the nail on the head."],
  ["Under the weather", "feeling unwell", "She stayed home because she was under the weather."],
  ["The ball is in your court", "it is your turn to act", "I have made the offer; the ball is in your court."],
  ["Burn the midnight oil", "work late into the night", "Students burned the midnight oil before exams."],
  ["Cost an arm and a leg", "be very expensive", "That mobile phone cost an arm and a leg."],
  ["Let the cat out of the bag", "reveal a secret", "He let the cat out of the bag about the surprise."],
  ["A blessing in disguise", "a misfortune that turns out well", "The delay was a blessing in disguise."],
  ["Actions speak louder than words", "what you do matters more than what you say", "He promises much, but actions speak louder than words."],
  ["Beat around the bush", "avoid saying what you mean", "Stop beating around the bush and tell me directly."],
  ["Bite the bullet", "face something difficult bravely", "She bit the bullet and apologised."],
  ["Call it a day", "stop working for the day", "We finished the report and called it a day."],
  ["Cut corners", "do something cheaply or poorly", "The contractor cut corners to save money."],
  ["A drop in the ocean", "a very small amount", "His donation was a drop in the ocean."],
  ["Face the music", "accept the consequences", "He had to face the music for his mistakes."],
  ["Go the extra mile", "make extra effort", "Good teachers go the extra mile for students."],
  ["In hot water", "in trouble", "The official found himself in hot water."],
  ["Jump on the bandwagon", "join a popular trend", "Many firms jumped on the e-commerce bandwagon."]
];

module.exports = [
  makeGen("vocabulary", "Vocabulary — Word Power", {
    "Words A": VOCAB_A.map(([w, d]) => [`What does "${w}" mean?`, d, `"${w}" means ${d}.`]),
    "Words B": VOCAB_B.map(([w, d]) => [`What does "${w}" mean?`, d, `"${w}" means ${d}.`])
  }),
  makeGen("synonyms", "Synonyms — Similar Words", {
    "Synonym Pairs": [
      ["Which word is a synonym of 'happy'?", "Joyful", "Joyful shares the meaning of happy."],
      ["Which word is a synonym of 'big'?", "Huge", "Huge means very large, like big."],
      ["Which word is a synonym of 'quick'?", "Rapid", "Rapid means fast, like quick."],
      ["Which word is a synonym of 'brave'?", "Courageous", "Courageous means showing bravery."],
      ["Which word is a synonym of 'angry'?", "Furious", "Furious means extremely angry."],
      ["Which word is a synonym of 'smart'?", "Intelligent", "Intelligent means clever or smart."],
      ["Which word is a synonym of 'rich'?", "Wealthy", "Wealthy means having much money."],
      ["Which word is a synonym of 'tired'?", "Exhausted", "Exhausted means very tired."],
      ["Which word is a synonym of 'difficult'?", "Challenging", "Challenging means hard or difficult."],
      ["Which word is a synonym of 'begin'?", "Commence", "Commence is a formal synonym of begin."],
      ["Which word is a synonym of 'end'?", "Conclude", "Conclude means to bring to an end."],
      ["Which word is a synonym of 'help'?", "Assist", "Assist means to give help."],
      ["Which word is a synonym of 'look'?", "Observe", "Observe means to look carefully."],
      ["Which word is a synonym of 'speak'?", "Utter", "Utter means to say or speak."],
      ["Which word is a synonym of 'build'?", "Construct", "Construct means to build."],
      ["Which word is a synonym of 'destroy'?", "Demolish", "Demolish means to destroy completely."],
      ["Which word is a synonym of 'hide'?", "Conceal", "Conceal means to hide."],
      ["Which word is a synonym of 'show'?", "Display", "Display means to show."],
      ["Which word is a synonym of 'buy'?", "Purchase", "Purchase means to buy."],
      ["Which word is a synonym of 'job'?", "Occupation", "Occupation means one's job or work."]
    ]
  }),
  makeGen("antonyms", "Antonyms — Opposite Words", {
    "Antonym Pairs": [
      ["Which word is an antonym of 'hot'?", "Cold", "Cold is the opposite of hot."],
      ["Which word is an antonym of 'day'?", "Night", "Night is the opposite of day."],
      ["Which word is an antonym of 'happy'?", "Sad", "Sad is the opposite of happy."],
      ["Which word is an antonym of 'fast'?", "Slow", "Slow is the opposite of fast."],
      ["Which word is an antonym of 'strong'?", "Weak", "Weak is the opposite of strong."],
      ["Which word is an antonym of 'rich'?", "Poor", "Poor is the opposite of rich."],
      ["Which word is an antonym of 'bright'?", "Dim", "Dim is the opposite of bright."],
      ["Which word is an antonym of 'early'?", "Late", "Late is the opposite of early."],
      ["Which word is an antonym of 'open'?", "Closed", "Closed is the opposite of open."],
      ["Which word is an antonym of 'full'?", "Empty", "Empty is the opposite of full."],
      ["Which word is an antonym of 'wide'?", "Narrow", "Narrow is the opposite of wide."],
      ["Which word is an antonym of 'tall'?", "Short", "Short is the opposite of tall."],
      ["Which word is an antonym of 'ancient'?", "Modern", "Modern is the opposite of ancient."],
      ["Which word is an antonym of 'victory'?", "Defeat", "Defeat is the opposite of victory."],
      ["Which word is an antonym of 'peace'?", "War", "War is the opposite of peace."],
      ["Which word is an antonym of 'lend'?", "Borrow", "Borrow is the opposite of lend."],
      ["Which word is an antonym of 'import'?", "Export", "Export is the opposite of import."],
      ["Which word is an antonym of 'ascent'?", "Descent", "Descent is the opposite of ascent."],
      ["Which word is an antonym of 'expand'?", "Contract", "Contract is the opposite of expand."],
      ["Which word is an antonym of 'transparent'?", "Opaque", "Opaque is the opposite of transparent."]
    ]
  }),
  makeGen("grammar", "Grammar — English Usage", {
    "Parts of Speech": [
      ["Which word is a noun in 'The cat slept'?", "Cat", "Cat names an animal — a noun."],
      ["Which word is a verb in 'She runs fast'?", "Runs", "Runs shows the action."],
      ["Which word is an adjective in 'A red car'?", "Red", "Red describes the noun car."],
      ["Which word is an adverb in 'He spoke softly'?", "Softly", "Softly modifies the verb spoke."],
      ["Which word is a pronoun in 'They went home'?", "They", "They stands in for a noun."],
      ["Which word is a preposition in 'The book is on the table'?", "On", "On shows the book's position."],
      ["Which word is a conjunction in 'Tea and bread'?", "And", "And joins two words."],
      ["Which word is an interjection in 'Wow, great!'?", "Wow", "Wow expresses sudden emotion."],
      ["What is a sentence?", "a group of words with a complete thought", "Sentences start with a capital and end with punctuation."],
      ["What is a subject?", "the doer of the action", "The subject usually precedes the verb."],
      ["What is an object?", "the receiver of the action", "Objects follow transitive verbs."],
      ["What is the plural of 'child'?", "Children", "Child takes the irregular plural children."],
      ["What is the past tense of 'go'?", "Went", "Go is irregular: go → went → gone."],
      ["What is the past participle of 'write'?", "Written", "Write is irregular: write → wrote → written."],
      ["Which article precedes a vowel sound?", "'An'", "An is used before vowel sounds: an apple."],
      ["Which word is correct: 'He ___ to school daily'?", "Goes", "Third-person singular takes goes."]
    ]
  }),
  makeGen("idioms", "Idioms — Figurative Language", {
    "Common Idioms": IDIOMS.map(([i, m, e]) => [`What does the idiom "${i}" mean?`, m, `"${i}" means ${m}. Example: ${e}`])
  }),
  makeGen("sentence-correction", "Sentence Correction — Structure", {
    "Correct Usage": [
      ["Choose the correct sentence.", "He does not know the answer.", "'Does not' agrees with the third-person subject."],
      ["Choose the correct sentence.", "She has gone to Lahore.", "Present perfect needs 'has gone', not 'has went'."],
      ["Choose the correct sentence.", "I am used to waking early.", "'Used to + -ing' describes a habit."],
      ["Choose the correct sentence.", "Neither of the boys was present.", "Neither takes a singular verb."],
      ["Choose the correct sentence.", "The news is good.", "News is singular in English."],
      ["Choose the correct sentence.", "He is senior to me.", "Senior takes 'to', not 'than'."],
      ["Choose the correct sentence.", "One of my friends lives abroad.", "'One of' takes a singular verb."],
      ["Choose the correct sentence.", "I have known him since 2010.", "Since + point of time takes the perfect tense."],
      ["Choose the correct sentence.", "The committee has decided.", "Collective nouns often take a singular verb."],
      ["Choose the correct sentence.", "He asked where I was going.", "Reported questions use statement order."],
      ["Choose the correct sentence.", "Each student must bring his book.", "Each takes a singular verb and pronoun."],
      ["Choose the correct sentence.", "The scissors are sharp.", "Scissors is plural."],
      ["Choose the correct sentence.", "If he had come, we would have met.", "Past perfect follows 'if' in third conditionals."],
      ["Choose the correct sentence.", "I prefer tea to coffee.", "Prefer takes 'to'."],
      ["Choose the correct sentence.", "He worked hard so that he might pass.", "'So that' takes may/might or can/could."]
    ]
  }),
  makeGen("comprehension", "Comprehension — Reading", {
    "Reading Skills": [
      ["What is the main idea of a passage?", "the central message", "The main idea summarises what the passage is about."],
      ["What is a supporting detail?", "evidence that backs the main idea", "Details give examples and facts."],
      ["What does 'inference' mean in reading?", "a conclusion drawn from clues", "Inferences go beyond the literal text."],
      ["What is a topic sentence?", "the sentence stating the main idea", "Topic sentences usually open paragraphs."],
      ["What is skimming?", "reading quickly for the gist", "Skimming finds the overall meaning fast."],
      ["What is scanning?", "reading quickly for specific facts", "Scanning locates names, dates or numbers."],
      ["What is a summary?", "a brief restatement of key points", "Summaries condense the passage."],
      ["What is vocabulary in context?", "understanding words from surrounding text", "Context clues reveal word meaning."],
      ["What is the purpose of an author?", "the writer's goal", "Purpose may inform, persuade or entertain."],
      ["What is a conclusion?", "a reasoned ending judgment", "Conclusions follow from the passage's evidence."]
    ]
  }),
  makeGen("english-literature", "English Literature — Classics", {
    "Authors and Works": [
      ["Who wrote 'Hamlet'?", "William Shakespeare", "Shakespeare's tragedy dates to around 1600."],
      ["Who wrote 'Pride and Prejudice'?", "Jane Austen", "Austen's novel published in 1813."],
      ["Who wrote 'Great Expectations'?", "Charles Dickens", "Dickens's novel appeared in 1861."],
      ["Who wrote 'War and Peace'?", "Leo Tolstoy", "Tolstoy's epic was published in 1869."],
      ["Who wrote '1984'?", "George Orwell", "Orwell's dystopia appeared in 1949."],
      ["Who wrote 'The Old Man and the Sea'?", "Ernest Hemingway", "Hemingway won the Pulitzer for it in 1953."],
      ["Who wrote 'A Tale of Two Cities'?", "Charles Dickens", "The novel opens 'It was the best of times...'."],
      ["Who wrote 'Romeo and Juliet'?", "William Shakespeare", "The tragedy was written in the 1590s."],
      ["Who wrote 'Paradise Lost'?", "John Milton", "Milton's epic poem appeared in 1667."],
      ["Who wrote 'Don Quixote'?", "Miguel de Cervantes", "Cervantes's novel published in 1605."],
      ["Who wrote 'The Great Gatsby'?", "F. Scott Fitzgerald", "Fitzgerald's novel appeared in 1925."],
      ["Who wrote 'Moby Dick'?", "Herman Melville", "Melville's novel published in 1851."],
      ["What is a sonnet?", "a 14-line poem", "Sonnets follow rhyme schemes like the Shakespearean form."],
      ["What is a novel?", "a long fictional prose narrative", "Novels develop characters and plots at length."],
      ["What is a poem?", "writing in verse", "Poems use rhythm and imagery."],
      ["What is a play?", "a story for the stage", "Plays are written in acts and scenes."]
    ]
  }),
  makeGen("english", "English — Essentials", {
    "Basics": [
      ["How many letters are in the English alphabet?", "26", "The alphabet has 5 vowels and 21 consonants."],
      ["Which are the vowels?", "A, E, I, O, U", "Vowels can be pronounced without blocking airflow."],
      ["What is a sentence?", "a complete unit of meaning", "Sentences contain a subject and a verb."],
      ["What is punctuation?", "marks that clarify meaning", "Punctuation includes full stops, commas and question marks."],
      ["What is a capital letter used for?", "starting sentences and names", "Capitals begin sentences and proper nouns."],
      ["What is spelling?", "writing words with correct letters", "Correct spelling is essential for clarity."],
      ["What is a paragraph?", "a group of related sentences", "Paragraphs develop one idea each."],
      ["What is an essay?", "a structured piece of writing", "Essays have an introduction, body and conclusion."],
      ["What is a letter?", "a written message", "Letters may be formal or informal."],
      ["What is reading?", "understanding written text", "Reading builds vocabulary and knowledge."],
      ["What is writing?", "expressing ideas in text", "Writing communicates across time and distance."],
      ["What is listening?", "understanding spoken language", "Listening is the first language skill acquired."]
    ]
  })
];
