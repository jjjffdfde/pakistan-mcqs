/* ============================================================
   Deep Knowledge KB — Islamic Studies
   ~18 topics x dense concepts (list/pair/fact/tf/order/numeric)
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["islamic-studies"],
  chapter: "Islamic Studies — Deep Knowledge Bank",
  tags: ["islamic-studies", "deep-kb", "quran", "hadith", "seerah", "fiqh"],
  topics: {

    "Pillars of Islam": [
      {
        kind: "list", name: "The Five Pillars", group: "the Five Pillars of Islam",
        note: "Islam rests on five obligatory pillars: Shahadah, Salah, Sawm, Zakat and Hajj.",
        items: ["Shahadah", "Salah", "Sawm", "Zakat", "Hajj"],
        outsiders: ["Tawaf", "Itikaf", "Aqiqah", "Khums", "Tasbih", "Adhan", "Jihad", "Umrah"],
        trick: "Memorize 'S-S-S-Z-H': Shahadah, Salah, Sawm, Zakat, Hajj.",
        tip: "Exams always ask which act is NOT one of the Five Pillars; Tawaf and Umrah are common traps."
      },
      {
        kind: "pair", a: "pillar", b: "core meaning",
        note: "Each pillar of Islam carries a distinct core meaning that examiners love to test.",
        pairs: [
          ["Shahadah", "declaration of faith"], ["Salah", "five daily prayers"], ["Sawm", "fasting in Ramadan"],
          ["Zakat", "obligatory charity"], ["Hajj", "pilgrimage to Makkah"]
        ],
        trick: "Shahadah = speak, Salah = pray, Sawm = fast, Zakat = give, Hajj = visit Makkah.",
        tip: "Link each pillar to one verb: declare, pray, fast, give, pilgrimage."
      },
      {
        kind: "fact", name: "Shahadah",
        note: "The Shahadah is the first pillar and the gateway to Islam.",
        facts: [
          ["Which act formally brings a person into Islam?", "Reciting the Shahadah", "The Shahadah, declaring the oneness of Allah and the prophethood of Muhammad (PBUH), is the formal entry into Islam, so reciting it with conviction makes one a Muslim."],
          ["How many parts does the Shahadah contain?", "Two", "The Shahadah has two clauses: bearing witness that there is no god but Allah, and that Muhammad (PBUH) is His Messenger, therefore the correct count is two."],
          ["What is the literal meaning of Shahadah?", "Testimony", "The Arabic word shahadah means testimony or witnessing, which is why it describes the verbal witness that forms the foundation of faith."],
          ["Which pillar is known as the foundation of Islam?", "Shahadah", "Since every other pillar and act of worship depends on faith, the declaration of faith is conventionally called the foundation of Islam."],
          ["On what condition does the Shahadah become acceptable?", "Sincere belief in the heart", "Islamic scholars hold that the tongue's declaration must be matched by heartfelt conviction, because faith without sincerity is not accepted."]
        ],
        trick: "Shahadah = 'testimony' — the statement that opens the door to Islam.",
        tip: "Two-part Shahadah and 'testimony' meaning are favourite one-mark questions."
      },
      {
        kind: "tf", name: "the Five Pillars",
        note: "These true/false statements test the precise details of the Five Pillars.",
        statements: [
          ["Salah is the second pillar of Islam after the Shahadah.", "Zakat is the second pillar of Islam before Salah."],
          ["Sawm means fasting from dawn to sunset in Ramadan.", "Sawm means giving charity during Ramadan."],
          ["Zakat is paid once a year on wealth above the nisab threshold.", "Zakat is paid five times a day with Salah."],
          ["Hajj is obligatory once in a lifetime for those able to afford it.", "Hajj is obligatory five times in a lifetime."],
          ["The Five Pillars are Shahadah, Salah, Sawm, Zakat and Hajj.", "The Five Pillars are Shahadah, Salah, Sawm, Zakat and Jihad."]
        ],
        trick: "Watch the trap: Jihad replaces Hajj in the fake pillar list.",
        tip: "True/false stems on pillars always twist the order or the fifth pillar."
      }
    ],

    "Quran — Structure and Surahs": [
      {
        kind: "fact", name: "the Holy Quran",
        note: "The Quran is the revealed book of Islam; its structural facts are frequently examined.",
        facts: [
          ["How many surahs does the Holy Quran contain?", "114", "The Holy Quran is divided into 114 surahs (chapters), a well-established structural fact tested in almost every Islamic Studies paper."],
          ["How many juz (parts) is the Quran divided into?", "30", "For ease of recitation the Quran is partitioned into 30 equal juz, each further split into four hizb."],
          ["Which is the longest surah of the Quran?", "Al-Baqarah", "Surah Al-Baqarah, the second surah with 286 verses, is the longest chapter of the Holy Quran."],
          ["Which is the shortest surah of the Quran?", "Al-Kawthar", "Surah Al-Kawthar has only three verses, making it the shortest chapter of the Holy Quran."],
          ["Which surah is called the 'Heart of the Quran'?", "Ya-Sin", "Surah Ya-Sin (36) is widely known as the heart of the Quran because of its central message and frequent recitation."],
          ["Which surah is referred to as the 'Mother of the Quran'?", "Al-Fatiha", "Surah Al-Fatiha, the opening chapter recited in every rakat, is known as Umm-ul-Quran, the Mother of the Quran."],
          ["Which surah is known as the 'Bride of the Quran'?", "Ar-Rahman", "Surah Ar-Rahman (55) is poetically called the bride of the Quran because of its beauty and repeated verse 'Which of the favours...'."],
          ["How many verses (ayah) does the Quran contain approximately?", "6,236", "The commonly cited total is about 6,236 ayahs across all surahs, though numbering varies slightly by printing tradition."],
          ["In which language was the Quran revealed?", "Arabic", "The Quran was revealed in clear Arabic, and its preservation and recitation remain in that original language."],
          ["Which surah is the last (114th) chapter of the Quran?", "An-Nas", "Surah An-Nas ('Mankind') closes the Quran as the 114th chapter, and with Al-Falaq forms the two protective surahs."]
        ],
        trick: "114 surahs, 30 juz, 6,236 ayahs — the three structural numbers to memorise.",
        tip: "Names like Umm-ul-Quran (Al-Fatiha), Heart (Ya-Sin), Bride (Ar-Rahman) are recurring exam questions."
      },
      {
        kind: "pair", a: "surah", b: "theme",
        note: "Every surah has a recognised central theme that the pair questions test.",
        pairs: [
          ["Al-Fatiha", "the opening prayer and praise of Allah"], ["Al-Baqarah", "laws, guidance and the cow of Bani Israel"],
          ["Al-Ikhlas", "the pure oneness of Allah"], ["Ya-Sin", "the heart of the Quran"], ["Ar-Rahman", "the mercy of Allah"],
          ["Al-Kawthar", "abundant good and the Prophet's blessing"], ["Al-Falaq", "seeking refuge from evil"], ["An-Nas", "seeking refuge from whisperings"]
        ],
        trick: "Ikhlas = oneness; Falaq and Nas = refuge; Rahman = mercy; Kawthar = abundance.",
        tip: "Theme-to-surah matching is a classic one-marker; Al-Ikhlas is always 'oneness'."
      },
      {
        kind: "order", name: "the first five surahs of the Quran",
        note: "The opening order of the Quran follows: Fatiha, Baqarah, Aal-Imran, An-Nisa, Al-Ma'idah.",
        ordered: ["Al-Fatiha", "Al-Baqarah", "Aal-Imran", "An-Nisa", "Al-Ma'idah"],
        trick: "F-B-I-N-M: Fatiha, Baqarah, Imran, Nisa, Ma'idah.",
        tip: "Sequence questions on the first five surahs appear in many past papers."
      },
      {
        kind: "tf", name: "Quranic facts",
        note: "Statement-based questions check precise Quranic structural knowledge.",
        statements: [
          ["The Quran has 114 surahs and 30 juz.", "The Quran has 104 surahs and 40 juz."],
          ["Surah Al-Baqarah is the longest chapter of the Quran.", "Surah Al-Fatiha is the longest chapter of the Quran."],
          ["Surah Al-Ikhlas teaches the absolute oneness of Allah.", "Surah Al-Ikhlas describes the rules of inheritance."],
          ["The Quran was revealed in Arabic.", "The Quran was originally revealed in Persian."],
          ["Al-Fatiha is the opening surah recited in every rakat of Salah.", "Al-Baqarah is the opening surah recited in every rakat of Salah."]
        ],
        trick: "Numbers 114/30 and 'Arabic' are the anchors; traps swap them.",
        tip: "When a statement mixes two true halves, it is false — check every clause."
      }
    ],

    "Salah and Wudu": [
      {
        kind: "pair", a: "prayer", b: "obligatory rakat",
        note: "The daily obligatory prayers each carry a fixed number of rakat.",
        pairs: [
          ["Fajr", "2"], ["Zuhr", "4"], ["Asr", "4"], ["Maghrib", "3"], ["Isha", "4"]
        ],
        trick: "Fajr 2, Maghrib 3, the rest 4 — only two prayers are not four rakat.",
        tip: "Rakat counts are the single most tested Salah fact in entry tests."
      },
      {
        kind: "list", name: "obligatory daily prayers", group: "the five obligatory daily prayers",
        note: "Salah is performed five times daily at fixed times.",
        items: ["Fajr", "Zuhr", "Asr", "Maghrib", "Isha"],
        outsiders: ["Tahajjud", "Witr", "Chasht", "Ishraq", "Jumma", "Taraweeh"],
        trick: "F-Z-A-M-I order through the day: Fajr, Zuhr, Asr, Maghrib, Isha.",
        tip: "Tahajjud (optional night prayer) is the classic fake member in NOT questions."
      },
      {
        kind: "fact", name: "Wudu",
        note: "Wudu (ablution) purifies before prayer; its obligatory parts are fixed.",
        facts: [
          ["How many parts of the body are obligatory to wash in Wudu?", "Four", "Wudu obligates washing the face, forearms, wiping the head, and washing the feet, so the answer is four."],
          ["Which prayer has no fixed rakat and is performed between Isha and Fajr?", "Tahajjud", "Tahajjud is the voluntary night prayer whose rakat are not fixed, performed after waking in the latter part of the night."],
          ["What is the Arabic term for the call to prayer?", "Adhan", "The call that summons Muslims to prayer is called the Adhan, delivered by a muezzin."],
          ["What direction must a Muslim face during Salah?", "The Qibla", "Salah is performed facing the Qibla, the direction of the Kaaba in Makkah."],
          ["Which surah is obligatory to recite in every rakat?", "Al-Fatiha", "Recitation of Surah Al-Fatiha in every rakat is obligatory, because no prayer is complete without it."],
          ["What is the congregational Friday prayer called?", "Jumu'ah", "The Friday noon prayer, Jumu'ah, replaces Zuhr and is preceded by a sermon (khutbah)."],
          ["Which prayer is offered during the Eid festivals?", "Salat al-Eid", "The two Eid prayers, Salat al-Eid, are offered in congregation in the open on Eid al-Fitr and Eid al-Adha."]
        ],
        trick: "Four parts for Wudu; Qibla = Kaaba direction; Adhan = call; Fatiha = every rakat.",
        tip: "'Adhan', 'Qibla', 'Jumu'ah' are the vocabulary anchors examiners reuse constantly."
      },
      {
        kind: "tf", name: "Salah and Wudu",
        note: "True/false stems on the details of prayer practice.",
        statements: [
          ["The Qibla is the direction of the Kaaba in Makkah.", "The Qibla is the direction of the Prophet's Mosque in Madinah."],
          ["Jumu'ah is the Friday congregational prayer replacing Zuhr.", "Jumu'ah is the prayer offered after the death of a Muslim."],
          ["Adhan is the call to prayer recited before Salah.", "Adhan is the sermon delivered during Friday prayer."],
          ["Fajr has two obligatory rakat.", "Fajr has four obligatory rakat."],
          ["Wudu must be performed before Salah when one is in a state of minor impurity.", "Wudu must be performed before Fajr only."]
        ],
        trick: "Trap pattern: swap Madinah for Makkah, or sermon for call.",
        tip: "When in doubt, the Kaaba-direction fact is the true one."
      }
    ],

    "Zakat, Sawm and Charity": [
      {
        kind: "numeric", name: "Zakat calculation", difficulty: "medium",
        note: "Zakat is 2.5% (one fortieth) of wealth above the nisab threshold, calculated on the value of savings and valuables held for a lunar year.",
        q: (v) => `A person has savings of Rs ${v.s.toLocaleString()} after a full year. At the Zakat rate of 2.5%, how much Zakat must be paid?`,
        a: (v) => `Rs ${Math.round(v.s * 0.025).toLocaleString()}`,
        e: (v) => `Zakat equals 2.5% of the wealth, so ${(v.s / 1000).toFixed(0)} × 2.5/100 = Rs ${Math.round(v.s * 0.025).toLocaleString()}, because one fortieth of the savings is due.`,
        distract: (v) => {
          const z = Math.round(v.s * 0.025);
          const cand = [Math.round(z * 1.1), Math.round(z * 0.8), Math.round(z * 1.5), Math.round(z * 0.5), Math.round(z + 100), Math.round(z - 250)];
          return cand.map((x) => `Rs ${x.toLocaleString()}`);
        },
        vals: (rng) => ({ s: Math.round((50 + rng() * 950) * 1000) }),
        whyWrong: (v) => [`Rs ${Math.round(v.s * 0.025).toLocaleString()} is the correct 2.5% figure; other values come from wrong percentages.`],
        trick: "Zakat = 2.5% = one fortieth; divide wealth by 40 for a quick check.",
        tip: "Rate questions appear in both Islamic Studies and Math papers; always apply 2.5%."
      },
      {
        kind: "numeric", name: "Nisab of gold in rupees", difficulty: "medium",
        note: "The nisab threshold for Zakat is about 87.48 grams of gold; a person pays Zakat only when wealth crosses this threshold.",
        q: (v) => `Gold is priced at Rs ${v.price} per gram. A saver owns ${v.g} grams of gold. What is the approximate value of this gold?`,
        a: (v) => `Rs ${(v.price * v.g).toLocaleString()}`,
        e: (v) => `The value is the weight multiplied by the price: ${v.g} g × Rs ${v.price} = Rs ${(v.price * v.g).toLocaleString()}, because the gold price is quoted per gram.`,
        distract: (v) => {
          const c = v.price * v.g;
          return [`Rs ${Math.round(c * 1.15).toLocaleString()}`, `Rs ${Math.round(c * 0.85).toLocaleString()}`, `Rs ${Math.round(c / 87.48 * 40).toLocaleString()}`, `Rs ${Math.round(c * 0.5).toLocaleString()}`, `Rs ${Math.round(c + 5000).toLocaleString()}`];
        },
        vals: (rng) => ({ price: 10000 + Math.floor(rng() * 9000), g: Math.round((60 + rng() * 60)) }),
        whyWrong: (v) => [`Only weight × price gives the correct gold value used to compare with the nisab.`],
        trick: "Compare the value against 87.48 g × price to see if Zakat is due.",
        tip: "Nisab questions test both the 87.48 g figure and the value calculation."
      },
      {
        kind: "fact", name: "Sawm",
        note: "Fasting in Ramadan is the fourth pillar; its rules and exceptions are heavily tested.",
        facts: [
          ["In which Islamic month is fasting obligatory?", "Ramadan", "Sawm is observed during Ramadan, the ninth month of the Islamic calendar, because the Quran began its revelation in this month."],
          ["Which meal is taken before dawn during Ramadan?", "Suhoor", "The pre-dawn meal that strengthens the fasting person is called Suhoor, taken before the Fajr time begins."],
          ["Which meal breaks the fast at sunset?", "Iftar", "The fast is opened at sunset with Iftar, traditionally beginning with dates, as the Prophet (PBUH) recommended."],
          ["Who is EXEMPT from fasting in Ramadan?", "A traveller on a journey", "The Quran exempts the sick and travellers from fasting, requiring them to make up the days later, which is why they are permitted not to fast."],
          ["What is the charity given at the end of Ramadan called?", "Zakat-ul-Fitr", "Zakat-ul-Fitr is the charity distributed before the Eid prayer so the poor can celebrate Eid, and it is obligatory on every Muslim who can afford it."],
          ["Which night of Ramadan is believed to be the Night of Power?", "27th", "Laylat-ul-Qadr, the Night of Power when the Quran was revealed, is most commonly observed on the 27th night of Ramadan."],
          ["What is the Arabic word for the Night of Power?", "Laylat-ul-Qadr", "The Night of Power is called Laylat-ul-Qadr, a night described as better than a thousand months in Surah Al-Qadr."],
          ["What is the voluntary late-night prayer of Ramadan called?", "Taraweeh", "Taraweeh is the voluntary night prayer performed in congregation during Ramadan after the Isha prayer."]
        ],
        trick: "Suhoor = pre-dawn, Iftar = sunset, Fitr = end-of-Ramadan charity, Qadr = 27th.",
        tip: "Traveller exemption and Zakat-ul-Fitr timing (before Eid prayer) are classic traps."
      },
      {
        kind: "tf", name: "Zakat and Sawm",
        note: "True/false stems on the rules of Zakat and fasting.",
        statements: [
          ["Zakat is calculated at 2.5% of qualifying wealth held for a year.", "Zakat is calculated at 25% of income each month."],
          ["Zakat-ul-Fitr is given before the Eid prayer.", "Zakat-ul-Fitr is given during Hajj only."],
          ["Suhoor is the meal taken before dawn during Ramadan.", "Suhoor is the meal taken to break the fast at sunset."],
          ["The sick and travellers are exempt from fasting and make up days later.", "The sick and travellers are permanently excused from fasting."],
          ["Laylat-ul-Qadr is better than a thousand months.", "Laylat-ul-Qadr is the last day of Shawwal."]
        ],
        trick: "Exemption = make up later; Qadr = thousand months; Fitr = before Eid prayer.",
        tip: "Any statement that mislabels Suhoor/Iftar or Fitr timing is automatically false."
      }
    ],

    "Hajj and Umrah": [
      {
        kind: "order", name: "the main order of Hajj rituals",
        note: "The classical order runs: Ihram at the Miqat, Tawaf, Sa'i between Safa and Marwah, Arafat, Muzdalifah, stoning at Mina, and the final Tawaf al-Ifadah.",
        ordered: ["Ihram", "Tawaf of the Kaaba", "Sa'i between Safa and Marwah", "Standing at Arafat", "Staying at Muzdalifah", "Ramy (stoning) at Mina"],
        trick: "I-T-S-A-M-R: Ihram, Tawaf, Sa'i, Arafat, Muzdalifah, Ramy.",
        tip: "Arafat on the 9th of Dhul-Hijjah is the 'essential' day of Hajj — asked constantly."
      },
      {
        kind: "pair", a: "ritual", b: "meaning",
        note: "Each Hajj ritual carries a fixed meaning; pair questions test the vocabulary.",
        pairs: [
          ["Tawaf", "circling the Kaaba seven times"], ["Sa'i", "walking seven times between Safa and Marwah"],
          ["Ramy", "stoning the pillars at Mina"], ["Wuquf", "standing at Arafat"], ["Ihram", "the pilgrim's state of consecration"]
        ],
        trick: "Tawaf = circle, Sa'i = walk Safa-Marwah, Ramy = stones, Wuquf = stand.",
        tip: "'Ihram' (state + two white sheets) is a vocabulary favourite."
      },
      {
        kind: "fact", name: "Hajj",
        note: "Hajj is the fifth pillar; its places, dates and vocabulary are standard exam material.",
        facts: [
          ["In which Islamic month does Hajj take place?", "Dhul-Hijjah", "Hajj is performed in Dhul-Hijjah, the twelfth month of the Islamic calendar, with the core rites on the 8th to 10th."],
          ["Where does the pilgrim stand on the 9th of Dhul-Hijjah?", "Arafat", "Standing at Arafat on the 9th of Dhul-Hijjah is the essential rite of Hajj, as the Prophet (PBUH) declared 'Hajj is Arafat'."],
          ["What is the cloth worn by male pilgrims during Hajj called?", "Ihram", "Male pilgrims wear two unsewn white sheets called Ihram, symbolising equality before Allah."],
          ["What is the small pilgrimage performed at any time of year called?", "Umrah", "Umrah can be performed any time of year and consists of Tawaf and Sa'i without the Arafat rites, unlike Hajj."],
          ["Which city is the spiritual birthplace of Prophet Muhammad (PBUH)?", "Makkah", "Prophet Muhammad (PBUH) was born in Makkah, the city of the Kaaba, which remains the most sacred city in Islam."],
          ["Which mosque is the second holiest in Islam?", "Masjid an-Nabawi", "The Prophet's Mosque (Masjid an-Nabawi) in Madinah is the second holiest mosque, after the Masjid al-Haram in Makkah."],
          ["What is the black structure at the centre of the Masjid al-Haram called?", "The Kaaba", "The Kaaba is the cubic black-draped structure at the centre of the Grand Mosque in Makkah that Muslims face in prayer."],
          ["What is the well near the Kaaba whose water pilgrims drink called?", "Zamzam", "The Zamzam well lies beside the Kaaba; pilgrims drink its water, recalling the miraculous spring given to Hajar and Ismail."]
        ],
        trick: "Hajj = Dhul-Hijjah + Arafat; Umrah = any time, no Arafat; Kaaba in Makkah, Nabawi in Madinah.",
        tip: "'Hajj is Arafat' is a hadith-based one-liner that appears verbatim in tests."
      },
      {
        kind: "list", name: "cities with sacred sites", group: "cities holding the sacred sites of Hajj",
        note: "Makkah, Mina, Arafat, Muzdalifah and Madinah are the cities/sites of the pilgrimage.",
        items: ["Makkah", "Mina", "Arafat", "Muzdalifah", "Madinah"],
        outsiders: ["Cairo", "Baghdad", "Damascus", "Karbala", "Istanbul", "Jerusalem"],
        trick: "All five are in Saudi Arabia and linked to Hajj; foreign cities are the traps.",
        tip: "Jerusalem (third holiest city) is the tempting foreign distractor."
      }
    ],

    "Hadith and Sunnah": [
      {
        kind: "pair", a: "collection", b: "compiler",
        note: "The six canonical hadith collections are named after their compilers.",
        pairs: [
          ["Sahih al-Bukhari", "Imam Bukhari"], ["Sahih Muslim", "Imam Muslim"], ["Sunan Abu Dawud", "Imam Abu Dawud"],
          ["Jami at-Tirmidhi", "Imam Tirmidhi"], ["Sunan an-Nasa'i", "Imam an-Nasa'i"], ["Sunan Ibn Majah", "Ibn Majah"]
        ],
        trick: "The six books = Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah.",
        tip: "Sahih al-Bukhari is 'the most authentic book after the Quran' — a standard fact."
      },
      {
        kind: "fact", name: "Hadith",
        note: "Hadith terminology and the most authentic collections are core exam topics.",
        facts: [
          ["Which hadith collection is considered the most authentic after the Quran?", "Sahih al-Bukhari", "Scholars unanimously rank Sahih al-Bukhari first in authenticity among hadith books, because Imam Bukhari applied the strictest conditions for accepting narrations."],
          ["Which collection ranks second in authenticity?", "Sahih Muslim", "Sahih Muslim follows Sahih al-Bukhari in authority, and together the two are called the Sahihain."],
          ["What does the term 'Sahih' mean in hadith science?", "Authentic", "Sahih means authentic or sound, describing a hadith whose chain and text meet the highest standards of reliability."],
          ["What is a hadith narrated by many reliable chains called?", "Mutawatir", "Mutawatir hadith are transmitted by so many independent chains that fabrication becomes impossible."],
          ["What is the chain of narrators in a hadith called?", "Sanad", "The sanad is the chain of narrators linking the hadith to the Prophet (PBUH), and its verification is the core of hadith science."],
          ["What is the text of the hadith itself called?", "Matn", "The matn is the actual text of the hadith, examined alongside the sanad for consistency and authenticity."],
          ["Who is known as the 'Amin (trustworthy) of the Ummah'?", "Abu Ubaydah ibn al-Jarrah", "The Prophet (PBUH) named Abu Ubaydah ibn al-Jarrah the trustworthy one of this nation, a title he alone received."],
          ["Which famous hadith states that actions are judged by intentions?", "Innamal a'malu bin-niyyah", "The hadith 'Actions are judged by intentions' opens Sahih al-Bukhari, because intention determines the worth of every deed."]
        ],
        trick: "Bukhari first, Muslim second; Sahih = authentic; sanad = chain; matn = text; mutawatir = many chains.",
        tip: "'Actions judged by intentions' and the Sahihain ranking are the two most asked hadith facts."
      },
      {
        kind: "tf", name: "Hadith terminology",
        note: "Statement stems check the precise vocabulary of hadith science.",
        statements: [
          ["Sahih al-Bukhari is the most authentic hadith collection after the Quran.", "Sahih Muslim is the most authentic hadith collection after the Quran."],
          ["Sanad is the chain of narrators of a hadith.", "Sanad is the text of the hadith itself."],
          ["Mutawatir hadith are transmitted through numerous independent chains.", "Mutawatir hadith are narrated by a single weak narrator."],
          ["Matn is the text of the hadith.", "Matn is the biography of a narrator."],
          ["The Sahihain are Sahih al-Bukhari and Sahih Muslim.", "The Sahihain are Sahih al-Bukhari and Sunan Abu Dawud."]
        ],
        trick: "Sanad = chain, Matn = text — the two swap in every trap statement.",
        tip: "Whenever 'chain' and 'text' are mispaired, the statement is false."
      }
    ],

    "Seerah — Makkah and Madinah": [
      {
        kind: "fact", name: "early life of the Prophet",
        note: "The Prophet's birth, family and early life form the opening of every Seerah syllabus.",
        facts: [
          ["In which year was Prophet Muhammad (PBUH) born?", "571 CE (Year of the Elephant)", "The Prophet (PBUH) was born in 571 CE, the same year of the Abraha elephant incident, in the month of Rabi-ul-Awwal."],
          ["Who was the grandfather who raised the orphaned Prophet?", "Abdul Muttalib", "After the death of his mother Aminah, the young Prophet was raised by his grandfather Abdul Muttalib, then by his uncle Abu Talib."],
          ["Which uncle raised the Prophet (PBUH) after his grandfather's death?", "Abu Talib", "On the death of Abdul Muttalib, Abu Talib took responsibility for his nephew, and he continued to protect him for decades."],
          ["What was the Prophet's (PBUH) occupation before prophethood?", "Trade and commerce", "The Prophet (PBUH) worked as a merchant and trader, earning the title Al-Amin for his honesty in business."],
          ["What title did the Makkans give the Prophet (PBUH) for his honesty?", "Al-Amin", "Before prophethood the Makkans called him Al-Amin, the trustworthy one, because of his flawless honesty in trade."],
          ["Which lady did the Prophet (PBUH) marry first?", "Khadijah bint Khuwaylid", "Khadijah, a respected businesswoman, became the Prophet's first wife and the first person to embrace Islam."],
          ["Who was the first person to accept Islam?", "Khadijah", "Khadijah accepted Islam immediately after the first revelation, making her the first Muslim and the Prophet's first supporter."],
          ["Who was the first male to accept Islam?", "Abu Bakr (RA)", "Abu Bakr Siddiq was the first adult male to embrace Islam, and his conversion is universally recorded in the Seerah."],
          ["Who was the first child to accept Islam?", "Ali (RA)", "Ali ibn Abi Talib, the Prophet's cousin who lived in his household, was the first child to accept Islam."],
          ["At what age did the Prophet (PBUH) receive the first revelation?", "40", "The first revelation came in the cave of Hira when the Prophet was forty years old, beginning with the word 'Iqra' (Read)."],
          ["Where was the first revelation received?", "Cave of Hira", "The Angel Jibreel brought the first verses in the Cave of Hira on Mount Nur near Makkah, beginning the Quranic revelation."]
        ],
        trick: "571 born, 40 at revelation, Hira = first cave, Khadijah/Abu Bakr/Ali = first believers.",
        tip: "The 'firsts' of Islam (first Muslim, first male, first child) are guaranteed marks."
      },
      {
        kind: "order", name: "the order of the Prophet's key early companions and events",
        note: "The Seerah milestones follow: birth 571, first revelation, first believers, open preaching, migration to Abyssinia, migration to Madinah.",
        ordered: ["Birth in 571 CE", "First revelation at Hira", "Khadijah accepts Islam", "Migration to Abyssinia", "Migration to Madinah (Hijrah)"],
        trick: "Revelation before Hijrah; Abyssinia (615) before Madinah (622).",
        tip: "Hijrah to Madinah (622) starts the Islamic calendar — always the latest of these."
      },
      {
        kind: "fact", name: "Hijrah",
        note: "The migration to Madinah reshaped Islam; its dates and events are core facts.",
        facts: [
          ["In which year did the Hijrah (migration) to Madinah take place?", "622 CE", "The Hijrah to Madinah in 622 CE marks year one of the Islamic calendar, the event after which Islam gained a state."],
          ["Which city welcomed the Prophet (PBUH) after the Hijrah?", "Madinah", "The Prophet migrated to Madinah (then Yathrib), which welcomed him and became the first Islamic state."],
          ["What was Madinah called before the Hijrah?", "Yathrib", "The city of Madinah was known as Yathrib before the Prophet's arrival and the blessed migration renamed it Madinah."],
          ["Which companion accompanied the Prophet (PBUH) in the cave during the Hijrah?", "Abu Bakr (RA)", "Abu Bakr accompanied the Prophet in the Cave of Thawr during the Hijrah, an event praised in Surah At-Tawbah."],
          ["In which cave did the Prophet and Abu Bakr hide during the Hijrah?", "Cave of Thawr", "The two hid in the Cave of Thawr outside Makkah while the Quraysh searched for them, protected by Allah's assurance."],
          ["Which event did the Muslims of Madinah promise the Prophet before the Hijrah?", "Protection and support", "The Ansar of Madinah pledged at Aqabah to protect and support the Prophet, which made the migration possible."],
          ["Which surah praises the companion of the Prophet in the cave?", "Surah At-Tawbah", "Surah At-Tawbah mentions the two in the cave, confirming Abu Bakr's place beside the Prophet during the Hijrah."]
        ],
        trick: "622 = Hijrah; Yathrib = old Madinah; Thawr = hiding cave; At-Tawbah = cave verse.",
        tip: "Cave of Thawr vs Cave of Hira is THE most common cave trap in exams."
      },
      {
        kind: "tf", name: "Seerah facts",
        note: "True/false stems on the Seerah's key dates and persons.",
        statements: [
          ["The Hijrah to Madinah took place in 622 CE.", "The Hijrah to Madinah took place in 632 CE."],
          ["Khadijah was the first person to accept Islam.", "Abu Jahl was the first person to accept Islam."],
          ["The first revelation came in the Cave of Hira.", "The first revelation came in the Cave of Thawr."],
          ["Madinah was called Yathrib before the Hijrah.", "Makkah was called Yathrib before the Hijrah."],
          ["Abu Bakr accompanied the Prophet in the Cave of Thawr.", "Abu Lahab accompanied the Prophet in the Cave of Thawr."]
        ],
        trick: "Hira = revelation; Thawr = Hijrah hiding; Makkah ≠ Yathrib.",
        tip: "Any 'first Muslim' claim naming Abu Lahab or Abu Jahl is false."
      }
    ],

    "Seerah — Battles": [
      {
        kind: "pair", a: "battle", b: "year",
        note: "The major battles of the Prophet's (PBUH) life carry fixed dates that exams repeat.",
        pairs: [
          ["Badr", "2 AH"], ["Uhud", "3 AH"], ["Khandaq (Trench)", "5 AH"], ["Khaibar", "7 AH"], ["Makkah (Conquest)", "8 AH"], ["Tabuk", "9 AH"]
        ],
        trick: "2, 3, 5, 7, 8, 9 AH — Badr 2, Uhud 3, Trench 5, Khaibar 7, Makkah 8, Tabuk 9.",
        tip: "Year-matching for battles is a top-three repeated question type."
      },
      {
        kind: "fact", name: "Battle of Badr",
        note: "Badr (2 AH) was the first major battle; its numbers are famous.",
        facts: [
          ["How many Muslims fought in the Battle of Badr?", "313", "About 313 Muslims, poorly armed, faced the Quraysh at Badr, and their victory is treated as a decisive divine sign."],
          ["How many soldiers did the Quraysh field at Badr?", "About 1,000", "The Quraysh brought roughly 1,000 soldiers against the 313 Muslims, making Badr a remarkable defensive victory."],
          ["In which year did the Battle of Badr take place?", "2 AH", "Badr was fought in Ramadan of 2 AH, the first major engagement between Muslims and the Quraysh."],
          ["Which battle is the first major battle in Islamic history?", "Badr", "Badr (2 AH) is the first major armed encounter of Islam, after which Muslim military organisation grew rapidly."],
          ["Which surah of the Quran discusses the Battle of Badr?", "Al-Anfal", "Surah Al-Anfal deals with the spoils and lessons of Badr, and Surah Aal-Imran covers the events of Uhud."]
        ],
        trick: "Badr: 313 vs 1,000, 2 AH, Al-Anfal.",
        tip: "313 Muslim fighters at Badr is the most cited battle number."
      },
      {
        kind: "fact", name: "Battle of Uhud",
        note: "Uhud (3 AH) followed Badr; the archers' mistake and its lessons are classic exam facts.",
        facts: [
          ["Why did the Muslims suffer losses at Uhud?", "The archers left their post", "The archers' abandonment of the hill position let Khalid ibn al-Walid's cavalry flank the Muslims, because orders were disobeyed."],
          ["Who commanded the Quraysh cavalry at Uhud?", "Khalid ibn al-Walid", "Khalid ibn al-Walid led the Quraysh cavalry around the mountain and exploited the undefended rear, a tactic the Prophet had warned against."],
          ["Which companion shielded the Prophet (PBUH) at Uhud and lost teeth?", "Talhah ibn Ubaydullah", "Talhah protected the Prophet with his own body at Uhud, losing teeth in the assault, earning him the title 'the living martyr'."],
          ["Which uncle of the Prophet (PBUH) was martyred at Uhud?", "Hamza (RA)", "Hamza, the Prophet's uncle, was martyred at Uhud, and the Prophet mourned him deeply, calling him the chief of martyrs."],
          ["In which year did the Battle of Uhud take place?", "3 AH", "Uhud was fought in 3 AH, a year after Badr, when the Quraysh returned seeking revenge for their defeat."]
        ],
        trick: "Uhud = archers' mistake, 3 AH, Hamza martyred, Talhah shielded.",
        tip: "'Disobedience of orders at Uhud' is the lesson examiners always test."
      },
      {
        kind: "fact", name: "later battles and treaties",
        note: "The Treaty of Hudaybiyyah, Khaibar and the Conquest of Makkah complete the battle syllabus.",
        facts: [
          ["In which year was the Treaty of Hudaybiyyah signed?", "6 AH", "The Treaty of Hudaybiyyah was signed in 6 AH between the Muslims and Quraysh, and the Quran calls it a manifest victory."],
          ["Which treaty was termed 'a manifest victory' in the Quran?", "Hudaybiyyah", "Surah Al-Fath describes the Treaty of Hudaybiyyah as a clear victory, because it opened the door to Makkah's peaceful conquest."],
          ["Which Jewish stronghold fell to the Muslims in 7 AH?", "Khaibar", "The fortress settlement of Khaibar was conquered in 7 AH, ending the main Jewish opposition in Arabia."],
          ["In which year was Makkah conquered peacefully?", "8 AH", "Makkah surrendered in 8 AH with almost no bloodshed, and the Prophet (PBUH) declared general amnesty."],
          ["What did the Prophet (PBUH) say on entering Makkah victoriously?", "General amnesty and forgiveness", "On conquering Makkah the Prophet announced amnesty, telling the Quraysh to go free, which is the lesson of mercy from the conquest."],
          ["Which expedition in 9 AH faced no enemy but consolidated Muslim power?", "Tabuk", "The Tabuk expedition in 9 AH marched north against rumoured Byzantine forces, meeting no battle but securing Arabia's frontiers."]
        ],
        trick: "Hudaybiyyah 6, Khaibar 7, Makkah 8, Tabuk 9 — the treaty years rhyme with battles.",
        tip: "'Manifest victory = Hudaybiyyah (Al-Fath)' is asked in every year's paper."
      }
    ],

    "Khulafa-e-Rashideen": [
      {
        kind: "order", name: "the order of the rightly guided caliphs",
        note: "The four rightly guided caliphs ruled in the order: Abu Bakr, Umar, Uthman, Ali.",
        ordered: ["Abu Bakr (RA)", "Umar (RA)", "Uthman (RA)", "Ali (RA)"],
        trick: "A-U-U-A: Abu Bakr, Umar, Uthman, Ali — first to fourth.",
        tip: "This four-item sequence is the most predictable question in Islamic Studies."
      },
      {
        kind: "pair", a: "caliph", b: "key achievement",
        note: "Each caliph is known for a landmark achievement that pair questions test.",
        pairs: [
          ["Abu Bakr (RA)", "compiling the Quran and the Ridda wars"], ["Umar (RA)", "introducing the Hijri calendar and establishing the diwan"],
          ["Uthman (RA)", "standardising the Uthmani script of the Quran"], ["Ali (RA)", "moving the capital to Kufa"]
        ],
        trick: "Bakr = compilation, Umar = calendar, Uthman = standard script, Ali = Kufa.",
        tip: "Uthman ↔ standardised Quranic script is the most tested achievement link."
      },
      {
        kind: "fact", name: "the four caliphs",
        note: "Individual facts about each caliph's life and title are standard one-mark questions.",
        facts: [
          ["Who was the first caliph of Islam?", "Abu Bakr (RA)", "Abu Bakr was chosen at Saqifah after the Prophet's death, becoming the first caliph and earning the title As-Siddiq."],
          ["Which caliph is known as As-Siddiq (the truthful)?", "Abu Bakr (RA)", "Abu Bakr received the title As-Siddiq for confirming the Prophet's night journey, and for his unquestioning truthfulness."],
          ["Who compiled the Quran in a single volume first?", "Abu Bakr (RA)", "Under Abu Bakr, Zaid ibn Thabit compiled the Quran into one manuscript, because many memorisers fell in the Ridda wars."],
          ["Which caliph is known as Al-Farooq (the distinguisher)?", "Umar (RA)", "Umar earned Al-Farooq, meaning the one who distinguishes truth from falsehood, for his decisive embrace of Islam."],
          ["Who introduced the Islamic (Hijri) calendar?", "Umar (RA)", "Umar established the Hijri calendar starting from the year of the Prophet's migration, creating a unified dating system for the state."],
          ["Which caliph was assassinated in the mosque while leading Fajr?", "Umar (RA)", "Umar was fatally stabbed by Abu Lu'lu'ah during Fajr prayer in Madinah in 23 AH, and is buried beside the Prophet."],
          ["Which caliph is called 'Dhun-Nurayn' (possessor of the two lights)?", "Uthman (RA)", "Uthman married two daughters of the Prophet, Ruqayyah and Umm Kulthum, which earned him the title Dhun-Nurayn."],
          ["Who standardised the Quranic text into the Uthmani script?", "Uthman (RA)", "Uthman ordered standard copies of the Quran in the Qurayshi script and sent them to the provinces, ending textual differences."],
          ["Who was the fourth caliph of Islam?", "Ali (RA)", "Ali ibn Abi Talib, the Prophet's cousin and son-in-law, became the fourth caliph after Uthman's martyrdom."],
          ["Which caliph moved the Islamic capital from Madinah to Kufa?", "Ali (RA)", "Ali shifted the seat of the caliphate to Kufa in Iraq because of the expanding and contested provinces of the empire."]
        ],
        trick: "Siddiq = Bakr, Farooq = Umar, Dhun-Nurayn = Uthman, Kufa = Ali.",
        tip: "Title↔caliph matching (Siddiq/Farooq/Dhun-Nurayn) is a guaranteed exam hit."
      },
      {
        kind: "tf", name: "the rightly guided caliphs",
        note: "True/false stems on caliphal titles, order and achievements.",
        statements: [
          ["The order of the caliphs is Abu Bakr, Umar, Uthman, Ali.", "The order of the caliphs is Ali, Uthman, Umar, Abu Bakr."],
          ["Umar is known as Al-Farooq.", "Uthman is known as Al-Farooq."],
          ["Uthman standardised the Quranic script.", "Abu Bakr standardised the Quranic script in Makkah."],
          ["Ali moved the capital to Kufa.", "Abu Bakr moved the capital to Damascus."],
          ["Umar introduced the Hijri calendar.", "Ali introduced the Hijri calendar during the Battle of Badr."]
        ],
        trick: "Farooq = Umar; script = Uthman; Kufa = Ali; calendar = Umar.",
        tip: "Title mismatches (Uthman=Farooq) are the standard trap here."
      }
    ],

    "Islamic Calendar and Months": [
      {
        kind: "order", name: "the first four months of the Islamic calendar",
        note: "The Islamic calendar opens with Muharram, Safar, Rabi-ul-Awwal, Rabi-uth-Thani.",
        ordered: ["Muharram", "Safar", "Rabi-ul-Awwal", "Rabi-uth-Thani"],
        trick: "M-S-R-R: Muharram, Safar, Rabi Awwal, Rabi Thani.",
        tip: "Muharram is the FIRST month — the most common month-order question."
      },
      {
        kind: "fact", name: "Islamic months",
        note: "Key facts about the Islamic months and their holy days are frequent exam items.",
        facts: [
          ["Which is the first month of the Islamic calendar?", "Muharram", "The Islamic year opens with Muharram, and the 1st of Muharram marks the Islamic New Year."],
          ["In which Islamic month did the Prophet (PBUH) migrate to Madinah?", "Rabi-ul-Awwal", "The Hijrah took place in Rabi-ul-Awwal, the third month, although the calendar itself starts from the year of the event."],
          ["Which is the ninth month of the Islamic calendar?", "Ramadan", "Ramadan, the month of fasting, is the ninth month of the Islamic year and the month of Quranic revelation."],
          ["Which is the twelfth month of the Islamic calendar?", "Dhul-Hijjah", "Dhul-Hijjah is the final month, containing the days of Hajj and the Eid al-Adha festival."],
          ["On which dates is Eid al-Fitr celebrated?", "1st of Shawwal", "Eid al-Fitr is celebrated on the 1st of Shawwal, the month that follows Ramadan, marking the end of fasting."],
          ["Which month follows Ramadan?", "Shawwal", "Shawwal comes immediately after Ramadan, and its first day is Eid al-Fitr."],
          ["Which month contains the Night of Power (Laylat-ul-Qadr)?", "Ramadan", "Laylat-ul-Qadr falls in the last ten nights of Ramadan, most often identified as the 27th night."],
          ["What type of calendar is the Islamic calendar?", "Lunar", "The Islamic calendar is purely lunar, based on moon phases, which is why its months shift through the solar seasons."]
        ],
        trick: "1st = Muharram, 9th = Ramadan, 12th = Dhul-Hijjah; Eid-ul-Fitr = 1 Shawwal.",
        tip: "Month numbers (1, 9, 12) and Eid dates are the classic short questions."
      },
      {
        kind: "pair", a: "month", b: "special occasion",
        note: "Each notable month is paired with its occasion in pair questions.",
        pairs: [
          ["Muharram", "Islamic New Year and Ashura"], ["Rabi-ul-Awwal", "birth of the Prophet (PBUH)"], ["Ramadan", "the Night of Power and fasting"],
          ["Shawwal", "Eid al-Fitr"], ["Dhul-Hijjah", "Hajj and Eid al-Adha"]
        ],
        trick: "Ashura = Muharram, Mawlid = Rabi-ul-Awwal, Fitr = Shawwal, Adha = Dhul-Hijjah.",
        tip: "Eid al-Adha ↔ Dhul-Hijjah (10th) and Eid al-Fitr ↔ Shawwal (1st) are never to be swapped."
      }
    ],

    "Prophets and Revealed Books": [
      {
        kind: "pair", a: "prophet", b: "revealed book",
        note: "Four divine books were revealed to four major prophets.",
        pairs: [
          ["Musa (Moses)", "Tawrat (Torah)"], ["Dawud (David)", "Zabur (Psalms)"], ["Isa (Jesus)", "Injil (Gospel)"], ["Muhammad (PBUH)", "Quran"]
        ],
        trick: "Musa-Tawrat, Dawud-Zabur, Isa-Injil, Muhammad-Quran.",
        tip: "Book↔prophet matching is the single most repeated pair question."
      },
      {
        kind: "list", name: "prophets mentioned in the Quran", group: "the prophets explicitly named in the Quran",
        note: "Twenty-five prophets are named in the Quran, including Adam, Nuh, Ibrahim, Musa, Isa and Muhammad.",
        items: ["Adam", "Nuh", "Ibrahim", "Musa", "Isa", "Muhammad", "Yusuf", "Yunus", "Yaqub", "Ishaaq", "Sulaiman", "Dawud"],
        outsiders: ["Krishna", "Zarathustra", "Confucius", "Buddha", "Ahura Mazda", "Vishnu"],
        trick: "All twelve are named prophets of the Quran; the outsiders belong to other faiths.",
        tip: "25 prophets are named in the Quran — the count itself is an exam favourite."
      },
      {
        kind: "fact", name: "the prophets",
        note: "Signature events of each prophet are the most frequently tested Quranic stories.",
        facts: [
          ["How many prophets are named in the Holy Quran?", "25", "Twenty-five prophets are mentioned by name in the Quran, though the total number of prophets sent is much larger."],
          ["Who is the first prophet of Islam?", "Adam (AS)", "Adam is the first human and the first prophet, created from clay, and his story opens the Quran's accounts of prophethood."],
          ["Who built the Kaaba with his son Ismail?", "Ibrahim (AS)", "Ibrahim and Ismail raised the foundations of the Kaaba in Makkah, establishing the site of Tawaf and the direction of prayer."],
          ["Who is known as the 'Friend of Allah' (Khalilullah)?", "Ibrahim (AS)", "Ibrahim is titled Khalilullah, the friend of Allah, because of his unwavering devotion even when cast into fire."],
          ["Which prophet was swallowed by a whale?", "Yunus (AS)", "Yunus was swallowed by a great fish for leaving his people, and he repented with the famous prayer of Dhun-Nun."],
          ["Which prophet is known as 'Kalimullah' (one who spoke to Allah)?", "Musa (AS)", "Musa spoke directly with Allah, earning the title Kalimullah, and received the Tawrat on Mount Sinai."],
          ["Which prophet's miracle was turning a staff into a serpent?", "Musa (AS)", "Musa's staff turned into a serpent before Pharaoh, one of the nine signs Allah granted him to prove his prophethood."],
          ["Which prophet is associated with the ship that saved believers from the flood?", "Nuh (AS)", "Nuh built the ark on Allah's command, and believers survived the great flood while the disbelievers drowned."],
          ["Which prophet was given the Zabur?", "Dawud (AS)", "Dawud, who also defeated Goliath, was given the Zabur (Psalms) and is famous for his beautiful voice."],
          ["Which prophet was born without a father?", "Isa (AS)", "Isa was born miraculously to Maryam without a father, one of the clearest miracles of the Quran."]
        ],
        trick: "Khalil = Ibrahim, Kalim = Musa, Whale = Yunus, Staff = Musa, Zabur = Dawud, Fatherless = Isa.",
        tip: "Title↔prophet facts (Khalilullah, Kalimullah) are asked in every major test."
      },
      {
        kind: "tf", name: "the prophets and books",
        note: "True/false stems on prophets, books and miracles.",
        statements: [
          ["The Tawrat was revealed to Prophet Musa.", "The Tawrat was revealed to Prophet Isa."],
          ["The Zabur was revealed to Prophet Dawud.", "The Zabur was revealed to Prophet Muhammad."],
          ["Prophet Yunus was swallowed by a great fish.", "Prophet Ibrahim was swallowed by a great fish."],
          ["Musa is known as Kalimullah.", "Nuh is known as Kalimullah."],
          ["Twenty-five prophets are named in the Quran.", "Fifty prophets are named in the Quran."]
        ],
        trick: "Tawrat-Musa, Zabur-Dawud, Injil-Isa, Quran-Muhammad; Kalimullah-Musa.",
        tip: "Swap the book names between prophets and the statement is automatically false."
      }
    ],

    "Angels and Their Duties": [
      {
        kind: "pair", a: "angel", b: "duty",
        note: "Each major angel has a fixed duty that pair questions test.",
        pairs: [
          ["Jibreel", "delivering revelation to the prophets"], ["Mika'il", "providing sustenance and rain"], ["Israfeel", "blowing the trumpet on Judgment Day"],
          ["Azrael (Malak-ul-Maut)", "taking the souls at death"], ["Munkar and Nakir", "questioning in the grave"]
        ],
        trick: "Jibreel = revelation, Mika'il = rain/rizeq, Israfeel = trumpet, Azrael = death.",
        tip: "Jibreel↔revelation and Israfeel↔trumpet are the two highest-yield angel facts."
      },
      {
        kind: "fact", name: "the angels",
        note: "Angelology facts are a small but consistent section of the paper.",
        facts: [
          ["How many pillars of faith (Iman) are there in Islam?", "Six", "The six articles of faith are belief in Allah, angels, books, prophets, the Last Day, and divine decree, with good and bad fate."],
          ["Which angel brought the revelation to Prophet Muhammad (PBUH)?", "Jibreel", "Jibreel conveyed the Quran to the Prophet over twenty-three years, appearing in his true form only twice."],
          ["Which angel is responsible for the trumpet on the Day of Judgment?", "Israfeel", "Israfeel will blow the trumpet (Sur) twice on the Last Day, first to annihilate and then to resurrect."],
          ["Which angel takes the soul at the time of death?", "Azrael", "Azrael, also called Malak-ul-Maut, is the angel of death who takes souls by Allah's command."],
          ["Which angels question the dead in the grave?", "Munkar and Nakir", "Munkar and Nakir question the deceased about their Lord, religion and prophet in the grave."],
          ["Which angel is responsible for rain and sustenance?", "Mika'il", "Mika'il manages provision and rainfall, distributing rizq by Allah's decree."],
          ["What is the Quranic term for the Last Day?", "Yawm-ul-Qiyamah", "Yawm-ul-Qiyamah, the Day of Resurrection, is a central article of faith and the theme of many surahs."],
          ["What is divine decree called in Arabic?", "Taqdir", "Taqdir (Qadar) is the belief in Allah's divine decree, the sixth article of faith, covering good and evil fate alike."]
        ],
        trick: "Six articles; Jibreel=revelation, Azrael=death, Israfeel=trumpet, Mika'il=rain, Munkar/Nakir=grave.",
        tip: "'Six articles of faith' and the four angel duties are guaranteed one-mark items."
      },
      {
        kind: "tf", name: "angels and articles of faith",
        note: "Statement stems on angel duties and the articles of faith.",
        statements: [
          ["There are six articles of faith in Islam.", "There are eight articles of faith in Islam."],
          ["Jibreel delivered revelation to the prophets.", "Israfeel delivered revelation to the prophets."],
          ["Azrael takes the souls at death.", "Mika'il takes the souls at death."],
          ["Israfeel will blow the trumpet on Judgment Day.", "Jibreel will blow the trumpet on Judgment Day."],
          ["Munkar and Nakir question the deceased in the grave.", "Munkar and Nakir guard the gates of paradise."]
        ],
        trick: "Each duty belongs to exactly one angel; swap = false.",
        tip: "Angel-duty mismatch statements are the whole game here."
      }
    ],

    "Fiqh and Islamic Terms": [
      {
        kind: "fact", name: "Islamic terminology",
        note: "Core Arabic terms of worship and law are examined through their meanings.",
        facts: [
          ["What does 'Iman' mean?", "Faith or belief", "Iman means faith and conviction, and it consists of belief in the heart, speech on the tongue, and action of the limbs."],
          ["What does 'Ihsan' mean?", "Excellence and perfection in worship", "Ihsan means worshipping Allah as though you see Him, a level above Iman that perfects sincerity."],
          ["What is the religious ruling that is obligatory (compulsory) called?", "Fard", "Fard obligations, such as the five daily prayers, carry reward when performed and sin when neglected."],
          ["What is a recommended (non-obligatory) act called in fiqh?", "Sunnah (Mustahab)", "Sunnah or Mustahab acts are recommended, earning reward when done but no sin when omitted."],
          ["What is the term for an unlawful act in Islamic law?", "Haram", "Haram acts are strictly forbidden, and avoiding them is rewarded while committing them is a sin."],
          ["What is the term for a lawful act in Islamic law?", "Halal", "Halal denotes everything permitted by Islamic law, ranging from foods to financial contracts."],
          ["What is the consensus of scholars as a source of law called?", "Ijma", "Ijma, the consensus of qualified scholars on a ruling, is the third source of Islamic law after the Quran and Sunnah."],
          ["What is analogical reasoning in Islamic law called?", "Qiyas", "Qiyas applies an existing ruling to a new case sharing the same cause, completing the four classical sources of fiqh."],
          ["What is the scholarly interpretation of law called?", "Ijtihad", "Ijtihad is the effort of a qualified scholar to derive rulings from the sources, exercised when no direct text exists."],
          ["What is the declaration of Allah's greatness in prayer called?", "Takbir", "Takbir, saying 'Allahu Akbar', opens the prayer and marks every movement within it."]
        ],
        trick: "Fard = obligatory, Haram = forbidden, Halal = lawful, Ijma = consensus, Qiyas = analogy.",
        tip: "The five fiqh terms (Fard, Sunnah, Halal, Haram, Makruh) are vocabulary gold."
      },
      {
        kind: "pair", a: "term", b: "meaning",
        note: "Term-to-meaning pairs cover the vocabulary of worship and law.",
        pairs: [
          ["Fard", "obligatory"], ["Sunnah", "recommended practice of the Prophet"], ["Haram", "forbidden"], ["Halal", "permitted"],
          ["Makruh", "disliked"], ["Iman", "faith"], ["Ihsan", "excellence in worship"], ["Taqwa", "God-consciousness"]
        ],
        trick: "Fard=obligatory, Haram=forbidden, Halal=permitted, Makruh=disliked, Taqwa=consciousness of Allah.",
        tip: "Makruh (disliked) is the least-known term and the favourite trap."
      },
      {
        kind: "tf", name: "fiqh terms",
        note: "True/false stems on the vocabulary of Islamic law.",
        statements: [
          ["Haram means forbidden in Islamic law.", "Haram means recommended in Islamic law."],
          ["Ijma is the consensus of scholars.", "Ijma is the personal opinion of a ruler."],
          ["Qiyas is analogical reasoning in fiqh.", "Qiyas is the lunar calendar."],
          ["Fard acts are obligatory.", "Fard acts are optional."],
          ["Taqwa means God-consciousness.", "Taqwa means the call to prayer."]
        ],
        trick: "Ijma = consensus, Qiyas = analogy, Taqwa = God-consciousness, Fard = obligatory.",
        tip: "Term-meaning swaps (Qiyas = calendar) are the automatic false pattern."
      }
    ],

    "Important Personalities of Islam": [
      {
        kind: "pair", a: "companion", b: "known for",
        note: "Key companions are recognised by their titles and achievements.",
        pairs: [
          ["Abu Bakr (RA)", "As-Siddiq and first caliph"], ["Umar (RA)", "Al-Farooq and the Hijri calendar"],
          ["Uthman (RA)", "Dhun-Nurayn and standard Quranic script"], ["Ali (RA)", "the fourth caliph and Kufa capital"],
          ["Hamza (RA)", "chief of the martyrs"], ["Khalid ibn al-Walid", "the Sword of Allah"],
          ["Bilal (RA)", "the first muezzin"], ["Zaid ibn Thabit", "compiling the Quran"]
        ],
        trick: "Sword of Allah = Khalid, first muezzin = Bilal, martyrs' chief = Hamza, compiler = Zaid.",
        tip: "'Sword of Allah' ↔ Khalid ibn al-Walid is the most famous title question."
      },
      {
        kind: "fact", name: "companions of the Prophet",
        note: "Facts about the Prophet's (PBUH) closest companions are permanent exam staples.",
        facts: [
          ["Who was the first muezzin (caller to prayer) of Islam?", "Bilal (RA)", "Bilal ibn Rabah, a freed Abyssinian slave, became the first muezzin because of his strong voice and devotion."],
          ["Who is known as the 'Sword of Allah'?", "Khalid ibn al-Walid", "The Prophet (PBUH) gave Khalid ibn al-Walid the title 'Sword of Allah' for his unmatched skill in battle."],
          ["Who is called 'the living martyr'?", "Talhah ibn Ubaydullah", "Talhah was called the living martyr because of his wounds at Uhud, where he shielded the Prophet with his body."],
          ["Which companion is famous as 'the trustworthy one of this Ummah'?", "Abu Ubaydah ibn al-Jarrah", "The Prophet (PBUH) declared Abu Ubaydah the amin (trustworthy) of this Ummah, a title recorded in the hadith."],
          ["Who was the first caliph's father-in-law relation to the Prophet?", "Abu Bakr (RA)", "Abu Bakr's daughter Aisha married the Prophet, making Abu Bakr the Prophet's father-in-law and closest companion."],
          ["Which companion wrote down the Quranic revelation and later compiled it?", "Zaid ibn Thabit", "Zaid ibn Thabit served as a scribe of revelation and later compiled the Quran into a single volume under Abu Bakr."],
          ["Which companion is known as the 'Gates of Knowledge'?", "Ali (RA)", "The Prophet (PBUH) called Ali the city of knowledge whose gate is Ali, reflecting his depth of learning."],
          ["Which female companion was the first martyr of Islam?", "Sumayyah (RA)", "Sumayyah, a slave woman who embraced Islam, was killed for her faith and is honoured as the first martyr of Islam."]
        ],
        trick: "Bilal = muezzin, Khalid = Sword of Allah, Talhah = living martyr, Zaid = scribe/compiler, Sumayyah = first martyr.",
        tip: "Title facts about Bilal, Khalid and Sumayyah appear in nearly every paper."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
