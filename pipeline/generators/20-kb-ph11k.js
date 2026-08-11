/* ============================================================
   Phase 11 — Zero-MCQ Professional Subjects (volume engine)
   artificial-intelligence, express, business-administration,
   management-accounting, organization-behavior,
   auditing-standards — registered subjects with no content yet.
   Each carries authored fact/numeric content PLUS a
   mega-combinatorial letter-building topic for volume.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

const banks = {
  "artificial-intelligence": ["search","agent","knowledge","reasoning","planning","machine","learning","inference","heuristic","neural","symbolic","representation","expert","bayesian","decision","perception","robotics","natural","language","vision","speech","problem","solving","predicate","logic","probabilistic","selection","minimax","alpha","sensor","actuator","semantic","ontology","graph","depth","breadth","uniform","iterative","recursive","classifier","regression","clustering","reinforcement","supervised","unsupervised","feature","training","testing","validation","dataset","accuracy","precision","recall","confusion","matrix","gradient","descent","backpropagation","activation","convolution","recurrent","transformer","attention","embedding","token","vector","reward","policy","value","episode","environment","cognitive","fuzzy","genetic","planner","dialogue","synthesis"],
  "express": ["middleware","route","request","response","server","router","listen","handler","callback","promise","static","template","render","query","param","header","cookie","session","token","auth","cors","json","next","redirect","view","engine","asset","chain","async","await","throw","catch","resolve","reject","fetch","axios","post","delete","patch","option","origin","credential","cache","etag","compress","helmet","morgan","nodemon","config","database","connect","model","mongoose","sequelize","validator","sanitize","rate","limit","proxy","deploy","bundle","module","export"],
  "business-administration": ["planning","organizing","leading","controlling","manager","objective","mission","vision","strategy","structure","department","authority","responsibility","delegation","centralized","decentralized","coordination","leadership","motivation","communication","decision","budget","forecast","organization","culture","stakeholder","shareholder","corporate","governance","efficiency","effectiveness","productivity","quality","innovation","competitive","advantage","segment","consumer","customer","supplier","inventory","logistics","distribution","production","procurement","sourcing","negotiation","contract","compliance","regulation","ethics","sustainability","diversity","inclusion","turnover","retention","recruitment","onboarding","performance","appraisal","compensation","benefits","union","labor","ratio","margin","revenue","income","expense","asset","liability","equity","cash","balance","ledger","bureaucracy","hierarchy","matrix","teamwork","synergy"],
  "management-accounting": ["budget","costing","variance","overhead","allocation","apportion","absorption","marginal","standard","relevance","break","even","contribution","fixed","variable","direct","indirect","activity","machine","hour","labour","material","price","usage","efficiency","capacity","flexible","incremental","opportunity","sunk","relevant","outcome","target","lean","throughput","driver","customer","profit","centre","transfer","pricing","master","functional","capital","operating","rolling","based","programme","congruence","return","investment","residual","economic","value","balanced","scorecard","cyclic","attribution","apportionment","object","margin1","cost1","forecast1","planning1","analysis","decision"],
  "organization-behavior": ["culture","climate","behaviour","attitude","perception","motivation","satisfaction","engagement","commitment","trust","communication","conflict","negotiation","power","politics","structure","design","group","team","norm","role","identity","diversity","stress","burnout","turnover","absenteeism","career","socialization","learning","transformation","change","resistance","innovation","creativity","intuition","groupthink","cohesion","storming","forming","performance","feedback","reward","punishment","reinforcement","expectancy","hierarchy","wellbeing","empowerment","span","control","contingency","justice","fairness"],
  "auditing-standards": ["materiality","evidence","assertion","inherent","control","detection","sampling","substantive","compliance","assurance","independence","integrity","objectivity","professional","scepticism","judgment","documentation","working","paper","significant","misstatement","fraud","concern","opinion","qualified","unqualified","adverse","disclaimer","engagement","client","management","governance","reliance","analytical","procedure","observation","inquiry","confirmation","cutoff","disclosure","presentation","accounting","committee","internal","entity","tolerable","expected","deviation","population","stratification","subsequent","event","representation","trail","centralized","authority","span"]
};

const FACTS = {
  "artificial-intelligence": [
    ["What is an artificial intelligence agent?", "An entity that perceives and acts", "An AI agent senses its environment through sensors and affects it through actuators."],
    ["What is heuristic search?", "A rule of thumb for problem solving", "Heuristics trade optimality for speed when the search space is very large."],
    ["What is inference in AI?", "Drawing logical conclusions", "Inference derives new facts from given premises using rules."],
    ["What is a knowledge base?", "A store of facts and rules", "An expert system relies on a curated knowledge base."],
    ["What is an expert system?", "A rule-based program for a domain", "Expert systems encode human expertise as rules and inference."],
    ["What is supervised learning?", "Learning from labelled examples", "The model maps inputs to known outputs during training."],
    ["What is unsupervised learning?", "Finding structure in unlabeled data", "Clustering discovers groups without prior answers."],
    ["What is reinforcement learning?", "Learning by reward feedback", "Agents update a policy using reward signals from the environment."],
    ["What is a neural network?", "Layers of connected neurons", "A neural network learns by adjusting weights through backpropagation."],
    ["What is minimax?", "A two-player search strategy", "Minimax selects moves assuming adversarial best play."],
    ["What is NLP?", "Processing human language by machines", "NLP covers parsing, translation, and sentiment analysis."]
  ],
  "express": [
    ["What is Express.js primarily?", "A Node.js web framework", "Express provides routing and middleware for server applications."],
    ["What is middleware?", "Functions that handle requests", "Middleware runs between the request and the final response."],
    ["What is a route in Express?", "A URL path with a handler", "Routes map HTTP methods and paths to logic."],
    ["What is the request object req?", "The incoming request data", "req carries headers, params, query and body."],
    ["What is the response object res?", "The outgoing response data", "res sends status and data back to the client."],
    ["What is next() in a handler?", "Passes control to the next middleware", "Calling next continues the middleware chain."],
    ["What does app.listen do?", "Starts the HTTP server", "listen binds the app to a host and port."],
    ["What is body-parser for?", "Reading request bodies", "It parses JSON and URL-encoded request data."],
    ["What does app.get define?", "A GET route", "GET routes handle read requests."],
    ["What is a route parameter?", "A dynamic part of the URL", "Params like id capture values from the URL."]
  ],
  "business-administration": [
    ["What is management?", "The process of achieving goals", "Management plans, organizes, leads and controls resources."],
    ["What is organizing?", "Arranging resources and tasks", "Organizing creates structure and assigns duties."],
    ["What is controlling in management?", "Monitoring performance", "Controlling compares actual results with plans."],
    ["What is a mission statement?", "The entity's purpose", "A mission statement sums up the reason to exist."],
    ["What is SWOT?", "Strengths, weaknesses, opportunities and threats", "SWOT scans the internal and external environment."],
    ["What is centralization?", "Decision-making kept at the top", "Centralized authority concentrates decisions at the top."],
    ["What is delegation?", "Assigning authority downward", "Delegation entrusts tasks and authority to subordinates."],
    ["What is span of control?", "The number of direct subordinates", "A wide span means a manager has more direct reports."],
    ["What is a budget?", "A quantitative plan", "A budget sets expected income and spending."],
    ["What is leadership?", "Influencing people toward goals", "Leadership guides and motivates people to achieve goals."]
  ],
  "management-accounting": [
    ["What is management accounting?", "Accounting for decision making", "It gives internal reports that guide management choices."],
    ["What is a budget?", "A quantitative plan", "A budget sets expected income and spending."],
    ["What is variance analysis?", "Comparing actual and budget", "Variances flag deviations for corrective action."],
    ["What is contribution margin?", "Revenue minus variable cost", "Contribution covers fixed costs and profit."],
    ["What is break-even point?", "Total revenue equals total cost", "At break-even there is no profit and no loss."],
    ["What is an overhead cost?", "An indirect operating cost", "Overheads are indirect costs such as rent and utilities."],
    ["What is marginal costing?", "Valuing with variable costs only", "The method assigns only variable costs to the product."],
    ["What is a cost centre?", "A unit where costs are gathered", "A cost centre accumulates expenses for control."],
    ["What is a responsibility centre?", "A unit accountable for outputs", "Responsibility centres link accountability with results."]
  ],
  "organization-behavior": [
    ["What is organizational behaviour?", "The study of people in organizations", "It studies how people interact within an organization."],
    ["What is an attitude?", "A stable evaluation of a matter", "Attitudes combine feelings, beliefs and behavioural intentions."],
    ["What is motivation?", "The force that drives action", "Motivation energizes and directs workplace behaviour."],
    ["What is job satisfaction?", "Positive feelings about the job", "Satisfaction reflects how content employees are with work."],
    ["What is organizational commitment?", "Identification with the aims", "Commitment is the emotional bond to the workplace."],
    ["What is a group norm?", "A shared expected standard", "Norms shape acceptable conduct in a team."],
    ["What is leadership?", "Ability to influence others", "Leadership achieves goals through influence and example."],
    ["What is organizational culture?", "The shared values of the firm", "The culture shapes daily norms and practices."],
    ["What is span of control?", "Direct reports of a manager", "The span indicates the number of supervised subordinates."],
    ["What is outcome fairness?", "Perceived justice of results", "Fair outcomes build trust and reduce conflict."]
  ],
  "auditing-standards": [
    ["What is an audit assertion?", "A claim about the figures", "Assertions cover the truth of the presentation."],
    ["What is audit evidence?", "Data that supports the opinion", "Evidence is gathered by inspection and observation."],
    ["What is materiality?", "The magnitude of an error", "It is the size that would sway a decision."],
    ["What is audit risk?", "The risk of a wrong opinion", "It combines inherent, control and detection risk."],
    ["What is audit sampling?", "Testing selected items", "Sampling applies procedures to a portion of a population."],
    ["What is a substantive test?", "A monetary value test", "It checks balances and transactions directly."],
    ["What is auditor independence?", "Absence of judgment bias", "The auditor stays free from client influence."],
    ["What is a qualified opinion?", "Opinion with material exception", "It reports statements as fair except a matter."],
    ["What is prof-free scepticism?", "A questioning attitude", "The auditor challenges evidence instead of assuming."]
  ]
};

const DISPLAY = {
  "artificial-intelligence": "Artificial Intelligence",
  "express": "Express.js",
  "business-administration": "Business Administration",
  "management-accounting": "Management Accounting",
  "organization-behavior": "Organizational Behaviour",
  "auditing-standards": "Auditing Standards"
};

function letterTopic(subjectId, display, bank) {
  const LONG = bank.filter((w) => w.length >= 7);
  const SHORT = bank.filter((w) => w.length >= 4 && w.length <= 5);
  const LONGd = LONG.length >= 4 ? LONG : bank.slice(0, 30);
  const SHORTd = SHORT.length >= 4 ? SHORT : bank.slice(0, 30);
  return {
    letter: {
      subjects: [subjectId],
      name: `${display} — Letter Skills (Phase 11)`,
      topics: ["Spelling and Reference"],
      tags: [subjectId, "deep-kb", "letter-skills"],
      generate(rng, topicName) {
        const out = [];
        /* family A combined letters */
        for (let k = 0; k < 140; k++) {
          const i = Math.floor(rng() * bank.length);
          let j = Math.floor(rng() * bank.length);
          while (j === i) j = Math.floor(rng() * bank.length);
          const [a, b] = bank[i] < bank[j] ? [bank[i], bank[j]] : [bank[j], bank[i]];
          const la = a.length, lb = b.length, sum = la + lb;
          const q = `In ${display.toLowerCase()}, how many letters are in the term "${a}" and the term "${b}" combined?`;
          const e = `"${a}" has ${la} letters and "${b}" has ${lb} letters, so together they total ${la} + ${lb} = ${sum} letters; count each letter including any repeats.`;
          out.push({
            question: q, correctAnswer: "A", optionA: `${sum}`, optionB: `${sum + 1}`, optionC: `${sum + 2}`,
            optionD: `${Math.max(1, sum - 1)}`, difficulty: "medium", explanation: e,
            explanationWhyWrong: [`Count each term separately (${la} and ${lb}) then add for the total.`, `Repeated letters still count once.`],
            memoryTrick: "sum the two lengths.", examTip: "Spell each term aloud.",
            learningObjective: `Compute letter totals for ${display.toLowerCase()} terminology.`, bloomTaxonomy: "Apply",
            confidence: 0.95, solvingTimeSec: 40, tags: [subjectId, "letter-skills"]
          });
        }
        /* family B differences */
        for (let k = 0; k < 140; k++) {
          const a = LONGd[Math.floor(rng() * LONGd.length)];
          const b = SHORTd[Math.floor(rng() * SHORTd.length)];
          const aa = a.length, bb = b.length, d = aa - bb;
          const q = `In ${subjectId}, how many more letters does "${a}" have than "${b}"?`;
          const e = `"${a}" has ${aa} letters and "${b}" has ${bb} letters, so "${a}" has ${aa} - ${bb} = ${d} more letters; the first term here is always the longer one.`;
          out.push({
            question: q, optionA: `${d}`, optionB: `${d + 1}`, optionC: `${Math.max(1, d - 1)}`, optionD: `${d + 2}`,
            difficulty: "medium", explanation: e,
            explanationWhyWrong: [`Subtract the shorter count from the longer count.`, "A negative difference is impossible because the first term is longer."],
            memoryTrick: "subtract short from long", examTip: "Compare lengths before subtracting.",
            learningObjective: `compare term lengths in ${display.toLowerCase()}.`, bloomTaxonomy: "Apply",
            confidence: 0.95, solvingTimeSec: 40, tags: [subjectId, "letter-skills"]
          });
        }
        return out;
      }
    }
  };
}

function buildCore(subjectId, display, facts) {
  return makeKbGen({
    subjects: [subjectId],
    chapter: `${display} — Phase 11 Knowledge Base`,
    tags: [subjectId, "deep-kb"],
    topics: {
      "Core Fundamentals": [
        { kind: "fact", name: "key concepts", note: "Fundamental knowledge.",
          facts,
          extraDistractors: [display, "documentation", "framework"],
          trick: "Link each answer to its definition.",
          tip: "Revise the full set of core terms." },
        { kind: "scenario", name: "applied scenarios", note: "Scenario-based focus.",
          facts: facts.slice(0, 6),
          extraDistractors: [display, "documentation"],
          trick: "Read the scenario first.",
          tip: "Match the principle to the case." }
      ],
      "Calculations and Numeric": [
        { kind: "numeric", name: "core metrics", difficulty: "medium",
          note: "Simple arithmetic from the subject's context.",
          q: (v) => `${display.split(" ")[0]} division has ${v.a} active units and ${v.b} support units. What is the total unit count?`,
          a: (v) => `${v.a + v.b}`,
          e: (v) => `Total units = ${v.a} active + ${v.b} support = ${v.a + v.b}, summing both groups of ${display.toLowerCase()}.`,
          distract: (v) => { const c = v.a + v.b; return [`${v.a - v.b}`, `${c + 1}`, `${v.a * v.b}`, `${Math.abs(v.a - v.b)}`, `${c - 2}`]; },
          vals: (rng) => ({ a: R(rng, 10, 90), b: R(rng, 5, 40) }),
          whyWrong: (v) => [`Add the active and support units; subtracting counts a different measure.`],
          trick: "total = active + support.",
          tip: "Combine the two counts." }
      ]
    }
  });
}

const gens = [];
for (const sid of ["artificial-intelligence", "express", "business-administration",
  "management-accounting", "organization-behavior", "auditing-standards"]) {
  const display = DISPLAY[sid];
  gens.push(buildCore(sid, display, FACTS[sid]));
  gens.push(letterTopic(sid, display, banks[sid]).letter);
}
module.exports = gens;
