/* ============================================================
   Generator file 06 — Pakistan Affairs, History, General Knowledge,
   Current Affairs (static/factual content only)
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

module.exports = [
  makeGen("pakistan-affairs", "Pakistan Affairs — National Knowledge", {
    "National Symbols": [
      ["What is the national animal of Pakistan?", "Markhor", "The markhor, a mountain goat, is Pakistan's national animal."],
      ["What is the national bird of Pakistan?", "Chukar partridge", "The chukar is Pakistan's national bird."],
      ["What is the national flower of Pakistan?", "Jasmine", "Jasmine (Chambeli) is the national flower."],
      ["What is the national tree of Pakistan?", "Deodar", "Deodar cedar is the national tree."],
      ["What is the national fruit of Pakistan?", "Mango", "The mango is Pakistan's national fruit."],
      ["What is the national sport of Pakistan?", "Field hockey", "Hockey is officially the national sport."],
      ["What are the colours of Pakistan's flag?", "Green and white", "Green represents the Muslim majority; white the minorities."],
      ["What is the national motto on the coat of arms?", "Unity, Faith, Discipline", "The Urdu motto 'Iman, Ittehad, Tanzeem' appears on the emblem."],
      ["What is the national language of Pakistan?", "Urdu", "Urdu is the national language; English is official for many purposes."],
      ["What does the crescent on the flag represent?", "progress", "The crescent symbolises progress; the star light and knowledge."]
    ],
    "Geography of Pakistan": [
      ["Which is the largest province of Pakistan by area?", "Balochistan", "Balochistan covers about 44% of Pakistan's land area."],
      ["Which is the most populous province?", "Punjab", "Punjab holds the largest share of Pakistan's population."],
      ["Which is the highest peak of Pakistan?", "K2", "K2 (8,611 m) is the world's second-highest mountain."],
      ["Which is the longest river of Pakistan?", "Indus", "The Indus flows about 3,180 km through Pakistan."],
      ["Which is the largest lake of Pakistan?", "Manchar", "Lake Manchar in Sindh is Pakistan's largest natural lake."],
      ["Which is the capital of Pakistan?", "Islamabad", "Islamabad became the capital in the 1960s."],
      ["Which city is the financial capital?", "Karachi", "Karachi is Pakistan's largest city and economic hub."],
      ["Which mountain range borders Pakistan and China?", "Karakoram", "The Karakoram range hosts K2 and many glaciers."],
      ["Which desert is in Sindh?", "Thar", "The Thar desert spans southeastern Sindh."],
      ["Which is the largest city of Balochistan?", "Quetta", "Quetta is Balochistan's provincial capital and largest city."],
      ["Which river forms part of the boundary with India in Punjab?", "Ravi", "The Ravi runs along parts of the Punjab border."],
      ["Which province has the coastline on the Arabian Sea?", "Sindh and Balochistan", "Both Sindh and Balochistan border the Arabian Sea."]
    ],
    "Constitution and Government": [
      ["When was the Constitution of Pakistan adopted?", "1973", "The 1973 Constitution was adopted on 14 August 1973."],
      ["Who is the head of state of Pakistan?", "President", "The President is the ceremonial head of state."],
      ["Who is the head of government?", "Prime Minister", "The Prime Minister heads the executive government."],
      ["How many houses does Parliament have?", "Two (National Assembly and Senate)", "Pakistan has a bicameral legislature."],
      ["How many members does the National Assembly have?", "336", "The NA has 336 seats (266 general plus reserved)."],
      ["Which city hosts the National Assembly?", "Islamabad", "Parliament meets in the Parliament House, Islamabad."],
      ["Who appoints the Chief Justice of Pakistan?", "President", "The President appoints the CJP on the PM's advice."],
      ["What is the Supreme Court's role?", "final appellate court", "The Supreme Court is Pakistan's highest court."],
      ["Which document guarantees fundamental rights?", "The Constitution", "Part II of the 1973 Constitution lists fundamental rights."],
      ["How is the Prime Minister elected?", "by the National Assembly", "The NA elects the PM by majority vote."]
    ]
  }),
  makeGen("pakistan-history", "Pakistan History — Movement and Nation", {
    "Freedom Movement": [
      ["When was the All-India Muslim League founded?", "1906", "The League was founded in Dhaka on 30 December 1906."],
      ["Who proposed the Two-Nation Theory?", "Sir Syed Ahmad Khan (concept); Allama Iqbal (articulated)", "Iqbal's 1930 Allahabad address articulated Muslim nationhood."],
      ["When did Allama Iqbal give his Allahabad address?", "1930", "Iqbal proposed a separate Muslim state in 1930."],
      ["Who coined the name 'Pakistan'?", "Choudhry Rahmat Ali", "He proposed 'Pakstan' in 1933."],
      ["When was the Lahore Resolution passed?", "1940", "The resolution was adopted on 23 March 1940."],
      ["Who moved the Lahore Resolution?", "A.K. Fazlul Huq", "The Bengal premier moved the historic resolution."],
      ["When did Pakistan gain independence?", "14 August 1947", "Pakistan emerged on 14 August 1947 (27 Ramadan)."],
      ["Who was the first Governor-General of Pakistan?", "Muhammad Ali Jinnah", "Quaid-e-Azam served as Governor-General until 1948."],
      ["Who was the first Prime Minister of Pakistan?", "Liaquat Ali Khan", "Liaquat Ali Khan led the first government."],
      ["When did Jinnah address the Constituent Assembly?", "11 August 1947", "His address promised equal citizenship for all."],
      ["Which province was partitioned at independence?", "Punjab and Bengal", "Both provinces were divided between India and Pakistan."],
      ["When was the Objectives Resolution passed?", "1949", "The Constituent Assembly adopted it in March 1949."]
    ],
    "Modern Pakistan": [
      ["Who was the first woman Prime Minister of Pakistan?", "Benazir Bhutto", "She took office in 1988."],
      ["When was East Pakistan separated?", "1971", "East Pakistan became Bangladesh in December 1971."],
      ["Who led the 1971 surrender negotiations?", "General A.A.K. Niazi", "Niazi signed the surrender in Dhaka on 16 December 1971."],
      ["When was Pakistan's first nuclear test?", "28 May 1998", "Pakistan conducted tests at Chagai, Balochistan."],
      ["What is the name of Pakistan's nuclear test site?", "Chagai", "The Chagai hills hosted the 1998 tests."],
      ["Who was the first Governor-General to be assassinated?", "Liaquat Ali Khan", "He was assassinated in Rawalpindi in 1951."],
      ["When did Pakistan become a republic?", "23 March 1956", "The 1956 Constitution made Pakistan a republic."],
      ["Which military leader took power in 1999?", "Pervez Musharraf", "Musharraf assumed power in October 1999."],
      ["When did Pakistan join the UN?", "1947", "Pakistan became a UN member on 30 September 1947."],
      ["Which movement forced elections in 2008?", "Lawyers' movement", "The 2007-09 lawyers' movement restored the judiciary."]
    ]
  }),
  makeGen("general-knowledge", "General Knowledge — World Facts", {
    "World Records": [
      ["Which is the largest country by area?", "Russia", "Russia spans about 17.1 million km²."],
      ["Which is the most populous country?", "India", "India surpassed China as most populous in 2023."],
      ["Which is the largest ocean?", "Pacific", "The Pacific covers about a third of Earth's surface."],
      ["Which is the highest mountain in the world?", "Mount Everest", "Everest rises 8,849 m in the Himalayas."],
      ["Which is the longest river in the world?", "Nile (by tradition)", "The Nile runs about 6,650 km; the Amazon is a contender."],
      ["Which is the largest desert?", "Antarctic (polar)", "Antarctica is the largest desert by area."],
      ["Which is the largest hot desert?", "Sahara", "The Sahara covers most of North Africa."],
      ["Which is the smallest country by area?", "Vatican City", "Vatican City spans about 0.49 km²."],
      ["Which is the tallest building in the world?", "Burj Khalifa", "The Burj Khalifa in Dubai stands 828 m."],
      ["Which is the largest continent?", "Asia", "Asia covers about 30% of Earth's land."],
      ["Which is the largest mammal?", "Blue whale", "Blue whales can exceed 30 m in length."],
      ["Which is the fastest land animal?", "Cheetah", "Cheetahs reach about 110 km/h in short bursts."]
    ],
    "Organizations": [
      ["Where is the UN headquarters?", "New York", "The UN is headquartered in New York City."],
      ["When was the UN founded?", "1945", "The UN charter took effect on 24 October 1945."],
      ["What does UNESCO stand for?", "United Nations Educational, Scientific and Cultural Organization", "UNESCO promotes education, science and culture."],
      ["Which organization deals with world health?", "WHO", "The World Health Organization is a UN agency."],
      ["Which organization handles world trade rules?", "WTO", "The World Trade Organization governs global trade."],
      ["What does NATO stand for?", "North Atlantic Treaty Organization", "NATO is a Western defence alliance founded in 1949."],
      ["Where is the IMF headquartered?", "Washington, D.C.", "The IMF is based in Washington, D.C."],
      ["What does OPEC do?", "coordinates oil production", "OPEC groups major oil-exporting countries."],
      ["Which organization promotes world peace through sports?", "IOC", "The International Olympic Committee runs the Games."],
      ["What does SAARC stand for?", "South Asian Association for Regional Cooperation", "SAARC unites South Asian nations since 1985."],
      ["Where is the World Bank headquartered?", "Washington, D.C.", "The World Bank is based in Washington, D.C."],
      ["Which UN agency aids children?", "UNICEF", "UNICEF protects children's rights and welfare."]
    ]
  }),
  makeGen("current-affairs", "Current Affairs — Pakistan", {
    "Institutions and Leaders": [
      ["Who is the head of the federal cabinet?", "The Prime Minister", "The PM chairs the federal cabinet."],
      ["Which body oversees the armed forces?", "The federal government", "Defence is a federal subject under the government."],
      ["Who heads the Election Commission of Pakistan?", "Chief Election Commissioner", "The CEC leads election administration."],
      ["Which institution issues the national currency?", "State Bank of Pakistan", "The SBP issues the rupee and sets monetary policy."],
      ["Which body collects federal taxes?", "FBR", "The Federal Board of Revenue collects federal taxes."],
      ["Who is the Chairman of the Joint Chiefs of Staff Committee?", "a four-star general", "The CJCS is the senior-most military officer."],
      ["Which agency investigates financial crimes?", "FIA", "The Federal Investigation Agency probes financial and cyber crime."],
      ["Which body regulates securities markets?", "SECP", "The Securities and Exchange Commission of Pakistan regulates markets."]
    ],
    "Programs and Policy": [
      ["What is CPEC?", "China-Pakistan Economic Corridor", "CPEC links Gwadar to China with infrastructure and energy projects."],
      ["What is the Ehsaas program?", "a social safety net", "Ehsaas provides cash transfers and welfare support."],
      ["What is the Benazir Income Support Programme?", "a cash assistance scheme", "BISP gives financial aid to low-income families."],
      ["What does SIFC stand for?", "Special Investment Facilitation Council", "SIFC fast-tracks investment in priority sectors."],
      ["What is the National Finance Commission?", "a body dividing revenues between provinces", "The NFC distributes federal revenues to provinces."],
      ["What is the Sustainable Development Goals agenda?", "a global development framework", "The 2030 SDGs cover 17 global goals."],
      ["What is the Green Pakistan Initiative?", "a reforestation program", "It aims to expand forest cover across the country."],
      ["What is the Ravi Urban Development Authority?", "a city development project", "RUDA develops the Ravi riverfront near Lahore."]
    ]
  }),
  makeGen("world-current-affairs", "World Current Affairs — Static Facts", {
    "World Institutions": [
      ["Which country hosted COP28 in 2023?", "United Arab Emirates", "COP28 was held in Dubai, UAE."],
      ["What does G20 stand for?", "Group of Twenty", "The G20 groups the world's largest economies."],
      ["Which city hosts the European Parliament?", "Strasbourg and Brussels", "The EP meets in Strasbourg and Brussels."],
      ["What is the African Union?", "a continental body of African states", "The AU promotes unity and development in Africa."],
      ["Which organisation runs the World Cup?", "FIFA", "FIFA organises the football World Cup."],
      ["What is the Commonwealth?", "a voluntary association of former British colonies", "The Commonwealth links 56 member states."],
      ["Which body is the EU's executive?", "European Commission", "The Commission proposes and enforces EU law."],
      ["What is ASEAN?", "a Southeast Asian regional bloc", "ASEAN promotes cooperation among Southeast Asian states."],
      ["Which is the newest UN member state?", "South Sudan", "South Sudan joined the UN in 2011."],
      ["What is the World Food Programme?", "a UN food-aid agency", "The WFP fights hunger in emergencies."]
    ]
  })
];
