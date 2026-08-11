const { writeFile } = require("./gen-helper.cjs");

const ENTRY = [
  /* mdcat */
  ["mdcat", "Cell & Molecular Biology", "easy", "The powerhouse of the cell is the:", ["mitochondrion", "nucleus", "ribosome", "golgi body"], "A", "Mitochondria generate ATP through cellular respiration.", ["mdcat", "biology"]],
  ["mdcat", "Cell & Molecular Biology", "medium", "DNA replication is described as:", ["semi-conservative", "conservative", "dispersive only", "random"], "A", "Each new DNA molecule keeps one parental strand, so replication is semi-conservative.", ["mdcat", "biology"]],
  ["mdcat", "Human Physiology", "medium", "Which hormone regulates blood glucose?", ["insulin", "thyroxine", "melatonin", "testosterone"], "A", "Insulin lowers blood glucose; glucagon raises it.", ["mdcat", "physiology"]],
  ["mdcat", "Organic Chemistry", "medium", "The general formula of alkanes is:", ["CnH2n+2", "CnH2n", "CnH2n-2", "CnHn"], "A", "Alkanes are saturated hydrocarbons with formula CnH2n+2.", ["mdcat", "chemistry"]],
  ["mdcat", "Mechanics & Electricity", "medium", "Newton's second law states:", ["F = ma", "F = mv", "F = m/a", "F = v/a"], "A", "Force equals mass times acceleration.", ["mdcat", "physics"]],
  ["mdcat", "Mechanics & Electricity", "easy", "The SI unit of electric current is the:", ["ampere", "volt", "ohm", "watt"], "A", "Current is measured in amperes; volts measure potential difference.", ["mdcat", "physics"]],
  /* ecat */
  ["ecat", "Algebra & Functions", "easy", "If f(x) = 2x + 3, then f(4) = ?", ["11", "8", "10", "14"], "A", "f(4) = 2(4) + 3 = 11.", ["ecat", "math"]],
  ["ecat", "Algebra & Functions", "medium", "The roots of x^2 - 5x + 6 = 0 are:", ["2 and 3", "1 and 6", "-2 and -3", "5 and 6"], "A", "(x-2)(x-3) = 0 gives roots 2 and 3.", ["ecat", "math"]],
  ["ecat", "Calculus Basics", "medium", "The derivative of x^3 is:", ["3x^2", "x^2", "3x", "x^4"], "A", "d/dx (x^n) = n x^(n-1), so x^3 differentiates to 3x^2.", ["ecat", "calculus"]],
  ["ecat", "Physics Fundamentals", "medium", "The SI unit of force is the:", ["newton", "joule", "pascal", "watt"], "A", "Force is measured in newtons; joule is energy, pascal pressure.", ["ecat", "physics"]],
  ["ecat", "Chemistry Fundamentals", "medium", "Avogadro's number is approximately:", ["6.022 x 10^23", "3.14 x 10^10", "9.8 x 10^2", "1.6 x 10^-19"], "A", "One mole contains about 6.022 x 10^23 particles.", ["ecat", "chemistry"]],
  /* lat */
  ["lat", "Grammar & Vocabulary", "easy", "Which sentence is grammatically correct?", ["He did not went to school.", "He did not go to school.", "He did not gone to school.", "He do not go to school."], "B", "After the auxiliary 'did', the base verb 'go' is used.", ["lat", "english"]],
  ["lat", "Grammar & Vocabulary", "medium", "The synonym of 'brief' is:", ["short", "long", "bright", "heavy"], "A", "Brief means short in duration or length.", ["lat", "english"]],
  ["lat", "Essay & Comprehension", "medium", "A good essay introduction should:", ["state the thesis clearly", "be as long as the body", "skip the topic", "include citations only"], "A", "An introduction presents the topic and thesis to guide the essay.", ["lat", "essay"]],
  ["lat", "Islamic Studies", "easy", "The Holy Quran was revealed to Prophet Muhammad (PBUH) over approximately:", ["23 years", "10 years", "40 years", "5 years"], "A", "Revelation spanned about 23 years, beginning in 610 CE.", ["lat", "islamic"]],
  ["lat", "Pakistan GK", "easy", "Pakistan's national language is:", ["Urdu", "English", "Punjabi", "Pashto"], "A", "Urdu is the national language; English is the official language.", ["lat", "gk"]],
  /* gat */
  ["gat", "Arithmetic & Algebra", "easy", "If 25% of a number is 40, the number is:", ["160", "100", "80", "120"], "A", "0.25x = 40 -> x = 160.", ["gat", "quant"]],
  ["gat", "Arithmetic & Algebra", "medium", "Solve: 3x + 5 = 20. x = ?", ["5", "6", "4", "15"], "A", "Subtract 5 from both sides to get 3x = 15, then divide by 3: x = 5.", ["gat", "quant"]],
  ["gat", "Data Sufficiency", "medium", "To find the area of a rectangle you need:", ["length and width", "perimeter only", "diagonal only", "angle only"], "A", "Area = length x width, so both dimensions are required.", ["gat", "quant"]],
  ["gat", "Comprehension", "medium", "The main idea of a passage is usually found:", ["in the topic sentence or thesis", "only in the last word", "in the title only", "hidden in punctuation"], "A", "Passages state the main idea early, often in the first sentence.", ["gat", "verbal"]],
  ["gat", "Critical Thinking", "hard", "A 'weak argument' in critical reasoning typically:", ["has little logical support for its claim", "is always false", "contains no words", "uses only numbers"], "A", "Weak arguments fail to support their conclusions with sound evidence.", ["gat", "verbal"]],
  /* gre */
  ["gre", "Text Completion", "medium", "Choose the word that best completes: 'Despite his ___ speech, the audience remained unconvinced.'", ["eloquent", "incoherent only", "quiet", "brief"], "A", "Eloquent (fluent and persuasive) fits the contrast with the audience's reaction.", ["gre", "verbal"]],
  ["gre", "Sentence Equivalence", "medium", "Choose two words that complete the sentence with similar meaning: 'The results were entirely ___; no one predicted them.'", ["unexpected", "predictable", "typical", "astonishing"], "A", "Unexpected and astonishing both convey surprise, matching 'no one predicted them'.", ["gre", "verbal"]],
  ["gre", "Arithmetic", "easy", "What is 30% of 90?", ["27", "30", "25", "35"], "A", "Percentages are fractions of 100, so 30% of 90 equals 90 x 0.30 = 27.", ["gre", "quant"]],
  ["gre", "Algebra & Geometry", "medium", "The area of a circle with radius 7 is closest to:", ["154", "49", "44", "88"], "A", "Area = pi x r^2 = pi x 49, which is approximately 154.", ["gre", "quant"]],
  ["gre", "Algebra & Geometry", "hard", "If the ratio of two numbers is 3:5 and their sum is 40, the smaller number is:", ["15", "25", "12", "18"], "A", "3x + 5x = 40 -> x = 5, smaller = 15.", ["gre", "quant"]],
  /* ielts */
  ["ielts", "Listening Skills", "easy", "In the IELTS listening test, answers are marked correct if they are:", ["spelled correctly", "phonetically similar", "in any language", "guesswork"], "A", "Spelling counts; British and American spellings are both accepted.", ["ielts"]],
  ["ielts", "Listening Skills", "medium", "During listening, it is best to:", ["read ahead and predict answers", "write every word", "ignore the questions", "pause the audio"], "A", "Previewing questions helps you anticipate what to listen for.", ["ielts"]],
  ["ielts", "Reading Strategies", "medium", "'Skimming' a passage means:", ["reading quickly for the general idea", "reading word by word", "reading only the last line", "skipping the passage"], "A", "Skimming gives an overview; scanning looks for specific facts.", ["ielts"]],
  ["ielts", "Task 1 & 2 Writing", "hard", "IELTS Writing Task 1 (Academic) asks you to:", ["summarize visual information", "write a story", "memorize an essay", "translate a poem"], "A", "Task 1 reports data from charts, graphs, tables or diagrams.", ["ielts"]],
  ["ielts", "Speaking Tasks", "medium", "In the IELTS speaking test, Part 2 requires:", ["a 1-2 minute talk on a cue card", "a debate", "a written essay", "a grammar test"], "A", "Part 2 is a long turn: prepare and speak about a given topic.", ["ielts"]],
  /* toefl */
  ["toefl", "Reading Comprehension", "easy", "The TOEFL reading section uses passages from:", ["academic texts", "comic books", "text messages", "song lyrics"], "A", "TOEFL reading draws on university-level academic material.", ["toefl"]],
  ["toefl", "Reading Comprehension", "medium", "Inference questions ask you to:", ["draw a conclusion not directly stated", "copy a sentence", "count words", "choose a synonym only"], "A", "Inference items require reading between the lines.", ["toefl"]],
  ["toefl", "Listening Skills", "medium", "In TOEFL listening, lectures often include:", ["examples and digressions", "only definitions", "no structure", "multiple-choice audio"], "A", "Lectures mix main points with examples the questions test.", ["toefl"]],
  ["toefl", "Integrated Writing", "hard", "The integrated writing task combines:", ["reading, listening and writing", "speaking and math", "grammar and spelling only", "typing speed"], "A", "You read a passage, hear a lecture, then summarize the relationship.", ["toefl"]],
  /* sat */
  ["sat", "Reading Passages", "easy", "SAT reading questions often ask about:", ["the author's purpose and evidence", "only vocabulary spellings", "word counts", "page numbers"], "A", "The SAT tests purpose, evidence and reasoning in passages.", ["sat"]],
  ["sat", "Writing & Language", "medium", "In SAT Writing, you must choose the answer that:", ["is grammatically correct and concise", "sounds the most scientific", "has the most commas", "repeats the sentence"], "A", "Correctness, clarity and concision are rewarded.", ["sat"]],
  ["sat", "Algebra", "easy", "If 2x + 6 = 14, then x = ?", ["4", "3", "5", "6"], "A", "Subtract 6 from both sides: 2x = 8; dividing by 2 gives x = 4.", ["sat", "math"]],
  ["sat", "Problem Solving & Data", "medium", "The median of 3, 7, 8, 9, 12 is:", ["8", "7", "9", "8.5"], "A", "The middle value of the ordered list is 8.", ["sat", "math"]],
  ["sat", "Problem Solving & Data", "medium", "A bag has 3 red and 2 blue balls. The probability of drawing a red ball is:", ["3/5", "2/5", "1/2", "3/2"], "A", "P(red) = 3/(3+2) = 3/5.", ["sat", "math"]]
];

writeFile("33-entry-tests.json", ENTRY);
