/* ============================================================
   Deep Knowledge KB — Machine Learning
   Models, training, evaluation + numeric metric and size topics.
   ============================================================ */
"use strict";
const { makeKbGen } = require("../kb-engine.js");

const kb = {
  subjects: ["machine-learning"],
  chapter: "Machine Learning — Deep Knowledge Bank",
  tags: ["machine-learning", "deep-kb", "ai", "models", "metrics"],
  topics: {

    "ML Fundamentals": [
      {
        kind: "fact", name: "ml basics",
        note: "Core machine learning definitions and tasks.",
        facts: [
          ["What is machine learning?", "Learning patterns from data without explicit rules", "ML systems improve on tasks by learning patterns from examples rather than hand-coded rules."],
          ["What is supervised learning?", "Learning from labelled examples", "Supervised models train on input-output pairs, like images with correct labels."],
          ["What is unsupervised learning?", "Finding structure in unlabelled data", "Unsupervised models group or compress data without any labels, as in clustering."],
          ["What is a training set?", "The data used to teach the model", "The training set is the labelled data the model fits its parameters to."],
          ["What is a test set?", "Held-out data used to evaluate the model", "The test set measures generalisation on examples the model never trained on."],
          ["What is overfitting?", "Memorising training data instead of learning patterns", "Overfit models score well on training data but poorly on new data."],
          ["What is underfitting?", "A model too simple to capture the pattern", "Underfit models miss the underlying relationship, giving poor results on both sets."],
          ["What is a feature?", "A measurable input property of the data", "Features like pixel values or prices are the inputs the model learns from."],
          ["What is a label?", "The correct output for a training example", "Labels are the ground-truth answers supervised models learn to predict."],
          ["What is validation data?", "A slice used to tune the model during training", "Validation data guides early stopping and hyperparameter choices, distinct from test data."],
          ["What is a hyperparameter?", "A setting chosen before training starts", "Hyperparameters like learning rate control training itself, unlike learned parameters."],
          ["What is a model parameter?", "A value the model learns from data", "Weights and biases are parameters fitted to the data during training."]
        ],
        trick: "supervised=labels, unsupervised=no labels, overfit=memorise, validation=tune, test=final check.",
        tip: "Train/test/validation roles and overfitting signs are the most asked ML items."
      },
      {
        kind: "tf", name: "ml statements",
        note: "True/false stems on ML concepts.",
        statements: [
          ["Supervised learning needs labelled examples.", "Supervised learning needs no labels at all."],
          ["Overfitting hurts performance on new data.", "Overfitting only improves generalisation."],
          ["The test set must stay out of training.", "The test set should be reused for training."],
          ["Unsupervised learning finds patterns without labels.", "Unsupervised learning requires labels for every row."],
          ["A feature is a measurable input property.", "A feature is the model's final output."],
          ["Validation data tunes hyperparameters.", "Validation data is the model's final exam set."]
        ],
        trick: "supervised=labels, test=untouched, validation=tuning, overfit=bad generalisation.",
        tip: "Data-split responsibilities are the classic traps."
      }
    ],

    "Models and Algorithms": [
      {
        kind: "fact", name: "algorithm families",
        note: "Common algorithms and what they do.",
        facts: [
          ["What is linear regression?", "Predicting a numeric value from a linear function", "Linear regression fits a line (or plane) relating features to a numeric target."],
          ["What is logistic regression?", "Predicting class probabilities between 0 and 1", "Logistic regression squeezes a linear score through a sigmoid to give probabilities."],
          ["What is a decision tree?", "A model splitting data on rules", "Trees branch on feature thresholds, with leaves holding predictions."],
          ["What is a random forest?", "Many decision trees voted together", "Random forests average many trees on bootstrapped samples to reduce variance."],
          ["What is k-nearest neighbours?", "Predicting from the closest training examples", "KNN labels a point by the majority among its k nearest neighbours."],
          ["What is k-means?", "Clustering data into k groups", "K-means iteratively assigns points to the nearest centroid and moves the centroids."],
          ["What is a neural network?", "Layers of weighted neurons learning features", "Networks stack neurons with activations that transform inputs into predictions."],
          ["What is gradient descent?", "Iteratively moving weights to lower the loss", "Gradient descent follows the slope of the loss to update parameters."],
          ["What is a learning rate?", "How large each weight update is", "The learning rate scales gradient steps; too high diverges, too low crawls."],
          ["What is a support vector machine?", "A model finding the widest class boundary", "SVMs maximise the margin between classes with support vectors."],
          ["What is a convolutional network?", "A network using sliding filters for images", "CNNs slide kernels over images to detect local patterns like edges."],
          ["What is a recurrent network?", "A network with memory for sequences", "RNNs pass hidden states across steps to model ordered data like text."]
        ],
        trick: "KNN=neighbours, k-means=clusters, CNN=images, RNN=sequences, SVM=margin.",
        tip: "Algorithm-purpose pairs are the highest-yield model items."
      },
      {
        kind: "tf", name: "algorithm statements",
        note: "True/false stems on model behaviour.",
        statements: [
          ["Linear regression predicts numeric values.", "Linear regression predicts cluster assignments."],
          ["K-means is an unsupervised clustering method.", "K-means needs labelled training pairs."],
          ["Gradient descent minimises the loss.", "Gradient descent maximises the learning rate."],
          ["CNNs are designed for image-style grid data.", "CNNs are designed for one-number inputs."],
          ["A random forest combines many trees.", "A random forest is a single deep tree."],
          ["KNN predicts from nearest training points.", "KNN predicts from the farthest training points."]
        ],
        trick: "regression=numeric, k-means=clusters, CNN=grids, RNN=sequences, forest=many trees.",
        tip: "Model-name swaps are the classic traps."
      },
      {
        kind: "numeric", name: "model parameter counts", difficulty: "medium",
        note: "Perceptron parameter count = weights + bias.",
        q: (v) => `A perceptron takes ${v.n} inputs. How many trainable parameters (weights plus bias) does it have?`,
        a: (v) => `${v.n + 1}`,
        e: (v) => `The perceptron learns one weight per input plus one bias, so ${v.n} inputs give ${v.n} + 1 = ${v.n + 1} parameters.`,
        distract: (v) => [`${v.n}`, `${v.n * 2}`, `${v.n + 2}`, `${v.n * v.n}`, `${v.n - 1}`],
        vals: (rng) => ({ n: 2 + Math.floor(rng() * 30) }),
        whyWrong: (v) => [`Count one weight per input and add exactly one bias; forgetting the bias or doubling the count are the traps.`],
        trick: "parameters = inputs + 1 (bias).",
        tip: "Bias always adds one extra parameter."
      },
      {
        kind: "numeric", name: "sigmoid threshold outputs", difficulty: "easy",
        note: "Sigmoid outputs approach 1 for large positive scores.",
        q: (v) => `A logistic regression scores an example with z = ${v.z}. Rounded to two decimals, what is its sigmoid probability σ(z) = 1/(1 + e⁻ᶻ)?`,
        a: (v) => `${(1 / (1 + Math.exp(-v.z))).toFixed(2)}`,
        e: (v) => `σ(${v.z}) = 1/(1 + e⁻⁽${v.z}⁾) = 1/(1 + ${Math.exp(-v.z).toFixed(3)}) = ${(1 / (1 + Math.exp(-v.z))).toFixed(2)}, so a large positive score gives a probability near 1.`,
        distract: (v) => {
          const p = 1 / (1 + Math.exp(-v.z));
          return [`${(1 - p).toFixed(2)}`, `${(p + 0.1).toFixed(2)}`, `${(p - 0.1).toFixed(2)}`, `${(p * 2 > 1 ? (1 - p + 0.05).toFixed(2) : (p * 2).toFixed(2))}`, `${(p * 1.5 > 1 ? (1 - p).toFixed(2) : (p * 1.5).toFixed(2))}`];
        },
        vals: (rng) => {
          const neg = rng() < 0.5;
          const z = neg ? -(1 + Math.floor(rng() * 4)) : 1 + Math.floor(rng() * 4);
          return { z };
        },
        whyWrong: (v) => [`The sigmoid never outputs below 0 or above 1; the complement 1 − σ(z) is the deliberate distractor.`],
        trick: "Positive z → σ near 1; negative z → σ near 0.",
        tip: "Memorise σ(0) = 0.5 and the 0-1 range."
      },
      {
        kind: "numeric", name: "knn distance grids", difficulty: "medium",
        note: "Manhattan distance sums absolute differences.",
        q: (v) => `Point A is at (${v.x1}, ${v.y1}) and point B at (${v.x2}, ${v.y2}). What is the Manhattan distance between them?`,
        a: (v) => `${Math.abs(v.x1 - v.x2) + Math.abs(v.y1 - v.y2)}`,
        e: (v) => `Manhattan distance = |${v.x1} − ${v.x2}| + |${v.y1} − ${v.y2}| = ${Math.abs(v.x1 - v.x2)} + ${Math.abs(v.y1 - v.y2)} = ${Math.abs(v.x1 - v.x2) + Math.abs(v.y1 - v.y2)} units, summing the absolute axis differences.`,
        distract: (v) => {
          const d = Math.abs(v.x1 - v.x2) + Math.abs(v.y1 - v.y2);
          return [`${d + 2}`, `${d - 2 >= 0 ? d - 2 : d + 4}`, `${d * 2}`, `${d + 1}`, `${d - 1 >= 0 ? d - 1 : d + 3}`];
        },
        vals: (rng) => {
          const x1 = Math.floor(rng() * 20), y1 = Math.floor(rng() * 20);
          const x2 = Math.floor(rng() * 20), y2 = Math.floor(rng() * 20);
          if (x1 === x2 && y1 === y2) return { x1, y1, x2: x1 + 1, y2 };
          return { x1, y1, x2, y2 };
        },
        whyWrong: (v) => [`Manhattan sums the absolute axis differences; the straight-line Euclidean distance or plain subtraction are the traps.`],
        trick: "Manhattan = |Δx| + |Δy|.",
        tip: "Manhattan adds, Euclidean roots — read which one is asked."
      },
      {
        kind: "numeric", name: "cross-entropy error terms", difficulty: "hard",
        note: "Log loss contribution = −log(p) for the true class.",
        q: (v) => `A model assigns probability ${v.p} to the correct class. Rounded to three decimals, what is its log-loss contribution −log(p)?`,
        a: (v) => `${(-Math.log(v.p)).toFixed(3)}`,
        e: (v) => `Log loss = −ln(${v.p}) = ${(-Math.log(v.p)).toFixed(3)}, so the loss grows as the correct-class probability shrinks.`,
        distract: (v) => {
          const l = -Math.log(v.p);
          return [`${(l * 2).toFixed(3)}`, `${(l * 0.5).toFixed(3)}`, `${(1 - v.p).toFixed(3)}`, `${(l + 0.5).toFixed(3)}`, `${(l * 1.5).toFixed(3)}`];
        },
        vals: (rng) => {
          const p = Math.round((0.1 + rng() * 0.85) * 1000) / 1000;
          return { p };
        },
        whyWrong: (v) => [`Take the negative natural log of the true-class probability; the error 1 − p or a doubled log are the traps.`],
        trick: "loss = −ln(p_true), grows as p shrinks.",
        tip: "p → 1 makes loss → 0; p → 0 makes loss → ∞."
      }
    ],

    "Evaluation and Metrics": [
      {
        kind: "fact", name: "evaluation concepts",
        note: "How models are scored.",
        facts: [
          ["What is accuracy?", "The share of correct predictions overall", "Accuracy divides correct predictions by all predictions, fine for balanced data."],
          ["What is precision?", "Correct positives among predicted positives", "Precision divides true positives by all positives the model flagged."],
          ["What is recall?", "Correct positives among actual positives", "Recall divides true positives by all real positives, catching how many are found."],
          ["What is an F1 score?", "The harmonic mean of precision and recall", "F1 balances precision and recall, useful when classes are imbalanced."],
          ["What is a confusion matrix?", "A table of predicted versus actual classes", "The matrix shows TP, FP, FN and TN counts in one grid, splitting every case by prediction and truth."],
          ["What is a false positive?", "Predicting positive when the truth is negative", "False positives are alarms raised that should not have been."],
          ["What is a false negative?", "Missing a positive that was actually true", "False negatives are missed detections, dangerous in medical screening."],
          ["What is a ROC curve?", "True positive rate against false positive rate", "ROC plots TPR versus FPR across thresholds; the area under it is AUC."],
          ["What is cross-validation?", "Repeatedly training on data folds", "Cross-validation rotates the train/test split to get stable estimates."],
          ["What is an ROC-AUC of 1?", "A perfectly separating classifier", "AUC 1 means thresholds perfectly rank all positives above negatives."],
          ["What is an ROC-AUC of 0.5?", "A classifier no better than chance", "AUC 0.5 matches random guessing on balanced data, the baseline to beat."]
        ],
        trick: "precision=predictions base, recall=positives base, F1=harmonic, AUC 1=perfect, 0.5=chance.",
        tip: "Precision vs recall wording and the AUC scale are the most asked evaluation items."
      },
      {
        kind: "tf", name: "metric statements",
        note: "True/false stems on metrics.",
        statements: [
          ["Precision uses predicted positives as the base.", "Precision divides by actual positives."],
          ["Recall measures how many real positives are found.", "Recall counts only true negatives."],
          ["F1 is the harmonic mean of precision and recall.", "F1 is the arithmetic mean of accuracy and loss."],
          ["AUC of 0.5 means chance-level ranking.", "AUC of 0.5 means perfect ranking."],
          ["A false positive is a wrong alarm.", "A false positive is a missed real case."],
          ["Cross-validation reuses data across folds.", "Cross-validation trains on the test set only."]
        ],
        trick: "precision=predicted base, recall=real base, FP=wrong alarm, FN=missed case.",
        tip: "Base-of-division swaps are the classic traps."
      },
      {
        kind: "numeric", name: "confusion matrix sizes", difficulty: "medium",
        note: "Matrix cells from given totals via arithmetic.",
        q: (v) => `A test set has ${v.p} real positives and ${v.n} real negatives. The classifier makes ${v.fp} false positives. How many true positives does it score if recall is ${v.r}%?`,
        a: (v) => `${Math.round(v.p * v.r / 100)}`,
        e: (v) => `True positives = recall × actual positives = ${v.r}% × ${v.p} = ${Math.round(v.p * v.r / 100)}, while false positives come from the negatives.`,
        distract: (v) => {
          const tp = Math.round(v.p * v.r / 100);
          return [`${tp + 1}`, `${tp - 1 >= 0 ? tp - 1 : tp + 2}`, `${Math.round(v.p * (100 - v.r) / 100)}`, `${v.fp}`, `${Math.round(v.n * v.r / 100)}`];
        },
        vals: (rng) => {
          const p = 100 + Math.floor(rng() * 900) * 10;
          const n = 100 + Math.floor(rng() * 900) * 10;
          const r = 60 + Math.floor(rng() * 40);
          const fp = Math.floor(rng() * 50);
          return { p, n, fp, r };
        },
        whyWrong: (v) => [`Multiply recall by the ACTUAL positives, not the negatives; the missed count (100 − recall)% is the deliberate distractor.`],
        trick: "TP = recall × actual positives.",
        tip: "Attach every percentage to its correct base population."
      },
      {
        kind: "numeric", name: "precision recall pairs", difficulty: "hard",
        note: "Precision given TP and FP counts.",
        q: (v) => `A classifier produces ${v.tp} true positives and ${v.fp} false positives. What is its precision, rounded to two decimals?`,
        a: (v) => `${(v.tp / (v.tp + v.fp)).toFixed(2)}`,
        e: (v) => `Precision = TP ÷ (TP + FP) = ${v.tp} ÷ (${v.tp} + ${v.fp}) = ${(v.tp / (v.tp + v.fp)).toFixed(2)}, the share of flagged positives that are real.`,
        distract: (v) => {
          const p = v.tp / (v.tp + v.fp);
          return [`${(1 - p).toFixed(2)}`, `${(p + 0.1 > 1 ? (p - 0.1).toFixed(2) : (p + 0.1).toFixed(2))}`, `${(p * 0.9).toFixed(2)}`, `${(v.fp / (v.tp + v.fp)).toFixed(2)}`, `${(p * 1.1 > 1 ? (p - 0.05).toFixed(2) : (p * 1.1).toFixed(2))}`];
        },
        vals: (rng) => {
          const tp = 50 + Math.floor(rng() * 450);
          const fp = 5 + Math.floor(rng() * 120);
          return { tp, fp };
        },
        whyWrong: (v) => [`Divide TP by ALL predicted positives (TP + FP); dividing by actual positives alone (TP + FN) computes recall instead.`],
        trick: "precision = TP/(TP+FP), recall = TP/(TP+FN).",
        tip: "The denominator decides the metric — check it first."
      }
    ]
  }
};

module.exports = [makeKbGen(kb)];
