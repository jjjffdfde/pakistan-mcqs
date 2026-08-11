/* ============================================================
   Deep Knowledge KB — Economics
   Basic concepts, micro/macro, money, Pakistan economy +
   numeric elasticity/GDP topics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["economics"],
  chapter: "Economics — Deep Knowledge Bank",
  tags: ["economics", "deep-kb", "micro", "macro", "money", "pakistan"],
  topics: {

    "Basic Concepts of Economics": [
      {
        kind: "fact", name: "basic economics facts",
        note: "The founding definitions of economics and scarcity.",
        facts: [
          ["Who is known as the father of modern economics?", "Adam Smith", "Adam Smith's Wealth of Nations (1776) founded modern economics, introducing the invisible hand."],
          ["What is the basic economic problem?", "Scarcity", "Scarcity means limited resources against unlimited wants, forcing choices in every economy."],
          ["What is the study of individual markets called?", "Microeconomics", "Microeconomics studies households, firms and individual markets, such as prices of single goods."],
          ["What is the study of the whole economy called?", "Macroeconomics", "Macroeconomics studies national aggregates: inflation, unemployment, growth and trade."],
          ["What are the four factors of production?", "Land, labour, capital, entrepreneurship", "Land, labour, capital and enterprise combine to produce goods and services."],
          ["What is opportunity cost?", "The next best alternative foregone", "Opportunity cost is the value of the best alternative given up when a choice is made."],
          ["What does demand mean in economics?", "Willingness and ability to pay for a good", "Demand is the quantity buyers are willing and able to purchase at a given price."],
          ["What is the law of demand?", "Price up, quantity demanded falls", "The law of demand states an inverse relationship between price and quantity demanded."],
          ["What is inflation?", "A sustained rise in the general price level", "Inflation erodes purchasing power when the average level of prices rises over time."],
          ["What is GDP?", "The total value of goods and services produced in a country in a year", "Gross domestic product measures the market value of final output produced within a country's borders."]
        ],
        trick: "Smith=father, scarcity=basic problem, opportunity cost=next best foregone, demand=inverse price.",
        tip: "Adam Smith + scarcity + opportunity cost are the three anchor definitions."
      },
      {
        kind: "tf", name: "basic economics statements",
        note: "True/false stems on fundamentals.",
        statements: [
          ["Scarcity forces every economy to make choices.", "Scarcity only affects poor countries."],
          ["Demand and price move in opposite directions.", "Demand and price always move together."],
          ["Opportunity cost is the next best alternative foregone.", "Opportunity cost is the total money spent on a purchase."],
          ["Microeconomics studies individual markets.", "Microeconomics studies national inflation and growth."],
          ["Inflation is a sustained rise in the price level.", "Inflation is a fall in the general price level."]
        ],
        trick: "Scarcity=universal, demand inverse, opportunity cost=foregone, micro=markets, macro=whole.",
        tip: "Micro vs macro scope swap is the favourite trap."
      }
    ],

    "Demand and Supply": [
      {
        kind: "fact", name: "demand and supply facts",
        note: "Market behaviour facts around demand and supply.",
        facts: [
          ["What happens to price when demand exceeds supply?", "Price rises", "Excess demand creates shortage, pushing the price up until supply meets demand."],
          ["What happens to price when supply exceeds demand?", "Price falls", "Excess supply creates surplus, forcing sellers to lower prices."],
          ["What is the point where demand equals supply called?", "Equilibrium", "Equilibrium is the price-quantity point where quantity demanded equals quantity supplied."],
          ["Which goods rise in demand when income rises?", "Normal goods", "Normal goods have income elasticity greater than zero: demand grows as income grows."],
          ["Which goods fall in demand when income rises?", "Inferior goods", "Inferior goods see demand fall as income rises, e.g. cheap staples replaced by better alternatives."],
          ["What is the cross-price relationship of substitutes?", "Demand moves together with the other's price", "If tea rises, coffee demand rises — substitutes move together."],
          ["What is the relationship of complements?", "Demand moves against the other's price", "If petrol price rises, car travel falls — complements move against each other."],
          ["What is price elasticity of demand?", "Responsiveness of quantity demanded to price change", "Elasticity measures percentage change in quantity demanded per percentage change in price."],
          ["Which demand curve is perfectly inelastic?", "A vertical line", "Perfectly inelastic demand (e.g. life-saving medicine) is a vertical line: quantity never changes."],
          ["Which demand curve is perfectly elastic?", "A horizontal line", "Perfectly elastic demand means any price rise destroys demand entirely — a horizontal line."]
        ],
        trick: "Shortage→price up, surplus→price down; normal follows income, inferior opposes; substitutes together, complements apart.",
        tip: "Normal/inferior and substitutes/complements are the two classic distinction questions."
      },
      {
        kind: "numeric", name: "price elasticity calculations", difficulty: "medium",
        note: "Price elasticity of demand = % change in quantity ÷ % change in price.",
        q: (v) => `When the price of a good rises by ${v.dp}%, the quantity demanded falls by ${v.dq}%. What is the price elasticity of demand?`,
        a: (v) => `${(v.dq / v.dp).toFixed(1)} (elastic)` ,
        e: (v) => `PED = %ΔQ ÷ %ΔP = ${v.dq} ÷ ${v.dp} = ${(v.dq / v.dp).toFixed(1)}. Since this is greater than 1, demand is elastic because quantity responds strongly to price.`,
        distract: (v) => {
          const c = v.dq / v.dp;
          return [`${(v.dp / v.dq).toFixed(1)} (elastic)`, `${(c * 2).toFixed(1)} (elastic)`, `${(v.dq + v.dp).toFixed(0)} (elastic)`, `${(c * 0.5).toFixed(1)} (inelastic)`, `1.0 (unit elastic)`];
        },
        vals: (rng) => {
          const dp = 5 + Math.floor(rng() * 20);
          const dq = dp + 5 + Math.floor(rng() * 25);
          return { dp, dq };
        },
        whyWrong: (v) => [`PED divides quantity change by price change, not the reverse; values above 1 mean elastic demand.`],
        trick: "PED = %Q / %P; above 1 = elastic, below 1 = inelastic, equal 1 = unit.",
        tip: "Only magnitude matters for elastic/inelastic classification."
      },
      {
        kind: "numeric", name: "income elasticity calculations", difficulty: "medium",
        note: "Income elasticity of demand = % change in quantity ÷ % change in income.",
        q: (v) => `A household's income rises by ${v.di}% and its demand for a good rises by ${v.dq}%. What is the income elasticity of demand?`,
        a: (v) => `${(v.dq / v.di).toFixed(1)} (normal good)`,
        e: (v) => `Income elasticity = %ΔQ ÷ %ΔY = ${v.dq} ÷ ${v.di} = ${(v.dq / v.di).toFixed(1)}. The positive sign shows the good is normal, since demand grows with income.`,
        distract: (v) => {
          const c = v.dq / v.di;
          return [`${(c * -1).toFixed(1)} (normal good)`, `${(v.di / v.dq).toFixed(1)} (normal good)`, `${(c * 2).toFixed(1)} (normal good)`, `${(c + 1).toFixed(1)} (inferior good)`, `${(v.dq + v.di).toFixed(0)} (normal good)`];
        },
        vals: (rng) => {
          const di = 5 + Math.floor(rng() * 15);
          const dq = 2 + Math.floor(rng() * 20);
          return { di, dq };
        },
        whyWrong: (v) => [`Positive income elasticity means a normal good; negative would signal inferior goods.`],
        trick: "Sign decides normal (positive) vs inferior (negative).",
        tip: "Watch the sign — it matters more than the magnitude here."
      }
    ],

    "Money, Banking and Finance": [
      {
        kind: "fact", name: "money and banking facts",
        note: "The functions of money and central banking facts.",
        facts: [
          ["What are the three functions of money?", "Medium of exchange, store of value, unit of account", "Money works as a medium of exchange, a store of value and a unit of account for measuring prices."],
          ["Which bank issues currency in Pakistan?", "State Bank of Pakistan", "The State Bank of Pakistan is the central bank with the sole right to issue notes."],
          ["When was the State Bank of Pakistan established?", "1948", "The State Bank of Pakistan was established on 1 July 1948, two years after independence."],
          ["What is the main function of a central bank?", "Controlling monetary policy and the money supply", "Central banks manage interest rates, money supply and financial stability."],
          ["What is the role of commercial banks?", "Accept deposits and grant loans", "Commercial banks take deposits from savers and lend them to borrowers for profit."],
          ["What is the difference between the repo rate and the reverse repo rate?", "Repo lets banks borrow; reverse repo lets them park funds", "The repo rate is the cost at which banks borrow from the central bank; the reverse repo rate is what they earn on deposits with it."],
          ["What is money supply M1?", "Currency plus demand deposits", "M1 is the narrowest money measure: physical currency and demand deposits like current accounts."],
          ["What is a savings account's key advantage?", "Interest on deposits with easy access", "Savings accounts pay interest on deposits while allowing easy withdrawals."],
          ["What does the central bank control to fight inflation?", "Interest rates and money supply", "Raising the policy rate makes borrowing costlier, cooling demand and inflation."],
          ["What is the minimum reserve requirement?", "The fraction of deposits banks must hold", "Banks must hold a fraction of deposits as reserves with the central bank to stay liquid."]
        ],
        trick: "SBP 1948; money=exchange/store/unit; repo=borrow, reverse repo=park; M1=currency+demand deposits.",
        tip: "SBP 1948 and the three functions of money are top GK-economics items."
      },
      {
        kind: "numeric", name: "simple interest calculations", difficulty: "easy",
        note: "Simple interest = principal × rate × time / 100.",
        q: (v) => `A bank deposits Rs ${v.P.toLocaleString()} in a savings account at ${v.r}% per annum simple interest. What is the interest earned in ${v.t} years?`,
        a: (v) => `Rs ${(v.P * v.r * v.t / 100).toLocaleString()}`,
        e: (v) => `Simple interest = P × r × t / 100 = ${v.P.toLocaleString()} × ${v.r} × ${v.t} / 100 = Rs ${(v.P * v.r * v.t / 100).toLocaleString()}, because only the original principal earns interest.`,
        distract: (v) => {
          const c = v.P * v.r * v.t / 100;
          return [`Rs ${Math.round(c * 2).toLocaleString()}`, `Rs ${Math.round(c + v.P).toLocaleString()}`, `Rs ${Math.round(c * 0.5).toLocaleString()}`, `Rs ${Math.round(v.P * v.r * v.t / 12).toLocaleString()}`, `Rs ${Math.round(c * 1.5).toLocaleString()}`];
        },
        vals: (rng) => {
          const P = (1000 + Math.floor(rng() * 90) * 1000);
          const r = [5, 6, 7, 8, 9, 10][Math.floor(rng() * 6)];
          const t = 1 + Math.floor(rng() * 4);
          return { P, r, t };
        },
        whyWrong: (v) => [`Simple interest uses only the principal, never compound; doubling or adding the principal are the traps.`],
        trick: "SI = PRT/100 — multiply principal, rate, time, divide by 100.",
        tip: "If time is in months, divide by 12 — the units trap."
      },
      {
        kind: "numeric", name: "percentage change calculations", difficulty: "medium",
        note: "Percentage change = (new − old) ÷ old × 100.",
        q: (v) => `Pakistan's exports rise from $${v.o} billion to $${v.n} billion. What is the percentage increase?`,
        a: (v) => `${(100 * (v.n - v.o) / v.o).toFixed(1)}%`,
        e: (v) => `Percentage change = (new − old) ÷ old × 100 = (${v.n} − ${v.o}) ÷ ${v.o} × 100 = ${(100 * (v.n - v.o) / v.o).toFixed(1)}%, because the change is measured relative to the starting value.`,
        distract: (v) => {
          const c = 100 * (v.n - v.o) / v.o;
          return [`${(100 * (v.n - v.o) / v.n).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${Math.abs(c - 100).toFixed(1)}%`];
        },
        vals: (rng) => {
          const o = 10 + Math.floor(rng() * 20);
          const n = o + 2 + Math.floor(rng() * 20);
          return { o, n };
        },
        whyWrong: (v) => [`Percentage change divides by the OLD value, not the new one; using the new value as the base is the classic error.`],
        trick: "Δ% = (new−old)/old × 100 — always divide by the original.",
        tip: "Read whether the question says 'increase' or 'decrease' before applying the sign."
      }
    ],

    "Pakistan's Economy": [
      {
        kind: "fact", name: "Pakistan economy facts",
        note: "Key structural facts about Pakistan's economy.",
        facts: [
          ["Which sector employs the largest share of Pakistan's labour force?", "Agriculture", "Agriculture employs the largest share of workers and is vital for exports like cotton and rice."],
          ["What is Pakistan's major export crop?", "Cotton and cotton textiles", "Cotton-based textiles dominate Pakistan's exports, feeding the textile industry."],
          ["Which province is the largest producer of wheat in Pakistan?", "Punjab", "Punjab's fertile plains produce most of Pakistan's wheat crop."],
          ["What is the main source of Pakistan's foreign remittances?", "Overseas Pakistani workers", "Remittances from overseas workers are a top source of foreign exchange for Pakistan."],
          ["What is the primary source of Pakistan's electricity?", "Thermal (fossil fuels)", "Thermal power from gas, oil and coal generates the largest share of Pakistan's electricity."],
          ["Which dam is Pakistan's largest by generation capacity?", "Tarbela Dam", "Tarbela Dam on the Indus is Pakistan's largest hydroelectric producer."],
          ["Which institution sets Pakistan's monetary policy rate?", "State Bank of Pakistan", "The SBP's Monetary Policy Committee sets the policy rate every two months."],
          ["What is the main agricultural export of Sindh?", "Rice and sugar cane products", "Sindh's Indus delta grows rice and sugar cane, key export earners."],
          ["Which is Pakistan's largest trading partner?", "China", "China is Pakistan's biggest trading partner, central to CPEC trade flows."],
          ["What is the KSE-100 index?", "The benchmark index of the Pakistan Stock Exchange", "The KSE-100 tracks the 100 largest companies on the Pakistan Stock Exchange."]
        ],
        trick: "Agriculture=top employer, cotton=top export, Punjab=wheat, Tarbela=largest dam, SBP=policy rate.",
        tip: "Agriculture, cotton and Tarbela are the three highest-yield Pakistan-economy facts."
      },
      {
        kind: "tf", name: "Pakistan economy statements",
        note: "True/false stems on Pakistan's economy.",
        statements: [
          ["Agriculture employs the largest share of Pakistan's labour force.", "Manufacturing employs the largest share of Pakistan's labour force."],
          ["Cotton textiles are Pakistan's main export.", "Software is Pakistan's main export."],
          ["Tarbela Dam is Pakistan's largest by capacity.", "Chashma Dam is Pakistan's largest by capacity."],
          ["The State Bank of Pakistan sets the policy rate.", "The Ministry of Finance sets the policy rate."],
          ["China is Pakistan's largest trading partner.", "Japan is Pakistan's largest trading partner."]
        ],
        trick: "Agriculture+employ, cotton+export, Tarbela+largest, SBP+rate, China+trade.",
        tip: "Each statement swaps one anchor term; match the correct pair."
      }
    ],

    "Economic Calculations": [
      {
        kind: "numeric", name: "compound interest calculations", difficulty: "hard",
        note: "Compound interest: A = P × (1 + r/100)ⁿ where n is the number of periods.",
        q: (v) => `Rs ${v.P.toLocaleString()} is invested at ${v.r}% per annum compounded annually for ${v.n} years. What is the total amount after ${v.n} years, to the nearest rupee?`,
        a: (v) => `Rs ${Math.round(v.P * Math.pow(1 + v.r / 100, v.n)).toLocaleString()}`,
        e: (v) => `Amount = P × (1 + r)ⁿ = ${v.P.toLocaleString()} × (1.${v.r})^${v.n} ≈ Rs ${Math.round(v.P * Math.pow(1 + v.r / 100, v.n)).toLocaleString()}, because interest is added to the principal each year and earns further interest.`,
        distract: (v) => {
          const c = Math.round(v.P * Math.pow(1 + v.r / 100, v.n));
          const si = v.P * v.r * v.n / 100 + v.P;
          return [`Rs ${Math.round(si).toLocaleString()}`, `Rs ${Math.round(c * 2).toLocaleString()}`, `Rs ${Math.round(c * 0.5).toLocaleString()}`, `Rs ${Math.round(c + v.P).toLocaleString()}`, `Rs ${Math.round(c * 1.2).toLocaleString()}`];
        },
        vals: (rng) => {
          const P = 50000 + Math.floor(rng() * 190) * 50000;
          const r = [5, 6, 7, 8, 9, 10][Math.floor(rng() * 6)];
          const n = 2 + Math.floor(rng() * 4);
          return { P, r, n };
        },
        whyWrong: (v) => [`Compound interest compounds each year: P × (1+r)ⁿ; the simple-interest amount is deliberately offered as a distractor.`],
        trick: "A = P(1+r)ⁿ — exponent is the number of compounding periods.",
        tip: "If the simple-interest figure appears, it is the trap."
      },
      {
        kind: "numeric", name: "GDP per capita calculations", difficulty: "easy",
        note: "GDP per capita = total GDP ÷ population.",
        q: (v) => `A country has a GDP of $${v.g.toLocaleString()} billion and a population of ${v.p} million. What is the GDP per capita in dollars?`,
        a: (v) => `$${Math.round(v.g * 1000 / v.p)}`,
        e: (v) => `GDP per capita = GDP ÷ population = $${v.g.toLocaleString()}b ÷ ${v.p}m = $${v.g * 1000 / v.p} ≈ $${Math.round(v.g * 1000 / v.p)}, because billions divided by millions scale to per-person income.`,
        distract: (v) => {
          const c = Math.round(v.g * 1000 / v.p);
          return [`$${Math.round(c * 10)}`, `$${Math.round(c * 0.1)}`, `$${Math.round(v.g * v.p)}`, `$${Math.round(c * 2)}`, `$${Math.round(c + 1000)}`];
        },
        vals: (rng) => {
          const g = 50 + Math.floor(rng() * 90);
          const p = 10 + Math.floor(rng() * 180);
          return { g, p };
        },
        whyWrong: (v) => [`Billions (10⁹) ÷ millions (10⁶) leaves a factor of 10³ — dropping it misstates per-capita income by 1000×.`],
        trick: "b ÷ m = ×1000 — billion divided by million.",
        tip: "Per-capita figures for Pakistan land near $1000-$2000."
      },
      {
        kind: "numeric", name: "exchange rate conversions", difficulty: "easy",
        note: "Foreign price × exchange rate gives the price in local currency.",
        q: (v) => `The exchange rate is Rs ${v.r} per US dollar. What is the cost in rupees of an item priced at $${v.d}?`,
        a: (v) => `Rs ${Math.round(v.d * v.r).toLocaleString()}`,
        e: (v) => `Rupee cost = dollars × rate = $${v.d} × Rs ${v.r} = Rs ${Math.round(v.d * v.r).toLocaleString()}, because each dollar converts at the stated rate.`,
        distract: (v) => {
          const c = Math.round(v.d * v.r);
          return [`Rs ${Math.round(v.d / v.r).toLocaleString()}`, `Rs ${Math.round(c * 1.05).toLocaleString()}`, `Rs ${Math.round(c * 0.95).toLocaleString()}`, `Rs ${Math.round(c + 500).toLocaleString()}`, `Rs ${Math.round(c * 2).toLocaleString()}`];
        },
        vals: (rng) => ({ r: 260 + Math.floor(rng() * 30), d: 10 + Math.floor(rng() * 190) }),
        whyWrong: (v) => [`Multiply dollars by the rate; dividing converts the other direction and is the standard trap.`],
        trick: "Multiply when converting dollars to rupees.",
        tip: "Ask: will the rupee number be bigger or smaller? That decides the operation."
      },
      {
        kind: "numeric", name: "market surplus and shortage", difficulty: "medium",
        note: "Surplus = quantity supplied − quantity demanded at a given price.",
        q: (v) => `At a price of Rs ${v.p} per unit, the quantity demanded is ${v.d} units and the quantity supplied is ${v.s} units. What is the market outcome?`,
        a: (v) => `${v.s > v.d ? "a surplus" : "a shortage"} of ${Math.abs(v.s - v.d)} units`,
        e: (v) => `Supply (${v.s}) is ${v.s > v.d ? "greater than" : "less than"} demand (${v.d}), so the market has ${v.s > v.d ? "a surplus" : "a shortage"} of ${Math.abs(v.s - v.d)} units, because surplus or shortage equals the absolute gap between the two quantities.`,
        distract: (v) => {
          const g = Math.abs(v.s - v.d);
          return [`equilibrium at ${v.d} units`, `${v.s > v.d ? "a shortage" : "a surplus"} of ${g} units`, `${v.s > v.d ? "a surplus" : "a shortage"} of ${g * 2} units`, `no change in price`, `${v.s > v.d ? "a surplus" : "a shortage"} of ${Math.round(g / 2)} units`];
        },
        vals: (rng) => {
          const s = 100 + Math.floor(rng() * 800);
          const d = s + (Math.floor(rng() * 400) - 200);
          return { p: 10 + Math.floor(rng() * 90), s, d: Math.max(10, d) };
        },
        whyWrong: (v) => [`Compare supply against demand: surplus when supply exceeds demand, shortage when demand exceeds supply, with the gap as the size.`],
        trick: "Surplus = supply − demand when positive; shortage = demand − supply.",
        tip: "Equilibrium options are traps unless the two quantities match."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
