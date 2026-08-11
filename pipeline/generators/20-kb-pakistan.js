/* ============================================================
   Deep Knowledge KB — Pakistan Affairs
   ~16 topics: geography, rivers, dams, cities, constitution,
   history, personalities, economy.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["pakistan-affairs"],
  chapter: "Pakistan Affairs — Deep Knowledge Bank",
  tags: ["pakistan-affairs", "deep-kb", "geography", "history", "constitution", "economy"],
  topics: {

    "Provinces and Capitals": [
      {
        kind: "pair", a: "province", b: "capital",
        note: "Pakistan has four provinces plus two territories, each with a fixed capital.",
        pairs: [
          ["Punjab", "Lahore"], ["Sindh", "Karachi"], ["Khyber Pakhtunkhwa", "Peshawar"],
          ["Balochistan", "Quetta"], ["Gilgit-Baltistan", "Gilgit"], ["Azad Kashmir", "Muzaffarabad"]
        ],
        trick: "P-L, S-K, K-P, B-Q: Punjab-Lahore, Sindh-Karachi, KP-Peshawar, Balochistan-Quetta.",
        tip: "Capital-matching is the most repeated Pakistan Affairs question type."
      },
      {
        kind: "list", name: "provinces of Pakistan", group: "the four provinces of Pakistan",
        note: "Pakistan comprises four provinces: Punjab, Sindh, Khyber Pakhtunkhwa and Balochistan.",
        items: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan"],
        outsiders: ["Gilgit-Baltistan", "Azad Kashmir", "Islamabad", "FATA"],
        trick: "Four provinces; Gilgit-Baltistan and Azad Kashmir are territories, not provinces.",
        tip: "'FATA was merged into Khyber Pakhtunkhwa in 2018' is a modern exam fact."
      },
      {
        kind: "fact", name: "territories of Pakistan",
        note: "The federal capital and both territories complete the administrative map.",
        facts: [
          ["What is the capital city of Pakistan?", "Islamabad", "Islamabad became the capital of Pakistan in the 1960s, replacing Karachi, because of its central and defensible location."],
          ["Which city served as Pakistan's first capital?", "Karachi", "Karachi was the first capital of Pakistan from 1947 until the seat of government moved to Islamabad."],
          ["Which province was formerly known as North-West Frontier Province?", "Khyber Pakhtunkhwa", "The NWFP was renamed Khyber Pakhtunkhwa in 2010 under the 18th Amendment."],
          ["Which region is the largest province by area?", "Balochistan", "Balochistan covers about 44% of Pakistan's land area, making it the largest province despite its small population."],
          ["Which province is the most populous?", "Punjab", "Punjab holds more than half of Pakistan's population and is the agricultural heartland of the country."],
          ["Which region was renamed after a 2010 constitutional amendment?", "Khyber Pakhtunkhwa", "The 18th Amendment renamed NWFP to Khyber Pakhtunkhwa, a long-standing demand of the province's Pashtun population."],
          ["Which territory was granted provisional provincial status in 2020?", "Gilgit-Baltistan", "Gilgit-Baltistan received provisional provincial status under a 2020 government initiative, though full provincial status still awaits legislation."],
          ["What does the 'P' in the new province name 'South Punjab' proposals refer to?", "A proposed province of Punjab's southern districts", "Political proposals to carve a South Punjab province from the southern districts of Punjab remain a recurring constitutional debate."]
        ],
        trick: "Islamabad = capital (1960s), Karachi = first capital, Balochistan = largest, Punjab = most populous.",
        tip: "'First capital Karachi, current capital Islamabad' is the classic one-liner."
      },
      {
        kind: "tf", name: "provinces and capitals",
        note: "True/false stems on the provinces, capitals and territories of Pakistan.",
        statements: [
          ["Lahore is the capital of Punjab.", "Lahore is the capital of Sindh."],
          ["Quetta is the capital of Balochistan.", "Quetta is the capital of Khyber Pakhtunkhwa."],
          ["Karachi was Pakistan's first capital.", "Islamabad was Pakistan's first capital."],
          ["Balochistan is the largest province by area.", "Sindh is the largest province by area."],
          ["Khyber Pakhtunkhwa was formerly the North-West Frontier Province.", "Punjab was formerly the North-West Frontier Province."]
        ],
        trick: "Capital traps swap provinces; 'largest' traps swap Balochistan with another province.",
        tip: "Any statement pairing a city with the wrong province is false."
      }
    ],

    "Rivers and Dams": [
      {
        kind: "pair", a: "river", b: "location feature",
        note: "The Indus system and its tributaries are the backbone of Pakistan's geography.",
        pairs: [
          ["Indus", "the longest river flowing through Pakistan"], ["Jhelum", "river on which Mangla Dam is built"],
          ["Chenab", "the largest tributary of the Indus in terms of flow"], ["Ravi", "river flowing through Lahore"],
          ["Sutlej", "the easternmost tributary of the Indus system"], ["Kabul", "the major river joining the Indus from the west"]
        ],
        trick: "Mangla = Jhelum, Tarbela = Indus, Lahore = Ravi, west = Kabul.",
        tip: "Dam↔river matching (Mangla-Jhelum, Tarbela-Indus) is a guaranteed question."
      },
      {
        kind: "list", name: "rivers of Pakistan", group: "the major rivers of the Indus system in Pakistan",
        note: "Indus, Jhelum, Chenab, Ravi, Sutlej, Beas and Kabul are the major rivers of Pakistan.",
        items: ["Indus", "Jhelum", "Chenab", "Ravi", "Sutlej", "Kabul"],
        outsiders: ["Ganges", "Brahmaputra", "Nile", "Yamuna", "Godavari", "Tigris"],
        trick: "All Indus-system rivers are in Pakistan; Ganges and Brahmaputra belong to India.",
        tip: "'Ravi flows through Lahore' makes it the most locally known river."
      },
      {
        kind: "pair", a: "dam", b: "river",
        note: "Pakistan's major dams are each built on a specific river.",
        pairs: [
          ["Tarbela Dam", "Indus"], ["Mangla Dam", "Jhelum"], ["Warsak Dam", "Kabul"], ["Khanpur Dam", "Haro"], ["Diamer-Bhasha Dam", "Indus"]
        ],
        trick: "Tarbela and Bhasha = Indus; Mangla = Jhelum; Warsak = Kabul.",
        tip: "Tarbela (largest) and Mangla (second largest) are the two most asked dams."
      },
      {
        kind: "fact", name: "dams and water",
        note: "Key facts about Pakistan's water infrastructure are standard exam items.",
        facts: [
          ["Which is the largest dam in Pakistan?", "Tarbela", "Tarbela Dam on the Indus near Haripur is Pakistan's largest dam and one of the largest earth-filled dams in the world."],
          ["Which is the second largest dam of Pakistan?", "Mangla", "Mangla Dam on the Jhelum river in Mirpur is the second largest dam and a pillar of irrigation in Punjab."],
          ["Which dam is being built on the Indus in Gilgit-Baltistan?", "Diamer-Bhasha", "Diamer-Bhasha Dam is under construction on the Indus in Diamer district, designed to add major storage and power capacity."],
          ["Which dam is located on the Kabul river near Peshawar?", "Warsak", "Warsak Dam on the Kabul river supplies power and irrigation to the Peshawar valley."],
          ["Which is the world's largest earth-filled dam, built in Pakistan?", "Tarbela", "Tarbela is among the world's largest earth-filled dams by volume of fill, a fact celebrated in every geography paper."],
          ["Which river is called the 'lifeline of Pakistan'?", "Indus", "The Indus sustains the world's largest contiguous irrigation system, earning it the title lifeline of Pakistan."]
        ],
        trick: "Tarbela = largest + Indus; Mangla = 2nd + Jhelum; Bhasha = new + Indus; Warsak = Kabul.",
        tip: "'Tarbela is on the Indus' and 'Mangla on the Jhelum' are the two anchor facts."
      }
    ],

    "Major Cities": [
      {
        kind: "pair", a: "city", b: "known as or famous for",
        note: "Pakistani cities carry famous titles that exams repeatedly test.",
        pairs: [
          ["Karachi", "the city of lights and financial hub"], ["Lahore", "the heart of Pakistan and city of gardens"],
          ["Peshawar", "the city of flowers"], ["Quetta", "the fruit basket of Pakistan"], ["Multan", "the city of saints"],
          ["Faisalabad", "the Manchester of Pakistan"], ["Sialkot", "the sports goods capital of Pakistan"], ["Hyderabad", "the city of pearls"]
        ],
        trick: "Manchester = Faisalabad, flowers = Peshawar, saints = Multan, pearls = Hyderabad, fruit = Quetta.",
        tip: "'Manchester of Pakistan = Faisalabad' is the most famous city-title pair."
      },
      {
        kind: "fact", name: "major cities",
        note: "Location and landmark facts about Pakistan's major cities.",
        facts: [
          ["Which is the largest city of Pakistan by population?", "Karachi", "Karachi, the provincial capital of Sindh and the country's financial hub, is Pakistan's most populous city."],
          ["Which city is the industrial capital of Pakistan?", "Karachi", "Karachi hosts the bulk of Pakistan's industry, ports and banking, making it the industrial capital."],
          ["Which city is known as the 'Manchester of Pakistan'?", "Faisalabad", "Faisalabad, a textile manufacturing powerhouse, earned the title Manchester of Pakistan for its industrial output."],
          ["Which city is famous for the Badshahi Mosque and Lahore Fort?", "Lahore", "Lahore's Badshahi Mosque and Lahore Fort are Mughal-era landmarks that define the cultural capital."],
          ["Which city is called the 'city of saints'?", "Multan", "Multan, home to several Sufi shrines including Shah Rukn-e-Alam, is called the city of saints."],
          ["Which city is known for the world's largest football manufacturing cluster?", "Sialkot", "Sialkot produces a large share of the world's hand-stitched footballs and is a global sports-goods hub."],
          ["Which city is the gateway to the Khyber Pass?", "Peshawar", "Peshawar, capital of Khyber Pakhtunkhwa, guards the historic Khyber Pass into Afghanistan."],
          ["Which city is the capital of Balochistan and a fruit market centre?", "Quetta", "Quetta, capital of Balochistan, is called the fruit basket of Pakistan for its orchards."]
        ],
        trick: "Largest = Karachi, Manchester = Faisalabad, saints = Multan, flowers = Peshawar, fruit = Quetta.",
        tip: "City-titles (Manchester, City of Saints, City of Flowers) are one-mark staples."
      },
      {
        kind: "tf", name: "cities of Pakistan",
        note: "True/false stems on city titles and landmarks.",
        statements: [
          ["Faisalabad is called the Manchester of Pakistan.", "Multan is called the Manchester of Pakistan."],
          ["Karachi is Pakistan's largest city by population.", "Islamabad is Pakistan's largest city by population."],
          ["Multan is known as the city of saints.", "Karachi is known as the city of saints."],
          ["The Badshahi Mosque is located in Lahore.", "The Badshahi Mosque is located in Peshawar."],
          ["Quetta is the capital of Balochistan.", "Quetta is the capital of Sindh."]
        ],
        trick: "Title swaps are always false: Manchester = Faisalabad only.",
        tip: "Landmark-city pairs (Badshahi-Lahore) are easy marks if learned."
      }
    ],

    "Mountains and Passes": [
      {
        kind: "pair", a: "peak", b: "location",
        note: "Pakistan hosts some of the world's highest peaks, each in a specific range.",
        pairs: [
          ["K2", "Karakoram range"], ["Nanga Parbat", "Western Himalayas"], ["Rakaposhi", "Karakoram range"],
          ["Broad Peak", "Karakoram range"], ["Tirich Mir", "Hindu Kush range"]
        ],
        trick: "K2 and Rakaposhi = Karakoram; Nanga Parbat = Himalayas; Tirich Mir = Hindu Kush.",
        tip: "K2 ↔ Karakoram is the most asked peak-range pair."
      },
      {
        kind: "fact", name: "mountains and passes",
        note: "Facts about Pakistan's peaks and passes are core geography exam content.",
        facts: [
          ["Which is the highest peak of Pakistan and second highest in the world?", "K2", "K2 (8,611 m) in the Karakoram is the world's second highest peak after Everest and the highest in Pakistan."],
          ["In which mountain range is K2 located?", "Karakoram", "K2 rises in the Karakoram range on the Pakistan-China border, a region of extreme glaciers."],
          ["Which peak is nicknamed the 'Killer Mountain'?", "Nanga Parbat", "Nanga Parbat earned the title Killer Mountain because of its high fatality rate among early climbers."],
          ["Which is the highest peak of the Hindu Kush range in Pakistan?", "Tirich Mir", "Tirich Mir (7,708 m) in Chitral is the highest peak of the Hindu Kush range."],
          ["Which is the highest peak of the Himalayas located in Pakistan?", "Nanga Parbat", "Nanga Parbat (8,126 m) is Pakistan's Himalayan giant, the ninth highest mountain in the world."],
          ["Which famous pass connects Pakistan with Afghanistan?", "Khyber Pass", "The Khyber Pass links Peshawar with Kabul and has been a historic invasion route for centuries."],
          ["Which pass connects Pakistan with China?", "Khunjerab Pass", "The Khunjerab Pass (4,693 m) on the Karakoram Highway is the highest paved border crossing between Pakistan and China."],
          ["Which is the highest paved international border crossing in the world?", "Khunjerab Pass", "Khunjerab Pass, at about 4,693 metres, is the world's highest paved international border crossing."],
          ["Which pass connects Gilgit-Baltistan with Chitral?", "Shandur Pass", "The Shandur Pass links Gilgit-Baltistan with Chitral and hosts the famous annual polo festival on the highest polo ground."]
        ],
        trick: "K2 = Karakoram + 2nd world; Nanga Parbat = Killer Mountain; Tirich Mir = Hindu Kush; Khunjerab = China.",
        tip: "'Khyber = Afghanistan, Khunjerab = China' is the pass pair never to mix."
      },
      {
        kind: "tf", name: "mountains of Pakistan",
        note: "True/false stems on Pakistan's peaks and ranges.",
        statements: [
          ["K2 is the second highest peak in the world.", "K2 is the highest peak in the world."],
          ["Nanga Parbat is called the Killer Mountain.", "K2 is called the Killer Mountain."],
          ["Tirich Mir is the highest peak of the Hindu Kush.", "Rakaposhi is the highest peak of the Hindu Kush."],
          ["The Khunjerab Pass connects Pakistan with China.", "The Khyber Pass connects Pakistan with China."],
          ["K2 is located in the Karakoram range.", "K2 is located in the Hindu Kush range."]
        ],
        trick: "Killer = Nanga Parbat, China = Khunjerab, Karakoram = K2.",
        tip: "Range, title and country-link must all match for the statement to be true."
      }
    ],

    "Constitution of Pakistan": [
      {
        kind: "order", name: "the constitutions of Pakistan in historical order",
        note: "Pakistan adopted constitutions in 1956, 1962, 1973; earlier governments used the Government of India Act 1935.",
        ordered: ["Government of India Act 1935 (interim)", "Constitution of 1956", "Constitution of 1962", "Constitution of 1973"],
        trick: "1935 → 1956 → 1962 → 1973; the 1973 constitution remains in force.",
        tip: "1956 was the first, 1973 the current — the two anchor dates."
      },
      {
        kind: "fact", name: "constitutional history",
        note: "The adoption of each constitution and its key features are fundamental facts.",
        facts: [
          ["When was the first constitution of Pakistan adopted?", "1956", "Pakistan's first constitution was adopted on 23 March 1956, after nine years of delay and drafting."],
          ["Who drafted the first constitution of Pakistan?", "The Constituent Assembly", "The first Constituent Assembly, under its drafting committees, produced Pakistan's first constitution in 1956."],
          ["Which constitution declared Pakistan an Islamic Republic first?", "The 1956 Constitution", "The 1956 Constitution formally named Pakistan the Islamic Republic of Pakistan for the first time."],
          ["Which constitution was abrogated by Ayub Khan?", "The 1956 Constitution", "Ayub Khan abrogated the 1956 Constitution in 1958 after the first martial law was imposed."],
          ["Which constitution introduced the presidential system?", "The 1962 Constitution", "The 1962 Constitution, introduced under Ayub Khan, replaced the parliamentary system with a presidential one."],
          ["When was the current constitution of Pakistan adopted?", "1973", "The 1973 Constitution, framed under Zulfikar Ali Bhutto, was adopted on 14 August 1973 and remains in force."],
          ["Which constitution restored the parliamentary system in Pakistan?", "The 1973 Constitution", "The 1973 Constitution restored the parliamentary form of government with the Prime Minister as head of government."],
          ["What is the 18th Amendment famous for?", "Devolving powers to provinces", "The 18th Amendment (2010) devolved 17 ministries to provinces and abolished the concurrent list, reshaping federal-provincial relations."],
          ["How many articles does the 1973 Constitution contain?", "280", "The 1973 Constitution comprises 280 articles, several schedules and an original preamble, though amendments have added provisions."],
          ["Who was the first President of Pakistan?", "Iskander Mirza", "Iskander Mirza became Pakistan's first president in 1956 after the first constitution converted the governor-general's office."]
        ],
        trick: "1956 first + Islamic Republic, 1962 presidential, 1973 current + parliamentary.",
        tip: "'First constitution 1956, current 1973, 18th Amendment 2010' is the three-fact combo."
      },
      {
        kind: "tf", name: "constitutional facts",
        note: "True/false stems on Pakistan's constitutional milestones.",
        statements: [
          ["Pakistan's first constitution was adopted in 1956.", "Pakistan's first constitution was adopted in 1949."],
          ["The 1962 Constitution introduced a presidential system.", "The 1956 Constitution introduced a presidential system."],
          ["The 1973 Constitution is the current constitution of Pakistan.", "The 1962 Constitution is the current constitution of Pakistan."],
          ["The 18th Amendment devolved powers to the provinces.", "The 18th Amendment centralised powers in the centre."],
          ["The 1956 Constitution declared Pakistan an Islamic Republic.", "The 1935 Act declared Pakistan an Islamic Republic."]
        ],
        trick: "Dates 56/62/73 and 'presidential=62, parliamentary=73' are the anchors.",
        tip: "Every statement mixing year↔feature combinations is false."
      }
    ],

    "Independence Movement": [
      {
        kind: "order", name: "the chronology of the Pakistan movement",
        note: "The movement's milestones run: 1906 Muslim League, 1916 Lucknow Pact, 1940 Pakistan Resolution, 1947 independence.",
        ordered: ["All-India Muslim League founded (1906)", "Lucknow Pact (1916)", "Pakistan Resolution (1940)", "Independence of Pakistan (1947)"],
        trick: "1906 league, 1916 pact, 1940 resolution, 1947 freedom.",
        tip: "1940 Pakistan Resolution (23 March) and 1947 independence (14 August) are the anchors."
      },
      {
        kind: "pair", a: "year", b: "event",
        note: "Year-event pairs of the independence movement are high-yield exam facts.",
        pairs: [
          ["1906", "All-India Muslim League founded at Dacca"], ["1909", "Minto-Morley Reforms"], ["1916", "Lucknow Pact"],
          ["1919", "Montagu-Chelmsford Reforms and Rowlatt Act"], ["1929", "Jinnah's Fourteen Points"],
          ["1930", "Allahabad Address of Allama Iqbal"], ["1940", "Pakistan Resolution at Lahore"], ["1947", "Independence of Pakistan"]
        ],
        trick: "1906 League, 1929 Fourteen Points, 1930 Allahabad, 1940 Resolution, 1947 independence.",
        tip: "Year↔event matching is the single most repeated Pakistan movement question."
      },
      {
        kind: "fact", name: "the Pakistan movement",
        note: "Key personalities and events of the freedom movement.",
        facts: [
          ["Who founded the All-India Muslim League?", "Aga Khan III and Nawab Salimullah", "The Muslim League was founded in 1906 at Dacca, with Aga Khan III as first president and Salimullah hosting the session."],
          ["Who gave the Fourteen Points in 1929?", "Quaid-e-Azam Muhammad Ali Jinnah", "Jinnah presented his Fourteen Points in 1929 in response to the Nehru Report, safeguarding Muslim rights."],
          ["Who delivered the Allahabad Address in 1930?", "Allama Iqbal", "Iqbal's Allahabad Address proposed a separate homeland for Muslims in the north-west of India."],
          ["Where was the Pakistan Resolution passed in 1940?", "Lahore", "The Pakistan Resolution was passed at the Muslim League session in Lahore on 23 March 1940, now celebrated as Pakistan Day."],
          ["Who moved the Pakistan Resolution in 1940?", "A. K. Fazlul Huq", "A. K. Fazlul Huq, premier of Bengal, moved the historic resolution at the Lahore session in 1940."],
          ["When did Pakistan gain independence?", "14 August 1947", "Pakistan emerged as an independent state on 14 August 1947, with the Radcliffe Line dividing Punjab and Bengal."],
          ["Who was the first Governor-General of Pakistan?", "Muhammad Ali Jinnah", "Jinnah served as Pakistan's first Governor-General from August 1947 until his death in September 1948."],
          ["Who was the first Prime Minister of Pakistan?", "Liaquat Ali Khan", "Liaquat Ali Khan became the first Prime Minister in 1947 and was assassinated in 1951 in Rawalpindi."],
          ["Who is called the 'Father of the Nation' of Pakistan?", "Muhammad Ali Jinnah", "Jinnah is honoured as the Father of the Nation for leading the movement that created Pakistan."],
          ["Who is known as the 'Poet of the East'?", "Allama Iqbal", "Allama Iqbal, whose poetry inspired Muslim nationalism, is titled the Poet of the East (Shair-e-Mashriq)."]
        ],
        trick: "Jinnah = Father of the Nation + first Governor-General; Liaquat = first PM; Iqbal = Poet of the East.",
        tip: "'First Governor-General Jinnah, first PM Liaquat' is the classic double question."
      },
      {
        kind: "tf", name: "independence movement facts",
        note: "True/false stems on the people and events of the freedom struggle.",
        statements: [
          ["The Muslim League was founded in 1906 at Dacca.", "The Muslim League was founded in 1940 at Lahore."],
          ["Jinnah presented the Fourteen Points in 1929.", "Iqbal presented the Fourteen Points in 1929."],
          ["The Pakistan Resolution was passed in Lahore in 1940.", "The Pakistan Resolution was passed in Karachi in 1940."],
          ["Jinnah was the first Governor-General of Pakistan.", "Jinnah was the first Prime Minister of Pakistan."],
          ["Liaquat Ali Khan was the first Prime Minister of Pakistan.", "Liaquat Ali Khan was the first President of Pakistan."]
        ],
        trick: "Jinnah = Governor-General, Liaquat = PM — never swap the two offices.",
        tip: "Office-titled statements (GG vs PM) are the highest-yield trap."
      }
    ],

    "Post-Independence History": [
      {
        kind: "pair", a: "leader", b: "known for",
        note: "Post-1947 leaders are paired with their landmark actions.",
        pairs: [
          ["Ayub Khan", "martial law and the 1962 Constitution"], ["Yahya Khan", "the 1970 elections and 1971 dismemberment"],
          ["Zulfikar Ali Bhutto", "the 1973 Constitution and nuclear programme"], ["Zia-ul-Haq", "Islamisation and martial law 1977"],
          ["Benazir Bhutto", "the first female PM of Pakistan"], ["Nawaz Sharif", "three terms as Prime Minister"]
        ],
        trick: "Ayub = 62 constitution, Bhutto = 73 constitution, Benazir = first female PM.",
        tip: "'Benazir Bhutto, first female PM' is the most famous leadership fact."
      },
      {
        kind: "fact", name: "modern political history",
        note: "Key political milestones after independence.",
        facts: [
          ["Who imposed the first martial law in Pakistan?", "Ayub Khan", "Ayub Khan imposed the first martial law in October 1958, abrogating the 1956 Constitution."],
          ["When did East Pakistan separate to become Bangladesh?", "1971", "East Pakistan became independent Bangladesh in December 1971 after the civil war and Indian military intervention."],
          ["Which war led to the creation of Bangladesh?", "The 1971 war", "The 1971 Indo-Pak war ended with the surrender at Dhaka and the birth of Bangladesh."],
          ["Who was the first female Prime Minister of Pakistan?", "Benazir Bhutto", "Benazir Bhutto became the first female Prime Minister of Pakistan in 1988, and the first in the Muslim world."],
          ["When was Pakistan declared a nuclear power?", "28 May 1998", "Pakistan conducted nuclear tests at Chagai on 28 May 1998, responding to India's May 1998 tests."],
          ["Which leader conducted the 1998 nuclear tests?", "Nawaz Sharif", "Prime Minister Nawaz Sharif oversaw the Chagai nuclear tests on 28 May 1998."],
          ["Who was Pakistan's first civilian directly-elected president?", "Muhammad Ayub Khan (indirectly) — the first directly elected was Pervez Musharraf's 2002 referendum", "Constitutional history records Ayub as first (indirect) elected president under the 1962 system; direct presidential elections came later."],
          ["In which year was Pakistan's current capital inaugurated?", "1966", "Islamabad was formally inaugurated as the capital in 1966 after construction through the 1960s."]
        ],
        trick: "1971 = Bangladesh, 1998 = nuclear, 1988 = Benazir PM, 1958 = first martial law.",
        tip: "The 'firsts' (martial law, female PM, nuclear power) dominate the modern history paper."
      },
      {
        kind: "tf", name: "modern history facts",
        note: "True/false stems on post-independence history.",
        statements: [
          ["East Pakistan separated and became Bangladesh in 1971.", "East Pakistan separated and became Bangladesh in 1965."],
          ["Pakistan conducted nuclear tests on 28 May 1998.", "Pakistan conducted nuclear tests on 14 August 1971."],
          ["Benazir Bhutto was Pakistan's first female Prime Minister.", "Benazir Bhutto was Pakistan's first female President."],
          ["Ayub Khan imposed the first martial law in 1958.", "Liaquat Ali Khan imposed the first martial law in 1958."],
          ["The 1973 Constitution was adopted under Zulfikar Ali Bhutto.", "The 1973 Constitution was adopted under Ayub Khan."]
        ],
        trick: "1971 Bangladesh, 1998 nuclear, 1988 Benazir, 1958 Ayub — the four anchors.",
        tip: "Any statement pairing a leader with the wrong action is false."
      }
    ],

    "Government and Institutions": [
      {
        kind: "pair", a: "institution", b: "role",
        note: "Pakistan's key state institutions have fixed constitutional roles.",
        pairs: [
          ["Supreme Court", "the apex court of the judiciary"], ["National Assembly", "the lower house of parliament"],
          ["Senate", "the upper house of parliament"], ["Election Commission", "conducting free and fair elections"],
          ["NADRA", "issuing national identity cards"], ["SBP", "the central bank regulating monetary policy"]
        ],
        trick: "Senate = upper, NA = lower, Supreme Court = apex, SBP = central bank.",
        tip: "Upper/lower house and apex court are the institutional one-liners."
      },
      {
        kind: "fact", name: "state institutions",
        note: "Facts about the structure of Pakistan's government.",
        facts: [
          ["How many members sit in Pakistan's National Assembly?", "336", "The National Assembly has 336 seats: 266 general, 60 women and 10 minority, after the 25th Amendment merged FATA."],
          ["How many senators does Pakistan's Senate have?", "96", "The Senate has 96 members, equally divided among the provinces with additional seats for territories and technocrats."],
          ["Who is the head of state of Pakistan?", "The President", "The President of Pakistan is the constitutional head of state, while the Prime Minister heads the executive."],
          ["Who is the head of government of Pakistan?", "The Prime Minister", "The Prime Minister, leader of the parliamentary majority, heads the federal government."],
          ["Which body conducts elections in Pakistan?", "The Election Commission of Pakistan", "The Election Commission of Pakistan organises national, provincial and local elections under the Constitution."],
          ["Which institution issues CNICs to citizens?", "NADRA", "NADRA, the National Database and Registration Authority, issues Computerised National Identity Cards."],
          ["Which body is the apex court of Pakistan?", "The Supreme Court", "The Supreme Court is the highest judicial authority, hearing constitutional appeals and original jurisdiction cases."],
          ["What is the minimum voting age in Pakistan?", "18", "Citizens of 18 years and above are eligible to vote in Pakistan, as fixed by the electoral laws."]
        ],
        trick: "336 NA, 96 Senate, President = head of state, PM = head of government.",
        tip: "NA 336 and Senate 96 are the two number facts worth memorising."
      },
      {
        kind: "tf", name: "institutions of Pakistan",
        note: "True/false stems on the branches and bodies of the state.",
        statements: [
          ["The Senate is the upper house of Pakistan's parliament.", "The National Assembly is the upper house of Pakistan's parliament."],
          ["The Supreme Court is the apex court of Pakistan.", "The High Court is the apex court of Pakistan."],
          ["NADRA issues national identity cards.", "SBP issues national identity cards."],
          ["The President is the head of state.", "The Prime Minister is the head of state."],
          ["The Election Commission conducts elections in Pakistan.", "The Armed Forces conduct elections in Pakistan."]
        ],
        trick: "Upper = Senate, apex = Supreme Court, CNIC = NADRA, head of state = President.",
        tip: "Institutional role-swaps are always false; learn one role per body."
      }
    ],

    "Economy of Pakistan": [
      {
        kind: "pair", a: "crop", b: "usage or region",
        note: "Pakistan's major crops define its agrarian economy.",
        pairs: [
          ["Wheat", "the staple food grain of Pakistan"], ["Cotton", "the raw material of the textile industry"], ["Rice", "a major export especially Basmati"],
          ["Sugarcane", "the source of sugar and gur"], ["Maize", "grown widely in Khyber Pakhtunkhwa"], ["Mango", "called the king of fruits"]
        ],
        trick: "Cotton = textile, Basmati = rice export, mango = king of fruits.",
        tip: "'Cotton drives textiles' and 'Basmati rice is a top export' are economy staples."
      },
      {
        kind: "fact", name: "economy basics",
        note: "Facts about Pakistan's economy, agriculture and industry.",
        facts: [
          ["Which sector is the largest employer in Pakistan?", "Agriculture", "Agriculture employs roughly a third to two-fifths of Pakistan's workforce, making it the largest employer."],
          ["Which is Pakistan's main cash crop?", "Cotton", "Cotton is Pakistan's main cash crop and feeds the textile industry, the country's largest industrial export sector."],
          ["What is Pakistan's central bank called?", "State Bank of Pakistan", "The State Bank of Pakistan, founded in 1948, issues currency and conducts monetary policy."],
          ["Which is Pakistan's largest trading partner?", "China", "China is Pakistan's largest trading partner and the anchor of the CPEC corridor projects."],
          ["What does CPEC stand for?", "China-Pakistan Economic Corridor", "CPEC is a flagship corridor of the Belt and Road Initiative linking Gwadar port with China via roads and energy projects."],
          ["Which port is central to the CPEC project?", "Gwadar", "Gwadar deep-sea port in Balochistan is the southern anchor of CPEC, managed under a long-term Chinese concession."],
          ["What is the currency of Pakistan?", "Pakistani rupee", "The Pakistani rupee (PKR) is the official currency, issued by the State Bank of Pakistan."],
          ["Which is the largest source of foreign exchange for Pakistan?", "Remittances from overseas Pakistanis", "Worker remittances, mainly from the Gulf, are the largest and steadiest source of foreign exchange earnings."],
          ["Which organisation manages Pakistan's international financial relations?", "The Ministry of Finance with the SBP", "The Finance Ministry and State Bank jointly negotiate international financing, including with the IMF."],
          ["Which sector is Pakistan's largest industrial export earner?", "Textiles", "Textile products, especially yarn and garments, account for the largest share of Pakistan's exports."]
        ],
        trick: "Cotton = cash crop, SBP = central bank, Gwadar = CPEC port, remittances = top FX source.",
        tip: "CPEC-Gwadar and 'cotton-textile' links are the two highest-yield economy facts."
      },
      {
        kind: "tf", name: "economy facts",
        note: "True/false stems on Pakistan's economic fundamentals.",
        statements: [
          ["Cotton is Pakistan's main cash crop.", "Wheat is Pakistan's main cash crop."],
          ["The State Bank of Pakistan is the central bank.", "NADRA is the central bank."],
          ["Gwadar is a key port of the CPEC project.", "Keti Bandar is a key port of the CPEC project."],
          ["Textiles are Pakistan's largest industrial export.", "Automobiles are Pakistan's largest industrial export."],
          ["The Pakistani rupee is issued by the State Bank.", "The Pakistani rupee is issued by the National Bank."]
        ],
        trick: "Cash crop = cotton, central bank = SBP, CPEC = Gwadar, top export = textiles.",
        tip: "One fact per institution — mispairs are the standard false pattern."
      }
    ],

    "Important National Days and Symbols": [
      {
        kind: "pair", a: "day", b: "date",
        note: "Pakistan's national days are fixed calendar dates.",
        pairs: [
          ["Pakistan Day", "23 March"], ["Independence Day", "14 August"], ["Defence Day", "6 September"],
          ["Air Force Day", "7 September"], ["Kashmir Solidarity Day", "5 February"], ["Quaid-e-Azam Day", "25 December"]
        ],
        trick: "23 March = Pakistan Day, 14 August = Independence, 6 September = Defence, 25 December = Jinnah's birth.",
        tip: "23 March (Resolution) and 14 August (Independence) are the two non-negotiable dates."
      },
      {
        kind: "fact", name: "national symbols",
        note: "The symbols of Pakistan are standard one-mark questions.",
        facts: [
          ["What is the national animal of Pakistan?", "Markhor", "The markhor, a wild goat of the northern mountains, is the national animal of Pakistan."],
          ["What is the national bird of Pakistan?", "Chukar partridge", "The chukar, a striking red-legged partridge, is the national bird of Pakistan."],
          ["What is the national flower of Pakistan?", "Jasmine", "Jasmine (Chambeli), with its white fragrant blossoms, is the national flower of Pakistan."],
          ["What is the national tree of Pakistan?", "Deodar", "The deodar cedar of the northern forests is the national tree of Pakistan."],
          ["What is the national fruit of Pakistan?", "Mango", "The mango, especially the Sindhri and Chaunsa varieties, is the national fruit of Pakistan."],
          ["What is the national sport of Pakistan?", "Field hockey", "Field hockey is the national sport of Pakistan, which has won three Olympic gold medals in it."],
          ["What is the national language of Pakistan?", "Urdu", "Urdu is the national language of Pakistan, while English serves as an official language."],
          ["What do the green and white in the flag of Pakistan represent?", "Muslim majority and minorities", "The green field represents the Muslim majority, the white stripe represents religious minorities."],
          ["What does the crescent and star on the flag symbolise?", "Progress and light", "The crescent represents progress and the star represents light and knowledge on Pakistan's flag."],
          ["What is the national anthem of Pakistan called?", "Qaumi Taranah", "The Qaumi Taranah, composed by Hafeez Jalandhari with music by Ahmed Ghulamali Chagla, was adopted in 1954."]
        ],
        trick: "Markhor animal, chukar bird, jasmine flower, deodar tree, mango fruit, hockey sport.",
        tip: "The six national symbols (animal/bird/flower/tree/fruit/sport) are guaranteed easy marks."
      },
      {
        kind: "tf", name: "national days and symbols",
        note: "True/false stems on Pakistan's national emblems and days.",
        statements: [
          ["Pakistan's national animal is the markhor.", "Pakistan's national animal is the snow leopard."],
          ["The national sport of Pakistan is field hockey.", "The national sport of Pakistan is cricket."],
          ["Pakistan Day is celebrated on 23 March.", "Pakistan Day is celebrated on 14 August."],
          ["Jasmine is the national flower of Pakistan.", "Rose is the national flower of Pakistan."],
          ["The national language of Pakistan is Urdu.", "The national language of Pakistan is Sindhi."]
        ],
        trick: "Markhor, hockey, 23 March, jasmine, Urdu — the five anchors.",
        tip: "Cricket is the tempting wrong answer for national sport."
      }
    ],

    "Educational and Defence Institutions": [
      {
        kind: "pair", a: "institution", b: "location",
        note: "Pakistan's major educational and defence institutions are located in fixed cities.",
        pairs: [
          ["Quaid-e-Azam University", "Islamabad"], ["University of the Punjab", "Lahore"], ["NED University", "Karachi"],
          ["Pakistan Military Academy", "Kakul"], ["Pakistan Naval Academy", "Karachi"], ["Pakistan Air Force Academy", "Risalpur"]
        ],
        trick: "PMA = Kakul, PAF Academy = Risalpur, Naval Academy = Karachi.",
        tip: "Kakul (Army), Risalpur (Air), Karachi (Navy) is the classic trio."
      },
      {
        kind: "fact", name: "defence forces",
        note: "Basic facts about Pakistan's armed forces structure.",
        facts: [
          ["Who is the supreme commander of Pakistan's armed forces?", "The President", "The President is the supreme commander of the armed forces under the Constitution, while the PM heads the government."],
          ["Who is the ceremonial head of the Pakistan Army?", "The Chief of Army Staff", "The Chief of Army Staff commands the Pakistan Army, currently the senior-most serving army officer."],
          ["In which city is the General Headquarters (GHQ) of the Pakistan Army?", "Rawalpindi", "The Army GHQ is located in Rawalpindi, adjoining the federal capital Islamabad."],
          ["In which city is the Pakistan Navy headquarters located?", "Islamabad", "The Naval Headquarters moved to Islamabad, while the main naval base and academy remain in Karachi."],
          ["Where is the Pakistan Air Force Headquarters?", "Islamabad", "The PAF Headquarters is in Islamabad, with major bases at Sargodha, Risalpur and Karachi."],
          ["Which city hosts the Pakistan Military Academy?", "Kakul", "The Pakistan Military Academy at Kakul, near Abbottabad, trains the army's officer cadets."],
          ["What is the highest gallantry award of Pakistan's armed forces?", "Nishan-e-Haider", "Nishan-e-Haider, the highest military decoration, has been awarded posthumously to Pakistan's bravest soldiers."],
          ["Who was the first recipient of the Nishan-e-Haider?", "Captain Raja Muhammad Sarwar", "Captain Raja Muhammad Sarwar received the first Nishan-e-Haider for his sacrifice in the 1948 Kashmir operations."]
        ],
        trick: "GHQ = Rawalpindi, PMA = Kakul, NHQ/PAF HQ = Islamabad, Nishan-e-Haider = top award.",
        tip: "GHQ Rawalpindi vs PMA Kakul is the most common location trap."
      }
    ],

    "Languages and Culture": [
      {
        kind: "pair", a: "language", b: "province or region",
        note: "Each province and region of Pakistan has its own major language.",
        pairs: [
          ["Punjabi", "Punjab"], ["Sindhi", "Sindh"], ["Pashto", "Khyber Pakhtunkhwa"], ["Balochi", "Balochistan"],
          ["Seraiki", "southern Punjab"], ["Shina", "Gilgit-Baltistan"]
        ],
        trick: "Punjabi-Punjab, Sindhi-Sindh, Pashto-KP, Balochi-Balochistan — one-to-one.",
        tip: "Pashto↔KP and Balochi↔Balochistan are the two most tested pairs."
      },
      {
        kind: "fact", name: "languages and culture",
        note: "Facts about Pakistan's linguistic and cultural landscape.",
        facts: [
          ["How many languages are spoken in Pakistan approximately?", "More than 70", "Pakistan hosts over 70 spoken languages across its provinces and regions, with six major ones."],
          ["Which is the most widely spoken language of Pakistan?", "Punjabi", "Punjabi is the most widely spoken mother tongue, though Urdu remains the national language."],
          ["Which language is the national language of Pakistan?", "Urdu", "Urdu serves as the national language and lingua franca, spoken and understood across all provinces."],
          ["Which language of Pakistan is written in the Perso-Arabic script and closely related to Hindi?", "Urdu", "Urdu, written in the Perso-Arabic script, is closely related to Hindi in its spoken form."],
          ["Which major world poet, author of 'Bang-e-Dara', is buried in Lahore?", "Allama Iqbal", "Allama Iqbal is buried beside the Badshahi Mosque in Lahore, where his mausoleum draws visitors."],
          ["Which festival marks the end of Ramadan and is celebrated across Pakistan?", "Eid-ul-Fitr", "Eid-ul-Fitr, celebrated on 1 Shawwal, is Pakistan's biggest religious festival after the fasting month."],
          ["Which region is famous for the world's highest polo ground at Shandur?", "Gilgit-Baltistan/Chitral", "The Shandur polo festival, played at about 3,700 metres, is the world's highest polo ground."],
          ["Which city is called the 'City of Gardens'?", "Lahore", "Lahore, with its Mughal gardens like Shalimar and Lawrence, is called the City of Gardens."]
        ],
        trick: "70+ languages; Punjabi most spoken; Urdu national; Shandur highest polo.",
        tip: "'Most spoken = Punjabi, national = Urdu' is the language distinction to remember."
      },
      {
        kind: "tf", name: "culture facts",
        note: "True/false stems on Pakistan's languages and cultural landmarks.",
        statements: [
          ["Urdu is the national language of Pakistan.", "English is the national language of Pakistan."],
          ["Punjabi is the most widely spoken mother tongue in Pakistan.", "Balochi is the most widely spoken mother tongue in Pakistan."],
          ["Pashto is the major language of Khyber Pakhtunkhwa.", "Pashto is the major language of Sindh."],
          ["Shalimar Gardens are located in Lahore.", "Shalimar Gardens are located in Karachi."],
          ["Allama Iqbal is buried in Lahore.", "Allama Iqbal is buried in Multan."]
        ],
        trick: "Urdu = national, Punjabi = most spoken, Pashto = KP, Shalimar = Lahore, Iqbal = Lahore.",
        tip: "Language-province mispairs are the most common false statements."
      }
    ],

    "Landmarks and Heritage": [
      {
        kind: "fact", name: "heritage sites",
        note: "Pakistan's UNESCO heritage and famous landmarks are reliable exam facts.",
        facts: [
          ["How many UNESCO World Heritage Sites does Pakistan have?", "Six", "Pakistan has six UNESCO World Heritage Sites, including Mohenjo-daro, Taxila, Lahore Fort and the Rohtas Fort."],
          ["Which ancient city of the Indus Valley Civilisation lies in Sindh?", "Mohenjo-daro", "Mohenjo-daro, near Larkana, is the most famous Indus Valley city with its Great Bath and grid planning."],
          ["Which archaeological site near Harappa belongs to the Indus Valley Civilisation?", "Harappa", "Harappa in Punjab gave the civilisation its name and was the first site excavated."],
          ["Which ancient Buddhist university site is near Taxila?", "Takht-i-Bahi and Taxila complex", "The Taxila ruins, with the Dharmarajika stupa and monasteries, are a UNESCO site linked to Gandhara civilisation."],
          ["Which fort built by Sher Shah Suri is a UNESCO site near Jhelum?", "Rohtas Fort", "Rohtas Fort near Jhelum, built by Sher Shah Suri, is a UNESCO World Heritage site famous for its massive walls."],
          ["Which 16th-century Mughal fort is a UNESCO site in Lahore?", "Lahore Fort", "Lahore Fort, together with the Shalimar Gardens, forms the UNESCO-listed Lahore Fort complex."],
          ["Which is the largest mosque in Pakistan?", "Faisal Mosque", "Faisal Mosque in Islamabad, with its eight-sided tent design, is the largest mosque in Pakistan."],
          ["Which mountain structure is the world's second highest peak, located at the Pakistan-China border?", "K2", "K2 at 8,611 metres stands on the Pakistan-China border in the Karakoram, second only to Everest."],
          ["Which famous mausoleum in Lahore houses Allama Iqbal?", "Iqbal's Mausoleum", "The mausoleum of Allama Iqbal stands beside the Badshahi Mosque in the Hazuri Bagh area of Lahore."],
          ["Which gate of Lahore Fort faces the Badshahi Mosque?", "Alamgiri Gate", "The Alamgiri Gate, built by Aurangzeb, faces the Badshahi Mosque and is Lahore Fort's main entrance."]
        ],
        trick: "Six UNESCO sites; Mohenjo-daro = Indus Valley in Sindh; Rohtas = Sher Shah Suri.",
        tip: "UNESCO count (6) and Mohenjo-daro's location are the two most asked heritage facts."
      },
      {
        kind: "list", name: "UNESCO sites of Pakistan", group: "the UNESCO World Heritage Sites of Pakistan",
        note: "The six UNESCO sites are Mohenjo-daro, Taxila, Takht-i-Bahi, Lahore Fort (with Shalimar), Rohtas Fort and the historical monuments of Thatta.",
        items: ["Mohenjo-daro", "Taxila", "Takht-i-Bahi", "Rohtas Fort", "Lahore Fort", "Thatta (Makli Necropolis)"],
        outsiders: ["Taj Mahal", "Pyramids of Giza", "Colosseum", "Great Wall of China", "Machu Picchu", "Petra"],
        trick: "Six Pakistani sites; foreign landmarks are the distractor set.",
        tip: "Thatta/Makli is the least-known site and the examiner's favourite 'which is NOT' answer."
      },
      {
        kind: "tf", name: "heritage facts",
        note: "True/false stems on Pakistan's landmarks.",
        statements: [
          ["Mohenjo-daro is an Indus Valley Civilisation site in Sindh.", "Mohenjo-daro is a Mughal fort in Punjab."],
          ["Rohtas Fort was built by Sher Shah Suri.", "Rohtas Fort was built by Shah Jahan."],
          ["Faisal Mosque is the largest mosque in Pakistan.", "Badshahi Mosque is the largest mosque in Pakistan."],
          ["Taxila is linked to the ancient Gandhara civilisation.", "Taxila is linked to the Harappan port of the Indus delta."],
          ["The Alamgiri Gate faces the Badshahi Mosque.", "The Alamgiri Gate faces the Minar-e-Pakistan."]
        ],
        trick: "Mohenjo-daro = Indus Valley, Rohtas = Sher Shah, Faisal = largest mosque.",
        tip: "Harappa vs Mohenjo-daro confusion is the classic trap."
      }
    ],

    "Governing the Nation — Current Facts": [
      {
        kind: "numeric", name: "population and area proportions", difficulty: "medium",
        note: "Pakistan's population exceeds 240 million and its area is about 796,000 square kilometres; provinces hold known population shares.",
        q: (v) => `If Pakistan's population is about ${v.pop} million and the province of Punjab holds approximately ${v.pct}% of it, how many million people approximately live in Punjab?`,
        a: (v) => `${(v.pop * v.pct / 100).toFixed(1)} million`,
        e: (v) => `Punjab's share is ${v.pct}%, so ${v.pct}% of ${v.pop} million = ${(v.pop * v.pct / 100).toFixed(1)} million people, because the provincial share is applied to the total population.`,
        distract: (v) => {
          const c = v.pop * v.pct / 100;
          return [`${(c * 1.25).toFixed(1)} million`, `${(c * 0.8).toFixed(1)} million`, `${(c + 5).toFixed(1)} million`, `${(c - 8).toFixed(1)} million`, `${(c * 0.6).toFixed(1)} million`];
        },
        vals: (rng) => ({ pop: 241, pct: Math.round((45 + rng() * 15)) }),
        whyWrong: (v) => [`Only ${v.pct}% of the total population is counted for Punjab; other percentages give different results.`],
        trick: "Multiply total population by the provincial share in decimal form.",
        tip: "Provincial population share questions combine GK with quick mental maths."
      },
      {
        kind: "numeric", name: "area of Pakistan", difficulty: "medium",
        note: "Pakistan's total area is about 796,096 square kilometres; Balochistan covers roughly 44% of it.",
        q: (v) => `If Pakistan's total area is about ${v.area.toLocaleString()} sq km and Balochistan covers ${v.pct}% of it, what is the approximate area of Balochistan?`,
        a: (v) => `${Math.round(v.area * v.pct / 100).toLocaleString()} sq km`,
        e: (v) => `Balochistan's share is ${v.pct}%, so ${v.pct}% of ${v.area.toLocaleString()} sq km is approximately ${Math.round(v.area * v.pct / 100).toLocaleString()} sq km, because the percentage is taken of the national area.`,
        distract: (v) => {
          const c = Math.round(v.area * v.pct / 100);
          return [`${Math.round(c * 1.3).toLocaleString()} sq km`, `${Math.round(c * 0.7).toLocaleString()} sq km`, `${Math.round(c + 40000).toLocaleString()} sq km`, `${Math.round(c * 0.85).toLocaleString()} sq km`];
        },
        vals: (rng) => ({ area: 796096, pct: Math.round((40 + rng() * 8)) }),
        whyWrong: (v) => [`Only ${v.pct}% of the total area belongs to Balochistan; larger or smaller figures come from wrong percentages.`],
        trick: "Area × share% ÷ 100 gives the provincial area directly.",
        tip: "44% is the real Balochistan share — use it to sanity-check answers."
      },
      {
        kind: "fact", name: "demographic facts",
        note: "Key demographic numbers of Pakistan are tested in multiple-choice form.",
        facts: [
          ["What is the approximate population of Pakistan in 2026?", "About 250 million", "Pakistan's population is estimated at roughly 240–250 million, making it the world's fifth most populous country."],
          ["What is the approximate total area of Pakistan?", "796,000 sq km", "Pakistan covers about 796,000 square kilometres, including the northern mountains and the southern coastline."],
          ["What percentage of Pakistan's area does Balochistan cover?", "About 44%", "Balochistan, the largest province, covers roughly 44% of Pakistan's total land area."],
          ["What is the total length of Pakistan's coastline?", "About 1,046 km", "Pakistan's coastline along the Arabian Sea extends about 1,046 kilometres, mostly in Balochistan."],
          ["Which province has the longest coastline?", "Balochistan", "Balochistan holds most of Pakistan's coastline, including Gwadar, along the Arabian Sea."],
          ["Which is the largest desert of Pakistan?", "Thar", "The Thar Desert in Sindh is Pakistan's largest desert, extending into India's Rajasthan."],
          ["Which is the largest lake of Pakistan?", "Manchar", "Manchar Lake in Sindh is Pakistan's largest freshwater lake, fed by the Indus system."],
          ["Which is the highest point of Pakistan?", "K2", "K2 at 8,611 metres is the highest point of Pakistan and the world's second highest peak."]
        ],
        trick: "250M people, 796K sq km, 44% Balochistan, 1,046 km coast, Manchar lake, Thar desert.",
        tip: "Manchar (largest lake) and Thar (largest desert) are the two 'largest' facts."
      }
    ],

    "Numeric Pakistan Facts": [
      {
        kind: "numeric", name: "population density calculations", difficulty: "medium",
        note: "Population density = population ÷ area in km².",
        q: (v) => `A Pakistani district has a population of ${v.p.toLocaleString()} and an area of ${v.a.toLocaleString()} km². What is the population density per km²?`,
        a: (v) => `${Math.round(v.p / v.a).toLocaleString()}`,
        e: (v) => `Density = population ÷ area = ${v.p.toLocaleString()} ÷ ${v.a.toLocaleString()} = ${Math.round(v.p / v.a).toLocaleString()} per km², because density spreads the people across the land area.`,
        distract: (v) => {
          const c = Math.round(v.p / v.a);
          return [`${Math.round(c * 2).toLocaleString()}`, `${Math.round(c * 0.5).toLocaleString()}`, `${(v.a / v.p).toFixed(3)}`, `${(c + 100).toLocaleString()}`, `${Math.round(c * 1.5).toLocaleString()}`];
        },
        vals: (rng) => ({ p: 100000 + Math.floor(rng() * 90) * 100000, a: 1000 + Math.floor(rng() * 90) * 1000 }),
        whyWrong: (v) => [`Density divides population by area; inverting the ratio or doubling the result are the common traps.`],
        trick: "Density = people ÷ km².",
        tip: "Pakistan overall density is about 300/km² — compare against it."
      },
      {
        kind: "numeric", name: "GDP share calculations", difficulty: "easy",
        note: "Sector share = sector value ÷ total GDP × 100.",
        q: (v) => `Pakistan's GDP is $${v.g} billion and agriculture contributes $${v.a} billion. What percentage of GDP is agriculture?`,
        a: (v) => `${(v.a / v.g * 100).toFixed(1)}%`,
        e: (v) => `Share = agriculture ÷ GDP × 100 = $${v.a} ÷ $${v.g} × 100 = ${(v.a / v.g * 100).toFixed(1)}%, because the share expresses the sector's part of the whole economy.`,
        distract: (v) => {
          const c = v.a / v.g * 100;
          return [`${(c * 2).toFixed(1)}%`, `${(v.g / v.a * 100).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 2).toFixed(1)}%`];
        },
        vals: (rng) => {
          const g = 300 + Math.floor(rng() * 50);
          const a = 60 + Math.floor(rng() * 50);
          return { g, a: Math.min(a, g - 100) };
        },
        whyWrong: (v) => [`The share divides the sector by the total and multiplies by 100; inverting the fraction gives the wrong percentage.`],
        trick: "Share % = sector ÷ total × 100.",
        tip: "Agriculture's real share is roughly 20-25% of GDP."
      },
      {
        kind: "numeric", name: "dam capacity comparisons", difficulty: "medium",
        note: "Comparing dam generation capacities uses simple ratios.",
        q: (v) => `Dam A generates ${v.a} MW and Dam B generates ${v.b} MW. How many times the capacity of Dam B is Dam A?`,
        a: (v) => `${(v.a / v.b).toFixed(1)} times`,
        e: (v) => `Ratio = ${v.a} ÷ ${v.b} = ${(v.a / v.b).toFixed(1)} times, because the comparison divides the larger capacity by the smaller one.`,
        distract: (v) => [`${(v.b / v.a).toFixed(1)} times`, `${(v.a / v.b * 2).toFixed(1)} times`, `${(v.a - v.b)} times`, `${(v.a / v.b + 1).toFixed(1)} times`, `${(v.a / v.b * 0.5).toFixed(1)} times`],
        vals: (rng) => {
          const b = 100 + Math.floor(rng() * 90) * 100;
          const a = b * 2 + Math.floor(rng() * 10) * b;
          return { a, b };
        },
        whyWrong: (v) => [`Divide the larger capacity by the smaller; the inverse ratio is the classic distractor.`],
        trick: "Times = bigger ÷ smaller.",
        tip: "Tarbela (~4888 MW) dwarfs most other dams — use it as the anchor."
      },
      {
        kind: "numeric", name: "projected population growth", difficulty: "hard",
        note: "Projected population = current × (1 + growth rate)ⁿ for n years.",
        q: (v) => `A city's population of ${v.p.toLocaleString()} grows at ${v.r}% per year. What is the projected population after ${v.n} years?`,
        a: (v) => `${Math.round(v.p * Math.pow(1 + v.r / 100, v.n)).toLocaleString()}`,
        e: (v) => `Projection = ${v.p.toLocaleString()} × (1.${v.r})^${v.n} ≈ ${Math.round(v.p * Math.pow(1 + v.r / 100, v.n)).toLocaleString()}, because each year multiplies the population by 1 plus the growth rate.`,
        distract: (v) => {
          const c = Math.round(v.p * Math.pow(1 + v.r / 100, v.n));
          const lin = v.p * (1 + v.r * v.n / 100);
          return [`${Math.round(lin).toLocaleString()}`, `${Math.round(c * 2).toLocaleString()}`, `${Math.round(c * 0.5).toLocaleString()}`, `${(v.p + v.r * v.n * 1000).toLocaleString()}`, `${Math.round(c * 1.1).toLocaleString()}`];
        },
        vals: (rng) => {
          const p = 100000 + Math.floor(rng() * 90) * 100000;
          const r = [1.5, 2, 2.5, 3][Math.floor(rng() * 4)];
          const n = 5 + Math.floor(rng() * 16);
          return { p, r, n };
        },
        whyWrong: (v) => [`Compound growth raises the population by (1+r)ⁿ; the linear-growth answer is the deliberate distractor.`],
        trick: "Compound growth: P × (1+r)ⁿ.",
        tip: "Linear-growth answers understate population projections."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
