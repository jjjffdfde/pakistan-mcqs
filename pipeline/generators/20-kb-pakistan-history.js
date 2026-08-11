/* ============================================================
   Deep Knowledge KB — Pakistan History
   Movements, constitutions, rulers + numeric date arithmetic.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["pakistan-history"],
  chapter: "Pakistan History — Deep Knowledge Bank",
  tags: ["pakistan-history", "deep-kb", "movements", "constitutions", "rulers"],
  topics: {

    "Freedom Movement": [
      {
        kind: "fact", name: "freedom movement facts",
        note: "Events leading to independence.",
        facts: [
          ["Who founded the All-India Muslim League?", "Leaders at the 1906 Dacca session", "The Muslim League was founded in Dacca in December 1906 by Muslim leaders."],
          ["When was the Muslim League founded?", "1906", "The All-India Muslim League was founded at Dacca in 1906 to protect Muslim interests."],
          ["Who proposed the Two-Nation Theory?", "Sir Syed Ahmad Khan and later Allama Iqbal", "The Two-Nation Theory argued Muslims were a separate nation, refined by Iqbal and Jinnah."],
          ["Who presented the Lahore Resolution of 1940?", "A.K. Fazlul Haq", "Fazlul Haq moved the Lahore Resolution at the 1940 session of the League."],
          ["When was the Lahore Resolution passed?", "1940", "The Muslim League passed the Lahore Resolution in March 1940."],
          ["What is 14 August 1947 in Pakistan's history?", "Independence Day", "Pakistan came into being on 14 August 1947, ending British rule."],
          ["Who was the first Governor-General of Pakistan?", "Quaid-e-Azam Muhammad Ali Jinnah", "Jinnah took office as Governor-General at independence in 1947."],
          ["Who was the first Prime Minister of Pakistan?", "Liaquat Ali Khan", "Liaquat Ali Khan served as the first Prime Minister from 1947 to 1951."],
          ["What was the Objective Resolution?", "The 1949 principles for the constitution", "The 1949 Objective Resolution set the Islamic and democratic foundations of the constitution."],
          ["When was the Objectives Resolution passed?", "1949", "The Constituent Assembly passed the Objectives Resolution in March 1949."],
          ["Which act ended British rule in India?", "The Indian Independence Act 1947", "The 1947 Act partitioned British India into Pakistan and India."],
          ["Who was called the Frontier Gandhi?", "Khan Abdul Ghaffar Khan", "Ghaffar Khan led non-violent Pashtun politics, earning the title Frontier Gandhi."]
        ],
        trick: "League=1906, Resolution=1940, Objective=1949, Independence=1947, Jinnah=first GG.",
        tip: "Movement-date pairs are the most asked freedom movement items."
      },
      {
        kind: "tf", name: "freedom movement statements",
        note: "True/false stems on the movement.",
        statements: [
          ["The Muslim League was founded in 1906.", "The Muslim League was founded in 1960."],
          ["The Lahore Resolution was passed in 1940.", "The Lahore Resolution was passed in 1940 BC."],
          ["Jinnah was the first Governor-General.", "Jinnah was the first President of India."],
          ["Liaquat Ali Khan was the first Prime Minister.", "Liaquat Ali Khan was the last Mughal emperor."],
          ["The Objectives Resolution came in 1949.", "The Objectives Resolution came in 1749."],
          ["The Indian Independence Act was passed in 1947.", "The Indian Independence Act was passed in 1847."]
        ],
        trick: "1906=League, 1940=Resolution, 1949=Objectives, 1947=Independence.",
        tip: "Year swaps are the classic traps."
      },
      {
        kind: "numeric", name: "independence year arithmetic", difficulty: "easy",
        note: "Years since independence milestones.",
        q: (v) => `Pakistan was created in 1947. How many years after its creation was ${v.y}?`,
        a: (v) => `${v.y - 1947}`,
        e: (v) => `${v.y} − 1947 = ${v.y - 1947} years, counting the full years since independence in August 1947.`,
        distract: (v) => [`${v.y - 1948}`, `${v.y - 1946}`, `${v.y - 1937}`, `${v.y - 1957}`, `${v.y - 1947 + 10}`],
        vals: (rng) => ({ y: 1950 + Math.floor(rng() * 151) }),
        whyWrong: (v) => [`Subtract 1947 from the later year; off-by-one answers and wrong reference years are the traps.`],
        trick: "years = later year − 1947.",
        tip: "Independence: 14 August 1947."
      },
      {
        kind: "numeric", name: "movement event gaps", difficulty: "medium",
        note: "Year gaps between movement milestones.",
        q: (v) => `How many years passed between ${v.e1} (${v.y1}) and ${v.e2} (${v.y2})?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `${v.e2} (${v.y2}) minus ${v.e1} (${v.y1}) = ${v.y2 - v.y1} years, because the gap between two dated events is the difference of their years.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 10} years`, `${v.y2 - v.y1 + 5} years`, `${v.y2 - v.y1 - 5} years`],
        vals: (rng) => {
          const E = [
            ["the founding of the Muslim League", 1906], ["the Lucknow Pact", 1916], ["the Khilafat Movement", 1919],
            ["the Lahore Resolution", 1940], ["the Cripps Mission", 1942], ["the Objectives Resolution", 1949],
            ["independence", 1947], ["the first constitution", 1956], ["the 1973 Constitution", 1973],
            ["the 18th Amendment", 2010]
          ];
          const i = Math.floor(rng() * E.length);
          const j = (i + 1 + Math.floor(rng() * (E.length - 1))) % E.length;
          let [e1, y1] = E[i], [e2, y2] = E[j];
          if (y1 > y2) { [e1, y1] = E[j]; [e2, y2] = E[i]; }
          return { e1, y1, e2, y2 };
        },
        whyWrong: (v) => [`Subtract the earlier year from the later one; off-by-one answers (±1) are the classic traps.`],
        trick: "gap = later year − earlier year.",
        tip: "Know the anchors: 1906, 1940, 1947, 1949, 1956, 1973."
      },
      {
        kind: "numeric", name: "constitutional intervals", difficulty: "medium",
        note: "Years between constitutions and milestones.",
        q: (v) => `The first constitution was adopted in 1956 and the ${v.name} in ${v.y}. How many years apart are they?`,
        a: (v) => `${v.y - 1956}`,
        e: (v) => `Gap = ${v.y} − 1956 = ${v.y - 1956} years, counting from the 1956 constitution to the ${v.name} in ${v.y}.`,
        distract: (v) => [`${v.y - 1957}`, `${v.y - 1955}`, `${v.y - 1946}`, `${v.y - 1966}`, `${v.y - 1956 + 10}`],
        vals: (rng) => {
          const M = [
            ["1962 Constitution", 1962], ["1973 Constitution", 1973], ["Simla Agreement", 1972],
            ["separation of East Pakistan", 1971], ["first nuclear test", 1998], ["18th Amendment", 2010]
          ];
          const [name, y] = M[Math.floor(rng() * M.length)];
          return { name, y };
        },
        whyWrong: (v) => [`Subtract 1956 from the later milestone year; off-by-one answers are the classic traps.`],
        trick: "gap = later − 1956 years.",
        tip: "Constitutions: 1956, 1962, 1973."
      },
      {
        kind: "numeric", name: "constitution ages", difficulty: "easy",
        note: "Age of the 1973 constitution.",
        q: (v) => `The 1973 Constitution took effect on 14 August 1973. How old was it in ${v.y}?`,
        a: (v) => `${v.y - 1973}`,
        e: (v) => `Age = ${v.y} − 1973 = ${v.y - 1973} years, counting from the constitution's promulgation in 1973.`,
        distract: (v) => [`${v.y - 1974}`, `${v.y - 1972}`, `${v.y - 1963}`, `${v.y - 1983}`, `${v.y - 1973 + 5}`],
        vals: (rng) => ({ y: 1980 + Math.floor(rng() * 121) }),
        whyWrong: (v) => [`Subtract the promulgation year 1973; off-by-one answers are the classic traps.`],
        trick: "age = later year − 1973.",
        tip: "The 1973 constitution remains in force today."
      }
    ],

    "Rulers and Political History": [
      {
        kind: "fact", name: "rulers facts",
        note: "Pakistan's leaders and regimes.",
        facts: [
          ["Who was Pakistan's first President?", "Iskander Mirza", "Iskander Mirza became President in 1956 when the republic was proclaimed."],
          ["Who imposed the first martial law in Pakistan?", "Ayub Khan", "General Ayub Khan imposed martial law in October 1958, ending parliamentary rule."],
          ["Who ruled during the 1965 war?", "Ayub Khan", "Ayub Khan was President during the September 1965 war with India."],
          ["Who signed the Tashkent Declaration?", "Ayub Khan and Lal Bahadur Shastri", "The 1966 Tashkent Declaration ended the 1965 war between Pakistan and India."],
          ["Who was president during the 1971 crisis?", "General Yahya Khan", "Yahya Khan was Chief Martial Law Administrator when East Pakistan separated."],
          ["Who negotiated the Simla Agreement?", "Zulfikar Ali Bhutto", "Bhutto and Indira Gandhi signed the Simla Agreement in 1972."],
          ["When was East Pakistan separated?", "1971", "East Pakistan became Bangladesh in December 1971 after the civil war."],
          ["Who led Pakistan's nuclear programme?", "Zulfikar Ali Bhutto with Dr A.Q. Khan", "Bhutto initiated the programme in 1972, and A.Q. Khan directed the enrichment work."],
          ["Who was the first woman Prime Minister of Pakistan?", "Benazir Bhutto", "Benazir Bhutto became Prime Minister in 1988, the first woman in a Muslim-majority state."],
          ["Who was president from 2001 to 2008?", "Pervez Musharraf", "General Musharraf took power in 1999 and served as President from 2001."],
          ["Who was the founder of the MQM?", "Altaf Hussain", "Altaf Hussain founded the MQM in Karachi in 1984 as a Mohajir party."],
          ["Which amendment devolved power to provinces?", "The 18th Amendment", "The 18th Amendment (2010) abolished the concurrent list and increased provincial autonomy."]
        ],
        trick: "Mirza=first president, Ayub=1958 martial law, Yahya=1971, Benazir=first woman PM, 18th=2010.",
        tip: "Ruler-event pairs are the most asked items."
      },
      {
        kind: "tf", name: "rulers statements",
        note: "True/false stems on rulers.",
        statements: [
          ["Ayub Khan imposed martial law in 1958.", "Ayub Khan imposed martial law in 1958 BC."],
          ["Benazir Bhutto was the first woman PM.", "Benazir Bhutto was the first Mughal empress."],
          ["East Pakistan separated in 1971.", "East Pakistan separated in 1971 BC."],
          ["The Simla Agreement was signed in 1972.", "The Simla Agreement was signed in 1772."],
          ["The 18th Amendment came in 2010.", "The 18th Amendment came in 1910."],
          ["Yahya Khan led Pakistan during 1971.", "Yahya Khan led Pakistan during 1947."]
        ],
        trick: "1958=martial law, 1971=separation, 1972=Simla, 2010=18th.",
        tip: "Year swaps are the traps."
      },
      {
        kind: "numeric", name: "prime minister tenure calculations", difficulty: "medium",
        note: "Tenure lengths of prime ministers.",
        q: (v) => `A prime minister served from ${v.y1} to ${v.y2}. How many years did the tenure last?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `Tenure = ${v.y2} − ${v.y1} = ${v.y2 - v.y1} years, subtracting the appointment year from the end year.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 5} years`, `${v.y2 - v.y1 - 5} years`, `${v.y2 - v.y1 + 10} years`],
        vals: (rng) => {
          const y1 = 1940 + Math.floor(rng() * 81);
          const y2 = y1 + 1 + Math.floor(rng() * 11);
          return { y1, y2 };
        },
        whyWrong: (v) => [`Subtract the appointment year; off-by-one answers are the classic traps in tenure arithmetic.`],
        trick: "tenure = end year − start year.",
        tip: "Tenure lengths rarely exceed a few years in Pakistan."
      },
      {
        kind: "numeric", name: "martial law durations", difficulty: "easy",
        note: "Durations of martial law periods.",
        q: (v) => `Martial law was imposed in ${v.y1} and lifted in ${v.y2}. Approximately how many years did it last?`,
        a: (v) => `${v.y2 - v.y1} years`,
        e: (v) => `Duration ≈ ${v.y2} − ${v.y1} = ${v.y2 - v.y1} years, counting from the takeover to the end of martial law.`,
        distract: (v) => [`${v.y2 - v.y1 + 1} years`, `${v.y2 - v.y1 - 1} years`, `${v.y2 - v.y1 + 3} years`, `${v.y2 - v.y1 - 3} years`, `${v.y2 - v.y1 + 5} years`],
        vals: (rng) => {
          const y1 = 1950 + Math.floor(rng() * 81);
          const y2 = y1 + 2 + Math.floor(rng() * 9);
          return { y1, y2 };
        },
        whyWrong: (v) => [`Subtract the imposition year; off-by-one answers are the classic traps.`],
        trick: "duration = end year − start year.",
        tip: "First martial law ran 1958-1962."
      },
      {
        kind: "numeric", name: "election cycle arithmetic", difficulty: "medium",
        note: "Elections are held about every five years.",
        q: (v) => `National elections were held in ${v.y}. If elections normally follow a five-year cycle, in which year were the previous elections held?`,
        a: (v) => `${v.y - 5}`,
        e: (v) => `Previous election = ${v.y} − 5 = ${v.y - 5}, because the standard electoral cycle between polls is five years.`,
        distract: (v) => [`${v.y - 4}`, `${v.y - 6}`, `${v.y - 10}`, `${v.y - 5 + 1}`, `${v.y - 5 - 1}`],
        vals: (rng) => ({ y: 1962 + Math.floor(rng() * 60) * 1 }),
        whyWrong: (v) => [`The cycle is five years; four-year and six-year gaps are the classic distractors.`],
        trick: "previous = current − 5.",
        tip: "General elections are due every five years."
      },
      {
        kind: "numeric", name: "leader age calculations", difficulty: "easy",
        note: "A leader's age from birth and reference years.",
        q: (v) => `A national leader was born in ${v.y1}. How old was the leader in ${v.y2}?`,
        a: (v) => `${v.y2 - v.y1}`,
        e: (v) => `Age = ${v.y2} − ${v.y1} = ${v.y2 - v.y1} years, subtracting the birth year from the reference year.`,
        distract: (v) => [`${v.y2 - v.y1 + 1}`, `${v.y2 - v.y1 - 1}`, `${v.y2 - v.y1 + 10}`, `${v.y2 - v.y1 - 10}`, `${v.y2 - v.y1 + 5}`],
        vals: (rng) => {
          const y1 = 1900 + Math.floor(rng() * 61);
          const y2 = 1965 + Math.floor(rng() * 66);
          return { y1, y2 };
        },
        whyWrong: (v) => [`Subtract the birth year from the reference year; off-by-one answers are the classic traps.`],
        trick: "age = reference year − birth year.",
        tip: "Check whether the question counts the birthday year inclusively."
      },
      {
        kind: "numeric", name: "anniversary calculations", difficulty: "medium",
        note: "Anniversary years from 1947 independence.",
        q: (v) => `Pakistan celebrated the ${v.n}th anniversary of independence (1947) in which year?`,
        a: (v) => `${1947 + v.n}`,
        e: (v) => `Anniversary year = 1947 + ${v.n} = ${1947 + v.n}, adding the anniversary number to the independence year.`,
        distract: (v) => [`${1947 + v.n - 1}`, `${1947 + v.n + 1}`, `${1947 + v.n - 10}`, `${1947 + v.n + 10}`, `${1947 + v.n - 5}`],
        vals: (rng) => ({ n: 15 + Math.floor(rng() * 111) }),
        whyWrong: (v) => [`Add the anniversary number to 1947; off-by-one answers are the classic traps.`],
        trick: "anniversary = 1947 + n.",
        tip: "The 75th anniversary fell in 2022."
      },
      {
        kind: "numeric", name: "amendment year arithmetic", difficulty: "easy",
        note: "Years between constitutional events.",
        q: (v) => `The first amendment was passed in 1974. How many years before the ${v.name} in ${v.y} was it passed?`,
        a: (v) => `${v.y - 1974}`,
        e: (v) => `Gap = ${v.y} − 1974 = ${v.y - 1974} years, counting from the first amendment's passage to the ${v.name}.`,
        distract: (v) => [`${v.y - 1975}`, `${v.y - 1973}`, `${v.y - 1964}`, `${v.y - 1984}`, `${v.y - 1974 + 10}`],
        vals: (rng) => {
          const M = [
            ["second martial law", 1977], ["restoration of democracy", 1985], ["eighth amendment", 1985],
            ["ninth amendment attempt", 1985], ["thirteenth amendment", 1997], ["18th Amendment", 2010]
          ];
          const [name, y] = M[Math.floor(rng() * M.length)];
          return { name, y };
        },
        whyWrong: (v) => [`Subtract 1974 from the later milestone year; off-by-one answers are the classic traps.`],
        trick: "gap = later − 1974 years.",
        tip: "The 18th Amendment passed in April 2010."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
