/* ============================================================
   Deep Knowledge KB — General Knowledge
   Countries/capitals/currencies, organisations, books/authors,
   sports, world records, discoveries.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["general-knowledge"],
  chapter: "General Knowledge — Deep Knowledge Bank",
  tags: ["general-knowledge", "deep-kb", "world", "organisations", "books", "sports"],
  topics: {

    "Countries, Capitals and Currencies": [
      {
        kind: "pair", a: "country", b: "capital",
        note: "Capital-city pairs are the most tested General Knowledge facts in the world.",
        pairs: [
          ["France", "Paris"], ["Japan", "Tokyo"], ["Germany", "Berlin"], ["Australia", "Canberra"], ["Canada", "Ottawa"],
          ["Turkey", "Ankara"], ["Brazil", "Brasilia"], ["Russia", "Moscow"], ["China", "Beijing"], ["India", "New Delhi"],
          ["Egypt", "Cairo"], ["South Korea", "Seoul"], ["Mexico", "Mexico City"], ["Italy", "Rome"], ["Spain", "Madrid"]
        ],
        trick: "Turkey=Ankara (not Istanbul), Australia=Canberra (not Sydney), Brazil=Brasilia (not Rio).",
        tip: "The three trap capitals are Ankara, Canberra and Brasilia — tourists' cities are wrong."
      },
      {
        kind: "pair", a: "country", b: "currency",
        note: "Currency pairs complete the country knowledge set.",
        pairs: [
          ["Japan", "yen"], ["United States", "dollar"], ["United Kingdom", "pound sterling"], ["India", "rupee"],
          ["China", "yuan"], ["Saudi Arabia", "riyal"], ["UAE", "dirham"], ["Turkey", "lira"], ["Russia", "ruble"],
          ["Germany", "euro"], ["Switzerland", "franc"], ["Iran", "rial"]
        ],
        trick: "Japan=yen, UK=pound, China=yuan, Saudi=riyal, UAE=dirham, Russia=ruble.",
        tip: "Riyal (Saudi) vs Rial (Iran) — one letter distinguishes the two."
      },
      {
        kind: "fact", name: "countries of the world",
        note: "Country superlatives and facts are standard GK one-liners.",
        facts: [
          ["Which is the largest country in the world by area?", "Russia", "Russia covers about 17 million square kilometres, the largest country by land area."],
          ["Which is the largest country in the world by population?", "India", "India overtook China as the most populous country, passing the 1.4 billion mark."],
          ["Which is the smallest country in the world?", "Vatican City", "Vatican City, about 0.44 square kilometres, is the world's smallest independent state."],
          ["Which is the most populous city in the world?", "Tokyo", "Tokyo's metropolitan area is the world's most populous, exceeding 37 million people."],
          ["Which country is known as the Land of the Rising Sun?", "Japan", "Japan's name means 'sun origin', earning it the title Land of the Rising Sun."],
          ["Which country is known as the Land of the Free?", "The United States", "The US is associated with the Land of the Free through its national anthem's famous line."],
          ["Which country is called the Land of a Thousand Lakes?", "Finland", "Finland's roughly 188,000 lakes give it the title Land of a Thousand Lakes."],
          ["Which country is known as the Land of the Midnight Sun?", "Norway", "Norway's northern regions see continuous daylight in summer, hence the Midnight Sun title."],
          ["How many countries are members of the United Nations?", "193", "The UN has 193 member states, with South Sudan joining in 2011 as the newest."],
          ["Which continent has the most countries?", "Africa", "Africa contains 54 countries, the most of any continent, because its colonial partition created a large number of small states."],
          ["Which is the largest continent?", "Asia", "Asia is the largest continent by both area and population, covering about 30% of the Earth's land."],
          ["Which is the smallest continent?", "Australia", "Australia (Oceania) is the smallest continent by land area, at about 8.6 million square kilometres."],
          ["Which is the largest ocean of the world?", "Pacific", "The Pacific Ocean covers about a third of the Earth's surface, the largest ocean."],
          ["Which is the deepest ocean of the world?", "Pacific", "The Pacific contains the Mariana Trench, the deepest point on Earth at about 11 km."],
          ["Which is the largest desert of the world?", "Sahara", "The Sahara in North Africa is the largest hot desert, about 9.2 million square kilometres."],
          ["Which is the longest river in the world?", "Nile", "The Nile, at about 6,650 km, is conventionally the world's longest river."],
          ["Which is the highest mountain in the world?", "Mount Everest", "Mount Everest at 8,849 metres is the world's highest peak, on the Nepal-China border."],
          ["Which is the largest island of the world?", "Greenland", "Greenland, about 2.1 million square kilometres, is the world's largest island."]
        ],
        trick: "Russia largest, India most populous, Vatican smallest, Pacific largest ocean, Everest highest.",
        tip: "The world's 'largest' set (country, ocean, desert, island, mountain) is guaranteed content."
      },
      {
        kind: "tf", name: "countries and capitals",
        note: "True/false stems on capitals, currencies and country facts.",
        statements: [
          ["Canberra is the capital of Australia.", "Sydney is the capital of Australia."],
          ["Ankara is the capital of Turkey.", "Istanbul is the capital of Turkey."],
          ["Japan's currency is the yen.", "Japan's currency is the won."],
          ["Russia is the largest country by area.", "Canada is the largest country by area."],
          ["The Nile is the longest river in the world.", "The Amazon is the longest river in the world."]
        ],
        trick: "Ankara/Canberra/Brasilia — the three capitals people get wrong.",
        tip: "Tourist cities (Sydney, Istanbul, Rio) are always the wrong options."
      }
    ],

    "International Organisations": [
      {
        kind: "pair", a: "organisation", b: "headquarters city",
        note: "The HQ cities of major international bodies are standard GK facts.",
        pairs: [
          ["United Nations", "New York"], ["UNESCO", "Paris"], ["World Bank", "Washington D.C."], ["IMF", "Washington D.C."],
          ["WHO", "Geneva"], ["WTO", "Geneva"], ["NATO", "Brussels"], ["EU", "Brussels"], ["OPEC", "Vienna"], ["INTERPOL", "Lyon"]
        ],
        trick: "UN=NY, WHO/WTO=Geneva, NATO/EU=Brussels, UNESCO=Paris, OPEC=Vienna, IMF/World Bank=DC.",
        tip: "Geneva (WHO+WTO) and Brussels (NATO+EU) are the two shared-city pairs."
      },
      {
        kind: "fact", name: "international organisations",
        note: "Facts about the world's most important organisations.",
        facts: [
          ["When was the United Nations founded?", "1945", "The UN was founded on 24 October 1945 after World War II, with 51 founding members."],
          ["Which day is celebrated as United Nations Day?", "24 October", "24 October, the day the UN Charter took effect in 1945, is United Nations Day."],
          ["Who is the current Secretary-General of the United Nations?", "António Guterres", "António Guterres of Portugal has served as UN Secretary-General since 2017."],
          ["What does UNESCO stand for?", "United Nations Educational, Scientific and Cultural Organization", "UNESCO promotes education, science and culture and designates World Heritage Sites."],
          ["What does WHO stand for?", "World Health Organization", "The WHO coordinates international public health, headquartered in Geneva."],
          ["What does IMF stand for?", "International Monetary Fund", "The IMF oversees global financial stability and provides balance-of-payments support to countries."],
          ["How many member states does the United Nations have?", "193", "The UN counts 193 member states, nearly all recognised countries of the world."],
          ["Which organisation grants loans for development projects to poorer countries?", "The World Bank", "The World Bank provides long-term loans and grants for development projects in developing countries."],
          ["Which organisation sets international trade rules?", "WTO", "The World Trade Organization sets and enforces the rules of global trade between nations."],
          ["Which organisation of oil producers controls a large share of world oil supply?", "OPEC", "OPEC, the Organisation of Petroleum Exporting Countries, coordinates oil production policies of major exporters."],
          ["Which alliance is a military organisation of Western nations?", "NATO", "NATO, the North Atlantic Treaty Organization, is a military alliance founded in 1949."],
          ["What does SAARC stand for?", "South Asian Association for Regional Cooperation", "SAARC, founded in 1985, promotes regional cooperation among South Asian countries."]
        ],
        trick: "UN 1945 + 24 October + 193 members; WHO/WTO in Geneva; NATO 1949.",
        tip: "UN founding year (1945) and HQ (New York) are the two anchors."
      },
      {
        kind: "list", name: "UN specialised agencies", group: "the specialised agencies of the United Nations",
        note: "UNESCO, WHO, UNICEF, ILO, FAO and IMF/World Bank are among the UN's specialised agencies.",
        items: ["UNESCO", "WHO", "UNICEF", "ILO", "FAO"],
        outsiders: ["NATO", "OPEC", "ASEAN", "SAARC", "G7", "INTERPOL"],
        trick: "UNESCO/WHO/UNICEF/ILO/FAO are UN agencies; NATO, OPEC and ASEAN are separate bodies.",
        tip: "NATO (military) and OPEC (oil) are the favourite 'NOT a UN agency' answers."
      },
      {
        kind: "tf", name: "international organisations",
        note: "True/false stems on organisations and their roles.",
        statements: [
          ["The UN was founded in 1945.", "The UN was founded in 1919."],
          ["WHO is headquartered in Geneva.", "WHO is headquartered in New York."],
          ["NATO is a military alliance.", "NATO is a trade union."],
          ["UNESCO designates World Heritage Sites.", "OPEC designates World Heritage Sites."],
          ["The WTO sets international trade rules.", "The WTO sets international copyright laws only."]
        ],
        trick: "UN 1945, WHO Geneva, NATO military, UNESCO heritage.",
        tip: "Organisation-role swaps are always false; one role per body."
      }
    ],

    "Books and Authors": [
      {
        kind: "pair", a: "book", b: "author",
        note: "Book-author pairs are among the most repeated GK questions.",
        pairs: [
          ["Pride and Prejudice", "Jane Austen"], ["War and Peace", "Leo Tolstoy"], ["1984", "George Orwell"], ["Animal Farm", "George Orwell"],
          ["Hamlet", "William Shakespeare"], ["Don Quixote", "Miguel de Cervantes"], ["The Old Man and the Sea", "Ernest Hemingway"],
          ["The God of Small Things", "Arundhati Roy"], ["A Tale of Two Cities", "Charles Dickens"], ["The Origin of Species", "Charles Darwin"]
        ],
        trick: "1984 + Animal Farm = Orwell; Hamlet = Shakespeare; Pride and Prejudice = Austen.",
        tip: "Orwell's two books (1984, Animal Farm) are the most asked pair."
      },
      {
        kind: "fact", name: "books and authors",
        note: "Classic book facts and author details are standard GK content.",
        facts: [
          ["Who wrote 'A Brief History of Time'?", "Stephen Hawking", "Stephen Hawking's 'A Brief History of Time' popularised cosmology and became a worldwide bestseller."],
          ["Who wrote 'The Republic'?", "Plato", "Plato's 'Republic' is a foundational work of Western philosophy on justice and the ideal state."],
          ["Who is known as the Bard of Avon?", "William Shakespeare", "Shakespeare, born in Stratford-upon-Avon, is called the Bard of Avon."],
          ["Who wrote 'Sapiens: A Brief History of Humankind'?", "Yuval Noah Harari", "Yuval Noah Harari's 'Sapiens' traces the history of Homo sapiens through the cognitive and scientific revolutions."],
          ["Who wrote the national anthem of Pakistan?", "Hafeez Jalandhari", "Hafeez Jalandhari wrote the Qaumi Taranah, set to music by Ahmed Ghulamali Chagla."],
          ["Who wrote 'Bang-e-Dara'?", "Allama Iqbal", "Iqbal's 'Bang-e-Dara' (The Call of the Marching Bell) is his first major Urdu poetry collection."],
          ["Who wrote 'My India'?", "Jim Corbett", "Jim Corbett wrote 'My India', recollections of life in colonial India's hills."],
          ["Who is the author of 'The Alchemist'?", "Paulo Coelho", "Brazilian author Paulo Coelho wrote 'The Alchemist', one of the best-selling books of all time."]
        ],
        trick: "Hawking = Brief History of Time; Plato = Republic; Shakespeare = Bard of Avon.",
        tip: "Book↔author matching is the GK section's highest-yield content."
      },
      {
        kind: "tf", name: "books and authors",
        note: "True/false stems on famous books and their writers.",
        statements: [
          ["George Orwell wrote '1984'.", "George Orwell wrote 'The Republic'."],
          ["Shakespeare wrote 'Hamlet'.", "Shakespeare wrote 'The Origin of Species'."],
          ["Hafeez Jalandhari wrote the national anthem of Pakistan.", "Allama Iqbal wrote the national anthem of Pakistan."],
          ["Jane Austen wrote 'Pride and Prejudice'.", "Jane Austen wrote 'War and Peace'."],
          ["Stephen Hawking wrote 'A Brief History of Time'.", "Stephen Hawking wrote 'The Old Man and the Sea'."]
        ],
        trick: "Orwell=1984, Shakespeare=Hamlet, Austen=Pride and Prejudice, Hawking=Time.",
        tip: "Author swaps are always false; match the author to the iconic title."
      }
    ],

    "Sports": [
      {
        kind: "fact", name: "sports facts",
        note: "World sports records and events are classic GK questions.",
        facts: [
          ["How often are the Olympic Games held?", "Every four years", "The Summer Olympics occur every four years, with the Winter Games also on a four-year cycle."],
          ["In which year were the first modern Olympic Games held?", "1896", "The first modern Olympics were held in Athens in 1896, reviving the ancient games."],
          ["Which country has won the most Olympic gold medals?", "The United States", "The United States leads the all-time Olympic gold medal table by a wide margin."],
          ["Which country is the current home of the FIFA World Cup's most titles?", "Brazil", "Brazil has won the FIFA World Cup five times, more than any other nation."],
          ["How often is the FIFA World Cup held?", "Every four years", "The FIFA World Cup is held every four years, alternating with the Olympics."],
          ["Which is the world's most popular sport by participation?", "Football (soccer)", "Football is the world's most popular sport, played by over 250 million people."],
          ["What is the length of a standard marathon?", "42.195 km", "A full marathon covers 42.195 kilometres, fixed at the 1924 Paris Olympics."],
          ["Which country dominates international cricket by population reach?", "India", "India's huge fan base makes cricket its dominant sport and the world's second most popular game."],
          ["Who is called the 'Sultan of Swing' in cricket?", "Wasim Akram", "Pakistani fast bowler Wasim Akram earned the title Sultan of Swing for his reverse-swing mastery."],
          ["What is the national game of the United States?", "Baseball (unofficially)", "Baseball is considered America's national pastime, though no official law designates it."]
        ],
        trick: "Olympics 4 years + 1896 Athens; Brazil 5 World Cups; marathon 42.195 km.",
        tip: "Olympic cycle (4 years) and marathon distance are the two number facts."
      },
      {
        kind: "pair", a: "sport", b: "playground term",
        note: "Sport-vocabulary pairs connect the game with its field or equipment.",
        pairs: [
          ["Cricket", "wicket and pitch"], ["Football", "goal and pitch"], ["Tennis", "court and racket"], ["Hockey", "stick and goal"],
          ["Badminton", "shuttlecock and racket"], ["Snooker", "table and cue"], ["Squash", "court and wall"], ["Boxing", "ring and gloves"]
        ],
        trick: "Badminton=shuttlecock, Snooker=cue, Squash=wall court, Boxing=ring.",
        tip: "Shuttlecock↔badminton is the most-asked sport-vocabulary pair."
      },
      {
        kind: "tf", name: "sports facts",
        note: "True/false stems on sports records and events.",
        statements: [
          ["The Olympics are held every four years.", "The Olympics are held every year."],
          ["Brazil has won the FIFA World Cup five times.", "Argentina has won the FIFA World Cup five times."],
          ["A marathon is 42.195 kilometres.", "A marathon is 21.1 kilometres."],
          ["The first modern Olympics were held in 1896.", "The first modern Olympics were held in 1496."],
          ["Field hockey is the national sport of Pakistan.", "Cricket is the national sport of Pakistan."]
        ],
        trick: "4 years, 5 cups Brazil, 42.195 km, 1896, hockey national.",
        tip: "Half-marathon (21.1 km) is the classic marathon trap."
      }
    ],

    "World Records and Firsts": [
      {
        kind: "fact", name: "world records",
        note: "Famous firsts and records are reliable GK marks.",
        facts: [
          ["Who was the first man to walk on the Moon?", "Neil Armstrong", "Neil Armstrong stepped onto the Moon on 20 July 1969, during the Apollo 11 mission."],
          ["In which year did man first land on the Moon?", "1969", "Apollo 11 landed humans on the Moon on 20 July 1969, because the mission achieved the historic first lunar touchdown."],
          ["Who was the first woman in space?", "Valentina Tereshkova", "Soviet cosmonaut Valentina Tereshkova orbited Earth in 1963, the first woman in space."],
          ["Who was the first woman Prime Minister of a country?", "Sirimavo Bandaranaike", "Sirimavo Bandaranaike of Sri Lanka became the world's first female Prime Minister in 1960."],
          ["Who was the first woman Prime Minister of the Muslim world?", "Benazir Bhutto", "Benazir Bhutto became Pakistan's PM in 1988, the first woman to lead a Muslim-majority country."],
          ["Who invented the printing press?", "Johannes Gutenberg", "Gutenberg's movable-type printing press, around 1440, revolutionised the spread of knowledge."],
          ["Who invented the World Wide Web?", "Tim Berners-Lee", "Tim Berners-Lee invented the World Wide Web at CERN in 1989–1991."],
          ["Who was the first Secretary-General of the United Nations?", "Trygve Lie", "Trygve Lie of Norway served as the first UN Secretary-General from 1946 to 1952."],
          ["Who was the first President of the United States?", "George Washington", "George Washington served as the first US President from 1789 to 1797."],
          ["Who was the first man to sail around the world (completed by crew)?", "Ferdinand Magellan (expedition completed 1522)", "Magellan's expedition circumnavigated the globe in 1519–1522, though Magellan himself died in the Philippines."],
          ["Which is the longest wall in the world?", "The Great Wall of China", "The Great Wall of China stretches over 21,000 kilometres including all its branches."],
          ["Which is the tallest building in the world?", "Burj Khalifa", "The Burj Khalifa in Dubai, at 828 metres, is the world's tallest building."]
        ],
        trick: "Armstrong 1969 Moon, Tereshkova first woman in space, Berners-Lee = WWW.",
        tip: "'First woman' set (space, PM, Muslim PM) is the highest-yield record group."
      },
      {
        kind: "pair", a: "person", b: "first",
        note: "Famous firsts pair the person with their achievement.",
        pairs: [
          ["Neil Armstrong", "first man on the Moon"], ["Valentina Tereshkova", "first woman in space"], ["Yuri Gagarin", "first man in space"],
          ["Edmund Hillary", "first to summit Everest (with Tenzing)"], ["Christopher Columbus", "first European voyage to the Americas in 1492"],
          ["Wilbur and Orville Wright", "first powered flight in 1903"]
        ],
        trick: "Gagarin = first in space, Armstrong = first on Moon, Tereshkova = first woman in space.",
        tip: "Gagarin (space) vs Armstrong (Moon) is THE most confused pair — memorise both."
      },
      {
        kind: "tf", name: "records and firsts",
        note: "True/false stems on world records.",
        statements: [
          ["Neil Armstrong was the first man on the Moon.", "Yuri Gagarin was the first man on the Moon."],
          ["Valentina Tereshkova was the first woman in space.", "Sally Ride was the first woman in space."],
          ["Tim Berners-Lee invented the World Wide Web.", "Bill Gates invented the World Wide Web."],
          ["The Burj Khalifa is the tallest building.", "The Empire State Building is the tallest building."],
          ["Benazir Bhutto was the first female PM of a Muslim country.", "Indira Gandhi was the first female PM of a Muslim country."]
        ],
        trick: "Armstrong=Moon, Gagarin=orbit, Tereshkova=first woman, Berners-Lee=WWW.",
        tip: "The Moon-vs-space confusion (Armstrong vs Gagarin) is the classic trap."
      }
    ],

    "World Geography": [
      {
        kind: "fact", name: "world geography",
        note: "Basic world geography facts are always present in GK papers.",
        facts: [
          ["Which is the largest river by discharge volume?", "The Amazon", "The Amazon carries more water than any other river, about 20% of the world's river flow."],
          ["Which is the largest lake in the world by area?", "Caspian Sea", "The Caspian Sea, at about 371,000 square kilometres, is the largest lake by area."],
          ["Which is the deepest lake in the world?", "Lake Baikal", "Lake Baikal in Siberia reaches about 1,642 metres, the deepest lake in the world."],
          ["Which is the highest waterfall in the world?", "Angel Falls", "Angel Falls in Venezuela, at 979 metres, is the world's highest uninterrupted waterfall."],
          ["Which is the largest country of South America?", "Brazil", "Brazil is the largest South American country by both area and population."],
          ["Which is the largest country of Africa by area?", "Algeria", "Algeria, at about 2.38 million square kilometres, became Africa's largest country after South Sudan split."],
          ["Which is the largest country of Europe by area?", "Russia", "Russia spans Europe and Asia and is the largest country in Europe by area."],
          ["Which strait separates Asia from North America?", "Bering Strait", "The Bering Strait, about 85 km wide, separates Russia from Alaska."],
          ["Which canal connects the Mediterranean and Red Seas?", "Suez Canal", "The Suez Canal, opened 1869, links the Mediterranean to the Red Sea, shortening Europe-Asia shipping."],
          ["Which canal connects the Atlantic and Pacific Oceans?", "Panama Canal", "The Panama Canal, opened 1914, lets ships pass between the Atlantic and Pacific without rounding South America."],
          ["Which is the capital of Australia's neighbour New Zealand?", "Wellington", "Wellington is the capital of New Zealand, while Auckland is its largest city."],
          ["Which country has the most time zones?", "France", "France, with its overseas territories, spans 12 or 13 time zones, more than any other country."]
        ],
        trick: "Amazon largest discharge, Baikal deepest, Angel Falls highest, Suez=Mediterranean, Panama=Atlantic-Pacific.",
        tip: "Suez vs Panama canal function is the most-confused pair in world geography."
      },
      {
        kind: "pair", a: "canal or strait", b: "connects",
        note: "Canals and straits pair with what they connect.",
        pairs: [
          ["Suez Canal", "the Mediterranean and Red Seas"], ["Panama Canal", "the Atlantic and Pacific Oceans"], ["Bering Strait", "Asia and North America"],
          ["Strait of Gibraltar", "the Mediterranean and the Atlantic Ocean"], ["Hormuz Strait", "the Persian Gulf and the Gulf of Oman"]
        ],
        trick: "Suez=Mediterranean-Red, Panama=Atlantic-Pacific, Gibraltar=Mediterranean-Atlantic.",
        tip: "Panama (ocean-ocean) and Suez (sea-sea) functions must never be swapped."
      },
      {
        kind: "tf", name: "world geography",
        note: "True/false stems on world geography.",
        statements: [
          ["Lake Baikal is the deepest lake in the world.", "Lake Victoria is the deepest lake in the world."],
          ["The Suez Canal connects the Mediterranean and Red Seas.", "The Suez Canal connects the Atlantic and Pacific Oceans."],
          ["Angel Falls is the highest waterfall in the world.", "Niagara Falls is the highest waterfall in the world."],
          ["The Bering Strait separates Asia and North America.", "The Strait of Malacca separates Asia and North America."],
          ["The Amazon is the largest river by discharge.", "The Nile is the largest river by discharge."]
        ],
        trick: "Baikal deepest, Suez=Med-Red, Panama=Atlantic-Pacific, Amazon biggest discharge.",
        tip: "Canal-function swaps (Suez vs Panama) are the standard false pattern."
      }
    ],

    "World Numerics": [
      {
        kind: "numeric", name: "currency conversions", difficulty: "easy",
        note: "Foreign price × exchange rate gives the price in rupees.",
        q: (v) => `One ${v.cur} buys Rs ${v.r} in Pakistan. What is the rupee price of an item costing ${v.price} ${v.cur}?`,
        a: (v) => `Rs ${Math.round(v.price * v.r).toLocaleString()}`,
        e: (v) => `Rupee price = ${v.price} × Rs ${v.r} = Rs ${Math.round(v.price * v.r).toLocaleString()}, because each unit of foreign currency converts at the stated rate.`,
        distract: (v) => {
          const c = Math.round(v.price * v.r);
          return [`Rs ${Math.round(v.price / v.r).toLocaleString()}`, `Rs ${Math.round(c * 1.1).toLocaleString()}`, `Rs ${Math.round(c * 0.9).toLocaleString()}`, `Rs ${(c + 1000).toLocaleString()}`, `Rs ${(c * 2).toLocaleString()}`];
        },
        vals: (rng) => ({ cur: ["euro", "pound", "dinar", "riyal"][Math.floor(rng() * 4)], r: 280 + Math.floor(rng() * 60), price: 10 + Math.floor(rng() * 240) }),
        whyWrong: (v) => [`Multiply the price by the exchange rate; dividing converts the other direction.`],
        trick: "Foreign → rupees: multiply by the rate.",
        tip: "The rupee amount must be far larger than the foreign amount."
      },
      {
        kind: "numeric", name: "time zone calculations", difficulty: "medium",
        note: "Pakistan is UTC+5; each hour of longitude zone shifts clock time by one hour.",
        q: (v) => `It is ${v.h}:${v.m} ${v.ap} in Pakistan (UTC+5). What time is it in a city at UTC${v.off > 0 ? "+" : ""}${v.off}?`,
        a: (v) => `${v.ans}`,
        e: (v) => `The UTC offset differs by ${Math.abs(5 - v.off)} hours: ${v.raw} UTC${v.off > 0 ? "+" : ""}${v.off} is ${v.ans}, because each offset hour shifts the clock by 60 minutes.`,
        distract: (v) => [`${v.ansMinus}`, `${v.ansPlus}`, `${v.h}:${v.m} ${v.ap}`, `${v.ansHalf}`, `${v.ans2}`],
        vals: (rng) => {
          const off = [-8, -5, 0, 1, 2, 9][Math.floor(rng() * 6)];
          const h = 6 + Math.floor(rng() * 12);
          const m = [0, 15, 30, 45][Math.floor(rng() * 4)];
          const ap = h < 12 ? "AM" : "PM";
          const utcH = (h - 5 + 24) % 24;
          const destH = (utcH + off + 24) % 24;
          const destM = m;
          const ans = `${destH % 12 === 0 ? 12 : destH % 12}:${String(destM).padStart(2, "0")} ${destH < 12 ? "AM" : "PM"}`;
          const ansMinus = `${((destH - 1 + 24) % 24) % 12 === 0 ? 12 : ((destH - 1 + 24) % 24) % 12}:${String(destM).padStart(2, "0")} ${((destH - 1 + 24) % 24) < 12 ? "AM" : "PM"}`;
          const ansPlus = `${((destH + 1) % 24) % 12 === 0 ? 12 : ((destH + 1) % 24) % 12}:${String(destM).padStart(2, "0")} ${((destH + 1) % 24) < 12 ? "AM" : "PM"}`;
          const ansHalf = `${destH % 12 === 0 ? 12 : destH % 12}:${String((destM + 30) % 60).padStart(2, "0")} ${destH < 12 ? "AM" : "PM"}`;
          return { h, m, ap, off, raw: `${h}:${String(m).padStart(2, "0")} ${ap}`, ans, ansMinus, ansPlus, ansHalf, ans2: `${destH % 12 === 0 ? 12 : destH % 12}:${String(destM).padStart(2, "0")} ${destH < 12 ? "PM" : "AM"}` };
        },
        whyWrong: (v) => [`Convert Pakistan time to UTC (subtract 5) then apply the destination offset; shifting the wrong direction changes the answer.`],
        trick: "Pakistan UTC+5 → UTC (minus 5) → destination offset.",
        tip: "East of Pakistan = later time; west = earlier."
      },
      {
        kind: "numeric", name: "distance conversions", difficulty: "easy",
        note: "1 mile = 1.609 km; 1 km = 0.621 miles.",
        q: (v) => `A marathon course is ${v.mi} miles long. What is the length in kilometres?`,
        a: (v) => `${(v.mi * 1.609).toFixed(1)} km`,
        e: (v) => `Kilometres = miles × 1.609 = ${v.mi} × 1.609 = ${(v.mi * 1.609).toFixed(1)} km, because one mile equals 1.609 kilometres.`,
        distract: (v) => {
          const c = v.mi * 1.609;
          return [`${(v.mi / 1.609).toFixed(1)} km`, `${(c * 2).toFixed(1)} km`, `${(c * 0.5).toFixed(1)} km`, `${(c + 1).toFixed(1)} km`, `${(v.mi * 1000).toFixed(0)} km`];
        },
        vals: (rng) => ({ mi: 5 + Math.floor(rng() * 25) }),
        whyWrong: (v) => [`Multiply miles by 1.609 for kilometres; dividing converts the opposite way.`],
        trick: "Miles × 1.609 = km; km × 0.621 = miles.",
        tip: "A full marathon is 26.2 miles ≈ 42.2 km."
      },
      {
        kind: "numeric", name: "world population shares", difficulty: "hard",
        note: "Continent share = continent population ÷ world population × 100.",
        q: (v) => `World population is about ${v.w} billion and a continent has ${v.c} billion people. What share of the world population does the continent hold?`,
        a: (v) => `${(v.c / v.w * 100).toFixed(1)}%`,
        e: (v) => `Share = ${v.c} ÷ ${v.w} × 100 = ${(v.c / v.w * 100).toFixed(1)}%, because the share compares the continent's people to the world total.`,
        distract: (v) => {
          const c = v.c / v.w * 100;
          return [`${(c * 2).toFixed(1)}%`, `${(v.w / v.c * 100).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 1).toFixed(1)}%`];
        },
        vals: (rng) => {
          const w = 8 + Math.floor(rng() * 2);
          const c = Math.round((0.5 + rng() * 1.5) * 10) / 10;
          return { w, c: Math.min(c, w - 3) };
        },
        whyWrong: (v) => [`The share divides the continent by the world total; inverting the fraction gives a nonsensical percentage.`],
        trick: "Share % = part ÷ whole × 100.",
        tip: "Asia holds about 59% of humanity — the anchor figure."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
