/* ============================================================
   Generator file 18 — Targeted Topic Banks (Deep Knowledge)
   Original fact banks for the 63 topics the audit found empty
   (real syllabus nodes the core generators never covered).
   Each topic -> 8-12 original [question, answer, explanation].
   ============================================================ */
"use strict";
const L = require("../lib.js");

function makeGen(subjectId, chapterName, facts) {
  const topics = Object.keys(facts);
  return {
    subjects: [subjectId],
    name: chapterName,
    topics,
    tags: [subjectId, "topic-bank"],
    generate(rng, topicName) {
      const pool = facts[topicName].map(([q, a, e]) => ({ q, a, e }));
      return L.factGenerator(pool, [])(rng);
    }
  };
}

module.exports = [
  /* ================= PAKISTAN AFFAIRS ================= */
  makeGen("pakistan-affairs", "Pakistan Affairs — Deeper Topics", {
    "Natural Resources": [
      ["Which river system provides most of Pakistan's irrigation water?", "The Indus Basin", "The Indus and its tributaries irrigate about 80% of Pakistan's farmland."],
      ["Where are Pakistan's largest coal reserves located?", "Thar, Sindh", "Thar hosts one of the world's largest lignite coal fields."],
      ["Which mineral deposit is Pakistan developing at Reko Diq?", "Copper and gold", "Reko Diq in Balochistan is one of the world's largest undeveloped copper-gold deposits."],
      ["Which natural gas field was Pakistan's first major discovery?", "Sui, Balochistan", "The Sui gas field was discovered in 1952."],
      ["Which salt range in Punjab contains major rock salt reserves?", "Khewra Salt Mines", "Khewra is the world's second largest salt mine, in the Salt Range."],
      ["What is Pakistan's major export crop?", "Cotton", "Cotton and its products are Pakistan's largest export earner."],
      ["Which province holds most of Pakistan's crude oil reserves?", "Sindh", "Sindh, especially the Badin region, produces the bulk of Pakistan's oil."],
      ["Which dam is Pakistan's largest water reservoir?", "Tarbela Dam", "Tarbela on the Indus is Pakistan's largest earth-fill dam and reservoir."],
      ["What percentage of Pakistan's electricity comes from the national grid's hydel share?", "Around one quarter", "Hydel contributes roughly a quarter of installed capacity, with thermal and nuclear the rest."],
      ["Which mineral is mined extensively in Chagai, Balochistan?", "Chromite", "Chagai district is rich in chromite deposits."],
      ["Which lake is Pakistan's largest freshwater lake?", "Lake Manchar", "Manchar in Sindh is Pakistan's largest freshwater lake."],
      ["Which gas field discovery made Pakistan self-sufficient in gas for decades?", "Sui", "Sui's 1952 discovery transformed Pakistan's energy supply."]
    ],
    "Early Years (1947-58)": [
      ["Who was Pakistan's first Governor-General?", "Quaid-e-Azam Muhammad Ali Jinnah", "Jinnah served as Governor-General from August 1947 until his death in 1948."],
      ["Who was Pakistan's first Prime Minister?", "Liaquat Ali Khan", "Liaquat Ali Khan served as first PM from 1947 until his assassination in 1951."],
      ["When was the Objectives Resolution adopted?", "1949", "The Objectives Resolution (1949) framed the constitution's Islamic principles."],
      ["Which constitution was Pakistan's first?", "The 1956 Constitution", "The 1956 Constitution made Pakistan an Islamic Republic."],
      ["When was martial law first imposed in Pakistan?", "1958", "General Ayub Khan imposed martial law in October 1958."],
      ["When did Pakistan become a UN member?", "1947", "Pakistan joined the United Nations on 30 September 1947."],
      ["Which country recognized Pakistan in 1947 before all others?", "Saudi Arabia", "Saudi Arabia was the first country to recognize Pakistan."],
      ["Which war over Kashmir took place in 1948?", "The First Kashmir War", "The 1947-48 war ended with a ceasefire line patrolled by the UN."],
      ["Who was the second Governor-General of Pakistan?", "Khawaja Nazimuddin", "Nazimuddin succeeded Jinnah in 1948."],
      ["Which province was created in 1955?", "West Pakistan (One Unit)", "The One Unit scheme merged West Pakistan provinces in 1955."],
      ["When did Pakistan become a republic?", "1956", "Pakistan became a republic when the 1956 constitution took effect."],
      ["Who signed the Liaquat-Nehru Pact in 1950?", "Liaquat Ali Khan", "The pact protected minorities' rights in both dominions."]
    ],
    "Ayub & Yahya Era": [
      ["When did Ayub Khan become President?", "1958", "Ayub assumed the presidency after the 1958 coup."],
      ["Which constitution was introduced under Ayub Khan?", "The 1962 Constitution", "The 1962 Constitution introduced a presidential system."],
      ["What was the Basic Democracies system?", "A system of local councils", "Basic Democracies were 80,000 local council units that elected the president."],
      ["When was the Indus Waters Treaty signed?", "1960", "India and Pakistan signed it with World Bank mediation."],
      ["When was the 1965 war with India fought?", "September 1965", "The 17-day war ended with the Tashkent Declaration."],
      ["Where was the 1965 ceasefire agreement signed?", "Tashkent", "The Tashkent Declaration was signed in January 1966."],
      ["Who replaced Ayub Khan in 1969?", "General Yahya Khan", "Yahya Khan took over and imposed martial law again."],
      ["When were the first general elections held in Pakistan?", "December 1970", "The 1970 elections were the first direct general elections."],
      ["Which party won East Pakistan in the 1970 elections?", "Awami League", "The Awami League won a majority in East Pakistan."],
      ["When did East Pakistan separate as Bangladesh?", "1971", "Bangladesh emerged after the December 1971 war."],
      ["Who chaired the inquiry into the 1971 war?", "Justice Hamoodur Rahman", "The Hamoodur Rahman Commission investigated the 1971 events."],
      ["Which canal dispute triggered the 1965 war?", "Rann of Kutch", "Clashes began in the Rann of Kutch before the wider war."]
    ],
    "Zia Era & 1990s": [
      ["When did General Zia-ul-Haq impose martial law?", "July 1977", "Zia overthrew Zulfikar Ali Bhutto's government in July 1977."],
      ["Who was executed in 1979?", "Zulfikar Ali Bhutto", "Bhutto was hanged in April 1979."],
      ["Which elections were held in 1985 without political parties?", "The 1985 non-party elections", "Zia held party-less elections in 1985."],
      ["When did Zia-ul-Haq die?", "August 1988", "Zia died in a plane crash near Bahawalpur."],
      ["Who became PM after the 1988 elections?", "Benazir Bhutto", "Benazir Bhutto became Pakistan's first female PM in 1988."],
      ["Which PM was dismissed in 1990 after corruption charges?", "Benazir Bhutto", "President Ghulam Ishaq Khan dismissed her first government."],
      ["When did Pakistan conduct its nuclear tests?", "May 1998", "Pakistan tested five devices on 28 May 1998 in Chagai."],
      ["Which leader was PM for three terms in the 1990s?", "Nawaz Sharif", "Nawaz Sharif served in 1990-93, 1997-99 and 2013-17."],
      ["What was the 1998 Kargil episode?", "An armed incursion in Kashmir", "The Kargil conflict took place in mid-1999."],
      ["When did General Musharraf take power?", "October 1999", "Musharraf overthrew Nawaz Sharif in a bloodless coup."],
      ["Which law reform package was introduced by Zia in 1979?", "The Hudood Ordinances", "The Hudood laws redefined several criminal punishments."],
      ["Which constitutional amendment restored the 1973 constitution's parliamentary features?", "The 8th Amendment (reversed later)", "The 8th Amendment enlarged presidential powers; the 18th removed them."]
    ],
    "Neighbours & Major Powers": [
      ["Which country is Pakistan's all-weather friend?", "China", "Pakistan-China ties are described as all-weather strategic cooperation."],
      ["Which corridor links Gwadar to China?", "CPEC (China-Pakistan Economic Corridor)", "CPEC is the flagship of the Belt and Road Initiative in Pakistan."],
      ["Which border between Pakistan and India is disputed?", "Kashmir", "Kashmir is the core dispute between the two neighbours."],
      ["Which treaty governs the use of Indus waters?", "The Indus Waters Treaty 1960", "It allocates eastern rivers to India and western rivers to Pakistan."],
      ["With which neighbour does Pakistan share the Durand Line?", "Afghanistan", "The Durand Line (1893) is the Pakistan-Afghanistan border."],
      ["Which neighbour hosts most Afghan refugees in Pakistan?", "Iran shares the border too", "Pakistan hosts millions of Afghan refugees near its western border."],
      ["Which organization mediates several Pakistan-India issues?", "The United Nations", "UN peacekeeping and good offices cover Kashmir disputes."],
      ["Which country is Pakistan's largest trade partner in the region after China?", "UAE", "The UAE is a major trade and remittance partner."],
      ["Which strategic naval point does Pakistan control at the Arabian Sea?", "Gwadar Port", "Gwadar sits at the mouth of the Strait of Hormuz shipping lanes."],
      ["Which country operates major naval exercises with Pakistan?", "China (and formerly the USA)", "Pakistan holds regular Aman exercises with regional navies."]
    ],
    "OIC & SAARC": [
      ["When was the OIC founded?", "1969", "The OIC was established after the 1969 Rabat summit."],
      ["Where is the OIC headquarters?", "Jeddah, Saudi Arabia", "The OIC secretariat is in Jeddah."],
      ["How many member states does the OIC have?", "57", "The OIC has 57 member states."],
      ["Which Pakistani hosted an OIC summit in 1997?", "Nawaz Sharif", "The 1997 OIC summit was held in Islamabad."],
      ["Which OIC body deals with Islamic jurisprudence?", "The International Islamic Fiqh Academy", "It is based in Jeddah."],
      ["When was SAARC founded?", "1985", "SAARC was launched at the Dhaka summit in 1985."],
      ["How many members does SAARC have?", "8", "Afghanistan, Bangladesh, Bhutan, India, Maldives, Nepal, Pakistan, Sri Lanka."],
      ["Where is SAARC's secretariat?", "Kathmandu, Nepal", "The SAARC secretariat is in Kathmandu."],
      ["Which agreement liberalizes trade within SAARC?", "SAFTA (2006)", "SAFTA entered into force in 2006."],
      ["Which SAARC summit was postponed after 2016 tensions?", "The 19th summit", "It was scheduled in Pakistan but has been indefinitely postponed."],
      ["Which OIC summit addressed the Kashmir issue in 1971?", "The 1971 Jeddah summit", "The OIC has repeatedly supported the Kashmir cause."],
      ["Which Pakistani became OIC Secretary-General?", "Syed Sharifuddin Pirzada", "He served as OIC Secretary-General in the 1980s."]
    ],
    "Parliament & President": [
      ["How many seats does the National Assembly have?", "336", "The 18th Amendment fixed 336 seats (272 general + reserved)."],
      ["How many members does the Senate have?", "96", "The Senate has 96 members elected by provincial assemblies."],
      ["Who presides over the National Assembly?", "The Speaker", "The Speaker is elected by the Assembly's members."],
      ["Who appoints the Prime Minister?", "The President", "The President appoints the PM from the majority party in the National Assembly."],
      ["Which article governs the federal government?", "Article 90", "Article 90 vests executive authority in the Prime Minister and Cabinet."],
      ["When was the 18th Amendment passed?", "2010", "It devolved power to provinces and abolished concurrent list."],
      ["Who can dissolve the National Assembly?", "The President", "The President dissolves it on the PM's advice (Article 58)."],
      ["Which body elects the President?", "The Electoral College", "It comprises members of Parliament and provincial assemblies."],
      ["What is the Senate's role in legislation?", "Review and amend", "Money bills originate in the National Assembly; the Senate reviews others."],
      ["Which body resolves disputes between houses?", "The Joint Sitting", "A joint sitting of both houses settles disagreements."],
      ["Who heads the Senate?", "The Chairman", "The Chairman is elected by Senate members."],
      ["What is a caretaker government?", "A neutral government during elections", "It runs state affairs between a dissolved assembly and new elections."]
    ],
    "Judiciary & Civil Service": [
      ["Who is the head of the superior judiciary?", "The Chief Justice of Pakistan", "The CJP heads the Supreme Court."],
      ["Which article gives the Supreme Court suo motu powers?", "Article 184(3)", "Article 184(3) allows public-interest jurisdiction."],
      ["How many High Courts does Pakistan have?", "6", "Four provincial, plus Islamabad and Azad Kashmir."],
      ["Which court hears Islamic law appeals?", "The Federal Shariat Court", "It examines laws against Islamic injunctions."],
      ["Which body conducts the CSS examination?", "The Federal Public Service Commission (FPSC)", "FPSC runs competitive exams for federal services."],
      ["Which service group is Pakistan's top civil service?", "The Pakistan Administrative Service (PAS)", "PAS officers occupy key district and secretariat posts."],
      ["Which act governs civil servants?", "The Civil Servants Act 1973", "It sets recruitment, conduct and pension rules."],
      ["Who appoints superior court judges?", "The President", "The President appoints judges on the Judicial Commission's recommendation."],
      ["What does the Judicial Commission do?", "Recommends superior court appointments", "It nominates judges for Supreme and High Courts."],
      ["Which body audits civil service promotions?", "The Federal Public Service Commission", "FPSC also runs departmental promotion exams."],
      ["What is the NAB's constitutional role?", "Anti-corruption enforcement", "NAB investigates corruption and financial crimes."],
      ["Which police service is recruited centrally?", "The Police Service of Pakistan (PSP)", "PSP officers are selected through the CSS."]
    ]
  }),

  /* ================= ISLAMIC STUDIES ================= */
  makeGen("islamic-studies", "Islamic Studies — Deeper Topics", {
    "Scientific References": [
      ["Which Quranic term describes the embryo's stages of development?", "Alaqa and mudgha", "The Quran describes the embryo as a clinging clot then a lump."],
      ["Which surah mentions iron as a metal with great strength?", "Surah Al-Hadid", "Al-Hadid (The Iron) refers to iron's strength and use."],
      ["What does the Quran say about mountains?", "They stabilize the earth", "Mountains are described as pegs preventing the earth's shaking."],
      ["Which verse describes the expansion of the heavens?", "The heavens We built with power", "Surah Adh-Dhariyat 51:47 is cited as matching cosmic expansion."],
      ["What separates fresh and salt water per the Quran?", "A barrier", "The Quran mentions a barrier (barzakh) between the two seas."],
      ["Which creature's honey is praised in the Quran?", "The bee", "Surah An-Nahl instructs bees to build hives and produce honey."],
      ["What does the Quran say about the sun and moon?", "They follow calculated orbits", "Both move in appointed courses (Surah Ar-Rahman)."],
      ["Which pair of phenomena does the Quran link to rain?", "Winds and clouds", "Winds carry laden clouds which bring rain to dead land."],
      ["What did the Prophet say about cleanliness?", "Cleanliness is half of faith", "The hadith highlights purity's central place in worship."],
      ["Which Quranic fact matches modern embryology timelines?", "The 40-day stages", "The hadith mentions stages of 40 days, echoed in modern studies."]
    ],
    "Key Teachings": [
      ["What is the central teaching of Islam?", "Tawheed (oneness of God)", "All acts of worship are directed to the one God."],
      ["What does Islam teach about honesty in trade?", "Truthful traders are rewarded", "Honesty in business is a commanded virtue."],
      ["How are parents treated in the Quran?", "With kindness, never with harshness", "Surah Al-Isra commands care for parents."],
      ["What does Zakat teach the giver?", "Purification of wealth", "Zakat purifies wealth and supports the needy."],
      ["How does Islam treat neighbours?", "With care and hospitality", "The Prophet urged kindness to neighbours, Muslim or not."],
      ["What is the Quranic ruling on lying?", "Forbidden in all forms", "Truthfulness is a defining trait of the believer."],
      ["What does patience (sabr) achieve?", "God's help and reward", "The Quran links patience to divine support."],
      ["How should Muslims treat orphans?", "With protection and justice", "The Quran commands fair treatment of orphans."],
      ["What is the Islamic view of mercy?", "A central divine attribute", "Ar-Rahman and Ar-Rahim open every surah but one."],
      ["What does justice require in testimony?", "Truth even against relatives", "The Quran commands justice even against oneself or kin."],
      ["How does Islam treat anger?", "It should be controlled", "Controlling anger is praised as strength in hadith."],
      ["What does the Quran say about gossip?", "It is like eating dead flesh", "Backbiting is condemned in Surah Al-Hujurat."]
    ],
    "Hazrat Ali": [
      ["Who was Hazrat Ali (RA)?", "The Prophet's cousin and son-in-law", "He married Fatima, the Prophet's daughter."],
      ["When did Hazrat Ali become the fourth caliph?", "656 CE (35 AH)", "He succeeded Caliph Uthman."],
      ["Where was Hazrat Ali martyred?", "Kufa, Iraq", "He was struck at the mosque of Kufa in 661 CE."],
      ["Who killed Hazrat Ali?", "Abdul Rahman ibn Muljim", "A Kharijite assassin struck him during Fajr prayer."],
      ["Which battle was fought between Ali and Aisha's forces?", "The Battle of the Camel", "It took place in 656 CE near Basra."],
      ["Which battle pitted Ali against Muawiya?", "The Battle of Siffin", "Siffin (657 CE) ended in arbitration."],
      ["Which collection of sermons is attributed to Ali?", "Nahj al-Balagha", "Nahj al-Balagha compiles his sermons and letters."],
      ["Which of the Prophet's sayings praises Ali's knowledge?", "I am the city of knowledge, Ali is its gate", "This famous hadith highlights Ali's scholarship."],
      ["What was Ali's role at the Prophet's migration?", "He slept in the Prophet's bed", "He shielded the Prophet during the Hijrah."],
      ["Which qualities earned Ali the title Asadullah?", "His bravery in battle", "Asadullah means Lion of God."],
      ["How long did Ali's caliphate last?", "About five years", "His rule ran from 656 to 661 CE."],
      ["Who was Ali's famous son?", "Hasan and Hussain", "Both became central figures of Islamic history."]
    ],
    "Halal & Haram": [
      ["What does Halal mean?", "Permitted in Islamic law", "Halal covers food, actions and earnings allowed by shariah."],
      ["Which animals are forbidden as food?", "Pigs and carrion", "Pork, carrion and blood are explicitly forbidden."],
      ["How must animals be slaughtered?", "With the name of God and proper method", "Slaughter must drain blood and mention God's name."],
      ["What is Riba?", "Interest or usury", "Riba is forbidden in financial dealings."],
      ["Is gambling halal?", "No, it is haram", "The Quran forbids gambling (maisir)."],
      ["What does the Quran say about intoxicants?", "They are forbidden", "Khamr (intoxicants) is prohibited."],
      ["Is backbiting halal?", "No, it is haram", "Ghibah is condemned in the Quran."],
      ["What makes income haram?", "Earning through fraud or theft", "Wealth must be earned honestly."],
      ["Are seafood and fish halal?", "Yes, generally", "Fish is permitted without slaughter."],
      ["What is the ruling on eating in excess?", "Moderation is commanded", "Eat and drink but do not waste (Surah Al-A'raf)."]
    ]
  }),

  /* ================= ENGLISH ================= */
  makeGen("english", "English — Deeper Topics", {
    "Tenses": [
      ["Which tense describes habitual actions?", "Present simple", "Present simple is used for routines and facts."],
      ["Which tense describes an action happening now?", "Present continuous", "Present continuous uses am/is/are + -ing."],
      ["Which tense is used for completed past actions?", "Past simple", "Past simple uses the -ed form or irregular verbs."],
      ["Which tense links the past to the present?", "Present perfect", "Present perfect uses has/have + past participle."],
      ["Which tense describes an action before another past action?", "Past perfect", "Past perfect uses had + past participle."],
      ["Which tense describes ongoing past actions?", "Past continuous", "Past continuous uses was/were + -ing."],
      ["Which tense expresses future plans?", "Future simple with will", "Will + base verb marks future decisions and predictions."],
      ["Which tense describes action completed before a future point?", "Future perfect", "Future perfect uses will have + past participle."],
      ["Which signal word suits present perfect?", "Since and for", "Since + point in time; for + duration."],
      ["Which form follows 'I am'?", "The -ing form", "Am is followed by the present participle."],
      ["Which tense suits daily routines?", "Present simple", "Routines use present simple with frequency adverbs."],
      ["Which tense describes an action scheduled in the future?", "Present simple", "Timetables use present simple for fixed schedules."]
    ],
    "Word Meanings": [
      ["What does 'ubiquitous' mean?", "Found everywhere", "Smartphones are ubiquitous in modern cities."],
      ["What does 'meticulous' mean?", "Extremely careful and precise", "A meticulous editor checks every comma."],
      ["What does 'ambiguous' mean?", "Open to more than one interpretation", "His reply was ambiguous, leaving both sides hopeful."],
      ["What does 'resilient' mean?", "Able to recover quickly", "Resilient economies bounce back after shocks."],
      ["What does 'arduous' mean?", "Involving great effort", "The trek was arduous but rewarding."],
      ["What does 'concise' mean?", "Brief but comprehensive", "Concise writing respects the reader's time."],
      ["What does 'inevitable' mean?", "Certain to happen", "Change is inevitable in every institution."],
      ["What does 'prolific' mean?", "Producing many works", "She is a prolific author of textbooks."],
      ["What does 'transparent' mean?", "Open and easily understood", "Transparent processes build public trust."],
      ["What does 'viable' mean?", "Capable of working successfully", "The plan is financially viable."]
    ],
    "Proverbs": [
      ["What does 'A stitch in time saves nine' mean?", "Fix problems early", "Small timely repairs prevent bigger damage."],
      ["What does 'Actions speak louder than words' mean?", "What you do matters more than what you say", "People judge deeds, not promises."],
      ["What does 'Every cloud has a silver lining' mean?", "Good can come from bad", "Hardships often bring hidden benefits."],
      ["What does 'Honesty is the best policy' mean?", "Truthfulness serves one best", "Deception usually backfires."],
      ["What does 'Where there is a will, there is a way' mean?", "Determination overcomes obstacles", "Strong resolve finds solutions."],
      ["What does 'Better late than never' mean?", "Finishing late still beats not finishing", "A delayed effort still has value."],
      ["What does 'Rome was not built in a day' mean?", "Great results take time", "Patient work builds lasting achievements."],
      ["What does 'The early bird catches the worm' mean?", "Acting early brings advantage", "Early effort secures the best opportunity."],
      ["What does 'Don't count your chickens before they hatch' mean?", "Don't rely on uncertain gains", "Wait for results before assuming success."],
      ["What does 'All that glitters is not gold' mean?", "Appearances can deceive", "Shiny things are not always valuable."],
      ["What does 'Practice makes perfect' mean?", "Repeated effort improves skill", "Constant practice refines performance."],
      ["What does 'United we stand, divided we fall' mean?", "Unity brings strength", "Groups fail when they are split."]
    ],
    "Translation Practice": [
      ["Which English sentence best translates 'وہ کتاب پڑھ رہا ہے'?", "He is reading a book", "Present continuous renders the ongoing action."],
      ["Which best translates 'میں کل لاہور جاؤں گا'?", "I will go to Lahore tomorrow", "Future simple expresses the plan."],
      ["Which best translates 'اس نے کام مکمل کر لیا ہے'?", "He has completed the work", "Present perfect marks completion relevant now."],
      ["Which best translates 'وہ دو سال سے یہاں رہ رہا ہے'?", "He has been living here for two years", "Present perfect continuous expresses duration."],
      ["Which best translates 'بارش شروع ہو گئی'?", "It started raining", "Past simple states the completed event."],
      ["Which best translates 'اگر محنت کرو گے تو کامیاب ہو گے'?", "If you work hard, you will succeed", "First conditional pairs present with future."],
      ["Which best translates 'اسے دفتر پہنچنے میں دیر ہو گئی'?", "He was late reaching the office", "The phrase keeps the meaning without literal word order."],
      ["Which best translates 'یہ کتاب میرے دوست کی ہے'?", "This book belongs to my friend", "Possession renders naturally with 'belongs to'."],
      ["Which best translates 'وہ بیمار ہونے کے باوجود آیا'?", "He came despite being ill", "'Despite' expresses the contrast concisely."],
      ["Which best translates 'ہم نے فیصلہ کر لیا ہے کہ ہم نہیں جائیں گے'?", "We have decided not to go", "The negative attaches to the infinitive in English."]
    ]
  }),

  /* ================= EVERYDAY SCIENCE ================= */
  makeGen("everyday-science", "Everyday Science — Deeper Topics", {
    "Heat & Temperature": [
      ["Which process transfers heat through a metal rod?", "Conduction", "Conduction flows through direct particle contact."],
      ["Which process warms a room from a heater?", "Convection", "Warm air rises and circulates by convection."],
      ["Which process transfers heat from the Sun?", "Radiation", "Radiation travels through empty space."],
      ["Which thermometer liquid is commonly used?", "Mercury or alcohol", "Both expand predictably with temperature."],
      ["At what temperature does water boil at sea level?", "100 °C", "Boiling point falls at higher altitudes."],
      ["What is the freezing point of water?", "0 °C", "Pure water freezes at 0 °C at sea level."],
      ["What is the SI unit of temperature?", "Kelvin", "Kelvin (K) is the absolute scale."],
      ["Which scale has no negative values?", "Kelvin", "Absolute zero is 0 K."],
      ["Which material is a good insulator?", "Wood", "Wood slows heat transfer."],
      ["Why does a fan cool you?", "It speeds up evaporation", "Evaporation of sweat draws heat from the skin."],
      ["What happens to metal rails in summer?", "They expand", "Expansion can buckle rails without gaps."],
      ["What is specific heat capacity?", "Heat needed to raise 1 kg by 1 K", "Water's high specific heat moderates climate."]
    ]
  }),

  /* ================= CHEMISTRY ================= */
  makeGen("chemistry", "Chemistry — Deeper Topics", {
    "Solutions & Equilibrium": [
      ["What is a solute?", "The substance dissolved", "Salt is the solute in saltwater."],
      ["What is a saturated solution?", "One holding maximum solute", "No more solute dissolves at that temperature."],
      ["What is molarity?", "Moles of solute per litre", "Molarity (M) = mol/L."],
      ["What does Le Chatelier's principle state?", "Equilibrium shifts to oppose change", "Stress on a system moves equilibrium against it."],
      ["What is a buffer?", "A solution resisting pH change", "Buffers keep pH stable in body fluids."],
      ["What is pH of a neutral solution?", "7", "Acidic below 7, alkaline above."],
      ["Which factor does NOT change Kc?", "Concentration changes", "Only temperature changes the equilibrium constant."],
      ["What happens if you add solute to a saturated solution?", "It precipitates", "Excess solute crystallizes out."],
      ["Which process dissolves sugar in tea?", "Dissolution", "Polar water molecules separate sugar's particles."],
      ["What is solubility affected by?", "Temperature and pressure", "Most solids dissolve more at higher temperature."],
      ["Which solution has equal solute and solvent amounts?", "A concentrated but not standard ratio", "Ratios vary; equal masses only occur specially."],
      ["What is an electrolyte?", "A solute that conducts electricity", "Salts and acids form conducting ions in water."]
    ]
  }),

  /* ================= ZOOLOGY ================= */
  makeGen("zoology", "Zoology — Deeper Topics", {
    "Adaptation & Evolution": [
      ["Who proposed natural selection?", "Charles Darwin", "Darwin's 1859 Origin of Species explained adaptation."],
      ["What is camouflage?", "Blending with surroundings", "Camouflage hides prey and predators alike."],
      ["What is mimicry?", "Resembling another species", "Viceroy butterflies mimic monarchs."],
      ["What are fossils?", "Preserved remains of ancient life", "Fossils document evolutionary change."],
      ["What are homologous structures?", "Same origin, different function", "Bat wings and human arms share ancestry."],
      ["What are analogous structures?", "Same function, different origin", "Bird and insect wings evolved independently."],
      ["What drives adaptation?", "Natural selection", "Fitter traits spread through generations."],
      ["Who proposed use and disuse inheritance?", "Jean-Baptiste Lamarck", "Lamarck's ideas preceded Darwin's."],
      ["What is a species?", "Organisms that can interbreed", "Members share gene pools and offspring."],
      ["What is sexual selection?", "Choice based on traits", "Peacock tails evolved through mate choice."],
      ["What is an adaptation?", "A trait improving survival", "Desert foxes' big ears shed heat."],
      ["What is evolution?", "Change in populations over time", "Allele frequencies shift across generations."]
    ]
  }),

  /* ================= INTERNATIONAL RELATIONS ================= */
  makeGen("international-relations", "International Relations — Deeper Topics", {
    "Pakistan's Bilateral Relations": [
      ["Which country is Pakistan's 'Iron Brother'?", "China", "China-Pakistan ties are formal and strategic."],
      ["Which document defines CPEC's scope?", "The CPEC Long Term Plan", "It covers energy, infrastructure and industry."],
      ["With which country did Pakistan sign the Tashkent Declaration?", "India", "Tashkent (1966) ended the 1965 war."],
      ["Which country mediates many Pakistan-India talks?", "The United States", "US diplomacy has hosted both sides."],
      ["Which neighbour is a key host of Afghan refugees?", "Pakistan", "Pakistan shelters millions of Afghans."],
      ["Which country supplies most of Pakistan's defence needs?", "China", "China is Pakistan's largest arms supplier."],
      ["Which Gulf country hosts millions of Pakistani workers?", "Saudi Arabia", "Remittances from Saudi Arabia are a pillar of the economy."],
      ["Which organization funds Pakistan's development projects?", "The World Bank and ADB", "Both finance infrastructure and energy schemes."],
      ["Which country is Pakistan's major fruit export destination?", "The Gulf states", "Mangoes and kinnow go mainly to the Gulf."],
      ["Which summit normalized Pakistan-US ties after 9/11?", "The 2001 alignment", "Pakistan joined the US-led coalition against terror."],
      ["Which country helps Pakistan operate JF-17 jets?", "China", "JF-17 is a joint Pakistan-China fighter."],
      ["Which UN mission does Pakistan lead in peacekeeping?", "Multiple missions", "Pakistan is among the largest troop contributors."]
    ]
  }),

  /* ================= REASONING ================= */
  makeGen("reasoning", "Reasoning — Deeper Topics", {
    "Pattern Series": [
      ["What is the next number: 2, 4, 8, 16, ?", "32", "Each term doubles the previous."],
      ["What is the next number: 1, 4, 9, 16, ?", "25", "The terms are squares of 1, 2, 3, 4, 5."],
      ["What is the next number: 3, 6, 11, 18, ?", "27", "Differences increase by 2 each step."],
      ["What is the next letter: A, C, E, G, ?", "I", "Letters skip one each time."],
      ["What is the next number: 5, 10, 20, 40, ?", "80", "Each term doubles."],
      ["What is the next number: 100, 90, 81, 73, ?", "66", "Subtract 10, 9, 8, 7 successively."],
      ["What is the next number: 1, 1, 2, 3, 5, 8, ?", "13", "Each term adds the two before it (Fibonacci)."],
      ["What is the next number: 7, 14, 28, 56, ?", "112", "Each term doubles."],
      ["What is the missing number: 2, 6, 12, 20, 30, ?", "42", "Differences are 4, 6, 8, 10, 12."],
      ["What is the next letter: Z, X, V, T, ?", "R", "Letters step back by two each time."]
    ]
  }),

  /* ================= BIOCHEMISTRY ================= */
  makeGen("biochemistry", "Biochemistry — Deeper Topics", {
    "Carbohydrates & Lipids": [
      ["Which sugar is blood glucose?", "Glucose", "Glucose is the body's main fuel."],
      ["What is glycogen?", "Stored glucose in animals", "The liver stores glycogen."],
      ["Which disaccharide is table sugar?", "Sucrose", "Sucrose is glucose + fructose."],
      ["Which polysaccharide forms plant cell walls?", "Cellulose", "Cellulose gives plants structural strength."],
      ["Which carbohydrate is stored in plants?", "Starch", "Starch is plants' energy reserve."],
      ["What are triglycerides?", "Three fatty acids on glycerol", "They are the main stored fats."],
      ["Which lipid forms cell membranes?", "Phospholipids", "Phospholipid bilayers build membranes."],
      ["Which lipids are hormones?", "Steroids", "Cholesterol and steroid hormones share rings."],
      ["Which fatty acids are essential?", "Omega-3 and omega-6", "The body cannot make them."],
      ["Which sugar is found in milk?", "Lactose", "Lactose is glucose + galactose."],
      ["What are waxes?", "Waterproof lipids", "Waxes coat leaves and insect bodies."],
      ["What is cholesterol's role?", "Membrane stability and hormones", "It strengthens membranes and feeds steroid synthesis."]
    ],
    "Nucleic Acids": [
      ["What is DNA's sugar?", "Deoxyribose", "DNA's sugar is deoxyribose."],
      ["What is RNA's sugar?", "Ribose", "RNA uses ribose."],
      ["Which bases pair in DNA?", "Adenine with thymine, guanine with cytosine", "A-T and G-C pair via hydrogen bonds."],
      ["Which base replaces thymine in RNA?", "Uracil", "RNA pairs adenine with uracil."],
      ["What is a gene?", "A DNA segment coding a protein", "Genes are the units of heredity."],
      ["What is transcription?", "DNA copied into mRNA", "Transcription makes RNA from a DNA template."],
      ["What is translation?", "mRNA read into protein", "Ribosomes translate codons into amino acids."],
      ["What is a codon?", "Three mRNA bases", "Each codon codes one amino acid."],
      ["Which enzyme builds DNA?", "DNA polymerase", "It adds nucleotides during replication."],
      ["What is a mutation?", "A change in DNA sequence", "Mutations drive variation and disease."],
      ["Where is DNA found in cells?", "The nucleus", "Mitochondria hold a small separate genome."],
      ["What is the double helix?", "DNA's twisted two-strand shape", "Watson and Crick described it in 1953."]
    ]
  }),

  /* ================= HISTOLOGY ================= */
  makeGen("histology", "Histology — Deeper Topics", {
    "Renal & Reproductive Histology": [
      ["What is the functional unit of the kidney?", "The nephron", "Each kidney has about a million nephrons."],
      ["Which structure filters blood?", "The glomerulus", "Glomerular filtration starts urine formation."],
      ["Where does most reabsorption occur?", "The proximal tubule", "It reabsorbs glucose, salt and water."],
      ["Which hormone regulates water reabsorption?", "ADH (vasopressin)", "ADH opens aquaporins in collecting ducts."],
      ["Which kidney region contains glomeruli?", "The cortex", "Glomeruli sit in the renal cortex."],
      ["What lines the bladder?", "Transitional epithelium", "It stretches as the bladder fills."],
      ["Which cells secrete testosterone?", "Leydig cells", "They sit between seminiferous tubules."],
      ["Where do sperm mature?", "The epididymis", "Sperm gain motility there."],
      ["Which structure carries eggs?", "The fallopian tube", "Fertilization occurs in the tube."],
      ["Which cells form the blood-testis barrier?", "Sertoli cells", "They protect developing sperm."],
      ["What does the juxtaglomerular apparatus do?", "Regulates blood pressure", "It releases renin."],
      ["Which uterine layer is shed in menstruation?", "The functional endometrium", "It sloughs when no pregnancy occurs."]
    ]
  }),

  /* ================= LOGICAL REASONING ================= */
  makeGen("logical-reasoning", "Logical Reasoning — Deeper Topics", {
    "Inferences": [
      ["All As are Bs. Some Bs are Cs. What follows?", "Some Cs may be As", "No definite relation between A and C follows."],
      ["If it rains, the ground is wet. The ground is wet. What follows?", "It may have rained", "Wet ground has other causes too."],
      ["All dogs bark. Rex is a dog. What follows?", "Rex barks", "Rex inherits the universal property."],
      ["No apples are oranges. Some fruits are apples. What follows?", "Some fruits are not oranges", "Apples are fruits but never oranges."],
      ["All students study. Ali is a student. What follows?", "Ali studies", "Ali satisfies the universal condition."],
      ["If Ali passes, he will celebrate. Ali did not pass. What follows?", "He may not celebrate", "Failure does not forbid celebration."],
      ["All birds have feathers. Penguins are birds. What follows?", "Penguins have feathers", "Feathers apply to all birds."],
      ["Some teachers are strict. All strict people are unpopular. What follows?", "Some teachers are unpopular", "Strict teachers fall in the unpopular set."],
      ["If X then Y. X happened. What follows?", "Y happens", "Modus ponens confirms Y."],
      ["All flowers need water. Roses need water. What follows?", "Roses may be flowers", "The premise does not force the conclusion."]
    ]
  }),

  /* ================= ANALYTICAL REASONING ================= */
  makeGen("analytical-reasoning", "Analytical Reasoning — Deeper Topics", {
    "Number Coding": [
      ["If CAT = 3 and RAT = 3, what is BIRD?", "4", "Codes count letters: CAT has 3 letters, BIRD has 4."],
      ["If A=1, B=2, C=3, what is SUM of 'BAD'?", "7", "B(2)+A(1)+D(4)=7."],
      ["If Z=1, Y=2, what is A?", "26", "The code reverses the alphabet."],
      ["If 1=A, 26=Z, what code is 20?", "T", "20 maps to T."],
      ["If TODAY is coded 20-15-4-1-25, how is 'GO' coded?", "7-15", "Each letter maps to its alphabet position."],
      ["If MORNING = 7 letters, what is EVENING?", "7", "Both words have seven letters."],
      ["If P=16, what is Q?", "17", "Letters advance by one in the alphabet."],
      ["If '1234' means 'ABCD', what does '2143' mean?", "BADC", "Digits map to positions in order."],
      ["If 5=Monday in a code, what is 1?", "Thursday", "The code counts backwards from Monday."],
      ["If 'run' is coded as 'svo', how is 'sun' coded?", "tvo", "Each letter shifts forward by one."]
    ]
  }),

  /* ================= VOCABULARY / SYNONYMS / ANTONYMS / COMPREHENSION ================= */
  makeGen("vocabulary", "Vocabulary — Deeper Topics", {
    "Contextual Usage": [
      ["Choose the best word: 'The meeting was ___ because everyone came prepared.'", "productive", "Productive means achieving useful results."],
      ["Choose the best word: 'Her ___ speech moved the audience.'", "inspiring", "Inspiring raises motivation and hope."],
      ["Choose the best word: 'The manager gave ___ instructions.'", "explicit", "Explicit means clearly stated."],
      ["Choose the best word: 'The evidence was ___ against him.'", "damning", "Damning evidence strongly condemns."],
      ["Choose the best word: 'He is ___ about his results.'", "confident", "Confident means sure of oneself."],
      ["Choose the best word: 'The project faced ___ delays.'", "repeated", "Repeated delays happened many times."],
      ["Choose the best word: 'She gave a ___ answer to the complex question.'", "thoughtful", "Thoughtful answers show careful consideration."],
      ["Choose the best word: 'The river's flow was ___ by the dam.'", "regulated", "Regulated means controlled systematically."],
      ["Choose the best word: 'His excuse sounded ___ .'", "plausible", "Plausible means believable at first glance."],
      ["Choose the best word: 'The team worked ___ to meet the deadline.'", "diligently", "Diligently means with careful effort."]
    ]
  }),
  makeGen("synonyms", "Synonyms — Deeper Topics", {
    "Intensifiers & Shades": [
      ["Which word is a stronger form of 'happy'?", "Elated", "Elated means extremely happy."],
      ["Which word is a stronger form of 'angry'?", "Furious", "Furious means extremely angry."],
      ["Which word is a stronger form of 'tired'?", "Exhausted", "Exhausted means completely drained."],
      ["Which word is a stronger form of 'big'?", "Colossal", "Colossal means enormous."],
      ["Which word is a stronger form of 'cold'?", "Freezing", "Freezing means extremely cold."],
      ["Which word is a weaker form of 'always'?", "Often", "Often is less frequent than always."],
      ["Which word is a stronger form of 'afraid'?", "Terrified", "Terrified means deeply afraid."],
      ["Which word is a stronger form of 'good'?", "Superb", "Superb means excellent quality."],
      ["Which word is a stronger form of 'hot'?", "Scalding", "Scalding means burning hot."],
      ["Which word is a stronger form of 'quiet'?", "Silent", "Silent means completely still of sound."]
    ]
  }),
  makeGen("antonyms", "Antonyms — Deeper Topics", {
    "Opposites in Sentences": [
      ["Opposite of 'expand'?", "Contract", "Expand and contract are opposites."],
      ["Opposite of 'transparent'?", "Opaque", "Opaque blocks light and meaning."],
      ["Opposite of 'ancient'?", "Modern", "Ancient and modern mark time extremes."],
      ["Opposite of 'abundant'?", "Scarce", "Scarce means insufficient."],
      ["Opposite of 'cautious'?", "Reckless", "Reckless ignores risk."],
      ["Opposite of 'permanent'?", "Temporary", "Temporary lasts a limited time."],
      ["Opposite of 'ascend'?", "Descend", "Ascend and descend are direction opposites."],
      ["Opposite of 'transparent' policy?", "Secretive", "Secretive hides information."],
      ["Opposite of 'optimistic'?", "Pessimistic", "Pessimistic expects the worst."],
      ["Opposite of 'expand' in text?", "Summarize", "Summarizing condenses material."]
    ]
  }),
  makeGen("comprehension", "Comprehension — Deeper Topics", {
    "Vocabulary in Context": [
      ["In 'the arid desert', what does 'arid' mean?", "Very dry", "Arid regions get little rain."],
      ["In 'a candid interview', 'candid' means?", "Frank and honest", "Candid answers avoid evasion."],
      ["In 'a lucrative job', 'lucrative' means?", "Highly profitable", "Lucrative work pays well."],
      ["In 'a feasible plan', 'feasible' means?", "Achievable", "Feasible plans can be done."],
      ["In 'an obsolete machine', 'obsolete' means?", "Out of date", "Obsolete tools are superseded."],
      ["In 'a meticulous worker', 'meticulous' means?", "Careful and precise", "Meticulous workers check details."],
      ["In 'an adverse effect', 'adverse' means?", "Harmful", "Adverse effects are negative."],
      ["In 'a coherent argument', 'coherent' means?", "Logically connected", "Coherent points flow clearly."],
      ["In 'a redundant statement', 'redundant' means?", "Unnecessary", "Redundant words repeat meaning."],
      ["In 'an imminent storm', 'imminent' means?", "About to happen", "Imminent events arrive soon."]
    ]
  }),

  /* ================= PAKISTAN HISTORY ================= */
  makeGen("pakistan-history", "Pakistan History — Deeper Topics", {
    "Politics & Governance": [
      ["When was the 1973 Constitution adopted?", "14 August 1973", "It was the first constitution passed by an elected assembly."],
      ["Who was the first PM under the 1973 Constitution?", "Zulfikar Ali Bhutto", "Bhutto took office in August 1973."],
      ["When was One Unit dissolved?", "1970", "Yahya Khan restored the provinces."],
      ["Which amendment made Pakistan an Islamic welfare state?", "The 1973 Constitution itself", "Its preamble binds the state to Islamic principles."],
      ["When did women first enter the National Assembly with reserved seats?", "2002", "Reserved seats for women began under Musharraf's era."],
      ["Which body interprets the constitution?", "The Supreme Court", "Judicial review guards constitutional bounds."],
      ["What is the National Command Authority?", "The nuclear command body", "It controls Pakistan's strategic weapons."],
      ["When was the 25th Amendment passed?", "2018", "It merged FATA into Khyber Pakhtunkhwa."],
      ["Which document outlines federal-provincial powers?", "The Constitution's legislative lists", "The 18th Amendment trimmed the federal list."],
      ["Who chairs the Council of Common Interests?", "The Prime Minister", "It coordinates federal-provincial affairs."],
      ["When were local government polls last held nationwide?", "2015 and 2021 in phases", "Local bodies run on provincial schedules."],
      ["Which office audits public accounts?", "The Auditor General of Pakistan", "The AG audits federal and provincial finances."]
    ]
  }),

  /* ================= IT TOPICS ================= */
  makeGen("ethical-hacking", "Ethical Hacking — Deeper Topics", {
    "Security Controls": [
      ["What is the principle of least privilege?", "Give users minimum access", "It limits blast radius of compromise."],
      ["What does MFA add beyond a password?", "A second factor", "MFA needs something you have or are."],
      ["What does a firewall filter?", "Network traffic", "Firewalls block unauthorized packets."],
      ["What is an IDS?", "Intrusion detection system", "IDS watches for suspicious activity."],
      ["What is encryption for?", "Confidentiality of data", "Encryption scrambles data without keys."],
      ["What is hashing used for?", "Integrity verification", "Hashes detect tampered data."],
      ["What is a honeypot?", "A decoy system", "Honeypots attract attackers for study."],
      ["What is DLP?", "Data loss prevention", "DLP stops sensitive data leaving systems."]
    ]
  }),
  makeGen("devops", "DevOps — Deeper Topics", {
    "Logging & Metrics": [
      ["What is structured logging?", "Logs in key-value format", "Structured logs are machine-parseable."],
      ["What is a metric?", "A numeric system measurement", "Metrics track latency, errors and load."],
      ["What is log aggregation?", "Collecting logs in one place", "Tools like Loki centralize logs."],
      ["What is an alert?", "A notification on a threshold", "Alerts fire when metrics breach limits."],
      ["What is observability?", "Understanding system state", "Logs, metrics and traces enable it."],
      ["What is a trace?", "A request's journey", "Traces span services for one request."],
      ["What is mean time to recovery?", "Time to restore service", "MTTR measures outage recovery speed."],
      ["What is the Four Golden Signals?", "Latency, traffic, errors, saturation", "They summarize service health."]
    ]
  }),
  makeGen("big-data", "Big Data — Deeper Topics", {
    "Batch Processing": [
      ["What is batch processing?", "Processing data in bulk jobs", "Batch jobs run on collected data at once."],
      ["Which tool is Hadoop's batch core?", "MapReduce", "MapReduce splits and merges large jobs."],
      ["What is Spark's batch abstraction?", "RDDs and DataFrames", "Spark optimizes in-memory batch work."],
      ["What is a data lake?", "Raw storage of any data", "Lakes hold structured and raw files."],
      ["What is a data warehouse?", "Query-optimized structured store", "Warehouses serve BI dashboards."],
      ["What is ETL?", "Extract, transform, load", "ETL moves data into stores."],
      ["What is partitioning in Spark?", "Splitting data into chunks", "Partitions enable parallel execution."],
      ["What is a job scheduler?", "Orchestrator of batch runs", "Schedulers like Airflow run pipelines."]
    ]
  }),
  makeGen("database", "Database — Deeper Topics", {
    "Backup & Recovery": [
      ["What is a full backup?", "A copy of all data", "Full backups restore quickly but cost space."],
      ["What is an incremental backup?", "Changes since last backup", "Incrementals save time and space."],
      ["What is a differential backup?", "Changes since last full backup", "Differentials sit between full and incremental."],
      ["What is RPO?", "Recovery point objective", "RPO sets acceptable data loss."],
      ["What is RTO?", "Recovery time objective", "RTO sets acceptable downtime."],
      ["What is point-in-time recovery?", "Restoring to a past moment", "Logs allow exact-time restores."],
      ["What is a WAL?", "Write-ahead log", "WAL journals changes before commit."],
      ["What is a restore test?", "Verifying backups work", "Untested backups often fail in crises."]
    ]
  }),
  makeGen("sql", "SQL — Deeper Topics", {
    "Indexes & Optimization": [
      ["What does an index speed up?", "Lookups and filters", "Indexes avoid full table scans."],
      ["What is a composite index?", "Index on multiple columns", "It serves multi-column queries."],
      ["What is the cost of an index?", "Slower writes and space", "Indexes trade write speed for read speed."],
      ["What is a covering index?", "Index containing all needed columns", "It avoids reading table rows."],
      ["What does EXPLAIN do?", "Shows query plan", "EXPLAIN reveals how SQL runs."],
      ["What is an index scan?", "Reading the index only", "Selective queries use index scans."],
      ["When are indexes ignored?", "When selectivity is low", "Low selectivity forces scans."],
      ["What is a primary key index?", "The table's identity index", "Primary keys are always indexed."]
    ],
    "Stored Procedures": [
      ["What is a stored procedure?", "SQL code saved on the server", "Procedures run repeatedly with parameters."],
      ["Which keyword creates a procedure in SQL Server?", "CREATE PROCEDURE", "Procedures are schema objects."],
      ["What is a procedure parameter?", "An input the procedure accepts", "Parameters make procedures reusable."],
      ["What is an output parameter?", "A result returned by a procedure", "Outputs pass values back to callers."],
      ["Why use procedures?", "Reuse and security", "Procedures encapsulate logic."],
      ["What is a transaction in a procedure?", "A unit of work", "Transactions commit or roll back atomically."],
      ["What is a function vs a procedure?", "Functions return values", "Functions are expressions; procedures run actions."],
      ["What is dynamic SQL?", "SQL built at runtime", "Dynamic SQL adds flexibility and risk."]
    ]
  }),
  makeGen("windows", "Windows — Deeper Topics", {
    "User Accounts": [
      ["What is an administrator account?", "An account with full control", "Admins install software and change settings."],
      ["What is a standard user?", "An account with limited rights", "Standard users cannot alter system files."],
      ["What is UAC?", "User Account Control", "UAC prompts before privileged actions."],
      ["What is a local account?", "An account on one machine", "Local accounts do not roam."],
      ["What is a Microsoft account?", "A cloud-linked sign-in", "It syncs settings across devices."],
      ["What is a guest account?", "A temporary limited account", "Guests cannot save system changes."],
      ["What is a password policy?", "Rules for passwords", "Policies enforce length and complexity."],
      ["What is account lockout?", "Temporary disable after failures", "Lockout blocks brute force."]
    ]
  }),
  makeGen("linux", "Linux — Deeper Topics", {
    "Automation": [
      ["What is a cron job?", "A scheduled task", "Cron runs commands at fixed times."],
      ["What is a shell script?", "A file of shell commands", "Scripts automate sequences of work."],
      ["What is an Ansible playbook?", "Declarative automation steps", "Playbooks configure systems idempotently."],
      ["What is systemd?", "The init and service manager", "systemd starts and supervises services."],
      ["What is a systemd timer?", "A scheduled unit", "Timers replace cron on modern systems."],
      ["What is a PID file?", "A file holding a process id", "Services check PIDs to manage processes."],
      ["What is idempotency?", "Repeated runs give same result", "Idempotent automation avoids drift."],
      ["What is a bash alias?", "A short command name", "Aliases shorten frequent commands."]
    ]
  }),
  makeGen("html", "HTML — Deeper Topics", {
    "Accessibility in HTML": [
      ["What is the alt attribute for?", "Image description", "Alt text helps screen readers."],
      ["What is ARIA?", "Accessibility Rich Internet Applications", "ARIA labels dynamic interfaces."],
      ["What is a landmark role?", "A named page region", "Roles like navigation aid orientation."],
      ["Which element marks main content?", "<main>", "Main holds the page's core content."],
      ["What is a label for?", "Connecting text to a field", "Labels make forms speakable."],
      ["What is keyboard focus?", "The active control", "Tab order must follow page order."],
      ["What is a skip link?", "A link to main content", "Skip links bypass repeated nav."],
      ["What is color contrast for?", "Readable text", "Low contrast hurts low-vision users."]
    ]
  }),
  makeGen("css", "CSS — Deeper Topics", {
    "Colors & Typography": [
      ["What is a hex color?", "A #RRGGBB code", "Hex colors encode red, green, blue."],
      ["What is HSL?", "Hue, saturation, lightness", "HSL describes colors perceptually."],
      ["What is a CSS variable for color?", "A custom property", "Variables centralize palette changes."],
      ["What is em relative to?", "The parent font size", "em scales with parent text."],
      ["What is rem relative to?", "The root font size", "rem scales from the html element."],
      ["What is font-weight?", "Text thickness", "Weights range from 100 to 900."],
      ["What is line-height?", "Vertical spacing of lines", "Line-height aids readability."],
      ["What is letter-spacing?", "Space between characters", "Tracking changes text density."]
    ],
    "Responsive Techniques": [
      ["What is a media query?", "Conditional CSS by viewport", "Media queries adapt layouts to screens."],
      ["What is a breakpoint?", "A width where layout changes", "Breakpoints reshape grids on devices."],
      ["What is a fluid grid?", "Columns sized in %", "Fluid grids scale with the viewport."],
      ["What is a responsive image?", "An image chosen by screen", "srcset serves the right resolution."],
      ["What does mobile-first mean?", "Designing for small screens first", "Mobile-first adds enhancements upward."],
      ["What is viewport meta?", "A tag controlling page width", "It maps layout to device width."],
      ["What is a container query?", "Styling by container size", "Container queries adapt embedded components."],
      ["What is max-width used for?", "Capping layout width", "Max-width keeps lines readable."]
    ]
  }),
  makeGen("javascript", "JavaScript — Deeper Topics", {
    "Events & Handlers": [
      ["What is an event listener?", "A function waiting for an event", "Listeners run code on clicks and keys."],
      ["What is event bubbling?", "Events rising to ancestors", "Bubbling lets parents catch child events."],
      ["What is event delegation?", "Handling events at a parent", "Delegation serves many children with one handler."],
      ["What is event.preventDefault()?", "Stopping default behavior", "It blocks navigation or form submit."],
      ["What is stopPropagation()?", "Halting event flow", "It stops bubbling to ancestors."],
      ["What is the event object?", "Data about the event", "It carries target, key and coordinates."],
      ["What is addEventListener()?", "The modern binding API", "It allows multiple handlers."],
      ["What is a click event?", "A press on an element", "Clicks trigger interactive actions."]
    ]
  }),
  makeGen("typescript", "TypeScript — Deeper Topics", {
    "TypeScript with React": [
      ["What is a typed React prop?", "A prop with a defined type", "Types catch prop errors at compile time."],
      ["What is React.FC?", "A typed function component", "FC provides children typing."],
      ["What is useState with types?", "Typed state hook", "Generics infer state types."],
      ["What is an interface for props?", "A props shape definition", "Interfaces document component contracts."],
      ["What is a union type?", "One of several types", "Unions allow flexible values."],
      ["What is a type guard?", "Code narrowing a type", "Guards refine unions at runtime."],
      ["What is a generic component?", "A component typed per use", "Generics reuse logic safely."],
      ["What is a ref type?", "The typed useRef element", "Refs point at DOM or values."]
    ]
  }),
  makeGen("bootstrap", "Bootstrap — Deeper Topics", {
    "Customization": [
      ["How do you override Bootstrap?", "Custom CSS after it", "Later rules win by order."],
      ["What is Bootstrap theming?", "Rebuilding with variables", "Sass variables change the look."],
      ["What are utility classes?", "Single-purpose helpers", "Utilities like .mt-3 adjust spacing."],
      ["What is a Bootstrap variable?", "A Sass token", "Variables drive colors and sizes."],
      ["What is the grid system?", "12-column responsive layout", "Columns reflow by breakpoint."],
      ["What is a custom component class?", "A user-defined styling hook", "Custom classes extend components."],
      ["What is minified CSS?", "Compressed stylesheet", "Minification shrinks load size."],
      ["What is an icon library?", "Reusable glyph fonts", "Icons like Bootstrap Icons add symbols."]
    ]
  }),
  makeGen("tailwind-css", "Tailwind CSS — Deeper Topics", {
    "Theming": [
      ["What is a Tailwind theme?", "Design tokens in config", "Theme defines colors and spacing."],
      ["What is a configuration file?", "tailwind.config.js", "It customizes the framework."],
      ["What is dark mode in Tailwind?", "Class-based variant", "Dark: utilities switch themes."],
      ["What is an arbitrary value?", "A one-off utility value", "Arbitrary values like w-[120px] add flexibility."],
      ["What is @apply?", "Reusing utility styles in CSS", "@apply composes utilities."],
      ["What is a custom color?", "A configured palette entry", "Custom colors extend brand styles."],
      ["What is a variant?", "A conditional utility", "Variants like hover: modify states."],
      ["What is JIT mode?", "Just-in-time compilation", "JIT builds only used classes."]
    ]
  }),
  makeGen("react", "React — Deeper Topics", {
    "Events & Forms": [
      ["How are events attached in React?", "With onClick props", "React events wrap native ones."],
      ["What is a controlled input?", "A field driven by state", "Controlled inputs sync value and state."],
      ["What is an uncontrolled input?", "A field with DOM state", "Refs read their values."],
      ["What is form validation?", "Checking input values", "Validation blocks bad submissions."],
      ["What is onSubmit?", "The form submit handler", "It runs on submit presses."],
      ["What is state lifting?", "Sharing state upward", "Parents hold shared form data."],
      ["What is onChange?", "The value change handler", "It fires on each input change."],
      ["What is a submit button?", "The form trigger", "Buttons with type submit fire onSubmit."]
    ]
  }),
  makeGen("next-js", "Next.js — Deeper Topics", {
    "Data Fetching": [
      ["What is server-side rendering?", "HTML built on the server", "SSR sends ready HTML."],
      ["What is getServerSideProps?", "A per-request data function", "It runs on each request."],
      ["What is static generation?", "HTML built at build time", "SSG serves prebuilt pages."],
      ["What is ISR?", "Incremental static regeneration", "ISR refreshes pages on a schedule."],
      ["What is client-side fetching?", "Data loaded in the browser", "SWR and fetch do client fetching."],
      ["What is an API route?", "A backend endpoint in Next", "Pages/api functions serve JSON."],
      ["What is a server component?", "A component rendered on the server", "They fetch data directly."],
      ["What is caching in Next?", "Storing fetched data", "Caching speeds repeat reads."]
    ]
  }),
  makeGen("vue-js", "Vue.js — Deeper Topics", {
    "Vue Router": [
      ["What is a route?", "A path-to-component mapping", "Routes define navigable views."],
      ["What is a router-view?", "The outlet for routes", "It renders the matched component."],
      ["What is a route link?", "A navigation anchor", "router-link avoids full reloads."],
      ["What is a dynamic route?", "A path with parameters", "Paths like /user/:id pass params."],
      ["What is lazy loading routes?", "Importing views on demand", "Code splitting trims the bundle."],
      ["What is a navigation guard?", "Route-level checks", "Guards protect pages."],
      ["What is the history mode?", "Clean URL routing", "History mode removes hash URLs."],
      ["What is a nested route?", "A route inside a route", "Nesting models parent-child views."]
    ]
  }),
  makeGen("angular", "Angular — Deeper Topics", {
    "Services": [
      ["What is an Angular service?", "A singleton logic class", "Services share data and logic."],
      ["What is dependency injection?", "Providing dependencies automatically", "DI constructs services for components."],
      ["What is @Injectable()?", "The service decorator", "It marks a class for injection."],
      ["What is a provider?", "The service registration", "Providers tell Angular how to create services."],
      ["What is HttpClient?", "Angular's HTTP client", "It handles API requests."],
      ["What is a RxJS Observable?", "An async data stream", "Observables drive Angular services."],
      ["What is a subject?", "A multicasting stream", "Subjects broadcast to many subscribers."],
      ["What is tree shaking?", "Removing unused code", "DI-friendly code shakes cleanly."]
    ]
  }),
  makeGen("express-js", "Express.js — Deeper Topics", {
    "Templates": [
      ["What is a template engine?", "HTML with embedded logic", "Engines like EJS render views."],
      ["What is EJS?", "Embedded JavaScript templates", "EJS mixes JS into HTML."],
      ["What is a view?", "A rendered page", "Views combine templates and data."],
      ["What is res.render()?", "Rendering a view", "It sends compiled HTML."],
      ["What is a layout?", "A shared page shell", "Layouts wrap common headers and footers."],
      ["What is a partial?", "A reusable template fragment", "Partials like headers include everywhere."],
      ["What is template data?", "Values passed to a view", "Data fills placeholders at render."],
      ["What is view engine config?", "The engine declaration", "app.set('view engine', 'ejs') enables EJS."]
    ]
  }),
  makeGen("php", "PHP — Deeper Topics", {
    "Database Access": [
      ["What is PDO?", "PHP Data Objects", "PDO abstracts database access."],
      ["What is a prepared statement?", "A precompiled query", "Prepared statements stop SQL injection."],
      ["What is mysqli?", "MySQL improved extension", "mysqli handles MySQL natively."],
      ["What is a parameter placeholder?", "A ? in a query", "Values bind safely at execution."],
      ["What is fetch_assoc()?", "Returning a row as array", "It reads one result row."],
      ["What is a transaction?", "A set of database operations", "Transactions commit or roll back."],
      ["What is PDO::beginTransaction?", "Starting a transaction", "It groups operations atomically."],
      ["What is a connection DSN?", "The database address string", "DSNs include host and name."]
    ]
  }),
  makeGen("laravel", "Laravel — Deeper Topics", {
    "Blade Templates": [
      ["What is Blade?", "Laravel's template engine", "Blade compiles to plain PHP."],
      ["What is a Blade directive?", "An @ command", "Directives like @if control logic."],
      ["What is @extends?", "Inheriting a layout", "Child views fill layout sections."],
      ["What is a section?", "A named template region", "Sections yield into layouts."],
      ["What is a component in Blade?", "A reusable view unit", "Components encapsulate UI."],
      ["What is {{ }}?", "Escaped output", "It prints values safely."],
      ["What is @foreach?", "Looping over data", "It iterates arrays in views."],
      ["What is a Blade partial?", "An included sub-view", "@include embeds partials."]
    ]
  }),
  makeGen("python", "Python — Deeper Topics", {
    "Popular Libraries": [
      ["What is NumPy?", "Numerical computing arrays", "NumPy powers array math."],
      ["What is pandas?", "Data tables and analysis", "DataFrames structure datasets."],
      ["What is Matplotlib?", "Plotting and charts", "It produces publication graphs."],
      ["What is requests?", "HTTP client library", "Requests fetch web APIs."],
      ["What is Flask?", "A lightweight web framework", "Flask builds small APIs."],
      ["What is Django?", "A full-stack framework", "Django includes ORM and admin."],
      ["What is BeautifulSoup?", "HTML parsing", "It scrapes web content."],
      ["What is Scikit-learn?", "Machine learning toolkit", "It offers classifiers and regressors."]
    ]
  }),
  makeGen("flask", "Flask — Deeper Topics", {
    "Forms & Validation": [
      ["What is a Flask form library?", "WTForms", "WTForms renders and validates forms."],
      ["What is form validation?", "Checking submitted values", "Validation rejects bad input."],
      ["What is a required field?", "A mandatory input", "Empty required fields fail validation."],
      ["What is CSRF protection?", "Cross-site request defense", "Tokens block forged submissions."],
      ["What is a form secret key?", "A signing key", "It secures sessions and tokens."],
      ["What is validate_on_submit()?", "Checking method and data", "It runs all field validators."],
      ["What is an error message?", "A validation notice", "Messages show what failed."],
      ["What is a file upload field?", "An input for files", "Uploads validate type and size."]
    ]
  }),
  makeGen("java", "Java — Deeper Topics", {
    "Multithreading": [
      ["What is a thread?", "A lightweight process unit", "Threads run code concurrently."],
      ["What is the Thread class?", "Java's thread abstraction", "Extend or run it to start threads."],
      ["What is a Runnable?", "A task interface", "Runnable avoids class extension."],
      ["What is a synchronized block?", "A mutual exclusion zone", "It prevents race conditions."],
      ["What is a deadlock?", "Threads waiting on each other", "Deadlocks freeze programs."],
      ["What is a race condition?", "Uncontrolled shared access", "Races cause unpredictable results."],
      ["What is a thread pool?", "Reusable worker threads", "Pools manage concurrency efficiently."],
      ["What is volatile?", "A visibility guarantee", "Volatile reads see latest writes."]
    ]
  }),
  makeGen("csharp", "C# — Deeper Topics", {
    "OOP in C#": [
      ["What is a class?", "A blueprint for objects", "Classes bundle data and methods."],
      ["What is inheritance?", "Deriving from a base class", "Derived classes reuse base members."],
      ["What is an interface?", "A contract of members", "Classes implement interfaces."],
      ["What is encapsulation?", "Hiding internal state", "Private fields with public accessors."],
      ["What is polymorphism?", "Many forms of a method", "Virtual methods override behavior."],
      ["What is a property?", "A typed accessor pair", "Properties wrap fields."],
      ["What is an abstract class?", "A partial template class", "Abstracts define shape, force behavior."],
      ["What is a constructor?", "An object initializer", "Constructors set starting state."]
    ]
  }),
  makeGen("dotnet", ".NET — Deeper Topics", {
    "ASP.NET Core": [
      ["What is ASP.NET Core?", "A cross-platform web framework", "It builds APIs and web apps."],
      ["What is middleware?", "Request pipeline components", "Middleware chains handle requests."],
      ["What is dependency injection?", "Built-in service provisioning", "DI supplies services to classes."],
      ["What is a controller?", "An API endpoint class", "Controllers map routes to actions."],
      ["What is minimal API?", "Tiny endpoint definitions", "app.MapGet() style routing."],
      ["What is Kestrel?", "The default web server", "Kestrel runs ASP.NET Core apps."],
      ["What is Entity Framework Core?", "The ORM", "EF Core maps C# to databases."],
      ["What is a startup class?", "The app configuration", "It wires services and middleware."]
    ]
  }),
  makeGen("rust", "Rust — Deeper Topics", {
    "Syntax & Types": [
      ["What is a variable in Rust?", "An immutable binding", "Rust defaults variables to immutable."],
      ["What is mut?", "Mutable binding marker", "mut allows value changes."],
      ["What is an integer type?", "i32, u64 etc.", "Rust names signed and unsigned ints."],
      ["What is a tuple?", "A fixed-size mixed group", "Tuples hold heterogeneous values."],
      ["What is a struct?", "A named data record", "Structs group related fields."],
      ["What is an enum?", "A tagged union type", "Enums model alternatives."],
      ["What is a match?", "Pattern-based branching", "Match handles all enum cases."],
      ["What is ownership?", "Rust's memory rule", "Each value has one owner."]
    ]
  }),
  makeGen("git-github", "Git & GitHub — Deeper Topics", {
    "Collaboration": [
      ["What is a pull request?", "A proposed merge", "PRs review code before merging."],
      ["What is a fork?", "A personal project copy", "Forks enable outside contributions."],
      ["What is a merge conflict?", "Contradictory changes", "Conflicts need manual resolution."],
      ["What is a code review?", "Peer code inspection", "Reviews catch issues early."],
      ["What is a branch?", "A divergent line of work", "Branches isolate features."],
      ["What is rebasing?", "Replaying commits", "Rebase cleans history."],
      ["What is a tag?", "A named release point", "Tags mark versions."],
      ["What is a contributor?", "A project collaborator", "Contributors open PRs."]
    ]
  }),
  makeGen("kubernetes", "Kubernetes — Deeper Topics", {
    "Scaling": [
      ["What is horizontal scaling?", "Adding more pods", "HPA adds replicas on load."],
      ["What is a replica set?", "A pod-count controller", "ReplicaSets keep desired pods."],
      ["What is an HPA?", "Horizontal Pod Autoscaler", "HPA adjusts replicas by metrics."],
      ["What is a node?", "A worker machine", "Nodes run container workloads."],
      ["What is a cluster?", "A group of nodes", "The control plane manages them."],
      ["What is vertical scaling?", "Resizing pod resources", "VPA adjusts CPU and memory."],
      ["What is a deployment?", "A declarative workload", "Deployments roll updates safely."],
      ["What is pod eviction?", "Removing an unhealthy pod", "Eviction frees node resources."]
    ]
  }),
  makeGen("graphql", "GraphQL — Deeper Topics", {
    "Subscriptions": [
      ["What is a GraphQL subscription?", "A live data stream", "Subscriptions push real-time updates."],
      ["What is a resolver?", "A data-fetching function", "Resolvers answer queries."],
      ["What is a schema?", "The API contract", "Schemas define types and fields."],
      ["What is a subscription event?", "A published change", "Events trigger client updates."],
      ["What is a pub/sub system?", "An event broker", "It routes published events."],
      ["What is a WebSocket?", "A live connection", "Subscriptions ride WebSockets."],
      ["What is a mutation?", "A write operation", "Mutations change data."],
      ["What is a subscription channel?", "A named event topic", "Channels filter updates."]
    ]
  }),
  makeGen("toefl", "TOEFL — Deeper Topics", {
    "Speaking Tasks": [
      ["What is the Independent Speaking task?", "A personal opinion answer", "It asks for views on familiar topics."],
      ["What is the Integrated Speaking task?", "Speaking from a passage", "It combines reading and listening."],
      ["How long is each speaking response?", "About 45-60 seconds", "Timed responses need concise answers."],
      ["What is delivery in scoring?", "Clarity and pace", "Clear speech boosts the score."],
      ["What is a topic sentence?", "The answer's main point", "It frames the response."],
      ["What is a transition?", "A linking phrase", "Transitions like 'firstly' organize ideas."],
      ["What is note-taking for?", "Capturing key details", "Notes feed accurate answers."],
      ["What is fluency?", "Smooth continuous speech", "Fluency avoids long pauses."]
    ]
  })
];
