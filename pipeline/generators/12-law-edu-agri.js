/* ============================================================
   Generator file 12 — Law, Education, Agriculture, Forestry,
   Psychology, Physical Education, Veterinary
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
  makeGen("law", "Law — Legal Principles", {
    "Legal Concepts": [
      ["What is law?", "rules enforced by the state", "Law orders society and resolves disputes."],
      ["What is a statute?", "a written law made by legislature", "Statutes are Acts of Parliament."],
      ["What is common law?", "law developed by court decisions", "Common law builds on precedent."],
      ["What is a precedent?", "a prior ruling guiding later cases", "Stare decisis follows precedent."],
      ["What is a contract?", "a legally binding agreement", "Contracts require offer, acceptance and consideration."],
      ["What is an offer?", "a proposal to contract", "Acceptance of an offer forms a contract."],
      ["What is consideration?", "value exchanged in a contract", "Consideration must move between parties."],
      ["What is a tort?", "a civil wrong", "Torts like negligence create liability."],
      ["What is negligence?", "breach of a duty of care", "Negligence causes foreseeable harm."],
      ["What is a crime?", "an act punishable by the state", "Crimes breach public law."],
      ["What is a punishment?", "a penalty for an offence", "Punishments deter and reform."],
      ["What is evidence?", "proof used in court", "Evidence establishes facts in trials."],
      ["What is a witness?", "a person testifying in court", "Witnesses give evidence under oath."],
      ["What is a verdict?", "the court's decision", "Verdicts find guilt, liability or the outcome."],
      ["What is a judge?", "the officer presiding over court", "Judges rule on law and procedure."],
      ["What is a lawyer?", "a legal professional", "Lawyers advise and represent clients."]
    ]
  }),
  makeGen("constitution", "Constitution — Fundamentals", {
    "Constitutional Law": [
      ["What is a constitution?", "the supreme law of a state", "Constitutions structure government and rights."],
      ["What is a parliamentary system?", "executive drawn from the legislature", "The PM and cabinet answer to parliament."],
      ["What is a presidential system?", "a separately elected executive", "Presidents hold executive power directly."],
      ["What is judicial review?", "courts checking law against the constitution", "Judicial review invalidates unconstitutional laws."],
      ["What is a bill of rights?", "a list of protected rights", "Rights constrain government power."],
      ["What is an amendment?", "a formal constitutional change", "Amendments adapt the constitution."],
      ["What is the separation of powers?", "dividing government branches", "Legislature, executive and judiciary balance power."],
      ["What is federalism?", "power shared between levels", "Federal states divide central and regional authority."],
      ["What is the rule of law?", "everyone is subject to the law", "Rule of law prevents arbitrary power."],
      ["What is sovereignty?", "supreme authority of the state", "Sovereignty is the basis of statehood."],
      ["What is the legislature?", "the law-making branch", "Parliament enacts statutes."],
      ["What is the executive?", "the branch enforcing law", "The executive runs the government."],
      ["What is the judiciary?", "the branch deciding disputes", "Courts interpret and apply the law."],
      ["What is a fundamental right?", "a constitutionally protected right", "Rights like speech and religion are fundamental."]
    ]
  }),
  makeGen("pedagogy", "Pedagogy — Teaching Science", {
    "Teaching Methods": [
      ["What is pedagogy?", "the science of teaching", "Pedagogy covers methods, styles and techniques."],
      ["What is a lesson plan?", "a structured teaching outline", "Lesson plans organise objectives and activities."],
      ["What is assessment?", "measuring student learning", "Assessment includes tests, quizzes and observation."],
      ["What is a formative assessment?", "ongoing checks during learning", "Formative feedback improves learning."],
      ["What is a summative assessment?", "end-of-course evaluation", "Summative tests grade final achievement."],
      ["What is a curriculum?", "the planned course of study", "Curricula define what is taught."],
      ["What is a syllabus?", "a course outline", "Syllabi list topics and requirements."],
      ["What is a lecture?", "an oral teaching presentation", "Lectures present material to classes."],
      ["What is group work?", "students learning together", "Group work builds cooperation."],
      ["What is a question?", "a prompt for thinking", "Questioning drives classroom dialogue."],
      ["What is feedback?", "information about performance", "Feedback guides improvement."],
      ["What is motivation?", "the drive to learn", "Motivation boosts engagement and results."],
      ["What is a learning objective?", "a goal for student learning", "Objectives state what students will know."],
      ["What is a classroom?", "a space for teaching", "Classrooms support instruction and interaction."]
    ]
  }),
  makeGen("education", "Education — Systems", {
    "Education Systems": [
      ["What is education?", "the process of learning", "Education develops knowledge and skills."],
      ["What is primary education?", "the first stage of schooling", "Primary years build literacy and numeracy."],
      ["What is secondary education?", "schooling after primary", "Secondary prepares for higher study or work."],
      ["What is higher education?", "university-level study", "Higher education grants degrees."],
      ["What is literacy?", "the ability to read and write", "Literacy rates measure education access."],
      ["What is a school?", "an institution for learning", "Schools deliver structured education."],
      ["What is a university?", "an institution of higher learning", "Universities teach and research."],
      ["What is a degree?", "a qualification from higher study", "Degrees certify academic achievement."],
      ["What is distance education?", "learning away from campus", "Online and postal study enable distance learning."],
      ["What is vocational training?", "skill-based occupational training", "Vocational training prepares for trades."],
      ["What is lifelong learning?", "continuing education through life", "Lifelong learning updates skills and knowledge."],
      ["What is a teacher?", "a person who instructs", "Teachers facilitate student learning."]
    ]
  }),
  makeGen("psychology", "Psychology — Mind and Behaviour", {
    "Psychology Concepts": [
      ["What is psychology?", "the study of mind and behaviour", "Psychology examines thoughts, feelings and actions."],
      ["What is a psychologist?", "a mental-behaviour specialist", "Psychologists study, assess and treat behaviour."],
      ["What is learning?", "change from experience", "Learning includes conditioning and observation."],
      ["What is memory?", "storing and retrieving information", "Memory has sensory, short-term and long-term stages."],
      ["What is attention?", "focusing mental resources", "Attention selects what we process."],
      ["What is perception?", "interpreting sensory input", "Perception organises raw sensations into meaning."],
      ["What is emotion?", "a feeling state with bodily change", "Emotions motivate and colour experience."],
      ["What is motivation?", "the drive behind behaviour", "Motivation pushes us toward goals."],
      ["What is personality?", "stable patterns of behaviour", "Personality traits persist across situations."],
      ["What is intelligence?", "the capacity to learn and solve problems", "Intelligence tests measure cognitive ability."],
      ["What is stress?", "the response to pressure", "Chronic stress harms health and performance."],
      ["What is therapy?", "treatment for mental distress", "Psychotherapy addresses thoughts and emotions."]
    ]
  }),
  makeGen("physical-education", "Physical Education — Health", {
    "Fitness Concepts": [
      ["What is physical fitness?", "the ability to perform activity", "Fitness covers strength, stamina and flexibility."],
      ["What is exercise?", "planned physical activity", "Exercise improves health and fitness."],
      ["What is a warm-up?", "light activity before exercise", "Warm-ups prepare muscles and prevent injury."],
      ["What is a cool-down?", "gentle activity after exercise", "Cool-downs ease recovery."],
      ["What is endurance?", "the ability to sustain effort", "Cardiovascular endurance boosts stamina."],
      ["What is strength?", "the ability to exert force", "Strength training builds muscle."],
      ["What is flexibility?", "range of movement at joints", "Stretching improves flexibility."],
      ["What is a sport?", "organised competitive activity", "Sports build fitness and teamwork."],
      ["What is a team sport?", "a game played in teams", "Cricket, hockey and football are team sports."],
      ["What is a tournament?", "a series of competitions", "Tournaments crown champions."],
      ["What is fair play?", "honest competition", "Fair play upholds sportsmanship."],
      ["What is a coach?", "a trainer of athletes", "Coaches develop skills and tactics."]
    ]
  }),
  makeGen("agriculture", "Agriculture — Crop Science", {
    "Crops and Soils": [
      ["Which is the staple food crop of Pakistan?", "Wheat", "Wheat is the main food grain."],
      ["Which crop is known as 'white gold'?", "Cotton", "Cotton drives the textile industry."],
      ["Which is the main rice-exporting province?", "Punjab (and Sindh)", "Punjab and Sindh grow rice, including basmati."],
      ["What is irrigation?", "supplying water to crops", "Irrigation supplements rainfall."],
      ["What is a fertiliser?", "a soil nutrient supplement", "Fertilisers boost crop yields."],
      ["What is soil?", "the upper layer of the earth for plants", "Soil supplies water, nutrients and support."],
      ["What is sowing?", "planting seeds", "Sowing begins the growing cycle."],
      ["What is harvesting?", "gathering mature crops", "Harvesting ends the crop cycle."],
      ["What is a pesticide?", "a chemical controlling pests", "Pesticides protect crops from insects."],
      ["What is a herbicide?", "a weed-killing chemical", "Herbicides control competing weeds."],
      ["What is a tractor?", "a farm machine for field work", "Tractors plough, sow and harvest."],
      ["What is a canal?", "a man-made water channel", "Canals distribute irrigation water."],
      ["What is a crop rotation?", "alternating crops on land", "Rotation maintains soil fertility."],
      ["What is yield?", "the amount of crop produced", "Yield is measured per hectare."]
    ]
  }),
  makeGen("forestry", "Forestry — Forest Science", {
    "Forests": [
      ["What is forestry?", "the science of managing forests", "Forestry grows and harvests timber sustainably."],
      ["What is a forest?", "a large area of trees", "Forests regulate climate and water."],
      ["What is afforestation?", "planting forests on new land", "Afforestation restores tree cover."],
      ["What is deforestation?", "clearing of forests", "Deforestation degrades land and climate."],
      ["What is a nursery?", "a place for growing seedlings", "Nurseries raise saplings for planting."],
      ["What is timber?", "processed wood for use", "Timber builds houses and furniture."],
      ["What is a conifer?", "a cone-bearing tree", "Pines and deodar are conifers."],
      ["What is the deodar?", "a Himalayan cedar", "Deodar is Pakistan's national tree."],
      ["What is a canopy?", "the top layer of a forest", "The canopy shades the forest floor."],
      ["What is reforestation?", "replanting cleared forests", "Reforestation restores forest cover."],
      ["What is a wildlife sanctuary?", "a protected natural area", "Sanctuaries protect animals and habitats."],
      ["What is a forest fire?", "an uncontrolled fire in woodland", "Fires destroy timber and wildlife."]
    ]
  }),
  makeGen("veterinary", "Veterinary — Animal Health", {
    "Animal Care": [
      ["What is veterinary science?", "animal health care", "Veterinarians treat and prevent animal disease."],
      ["What is a veterinarian?", "an animal doctor", "Vets care for livestock and pets."],
      ["Which disease of cattle is foot-and-mouth?", "a viral infection", "FMD causes blisters in cloven-hoofed animals."],
      ["What is vaccination in animals?", "preventing infectious disease", "Vaccines protect herds and flocks."],
      ["What is a herd?", "a group of livestock", "Herds of cattle and buffalo are farmed together."],
      ["What is a flock?", "a group of birds or sheep", "Flocks of poultry and sheep are managed as groups."],
      ["What is livestock?", "farm animals kept for use", "Livestock includes cattle, goats and sheep."],
      ["What is a poultry farm?", "a farm raising birds", "Poultry provides eggs and meat."],
      ["What is animal nutrition?", "feeding animals correctly", "Balanced rations keep animals healthy."],
      ["What is a dairy farm?", "a farm producing milk", "Dairy farms milk cattle and buffalo."],
      ["What is quarantine for animals?", "isolating possibly sick animals", "Quarantine stops disease spreading."],
      ["What is a breed?", "a type of domesticated animal", "Breeds are selected for traits like milk or wool."]
    ]
  })
];
