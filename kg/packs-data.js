/* ============================================================
   Phase 14 — Knowledge Graph engine: authored pack content
   Real, offline-authored knowledge for major subjects. Pack
   engine composes these sections with mined sections. Metadata-
   only references (no copyrighted content).
   ============================================================ */
"use strict";

/* shape: { [subjectId]: { overview, formulas:[], classifications:[], processes:[],
   misconceptions:[], exam_tips:[], rules:[], references:[{type,title,authors,edition,year,publisher}],
   prerequisites:[["A","B"]], paths:[{name,target_exam,steps:[conceptSlugOrName]}] } } */

const PACKS = {
  "pakistan-affairs": {
    overview: "Pakistan Affairs covers the creation, constitution, geography, economy, foreign policy and institutions of Pakistan from 1947 to the present. It is the single most tested subject in CSS, PMS and all provincial Public Service Commission exams.",
    classifications: ["Constitutional organs: Executive, Legislature, Judiciary", "Federating units: 4 provinces + Islamabad Capital Territory + Gilgit-Baltistan + Azad Kashmir", "Indus basin rivers: Indus, Jhelum, Chenab, Ravi, Sutlej, Kabul", "Sources of revenue: federal (income tax, customs, sales tax) vs provincial (property, agricultural income)"],
    misconceptions: ["Pakistan became an independent republic in 1947 — in fact the Republic came into being on 23 March 1956", "Urdu was declared the only national language at independence — both Urdu and English remained official languages until 2015 amendments", "The Objectives Resolution (1949) is the Constitution — it is only its preamble-like foundation principle"],
    exam_tips: ["Memorize key dates: 14 Aug 1947 independence, 23 Mar 1956 republic, 1965 & 1971 wars, 1973 Constitution", "Constitution of 1973 articles: Article 1 (territory), Article 8-28 (fundamental rights), Article 62-63 (qualifications of President/PM), Article 91 (PM election), Article 243 (armed forces)", "Indus Waters Treaty 1960 signed with India through World Bank mediation — a favourite MCQS topic"],
    rules: ["The 1973 Constitution is the supreme law; amendments require 2/3 majority in both houses", "National Assembly: 336 seats (266 general + 60 women + 10 minorities); Senate: 96 seats"],
    references: [
      { type: "book", title: "Constitution of the Islamic Republic of Pakistan 1973", authors: "Government of Pakistan", year: "1973", publisher: "National Assembly of Pakistan" },
      { type: "book", title: "Pakistan Affairs", authors: "Ikram Rabbani", year: "2022", publisher: "JWT Publishers" },
      { type: "book", title: "History of Pakistan", authors: "K.K. Aziz", publisher: "Vanguard Books" },
      { type: "syllabus", title: "CSS Compulsory Subject: Pakistan Affairs", authors: "FPSC", official_syllabus: "FPSC CSS syllabus — Pakistan Affairs (100 marks)" }
    ],
    prerequisites: [["pakistan-history", "constitution"], ["geography", "indus-basin"]],
    paths: [{ name: "CSS Pakistan Affairs Sprint", target_exam: "css-exam", steps: ["Independence Movement", "Constitutional Development", "Constitution of 1973", "Geography & Resources", "Foreign Policy", "Economy & Development"] }]
  },
  "pakistan-history": {
    overview: "Pakistan History spans the Indus Valley Civilisation, Muslim rule, the British Raj, the independence movement (Muslim League, Two-Nation Theory), and post-1947 national development.",
    classifications: ["Periods: Ancient (Indus Valley), Muslim Sultanate (1206-1526), Mughal (1526-1857), British (1857-1947), Republic (1947-)", "Independence movement milestones: Aligarh Movement 1875, All-India Muslim League 1906, Lucknow Pact 1916, Lahore Resolution 1940, 3 June Plan 1947"],
    misconceptions: ["The Lahore Resolution (1940) demanded a separate state from the start — it first demanded autonomous regions, and the 'two separate states' language was adopted later", "Rashid Minhas is a war hero of 1965 — he died in the 1971 war"],
    exam_tips: ["Know founder figures: Sir Syed Ahmad Khan, Allama Iqbal, Quaid-e-Azam Muhammad Ali Jinnah, Liaquat Ali Khan", "Lahore Resolution 23 March 1940; Pakistan Resolution Day is celebrated on 23 March"],
    references: [
      { type: "book", title: "The Making of Pakistan", authors: "K.K. Aziz", publisher: "Oxford University Press" },
      { type: "book", title: "Pakistan: A Modern History", authors: "Ian Talbot", publisher: "Palgrave Macmillan" },
      { type: "syllabus", title: "FPSC CSS Pakistan Affairs syllabus — historical evolution", authors: "FPSC" }
    ]
  },
  "current-affairs": {
    overview: "Current Affairs tests recent national and international developments: politics, economy, science, sports, defence, regional relations and Pakistani institutions, typically within the last 12-24 months.",
    exam_tips: ["Study the last 12 months of Pakistani and world news: elections, budgets, defence deals, UN developments, major summits", "Track key institutions: IMF programmes, CPEC phases, SCO membership (2024), UNSC positions", "Science & tech: Pakistan's space programme (SUPARCO), nuclear policy, IT exports"],
    misconceptions: ["CPEC is a single road project — it is a corridor of energy, infrastructure, Gwadar port and industrial cooperation", "Pakistan became a non-permanent UNSC member recently — 2025-26 term began January 2025"],
    references: [
      { type: "syllabus", title: "CSS General Knowledge / Current Affairs papers", authors: "FPSC", official_syllabus: "FPSC CSS syllabus" },
      { type: "site", title: "Ministry of Foreign Affairs Pakistan", authors: "MoFA" }
    ]
  },
  "world-current-affairs": {
    overview: "World Current Affairs covers major international events, organisations (UN, SCO, OIC, SAARC, NATO), treaties, elections and global economy issues relevant to competitive exams.",
    exam_tips: ["UN system: 193 member states, 6 principal organs, SC with 15 members (5 permanent)", "Key 2024-26 events: global elections, AI governance, climate COP outcomes, regional conflicts", "Economic blocs: BRICS expansion, CPTPP, EU institutions"],
    references: [
      { type: "site", title: "United Nations — official site", authors: "UN" },
      { type: "book", title: "World Politics: Trend and Transformation", authors: "Kegley & Blanton", publisher: "Cengage" }
    ]
  },
  "general-knowledge": {
    overview: "General Knowledge spans world geography, science basics, famous personalities, awards, international organisations, sports records and world records commonly asked in NTS, PPSC, FPSC and OTS papers.",
    exam_tips: ["Prepare a fixed 'firsts and mosts' list: highest mountain (K2 in Pakistan, Everest globally), largest desert (Sahara), longest river (Nile)", "International awards: Nobel Prizes, Booker, Pulitzer; Pakistan's Nobel laureates: Abdus Salam (Physics 1979), Malala Yousafzai (Peace 2014)", "UN agencies: WHO, UNICEF, UNESCO, ILO, FAO — headquartered cities are frequently asked"],
    misconceptions: ["The highest mountain in the world is Everest and K2 is second — K2 (8,611m) is second, Mount Everest (8,849m) first"],
    references: [
      { type: "book", title: "World General Knowledge", authors: "R.M. Cheema", publisher: "Ilmi Kitab Khana" },
      { type: "syllabus", title: "CSS General Science & Ability / GK syllabus", authors: "FPSC" }
    ]
  },
  "everyday-science": {
    overview: "Everyday Science applies physics, chemistry and biology to daily life: household phenomena, the human body, weather, electricity, health and nutrition basics.",
    formulas: ["Speed = distance / time", "Density = mass / volume", "Electric power = voltage × current (P = VI)", "Pressure = force / area"],
    classifications: ["Human senses: sight (eyes), hearing (ears), taste (tongue), smell (nose), touch (skin)", "Vitamins: A (vision), B-complex (metabolism), C (immune), D (bone calcium), K (clotting)", "Renewable sources: solar, wind, hydro, biomass; non-renewable: coal, oil, gas"],
    misconceptions: ["Microwaves cook from the inside out — microwaves heat water molecules throughout the food, and the surface can be cooler", "Diamonds are the hardest natural material — true, but graphite (same element) is one of the softest"],
    exam_tips: ["Units: SI base units (metre, kilogram, second, ampere, kelvin, mole, candela)", "Blood: groups A, B, AB, O with Rh factor; universal donor O-, universal recipient AB+"],
    references: [
      { type: "book", title: "Everyday Science", authors: "Tariq Mehmood", publisher: "Caravan Book House" },
      { type: "book", title: "General Science for CSS", authors: "M. Imtiaz Shahid", publisher: "JWT" }
    ]
  },
  "islamic-studies": {
    overview: "Islamic Studies covers the Quran, Hadith, Seerah of Prophet Muhammad (PBUH), Islamic jurisprudence (Fiqh), pillars of Islam, Islamic history, and Islamic culture — compulsory in CSS, PPSC, FPSC and NTS exams.",
    classifications: ["Pillars of Islam: Shahada, Salah, Zakat, Sawm, Hajj", "Books revealed: Torah (Musa), Zabur (Daud), Injil (Isa), Quran (Muhammad PBUH)", "Islamic eras: Khilafat-e-Rashida (632-661), Umayyad (661-750), Abbasid (750-1258), Ottoman (1299-1924)", "Fiqh schools: Hanafi, Maliki, Shafi'i, Hanbali"],
    misconceptions: ["Zakat is 2.5% on all wealth — it applies to wealth above the Nisab threshold held for one lunar year", "There are 30 Juz and 114 Surahs — the Quran has 114 Surahs and 30 Juz; 6,666 verses is a traditional count"],
    exam_tips: ["Memorize Surah numbers: Al-Fatiha (1), Al-Baqarah (2), Ya-Sin (36), Al-Ikhlas (112), An-Nas (114)", "Key events: Hijrah 622 CE (start of Islamic calendar), Battle of Badr 2 AH, Conquest of Makkah 8 AH, Khilafat-e-Rashida end 661 CE", "Islamic calendar months: Muharram, Safar, Rabi al-Awwal, Rabi al-Thani, Jumada al-Ula, Jumada al-Akhirah, Rajab, Shaban, Ramadan, Shawwal, Dhul-Qadah, Dhul-Hijjah"],
    references: [
      { type: "book", title: "Islamiyat for CSS", authors: "Khadim Hussain Chandio", publisher: "Caravan Book House" },
      { type: "book", title: "The Holy Quran (translation)", authors: "Abdullah Yusuf Ali" },
      { type: "syllabus", title: "CSS Islamic Studies syllabus", authors: "FPSC" }
    ]
  },
  english: {
    overview: "English is the language of governance, judiciary and higher education in Pakistan and the compulsory medium of CSS/competitive exams — testing grammar, vocabulary, comprehension and precis/writing skills.",
    exam_tips: ["CSS English: precis & composition (100 marks), grammar and sentence structure carry heavy weight", "Common traps: subject-verb agreement, tense consistency, dangling modifiers, British vs American spelling"],
    classifications: ["Parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection", "Tenses: 12 (present/past/future × simple/continuous/perfect/perfect-continuous)", "Sentence types: simple, compound, complex, compound-complex"],
    misconceptions: ["'I' comes before 'me' in all compound subjects — it depends on grammatical role, e.g. 'between you and me' is correct"],
    references: [
      { type: "book", title: "Practical English Grammar", authors: "A.J. Thomson & A.V. Martinet", publisher: "Oxford University Press" },
      { type: "book", title: "Word Power Made Easy", authors: "Norman Lewis", publisher: "Doubleday" }
    ]
  },
  grammar: {
    overview: "Grammar covers sentence structure, parts of speech, tenses, voice, narration, clauses and punctuation as tested in competitive exams and school assessments.",
    formulas: ["Active voice → passive: object becomes subject; be + past participle", "Simple past: subject + V2; Present perfect: subject + have/has + V3"],
    classifications: ["Nouns: proper, common, collective, abstract, material", "Pronouns: personal, possessive, reflexive, demonstrative, relative, interrogative, indefinite", "Conjunctions: coordinating (FANBOYS), subordinating, correlative"],
    misconceptions: ["'Less' vs 'fewer': fewer for countable nouns, less for uncountable ('fewer people, less water')"],
    exam_tips: ["Always match singular subjects with singular verbs even with intervening phrases", "Preposition pairs: consist of, depend on, prevent from, accused of"],
    references: [
      { type: "book", title: "Wren & Martin High School English Grammar", authors: "Wren & Martin", publisher: "S. Chand" },
      { type: "book", title: "English Grammar in Use", authors: "Raymond Murphy", publisher: "Cambridge University Press" }
    ]
  },
  vocabulary: {
    overview: "Vocabulary builds word knowledge — synonyms, antonyms, one-word substitutions, idioms, root-word families and contextual usage for entrance and competitive exams.",
    exam_tips: ["Study root words: bene- (good), mal- (bad), dict- (say), scrib/script- (write), jur/jus- (law)", "High-frequency CSS words: ephemeral, ubiquitous, pragmatic, ostensible, laconic, meticulous"],
    references: [
      { type: "book", title: "Word Power Made Easy", authors: "Norman Lewis", publisher: "Doubleday" },
      { type: "book", title: "A Modern Approach to English Vocabulary", authors: "R.S. Aggarwal" }
    ]
  },
  synonyms: {
    overview: "Synonym questions test the ability to identify words with identical or near-identical meaning — the foundation of reading comprehension and precis.",
    exam_tips: ["When unsure, choose the option closest in register (formality) and connotation to the stem word", "Practise negative-prefix families: in-, un-, dis-, im-, ir-, il-"],
    misconceptions: ["Synonyms are perfectly interchangeable — most have nuance; e.g. 'famous' vs 'notorious'"],
    references: [
      { type: "book", title: "Roget's Thesaurus of English Words and Phrases", authors: "Peter Mark Roget" },
      { type: "book", title: "Merriam-Webster Dictionary of Synonyms" }
    ]
  },
  antonyms: {
    overview: "Antonym questions test opposite meanings, commonly built with prefixes or drawn from academic word pairs.",
    exam_tips: ["Prefix opposites: legal/illegal, possible/impossible, relevant/irrelevant, sane/insane, reversible/irreversible", "Watch for pairs: ephemeral/perennial, taciturn/garrulous, frugal/prodigal"],
    references: [
      { type: "book", title: "Word Power Made Easy", authors: "Norman Lewis", publisher: "Doubleday" }
    ]
  },
  idioms: {
    overview: "Idioms and phrases test figurative expressions common in English — their meanings, origins and correct usage in sentences.",
    exam_tips: ["Learn idioms by theme: time (once in a blue moon), money (cost an arm and a leg), conflict (burn the midnight oil)"],
    references: [
      { type: "book", title: "Oxford Dictionary of English Idioms", authors: "John Ayto", publisher: "Oxford University Press" }
    ]
  },
  comprehension: {
    overview: "Comprehension tests reading speed and accuracy: main idea, inference, tone, vocabulary-in-context and detail questions over unseen passages.",
    exam_tips: ["Read the questions before the passage to target scanning", "Inference questions need evidence in text — never outside knowledge", "Tone words: ironic, nostalgic, didactic, ambivalent"],
    references: [
      { type: "book", title: "A Modern Approach to Verbal & Non-Verbal Reasoning", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  "sentence-correction": {
    overview: "Sentence correction tests the identification of grammatical, structural and stylistic errors — the highest-yield grammar section in NTS/CSS papers.",
    classifications: ["Error types: agreement, tense, parallelism, modifiers (dangling), pronoun reference, articles, prepositions, redundancy"],
    exam_tips: ["Check subject-verb agreement first, then tense sequence, then modifier placement", "Parallel structures: 'not only X but also Y' requires matching forms"],
    references: [
      { type: "book", title: "English Grammar in Use", authors: "Raymond Murphy", publisher: "Cambridge University Press" }
    ]
  },
  "english-literature": {
    overview: "English Literature covers British and world literary movements, major authors, works, poetic forms and literary devices for BA-level and lecturer exams.",
    classifications: ["Literary periods: Renaissance, Restoration, Romantic, Victorian, Modern, Postmodern", "Poetic forms: sonnet, ode, elegy, ballad, epic, haiku, free verse", "Major authors: Shakespeare, Milton, Wordsworth, Keats, Dickens, Eliot, Woolf"],
    misconceptions: ["Shakespeare wrote only plays — he also wrote 154 sonnets and narrative poems"],
    exam_tips: ["Link authors to works: Shakespeare (Hamlet, Macbeth), Milton (Paradise Lost), Dickens (Great Expectations), Orwell (1984)"],
    references: [
      { type: "book", title: "A History of English Literature", authors: "Arthur Compton-Rickett" },
      { type: "book", title: "The Norton Anthology of English Literature", authors: "S. Greenblatt et al.", publisher: "W.W. Norton" }
    ]
  },
  urdu: {
    overview: "Urdu covers Urdu literature, grammar (qawaid), poetry forms, prose and prominent Urdu poets and writers — compulsory in CSS (200 marks) and provincial exams.",
    classifications: ["Poetic forms: ghazal, nazm, qasida, marsiya, rubai", "Prominent poets: Mir Taqi Mir, Ghalib, Iqbal, Faiz Ahmed Faiz", "Prose forms: afsana (short story), novel, drama, khaka (sketch), safarnama"],
    exam_tips: ["Urdu grammar: ism, feil, siffat; haroof-e-jar; the art of iqtabas (quotation) in essays", "CSS Urdu: one paper of grammar + essay + précis"],
    misconceptions: ["Urdu was always Pakistan's official language — English remained a co-official language for decades"],
    references: [
      { type: "book", title: "Urdu Qawaid aur Insha", authors: "Moinuddin Aqeel" },
      { type: "book", title: "Kulliyat-e-Iqbal (metadata)", authors: "Allama Muhammad Iqbal" }
    ]
  },
  essay: {
    overview: "Essay writing tests structured argumentation: introduction, thesis, body paragraphs and conclusion with unity, coherence and correct language.",
    exam_tips: ["CSS essay: 100 marks, 4 hours, ~2500-3000 words; outline carries marks", "Use the PAIR formula: Problem-Analysis-Impact-Resolution in body paragraphs"],
    references: [
      { type: "book", title: "CSS Essay Writing", authors: "M. Akmal Qadri" }
    ]
  },
  mathematics: {
    overview: "Mathematics covers arithmetic, algebra, geometry, trigonometry, calculus and statistics fundamentals tested in CSS General Ability, NTS, ECAT and aptitude papers.",
    formulas: ["Quadratic formula: x = (-b ± √(b²-4ac)) / 2a", "Compound interest: A = P(1 + r/n)^(nt)", "Pythagoras: a² + b² = c²", "sin²θ + cos²θ = 1", "Slope: m = (y2-y1)/(x2-x1)", "Sum of n terms of AP: Sn = n/2 (2a + (n-1)d)"],
    classifications: ["Number systems: natural, whole, integers, rational, irrational, real, complex", "Polynomials: linear (degree 1), quadratic (2), cubic (3)", "Sequences: arithmetic (common difference), geometric (common ratio)"],
    misconceptions: ["0 is not a natural number in standard convention — some curricula include it; CSS convention excludes it", "√(a²) = a for all a — it equals |a|"],
    exam_tips: ["BODMAS/BIDMAS order of operations is a frequent trap", "Percentages: increase = (new-old)/old × 100; successive changes compound", "Factorization families: (a+b)², (a-b)², a²-b², (a+b)³"],
    references: [
      { type: "book", title: "Basic Mathematics", authors: "M. Shahid Nadeem", publisher: "Caravan Book House" },
      { type: "book", title: "Higher Algebra", authors: "Hall & Knight" },
      { type: "book", title: "CSS Solved Mathematics (General Ability)", authors: "R.M. Cheema" }
    ],
    prerequisites: [["arithmetic", "algebra"], ["algebra", "trigonometry"], ["trigonometry", "calculus"]],
    paths: [{ name: "CSS GA Mathematics Path", target_exam: "css-exam", steps: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics"] }]
  },
  statistics: {
    overview: "Statistics covers data collection, measures of central tendency and dispersion, probability, distributions, correlation, regression and hypothesis testing.",
    formulas: ["Mean = Σx/n", "Variance σ² = Σ(x-μ)²/n", "Standard deviation σ = √variance", "z-score = (x-μ)/σ", "Correlation r = Σ(x-x̄)(y-ȳ) / √(Σ(x-x̄)² Σ(y-ȳ)²)", "Binomial probability: P(X=k) = C(n,k) p^k (1-p)^(n-k)"],
    classifications: ["Data types: nominal, ordinal, interval, ratio", "Averages: mean, median, mode", "Distributions: normal, binomial, Poisson, uniform", "Sampling: simple random, stratified, cluster, systematic"],
    misconceptions: ["Correlation implies causation — correlation only measures association", "The mean is always a good average — it is distorted by outliers; median is robust"],
    exam_tips: ["Coefficient of variation = σ/mean × 100 for comparing variability", "Normal curve: 68-95-99.7 rule within 1/2/3 standard deviations"],
    references: [
      { type: "book", title: "Introduction to Statistical Theory Part I & II", authors: "Sher Muhammad Chaudhry", publisher: "Ilmi Kitab Khana" },
      { type: "book", title: "Statistics for Management and Economics", authors: "Keller & Warrack" }
    ],
    prerequisites: [["descriptive-statistics", "probability"], ["probability", "inferential-statistics"]]
  },
  physics: {
    overview: "Physics covers mechanics, heat, light, sound, electricity, magnetism, atomic and nuclear physics with quantitative problem-solving — for FSC-level and MDCAT/ECAT entry tests.",
    formulas: ["F = ma (Newton's 2nd law)", "v = u + at; s = ut + ½at²; v² = u² + 2as", "KE = ½mv²; PE = mgh", "E = mc² (mass-energy)", "F = Gm₁m₂/r² (gravitation)", "Ohm's law: V = IR", "Power = W/t; P = VI", "F = qvB (magnetic force)", "1/f = 1/v + 1/u (lens formula)"],
    classifications: ["Energy forms: kinetic, potential, thermal, chemical, nuclear, electromagnetic", "Waves: transverse (light) vs longitudinal (sound)", "Circuits: series (current same) vs parallel (voltage same)", "Nuclear: fission (split) vs fusion (combine)"],
    misconceptions: ["Heavier objects fall faster — in vacuum all objects fall at g regardless of mass", "Current flows from negative to positive in a battery — conventional current flows positive to negative, electrons opposite", "Ice at 0°C and water at 0°C have same energy — water at 0°C has more heat (latent heat absorbed)"],
    exam_tips: ["Units: SI — newton (N), joule (J), watt (W), tesla (T), farad (F)", "Light year is a unit of distance, not time", "Speed of light 3×10⁸ m/s; speed of sound ~343 m/s in air"],
    references: [
      { type: "book", title: "Concepts of Physics", authors: "H.C. Verma", publisher: "Bharati Bhawan" },
      { type: "book", title: "Fundamentals of Physics", authors: "Halliday, Resnick & Walker", publisher: "Wiley" },
      { type: "book", title: "Physics for Class XI-XII", authors: "Punjab Textbook Board" }
    ],
    prerequisites: [["mechanics", "waves"], ["waves", "optics"], ["electricity", "electromagnetism"]],
    paths: [{ name: "Physics Mastery Path", target_exam: "mdcat", steps: ["Measurement", "Mechanics", "Waves & Sound", "Optics", "Electricity & Magnetism", "Modern Physics"] }]
  },
  chemistry: {
    overview: "Chemistry covers atomic structure, periodic table, bonding, stoichiometry, acids-bases, organic chemistry, and physical chemistry — central to MDCAT and FSC exams.",
    formulas: ["Moles = mass / molar mass", "Molarity M = moles / litres", "pH = -log[H⁺]", "Ideal gas: PV = nRT", "Dilution: M₁V₁ = M₂V₂", "Enthalpy ΔH = q_p (heat at constant pressure)"],
    classifications: ["Bonding: ionic, covalent, metallic, hydrogen bonds", "Organic families: alkanes, alkenes, alkynes, alcohols, carboxylic acids, amines", "Acids/bases: Arrhenius, Brønsted-Lowry, Lewis", "Periodic trends: atomic radius, electronegativity, ionization energy"],
    misconceptions: ["Water is a good conductor — pure water conducts poorly; ions make it conductive", "pH 7 is always neutral — only at 25°C; at other temperatures neutrality shifts"],
    exam_tips: ["Electronegativity order: F > O > N > Cl > Br > I", "IUPAC naming priorities: longest chain, lowest locant set", "Avogadro's number: 6.022×10²³"],
    references: [
      { type: "book", title: "Chemistry for Class XI-XII", authors: "Punjab Textbook Board" },
      { type: "book", title: "Organic Chemistry", authors: "Morrison & Boyd", publisher: "Prentice Hall" },
      { type: "book", title: "Physical Chemistry", authors: "P.W. Atkins", publisher: "Oxford University Press" }
    ],
    prerequisites: [["atomic-structure", "chemical-bonding"], ["chemical-bonding", "organic-chemistry"]]
  },
  biology: {
    overview: "Biology covers cell biology, genetics, evolution, physiology, ecology and biodiversity — core of MDCAT, FSC and medical entrance preparation.",
    classifications: ["Cell organelles and functions: nucleus (genetics), mitochondria (energy), ribosome (protein), Golgi (packaging)", "Kingdoms: Monera, Protista, Fungi, Plantae, Animalia (5-kingdom Whittaker)", "Genetic codes: DNA bases A-T, G-C; RNA A-U", "Plant systems: xylem (water up), phloem (food both ways)"],
    misconceptions: ["Humans use only 10% of their brains — no physiological evidence supports this", "All bacteria are harmful — many are beneficial (gut flora, nitrogen fixers)"],
    exam_tips: ["Mitosis (somatic, 2n→2n) vs meiosis (germ cells, 2n→n)", "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in chloroplasts)", "Human chromosomes: 46 (23 pairs); XX female, XY male"],
    references: [
      { type: "book", title: "Biology for Class XI-XII", authors: "Punjab Textbook Board" },
      { type: "book", title: "Campbell Biology", authors: "Urry, Cain, Wasserman", publisher: "Pearson" }
    ],
    prerequisites: [["cell-biology", "genetics"], ["genetics", "evolution"]]
  },
  botany: {
    overview: "Botany covers plant anatomy, physiology, taxonomy, ecology and economic botany for BSc and lecturer exams.",
    classifications: ["Plant groups: algae, bryophytes, pteridophytes, gymnosperms, angiosperms", "Angiosperms: monocots (parallel veins) vs dicots (reticulate veins)", "Plant hormones: auxin (growth), gibberellin (stem), cytokinin (division), ABA (stress)"],
    exam_tips: ["Transpiration cools and drives water uptake; stomata regulate gas exchange", "Photosynthesis pigments: chlorophyll a, b, carotenoids"],
    references: [
      { type: "book", title: "A Textbook of Botany", authors: "S.M. Ghulam Mustafa" },
      { type: "book", title: "Plant Physiology", authors: "Taiz & Zeiger" }
    ]
  },
  zoology: {
    overview: "Zoology covers animal taxonomy, anatomy, physiology, embryology and ecology.",
    classifications: ["Phyla: Porifera, Cnidaria, Platyhelminthes, Nematoda, Annelida, Mollusca, Arthropoda, Echinodermata, Chordata", "Vertebrate classes: fish, amphibians, reptiles, birds, mammals"],
    exam_tips: ["Arthropods are the largest phylum (insects dominate)", "Mammal features: hair, mammary glands, diaphragm, warm-blooded"],
    references: [
      { type: "book", title: "A Textbook of Zoology", authors: "E.L. Jordan & P.S. Verma", publisher: "S. Chand" }
    ]
  },
  medicine: {
    overview: "Medicine (Internal Medicine) covers clinical diagnosis and management of adult diseases: cardiovascular, respiratory, GI, renal, endocrine, infectious and systemic disorders — for MBBS and MDCAT-level clinical foundations.",
    classifications: ["Cardiovascular: IHD, hypertension, heart failure, arrhythmias", "Respiratory: asthma, COPD, pneumonia, TB", "Endocrine: diabetes mellitus, thyroid disorders", "Infectious: viral hepatitis, dengue, typhoid, malaria", "Rheumatology: RA, SLE, gout"],
    misconceptions: ["Diabetes is only Type 2 in adults — Type 1 and MODY occur in adults too", "Fever alone means infection — non-infectious causes (malignancy, autoimmune) also present"],
    exam_tips: ["Hypertension stages per JNC/ACC-AHA guidelines: normal <120/80, elevated 120-129/<80, stage 1 130-139/80-89, stage 2 ≥140/90", "Diabetic emergencies: DKA (Type 1, ketones, acidosis), HHS (Type 2, very high glucose)", "TB treatment: 2HRZE + 4HR directly observed therapy"],
    references: [
      { type: "book", title: "Davidson's Principles and Practice of Medicine", authors: "Stuart Ralston et al.", publisher: "Elsevier" },
      { type: "book", title: "Harrison's Principles of Internal Medicine", authors: "Kasper, Fauci et al.", publisher: "McGraw-Hill" }
    ]
  },
  surgery: {
    overview: "Surgery covers pre-operative assessment, wound management, abdominal, vascular and trauma surgery, surgical infections and principles of operative care.",
    classifications: ["Wound healing: primary, secondary, tertiary intention", "Abdominal emergencies: appendicitis, cholecystitis, obstruction, perforation", "Hernias: inguinal (most common), femoral, umbilical, incisional"],
    misconceptions: ["Appendicitis always presents in the right iliac fossa — retrocaecal appendix can cause flank/back pain"],
    exam_tips: ["Classic appendicitis: periumbilical pain migrating to RLQ + rebound tenderness", "Cholecystitis: RUQ pain, Murphy's sign positive, gallstones on ultrasound", "Bowel obstruction: colicky pain + vomiting + distension + constipation (no flatus)"],
    references: [
      { type: "book", title: "Bailey & Love's Short Practice of Surgery", authors: "Norman S. Williams et al.", publisher: "CRC Press" }
    ]
  },
  anatomy: {
    overview: "Anatomy covers gross and systemic human anatomy: bones, muscles, nerves, blood vessels and organs — foundational for MBBS/BDS exams.",
    classifications: ["Body regions: head & neck, thorax, abdomen, pelvis, upper limb, lower limb", "Tissues: epithelial, connective, muscle, nervous", "Skull bones: neurocranium (8) + viscerocranium (14)"],
    exam_tips: ["Brachial plexus: roots C5-T1; 'Rob Tucks Ducks And Cooks' mnemonic", "Cranial nerves: 12 pairs — olfactory (I) to hypoglossal (XII); 'Ooh Ooh Ooh To Touch And Feel Very Green Vegetables AH'", "Lumbar spine: 5 vertebrae; cervical 7, thoracic 12, sacral 5 fused, coccyx 3-5"],
    references: [
      { type: "book", title: "Gray's Anatomy for Students", authors: "Drake, Vogl, Mitchell", publisher: "Elsevier" },
      { type: "book", title: "B.D. Chaurasia's Human Anatomy", authors: "B.D. Chaurasia", publisher: "CBS Publishers" }
    ]
  },
  physiology: {
    overview: "Physiology explains normal body function: cardiovascular, respiratory, renal, endocrine, nervous, muscular and GI physiology.",
    formulas: ["Cardiac output = heart rate × stroke volume", "MAP = diastolic + 1/3(systolic - diastolic)", "GFR ~ 125 mL/min; filtration fraction ~20%", "Nernst equation: E = 61 log([ion]out/[ion]in) mV (monovalent)"],
    classifications: ["Blood cells: RBC (oxygen), WBC (immunity), platelets (clotting)", "Hormone classes: peptide (cell surface receptors) vs steroid (nuclear receptors)", "Nephron segments: glomerulus (filtration), PCT (reabsorption), loop (concentration), DCT (fine-tuning)"],
    misconceptions: ["Pulse rate equals heart rate always — true normally, but arrhythmias (AF) cause pulse deficit"],
    exam_tips: ["Starling forces drive capillary exchange; edema occurs when filtration exceeds absorption", "Action potential: Na⁺ in, K⁺ out; threshold -55 mV; RMP ≈ -70 mV"],
    references: [
      { type: "book", title: "Guyton and Hall Textbook of Medical Physiology", authors: "John E. Hall", publisher: "Elsevier" },
      { type: "book", title: "Ganong's Review of Medical Physiology", authors: "Barrett et al.", publisher: "McGraw-Hill" }
    ]
  },
  pathology: {
    overview: "Pathology covers the mechanisms of disease: cell injury, inflammation, neoplasia, genetic and metabolic disorders, and diagnostic pathology.",
    classifications: ["Cell injury: reversible (swelling) vs irreversible (necrosis, apoptosis)", "Inflammation: acute (neutrophils) vs chronic (lymphocytes, macrophages)", "Necrosis types: coagulative, liquefactive, caseous (TB), fat, gangrenous"],
    misconceptions: ["Cancer is a single disease — hundreds of types with distinct molecular profiles"],
    exam_tips: ["Metaplasia: reversible change; dysplasia: premalignant; neoplasia: autonomous growth", "TNM staging: tumor, node, metastasis; grading reflects differentiation"],
    references: [
      { type: "book", title: "Robbins and Cotran Pathologic Basis of Disease", authors: "Kumar, Abbas, Aster", publisher: "Elsevier" }
    ]
  },
  pharmacology: {
    overview: "Pharmacology covers drug classification, mechanisms of action, pharmacokinetics, pharmacodynamics, adverse effects and therapeutic uses.",
    classifications: ["Drug classes: antibiotics (penicillins, cephalosporins, macrolides), analgesics (NSAIDs, opioids), antihypertensives (ACEi, ARBs, CCBs, beta-blockers), antidiabetics (metformin, insulin, SGLT2i)", "Antibiotic mechanism: cell wall (beta-lactams), protein synthesis (macrolides, tetracyclines), DNA (quinolones)", "Routes: oral, IV, IM, SC, sublingual, transdermal"],
    misconceptions: ["Antibiotics cure viral infections — they act on bacteria only"],
    exam_tips: ["Aspirin: antiplatelet at low dose, analgesic/anti-inflammatory at high dose", "Paracetamol toxicity → N-acetylcysteine antidote; hepatotoxicity", "ACE inhibitors cough; statins myopathy; metformin lactic acidosis (rare)"],
    references: [
      { type: "book", title: "Lippincott Illustrated Reviews: Pharmacology", authors: "Whalen, Finkel, Panavelil", publisher: "Wolters Kluwer" },
      { type: "book", title: "Basic & Clinical Pharmacology", authors: "Bertram G. Katzung", publisher: "McGraw-Hill" }
    ]
  },
  microbiology: {
    overview: "Microbiology covers bacteria, viruses, fungi, parasites, immunology basics and infection control.",
    classifications: ["Gram staining: Gram+ (thick peptidoglycan, purple) vs Gram- (thin, pink)", "Bacteria of importance: Staph, Strep, E. coli, Salmonella, Vibrio cholerae, M. tuberculosis", "Viruses: DNA (Herpes, Hep B) vs RNA (Hep C, HIV, Influenza, Dengue)", "Parasites: Plasmodium (malaria), Entamoeba, Giardia"],
    misconceptions: ["Hepatitis A is transmitted by blood like B/C — it is faecal-oral"],
    exam_tips: ["TB: acid-fast bacilli, Ziehl-Neelsen stain, chest X-ray, IGRA tests", "Dengue: Aedes aegypti mosquito; thrombocytopenia hallmark", "Cholera: rice-water stools, massive fluid loss, ORS/IV rehydration"],
    references: [
      { type: "book", title: "Medical Microbiology", authors: "Murray, Rosenthal, Pfaller", publisher: "Elsevier" },
      { type: "book", title: "Clinical Microbiology Made Ridiculously Simple", authors: "Gladwin & Trattler" }
    ]
  },
  biochemistry: {
    overview: "Biochemistry covers biomolecules, enzymes, metabolism, molecular biology and clinical biochemistry.",
    formulas: ["Enzyme kinetics: V = Vmax[S]/(Km + [S])", "Free energy: ΔG = ΔH - TΔS"],
    classifications: ["Biomolecules: carbohydrates, lipids, proteins, nucleic acids", "Metabolism: glycolysis (cytosol), Krebs/TCA (mitochondria), oxidative phosphorylation", "Enzyme classes: oxidoreductases, transferases, hydrolases, lyases, isomerases, ligases"],
    misconceptions: ["ATP is stored in large amounts — ATP is made on demand; stored energy is glycogen/fat"],
    exam_tips: ["Glycolysis: 2 ATP net, 2 NADH; Krebs: 2 ATP, 6 NADH, 2 FADH2 per glucose", "Insulin lowers glucose; glucagon raises it; glycogenolysis vs gluconeogenesis"],
    references: [
      { type: "book", title: "Harper's Illustrated Biochemistry", authors: "Rodwell, Bender et al.", publisher: "McGraw-Hill" },
      { type: "book", title: "Biochemistry", authors: "Lubert Stryer", publisher: "W.H. Freeman" }
    ]
  },
  pediatrics: {
    overview: "Pediatrics covers child growth and development, immunisation, common childhood illnesses, neonatology and paediatric emergencies.",
    classifications: ["Immunisation (EPI Pakistan): BCG at birth, OPV/IPV, Pentavalent, PCV, Measles/Rubella at 9 months", "Growth: weight doubles by 5 months, triples by 1 year"],
    exam_tips: ["Normal newborn: birth weight ~3 kg (2.5-4), length ~50 cm, head ~35 cm", "Childhood dehydration: mild (3-5%), moderate (6-9%), severe (10%+)", "Jaundice in newborn: physiological (after 24h, resolves by 2 weeks) vs pathological"],
    references: [
      { type: "book", title: "Nelson Textbook of Pediatrics", authors: "Kliegman et al.", publisher: "Elsevier" }
    ]
  },
  gynecology: {
    overview: "Gynecology & Obstetrics covers pregnancy care, labour, gynaecological disorders, contraception and reproductive health.",
    classifications: ["Pregnancy trimesters; GTPAL obstetrics history system", "Contraception: barrier, hormonal (COCP, implants), IUD, sterilisation", "Gynaecological masses: fibroids (leiomyoma), ovarian cysts, endometriosis"],
    misconceptions: ["Caesarean is always safer than vaginal delivery — vaginal is preferred when safe"],
    exam_tips: ["Normal gestation 40 weeks; first fetal movements ~18-20 weeks", "Preeclampsia: hypertension + proteinuria after 20 weeks; magnesium sulfate for eclampsia", "APH causes: placenta praevia (painless) vs abruption (painful)"],
    references: [
      { type: "book", title: "Williams Obstetrics", authors: "Cunningham et al.", publisher: "McGraw-Hill" },
      { type: "book", title: "Shaw's Textbook of Gynaecology", authors: "Padubidri & Daftary", publisher: "Elsevier" }
    ]
  },
  ophthalmology: {
    overview: "Ophthalmology covers eye anatomy, refractive errors, cataract, glaucoma, retinal disease and ocular emergencies.",
    classifications: ["Refractive errors: myopia (concave lens), hypermetropia (convex), astigmatism", "Cataract types: age-related (nuclear sclerosis), congenital, traumatic"],
    exam_tips: ["Glaucoma: raised IOP (>21 mmHg), optic disc cupping, visual field loss; acute angle-closure = emergency", "Diabetic retinopathy leading cause of blindness in working-age adults", "Red eye causes: conjunctivitis, keratitis, iritis, acute glaucoma"],
    references: [
      { type: "book", title: "Parson's Diseases of the Eye", authors: "Sihota & Tandon", publisher: "Elsevier" }
    ]
  },
  ent: {
    overview: "ENT covers ear, nose and throat anatomy, hearing loss, sinusitis, tonsillitis, otitis media and head-neck conditions.",
    classifications: ["Hearing loss: conductive (outer/middle ear) vs sensorineural (cochlea/nerve)", "Otitis media: acute, chronic suppurative, serous", "Tonsillar grades: I-IV by oropharyngeal obstruction"],
    exam_tips: ["Rinne & Weber tuning fork tests differentiate conductive vs sensorineural loss", "Epistaxis: Little's area (Kiesselbach plexus) most common source", "Foreign body in ear/nose: common paediatric emergency"],
    references: [
      { type: "book", title: "Scott-Brown's Otorhinolaryngology", authors: "Gleeson et al.", publisher: "CRC Press" }
    ]
  },
  "community-medicine": {
    overview: "Community Medicine (Public Health) covers epidemiology, biostatistics, environmental health, nutrition, maternal-child health and health systems in Pakistan.",
    formulas: ["Incidence = new cases / population at risk over time", "Prevalence = all existing cases / population", "Attack rate = exposed cases / exposed population", "Crude birth rate = live births / mid-year population × 1000"],
    classifications: ["Epidemiological study designs: cross-sectional, case-control, cohort, RCT", "Prevention: primary (vaccination), secondary (screening), tertiary (treatment/rehab)", "Waterborne diseases: cholera, typhoid, hepatitis A/E"],
    misconceptions: ["Herd immunity needs 100% vaccination — 85-95% for most vaccines suffices"],
    exam_tips: ["EPI Pakistan schedule & WHO Expanded Programme are heavily tested", "Social determinants: poverty, education, housing, sanitation drive disease burden"],
    references: [
      { type: "book", title: "Parks Textbook of Preventive and Social Medicine", authors: "K. Park", publisher: "Banarsidas Bhanot" },
      { type: "book", title: "Community Medicine", authors: "Muhammad Ilyas" }
    ]
  },
  "public-health": {
    overview: "Public Health applies epidemiology, health policy, environmental health and health promotion to population-level disease prevention.",
    classifications: ["Levels of prevention: primordial, primary, secondary, tertiary", "Health indicators: IMR, MMR, life expectancy, under-5 mortality"],
    exam_tips: ["Pakistan health indicators are exam favourites: IMR ~55-60/1000, MMR ~180/100,000 (NDHS trends)", "Disease surveillance: passive vs active; outbreak investigation steps"],
    references: [
      { type: "book", title: "Essentials of Public Health", authors: "B. Turnock" },
      { type: "syllabus", title: "WHO Global Health Observatory data", authors: "WHO" }
    ]
  },
  "forensic-medicine": {
    overview: "Forensic Medicine covers medicolegal aspects: death examination, poisoning, sexual offences, identification and medical jurisprudence.",
    classifications: ["Death types: natural, accidental, suicidal, homicidal; signs: rigor mortis, algor mortis, livor mortis", "Poisoning: organophosphates (pesticides), opioids, methanol; antidotes", "Asphyxial deaths: hanging, strangulation, suffocation, drowning"],
    misconceptions: ["Rigor mortis begins immediately — it starts 1-2 hours after death, full by 6-12 hours"],
    exam_tips: ["Time since death estimation is a classic question (rigor 6-12h full, livor 1-2h onset)", "Methanol poisoning: antifreeze/adulterated liquor; fomepizole/ethanol + dialysis", "Organophosphate: miosis, salivation, muscle fasciculations; atropine + pralidoxime"],
    references: [
      { type: "book", title: "The Essentials of Forensic Medicine & Toxicology", authors: "K.S. Narayan Reddy", publisher: "K.S. Reddy" }
    ]
  },
  nutrition: {
    overview: "Nutrition & Dietetics covers macronutrients, micronutrients, dietary requirements, malnutrition and therapeutic diets.",
    classifications: ["Macronutrients: carbohydrates (4 kcal/g), proteins (4), fats (9)", "Vitamins: fat-soluble (A, D, E, K) vs water-soluble (B, C)", "Malnutrition: underweight, stunting, wasting, micronutrient deficiency"],
    exam_tips: ["Vitamin D: calcium absorption, deficiency → rickets/osteomalacia; source: sunlight", "Iron deficiency anaemia: microcytic hypochromic; sources: red meat, legumes", "Overnutrition: obesity BMI ≥30; central obesity risk for metabolic syndrome"],
    references: [
      { type: "book", title: "Krause's Food & the Nutrition Care Process", authors: "Mahan & Raymond", publisher: "Elsevier" }
    ]
  },
  nursing: {
    overview: "Nursing covers patient care fundamentals, medical-surgical nursing, community health nursing, pharmacology and nursing ethics.",
    classifications: ["Care plans: assessment, diagnosis, planning, implementation, evaluation (ADPIE)", "Vital signs and their normal ranges", "Wound care: clean, contaminated, infected categories"],
    exam_tips: ["Normal vitals: BP 120/80, pulse 60-100, RR 12-20, temp 36.5-37.5°C", "Fall prevention, aspiration precautions and infection control (hand hygiene) are standard questions"],
    references: [
      { type: "book", title: "Medical-Surgical Nursing", authors: "Brunner & Suddarth", publisher: "Wolters Kluwer" }
    ]
  },
  "dental-surgery": {
    overview: "Dental Surgery covers oral surgery principles, exodontia, impacted teeth, dental trauma and oral-maxillofacial conditions.",
    classifications: ["Impaction types: mesioangular (most common), distoangular, vertical, horizontal", "Local anaesthesia: lignocaine 2% with adrenaline; maxillary infiltration vs mandibular block"],
    exam_tips: ["Dry socket (alveolar osteitis): post-extraction pain 2-3 days, empty socket, treatment = dressing/analgesia", "Bleeding after extraction: pressure, sutures, haemostatic agents"],
    references: [
      { type: "book", title: "Textbook of Oral & Maxillofacial Surgery", authors: "Neelima Anil Malik", publisher: "Jaypee" }
    ]
  },
  "dental-medicine": {
    overview: "Dental Medicine covers oral medicine and diagnosis: oral mucosal lesions, oral manifestations of systemic disease, and oral pathology basics.",
    classifications: ["White lesions: leukoplakia, lichen planus, candidiasis", "Ulcerative lesions: aphthous, herpes, traumatic", "Premalignant: leukoplakia (highest risk), erythroplakia"],
    exam_tips: ["Squamous cell carcinoma is the most common oral malignancy; risk factors: tobacco, areca nut, alcohol", "HIV oral manifestations: candidiasis, hairy leukoplakia, Kaposi sarcoma"],
    references: [
      { type: "book", title: "Burket's Oral Medicine", authors: "Glick, Greenberg et al.", publisher: "Wiley" }
    ]
  },
  "oral-pathology": {
    overview: "Oral Pathology studies diseases of the oral cavity: cysts, tumours, infections, developmental disorders and their microscopic features.",
    classifications: ["Odontogenic cysts: radicular (most common), dentigerous, keratocyst", "Oral tumours: benign (papilloma, fibroma) vs malignant (SCC)", "Developmental anomalies: cleft lip/palate, amelogenesis imperfecta"],
    exam_tips: ["Radicular cyst arises from periapical inflammation; keratocyst has high recurrence", "Ameloblastoma: benign but locally aggressive; classic 'soap bubble' radiograph"],
    references: [
      { type: "book", title: "Shafer's Textbook of Oral Pathology", authors: "Rajendran & Sivapathasundharam", publisher: "Elsevier" }
    ]
  },
  "oral-anatomy": {
    overview: "Oral Anatomy covers teeth morphology, occlusion, dental anatomy and oral cavity structures.",
    classifications: ["Tooth types: incisors (cutting), canines (tearing), premolars (crushing), molars (grinding)", "Permanent set: 32 teeth; deciduous: 20", "Dental formula (permanent human): 2-1-2-3 per quadrant"],
    exam_tips: ["Eruption: central incisors ~6-8 years; third molars ~17-25 years", "Maxillary first molar: three roots; mandibular first molar: two roots"],
    references: [
      { type: "book", title: "Wheeler's Dental Anatomy, Physiology and Occlusion", authors: "Nelson", publisher: "Elsevier" }
    ]
  },
  "oral-histology": {
    overview: "Oral Histology covers microscopic structure of enamel, dentin, pulp, cementum, periodontal ligament and oral mucosa.",
    classifications: ["Enamel: hardest tissue, 96% mineral, non-cellular (ameloblasts gone after eruption)", "Dentin: 70% mineral, living (odontoblast processes); forms throughout life", "Pulp: connective tissue, nerves, vessels"],
    exam_tips: ["Enamel has no collagen and no nerves; cannot regenerate", "Amelogenesis imperfecta vs dentinogenesis imperfecta: enamel vs dentin defect"],
    references: [
      { type: "book", title: "Orban's Oral Histology & Embryology", authors: "Kumar G.S.", publisher: "Elsevier" }
    ]
  },
  "dental-materials": {
    overview: "Dental Materials covers restorative materials, cements, impression materials, alloys and their physical/mechanical properties.",
    classifications: ["Restorations: amalgam (silver-mercury), composite (resin), glass ionomer (fluoride release)", "Cements: zinc oxide eugenol, zinc phosphate, GIC", "Impression materials: alginate (irreversible), silicone, polyether"],
    exam_tips: ["Amalgam: high strength, sets by trituration; mercury toxicity precautions", "Composite bonds to enamel via acid etching (35-37% phosphoric acid)", "GIC releases fluoride — good for cervical lesions and children"],
    references: [
      { type: "book", title: "Phillips' Science of Dental Materials", authors: "Anusavice et al.", publisher: "Elsevier" }
    ]
  },
  economics: {
    overview: "Economics covers microeconomics (markets, firms, consumer behaviour) and macroeconomics (GDP, inflation, fiscal and monetary policy) with Pakistani institutional context.",
    formulas: ["GDP = C + I + G + (X - M)", "Price elasticity of demand = %ΔQ / %ΔP", "Inflation rate = (CPI_new - CPI_old)/CPI_old × 100", "Money multiplier = 1/required reserve ratio"],
    classifications: ["Market structures: perfect competition, monopoly, oligopoly, monopolistic competition", "Costs: fixed, variable, marginal, average", "Fiscal policy: government spending & taxation; monetary: interest rates & money supply (SBP)"],
    misconceptions: ["Higher GDP always means higher welfare — GDP omits inequality, environment and informal economy"],
    exam_tips: ["Pakistan's SBP raises policy rate to fight inflation; CPI is the headline measure", "Laffer curve, Gini coefficient, HDI are standard conceptual questions", "Exchange rate depreciation → exports cheaper, imports dearer"],
    references: [
      { type: "book", title: "Principles of Economics", authors: "N. Gregory Mankiw", publisher: "Cengage" },
      { type: "book", title: "Economics", authors: "Paul Samuelson & William Nordhaus", publisher: "McGraw-Hill" },
      { type: "book", title: "Pakistan Economic Survey (annual)", authors: "Ministry of Finance, Pakistan" }
    ],
    prerequisites: [["supply-and-demand", "market-structures"], ["microeconomics", "macroeconomics"]]
  },
  accounting: {
    overview: "Accounting covers financial accounting: journal, ledger, trial balance, financial statements, and accounting principles for B.Com, CSS and professional exams.",
    formulas: ["Assets = Liabilities + Equity", "Net income = Revenue - Expenses", "Gross profit = Sales - Cost of goods sold", "Working capital = Current assets - Current liabilities", "Current ratio = Current assets / Current liabilities"],
    classifications: ["Financial statements: income statement, balance sheet, cash flow statement, statement of equity", "Accounts types: asset, liability, equity, revenue, expense", "Depreciation methods: straight-line, declining balance, units of production"],
    misconceptions: ["Depreciation reflects market value loss — it is systematic cost allocation, not valuation"],
    exam_tips: ["Debit = assets & expenses; credit = liabilities, equity & revenue (DEAD CLIC mnemonic)", "Cash vs accrual basis: revenue recognised when earned (accrual), not when cash received"],
    references: [
      { type: "book", title: "Financial Accounting", authors: "M.A. Ghani", publisher: "A.H. Publishers" },
      { type: "book", title: "Financial Accounting", authors: "Sohail Afzal" },
      { type: "book", title: "Accounting Principles", authors: "Weygandt, Kimmel, Kieso", publisher: "Wiley" }
    ]
  },
  finance: {
    overview: "Finance covers corporate finance, time value of money, capital budgeting, financial markets, and Islamic finance principles.",
    formulas: ["FV = PV(1+r)^n", "NPV = Σ CF_t/(1+r)^t - initial investment", "Payback period = initial investment / annual cash flow", "WACC = E/V·Re + D/V·Rd(1-T)"],
    classifications: ["Capital budgeting: NPV, IRR, payback, profitability index", "Markets: money market (short-term) vs capital market (long-term)", "Islamic finance: Murabaha, Ijara, Musharaka, Mudaraba, Sukuk"],
    misconceptions: ["IRR always equals cost of capital acceptance — multiple IRRs exist with non-conventional cash flows"],
    exam_tips: ["NPV is the gold-standard decision rule; IRR preferred for communication", "Riba (interest) prohibition in Islamic finance is a frequent ethics question"],
    references: [
      { type: "book", title: "Principles of Corporate Finance", authors: "Brealey, Myers, Allen", publisher: "McGraw-Hill" },
      { type: "book", title: "Fundamentals of Financial Management", authors: "Van Horne & Wachowicz" }
    ]
  },
  "management-accounting": {
    overview: "Management Accounting covers cost behaviour, CVP analysis, budgeting, standard costing, variance analysis and decision-making for management.",
    formulas: ["Break-even units = Fixed costs / (Price - Variable cost per unit)", "Contribution margin = Sales - Variable costs", "Margin of safety = Actual sales - Break-even sales", "Material variance: (Standard price - Actual price) × Actual quantity"],
    classifications: ["Costs: variable, fixed, semi-variable; direct vs indirect", "Budgeting: master, operating (sales, production), financial (cash)", "Standard costing: price & quantity variances (materials, labour, overhead)"],
    misconceptions: ["Fixed costs are always constant — they are fixed within the relevant range only"],
    exam_tips: ["CVP assumptions: linearity, single product or constant mix", "Make-or-buy decisions compare relevant (avoidable) costs only"],
    references: [
      { type: "book", title: "Management and Cost Accounting", authors: "Colin Drury", publisher: "Cengage" },
      { type: "book", title: "Cost Accounting: A Managerial Emphasis", authors: "Horngren, Datar, Rajan", publisher: "Pearson" }
    ]
  },
  auditing: {
    overview: "Auditing covers audit principles, planning, evidence, internal control, audit reports, and professional ethics (with ISA alignment).",
    classifications: ["Audit types: external, internal, government, forensic", "Audit evidence: inspection, observation, inquiry, confirmation, analytical procedures", "Opinions: unqualified, qualified, adverse, disclaimer"],
    misconceptions: ["An unqualified opinion guarantees the accounts are correct — it gives reasonable assurance, not absolute guarantee"],
    exam_tips: ["Materiality guides audit scope; risk = inherent × control × detection", "ISA 700 report structure; management vs auditor responsibility"],
    references: [
      { type: "book", title: "Auditing and Assurance", authors: "Arif & Aman" },
      { type: "book", title: "Auditing: Principles and Practice", authors: "S.D. Sharma" }
    ]
  },
  "auditing-standards": {
    overview: "Auditing Standards covers International Standards on Auditing (ISAs), framework, quality control (ISQC 1), and regulatory framework in Pakistan (ICAP).",
    classifications: ["ISA families: general principles (200s), risk assessment (300s), evidence (500s), reporting (700s)", "Quality control elements: leadership, ethics, acceptance, engagement performance, monitoring"],
    exam_tips: ["ISA 315 risk assessment; ISA 330 responses to assessed risks", "Going concern: ISA 570 — indicators of doubt, disclosure requirements"],
    references: [
      { type: "book", title: "ISA Handbook", authors: "IFAC/IAASB", publisher: "IFAC" }
    ]
  },
  taxation: {
    overview: "Taxation covers Pakistani income tax law (Income Tax Ordinance 2001), sales tax, federal excise, and tax administration (FBR).",
    formulas: ["Taxable income = total income - deductions", "Income tax slabs (salaried vs non-salaried, FY2024-25)", "Withholding taxes: salary, contracts, dividends, interest"],
    classifications: ["Income heads: salary, property, business, capital gains, other sources", "Persons: individual, AOP, company; residents vs non-residents", "Taxes: direct (income, capital value) vs indirect (sales, customs)"],
    misconceptions: ["Tax filers pay more tax — non-filers face higher rates and withholding"],
    exam_tips: ["FBR collects federal taxes; sales tax standard rate 18%", "Return due dates: individual 30 Sep, company 30 Nov (extensions apply)", "Advance tax & withholding are exam staples"],
    references: [
      { type: "book", title: "Income Tax Ordinance 2001 (annotated)", authors: "FBR Pakistan" },
      { type: "book", title: "Concise Income Tax", authors: "M. Arif Choudhary" }
    ]
  },
  law: {
    overview: "Law covers Pakistani constitutional law, criminal law (PPC, CrPC), civil law, Islamic jurisprudence and legal maxims for judiciary and CSS exams.",
    classifications: ["Law types: public vs private; substantive vs procedural", "Constitutional: fundamental rights (Articles 8-28), federal structure, judicial review", "Criminal: offences (PPC 1860), procedure (CrPC 1898), evidence (QSO 1984)"],
    misconceptions: ["A person is guilty until proven innocent — presumption of innocence is a core principle"],
    exam_tips: ["Article 4: right of individuals to be dealt with in accordance with law", "Habeas corpus writ against unlawful detention; Article 199 (High Court) & 184(3) (SC)", "Maxims: audi alteram partem, nemo judex in causa sua"],
    references: [
      { type: "book", title: "Constitutional Law of Pakistan", authors: "Hamid Khan", publisher: "Pakistan Law House" },
      { type: "book", title: "Criminal Procedure Code (CrPC) 1898", authors: "Government of Pakistan" },
      { type: "book", title: "Pakistan Penal Code 1860", authors: "Government of Pakistan" }
    ]
  },
  "business-law": {
    overview: "Business Law covers contracts, company law, partnership, negotiable instruments and consumer protection in Pakistan.",
    classifications: ["Contracts (Contract Act 1872): offer, acceptance, consideration, capacity, free consent", "Companies (Companies Act 2017): private, public, single-member; AGM, directors' duties", "Negotiable instruments (1881): promissory note, bill of exchange, cheque"],
    misconceptions: ["All agreements are contracts — only enforceable agreements are contracts"],
    exam_tips: ["Contract essentials: lawful object, free consent, consideration, capacity", "Cheque bounce: criminal liability under NI Act", "Partnership (Partnership Act 1932): mutual agency principle"],
    references: [
      { type: "book", title: "The Contract Act 1872 (Pakistan)", authors: "Government of Pakistan" },
      { type: "book", title: "Mercantile Law", authors: "M.C. Kuchhal" }
    ]
  },
  psychology: {
    overview: "Psychology covers cognitive, developmental, social, clinical and biological psychology for CSS Psychology and university exams.",
    classifications: ["Schools: psychoanalytic, behaviourist, humanistic, cognitive, biopsychosocial", "Developmental stages: Piaget (cognitive), Erikson (psychosocial), Kohlberg (moral)", "Disorders: anxiety, mood, psychotic, personality (DSM-5/ICD-11)"],
    misconceptions: ["Psychologists prescribe drugs — only psychiatrists (medical doctors) prescribe in Pakistan"],
    exam_tips: ["Classical (Pavlov) vs operant (Skinner) conditioning are guaranteed questions", "Memory: sensory → short-term → long-term; working memory ~7±2 chunks"],
    references: [
      { type: "book", title: "Psychology", authors: "David G. Myers", publisher: "Worth" },
      { type: "book", title: "Psychology: Themes and Variations", authors: "Wayne Weiten" }
    ]
  },
  "behavioral-sciences": {
    overview: "Behavioral Sciences applies psychology, sociology and anthropology to medical practice: doctor-patient relationship, communication, ethics and human development.",
    classifications: ["Behavioural factors in health: adherence, stress, coping, lifestyle", "Communication: verbal/non-verbal, active listening, breaking bad news (SPIKES)", "Ethics: autonomy, beneficence, non-maleficence, justice"],
    exam_tips: ["Defence mechanisms: denial, projection, displacement, rationalisation", "Sigmund Freud stages; Maslow's hierarchy of needs"],
    references: [
      { type: "book", title: "Behavioral Sciences for Medical Students", authors: "M. Hanif" }
    ]
  },
  sociology: {
    overview: "Sociology covers social structure, institutions, culture, social change and Pakistani society for CSS and university exams.",
    classifications: ["Institutions: family, education, religion, economy, polity", "Social stratification: class, caste, status; Weber's dimensions", "Theorists: Durkheim (functionalism), Marx (conflict), Weber (interpretive)"],
    exam_tips: ["Culture: material vs non-material; norms vs values; folkways vs mores", "Pakistani society: joint family, biraderi, urbanisation trends"],
    references: [
      { type: "book", title: "Sociology", authors: "Anthony Giddens", publisher: "Polity Press" },
      { type: "book", title: "Sociology for CSS", authors: "M. Sohail Bhatti" }
    ]
  },
  "political-science": {
    overview: "Political Science covers political theory, comparative politics, international relations and Pakistani political system.",
    classifications: ["Governments: parliamentary vs presidential; unitary vs federal", "Ideologies: liberalism, socialism, fascism, democracy", "State elements: population, territory, government, sovereignty"],
    exam_tips: ["Sovereignty: internal & external; Dicey's rule of law", "Pakistan: parliamentary system under 1973 Constitution; Senate & NA structure"],
    references: [
      { type: "book", title: "Comparative Politics", authors: "Michael Curtis" },
      { type: "book", title: "Introduction to Political Science", authors: "Muhammad Sarwar" }
    ]
  },
  "international-relations": {
    overview: "International Relations covers IR theories, international organisations, foreign policy and Pakistan's foreign relations.",
    classifications: ["Theories: realism, liberalism, constructivism, Marxism", "Organisations: UN, SAARC, SCO, OIC, ASEAN, EU, NATO", "Pakistan foreign policy pillars: China, US, GCC, Muslim world, nuclear deterrence"],
    misconceptions: ["UN Security Council can always enforce resolutions — veto powers limit enforcement"],
    exam_tips: ["UNSC: 5 permanent (China, France, Russia, UK, US) with veto", "Pakistan-China All-Weather Friendship; CPEC flagship", "Nuclear doctrine: credible minimum deterrence, first-use policy debate"],
    references: [
      { type: "book", title: "The Globalization of World Politics", authors: "Baylis, Smith, Owens", publisher: "Oxford University Press" },
      { type: "book", title: "Pakistan's Foreign Policy", authors: "K. Sarwar Hasan" }
    ]
  },
  geography: {
    overview: "Geography covers physical geography, human geography, Pakistan's geography (Indus basin, climate, agriculture) and map skills.",
    classifications: ["Physical: landforms, climate, rivers, oceans", "Pakistan: Indus system, provinces & regions, mountain ranges (Karakoram, Hindukush, Suleiman), deserts (Thar, Cholistan, Thal)", "Human: population, urbanisation, economic geography"],
    misconceptions: ["K2 is in the Himalayas — it is in the Karakoram range"],
    exam_tips: ["Highest peak K2 (8,611m); longest river Indus; largest lake (Manchar); largest desert Thar", "Climate: monsoon (summer), western disturbances (winter)", "Borders: China (north), India (east), Afghanistan (west), Iran (southwest)"],
    references: [
      { type: "book", title: "Geography of Pakistan", authors: "K.U. Kureshy", publisher: "National Book Service" },
      { type: "book", title: "Certificate Physical and Human Geography", authors: "G.C. Leong", publisher: "Oxford" }
    ]
  },
  history: {
    overview: "World History covers ancient civilisations, empires, world wars, decolonisation and the modern world order for CSS and general exams.",
    classifications: ["Ancient: Mesopotamia, Egypt, Indus Valley, China, Greece, Rome", "Modern: Renaissance, Industrial Revolution, WWI (1914-18), WWII (1939-45), Cold War", "Decolonisation: 1947-1975 wave; non-aligned movement"],
    exam_tips: ["WWI causes: militarism, alliances, imperialism, nationalism (MAIN)", "League of Nations failure → UN 1945 (San Francisco)", "Cold War end: fall of Berlin Wall 1989, USSR dissolution 1991"],
    references: [
      { type: "book", title: "A History of the Modern World", authors: "Palmer, Colton, Kramer" },
      { type: "book", title: "The Story of Civilization", authors: "Will Durant" }
    ]
  },
  "world-history": {
    overview: "World History (Global History) surveys major civilisations, empires and events across continents with emphasis on comparative themes.",
    exam_tips: ["Renaissance (14th-17th c), Enlightenment, French Revolution 1789, Russian Revolution 1917", "Colonialism & imperialism: British, French, Spanish empires"],
    references: [
      { type: "book", title: "World Civilizations", authors: "Duiker & Spielvogel", publisher: "Cengage" }
    ]
  },
  "environmental-science": {
    overview: "Environmental Science covers ecosystems, biodiversity, pollution, climate change, environmental law and Pakistan's environmental challenges.",
    classifications: ["Pollution: air (PM, smog), water, soil, noise, plastic", "Ecosystems: terrestrial, aquatic; producers/consumers/decomposers", "Climate: greenhouse gases, CO2, CH4; Pakistan climate vulnerability"],
    misconceptions: ["Climate change is only about warming — it includes shifting rainfall, floods and droughts"],
    exam_tips: ["Pakistan: smog in Punjab (Nov), glacial melt in north, water scarcity, deforestation", "Biodiversity hotspots; IUCN categories; Ramsar wetlands sites"],
    references: [
      { type: "book", title: "Environmental Science", authors: "G. Tyler Miller & Scott Spoolman", publisher: "Cengage" },
      { type: "book", title: "Pakistan Environmental Protection Act 1997", authors: "Government of Pakistan" }
    ]
  },
  agriculture: {
    overview: "Agriculture covers crop science, soil science, plant breeding, agronomy, horticulture and Pakistan's agricultural economy.",
    classifications: ["Crops: food (wheat, rice, maize), cash (cotton, sugarcane), oilseed, pulses", "Soils: types and fertility; NPK fertilisers", "Irrigation: canal, tube-well, drip; waterlogging & salinity issues"],
    misconceptions: ["Cotton is a food crop — it is a cash/fibre crop"],
    exam_tips: ["Pakistan: wheat largest crop by area; cotton backbone of exports", "Kharif (monsoon, summer) vs Rabi (winter) sowing seasons", "Green Revolution: high-yield varieties + fertilisers + irrigation"],
    references: [
      { type: "book", title: "Agronomy", authors: "S.S. Singh" },
      { type: "book", title: "Agriculture in Pakistan", authors: "M. Aslam" }
    ]
  },
  forestry: {
    overview: "Forestry covers forest types, silviculture, forest ecology, wildlife and forest policy in Pakistan.",
    classifications: ["Forest types: coniferous (north), scrub, riverine, mangrove (Indus delta)", "Functions: watershed protection, timber, biodiversity, carbon sink"],
    exam_tips: ["Pakistan forest cover ~5%; mangrove: Indus delta (major restoration success)", "National parks: Khunjerab, Chitral Gol, Lal Suhanra, Hingol"],
    references: [
      { type: "book", title: "Forestry in Pakistan", authors: "M. Sheikh" }
    ]
  },
  veterinary: {
    overview: "Veterinary Science covers animal health, livestock diseases, pharmacology and veterinary public health.",
    classifications: ["Livestock diseases: FMD, anthrax, brucellosis, PPR, avian influenza", "Livestock economy: buffalo, cattle, goat, sheep — dairy & meat sector"],
    exam_tips: ["FMD: vesicular lesions; control via vaccination + movement control", "Zoonoses: brucellosis, TB, anthrax transmit to humans"],
    references: [
      { type: "book", title: "Veterinary Medicine", authors: "Radostits et al." }
    ]
  },
  "programming-fundamentals": {
    overview: "Programming Fundamentals covers variables, data types, control flow, functions, arrays and problem-solving basics in a language-agnostic way.",
    classifications: ["Paradigms: procedural, object-oriented, functional, declarative", "Data types: int, float, char, boolean, string", "Control flow: sequence, selection (if/switch), iteration (loops)"],
    misconceptions: ["= and == are the same — assignment vs equality comparison"],
    exam_tips: ["Variable scope: local vs global; pass by value vs reference", "Time complexity basics: O(1), O(n), O(n²), O(log n)"],
    references: [
      { type: "book", title: "Programming Fundamentals", authors: "Zulfiqar Ali" },
      { type: "book", title: "Clean Code", authors: "Robert C. Martin", publisher: "Prentice Hall" }
    ]
  },
  c: {
    overview: "C covers syntax, pointers, memory management, structures, file handling and standard library for FSC/BCS programming.",
    formulas: ["Array index: base + i × size", "Pointer arithmetic: p + n moves n × sizeof(*p)"],
    classifications: ["Storage classes: auto, register, static, extern", "Memory: stack (auto), heap (malloc/calloc/realloc/free)", "Derived types: arrays, pointers, structs, unions, enums"],
    misconceptions: ["Arrays are passed by value to functions — they decay to pointers"],
    exam_tips: ["printf/scanf format specifiers: %d, %f, %c, %s, %p", "String functions: strlen, strcpy, strcmp, strcat (string.h)", "Operator precedence & short-circuit &&/|| are classic traps"],
    references: [
      { type: "book", title: "The C Programming Language", authors: "Kernighan & Ritchie", publisher: "Prentice Hall" },
      { type: "book", title: "Programming in C", authors: "E. Balagurusamy", publisher: "McGraw-Hill" }
    ]
  },
  cpp: {
    overview: "C++ covers OOP, classes, inheritance, polymorphism, templates, STL and memory management.",
    classifications: ["OOP pillars: encapsulation, inheritance, polymorphism, abstraction", "Polymorphism: compile-time (overloading) vs run-time (virtual functions)", "STL containers: vector, list, map, set, stack, queue"],
    misconceptions: ["Virtual functions are always polymorphic — only via base-class pointers/references"],
    exam_tips: ["Constructor/destructor order; copy vs move semantics", "RAII and smart pointers (unique_ptr, shared_ptr) in modern C++"],
    references: [
      { type: "book", title: "The C++ Programming Language", authors: "Bjarne Stroustrup", publisher: "Addison-Wesley" },
      { type: "book", title: "Effective Modern C++", authors: "Scott Meyers", publisher: "O'Reilly" }
    ]
  },
  csharp: {
    overview: "C# covers .NET syntax, OOP, LINQ, async programming, generics and the .NET ecosystem.",
    classifications: ["Language features: properties, delegates, events, LINQ, async/await", ".NET: CLR, GC, FCL; .NET Core/.NET 8+ cross-platform"],
    exam_tips: ["LINQ: deferred execution; IEnumerable vs IQueryable", "GC: managed memory, IDisposable pattern for unmanaged resources"],
    references: [
      { type: "book", title: "C# in a Nutshell", authors: "Joseph Albahari", publisher: "O'Reilly" }
    ]
  },
  java: {
    overview: "Java covers JVM, OOP, collections, exceptions, concurrency and Spring ecosystem.",
    classifications: ["JVM memory: heap, stack, metaspace; GC generations", "Collections: List, Set, Map; ArrayList vs LinkedList trade-offs", "Java versions: LTS releases 8, 11, 17, 21"],
    misconceptions: ["String is mutable — String is immutable; StringBuilder/StringBuffer are mutable"],
    exam_tips: ["equals vs ==; hashCode contract", "Checked vs unchecked exceptions; try-with-resources", "Synchronisation: synchronized, volatile, concurrent collections"],
    references: [
      { type: "book", title: "Effective Java", authors: "Joshua Bloch", publisher: "Addison-Wesley" },
      { type: "book", title: "Head First Java", authors: "Sierra & Bates", publisher: "O'Reilly" }
    ]
  },
  python: {
    overview: "Python covers syntax, data structures, functions, OOP, modules, and standard library for automation and data work.",
    classifications: ["Data structures: list, tuple, dict, set; mutable vs immutable", "Built-ins: map, filter, reduce, zip, enumerate", "Modules: os, sys, json, re, collections, itertools"],
    misconceptions: ["Python lists and tuples are interchangeable — tuples are immutable and hashable"],
    exam_tips: ["Slicing: [start:stop:step]; negative indices", "GIL limits thread parallelism; multiprocessing for CPU-bound", "PEP 8 naming; f-strings; *args/**kwargs"],
    references: [
      { type: "book", title: "Python Crash Course", authors: "Eric Matthes", publisher: "No Starch Press" },
      { type: "book", title: "Fluent Python", authors: "Luciano Ramalho", publisher: "O'Reilly" }
    ]
  },
  javascript: {
    overview: "JavaScript covers ES6+ syntax, closures, prototypes, async patterns (promises, async/await), DOM and event loop.",
    classifications: ["Types: primitive (string, number, boolean, null, undefined, symbol, bigint) vs object", "Scoping: var (function), let/const (block)", "Async: callbacks, promises, async/await, event loop"],
    misconceptions: ["== and === are equivalent — === compares types too ('0' == 0 is true, === false)"],
    exam_tips: ["Closures capture variables by reference; hoisting of var/function declarations", "Event loop: microtasks (promises) before macrotasks (setTimeout)", "this binding: call/apply/bind, arrow functions"],
    references: [
      { type: "book", title: "JavaScript: The Good Parts", authors: "Douglas Crockford", publisher: "O'Reilly" },
      { type: "book", title: "You Don't Know JS", authors: "Kyle Simpson" }
    ]
  },
  typescript: {
    overview: "TypeScript adds static typing, interfaces, generics and tooling on top of JavaScript.",
    classifications: ["Types: primitive, union, literal, tuple, enum, generics, utility types", "Compiler: tsconfig, strict mode, declaration files (.d.ts)"],
    exam_tips: ["any vs unknown vs never", "Interfaces vs type aliases; structural typing", "Generics constraints; mapped types"],
    references: [
      { type: "book", title: "TypeScript Handbook", authors: "Microsoft" }
    ]
  },
  php: {
    overview: "PHP covers syntax, arrays, functions, OOP, sessions, and web development with MySQL.",
    classifications: ["Superglobals: $_GET, $_POST, $_SESSION, $_COOKIE, $_SERVER", "Versions: PHP 7/8 features: typed properties, match, nullsafe, enums"],
    exam_tips: ["String concatenation with dot (.), interpolation in double quotes", "Prepared statements prevent SQL injection (PDO/mysqli)", "Session handling and password_hash/password_verify"],
    references: [
      { type: "book", title: "PHP & MySQL: Novice to Ninja", authors: "Kevin Yank" }
    ]
  },
  go: {
    overview: "Go covers goroutines, channels, interfaces, structs and standard library for concurrent systems programming.",
    classifications: ["Concurrency: goroutines, channels (buffered/unbuffered), select", "Types: structs, interfaces (implicit), slices, maps", "Packages: fmt, net/http, sync, io, context"],
    misconceptions: ["Mutex is needed for all concurrency — channels provide idiomatic communication"],
    exam_tips: ["Error handling: explicit error returns; panic/recover", "Slices reference arrays; append growth semantics", "defer runs at function exit (LIFO)"],
    references: [
      { type: "book", title: "The Go Programming Language", authors: "Donovan & Kernighan", publisher: "Addison-Wesley" }
    ]
  },
  rust: {
    overview: "Rust covers ownership, borrowing, lifetimes, traits, and safe systems programming.",
    classifications: ["Ownership: move semantics, Copy types, references (&, &mut)", "Traits: generics, trait objects, derive macros", "Error handling: Result, Option, ? operator, panic"],
    misconceptions: ["Rust has a garbage collector — it uses ownership-based compile-time memory management"],
    exam_tips: ["Borrow checker: one mutable OR many immutable borrows", "Lifetimes: 'a annotations, elision rules", "Cargo: package manager, crates.io ecosystem"],
    references: [
      { type: "book", title: "The Rust Programming Language", authors: "Steve Klabnik & Carol Nichols", publisher: "No Starch Press" }
    ]
  },
  sql: {
    overview: "SQL covers DDL, DML, queries, joins, aggregations, indexes and transactions.",
    formulas: ["Query order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT"],
    classifications: ["Statements: DDL (CREATE, ALTER, DROP), DML (SELECT, INSERT, UPDATE, DELETE), DCL (GRANT, REVOKE), TCL (COMMIT, ROLLBACK)", "Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF", "Aggregates: COUNT, SUM, AVG, MIN, MAX"],
    misconceptions: ["NULL = NULL in WHERE — use IS NULL"],
    exam_tips: ["HAVING filters groups; WHERE filters rows", "Indexes speed reads, slow writes; composite index order matters", "Normalisation: 1NF, 2NF, 3NF (BCNF)"],
    references: [
      { type: "book", title: "SQL for Beginners", authors: "Lynn Beighley" },
      { type: "book", title: "Learning SQL", authors: "Alan Beaulieu", publisher: "O'Reilly" }
    ]
  },
  database: {
    overview: "Database covers relational model, normalisation, transactions, concurrency control, indexing and query optimisation.",
    classifications: ["Models: relational, NoSQL (document, key-value, column, graph)", "Normal forms: 1NF-5NF/BCNF; functional dependencies", "ACID: atomicity, consistency, isolation, durability"],
    misconceptions: ["Transactions are always isolated at the highest level — isolation levels trade consistency for performance"],
    exam_tips: ["Isolation levels: read uncommitted → serializable", "Deadlock: prevention, detection, resolution", "Index types: B-tree, hash, bitmap"],
    references: [
      { type: "book", title: "Database System Concepts", authors: "Silberschatz, Korth, Sudarshan", publisher: "McGraw-Hill" },
      { type: "book", title: "Fundamentals of Database Systems", authors: "Elmasri & Navathe" }
    ]
  },
  sqlite: {
    overview: "SQLite is a self-contained, serverless, zero-configuration embedded SQL database — the world's most deployed database.",
    classifications: ["Storage: single-file; WAL mode for concurrency", "Types: dynamic typing with storage classes (INTEGER, REAL, TEXT, BLOB, NULL)", "Features: transactions, FTS5, triggers, views"],
    exam_tips: ["Datatypes: INTEGER, REAL, TEXT, BLOB, NULL", "sqlite_master catalog; VACUUM to reclaim space", "Node: node:sqlite DatabaseSync (Node 22+)"],
    references: [
      { type: "site", title: "SQLite Official Documentation", authors: "SQLite Consortium" }
    ]
  },
  postgresql: {
    overview: "PostgreSQL is an advanced open-source relational database with strong standards compliance, MVCC and extensibility.",
    classifications: ["Features: MVCC, PL/pgSQL, JSONB, full-text search, extensions (PostGIS)", "Replication: streaming, logical; hot standby", "Concurrency: isolation levels, advisory locks"],
    exam_tips: ["JSONB: GIN indexes; vs JSON (text)", "VACUUM, ANALYZE, EXPLAIN ANALYZE for performance", "psql meta-commands; pg_dump backups"],
    references: [
      { type: "book", title: "PostgreSQL Documentation", authors: "PostgreSQL Global Development Group" }
    ]
  },
  mongodb: {
    overview: "MongoDB is a document-oriented NoSQL database with flexible schemas and horizontal scaling.",
    classifications: ["Data model: documents (BSON), collections, databases", "CRUD: insert, find, update, delete; aggregation pipeline", "Scaling: sharding, replica sets, consistency options"],
    exam_tips: ["Aggregation pipeline stages: $match, $group, $project, $sort, $limit", "Indexes: single, compound, text, TTL", "Transactions: multi-document ACID since v4.0"],
    references: [
      { type: "book", title: "MongoDB: The Definitive Guide", authors: "Chodorow & Dirolf", publisher: "O'Reilly" }
    ]
  },
  nosql: {
    overview: "NoSQL covers document, key-value, wide-column and graph databases and when to use each over SQL.",
    classifications: ["Types: document (MongoDB), key-value (Redis), column (Cassandra), graph (Neo4j)", "CAP theorem: consistency, availability, partition tolerance — pick two"],
    exam_tips: ["CAP theorem is the classic question; BASE vs ACID", "Redis data structures: strings, hashes, lists, sets, sorted sets"],
    references: [
      { type: "book", title: "NoSQL Distilled", authors: "Sadalage & Fowler", publisher: "Addison-Wesley" }
    ]
  },
  linux: {
    overview: "Linux covers commands, file system, processes, permissions, shells and system administration.",
    classifications: ["File permissions: rwx octal (644, 755); owner/group/others", "Processes: ps, top, kill, background & nohup", "Shells: bash, zsh; scripting with variables, conditionals, loops"],
    misconceptions: ["rm -rf is reversible — it is permanent, no recycle bin"],
    exam_tips: ["grep, awk, sed, find, xargs are guaranteed questions", "Pipes | and redirection >, >>, <, 2>&1", "Symlinks: ln -s; hard vs soft links"],
    references: [
      { type: "book", title: "The Linux Command Line", authors: "William Shotts", publisher: "No Starch Press" }
    ]
  },
  bash: {
    overview: "Bash covers shell scripting: variables, conditionals, loops, functions, text processing and job control.",
    exam_tips: ["Test operators: -f file, -d dir, -z string, -n string", "Command substitution: $(...) and backticks", "Exit codes: 0 success, non-zero failure; set -e"],
    references: [
      { type: "book", title: "Bash Guide for Beginners", authors: "Machtelt Garrels" }
    ]
  },
  git: {
    overview: "Git covers version control: commits, branches, merges, remotes and workflows.",
    classifications: ["Objects: blobs, trees, commits, tags", "Areas: working directory, staging, local repo, remote", "Workflows: feature-branch, gitflow, trunk-based"],
    misconceptions: ["git revert and git reset are the same — revert creates a new commit; reset moves history"],
    exam_tips: ["Merge vs rebase; conflicts resolution", "git stash, cherry-pick, bisect", "Remote: clone, fetch, pull, push; origin vs upstream"],
    references: [
      { type: "book", title: "Pro Git", authors: "Scott Chacon & Ben Straub", publisher: "Apress" }
    ]
  },
  html: {
    overview: "HTML covers document structure, semantic tags, forms, accessibility and SEO basics.",
    classifications: ["Semantic tags: header, nav, main, section, article, aside, footer", "Form elements: input types (text, email, number, date), select, textarea", "Metadata: title, meta description, Open Graph"],
    exam_tips: ["Block vs inline elements", "Accessibility: alt text, aria attributes, semantic landmarks", "HTML5 APIs: canvas, video, local storage, geolocation"],
    references: [
      { type: "book", title: "HTML and CSS: Design and Build Websites", authors: "Jon Duckett", publisher: "Wiley" }
    ]
  },
  css: {
    overview: "CSS covers selectors, box model, layout (flexbox, grid), responsive design and animations.",
    classifications: ["Selectors: type, class, id, attribute, pseudo-classes, pseudo-elements", "Layout: flexbox (1D), grid (2D), float, positioning", "Specificity: inline > id > class > type"],
    misconceptions: ["Margin and padding are the same — margin is outside the border, padding inside"],
    exam_tips: ["Box model: content → padding → border → margin", "Media queries for responsiveness; mobile-first", "z-index and stacking contexts; position: relative/absolute/fixed/sticky"],
    references: [
      { type: "book", title: "CSS: The Definitive Guide", authors: "Eric Meyer", publisher: "O'Reilly" }
    ]
  },
  react: {
    overview: "React covers components, props, state, hooks, context and the virtual DOM for UI development.",
    classifications: ["Components: function (hooks) vs class (legacy)", "Hooks: useState, useEffect, useContext, useMemo, useRef, useReducer", "State management: local, context, Redux/Zustand"],
    misconceptions: ["setState is synchronous — state updates are batched and asynchronous"],
    exam_tips: ["Props are read-only; lifting state up", "Keys in lists for reconciliation", "Virtual DOM vs real DOM; reconciliation algorithm"],
    references: [
      { type: "book", title: "React Documentation", authors: "Meta Open Source" },
      { type: "book", title: "The Road to React", authors: "Robin Wieruch" }
    ]
  },
  "vue-js": {
    overview: "Vue.js covers reactive data binding, components, directives, composition API and tooling (Vite).",
    classifications: ["Directives: v-if, v-for, v-model, v-bind, v-on", "Composition API: ref, reactive, computed, watch, lifecycle hooks", "State: props, emit, provide/inject, Pinia"],
    exam_tips: ["v-model two-way binding on form inputs", "Lifecycle: created, mounted, updated, unmounted", "Scoped styles and slots"],
    references: [
      { type: "book", title: "Vue.js Documentation", authors: "Vue Core Team" }
    ]
  },
  angular: {
    overview: "Angular covers components, modules, services, dependency injection, routing and RxJS.",
    classifications: ["Core: components, directives, pipes, services, DI", "RxJS: Observables, Subjects, operators (map, filter, switchMap)", "Forms: template-driven vs reactive"],
    exam_tips: ["Decorators: @Component, @Injectable, @NgModule", "Change detection; zone.js", "Standalone components (Angular 14+)"],
    references: [
      { type: "book", title: "Angular Documentation", authors: "Google Angular Team" }
    ]
  },
  laravel: {
    overview: "Laravel covers MVC structure, routing, Eloquent ORM, blade templating, migrations and artisan.",
    classifications: ["Components: routes, controllers, models, views (Blade), middleware", "Eloquent: models, relationships, query builder, migrations", "Features: authentication, queues, events, validation"],
    exam_tips: ["Artisan commands: make:migration, migrate, tinker", "Middleware: auth, verified; route groups", "Eloquent relationships: hasMany, belongsTo, belongsToMany"],
    references: [
      { type: "book", title: "Laravel Documentation", authors: "Taylor Otwell / Laravel LLC" }
    ]
  },
  "node-js": {
    overview: "Node.js covers the event-driven, non-blocking JavaScript runtime: modules, npm, streams, HTTP and Express.",
    classifications: ["Core modules: fs, http, path, events, crypto, stream", "npm: package.json, dependencies, scripts", "Event loop: timers, I/O callbacks, microtasks"],
    misconceptions: ["Node.js is single-threaded for everything — the JS thread is single, but libuv uses worker threads for I/O"],
    exam_tips: ["require vs import (CJS vs ESM)", "Streams: read/write/transform; backpressure", "Error handling in async: try/catch with async/await, error-first callbacks"],
    references: [
      { type: "book", title: "Node.js Documentation", authors: "OpenJS Foundation" }
    ]
  },
  express: {
    overview: "Express is the minimal Node.js web framework: routing, middleware, request/response handling.",
    classifications: ["Middleware: application-level, router-level, error-handling", "Routing: app.get/post/put/delete, params, query", "Security: helmet, rate limiting, CORS, input validation"],
    exam_tips: ["Middleware order matters; next() passes control", "Error-first middleware: (err, req, res, next)", "Body parsing: express.json(), urlencoded"],
    references: [
      { type: "book", title: "Express Documentation", authors: "Express.js Foundation" }
    ]
  },
  "web-development": {
    overview: "Web development covers the full stack: HTML/CSS/JS frontend, server logic, databases, deployment and best practices.",
    classifications: ["Frontend: HTML, CSS, JS frameworks", "Backend: Node, Python, PHP, Java, Go", "Full-stack patterns: MVC, REST, JAMstack, serverless"],
    exam_tips: ["HTTP methods: GET/POST/PUT/PATCH/DELETE; status codes 2xx/4xx/5xx", "REST principles: stateless, resource URLs, status codes", "Deployment: hosting, CI/CD, environment variables"],
    references: [
      { type: "book", title: "Web Development Fundamentals", authors: "MDN Web Docs", publisher: "Mozilla" }
    ]
  },
  "mobile-development": {
    overview: "Mobile development covers native (Android/iOS), cross-platform (Flutter, React Native) and mobile architecture.",
    classifications: ["Platforms: Android (Kotlin/Java), iOS (Swift), cross-platform (Flutter, RN)", "App architecture: MVC, MVVM, clean architecture", "Components: activities/fragments, view controllers, widgets"],
    exam_tips: ["Android lifecycle: onCreate → onStart → onResume", "Flutter: widgets tree, StatefulWidget vs StatelessWidget", "App store deployment & signing"],
    references: [
      { type: "book", title: "Flutter Documentation", authors: "Flutter Team" },
      { type: "book", title: "Android Developer Documentation", authors: "Google" }
    ]
  },
  algorithms: {
    overview: "Algorithms covers complexity analysis, sorting, searching, graph algorithms, dynamic programming and problem-solving patterns.",
    formulas: ["Big-O: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)", "Master theorem: T(n) = aT(n/b) + f(n)"],
    classifications: ["Sorting: comparison-based (merge O(n log n), quick, heap) vs linear (counting, radix)", "Graph: BFS/DFS, Dijkstra, Bellman-Ford, MST (Kruskal, Prim)", "Techniques: divide & conquer, greedy, DP, backtracking"],
    misconceptions: ["Quicksort is always O(n log n) — worst case is O(n²) with bad pivots"],
    exam_tips: ["Binary search requires sorted array; O(log n)", "DP: optimal substructure + overlapping subproblems", "Hash tables: average O(1) lookup"],
    references: [
      { type: "book", title: "Introduction to Algorithms (CLRS)", authors: "Cormen, Leiserson, Rivest, Stein", publisher: "MIT Press" },
      { type: "book", title: "Algorithms", authors: "Robert Sedgewick & Kevin Wayne", publisher: "Addison-Wesley" }
    ]
  },
  "data-structures": {
    overview: "Data structures covers arrays, linked lists, stacks, queues, trees, heaps, hash tables and graphs with complexity trade-offs.",
    classifications: ["Linear: array, linked list, stack, queue, deque", "Hierarchical: binary tree, BST, AVL, heap, trie", "Graph: adjacency matrix vs list; weighted/unweighted"],
    misconceptions: ["Balanced BST guarantees O(log n) — only self-balancing trees (AVL/Red-Black) do"],
    exam_tips: ["Stack: LIFO; Queue: FIFO — implementation with arrays/pointers", "Tree traversals: inorder (sorted BST), preorder, postorder, level-order", "Heap: complete binary tree, min/max property, heapify O(n)"],
    references: [
      { type: "book", title: "Data Structures and Algorithms", authors: "Seymour Lipschutz", publisher: "McGraw-Hill" },
      { type: "book", title: "Data Structures Using C", authors: "Tanenbaum" }
    ]
  },
  "operating-systems": {
    overview: "Operating systems covers processes, threads, scheduling, memory management, file systems and concurrency.",
    classifications: ["Scheduling: FCFS, SJF, RR, priority, multilevel queue", "Memory: paging, segmentation, virtual memory, page replacement (FIFO, LRU, Optimal)", "Process states: new → ready → running → waiting → terminated"],
    misconceptions: ["Multithreading always improves performance — GIL and contention can hurt"],
    exam_tips: ["Deadlock conditions: mutual exclusion, hold & wait, no preemption, circular wait", "Banker's algorithm for deadlock avoidance", "Semaphores vs mutexes; producer-consumer problem"],
    references: [
      { type: "book", title: "Operating System Concepts", authors: "Silberschatz, Galvin, Gagne", publisher: "Wiley" },
      { type: "book", title: "Modern Operating Systems", authors: "Andrew S. Tanenbaum" }
    ]
  },
  networking: {
    overview: "Networking covers OSI and TCP/IP models, addressing, routing, protocols and network security.",
    classifications: ["OSI layers: physical, data link, network, transport, session, presentation, application", "TCP/IP: link, internet, transport, application", "Protocols: HTTP/HTTPS, FTP, SMTP, DNS, DHCP, TCP/UDP, IP"],
    misconceptions: ["TCP and UDP differ only in speed — TCP guarantees order/reliability, UDP does not"],
    exam_tips: ["IP addressing: IPv4 classes A-E; private ranges 10.x, 172.16-31.x, 192.168.x", "Ports: HTTP 80, HTTPS 443, DNS 53, SMTP 25, FTP 21, SSH 22", "Subnetting: /24 = 255.255.255.0 = 256 addresses"],
    references: [
      { type: "book", title: "Computer Networking: A Top-Down Approach", authors: "Kurose & Ross", publisher: "Pearson" },
      { type: "book", title: "Data Communications and Networking", authors: "Behrouz Forouzan", publisher: "McGraw-Hill" }
    ]
  },
  "cyber-security": {
    overview: "Cyber security covers threats, cryptography, network security, web security (OWASP), incident response and security frameworks.",
    classifications: ["Threats: malware (virus, worm, ransomware, trojan), phishing, DDoS, MITM", "OWASP Top 10: injection, broken auth, XSS, insecure deserialization, etc.", "Cryptography: symmetric (AES, DES) vs asymmetric (RSA, ECC); hashing (SHA, MD5)"],
    misconceptions: ["HTTPS means the server is trustworthy — it only encrypts the connection"],
    exam_tips: ["Defence in depth; least privilege; zero trust", "XSS vs SQL injection vs CSRF — attack vectors differ", "CIA triad: confidentiality, integrity, availability"],
    references: [
      { type: "book", title: "The Web Application Hacker's Handbook", authors: "Stuttard & Pinto", publisher: "Wiley" },
      { type: "book", title: "OWASP Top 10", authors: "OWASP Foundation" }
    ]
  },
  ai: {
    overview: "Artificial Intelligence covers search, knowledge representation, reasoning, planning, ML basics, NLP and intelligent agents.",
    classifications: ["AI subfields: ML, NLP, computer vision, robotics, expert systems", "Search: uninformed (BFS, DFS) vs informed (A*, greedy)", "Agents: reactive, deliberative, hybrid; PEAS framework"],
    misconceptions: ["AI equals machine learning — AI is broader; ML is a subset"],
    exam_tips: ["A* uses f = g + h with admissible heuristic", "Turing test and Chinese Room arguments are classic questions", "Knowledge representation: logic, semantic nets, frames, production rules"],
    references: [
      { type: "book", title: "Artificial Intelligence: A Modern Approach", authors: "Russell & Norvig", publisher: "Pearson" }
    ]
  },
  "machine-learning": {
    overview: "Machine learning covers supervised, unsupervised and reinforcement learning, model evaluation and core algorithms.",
    classifications: ["Supervised: regression (linear, ridge), classification (logistic, SVM, trees)", "Unsupervised: clustering (K-means, DBSCAN), dimensionality reduction (PCA)", "Evaluation: accuracy, precision, recall, F1, ROC-AUC, confusion matrix"],
    misconceptions: ["More data always improves models — noisy or biased data hurts"],
    exam_tips: ["Bias-variance tradeoff; overfitting vs underfitting", "Gradient descent: learning rate tuning", "Train/test/validation split; cross-validation"],
    references: [
      { type: "book", title: "Pattern Recognition and Machine Learning", authors: "Christopher Bishop", publisher: "Springer" },
      { type: "book", title: "Hands-On Machine Learning", authors: "Aurélien Géron", publisher: "O'Reilly" }
    ]
  },
  "deep-learning": {
    overview: "Deep learning covers neural networks, CNNs, RNNs, transformers, backpropagation and training techniques.",
    classifications: ["Architectures: MLP, CNN (vision), RNN/LSTM (sequence), Transformer (NLP)", "Activation: ReLU, sigmoid, tanh, softmax", "Regularisation: dropout, batch norm, weight decay"],
    misconceptions: ["Deeper networks are always better — vanishing gradients and overfitting constrain depth"],
    exam_tips: ["Backpropagation: chain rule through the network", "Transformers: self-attention, positional encoding", "Loss functions: MSE (regression), cross-entropy (classification)"],
    references: [
      { type: "book", title: "Deep Learning", authors: "Goodfellow, Bengio, Courville", publisher: "MIT Press" }
    ]
  },
  "data-science": {
    overview: "Data science covers the full workflow: data collection, cleaning, analysis, visualisation, modelling and communication.",
    classifications: ["Pipeline: gather → clean → explore → model → evaluate → deploy", "Tools: Python (pandas, numpy, scikit-learn), SQL, Jupyter", "Statistics: descriptive vs inferential; hypothesis testing"],
    exam_tips: ["Data cleaning: missing values, outliers, encoding, normalisation", "A/B testing fundamentals: p-values, significance", "Visualisation principles: chart selection by data type"],
    references: [
      { type: "book", title: "Python for Data Analysis", authors: "Wes McKinney", publisher: "O'Reilly" }
    ]
  },
  "cloud-computing": {
    overview: "Cloud computing covers IaaS/PaaS/SaaS, major providers (AWS, Azure, GCP), virtualisation and cloud architecture patterns.",
    classifications: ["Service models: IaaS (EC2), PaaS (Heroku), SaaS (Gmail)", "Deployment: public, private, hybrid, community cloud", "AWS core: EC2, S3, RDS, Lambda, VPC, IAM"],
    misconceptions: ["Cloud is always cheaper — long-running predictable workloads may cost more"],
    exam_tips: ["Shared responsibility model", "Serverless: event-driven, pay-per-invocation (Lambda)", "Elasticity vs scalability (vertical vs horizontal)"],
    references: [
      { type: "book", title: "AWS Documentation", authors: "Amazon Web Services" },
      { type: "book", title: "Cloud Computing: Concepts, Technology & Architecture", authors: "Erl, Puttini, Mahmood" }
    ]
  },
  docker: {
    overview: "Docker covers containerisation: images, containers, Dockerfile, volumes, networking and compose.",
    classifications: ["Layers: base image, RUN, COPY, ENV, CMD/ENTRYPOINT", "Networking: bridge, host, none; port mapping", "State: images (read-only) + writable container layer; volumes for persistence"],
    misconceptions: ["Containers are lightweight VMs — they share the host kernel, no guest OS"],
    exam_tips: ["Dockerfile best practices: layer caching, .dockerignore, multi-stage builds", "docker run/exec/logs/ps/rm; docker compose for multi-container", "Registry: Docker Hub; tags & digests"],
    references: [
      { type: "book", title: "Docker Documentation", authors: "Docker Inc." }
    ]
  },
  kubernetes: {
    overview: "Kubernetes covers cluster orchestration: pods, deployments, services, ingress, config, storage and scaling.",
    classifications: ["Workloads: Deployment, StatefulSet, DaemonSet, Job/CronJob", "Networking: Service types (ClusterIP, NodePort, LoadBalancer), Ingress", "Scheduling: nodes, pods, resource requests/limits, affinity"],
    misconceptions: ["Kubernetes scales the database — stateful workloads need careful design (StatefulSets)"],
    exam_tips: ["Control plane: API server, etcd, scheduler, controller-manager", "kubectl essentials: get, describe, apply, logs, exec", "Health probes: liveness, readiness, startup"],
    references: [
      { type: "book", title: "Kubernetes Documentation", authors: "CNCF" }
    ]
  },
  "distributed-systems": {
    overview: "Distributed systems covers consistency, replication, consensus, distributed storage and failure handling.",
    classifications: ["Consistency: strong, eventual, causal; CAP theorem", "Consensus: Paxos, Raft, Zab; leader election", "Architectures: client-server, peer-to-peer, microservices, message queues"],
    misconceptions: ["Exactly-once delivery is guaranteed by queues — most provide at-least-once"],
    exam_tips: ["Raft: leader election, log replication, safety", "Two-phase commit vs saga pattern", "Clock issues: logical clocks, vector clocks"],
    references: [
      { type: "book", title: "Designing Data-Intensive Applications", authors: "Martin Kleppmann", publisher: "O'Reilly" }
    ]
  },
  "system-design": {
    overview: "System design covers scalable architecture: load balancing, caching, databases, queues, CDNs and design trade-offs.",
    classifications: ["Building blocks: LB, cache (Redis), DB sharding, message queues (Kafka), CDN", "Patterns: microservices, event-driven, CQRS, blue-green deployment", "Metrics: latency, throughput, availability, consistency"],
    exam_tips: ["Design steps: requirements → estimates → API → data model → components", "Back-of-envelope math: requests/sec, storage, bandwidth", "SQL vs NoSQL selection by workload"],
    references: [
      { type: "book", title: "Designing Data-Intensive Applications", authors: "Martin Kleppmann", publisher: "O'Reilly" },
      { type: "book", title: "System Design Interview", authors: "Alex Xu" }
    ]
  },
  "software-eng": {
    overview: "Software engineering covers SDLC, requirements, design, testing, maintenance and process models.",
    classifications: ["SDLC models: waterfall, agile (Scrum), spiral, V-model, DevOps", "Testing: unit, integration, system, acceptance; white vs black box", "Design: SOLID, DRY, design patterns (creational, structural, behavioural)"],
    misconceptions: ["Agile means no documentation — agile values working software but keeps needed docs"],
    exam_tips: ["SOLID principles are guaranteed questions", "Design patterns: Singleton, Factory, Observer, MVC", "Estimates: story points, velocity, burndown"],
    references: [
      { type: "book", title: "Software Engineering", authors: "Ian Sommerville", publisher: "Pearson" },
      { type: "book", title: "Clean Architecture", authors: "Robert C. Martin", publisher: "Prentice Hall" }
    ]
  },
  "digital-logic": {
    overview: "Digital logic covers number systems, Boolean algebra, logic gates, combinational and sequential circuits.",
    formulas: ["Boolean laws: De Morgan (A·B)' = A' + B'; (A+B)' = A'·B'", "Binary: decimal to binary division; 2's complement"],
    classifications: ["Gates: AND, OR, NOT, NAND, NOR, XOR, XNOR", "Combinational: adders, mux, demux, decoders, encoders", "Sequential: flip-flops (SR, JK, D, T), registers, counters"],
    misconceptions: ["NAND and NOR are basic gates — they are universal gates"],
    exam_tips: ["K-map simplification: grouping powers of 2", "Flip-flop characteristic tables; edge vs level triggering", "Number conversions: binary/octal/hex/decimal"],
    references: [
      { type: "book", title: "Digital Design", authors: "M. Morris Mano", publisher: "Pearson" }
    ]
  },
  electronics: {
    overview: "Electronics covers semiconductor devices, diodes, transistors, amplifiers and op-amps.",
    formulas: ["Ohm: V = IR", "Diode: forward voltage drop Si 0.7V, Ge 0.3V", "Transistor current gain: β = Ic/Ib", "Op-amp gain (inverting): -Rf/Rin"],
    classifications: ["Devices: diode, BJT, FET/MOSFET, op-amp", "Amplifiers: common emitter/base/collector; classes A, B, AB, C", "Rectifiers: half-wave, full-wave, bridge"],
    misconceptions: ["Op-amps amplify indefinitely — they saturate at supply rails"],
    exam_tips: ["Ideal op-amp: infinite gain, infinite input impedance, zero output impedance", "Half-wave ripple vs full-wave; ripple factor", "Zener diode: voltage regulation (reverse breakdown)"],
    references: [
      { type: "book", title: "Electronic Devices and Circuit Theory", authors: "Boylestad & Nashelsky", publisher: "Pearson" },
      { type: "book", title: "Principles of Electronics", authors: "V.K. Mehta & Rohit Mehta", publisher: "S. Chand" }
    ]
  },
  "electrical-eng": {
    overview: "Electrical engineering covers circuits, machines, power systems, control and electronics fundamentals.",
    formulas: ["Power: P = VI = I²R = V²/R", "AC: P = VI cosφ; S = VI; Q = VI sinφ", "Transformer: Vp/Vs = Np/Ns = Is/Ip", "Efficiency: output/input × 100"],
    classifications: ["Circuits: DC (resistors, KVL/KCL), AC (impedance, phasors)", "Machines: DC motor/generator, induction motor, synchronous, transformer", "Power: generation, transmission (HV), distribution, protection"],
    misconceptions: ["Transformers change frequency — they change voltage/current, not frequency"],
    exam_tips: ["Induction motor: most common industrial motor; synchronous speed = 120f/P", "Power factor correction with capacitors", "Fuse vs circuit breaker; earthing systems"],
    references: [
      { type: "book", title: "Electrical Technology", authors: "B.L. Theraja & A.K. Theraja", publisher: "S. Chand" },
      { type: "book", title: "Principles of Power Systems", authors: "V.K. Mehta & Rohit Mehta", publisher: "S. Chand" }
    ]
  },
  "mechanical-eng": {
    overview: "Mechanical engineering covers mechanics, thermodynamics, fluid mechanics, machine design and materials.",
    formulas: ["Stress σ = F/A; strain ε = ΔL/L; modulus E = σ/ε", "First law: ΔU = Q - W", "Ideal gas: PV = nRT", "Bernoulli: P + ½ρv² + ρgh = constant"],
    classifications: ["Thermodynamics: laws, cycles (Carnot, Otto, Diesel), engines (SI/CI)", "Fluids: statics, dynamics, pumps, turbines, flow regimes (laminar/turbulent)", "Materials: metals, polymers, ceramics, composites; hardness/toughness"],
    misconceptions: ["Heat engines can be 100% efficient — Carnot limit applies"],
    exam_tips: ["Carnot efficiency = 1 - Tc/Th", "Stress-strain curve: elastic limit, yield, ultimate, fracture", "Gears, bearings and couplings are classic theory questions"],
    references: [
      { type: "book", title: "Engineering Thermodynamics", authors: "P.K. Nag", publisher: "McGraw-Hill" },
      { type: "book", title: "Strength of Materials", authors: "R.K. Bansal", publisher: "Laxmi" }
    ]
  },
  "civil-eng": {
    overview: "Civil engineering covers structural, geotechnical, transportation, water resources and construction materials.",
    formulas: ["Bending: σ = My/I; deflection", "Beam: shear force & bending moment diagrams", "Concrete: mix design, w/c ratio, strength 28 days"],
    classifications: ["Structures: RCC, steel, prestressed concrete, foundations (shallow/deep)", "Geotech: soil types, compaction, bearing capacity, consolidation", "Water: hydrology, irrigation, dams, water supply & drainage"],
    misconceptions: ["Higher water-cement ratio gives stronger concrete — lower w/c gives higher strength"],
    exam_tips: ["Concrete 28-day characteristic strength; grades (M15-M40)", "Pile vs raft foundation selection", "Surveying: leveling, theodolite, total station"],
    references: [
      { type: "book", title: "Engineering Materials", authors: "S.C. Rangwala" },
      { type: "book", title: "Reinforced Concrete Design", authors: "Pillai & Menon", publisher: "McGraw-Hill" }
    ]
  },
  "chemical-eng": {
    overview: "Chemical engineering covers material & energy balances, thermodynamics, fluid flow, heat/mass transfer and reactors.",
    formulas: ["Material balance: input = output + accumulation", "Ideal gas: PV = nRT", "Fourier: q = -kA dT/dx", "Reaction rate: r = k[A]^n; Arrhenius k = Ae^(-Ea/RT)"],
    classifications: ["Unit operations: distillation, absorption, extraction, drying, filtration", "Reactors: batch, CSTR, PFR; conversion & selectivity", "Transport: momentum (Reynolds), heat (Nusselt), mass (Sherwood)"],
    misconceptions: ["PFR and CSTR give same conversion — PFR conversion exceeds CSTR for positive-order reactions"],
    exam_tips: ["Distillation: relative volatility, reflux ratio, McCabe-Thiele", "Degree of freedom analysis on balances", "Pump vs compressor vs blower classification"],
    references: [
      { type: "book", title: "Chemical Engineering Vol 1-3", authors: "Coulson & Richardson", publisher: "Butterworth-Heinemann" },
      { type: "book", title: "Introduction to Chemical Engineering Thermodynamics", authors: "Smith, Van Ness, Abbott", publisher: "McGraw-Hill" }
    ]
  },
  "industrial-eng": {
    overview: "Industrial engineering covers production planning, operations research, quality control, ergonomics and supply systems.",
    formulas: ["EOQ = √(2DS/H)", "Throughput = 1/cycle time; efficiency = output/input", "Control limits: x̄ ± 3σ"],
    classifications: ["OR tools: LP (simplex), transportation, assignment, queuing, PERT/CPM", "Quality: SPC, control charts, six sigma, TQM", "Work study: method study, time study, standard time"],
    misconceptions: ["Six Sigma means 6 defects allowed per batch — 3.4 defects per million opportunities"],
    exam_tips: ["PERT vs CPM: probabilistic vs deterministic; critical path", "Control charts: X-bar/R, p, c charts", "Facility layout types: product, process, cellular"],
    references: [
      { type: "book", title: "Operations Research", authors: "H.A. Taha", publisher: "Pearson" },
      { type: "book", title: "Production and Operations Management", authors: "S.N. Chary" }
    ]
  },
  "mining-engineering": {
    overview: "Mining engineering covers mine planning, extraction methods, mineral processing, mine safety and economics.",
    classifications: ["Methods: surface (open-pit, strip) vs underground (room & pillar, longwall)", "Processing: crushing, grinding, flotation, smelting", "Pakistan minerals: coal (Thar), copper (Reko Diq), salt (Khewra), chromite"],
    misconceptions: ["Open-pit and underground are interchangeable — depth and geology dictate method"],
    exam_tips: ["Reko Diq: world-class copper-gold; Thar: largest coal reserves", "Safety: methane monitoring, ventilation, roof support"],
    references: [
      { type: "book", title: "Elements of Mining Technology", authors: "D.J. Deshmukh" }
    ]
  },
  "petroleum-engineering": {
    overview: "Petroleum engineering covers reservoir, drilling, production and formation evaluation of oil and gas.",
    classifications: ["Stages: exploration, drilling, completion, production, abandonment", "Reservoir: porosity, permeability, saturation; drive mechanisms", "Pakistan basins: Indus (Sindh gas), Kohat-Potwar (oil)"],
    misconceptions: ["Oil exists in underground lakes — it fills porous rock pores"],
    exam_tips: ["Porosity vs permeability: storage vs flow capacity", "Drilling: casing, mud functions, blowout prevention", "Reservoir drive: depletion, water, gas cap"],
    references: [
      { type: "book", title: "Petroleum Engineering Handbook", authors: "SPE" }
    ]
  },
  "textile-engineering": {
    overview: "Textile engineering covers fibre science, yarn manufacturing, weaving, knitting, dyeing and textile testing.",
    classifications: ["Fibres: natural (cotton, wool, silk) vs synthetic (polyester, nylon, acrylic)", "Processes: spinning, weaving, knitting, finishing", "Fabric structures: woven (warp/weft) vs knitted (courses/wales)"],
    misconceptions: ["Cotton is a synthetic fibre — it is natural cellulose"],
    exam_tips: ["Pakistan: cotton-based textile industry; largest export sector", "Fabric tests: tensile, tear, abrasion, colour fastness"],
    references: [
      { type: "book", title: "Textile Engineering", authors: "S. Alamgir Farooqui" }
    ]
  },
  "environmental-eng": {
    overview: "Environmental engineering covers water supply, wastewater treatment, air pollution control and solid waste management.",
    classifications: ["Water treatment: coagulation, sedimentation, filtration, disinfection", "Wastewater: primary (settling), secondary (biological), tertiary", "Air: particulate control (cyclones, ESP, baghouse), scrubbers"],
    exam_tips: ["BOD vs COD: biological vs chemical oxygen demand", "Chlorination disinfection; residual chlorine", "Solid waste: reduce, reuse, recycle, recover"],
    references: [
      { type: "book", title: "Environmental Engineering", authors: "Peavy, Rowe, Tchobanoglous", publisher: "McGraw-Hill" }
    ]
  },
  architecture: {
    overview: "Architecture covers design principles, building materials, construction technology, history of architecture and building services.",
    classifications: ["Styles: Islamic, Mughal, Gothic, Modern, Postmodern", "Materials: brick, stone, concrete, steel, timber, glass", "Building systems: structure, HVAC, plumbing, electrical, fire safety"],
    misconceptions: ["A column and a pillar are identical — columns are structural, pillars can be decorative"],
    exam_tips: ["Mughal architecture: Taj Mahal (Agra), Badshahi Mosque (Lahore), Shah Jahan Mosque (Thatta)", "Sustainability: passive design, green building rating (LEED)"],
    references: [
      { type: "book", title: "A History of Architecture", authors: "Spiro Kostof" },
      { type: "book", title: "Building Construction Illustrated", authors: "Francis D.K. Ching" }
    ]
  },
  mechatronics: {
    overview: "Mechatronics integrates mechanical, electronic, control and software systems: sensors, actuators, microcontrollers and robotics.",
    classifications: ["Components: sensors, actuators, controllers (MCU/PLC), interfaces", "Control: open vs closed loop; PID; transfer functions", "Robotics: kinematics (DH parameters), actuators, perception"],
    misconceptions: ["Open-loop control handles disturbances — closed-loop with feedback does"],
    exam_tips: ["PID terms: proportional (P), integral (I), derivative (D)", "Sensor types: position (encoder), temperature (thermocouple), force (strain gauge)", "Arduino vs PLC use cases"],
    references: [
      { type: "book", title: "Mechatronics: Electronic Control Systems", authors: "W. Bolton", publisher: "Pearson" }
    ]
  },
  "computer-science": {
    overview: "Computer science covers fundamentals: computation, data structures, algorithms, systems, programming and theory.",
    classifications: ["Core areas: theory (automata, complexity), systems (OS, networks, DB), applications (AI, graphics)", "Automata: DFA/NFA, regular languages, context-free grammars, Turing machines", "Complexity classes: P, NP, NP-complete"],
    misconceptions: ["Computers understand high-level languages directly — they run machine code after compilation/interpretation"],
    exam_tips: ["Turing machine: tape, states, transition function", "Halting problem: undecidable", "Church-Turing thesis"],
    references: [
      { type: "book", title: "Introduction to the Theory of Computation", authors: "Michael Sipser", publisher: "Cengage" },
      { type: "book", title: "Structure and Interpretation of Computer Programs", authors: "Abelson & Sussman", publisher: "MIT Press" }
    ]
  },
  "compiler-design": {
    overview: "Compiler design covers lexical analysis, parsing, semantic analysis, code generation and optimisation.",
    classifications: ["Phases: lexer → parser → semantic analyzer → intermediate code → optimizer → codegen", "Parsing: top-down (recursive descent, LL) vs bottom-up (LR, SLR, LALR)", "Symbol table & type checking"],
    misconceptions: ["Interpreters and compilers are the same — compilers translate ahead; interpreters execute directly"],
    exam_tips: ["Regular expressions → DFA for lexing", "Grammar ambiguity; left recursion elimination; FIRST/FOLLOW sets", "Intermediate forms: AST, 3-address code, SSA"],
    references: [
      { type: "book", title: "Compilers: Principles, Techniques and Tools (Dragon Book)", authors: "Aho, Lam, Sethi, Ullman", publisher: "Pearson" }
    ]
  },
  "computer-graphics": {
    overview: "Computer graphics covers rendering, transformations, projections, colour models and rasterisation.",
    formulas: ["Transformations: translation, scaling, rotation (2D/3D matrices)", "Projection: perspective vs orthographic"],
    classifications: ["Rendering: rasterisation vs ray tracing; shading (flat, Gouraud, Phong)", "Colour models: RGB, CMYK, HSV", "Curves: Bezier, B-spline, NURBS"],
    exam_tips: ["Homogeneous coordinates for affine transforms", "Z-buffer hidden surface removal", "OpenGL pipeline stages"],
    references: [
      { type: "book", title: "Computer Graphics: Principles and Practice", authors: "Foley, van Dam et al.", publisher: "Addison-Wesley" }
    ]
  },
  "data-interpretation": {
    overview: "Data interpretation tests reading tables, charts and graphs — bar, line, pie — with quick percentage and ratio calculations, common in NTS/CSS GA papers.",
    formulas: ["Percentage share = part/total × 100", "Growth rate = (new-old)/old × 100"],
    exam_tips: ["Approximate first, then refine; watch units (lakhs, crores, thousands)", "Read axes and legends before solving", "Average = total/items; ratio comparisons"],
    references: [
      { type: "book", title: "Quantitative Aptitude for Competitive Examinations", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  "analytical-reasoning": {
    overview: "Analytical reasoning tests logical arrangements, ordering, grouping and selection puzzles under time pressure (GMAT-style analytical section).",
    classifications: ["Puzzle types: linear ordering, circular arrangement, grouping, scheduling, mapping"],
    exam_tips: ["Draw diagrams; track constraints with boxes/arrows", "Identify fixed anchors first, then derive implications", "Eliminate options violating constraints directly"],
    references: [
      { type: "book", title: "The Official LSAT SuperPrep", authors: "LSAC" },
      { type: "book", title: "Analytical Reasoning", authors: "M.K. Pandey", publisher: "BSC Publishing" }
    ]
  },
  iq: {
    overview: "IQ & Aptitude tests measure reasoning, pattern recognition, sequences and arithmetic speed used in entry tests and recruitment (PMA, PAF, Navy, ASF).",
    classifications: ["Question families: number series, alphabet series, analogies, coding-decoding, odd-one-out, arithmetic reasoning", "Non-verbal: figure series, mirror images, paper folding, cubes"],
    exam_tips: ["Number series: differences, ratios, squares, primes, alternating rules", "Coding-decoding: letter shifts, reverse alphabet, word codes", "Time management: skip hard items, return later"],
    references: [
      { type: "book", title: "How to Pass Psychometric Tests", authors: "Ken Langdon" },
      { type: "book", title: "A Modern Approach to Verbal & Non-Verbal Reasoning", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  "aptitude-tests": {
    overview: "Aptitude tests combine quantitative, verbal and reasoning items for job entry (NTS, PTS, OTS) and armed forces screening.",
    exam_tips: ["Speed maths: multiplication shortcuts, squares, percentages", "Verbal analogy patterns: synonym, antonym, part-whole, cause-effect", "Time-distance-work problems are the most tested quantitative family"],
    references: [
      { type: "book", title: "Quantitative Aptitude for Competitive Examinations", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  "verbal-reasoning": {
    overview: "Verbal reasoning covers word logic, analogy, syllogism, statement-conclusion and series — the vocabulary-based reasoning section.",
    classifications: ["Types: analogy, syllogism, statement & assumption, cause & effect, arrangement"],
    exam_tips: ["Syllogism: Venn diagrams for universal/particular premises", "Analogy: identify the exact relationship (function, degree, antonym)"],
    references: [
      { type: "book", title: "A Modern Approach to Verbal & Non-Verbal Reasoning", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  "non-verbal-reasoning": {
    overview: "Non-verbal reasoning tests visual logic: figure series, classification, analogy, mirror/water images and embedded figures.",
    exam_tips: ["Figure series: rotation, shading shift, number of elements, position", "Mirror image: left-right reversal (not upside down)", "Cube & dice problems: opposite faces never adjacent"],
    references: [
      { type: "book", title: "A Modern Approach to Verbal & Non-Verbal Reasoning", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  "logical-reasoning": {
    overview: "Logical reasoning covers formal logic: statements, arguments, fallacies, deductive and inductive reasoning.",
    classifications: ["Logic: deductive (validity) vs inductive (strength)", "Fallacies: ad hominem, straw man, false dilemma, hasty generalisation", "Arguments: premises, conclusions, assumptions, flaws"],
    exam_tips: ["Identify premise vs conclusion first", "Strengthen/weaken: target the assumption", "Formal logic: if P then Q — contrapositive is the valid inference"],
    references: [
      { type: "book", title: "Critical Reasoning", authors: "Manhattan GMAT Prep" }
    ]
  },
  reasoning: {
    overview: "Reasoning & IQ combines verbal, non-verbal and analytical reasoning for entry tests.",
    exam_tips: ["Practise timed sets; error log for repeated patterns", "Number and alphabet series are the highest-yield families"],
    references: [
      { type: "book", title: "A Modern Approach to Reasoning", authors: "R.S. Aggarwal", publisher: "S. Chand" }
    ]
  },
  management: {
    overview: "Management covers planning, organising, leading and controlling — with classic theories (Taylor, Fayol, Weber) and modern practices.",
    classifications: ["Functions: planning, organising, staffing, directing, controlling", "Theories: scientific (Taylor), administrative (Fayol), bureaucratic (Weber), human relations (Mayo)", "Organisation structures: functional, divisional, matrix, flat"],
    misconceptions: ["Management and leadership are identical — management handles complexity; leadership drives change"],
    exam_tips: ["Fayol's 14 principles; Taylor's 4 principles", "Mintzberg's managerial roles: interpersonal, informational, decisional", "Maslow & Herzberg motivation theories"],
    references: [
      { type: "book", title: "Management", authors: "Robbins & Coulter", publisher: "Pearson" },
      { type: "book", title: "Principles of Management", authors: "Koontz & O'Donnell", publisher: "McGraw-Hill" }
    ]
  },
  hrm: {
    overview: "HRM covers recruitment, selection, training, performance appraisal, compensation and industrial relations.",
    classifications: ["HR functions: acquisition, development, motivation, maintenance", "Appraisal: 360-degree, MBO, BARS, critical incident", "Rewards: monetary vs non-monetary; job evaluation methods"],
    exam_tips: ["Recruitment (attract) vs selection (choose)", "Training needs analysis: TNA model; ADDIE for design", "Industrial relations: collective bargaining, grievance handling"],
    references: [
      { type: "book", title: "Human Resource Management", authors: "Gary Dessler", publisher: "Pearson" }
    ]
  },
  "organization-behavior": {
    overview: "Organizational Behaviour studies individual, group and organisational behaviour: personality, motivation, leadership, culture and change.",
    classifications: ["Levels: individual, group, organisation", "Motivation: Maslow, Herzberg, Vroom, Equity, Goal-setting", "Leadership: trait, behavioural (Ohio/Michigan), contingency (Fiedler, SLT, LMX)"],
    misconceptions: ["Job satisfaction guarantees high performance — the relationship is modest and bidirectional"],
    exam_tips: ["Big Five personality: OCEAN", "Organisational culture: Schein's levels (artifacts, values, assumptions)", "Change models: Lewin (unfreeze-change-refreeze), Kotter's 8 steps"],
    references: [
      { type: "book", title: "Organizational Behavior", authors: "Stephen P. Robbins", publisher: "Pearson" }
    ]
  },
  "business-administration": {
    overview: "Business administration covers the functional areas of business — management, marketing, finance, operations and strategy — for BBA/MBA and CSS Commerce.",
    classifications: ["Functions: management, marketing, finance, HR, operations", "Strategy: Porter's five forces, generic strategies, SWOT, PESTEL", "Governance: boards, AGM, corporate ethics"],
    exam_tips: ["Porter: cost leadership, differentiation, focus", "Marketing mix: 4Ps (product, price, place, promotion) → 7Ps with people/process/physical evidence", "Financial statements & ratios for business health"],
    references: [
      { type: "book", title: "Business Administration: An Introduction", authors: "S.C. Sharma" },
      { type: "book", title: "Principles of Business Management", authors: "K. Ashwathappa" }
    ]
  },
  marketing: {
    overview: "Marketing covers market research, consumer behaviour, segmentation, branding, pricing, distribution and promotion.",
    classifications: ["Mix: 4Ps/7Ps", "Segmentation: demographic, psychographic, behavioural, geographic", "Strategies: STP (segment-target-position), differentiation"],
    misconceptions: ["Marketing is just advertising — it spans research, pricing, distribution and branding"],
    exam_tips: ["Brand equity: awareness, associations, perceived quality, loyalty", "Product lifecycle: introduction, growth, maturity, decline", "Pricing: cost-plus, value-based, penetration, skimming"],
    references: [
      { type: "book", title: "Principles of Marketing", authors: "Kotler & Armstrong", publisher: "Pearson" }
    ]
  },
  entrepreneurship: {
    overview: "Entrepreneurship covers venture creation, business models, financing, innovation and the Pakistani entrepreneurial ecosystem.",
    classifications: ["Venture types: lifestyle, small business, scalable start-up", "Financing: bootstrapping, angel, VC, loans (SME banks)", "Business models: B2B, B2C, marketplace, subscription"],
    exam_tips: ["Lean start-up: MVP, build-measure-learn loop", "Business plan elements; pitch deck", "Pakistan: SME financing, startups (fintech, e-commerce)"],
    references: [
      { type: "book", title: "The Lean Startup", authors: "Eric Ries", publisher: "Crown Business" }
    ]
  },
  "project-management": {
    overview: "Project management covers the PMBOK knowledge areas, lifecycle, scheduling, risk and agile delivery.",
    formulas: ["Earned value: EV = %complete × BAC; CPI = EV/AC; SPI = EV/PV", "Critical path: longest path duration", "Network: ES/EF/LS/LF, float = LS - ES"],
    classifications: ["Process groups: initiating, planning, executing, monitoring & controlling, closing", "PMBOK areas: scope, schedule, cost, quality, risk, procurement, communication, stakeholders, resources, integration", "Approaches: waterfall vs agile (Scrum: sprints, ceremonies, roles)"],
    misconceptions: ["Critical path is the shortest path — it is the LONGEST path defining minimum duration"],
    exam_tips: ["Triple constraint: scope, time, cost (quality as driver)", "Risk: probability × impact matrix; mitigation strategies", "Gantt vs PERT/CPM charts"],
    references: [
      { type: "book", title: "A Guide to the Project Management Body of Knowledge (PMBOK)", authors: "PMI", publisher: "Project Management Institute" }
    ]
  },
  "supply-chain": {
    overview: "Supply chain management covers sourcing, procurement, inventory, logistics, distribution and demand planning.",
    formulas: ["EOQ = √(2DS/H)", "Reorder point = demand during lead time + safety stock", "Inventory turnover = COGS / average inventory"],
    classifications: ["Flows: material, information, finance", "Strategies: lean (efficiency) vs agile (responsiveness)", "Logistics: inbound, outbound, reverse; 3PL/4PL"],
    misconceptions: ["Supply chain is just logistics — logistics is one link; SCM spans planning to customer"],
    exam_tips: ["Bullwhip effect: demand distortion upstream", "ABC inventory analysis; JIT vs safety stock", "SCOR model: plan, source, make, deliver, return"],
    references: [
      { type: "book", title: "Supply Chain Management: Strategy, Planning and Operation", authors: "Sunil Chopra & Peter Meindl", publisher: "Pearson" }
    ]
  },
  constitution: {
    overview: "The Constitution covers Pakistan's constitutional framework: fundamental rights, federal structure, institutions and constitutional history.",
    classifications: ["Parts: preamble (Objectives Resolution), fundamental rights (II), federation (III-V), judiciary (VII), provinces", "Amendments: 18th (devolution), 25th (FATA merger)", "Institutions: President, PM, Parliament, Judiciary, Election Commission"],
    misconceptions: ["The President appoints the Prime Minister freely — the NA majority must support the PM"],
    exam_tips: ["Article 25: equality before law; Article 9: security of person; Article 19: freedom of speech", "Writ jurisdiction: Art 199 (HC), Art 184(3) (SC)", "Senate: 96 members; NA: 336"],
    references: [
      { type: "book", title: "Constitution of Pakistan 1973", authors: "Government of Pakistan" },
      { type: "book", title: "Constitutional and Political History of Pakistan", authors: "Hamid Khan", publisher: "Oxford University Press" }
    ]
  },
  pedagogy: {
    overview: "Pedagogy covers teaching methods, learning theories, classroom management, assessment and educational psychology.",
    classifications: ["Learning theories: behaviourism (Pavlov, Skinner), cognitivism (Piaget), constructivism (Vygotsky)", "Methods: lecture, discussion, demonstration, project, inquiry", "Assessment: formative vs summative; CCE"],
    misconceptions: ["A lecture is the best method for all learners — active methods outperform for retention"],
    exam_tips: ["Bloom's taxonomy: remember → understand → apply → analyze → evaluate → create", "Zone of proximal development: scaffolding", "Lesson planning: objectives, activities, assessment"],
    references: [
      { type: "book", title: "Educational Psychology", authors: "Anita Woolfolk", publisher: "Pearson" }
    ]
  },
  education: {
    overview: "Education covers educational philosophy, systems, policy and Pakistan's education landscape.",
    classifications: ["Philosophies: idealism, realism, pragmatism, existentialism", "Levels: ECCE, primary, secondary, higher, TVET", "Policy: National Education Policy, SDG4, out-of-school children"],
    exam_tips: ["Pakistan literacy rate ~60% (varies by province/gender)", "Education budgets vs GDP targets (4%)", "AIOU (open university), PITE, curriculum bodies (NCC)"],
    references: [
      { type: "book", title: "Foundations of Education", authors: "Dr. R.A. Shahid" }
    ]
  },
  "physical-education": {
    overview: "Physical education covers sports science, fitness, games rules, anatomy in sport and athletics history.",
    classifications: ["Sports: athletics (track & field), cricket, hockey, football, badminton, squash", "Fitness components: cardiovascular, strength, flexibility, body composition", "Olympics: summer/winter sports, Pakistan medals (hockey, squash, athletics)"],
    exam_tips: ["Pakistan Olympic golds: hockey 1968, 1984; squash world dominance (Khan family)", "Cricket: ICC events, PSL; hockey: World Cup 1971, 1978, 1982, 1994", "Field dimensions and player counts per sport"],
    references: [
      { type: "book", title: "Foundations of Physical Education", authors: "Deborah Wuest" }
    ]
  },
  "ms-office": {
    overview: "Microsoft Office covers Word, Excel, PowerPoint, Access and Outlook essentials for clerical and administrative tests.",
    classifications: ["Excel functions: SUM, AVERAGE, IF, VLOOKUP, COUNTIF; cell references", "Word: formatting, mail merge, tables, styles", "PowerPoint: slides, transitions, animations"],
    exam_tips: ["Excel: relative vs absolute references ($A$1)", "Keyboard shortcuts: Ctrl+C/V/X/Z, Ctrl+S, Ctrl+P", "VLOOKUP syntax: VLOOKUP(value, table, col_index, FALSE)"],
    references: [
      { type: "book", title: "Microsoft Office Step by Step", authors: "Microsoft Press" }
    ]
  },
  windows: {
    overview: "Windows covers OS basics, file management, control panel, settings and troubleshooting.",
    exam_tips: ["File extensions & default apps; shortcuts: Win+D, Win+E, Alt+Tab", "Task Manager: processes, performance, startup", "Windows update & security: Defender, firewall"],
    references: [
      { type: "book", title: "Windows Official Documentation", authors: "Microsoft" }
    ]
  },
  banking: {
    overview: "Banking tests cover banking system, SBP, commercial banks, Islamic banking, financial instruments and customer service for bank jobs.",
    classifications: ["Institutions: SBP (central), commercial, Islamic, microfinance banks", "Products: deposits (current, savings, term), advances (loans, overdrafts), trade finance", "Islamic banking: Murabaha, Musharaka, Ijara, Sukuk"],
    misconceptions: ["SBP is owned by the government — it operates with statutory autonomy under SBP Act 1956"],
    exam_tips: ["SBP roles: monetary policy, currency issue, bank regulation, payment systems", "CRR/SLR requirements; policy rate transmission", "Riba prohibition and Shariah boards in Islamic banks"],
    references: [
      { type: "book", title: "Money and Banking", authors: "State Bank of Pakistan" },
      { type: "book", title: "Banking and Finance", authors: "M. Hanif" }
    ]
  },
  sbp: {
    overview: "SBP covers the State Bank of Pakistan's functions, monetary policy, financial stability and currency management.",
    classifications: ["Core functions: monetary policy, issue of currency, regulation of banks, forex management", "Policy instruments: policy rate, CRR, SLR, OMOs", "Financial inclusion: branchless banking, Roshan Digital"],
    exam_tips: ["SBP Act 1956; State Bank Amendment 1994 gave autonomy", "Policy rate: SBP's main tool; raised to tame inflation", "Banknotes issued by SBP; Mint under federal government"],
    references: [
      { type: "book", title: "State Bank of Pakistan — Annual Report", authors: "SBP" }
    ]
  }
};

/* ---------- Exam-hub subjects: real role/pattern knowledge ---------- */
const EXAMS = {
  "css-exam": { overview: "CSS (Central Superior Services) is the FPSC-administered competitive examination for Pakistan's superior civil services (DMG, Police, Customs, IRS, Foreign Service etc.) — written exam + psychological assessment + interview.", exam_tips: ["CSS written: 6 compulsory subjects (English essay 100, English precis 100, General Science & Ability 100, Current Affairs 100, Pakistan Affairs 100, Islamic Studies 100) + optional subjects (600 marks)", "Scoring: subjects carry weights; 40% qualifying is not automatic — merit is by aggregate", "Interview: 300 marks psychological + viva" ], references: [ { type: "syllabus", title: "FPSC CSS Rules & Syllabus", authors: "FPSC" } ] },
  ppsc: { overview: "PPSC (Punjab Public Service Commission) conducts recruitment for provincial civil service posts in Punjab: written tests (MCQ-based for many posts) and interviews.", exam_tips: ["PPSC tests: general knowledge, current affairs, Pakistan affairs, Islamic studies + subject-specific", "Posts: PMS (Punjab Civil Service), lecturers, administrative officers", "Negative marking varies by post" ], references: [ { type: "syllabus", title: "PPSC syllabus & test pattern", authors: "PPSC" } ] },
  fpsc: { overview: "FPSC (Federal Public Service Commission) recruits federal civil servants: CSS, PMS-equivalent federal posts, departmental exams, and professional officers.", exam_tips: ["FPSC conducts CSS, PMS (federal), and departmental promotion exams", "MCQ-based screening then written for many posts", "FPSC tests: GK, Pakistan affairs, current affairs, essay writing" ], references: [ { type: "syllabus", title: "FPSC examination syllabus", authors: "FPSC" } ] },
  nts: { overview: "NTS (National Testing Service) conducts standardized tests for admission and recruitment in Pakistan: NAT, GAT, and job-specific tests.", exam_tips: ["NAT: 90 questions (IQ 20%, English 20%, quantitative 20%, subject 40%)", "GAT General: verbal 40%, quantitative 30%, analytical 30%", "Test formats: paper-based & computer-based, with negative marking" ], references: [ { type: "syllabus", title: "NTS test frameworks", authors: "NTS" } ] },
  ots: { overview: "OTS (Open Testing Service) conducts recruitment tests for Punjab and federal departments.", exam_tips: ["OTS: one-paper MCQ tests (GK, English, Urdu, Islamic studies, computer basics)", "Used by many provincial government departments" ], references: [ { type: "syllabus", title: "OTS test patterns", authors: "OTS" } ] },
  cts: { overview: "CTS (Common Testing Service) administers recruitment and admission tests across Pakistan.", exam_tips: ["CTS: general knowledge, current affairs, arithmetic, reasoning, English", "Test for clerical & junior posts" ], references: [ { type: "syllabus", title: "CTS syllabus", authors: "CTS" } ] },
  pts: { overview: "PTS (Pakistan Testing Service) conducts tests for government and private recruitment.", exam_tips: ["PTS: GK, IQ, English, subject sections per post", "Computer-based and paper-based formats" ], references: [ { type: "syllabus", title: "PTS test pattern", authors: "PTS" } ] },
  mdcat: { overview: "MDCAT (Medical & Dental College Admission Test) is Pakistan's national medical entry test: Biology, Chemistry, Physics, English, Logical Reasoning.", exam_tips: ["MDCAT 2024+: 200 MCQs, 220 minutes, negative marking 0.25", "Breakdown: Biology 70, Chemistry 60, Physics 40, English 15, Logical Reasoning 15", "Administered by PMC; syllabus aligned to FSC/AHS curriculum" ], references: [ { type: "syllabus", title: "PMC MDCAT syllabus", authors: "Pakistan Medical Commission" } ] },
  ecat: { overview: "ECAT (Engineering College Admission Test) is UET Lahore's engineering entry test: Mathematics, Physics, Chemistry, English.", exam_tips: ["ECAT: 100 MCQs — Math 30, Physics 30, Chemistry 30, English 10", "Merit combines ECAT (50%) with FSC marks", "Negative marking applies" ], references: [ { type: "syllabus", title: "UET ECAT syllabus", authors: "UET Lahore" } ] },
  lat: { overview: "LAT (Law Admission Test) is required for LLB admission by the Higher Education Commission.", exam_tips: ["LAT: 100 MCQs — English 20, Urdu 20, Islamiat 20, Pakistan Studies 20, General Knowledge 20", "Passing 50; merit varies by university" ], references: [ { type: "syllabus", title: "HEC LAT syllabus", authors: "HEC" } ] },
  gat: { overview: "GAT (Graduate Assessment Test) by NTS/HEC: GAT General for MS/MPhil admissions, GAT Subject for subject-based admissions.", exam_tips: ["GAT General: verbal 50, quantitative 35, analytical 15 (100 questions)", "GAT Subject: 50% subject, 50% verbal/quantitative" ], references: [ { type: "syllabus", title: "NTS GAT test framework", authors: "NTS" } ] },
  gre: { overview: "GRE (Graduate Record Examination) by ETS: Verbal Reasoning, Quantitative Reasoning, Analytical Writing for graduate admissions abroad.", exam_tips: ["Sections: Verbal 170, Quant 170, AWA 6.0", "Adaptive multi-stage testing (section-level)", "Vocab: high-frequency GRE words; quant: data interpretation, algebra" ], references: [ { type: "syllabus", title: "GRE Test Structure", authors: "ETS" } ] },
  ielts: { overview: "IELTS (International English Language Testing System): Listening, Reading, Writing, Speaking — academic and general training.", exam_tips: ["Bands 0-9; overall = average of four modules", "Listening: 40 questions, 30 min + 10 transfer", "Academic Reading: 3 passages, 40 questions" ], references: [ { type: "syllabus", title: "IELTS test format", authors: "British Council / IDP" } ] },
  toefl: { overview: "TOEFL iBT (Test of English as a Foreign Language): Reading, Listening, Speaking, Writing, scored 0-120.", exam_tips: ["Scoring: Reading 30, Listening 30, Speaking 30, Writing 30", "Computer-based, about 2 hours", "Integrated tasks combine reading/listening + speaking/writing" ], references: [ { type: "syllabus", title: "TOEFL iBT test content", authors: "ETS" } ] },
  army: { overview: "Pakistan Army recruitment: initial screening, academic test (MCQs on GK, math, English), physical tests and interview.", exam_tips: ["Categories: soldiers (general duty), technical (cadet), officers via PMA", "Academic test: Islamic studies, Pakistan studies, English, math, IQ", "Physical: run (1.6 km), push-ups, sit-ups, chin-ups" ], references: [ { type: "syllabus", title: "Pakistan Army recruitment guidelines", authors: "Pakistan Army" } ] },
  navy: { overview: "Pakistan Navy recruitment: academic test, physical standards and services selection.", exam_tips: ["Test: GK, English, mathematics, physics/chemistry (technical), IQ", "Branches: operations, technical, education, supply", "Physical: swimming preferred; medical strict" ], references: [ { type: "syllabus", title: "Pakistan Navy induction standards", authors: "Pakistan Navy" } ] },
  paf: { overview: "PAF (Pakistan Air Force) recruitment: written tests, physical, medical and psychometric evaluation.", exam_tips: ["Written: English, physics, mathematics, GK, IQ", "Airman vs officer (GD Pilot via ISSB/Psych)", "Height/vision standards strict for aircrew" ], references: [ { type: "syllabus", title: "PAF recruitment standards", authors: "Pakistan Air Force" } ] },
  issb: { overview: "ISSB (Inter Services Selection Board) assesses officer candidates for Army, Navy and PAF: written, psychological (TOFT), GTO and interview.", exam_tips: ["ISSB stages: intelligence tests (verbal/non-verbal), mechanical aptitude, psych, GTO tasks, interview", "Confidence, cooperation and leadership assessed in GTO tasks", "Recommendation requires sustained performance across 4 days" ], references: [ { type: "book", title: "ISSB (officer selection)", authors: "Pakistan Armed Forces" } ] },
  pma: { overview: "PMA (Pakistan Military Academy) trains commissioned army officers; entry via PMA Long Course after ISSB.", exam_tips: ["Entry: ISSB selection + PMA written test (initial academic test)", "Training: 2 years (military + academic), commissions as Second Lieutenant" ], references: [ { type: "syllabus", title: "PMA Long Course entry requirements", authors: "Pakistan Army" } ] },
  asf: { overview: "ASF (Airport Security Force) recruitment: written test on GK, English, Islamic studies, math and security awareness.", exam_tips: ["Posts: ASF constable, sub-inspector; physical standards apply", "Test: objective MCQs + physical fitness" ], references: [ { type: "syllabus", title: "ASF recruitment", authors: "ASF" } ] },
  anf: { overview: "ANF (Anti-Narcotics Force) recruitment under the Interior Ministry: written tests and physical standards.", exam_tips: ["Test: GK, current affairs, English, Islamic studies, math", "Physical: running and endurance standards" ], references: [ { type: "syllabus", title: "ANF recruitment", authors: "ANF" } ] },
  fia: { overview: "FIA (Federal Investigation Agency) recruitment: written tests for investigators, inspectors and support staff.", exam_tips: ["Tests: GK, current affairs, Pakistan affairs, English, law basics (investigator)", "FIA investigates cybercrime, immigration, anti-corruption cases" ], references: [ { type: "syllabus", title: "FIA recruitment", authors: "FIA" } ] },
  nab: { overview: "NAB (National Accountability Bureau) recruitment: written tests for investigation and administrative posts.", exam_tips: ["Tests: GK, current affairs, law, accounting (finance posts), English", "NAB jurisdiction: corruption, white-collar crimes" ], references: [ { type: "syllabus", title: "NAB recruitment", authors: "NAB" } ] },
  police: { overview: "Police recruitment (provincial): written tests for constable to sub-inspector grades.", exam_tips: ["Constable test: GK, current affairs, Pakistan studies, math, English, Islamic studies", "Physical: running 1.6 km, push-ups, chin-ups", "Height/chest standards by province" ], references: [ { type: "syllabus", title: "Police recruitment guidelines", authors: "Provincial Police" } ] },
  railway: { overview: "Pakistan Railways recruitment: written tests for clerical, technical and operational staff.", exam_tips: ["Tests: GK, English, arithmetic, computer basics (clerical), technical subjects (technical posts)", "Posts: ticket examiner, station master, assistant, technician" ], references: [ { type: "syllabus", title: "Railways recruitment", authors: "Pakistan Railways" } ] },
  wapda: { overview: "WAPDA recruitment: written tests for engineering, technical, clerical and management posts in power/water sector.", exam_tips: ["Tests: subject + English + IQ; engineering posts test core subjects", "WAPDA operates hydel projects, dams (Tarbela, Mangla)" ], references: [ { type: "syllabus", title: "WAPDA recruitment", authors: "WAPDA" } ] },
  teaching: { overview: "Teaching recruitment (EST/SST, TGT) in Punjab and other provinces: academic MCQs + pedagogy.", exam_tips: ["EST (Elementary School Teacher): primary subjects + pedagogy", "SST (Secondary School Teacher): subject mastery + teaching methods", "NTS/PPSC conduct most teaching tests" ], references: [ { type: "syllabus", title: "Teaching recruitment syllabus", authors: "Punjab Education Department" } ] },
  educators: { overview: "Educators recruitment (CE, PST, EST, SST) by PPSC/Education departments: academic knowledge + pedagogy + GK.", exam_tips: ["Papers: subject knowledge (major), pedagogy, GK/current affairs, Islamic studies", "Posts: primary school teacher (PST), certified educators (CE)" ], references: [ { type: "syllabus", title: "Educators recruitment syllabus", authors: "PPSC" } ] },
   lecturer: { overview: "Lecturer recruitment (BS-17) by PPSC/FPSC: deep subject MCQs (100 questions) in the discipline.", exam_tips: ["Lecturer tests: subject-only MCQs, high difficulty", "Post: lecturer in colleges across provinces" ], references: [ { type: "syllabus", title: "Lecturer recruitment syllabus", authors: "PPSC/FPSC" } ] }
};

module.exports = { PACKS, EXAMS };
