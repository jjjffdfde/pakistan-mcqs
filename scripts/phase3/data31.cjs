const { writeFile } = require("./gen-helper.cjs");

const MGMT = [
  /* hrm */
  ["hrm", "HR Planning", "easy", "Human resource management primarily deals with:", ["the people of an organization", "machinery only", "inventory", "marketing only"], "A", "HRM manages an organization's workforce: hiring, developing and retaining employees.", ["hrm"]],
  ["hrm", "HR Planning", "medium", "HR forecasting estimates future:", ["workforce needs", "product prices", "interest rates", "tax rates"], "A", "HR planning predicts how many and what kind of employees will be needed.", ["hrm", "planning"]],
  ["hrm", "Recruitment & Selection", "easy", "Recruitment is the process of:", ["attracting job candidates", "firing employees", "paying salaries", "training only"], "A", "Recruitment attracts applicants; selection chooses among them.", ["hrm", "recruitment"]],
  ["hrm", "Recruitment & Selection", "medium", "A structured interview means:", ["the same questions are asked of all candidates", "questions change randomly", "no questions are asked", "only the manager speaks"], "A", "Structured interviews standardize questions to compare candidates fairly.", ["hrm", "interview"]],
  ["hrm", "Training & Development", "medium", "On-the-job training methods include:", ["job rotation and coaching", "distance learning only", "exams only", "recruitment"], "A", "Job rotation, coaching and apprenticeships are on-the-job methods.", ["hrm", "training"]],
  ["hrm", "Performance Appraisal", "medium", "360-degree appraisal collects feedback from:", ["all directions: peers, subordinates, superiors and self", "only the boss", "only customers", "only the HR department"], "A", "360-degree feedback gathers views from multiple stakeholders.", ["hrm", "appraisal"]],
  ["hrm", "Compensation", "medium", "A 'salary survey' is used to:", ["compare pay with the market", "survey employees' hobbies", "measure productivity", "plan vacations"], "A", "Salary surveys benchmark compensation against market rates.", ["hrm", "compensation"]],
  ["hrm", "Labor Laws", "hard", "In Pakistan, the body overseeing labor disputes includes:", ["National Industrial Relations Commission", "SECP only", "PTA", "FIA"], "A", "NIRC handles labor disputes under the Industrial Relations Act 2012.", ["hrm", "labor-laws"]],
  /* marketing */
  ["marketing", "Marketing Mix", "easy", "The four P's of marketing are:", ["product, price, place, promotion", "people, profit, plan, process", "price, power, plan, product", "product, profit, publicity, place"], "A", "The classic marketing mix: Product, Price, Place, Promotion.", ["marketing"]],
  ["marketing", "Marketing Mix", "medium", "In the extended marketing mix for services, the extra P's include:", ["people, process, physical evidence", "power, price, packaging", "politics, plan, profit", "product, people, price"], "A", "Services marketing adds People, Process and Physical Evidence.", ["marketing", "services"]],
  ["marketing", "Segmentation & Targeting", "easy", "Dividing a market into distinct groups is called:", ["segmentation", "positioning only", "pricing", "distribution"], "A", "Segmentation splits the market; targeting selects segments.", ["marketing", "segmentation"]],
  ["marketing", "Branding", "medium", "Brand equity refers to:", ["the value a brand adds beyond its product", "the factory's asset value", "raw material cost", "advertising spend only"], "A", "Brand equity is the premium customers associate with a brand name.", ["marketing", "branding"]],
  ["marketing", "Pricing Strategies", "medium", "Setting a low introductory price to gain market share is:", ["penetration pricing", "skimming pricing", "cost pricing", "auction pricing"], "A", "Penetration pricing enters with low prices; skimming starts high.", ["marketing", "pricing"]],
  ["marketing", "Content & SEO", "medium", "SEO primarily aims to:", ["improve search engine rankings", "print advertisements", "reduce costs only", "design logos"], "A", "Search Engine Optimization improves organic visibility in search results.", ["marketing", "digital"]],
  ["marketing", "Social Media Marketing", "medium", "Which metric measures audience engagement on posts?", ["likes, shares and comments", "page size", "load time", "server count"], "A", "Engagement includes likes, comments and shares.", ["marketing", "social"]],
  /* accounting top-ups */
  ["accounting", "Double Entry", "medium", "Every debit entry must have:", ["an equal credit entry", "a larger credit", "no corresponding entry", "a receipt"], "A", "The double-entry system keeps debits equal to credits.", ["accounting"]],
  ["accounting", "Balance Sheet", "medium", "If a business has assets of Rs 100,000 and liabilities of Rs 40,000, its owner's equity is:", ["Rs 60,000", "Rs 140,000", "Rs 40,000", "Rs 100,000"], "A", "Equity = Assets - Liabilities = 100,000 - 40,000 = 60,000.", ["accounting"]],
  /* finance top-ups */
  ["finance", "Time Value of Money", "medium", "A rupee today is worth:", ["more than a rupee tomorrow", "less than a rupee tomorrow", "the same always", "nothing"], "A", "Money can earn interest, so present value exceeds future value.", ["finance", "tvom"]],
  ["finance", "Stock Market & Islamic Finance", "medium", "The stock exchange of Pakistan is headquartered in:", ["Karachi", "Lahore", "Islamabad", "Peshawar"], "A", "PSX is based in Karachi.", ["finance", "markets"]],
  ["finance", "Stock Market & Islamic Finance", "hard", "Diversification reduces:", ["unsystematic risk", "systematic risk", "inflation", "liquidity"], "A", "Spreading investments removes company-specific (unsystematic) risk, not market risk.", ["finance", "risk"]]
];

const SOCIAL = [
  /* world history */
  ["world-history", "Ancient Civilizations", "easy", "The pyramids of Giza were built by the:", ["ancient Egyptians", "Greeks", "Romans", "Persians"], "A", "The Great Pyramids are Egyptian monuments of the Old Kingdom.", ["history"]],
  ["world-history", "Ancient Civilizations", "easy", "Hammurabi's Code belongs to ancient:", ["Babylonia", "China", "India", "Greece"], "A", "Hammurabi, king of Babylon, issued one of the first written law codes.", ["history"]],
  ["world-history", "Medieval Empires", "medium", "The Ottoman Empire was centered in:", ["Anatolia (Turkey)", "Spain", "Iran", "Egypt"], "A", "The Ottomans ruled from Anatolia, expanding into Europe, Asia and Africa.", ["history"]],
  ["world-history", "Renaissance & Enlightenment", "medium", "The Renaissance began in:", ["Italy", "France", "England", "Germany"], "A", "The Renaissance started in 14th-century Italy and spread across Europe.", ["history"]],
  ["world-history", "World Wars", "medium", "World War I began in the year:", ["1914", "1918", "1939", "1905"], "A", "WWI started in 1914 after the assassination of Archduke Franz Ferdinand.", ["history", "ww1"]],
  ["world-history", "World Wars", "easy", "World War II ended in:", ["1945", "1940", "1950", "1939"], "A", "WWII ended in 1945 with the surrender of Germany and Japan.", ["history", "ww2"]],
  ["world-history", "Cold War", "medium", "The Berlin Wall fell in:", ["1989", "1991", "1979", "1985"], "A", "The Berlin Wall fell in November 1989, preceding German reunification.", ["history", "cold-war"]],
  ["world-history", "Cold War", "hard", "The Cuban Missile Crisis occurred in:", ["1962", "1958", "1970", "1955"], "A", "The 1962 crisis brought the US and USSR to the brink of nuclear war.", ["history", "cold-war"]],
  /* pakistan history */
  ["pakistan-history", "Muslim Rule in India", "easy", "The Mughal Empire was founded by:", ["Babur", "Akbar", "Aurangzeb", "Shah Jahan"], "A", "Babur founded the Mughal Empire after the Battle of Panipat (1526).", ["history"]],
  ["pakistan-history", "Muslim Rule in India", "medium", "The last Mughal emperor was:", ["Bahadur Shah Zafar", "Shah Jahan", "Jahangir", "Akbar"], "A", "Bahadur Shah Zafar was deposed after the War of Independence 1857.", ["history"]],
  ["pakistan-history", "Freedom Movement", "easy", "The All-India Muslim League was founded in:", ["1906", "1857", "1940", "1920"], "A", "The Muslim League was founded in Dhaka in 1906.", ["history", "muslim-league"]],
  ["pakistan-history", "Freedom Movement", "easy", "The Lahore Resolution was passed in:", ["1940", "1930", "1947", "1935"], "A", "The Pakistan Resolution was adopted in Lahore in March 1940.", ["history", "resolution"]],
  ["pakistan-history", "Freedom Movement", "medium", "Who proposed the Two-Nation Theory at Allahabad in 1930?", ["Allama Iqbal", "Quaid-e-Azam", "Liaquat Ali", "Sir Syed"], "A", "Iqbal's 1930 Allahabad address articulated the vision for a Muslim state.", ["history"]],
  ["pakistan-history", "Early Years", "medium", "Pakistan became a republic in:", ["1956", "1947", "1971", "1962"], "A", "The 1956 Constitution made Pakistan an Islamic Republic.", ["history"]],
  ["pakistan-history", "Constitutional Development", "medium", "Pakistan's first constitution was enforced in:", ["1956", "1947", "1958", "1962"], "A", "The Constitution of 1956 was the first, adopted by the Constituent Assembly.", ["history", "constitution"]],
  ["pakistan-history", "Economic History", "hard", "The Green Revolution in Pakistan is associated with:", ["high-yield wheat varieties", "the steel industry", "textile exports only", "IT parks"], "A", "Improved wheat varieties in the 1960s dramatically raised output.", ["history", "economy"]],
  /* sociology top-ups */
  ["sociology", "Culture & Socialization", "medium", "Who is considered the founder of sociology?", ["Auguste Comte", "Karl Marx only", "Sigmund Freud", "Max Weber only"], "A", "Comte coined the term 'sociology' in the 1830s.", ["sociology"]],
  ["sociology", "Culture & Socialization", "medium", "The family is an example of a:", ["primary social institution", "financial institution", "political party", "corporation"], "A", "The family is the primary institution for socialization.", ["sociology"]],
  ["sociology", "Social Problems", "hard", "Modernization refers to:", ["the shift from traditional to industrial societies", "restoring old customs", "population decline", "urban planning only"], "A", "Modernization describes the broad transformation toward industrial, urban societies.", ["sociology"]]
];

writeFile("31-management.json", MGMT);
writeFile("32-social.json", SOCIAL);
