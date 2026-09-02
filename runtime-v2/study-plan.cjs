/* runtime-v2/study-plan.cjs — AI Study Plan Generator */
"use strict";
const fs = require("fs");
const path = require("path");
const { config } = require("./config.cjs");
const CQ = require("./content-query.cjs");
const FC = require("./flashcards.cjs");

/* ---------- Data file ---------- */
const PLANS_FILE = path.join(config.indexDir, "study_plans.json");

function loadPlans() {
  if (!fs.existsSync(PLANS_FILE)) return {};
  return JSON.parse(fs.readFileSync(PLANS_FILE, "utf8"));
}

function savePlans(plans) {
  fs.writeFileSync(PLANS_FILE, JSON.stringify(plans, null, 2));
}

/* ---------- Local Plan Generator (no AI required) ---------- */

const PLAN_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getTodayIndex() {
  const d = new Date();
  return (d.getDay() + 6) % 7; /* 0=Monday */
}

function getWeakTopics() {
  /* This would normally come from user analytics */
  /* For now, return common weak areas for Pakistani exams */
  return [
    { topic: "pakistan-affairs", subject: "pakistan-affairs", priority: "high", reason: "Core subject for all exams" },
    { topic: "current-affairs", subject: "current-affairs", priority: "high", reason: "Frequently tested" },
    { topic: "islamic-studies", subject: "islamic-studies", priority: "medium", reason: "Required for PPSC/FPSC" },
    { topic: "english", subject: "english", priority: "medium", reason: "Grammar & vocabulary" },
    { topic: "general-knowledge", subject: "general-knowledge", priority: "medium", reason: "Broad coverage needed" },
  ];
}

function getContentBySubject(subject, limit = 10) {
  const content = CQ.getBySubject(subject, 1, limit);
  return content.results || [];
}

function getFlashcardsDue(limit = 20) {
  return FC.getDueCards(FC.loadFlashcards(), limit);
}

function generateLocalPlan(days = 7, hoursPerDay = 2) {
  const weakTopics = getWeakTopics();
  const todayIdx = getTodayIndex();
  const plan = [];
  
  /* Distribute topics across days */
  const topicQueue = [...weakTopics].sort((a, b) => (b.priority === "high") - (a.priority === "high"));
  
  for (let i = 0; i < days; i++) {
    const dayIdx = (todayIdx + i) % 7;
    const dayName = PLAN_DAYS[dayIdx];
    const isWeekend = dayIdx >= 5;
    const dayHours = isWeekend ? hoursPerDay + 1 : hoursPerDay;
    const slots = [];
    
    /* Morning slot - Content reading */
    const topic = topicQueue.shift() || weakTopics[i % weakTopics.length];
    const content = getContentBySubject(topic.subject, 3);
    slots.push({
      time: "09:00-10:30",
      type: "content",
      title: `Study: ${topic.subject.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}`,
      description: `Read ${content.length} content blocks on ${topic.topic}`,
      duration: 90,
      subject: topic.subject,
      contentIds: content.map(c => c.id),
      priority: topic.priority
    });
    
    /* Mid-day slot - Flashcards */
    const dueCards = getFlashcardsDue(20);
    slots.push({
      time: "14:00-15:00",
      type: "flashcards",
      title: "Flashcard Review",
      description: `${dueCards.length} cards due for spaced repetition`,
      duration: 60,
      subject: "all",
      cardIds: dueCards.map(c => c.id),
      priority: "high"
    });
    
    /* Evening slot - Practice MCQs */
    slots.push({
      time: "19:00-20:00",
      type: "practice",
      title: "Practice MCQs",
      description: `20 questions from ${topic.subject}`,
      duration: 60,
      subject: topic.subject,
      questionCount: 20,
      priority: "high"
    });
    
    topicQueue.push(topic); /* Rotate */
    
    plan.push({
      day: i + 1,
      date: getDateString(i),
      dayName,
      totalHours: dayHours,
      slots,
      completed: false,
      completionRate: 0
    });
  }
  
  return plan;
}

function getDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/* ---------- AI-Enhanced Plan (with prompt) ---------- */

const PLAN_PROMPT = (userProfile, weakTopics, preferences) => `
You are an expert study planner for Pakistani competitive exams (PPSC, FPSC, NTS, CSS, PMS).
Create a ${preferences.days}-day study plan with ${preferences.hoursPerDay} hours/day.

User Profile:
- Target exams: ${userProfile.targetExams?.join(", ") || "PPSC, FPSC, NTS"}
- Strong subjects: ${userProfile.strongSubjects?.join(", ") || "None identified"}
- Weak topics: ${weakTopics.map(w => `${w.topic} (${w.subject}) - ${w.reason}`).join("; ")}
- Current flashcards due: ${userProfile.flashcardsDue || 0}
- Study library size: ${userProfile.librarySize || 0} items
- Preferred study times: ${preferences.preferredTimes?.join(", ") || "Morning & Evening"}

Requirements:
- Balance content reading, flashcard review, and MCQ practice
- Focus on weak topics but maintain strong ones
- Include weekend catch-up sessions
- Each day: 3 slots (content, flashcards, practice)
- Return JSON array of days with: day, date, dayName, totalHours, slots[{time, type, title, description, duration, subject, priority, contentIds?, cardIds?, questionCount?}]
`;

async function generateAIPlan(userProfile, preferences) {
  const AIProvider = require("./providers/ai-provider.cjs");
  const st = AIProvider.status ? AIProvider.status() : { configured: false };
  
  if (!st.configured) {
    return generateLocalPlan(preferences.days, preferences.hoursPerDay);
  }
  
  try {
    const weakTopics = getWeakTopics();
    const prompt = PLAN_PROMPT(userProfile, weakTopics, preferences);
    const response = await AIProvider.generateText(prompt, { temperature: 0.4, maxTokens: 3000 });
    const plan = JSON.parse(response);
    return plan;
  } catch (e) {
    console.warn("AI plan generation failed, using local:", e.message);
    return generateLocalPlan(preferences.days, preferences.hoursPerDay);
  }
}

/* ---------- Public API ---------- */

function createPlan(userId, preferences = {}) {
  const prefs = {
    days: preferences.days || 7,
    hoursPerDay: preferences.hoursPerDay || 2,
    targetExams: preferences.targetExams || [],
    preferredTimes: preferences.preferredTimes || ["09:00", "14:00", "19:00"]
  };
  
  const plans = loadPlans();
  const userProfile = {
    targetExams: prefs.targetExams,
    strongSubjects: [],
    weakTopics: getWeakTopics(),
    flashcardsDue: FC.getDueCards(FC.loadFlashcards(), 100).length,
    librarySize: Object.keys(require("./content-query.cjs")._byId || {}).length
  };
  
  /* Generate plan (async but we'll use local for sync) */
  const plan = generateLocalPlan(prefs.days, prefs.hoursPerDay);
  
  const planId = "plan_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const planObj = {
    id: planId,
    userId: userId || "default",
    createdAt: new Date().toISOString(),
    preferences: prefs,
    plan,
    progress: plan.map(() => ({ completed: false, completedSlots: [] })),
    stats: { totalDays: prefs.days, completedDays: 0, totalSlots: plan.reduce((a, d) => a + d.slots.length, 0), completedSlots: 0 }
  };
  
  plans[planId] = planObj;
  savePlans(plans);
  return planObj;
}

function getPlan(planId) {
  const plans = loadPlans();
  return plans[planId] || null;
}

function getUserPlans(userId) {
  const plans = loadPlans();
  return Object.values(plans).filter(p => p.userId === (userId || "default"))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updatePlanProgress(planId, dayIndex, slotIndex, completed) {
  const plans = loadPlans();
  const plan = plans[planId];
  if (!plan) return { error: "Plan not found" };
  
  const dayProgress = plan.progress[dayIndex];
  if (!dayProgress) return { error: "Invalid day" };
  
  if (completed) {
    if (!dayProgress.completedSlots.includes(slotIndex)) {
      dayProgress.completedSlots.push(slotIndex);
    }
  } else {
    const idx = dayProgress.completedSlots.indexOf(slotIndex);
    if (idx >= 0) dayProgress.completedSlots.splice(idx, 1);
  }
  
  /* Check if day fully completed */
  const day = plan.plan[dayIndex];
  if (day && dayProgress.completedSlots.length >= day.slots.length) {
    dayProgress.completed = true;
  } else {
    dayProgress.completed = false;
  }
  
  /* Recalculate stats */
  plan.stats.completedDays = plan.progress.filter(d => d.completed).length;
  plan.stats.completedSlots = plan.progress.reduce((a, d) => a + d.completedSlots.length, 0);
  
  savePlans(plans);
  return { plan: plans[planId] };
}

function deletePlan(planId) {
  const plans = loadPlans();
  if (!plans[planId]) return { error: "Plan not found" };
  delete plans[planId];
  savePlans(plans);
  return { ok: true };
}

function getPlanStats(planId) {
  const plan = getPlan(planId);
  if (!plan) return null;
  return {
    ...plan.stats,
    progressPercent: plan.stats.totalSlots ? Math.round((plan.stats.completedSlots / plan.stats.totalSlots) * 100) : 0,
    daysRemaining: plan.plan.filter((_, i) => !plan.progress[i]?.completed).length
  };
}

module.exports = {
  createPlan,
  getPlan,
  getUserPlans,
  updatePlanProgress,
  deletePlan,
  getPlanStats,
  generateLocalPlan,
  generateAIPlan,
  PLANS_FILE
};