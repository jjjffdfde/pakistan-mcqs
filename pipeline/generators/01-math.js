/* ============================================================
   Generator file 01 — Mathematics, Statistics, Aptitude, Data Interpretation
   Deterministic parametric enumeration: answers computed
   programmatically (correct by construction), explanations show
   the working. Honours s._cap (equal-share target slicing).
   ============================================================ */
"use strict";
const L = require("../lib.js");

const ri = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const round2 = (x) => Math.round(x * 100) / 100;
const capOf = (s, dflt) => (s && s._cap) || dflt;

/* ---------- Mathematics: arithmetic & algebra ---------- */
const MATH = {
  "Percentages": (rng, cap) => {
    const out = [];
    for (let p = 2; p <= 95 && out.length < cap; p++) {
      for (let base = 100; base <= 999 && out.length < cap; base++) {
        const v = round2(base * p / 100);
        const m = L.buildParametric(rng, {
          q: () => `What is ${p}% of ${base}?`,
          a: () => v,
          e: () => `${p}% of ${base} = ${base} × ${p} / 100 = ${base * p} / 100 = ${v}.`,
          distract: () => [round2(base * (p + ((p + base) % 8 + 1)) / 100), round2(base * (p - ((p + base) % 8 + 1)) / 100), round2(base * p / 1000)]
        }, { difficulty: L.diffFor(out.length), tags: ["percentages"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Percentage Change": (rng, cap) => {
    const out = [];
    for (let dir = 0; dir < 2 && out.length < cap; dir++) {
      for (let o = 100; o <= 999 && out.length < cap; o++) {
        for (let p = 5; p <= 90 && out.length < cap; p++) {
          const sgn = dir ? -1 : 1;
          const nv = round2(o * (1 + sgn * p / 100));
          const word = dir ? "decreased" : "increased";
          const m = L.buildParametric(rng, {
            q: () => `A price of ${o} is ${word} by ${p}%. What is the new price?`,
            a: () => nv,
            e: () => `${word[0].toUpperCase()}${word.slice(1)} of ${p}% on ${o}: ${o} × (1 ${sgn > 0 ? "+" : "−"} ${p}/100) = ${o} × ${round2(1 + sgn * p / 100)} = ${nv}.`,
            distract: () => [round2(o * (1 + sgn * (p + 10) / 100)), round2(o * (1 - sgn * p / 100)), o + p]
          }, { difficulty: L.diffFor(out.length), tags: ["percentages"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Ratios": (rng, cap) => {
    const out = [];
    for (let a = 2; a <= 12 && out.length < cap; a++) {
      for (let b = 2; b <= 12 && out.length < cap; b++) {
        if (a === b) continue;
        for (let k = 3; k <= 60 && out.length < cap; k++) {
          const m = L.buildParametric(rng, {
            q: () => `Two numbers are in the ratio ${a}:${b}. Their sum is ${k * (a + b)}. What is the larger number?`,
            a: () => k * Math.max(a, b),
            e: () => `Parts total = ${a} + ${b} = ${a + b}. One part = ${k * (a + b)} / ${a + b} = ${k}. Larger = ${Math.max(a, b)} × ${k} = ${k * Math.max(a, b)}.`,
            distract: () => [k * Math.min(a, b), k * (a + b), k * Math.abs(a - b)]
          }, { difficulty: L.diffFor(out.length), tags: ["ratios"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Averages": (rng, cap) => {
    const out = [];
    const NS = [3, 5, 7, 9];
    for (const n of NS) {
      for (let avg = 10; avg <= 90 && out.length < cap; avg++) {
        for (let step = 1; step <= 5 && out.length < cap; step++) {
          const offs = Array.from({ length: n }, (_, k) => k - (n - 1) / 2);
          const nums = offs.map((o) => avg + o * step);
          const missing = nums[nums.length - 1];
          const known = nums.slice(0, -1);
          const sumKnown = known.reduce((x, y) => x + y, 0);
          const m = L.buildParametric(rng, {
            q: () => `The average of ${n} numbers is ${avg}. If ${known.join(", ")} are the first ${n - 1}, what is the last number?`,
            a: () => missing,
            e: () => `Sum of all = ${avg} × ${n} = ${avg * n}. Known sum = ${sumKnown}. Missing = ${avg * n} − ${sumKnown} = ${missing}.`,
            distract: () => [missing + step, missing - step, avg]
          }, { difficulty: L.diffFor(out.length), tags: ["averages"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Profit and Loss": (rng, cap) => {
    const out = [];
    for (let cp = 100; cp <= 2000 && out.length < cap; cp += 2) {
      for (let pct = 5; pct <= 60 && out.length < cap; pct++) {
        const sp = round2(cp * (100 + pct) / 100);
        const m = L.buildParametric(rng, {
          q: () => `An item costing ${cp} is sold at a profit of ${pct}%. What is the selling price?`,
          a: () => sp,
          e: () => `S.P. = C.P. × (100 + profit%)/100 = ${cp} × ${100 + pct}/100 = ${sp}.`,
          distract: () => [round2(cp * (100 - pct) / 100), cp + pct, round2(cp * (100 + pct * 2) / 100)]
        }, { difficulty: L.diffFor(out.length), tags: ["profit-loss"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Simple Interest": (rng, cap) => {
    const out = [];
    for (let p = 500; p <= 9000 && out.length < cap; p += 50) {
      for (let r = 2; r <= 15 && out.length < cap; r++) {
        for (let t = 1; t <= 6 && out.length < cap; t++) {
          const si = p * r * t / 100;
          const m = L.buildParametric(rng, {
            q: () => `Simple interest on ${p} at ${r}% per annum for ${t} years is:`,
            a: () => si,
            e: () => `S.I. = (P × R × T)/100 = (${p} × ${r} × ${t})/100 = ${si}.`,
            distract: () => [round2(si + p / 10), round2(si - p / 10), p * r / 100]
          }, { difficulty: L.diffFor(out.length), tags: ["interest"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Time and Work": (rng, cap) => {
    const out = [];
    for (let a = 3; a <= 30 && out.length < cap; a++) {
      for (let b = 5; b <= 40 && out.length < cap; b++) {
        const t = round2(a * b / (a + b));
        const m = L.buildParametric(rng, {
          q: () => `A can do a job in ${a} days and B in ${b} days. Working together, they finish it in:`,
          a: () => t,
          e: () => `Together time = (a × b)/(a + b) = (${a} × ${b})/(${a} + ${b}) = ${a * b}/${a + b} = ${t} days.`,
          distract: () => [round2(a + b), round2(a * b), round2(Math.min(a, b) / 2)]
        }, { difficulty: L.diffFor(out.length), tags: ["time-work"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Speed Distance Time": (rng, cap) => {
    const out = [];
    for (let sp = 5; sp <= 120 && out.length < cap; sp++) {
      for (let t = 2; t <= 8 && out.length < cap; t++) {
        const d = sp * t;
        const m = L.buildParametric(rng, {
          q: () => `A train travels at ${sp} km/h for ${t} hours. Distance covered is:`,
          a: () => `${d} km`,
          e: () => `Distance = speed × time = ${sp} × ${t} = ${d} km.`,
          distract: () => [`${d + sp} km`, `${d - sp} km`, `${sp + t} km`]
        }, { difficulty: L.diffFor(out.length), tags: ["speed-distance"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Ages": (rng, cap) => {
    const out = [];
    for (let son = 8; son <= 50 && out.length < cap; son++) {
      for (let diff = 20; diff <= 35 && out.length < cap; diff++) {
        const father = son + diff;
        const sum = father + son;
        const m = L.buildParametric(rng, {
          q: () => `The sum of the ages of a father and son is ${sum}, and the difference is ${diff}. What is the father's age?`,
          a: () => father,
          e: () => `Father's age = (sum + difference)/2 = (${sum} + ${diff})/2 = ${father}.`,
          distract: () => [son, father + diff, sum - son + 1]
        }, { difficulty: L.diffFor(out.length), tags: ["ages"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "LCM and HCF": (rng, cap) => {
    const out = [];
    const gcd = (x, y) => y ? gcd(y, x % y) : x;
    for (let a = 6; a <= 100 && out.length < cap; a++) {
      for (let b = 8; b <= 150 && out.length < cap; b++) {
        const h = gcd(a, b), l = a * b / h;
        const m = L.buildParametric(rng, {
          q: () => `The LCM of ${a} and ${b} is:`,
          a: () => l,
          e: () => `HCF(${a},${b}) = ${h}, so LCM = (${a} × ${b}) / ${h} = ${l}.`,
          distract: () => [h, a * b, l + h]
        }, { difficulty: L.diffFor(out.length), tags: ["lcm-hcf"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Algebraic Expressions": (rng, cap) => {
    const out = [];
    for (let x = 2; x <= 50 && out.length < cap; x++) {
      for (let b = 2; b <= 12 && out.length < cap; b++) {
        for (let c = 2; c <= 50 && out.length < cap; c++) {
          const v = b * x + c;
          const m = L.buildParametric(rng, {
            q: () => `If ${b}x + ${c} = ${v}, what is the value of x?`,
            a: () => x,
            e: () => `${b}x = ${v} − ${c} = ${v - c}, so x = ${v - c} / ${b} = ${x}.`,
            distract: () => [x + 1, x - 1, v]
          }, { difficulty: L.diffFor(out.length), tags: ["algebra"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Exponents and Roots": (rng, cap) => {
    const out = [];
    for (let b = 2; b <= 20 && out.length < cap; b++) {
      for (let e2 = 2; e2 <= 6 && out.length < cap; e2++) {
        const v = Math.pow(b, e2);
        const m = L.buildParametric(rng, {
          q: () => `${b}^${e2} (${b} raised to the power ${e2}) equals:`,
          a: () => v,
          e: () => `${b} × ${b} = ${b * b}${e2 > 2 ? `, then multiplied ${e2 - 2} more time(s) gives ${v}` : ""}. So ${b}^${e2} = ${v}.`,
          distract: () => [b * e2, Math.pow(b, e2 - 1), Math.pow(b + 1, e2)]
        }, { difficulty: L.diffFor(out.length), tags: ["exponents"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Fractions": (rng, cap) => {
    const out = [];
    for (let a = 1; a <= 9 && out.length < cap; a++) {
      for (let b = a + 1; b <= 15 && out.length < cap; b++) {
        for (let c = 1; c <= 9 && out.length < cap; c++) {
          for (let d = c + 1; d <= 15 && out.length < cap; d++) {
            const v = round2(a / b + c / d);
            const m = L.buildParametric(rng, {
              q: () => `What is ${a}/${b} + ${c}/${d} (as a decimal)?`,
              a: () => v,
              e: () => `${a}/${b} = ${round2(a / b)} and ${c}/${d} = ${round2(c / d)}. Sum = ${round2(a / b)} + ${round2(c / d)} = ${v}.`,
              distract: () => [round2(a / b - c / d), round2((a + c) / (b + d)), round2(a / b * c / d)]
            }, { difficulty: L.diffFor(out.length), tags: ["fractions"] });
            if (m) out.push(m);
          }
        }
      }
    }
    return out;
  },
  "Number Series": (rng, cap) => {
    const out = [];
    for (let start = 1; start <= 50 && out.length < cap; start++) {
      for (let step = 2; step <= 12 && out.length < cap; step++) {
        for (let n = 4; n <= 7 && out.length < cap; n++) {
          const seq = Array.from({ length: n }, (_, i) => start + i * step);
          const next = start + n * step;
          const m = L.buildParametric(rng, {
            q: () => `Find the next number in the series: ${seq.join(", ")}, ?`,
            a: () => next,
            e: () => `The series increases by ${step} each time: ${seq.join(" → ")} → ${next}.`,
            distract: () => [next + step, next - step, start + step * (n - 1)]
          }, { difficulty: L.diffFor(out.length), tags: ["series"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Geometry Basics": (rng, cap) => {
    const out = [];
    for (let ang = 10; ang <= 170 && out.length < cap; ang++) {
      const comp = 90 - ang, supp = 180 - ang;
      if (comp < 0) continue;
      const m = L.buildParametric(rng, {
        q: () => `The complement of a ${ang}° angle is:`,
        a: () => `${comp}°`,
        e: () => `Complement = 90° − ${ang}° = ${comp}°. (Supplementary would be ${supp}°.)`,
        distract: () => [`${supp}°`, `${ang + 90}°`, `${comp + 45}°`]
      }, { difficulty: L.diffFor(out.length), tags: ["geometry"] });
      if (m) out.push(m);
    }
    return out;
  }
};

const STATS = {
  "Mean Median Mode": (rng, cap) => {
    const out = [];
    const NS = [3, 5, 7];
    for (const n of NS) {
      for (let base = 20; base <= 800 && out.length < cap; base += 3) {
        for (let step = 1; step <= 8 && out.length < cap; step++) {
          const offs = Array.from({ length: n }, (_, k) => k - (n - 1) / 2);
          const nums = offs.map((o) => base + o * step);
          const mean = nums.reduce((x, y) => x + y, 0) / n;
          const m = L.buildParametric(rng, {
            q: () => `The mean of ${nums.join(", ")} is:`,
            a: () => mean,
            e: () => `Mean = (${nums.join(" + ")}) / ${n} = ${nums.reduce((x, y) => x + y, 0)} / ${n} = ${mean}.`,
            distract: () => [nums[Math.floor(n / 2)], nums[Math.floor(n / 2)] + step, mean + step]
          }, { difficulty: L.diffFor(out.length), tags: ["mean"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Dispersion": (rng, cap) => {
    const out = [];
    for (let lo = 10; lo <= 999 && out.length < cap; lo++) {
      for (let delta = 1; delta <= 30 && out.length < cap; delta++) {
        const m = L.buildParametric(rng, {
          q: () => `The range of the data set {${lo}, ${lo + delta}} is:`,
          a: () => delta,
          e: () => `Range = maximum − minimum = ${lo + delta} − ${lo} = ${delta}.`,
          distract: () => [delta + 1, Math.round((lo + lo + delta) / 2), delta + lo]
        }, { difficulty: L.diffFor(out.length), tags: ["range"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Probability": (rng, cap) => {
    const out = [];
    for (let total = 6; total <= 100 && out.length < cap; total++) {
      for (let fav = 1; fav <= Math.floor(total / 2) && out.length < cap; fav++) {
        const m = L.buildParametric(rng, {
          q: () => `A bag has ${total} balls, ${fav} red and the rest blue. Probability of drawing a red ball is:`,
          a: () => `${fav}/${total}`,
          e: () => `P(red) = favourable/total = ${fav}/${total}.`,
          distract: () => [`${total - fav}/${total}`, `${fav}/${total - fav}`, `1/${fav}`]
        }, { difficulty: L.diffFor(out.length), tags: ["probability"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Sampling": (rng, cap) => {
    const out = [];
    for (let pop = 1000; pop <= 90000 && out.length < cap; pop += 100) {
      for (let s = 50; s <= 500 && out.length < cap; s += 10) {
        const m = L.buildParametric(rng, {
          q: () => `From a population of ${pop}, a sample of ${s} is drawn. The sampling fraction is approximately:`,
          a: () => round2(s * 100 / pop) + "%",
          e: () => `Sampling fraction = ${s}/${pop} × 100 = ${round2(s * 100 / pop)}%.`,
          distract: () => [round2(pop * 100 / s) + "%", `${s}%`, round2(s / pop * 1000) + "%"]
        }, { difficulty: L.diffFor(out.length), tags: ["sampling"] });
        if (m) out.push(m);
      }
    }
    return out;
  }
};

const APT = {
  "Data Interpretation Tables": (rng, cap) => {
    const out = [];
    for (let base = 100; base <= 900 && out.length < cap; base += 5) {
      for (let a = 1; a <= 20 && out.length < cap; a++) {
        for (let b = 1; b <= 20 && out.length < cap; b++) {
          const m = L.buildParametric(rng, {
            q: () => `In a table, monthly sales (PKR) of Shop A and Shop B are ${base} and ${base * (a + b)}. What is the total for both shops?`,
            a: () => base * (a + b + 1),
            e: () => `Total = ${base} + ${base * (a + b)} = ${base * (a + b + 1)}.`,
            distract: () => [base * (a + b), base * (a + b) - base, base * 2]
          }, { difficulty: L.diffFor(out.length), tags: ["tables"] });
          if (m) out.push(m);
        }
      }
    }
    return out;
  },
  "Graph Reading": (rng, cap) => {
    const out = [];
    for (let base = 100; base <= 900 && out.length < cap; base += 5) {
      for (let a = 1; a <= 20 && out.length < cap; a++) {
        const m = L.buildParametric(rng, {
          q: () => `A bar graph shows exports rising from ${base} to ${base + a * 40} over a year. The increase is:`,
          a: () => a * 40,
          e: () => `Increase = ${base + a * 40} − ${base} = ${a * 40}.`,
          distract: () => [a * 40 + 10, base, a * 40 * 2]
        }, { difficulty: L.diffFor(out.length), tags: ["graphs"] });
        if (m) out.push(m);
      }
    }
    return out;
  },
  "Percentage Comparisons": (rng, cap) => {
    const out = [];
    for (let p = 5; p <= 80 && out.length < cap; p++) {
      const m = L.buildParametric(rng, {
        q: () => `Value V increases by ${p}% and then decreases by ${p}%. The net change is:`,
        a: () => `−${round2(p * p / 100)}%`,
        e: () => `Net change = −(p²/100)% = −(${p}²/100)% = −${round2(p * p / 100)}%.`,
        distract: () => [`0%`, `+${p}%`, `−${p}%`]
      }, { difficulty: L.diffFor(out.length), tags: ["percent-change"] });
      if (m) out.push(m);
    }
    for (let p = 5; p <= 50 && out.length < cap; p++) {
      for (let q = 5; q <= 50 && out.length < cap; q++) {
        const net = round2(p - q - p * q / 100);
        const m = L.buildParametric(rng, {
          q: () => `Value V increases by ${p}% and then decreases by ${q}%. The net percentage change is:`,
          a: () => `${net > 0 ? "+" : "−"}${Math.abs(net)}%`,
          e: () => `Net = a − b − ab/100 = ${p} − ${q} − ${p * q}/100 = ${net}%.`,
          distract: () => [`${p - q}%`, `${q - p}%`, `0%`]
        }, { difficulty: L.diffFor(out.length), tags: ["percent-change"] });
        if (m) out.push(m);
      }
    }
    return out;
  }
};

module.exports = [
  {
    subjects: ["mathematics"],
    name: "Mathematics — Arithmetic",
    topics: Object.keys(MATH),
    tags: ["mathematics"],
    generate: (rng, t, s) => MATH[t] ? MATH[t](rng, capOf(s, 20000)) : []
  },
  {
    subjects: ["statistics"],
    name: "Statistics — Measures and Methods",
    topics: Object.keys(STATS),
    tags: ["statistics"],
    generate: (rng, t, s) => STATS[t] ? STATS[t](rng, capOf(s, 20000)) : []
  },
  {
    subjects: ["aptitude-tests", "data-interpretation"],
    name: "Aptitude — Quantitative Data",
    topics: Object.keys(APT),
    tags: ["aptitude"],
    generate: (rng, t, s) => APT[t] ? APT[t](rng, capOf(s, 20000)) : []
  }
];
