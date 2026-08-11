/* ============================================================
   Generator file 19 — Completion Banks (final pass)
   Original fact banks for the remaining empty topics:
   - synthetic t-ch-* duplicates whose shared pool was won by
     another subject (iq/analytical-reasoning won the qhash race)
   - curated topics with no generator coverage at all
   These banks are checked FIRST (reverse lookup in fill-topics)
   so their facts win over the colliding shared pools.
   ============================================================ */
"use strict";
const L = require("../lib.js");

function makeGen(subjectId, chapterName, facts) {
  const topics = Object.keys(facts);
  return {
    subjects: [subjectId],
    name: chapterName,
    topics,
    tags: [subjectId, "topic-bank", "completion"],
    generate(rng, topicName) {
      const pool = facts[topicName].map(([q, a, e]) => ({ q, a, e }));
      return L.factGenerator(pool, [])(rng);
    }
  };
}

module.exports = [
  /* ============ DATA INTERPRETATION ============ */
  makeGen("data-interpretation", "Data Interpretation — Completion Banks", {
    "Percentages & Ratios": [
      ["If a town's population grows from 50,000 to 55,000, what is the percentage increase?", "10%", "Increase = 5,000 people; 5,000/50,000 = 10% of the original population."],
      ["A price of Rs 800 is discounted by 15%. What is the new price?", "Rs 680", "15% of 800 = 120; 800 − 120 = Rs 680 after the discount."],
      ["If 3 out of 12 students fail, what is the fail percentage?", "25%", "3/12 simplifies to 1/4, which equals 25 percent of the class."],
      ["The ratio of boys to girls is 2:3. If there are 60 students, how many are boys?", "24", "2 parts of 5 total parts; 2/5 × 60 = 24 boys in the class."],
      ["What is 25% of 240?", "60", "25% is one quarter; 240 ÷ 4 = 60."],
      ["A number is increased by 20% and then decreased by 20%. What is the net change?", "4% decrease", "Multiplying by 1.2 then 0.8 gives 0.96, a net 4% loss."],
      ["If the ratio 4:5 is equivalent to x:25, what is x?", "20", "Cross-multiplying 4/5 = x/25 gives 5x = 100, so x = 20."],
      ["An exam has 80 marks; passing is 40%. What is the pass mark?", "32", "40% of 80 = 32 marks required to pass the exam."],
      ["Rs 1,500 is split in the ratio 2:3. What is the larger share?", "Rs 900", "The larger share is 3/5 of 1,500 = Rs 900."],
      ["Sales rose from 200 units to 250 units. What is the increase percentage?", "25%", "Increase of 50 units over the original 200 equals 25%."]
    ],
    "Percentage Comparisons": [
      ["Which is larger: 20% of 300 or 30% of 200?", "They are equal", "20% of 300 = 60 and 30% of 200 = 60, so both amounts are equal."],
      ["Which is larger: 15% of 400 or 10% of 500?", "15% of 400", "15% of 400 = 60 while 10% of 500 = 50, so the first is larger."],
      ["Which is larger: 25% of 160 or 20% of 200?", "They are equal", "25% of 160 = 40 and 20% of 200 = 40, so both amounts are equal."],
      ["Which is larger: 12% of 250 or 14% of 200?", "12% of 250", "12% of 250 = 30 while 14% of 200 = 28, so the first is larger."],
      ["Which is larger: 10% of 1,000 or 12% of 800?", "12% of 800", "10% of 1,000 = 100 while 12% of 800 = 96, so the first is larger."],
      ["Which is larger: 30% of 500 or 20% of 700?", "30% of 500", "30% of 500 = 150 while 20% of 700 = 140, so the first is larger."]
    ]
  }),

  /* ============ APTITUDE TESTS ============ */
  makeGen("aptitude-tests", "Aptitude Tests — Completion Banks", {
    "Percentage Comparisons": [
      ["Which is larger: 40% of 500 or 25% of 800?", "They are equal", "40% of 500 = 200 and 25% of 800 = 200."],
      ["Which is larger: 30% of 600 or 20% of 900?", "They are equal", "30% of 600 = 180 and 20% of 900 = 180."],
      ["Which is larger: 15% of 200 or 10% of 250?", "15% of 200", "15% of 200 = 30; 10% of 250 = 25."],
      ["Which is larger: 60% of 150 or 40% of 250?", "40% of 250", "60% of 150 = 90; 40% of 250 = 100."],
      ["Which is larger: 5% of 1,000 or 8% of 600?", "5% of 1,000", "5% of 1,000 = 50; 8% of 600 = 48."]
    ]
  }),

  /* ============ LOGICAL REASONING ============ */
  makeGen("logical-reasoning", "Logical Reasoning — Completion Banks", {
    "Coding-Decoding": [
      ["If MIRROR is written as NJSSPS, how is GLASS written?", "HMBTT", "Each letter advances one: G→H, L→M, A→B, S→T, S→T."],
      ["If PENCIL is written as QFODJM, how is ERASER written?", "FSBTFS", "Each letter moves one step forward in the alphabet."],
      ["If WINTER is coded as VHMSDQ, how is SUMMER coded?", "RTLLDQ", "Each letter moves one step backward."],
      ["If A=1, B=2 and Z=26, what is the code for the word 'DOG'?", "4-15-7", "D=4, O=15, G=7."],
      ["If TABLE is written as UBCMF, how is CHAIR written?", "DI BJS", "Each letter advances one: C→D, H→I, A→B, I→J, R→S."],
      ["If LIGHT is written as MHIUS, how is NIGHT written?", "OHHUS", "Letters alternate: +1, -1, +1, -1, +1."],
      ["If FISH is coded as 6-9-19-8, how is BIRD coded?", "2-9-18-4", "Each letter maps to its alphabet position."],
      ["If HAPPY is written as IZQQX, how is SMILE written?", "TLHKD", "Letters alternate +1, -1, +1, -1, +1."],
      ["If CLASS is written as DMBTT, how is ROOM written?", "SPPN", "Each letter advances one position."],
      ["If MONEY is coded as NPFZ, how is WEALTH coded?", "XFBUI", "Each letter advances one: W→X, E→F, A→B, L→U, T→H, H→I."]
    ],
    "Odd One Out": [
      ["Which word does not belong: Apple, Mango, Banana, Carrot?", "Carrot", "Apple, Mango and Banana are fruits; Carrot is a vegetable."],
      ["Which word does not belong: Cat, Dog, Cow, Lion?", "Lion", "Lion is a wild animal; the others are domestic animals."],
      ["Which word does not belong: Monday, April, Friday, Sunday?", "April", "Monday, Friday and Sunday are days; April is a month."],
      ["Which word does not belong: Red, Blue, Green, Circle?", "Circle", "Red, Blue and Green are colours; Circle is a shape."],
      ["Which word does not belong: Football, Hockey, Cricket, Chess?", "Chess", "Football, Hockey and Cricket are outdoor games; Chess is an indoor game."],
      ["Which word does not belong: River, Canal, Lake, Mountain?", "Mountain", "River, Canal and Lake are water bodies; Mountain is land."],
      ["Which word does not belong: Doctor, Engineer, Teacher, Stethoscope?", "Stethoscope", "Doctor, Engineer and Teacher are professions; Stethoscope is an instrument."],
      ["Which word does not belong: Oxygen, Nitrogen, Hydrogen, Soil?", "Soil", "Oxygen, Nitrogen and Hydrogen are gases; Soil is not a gas."],
      ["Which word does not belong: Copper, Iron, Gold, Wood?", "Wood", "Copper, Iron and Gold are metals; Wood is not."],
      ["Which word does not belong: Summer, Winter, Spring, Cloud?", "Cloud", "Summer, Winter and Spring are seasons; Cloud is weather."]
    ]
  }),

  /* ============ VERBAL REASONING ============ */
  makeGen("verbal-reasoning", "Verbal Reasoning — Completion Banks", {
    "Blood Relations": [
      ["Pointing to a lady, Rana said, 'She is the daughter of my mother's only son.' How is the lady related to Rana?", "Daughter", "Rana's mother's only son is Rana himself; his daughter is Rana's daughter."],
      ["Pointing to a man, Aslam said, 'He is the brother of my father's only daughter.' How is the man related to Aslam?", "Brother", "The only daughter of Aslam's father is Aslam's sister; her brother is Aslam."],
      ["Pointing to a boy, Sana said, 'He is the son of my mother's sister.' How is the boy related to Sana?", "Cousin", "The son of the mother's sister is a maternal cousin."],
      ["Pointing to a woman, Bilal said, 'She is the wife of my father's brother.' How is the woman related to Bilal?", "Aunt", "The wife of the father's brother is a paternal aunt."],
      ["Pointing to a child, Ayesha said, 'He is the son of my daughter's father.' How is the child related to Ayesha?", "Grandson", "The son of Ayesha's daughter is her grandson."],
      ["Pointing to a man, Zara said, 'He is the father of my husband.' How is the man related to Zara?", "Father-in-law", "The father of one's husband is the father-in-law."],
      ["Pointing to a girl, Kamran said, 'She is the sister of my son's wife.' How is the girl related to Kamran?", "Sister-in-law", "The sister of the son's wife is the son's sister-in-law, hence Kamran's sister-in-law."],
      ["Pointing to a woman, Ali said, 'She is the mother of my brother's wife.' How is the woman related to Ali?", "Co-mother (relation by marriage)", "She is the mother of Ali's sister-in-law."],
      ["Pointing to a boy, Maria said, 'He is the son of my uncle's daughter.' How is the boy related to Maria?", "Cousin", "The son of a cousin is a first cousin once removed, generally called cousin."],
      ["Pointing to a man, Hussain said, 'He is the husband of my sister.' How is the man related to Hussain?", "Brother-in-law", "The husband of one's sister is the brother-in-law."]
    ],
    "Direction Sense": [
      ["A man starts walking 5 km north, then turns right and walks 4 km. Which direction is he now facing?", "East", "Facing north, a right turn points east."],
      ["A man walks 3 km south, turns left and walks 2 km. Which direction is he facing now?", "East", "Facing south, a left turn points east."],
      ["A woman walks 6 km west, turns right and walks 3 km. Which direction is she facing?", "North", "Facing west, a right turn points north."],
      ["A man walks 4 km east, turns left and walks 5 km. Which direction is he facing?", "North", "Facing east, a left turn points north."],
      ["A boy walks 2 km north, turns left and walks 3 km. Which direction is he facing?", "West", "Facing north, a left turn points west."],
      ["A girl walks 7 km east, turns right and walks 6 km. Which direction is she facing?", "South", "Facing east, a right turn points south."],
      ["A man walks 4 km south, turns right and walks 5 km. Which direction is he facing?", "West", "Facing south, a right turn points west."],
      ["A person walks 3 km west, turns left and walks 4 km. Which direction is he facing?", "South", "Facing west, a left turn points south."],
      ["Rana walks 5 km north, then takes a U-turn and walks 2 km. How far is he from his start and in which direction?", "3 km north", "5 − 2 = 3 km north of the start."],
      ["A man walks 6 km south, turns around and walks 4 km back. Where is he relative to the start?", "2 km south", "6 − 4 = 2 km south of the start."]
    ]
  }),

  /* ============ NON-VERBAL REASONING ============ */
  makeGen("non-verbal-reasoning", "Non-Verbal Reasoning — Completion Banks", {
    "Blood Relations": [
      ["Pointing to a man, Nida said, 'He is the husband of my mother's daughter.' How is the man related to Nida?", "Brother-in-law", "The daughter of Nida's mother is Nida herself or her sister; the husband is a brother-in-law."],
      ["Pointing to a girl, Tariq said, 'She is the daughter of my father's sister.' How is the girl related to Tariq?", "Cousin", "The daughter of the father's sister is a paternal cousin."],
      ["Pointing to a boy, Rabia said, 'He is the son of my father's father.' How is the boy related to Rabia?", "Uncle", "The son of the grandfather is the father's (or mother's) brother, an uncle."],
      ["Pointing to a woman, Faisal said, 'She is the sister of my mother.' How is the woman related to Faisal?", "Aunt", "The sister of one's mother is a maternal aunt."],
      ["Pointing to a man, Hira said, 'He is the brother of my father.' How is the man related to Hira?", "Uncle", "The brother of one's father is a paternal uncle."],
      ["Pointing to a child, Umar said, 'He is the son of my brother.' How is the child related to Umar?", "Nephew", "The son of one's brother is a nephew."],
      ["Pointing to a girl, Saima said, 'She is the daughter of my sister.' How is the girl related to Saima?", "Niece", "The daughter of one's sister is a niece."],
      ["Pointing to a woman, Imran said, 'She is the mother of my wife.' How is the woman related to Imran?", "Mother-in-law", "The mother of one's wife is the mother-in-law."],
      ["Pointing to a man, Anum said, 'He is the son of my grandmother's son.' How is the man related to Anum?", "Father or uncle", "The son of the grandmother is the father (or an uncle) of Anum."],
      ["Pointing to a girl, Saad said, 'She is the daughter of my uncle.' How is the girl related to Saad?", "Cousin", "The daughter of one's uncle is a cousin."]
    ],
    "Direction Sense": [
      ["A man walks 5 km south, turns left and walks 3 km. In which direction is he now facing?", "East", "Facing south, a left turn points east."],
      ["A woman walks 8 km east, turns left and walks 6 km. In which direction is she facing?", "North", "Facing east, a left turn points north."],
      ["A man walks 4 km west, turns right and walks 7 km. In which direction is he facing?", "North", "Facing west, a right turn points north."],
      ["A girl walks 3 km north, turns left and walks 5 km. In which direction is she facing?", "West", "Facing north, a left turn points west."],
      ["A man walks 6 km east, turns right and walks 4 km. In which direction is he facing?", "South", "Facing east, a right turn points south."],
      ["A man walks 2 km south, turns right and walks 8 km. In which direction is he facing?", "West", "Facing south, a right turn points west."],
      ["A woman walks 9 km north, turns right and walks 3 km. In which direction is she facing?", "East", "Facing north, a right turn points east."],
      ["A man walks 7 km west, turns left and walks 2 km. In which direction is he facing?", "South", "Facing west, a left turn points south."],
      ["Bilal walks 4 km east, turns around and walks 1 km back. How far is he from the start?", "3 km east", "4 − 1 = 3 km east of the start."],
      ["Sana walks 8 km north, turns around and walks 3 km back. Where is she relative to the start?", "5 km north", "8 − 3 = 5 km north of the start."]
    ]
  }),

  /* ============ ORAL ANATOMY ============ */
  makeGen("oral-anatomy", "Oral Anatomy — Completion Banks", {
    "Salivary Glands": [
      ["Which is the largest salivary gland?", "Parotid gland", "The parotid lies in front of the ear."],
      ["Which salivary gland produces the most serous saliva?", "Parotid gland", "Parotid saliva is watery and enzyme-rich."],
      ["Which duct drains the parotid gland?", "Stensen's duct", "It opens opposite the second upper molar."],
      ["Which glands drain via Wharton's ducts?", "Submandibular glands", "They open at the floor of the mouth on the sublingual caruncle."],
      ["Which gland is situated beneath the tongue?", "Sublingual gland", "It drains through many small ducts."],
      ["Which nerve carries taste from the submandibular gland's region?", "Chorda tympani (facial nerve branch)", "It supplies parasympathetic secretomotor fibres."],
      ["Which cells secrete serous saliva?", "Serous acinar cells", "They release watery fluid with amylase."],
      ["What is xerostomia?", "Reduced saliva flow (dry mouth)", "It increases caries and infection risk."],
      ["Which enzyme is the main salivary enzyme?", "Salivary amylase (ptyalin)", "It begins starch digestion."],
      ["Which immunoglobulin is abundant in saliva?", "Secretory IgA", "It protects the oral mucosa."],
      ["Which gland contributes most to unstimulated whole saliva?", "Submandibular gland", "It provides roughly two-thirds of resting flow."],
      ["Which condition is caused by mumps?", "Parotitis (parotid inflammation)", "Mumps typically inflames the parotids."]
    ],
    "Oral Structures": [
      ["What covers the crown of a tooth?", "Enamel", "Enamel is the hardest tissue in the body."],
      ["What covers the root of a tooth?", "Cementum", "Cementum anchors the periodontal ligament."],
      ["Which tooth is called the 'eye tooth'?", "Canine", "The maxillary canine sits below the eye."],
      ["How many permanent teeth are there?", "32", "Eight incisors, four canines, eight premolars, twelve molars."],
      ["How many deciduous (milk) teeth are there?", "20", "Children have ten in each arch."],
      ["Which tooth type has the most cusps?", "Molars", "Permanent molars usually have four or five cusps."],
      ["Which structure attaches the tooth to bone?", "Periodontal ligament", "It is a shock-absorbing ligament."],
      ["Which teeth have two roots in the maxilla?", "Maxillary premolars", "Upper first premolars usually show two roots."],
      ["What is the hardest substance in the human body?", "Enamel", "Its high mineral content gives extreme hardness."],
      ["Which region of the tooth contains nerves and vessels?", "The pulp chamber", "The pulp lies inside dentin."],
      ["Which tooth usually erupts first in the permanent set?", "First molar", "The six-year molar erupts around age 6."],
      ["What is the anatomical crown?", "The part covered by enamel", "It differs from the clinical crown above the gum."]
    ]
  }),

  /* ============ ORAL HISTOLOGY ============ */
  makeGen("oral-histology", "Oral Histology — Completion Banks", {
    "Oral Tissues": [
      ["Which epithelium lines the oral cavity?", "Stratified squamous epithelium", "It resists abrasion during chewing."],
      ["Which oral tissue is keratinized?", "Gingiva and hard palate", "Keratinized epithelium withstands friction."],
      ["Which cells make enamel?", "Ameloblasts", "They secrete enamel matrix before eruption."],
      ["Which cells make dentin?", "Odontoblasts", "They line the pulp and deposit dentin."],
      ["Which cells make cementum?", "Cementoblasts", "They form cementum on the root surface."],
      ["Which cells make bone?", "Osteoblasts", "Alveolar bone is maintained by osteoblasts."],
      ["Which cells resorb bone?", "Osteoclasts", "They remodel alveolar bone."],
      ["What is the junction between enamel and dentin called?", "The dentino-enamel junction (DEJ)", "It is a scalloped boundary."],
      ["Which tissue contains the most collagen?", "Dentin", "Dentin is a mineralized collagen matrix."],
      ["What is the pulp made of?", "Loose connective tissue with cells and vessels", "It contains odontoblasts and nerves."],
      ["Which layer of oral mucosa is deepest?", "The submucosa (lamina propria below)", "It binds mucosa to underlying bone."],
      ["Which cells are found in the periodontal ligament?", "Fibroblasts, cementoblasts and osteoblasts", "They maintain the attachment apparatus."]
    ]
  }),

  /* ============ URDU LITERATURE ============ */
  makeGen("urdu", "Urdu — Completion Banks", {
    "Urdu Literature": [
      ["Which poet wrote 'Shikwa' and 'Jawab-e-Shikwa'?", "Allama Iqbal", "These nazms criticize and then answer a complaint to God."],
      ["Who is called the 'Shair-e-Mashriq' (Poet of the East)?", "Allama Iqbal", "He is celebrated for his philosophical poetry."],
      ["Who wrote the novel 'Umrao Jaan Ada'?", "Mirza Hadi Ruswa", "It is a classic Urdu novel about a courtesan."],
      ["Which poet is known as 'Dagh Dehlvi'?", "Nawab Mirza Khan Dagh", "He was a celebrated ghazal writer of the 19th century."],
      ["Who wrote the short story 'Toba Tek Singh'?", "Saadat Hasan Manto", "The story is set in a lunatic asylum after Partition."],
      ["Which literary form did Ghalib master?", "Ghazal", "Mirza Ghalib's ghazals are among the finest in Urdu."],
      ["Who founded the Urdu literary magazine 'Naqoosh'?", "Muhammad Tufail", "Naqoosh shaped Urdu literary culture in Lahore."],
      ["Which movement promoted progressive Urdu literature?", "The Progressive Writers' Movement", "It began in the 1930s."],
      ["Who wrote 'Aag ka Darya'?", "Qurratulain Hyder", "It is a famous Urdu novel tracing Indian history."],
      ["Which poet wrote 'Salam' to Urdu poetry with 'Sabaq'?", "Faiz Ahmed Faiz", "Faiz is renowned for his revolutionary verse."]
    ]
  }),

  /* ============ PAKISTAN AFFAIRS ============ */
  makeGen("pakistan-affairs", "Pakistan Affairs — Completion Banks", {
    "Geography of Pakistan": [
      ["Which is the highest peak in Pakistan?", "K2 (8,611 m)", "K2, in the Karakoram, is the world's second-highest peak."],
      ["Which mountain range separates Pakistan from China?", "Karakoram", "It contains K2 and many glaciers."],
      ["Which river flows through the Thal desert region?", "The Indus", "The Thal desert lies between the Indus and Jhelum."],
      ["Which plateau lies in Balochistan?", "The Balochistan plateau", "It covers most of western Pakistan."],
      ["Which desert is shared with India?", "Thar (Cholistan is purely Pakistani)", "The Thar desert spans southeastern Sindh into India."],
      ["Which lake is Pakistan's largest freshwater lake?", "Lake Manchar", "It lies in Sindh near the Indus."],
      ["Which is the largest saltwater lake?", "Haleji (freshwater reserve) or Sonmiani", "Most coastal lagoons are brackish."],
      ["Which province has the longest coastline?", "Balochistan", "It fronts the Arabian Sea in the west."],
      ["Which strait lies south of Gwadar?", "Strait of Hormuz (approaches)", "Gwadar commands the Gulf of Oman approaches."],
      ["Which mountain pass links Pakistan to Afghanistan?", "Khyber Pass", "It connects Peshawar to Jalalabad."],
      ["Which river forms the border with Afghanistan?", "The Kabul River (tributary of Indus)", "It joins the Indus near Attock."],
      ["Which city is called the 'City of Colleges'?", "Lahore", "It is famous for its educational institutions."]
    ]
  }),

  /* ============ ISLAMIC STUDIES ============ */
  makeGen("islamic-studies", "Islamic Studies — Completion Banks", {
    "Fiqh and Terms": [
      ["What does Fiqh mean?", "Islamic jurisprudence", "Fiqh derives rules from the Quran and Sunnah."],
      ["Who founded the Hanafi school of fiqh?", "Imam Abu Hanifa", "It is the largest school, widely followed in South Asia."],
      ["Which school of fiqh is dominant in Saudi Arabia?", "Hanbali school", "Imam Ahmad ibn Hanbal founded it."],
      ["What is Ijma?", "Consensus of scholars", "Ijma is a secondary source of law."],
      ["What is Qiyas?", "Analogical reasoning", "Qiyas applies existing rules to new cases."],
      ["What is Ijtihad?", "Independent scholarly reasoning", "It derives rulings from primary sources."],
      ["What is a Fatwa?", "A formal legal opinion", "It is issued by a qualified mufti."],
      ["Which school follows Imam Malik?", "Maliki school", "It is common in North and West Africa."],
      ["What does Shariah mean?", "The revealed Islamic law", "It covers worship, ethics and transactions."],
      ["What is Taqwa?", "God-consciousness", "It is the fear of God that guides conduct."],
      ["What is Sunnah?", "The Prophet's practice", "It complements the Quran as a source of law."],
      ["What is the difference between Fard and Sunnah acts?", "Fard is obligatory, Sunnah is recommended", "Fard carries reward and sin; Sunnah carries reward alone."]
    ]
  }),

  /* ============ MATHEMATICS ============ */
  makeGen("mathematics", "Mathematics — Completion Banks", {
    "Number Series": [
      ["What is the next term: 3, 9, 27, 81, ?", "243", "Each term multiplies by 3."],
      ["What is the next term: 1, 8, 27, 64, ?", "125", "These are cubes: 1³, 2³, 3³, 4³, 5³."],
      ["What is the next term: 0, 3, 8, 15, 24, ?", "35", "Terms are n² − 1: 0, 3, 8, 15, 24, 35."],
      ["What is the next term: 2, 3, 5, 8, 13, ?", "21", "Each term is the sum of the previous two."],
      ["What is the next term: 11, 13, 17, 19, 23, ?", "29", "These are consecutive prime numbers."],
      ["What is the next term: 1, 2, 6, 24, 120, ?", "720", "These are factorials: 1!, 2!, 3!, 4!, 5!, 6!."],
      ["What is the next term: 1, 4, 9, 16, 25, ?", "36", "These are perfect squares: 1² to 6²."],
      ["What is the next term: 10, 20, 40, 80, ?", "160", "Each term doubles."],
      ["What is the next term: 1, 4, 16, 64, ?", "256", "Each term multiplies by 4."],
      ["What is the next term: 5, 11, 23, 47, ?", "95", "Each term doubles then adds one."]
    ]
  }),

  /* ============ STATISTICS ============ */
  makeGen("statistics", "Statistics — Completion Banks", {
    "Mean Median Mode": [
      ["What is the mean of 4, 8, 12, 16, 20?", "12", "Sum = 60; 60 ÷ 5 = 12."],
      ["What is the median of 3, 7, 9, 14, 18?", "9", "The middle value of an ordered set."],
      ["What is the mode of 2, 3, 3, 4, 4, 4, 5?", "4", "4 appears most often."],
      ["What is the median of 5, 1, 9, 3, 7?", "5", "Ordered: 1, 3, 5, 7, 9; middle = 5."],
      ["What is the mean of 2, 2, 2, 10, 14?", "6", "Sum = 30; 30 ÷ 5 = 6."],
      ["Which measure is the 'middle' of a data set?", "Median", "It splits ordered data into two halves."],
      ["Which measure is the most frequent value?", "Mode", "It shows the most common observation."],
      ["Which measure is affected by extreme outliers?", "Mean", "Outliers pull the arithmetic average."],
      ["What is the range of 3, 8, 15, 22?", "19", "Range = max − min = 22 − 3 = 19."],
      ["If scores are 70, 80, 90, 100, what is the mean?", "85", "Sum = 340; 340 ÷ 4 = 85."],
      ["What is the median of an even-sized set?", "The average of the two middle values", "For 1, 2, 3, 4 the median is (2+3)/2 = 2.5."],
      ["Which measure is always a data point?", "Mode (and median for odd sets)", "The mean need not be an actual observation."]
    ]
  }),

  /* ============ PHARMACOLOGY ============ */
  makeGen("pharmacology", "Pharmacology — Completion Banks", {
    "Drug Classes": [
      ["Which drug class relieves pain?", "Analgesics", "Examples include paracetamol and ibuprofen."],
      ["Which drug class treats bacterial infections?", "Antibiotics", "Penicillins are a classic example."],
      ["Which class lowers blood pressure?", "Antihypertensives", "ACE inhibitors and beta-blockers are examples."],
      ["Which class reduces inflammation?", "NSAIDs (non-steroidal anti-inflammatory drugs)", "They block prostaglandin synthesis."],
      ["Which class treats allergies?", "Antihistamines", "They block histamine H1 receptors."],
      ["Which class lowers blood sugar?", "Antidiabetics", "Metformin and insulin are examples."],
      ["Which class treats acid reflux?", "Proton pump inhibitors", "Omeprazole is a common PPI."],
      ["Which class relieves asthma attacks quickly?", "Bronchodilators", "Salbutamol is a short-acting beta-agonist."],
      ["Which class prevents blood clots?", "Anticoagulants", "Warfarin and heparin are examples."],
      ["Which class kills or inhibits fungi?", "Antifungals", "Fluconazole treats systemic mycoses."],
      ["Which class treats epilepsy?", "Anticonvulsants", "Carbamazepine is a common example."],
      ["Which class is used for sedation?", "Benzodiazepines", "They enhance GABA-mediated inhibition."]
    ]
  }),

  /* ============ WORLD HISTORY ============ */
  makeGen("world-history", "World History — Completion Banks", {
    "Ancient World": [
      ["Which river valley hosted the Egyptian civilization?", "The Nile", "Egypt's agriculture depended on Nile floods."],
      ["Which civilization built the pyramids of Giza?", "Ancient Egypt", "The Great Pyramid dates to about 2560 BCE."],
      ["Which civilization developed cuneiform writing?", "Sumer (Mesopotamia)", "Cuneiform began around 3200 BCE."],
      ["Which code is the oldest known law code?", "The Code of Hammurabi", "It was written in Babylon around 1754 BCE."],
      ["Which empire ruled Rome's Mediterranean world?", "The Roman Empire", "It peaked under Augustus and Trajan."],
      ["Who was the first Roman emperor?", "Augustus (Octavian)", "He ruled from 27 BCE to 14 CE."],
      ["Which civilization built the city of Mohenjo-daro?", "The Indus Valley Civilization", "It flourished around 2500 BCE."],
      ["Which ancient city hosted the Olympic Games?", "Olympia, Greece", "The games began in 776 BCE."],
      ["Who conquered Persia and Egypt in the 4th century BCE?", "Alexander the Great", "He spread Hellenistic culture eastward."],
      ["Which wall defended northern China?", "The Great Wall of China", "Its main sections were built under the Qin and Ming."],
      ["Which civilization built Machu Picchu?", "The Inca Empire", "It ruled the Andes before the Spanish conquest."],
      ["Which writing system did the Maya use?", "Hieroglyphic script with a calendar", "Maya glyphs record dates and events."]
    ]
  }),

  /* ============ MACHINE LEARNING ============ */
  makeGen("machine-learning", "Machine Learning — Completion Banks", {
    "Supervised Learning": [
      ["Which task predicts a continuous value?", "Regression", "Housing price prediction is regression."],
      ["Which task predicts a discrete category?", "Classification", "Spam detection is classification."],
      ["What is labelled data?", "Data with known target outputs", "Labels train supervised models."],
      ["What is a training set?", "Data used to fit the model", "The model learns patterns from it."],
      ["What is a test set?", "Unseen data for evaluation", "It measures generalization."],
      ["Which algorithm separates classes with a hyperplane?", "Support Vector Machine (SVM)", "It maximizes the margin between classes."],
      ["Which algorithm uses nearest neighbours?", "k-Nearest Neighbours (kNN)", "It classifies by majority of nearby points."],
      ["Which algorithm builds decision trees?", "Decision tree / Random Forest", "Forests combine many trees."],
      ["What is overfitting?", "Model fits training noise too well", "It performs poorly on new data."],
      ["What is underfitting?", "Model is too simple", "It fails to capture patterns."],
      ["Which metric suits binary classification?", "Accuracy, precision, recall or F1", "Choice depends on class balance."],
      ["What is cross-validation?", "Splitting data into repeated folds", "It gives a stable performance estimate."]
    ]
  }),

  /* ============ DEEP LEARNING ============ */
  makeGen("deep-learning", "Deep Learning — Completion Banks", {
    "Neural Networks": [
      ["What is a neuron's activation function?", "A non-linear transform of weighted input", "ReLU and sigmoid are common."],
      ["What does the input layer do?", "Receives raw features", "It passes them to hidden layers."],
      ["What is a hidden layer?", "A layer between input and output", "It learns intermediate features."],
      ["What is a weight in a neural network?", "The connection strength between neurons", "Weights are learned during training."],
      ["What is backpropagation?", "Gradient computation through the network", "It updates weights via the chain rule."],
      ["What is an epoch?", "One full pass over the training data", "Several epochs train the network."],
      ["What is a loss function?", "A measure of prediction error", "It guides gradient updates."],
      ["What is gradient descent?", "An optimizer that follows the gradient", "It minimizes the loss."],
      ["Which layer is used for image input?", "Convolutional layers", "CNNs extract spatial features."],
      ["Which layer handles sequence data?", "Recurrent layers (LSTM/GRU)", "They process ordered inputs."],
      ["What is dropout?", "Randomly disabling neurons", "It prevents overfitting."],
      ["What is a learning rate?", "The step size of weight updates", "Too large may diverge; too small is slow."]
    ]
  }),

  /* ============ TYPESCRIPT ============ */
  makeGen("typescript", "TypeScript — Completion Banks", {
    "Tooling": [
      ["Which file configures the TypeScript compiler?", "tsconfig.json", "It sets target, strictness and paths."],
      ["What does tsc do?", "Compiles TypeScript to JavaScript", "tsc reads tsconfig and emits JS."],
      ["Which flag enables strict type checking?", "\"strict\": true", "It turns on all strict options."],
      ["What is a tsconfig target?", "The ECMAScript output version", "ES2020 compiles to modern JS."],
      ["What does --noEmit do?", "Type-checks without emitting files", "It is used in CI and editors."],
      ["What is the Node.js type package?", "@types/node", "It supplies Node's type declarations."],
      ["What does the 'include' field do?", "Lists files to compile", "It restricts the compile scope."],
      ["What is ts-node used for?", "Running TS directly in Node", "It compiles on the fly."],
      ["What is a declaration file?", "A .d.ts file with types only", "It describes JS libraries to TS."],
      ["What does incremental compilation do?", "Caches builds to speed recompiles", "It stores .tsbuildinfo files."]
    ]
  }),

  /* ============ REACT ============ */
  makeGen("react", "React — Completion Banks", {
    "Components and State": [
      ["What is a component?", "A reusable UI building block", "Functions or classes return React elements."],
      ["What is state?", "Data that changes over time", "State changes re-render the component."],
      ["Which hook adds state to a function component?", "useState", "It returns [value, setter]."],
      ["What are props?", "Inputs passed to a component", "Props are read-only."],
      ["What is a functional component?", "A component defined as a function", "It can use hooks."],
      ["What is a class component?", "A component extending React.Component", "It uses lifecycle methods."],
      ["What does the render method do?", "Returns the component's UI", "It describes what to show."],
      ["What is a controlled component?", "Form fields bound to state", "React controls their values."],
      ["What is lifting state up?", "Moving shared state to a parent", "It lets siblings share data."],
      ["What is the key prop used for?", "Identifying list items", "Keys help React track items."]
    ]
  }),

  /* ============ PHP ============ */
  makeGen("php", "PHP — Completion Banks", {
    "Syntax and Output": [
      ["Which tags start a PHP block?", "<?php ... ?>", "PHP code is embedded in these tags."],
      ["Which function prints text in PHP?", "echo", "echo outputs one or more strings."],
      ["Which symbol prefixes a PHP variable?", "$", "Variables start with a dollar sign."],
      ["Which function outputs a formatted string?", "printf", "printf inserts values into a format."],
      ["What does print return?", "1", "print returns 1; echo returns nothing."],
      ["Which keyword declares a constant?", "const (or define())", "define('NAME', value) works globally."],
      ["How do you write a single-line comment in PHP?", "// or #", "Both mark one-line comments."],
      ["Which function concatenates strings?", "The dot operator (.)", "$a . $b joins two strings."],
      ["What is the ternary operator?", "condition ? value1 : value2", "It returns one of two values."],
      ["Which superglobal holds form POST data?", "$_POST", "It stores submitted form values."]
    ]
  }),

  /* ============ C ============ */
  makeGen("c", "C — Completion Banks", {
    "Control Flow": [
      ["Which statement executes code when a condition is true?", "if", "if tests a single condition."],
      ["Which statement chooses among many values?", "switch", "switch compares an expression to cases."],
      ["Which loop runs at least once?", "do-while", "Its condition is tested at the end."],
      ["Which loop tests its condition first?", "while", "It may never execute."],
      ["Which loop is best for counting?", "for", "It bundles init, condition and update."],
      ["Which keyword exits a loop early?", "break", "break jumps out of the current loop."],
      ["Which keyword skips to the next iteration?", "continue", "continue starts the next loop pass."],
      ["Which keyword returns from a function?", "return", "It exits and passes a value."],
      ["What is the else-if construct?", "A chain of conditions", "It tests alternatives sequentially."],
      ["What happens if a switch has no break?", "Execution falls through", "Later cases run until a break."]
    ]
  }),

  /* ============ CPP ============ */
  makeGen("cpp", "C++ — Completion Banks", {
    "Memory and Containers": [
      ["Which operator allocates heap memory?", "new", "new returns a pointer to the object."],
      ["Which operator releases heap memory?", "delete", "delete frees memory allocated by new."],
      ["Which container is a dynamic array?", "std::vector", "It grows automatically."],
      ["Which container stores unique elements?", "std::set", "It keeps sorted unique values."],
      ["Which container maps keys to values?", "std::map", "It provides key-based lookup."],
      ["Which container is a linked list?", "std::list", "It allows fast insertions in the middle."],
      ["Which header provides smart pointers?", "<memory>", "It supplies unique_ptr and shared_ptr."],
      ["What is a dangling pointer?", "A pointer to freed memory", "Using it causes undefined behaviour."],
      ["What is a memory leak?", "Allocated memory never freed", "It drains available memory."],
      ["Which container is a stack (LIFO)?", "std::stack", "It supports push and pop at one end."]
    ],
    "Overloading and Features": [
      ["What is function overloading?", "Same name with different parameters", "The compiler picks by argument types."],
      ["What is operator overloading?", "Defining behaviour for operators", "operator+ can be redefined for classes."],
      ["What is a default argument?", "A parameter with a preset value", "It may be omitted at call time."],
      ["What is a reference in C++?", "An alias to an existing variable", "It must be initialized when declared."],
      ["What does const do to a parameter?", "Prevents modification", "const refs pass data safely."],
      ["What is an inline function?", "Code expanded at the call site", "It reduces function-call overhead."],
      ["What is a lambda?", "An anonymous function", "Lambdas capture variables from scope."],
      ["What is auto?", "Type deduction", "The compiler infers the type."],
      ["What is a friend function?", "A function with private access", "It can use the class's private members."],
      ["What is a namespace for?", "Grouping names", "It avoids name collisions."]
    ]
  }),

  /* ============ CSHARP ============ */
  makeGen("csharp", "C# — Completion Banks", {
    "Language Features": [
      ["What is the base class of all C# types?", "object", "Every type derives from object."],
      ["What is a property?", "A member with get and set accessors", "It wraps a private field."],
      ["What is an interface?", "A contract of members", "Classes implement its members."],
      ["What is generics?", "Type-parameterized code", "List<T> works with any type."],
      ["What is LINQ?", "Language Integrated Query", "It queries collections in C#."],
      ["What is a lambda expression?", "An anonymous method", "x => x * 2 is a lambda."],
      ["What is an extension method?", "A static method adding behaviour", "It extends types without subclassing."],
      ["What is async/await used for?", "Asynchronous operations", "It avoids blocking threads."],
      ["What is a nullable type?", "A value type that can be null", "int? allows null values."],
      ["What is exception handling in C#?", "try/catch/finally blocks", "It manages runtime errors."],
      ["What is the null-conditional operator?", "?.", "It short-circuits on null."],
      ["What is a record?", "An immutable data type", "Records focus on data equality."]
    ]
  }),

  /* ============ GO ============ */
  makeGen("go", "Go — Completion Banks", {
    "Functions and Variables": [
      ["How is a function declared in Go?", "func name(params) returnType", "func add(a, b int) int is valid."],
      ["Which keyword declares a variable?", "var", "var x int = 5."],
      ["What does := do?", "Short variable declaration", "It infers the type and assigns."],
      ["Can a function return multiple values?", "Yes", "return a, b is idiomatic Go."],
      ["What is a variadic function?", "One with a varying argument list", "func sum(nums ...int)."],
      ["What is the blank identifier?", "_", "It discards unused values."],
      ["What is a package?", "A collection of related files", "Every Go file starts with package name."],
      ["What is defer used for?", "Scheduling a call until return", "It runs cleanup automatically."],
      ["What is a receiver?", "The type a method belongs to", "Methods bind to a receiver type."],
      ["What is the zero value of an int?", "0", "Variables initialize to zero values."]
    ],
    "Types and Tooling": [
      ["Which tool runs Go tests?", "go test", "It runs *_test.go files."],
      ["Which tool formats code?", "gofmt", "It enforces canonical formatting."],
      ["Which tool manages dependencies?", "go mod", "It handles modules and go.mod."],
      ["What is a slice?", "A dynamic array view", "Slices reference underlying arrays."],
      ["What is a map in Go?", "A key-value store", "m := make(map[string]int)."],
      ["What is a struct?", "A collection of fields", "It groups related data."],
      ["What is an interface in Go?", "A set of method signatures", "Types satisfy interfaces implicitly."],
      ["What is a goroutine?", "A lightweight concurrent function", "go f() runs it concurrently."],
      ["Which tool checks for race conditions?", "go test -race", "The race detector flags data races."],
      ["What does go build do?", "Compiles to an executable", "It produces a binary."]
    ]
  }),

  /* ============ RUST ============ */
  makeGen("rust", "Rust — Completion Banks", {
    "Traits and Tooling": [
      ["What is a trait?", "A set of shared behaviour", "Traits define methods types can implement."],
      ["Which command creates a new project?", "cargo new", "It scaffolds a Cargo project."],
      ["Which command builds a project?", "cargo build", "It compiles and links the crate."],
      ["Which command runs tests?", "cargo test", "It executes #[test] functions."],
      ["What is the borrow checker?", "A compile-time memory safety checker", "It enforces ownership rules."],
      ["What does & mean in Rust?", "A shared (immutable) reference", "It borrows without ownership."],
      ["What does &mut mean?", "A mutable reference", "It allows exclusive mutation."],
      ["What is a generic function?", "One parameterized by a type", "fn foo<T>(x: T)."],
      ["What is a derive attribute?", "Automatic trait implementation", "#[derive(Debug)] adds Debug."],
      ["What is cargo fmt?", "The code formatter", "It standardizes style."]
    ]
  })
];
