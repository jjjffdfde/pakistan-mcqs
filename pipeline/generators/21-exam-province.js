/* ============================================================
   Generator 21 — Exam-specific content: Provincial PSCs
   (KP, Balochistan, AJK, Sindh) + entry tests (MDCAT, LAT).
   Original authored facts reflecting each exam's syllabus.
   ============================================================ */
"use strict";
const L = require("../lib.js");

function examGen(subjectId, chapter, topics) {
  const allAnswers = Object.values(topics).flat().map((f) => f[1]);
  return {
    subjects: [subjectId],
    name: chapter,
    topics: Object.keys(topics),
    tags: [subjectId, "exam-content"],
    generate(rng, topicName) {
      const facts = topics[topicName].map(([q, a, e]) => ({ q, a, e }));
      return L.factGenerator(facts, allAnswers)(rng);
    }
  };
}

module.exports = [
  examGen("kppsc", "KP Provincial Knowledge (KPPSC)", {
    "KP Geography": [
      ["Which city is the capital of Khyber Pakhtunkhwa?", "Peshawar", "Peshawar is the capital and largest city of Khyber Pakhtunkhwa, lying near the Khyber Pass and the Afghan border."],
      ["Which mountain range covers most of northern Khyber Pakhtunkhwa?", "Hindu Kush", "The Hindu Kush range runs through northern KP and includes Tirich Mir, the province's highest peak, in Chitral."],
      ["What is the highest peak in Khyber Pakhtunkhwa?", "Tirich Mir", "Tirich Mir (7,708 m) in Chitral is the highest peak of the Hindu Kush and of Khyber Pakhtunkhwa."],
      ["How many divisions does Khyber Pakhtunkhwa have?", "7", "KP has seven divisions: Peshawar, Mardan, Malakand, Hazara, Kohat, Bannu and Dera Ismail Khan."],
      ["Which river flows through Peshawar and later joins the Indus?", "Kabul River", "The Kabul River enters Pakistan from Afghanistan, passes through Peshawar and meets the Indus near Attock."],
      ["Which pass connects Peshawar with Afghanistan?", "Khyber Pass", "The Khyber Pass, about 53 km long, historically links Peshawar with Jalalabad in Afghanistan."],
      ["Where is the Kaghan Valley located?", "Mansehra district", "The Kaghan Valley lies in Mansehra district of Hazara division and includes the Naran area and Saiful Muluk lake."],
      ["Which district of KP is the largest by area?", "Chitral", "Chitral is the largest district of Khyber Pakhtunkhwa by area and borders Afghanistan to the north and west."],
      ["Which ski resort is located in Swat district?", "Malam Jabba", "Malam Jabba in Swat is a famous ski resort built with the assistance of the Austrian government in the 1980s."],
      ["Which valley in Chitral is home to the Kalash people?", "Bumboret", "The Kalash people live in the Bumboret, Rumbur and Birir valleys of Chitral district."],
      ["Which river valley contains the Shandur Pass, site of the annual polo festival?", "Chitral and Gilgit valleys", "Shandur Pass, known as the 'Roof of the World', connects Chitral with Gilgit-Baltistan and hosts a traditional polo festival."],
      ["Which barrage/dam is located on the Kabul River near Peshawar?", "Warsak Dam", "Warsak Dam, completed in 1960 on the Kabul River near Peshawar, provides hydroelectric power and irrigation."],
      ["Which national park is located in Swat?", "Saiful Muluk National Park", "Saiful Muluk National Park in the Kaghan Valley protects the alpine lake area of Swat's upper reaches."],
      ["Which lake in Kaghan Valley is famous for its fairy-tale folklore?", "Saiful Muluk Lake", "Saiful Muluk Lake near Naran is famous for the folklore of Prince Saiful Muluk and the fairy princess."],
      ["Which mountain pass connects Kaghan Valley with Gilgit-Baltistan?", "Babusar Pass", "Babusar Pass (4,173 m) on the Karakoram Highway links the Kaghan Valley with Chilas in Gilgit-Baltistan."],
      ["Which fort in Peshawar was built by Mughal emperor Babur's general?", "Bala Hisar Fort", "Bala Hisar Fort in Peshawar was rebuilt by the Mughals and later served as the seat of the Sikh and British rulers."],
      ["Which district of KP borders the most on Afghanistan?", "North Waziristan", "North and South Waziristan, Khyber, Kurram, Mohmand and Bajaur districts all border Afghanistan along the Durand Line."],
      ["Which archaeological site in Mardan is a UNESCO World Heritage Site?", "Takht-i-Bahi", "Takht-i-Bahi, a Buddhist monastery complex near Mardan dating from the 1st century AD, is a UNESCO World Heritage Site."]
    ],
    "KP History and Politics": [
      ["When was the NWFP renamed Khyber Pakhtunkhwa?", "2010", "The North-West Frontier Province was renamed Khyber Pakhtunkhwa in 2010 under the 18th Constitutional Amendment."],
      ["What was Khyber Pakhtunkhwa called before 2010?", "North-West Frontier Province", "Before the 18th Amendment renamed it, KP was known as the North-West Frontier Province (NWFP)."],
      ["Which leader was known as the 'Frontier Gandhi'?", "Khan Abdul Ghaffar Khan", "Khan Abdul Ghaffar Khan (Bacha Khan) led the non-violent Khudai Khidmatgar movement and is known as the Frontier Gandhi."],
      ["Which movement was founded by Bacha Khan in 1929?", "Khudai Khidmatgar", "The Khudai Khidmatgar ('Servants of God') movement, founded by Bacha Khan, promoted non-violent resistance against British rule."],
      ["When was FATA merged into Khyber Pakhtunkhwa?", "2018", "The 25th Constitutional Amendment in 2018 merged the tribal areas (FATA) into Khyber Pakhtunkhwa."],
      ["Who was the first Chief Minister of Khyber Pakhtunkhwa after independence?", "Abdul Qayyum Khan", "Abdul Qayyum Khan Khan served as the first Chief Minister of the North-West Frontier Province after independence."],
      ["Which university in Peshawar was founded in 1950?", "University of Peshawar", "The University of Peshawar, established in 1950, is the oldest university in Khyber Pakhtunkhwa."],
      ["Which college in Peshawar was founded by Sahibzada Abdul Qayyum in 1913?", "Islamia College Peshawar", "Islamia College Peshawar was founded in 1913 by Sir Sahibzada Abdul Qayyum and became a symbol of Pakhtun education."],
      ["Which Nobel laureate hails from Swat?", "Malala Yousafzai", "Malala Yousafzai, born in Mingora, Swat, won the Nobel Peace Prize in 2014 for her campaign for girls' education."],
      ["Which Mughal emperor built the fort at Attock on the Indus?", "Akbar", "The Attock Fort on the Indus was built by Mughal emperor Akbar in 1581 to secure the route to Kabul."],
      ["Which famous 1965 war hero belonged to KP and is known as the 'Lion of Khyber'?", "Captain Sher Khan", "Captain Sher Khan of the Khyber region received the Hilal-e-Jurat for his valour during the 1965 war."],
      ["Which provincial capital of KP was once the winter capital of the Sikh empire?", "Peshawar", "Peshawar served as the winter capital of the Sikh Empire under Maharaja Ranjit Singh."],
      ["Which treaty fixed the Durand Line dividing Pakistan and Afghanistan?", "Durand Agreement 1893", "The Durand Line was fixed by the Durand Agreement of 1893 between the British and Amir Abdur Rahman Khan of Afghanistan."],
      ["Which KP district was the scene of the famous Malakand campaign against the British?", "Malakand", "The Malakand campaign of 1897 against the British is famously described in Winston Churchill's 'The Story of the Malakand Field Force'."]
    ],
    "KP Culture and Economy": [
      ["What is the main language of Khyber Pakhtunkhwa?", "Pashto", "Pashto is the dominant language of KP, while Hindko is widely spoken in Peshawar and Hazara regions."],
      ["Which language is spoken in the Chitral valley?", "Khowar", "Khowar is the language of the Chitral valley, while Kalasha is spoken by the Kalash people."],
      ["What is the traditional dress worn by Pakhtun men?", "Shalwar kameez with turban", "Pakhtun men traditionally wear shalwar kameez with a turban (pagri), and Pakhtun women wear embroidered dresses."],
      ["Which famous mela is held annually at the shrine of Rahman Baba?", "Urs of Rahman Baba", "The urs (anniversary) of the Pashto poet Rahman Baba is held every year at his shrine near Peshawar."],
      ["Who is considered the greatest classical Pashto poet?", "Khushal Khan Khattak", "Khushal Khan Khattak, the 17th-century warrior-poet, is regarded as the father of Pashto literature."],
      ["Which agricultural crop is KP's largest by area?", "Wheat", "Wheat is the most widely grown crop in KP, followed by maize, sugarcane and tobacco in the Peshawar valley."],
      ["Which fruit is KP famous for growing in Swat?", "Apple", "Swat and the upper valleys of KP are famous for high-quality apples, apricots and peaches."],
      ["Which mineral is extracted on a large scale in the Khyber district?", "Marble", "KP's Khyber and Mohmand regions are rich in marble and gemstone deposits such as emerald."],
      ["Which KP district produces significant hydroelectric power from the Tarbela Dam?", "Haripur", "Tarbela Dam, one of the world's largest earth-filled dams, is located on the Indus in Haripur district."],
      ["Which handwoven carpet craft is famous in KP?", "Peshawar carpets", "Peshawar is known for its handwoven carpets and rugs traded along the historic Silk Route."],
      ["What is the provincial animal of Khyber Pakhtunkhwa?", "Markhor", "The markhor, Pakistan's national animal, inhabits the mountains of KP including Chitral and Kohistan."],
      ["Which fort city of KP is known as the 'City of Flowers'?", "Chitral", "Chitral is often called the 'City of Flowers' for its lush valleys and orchards."],
      ["Which KP district hosts the annual Shandur polo festival in July?", "Chitral", "The Shandur polo festival, held on the Shandur Pass between Chitral and Gilgit, draws players and tourists from across the world."],
      ["What is the traditional Pakhtun social code called?", "Pashtunwali", "Pashtunwali is the traditional code of honour governing Pakhtun society, emphasising hospitality, revenge and refuge."],
      ["Which KP city is the hub of the marble industry?", "Peshawar", "Peshawar and the surrounding Khyber region host KP's largest marble processing industry."]
    ]
  }),

  examGen("bpsc", "Balochistan Provincial Knowledge (BPSC)", {
    "Balochistan Geography": [
      ["Which city is the capital of Balochistan?", "Quetta", "Quetta is the capital and largest city of Balochistan, lying in a valley surrounded by mountains near the Afghan border."],
      ["Which province of Pakistan is the largest by area?", "Balochistan", "Balochistan covers about 347,000 square kilometres, roughly 44% of Pakistan's total land area."],
      ["Which mountain range separates Balochistan from the Punjab plains?", "Sulaiman Range", "The Sulaiman Range runs along the eastern border of Balochistan and includes the famous Takht-e-Sulaiman peak."],
      ["What is the highest peak of the Sulaiman Range?", "Takht-e-Sulaiman", "Takht-e-Sulaiman (also called Kaisagarh), about 3,487 m high, is the highest peak of the Sulaiman Range."],
      ["Which pass connects Quetta with the Kacchi plain and Sibi?", "Bolan Pass", "The Bolan Pass is a historic route linking Quetta with the Kacchi plains and the rest of the subcontinent."],
      ["Which river is the largest in Balochistan?", "Hingol River", "The Hingol River is the longest river in Balochistan and drains into the Arabian Sea in Lasbela district."],
      ["Which port city of Balochistan was transferred from Oman to Pakistan in 1958?", "Gwadar", "Gwadar was under Omani rule until 1958, when it was purchased by Pakistan."],
      ["Which national park is the largest in Pakistan?", "Hingol National Park", "Hingol National Park in Lasbela district is the largest national park of Pakistan, covering over 6,000 square kilometres."],
      ["Which district of Balochistan hosts the famous Mehrgarh archaeological site?", "Kachhi (Bolan)", "Mehrgarh, one of the world's earliest Neolithic settlements (c. 7000 BC), lies in the Kachhi district near Sibi."],
      ["Which town in Balochistan is famous for its juniper forest?", "Ziarat", "Ziarat is famous for its ancient juniper forest, one of the largest in the world."],
      ["Which lake of Balochistan is the largest natural lake in Pakistan?", "Hamun-i-Mashkel", "Hamun-i-Mashkel, in the Chagai region, is considered the largest natural lake of Balochistan, though it is often dry."],
      ["Which mountain in Balochistan is the highest peak of the province?", "Koh-i-Zardak", "Koh-i-Zardak (about 4,371 m) in the Toba Kakar range is the highest peak of Balochistan."],
      ["Which coastal town of Balochistan hosts a naval base?", "Ormara", "Ormara, on the Makran coast, hosts PNS Makran, a naval base of the Pakistan Navy."],
      ["Which district of Balochistan borders both Iran and Afghanistan?", "Chagai", "Chagai district shares borders with Iran and Afghanistan and is the site of Pakistan's 1998 nuclear tests."],
      ["Which river flows through Quetta and is dry most of the year?", "Quetta River (Nari)", "The dry beds of the Quetta and Nari rivers cross the city; seasonal streams make Quetta prone to flash floods."],
      ["Which glacier-fed lake near Gwadar attracts tourists?", "Boleji Lake", "Boleji Lake near Gwadar is a popular scenic spot along the Makran coast."]
    ],
    "Balochistan History and Politics": [
      ["When did Balochistan attain the status of a full province of Pakistan?", "1970", "Balochistan was established as a full province of Pakistan on 1 July 1970, following the One Unit scheme's abolition."],
      ["Which 1973 event in Balochistan is known for the Koh-i-Taftan uprising?", "The 1973-77 insurgency", "The Koh-i-Taftan region saw the start of the 1973-77 Baloch insurgency against the federal government."],
      ["Who was the first Governor of Balochistan after it became a province?", "Riaz Hussain", "Riaz Hussain served as the first Governor of Balochistan when it became a full province in 1970."],
      ["Which leader founded the Awami National Party?", "Khan Abdul Wali Khan", "Khan Abdul Wali Khan, son of Bacha Khan, founded the Awami National Party in 1986 with a Pashtun nationalist base."],
      ["Which 2009 incident in Balochistan is associated with Nawab Akbar Bugti?", "Dera Bugti operation", "The military operation against Nawab Akbar Bugti in Dera Bugti in 2006 led to his death and sparked renewed unrest."],
      ["Which famous uprising against British rule began in Balochistan in 1897?", "The Baloch tribal uprisings", "Tribal uprisings in Zhob and the Sulaiman hills in 1897 resisted British military expansion into Balochistan."],
      ["Which agreement in 1876 brought Kalat under British influence?", "Treaty of Mastung", "The Treaty of Mastung (1876) placed the Khanate of Kalat under British protection and control."],
      ["Who was the last Khan of Kalat?", "Mir Ahmad Yar Khan", "Mir Ahmad Yar Khan was the last Khan of Kalat; he acceded to Pakistan in 1948 despite tribal opposition."],
      ["Which Balochistan city was rebuilt after the devastating 1935 earthquake?", "Quetta", "The 1935 Quetta earthquake destroyed most of the city, which was subsequently rebuilt with British engineers."],
      ["Which provincial assembly building is located in Quetta?", "Balochistan Assembly", "The Balochistan Provincial Assembly meets in Quetta, the provincial capital."],
      ["Which reform gave Balochistan a separate governor's rule in 1948 under the Crown?", "The 1948 accession of Kalat", "Kalat's accession to Pakistan in March 1948 followed the Quaid's intervention and the suppression of the Khan's resistance."]
    ],
    "Balochistan Culture and Economy": [
      ["Which language family does Balochi belong to?", "Iranian", "Balochi is a north-western Iranian language spoken by the Baloch people across Pakistan, Iran and Afghanistan."],
      ["Which language spoken in Balochistan is a Dravidian language?", "Brahui", "Brahui, spoken mainly in the Kalat region, is a Dravidian language unrelated to the surrounding Indo-Iranian tongues."],
      ["Which famous seasonal fair is held annually at Sibi?", "Sibi Mela", "The Sibi Mela, held each February at Sibi, is a historic tribal gathering and cattle fair of Balochistan."],
      ["Which national hero's tomb is located in Quetta?", "General Muhammad Musa", "General Muhammad Musa, the former army chief, is buried in Quetta, his native province."],
      ["Which fruit is Balochistan's most famous agricultural export?", "Cherries", "Balochistan is Pakistan's largest producer of cherries, apples, grapes and plums in its orchards."],
      ["Which mineral is Balochistan's most valuable resource?", "Natural gas", "The Sui gas field in Dera Bugti district supplies natural gas to much of Pakistan and was discovered in 1952."],
      ["Which mountain pass city is the gateway to the Ziarat juniper forest?", "Ziarat", "Ziarat, about 130 km from Quetta, is the gateway to the juniper forest and the Ziarat Residency."],
      ["Which fish is the main catch of the Makran coast?", "Sardine", "Sardines and other small pelagic fish dominate the catch of Balochistan's Makran fishing ports."],
      ["Which Balochi festival marks the harvest season?", "Sebeel", "The traditional harvest festival of Balochistan is called Sebeel (Sibi), celebrated with horse racing and folk music."],
      ["Which dress is traditional for Baloch men?", "Shalwar kameez with a large turban", "Baloch men wear loose shalwar kameez with a distinctive large turban and the phaig (embroidered waistcoat)."],
      ["Which province's port will anchor the China-Pakistan Economic Corridor?", "Balochistan", "Gwadar Port in Balochistan is the southern anchor of the China-Pakistan Economic Corridor (CPEC)."],
      ["Which hill station of Balochistan is called the 'Switzerland of Balochistan'?", "Ziarat", "Ziarat is often called the 'Switzerland of Balochistan' for its cool climate and pine and juniper forests."],
      ["Which ancient trade route passes through the Bolan Pass?", "The ancient route to the Indus", "The Bolan Pass was part of the historic trade route linking the Iranian plateau with the Indus Valley."]
    ]
  }),

  examGen("ajkpsc", "Azad Kashmir Provincial Knowledge (AJKPSC)", {
    "AJK Geography": [
      ["Which city is the capital of Azad Jammu and Kashmir?", "Muzaffarabad", "Muzaffarabad is the capital of Azad Jammu and Kashmir, situated at the confluence of the Neelum and Jhelum rivers."],
      ["Which river flows through Muzaffarabad and joins the Jhelum there?", "Neelum River", "The Neelum River joins the Jhelum at Muzaffarabad, the capital of Azad Kashmir."],
      ["How many districts does Azad Jammu and Kashmir have?", "10", "Azad Jammu and Kashmir has ten districts: Muzaffarabad, Neelum, Hattian Bala, Bagh, Poonch, Sudhnoti, Kotli, Mirpur, Bhimber and Haveli."],
      ["Which district of AJK is the largest by area?", "Neelum", "Neelum district, stretching along the Neelum river and the Line of Control, is the largest district of AJK."],
      ["Which pass in the Pir Panjal range lies near Rawalakot?", "Toli Pir", "Toli Pir, at about 2,600 m in the Pir Panjal range, is a scenic tourist point near Rawalakot in Poonch."],
      ["Which lake near Rawalakot is a famous tourist destination?", "Banjosa Lake", "Banjosa Lake near Rawalakot is an artificial lake surrounded by pine forests in the Pir Panjal range."],
      ["Which river valley in AJK is called the 'Heaven on Earth'?", "Neelum Valley", "The Neelum Valley, with its villages of Keran, Kel and Sharda, is known as the 'Heaven on Earth'."],
      ["Which ancient university ruins are found in Sharda Valley?", "Sharda University", "The ruins at Sharda in Neelum Valley are believed to hold the remains of an ancient university, making it a historic centre of learning."],
      ["Which dam on the Jhelum River lies in Mirpur district of AJK?", "Mangla Dam", "Mangla Dam, one of the world's largest earth-filled dams, is built on the Jhelum River in Mirpur district."],
      ["Which valley in AJK is famous for its dense pine and deodar forests?", "Leepa Valley", "Leepa Valley in Muzaffarabad district is famous for its pine forests, apple orchards and traditional wooden houses."],
      ["Which district of AJK shares the longest border with Punjab province?", "Mirpur", "Mirpur district of AJK borders Punjab province and is separated from it by the Mangla reservoir."],
      ["Which hill town of Poonch district is the largest city after Muzaffarabad?", "Rawalakot", "Rawalakot, the headquarters of Poonch district, is the largest town of the district after the capital."],
      ["Which mountain range runs through the centre of Azad Kashmir?", "Pir Panjal", "The Pir Panjal range crosses central AJK and separates the Poonch and Jhelum valleys."],
      ["Which river forms the western boundary of AJK with Punjab?", "Jhelum", "The Jhelum River marks much of AJK's western boundary with Punjab, and the Mangla reservoir lies on its course."]
    ],
    "AJK History and Politics": [
      ["In which year did the Poonch rebellion begin against the Maharaja of Kashmir?", "1947", "The Poonch rebellion of 1947 against the Dogra Maharaja triggered the tribal intervention and the Kashmir dispute."],
      ["Who was the first President of Azad Kashmir?", "Sardar Muhammad Ibrahim Khan", "Sardar Muhammad Ibrahim Khan became the first President of Azad Kashmir in 1947 after the provisional government was formed."],
      ["Which agreement in 1949 recognised Azad Kashmir's government?", "Karachi Agreement", "The Karachi Agreement of April 1949 defined the functions of the Azad Kashmir government and the Pakistan-appointed administration."],
      ["What does the Line of Control (LOC) separate?", "AJK from Indian-administered Kashmir", "The Line of Control, fixed by the 1972 Simla Agreement, divides Azad Kashmir from Indian-administered Jammu and Kashmir."],
      ["Which war in 1947-48 fixed the initial ceasefire line in Kashmir?", "The First Kashmir War", "The 1947-48 war ended with a UN-negotiated ceasefire that established the original ceasefire line in Kashmir."],
      ["Which UN Security Council resolution called for a plebiscite in Kashmir?", "Resolution 47 (1948)", "UN Security Council Resolution 47 of 1948 called for a ceasefire, demilitarisation and a plebiscite in Kashmir."],
      ["When was the Interim Constitution of Azad Kashmir adopted?", "1974", "The Interim Constitution of Azad Jammu and Kashmir was adopted in 1974, establishing the AJK Legislative Assembly."],
      ["How many members does the AJK Legislative Assembly have?", "53", "The AJK Legislative Assembly in Muzaffarabad has 53 seats, of which 41 are directly elected."],
      ["Who heads the government of Azad Kashmir?", "The Prime Minister of AJK", "The Prime Minister of Azad Jammu and Kashmir heads the elected government, while the President is a constitutional head."],
      ["Which 2005 event devastated Muzaffarabad?", "The Kashmir earthquake", "The October 2005 earthquake, centred near Muzaffarabad, killed tens of thousands across AJK and KP."],
      ["Which historical fort in Muzaffarabad is called the Red Fort?", "Chak Fort", "The Red Fort (Chak Fort) in Muzaffarabad was built by the Chak rulers of Kashmir in the 16th century."],
      ["Which district of AJK is known as the 'Gateway to Kashmir'?", "Bhimber", "Bhimber district, bordering Punjab, has historically served as the gateway to the Kashmir valley."],
      ["Which Pakistani leader visited the Ceasefire Line in 1948 and addressed refugees at Kotli?", "Quaid-e-Azam", "Quaid-e-Azam Muhammad Ali Jinnah visited the ceasefire line in 1948 and assured Azad Kashmiris of Pakistan's support."]
    ],
    "AJK Culture and Economy": [
      ["What is the most widely spoken language in Azad Kashmir?", "Pahari (Pothwari)", "Pahari, also called Pothwari, is the main language of Mirpur, Kotli, Bhimber and Poonch districts of AJK."],
      ["Which dialect is spoken in the Neelum Valley?", "Kashmiri", "Kashmiri dialects are spoken in the Neelum Valley, while Gujari is used in the hilly areas."],
      ["Which city of AJK is known as 'Little England' due to its large British diaspora?", "Mirpur", "Mirpur is called 'Little England' because a large share of its population has settled in Britain."],
      ["Which agricultural crop dominates the Neelum Valley?", "Maize", "Maize is the staple crop of the Neelum Valley, grown on terraced fields in the narrow valley."],
      ["Which fruit orchard dominates the Leepa and Rawalakot valleys?", "Apple", "Apple, cherry and walnut orchards dominate the Leepa and Poonch valleys of AJK."],
      ["Which handicraft is traditionally produced in Poonch district?", "Patti (woven shawls)", "The Patti, a hand-woven shawl, is a traditional craft of Poonch district in AJK."],
      ["Which type of forest covers the largest area of AJK?", "Coniferous forest", "Coniferous forests of pine, deodar and fir cover the largest area of Azad Kashmir's forest land."],
      ["What is the mainstay of AJK's economy besides agriculture?", "Remittances from overseas Kashmiris", "Remittances from the large Kashmiri diaspora in Britain and the Gulf are a major pillar of AJK's economy."],
      ["Which river provides the site of the Neelum-Jhelum Hydropower Project?", "Neelum River", "The Neelum-Jhelum Hydropower Project (969 MW) uses the waters of the Neelum River in AJK."],
      ["Which traditional Kashmiri cuisine is famous in Muzaffarabad?", "Goshtaba", "Goshtaba, a Kashmiri meatball dish, and rogan josh are famous in Muzaffarabad's Wazwan cuisine."],
      ["Which animal is commonly herded by the nomadic Gujjar community of AJK?", "Buffalo", "The nomadic Gujjars of AJK traditionally herd buffalo and goats while moving with the seasons."],
      ["Which city of AJK hosts the headquarters of the AJK Legislative Assembly?", "Muzaffarabad", "The AJK Legislative Assembly meets in Muzaffarabad, the capital of Azad Jammu and Kashmir."]
    ]
  }),

  examGen("spsc", "Sindh Provincial Knowledge (SPSC)", {
    "Sindh Geography": [
      ["Which city is the capital of Sindh province?", "Karachi", "Karachi is the capital of Sindh and the largest city of Pakistan, serving as the country's financial hub."],
      ["How many districts does Sindh have?", "30", "Sindh is divided into 30 districts, including seven districts of the Karachi division."],
      ["Which river is the lifeline of Sindh?", "Indus", "The Indus River flows the entire length of Sindh and supports most of its agriculture and drinking water."],
      ["Which lake is the largest freshwater lake in Pakistan?", "Manchar Lake", "Manchar Lake in Jamshoro district is the largest freshwater lake in Pakistan."],
      ["Which lake near Thatta is the largest lake of Sindh?", "Keenjhar Lake", "Keenjhar Lake near Thatta, formed by the damming of the Kalri stream, is the largest lake of Sindh."],
      ["Which barrage on the Indus was built in 1932 near Sukkur?", "Sukkur Barrage (Lloyd Barrage)", "The Sukkur Barrage, also called the Lloyd Barrage, was completed in 1932 across the Indus at Sukkur."],
      ["Which barrage on the Indus was completed in 1955 near Hyderabad?", "Kotri Barrage", "The Kotri Barrage, also called the Ghulam Muhammad Barrage, was completed in 1955 near Hyderabad."],
      ["Which fort near Jamshoro is known as the 'Great Wall of Sindh'?", "Ranikot Fort", "Ranikot Fort near Jamshoro, with walls over 30 km long, is known as the 'Great Wall of Sindh'."],
      ["Which delta at the mouth of the Indus is the largest delta of Pakistan?", "Indus Delta", "The Indus Delta near Karachi, with its mangrove forests, is the largest delta of Pakistan."],
      ["Which national park in Sindh is the second largest in Pakistan?", "Kirthar National Park", "Kirthar National Park in the Kirthar range is the second largest national park of Pakistan after Hingol."],
      ["Which hill station is located in the Kirthar range of Sindh?", "Gorakh Hill", "Gorakh Hill, about 5,688 feet high, is Sindh's highest hill station and a popular retreat near Dadu."],
      ["Which desert covers the south-eastern part of Sindh?", "Thar Desert", "The Thar Desert spans south-eastern Sindh, with the district of Tharparkar at its heart."],
      ["Which port on the Indus was the ancient capital of Sindh?", "Banbhore", "The ruins of Banbhore near the Indus mouth mark an ancient port city that predates the Arab conquest of 712 AD."],
      ["Which city of Sindh is famous for the Shah Jahan Mosque?", "Thatta", "Thatta is home to the Shah Jahan Mosque, built in 1647, and the vast Makli Necropolis."],
      ["Which district of Sindh is famous for the Mohenjo-Daro ruins?", "Larkana", "The ruins of Mohenjo-Daro, a major city of the Indus Valley Civilisation, lie in Larkana district."],
      ["Which river empties into the Arabian Sea at the Sindh coast?", "Indus", "The Indus River empties into the Arabian Sea through its delta near Karachi after crossing Sindh."]
    ],
    "Sindh History and Politics": [
      ["Who conquered Sindh in 712 AD?", "Muhammad bin Qasim", "The Arab general Muhammad bin Qasim conquered Sindh in 712 AD, making it the first Arab province in the subcontinent."],
      ["Which battle in 1843 brought Sindh under British rule?", "Battle of Miani", "Sir Charles Napier defeated the Talpur Mirs at the Battle of Miani (Meeanee) in 1843, annexing Sindh."],
      ["Which civilization's ruins at Mohenjo-Daro date from about 2500 BC?", "Indus Valley Civilisation", "Mohenjo-Daro, a major city of the Indus Valley Civilisation (c. 2500 BC), is a UNESCO World Heritage Site."],
      ["Who led the Khilafat movement in Sindh?", "Maulana Muhammad Ali Johar", "The Ali brothers, including Maulana Muhammad Ali Johar, led the Khilafat movement which had strong support in Sindh."],
      ["Who founded the Sindh Hari Committee in 1930?", "G.M. Syed", "G.M. Syed founded the Sindh Hari Committee to champion the rights of Sindh's tenant farmers (haris)."],
      ["Who presented the Pakistan Resolution in 1940?", "A.K. Fazlul Huq", "A.K. Fazlul Huq of Bengal moved the Lahore (Pakistan) Resolution in March 1940 at the Muslim League session."],
      ["Which leader known as 'Quaid-e-Awam' was the first Chief Minister of Sindh?", "Ayub Khuhro", "Ayub Khuhro was the first Chief Minister of Sindh after independence in 1947."],
      ["Which 1954 decision split the One Unit scheme's impact on Sindh?", "The One Unit of 1955", "The One Unit scheme of 1955 merged all West Pakistan provinces, including Sindh, until it was abolished in 1970."],
      ["Who was the first Governor-General of Pakistan, who kept Karachi as capital?", "Quaid-e-Azam Muhammad Ali Jinnah", "Quaid-e-Azam Muhammad Ali Jinnah, the first Governor-General, made Karachi the first capital of Pakistan."],
      ["Which Sindh city served as the interim capital of Pakistan from 1959 to 1967?", "Rawalpindi", "While Islamabad was being built, Rawalpindi served as the interim capital of Pakistan from 1959 to 1967."],
      ["Which Sufi saint's shrine is at Sehwan Sharif?", "Lal Shahbaz Qalandar", "The shrine of Lal Shahbaz Qalandar at Sehwan Sharif attracts pilgrims from across South Asia."],
      ["Which Sindhi leader founded the Sindh National Front?", "G.M. Syed", "G.M. Syed founded the Sindh National Front in 1989 to advance Sindhi nationalist aspirations."],
      ["Which uprising of 1898-1900 resisted the British settlement in Sindh?", "The Hur uprisings", "The Hur (Sindhi Sufi) movements, especially under Pir Pagaro, resisted British rule in the early 20th century."]
    ],
    "Sindh Culture and Economy": [
      ["What is the traditional block-printed shawl of Sindh?", "Ajrak", "Ajrak, a block-printed shawl with geometric patterns, is the iconic textile of Sindhi culture."],
      ["Which headwear is traditionally worn by Sindhi men?", "Sindhi topi", "The embroidered Sindhi topi (cap) is the traditional headwear of Sindhi men."],
      ["Which poet composed the Shah Jo Risalo in Sindhi?", "Shah Abdul Latif Bhittai", "Shah Abdul Latif Bhittai (1689-1752) composed the Shah Jo Risalo, the classical masterpiece of Sindhi poetry."],
      ["Which Sufi poet is known as Sachal Sarmast?", "Abdul Wahab Faruqi", "Sachal Sarmast (1739-1829), a Sindhi Sufi poet, preached love and unity in his verses."],
      ["Which food is the staple of Sindhi cuisine?", "Sindhi biryani and fish", "Sindhi cuisine is famous for Sindhi biryani, fish dishes and the sweet 'sindhi halwa'."],
      ["Which festival marks the harvest in Sindh?", "Teejri", "Teejri and the Sindhi New Year (Cheti Chand) are major cultural festivals of Sindh."],
      ["Which city of Sindh is the centre of the Thar coal field?", "Islamkot", "Islamkot in Tharparkar district hosts the Thar coalfield, Pakistan's largest lignite coal reserve."],
      ["Which seaport is the largest of Pakistan?", "Port of Karachi", "The Port of Karachi, opened in 1887, is Pakistan's largest and busiest seaport."],
      ["Which second major port of Pakistan was built at Phitti Creek in 1980?", "Port Qasim", "Port Qasim, opened in 1980 near Karachi, is Pakistan's second major seaport."],
      ["Which historical graveyard near Thatta is a UNESCO World Heritage Site?", "Makli Necropolis", "Makli Necropolis near Thatta is one of the largest funerary sites in the world and a UNESCO site."],
      ["Which food crop is grown in the Kacha (riverine) areas of Sindh?", "Banana", "Sindh is the leading producer of bananas in Pakistan, grown in the riverine belt along the Indus."],
      ["Which cotton-growing city of Sindh is called the 'Manchester of Pakistan'?", "Hyderabad", "Hyderabad's textile industry has earned it the nickname 'Manchester of Pakistan'."],
      ["Which festival of Sindh honours the saint Abdullah Shah Ghazi?", "Urs at Clifton, Karachi", "The urs of Abdullah Shah Ghazi is held annually at his shrine on Clifton beach in Karachi."],
      ["Which sweet is a specialty of Hyderabad, Sindh?", "Hyderabadi halwa", "Hyderabadi halwa, a sticky sesame-sweet, is the famous confection of Hyderabad, Sindh."],
      ["Which fish species is caught along the Sindh coast in large quantities?", "Sardine and shrimp", "Sardines, shrimp and pomfret dominate the catch of Sindh's fishing harbours at Karachi and Keti Bunder."]
    ]
  }),

  examGen("mdcat", "MDCAT Entry Test Content", {
    "MDCAT Pattern and Rules": [
      ["Which council conducts the MDCAT in Pakistan?", "Pakistan Medical and Dental Council (PMDC)", "The MDCAT is administered under the Pakistan Medical and Dental Council through provincial universities and testing bodies."],
      ["Which subjects are tested in the MDCAT?", "Biology, Chemistry, Physics and English", "The MDCAT tests Biology, Chemistry, Physics and English, with an added section on logical reasoning."],
      ["Which entry test must medical and dental students pass for admission?", "MDCAT", "The Medical and Dental College Admission Test (MDCAT) is compulsory for admission to medical and dental colleges in Pakistan."],
      ["Which qualification is required to appear in the MDCAT?", "FSc Pre-Medical or equivalent", "Candidates must have passed FSc Pre-Medical (Biology, Chemistry, Physics) or an equivalent qualification to sit the MDCAT."],
      ["Which body sets the overall policy and merit for medical admissions?", "PMDC", "The Pakistan Medical and Dental Council sets admission policy, merit and the weightage of MDCAT and FSc marks."],
      ["How long is the MBBS degree programme in Pakistan?", "5 years", "The MBBS degree in Pakistan is a five-year programme followed by a one-year house job."],
      ["Which testing bodies usually conduct the MDCAT in Punjab?", "University of Health Sciences (UHS)", "In Punjab, the University of Health Sciences typically conducts the MDCAT, while other provinces use their own bodies."],
      ["What is the minimum eligibility percentage of FSc marks required to appear in the MDCAT?", "The percentage fixed by PMDC", "Candidates must secure the minimum FSc percentage announced each year by PMDC to become eligible for the MDCAT."],
      ["Which language is the MDCAT conducted in?", "Urdu and English", "The MDCAT is conducted bilingually in Urdu and English, with questions translated for accessibility."],
      ["Which section of the MDCAT tests basic mathematics and reasoning?", "Logical reasoning (IQ)", "The MDCAT includes a logical reasoning section assessing basic maths, sequence and problem-solving skills."]
    ],
    "MDCAT Biology Essentials": [
      ["Which organelle is known as the powerhouse of the cell?", "Mitochondrion", "Mitochondria generate ATP through cellular respiration and are therefore called the powerhouse of the cell."],
      ["How many chromosomes are present in a normal human cell?", "46", "Normal human somatic cells contain 46 chromosomes arranged in 23 pairs."],
      ["Which biomolecule carries the genetic information in living organisms?", "DNA", "Deoxyribonucleic acid (DNA) stores and transmits genetic information in all cellular organisms."],
      ["What is the basic structural unit of all living organisms?", "Cell", "The cell is the fundamental structural and functional unit of life."],
      ["Which process converts glucose and oxygen into energy in cells?", "Cellular respiration", "Cellular respiration breaks down glucose with oxygen to produce ATP, water and carbon dioxide."],
      ["Which blood cells fight infection in the human body?", "White blood cells", "White blood cells (leukocytes) defend the body against pathogens and infection."],
      ["Which vitamin is synthesised by the skin in sunlight?", "Vitamin D", "Vitamin D is produced in the skin on exposure to sunlight and supports calcium absorption."],
      ["Which organ filters waste from the blood to form urine?", "Kidney", "The kidneys filter blood, remove nitrogenous waste and regulate water balance by forming urine."],
      ["Which enzyme begins the digestion of starch in the mouth?", "Amylase", "Salivary amylase (ptyalin) begins the digestion of starch in the mouth."],
      ["Which part of the brain controls balance and coordination?", "Cerebellum", "The cerebellum coordinates voluntary movements and maintains balance."],
      ["What is the normal pH range of human blood?", "7.35 to 7.45", "Human blood is slightly alkaline, normally maintained between pH 7.35 and 7.45."],
      ["Which blood group is known as the universal donor?", "O negative", "O negative red blood cells lack A, B and Rh antigens, making them safe for transfusion to most recipients."],
      ["Which gland regulates metabolism through thyroxine?", "Thyroid gland", "The thyroid gland secretes thyroxine, which regulates the body's metabolic rate."],
      ["Which cells produce insulin in the pancreas?", "Beta cells of the islets of Langerhans", "The beta cells of the islets of Langerhans produce insulin to lower blood glucose."],
      ["Which process removes carbon dioxide from the blood in the lungs?", "External respiration (gas exchange)", "Gas exchange in the alveoli removes carbon dioxide from and adds oxygen to the blood."],
      ["Which division of the nervous system prepares the body for 'fight or flight'?", "Sympathetic nervous system", "The sympathetic nervous system speeds up the heart and prepares the body for stress or danger."],
      ["Which pigment gives red blood cells their colour and carries oxygen?", "Haemoglobin", "Haemoglobin in red blood cells binds oxygen and gives blood its red colour."],
      ["Which pair of bases are found in DNA in equal amounts?", "Adenine and thymine", "In DNA, adenine pairs with thymine and guanine with cytosine, keeping base ratios constant."]
    ],
    "MDCAT Chemistry Essentials": [
      ["What is the chemical formula of water?", "H2O", "Water is composed of two hydrogen atoms and one oxygen atom (H2O)."],
      ["Which gas is released when an acid reacts with a carbonate?", "Carbon dioxide", "Acids react with carbonates to release carbon dioxide gas, water and a salt."],
      ["What is the pH of a neutral solution?", "7", "A neutral solution such as pure water has a pH of 7 at 25 degrees Celsius."],
      ["Which element is the most abundant in the Earth's crust?", "Oxygen", "Oxygen makes up about 46% of the Earth's crust by mass, followed by silicon, aluminium and iron."],
      ["Which subatomic particle has a negative charge?", "Electron", "Electrons are negatively charged particles that orbit the atomic nucleus."],
      ["What is the atomic number of carbon?", "6", "Carbon has atomic number 6, with six protons in its nucleus."],
      ["Which bond forms between a metal and a non-metal?", "Ionic bond", "An ionic bond forms by the transfer of electrons from a metal to a non-metal."],
      ["Which organic compound is the main component of natural gas?", "Methane", "Methane (CH4) is the principal component of natural gas, commonly burned for cooking and heating."],
      ["Which process separates a liquid mixture by boiling points?", "Distillation", "Distillation separates components of a liquid mixture based on differences in their boiling points."],
      ["What is the valency of oxygen?", "2", "Oxygen has a valency of 2, forming two bonds in compounds such as water."],
      ["Which acid is present in lemon juice?", "Citric acid", "Citric acid gives lemons and other citrus fruits their sour taste."],
      ["Which salt is formed when hydrochloric acid neutralises sodium hydroxide?", "Sodium chloride", "HCl and NaOH neutralise to form sodium chloride (common salt) and water."],
      ["What is the molar mass of water (H2O)?", "18 g/mol", "The molar mass of water is 18 g/mol (2 x 1 for hydrogen plus 16 for oxygen)."],
      ["Which gas is produced at the cathode during the electrolysis of water?", "Hydrogen", "During the electrolysis of water, hydrogen is produced at the cathode and oxygen at the anode."],
      ["Which state of matter has a definite shape and volume?", "Solid", "Solids have a fixed shape and volume because their particles are tightly packed."],
      ["Which catalyst is used in the Haber process for ammonia?", "Iron", "Finely divided iron catalyses the Haber process, which combines nitrogen and hydrogen to make ammonia."],
      ["What is the general formula of alkanes?", "CnH2n+2", "Alkanes follow the general formula CnH2n+2, such as methane (CH4) and ethane (C2H6)."],
      ["Which element is the lightest in the periodic table?", "Hydrogen", "Hydrogen, with atomic number 1, is the lightest element in the periodic table."]
    ],
    "MDCAT Physics Essentials": [
      ["What is the SI unit of force?", "Newton", "Force is measured in newtons, where 1 N is the force that gives a 1 kg mass an acceleration of 1 m/s²."],
      ["Which law states that F = ma?", "Newton's second law of motion", "Newton's second law states that the net force on a body equals its mass times its acceleration."],
      ["What is the acceleration due to gravity on Earth's surface?", "9.8 m/s²", "Gravity accelerates falling objects at about 9.8 m/s² near the Earth's surface."],
      ["Which formula represents Ohm's law?", "V = IR", "Ohm's law states that the voltage across a conductor equals the current times the resistance (V = IR)."],
      ["What is the speed of light in vacuum?", "3 x 10^8 m/s", "Light travels at approximately 3 x 10^8 metres per second in a vacuum."],
      ["Which unit measures electric current?", "Ampere", "Electric current, the flow of electric charge, is measured in amperes (A) in the SI system."],
      ["Which type of wave is sound?", "Longitudinal wave", "Sound waves are longitudinal, with particle vibrations parallel to the direction of travel."],
      ["What is the unit of electrical power?", "Watt", "Electrical power is measured in watts, equal to one joule per second."],
      ["Which lens is used to correct short-sightedness?", "Concave lens", "Myopia (short-sightedness) is corrected with a concave (diverging) lens."],
      ["Which energy is possessed by a body due to its height?", "Potential energy", "Gravitational potential energy depends on the height of a body above a reference level."],
      ["What is the boiling point of water at standard pressure?", "100 degrees Celsius", "Water boils at 100 degrees Celsius (373 K) at standard atmospheric pressure."],
      ["Which device converts mechanical energy into electrical energy?", "Generator", "A generator converts mechanical energy into electrical energy by electromagnetic induction."],
      ["Which particle carries a positive charge in the nucleus?", "Proton", "Protons are positively charged particles found in the atomic nucleus."],
      ["Which quantity is measured in hertz?", "Frequency", "Frequency, the number of cycles per second, is measured in hertz (Hz)."],
      ["Which law of motion explains a rocket's propulsion?", "Newton's third law", "Newton's third law states that every action has an equal and opposite reaction, which propels rockets."],
      ["What is the value of Planck's constant?", "6.63 x 10^-34 J·s", "Planck's constant, about 6.63 x 10^-34 joule-seconds, relates a photon's energy to its frequency."],
      ["Which phenomenon explains the bending of light at a boundary?", "Refraction", "Refraction is the bending of light when it passes from one transparent medium into another."],
      ["Which unit measures energy in food?", "Calorie", "Food energy is measured in calories, where 1 kcal equals about 4.2 kilojoules."]
    ],
    "MDCAT English and Reasoning": [
      ["Which part of speech names a person, place or thing?", "Noun", "A noun names a person, place, thing or idea; it can act as a subject or object in a sentence."],
      ["Which tense describes an action completed before another past action?", "Past perfect", "The past perfect (had + past participle) describes an action completed before another past action."],
      ["Which sentence type asks a question?", "Interrogative", "An interrogative sentence asks a question and ends with a question mark."],
      ["What is the antonym of 'ancient'?", "Modern", "The antonym of 'ancient' is 'modern', since the two words describe opposite extremes of age."],
      ["What is the synonym of 'abundant'?", "Plentiful", "The synonym of 'abundant' is 'plentiful', as both mean existing in large quantities."],
      ["Which punctuation mark ends a declarative sentence?", "Full stop", "A declarative sentence, which states a fact, is ended with a full stop at its close."],
      ["Which logical fallacy assumes a conclusion from a single example?", "Hasty generalisation", "A hasty generalisation draws a broad conclusion from insufficient evidence."],
      ["If all dogs are mammals and all mammals breathe, what must be true?", "All dogs breathe", "If the premises hold, every dog is a mammal and therefore breathes."],
      ["Which number comes next in the sequence 2, 4, 8, 16?", "32", "Each term of the sequence doubles the previous term, so the next term is 32."],
      ["Which word is the adjective in the sentence 'The tall boy runs fast'?", "Tall", "'Tall' describes the noun 'boy', making it the adjective in the sentence."],
      ["Which option is the correct plural of 'analysis'?", "Analyses", "The plural of 'analysis' is 'analyses', following the Greek pattern of words ending in -sis."],
      ["A clock shows 3:00. What is the angle between the hands?", "90 degrees", "At 3:00 the hour and minute hands are perpendicular, making a 90-degree angle."],
      ["Which word means 'to examine closely'?", "Scrutinise", "To scrutinise means to examine something very closely, as an auditor scrutinises accounts."],
      ["Which preposition correctly completes: 'The meeting starts ___ 9 a.m.'?", "at", "The preposition 'at' is used with specific times such as 9 a.m."],
      ["Which pair of words are homophones?", "Their and there", "'Their' and 'there' sound alike but have different meanings and spellings, making them homophones."],
      ["If 5 machines produce 50 items in 5 hours, how many items do 10 machines produce in 5 hours?", "100", "Doubling the machines doubles the output, so 10 machines produce 100 items in the same time."]
    ]
  }),

  examGen("lat", "LAT Entry Test Content", {
    "LAT Pattern and Rules": [
      ["Which body conducts the Law Admission Test (LAT)?", "Higher Education Commission (HEC)", "The Higher Education Commission has conducted the LAT since 2017 for admissions to LLB programmes in Pakistan."],
      ["Which sections are tested in the LAT?", "English, Urdu, Islamic Studies, Pakistan Studies and Law Aptitude", "The LAT tests English, Urdu, Islamic Studies, General Knowledge about Pakistan and Law Aptitude."],
      ["What is the total duration of the LAT?", "100 minutes", "The LAT is a 100-minute test with 100 multiple-choice questions."],
      ["What is the passing percentage in the LAT?", "40%", "Candidates must obtain at least 40% marks in the LAT to qualify for law admissions."],
      ["Which degree requires the LAT for admission?", "LLB", "The LAT is required for admission to the five-year LLB programme in Pakistan."],
      ["How many marks is the LAT worth?", "100 marks", "The LAT carries 100 marks, with each of its 100 questions worth one mark."],
      ["How many times can a candidate appear in the LAT?", "Multiple times as announced", "HEC allows candidates to appear in the LAT in multiple sessions; the latest valid result counts for admission."],
      ["Which universities use the LAT for their law programmes?", "Public and private universities", "Both public and private HEC-recognised universities use the LAT for admissions to their LLB programmes."],
      ["Which section of the LAT is weighed the most?", "English", "The English section carries the highest weightage in the LAT, covering vocabulary, grammar and comprehension."],
      ["Who determines the merit for LLB admissions?", "The admitting university", "Each university combines LAT scores with academic marks according to its own admission policy to fix merit."]
    ],
    "LAT Law Aptitude": [
      ["Which is the highest law of Pakistan?", "The Constitution of Pakistan", "The Constitution of Pakistan, adopted in 1973, is the supreme law of the land."],
      ["Which part of the Constitution lists the Fundamental Rights?", "Part II", "Fundamental Rights are enshrined in Part II (Articles 8-28) of the 1973 Constitution."],
      ["Which article of the Constitution guarantees the right to life and liberty?", "Article 9", "Article 9 of the Constitution guarantees the protection of life and liberty to every person."],
      ["What is the minimum age to become President of Pakistan?", "45 years", "Article 41 requires the President of Pakistan to be at least 45 years old."],
      ["How many articles does the 1973 Constitution contain?", "280", "The 1973 Constitution of Pakistan contains 280 articles and seven schedules."],
      ["Which institution has the power of judicial review in Pakistan?", "The superior courts", "The Supreme Court and High Courts exercise the power of judicial review over legislation."],
      ["What is the legal age of majority in Pakistan?", "18 years", "The age of majority in Pakistan is 18 years under the Majority Act."],
      ["Which law governs the registration of criminal cases as FIRs?", "Criminal Procedure Code (CrPC)", "The Code of Criminal Procedure 1898 regulates FIRs, investigations and trials of criminal cases."],
      ["What does 'prima facie' mean in legal terms?", "On the face of it", "'Prima facie' means evidence that appears sufficient on its face unless rebutted."],
      ["Which court is the highest appellate court of Pakistan?", "Supreme Court of Pakistan", "The Supreme Court of Pakistan is the highest court of appeal in the country."],
      ["Which amendment lowered the voting age to 18?", "18th Amendment", "The 18th Amendment, among other changes, lowered the voting age from 21 to 18 in Pakistan."],
      ["What is the term of a judge of the Supreme Court of Pakistan?", "Until the age of 65", "Supreme Court judges retire at the age of 65, while High Court judges retire at 62."],
      ["Which writ is issued to challenge unlawful detention?", "Habeas corpus", "The writ of habeas corpus is issued to secure the release of a person detained unlawfully."],
      ["Which concept means 'the decision stands' in legal precedent?", "Stare decisis", "Stare decisis means courts should follow the precedents set by earlier decisions."],
      ["Which document formally accuses a person of a crime?", "Charge sheet", "The charge sheet, or challan, formally accuses a suspect after investigation of a crime."],
      ["What is the period of limitation to file a suit in Pakistan?", "As fixed by the Limitation Act", "The Limitation Act 1908 fixes the time limits within which suits and appeals must be filed."]
    ],
    "LAT Pakistan Studies": [
      ["Which country became Pakistan in 1947?", "It was created from British India", "Pakistan was created on 14 August 1947 from the Muslim-majority areas of British India."],
      ["Who was the first Governor-General of Pakistan?", "Quaid-e-Azam Muhammad Ali Jinnah", "Quaid-e-Azam Muhammad Ali Jinnah served as the first Governor-General of Pakistan from 1947 to 1948."],
      ["Which document was presented at Lahore in 1940?", "The Pakistan Resolution", "The Pakistan Resolution, presented by A.K. Fazlul Huq, was adopted at the Muslim League session in Lahore in 1940."],
      ["Which river flows through the capital city of Pakistan?", "The Soan near Islamabad", "Islamabad lies in the Potohar plateau, with the Soan river flowing through the region."],
      ["Which is the national language of Pakistan?", "Urdu", "Urdu is the national language of Pakistan, while English remains the official language of government."],
      ["Which mountain is the second highest peak in the world, located in Pakistan?", "K2", "K2 (8,611 m) in the Karakoram range is the second highest peak in the world."],
      ["Which amendment made Urdu the national language and defined provincial names?", "The 18th Amendment", "The 18th Amendment, among other changes, reaffirmed Urdu as the national language."],
      ["Which province of Pakistan is the largest by population?", "Punjab", "Punjab is the most populous province of Pakistan, followed by Sindh."],
      ["Who was the first woman Prime Minister of Pakistan?", "Benazir Bhutto", "Benazir Bhutto became the first woman Prime Minister of Pakistan in 1988."],
      ["Which institution is the highest legislative body of Pakistan?", "Parliament", "The Parliament of Pakistan consists of the National Assembly and the Senate."],
      ["Which lake is located in the Kalash valley of Chitral?", "There is no major lake in Kalash valleys", "The Kalash valleys of Bumboret, Rumbur and Birir are known for their culture rather than large lakes."],
      ["Which famous mountain pass links Pakistan with China?", "Khunjerab Pass", "The Khunjerab Pass on the Karakoram Highway links Pakistan with China."],
      ["Which city hosted the first session of the Constituent Assembly of Pakistan?", "Karachi", "The first Constituent Assembly session met in Karachi in August 1947."],
      ["Which area of Pakistan is called the 'Roof of the World'?", "Shandur", "Shandur Pass, connecting Chitral with Gilgit, is popularly known as the 'Roof of the World'."],
      ["Who was the first Chief Justice of Pakistan?", "Justice Abdul Rashid", "Justice Abdul Rashid became the first Chief Justice of Pakistan in 1949."],
      ["Which canal system irrigates most of Punjab?", "The Indus basin canal system", "The Indus basin canal system, built under the Indus Water Treaty, irrigates most of Punjab."]
    ],
    "LAT Urdu Basics": [
      ["Which poet is known as the 'Poet of the East'?", "Allama Muhammad Iqbal", "Allama Iqbal, the author of Bang-e-Dara and Asrar-e-Khudi, is known as the 'Poet of the East'."],
      ["Who wrote the national anthem of Pakistan?", "Hafeez Jalandhari", "Hafeez Jalandhari wrote the lyrics of the Pakistani national anthem."],
      ["Which is the first novel of Urdu literature?", "Mirat-ul-Uroos", "Mirat-ul-Uroos (1869) by Deputy Nazir Ahmad is regarded as the first Urdu novel."],
      ["Who is known as the father of Urdu prose?", "Maulvi Abdul Haq", "Maulvi Abdul Haq is known as the father of Urdu prose and promoted the language throughout his life."],
      ["Which poet composed the masnavi 'Sehr-ul-Bayan'?", "Mir Hasan", "Mir Hasan's 'Sehr-ul-Bayan' is a classic Urdu masnavi narrating a romance in verse."],
      ["Which line of Urdu poetry opens Iqbal's 'Tarana-e-Hind'?", "Sare jahan se achha", "'Sare jahan se achha Hindustan hamara' is the opening line of Iqbal's Tarana-e-Hind."],
      ["Who wrote the drama 'Anarkali'?", "Imtiaz Ali Taj", "Imtiaz Ali Taj wrote the famous Urdu drama 'Anarkali', based on the legend of Anarkali and Prince Salim."],
      ["Which Urdu word means 'knowledge'?", "Ilm", "The Urdu word 'ilm' means knowledge, and is used in compound words such as 'ilm-ul-balaghah'."],
      ["Which dialect of Urdu is the standard written form?", "The Urdu of Lucknow and Delhi", "Standard written Urdu is based on the refined speech of Lucknow and Delhi."],
      ["Which script is Urdu written in?", "Perso-Arabic script", "Urdu is written in the Perso-Arabic script, written from right to left."],
      ["Which poet wrote 'Gulistan-e-Saadi' in Persian?", "Saadi Shirazi", "Saadi Shirazi wrote 'Gulistan' and 'Bustan' in Persian, which are widely studied in Urdu-medium schools."],
      ["Which Urdu newspaper is the oldest continuously published in Pakistan?", "Nawa-i-Waqt", "Nawa-i-Waqt, founded in 1940, is one of Pakistan's oldest Urdu newspapers."],
      ["Which word is the Urdu translation of 'science'?", "Saince ke mutabiq 'sains' ya 'ilm'", "Urdu uses 'ilm' or the transliteration 'sains' for the word 'science'."],
      ["Who translated the Quran into Urdu?", "Shah Abdul Qadir", "Shah Abdul Qadir published the first complete Urdu translation of the Quran in the 19th century."],
      ["Which language family does Urdu belong to?", "Indo-Aryan", "Urdu is an Indo-Aryan language that developed in the Indian subcontinent with Persian and Arabic influences."],
      ["Which poet is called 'Shair-e-Mashriq'?", "Allama Iqbal", "Allama Iqbal is called 'Shair-e-Mashriq' (the Poet of the East)."]
    ]
  })
];
