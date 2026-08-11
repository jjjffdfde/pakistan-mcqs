/* ============================================================
   Generator 22 — Exam-specific content: Forces, corporate
   bodies, utilities, postal, emergency and role-based exams.
   Original authored facts per exam hub subject.
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
  examGen("navy", "Pakistan Navy (Recruitment) Content", {
    "Navy History and Organisation": [
      ["When was the Pakistan Navy formally established?", "14 August 1947", "The Royal Pakistan Navy came into being on 14 August 1947 with a handful of ships and shore establishments."],
      ["Who was the first Pakistani Chief of Naval Staff?", "Rear Admiral HMS Choudri", "Rear Admiral H.M.S. Choudri became the first Pakistani Chief of Naval Staff in 1953."],
      ["Where is the headquarters of the Pakistan Navy located?", "Islamabad", "The Naval Headquarters (NHQ) of the Pakistan Navy is located in Islamabad."],
      ["Which day is celebrated as Pakistan Navy Day?", "8 September", "Pakistan Navy Day is celebrated on 8 September to commemorate the 1965 Operation Dwarka."],
      ["Which operation by the Navy in 1965 bombarded the Indian coastal town of Dwarka?", "Operation Dwarka", "On 7-8 September 1965, the Pakistan Navy bombarded Dwarka, an Indian naval base town."],
      ["Which agency functions under the Pakistan Navy for coastal security?", "Pakistan Maritime Security Agency", "The Pakistan Maritime Security Agency (MSA) patrols Pakistan's coastal waters under the Navy."],
      ["Which naval base is located at Ormara in Balochistan?", "PNS Makran", "PNS Makran at Ormara is a major naval base of the Pakistan Navy on the Makran coast."],
      ["Which academy trains officer cadets of the Pakistan Navy?", "Pakistan Naval Academy", "The Pakistan Naval Academy at Manora, Karachi, trains officer cadets of the Pakistan Navy."],
      ["What is the rank of the head of the Pakistan Navy?", "Admiral", "The Chief of the Naval Staff holds the four-star rank of Admiral."],
      ["Which branch of the Navy operates submarines?", "The Submarine Force", "The Pakistan Navy's submarine force operates Agosta-90B (Khalid class) and Hangor-class submarines."],
      ["Which shipyard builds and repairs naval vessels in Pakistan?", "Karachi Shipyard", "Karachi Shipyard and Engineering Works builds and maintains naval and commercial vessels."],
      ["Which Pakistani submarine force hero received the Nishan-e-Haider?", "No Pakistani naval officer has received it", "The Nishan-e-Haider has been awarded to army and air force personnel; no naval officer has received it."],
      ["Which frigate class did Pakistan acquire from China in the 2020s?", "Type 054A/P", "Pakistan Navy inducted Type 054A/P frigates from China in the early 2020s, named Tughril class."],
      ["Which amphibious assault ship was inducted by the Pakistan Navy in 2023?", "PNS Nasr", "PNS Nasr is a fleet tanker; the 2023 induction was the Type 071E ship PNS Yarmook class."],
      ["What is the motto of the Pakistan Navy?", "Guardian of the Sea", "The Pakistan Navy's motto is 'Guardian of the Sea', reflecting its maritime defence role."]
    ],
    "Navy Branches and Career": [
      ["Which branch of the Navy deals with aircraft operations?", "Naval Aviation", "The Naval Aviation branch operates helicopters and fixed-wing aircraft from ships and shore bases."],
      ["Which entry route selects officer cadets through ISSB-style tests?", "Cadet entry", "Navy officer cadets are selected through initial tests followed by selection board interviews."],
      ["Which force of the Navy secures ports and naval bases?", "Naval Police", "The naval police and marine units secure naval installations and facilities."],
      ["Which division of the Navy handles its logistics and supplies?", "Supply Branch", "The Supply and Secretariat branch of the Navy manages logistics, pay and administration."],
      ["Which naval branch operates sonar and radar equipment?", "Operations (OPS) Branch", "The Operations branch of the Navy handles navigation, sonar and radar warfare."],
      ["Which forces perform amphibious and coastal operations?", "Marines", "Pakistan Navy marines conduct amphibious assaults and coastal security operations."],
      ["What is the minimum educational requirement for Navy Sailor entry?", "Matric", "Navy sailor (sailor/child) entries require at least Matric, while technical entries need FSc."],
      ["Which training ship of the Pakistan Navy is based at Manora?", "PNS Rahbar", "PNS Rahbar is the training ship establishment of the Pakistan Naval Academy at Manora."],
      ["Which service provides medical care in the Pakistan Navy?", "Naval Medical Service", "Naval hospitals and medical staff provide healthcare to Navy personnel and their families."],
      ["Which branch of the Navy maintains its weapons and engines?", "Technical Branch", "The Technical branch of the Navy maintains engines, weapons and electronic systems of ships."]
    ]
  }),

  examGen("paf", "Pakistan Air Force (Recruitment) Content", {
    "PAF History and Organisation": [
      ["When was the Pakistan Air Force established?", "14 August 1947", "The Royal Pakistan Air Force was formed on 14 August 1947; the 'Royal' prefix was dropped in 1956."],
      ["Who was the first Pakistani commander of the Air Force?", "Air Marshal Asghar Khan", "Air Marshal Asghar Khan became the first Pakistani to command the Air Force in the 1950s."],
      ["Which day is celebrated as Pakistan Air Force Day?", "7 September", "PAF Day is celebrated on 7 September to commemorate the air battles of the 1965 war."],
      ["Where is the PAF Academy located?", "Risalpur", "The PAF Academy at Risalpur, Khyber Pakhtunkhwa, trains PAF officer cadets."],
      ["Which aircraft is jointly produced by Pakistan and China?", "JF-17 Thunder", "The JF-17 Thunder is a multi-role fighter jointly developed by Pakistan and China."],
      ["Which American fighter jet is operated by the PAF?", "F-16 Fighting Falcon", "The PAF operates F-16 Fighting Falcon jets acquired from the United States."],
      ["Which PAF base is located at Kamra, famous for aircraft overhaul?", "PAF Base Minhas", "PAF Base Minhas at Kamra hosts aircraft manufacturing and overhaul facilities."],
      ["Which PAF base near Sargodha is a major fighter base?", "PAF Mushaf (Sargodha)", "PAF Base Mushaf, formerly Sargodha, is the PAF's principal fighter base."],
      ["Which Pakistani pilot shot down five Indian aircraft in under a minute in 1965?", "M.M. Alam", "Flight Lieutenant M.M. Alam claimed five Indian aircraft in under a minute during the 1965 war."],
      ["Which PAF officer received the Nishan-e-Haider posthumously in 1971?", "Pilot Officer Rashid Minhas", "Pilot Officer Rashid Minhas received the Nishan-e-Haider posthumously for his sacrifice in 1971."],
      ["What was the name of the PAF's response to India's strikes on 27 February 2019?", "Operation Swift Retort", "Operation Swift Retort was the PAF's air response on 27 February 2019 in which it downed an Indian jet."],
      ["Which airborne early warning aircraft does the PAF operate?", "Saab 2000 Erieye", "The PAF operates Saab 2000 Erieye and Chinese ZDK-03 airborne early warning aircraft."],
      ["Which transport aircraft is used by the PAF for cargo and troop movement?", "C-130 Hercules", "The C-130 Hercules is the PAF's main tactical transport aircraft."],
      ["Which missile, carried by JF-17, is Pakistan's air-launched cruise missile?", "Ra'ad", "The Ra'ad is an air-launched cruise missile developed by Pakistan for stand-off strikes."],
      ["What is the PAF motto?", "To be a cut above the rest", "The motto of the Pakistan Air Force is 'To be a cut above the rest'."],
      ["Which training aircraft do PAF cadets fly first?", "K-8 Karakoram", "The K-8 Karakoram trainer, built with China, is the PAF's basic jet trainer."]
    ],
    "PAF Careers and Branches": [
      ["Which entry scheme selects PAF fighter pilots?", "GD Pilot", "The GD Pilot scheme selects General Duty pilots for PAF fighter and transport squadrons."],
      ["Which branch of the PAF handles aircraft engineering?", "Engineering Branch", "The Engineering branch maintains PAF aircraft, avionics and weapons systems."],
      ["Which branch manages PAF air defence radars?", "Air Defence Branch", "The Air Defence branch of the PAF operates radars and surface-to-air missile systems."],
      ["Which entry is for PAF administrative officers?", "Administrative and Special Duties", "Administrative officers handle PAF logistics, accounts and special duties."],
      ["Which course do PAF cadets complete before commissioning?", "The Air Force Academy course", "Cadets complete a training course at PAF Academy Risalpur before being commissioned."],
      ["What is the minimum educational qualification for PAF Airmen entry?", "Matric", "PAF Airmen (non-officer) entries require Matric, while technical trades need FSc with science."],
      ["Which PAF trade handles parachute supply drops?", "Air Supply", "The Air Supply trade prepares and drops cargo and paratroopers."],
      ["Which force protects PAF bases from ground threats?", "PAF Base Security", "PAF base security personnel and the air defence troops protect airfields and installations."],
      ["Which branch runs PAF's meteorological services?", "Meteorology Branch", "PAF meteorologists provide weather data essential for flight operations."],
      ["Which aircraft of the PAF is used for pilot conversion training?", "MFI-17 Mushshak", "The MFI-17 Mushshak, built in Pakistan, is used for basic flying training."]
    ]
  }),

  examGen("pma", "PMA (Pakistan Military Academy) Content", {
    "PMA Organisation and Training": [
      ["Where is the Pakistan Military Academy located?", "Kakul, Abbottabad", "The Pakistan Military Academy is located at Kakul, near Abbottabad in Khyber Pakhtunkhwa."],
      ["What are the officer cadets of PMA called?", "Gentlemen Cadets", "Officer cadets under training at PMA are called Gentlemen Cadets (GCs)."],
      ["How long is the PMA Long Course for regular officers?", "About two years", "The PMA Long Course typically lasts around two years, including basic military training and academic studies."],
      ["Which selection process must candidates pass before joining PMA?", "ISSB selection", "Candidates are selected through the Inter Services Selection Board (ISSB) before joining PMA."],
      ["Which entry scheme trains army technical officers at PMA?", "Technical Cadet Course", "The Technical Cadet Course at PMA trains engineers for the Pakistan Army."],
      ["Who is the commandant of the PMA usually?", "A senior army officer", "The PMA commandant is normally a senior army officer of major-general rank."],
      ["Which prestigious trophy is awarded to the best cadet of each PMA course?", "The Commandant's Trophy", "Outstanding cadets receive the Commandant's Trophy and the sword of honour for the best performance."],
      ["Which historical figure inaugurated the PMA in 1948?", "The first commandant with the Quaid's message", "The PMA formally began at Kakul in 1948 after the transfer of the old Indian Military Academy traditions from Dehradun."],
      ["Which famous army chiefs are graduates of the PMA?", "Generals from Pervez Musharraf to Asim Munir", "Pakistan's army chiefs, including Generals Pervez Musharraf, Raheel Sharif, Qamar Javed Bajwa and Asim Munir, are PMA graduates."],
      ["Which subject is central to the PMA academic curriculum?", "Military and leadership studies", "The PMA curriculum combines military training with academic studies in leadership, tactics and general education."],
      ["Which regiment of cadets at PMA conducts ceremonial parades?", "The PMA Guard", "The PMA's ceremonial guard unit conducts parades and honours ceremonies."],
      ["What is the name of the PMA's annual passing-out parade?", "The Final Term Passing-out Parade", "The Final Term Passing-out Parade is the grand ceremony at which cadets are commissioned."],
      ["Which valley near Abbottabad gives PMA its nickname?", "Kakul Valley", "PMA is popularly called 'Kakul' after the valley where it is situated."],
      ["Which military college prepares boys for entry into the armed forces?", "Military College Jhelum", "Military College Jhelum (1937) prepares cadets for entry into PMA and the armed forces."],
      ["What rank do PMA graduates receive upon commissioning?", "Second Lieutenant", "PMA graduates are commissioned as Second Lieutenants in the Pakistan Army."],
      ["Which award is given to the best foreign cadet at PMA?", "The Foreign Cadet Trophy", "The best-performing overseas cadet at PMA receives a special trophy during the passing-out parade."]
    ],
    "PMA Entrance Requirements": [
      ["What is the minimum height requirement for PMA candidates?", "5 feet 4 inches", "Male candidates for PMA generally require a minimum height of 5 feet 4 inches."],
      ["Which educational qualification is required for PMA Long Course?", "FSc or A-Level equivalent", "Candidates for the PMA Long Course must have passed FSc (pre-engineering/pre-medical) or equivalent."],
      ["Which physical test is part of the PMA initial selection?", "The Physical Fitness Test", "The initial selection includes running, push-ups, sit-ups and pull-ups in the physical fitness test."],
      ["Which board conducts the preliminary tests before ISSB for PMA?", "Army Selection and Recruitment Centres", "AS&RCs conduct initial academic and physical tests before candidates are sent to ISSB."],
      ["What is the maximum age for PMA Long Course candidates?", "Usually 17 to 22 years", "PMA Long Course candidates must generally be aged between 17 and 22 years."],
      ["Which document proves a candidate's eligibility for army recruitment?", "The registration slip and domicile", "Candidates need their CNIC/B-form, domicile and educational certificates during recruitment."],
      ["Which medical fitness criteria apply to PMA candidates?", "The military medical standards", "Candidates must pass the armed forces medical examination, including eye and physical standards."],
      ["Which test at ISSB assesses group leadership?", "The GTO tasks", "Group Testing Officer (GTO) tasks at ISSB evaluate leadership, teamwork and planning."]
    ]
  }),

  examGen("asf", "ASF (Airport Security Force) Content", {
    "ASF Organisation": [
      ["What does ASF stand for?", "Airport Security Force", "ASF is the Airport Security Force, responsible for aviation security in Pakistan."],
      ["When was the ASF established?", "1976", "The Airport Security Force was established in 1976 to secure airports and civil aviation."],
      ["Where is the headquarters of the ASF located?", "Karachi", "The ASF headquarters is located in Karachi, the hub of Pakistan's civil aviation."],
      ["Which department does the ASF work under?", "The Ministry of Aviation", "The ASF functions under the Ministry of Aviation (previously the Aviation Division)."],
      ["Who is the head of the ASF?", "The Director General", "The Director General ASF commands the force, supported by regional and airport commanders."],
      ["Which international body sets the aviation security standards ASF follows?", "ICAO", "ASF applies the aviation security standards (AVSEC) of the International Civil Aviation Organization."],
      ["What is the primary duty of the ASF?", "Securing airports and aircraft", "ASF personnel screen passengers, guard aircraft and prevent unlawful interference at airports."],
      ["Which Pakistani airports does the ASF secure?", "All civilian airports", "ASF provides security at all major civilian airports across Pakistan."],
      ["Which forces handle airport ground security besides the ASF?", "Airport police and airlines' security", "Airport police and airline security staff supplement ASF at Pakistan's airports."],
      ["Which act governs civil aviation security in Pakistan?", "The Civil Aviation Act", "Aviation security in Pakistan is governed by the Civil Aviation Ordinance and its rules."],
      ["Which training institution trains ASF personnel?", "The ASF Training School", "The ASF Training School trains recruits in aviation security and physical defence."],
      ["What is the uniformed rank of an ASF officer equivalent to?", "Police and civil armed forces ranks", "ASF ranks run from constable/corporal through to inspectors and senior officers."],
      ["Which event in 1986 prompted stronger ASF deployment at airports?", "The Karachi hijacking of Pan Am Flight 73", "The 1986 hijacking of Pan Am Flight 73 at Karachi highlighted the need for stronger airport security."],
      ["Which screening equipment do ASF teams use at checkpoints?", "X-ray and metal detectors", "ASF uses X-ray baggage scanners and metal detectors for passenger and cargo screening."]
    ]
  }),

  examGen("anf", "ANF (Anti-Narcotics Force) Content", {
    "ANF Organisation": [
      ["What does ANF stand for?", "Anti-Narcotics Force", "ANF is the Anti-Narcotics Force, Pakistan's premier drug control agency."],
      ["When was the ANF established?", "1995", "The Anti-Narcotics Force was established in 1995 to combat drug trafficking in Pakistan."],
      ["Where is the headquarters of the ANF located?", "Rawalpindi", "The ANF headquarters is located in Rawalpindi, near the federal capital."],
      ["What is the motto of the ANF?", "Drug Free Pakistan", "The ANF's motto is 'Drug Free Pakistan', reflecting its mission of drug demand and supply reduction."],
      ["Which regional directorate of the ANF covers the southern ports?", "The Karachi regional directorate", "ANF's Karachi and Gwadar directorates secure the sea ports against drug smuggling."],
      ["Which type of operations does the ANF conduct against drug traffickers?", "Seizures and interdictions", "ANF conducts seizures, interdictions and anti-smuggling operations against drug networks."],
      ["Which drug is most commonly trafficked through Pakistan's borders?", "Heroin", "Heroin produced in Afghanistan is trafficked through Pakistan, making heroin the ANF's main target."],
      ["Which ministry does the ANF work under?", "The Ministry of Interior", "The ANF functions under the Ministry of Interior of Pakistan."],
      ["Which international body supports ANF's demand-reduction programmes?", "UNODC", "The United Nations Office on Drugs and Crime supports ANF in training and demand-reduction projects."],
      ["Which educational programmes does the ANF run in schools?", "Drug awareness campaigns", "ANF runs anti-drug awareness campaigns in schools and colleges across Pakistan."],
      ["What is the rank structure of the ANF?", "Civil armed force ranks", "ANF officers hold ranks similar to other civil armed forces, headed by a Director General."],
      ["Which border checkpoints does ANF monitor for drug smuggling?", "The Afghanistan and Iran borders", "ANF stations personnel at the Chaman, Torkham and other border crossings."],
      ["Which treatment centres does ANF support for addicts?", "Drug rehabilitation centres", "ANF supports rehabilitation centres for the treatment of drug addicts."],
      ["Which agency data records drug seizures in Pakistan?", "ANF seizure reports", "ANF publishes annual drug seizure statistics used for national and international reporting."]
    ]
  }),

  examGen("mod", "MOD (Ministry of Defence) Content", {
    "MOD Organisation": [
      ["Which ministry oversees Pakistan's armed forces?", "The Ministry of Defence", "The Ministry of Defence oversees the Pakistan Army, Navy and Air Force."],
      ["Where is the Ministry of Defence located?", "Rawalpindi", "The Ministry of Defence is located in Rawalpindi, adjacent to the GHQ."],
      ["Who is the political head of the Ministry of Defence?", "The Defence Minister", "The federal Minister of Defence heads the Ministry of Defence."],
      ["Which official is the administrative head of the MOD?", "The Defence Secretary", "The Defence Secretary administers the day-to-day affairs of the Ministry of Defence."],
      ["Which division of the MOD handles procurement of defence equipment?", "The Defence Division", "The Defence Division handles procurement, budgets and inter-services matters."],
      ["Which production organisation works under the MOD?", "Defence Production", "The Defence Production Division works under the MOD to manufacture arms and equipment."],
      ["Which civilian wing of the armed forces recruits for MOD posts?", "MOD civilian recruitment", "MOD hires civilians for clerical, technical and administrative posts in defence establishments."],
      ["Which armed forces come under the MOD?", "Army, Navy and Air Force", "The Pakistan Army, Pakistan Navy and Pakistan Air Force all fall under the Ministry of Defence."],
      ["Which intelligence organisation reports on defence matters?", "Defence intelligence agencies", "The MOD coordinates with defence intelligence for national security."],
      ["Which budget heads cover MOD spending?", "The defence budget", "The annual defence budget, presented in the Finance Bill, funds the MOD and the armed forces."],
      ["Which organisation manages defence land in Pakistan?", "The Defence Housing and land directorates", "Defence estate offices under MOD manage military land and cantonments."],
      ["Which ordinance factories work under the MOD?", "POF Wah", "Pakistan Ordnance Factories (POF) at Wah Cantt work under the MOD."],
      ["Which naval dockyard falls under the MOD?", "Karachi Dockyard", "The Karachi Dockyard and naval shipyard facilities operate under the MOD."],
      ["Which board regulates retired defence personnel benefits?", "The Board of Administration", "The Board of Administration (BOA) under the MOD administers pensioner welfare."]
    ]
  }),

  examGen("punjab-police", "Punjab Police (Recruitment) Content", {
    "Police Organisation and Law": [
      ["Which act governs the organisation of police in Pakistan?", "The Police Act 1861", "Police organisation in Pakistan is governed by the Police Act of 1861."],
      ["What does FIR stand for?", "First Information Report", "An FIR is the First Information Report of a crime, registered under Section 154 of the CrPC."],
      ["Which section of the CrPC deals with the registration of FIR?", "Section 154", "Section 154 of the Code of Criminal Procedure requires the police to record an FIR for a cognisable offence."],
      ["Which police officer heads a police station?", "The Station House Officer", "The Station House Officer (SHO), usually an inspector or sub-inspector, heads a police station."],
      ["What is the emergency helpline of Punjab Police?", "15", "Punjab Police operates the emergency helpline 15 for public complaints and emergencies."],
      ["Which rank is above Inspector in the police hierarchy?", "Deputy Superintendent of Police", "The rank order above Inspector is DSP, SP, SSP and above, each with widening command responsibilities."],
      ["Which complaint system allows citizens to report police misconduct?", "The Punjab Police Complaint Cell", "Punjab Police runs complaint cells and the online complaint portal for citizen grievances."],
      ["Which unit of Punjab Police handles street crime in Lahore?", "Dolphin Force", "The Dolphin Force patrols Lahore against street crime and responds to emergency calls."],
      ["Which women-focused unit operates in Punjab Police?", "Women Police Stations", "Women police stations and desks handle cases involving women across Punjab."],
      ["Which act empowers police to arrest without warrant in emergencies?", "The Criminal Procedure Code", "The CrPC empowers police to arrest without a warrant in cognisable cases and emergencies."],
      ["Which investigation unit handles financial crimes?", "The Financial Crime Investigation Unit", "Punjab Police's financial crime unit investigates fraud and money-laundering."],
      ["Which police training institution is the oldest in Pakistan?", "The Punjab Police Training College", "The Police Training College at Sihala and other academies train Punjab Police recruits."],
      ["What is the term for a police officer's written report of a crime scene?", "The investigation report", "Police prepare detailed investigation reports on crime scenes and cases."],
      ["Which body supervises the Punjab Police?", "The Punjab Inspector General of Police", "The Inspector General of Police (IGP) Punjab commands the provincial police."],
      ["Which Punjab police unit tackles organised crime?", "The Organised Crime Unit", "Punjab Police's Organised Crime Unit targets gangs and smuggling networks."],
      ["Which section of the Penal Code defines the offence of theft?", "Section 378 PPC", "Theft is defined under Section 378 of the Pakistan Penal Code."]
    ],
    "Police Recruitment and Fitness": [
      ["What is the minimum educational qualification for Punjab Police Constable?", "Matric", "Punjab Police constables must have passed Matriculation from a recognised board."],
      ["Which physical standard applies to male Punjab Police recruits?", "Height 5 feet 7 inches and chest 33-34.5 inches", "Male recruits need a minimum height of 5'7\" with chest expansion between 33 and 34.5 inches."],
      ["Which test do police aspirants take for physical endurance?", "The running and physical fitness test", "Recruits must complete running and strength tests during physical screening."],
      ["Which psychological test is part of police selection?", "The psychological assessment", "Police selection includes a psychological assessment of temperament and aptitude."],
      ["What is the maximum age for Punjab Police Constable recruitment?", "18 to 25 years", "Punjab Police constables are recruited between the ages of 18 and 25."],
      ["Which district recruitment centres hold police tests?", "Recruitment centres in each district", "Punjab Police holds recruitment tests at district-level centres under the Regional Police Officers."],
      ["Which department certifies the domicile for police recruitment?", "The district administration", "Domicile certificates issued by the district administration establish provincial eligibility."],
      ["Which interview stage follows the written test in police recruitment?", "The personal interview", "Candidates who pass the written test are called for personal interviews and document checks."],
      ["Which government body announces Punjab Police vacancies?", "Punjab Police and the provincial government", "Punjab Police vacancies are announced by the force through newspapers and its website."],
      ["Which reserve is given to police personnel with physical disabilities?", "The quota per policy", "Recruitment quotas for minorities, women and disabled candidates apply per government policy."]
    ]
  }),

  examGen("motorway-police", "Motorway Police (NH&MP) Content", {
    "Motorway Police Organisation": [
      ["What does NH&MP stand for?", "National Highways and Motorway Police", "NH&MP is the National Highways and Motorway Police of Pakistan."],
      ["When was the NH&MP established?", "1997", "The National Highways and Motorway Police was established in 1997 under the Motorways Act."],
      ["Where is the headquarters of the NH&MP?", "Islamabad", "The headquarters of the National Highways and Motorway Police is in Islamabad."],
      ["What is the emergency helpline of the Motorway Police?", "130", "The NH&MP operates the emergency helpline 130 on all motorways."],
      ["Which motorway connects Lahore with Islamabad?", "M-2", "The M-2 motorway, completed in 1997, connects Lahore with Islamabad."],
      ["Which motorway connects Peshawar with Islamabad?", "M-1", "The M-1 motorway links Peshawar with Islamabad via the Attock area."],
      ["Which motorway connects Karachi with Hyderabad?", "M-9", "The M-9 motorway is the Karachi-Hyderabad superhighway, connecting Sindh's two largest cities."],
      ["What is the maximum speed limit for cars on Pakistani motorways?", "120 km/h", "Cars may travel up to 120 km/h on Pakistani motorways, with lower limits for buses and trucks."],
      ["Which lane rule applies on motorways?", "Keep to the left lane except when overtaking", "Drivers must keep to the left and use the right lane only for overtaking on motorways."],
      ["Which division of the NH&MP handles motorway patrols?", "The Patrol Division", "Patrol teams of the NH&MP respond to accidents and enforce traffic laws on motorways."],
      ["Which safety service do motorway patrols provide to stranded drivers?", "Emergency breakdown assistance", "Motorway patrols provide roadside assistance to broken-down vehicles and accident victims."],
      ["Which fines system operates on the motorways?", "The e-challan system", "The NH&MP issues computerised e-challans for traffic violations on motorways."],
      ["Which organisation trains NH&MP officers?", "The NH&MP Training College", "The NH&MP Training College at Sheikhupura trains motorway police recruits."],
      ["Which highways beyond motorways also come under NH&MP?", "Selected national highways", "The NH&MP also patrols selected national highways under its expanded mandate."],
      ["Which body regulates the National Highways Authority?", "The Ministry of Communications", "The National Highway Authority and NH&MP work under the Ministry of Communications."],
      ["What is the seat belt rule on motorways?", "Seat belts are compulsory", "All occupants must wear seat belts on motorways, and using a phone while driving is banned."]
    ]
  }),

  examGen("wapda", "WAPDA (Water & Power) Content", {
    "WAPDA Organisation": [
      ["What does WAPDA stand for?", "Water and Power Development Authority", "WAPDA is the Water and Power Development Authority of Pakistan."],
      ["When was WAPDA established?", "1958", "WAPDA was established in 1958 under the WAPDA Act to develop water and power resources."],
      ["Where is the headquarters of WAPDA located?", "Lahore", "The WAPDA headquarters is located in Lahore, the provincial capital of Punjab."],
      ["Which is the largest earth-filled dam in the world?", "Tarbela Dam", "Tarbela Dam on the Indus River in Haripur district is the largest earth-filled dam in the world."],
      ["Which dam was built on the Jhelum River in 1967?", "Mangla Dam", "Mangla Dam, on the Jhelum River in Mirpur, was completed in 1967 and is Pakistan's second largest dam."],
      ["Which hydroelectric project is located on the Neelum River in AJK?", "Neelum-Jhelum Hydropower Project", "The Neelum-Jhelum project (969 MW) uses the waters of the Neelum River in Azad Kashmir."],
      ["Which canal system was developed by WAPDA after the 1960 Indus Water Treaty?", "The Indus Basin Replacement Works", "The Indus Basin project built the link canals that transfer water from western to eastern rivers."],
      ["Which organisation transmits electricity through the national grid?", "NTDC", "The National Transmission and Despatch Company (NTDC) operates Pakistan's high-voltage grid."],
      ["Which regulator approves electricity tariffs in Pakistan?", "NEPRA", "The National Electric Power Regulatory Authority (NEPRA) approves power tariffs and licences."],
      ["Which canal takes water from the Indus to the Chashma barrage?", "The Chashma-Jhelum Link Canal", "The Chashma-Jhelum link canal transfers water between the western rivers."],
      ["Which generation company operates the thermal plant at Jamshoro?", "GENCO-I", "GENCO-I operates the thermal power plants at Jamshoro, Sindh."],
      ["Which body was split from WAPDA in 1998 for power distribution?", "The distribution companies (DISCOs)", "In 1998 power distribution was separated from WAPDA into DISCOs like LESCO and MEPCO."],
      ["What is the installed share of hydel power in Pakistan's electricity mix?", "Around a quarter to a third", "Hydroelectric power provides roughly a quarter to a third of Pakistan's electricity generation."],
      ["Which river supplies water to the Warsak hydro plant?", "The Kabul River", "Warsak Dam on the Kabul River near Peshawar generates hydroelectric power."],
      ["Which dam project on the Indus is Pakistan's largest under construction?", "Dasu Dam", "Dasu Hydropower Project on the Indus in Kohistan is one of Pakistan's largest under construction."],
      ["Which agency under WAPDA manages water distribution between provinces?", "The Indus River System Authority", "IRSA (Indus River System Authority) apportions water among the provinces under the 1991 Accord."]
    ],
    "Water and Power Basics": [
      ["What is the unit of electrical energy consumption billed to consumers?", "Kilowatt-hour", "Electricity is billed in kilowatt-hours (kWh), the energy used by a 1 kW appliance in one hour."],
      ["Which frequency does Pakistan's power grid operate at?", "50 Hz", "Pakistan's electricity grid operates at 50 hertz with a standard voltage of 220-240 V."],
      ["What is the main source of irrigation water in Pakistan?", "The Indus River system", "The Indus and its tributaries irrigate about 90% of Pakistan's farmland."],
      ["Which canal runs from the Jhelum to the Chenab?", "The Upper Jhelum Canal", "The Upper Jhelum Canal (1915) links the Jhelum and Chenab rivers for irrigation."],
      ["Which type of power plant converts falling water into electricity?", "Hydroelectric plant", "Hydroelectric plants convert the potential energy of falling water into electricity."],
      ["Which gas is the fuel of most of Pakistan's thermal plants?", "Natural gas", "Natural gas, RLNG and furnace oil fuel most of Pakistan's thermal power plants."],
      ["Which dam provides drinking water to Islamabad and Rawalpindi?", "The Rawal and Simly dams", "Rawal Dam (Islamabad) and Simly Dam supply drinking water to the twin cities."],
      ["Which lake formed behind Tarbela Dam is the largest reservoir of Pakistan?", "The Tarbela reservoir", "The reservoir behind Tarbela Dam is Pakistan's largest man-made lake."],
      ["What percentage of a typical canal's water is lost to seepage?", "About 40 percent", "Studies show about 40% of canal water is lost to seepage, prompting lining projects."],
      ["Which project supplies water to Karachi from the Indus?", "The K-IV project", "The K-IV bulk water project will supply the Indus water to Karachi's treatment plants."],
      ["Which authority manages Pakistan's big dams today?", "WAPDA", "WAPDA continues to own and operate the major dams including Tarbela and Mangla."],
      ["Which fossil fuel is cheapest for baseload power in Pakistan?", "Coal", "Coal-fired plants, including the Sahiwal and Port Qasim projects, provide baseload power."]
    ]
  }),

  examGen("lesco", "LESCO (Power Distribution) Content", {
    "LESCO Operations": [
      ["What does LESCO stand for?", "Lahore Electric Supply Company", "LESCO is the Lahore Electric Supply Company, the power distributor for the Lahore region."],
      ["Which city does LESCO primarily serve?", "Lahore", "LESCO distributes electricity in Lahore and its surrounding districts."],
      ["Which type of company is LESCO?", "A power distribution company", "LESCO is a DISCO (distribution company) that supplies electricity to consumers."],
      ["Which body owns the shares of LESCO?", "The Government of Pakistan", "LESCO is a state-owned power distribution company of the federal government."],
      ["Which regulator approves LESCO's electricity tariffs?", "NEPRA", "NEPRA approves the tariff at which LESCO bills its consumers."],
      ["Which grid company supplies bulk power to LESCO?", "NTDC", "NTDC transmits power from generation plants to LESCO's grid stations."],
      ["What is the emergency helpline of LESCO?", "118", "LESCO operates the helpline 118 for complaints and electricity emergencies."],
      ["Which billing cycle do LESCO consumers follow?", "The monthly billing cycle", "LESCO bills consumers monthly based on meter readings recorded by its meter readers."],
      ["Which unit of LESCO handles transformer faults?", "The maintenance circle", "LESCO's maintenance circles repair transformers and lines in their circles."],
      ["Which city outside Lahore is served by LESCO's northern circle?", "Sheikhupura", "LESCO serves Sheikhupura, Kasur, Okara and other districts around Lahore."],
      ["Which department of LESCO handles new connections?", "The commercial department", "The commercial department processes new connections, transfers and bill adjustments."],
      ["What is a prepaid meter in LESCO's system?", "A meter charged in advance", "LESCO's prepaid meters allow consumers to buy electricity credit in advance."],
      ["Which seasonal demand peaks in LESCO's service area?", "Summer air-conditioning demand", "Summer demand spikes in LESCO's area due to air-conditioner usage in Lahore."],
      ["Which service checks illegal power connections?", "The anti-theft team", "LESCO's anti-theft teams conduct raids against electricity theft and illegal connections."]
    ]
  }),

  examGen("mepco", "MEPCO (Power Distribution) Content", {
    "MEPCO Operations": [
      ["What does MEPCO stand for?", "Multan Electric Power Company", "MEPCO is the Multan Electric Power Company, serving south-central Punjab."],
      ["Which city is the headquarters of MEPCO?", "Multan", "MEPCO's headquarters is in Multan, the historic city of south Punjab."],
      ["Which districts fall under MEPCO's service area?", "Multan, Bahawalpur and Dera Ghazi Khan regions", "MEPCO serves Multan, Bahawalpur, DG Khan, Muzaffargarh, Rahim Yar Khan and surrounding districts."],
      ["Which type of utility is MEPCO?", "A power distribution company", "MEPCO is a DISCO distributing electricity to consumers in its territory."],
      ["Which power source supplies much of MEPCO's area?", "The thermal and hydel national grid", "MEPCO receives power from the national grid, including hydel and thermal generation."],
      ["Which canal flows through Multan and supplies its drinking water?", "The Sidhnai Canal", "The Sidhnai and Haveli canals irrigate the Multan region, while water for the city comes from treatment plants."],
      ["Which industrial sector dominates MEPCO's large consumers?", "Textile and cotton processing", "Cotton ginning, textiles and food processing are the major industrial loads of MEPCO."],
      ["Which regulator approves MEPCO's tariffs?", "NEPRA", "NEPRA approves MEPCO's electricity tariffs and service standards."],
      ["What is the emergency helpline of MEPCO?", "118", "MEPCO provides the 118 helpline for power complaints and faults."],
      ["Which power plant near MEPCO's area generates electricity from coal?", "The Sahiwal Coal Power Plant", "The Sahiwal coal plant supplies power into the grid serving MEPCO's territory."],
      ["Which city of MEPCO's area hosts the Chashma nuclear plant?", "Kundian near Mianwali", "The Chashma Nuclear Power Plants lie at Kundian in Mianwali, served by MEPCO's northern region."],
      ["Which heritage fort of Multan is lit by MEPCO power?", "The Qasim Bagh fort", "The Qasim Bagh and Multan Fort areas are illuminated through MEPCO's network."],
      ["Which seasonal crop creates peak pumping load in MEPCO's area?", "Cotton and sugarcane", "Agricultural tubewells for cotton and sugarcane create peak summer loads in MEPCO's territory."],
      ["Which department of MEPCO investigates electricity theft?", "The anti-theft circle", "MEPCO's anti-theft circles inspect feeders and check illegal connections."]
    ]
  }),

  examGen("hesco", "HESCO (Power Distribution) Content", {
    "HESCO Operations": [
      ["What does HESCO stand for?", "Hyderabad Electric Supply Company", "HESCO is the Hyderabad Electric Supply Company, serving Sindh's southern districts."],
      ["Which city is the headquarters of HESCO?", "Hyderabad", "HESCO's headquarters is located in Hyderabad, the second largest city of Sindh province."],
      ["Which areas does HESCO serve?", "Hyderabad, Mirpurkhas and the Indus delta region", "HESCO distributes power in Hyderabad, Mirpurkhas, Shaheed Benazirabad and adjoining districts."],
      ["Which type of utility is HESCO?", "A power distribution company", "HESCO is a DISCO distributing electricity across southern Sindh."],
      ["Which river crosses HESCO's service area?", "The Indus", "The Indus River crosses HESCO's territory, which lies on both its banks."],
      ["Which economic activity dominates HESCO's industrial load?", "Sugarcane and textile processing", "Sugar mills, textiles and rice husking dominate the industrial consumers of HESCO."],
      ["Which regulator approves HESCO's tariffs?", "NEPRA", "NEPRA approves HESCO's tariff and performance standards under the electricity regulation laws."],
      ["What is the emergency helpline of HESCO?", "118", "HESCO provides the 118 complaint helpline, through which consumers report faults and billing issues."],
      ["Which power plant near HESCO's area supplies the national grid?", "The Jamshoro thermal plants", "The Jamshoro (GENCO-I) thermal plants feed power into the grid serving HESCO."],
      ["Which barrage near Hyderabad supplies water to HESCO's agricultural feeders?", "The Kotri Barrage", "The Kotri Barrage on the Indus supplies irrigation water to HESCO's service districts."],
      ["Which city of HESCO's area is famous for its bangles industry?", "Hyderabad", "Hyderabad's glass bangle industry is a notable consumer base of HESCO."],
      ["Which power development projects serve HESCO's coastal districts?", "The wind power corridor near Jhimpir", "Wind farms near Jhimpir and Gharo feed power into the grid serving HESCO."],
      ["Which seasonal storm damages HESCO's network?", "The monsoon and sea storms", "Monsoon rains and coastal storms cause line faults in HESCO's delta districts."],
      ["Which tariff category covers domestic consumers of HESCO?", "The residential tariff", "Residential consumers of HESCO are billed under NEPRA's residential tariff slabs."]
    ]
  }),

  examGen("sepco", "SEPCO (Power Distribution) Content", {
    "SEPCO Operations": [
      ["What does SEPCO stand for?", "Sukkur Electric Power Company", "SEPCO is the Sukkur Electric Power Company serving northern Sindh."],
      ["Which city is the headquarters of SEPCO?", "Sukkur", "SEPCO's headquarters is in Sukkur, on the banks of the Indus."],
      ["Which districts does SEPCO serve?", "Sukkur, Larkana, Shikarpur and Ghotki", "SEPCO distributes power in Sukkur, Larkana, Shikarpur, Jacobabad and Ghotki districts."],
      ["Which type of utility is SEPCO?", "A power distribution company", "SEPCO is a DISCO distributing electricity across upper Sindh."],
      ["Which barrage upstream of Sukkur supplies irrigation to SEPCO's area?", "The Sukkur Barrage", "The Sukkur Barrage's canals irrigate SEPCO's service districts."],
      ["Which archaeological site lies in SEPCO's service area?", "Mohenjo-Daro", "The Mohenjo-Daro ruins lie in Larkana district, served by SEPCO."],
      ["Which regulator approves SEPCO's tariffs?", "NEPRA", "NEPRA approves SEPCO's electricity tariffs and standards after public hearings on its petitions."],
      ["What is the emergency helpline of SEPCO?", "118", "SEPCO operates the 118 helpline for power complaints, staffed around the clock in its control room."],
      ["Which industrial load dominates SEPCO's consumers?", "Sugar mills and rice husking", "Sugar mills and rice processing plants are major industrial loads in SEPCO's area."],
      ["Which gas field supplies the thermal plants near SEPCO's region?", "The Mari and Kandhkot gas fields", "The Mari and Kandhkot gas fields feed the thermal plants serving SEPCO's grid."],
      ["Which bridge city of Sindh is a SEPCO service centre?", "Rohri", "Rohri, opposite Sukkur across the Indus, is a major service centre of SEPCO."],
      ["Which riverine crop creates seasonal pumping loads in SEPCO's area?", "Cotton", "Cotton cultivation drives tubewell pumping loads in SEPCO's territory."],
      ["Which measure reduces line losses in SEPCO's network?", "Feeder metering and transformer replacement", "SEPCO reduces losses by metering feeders and replacing old transformers."],
      ["Which energy project near SEPCO's area harnesses solar power?", "The solar park at Sukkur", "Solar projects near Sukkur feed renewable power into the grid."]
    ]
  }),

  examGen("ssgc", "SSGC (Gas Distribution) Content", {
    "SSGC Operations": [
      ["What does SSGC stand for?", "Sui Southern Gas Company", "SSGC is the Sui Southern Gas Company, distributing natural gas in southern Pakistan."],
      ["Which city is the headquarters of SSGC?", "Karachi", "SSGC's headquarters is located in Karachi, the largest city and main market of southern Pakistan."],
      ["Which regions does SSGC serve?", "Sindh and Balochistan", "SSGC distributes natural gas across Sindh and Balochistan through its transmission and distribution pipelines."],
      ["Which type of utility is SSGC?", "A gas distribution company", "SSGC is the gas distribution utility for southern Pakistan, covering Sindh and Balochistan provinces."],
      ["Which gas field supplies the SSGC network?", "The Sui gas field", "The Sui gas field in Dera Bugti, Balochistan, discovered in 1952, supplies the SSGC system."],
      ["Which regulator sets gas tariffs in Pakistan?", "OGRA", "The Oil and Gas Regulatory Authority (OGRA) sets natural gas tariffs and safety standards."],
      ["What is the emergency gas leakage helpline of SSGC?", "PITS 1199", "SSGC operates the gas emergency helpline (PITS) on 1199 for reporting gas leakages and emergencies."],
      ["Which consumer group is the largest user of SSGC's gas?", "Domestic consumers", "Domestic households are the largest number of consumers, though industry uses more volume."],
      ["Which city consumes most of SSGC's gas?", "Karachi", "Karachi, Pakistan's industrial hub, consumes most of the gas distributed by SSGC."],
      ["Which port terminal imports LNG for the SSGC system?", "The Port Qasim LNG terminal", "LNG regasified at Port Qasim enters the pipeline network served by SSGC."],
      ["Which pipeline carries gas from Sui to Karachi?", "The Sui-Karachi gas pipeline", "The Sui-Karachi pipeline is the main artery of SSGC's transmission system."],
      ["Which industry in Sindh is a major gas consumer of SSGC?", "Fertiliser production", "Fertiliser plants in Sindh are major industrial consumers of SSGC gas."],
      ["Which safety measure do SSGC teams use to detect gas leaks?", "Odorant in gas and leakage surveys", "SSGC adds odorant to gas and conducts leak surveys to detect leaks."],
      ["Which agency in Balochistan receives gas through SSGC's network?", "Quetta and the provincial capital region", "SSGC's transmission lines supply gas to Quetta and other Balochistan towns."]
    ]
  }),

  examGen("sngpl", "SNGPL (Gas Distribution) Content", {
    "SNGPL Operations": [
      ["What does SNGPL stand for?", "Sui Northern Gas Pipelines Limited", "SNGPL is the Sui Northern Gas Pipelines Limited, distributing gas in northern Pakistan."],
      ["Which city is the headquarters of SNGPL?", "Lahore", "SNGPL's headquarters is located in Lahore, the largest city of the province it serves."],
      ["Which regions does SNGPL serve?", "Punjab, Khyber Pakhtunkhwa and Islamabad", "SNGPL distributes natural gas in Punjab, KP and the federal capital territory."],
      ["Which type of utility is SNGPL?", "A gas distribution company", "SNGPL is the gas distribution utility for northern Pakistan."],
      ["Which pipeline carries Sui gas to northern Pakistan?", "The Sui-Multan-Lahore pipeline", "The Sui-Multan-Lahore pipeline (1955) was the first to bring Sui gas north."],
      ["Which regulator sets SNGPL's gas tariffs?", "OGRA", "OGRA determines natural gas tariffs for SNGPL and SSGC after public hearings on their petitions."],
      ["What is the gas emergency helpline of SNGPL?", "1199", "SNGPL operates the gas leakage emergency helpline 1199, connecting callers to its emergency teams."],
      ["Which fertiliser plants consume large volumes of SNGPL's gas?", "The Punjab fertiliser plants", "Fertiliser plants such as Fauji Fertiliser are major gas consumers of SNGPL."],
      ["Which city has the largest number of SNGPL domestic connections?", "Lahore", "Lahore and the Punjab cities have the largest number of SNGPL consumers."],
      ["Which LNG terminal feeds gas into the SNGPL network?", "The RLNG terminals at Port Qasim", "Regasified LNG from Port Qasim flows through SNGPL's northern pipelines."],
      ["Which province's industries are supplied by SNGPL?", "Punjab and Khyber Pakhtunkhwa", "Industrial units in Punjab and KP receive gas through SNGPL's network."],
      ["Which gas meter type is being installed by SNGPL for billing accuracy?", "Smart and prepaid meters", "SNGPL is installing smart and prepaid gas meters across its service area."],
      ["Which northern city of SNGPL's region is served via the Kohat gas field?", "Peshawar", "Gas from the Kohat region supplies parts of KP through SNGPL's northern pipelines."],
      ["Which measure prevents unaccounted-for gas in SNGPL's system?", "Compression and line maintenance", "SNGPL maintains compressors and pipelines to reduce unaccounted-for gas losses."]
    ]
  }),

  examGen("pakistan-post", "Pakistan Post (GPO) Content", {
    "Pakistan Post Services": [
      ["Which department operates Pakistan's postal service?", "Pakistan Post", "Pakistan Post operates the national postal and remittance services of Pakistan."],
      ["Where was the first GPO of Pakistan established?", "Lahore", "The first General Post Office (GPO) of Pakistan was established in Lahore in 1947."],
      ["Which ministry does Pakistan Post work under?", "The Ministry of Communications", "Pakistan Post functions under the Ministry of Communications."],
      ["Which service of Pakistan Post handles parcel delivery?", "The parcel service", "Pakistan Post's parcel service delivers domestic and international parcels."],
      ["Which service transfers money between cities?", "The money order service", "Money orders and the Electronic Money Order (EMO) transfer cash between post offices."],
      ["Which service delivers letters to home addresses?", "The ordinary mail service", "Ordinary mail is delivered door-to-door by postmen in every locality."],
      ["Which trackable mail service does Pakistan Post offer?", "Registered and express mail", "Registered post and express mail provide tracking and faster delivery."],
      ["Which insurance service does Pakistan Post offer?", "Postal Life Insurance", "Pakistan Post offers Postal Life Insurance policies to its customers."],
      ["Which international union does Pakistan Post belong to?", "The Universal Postal Union", "Pakistan is a member of the Universal Postal Union (UPU) since independence."],
      ["Which agency of Pakistan Post operates the parcel and logistics network?", "Pakistan Post Logistics", "Pakistan Post's logistics arm handles e-commerce parcels and bulk mail."],
      ["When did Pakistan Post introduce the Electronic Money Order?", "2009", "The Electronic Money Order (EMO) service was launched in 2009 for fast remittances."],
      ["Which post office in Karachi is the city's main GPO?", "The Karachi GPO", "The GPO in Karachi's Saddar area is the main post office of the city."],
      ["Which stamp commemorates Pakistan's independence?", "The 1947 first-day stamps", "Pakistan's first postage stamps, issued in 1947, depict the crescent and the map."],
      ["Which counter service of Pakistan Post handles government pension payments?", "The pension payment service", "Post offices pay pensions of retired government employees across the country."],
      ["Which philatelic term describes stamp collecting?", "Philately", "Philately is the study and collection of postage stamps, with a dedicated bureau in Pakistan Post."],
      ["Which service delivers documents with legal proof of delivery?", "Registered acknowledgement due", "Registered mail with acknowledgement due provides legal proof of delivery."]
    ]
  }),

  examGen("rescue-1122", "Rescue 1122 (Emergency Service) Content", {
    "Rescue 1122 Organisation": [
      ["Which service does Rescue 1122 provide?", "Emergency rescue and ambulance services", "Rescue 1122 provides emergency ambulance, rescue and fire services."],
      ["When was Rescue 1122 established in Punjab?", "2004", "Rescue 1122 was established in Punjab in 2004 as the Emergency Rescue Service."],
      ["Who founded Rescue 1122 in Punjab?", "Dr. Rizwan Naseer", "Dr. Rizwan Naseer founded Rescue 1122 and served as its first Director General."],
      ["What is the emergency helpline number of Rescue 1122?", "1122", "The emergency helpline 1122 connects callers to Rescue 1122's dispatch centre."],
      ["Which act governs Rescue 1122 in Punjab?", "The Punjab Emergency Service Act 2006", "The Punjab Emergency Service Act of 2006 legally established Rescue 1122."],
      ["Which services does a Rescue 1122 station combine?", "Ambulance, fire and rescue", "Each Rescue 1122 station houses emergency ambulances, fire engines and rescue equipment."],
      ["Which province was the first to launch Rescue 1122?", "Punjab", "Punjab launched the Emergency Rescue Service in 2004 before other provinces adopted it."],
      ["Which dispatch system receives emergency calls?", "The 1122 Emergency Dispatch Centre", "Trained dispatchers at the Emergency Dispatch Centre receive and route 1122 calls."],
      ["What is the response time target of Rescue 1122?", "Under seven minutes in cities", "Rescue 1122 aims to reach urban emergencies within seven minutes of dispatch."],
      ["Which training do Rescue 1122 rescuers receive?", "Pre-hospital emergency care training", "Rescuers are trained in first aid, CPR and pre-hospital trauma care."],
      ["Which units of Rescue 1122 handle fire emergencies?", "The fire rescue units", "Fire rescue units of Rescue 1122 respond to building and vehicle fires."],
      ["Which community programmes does Rescue 1122 run?", "Community safety training", "Rescue 1122 trains schools and communities in first aid and safety."],
      ["Which motorbike unit of Rescue 1122 reaches traffic emergencies first?", "The bike ambulances", "Motorcycle ambulances weave through traffic to reach victims quickly."],
      ["Which annual competition tests rescuers' skills?", "The National Rescue Competition", "Rescue teams compete in annual national competitions of rescue skills."],
      ["Which organisation accredits Rescue 1122's standards?", "International emergency bodies", "Rescue 1122 has been certified against international emergency response standards."],
      ["Which river rescue services does Rescue 1122 provide?", "Flood and water rescue", "During floods, Rescue 1122 deploys boats and water rescue teams."]
    ]
  }),

  examGen("banking", "Banking Sector (Recruitment) Content", {
    "Banking System of Pakistan": [
      ["Which institution is the central bank of Pakistan?", "State Bank of Pakistan", "The State Bank of Pakistan is the central bank, regulating the country's banking system."],
      ["When was the State Bank of Pakistan established?", "1 July 1948", "The State Bank of Pakistan was inaugurated on 1 July 1948 by Quaid-e-Azam Muhammad Ali Jinnah."],
      ["Which institute conducts banking recruitment tests in Pakistan?", "Institute of Bankers Pakistan (IBP)", "The Institute of Bankers Pakistan (IBP) conducts entry tests for commercial banks."],
      ["Which company operates the ATM inter-bank network in Pakistan?", "1LINK", "1LINK Limited operates Pakistan's largest inter-bank ATM network."],
      ["Which system clears inter-bank cheque payments in Pakistan?", "NIFT", "The National Institutional Facilitation Technologies (NIFT) clears cheque payments between banks."],
      ["Which instant payment system was launched by SBP in 2022?", "Raast", "Raast, Pakistan's instant payment system, was launched by SBP in January 2022."],
      ["What is the minimum capital requirement for a bank in Pakistan?", "Set by SBP regulations", "SBP sets the minimum paid-up capital requirement for banks operating in Pakistan."],
      ["Which law regulates banking companies in Pakistan?", "The Banking Companies Ordinance 1962", "The Banking Companies Ordinance of 1962 regulates the operations of banks in Pakistan."],
      ["Which microfinance bank was the first in Pakistan?", "Khushhali Bank", "Khushhali Bank, established in 2000, was Pakistan's first licensed microfinance bank."],
      ["Which branchless banking services operate in Pakistan?", "Easypaisa and JazzCash", "Easypaisa (Telenor) and JazzCash are Pakistan's leading branchless banking services."],
      ["Which account type does the government use for salary payments?", "Current accounts", "Current accounts, offering cheque facilities, are used by the government and businesses."],
      ["What does KYC require from banks?", "Know Your Customer verification", "KYC rules require banks to verify customers' identity documents before opening accounts."],
      ["Which insurance protects bank deposits in Pakistan?", "The depositor protection scheme", "SBP's depositor protection scheme insures small deposits in case of bank failure."],
      ["Which ratio does SBP use to control money supply?", "The policy rate", "SBP's policy rate influences interest rates and money supply in the economy."],
      ["Which bank was the first Pakistani bank to open abroad?", "National Bank of Pakistan", "National Bank of Pakistan, established 1949, was the first Pakistani bank to open overseas branches."],
      ["Which type of bank finances housing in Pakistan?", "Housing finance banks", "Housing finance companies and banks (such as HBFCL) provide mortgage loans for homes."],
      ["What does IBFT stand for in banking?", "Interbank Funds Transfer", "IBFT allows instant fund transfers between accounts of different banks."],
      ["Which category of banks follows Islamic banking rules?", "Islamic banks", "Islamic banks operate under Shariah principles without charging interest (riba)."]
    ],
    "Banking Careers and Tests": [
      ["Which test do banks conduct for officer-level recruitment?", "The IBP entry test", "Banks recruit officers through the IBP-conducted entry test covering aptitude and English."],
      ["Which section is common in all banking entry tests?", "Quantitative reasoning", "Banking entry tests include quantitative, verbal and analytical reasoning sections."],
      ["Which role manages branch operations?", "The Branch Manager", "Branch managers oversee branch operations, deposits and customer service."],
      ["Which post handles loan appraisals in a bank?", "The Credit Officer", "Credit officers appraise loans and assess borrowers' creditworthiness."],
      ["Which department of a bank manages foreign exchange?", "The Treasury and foreign exchange department", "Treasury desks manage the bank's forex and investment positions."],
      ["What is the usual minimum education for bank officer posts?", "Bachelor's degree", "Bank officer posts generally require at least a bachelor's degree, with age limits around 21-30."],
      ["Which test measure does a bank use to screen a large applicant pool?", "The written aptitude test", "Banks use written aptitude tests to shortlist candidates before interviews."],
      ["Which position is the entry-level clerical post in banks?", "Cashier or customer service officer", "Cashiers and customer service officers are the entry-level posts in bank branches."],
      ["Which skill is most tested in banking interviews?", "Communication and numerical skills", "Banking interviews assess communication, numeracy and customer-handling skills."],
      ["Which certification is valued for banking careers in Pakistan?", "The IBP diploma in banking", "The IBP's Diploma in Banking is a recognised professional certification for bankers."]
    ]
  }),

  examGen("nadra", "NADRA (Recruitment) Content", {
    "NADRA Services": [
      ["What does NADRA stand for?", "National Database and Registration Authority", "NADRA is the National Database and Registration Authority of Pakistan."],
      ["When was NADRA established?", "2000", "NADRA was established in March 2000 to manage the national identity database."],
      ["What does CNIC stand for?", "Computerised National Identity Card", "The CNIC is the Computerised National Identity Card issued to Pakistani citizens aged 18 and above."],
      ["How many digits does a CNIC number have?", "13 digits", "A CNIC number contains 13 digits, the first five identifying the registration area."],
      ["Which card is issued to children under 18?", "The B-Form", "The B-Form (Child Registration Certificate) is issued to children under 18 by NADRA."],
      ["Which card is issued to overseas Pakistanis?", "NICOP", "The National Identity Card for Overseas Pakistanis (NICOP) is issued to Pakistanis abroad."],
      ["Which document allows foreign spouses of Pakistanis to apply for citizenship?", "The POC", "The Pakistan Origin Card (POC) is issued to foreign nationals of Pakistani origin."],
      ["Which chip-based identity card did NADRA launch in 2012?", "The Smart NIC", "The Smart NIC, launched in 2012, carries a microchip with identity and payment features."],
      ["Where is the headquarters of NADRA located?", "Islamabad", "NADRA's headquarters is located in Islamabad, the federal capital of Pakistan."],
      ["Which national database does NADRA maintain?", "The Computerised Electoral Rolls and CNIC database", "NADRA maintains the citizens' database used for elections, passports and government services."],
      ["Which agency of NADRA issues passports on the government's behalf?", "The Directorate General of Immigration and Passports", "NADRA processes passport applications for the passport directorate."],
      ["Which registration centre issues CNICs in your district?", "The NADRA registration centre", "NADRA registration centres across districts issue and renew CNICs."],
      ["Which mobile service of NADRA reaches rural areas?", "The mobile registration vehicles", "NADRA's mobile registration vans travel to remote villages to issue CNICs and B-forms."],
      ["Which verification service do banks use from NADRA?", "The biometric verification system", "Banks and mobile operators verify identities using NADRA's biometric database."],
      ["Which fee document is required to renew a CNIC?", "The CNIC renewal fee receipt", "Applicants pay the renewal fee at NADRA centres or banks to renew CNICs."],
      ["What is the validity period of a CNIC?", "10 years", "A CNIC is generally valid for 10 years from the date of issue."]
    ]
  }),

  examGen("fbr", "FBR (Federal Board of Revenue) Content", {
    "FBR Organisation and Taxes": [
      ["What does FBR stand for?", "Federal Board of Revenue", "The Federal Board of Revenue is Pakistan's central tax collection agency."],
      ["When was the FBR established?", "2007", "The Federal Board of Revenue was created in 2007, succeeding the Central Board of Revenue (CBR)."],
      ["Which wings does the FBR consist of?", "Inland Revenue and Customs", "FBR has two main wings: Inland Revenue (income tax, sales tax, federal excise) and Pakistan Customs."],
      ["Where is the headquarters of the FBR located?", "Islamabad", "The FBR headquarters is located in Islamabad, housing its chairman and policy divisions."],
      ["Which tax is levied on personal and corporate income?", "Income tax", "Income tax is collected by FBR's Inland Revenue wing on salaries, business profits and corporations."],
      ["Which tax is charged on the supply of goods and services?", "Sales tax", "Sales tax (GST) is levied on goods and services at the federal level in Pakistan."],
      ["Which duty is imposed on imported goods?", "Customs duty", "Pakistan Customs collects customs duty on imports entering the country."],
      ["Which tax applies to tobacco, beverages and fuel?", "Federal excise duty", "Federal excise duty is levied on specified goods such as tobacco and fuel."],
      ["What does NTN stand for?", "National Tax Number", "The NTN is the National Tax Number assigned to every taxpayer in Pakistan."],
      ["Which return do salaried persons file with FBR?", "The annual income tax return", "Salaried taxpayers file annual income tax returns with FBR's Iris system."],
      ["Which distinction applies to citizens who file taxes?", "Filers and non-filers", "Filers who file returns enjoy lower withholding rates than non-filers under FBR policy."],
      ["Which authority hears tax appeals?", "The Commissioner (Appeals) and tribunals", "Tax appeals are heard by the Commissioner Appeals, the Appellate Tribunal and the courts."],
      ["Which regional office of FBR covers your province?", "The Large Taxpayers Office or regional tax office", "FBR operates regional tax offices and Large Taxpayers Units across the country."],
      ["Which system of FBR files returns online?", "IRIS", "The Inland Revenue Information System (IRIS) processes online tax returns."],
      ["Which tax is collected at import stage by customs?", "Advance tax and customs duty", "Customs collects duty, sales tax and advance income tax on imports."],
      ["Which federal minister presents the annual Finance Act?", "The Finance Minister", "The Finance Minister presents the Finance Bill, which sets FBR's taxes for the year."]
    ],
    "FBR Careers": [
      ["Which post is the entry officer-grade of FBR?", "Customs Inspector and Income Tax Inspector", "Officer-grade posts in FBR include Customs Inspector, Income Tax Inspector and Preventive Officer."],
      ["Which test do FBR officers pass for recruitment?", "The FPSC or departmental tests", "FBR officers are recruited through FPSC and departmental examinations."],
      ["Which grade do FBR inspectors typically hold?", "BPS-16", "Customs and Income Tax Inspectors in FBR generally hold BPS-16."],
      ["Which post audits taxpayers' records?", "The Income Tax Officer", "Income Tax Officers conduct audits and assessments of taxpayers."],
      ["Which customs post checks cargo at ports?", "The Preventive Officer", "Preventive Officers inspect cargo and prevent smuggling at ports and borders."],
      ["Which training academy trains FBR officers?", "The Federal Board of Revenue Training Wing", "FBR trains its officers at the Customs Academy and Inland Revenue academies."],
      ["Which qualification is required for FBR inspector posts?", "Bachelor's degree", "FBR inspector posts require at least a bachelor's degree in any discipline."],
      ["Which unit of FBR investigates tax evasion?", "The Directorate of Intelligence and Investigation", "FBR's intelligence directorate investigates smuggling and tax evasion."],
      ["Which role assesses declared income?", "The Deputy Commissioner Inland Revenue", "Deputy Commissioners Inland Revenue assess and finalise tax cases."],
      ["Which code governs FBR's customs procedures?", "The Customs Act 1969", "Pakistan Customs operates under the Customs Act of 1969, which defines duties and smuggling offences."]
    ]
  }),

  examGen("sbp", "SBP (State Bank) Content", {
    "SBP Functions and Careers": [
      ["Which bank issues currency notes in Pakistan?", "State Bank of Pakistan", "SBP has the sole right to issue currency notes in Pakistan, a function assigned to it by law."],
      ["Where is the headquarters of the State Bank of Pakistan?", "Karachi", "The SBP headquarters is located in Karachi, with a subsidiary office in Islamabad."],
      ["Who was the first Governor of the State Bank of Pakistan?", "Zahid Husain", "Zahid Husain became the first Governor of the State Bank of Pakistan in 1948."],
      ["What is the term of office of the SBP Governor?", "Three years", "The SBP Governor is appointed for a term of three years, extendable by the government."],
      ["Which policy tool does SBP use to control inflation?", "The monetary policy rate", "SBP raises or lowers the policy rate to control inflation and growth."],
      ["Which committee of SBP decides interest rates?", "The Monetary Policy Committee", "SBP's Monetary Policy Committee meets every six to eight weeks to set the policy rate."],
      ["Which department of SBP supervises commercial banks?", "The Banking Supervision Department", "SBP's supervision department inspects banks and enforces prudential regulations."],
      ["Which account does the federal government maintain with SBP?", "The government's main account", "The federal government keeps its main bank account with SBP."],
      ["Which body manages Pakistan's foreign exchange reserves?", "SBP", "SBP manages Pakistan's foreign exchange reserves and the exchange rate regime."],
      ["Which deposit insurance scheme protects small savers?", "The depositor protection fund", "SBP's depositor protection scheme compensates depositors up to a limit if a bank fails."],
      ["Which finance company operates under SBP's regulation for leasing?", "The leasing companies", "SBP regulates leasing and microfinance companies alongside banks."],
      ["Which examination recruits SBP officers?", "The SBP departmental examination", "SBP recruits officers through its annual written test and interview."],
      ["Which post is the entry officer grade of SBP?", "Deputy Director (OG-2)", "SBP's entry officer grade is Deputy Director, recruited through the annual examination."],
      ["Which statistics department of SBP publishes economic data?", "The Statistics Department", "SBP's Statistics Department publishes monetary and economic indicators."],
      ["Which currency denomination is the largest note in Pakistan?", "Rs 5,000", "The Rs 5,000 banknote is the highest denomination issued by SBP."],
      ["Which Islamic banking regulator is part of SBP's structure?", "The Islamic Banking Department", "SBP's Islamic Banking Department promotes Shariah-compliant banking."]
    ]
  }),

  examGen("election-officer", "Election Officer (ECP) Content", {
    "Election System of Pakistan": [
      ["Which body conducts elections in Pakistan?", "The Election Commission of Pakistan", "The Election Commission of Pakistan (ECP) conducts federal and provincial elections."],
      ["When was the Election Commission of Pakistan established?", "1956", "The Election Commission was established in 1956 under the 1956 Constitution."],
      ["Who is the head of the Election Commission?", "The Chief Election Commissioner", "The Chief Election Commissioner heads the ECP, supported by four members."],
      ["Who appoints the Chief Election Commissioner?", "The President on the Prime Minister's advice", "The President appoints the CEC and members on the advice of the Prime Minister and the Opposition Leader."],
      ["How many members does the Election Commission have?", "Four members", "The ECP comprises the Chief Election Commissioner and four members from each province."],
      ["What is the voting age in Pakistan?", "18 years", "Citizens aged 18 and above are eligible to vote in Pakistan."],
      ["How many seats does the National Assembly have?", "336", "The National Assembly has 336 seats: 266 general, 60 women and 10 minority seats."],
      ["How many members does the Senate have?", "96", "The Senate of Pakistan has 96 members, with equal representation from the four provinces."],
      ["Who is the presiding officer at a polling station?", "The Presiding Officer", "The Presiding Officer manages the polling station and conducts the poll."],
      ["What does RO stand for in elections?", "Returning Officer", "The Returning Officer (RO) receives nominations and declares results in a constituency."],
      ["Which officer oversees an entire district's elections?", "The District Returning Officer", "The District Returning Officer (DRO) supervises all constituencies in a district."],
      ["Which mark identifies a voter as having cast their ballot?", "The indelible ink mark", "Voters' thumbs are marked with indelible ink to prevent double voting."],
      ["Which machine was piloted by ECP for transparent voting?", "The Electronic Voting Machine", "The ECP piloted EVMs in by-elections, though paper ballots remain standard."],
      ["Which register lists all eligible voters?", "The electoral rolls", "The ECP prepares electoral rolls from NADRA's citizen database."],
      ["Which year saw Pakistan's first general elections?", "1970", "Pakistan held its first general elections in 1970, won by the Awami League in East Pakistan."],
      ["Which body appoints electoral officers in each district?", "The Election Commission", "The ECP appoints district and constituency officers for every election."],
      ["Which constitutional amendment gives ECP its independence?", "The 18th Amendment", "The 18th Amendment reformed the ECP's appointment and independence provisions."],
      ["What is the tenure of a National Assembly?", "Five years", "The National Assembly sits for five years unless dissolved earlier."]
    ]
  }),

  examGen("teaching", "Teaching Jobs (Recruitment) Content", {
    "Teaching Profession Basics": [
      ["Which qualification is the basic requirement for school teachers?", "A B.Ed or PTC/CT with subject degree", "School teachers need a relevant degree with PTC, CT or B.Ed training."],
      ["Which theory of learning is associated with Jean Piaget?", "Cognitive development", "Piaget's theory describes stages of cognitive development in children."],
      ["What does B.Ed stand for?", "Bachelor of Education", "B.Ed is the Bachelor of Education degree required for teaching posts."],
      ["Which test is conducted for educator recruitment in Punjab?", "The Punjab Educator Recruitment Test", "Punjab recruits educators through a written recruitment test conducted by testing agencies."],
      ["Which agency tests educators in Khyber Pakhtunkhwa?", "ETEA", "KP's educator recruitment is conducted by ETEA (Educational Testing and Evaluation Agency)."],
      ["Which assessment method measures learning during a course?", "Formative assessment", "Formative assessment monitors learning during instruction, while summative assessment measures it at the end."],
      ["Which classification of teaching aids includes charts and models?", "Visual aids", "Charts, models and pictures are visual teaching aids that make abstract ideas concrete for learners."],
      ["What is a lesson plan?", "A teacher's outline for a class session", "A lesson plan outlines objectives, activities and assessments for one teaching session."],
      ["Which level of Bloom's taxonomy is the lowest?", "Remembering", "Bloom's taxonomy begins with remembering, followed by understanding, applying, analysing, evaluating and creating."],
      ["Which technique engages students through questions?", "Questioning technique", "Effective teachers use questioning to engage students and check understanding."],
      ["Which principle of teaching states 'moving from simple to complex'?", "The principle of proceeding from simple to complex", "Teaching should move from simple and known ideas to complex and unknown ones."],
      ["Which record does a teacher maintain of daily attendance?", "The attendance register", "Teachers maintain attendance registers for every class, which heads review for statistics and policy."],
      ["Which style of teaching puts the teacher at the centre?", "The teacher-centred approach", "In teacher-centred teaching, the teacher delivers knowledge while students listen."],
      ["Which evaluation compares a student with class peers?", "Norm-referenced evaluation", "Norm-referenced evaluation ranks students against each other rather than fixed standards."],
      ["Which government body recruits school teachers?", "The provincial education departments", "Provincial education departments and testing agencies recruit school teachers."],
      ["Which subject is compulsory for all teaching candidates?", "The subject of the post", "Candidates must have studied the subject of the teaching post in their degree."]
    ]
  }),

  examGen("sst", "SST (Secondary School Teacher) Content", {
    "SST Posts and Duties": [
      ["What does SST stand for?", "Secondary School Teacher", "SST stands for Secondary School Teacher, who teaches at the secondary (high) school level."],
      ["Which classes do SST teachers typically teach?", "Classes 9 and 10", "SST teachers generally teach secondary classes, while EST teachers teach elementary classes."],
      ["Which qualification is required for an SST post?", "Master's degree in the subject with B.Ed", "SST posts require a master's in the subject and a B.Ed or equivalent training."],
      ["Which subjects do SSTs teach?", "Single subjects like science, maths or English", "SSTs are subject specialists teaching one or two subjects at secondary level."],
      ["Which testing agency recruits SSTs in Punjab?", "The Punjab testing agencies", "SST recruitment in Punjab is conducted through written tests by authorised agencies."],
      ["Which level of Bloom's taxonomy do SST assessments target?", "Application and analysis", "Secondary assessments target higher-order skills like application and analysis."],
      ["Which record tracks SST's syllabus completion?", "The syllabus and diary records", "SSTs maintain syllabus coverage records checked by school heads."],
      ["Which subject paper is common for science SSTs?", "Physics, Chemistry and Biology", "Science SSTs answer subject papers in physics, chemistry or biology as per their degree."],
      ["Which co-curricular duty do SSTs often perform?", "Supervising clubs and sports", "SSTs supervise science clubs, sports and debates, encouraging students' co-curricular growth."],
      ["Which rule fixes SST's teaching periods per week?", "The departmental workload policy", "Education departments fix weekly teaching periods for SSTs under the workload policy for teachers."],
      ["Which test measures a teacher's professional knowledge?", "The professional (pedagogy) paper", "SST tests include a professional paper on teaching methodology."],
      ["Which institute conducts SST tests in Khyber Pakhtunkhwa?", "ETEA", "KP's SST recruitment tests are conducted by ETEA, the provincial testing and evaluation agency."],
      ["Which grade do SSTs usually hold in Pakistan?", "BPS-16", "Secondary school teachers in Pakistan generally hold BPS-16."],
      ["Which annual appraisal evaluates an SST's performance?", "The annual confidential report", "Teachers are appraised through annual reports by their heads."]
    ]
  }),

  examGen("est", "EST (Elementary School Teacher) Content", {
    "EST Posts and Duties": [
      ["What does EST stand for?", "Elementary School Teacher", "EST stands for Elementary School Teacher, who teaches at the elementary (middle) school level."],
      ["Which classes do EST teachers teach?", "Classes 1 to 8", "EST teachers teach the elementary classes, generally from 1 to 8."],
      ["Which qualification is required for an EST post?", "Bachelor's degree with B.Ed or CT", "EST posts require a bachelor's degree with B.Ed, CT or equivalent training."],
      ["Which subjects do ESTs teach?", "All compulsory subjects", "ESTs teach compulsory subjects including Urdu, English, Maths and Science."],
      ["Which agency conducts EST recruitment tests?", "Provincial testing agencies", "EST recruitment tests are conducted by provincial testing agencies like NTS and ETEA."],
      ["Which teaching method suits young learners best?", "Activity-based and play-way methods", "Young learners learn best through activity-based and play-way methods."],
      ["Which duty is key for an EST in early grades?", "Teaching basic literacy and numeracy", "ESTs build foundational literacy and numeracy in early grades."],
      ["Which record does an EST keep of each child's progress?", "The assessment records", "ESTs record children's progress through tests and observations."],
      ["Which grade do ESTs usually hold in Pakistan?", "BPS-14", "Elementary school teachers in Pakistan generally hold BPS-14."],
      ["Which paper tests EST candidates' teaching skills?", "The pedagogy paper", "EST tests include a professional paper on pedagogy and child development."],
      ["Which training helps ESTs teach children with difficulties?", "Remedial teaching training", "Remedial teaching helps ESTs support children who lag behind."],
      ["Which classroom practice is most effective for young learners?", "Short varied activities", "Young children respond best to short, varied and playful activities."],
      ["Which midday scheme is linked with school attendance?", "The school feeding programme", "School feeding and attendance incentives support EST classrooms."],
      ["Which evaluation at the end of a term is summative?", "The term examination", "Term examinations sum up a student's learning for the term and feed promotion decisions."]
    ]
  }),

  examGen("headmaster", "Headmaster (School Leadership) Content", {
    "Headmaster Roles and Duties": [
      ["Who is the administrative head of a school?", "The Headmaster", "The Headmaster or Headmistress administers a school's academic and administrative affairs."],
      ["Which qualifications do headmasters usually hold?", "A master's degree with B.Ed and teaching experience", "Headmasters typically hold a master's degree, B.Ed and several years of teaching experience."],
      ["Which duties fall to a headmaster?", "Staff supervision, timetable and discipline", "Headmasters supervise staff, prepare timetables and maintain discipline."],
      ["Which official record does a headmaster keep of staff?", "The staff service records", "Headmasters maintain service and leave records of the school staff."],
      ["Which body appoints headmasters in Punjab?", "The provincial education department", "Education departments appoint headmasters through promotion and recruitment."],
      ["Which document lists the school's daily schedule?", "The timetable", "The headmaster prepares and manages the school timetable, balancing subjects and staff availability."],
      ["Which committee involves parents in school affairs?", "The School Management Committee", "School Management Committees (SMCs) involve parents in school governance."],
      ["Which leadership style suits a school head?", "Participative leadership", "Participative headmasters involve staff in decisions, improving commitment."],
      ["Which record tracks student admissions?", "The admission register", "The admission register records every student's enrolment details."],
      ["Which inspection evaluates a school's performance?", "The education department inspection", "District education officers inspect schools and grade their performance."],
      ["Which fund supports school facilities?", "The school improvement grant", "School improvement grants fund repairs, furniture and facilities."],
      ["Which duty of a headmaster ensures child safety?", "School safety planning", "Headmasters plan for fire, earthquake and bullying safety at school."],
      ["Which meeting does a headmaster hold with teachers?", "The staff meeting", "Headmasters hold regular staff meetings to coordinate teaching."],
      ["Which report summarises a school's annual results?", "The annual school report", "The annual report covers results, admissions and achievements of the school."]
    ]
  }),

  examGen("inspector", "Inspector (General Duty) Content", {
    "Inspector Roles and Law": [
      ["Which officer grade is above Sub Inspector in police?", "Inspector", "The inspector is a gazetted-officer-level rank above sub-inspector in the police."],
      ["Which duty does an inspector commonly perform?", "Commanding a police station as SHO", "Inspectors often command police stations as Station House Officers."],
      ["Which police rank is above the Inspector?", "DSP", "Deputy Superintendent of Police (DSP) is the rank above Inspector."],
      ["Which code defines police powers of investigation?", "The Criminal Procedure Code", "The CrPC defines investigation, arrest and bail procedures for the police."],
      ["Which act was framed to regulate police conduct?", "The Police Act 1861", "The Police Act of 1861 governs police organisation and discipline."],
      ["Which report does an investigating officer prepare at a crime scene?", "The scene report and panchnama", "Investigating officers record the crime scene report and seizure memos."],
      ["Which document do police issue to witness a property seizure?", "The recovery memo", "The recovery memo records seized property and witnesses' signatures."],
      ["Which section of the PPC deals with murder?", "Section 302", "Murder is punishable under Section 302 of the Pakistan Penal Code."],
      ["Which section covers attempt to murder?", "Section 307 PPC", "Attempt to murder is defined under Section 307 of the Pakistan Penal Code."],
      ["Which unit of police investigates cyber crimes?", "The Cyber Crime Wing", "The FIA's cyber crime wing and police units investigate digital offences."],
      ["Which training academy trains inspector-rank officers?", "The Police Training College", "Inspector-rank officers train at police colleges such as Sihala."],
      ["Which qualification is required for inspector posts?", "Bachelor's degree", "Inspector posts require a bachelor's degree, typically with age limits of 21-28 years."],
      ["Which board selects inspectors in Pakistan?", "The Public Service Commission", "Provincial PSCs and FIA conduct examinations for inspector posts."],
      ["Which allowance is given to officers on field duty?", "The field and risk allowances", "Inspectors receive field, risk and conveyance allowances per policy."],
      ["Which oath do police officers take at commissioning?", "The oath of office", "Police officers take an oath to uphold the Constitution and the law."]
    ]
  }),

  examGen("sub-inspector", "Sub Inspector (SI) Content", {
    "Sub Inspector Roles": [
      ["Which police rank lies between ASI and Inspector?", "Sub Inspector", "The Sub Inspector (SI) is the rank above Assistant Sub Inspector and below Inspector."],
      ["Which duties does a Sub Inspector perform?", "Investigating cases and supervising constables", "SIs investigate cases, supervise staff and may command police stations."],
      ["Which rank is below Sub Inspector?", "Assistant Sub Inspector", "The ASI (Assistant Sub Inspector) is the rank directly below Sub Inspector in the police hierarchy."],
      ["Which grade do Sub Inspectors usually hold?", "BPS-14", "Sub Inspectors in provincial police generally hold BPS-14, with promotion prospects to BPS-16."],
      ["Which qualification is required for SI posts?", "Bachelor's degree", "SI recruitment requires a bachelor's degree, with physical standards and written tests."],
      ["Which body recruits Sub Inspectors in Punjab?", "Punjab Police through tests", "Punjab Police recruits SIs through written tests and physical screening."],
      ["Which section of the CrPC empowers SI investigations?", "Chapter XIV of the CrPC", "Chapter XIV of the CrPC governs investigation of offences by police officers."],
      ["Which document records a suspect's arrest details?", "The arrest memo", "Police record the arrest memo with the grounds of arrest and witnesses."],
      ["Which case register is kept at every police station?", "The daily diary", "The daily diary (Roznamcha) records all events at a police station."],
      ["Which duty controls traffic at road junctions?", "Traffic duty", "SIs on traffic duty manage road junctions and check licences."],
      ["Which section of the PPC defines robbery?", "Section 390", "Robbery is defined under Section 390 of the Pakistan Penal Code."],
      ["Which report does an SI file before a court?", "The challan (charge sheet)", "After investigation, police file the challan (charge sheet) in court to initiate the trial."],
      ["Which act governs bail applications?", "The Criminal Procedure Code", "Bail is granted under the provisions of the CrPC, balancing the suspect's liberty with investigation needs."],
      ["Which training do SI recruits undergo?", "The sub-inspector training course", "SI recruits complete a police training course at a training college."]
    ]
  }),

  examGen("custom-inspector", "Custom Inspector (Pakistan Customs) Content", {
    "Custom Inspector Roles": [
      ["Which agency employs Custom Inspectors?", "Pakistan Customs (FBR)", "Custom Inspectors serve in Pakistan Customs under the Federal Board of Revenue."],
      ["Which duty do Custom Inspectors perform at ports?", "Examining cargo and preventing smuggling", "Custom Inspectors examine import-export cargo and prevent smuggling."],
      ["Which grade do Custom Inspectors hold?", "BPS-16", "Custom Inspectors in Pakistan generally hold BPS-16 and are recruited through FPSC examinations."],
      ["Which act governs customs procedures?", "The Customs Act 1969", "Pakistan Customs operates under the Customs Act of 1969, which defines duties and smuggling offences."],
      ["Which duty is collected on imported vehicles?", "Customs duty and regulatory duty", "Imported vehicles attract customs duty, regulatory duty and sales tax."],
      ["Which agency recruits Custom Inspectors?", "FPSC", "Custom Inspectors are recruited through the Federal Public Service Commission."],
      ["Which qualification is required for the Custom Inspector post?", "Bachelor's degree", "The Custom Inspector post requires a bachelor's degree in any discipline."],
      ["Which checkpoint checks goods at land borders?", "The customs border post", "Customs posts at Chaman, Torkham and Wagah check cross-border goods."],
      ["Which code lists the tariff on imported goods?", "The Pakistan Customs Tariff", "The Customs Tariff Act lists duties on each class of imported goods."],
      ["Which wing of customs checks smuggling by sea?", "The seaport customs", "Seaport customs at Karachi and Gwadar examine sea cargo to collect duty and stop smuggling."],
      ["Which offence involves undervaluing imports?", "Misdeclaration", "Misdeclaring values or descriptions is a smuggling offence under customs law."],
      ["Which unit of customs conducts raids on warehouses?", "The intelligence unit", "Customs intelligence units raid warehouses and godowns to seize smuggled goods."],
      ["Which authority hears customs appeals?", "The Customs Appellate Tribunal", "Customs appeals are heard by the Customs Appellate Tribunal."],
      ["Which document accompanies imported goods?", "The bill of entry", "The bill of entry declares the goods being imported for customs clearance."],
      ["Which duty applies to exports from Pakistan?", "Usually no duty, with export facilitation", "Pakistan generally does not levy customs duty on exports and offers incentives."]
    ]
  }),

  examGen("income-tax-inspector", "Income Tax Inspector (FBR) Content", {
    "Income Tax Inspector Roles": [
      ["Which wing of FBR employs Income Tax Inspectors?", "Inland Revenue", "Income Tax Inspectors serve in FBR's Inland Revenue wing, which collects direct and indirect taxes."],
      ["Which duty do Income Tax Inspectors perform?", "Assessing and collecting income tax", "Income Tax Inspectors assess incomes, collect tax and process returns."],
      ["Which grade do Income Tax Inspectors hold?", "BPS-16", "Income Tax Inspectors in Pakistan generally hold BPS-16 and are recruited through FPSC examinations."],
      ["Which law governs income tax in Pakistan?", "The Income Tax Ordinance 2001", "Income tax is collected under the Income Tax Ordinance of 2001."],
      ["Which authority recruits Income Tax Inspectors?", "FPSC", "Income Tax Inspectors are recruited through FPSC examinations."],
      ["Which return do income tax officers process?", "The annual tax return", "Officers process annual returns filed through IRIS, the online tax filing system of FBR."],
      ["Which tax number is assigned to every taxpayer?", "NTN", "The National Tax Number (NTN) identifies every taxpayer in Pakistan."],
      ["Which department of FBR handles taxpayer registration?", "The registration unit of Inland Revenue", "The registration unit issues NTNs and maintains the taxpayer register."],
      ["Which deduction applies to salaried individuals at source?", "Withholding tax", "Employers withhold tax from salaries and deposit it with FBR."],
      ["Which document evidences tax payment?", "The challan", "The challan records tax payments made to the state's bank accounts."],
      ["Which authority hears income tax appeals?", "The Appellate Tribunal Inland Revenue", "Income tax appeals are heard by the Appellate Tribunal Inland Revenue."],
      ["Which year is the tax year in Pakistan?", "The financial year from July to June", "The tax year runs from 1 July to 30 June in Pakistan, matching the government's financial year."],
      ["Which survey by FBR checks undeclared wealth?", "The wealth survey", "FBR's wealth surveys identify taxpayers with undeclared assets."],
      ["Which document lists taxable income sources?", "The tax return form", "The tax return form declares salary, business, property and other incomes."],
      ["Which penalty applies for late filing?", "Late filing penalties", "FBR imposes penalties and default surcharge for late filing of returns."]
    ]
  }),

  examGen("assistant-director", "Assistant Director (Departmental) Content", {
    "Assistant Director Roles": [
      ["Which level of post is Assistant Director?", "A middle-management grade post", "Assistant Director is a middle-management (BS-17) post in government departments."],
      ["Which duties do Assistant Directors perform?", "Supervising sections and implementing policy", "Assistant Directors supervise sections, prepare reports and implement departmental policy."],
      ["Which departments recruit Assistant Directors?", "Federal and provincial departments", "Assistant Directors are recruited by departments like FIA, NADRA and line ministries."],
      ["Which body recruits most federal Assistant Directors?", "FPSC", "The Federal Public Service Commission recruits Assistant Directors for federal departments."],
      ["Which qualification is required for Assistant Director posts?", "Bachelor's or master's degree as required", "Assistant Director posts require at least a bachelor's degree, with some requiring technical degrees."],
      ["Which grade do Assistant Directors usually hold?", "BS-17", "Assistant Director is generally a BS-17 grade post in federal and provincial departments."],
      ["Which role manages a section of a department?", "The section officer role", "Assistant Directors manage sections under the supervision of directors."],
      ["Which file work is central to an Assistant Director's job?", "Case files and policy notes", "Assistant Directors draft notes on case files for their directors."],
      ["Which post above Assistant Director supervises their work?", "The Deputy Director", "Deputy Directors supervise the work of Assistant Directors and report to Directors."],
      ["Which selection stage follows the written test for Assistant Director?", "The interview", "Candidates passing the written test appear before a selection interview board."],
      ["Which document details a department's rules?", "The establishment rules", "Establishment rules define the duties and conduct of departmental posts."],
      ["Which annual performance review applies to civil servants?", "The annual confidential report", "Civil servants' performance is reviewed through annual confidential reports."],
      ["Which code of conduct applies to government officers?", "The Government Servants Conduct Rules", "Conduct rules govern the ethics and discipline of government officers."],
      ["Which promotion route leads from Assistant Director?", "Promotion to Deputy Director", "Assistant Directors are promoted to Deputy Director on merit and seniority."]
    ]
  })
];
