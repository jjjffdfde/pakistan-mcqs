/* ============================================================
   Deep Knowledge KB — World History
   Eras, wars, revolutions + numeric date arithmetic.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["world-history"],
  chapter: "World History — Deep Knowledge Bank",
  tags: ["world-history", "deep-kb", "wars", "revolutions", "eras"],
  topics: {

    "Modern World History": [
      {
        kind: "fact", name: "modern history facts",
        note: "Key events of the modern era.",
        facts: [
          ["In which years did World War I take place?", "1914-1918", "World War I ran from 1914 to 1918 after the assassination of Archduke Franz Ferdinand."],
          ["In which years did World War II take place?", "1939-1945", "World War II ran from 1939 to 1945 across Europe, Asia and the Pacific."],
          ["Which event began the Great Depression?", "The 1929 Wall Street crash", "The October 1929 stock market crash triggered the worldwide depression."],
          ["In which year did the Russian Revolution begin?", "1917", "The Bolshevik Revolution overthrew the Tsar in 1917, ending three centuries of Romanov rule."],
          ["Which wall fell in 1989?", "The Berlin Wall", "The Berlin Wall fell in November 1989, leading to German reunification."],
          ["When did the Cold War end?", "1991", "The Cold War ended with the Soviet Union's dissolution in December 1991."],
          ["Which empire collapsed after World War I?", "The Ottoman Empire", "The Ottoman Empire was dissolved after its defeat in World War I."],
          ["Who led the Cuban Revolution?", "Fidel Castro", "Castro's revolution took power in Cuba in 1959, ending the Batista regime."],
          ["Which treaty ended World War I?", "The Treaty of Versailles", "Versailles (1919) imposed reparations and new borders on Germany."],
          ["Which country dropped the first atomic bombs?", "The United States", "The US bombed Hiroshima and Nagasaki in August 1945, ending World War II."],
          ["What was the League of Nations?", "The failed predecessor of the UN", "The League (1920-1946) failed to prevent World War II and was replaced by the UN."],
          ["Which organisation was founded at Bretton Woods?", "The World Bank and IMF", "The 1944 Bretton Woods conference created the World Bank and IMF."]
        ],
        trick: "WWI=1914-18, WWII=1939-45, Depression=1929, Wall=1989, USSR end=1991.",
        tip: "Event-year pairs are the most asked modern history items."
      },
      {
        kind: "tf", name: "modern history statements",
        note: "True/false stems on modern history.",
        statements: [
          ["World War I ended in 1918.", "World War I ended in 1945."],
          ["The Berlin Wall fell in 1989.", "The Berlin Wall fell in 1905."],
          ["The Soviet Union dissolved in 1991.", "The Soviet Union dissolved in 1815."],
          ["The Great Depression began with the 1929 crash.", "The Great Depression began with the 1870 boom."],
          ["Versailles was signed in 1919.", "Versailles was signed in 1492."],
          ["The US bombed Hiroshima in 1945.", "The US bombed Hiroshima in 1865."]
        ],
        trick: "1918=WWI end, 1945=WWII end, 1989=wall, 1991=USSR.",
        tip: "Year swaps are the classic traps."
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
          const y1 = 900 + Math.floor(rng() * 40) * 25;
          const y2 = y1 + 30 + Math.floor(rng() * 270);
          return { name, y1, y2 };
        },
        whyWrong: (v) => [`Subtract the start from the end year; off-by-one and decade-off answers are the classic errors.`],
        trick: "Reign = end year − start year.",
        tip: "Check whether the question counts inclusive years — the +1 is the trap."
      },
      {
        kind: "numeric", name: "era intervals", difficulty: "easy",
        note: "Length of eras between two years.",
        q: (v) => `Historians date the start of an era to ${v.y1} and its close to ${v.y2}. How many years did the era span?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `Span = ${v.y2} − ${v.y1} = ${v.y2 - v.y1} years, because the era's length is the difference between its closing and opening years.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 20} years`, `${v.y2 - v.y1 - 20} years`, `${v.y2 - v.y1 + 5} years`],
        vals: (rng) => {
          const y1 = 500 + Math.floor(rng() * 120) * 10;
          const y2 = y1 + 40 + Math.floor(rng() * 400);
          return { y1, y2 };
        },
        whyWrong: (v) => [`Subtract the opening year from the closing year; off-by-one and decade-off answers are the classic errors.`],
        trick: "span = end − start years.",
        tip: "Read carefully whether the era is inclusive of its end year."
      }
    ],

    "Ancient and Medieval": [
      {
        kind: "fact", name: "ancient facts",
        note: "Foundations of civilisation.",
        facts: [
          ["Which empire built the pyramids?", "Ancient Egypt", "Egypt's Old Kingdom built the great pyramids at Giza around 2560 BC."],
          ["Which empire built the Great Wall?", "China", "Chinese dynasties built and extended the Great Wall over centuries."],
          ["Who was the first Roman emperor?", "Augustus", "Augustus (27 BC) founded the Roman Empire after the republic's civil wars."],
          ["Which empire fell in 476 AD?", "The Western Roman Empire", "The last western emperor was deposed in 476 AD, ending the western empire."],
          ["Which religion began with the Prophet Muhammad (PBUH)?", "Islam", "Islam began in 7th-century Arabia with the revelation to the Prophet Muhammad (PBUH)."],
          ["Who conquered Persia's Achaemenid Empire?", "Alexander the Great", "Alexander defeated Darius III and ended the Achaemenid Empire in 330 BC."],
          ["What was the Silk Road?", "Ancient trade routes linking East and West", "The Silk Road carried silk, spices and ideas between China and the Mediterranean."],
          ["Which civilisation built Machu Picchu?", "The Inca", "The Inca Empire built Machu Picchu in the Andes around the 15th century."],
          ["Which civilisation used cuneiform writing?", "The Sumerians", "Sumerian cuneiform, around 3200 BC, is among the earliest writing systems."],
          ["Which document limited royal power in 1215?", "The Magna Carta", "Magna Carta (1215) limited the English king's powers and influenced law."],
          ["Who was Genghis Khan?", "The founder of the Mongol Empire", "Genghis Khan united the Mongols and built the largest contiguous empire."],
          ["Which empire ruled India under the Mughals?", "The Mughal Empire", "The Mughals ruled much of India from the 16th century until 1857."]
        ],
        trick: "Pyramids=Egypt, Wall=China, 476=Roman fall, 1215=Magna Carta, Silk Road=East-West trade.",
        tip: "Empire-monument pairs are the most asked ancient items."
      },
      {
        kind: "tf", name: "ancient statements",
        note: "True/false stems on ancient history.",
        statements: [
          ["Augustus was the first Roman emperor.", "Augustus was the last Egyptian pharaoh."],
          ["Magna Carta was signed in 1215.", "Magna Carta was signed in 2215."],
          ["The Western Roman Empire fell in 476 AD.", "The Western Roman Empire fell in 76 BC."],
          ["Genghis Khan founded the Mongol Empire.", "Genghis Khan founded the Inca Empire."],
          ["The Mughals ruled much of India.", "The Mughals ruled medieval Norway."],
          ["Cuneiform was Sumerian writing.", "Cuneiform was Aztec painting."]
        ],
        trick: "Augustus=first emperor, 476=fall, 1215=Magna Carta, Mughals=India.",
        tip: "Person-empire swaps are the traps."
      },
      {
        kind: "numeric", name: "century conversions BC", difficulty: "hard",
        note: "BC centuries count backwards with the same rounding rule.",
        q: (v) => `An artefact is dated to ${v.y} BC. Which century BC does it belong to?`,
        a: (v) => `${Math.ceil(v.y / 100)}th century BC`,
        e: (v) => `BC centuries use the same rule as AD: century = ceil(year ÷ 100) = ceil(${v.y} ÷ 100) = ${Math.ceil(v.y / 100)}, so ${v.y} BC is the ${Math.ceil(v.y / 100)}th century BC.`,
        distract: (v) => [`${Math.ceil(v.y / 100) + 1}th century BC`, `${Math.ceil(v.y / 100) - 1}th century BC`, `${Math.floor(v.y / 100)}th century BC`, `${Math.ceil(v.y / 100) + 2}th century BC`, `${Math.floor(v.y / 100) + 1}th century BC`],
        vals: (rng) => {
          const c = 2 + Math.floor(rng() * 30);
          const y = c * 100 - 99 + Math.floor(rng() * 99);
          return { y };
        },
        whyWrong: (v) => [`BC centuries use the same rounding-up rule as AD; flooring or dropping the BC label are the classic errors.`],
        trick: "BC century = hundreds rounded up, labelled BC.",
        tip: "323 BC = 4th century BC."
      },
      {
        kind: "numeric", name: "dynasty span calculations", difficulty: "medium",
        note: "Length of a dynasty from start to end.",
        q: (v) => `The ${v.name} lasted from ${v.y1} to ${v.y2}. How many years did the ${v.name} last?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `Span = ${v.y2} − ${v.y1} = ${v.y2 - v.y1} years, subtracting the founding year from the final year of the ${v.name}.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 20} years`, `${v.y2 - v.y1 - 20} years`, `${v.y2 - v.y1 + 10} years`],
        vals: (rng) => {
          const N = ["Mughal Empire", "Ottoman Empire", "Roman Republic", "Byzantine Empire", "Tang Dynasty", "Kushan Empire", "Sasanian Empire", "Gupta Empire"];
          const name = N[Math.floor(rng() * N.length)];
          const y1 = 300 + Math.floor(rng() * 40) * 25;
          const y2 = y1 + 60 + Math.floor(rng() * 320);
          return { name, y1, y2 };
        },
        whyWrong: (v) => [`Subtract the founding year; off-by-one and decade-off answers are the classic traps.`],
        trick: "span = end year − start year.",
        tip: "Dynasty spans are differences of regnal years."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
