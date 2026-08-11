/* ============================================================
   Deep Knowledge KB — Current Affairs
   Institutions, events, geography + numeric time/statistics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["current-affairs"],
  chapter: "Current Affairs — Deep Knowledge Bank",
  tags: ["current-affairs", "deep-kb", "pakistan", "world", "numbers"],
  topics: {

    "Pakistan Current Affairs": [
      {
        kind: "fact", name: "pakistan current facts",
        note: "Key Pakistan facts and institutions.",
        facts: [
          ["Which city is Pakistan's capital?", "Islamabad", "Islamabad became Pakistan's capital in the 1960s, replacing Karachi."],
          ["What is Pakistan's largest city?", "Karachi", "Karachi on the Arabian Sea is Pakistan's largest city and port."],
          ["Which province has the largest population?", "Punjab", "Punjab holds more than half of Pakistan's population, the largest province by people."],
          ["What is the national language of Pakistan?", "Urdu", "Urdu is the national language, while English serves official purposes."],
          ["What is Pakistan's national animal?", "Markhor", "The markhor, a wild goat, is Pakistan's national animal, found in the north."],
          ["What is Pakistan's national flower?", "Jasmine", "Jasmine (chambeli) is Pakistan's national flower, symbolising purity."],
          ["What is the National Assembly of Pakistan?", "The lower house of parliament", "The National Assembly is the elected lower house of Pakistan's parliament."],
          ["What is the Senate of Pakistan?", "The upper house of parliament", "The Senate represents the provinces as Pakistan's upper house."],
          ["Which body approves Pakistan's budget?", "The National Assembly", "The National Assembly approves the federal budget presented by the government."],
          ["What is the State Bank of Pakistan?", "The central bank of Pakistan", "The State Bank issues currency and conducts monetary policy."],
          ["What is CPEC?", "The China-Pakistan Economic Corridor", "CPEC links Gwadar port to China through roads, rail and energy projects."],
          ["What is Pakistan's literacy rate approximately?", "About 60%", "Pakistan's literacy rate hovers around 60%, higher among younger people."]
        ],
        trick: "Capital=Islamabad, city=Karachi, province=Punjab, animal=markhor, flower=jasmine, SBP=central.",
        tip: "Capital/animal/flower pairs are the most asked current affairs items."
      },
      {
        kind: "tf", name: "pakistan current statements",
        note: "True/false stems on Pakistan.",
        statements: [
          ["The State Bank of Pakistan is the central bank.", "The State Bank of Pakistan prints all banknotes worldwide."],
          ["The National Assembly is the lower house.", "The Senate is the lower house of parliament."],
          ["CPEC connects Gwadar to China.", "CPEC connects Karachi to Mumbai only."],
          ["Islamabad is Pakistan's capital.", "Lahore is Pakistan's capital."],
          ["Jasmine is Pakistan's national flower.", "The lotus is Pakistan's national flower."],
          ["The Senate represents the provinces.", "The Senate is appointed by the army."]
        ],
        trick: "Senate=upper, NA=lower, SBP=central bank, Gwadar=CPEC port.",
        tip: "House and institution swaps are the traps."
      },
      {
        kind: "numeric", name: "years since events", difficulty: "easy",
        note: "Years elapsed since fixed Pakistan milestones.",
        q: (v) => `Pakistan gained independence in 1947. How many years had passed by ${v.y}?`,
        a: (v) => `${v.y - 1947}`,
        e: (v) => `${v.y} − 1947 = ${v.y - 1947} years, counting the full years since independence in August 1947.`,
        distract: (v) => [`${v.y - 1948}`, `${v.y - 1946}`, `${v.y - 1957}`, `${v.y - 1937}`, `${v.y - 1947 + 10}`],
        vals: (rng) => ({ y: 1950 + Math.floor(rng() * 76) }),
        whyWrong: (v) => [`Subtract 1947 from the later year; off-by-one answers and wrong reference years are the classic traps.`],
        trick: "subtract the earlier year.",
        tip: "Pakistan 1947, constitution 1956, separation 1971."
      },
      {
        kind: "numeric", name: "census share calculations", difficulty: "medium",
        note: "Population shares from the 2023 census.",
        q: (v) => `Pakistan's 2023 census counted about ${v.total / 10000000} crore people, of whom about ${v.p}% live in Punjab. About how many crore live in Punjab?`,
        a: (v) => `${(v.total * v.p / 100 / 10000000).toFixed(1)} crore`,
        e: (v) => `Punjab share = ${v.p}% of ${v.total / 10000000} crore = ${(v.total * v.p / 100 / 10000000).toFixed(1)} crore, multiplying the total by the percentage.`,
        distract: (v) => {
          const c = v.total * v.p / 100 / 10000000;
          return [`${(c + 2).toFixed(1)} crore`, `${(c - 2).toFixed(1)} crore`, `${(c * 1.2).toFixed(1)} crore`, `${(v.total / 10000000 - c).toFixed(1)} crore`, `${(c * 1.5).toFixed(1)} crore`];
        },
        vals: (rng) => {
          const total = 220000000 + Math.floor(rng() * 40) * 1000000;
          const p = 50 + Math.floor(rng() * 15);
          return { total, p };
        },
        whyWrong: (v) => [`Multiply the total by the percentage; using the complement share or misplacing the crore unit are the traps.`],
        trick: "share = total × p ÷ 100.",
        tip: "Punjab ≈ 53-56% of the population."
      },
      {
        kind: "numeric", name: "budget percentage splits", difficulty: "medium",
        note: "Sector share of the federal budget.",
        q: (v) => `The federal budget is Rs ${v.b} billion, with ${v.p}% allocated to defence. How many billion rupees go to defence?`,
        a: (v) => `${(v.b * v.p / 100).toFixed(0)} billion`,
        e: (v) => `Defence = ${v.p}% × ${v.b} billion = ${(v.b * v.p / 100).toFixed(0)} billion rupees, applying the percentage to the total budget.`,
        distract: (v) => {
          const c = v.b * v.p / 100;
          return [`${(c + 50).toFixed(0)} billion`, `${(c - 50 >= 0 ? c - 50 : c + 100).toFixed(0)} billion`, `${(c * 1.1).toFixed(0)} billion`, `${(v.b - c).toFixed(0)} billion`, `${(c * 0.9).toFixed(0)} billion`];
        },
        vals: (rng) => ({ b: 5000 + Math.floor(rng() * 100) * 100, p: 8 + Math.floor(rng() * 10) }),
        whyWrong: (v) => [`Multiply the total by the percentage share; the non-defence remainder is the deliberate distractor.`],
        trick: "amount = total × p ÷ 100.",
        tip: "Always read whether the question wants the share or the remainder."
      }
    ],

    "World and Organisations": [
      {
        kind: "fact", name: "world organisations facts",
        note: "Key world bodies and their roles.",
        facts: [
          ["Which organisation aims for global peace?", "The United Nations", "The UN (founded 1945) works for peace, security and cooperation."],
          ["How many permanent members does the UN Security Council have?", "Five", "China, France, Russia, the UK and the US are the five permanent members."],
          ["Which body settles disputes between states?", "The International Court of Justice", "The ICJ in The Hague rules on legal disputes between countries."],
          ["What is the WHO?", "The World Health Organization", "The WHO coordinates global health responses and disease control."],
          ["What is the WTO?", "The World Trade Organization", "The WTO sets rules for international trade between nations, settling disputes."],
          ["What is the IMF?", "The International Monetary Fund", "The IMF lends to countries facing balance-of-payments problems."],
          ["What is NATO?", "A Western military alliance", "NATO (founded 1949) is a collective-defence alliance of North American and European states."],
          ["What is the OIC?", "The Organisation of Islamic Cooperation", "The OIC groups 57 Muslim-majority countries, headquartered in Jeddah."],
          ["What is SAARC?", "The South Asian regional grouping", "SAARC (founded 1985) promotes regional cooperation in South Asia."],
          ["What is ASEAN?", "The Southeast Asian grouping", "ASEAN links ten Southeast Asian nations for economic and political cooperation."],
          ["What is the UN General Assembly?", "The UN's main deliberative body", "Every member state has one vote in the General Assembly, the UN's main forum."],
          ["What is UNESCO?", "The UN educational and cultural agency", "UNESCO designates world heritage sites and supports education and science."]
        ],
        trick: "UN=peace, ICJ=disputes, WHO=health, WTO=trade, IMF=loans, NATO=defence, OIC=57.",
        tip: "Organisation-purpose pairs are the highest-yield items."
      },
      {
        kind: "tf", name: "world organisation statements",
        note: "True/false stems on organisations.",
        statements: [
          ["The ICJ settles disputes between states.", "The ICJ organises international football."],
          ["The IMF lends during balance-of-payments crises.", "The IMF issues driving licences."],
          ["SAARC is a South Asian regional group.", "SAARC is a military alliance in Europe."],
          ["The UN Security Council has five permanent members.", "The UN Security Council has fifty permanent members."],
          ["The WTO sets international trade rules.", "The WTO builds international highways."],
          ["UNESCO designates world heritage sites.", "UNESCO regulates global oil prices."]
        ],
        trick: "ICJ=law, IMF=money, WTO=trade, UNESCO=heritage.",
        tip: "Agency-purpose swaps are the traps."
      },
      {
        kind: "numeric", name: "organisation ages", difficulty: "easy",
        note: "Age of organisations from founding years.",
        q: (v) => `The United Nations was founded in 1945. How many years old was it in ${v.y}?`,
        a: (v) => `${v.y - 1945}`,
        e: (v) => `${v.y} − 1945 = ${v.y - 1945} years, counting from the founding in October 1945.`,
        distract: (v) => [`${v.y - 1946}`, `${v.y - 1944}`, `${v.y - 1935}`, `${v.y - 1955}`, `${v.y - 1945 + 5}`],
        vals: (rng) => ({ y: 1950 + Math.floor(rng() * 76) }),
        whyWrong: (v) => [`Subtract the founding year 1945; off-by-one answers or later founding dates are the traps.`],
        trick: "age = later year − founding year.",
        tip: "UN 1945, NATO 1949, OIC 1969, SAARC 1985."
      },
      {
        kind: "numeric", name: "member state shares", difficulty: "hard",
        note: "Vote share and percentage arithmetic in bodies.",
        q: (v) => `The UN General Assembly has ${v.m} member states. If ${v.yes} vote in favour, what percentage (rounded to one decimal) voted in favour?`,
        a: (v) => `${(100 * v.yes / v.m).toFixed(1)}%`,
        e: (v) => `Share = ${v.yes} ÷ ${v.m} × 100 = ${(100 * v.yes / v.m).toFixed(1)}%, because each member casts one vote in the General Assembly.`,
        distract: (v) => {
          const c = 100 * v.yes / v.m;
          return [`${(100 - c).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 1.5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${v.yes}%`];
        },
        vals: (rng) => {
          const m = 120 + Math.floor(rng() * 70);
          const yes = 60 + Math.floor(rng() * (m - 60));
          return { m, yes };
        },
        whyWrong: (v) => [`Divide the votes in favour by ALL members; the opposing share is the classic distractor.`],
        trick: "% = votes ÷ members × 100.",
        tip: "Two-thirds majorities are common UN thresholds."
      },
      {
        kind: "numeric", name: "olympic cycle arithmetic", difficulty: "easy",
        note: "Olympics every four years.",
        q: (v) => `The Summer Olympics run every 4 years. If one is held in ${v.y}, in which year was the one four years earlier?`,
        a: (v) => `${v.y - 4}`,
        e: (v) => `Subtract the 4-year cycle: ${v.y} − 4 = ${v.y - 4}, since the games recur every fourth year.`,
        distract: (v) => [`${v.y - 2}`, `${v.y + 4}`, `${v.y - 8}`, `${v.y - 6}`, `${v.y - 4 + 1}`],
        vals: (rng) => ({ y: 1988 + Math.floor(rng() * 9) * 4 }),
        whyWrong: (v) => [`The cycle is 4 years; 2-year and 6-year gaps are the classic distractors.`],
        trick: "Olympics every 4 years.",
        tip: "2020 was postponed to 2021 by COVID-19."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
