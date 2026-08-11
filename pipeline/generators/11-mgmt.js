/* ============================================================
   Generator file 11 — Management Sciences (economics, accounting,
   finance, commerce, HRM, marketing, business, supply chain, auditing)
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
  makeGen("economics", "Economics — Principles", {
    "Micro and Macro": [
      ["What is economics?", "the study of scarcity and choice", "Economics analyses how people allocate limited resources."],
      ["What is supply?", "the quantity sellers offer", "Supply rises with price, other things equal."],
      ["What is demand?", "the quantity buyers want", "Demand falls as price rises, other things equal."],
      ["What is a market?", "a place where buyers and sellers meet", "Markets set prices through exchange."],
      ["What is GDP?", "the value of goods and services produced", "GDP measures national output in a period."],
      ["What is inflation?", "a general rise in prices", "Inflation erodes the purchasing power of money."],
      ["What is unemployment?", "people without work seeking it", "Unemployment measures idle labour resources."],
      ["What is a monopoly?", "a single seller in a market", "Monopolies face no direct competition."],
      ["What is competition?", "rivalry among sellers", "Competition lowers prices and improves quality."],
      ["What is a budget?", "a plan of income and spending", "Budgets allocate limited resources."],
      ["What is a tax?", "a compulsory payment to government", "Taxes fund public services."],
      ["What is monetary policy?", "managing money and interest rates", "Central banks use it to control inflation."],
      ["What is fiscal policy?", "government spending and taxation", "Fiscal policy stabilises the economy."],
      ["What is an exchange rate?", "the price of one currency in another", "Rates affect trade and remittances."],
      ["What is a recession?", "a period of falling output", "Recessions bring rising unemployment."]
    ],
    "Pakistan Economy": [
      ["Which bank is the central bank of Pakistan?", "State Bank of Pakistan", "The SBP regulates money and credit."],
      ["What is the main agricultural crop of Pakistan?", "Wheat", "Wheat is the staple food crop."],
      ["Which crop is the main export of Pakistan?", "Rice", "Basmati rice is a leading export."],
      ["What is the Lahore Stock Exchange merged into?", "Pakistan Stock Exchange", "PSX formed in 2016 from three bourses."],
      ["What is the main source of government revenue?", "Taxes", "Taxes fund federal and provincial budgets."],
      ["What is the Pakistan rupee's basic unit?", "Paisa", "One rupee equals 100 paise."],
      ["What is CPEC mainly about?", "connectivity and investment", "CPEC links China with Gwadar port."],
      ["What are remittances?", "money sent by overseas workers", "Remittances are a major forex source."],
      ["What is the agricultural sector's share of employment?", "roughly a third of the workforce", "Agriculture employs a large share of Pakistanis."],
      ["What is the textile sector?", "Pakistan's largest industry", "Textiles dominate exports."],
      ["What is an SME?", "a small and medium enterprise", "SMEs drive employment in Pakistan."],
      ["What is the informal economy?", "unregistered economic activity", "Informal activity escapes taxation and records."]
    ]
  }),
  makeGen("accounting", "Accounting — Principles", {
    "Basics": [
      ["What is accounting?", "recording and reporting financial transactions", "Accounting summarises business finances."],
      ["What is a balance sheet?", "a statement of assets, liabilities and equity", "Balance sheets show financial position at a date."],
      ["What is an asset?", "a resource owned by a business", "Assets include cash, inventory and property."],
      ["What is a liability?", "an obligation owed by a business", "Liabilities include loans and payables."],
      ["What is equity?", "the owners' claim on assets", "Equity = assets − liabilities."],
      ["What is the accounting equation?", "Assets = Liabilities + Equity", "Every transaction keeps the equation balanced."],
      ["What is a journal?", "the first record of transactions", "Journals list entries chronologically."],
      ["What is a ledger?", "the book of accounts", "Ledgers group entries by account."],
      ["What is a debit?", "an entry on the left side", "Debits increase assets and expenses."],
      ["What is a credit?", "an entry on the right side", "Credits increase liabilities and equity."],
      ["What is double-entry bookkeeping?", "recording both sides of each transaction", "Every debit has a matching credit."],
      ["What is depreciation?", "allocating an asset's cost over time", "Depreciation spreads cost over useful life."],
      ["What is a trial balance?", "a list of account balances", "Trial balances check that debits equal credits."],
      ["What is a profit?", "revenue exceeding expenses", "Profit = revenue − expenses."],
      ["What is a loss?", "expenses exceeding revenue", "Losses reduce owners' equity."],
      ["What is a cash book?", "the record of cash receipts and payments", "Cash books track money in and out."]
    ]
  }),
  makeGen("finance", "Finance — Money Management", {
    "Finance Basics": [
      ["What is finance?", "managing money and investments", "Finance covers investing, lending and budgeting."],
      ["What is a loan?", "borrowed money repaid with interest", "Loans fund purchases and investments."],
      ["What is interest?", "the cost of borrowed money", "Interest compensates lenders over time."],
      ["What is a bank?", "an institution holding deposits and lending", "Banks channel savings into credit."],
      ["What is an investment?", "spending for future returns", "Investments grow wealth over time."],
      ["What is a stock?", "a share of company ownership", "Stocks rise and fall with company value."],
      ["What is a bond?", "a debt security", "Bondholders lend and earn interest."],
      ["What is a mutual fund?", "a pooled investment vehicle", "Funds spread risk across many assets."],
      ["What is inflation risk?", "the loss of purchasing power", "Inflation erodes fixed returns."],
      ["What is a savings account?", "a safe deposit account", "Savings accounts pay modest interest."],
      ["What is credit?", "borrowing against future payment", "Credit cards and loans provide credit."],
      ["What is a budget?", "a spending plan", "Budgets track income against expenses."]
    ]
  }),
  makeGen("commerce", "Commerce — Trade", {
    "Trade Basics": [
      ["What is commerce?", "the trade of goods and services", "Commerce covers buying, selling and distribution."],
      ["What is a transaction?", "an exchange of value", "Transactions are sales, purchases or transfers."],
      ["What is a retailer?", "a seller to final customers", "Retailers sell goods to consumers."],
      ["What is a wholesaler?", "a bulk seller to retailers", "Wholesalers distribute large quantities."],
      ["What is a customer?", "a buyer of goods or services", "Customers drive business revenue."],
      ["What is a service?", "an intangible product", "Services include banking, travel and education."],
      ["What is a market in commerce?", "the demand for a product", "Markets define where goods are traded."],
      ["What is e-commerce?", "buying and selling online", "E-commerce uses websites and apps."],
      ["What is a brand?", "a recognisable product identity", "Brands build trust and loyalty."],
      ["What is a bill?", "a document requesting payment", "Bills detail goods and amounts due."],
      ["What is an invoice?", "a sales document", "Invoices list items, prices and payment terms."],
      ["What is trade?", "the exchange of goods and services", "Trade happens within and between countries."]
    ]
  }),
  makeGen("hrm", "Human Resource Management — People", {
    "HR Concepts": [
      ["What is HRM?", "managing people in organisations", "HRM covers hiring, training and welfare."],
      ["What is recruitment?", "finding and hiring candidates", "Recruitment fills job vacancies."],
      ["What is selection?", "choosing the best candidate", "Selection uses tests and interviews."],
      ["What is an interview?", "a structured candidate conversation", "Interviews assess fit and skills."],
      ["What is training?", "building employee skills", "Training improves performance and safety."],
      ["What is a salary?", "regular pay for work", "Salaries compensate employees."],
      ["What is a bonus?", "extra pay for performance", "Bonuses motivate and reward."],
      ["What is an appraisal?", "evaluating employee performance", "Appraisals guide raises and development."],
      ["What is a job description?", "a role's duties and requirements", "Job descriptions define positions."],
      ["What is an employee?", "a person employed for pay", "Employees work under an employer's direction."],
      ["What is a resignation?", "voluntary leaving of a job", "Resignations require notice usually."],
      ["What is a pension?", "retirement income", "Pensions support employees after work."]
    ]
  }),
  makeGen("marketing", "Marketing — Customers", {
    "Marketing Concepts": [
      ["What is marketing?", "creating and delivering value to customers", "Marketing identifies and satisfies customer needs."],
      ["What is a product?", "anything offered to satisfy a need", "Products are goods, services or ideas."],
      ["What is a price?", "the amount charged for a product", "Pricing balances value and profit."],
      ["What is promotion?", "communicating product value", "Promotion includes ads, sales and PR."],
      ["What is the marketing mix?", "product, price, place, promotion", "The 4Ps form the marketing mix."],
      ["What is a market segment?", "a group of similar customers", "Segments share needs and traits."],
      ["What is branding?", "building a product identity", "Branding creates recognition and loyalty."],
      ["What is advertising?", "paid promotion of products", "Ads inform and persuade audiences."],
      ["What is a sale?", "a transaction transferring ownership", "Sales convert interest into revenue."],
      ["What is a customer?", "a buyer of products", "Customer satisfaction drives repeat sales."],
      ["What is market research?", "studying customers and markets", "Research guides product decisions."],
      ["What is distribution?", "getting products to customers", "Distribution covers channels and logistics."]
    ]
  }),
  makeGen("business-admin", "Business Administration — Management", {
    "Management Basics": [
      ["What is management?", "coordinating work to reach goals", "Management plans, organises, leads and controls."],
      ["What is a manager?", "a person directing others' work", "Managers achieve results through teams."],
      ["What is planning?", "setting goals and methods", "Planning charts the road ahead."],
      ["What is organising?", "arranging resources and tasks", "Organising builds structure and roles."],
      ["What is leadership?", "inspiring people to act", "Leaders motivate and guide teams."],
      ["What is controlling?", "monitoring and correcting progress", "Control keeps work on track."],
      ["What is a strategy?", "a long-term plan for success", "Strategy positions the organisation."],
      ["What is a mission?", "the organisation's purpose", "Missions state why an organisation exists."],
      ["What is a vision?", "a desired future state", "Visions inspire long-term direction."],
      ["What is a stakeholder?", "anyone affected by the organisation", "Stakeholders include owners, staff and customers."],
      ["What is delegation?", "assigning authority to others", "Delegation develops teams and efficiency."],
      ["What is a team?", "people working toward a shared goal", "Teams combine skills for results."]
    ]
  }),
  makeGen("supply-chain", "Supply Chain — Logistics", {
    "Logistics Concepts": [
      ["What is a supply chain?", "the flow from supplier to customer", "Chains cover sourcing, making and delivering."],
      ["What is logistics?", "moving and storing goods", "Logistics manages transport and warehouses."],
      ["What is inventory?", "stock held for sale or use", "Inventory buffers supply against demand."],
      ["What is procurement?", "buying goods and services", "Procurement sources supplies at best value."],
      ["What is a warehouse?", "a storage facility", "Warehouses hold inventory until needed."],
      ["What is transportation?", "moving goods between locations", "Road, rail, sea and air move freight."],
      ["What is a supplier?", "a provider of goods or services", "Suppliers feed the chain."],
      ["What is distribution?", "delivering products to customers", "Distribution completes the chain."],
      ["What is a lead time?", "the time from order to delivery", "Shorter lead times improve service."],
      ["What is a shipment?", "a consignment in transit", "Shipments are tracked from origin to destination."],
      ["What is a carrier?", "a transport company", "Carriers move freight by land, sea or air."],
      ["What is demand forecasting?", "predicting future demand", "Forecasts guide stock and capacity."]
    ]
  }),
  makeGen("auditing", "Auditing — Assurance", {
    "Audit Concepts": [
      ["What is an audit?", "an independent examination of accounts", "Audits verify financial statements."],
      ["Who performs audits?", "Auditors", "Auditors give an independent opinion."],
      ["What is an audit report?", "the auditor's opinion document", "Reports state whether accounts are true and fair."],
      ["What is an internal audit?", "review inside the organisation", "Internal audit improves controls and risk."],
      ["What is an external audit?", "independent outside review", "External audits serve shareholders and regulators."],
      ["What is a control?", "a safeguard against error and fraud", "Controls protect assets and data."],
      ["What is materiality?", "the significance of an error", "Material misstatements affect decisions."],
      ["What is evidence in auditing?", "information supporting the opinion", "Evidence includes documents and confirmations."],
      ["What is a fraud?", "intentional deception for gain", "Auditors assess fraud risk."],
      ["What is compliance?", "following laws and rules", "Compliance audits check adherence."],
      ["What is a finding?", "an issue identified in an audit", "Findings lead to recommendations."],
      ["What is a recommendation?", "suggested improvement", "Recommendations fix weaknesses."]
    ]
  })
];
