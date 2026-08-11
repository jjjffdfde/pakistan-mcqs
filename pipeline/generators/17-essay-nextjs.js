/* ============================================================
   Generator file 17 — Essay Writing + Next.js (last two gaps)
   Original authored facts.
   ============================================================ */
"use strict";
const L = require("../lib.js");

function makeGen(subjectId, chapterName, facts) {
  const topics = Object.keys(facts);
  return {
    subjects: [subjectId],
    name: chapterName,
    topics,
    tags: [subjectId],
    generate(rng, topicName) {
      const pool = facts[topicName].map(([q, a, e]) => ({ q, a, e }));
      return L.factGenerator(pool, [])(rng);
    }
  };
}

module.exports = [
  makeGen("essay", "Essay Writing — Structure & Style", {
    "Essay Structure": [
      ["Which three parts form the classic essay structure?", "introduction, body and conclusion", "Every standard essay has an introduction, a body and a conclusion."],
      ["What is the first sentence of an essay called?", "the hook", "The hook grabs the reader's attention at the start."],
      ["What is the core claim of an essay called?", "the thesis statement", "The thesis states the main argument in one clear sentence."],
      ["Where should the thesis statement appear?", "at the end of the introduction", "The thesis usually closes the introductory paragraph."],
      ["Which part of the essay develops the argument?", "the body paragraphs", "Body paragraphs develop the thesis with evidence and examples."],
      ["What does a topic sentence do?", "states the main idea of a paragraph", "A topic sentence introduces the paragraph's central point."],
      ["Which section summarises the essay?", "the conclusion", "The conclusion restates the thesis and closes the argument."],
      ["How long is the standard five-paragraph essay?", "five paragraphs", "The five-paragraph essay has an introduction, three body paragraphs and a conclusion."],
      ["Which words link paragraphs smoothly?", "transitional words", "Transitions such as however and moreover connect ideas."],
      ["What is an outline used for?", "planning the essay before writing", "An outline organises points before drafting."]
    ],
    "Essay Types": [
      ["Which essay type tells a story?", "narrative essay", "A narrative essay tells a story with characters and events."],
      ["Which essay type paints a picture with words?", "descriptive essay", "Descriptive essays use sensory details to describe."],
      ["Which essay type explains a topic?", "expository essay", "An expository essay explains facts without personal opinion."],
      ["Which essay type defends a position?", "argumentative essay", "An argumentative essay takes a stance and supports it with evidence."],
      ["Which essay type aims to convince readers?", "persuasive essay", "Persuasive essays appeal to emotion and logic to convince."],
      ["What is the difference between editing and proofreading?", "editing improves content, proofreading fixes errors", "Editing works on structure and clarity; proofreading checks grammar and typos."],
      ["Which type of essay compares two things?", "compare and contrast essay", "Compare-and-contrast essays examine similarities and differences."],
      ["What is plagiarism in essay writing?", "using others' work without credit", "Plagiarism is presenting borrowed work as your own."]
    ]
  }),
  makeGen("next-js", "Next.js — Framework Concepts", {
    "Routing and Rendering": [
      ["Which directory is used for file-based routing in Next.js App Router?", "app", "In the App Router, routes are defined by files in the app directory."],
      ["Which naming convention creates a dynamic route segment?", "square brackets like [id]", "A segment wrapped in square brackets becomes a dynamic route parameter."],
      ["Which file defines the root layout in the App Router?", "app/layout.js", "The root layout wraps every page in the app."],
      ["Which component renders an error boundary in the App Router?", "error.js", "error.js defines a client-side error boundary for a route."],
      ["Which function enables static site generation in the App Router?", "generateStaticParams", "generateStaticParams pre-renders routes at build time."],
      ["What does SSR stand for in Next.js?", "Server-Side Rendering", "SSR renders pages on the server for each request."],
      ["Which directive marks a component as client-side in the App Router?", "use client", "The use client directive opts a component into client rendering."],
      ["What does ISR stand for?", "Incremental Static Regeneration", "ISR updates static pages after deployment at set intervals."],
      ["Which file configures a route as API in the App Router?", "route.js", "route.js defines server-side request handlers."],
      ["Which feature enables lazy loading of components?", "next/dynamic", "next/dynamic loads components only when needed."]
    ]
  })
];
