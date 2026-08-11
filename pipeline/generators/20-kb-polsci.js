/* ============================================================
   Deep Knowledge KB — Political Science
   Government forms, systems, institutions + numeric articles.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["political-science"],
  chapter: "Political Science — Deep Knowledge Bank",
  tags: ["political-science", "deep-kb", "government", "constitution", "systems"],
  topics: {

    "Political Systems": [
      {
        kind: "fact", name: "system facts",
        note: "Forms of government and political systems.",
        facts: [
          ["What is democracy?", "Government by the people through elections", "In democracy, citizens choose representatives in free and fair elections."],
          ["What is a dictatorship?", "Rule by one person without accountability", "Dictators concentrate power without elections or checks, so accountability is absent."],
          ["What is a monarchy?", "Rule by a king or queen, often hereditary", "Monarchies pass the crown by heredity, with limited or absolute power."],
          ["What is the difference between a republic and a monarchy?", "A republic has an elected head; a monarchy has a hereditary one", "Republics elect their head of state; monarchies inherit the throne."],
          ["What is a parliamentary system?", "The executive is drawn from and answerable to the legislature", "The prime minister and cabinet serve while commanding parliament's confidence."],
          ["What is a presidential system?", "The executive is separately elected from the legislature", "A directly elected president holds executive power independent of the legislature."],
          ["What is a federal system?", "Power is shared between central and regional governments", "Federations divide powers constitutionally between national and provincial tiers."],
          ["What is a unitary state?", "Power is concentrated at the centre", "Unitary states delegate powers that the central government can withdraw."],
          ["What is separation of powers?", "Dividing power among executive, legislature and judiciary", "Separation prevents any one branch from dominating the state."],
          ["What is a constitution?", "The supreme law defining state structure and rights", "Constitutions establish institutions, powers and fundamental rights."]
        ],
        trick: "Democracy=elections, federation=shared power, unitary=central, parliamentary=from legislature.",
        tip: "Parliamentary vs presidential and federal vs unitary are the anchor pairs."
      },
      {
        kind: "tf", name: "system statements",
        note: "True/false stems on systems.",
        statements: [
          ["In a federation, power is shared between levels.", "In a federation, all power rests in one city."],
          ["A republic elects its head of state.", "A republic inherits its head of state."],
          ["Parliamentary executives answer to the legislature.", "Parliamentary executives ignore the legislature entirely."],
          ["A unitary state concentrates power centrally.", "A unitary state has permanent independent provinces."],
          ["Separation of powers divides state authority.", "Separation of powers merges all branches into one."]
        ],
        trick: "Federation=shared, republic=elected, parliamentary=answerable, unitary=central, separation=divided.",
        tip: "System-feature swaps are the classic traps."
      }
    ],

    "Institutions and Governance": [
      {
        kind: "fact", name: "institution facts",
        note: "The organs of government and their roles.",
        facts: [
          ["What are the three organs of the state?", "Executive, legislature, judiciary", "The executive enforces, the legislature makes, and the judiciary interprets the law."],
          ["What is the legislature?", "The law-making body", "Parliaments and assemblies debate and pass laws, exercising the legislative branch."],
          ["What is the executive?", "The branch that implements and administers the law", "Governments and bureaucracies execute the laws the legislature passes."],
          ["What is the judiciary?", "The branch that interprets and applies the law", "Courts settle disputes and review the legality of state action."],
          ["What is judicial review?", "Courts checking laws against the constitution", "Judicial review strikes down laws that violate the constitution."],
          ["What is a bill?", "A proposed law before the legislature", "Bills become acts when passed and assented to, completing the legislative process."],
          ["What is a two-thirds majority needed for?", "Constitutional amendments", "Amending the constitution requires super-majorities in most systems."],
          ["What is the opposition?", "The parties not in government", "Opposition parties scrutinise the government and offer alternatives."],
          ["What is a coalition government?", "Several parties sharing power", "Coalitions form when no single party wins a majority, so partners must share power."],
          ["What is a hung parliament?", "No party holds a majority of seats", "A hung parliament forces coalitions or minority government, since no party can act alone."]
        ],
        trick: "Legislature=makes, executive=executes, judiciary=interprets, bill=proposed law, amendment=two-thirds.",
        tip: "The three-organs mapping is the most asked governance item."
      },
      {
        kind: "numeric", name: "majority calculations", difficulty: "easy",
        note: "Simple majority = more than half of the seats.",
        q: (v) => `An assembly has ${v.seats} seats. How many seats make a simple majority?`,
        a: (v) => `${Math.floor(v.seats / 2) + 1}`,
        e: (v) => `Simple majority = half rounded down plus one = ${Math.floor(v.seats / 2)} + 1 = ${Math.floor(v.seats / 2) + 1}, because more than half the seats is needed to command the house.`,
        distract: (v) => [`${Math.floor(v.seats / 2)}`, `${Math.ceil(v.seats / 2)}`, `${Math.floor(v.seats / 2) + 2}`, `${v.seats - 1}`, `${Math.round(v.seats * 0.4)}`],
        vals: (rng) => ({ seats: 50 + Math.floor(rng() * 30) * 10 }),
        whyWrong: (v) => [`More than half means floor(n/2) + 1; exactly half or rounding up to half are the classic traps.`],
        trick: "Majority = floor(seats ÷ 2) + 1.",
        tip: "For even seat counts, half is NOT a majority."
      },
      {
        kind: "numeric", name: "amendment calculations", difficulty: "medium",
        note: "Amendments need two-thirds of votes in many parliaments.",
        q: (v) => `A constitutional amendment needs two-thirds of the ${v.total} members to pass. How many votes are required?`,
        a: (v) => `${Math.ceil(2 * v.total / 3)}`,
        e: (v) => `Two-thirds = 2 × ${v.total} ÷ 3 = ${Math.ceil(2 * v.total / 3)}, because super-majorities are rounded up to the next whole vote.`,
        distract: (v) => [`${Math.floor(2 * v.total / 3)}`, `${Math.floor(v.total / 2) + 1}`, `${Math.ceil(2 * v.total / 3) + 1}`, `${v.total}`, `${Math.ceil(2 * v.total / 3) - 1}`],
        vals: (rng) => ({ total: 200 + Math.floor(rng() * 30) * 10 }),
        whyWrong: (v) => [`Two-thirds rounds UP to a whole vote; one-vote-short or simple-majority answers are the traps.`],
        trick: "Two-thirds = ceil(2n ÷ 3).",
        tip: "Super-majority thresholds differ (2/3, 3/4) — read the question."
      },
      {
        kind: "numeric", name: "voting share calculations", difficulty: "medium",
        note: "Seat share = party seats ÷ total seats × 100.",
        q: (v) => `A party wins ${v.ps} of ${v.ts} seats. What percentage of seats does it hold?`,
        a: (v) => `${(100 * v.ps / v.ts).toFixed(1)}%`,
        e: (v) => `Seat share = ${v.ps} ÷ ${v.ts} × 100 = ${(100 * v.ps / v.ts).toFixed(1)}%, because the share expresses party seats as a percentage of the house.`,
        distract: (v) => {
          const c = 100 * v.ps / v.ts;
          return [`${(100 - c).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 1.5).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`];
        },
        vals: (rng) => {
          const ts = 100 + Math.floor(rng() * 300);
          const ps = 10 + Math.floor(rng() * (ts - 10));
          return { ps, ts };
        },
        whyWrong: (v) => [`Seat share = party ÷ total × 100; the complement is the standard distractor.`],
        trick: "Share % = party seats ÷ total seats × 100.",
        tip: "Check whether the stem asks for the party's share or the rest."
      }
    ],

    "Political Theory": [
      {
        kind: "fact", name: "theory facts",
        note: "Key political thinkers and ideologies.",
        facts: [
          ["Who wrote the Republic, describing philosopher kings?", "Plato", "Plato's Republic sketches an ideal state ruled by philosopher kings."],
          ["Who wrote The Prince, on political power?", "Niccolò Machiavelli", "Machiavelli's The Prince (1513) advises rulers on acquiring and keeping power."],
          ["Who wrote the Social Contract?", "Jean-Jacques Rousseau", "Rousseau's Social Contract argues legitimate authority rests on popular consent."],
          ["Who wrote the Two Treatises of Government?", "John Locke", "Locke's treatises defend natural rights and limited government."],
          ["What is capitalism?", "An economic system of private ownership and markets", "Capitalism relies on private property, profit and free markets."],
          ["What is socialism?", "Collective ownership and equitable distribution", "Socialism puts production under community or state control to distribute wealth more equally."],
          ["What is the difference between socialism and communism?", "Socialism is transitional; communism is the final stateless stage", "Marx saw socialism as the stage before the classless communist society."],
          ["Who co-authored the Communist Manifesto?", "Karl Marx and Friedrich Engels", "The 1848 Manifesto calls workers to unite against the bourgeois order."],
          ["What is liberalism?", "Emphasis on individual liberty and rights", "Liberalism champions freedom, equality and limited state power."],
          ["What is nationalism?", "Loyalty to one's nation and its interests", "Nationalism binds people by shared identity and self-determination."]
        ],
        trick: "Plato=Republic, Machiavelli=Prince, Rousseau=Social Contract, Locke=Two Treatises, Marx=Manifesto.",
        tip: "Philosopher-work pairs are the highest-yield theory items."
      },
      {
        kind: "tf", name: "theory statements",
        note: "True/false stems on theory.",
        statements: [
          ["Machiavelli wrote The Prince.", "Plato wrote The Prince."],
          ["Rousseau wrote the Social Contract.", "Rousseau wrote the Wealth of Nations."],
          ["Locke defended natural rights.", "Locke abolished the idea of rights."],
          ["Marx and Engels wrote the Communist Manifesto.", "Marx and Engels wrote the Prince."],
          ["Capitalism relies on private ownership.", "Capitalism relies on state ownership of all firms."]
        ],
        trick: "Machiavelli=Prince, Rousseau=Social Contract, Locke=natural rights, Marx+Engels=Manifesto, capitalism=private.",
        tip: "Author-work swaps are the favourite traps."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
