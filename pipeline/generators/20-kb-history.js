/* ============================================================
   Deep Knowledge KB — History
   World and general history events + numeric year problems.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["history"],
  chapter: "History — Deep Knowledge Bank",
  tags: ["history", "deep-kb", "world-history", "events", "eras"],
  topics: {

    "World History Events": [
      {
        kind: "fact", name: "world history facts",
        note: "Key world historical events and their dates.",
        facts: [
          ["In which year did World War I begin?", "1914", "World War I began in 1914 with the assassination of Archduke Franz Ferdinand."],
          ["In which year did World War II begin?", "1939", "World War II began in 1939 when Germany invaded Poland, drawing in the major powers."],
          ["In which year did World War II end?", "1945", "The war ended in 1945 with the surrender of Germany and Japan."],
          ["In which year did the French Revolution begin?", "1789", "The French Revolution began in 1789 with the storming of the Bastille."],
          ["Who led the Russian Revolution of 1917?", "Vladimir Lenin", "Lenin and the Bolsheviks seized power in the October Revolution of 1917."],
          ["In which year did the American Revolution end?", "1783", "The Treaty of Paris in 1783 ended the American Revolutionary War."],
          ["Who was the first President of the United States?", "George Washington", "Washington served as the first US President from 1789 to 1797."],
          ["What was the Cold War?", "Tension between the USA and USSR after 1945", "The Cold War was ideological rivalry between the capitalist West and communist bloc."],
          ["In which year did the Berlin Wall fall?", "1989", "The fall of the Berlin Wall in 1989 symbolised the end of the Cold War."],
          ["What was the Industrial Revolution?", "The shift to machine manufacturing from the 1760s", "Machines replaced hand tools, transforming economies and societies."]
        ],
        trick: "WWI 1914, WWII 1939-45, French Revolution 1789, Berlin Wall 1989.",
        tip: "War dates are the highest-yield history facts."
      },
      {
        kind: "tf", name: "world history statements",
        note: "True/false stems on world history.",
        statements: [
          ["World War I began in 1914.", "World War I began in 1918."],
          ["The French Revolution began in 1789.", "The French Revolution began in 1689."],
          ["Lenin led the Russian Revolution.", "Napoleon led the Russian Revolution."],
          ["The Berlin Wall fell in 1989.", "The Berlin Wall fell in 1945."],
          ["Washington was the first US President.", "Lincoln was the first US President."]
        ],
        trick: "1914, 1789, Lenin, 1989, Washington — the anchors.",
        tip: "Date swaps and leader swaps are the standard traps."
      }
    ],

    "Eras and Civilisations": [
      {
        kind: "fact", name: "civilisation facts",
        note: "Ancient civilisations and their achievements.",
        facts: [
          ["Which river valley hosted the Indus Valley Civilisation?", "The Indus River", "The Indus Valley Civilisation flourished around the Indus River from about 2500 BCE."],
          ["Which were the two major cities of the Indus Valley Civilisation?", "Mohenjo-daro and Harappa", "Mohenjo-daro and Harappa were the two greatest planned cities of the civilisation."],
          ["What is the Pyramids of Giza associated with?", "Ancient Egypt", "The pyramids were royal tombs built by ancient Egyptian pharaohs."],
          ["Which empire built the Colosseum?", "The Roman Empire", "The Colosseum in Rome was completed in 80 CE under the Roman Empire."],
          ["Who was Alexander the Great?", "A Macedonian conqueror of the 4th century BCE", "Alexander conquered the Persian Empire and reached the Indus before dying in 323 BCE."],
          ["Which civilisation invented cuneiform writing?", "Sumerian civilisation", "Sumerians developed cuneiform in Mesopotamia around 3200 BCE."],
          ["What was the Renaissance?", "The revival of art and learning in Europe", "The Renaissance, from the 14th century, revived classical learning and art."],
          ["Which city was the centre of the Renaissance?", "Florence", "Florence led the Renaissance with artists like Leonardo and Michelangelo."],
          ["What was the Ottoman Empire?", "A Turkish empire lasting over 600 years", "The Ottomans ruled from 1299 to 1922, controlling the eastern Mediterranean."],
          ["What is the Golden Age of Islam associated with?", "Scholarship and science from the 8th century", "The Islamic Golden Age produced algebra, optics and medical advances."]
        ],
        trick: "Indus=Mohenjo-daro+Harappa, Rome=Colosseum, Renaissance=Florence, Ottoman 1299-1922.",
        tip: "Civilisation-city pairs are classic history items."
      },
      {
        kind: "numeric", name: "years between events", difficulty: "medium",
        note: "Year gaps between historical events test date arithmetic.",
        q: (v) => `How many years passed between ${v.e1} in ${v.y1} and ${v.e2} in ${v.y2}?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `${v.e2} (${v.y2}) minus ${v.e1} (${v.y1}) = ${v.y2 - v.y1} years, because the gap between two dated events is simply the difference of their years.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 10} years`, `${v.y2 - v.y1 + 100} years`, `${v.y2 - v.y1 - 10} years`],
        vals: (rng) => {
          const E = [
            ["the start of World War I", 1914], ["the fall of the Berlin Wall", 1989], ["the French Revolution", 1789],
            ["the end of World War II", 1945], ["the American Revolution", 1776], ["the Russian Revolution", 1917],
            ["the start of the Industrial Revolution", 1760], ["the start of World War II", 1939], ["the Renaissance's height", 1500],
            ["the end of the Cold War", 1991], ["the discovery of America", 1492], ["the Great Depression", 1929]
          ];
          const i = Math.floor(rng() * E.length);
          const j = (i + 1 + Math.floor(rng() * (E.length - 1))) % E.length;
          let [e1, y1] = E[i], [e2, y2] = E[j];
          if (y1 > y2) { [e1, y1] = E[j]; [e2, y2] = E[i]; }
          return { e1, y1, e2, y2 };
        },
        whyWrong: (v) => [`Subtract the earlier year from the later one; off-by-one answers (±1) are the classic traps in date arithmetic.`],
        trick: "Gap = later year − earlier year.",
        tip: "Date questions rarely include the year of the event — know the anchors."
      },
      {
        kind: "numeric", name: "century conversions", difficulty: "easy",
        note: "Year 1701-1800 falls in the 18th century; century = ceil(year ÷ 100).",
        q: (v) => `The year ${v.y} falls in which century?`,
        a: (v) => `${Math.ceil(v.y / 100)}th century`,
        e: (v) => `Century = ceil(year ÷ 100) = ceil(${v.y} ÷ 100) = ${Math.ceil(v.y / 100)}, because century numbers are the rounded-up hundreds of the year.`,
        distract: (v) => [`${Math.ceil(v.y / 100) + 1}th century`, `${Math.ceil(v.y / 100) - 1}th century`, `${Math.floor(v.y / 100)}th century`, `${Math.ceil(v.y / 100) + 2}th century`, `${Math.floor(v.y / 100) + 1}th century`],
        vals: (rng) => {
          const c = 4 + Math.floor(rng() * 19);
          const y = c * 100 - 99 + Math.floor(rng() * 99);
          return { y };
        },
        whyWrong: (v) => [`Years 1-100 are the 1st century, so the century is the year's hundreds rounded UP; floor gives the wrong century.`],
        trick: "1801-1900 = 19th century — round up the hundreds.",
        tip: "The year 2000 belongs to the 20th century, not the 21st."
      },
      {
        kind: "numeric", name: "duration of reigns", difficulty: "medium",
        note: "Reign length = end year − start year for a ruler or era.",
        q: (v) => `The ${v.name} ruled from ${v.y1} to ${v.y2}. How long was the ${v.name}'s reign?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `Reign = end − start = ${v.y2} − ${v.y1} = ${v.y2 - v.y1} years, because the reign length is the difference between the two regnal years.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 10} years`, `${v.y2 - v.y1 + 5} years`, `${v.y2 - v.y1 - 5} years`],
        vals: (rng) => {
          const N = ["Ottoman Empire", "British Empire", "Roman Empire", "Mughal Empire", "Byzantine Empire", "Qing Dynasty", "Ming Dynasty", "Abbasid Caliphate"];
          const name = N[Math.floor(rng() * N.length)];
          const y1 = 1200 + Math.floor(rng() * 20) * 25;
          const y2 = y1 + 50 + Math.floor(rng() * 200);
          return { name, y1, y2 };
        },
        whyWrong: (v) => [`Subtract the start from the end year; off-by-one and decade-off answers are the classic errors.`],
        trick: "Reign = end year − start year.",
        tip: "Check whether the question counts inclusive years — the +1 is the trap."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
