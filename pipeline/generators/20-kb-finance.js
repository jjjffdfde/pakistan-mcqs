/* ============================================================
   Deep Knowledge KB — Finance
   Corporate finance, investments, ratios + numeric valuations.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["finance"],
  chapter: "Finance — Deep Knowledge Bank",
  tags: ["finance", "deep-kb", "investments", "valuation", "money-markets"],
  topics: {

    "Finance Basics": [
      {
        kind: "fact", name: "finance fundamentals",
        note: "Core definitions of finance and money markets.",
        facts: [
          ["What is the difference between finance and accounting?", "Finance manages money; accounting records it", "Finance decides how to raise and invest funds, while accounting records and reports the results."],
          ["What is a bond?", "A debt security paying fixed interest", "Bondholders lend money and receive periodic coupon interest plus the principal at maturity."],
          ["What is a stock (share)?", "A unit of ownership in a company", "Shares give ownership rights and a claim on dividends and residual value."],
          ["What is the dividend?", "The share of profit paid to shareholders", "Dividends distribute a company's profit to its owners, often quarterly or annually."],
          ["What is the time value of money?", "A rupee today is worth more than a rupee tomorrow", "Money can earn interest, so present value exceeds future value of the same amount."],
          ["What is the interest rate?", "The cost of borrowing money", "Interest is the price paid for using borrowed funds, expressed as a percentage."],
          ["What is a mortgage?", "A loan secured against property", "Mortgages use the property as collateral, repaid over many years."],
          ["What is the stock market?", "A market where shares are traded", "Stock exchanges like the PSX match buyers and sellers of company shares."],
          ["What is the KSE-100 index?", "Pakistan's benchmark stock index", "The KSE-100 tracks the 100 largest companies on the Pakistan Stock Exchange."],
          ["What is a mutual fund?", "A pool of investor money managed by professionals", "Mutual funds spread risk by investing pooled money across many securities."]
        ],
        trick: "Bond=debt+interest, stock=ownership, dividend=profit share, TVM=today worth more.",
        tip: "Bond vs stock is the single most asked finance distinction."
      },
      {
        kind: "tf", name: "finance statements",
        note: "True/false stems on fundamentals.",
        statements: [
          ["Bonds pay interest and repay principal.", "Bonds give ownership of the company."],
          ["Stocks represent ownership in a company.", "Stocks are risk-free investments."],
          ["A rupee today is worth more than a rupee tomorrow.", "A rupee tomorrow is worth more than a rupee today."],
          ["Dividends are paid from company profits.", "Dividends are loans to the company."],
          ["A mortgage is secured against property.", "A mortgage is an unsecured personal loan."]
        ],
        trick: "Bond=debt, stock=ownership, TVM=today>, dividend=profit, mortgage=secured.",
        tip: "Swap the security type and the statement is false."
      }
    ],

    "Investments and Valuation": [
      {
        kind: "fact", name: "investment facts",
        note: "Valuation and investment analysis facts.",
        facts: [
          ["What is the P/E ratio?", "Price divided by earnings per share", "The price-earnings ratio measures how much investors pay per rupee of earnings."],
          ["What does a high P/E ratio suggest?", "Investors expect future earnings growth", "High P/E reflects optimism about future profit growth, or an overvalued stock."],
          ["What is a bull market?", "A market with rising prices", "In a bull market, prices trend upwards and investor confidence is high."],
          ["What is a bear market?", "A market with falling prices", "A bear market sees prolonged price declines and low investor confidence."],
          ["What is diversification?", "Spreading investments across many assets", "Diversification reduces risk because losses in one asset offset gains in others."],
          ["What is risk in finance?", "The chance that returns differ from expectations", "Risk measures volatility and the possibility of losing capital."],
          ["What is the yield?", "The return earned on an investment", "Yield expresses income (interest or dividends) as a percentage of price."],
          ["What is a portfolio?", "The collection of all an investor's holdings", "A portfolio is the combined set of stocks, bonds and other assets an investor owns."],
          ["What is the face value of a bond?", "The principal repaid at maturity", "Face value is the amount the issuer repays when the bond matures."],
          ["What is the coupon rate?", "The fixed interest rate of a bond", "The coupon rate sets the annual interest paid on the bond's face value."]
        ],
        trick: "P/E=price÷earnings, bull=up, bear=down, diversification=spread risk, yield=return %.",
        tip: "Bull/bear directions and P/E meaning are top items."
      },
      {
        kind: "numeric", name: "P/E ratio calculations", difficulty: "easy",
        note: "P/E = share price ÷ earnings per share.",
        q: (v) => `A share trades at Rs ${v.p} and its earnings per share are Rs ${v.e}. What is the P/E ratio?`,
        a: (v) => `${(v.p / v.e).toFixed(1)}`,
        e: (v) => `P/E = price ÷ EPS = ${v.p} ÷ ${v.e} = ${(v.p / v.e).toFixed(1)}, because the ratio tells how many times earnings the market pays for the share.`,
        distract: (v) => {
          const c = v.p / v.e;
          return [`${(v.e / v.p).toFixed(2)}`, `${(c * 2).toFixed(1)}`, `${(c * 0.5).toFixed(1)}`, `${(c + 5).toFixed(1)}`, `${(v.p * v.e).toFixed(0)}`];
        },
        vals: (rng) => {
          const e = 5 + Math.floor(rng() * 30);
          const p = Math.round(e * (5 + rng() * 20));
          return { p, e };
        },
        whyWrong: (v) => [`P/E divides price by EPS; inverting to EPS ÷ price gives the earnings yield, not the ratio.`],
        trick: "P/E = price ÷ earnings per share.",
        tip: "Single-digit P/E = cheap; 20+ = growth expected."
      },
      {
        kind: "numeric", name: "dividend yield calculations", difficulty: "easy",
        note: "Dividend yield = annual dividend ÷ share price × 100.",
        q: (v) => `A share pays an annual dividend of Rs ${v.d} and trades at Rs ${v.p}. What is the dividend yield?`,
        a: (v) => `${(v.d / v.p * 100).toFixed(2)}%`,
        e: (v) => `Yield = dividend ÷ price × 100 = ${v.d} ÷ ${v.p} × 100 = ${(v.d / v.p * 100).toFixed(2)}%, because yield expresses the dividend as a percentage of the price paid.`,
        distract: (v) => {
          const c = v.d / v.p * 100;
          return [`${(v.p / v.d).toFixed(2)}%`, `${(c * 2).toFixed(2)}%`, `${(c * 0.5).toFixed(2)}%`, `${(c + 2).toFixed(2)}%`, `${(c * 10).toFixed(1)}%`];
        },
        vals: (rng) => {
          const d = 2 + Math.floor(rng() * 20);
          const p = Math.round(d * (10 + rng() * 25));
          return { d, p };
        },
        whyWrong: (v) => [`Yield = dividend ÷ price; inverting the fraction gives the wrong percentage direction.`],
        trick: "Yield = dividend ÷ price × 100.",
        tip: "Yield rises when the price falls — check the direction."
      },
      {
        kind: "numeric", name: "payback period calculations", difficulty: "medium",
        note: "Payback = initial investment ÷ annual net cash flow.",
        q: (v) => `A project costs Rs ${v.i.toLocaleString()} and generates Rs ${v.c.toLocaleString()} net cash flow per year. What is the payback period in years?`,
        a: (v) => `${(v.i / v.c).toFixed(1)} years`,
        e: (v) => `Payback = investment ÷ annual cash flow = ${v.i.toLocaleString()} ÷ ${v.c.toLocaleString()} = ${(v.i / v.c).toFixed(1)} years, because payback measures how long until the cash inflows recover the outlay.`,
        distract: (v) => {
          const c = v.i / v.c;
          return [`${(v.c / v.i).toFixed(1)} years`, `${(c * 2).toFixed(1)} years`, `${(c * 0.5).toFixed(1)} years`, `${(c + 1).toFixed(1)} years`, `${(c * 1.5).toFixed(1)} years`];
        },
        vals: (rng) => {
          const c = 100000 + Math.floor(rng() * 90) * 100000;
          const i = Math.round(c * (2 + rng() * 5));
          return { i, c };
        },
        whyWrong: (v) => [`Payback divides investment by annual cash flow; inverting it or doubling the period are the classic errors.`],
        trick: "Payback = investment ÷ annual cash flow.",
        tip: "Shorter payback = less risk, ignoring time value of money."
      },
      {
        kind: "numeric", name: "bond yield calculations", difficulty: "medium",
        note: "Current yield = annual coupon interest ÷ bond price.",
        q: (v) => `A bond with a face value of Rs ${v.f.toLocaleString()} pays a coupon rate of ${v.r}% and trades at Rs ${v.p.toLocaleString()}. What is its current yield?`,
        a: (v) => `${(v.f * v.r / 100 / v.p * 100).toFixed(2)}%`,
        e: (v) => `Annual coupon = ${v.r}% × ${v.f.toLocaleString()} = Rs ${v.f * v.r / 100}. Current yield = coupon ÷ price × 100 = ${v.f * v.r / 100} ÷ ${v.p.toLocaleString()} × 100 = ${(v.f * v.r / 100 / v.p * 100).toFixed(2)}%, because current yield uses the traded price, not the face value.`,
        distract: (v) => {
          const c = v.f * v.r / 100 / v.p * 100;
          return [`${v.r}.00%`, `${(c * 2).toFixed(2)}%`, `${(c * 0.5).toFixed(2)}%`, `${(c + 1).toFixed(2)}%`, `${(c * 1.5).toFixed(2)}%`];
        },
        vals: (rng) => {
          const f = 100000 + Math.floor(rng() * 90) * 100000;
          const r = [5, 6, 7, 8, 9, 10, 11, 12][Math.floor(rng() * 8)];
          const p = Math.round(f * (0.9 + rng() * 0.3));
          return { f, r, p };
        },
        whyWrong: (v) => [`Current yield uses the market price, not the face value; the coupon rate itself is the tempting wrong answer.`],
        trick: "Current yield = coupon ÷ market price.",
        tip: "When price ≠ face value, the yield differs from the coupon rate."
      }
    ],

    "Financial Markets": [
      {
        kind: "fact", name: "market facts",
        note: "Money markets, banks and central banking facts.",
        facts: [
          ["What is the money market?", "The market for short-term borrowing and lending", "Money markets trade short-term instruments like T-bills and commercial paper."],
          ["What is the capital market?", "The market for long-term securities", "Capital markets trade long-term instruments like shares and bonds."],
          ["What is the discount rate?", "The interest rate the central bank charges banks", "The discount rate is the cost at which the central bank lends to commercial banks."],
          ["What is an IPO?", "The first sale of a company's shares to the public", "An initial public offering raises capital by listing shares on a stock exchange."],
          ["What is a T-bill?", "A short-term government debt instrument", "Treasury bills mature in less than a year and are sold at a discount."],
          ["What is the role of the SECP in Pakistan?", "Regulating securities markets and companies", "The SECP oversees listed companies, brokers and securities markets."],
          ["Which is Pakistan's central bank?", "The State Bank of Pakistan", "The SBP issues currency, sets the policy rate and supervises banks."],
          ["What is the repo rate?", "The rate at which banks borrow from the central bank", "The repo rate steers market interest rates across the banking system."],
          ["What is a credit rating?", "An assessment of a borrower's ability to repay", "Rating agencies grade credit risk from AAA (safest) to D (default)."],
          ["What is inflation's effect on bonds?", "Rising inflation reduces bond prices", "Higher inflation erodes fixed coupon value, pushing bond prices down."]
        ],
        trick: "Money market=short-term, capital market=long-term, IPO=first sale, SBP=central bank, SECP=regulator.",
        tip: "Money vs capital market scope is the most asked pair."
      },
      {
        kind: "tf", name: "market statements",
        note: "True/false stems on markets.",
        statements: [
          ["Money markets trade short-term instruments.", "Money markets trade company shares."],
          ["An IPO is a company's first public share sale.", "An IPO is a bond issued by the government."],
          ["The State Bank of Pakistan issues currency.", "The SECP issues Pakistani currency."],
          ["T-bills mature in less than a year.", "T-bills mature in thirty years."],
          ["Inflation tends to lower bond prices.", "Inflation always raises bond prices."]
        ],
        trick: "Money=short, capital=long, IPO=first sale, SBP=currency, inflation→bond prices down.",
        tip: "Institution-function swaps are the trap here."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
