/* ============================================================
   Deep Knowledge KB — Accounting
   Statements, ratios, depreciation + numeric ratio problems.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["accounting"],
  chapter: "Accounting — Deep Knowledge Bank",
  tags: ["accounting", "deep-kb", "ratios", "financial-statements", "depreciation"],
  topics: {

    "Accounting Basics": [
      {
        kind: "fact", name: "accounting fundamentals",
        note: "Foundational definitions and the accounting equation.",
        facts: [
          ["What is the accounting equation?", "Assets = Liabilities + Equity", "Assets are financed by liabilities and owner's equity, the fundamental balance-sheet identity."],
          ["What is double-entry bookkeeping?", "Every transaction is recorded twice, in debit and credit", "Each transaction has equal debits and credits, keeping the books in balance."],
          ["What does GAAP stand for?", "Generally Accepted Accounting Principles", "GAAP is the common set of accounting rules and standards used for financial reporting."],
          ["What are the three main financial statements?", "Income statement, balance sheet, cash flow statement", "The income statement shows profit, the balance sheet shows position, and cash flow shows liquidity."],
          ["What is the income statement also called?", "The profit and loss account", "The income statement summarises revenues and expenses to show profit or loss."],
          ["What does the balance sheet show?", "Assets, liabilities and equity at a point in time", "The balance sheet is a snapshot of the financial position on a specific date."],
          ["What is depreciation?", "Allocating the cost of an asset over its useful life", "Depreciation spreads an asset's cost over its useful life, matching expense to revenue."],
          ["What is revenue minus cost of goods sold?", "Gross profit", "Gross profit = revenue − COGS, before operating expenses are deducted."],
          ["What is an asset?", "A resource owned that has economic value", "Assets are resources controlled by the business that will produce future benefits."],
          ["What is a liability?", "An obligation the business owes", "Liabilities are amounts owed to outsiders, such as loans and payables."]
        ],
        trick: "A = L + E; double-entry = equal debits and credits; gross = revenue − COGS.",
        tip: "The accounting equation is the single most asked item."
      },
      {
        kind: "tf", name: "accounting statements",
        note: "True/false stems on fundamentals.",
        statements: [
          ["Assets equal liabilities plus equity.", "Assets equal revenue minus expenses."],
          ["Depreciation spreads an asset's cost over its life.", "Depreciation records cash paid for an asset."],
          ["Gross profit is revenue minus cost of goods sold.", "Gross profit is revenue minus all expenses."],
          ["The balance sheet is a snapshot at a point in time.", "The balance sheet covers a whole year's activity."],
          ["Every transaction has equal debits and credits.", "Debits must always exceed credits."]
        ],
        trick: "A=L+E, gross=rev−COGS, balance sheet=snapshot, double-entry=equal.",
        tip: "Statement swaps are the classic trap in accounting."
      }
    ],

    "Financial Statements": [
      {
        kind: "fact", name: "statement facts",
        note: "How the statements are built and connected.",
        facts: [
          ["Which statement reports profit or loss over a period?", "The income statement", "The income statement matches revenues against expenses for a period to compute profit."],
          ["Which statement reports cash inflows and outflows?", "The cash flow statement", "The cash flow statement classifies cash into operating, investing and financing activities."],
          ["What is the order of the income statement?", "Revenue − COGS = gross profit − expenses = net profit", "Net profit flows from revenue down through gross profit and expenses."],
          ["What is net profit?", "Gross profit minus operating expenses and taxes", "Net profit is the final profit after all expenses, taxes and interest."],
          ["What are current assets?", "Assets convertible to cash within one year", "Cash, receivables and inventory are current assets, convertible within a year."],
          ["What are non-current assets?", "Long-term assets used for more than a year", "Buildings, machinery and vehicles are used for years, unlike current assets."],
          ["What is working capital?", "Current assets minus current liabilities", "Working capital measures the short-term liquidity of the business."],
          ["What is the cost of goods sold?", "The direct cost of producing goods sold", "COGS includes materials and direct labour of the goods actually sold."],
          ["Where does net profit from the income statement go?", "To retained earnings on the balance sheet", "Net profit increases retained earnings, connecting the two statements."],
          ["What is a trial balance?", "A listing of all ledger balances to test equality", "The trial balance lists debit and credit balances to verify they total equally."]
        ],
        trick: "Income=period profit, cash flow=cash classes, working capital = CA − CL, profit→retained earnings.",
        tip: "The income statement → balance sheet link is a favourite question."
      },
      {
        kind: "numeric", name: "gross and net profit calculations", difficulty: "easy",
        note: "Gross profit = revenue − COGS; net profit = gross profit − expenses.",
        q: (v) => `A firm has revenue of Rs ${v.r.toLocaleString()}, cost of goods sold of Rs ${v.c.toLocaleString()} and operating expenses of Rs ${v.e.toLocaleString()}. What is its net profit?`,
        a: (v) => `Rs ${(v.r - v.c - v.e).toLocaleString()}`,
        e: (v) => `Gross profit = ${v.r.toLocaleString()} − ${v.c.toLocaleString()} = ${(v.r - v.c).toLocaleString()}. Net profit = ${(v.r - v.c).toLocaleString()} − ${v.e.toLocaleString()} = Rs ${(v.r - v.c - v.e).toLocaleString()}, because expenses are deducted after gross profit.`,
        distract: (v) => {
          const c = v.r - v.c - v.e;
          return [`Rs ${(v.r - v.c).toLocaleString()}`, `Rs ${(c + v.e).toLocaleString()}`, `Rs ${Math.round(c * 1.2).toLocaleString()}`, `Rs ${(v.r - v.e).toLocaleString()}`, `Rs ${(c - v.c).toLocaleString()}`];
        },
        vals: (rng) => {
          const r = 500000 + Math.floor(rng() * 90) * 100000;
          const c = Math.round(r * (0.4 + rng() * 0.3));
          const e = Math.round(r * (0.1 + rng() * 0.2));
          return { r, c, e };
        },
        whyWrong: (v) => [`Net profit = revenue − COGS − expenses; stopping at gross profit or mixing in COGS again are the traps.`],
        trick: "Revenue − COGS − expenses, in that order.",
        tip: "Subtract COGS first (gross), then expenses (net)."
      },
      {
        kind: "numeric", name: "current ratio calculations", difficulty: "easy",
        note: "Current ratio = current assets ÷ current liabilities.",
        q: (v) => `A firm has current assets of Rs ${v.ca.toLocaleString()} and current liabilities of Rs ${v.cl.toLocaleString()}. What is its current ratio?`,
        a: (v) => `${(v.ca / v.cl).toFixed(2)} : 1`,
        e: (v) => `Current ratio = ${v.ca.toLocaleString()} ÷ ${v.cl.toLocaleString()} = ${(v.ca / v.cl).toFixed(2)} : 1, because liquidity compares assets due within a year against liabilities due within a year.`,
        distract: (v) => {
          const c = v.ca / v.cl;
          return [`${(c * 2).toFixed(2)} : 1`, `${(v.cl / v.ca).toFixed(2)} : 1`, `${(c * 0.5).toFixed(2)} : 1`, `${(c + 0.5).toFixed(2)} : 1`, `${(c * 1.5).toFixed(2)} : 1`];
        },
        vals: (rng) => {
          const cl = 100000 + Math.floor(rng() * 90) * 100000;
          const ca = Math.round(cl * (0.8 + rng() * 1.7));
          return { ca, cl };
        },
        whyWrong: (v) => [`Current ratio divides assets by liabilities; inverting it or doubling the result are the standard errors.`],
        trick: "Current ratio = CA ÷ CL.",
        tip: "A healthy current ratio is 2:1 or close to it."
      },
      {
        kind: "numeric", name: "break-even calculations", difficulty: "hard",
        note: "Break-even units = fixed costs ÷ contribution per unit.",
        q: (v) => `A product sells for Rs ${v.p} per unit, with variable costs of Rs ${v.v} per unit and total fixed costs of Rs ${v.f.toLocaleString()}. How many units must be sold to break even?`,
        a: (v) => `${Math.ceil(v.f / (v.p - v.v)).toLocaleString()} units`,
        e: (v) => `Contribution per unit = ${v.p} − ${v.v} = Rs ${v.p - v.v}. Break-even = fixed costs ÷ contribution = ${v.f.toLocaleString()} ÷ ${v.p - v.v} = ${Math.ceil(v.f / (v.p - v.v)).toLocaleString()} units, because each unit contributes the price less variable cost.`,
        distract: (v) => {
          const c = Math.ceil(v.f / (v.p - v.v));
          return [`${Math.ceil(v.f / v.p).toLocaleString()} units`, `${Math.ceil(c * 2).toLocaleString()} units`, `${Math.ceil(c * 0.5).toLocaleString()} units`, `${Math.ceil(v.f / (v.p * 2 - v.v)).toLocaleString()} units`, `${(c + 500).toLocaleString()} units`];
        },
        vals: (rng) => {
          const v = 10 + Math.floor(rng() * 20);
          const p = v + 5 + Math.floor(rng() * 25);
          const f = (50000 + Math.floor(rng() * 90) * 50000);
          return { p, v, f };
        },
        whyWrong: (v) => [`Contribution is price MINUS variable cost; dividing by price alone ignores variable costs and overstates units.`],
        trick: "Break-even = fixed ÷ (price − variable cost).",
        tip: "Contribution per unit is the heart of break-even problems."
      },
      {
        kind: "numeric", name: "straight-line depreciation", difficulty: "easy",
        note: "Annual depreciation = (cost − salvage) ÷ useful life.",
        q: (v) => `A machine costs Rs ${v.c.toLocaleString()}, has a salvage value of Rs ${v.s.toLocaleString()} and a useful life of ${v.n} years. What is the annual straight-line depreciation?`,
        a: (v) => `Rs ${((v.c - v.s) / v.n).toLocaleString()}`,
        e: (v) => `Depreciation = (cost − salvage) ÷ life = (${v.c.toLocaleString()} − ${v.s.toLocaleString()}) ÷ ${v.n} = Rs ${((v.c - v.s) / v.n).toLocaleString()}, because straight-line spreads the depreciable amount evenly over the life.`,
        distract: (v) => {
          const c = (v.c - v.s) / v.n;
          return [`Rs ${Math.round(c * 2).toLocaleString()}`, `Rs ${(v.c / v.n).toLocaleString()}`, `Rs ${Math.round(c * 0.5).toLocaleString()}`, `Rs ${(c + v.s).toLocaleString()}`, `Rs ${Math.round(c * 1.2).toLocaleString()}`];
        },
        vals: (rng) => {
          const c = 1000000 + Math.floor(rng() * 90) * 100000;
          const s = Math.round(c * (0.05 + rng() * 0.15));
          const n = 5 + Math.floor(rng() * 6);
          return { c, s, n };
        },
        whyWrong: (v) => [`Subtract the salvage value before dividing by the life; depreciating the full cost overstates annual depreciation.`],
        trick: "(Cost − salvage) ÷ years.",
        tip: "Salvage value is never depreciated."
      },
      {
        kind: "numeric", name: "inventory turnover calculations", difficulty: "medium",
        note: "Inventory turnover = COGS ÷ average inventory.",
        q: (v) => `A firm's cost of goods sold is Rs ${v.cogs.toLocaleString()} and average inventory is Rs ${v.inv.toLocaleString()}. What is the inventory turnover?`,
        a: (v) => `${(v.cogs / v.inv).toFixed(1)} times`,
        e: (v) => `Turnover = COGS ÷ average inventory = ${v.cogs.toLocaleString()} ÷ ${v.inv.toLocaleString()} = ${(v.cogs / v.inv).toFixed(1)} times, because turnover counts how often inventory is sold and replaced in a period.`,
        distract: (v) => {
          const c = v.cogs / v.inv;
          return [`${(v.inv / v.cogs).toFixed(1)} times`, `${(c * 2).toFixed(1)} times`, `${(c * 0.5).toFixed(1)} times`, `${(c + 2).toFixed(1)} times`, `${(c * 1.5).toFixed(1)} times`];
        },
        vals: (rng) => {
          const inv = 100000 + Math.floor(rng() * 90) * 100000;
          const cogs = Math.round(inv * (2 + rng() * 10));
          return { cogs, inv };
        },
        whyWrong: (v) => [`Turnover = COGS ÷ inventory; using inventory ÷ COGS or doubling the ratio are the classic errors.`],
        trick: "Turnover = COGS ÷ average inventory.",
        tip: "Higher turnover means faster-moving stock."
      }
    ],

    "Accounting Principles": [
      {
        kind: "fact", name: "principle facts",
        note: "The core accounting principles and concepts.",
        facts: [
          ["What is the matching principle?", "Match revenues with the expenses that earned them", "Expenses are recorded in the same period as the revenue they helped generate."],
          ["What is the accrual concept?", "Record transactions when they occur, not when cash moves", "Accrual accounting recognises revenue when earned and expenses when incurred."],
          ["What is the going concern concept?", "Assume the business will continue indefinitely", "Going concern lets assets be valued at cost because the business is not being liquidated."],
          ["What is the consistency principle?", "Use the same accounting methods period to period", "Consistency lets financial statements be compared across years."],
          ["What is the prudence (conservatism) concept?", "Do not overstate assets or income", "Prudence recognises losses early but profits only when realised."],
          ["What is materiality?", "Only significant items affect decisions", "Immaterial items can be treated simply because they do not change decisions."],
          ["What is the money measurement concept?", "Only items with monetary value are recorded", "Non-monetary matters like staff morale are excluded from the accounts."],
          ["What is the business entity concept?", "The business is separate from its owners", "Entity accounts record only the business's transactions, not the owner's personal ones."],
          ["What is the historical cost concept?", "Record assets at their original purchase cost", "Historical cost keeps values objective, though it ignores current market prices."],
          ["What is the dual aspect concept?", "Every transaction has two equal sides", "The dual aspect is the basis of double-entry and the accounting equation."]
        ],
        trick: "Match=expense timing, accrual=when earned, going concern=continues, entity=separate, money measurement=monetary only.",
        tip: "Matching vs accrual and entity vs going concern are the most mixed-up pairs."
      },
      {
        kind: "tf", name: "principle statements",
        note: "True/false stems on principles.",
        statements: [
          ["The matching principle links expenses to the revenue they earn.", "The matching principle records all expenses in cash terms."],
          ["Accrual accounting records revenue when earned.", "Accrual accounting records revenue only when cash arrives."],
          ["The business entity concept separates the firm from its owners.", "The entity concept merges owner and business funds."],
          ["Prudence avoids overstating assets and income.", "Prudence always maximises reported profits."],
          ["Going concern assumes the business will continue.", "Going concern assumes the business will be liquidated next year."]
        ],
        trick: "Matching=timing, accrual=earned, entity=separate, prudence=cautious, going concern=continues.",
        tip: "Concept-swap statements are the favourite trap."
      },
      {
        kind: "numeric", name: "return on equity calculations", difficulty: "medium",
        note: "ROE = net income ÷ shareholder equity × 100.",
        q: (v) => `A firm earns net income of Rs ${v.ni.toLocaleString()} on shareholder equity of Rs ${v.eq.toLocaleString()}. What is its return on equity?`,
        a: (v) => `${(v.ni / v.eq * 100).toFixed(1)}%`,
        e: (v) => `ROE = net income ÷ equity × 100 = ${v.ni.toLocaleString()} ÷ ${v.eq.toLocaleString()} × 100 = ${(v.ni / v.eq * 100).toFixed(1)}%, because ROE measures the profit earned on owners' money.`,
        distract: (v) => {
          const c = v.ni / v.eq * 100;
          return [`${(v.eq / v.ni * 100).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(c + 5).toFixed(1)}%`, `${(c * 10).toFixed(1)}%`];
        },
        vals: (rng) => {
          const eq = 500000 + Math.floor(rng() * 90) * 100000;
          const ni = Math.round(eq * (0.05 + rng() * 0.25));
          return { ni, eq };
        },
        whyWrong: (v) => [`ROE divides income by equity; inverting the fraction or dropping the ×100 misstates the percentage.`],
        trick: "ROE = net income ÷ equity × 100.",
        tip: "ROE above 15% is generally considered strong."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
