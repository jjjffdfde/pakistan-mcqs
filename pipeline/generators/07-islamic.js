/* ============================================================
   Generator file 07 — Islamic Studies
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
  makeGen("islamic-studies", "Islamic Studies — Core Knowledge", {
    "Pillars and Worship": [
      ["How many pillars does Islam have?", "5", "Shahada, Salah, Zakat, Sawm and Hajj."],
      ["Which is the first pillar of Islam?", "Shahada (declaration of faith)", "The Shahada declares belief in one God and Muhammad as His messenger."],
      ["How many daily prayers are obligatory?", "5", "Fajr, Zuhr, Asr, Maghrib and Isha."],
      ["Which prayer is performed before sunrise?", "Fajr", "Fajr is the dawn prayer."],
      ["Which prayer is performed after sunset?", "Maghrib", "Maghrib follows sunset."],
      ["What is Zakat?", "obligatory charity on wealth", "Zakat is a 2.5% levy on qualifying savings."],
      ["What is Sawm?", "fasting in Ramadan", "Fasting runs from dawn to sunset in Ramadan."],
      ["Which month is the fasting month?", "Ramadan", "Ramadan is the ninth month of the Islamic calendar."],
      ["What is Hajj?", "the pilgrimage to Makkah", "Hajj is obligatory for able Muslims once in a lifetime."],
      ["Which month is Hajj performed?", "Dhul-Hijjah", "Hajj rites occur in the first ten days of Dhul-Hijjah."],
      ["What is the Qibla?", "the direction of prayer", "Muslims pray facing the Kaaba in Makkah."],
      ["What is Eid al-Fitr?", "the festival ending Ramadan", "Eid al-Fitr follows the fast of Ramadan."]
    ],
    "Quran and Hadith": [
      ["How many chapters (surahs) does the Quran have?", "114", "The Quran contains 114 surahs."],
      ["Which is the first surah of the Quran?", "Al-Fatiha", "Al-Fatiha (The Opening) is the first surah."],
      ["Which is the longest surah?", "Al-Baqarah", "Al-Baqarah has 286 verses."],
      ["Which is the shortest surah?", "Al-Kawthar", "Al-Kawthar has just 3 verses."],
      ["In which language was the Quran revealed?", "Arabic", "The Quran was revealed in classical Arabic."],
      ["What is a Hadith?", "a saying or action of the Prophet (PBUH)", "Hadiths record the Sunnah."],
      ["Which book is the most authentic hadith collection?", "Sahih al-Bukhari", "Sahih al-Bukhari is the most trusted hadith compilation."],
      ["Which is the second most authentic hadith book?", "Sahih Muslim", "Sahih Muslim ranks second in authenticity."],
      ["What is the Sunnah?", "the Prophet's practice", "Sunnah includes his sayings, actions and approvals."],
      ["Which angel brought revelation to Prophet Muhammad (PBUH)?", "Jibril (Gabriel)", "Angel Jibril delivered the Quranic revelation."],
      ["Which surah is called the 'Heart of the Quran'?", "Ya-Sin", "Surah Ya-Sin is widely known by that name."],
      ["Which surah is the 'Mother of the Quran'?", "Al-Fatiha", "Al-Fatiha is also called Umm al-Kitab."]
    ],
    "Prophets and History": [
      ["Who is the last prophet of Islam?", "Muhammad (PBUH)", "He is the final messenger of God."],
      ["Who is considered the father of the prophets?", "Ibrahim (Abraham)", "Prophets descend from his line."],
      ["Which prophet built the Kaaba with his son?", "Ibrahim and Ismail", "They raised the foundations of the Kaaba."],
      ["Which prophet received the Torah?", "Musa (Moses)", "The Torah was revealed to Prophet Musa."],
      ["Which prophet received the Psalms (Zabur)?", "Dawud (David)", "The Zabur was given to Prophet Dawud."],
      ["Which prophet received the Gospel (Injeel)?", "Isa (Jesus)", "The Injeel was revealed to Prophet Isa."],
      ["Which prophet was swallowed by a whale?", "Yunus (Jonah)", "Yunus was saved after his du'a in the whale's belly."],
      ["Which prophet is known as 'Khalilullah' (friend of God)?", "Ibrahim", "Ibrahim holds the title Khalilullah."],
      ["Which prophet is called 'Kalimullah' (speaker with God)?", "Musa", "Musa spoke directly with God."],
      ["How many prophets are named in the Quran?", "25", "Twenty-five prophets are mentioned by name."],
      ["When did the Prophet Muhammad (PBUH) migrate to Madinah?", "622 CE", "The Hijrah marks the start of the Islamic calendar."],
      ["Which city hosted the Prophet's migration?", "Madinah (Yathrib)", "The Prophet migrated to Madinah in 622 CE."],
      ["Which battle was fought in the second year of Hijrah?", "Badr", "The Battle of Badr was a decisive early victory."],
      ["In which year did Makkah fall to the Muslims?", "8 AH", "Makkah was conquered peacefully in 8 AH."],
      ["What is the Hijri year of the Prophet's passing?", "11 AH", "The Prophet (PBUH) passed away in 11 AH (632 CE)."]
    ],
    "Fiqh and Terms": [
      ["What is Fiqh?", "Islamic jurisprudence", "Fiqh interprets shariah rules for daily life."],
      ["What is a fatwa?", "a religious ruling", "Fatwas answer questions of Islamic law."],
      ["What is Halal?", "permitted in Islam", "Halal covers lawful food, actions and earnings."],
      ["What is Haram?", "forbidden in Islam", "Haram includes prohibited foods and acts."],
      ["What is a Masjid?", "a mosque (place of prostration)", "The mosque is the Muslim place of worship."],
      ["What is the Adhan?", "the call to prayer", "The adhan summons Muslims to salah."],
      ["What is Wudu?", "ablution before prayer", "Wudu cleanses parts of the body before salah."],
      ["What is a Janazah prayer?", "the funeral prayer", "Janazah is performed for a deceased Muslim."],
      ["What is Sadaqah?", "voluntary charity", "Sadaqah is extra giving beyond Zakat."],
      ["What is Ijma?", "consensus of scholars", "Ijma is a source of Islamic law after Quran and Sunnah."],
      ["What is Qiyas?", "analogical reasoning in law", "Qiyas applies rulings to new cases by analogy."],
      ["What is a Muezzin?", "the caller to prayer", "The muezzin recites the adhan."]
    ]
  })
];
