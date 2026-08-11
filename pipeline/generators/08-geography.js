/* ============================================================
   Generator file 08 — Geography, History, Social Sciences
   Parametric country-capital generator + fact pools.
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

/* country → capital, currency, language (authored standard facts) */
const COUNTRIES = [
  ["Afghanistan", "Kabul", "Afghani", "Pashto and Dari"],
  ["Argentina", "Buenos Aires", "Peso", "Spanish"],
  ["Australia", "Canberra", "Australian Dollar", "English"],
  ["Austria", "Vienna", "Euro", "German"],
  ["Bangladesh", "Dhaka", "Taka", "Bengali"],
  ["Belgium", "Brussels", "Euro", "Dutch, French, German"],
  ["Brazil", "Brasilia", "Real", "Portuguese"],
  ["Canada", "Ottawa", "Canadian Dollar", "English and French"],
  ["Chile", "Santiago", "Peso", "Spanish"],
  ["China", "Beijing", "Yuan (Renminbi)", "Mandarin"],
  ["Cuba", "Havana", "Peso", "Spanish"],
  ["Denmark", "Copenhagen", "Krone", "Danish"],
  ["Egypt", "Cairo", "Egyptian Pound", "Arabic"],
  ["Ethiopia", "Addis Ababa", "Birr", "Amharic"],
  ["Finland", "Helsinki", "Euro", "Finnish"],
  ["France", "Paris", "Euro", "French"],
  ["Germany", "Berlin", "Euro", "German"],
  ["Greece", "Athens", "Euro", "Greek"],
  ["Iceland", "Reykjavik", "Krona", "Icelandic"],
  ["India", "New Delhi", "Rupee", "Hindi and English"],
  ["Indonesia", "Jakarta", "Rupiah", "Indonesian"],
  ["Iran", "Tehran", "Rial", "Persian (Farsi)"],
  ["Iraq", "Baghdad", "Dinar", "Arabic"],
  ["Ireland", "Dublin", "Euro", "English and Irish"],
  ["Israel", "Jerusalem", "Shekel", "Hebrew"],
  ["Italy", "Rome", "Euro", "Italian"],
  ["Japan", "Tokyo", "Yen", "Japanese"],
  ["Jordan", "Amman", "Dinar", "Arabic"],
  ["Kazakhstan", "Astana", "Tenge", "Kazakh"],
  ["Kenya", "Nairobi", "Shilling", "Swahili and English"],
  ["Kuwait", "Kuwait City", "Dinar", "Arabic"],
  ["Malaysia", "Kuala Lumpur", "Ringgit", "Malay"],
  ["Mexico", "Mexico City", "Peso", "Spanish"],
  ["Morocco", "Rabat", "Dirham", "Arabic and Berber"],
  ["Myanmar", "Naypyidaw", "Kyat", "Burmese"],
  ["Nepal", "Kathmandu", "Rupee", "Nepali"],
  ["Netherlands", "Amsterdam", "Euro", "Dutch"],
  ["New Zealand", "Wellington", "Dollar", "English and Maori"],
  ["Nigeria", "Abuja", "Naira", "English"],
  ["North Korea", "Pyongyang", "Won", "Korean"],
  ["Norway", "Oslo", "Krone", "Norwegian"],
  ["Oman", "Muscat", "Rial", "Arabic"],
  ["Philippines", "Manila", "Peso", "Filipino"],
  ["Poland", "Warsaw", "Zloty", "Polish"],
  ["Portugal", "Lisbon", "Euro", "Portuguese"],
  ["Qatar", "Doha", "Riyal", "Arabic"],
  ["Russia", "Moscow", "Ruble", "Russian"],
  ["Saudi Arabia", "Riyadh", "Riyal", "Arabic"],
  ["Singapore", "Singapore", "Dollar", "English, Malay, Mandarin, Tamil"],
  ["South Africa", "Pretoria", "Rand", "Eleven official languages"],
  ["South Korea", "Seoul", "Won", "Korean"],
  ["Spain", "Madrid", "Euro", "Spanish"],
  ["Sri Lanka", "Colombo", "Rupee", "Sinhala and Tamil"],
  ["Sudan", "Khartoum", "Pound", "Arabic"],
  ["Sweden", "Stockholm", "Krona", "Swedish"],
  ["Switzerland", "Bern", "Swiss Franc", "German, French, Italian"],
  ["Syria", "Damascus", "Pound", "Arabic"],
  ["Thailand", "Bangkok", "Baht", "Thai"],
  ["Turkey", "Ankara", "Lira", "Turkish"],
  ["Ukraine", "Kyiv", "Hryvnia", "Ukrainian"],
  ["United Arab Emirates", "Abu Dhabi", "Dirham", "Arabic"],
  ["United Kingdom", "London", "Pound Sterling", "English"],
  ["United States", "Washington, D.C.", "US Dollar", "English"],
  ["Uzbekistan", "Tashkent", "Som", "Uzbek"],
  ["Vietnam", "Hanoi", "Dong", "Vietnamese"],
  ["Yemen", "Sana'a", "Rial", "Arabic"],
  ["Zimbabwe", "Harare", "Zimbabwean Dollar", "English, Shona, Ndebele"]
];

function countryGen(subjectId, chapterName, topic, template) {
  return {
    subjects: [subjectId],
    name: chapterName,
    topics: [topic],
    tags: [subjectId, "countries"],
    generate(rng) {
      const out = [];
      const pool = COUNTRIES.slice();
      for (const [country, capital, currency, lang] of pool) {
        const allCaps = pool.map((c) => c[1]);
        const allCur = pool.map((c) => c[2]);
        const allLang = pool.map((c) => c[3]);
        let m = null;
        if (template === "capital") {
          m = L.buildMcq(rng, { q: `What is the capital of ${country}?`, a: capital, e: `${capital} is the capital city of ${country}.` }, allCaps, { difficulty: "easy", tags: ["capitals"] });
        } else if (template === "currency") {
          m = L.buildMcq(rng, { q: `What is the currency of ${country}?`, a: currency, e: `${country} uses the ${currency} as its official currency.` }, allCur, { difficulty: "medium", tags: ["currencies"] });
        } else if (template === "language") {
          m = L.buildMcq(rng, { q: `Which language is official in ${country}?`, a: lang, e: `${lang} is an official language of ${country}.` }, allLang, { difficulty: "medium", tags: ["languages"] });
        }
        if (m) out.push(m);
      }
      return out;
    }
  };
}

module.exports = [
  countryGen("geography", "Geography — Countries of the World", "Capitals of the World", "capital"),
  countryGen("geography", "Geography — Countries of the World", "Currencies of the World", "currency"),
  countryGen("geography", "Geography — Countries of the World", "Languages of the World", "language"),
  makeGen("geography", "Geography — Physical Geography", {
    "Landforms": [
      ["What is a plateau?", "a flat elevated land area", "Plateaus rise sharply above surrounding land."],
      ["What is a peninsula?", "land surrounded by water on three sides", "Peninsulas extend into water bodies."],
      ["What is an archipelago?", "a chain of islands", "Archipelagos like Indonesia comprise many islands."],
      ["What is a delta?", "sediment land at a river mouth", "Deltas form where rivers meet the sea."],
      ["What is a glacier?", "a slow-moving mass of ice", "Glaciers sculpt valleys as they advance."],
      ["What is an oasis?", "a water source in a desert", "Oases support life in arid regions."],
      ["What is a strait?", "a narrow water passage", "Straits connect larger water bodies."],
      ["What is a canyon?", "a deep river valley", "Canyons are carved by river erosion."],
      ["What is the Equator?", "the line at 0° latitude", "The Equator divides the Earth into hemispheres."],
      ["What is the Tropic of Cancer?", "the 23.5°N latitude line", "It marks the Sun's northernmost overhead point."],
      ["What is a continent?", "a large landmass", "Earth has seven continents."],
      ["What is an island?", "land surrounded by water", "Islands range from small rocks to Greenland."]
    ],
    "Climate and Oceans": [
      ["Which ocean is the deepest?", "Pacific", "The Pacific contains the Mariana Trench."],
      ["What is a monsoon?", "a seasonal wind reversing direction", "Monsoons drive South Asia's wet and dry seasons."],
      ["What is humidity?", "moisture in the air", "Humidity measures water vapour content."],
      ["What is a desert climate?", "very dry conditions", "Deserts receive under 250 mm of rain yearly."],
      ["What is the greenhouse effect?", "heat trapped by atmospheric gases", "Greenhouse gases warm the planet naturally and via emissions."],
      ["What is a tornado?", "a violently rotating air column", "Tornadoes form in severe thunderstorms."],
      ["What is a tsunami?", "a giant ocean wave from displacement", "Earthquakes and slides can trigger tsunamis."],
      ["What is precipitation?", "water falling from clouds", "Rain, snow and hail are precipitation."],
      ["What is evaporation?", "liquid turning to vapour", "Evaporation drives the water cycle."],
      ["Which current warms northwest Europe?", "North Atlantic Drift (Gulf Stream)", "The warm current moderates European winters."]
    ]
  }),
  makeGen("world-history", "World History — Civilisations", {
    "Ancient World": [
      ["Which civilisation built the pyramids?", "Ancient Egypt", "The pyramids were built along the Nile."],
      ["Which river valley hosted ancient Mesopotamia?", "Tigris-Euphrates", "Mesopotamia means 'between the rivers'."],
      ["Who was Alexander the Great?", "a Macedonian conqueror", "He built an empire from Greece to India."],
      ["Which empire built the Colosseum?", "Roman Empire", "Rome's Colosseum hosted gladiator games."],
      ["Who was Julius Caesar?", "a Roman general and dictator", "Caesar's rise ended the Roman Republic."],
      ["Which civilisation used cuneiform?", "Sumerians", "Cuneiform is among the earliest writing systems."],
      ["Which wall was built in ancient China?", "The Great Wall", "The Great Wall defended China's northern border."],
      ["Who was Confucius?", "a Chinese philosopher", "Confucianism shaped Chinese ethics and society."],
      ["Which empire was ruled by Ashoka?", "Maurya Empire", "Ashoka spread Buddhism across his realm."],
      ["Which civilisation built Machu Picchu?", "Inca", "The Inca empire ruled the Andes."],
      ["Which civilisation built Chichen Itza?", "Maya", "The Maya flourished in Mesoamerica."],
      ["When did the Roman Empire fall in the west?", "476 CE", "Rome's western empire ended in 476 CE."]
    ],
    "Modern History": [
      ["When did World War I begin?", "1914", "WWI began in July 1914 after the Sarajevo assassination."],
      ["When did World War II end?", "1945", "WWII ended with the surrender of Japan in August 1945."],
      ["When was the United Nations founded?", "1945", "The UN charter took effect on 24 October 1945."],
      ["Who was Napoleon Bonaparte?", "a French emperor", "Napoleon dominated Europe in the early 1800s."],
      ["When did the French Revolution begin?", "1789", "The revolution began with the storming of the Bastille."],
      ["What was the Cold War?", "tension between the US and USSR", "The Cold War ran from 1947 to 1991."],
      ["When did the Berlin Wall fall?", "1989", "The wall's fall marked the end of the Cold War era."],
      ["Who was Mahatma Gandhi?", "leader of India's independence movement", "Gandhi used non-violent resistance."],
      ["When did India gain independence?", "15 August 1947", "India and Pakistan became independent in 1947."],
      ["Who was Nelson Mandela?", "anti-apartheid leader of South Africa", "Mandela became South Africa's first black president."],
      ["When did the American Revolution end?", "1783", "The Treaty of Paris ended the war in 1783."],
      ["What was the Industrial Revolution?", "the shift to machine production", "It began in Britain in the late 1700s."]
    ]
  }),
  makeGen("history", "History — General", {
    "Key Events and Figures": [
      ["Which explorer reached the Americas in 1492?", "Christopher Columbus", "Columbus's voyage opened transatlantic contact."],
      ["Who was the first President of the United States?", "George Washington", "Washington served 1789-1797."],
      ["Which treaty ended World War I?", "Treaty of Versailles", "Versailles (1919) imposed terms on Germany."],
      ["What was the Renaissance?", "a revival of art and learning", "The Renaissance began in 14th-century Italy."],
      ["Who painted the Mona Lisa?", "Leonardo da Vinci", "Da Vinci painted it around 1503."],
      ["Who discovered penicillin?", "Alexander Fleming", "Fleming discovered penicillin in 1928."],
      ["Who developed the theory of relativity?", "Albert Einstein", "Einstein published it in 1905 and 1915."],
      ["Which ship sank in 1912?", "RMS Titanic", "The Titanic struck an iceberg on its maiden voyage."],
      ["What was the Silk Road?", "a network of trade routes", "The Silk Road linked China with the Mediterranean."],
      ["Who was Genghis Khan?", "founder of the Mongol Empire", "He united the Mongols in the 13th century."],
      ["When was the first moon landing?", "1969", "Apollo 11 landed on 20 July 1969."],
      ["Who first walked on the Moon?", "Neil Armstrong", "Armstrong's step followed the Apollo 11 landing."]
    ]
  }),
  makeGen("sociology", "Sociology — Foundations", {
    "Concepts": [
      ["What is sociology?", "the scientific study of society", "Sociology examines social behaviour and structures."],
      ["What is culture?", "shared beliefs, values and practices", "Culture shapes how groups live and think."],
      ["What is socialisation?", "learning society's norms", "Socialisation occurs through family, school and media."],
      ["What is a norm?", "a rule of expected behaviour", "Norms guide everyday conduct in groups."],
      ["What is a value?", "a shared belief about what is good", "Values underpin norms and institutions."],
      ["What is a social institution?", "an organised pattern of social life", "Family, education and religion are institutions."],
      ["What is a role?", "expected behaviour for a status", "Roles attach to positions like teacher or parent."],
      ["What is a status?", "a position in society", "Statuses may be ascribed or achieved."],
      ["What is social stratification?", "layered inequality in society", "Stratification ranks groups by wealth, power and prestige."],
      ["What is social mobility?", "movement between social layers", "Mobility can be upward, downward or horizontal."],
      ["What is a group?", "people sharing interaction and identity", "Groups range from families to nations."],
      ["What is deviance?", "behaviour violating norms", "Deviance is defined relative to social norms."]
    ]
  }),
  makeGen("political-science", "Political Science — Government", {
    "Systems and Concepts": [
      ["What is a democracy?", "rule by the people", "Democracy vests power in citizens through elections."],
      ["What is a monarchy?", "rule by a monarch", "Monarchies may be constitutional or absolute."],
      ["What is a republic?", "a state without a hereditary monarch", "Republics choose leaders through elections."],
      ["What is a dictatorship?", "rule by one person without limits", "Dictatorships suppress opposition and free press."],
      ["What is a constitution?", "the supreme law of a state", "Constitutions define government and rights."],
      ["What is the separation of powers?", "dividing government into branches", "Executive, legislature and judiciary check each other."],
      ["What is a parliament?", "the legislative assembly", "Parliaments make laws and oversee government."],
      ["What is federalism?", "power divided between levels", "Federal systems share power between central and regional governments."],
      ["What is a political party?", "an organised group seeking power", "Parties contest elections and shape policy."],
      ["What is an election?", "a vote to choose representatives", "Elections are the core of democracy."],
      ["What is a bill?", "a proposed law", "Bills become laws after legislative approval."],
      ["What is a referendum?", "a direct public vote on an issue", "Referendums decide specific policy questions."]
    ]
  }),
  makeGen("international-relations", "International Relations — World Order", {
    "Diplomacy and Bodies": [
      ["What is diplomacy?", "managing relations between states", "Diplomacy pursues national interests through negotiation."],
      ["What is a treaty?", "a formal agreement between states", "Treaties bind signatories under international law."],
      ["What is an ambassador?", "a state's senior diplomatic envoy", "Ambassadors represent their country abroad."],
      ["What is sovereignty?", "a state's supreme authority over itself", "Sovereignty is the basis of the international system."],
      ["What is an alliance?", "a formal partnership of states", "Alliances like NATO coordinate defence."],
      ["What is a ceasefire?", "a halt to fighting", "Ceasefires pause conflict for negotiations."],
      ["What is the UN Security Council's role?", "maintaining international peace", "The Council can impose sanctions and authorise force."],
      ["How many permanent members does the UN Security Council have?", "5", "China, France, Russia, UK and USA hold vetoes."],
      ["What is globalisation?", "growing worldwide interconnection", "Trade, technology and migration deepen global ties."],
      ["What is foreign aid?", "assistance between countries", "Aid supports development, health and emergencies."]
    ]
  }),
  makeGen("anthropology", "Anthropology — Human Study", {
    "Anthropology Concepts": [
      ["What is anthropology?", "the study of humans and cultures", "Anthropology spans biology, society and language."],
      ["What is culture in anthropology?", "learned shared behaviour", "Culture is transmitted across generations."],
      ["What is ethnography?", "field study of a culture", "Ethnography uses observation and interviews."],
      ["What is an ethnocentrism?", "judging others by one's own culture", "Ethnocentrism measures other cultures against one's own."],
      ["What is cultural relativism?", "understanding cultures on their own terms", "Relativism avoids judging by external standards."],
      ["What is kinship?", "social relations by descent and marriage", "Kinship organises families and inheritance."],
      ["What is a ritual?", "a patterned symbolic act", "Rituals mark life events and beliefs."],
      ["What is a myth?", "a traditional explanatory story", "Myths encode a society's worldview."],
      ["What is archaeology?", "studying past societies through remains", "Archaeology excavates artefacts and sites."],
      ["What is a tribe?", "a kin-based social unit", "Tribes share territory, language and identity."]
    ]
  })
];
