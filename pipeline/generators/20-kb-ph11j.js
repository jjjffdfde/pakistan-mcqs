/* ============================================================
   Phase 11 — KB Business and Management:
   auditing, taxation, management, hrm, marketing, supply-chain,
   project-management, entrepreneurship, business-law.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");
const R = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

/* ---------------- AUDITING ---------------- */
const auditing = {
  subjects: ["auditing"],
  chapter: "Auditing (Phase 11)",
  tags: ["auditing", "deep-kb"],
  topics: {
    "Audit Process": [
      { kind: "fact", name: "auditing facts", facts: [
        ["What is an audit?", "An independent examination of financial records", "Audits provide assurance on the fairness of financial statements."],
        ["What is internal audit?", "Review by organisation's own staff", "Internal audit evaluates controls and compliance."],
        ["What is external audit?", "Review by an independent firm", "External auditors express an opinion on financial statements."],
        ["What is materiality?", "A threshold of significance for misstatements", "Materiality guides the scope of audit procedures."],
        ["What is audit evidence?", "Information used to form the audit opinion", "Evidence must be sufficient and appropriate."],
        ["What is an audit opinion?", "The auditor's conclusion on the statements", "The opinion states whether statements are fairly presented."],
        ["What is a going concern assumption?", "The entity will continue operating", "Auditors assess whether the business can continue."],
        ["What is sampling in auditing?", "Testing a subset of transactions", "Sampling extends audit procedures to populations."]
      ],
        trick: "internal=in-house, external=independent, materiality=threshold.",
        tip: "Audit types and opinions are tested in every auditing paper." },

      { kind: "numeric", name: "materiality threshold", difficulty: "easy",
        note: "Materiality = percentage of benchmark.",
        q: (v) => `Revenue is ${v.rev} million. Using ${v.pct}% materiality, what is the threshold?`,
        a: (v) => `${(v.rev * v.pct / 100).toFixed(2)} million`,
        e: (v) => `Threshold = ${v.rev} × ${v.pct}% = ${(v.rev * v.pct / 100).toFixed(2)} million.`,
        distract: (v) => { const c = v.rev * v.pct / 100; return [`${v.rev / v.pct} million`, `${c * 2} million`, `${v.rev + v.pct} million`, `${c / 2} million`, `${c + 1} million`]; },
        vals: (rng) => ({ rev: R(rng, 50, 500), pct: R(rng, 3, 10) }),
        whyWrong: (v) => [`Apply the percentage to the benchmark; dividing reverses the calculation.`],
        trick: "threshold = benchmark × rate%.",
        tip: "Materiality is always relative to the entity size." }
    ]
  }
};

/* ---------------- TAXATION ---------------- */
const taxation = {
  subjects: ["taxation"],
  chapter: "Taxation (Phase 11)",
  tags: ["taxation", "deep-kb"],
  topics: {
    "Income Tax Basics": [
      { kind: "fact", name: "tax facts", facts: [
        ["What is income tax?", "A levy on personal and corporate income", "Income tax is the government's primary revenue source."],
        ["What is a tax bracket?", "A range of income taxed at a rate", "Marginal tax rates apply to each bracket."],
        ["What is a tax deduction?", "An expense that reduces taxable income", "Deductions lower the amount subject to tax."],
        ["What is a tax credit?", "A direct reduction of tax payable", "Credits reduce tax owed, not taxable income."],
        ["What is withholding tax?", "Tax deducted at source by employer", "Withholding collects tax gradually throughout the year."],
        ["What is capital gains tax?", "Tax on profit from asset sale", "Capital gains arise when assets are sold above cost."],
        ["What is a tax return?", "A declaration of income and tax liability", "Tax returns report annual income and deductions."]
      ],
        trick: "deduction lowers income, credit lowers tax.",
        tip: "Deduction vs credit distinction is a bank favourite." },

      { kind: "numeric", name: "tax payable", difficulty: "easy",
        note: "Tax = taxable income × rate.",
        q: (v) => `A taxpayer has taxable income of ${v.inc} at a rate of ${v.rate}%. What is the tax payable?`,
        a: (v) => `${(v.inc * v.rate / 100).toLocaleString("en-US")}`,
        e: (v) => `Tax = ${v.inc} × ${v.rate}% = ${(v.inc * v.rate / 100).toLocaleString("en-US")}, applying the marginal rate.`,
        distract: (v) => { const c = v.inc * v.rate / 100; return [`${v.inc + v.rate}`, `${c * 2}`, `${v.inc / v.rate}`, `${c + 100}`, `${c - 50}`]; },
        vals: (rng) => ({ inc: R(rng, 100000, 1000000), rate: R(rng, 5, 35) }),
        whyWrong: (v) => [`Multiply income by the rate; adding or subtracting unrelated values is wrong.`],
        trick: "tax = income × rate.",
        tip: "Always check if the rate is marginal or average." }
    ]
  }
};

/* ---------------- MANAGEMENT ---------------- */
const management = {
  subjects: ["management"],
  chapter: "Management (Phase 11)",
  tags: ["management", "deep-kb"],
  topics: {
    "Functions and Theory": [
      { kind: "fact", name: "management facts", facts: [
        ["What are the four functions of management?", "Planning, organising, leading, controlling", "POLC is the classic management framework."],
        ["What is planning?", "Setting goals and deciding how to achieve them", "Planning defines the direction and allocates resources."],
        ["What is organising?", "Arranging resources to implement plans", "Organising creates structure and assigns responsibilities."],
        ["What is leading?", "Motivating and directing people", "Leadership inspires teams to achieve objectives."],
        ["What is controlling?", "Monitoring performance and making corrections", "Controlling ensures plans are followed."],
        ["What is a span of control?", "Number of subordinates a manager supervises", "Span of control determines organisational layers."],
        ["What is centralisation?", "Decision-making concentrated at top", "Centralisation keeps authority at the centre."],
        ["What is decentralisation?", "Decision-making distributed to lower levels", "Decentralisation empowers middle and lower management."]
      ],
        trick: "plan=set, org=arrange, lead=inspire, control=check.",
        tip: "POLC functions are the backbone of management exams." },

      { kind: "numeric", name: "span of control ratio", difficulty: "easy",
        note: "Reports ratio = managers × span.",
        q: (v) => `${v.m} managers each directly supervise ${v.s} employees. What is the total supervised headcount?`,
        a: (v) => `${v.m * v.s}`,
        e: (v) => `Headcount = ${v.m} × ${v.s} = ${v.m * v.s}, multiplying managers by their span of control.`,
        distract: (v) => { const c = v.m * v.s; return [`${v.m + v.s}`, `${c / 2}`, `${c * 2}`, `${Math.abs(v.m - v.s)}`, `${c + 5}`]; },
        vals: (rng) => ({ m: R(rng, 1, 20), s: R(rng, 3, 40) }),
        whyWrong: (v) => [`Multiply managers by span width; adding the figures gives a size, not headcount.`],
        trick: "headcount = managers × span.",
        tip: "Wider spans mean fewer managerial layers." }
    ]
  }
};

/* ---------------- HRM ---------------- */
const hrm = {
  subjects: ["hrm"],
  chapter: "Human Resource Management (Phase 11)",
  tags: ["hrm", "deep-kb"],
  topics: {
    "HR Functions": [
      { kind: "fact", name: "HRM facts", facts: [
        ["What is HRM?", "Managing people in organisations", "HRM covers recruitment, training and retention."],
        ["What is job analysis?", "Studying duties and requirements of a role", "Job analysis produces job descriptions and specifications."],
        ["What is recruitment?", "Attracting candidates for a vacancy", "Recruitment builds the pool of applicants."],
        ["What is selection?", "Choosing the best candidate", "Selection uses interviews, tests and references."],
        ["What is training?", "Developing employee skills", "Training improves current job performance."],
        ["What is performance appraisal?", "Evaluating employee work", "Appraisals measure achievement against goals."],
        ["What is compensation?", "Pay and benefits for work", "Compensation includes salary, bonuses and perks."],
        ["What is employee engagement?", "Emotional commitment to the organisation", "Engaged employees show higher productivity and loyalty."]
      ],
        trick: "recruit=attract, select=choose, train=develop.",
        tip: "HRM functions follow the employee lifecycle order." },

      { kind: "numeric", name: "turnover rate", difficulty: "easy",
        note: "Turnover % = departures ÷ average headcount × 100.",
        q: (v) => `A firm with ${v.hc} average employees saw ${v.dep} departures. What is the annual turnover rate?`,
        a: (v) => `${(v.dep / v.hc * 100).toFixed(1)}%`,
        e: (v) => `Turnover = ${v.dep} ÷ ${v.hc} × 100 = ${(v.dep / v.hc * 100).toFixed(1)}%, dividing departures by the workforce.`,
        distract: (v) => { const c = v.dep / v.hc * 100; return [`${(v.hc / v.dep * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c / 2).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(v.dep).toFixed(1)}%`]; },
        vals: (rng) => ({ hc: R(rng, 50, 5000), dep: R(rng, 2, 500) }),
        whyWrong: (v) => [`Divide departures by headcount and scale to 100; the reverse fraction inverts the rate.`],
        trick: "turnover = exits / staff × 100.",
        tip: "High turnover signals retention problems." }
    ]
  }
};

/* ---------------- MARKETING ---------------- */
const marketing = {
  subjects: ["marketing"],
  chapter: "Marketing (Phase 11)",
  tags: ["marketing", "deep-kb"],
  topics: {
    "Marketing Mix": [
      { kind: "fact", name: "marketing facts", facts: [
        ["What is the marketing mix?", "Product, Price, Place, Promotion", "The 4Ps are the foundation of marketing strategy."],
        ["What is market segmentation?", "Dividing a market into groups", "Segmentation targets specific customer groups."],
        ["What is brand equity?", "The value of a brand name", "Strong brands command premium prices."],
        ["What is a SWOT analysis?", "Strengths, Weaknesses, Opportunities, Threats", "SWOT assesses internal and external factors."],
        ["What is a target market?", "A specific group of potential buyers", "Target markets guide marketing messages."],
        ["What is digital marketing?", "Marketing through digital channels", "Digital marketing includes social media, email and SEO."],
        ["What is customer relationship management?", "Managing interactions with customers", "CRM systems track customer data and history."],
        ["What is a value proposition?", "The benefit a product offers", "Value propositions differentiate from competitors."]
      ],
        trick: "4Ps=product, price, place, promotion.",
        tip: "Marketing mix and SWOT are tested in every business paper." },

      { kind: "numeric", name: "market share", difficulty: "easy",
        note: "Share = sales ÷ total market × 100.",
        q: (v) => `Company sold ${v.sales} units in a market of ${v.total}. What is the market share percentage?`,
        a: (v) => `${(v.sales / v.total * 100).toFixed(1)}%`,
        e: (v) => `Share = ${v.sales} ÷ ${v.total} × 100 = ${(v.sales / v.total * 100).toFixed(1)}%.`,
        distract: (v) => { const c = v.sales / v.total * 100; return [`${(v.total / v.sales * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c / 2).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(c - 5).toFixed(1)}%`]; },
        vals: (rng) => ({ sales: R(rng, 500, 5000), total: R(rng, 10000, 50000) }),
        whyWrong: (v) => [`Divide your sales by the total market; reversing the fraction is the competitor's share.`],
        trick: "share = your sales / total.",
        tip: "Market share is a relative measure, not absolute." }
    ]
  }
};

/* ---------------- SUPPLY CHAIN ---------------- */
const supplyChain = {
  subjects: ["supply-chain"],
  chapter: "Supply Chain Management (Phase 11)",
  tags: ["supply-chain", "deep-kb"],
  topics: {
    "Logistics and Operations": [
      { kind: "fact", name: "supply chain facts", facts: [
        ["What is supply chain management?", "Coordinating goods from source to customer", "SCM optimises flow and reduces cost."],
        ["What is inventory?", "Stock held for future use", "Inventory buffers demand uncertainty."],
        ["What is just-in-time?", "Receiving goods only when needed", "JIT minimises holding costs."],
        ["What is the bullwhip effect?", "Demand distortion amplifying upstream", "Small demand changes cause large order swings."],
        ["What is procurement?", "Acquiring goods and services", "Procurement selects suppliers and negotiates contracts."],
        ["What is logistics?", "Planning and executing transport", "Logistics moves goods efficiently."],
        ["What is a warehouse?", "A storage facility for goods", "Warehouses hold inventory before distribution."],
        ["What is last-mile delivery?", "Final step to the customer", "Last mile is the most expensive segment."]
      ],
        trick: "JIT=just in time, bullwhip=amplified demand.",
        tip: "SCM concepts link procurement through delivery." },

      { kind: "numeric", name: "inventory turns", difficulty: "easy",
        note: "Turns = COGS ÷ average inventory.",
        q: (v) => `COGS is ${v.cogs} and average inventory is ${v.inv}. What is the inventory turnover ratio?`,
        a: (v) => `${(v.cogs / v.inv).toFixed(1)}`,
        e: (v) => `Turns = ${v.cogs} ÷ ${v.inv} = ${(v.cogs / v.inv).toFixed(1)}, dividing cost of goods sold by average stock.`,
        distract: (v) => { const c = v.cogs / v.inv; return [`${(v.inv / v.cogs).toFixed(1)}`, `${(c * 2).toFixed(1)}`, `${(c / 2).toFixed(1)}`, `${(v.cogs - v.inv).toFixed(1)}`, `${(c + 3).toFixed(1)}`]; },
        vals: (rng) => ({ cogs: R(rng, 50000, 900000), inv: R(rng, 5000, 90000) }),
        whyWrong: (v) => [`Divide COGS by inventory; inverting measures stock per unit sold.`],
        trick: "turns = COGS / inventory.",
        tip: "Higher turns mean leaner, faster-moving stock." }
    ]
  }
};

/* ---------------- PROJECT MANAGEMENT ---------------- */
const projectMgmt = {
  subjects: ["project-management"],
  chapter: "Project Management (Phase 11)",
  tags: ["project-management", "deep-kb"],
  topics: {
    "PM Framework": [
      { kind: "fact", name: "PM facts", facts: [
        ["What is a project?", "A temporary endeavour to create a unique product", "Projects have start, end and specific objectives."],
        ["What is the project lifecycle?", "Phases from initiation to closure", "Lifecycle stages organise project work."],
        ["What is scope?", "The work required to deliver the project", "Scope defines what is included and excluded."],
        ["What is a Gantt chart?", "A bar chart showing task timelines", "Gantt charts visualise schedule and dependencies."],
        ["What is a critical path?", "The longest sequence of dependent tasks", "Critical path determines minimum project duration."],
        ["What is risk management?", "Identifying and mitigating project risks", "Risk management reduces uncertainty impact."],
        ["What is a milestone?", "A significant point in the project", "Milestones mark completion of key deliverables."],
        ["What is earned value management?", "Measuring project performance", "EVM compares planned vs actual progress."]
      ],
        trick: "scope=what, schedule=when, cost=how much.",
        tip: "PM triangle: scope, time, cost — trade-offs are key." },

      { kind: "numeric", name: "task completion ratio", difficulty: "easy",
        note: "Percent complete = done ÷ total.",
        q: (v) => `A project has ${v.done} of ${v.total} tasks finished. What is the completion percentage?`,
        a: (v) => `${(v.done / v.total * 100).toFixed(1)}%`,
        e: (v) => `Completion = ${v.done} ÷ ${v.total} × 100 = ${(v.done / v.total * 100).toFixed(1)}%, dividing finished tasks by the total.`,
        distract: (v) => { const c = v.done / v.total * 100; return [`${(v.total / v.done * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c / 2).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(v.done * 10).toFixed(1)}%`]; },
        vals: (rng) => ({ done: R(rng, 1, 90), total: R(rng, 10, 100) }),
        whyWrong: (v) => [`Divide completed by total tasks; reversing the fraction overstates or understates progress.`],
        trick: "% = done / total × 100.",
        tip: "Track progress against baseline scope." }
    ]
  }
};

/* ---------------- ENTREPRENEURSHIP ---------------- */
const entrepreneurship = {
  subjects: ["entrepreneurship"],
  chapter: "Entrepreneurship (Phase 11)",
  tags: ["entrepreneurship", "deep-kb"],
  topics: {
    "Start-Up Concepts": [
      { kind: "fact", name: "entrepreneurship facts", facts: [
        ["What is entrepreneurship?", "Creating and running a new business venture", "Entrepreneurs take financial risks for profit."],
        ["What is a business plan?", "A written document describing the business", "Business plans secure funding and guide operations."],
        ["What is bootstrapping?", "Funding a business from personal savings", "Bootstrapping avoids external debt or equity."],
        ["What is a start-up?", "A newly established business seeking rapid growth", "Start-ups often seek venture capital funding."],
        ["What is MVP?", "Minimum Viable Product with core features", "MVP tests market demand with minimal investment."],
        ["What is a pivot?", "A fundamental change in business strategy", "Pivots respond to market feedback."],
        ["What is venture capital?", "Funding for high-growth start-ups", "VC investors take equity in exchange for capital."],
        ["What is an angel investor?", "An individual investing personal funds", "Angels provide early-stage funding and mentorship."]
      ],
        trick: "bootstrapping=self-fund, MVP=min version, pivot=change.",
        tip: "Startup terminology is frequently tested in business exams." },

      { kind: "numeric", name: "valuation multiple", difficulty: "easy",
        note: "Valuation = revenue × multiple.",
        q: (v) => `A start-up earns ${v.rev} thousand units with a ${v.mul}x annual multiple. What is its implied valuation in thousand units?`,
        a: (v) => `${v.rev * v.mul} thousand units`,
        e: (v) => `Valuation = ${v.rev} × ${v.mul} = ${v.rev * v.mul} thousand units, applying the revenue multiple.`,
        distract: (v) => { const c = v.rev * v.mul; return [`${v.rev + v.mul} thousand units`, `${c * 1.5} thousand units`, `${Math.round(c / 2)} thousand units`, `${v.rev} thousand units`, `${c + 10} thousand units`]; },
        vals: (rng) => ({ rev: R(rng, 50, 900), mul: R(rng, 2, 12) }),
        whyWrong: (v) => [`Multiply revenue by the valuation multiple; adding or halving misapplies the multiple.`],
        trick: "valuation = revenue × multiple.",
        tip: "Revenue multiples vary wildly by sector and stage." }
    ]
  }
};

/* ---------------- BUSINESS LAW ---------------- */
const businessLaw = {
  subjects: ["business-law"],
  chapter: "Business Law (Phase 11)",
  tags: ["business-law", "deep-kb"],
  topics: {
    "Contract and Liability": [
      { kind: "fact", name: "business law facts", facts: [
        ["What is a contract?", "A legally enforceable agreement", "Contracts require offer, acceptance and consideration."],
        ["What is consideration?", "Something of value exchanged", "Consideration distinguishes contracts from gifts."],
        ["What is breach of contract?", "Failure to perform contractual obligations", "Breach gives the innocent party the right to remedies."],
        ["What is a tort?", "A civil wrong causing harm", "Torts include negligence, nuisance and defamation."],
        ["What is negligence?", "Failing to exercise reasonable care", "Negligence requires duty, breach, causation and damage."],
        ["What is limited liability?", "Shareholders' liability limited to investment", "Limited liability protects personal assets."],
        ["What is intellectual property?", "Creations of the mind protected by law", "IP includes patents, trademarks and copyrights."],
        ["What is a warranty?", "A promise about the quality of goods", "Warranties create legal obligations on the seller."]
      ],
        trick: "offer+acceptance+consideration=contract.",
        tip: "Contract formation elements are exam cornerstones." },

      { kind: "numeric", name: "liquidated damages", difficulty: "easy",
        note: "Damages = daily rate × days late.",
        q: (v) => `A contract charges ${v.rate} per day late for ${v.days} days. What is the total liquidated damages?`,
        a: (v) => `${v.rate * v.days}`,
        e: (v) => `Damages = ${v.rate} × ${v.days} = ${v.rate * v.days}, multiplying the daily rate by days late.`,
        distract: (v) => { const c = v.rate * v.days; return [`${v.rate + v.days}`, `${c * 2}`, `${Math.round(c / 2)}`, `${v.days}`, `${c + v.rate}`]; },
        vals: (rng) => ({ rate: R(rng, 100, 5000), days: R(rng, 1, 60) }),
        whyWrong: (v) => [`Multiply daily rate by days late; adding the two numbers is meaningless damages.`],
        trick: "damages = rate × days.",
        tip: "Liquidated damages must be a reasonable pre-estimate." }
    ]
  }
};

module.exports = [
  makeKbGen(auditing), makeKbGen(taxation), makeKbGen(management), makeKbGen(hrm),
  makeKbGen(marketing), makeKbGen(supplyChain), makeKbGen(projectMgmt),
  makeKbGen(entrepreneurship), makeKbGen(businessLaw)
];
