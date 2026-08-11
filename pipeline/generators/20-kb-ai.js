/* ============================================================
   Deep Knowledge KB — Artificial Intelligence
   ML concepts, metrics, neural nets + numeric metric problems.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["ai"],
  chapter: "Artificial Intelligence — Deep Knowledge Bank",
  tags: ["ai", "deep-kb", "machine-learning", "neural-networks", "metrics"],
  topics: {

    "AI Basics": [
      {
        kind: "fact", name: "AI fundamentals",
        note: "Foundational AI definitions.",
        facts: [
          ["Who coined the term artificial intelligence?", "John McCarthy", "McCarthy coined 'artificial intelligence' at the 1956 Dartmouth workshop."],
          ["What is AI?", "Machines performing tasks that need human intelligence", "AI systems simulate reasoning, learning and perception to solve tasks."],
          ["What is machine learning?", "Systems that learn patterns from data", "ML builds models from data instead of being explicitly programmed."],
          ["What is the difference between AI and ML?", "ML is a subset of AI", "AI is the broad field; ML is the data-learning approach inside it."],
          ["What is deep learning?", "Neural networks with many layers", "Deep learning uses multi-layer neural networks to learn complex patterns."],
          ["What is a neural network?", "Layers of connected nodes inspired by the brain", "Neurons pass weighted signals through layers to compute outputs."],
          ["What is supervised learning?", "Learning from labelled examples", "Supervised models map inputs to known outputs from labelled training data."],
          ["What is unsupervised learning?", "Finding patterns in unlabelled data", "Unsupervised methods like clustering discover structure without labels."],
          ["What is reinforcement learning?", "Learning by rewards and punishments", "Agents learn policies by maximising cumulative reward from actions."],
          ["What is the Turing test?", "A test of whether a machine can imitate a human", "A machine passes if an interrogator cannot tell it from a human."]
        ],
        trick: "McCarthy coined AI 1956; ML=data-driven subset; supervised=labelled, unsupervised=unlabelled.",
        tip: "AI vs ML scope and supervised vs unsupervised are the top pairs."
      },
      {
        kind: "tf", name: "AI statements",
        note: "True/false stems on AI fundamentals.",
        statements: [
          ["Machine learning is a subset of artificial intelligence.", "Artificial intelligence is a subset of machine learning."],
          ["Supervised learning uses labelled data.", "Supervised learning uses unlabelled data."],
          ["Clustering is an unsupervised learning method.", "Clustering requires labelled training data."],
          ["Deep learning uses many-layered neural networks.", "Deep learning uses no networks at all."],
          ["Reinforcement learning is driven by rewards.", "Reinforcement learning is driven by SQL queries."]
        ],
        trick: "ML⊂AI, supervised=labels, clustering=unsupervised, deep=many layers, RL=rewards.",
        tip: "Subset-direction statements are the classic trap."
      }
    ],

    "Machine Learning Models": [
      {
        kind: "fact", name: "model facts",
        note: "Common ML models and their uses.",
        facts: [
          ["Which model predicts a continuous value?", "Linear regression", "Linear regression fits a line to predict continuous targets like prices."],
          ["Which model classifies into two classes?", "Logistic regression", "Logistic regression outputs a probability for binary classification."],
          ["Which algorithm splits data by feature thresholds?", "Decision trees", "Decision trees recursively split data on features to reach decisions."],
          ["Which ensemble combines many trees?", "Random forest", "Random forests average many decision trees to reduce overfitting."],
          ["Which algorithm finds clusters of similar points?", "K-means clustering", "K-means partitions data into K clusters by nearest-centroid assignment."],
          ["Which model maps inputs to classes through layers of neurons?", "Neural networks", "Neural networks learn hierarchical features for classification and regression."],
          ["What is overfitting?", "The model learns training noise, not general patterns", "Overfit models score high on training data but poorly on new data."],
          ["What is underfitting?", "The model is too simple to capture the pattern", "Underfit models perform poorly on both training and test data."],
          ["What is the training set?", "The data used to fit the model", "The training set is the labelled data the model learns from; the test set is held-out data used to evaluate how well it generalises."],
          ["What is the test set?", "Held-out data used to evaluate the model", "The test set measures how well the model generalises to unseen data."]
        ],
        trick: "Regression=continuous, tree=splits, forest=many trees, k-means=clusters, overfit=noise.",
        tip: "Regression vs classification and train vs test are the anchor pairs."
      },
      {
        kind: "numeric", name: "accuracy calculations", difficulty: "easy",
        note: "Accuracy = (true positives + true negatives) ÷ total predictions.",
        q: (v) => `A classifier makes ${v.tp} true positives, ${v.tn} true negatives, ${v.fp} false positives and ${v.fn} false negatives. What is its accuracy?`,
        a: (v) => `${(100 * (v.tp + v.tn) / (v.tp + v.tn + v.fp + v.fn)).toFixed(1)}%`,
        e: (v) => `Accuracy = (TP + TN) ÷ total = (${v.tp} + ${v.tn}) ÷ ${v.tp + v.tn + v.fp + v.fn} = ${(100 * (v.tp + v.tn) / (v.tp + v.tn + v.fp + v.fn)).toFixed(1)}%, because only the diagonal of the confusion matrix counts as correct.`,
        distract: (v) => {
          const c = 100 * (v.tp + v.tn) / (v.tp + v.tn + v.fp + v.fn);
          return [`${(100 * (v.tp) / (v.tp + v.fp)).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(100 * (v.tp + v.fp) / (v.tp + v.tn + v.fp + v.fn)).toFixed(1)}%`, `${(c + 10).toFixed(1)}%`, `${(100 * (v.tn) / (v.tn + v.fn)).toFixed(1)}%`];
        },
        vals: (rng) => {
          const tp = 50 + Math.floor(rng() * 100);
          const tn = 50 + Math.floor(rng() * 100);
          const fp = Math.floor(rng() * 20);
          const fn = Math.floor(rng() * 20);
          return { tp, tn, fp, fn };
        },
        whyWrong: (v) => [`Accuracy counts only the diagonal (TP + TN) over the total; precision uses TP ÷ (TP + FP) instead.`],
        trick: "Accuracy = (TP+TN) ÷ total.",
        tip: "Precision answers are deliberately included as distractors."
      },
      {
        kind: "numeric", name: "precision and recall calculations", difficulty: "medium",
        note: "Precision = TP ÷ (TP + FP); recall = TP ÷ (TP + FN).",
        q: (v) => `A model returns ${v.tp} true positives, ${v.fp} false positives and ${v.fn} false negatives. What is its precision?`,
        a: (v) => `${(100 * v.tp / (v.tp + v.fp)).toFixed(1)}%`,
        e: (v) => `Precision = TP ÷ (TP + FP) = ${v.tp} ÷ (${v.tp} + ${v.fp}) = ${(100 * v.tp / (v.tp + v.fp)).toFixed(1)}%, because precision measures how many positive predictions were actually correct.`,
        distract: (v) => {
          const c = 100 * v.tp / (v.tp + v.fp);
          return [`${(100 * v.tp / (v.tp + v.fn)).toFixed(1)}%`, `${(100 * v.fp / (v.tp + v.fp)).toFixed(1)}%`, `${(c * 2).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${(100 * (v.tp + v.fn) / (v.tp + v.fp + v.fn + 50)).toFixed(1)}%`];
        },
        vals: (rng) => {
          const tp = 60 + Math.floor(rng() * 100);
          const fp = 5 + Math.floor(rng() * 40);
          const fn = 5 + Math.floor(rng() * 40);
          return { tp, fp, fn };
        },
        whyWrong: (v) => [`Precision divides by (TP + FP); dividing by (TP + FN) computes recall, the classic confusion.`],
        trick: "Precision = TP ÷ (TP + FP) — the positive-predicted denominator.",
        tip: "Recall = TP ÷ (TP + FN) — the actual-positive denominator."
      },
      {
        kind: "numeric", name: "F1 score calculations", difficulty: "hard",
        note: "F1 = 2 × (precision × recall) ÷ (precision + recall).",
        q: (v) => `A model has precision ${v.p}% and recall ${v.r}%. What is its F1 score?`,
        a: (v) => `${(2 * v.p * v.r / (v.p + v.r)).toFixed(1)}%`,
        e: (v) => `F1 = 2PR ÷ (P + R) = 2 × ${v.p} × ${v.r} ÷ (${v.p} + ${v.r}) = ${(2 * v.p * v.r / (v.p + v.r)).toFixed(1)}%, because F1 is the harmonic mean balancing precision and recall.`,
        distract: (v) => {
          const c = 2 * v.p * v.r / (v.p + v.r);
          return [`${((v.p + v.r) / 2).toFixed(1)}%`, `${(c * 1.1).toFixed(1)}%`, `${(v.p).toFixed(1)}%`, `${(c * 0.5).toFixed(1)}%`, `${((v.p * v.r) / 100).toFixed(1)}%`];
        },
        vals: (rng) => {
          const p = 60 + Math.floor(rng() * 35);
          const r = 50 + Math.floor(rng() * 45);
          return { p, r };
        },
        whyWrong: (v) => [`F1 is the harmonic mean: 2PR/(P+R); the arithmetic mean is always the tempting distractor.`],
        trick: "F1 = 2PR ÷ (P + R) — harmonic, not arithmetic.",
        tip: "F1 lies between precision and recall, closer to the smaller one."
      },
      {
        kind: "numeric", name: "entropy calculations", difficulty: "hard",
        note: "Entropy = −p log₂p − q log₂q for a two-class distribution.",
        q: (v) => `A dataset has ${v.p}% of one class and ${v.q}% of another. What is the entropy of the dataset to two decimals?`,
        a: (v) => `${(v.H).toFixed(2)} bits`,
        e: (v) => `Entropy = −(p log₂p + q log₂q) = −(${v.p}% log₂ ${v.p}% + ${v.q}% log₂ ${v.q}%) = ${v.H.toFixed(2)} bits, because entropy measures the impurity of the class distribution, peaking at a 50/50 split.`,
        distract: (v) => {
          const c = v.H;
          return [`${(2 - c).toFixed(2)} bits`, `${(c * 1.5).toFixed(2)} bits`, `${(c * 0.5).toFixed(2)} bits`, `${(c + 0.5).toFixed(2)} bits`, `${Math.abs(c - 1).toFixed(2)} bits`];
        },
        vals: (rng) => {
          const p = 5 + Math.floor(rng() * 45);
          const q = 100 - p;
          const H = -(p / 100 * Math.log2(p / 100) + q / 100 * Math.log2(q / 100));
          return { p, q, H };
        },
        whyWrong: (v) => [`Entropy peaks at 1 bit for a 50/50 split; uneven splits give lower values, and the mirror value 2−H is a decoy.`],
        trick: "H = 1 at 50/50, 0 at pure splits.",
        tip: "log₂ means the maximum is exactly 1 bit for two classes."
      }
    ],

    "AI Applications": [
      {
        kind: "fact", name: "application facts",
        note: "Where AI is applied in the real world.",
        facts: [
          ["Which AI technique powers ChatGPT-style tools?", "Large language models", "LLMs predict the next token in text, trained on massive corpora."],
          ["What is NLP?", "Natural language processing", "Natural language processing lets computers understand, interpret and generate human language such as text and speech."],
          ["Which field lets computers 'see' images?", "Computer vision", "Computer vision classifies and detects objects in images and video."],
          ["What is a chatbot?", "A program that converses with users", "Chatbots simulate conversation for support, sales and assistance."],
          ["What is the use of AI in healthcare?", "Diagnosis and medical image analysis", "AI models read scans and assist doctors in diagnosing diseases."],
          ["What is autonomous driving?", "Vehicles that drive themselves with AI", "Self-driving cars use sensors and ML to navigate without human control."],
          ["What is speech recognition?", "Converting spoken words into text", "Speech recognition powers voice assistants and transcription tools."],
          ["What is a recommendation system?", "AI that suggests items a user may like", "Recommendation engines drive Netflix, YouTube and e-commerce suggestions."],
          ["What is an LLM?", "A large neural network trained on text", "Large language models generate fluent text by predicting sequences of tokens."],
          ["What is a hallucination in AI?", "The model confidently inventing false information", "Hallucinations occur when models generate plausible but untrue content."]
        ],
        trick: "LLM=text prediction, NLP=language, vision=images, chatbot=conversation, hallucination=fabrication.",
        tip: "Application-technology pairs are the top modern-AI items."
      },
      {
        kind: "tf", name: "application statements",
        note: "True/false stems on applications.",
        statements: [
          ["LLMs generate text by predicting the next token.", "LLMs search the internet for every answer."],
          ["Computer vision processes images and video.", "Computer vision only processes audio files."],
          ["A hallucination is a confidently false AI output.", "A hallucination is a perfectly verified fact."],
          ["NLP handles human language.", "NLP handles database schemas only."],
          ["Recommendation systems suggest items based on user data.", "Recommendation systems randomly pick items."]
        ],
        trick: "LLM=tokens, vision=images, hallucination=false, NLP=language, recommender=user data.",
        tip: "Swap the medium (audio↔image, internet↔tokens) to flip the answer."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
