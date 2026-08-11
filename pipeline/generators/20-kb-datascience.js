/* ============================================================
   Deep Knowledge KB — Data Science
   Data pipeline, statistics, SQL + numeric data problems.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["data-science"],
  chapter: "Data Science — Deep Knowledge Bank",
  tags: ["data-science", "deep-kb", "data-pipeline", "statistics", "sql"],
  topics: {

    "Data Science Basics": [
      {
        kind: "fact", name: "data science fundamentals",
        note: "The core concepts of data science.",
        facts: [
          ["What is data science?", "Extracting insights from data using statistics and computing", "Data science combines statistics, programming and domain knowledge to find patterns."],
          ["What is the difference between data science and data analysis?", "Analysis describes; science predicts and builds systems", "Analysts report what happened; data scientists build models to predict and automate."],
          ["What is structured data?", "Data organised in rows and columns", "Structured data fits tables, like spreadsheets and databases."],
          ["What is unstructured data?", "Data without a fixed format", "Text, images, audio and video are unstructured, needing special processing."],
          ["What is a dataset?", "A collection of data for analysis", "Datasets are the raw material of data science, often with rows as records and columns as features."],
          ["What is a feature in machine learning?", "An input variable used for prediction", "Features are the measurable attributes the model learns from."],
          ["What is the difference between correlation and causation?", "Correlation is association; causation is cause and effect", "Two variables can correlate without one causing the other, so correlation alone never proves causation."],
          ["What is EDA?", "Exploratory data analysis", "EDA summarises and visualises data to find patterns before modelling."],
          ["What is data cleaning?", "Fixing errors and missing values in data", "Cleaning handles nulls, outliers and inconsistencies that break models."],
          ["What is a data pipeline?", "The automated flow of data from source to insight", "Pipelines extract, transform and load data for analysis and modelling."]
        ],
        trick: "Structured=tabular, unstructured=text/media; correlation≠causation; EDA=explore first.",
        tip: "Structured vs unstructured and correlation vs causation are the anchor pairs."
      },
      {
        kind: "tf", name: "data science statements",
        note: "True/false stems on fundamentals.",
        statements: [
          ["Correlation does not imply causation.", "Correlation always proves causation."],
          ["Structured data fits rows and columns.", "Structured data is only images and audio."],
          ["EDA explores data before modelling.", "EDA replaces model training entirely."],
          ["Features are inputs to a model.", "Features are the model's final predictions."],
          ["Data cleaning fixes errors and missing values.", "Data cleaning deletes all rows automatically."]
        ],
        trick: "Correlation≠causation, structured=tabular, EDA=explore, features=inputs, cleaning=fixes.",
        tip: "Definition swaps are the classic traps."
      }
    ],

    "Statistics for Data": [
      {
        kind: "fact", name: "statistics facts",
        note: "The statistical tools used in data science.",
        facts: [
          ["What is the mean?", "The average of a set of values", "The mean sums all the values and divides by the count, giving the typical value of the data."],
          ["What is the median?", "The middle value when data is sorted", "The median is the middle value of sorted data, so it resists outliers, unlike the mean."],
          ["What is the mode?", "The most frequent value", "The mode identifies the value that appears most often in the dataset."],
          ["What is the standard deviation?", "How spread out the values are", "Standard deviation measures the average distance of values from the mean."],
          ["What is the range?", "The maximum minus the minimum", "The range is the simplest measure of spread: the maximum minus the minimum value."],
          ["What is a normal distribution?", "A symmetric bell-shaped distribution", "In a normal distribution most values cluster at the mean, tapering to both tails symmetrically."],
          ["What is an outlier?", "A value far from the others", "Outliers are values far from the rest, and they can distort the mean and model training."],
          ["What is variance?", "The average squared deviation from the mean", "Variance squares the deviations from the mean, and its square root is the standard deviation."],
          ["What is a sample?", "A subset of the population", "A sample is a subset of the population, used to estimate parameters when the whole is too large."],
          ["What is sampling bias?", "A sample not representing the population", "Sampling bias skews every statistic computed from the sample, since it fails to represent the population."]
        ],
        trick: "Mean=avg, median=middle, mode=most frequent, SD=spread, outlier=far value.",
        tip: "Mean vs median behaviour with outliers is the most asked item."
      },
      {
        kind: "numeric", name: "mean calculations", difficulty: "easy",
        note: "Mean = sum of values ÷ number of values.",
        q: (v) => `What is the mean of the numbers ${v.list}?`,
        a: (v) => `${v.m}`,
        e: (v) => `Mean = sum ÷ count = (${v.sum}) ÷ ${v.n} = ${v.m}, because the mean distributes the total evenly across all values.`,
        distract: (v) => {
          const c = v.m;
          return [`${v.med}`, `${c + 1}`, `${c - 1}`, `${v.mode}`, `${Math.round(c * 1.1)}`];
        },
        vals: (rng) => {
          const n = 4 + Math.floor(rng() * 4);
          const base = 10 + Math.floor(rng() * 80);
          const nums = [];
          let sum = 0;
          for (let i = 0; i < n; i++) { const x = base + Math.floor(rng() * 20) - 10; nums.push(x); sum += x; }
          const m = sum / n;
          const sorted = [...nums].sort((a, b) => a - b);
          const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
          const counts = {};
          for (const x of nums) counts[x] = (counts[x] || 0) + 1;
          const mode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
          return { list: nums.join(", "), sum, n, m, med, mode: Number(mode) };
        },
        whyWrong: (v) => [`The mean is sum ÷ count; the median and mode are deliberately offered as distractors.`],
        trick: "Mean = total ÷ how many.",
        tip: "Check whether the stem asks for mean, median or mode."
      },
      {
        kind: "numeric", name: "weighted mean calculations", difficulty: "medium",
        note: "Weighted mean = Σ(weight × value) ÷ Σ weights.",
        q: (v) => `A student scores ${v.s1} (weight ${v.w1}) and ${v.s2} (weight ${v.w2}). What is the weighted mean?`,
        a: (v) => `${((v.s1 * v.w1 + v.s2 * v.w2) / (v.w1 + v.w2)).toFixed(1)}`,
        e: (v) => `Weighted mean = (${v.s1}×${v.w1} + ${v.s2}×${v.w2}) ÷ (${v.w1} + ${v.w2}) = ${(v.s1 * v.w1 + v.s2 * v.w2)} ÷ ${v.w1 + v.w2} = ${((v.s1 * v.w1 + v.s2 * v.w2) / (v.w1 + v.w2)).toFixed(1)}, because heavier weights pull the mean towards their value.`,
        distract: (v) => {
          const c = (v.s1 * v.w1 + v.s2 * v.w2) / (v.w1 + v.w2);
          const plain = (v.s1 + v.s2) / 2;
          return [`${plain.toFixed(1)}`, `${(c + 1).toFixed(1)}`, `${(c - 1).toFixed(1)}`, `${(c * 1.05).toFixed(1)}`, `${(c * 0.95).toFixed(1)}`];
        },
        vals: (rng) => {
          const w1 = 1 + Math.floor(rng() * 4);
          const w2 = 1 + Math.floor(rng() * 4);
          const s1 = 40 + Math.floor(rng() * 60);
          const s2 = 40 + Math.floor(rng() * 60);
          return { s1, w1, s2, w2 };
        },
        whyWrong: (v) => [`Weighted mean multiplies each value by its weight before dividing; the plain average ignores the weights.`],
        trick: "Weighted mean = Σ(w×v) ÷ Σw.",
        tip: "The plain average is always the tempting distractor."
      },
      {
        kind: "numeric", name: "percentile calculations", difficulty: "medium",
        note: "The p-th percentile: value at position (p/100) × (n+1) in sorted data.",
        q: (v) => `In a sorted dataset of ${v.n} values, which position holds the ${v.p}th percentile?`,
        a: (v) => `${v.pos}`,
        e: (v) => `Position = (p/100) × (n+1) = (${v.p}/100) × (${v.n}+1) = ${v.pos}, because percentiles split the sorted data into 100 equal ranks.`,
        distract: (v) => [`${v.pos + 1}`, `${v.pos - 1}`, `${Math.round(v.n * v.p / 100)}`, `${v.n}`, `${Math.round(v.n * v.p / 100) + 1}`],
        vals: (rng) => {
          const n = 50 + Math.floor(rng() * 200);
          const p = 10 + Math.floor(rng() * 9) * 10;
          return { n, p, pos: Math.round(p / 100 * (n + 1)) };
        },
        whyWrong: (v) => [`Percentile position = p% × (n+1); using n instead of n+1 or rounding down gives the neighbouring position.`],
        trick: "Position = (p/100) × (n+1).",
        tip: "The 50th percentile is the median."
      },
      {
        kind: "numeric", name: "data size calculations", difficulty: "easy",
        note: "Data sizes: 1 KB = 1024 bytes, 1 MB = 1024 KB, 1 GB = 1024 MB.",
        q: (v) => `A dataset has ${v.rows.toLocaleString()} rows and each row takes ${v.bytes} bytes. What is the dataset size in ${v.unit}?`,
        a: (v) => `${(v.rows * v.bytes / v.div).toFixed(1)} ${v.unit}`,
        e: (v) => `Total = ${v.rows.toLocaleString()} × ${v.bytes} = ${(v.rows * v.bytes).toLocaleString()} bytes = ${(v.rows * v.bytes / v.div).toFixed(1)} ${v.unit}, because 1 ${v.unit} equals ${v.div.toLocaleString()} bytes.`,
        distract: (v) => {
          const c = v.rows * v.bytes / v.div;
          return [`${(c * 10).toFixed(1)} ${v.unit}`, `${(c * 0.1).toFixed(1)} ${v.unit}`, `${(c * 2).toFixed(1)} ${v.unit}`, `${(c / 2).toFixed(1)} ${v.unit}`, `${(v.rows * v.bytes / 1000).toFixed(1)} ${v.unit}`];
        },
        vals: (rng) => {
          const units = [["KB", 1024], ["MB", 1048576], ["GB", 1073741824]];
          const [unit, div] = units[Math.floor(rng() * 3)];
          const rows = 1000 + Math.floor(rng() * 900) * 1000;
          const bytes = 100 + Math.floor(rng() * 900);
          return { rows, bytes, unit, div };
        },
        whyWrong: (v) => [`Size = rows × bytes converted by 1024-based units; using decimal 1000 gives the wrong magnitude.`],
        trick: "Bytes → KB/MB/GB by dividing 1024 each step.",
        tip: "The 1000-based answer is always the trap."
      }
    ],

    "Data Tools and SQL": [
      {
        kind: "fact", name: "tool facts",
        note: "The tools of the data science trade.",
        facts: [
          ["Which language is the most common for data science?", "Python", "Python's libraries (pandas, scikit-learn, PyTorch) dominate data science."],
          ["Which Python library handles tabular data?", "Pandas", "Pandas provides DataFrames for analysing tabular data, while NumPy handles arrays and SciPy statistics."],
          ["Which Python library provides machine learning models?", "Scikit-learn", "Scikit-learn offers ready models for classification, regression and clustering."],
          ["Which Python library handles numerical arrays?", "NumPy", "NumPy powers fast numerical arrays used across the data stack."],
          ["Which SQL keyword selects data?", "SELECT", "SELECT queries columns from tables in SQL, and is the keyword every retrieval starts with."],
          ["Which SQL keyword filters rows?", "WHERE", "WHERE filters rows by conditions before grouping or returning."],
          ["Which SQL keyword groups rows?", "GROUP BY", "GROUP BY aggregates rows into groups, usually with COUNT or SUM."],
          ["Which SQL function counts rows?", "COUNT", "COUNT(*) returns the number of rows in a table or group, one count per group."],
          ["What is a DataFrame?", "A labelled 2D table in pandas", "DataFrames hold rows and columns with named indexes, like a spreadsheet."],
          ["What is Jupyter?", "An interactive notebook for data code", "Jupyter notebooks mix code, output and notes for data work, supporting step-by-step analysis."]
        ],
        trick: "Pandas=tables, NumPy=arrays, scikit-learn=models, SELECT/WHERE/GROUP BY=SQL core.",
        tip: "Python library roles are the most asked data-tool items."
      },
      {
        kind: "tf", name: "tool statements",
        note: "True/false stems on tools.",
        statements: [
          ["Pandas handles tabular data.", "Pandas renders video files."],
          ["NumPy provides numerical arrays.", "NumPy is a SQL database."],
          ["WHERE filters rows in SQL.", "WHERE deletes tables in SQL."],
          ["GROUP BY aggregates rows.", "GROUP BY sorts rows alphabetically."],
          ["Scikit-learn provides ML models.", "Scikit-learn compiles C++ code."]
        ],
        trick: "Pandas=tables, NumPy=arrays, WHERE=filters, GROUP BY=aggregates, sklearn=models.",
        tip: "Library-function swaps are the traps."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
