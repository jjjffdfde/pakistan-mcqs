/* Pakistan MCQs Hub - admin panel */
(function () {
  "use strict";

  const LS_KEY = "pmh_admin_mcqs";
  const SUBJECTS_KEY = "pmh_admin_subjects";
  const CHAPS_KEY = "pmh_admin_chapters";
  const TOPICS_KEY = "pmh_admin_topics";
  const CATS_KEY = "pmh_admin_categories";
  const IMGS_KEY = "pmh_admin_images";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let subjects = [], chapters = [], topics = [], mcqs = [], categories = [], images = [];

  /* ---------- persistence ---------- */
  const save = () => localStorage.setItem(LS_KEY, JSON.stringify(mcqs));
  const saveSubjects = () => localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  const saveTopics = () => localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  const toast = (m) => { const t = $("toast"); t.textContent = m; t.hidden = false; clearTimeout(t._tm); t._tm = setTimeout(() => (t.hidden = true), 2000); };

  /* ---------- csv utils ---------- */
  function parseCSV(text) {
    const isTSV = !text.trim().startsWith(",") && text.includes("\t");
    const sep = isTSV ? "\t" : ",";
    const rows = [];
    let row = [], field = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += c;
      } else if (c === '"') inQ = true;
      else if (c === sep) { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        if (field.length || row.length) row.push(field);
        if (row.length) { rows.push(row); row = []; field = ""; }
      } else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter((r) => r.some((c) => c.trim()));
  }

  function toCSV(arr) {
    const quote = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const head = ["id", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "detailedExplanation", "difficulty", "subject", "chapter", "topic", "exam", "year", "tags"];
    const lines = [head.join(",")];
    arr.forEach((m) => lines.push([m.id, m.question, m.optionA, m.optionB, m.optionC, m.optionD, m.correctAnswer, m.detailedExplanation, m.difficulty, m.subject, m.chapter, m.topic, (m.exam || []).join("|"), m.year ?? "", (m.tags || []).join("|")].map(quote).join(",")));
    return lines.join("\n");
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type: type || "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ---------- validation ---------- */
  function validate(m) {
    const errs = [];
    if (!m.question) errs.push("question missing");
    ["optionA", "optionB", "optionC", "optionD"].forEach((k) => { if (!m[k]) errs.push(k + " missing"); });
    if (!["A", "B", "C", "D"].includes(m.correctAnswer)) errs.push("correctAnswer must be A-D");
    if (!["easy", "medium", "hard"].includes(m.difficulty)) errs.push("difficulty must be easy/medium/hard");
    if (!m.subject) errs.push("subject missing");
    if (!m.chapter) errs.push("chapter missing");
    if (!m.topic) errs.push("topic missing");
    if (!m.detailedExplanation) errs.push("detailedExplanation missing");
    return errs;
  }

  function normalize(raw) {
    const key = (m) => {
      if (!m.id) m.id = "imp-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      m.question = String(m.question || "").trim();
      m.optionA = String(m.optionA || ""); m.optionB = String(m.optionB || "");
      m.optionC = String(m.optionC || ""); m.optionD = String(m.optionD || "");
      m.correctAnswer = String(m.correctAnswer || "").toUpperCase().trim();
      m.detailedExplanation = String(m.detailedExplanation || "");
      m.difficulty = ["easy", "medium", "hard"].includes(m.difficulty) ? m.difficulty : "medium";
      m.subject = String(m.subject || "").trim();
      m.chapter = String(m.chapter || "").trim();
      m.topic = String(m.topic || "").trim();
      m.exam = Array.isArray(m.exam) ? m.exam : String(m.exam || "").split("|").map((s) => s.trim()).filter(Boolean);
      m.tags = Array.isArray(m.tags) ? m.tags : String(m.tags || "").split("|").map((s) => s.trim()).filter(Boolean);
      m.year = m.year ? Number(m.year) : null;
      m.createdDate = m.createdDate || new Date().toISOString().slice(0, 10);
      m.updatedDate = new Date().toISOString().slice(0, 10);
      return m;
    };
    return raw.map(key);
  }

  /* ---------- loading ---------- */
  async function load() {
    const fromLS = localStorage.getItem(LS_KEY);
    if (fromLS) { mcqs = JSON.parse(fromLS); }
    else { mcqs = await (await fetch("data/mcqs.json")).json(); }
    const [s, c, t] = await Promise.all([
      fetch("data/subjects.json").then((r) => r.json()),
      fetch("data/chapters.json").then((r) => r.json()),
      fetch("data/topics.json").then((r) => r.json())
    ]);
    subjects = s; chapters = c; topics = t;
    const subLS = localStorage.getItem(SUBJECTS_KEY);
    if (subLS) subjects = JSON.parse(subLS);
    const topLS = localStorage.getItem(TOPICS_KEY);
    if (topLS) topics = JSON.parse(topLS);
    const catLS = localStorage.getItem(CATS_KEY);
    if (catLS) categories = JSON.parse(catLS);
    else categories = await (await fetch("data/categories.json")).json();
    const imgLS = localStorage.getItem(IMGS_KEY);
    images = imgLS ? JSON.parse(imgLS) : [];
  }
  const saveCats = () => localStorage.setItem(CATS_KEY, JSON.stringify(categories));
  const saveImgs = () => localStorage.setItem(IMGS_KEY, JSON.stringify(images));

  /* ---------- tabs ---------- */
  function bindTabs() {
    document.querySelectorAll(".admin-tabs button").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll(".admin-tabs button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      ["stats", "mcqs", "categories", "subjects", "topics", "explanations", "gen", "images", "import", "dups", "export"].forEach((t) => ($("tab-" + t).hidden = t !== b.dataset.tab));
      if (b.dataset.tab === "stats") renderStats();
      if (b.dataset.tab === "mcqs") renderAdmList();
      if (b.dataset.tab === "categories") renderCats();
      if (b.dataset.tab === "subjects") renderSubjects();
      if (b.dataset.tab === "topics") renderTopics();
      if (b.dataset.tab === "explanations") renderExplanations();
      if (b.dataset.tab === "gen") renderGenSetup();
      if (b.dataset.tab === "images") renderImgs();
      if (b.dataset.tab === "dups") renderDups();
    }));
  }

  /* ---------- category manager ---------- */
  function renderCats() {
    const el = $("catList");
    el.innerHTML = "";
    if (!categories.length) { el.innerHTML = '<p class="muted">No categories.</p>'; return; }
    categories.forEach((c, ci) => {
      const card = document.createElement("div");
      card.className = "cat-card";
      const subs = categories[ci].subjects || [];
      card.innerHTML = `
        <div class="admin-row" style="align-items:flex-end">
          <label>Name <input type="text" data-cf="name" value="${esc(c.name)}"></label>
          <label>Icon <input type="text" data-cf="icon" maxlength="2" value="${esc(c.icon || "")}"></label>
          <label>Order <input type="number" data-cf="order" value="${esc(c.order ?? "")}"></label>
          <button class="btn btn-sm btn-primary cat-save" data-i="${ci}">Save</button>
          <button class="btn btn-sm btn-outline cat-del" data-i="${ci}">Delete</button>
        </div>
        <p class="cat-meta">${esc(c.description || "")}</p>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Subjects in this category</label>
        <div class="cat-subjects" id="catsubs-${ci}"></div>
        <div class="admin-row" style="margin-top:8px">
          <label>Add subject
            <select id="catadd-${ci}">
              <option value="">Select subject...</option>
              ${subjects.map((s) => `<option value="${esc(s.id)}" ${subs.includes(s.id) ? "disabled" : ""}>${esc(s.name)}</option>`).join("")}
            </select>
          </label>
        </div>`;
      el.appendChild(card);
      const chips = card.querySelector(`#catsubs-${ci}`);
      subs.forEach((sid) => {
        const sn = subjects.find((s) => s.id === sid);
        if (!sn) return;
        const sp = document.createElement("span");
        sp.textContent = sn.name + " ✕";
        sp.style.cursor = "pointer";
        sp.title = "Remove";
        sp.addEventListener("click", () => {
          categories[ci].subjects = (categories[ci].subjects || []).filter((x) => x !== sid);
          saveCats(); renderCats(); toast("Removed " + sn.name);
        });
        chips.appendChild(sp);
      });
      card.querySelector(`#catadd-${ci}`).addEventListener("change", (e) => {
        if (!e.target.value) return;
        categories[ci].subjects = categories[ci].subjects || [];
        if (!categories[ci].subjects.includes(e.target.value)) categories[ci].subjects.push(e.target.value);
        saveCats(); renderCats(); toast("Added subject");
      });
      card.querySelector(".cat-save").addEventListener("click", () => {
        card.querySelectorAll("[data-cf]").forEach((inp) => {
          const v = inp.value;
          categories[ci][inp.dataset.cf] = inp.dataset.cf === "order" ? (v === "" ? undefined : Number(v)) : v;
        });
        saveCats(); renderCats(); toast("Category saved");
      });
      card.querySelector(".cat-del").addEventListener("click", () => {
        if (!confirm("Delete category " + c.name + "?")) return;
        categories.splice(ci, 1);
        saveCats(); renderCats(); toast("Category deleted");
      });
    });
  }

  /* ---------- subject manager ---------- */
  function renderSubjects() {
    const el = $("subjList");
    el.innerHTML = "";
    if (!subjects.length) { el.innerHTML = '<p class="muted">No subjects.</p>'; return; }
    const cats = new Set(subjects.map((s) => s.category));
    subjects.forEach((s, si) => {
      const card = document.createElement("div");
      card.className = "cat-card";
      const exs = s.exams || [];
      const mcount = mcqs.filter((m) => m.subject === s.id).length;
      card.innerHTML = `
        <div class="admin-row" style="align-items:flex-end">
          <label>Name <input type="text" data-sf="name" value="${esc(s.name)}"></label>
          <label>Icon <input type="text" data-sf="icon" maxlength="3" value="${esc(s.icon || "")}"></label>
          <label>Category <select data-sf="category">${categories.map((c) => `<option value="${esc(c.id)}" ${s.category === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
          <label>Order <input type="number" data-sf="order" value="${esc(s.order ?? "")}"></label>
          <label>Status <select data-sf="status"><option value="active" ${s.status !== "reference" ? "selected" : ""}>active</option><option value="reference" ${s.status === "reference" ? "selected" : ""}>reference</option></select></label>
          <button class="btn btn-sm btn-primary subj-save" data-i="${si}">Save</button>
          <button class="btn btn-sm btn-outline subj-del" data-i="${si}">Delete</button>
        </div>
        <p class="cat-meta">${esc(s.description || "")} • ${mcount} MCQs</p>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Exams</label>
        <div class="cat-subjects" id="subjex-${si}"></div>
        <div class="admin-row" style="margin-top:8px">
          <label>Add exam
            <select id="subjaddex-${si}">
              <option value="">Select exam...</option>
              ${stateExams().map((e) => `<option value="${esc(e.id)}" ${exs.includes(e.id) ? "disabled" : ""}>${esc(e.name)}</option>`).join("")}
            </select>
          </label>
        </div>`;
      el.appendChild(card);
      const chips = card.querySelector(`#subjex-${si}`);
      exs.forEach((eid) => {
        const en = stateExams().find((e) => e.id === eid);
        if (!en) return;
        const sp = document.createElement("span");
        sp.textContent = en.name + " ✕";
        sp.style.cursor = "pointer";
        sp.title = "Remove";
        sp.addEventListener("click", () => {
          s.exams = (s.exams || []).filter((x) => x !== eid);
          saveSubjects(); renderSubjects(); toast("Removed " + en.name);
        });
        chips.appendChild(sp);
      });
      card.querySelector(`#subjaddex-${si}`).addEventListener("change", (e) => {
        if (!e.target.value) return;
        s.exams = s.exams || [];
        if (!s.exams.includes(e.target.value)) s.exams.push(e.target.value);
        saveSubjects(); renderSubjects(); toast("Added exam");
      });
      card.querySelector(".subj-save").addEventListener("click", () => {
        card.querySelectorAll("[data-sf]").forEach((inp) => {
          const v = inp.value;
          s[inp.dataset.sf] = inp.dataset.sf === "order" ? (v === "" ? undefined : Number(v)) : v;
        });
        saveSubjects(); renderSubjects(); toast("Subject saved");
      });
      card.querySelector(".subj-del").addEventListener("click", () => {
        if (!confirm("Delete subject " + s.name + "? MCQs referencing it will keep its id but show raw id.")) return;
        subjects.splice(si, 1);
        saveSubjects(); renderSubjects(); toast("Subject deleted");
      });
    });
  }

  const stateExams = () => {
    const exs = [...new Set(mcqs.flatMap((m) => m.exam || []))].sort();
    return exs.map((id) => ({ id, name: id.toUpperCase() }));
  };

  /* ---------- topic manager ---------- */
  function renderTopics() {
    const ch = $("topChapter").value;
    const el = $("topList");
    el.innerHTML = "";
    if (!ch) { el.innerHTML = '<p class="muted">Select a chapter to manage its topics.</p>'; return; }
    const list = topics.filter((t) => t.chapter === ch);
    if (!list.length) { el.innerHTML = '<p class="muted">No topics in this chapter yet - add one above.</p>'; return; }
    list.forEach((t, ti) => {
      const card = document.createElement("div");
      card.className = "cat-card inline-edit";
      card.innerHTML = `
        <div class="admin-row" style="align-items:flex-end">
          <label>Topic name <input type="text" data-tf="name" value="${esc(t.name)}"></label>
          <label>Subtopics (comma separated) <input type="text" data-tf="subtopics" value="${esc((t.subtopics || []).join(", "))}"></label>
          <label>MCQs <input type="text" value="${mcqs.filter((m) => m.topic === t.id).length}" disabled></label>
          <button class="btn btn-sm btn-primary top-save" data-i="${ti}" data-tid="${t.id}">Save</button>
          <button class="btn btn-sm btn-outline top-del" data-i="${ti}" data-tid="${t.id}">Delete</button>
        </div>
        <p class="cat-meta">${esc(t.id)} • chapter: ${esc(chapters.find((c) => c.id === t.chapter)?.name || t.chapter)}</p>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".top-save").forEach((b) => {
      b.addEventListener("click", () => {
        const t = topics.find((x) => x.id == b.dataset.tid);
        const card = b.closest(".cat-card");
        const name = card.querySelector('[data-tf="name"]').value.trim();
        const subs = card.querySelector('[data-tf="subtopics"]').value.split(",").map((s) => s.trim()).filter(Boolean);
        if (!name) { toast("Topic name required"); return; }
        t.name = name;
        t.subtopics = subs;
        saveTopics(); renderTopics(); toast("Topic saved");
      });
    });
    el.querySelectorAll(".top-del").forEach((b) => {
      b.addEventListener("click", () => {
        if (!confirm("Delete topic " + b.dataset.tid + "? MCQs referencing it keep the raw id.")) return;
        topics = topics.filter((x) => x.id !== b.dataset.tid);
        saveTopics(); renderTopics(); toast("Topic deleted");
      });
    });
  }

  /* ---------- explanation manager ---------- */
  function renderExplanations() {
    const filter = $("expFilter").value;
    const el = $("expList");
    el.innerHTML = "";
    let list = mcqs.filter((m) => {
      const len = (m.detailedExplanation || "").length;
      if (filter === "missing") return !len;
      if (filter === "short") return len < 80;
      return true;
    });
    list = list.slice(-80).reverse();
    $("expCount").textContent = list.length + " shown";
    if (!list.length) { el.innerHTML = '<p class="muted">No MCQs match this filter - great explanations everywhere!</p>'; return; }
    list.forEach((m, mi) => {
      const card = document.createElement("div");
      card.className = "mcq-card inline-edit";
      card.innerHTML = `
        <div class="mcq-head"><span class="chip">${esc(m.id)}</span><span class="chip chip-gray">${esc(subjects.find((s) => s.id === m.subject)?.name || m.subject)}</span><span class="chip chip-${m.difficulty === "hard" ? "red" : m.difficulty === "medium" ? "gold" : "gray"}">${esc(m.difficulty)}</span></div>
        <p class="mcq-question">${esc(m.question)}</p>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Explanation (${(m.detailedExplanation || "").length} chars)</label>
        <textarea data-xf="detailedExplanation">${esc(m.detailedExplanation)}</textarea>
        <div class="mcq-actions">
          <button class="btn btn-sm btn-primary exp-save" data-id="${m.id}">Save</button>
          <button class="btn btn-sm btn-outline exp-fill" data-id="${m.id}">Suggest AI version</button>
        </div>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".exp-save").forEach((b) => b.addEventListener("click", () => {
      const m = mcqs.find((x) => x.id == b.dataset.id);
      const card = b.closest(".mcq-card");
      m.detailedExplanation = card.querySelector('[data-xf="detailedExplanation"]').value.trim();
      m.updatedDate = new Date().toISOString().slice(0, 10);
      save();
      toast("Saved explanation for " + m.id);
    }));
    el.querySelectorAll(".exp-fill").forEach((b) => b.addEventListener("click", () => {
      const m = mcqs.find((x) => x.id == b.dataset.id);
      const subj = subjects.find((s) => s.id === m.subject)?.name || m.subject;
      const ch = chapters.find((c) => c.id === m.chapter)?.name || m.chapter;
      let ex = m.detailedExplanation;
      if (!ex || ex.length < 40) ex = "The correct answer is " + m.correctAnswer + ". " + ex + " ";
      if (ex.length < 60) ex += " This topic is frequently tested in " + subj + " papers for PPSC, FPSC, NTS and related exams.";
      ex += " Tip: revise the chapter '" + ch + "' for related questions.";
      b.closest(".mcq-card").querySelector('[data-xf="detailedExplanation"]').value = ex;
      toast("AI explanation suggested - press Save to keep it");
    }));
  }

  /* ---------- AI question generator (verified template drafts) ---------- */
  const GEN_TEMPLATES = [
    { q: "Which strait connects the Persian Gulf with the Gulf of Oman and the Arabian Sea?", a: "Strait of Hormuz", o: ["Strait of Malacca", "Strait of Bab-el-Mandeb", "Bosphorus Strait"], ex: "The Strait of Hormuz is the world's most important oil chokepoint, linking the Persian Gulf to the open ocean." },
    { q: "The Lahore Resolution of 1940 was passed at which session of the All India Muslim League?", a: "Annual session", o: ["Special session in Dhaka", "Delhi session", "Lahore special session"], ex: "The resolution was adopted at the Muslim League's annual session in Lahore on 23 March 1940, and is remembered as the Pakistan Resolution." },
    { q: "Which national animal of Pakistan is also the national animal of India?", a: "Bengal tiger", o: ["Snow leopard", "Markhor", "Indian rhino"], ex: "Although the markhor is Pakistan's national animal, the Bengal tiger is the national animal of India and an important species of the subcontinent's forests." },
    { q: "The river Indus enters Pakistan from which region?", a: "Karakoram / Ladakh", o: ["Kashmir valley", "Gilgit", "Chitral"], ex: "The Indus rises in Tibet, flows through Ladakh and enters Pakistan through the Karakoram, forming the lifeline of the country's agriculture." },
    { q: "Which city of Pakistan is home to Minar-e-Pakistan, the tower marking the 1940 resolution?", a: "Lahore", o: ["Karachi", "Islamabad", "Multan"], ex: "Minar-e-Pakistan stands in Iqbal Park, Lahore, and was completed in 1968 to commemorate the Lahore Resolution of 1940." },
    { q: "Currency notes in Pakistan are issued by which institution?", a: "State Bank of Pakistan", o: ["Ministry of Finance", "National Bank of Pakistan", "Pakistan Mint"], ex: "The State Bank of Pakistan has the sole authority to issue currency notes under the State Bank of Pakistan Act, 1956." },
    { q: "The headquarters of the United Nations is located in which city?", a: "New York", o: ["Geneva", "The Hague", "Vienna"], ex: "The UN headquarters is in New York City, while major UN agencies are spread across Geneva, Vienna, Nairobi and other cities." },
    { q: "The Organisation of Islamic Cooperation (OIC) has its headquarters in which city?", a: "Jeddah", o: ["Riyadh", "Cairo", "Tehran"], ex: "The OIC, the second largest intergovernmental organisation after the UN, is headquartered in Jeddah, Saudi Arabia." },
    { q: "World Water Day is observed every year on which date?", a: "22 March", o: ["5 June", "21 April", "16 October"], ex: "World Water Day on 22 March highlights the importance of freshwater and supports SDG 6 on clean water and sanitation." },
    { q: "The line of control (LOC) between Pakistan and India runs through which region?", a: "Kashmir", o: ["Balochistan", "Sindh", "Punjab plains"], ex: "The LOC emerged from the 1972 Simla Agreement and divides the disputed territory of Jammu and Kashmir between the two countries." }
  ];

  function renderGenSetup() {
    const sSel = $("genSubject");
    sSel.innerHTML = '<option value="">Select subject...</option>' + subjects.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
    const eSel = $("genExam");
    eSel.innerHTML = '<option value="">Any exam</option>' + stateExams().map((e) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join("");
    $("genList").innerHTML = '<p class="muted">Choose a subject, chapter and topic, then press Generate Drafts.</p>';
  }

  function generateDrafts() {
    const subjId = $("genSubject").value;
    const chapId = $("genChapter").value;
    const topId = $("genTopic").value;
    const diff = $("genDifficulty").value;
    const exam = $("genExam").value;
    const count = parseInt($("genCount").value, 10);
    if (!subjId || !chapId || !topId) { toast("Select subject, chapter and topic first"); return; }
    const subj = subjects.find((s) => s.id === subjId);
    const top = topics.find((t) => t.id === topId);
    const drafts = [];
    const used = new Set();
    const KEYS = ["A", "B", "C", "D"];
    GEN_TEMPLATES.forEach((tpl) => {
      const vals = [tpl.a, ...tpl.o].sort(() => Math.random() - 0.5).slice(0, 4);
      while (vals.length < 4) vals.push("None of the above");
      let id = `${subjId}-d${Math.floor(Math.random() * 9000 + 1000)}`;
      while (used.has(id)) id = `${subjId}-d${Math.floor(Math.random() * 9000 + 1000)}`;
      used.add(id);
      const existingTags = new Set(mcqs.filter((m) => m.topic === topId).flatMap((m) => m.tags || []));
      const kw = (top?.name || topId).toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3).slice(0, 2);
      const tagsUniq = [...new Set([...existingTags, ...kw])].slice(0, 4);
      const ex = tpl.ex + " This draft is linked to the topic '" + (top?.name || topId) + "' in " + (subj?.name || subjId) + ", so review the wording before saving.";
      drafts.push({
        id, subject: subjId, chapter: chapId, topic: topId, difficulty: diff, exam: exam ? [exam] : [],
        question: tpl.q, options: vals, correctAnswer: vals.indexOf(tpl.a), detailedExplanation: ex, tags: tagsUniq,
        subjectName: subj?.name, topicName: top?.name
      });
    });
    const el = $("genList");
    el.innerHTML = "";
    drafts.slice(0, count).forEach((d, di) => {
      const card = document.createElement("div");
      card.className = "mcq-card inline-edit";
      card.innerHTML = `
        <div class="mcq-head"><span class="chip">${esc(d.id)}</span><span class="chip chip-gray">${esc(d.subjectName || d.subject)}</span><span class="chip chip-${d.difficulty === "hard" ? "red" : d.difficulty === "medium" ? "gold" : "gray"}">${esc(d.difficulty)}</span><span class="chip chip-gold">draft</span></div>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Question</label>
        <textarea data-gf="question">${esc(d.question)}</textarea>
        <div class="admin-row" style="margin-top:8px">
          ${["A", "B", "C", "D"].map((k, i) => `<label>Option ${k}<input data-go="${i}" value="${esc(d.options[i] || "")}"></label>`).join("")}
        </div>
        <div class="admin-row">
          <label>Correct <select data-gf="correctAnswer">${KEYS.map((k) => `<option ${KEYS[d.correctAnswer] === k ? "selected" : ""}>${k}</option>`).join("")}</select></label>
          <label>Difficulty <select data-gf="difficulty">${["easy", "medium", "hard"].map((x) => `<option ${d.difficulty === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
        </div>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Explanation</label>
        <textarea data-gf="detailedExplanation">${esc(d.detailedExplanation)}</textarea>
        <div class="mcq-actions">
          <button class="btn btn-sm btn-primary gen-save" data-i="${di}">Save MCQ</button>
          <button class="btn btn-sm btn-outline gen-refresh" data-i="${di}">Reshuffle Options</button>
        </div>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".gen-save").forEach((b) => b.addEventListener("click", () => {
      const d = drafts[Number(b.dataset.i)];
      const card = b.closest(".mcq-card");
      const q = card.querySelector('[data-gf="question"]').value.trim();
      const opts = [0, 1, 2, 3].map((i) => card.querySelector(`[data-go="${i}"]`).value.trim());
      const corr = card.querySelector('[data-gf="correctAnswer"]').value;
      const exp = card.querySelector('[data-gf="detailedExplanation"]').value.trim();
      if (!q || opts.some((o) => !o)) { toast("Question and all 4 options are required"); return; }
      if (mcqs.some((m) => m.id === d.id)) { toast("Id collision - click Reshuffle to get a new id"); return; }
      mcqs.push({
        id: d.id, question: q,
        optionA: opts[0], optionB: opts[1], optionC: opts[2], optionD: opts[3],
        correctAnswer: corr, detailedExplanation: exp, difficulty: card.querySelector('[data-gf="difficulty"]').value,
        subject: d.subject, chapter: d.chapter, topic: d.topic, exam: d.exam, year: null,
        subtopic: "", references: [], tags: d.tags,
        createdDate: new Date().toISOString().slice(0, 10), updatedDate: new Date().toISOString().slice(0, 10)
      });
      save();
      card.classList.add("dup-card");
      card.querySelectorAll("button").forEach((x) => (x.disabled = true));
      toast("Saved " + d.id + " - verify correctness in MCQ Manager");
    }));
    el.querySelectorAll(".gen-refresh").forEach((b) => b.addEventListener("click", () => {
      const d = drafts[Number(b.dataset.i)];
      const keys = ["A", "B", "C", "D"];
      const corrVal = d.options[d.correctAnswer];
      const sh = [...d.options].sort(() => Math.random() - 0.5);
      d.options = sh;
      d.correctAnswer = sh.indexOf(corrVal);
      const card = b.closest(".mcq-card");
      keys.forEach((k, i) => { card.querySelector(`[data-go="${i}"]`).value = d.options[i]; });
      card.querySelector('[data-gf="correctAnswer"]').value = keys[d.correctAnswer];
      toast("Options reshuffled - correct answer is now " + keys[d.correctAnswer]);
    }));
  }

  function renderImgs() {
    const el = $("imgList");
    el.innerHTML = "";
    if (!images.length) { el.innerHTML = '<p class="muted">No images yet. Upload one above (PNG / JPG / SVG).</p>'; return; }
    images.forEach((img, i) => {
      const card = document.createElement("div");
      card.className = "img-card";
      card.innerHTML = `
        <img src="${esc(img.data)}" alt="${esc(img.name)}">
        <small>${esc(img.name)} • ${(img.data.length / 1024).toFixed(0)} KB</small>
        <div style="display:flex;gap:6px;justify-content:center">
          <button class="btn btn-sm btn-outline img-copy" data-i="${i}">Copy URL</button>
          <button class="btn btn-sm btn-outline img-del" data-i="${i}">Delete</button>
        </div>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".img-del").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("Delete image?")) return;
      images.splice(Number(b.dataset.i), 1);
      saveImgs(); renderImgs(); toast("Image deleted");
    }));
    el.querySelectorAll(".img-copy").forEach((b) => b.addEventListener("click", () => {
      const url = images[Number(b.dataset.i)].data;
      navigator.clipboard && navigator.clipboard.writeText(url).then(() => toast("Copied data URL"));
    }));
  }

  function renderStats() {
    const ex = new Set(mcqs.flatMap((m) => m.exam || []));
    const subs = new Set(mcqs.map((m) => m.subject));
    const invalid = mcqs.filter((m) => validate(m).length).length;
    $("adminStats").innerHTML = `
      <div><strong>${mcqs.length}</strong><span>Total MCQs</span></div>
      <div><strong>${subs.size}</strong><span>Subjects covered</span></div>
      <div><strong>${ex.size}</strong><span>Exams covered</span></div>
      <div><strong>${invalid}</strong><span>Invalid rows</span></div>
      <div><strong>${findDups().length}</strong><span>Duplicate groups</span></div>`;
  }

  /* ---------- MCQ manager ---------- */
  function renderAdmList() {
    const q = $("admSearch").value.toLowerCase().trim();
    const subj = $("admSubject").value;
    const diff = $("admDifficulty").value;
    let list = mcqs.filter((m) =>
      (!q || m.question.toLowerCase().includes(q) || (m.id || "").includes(q) || (m.tags || []).some((t) => t.toLowerCase().includes(q))) &&
      (!subj || m.subject === subj) &&
      (!diff || m.difficulty === diff));
    list = list.slice(-150).reverse();
    const el = $("admList");
    el.innerHTML = "";
    if (!list.length) { el.innerHTML = '<p class="muted">No MCQs found.</p>'; return; }
    list.forEach((m) => {
      const card = document.createElement("div");
      card.className = "mcq-card inline-edit";
      card.innerHTML = `
        <div class="mcq-head"><span class="chip">${esc(m.id)}</span><span class="chip chip-gray">${esc(subjects.find((s) => s.id === m.subject)?.name || m.subject)}</span><span class="chip chip-${m.difficulty === "hard" ? "red" : m.difficulty === "medium" ? "gold" : "gray"}">${esc(m.difficulty)}</span></div>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Question</label>
        <textarea data-f="question">${esc(m.question)}</textarea>
        <div class="admin-row" style="margin-top:8px">
          ${["A", "B", "C", "D"].map((k) => `<label>Option ${k}<input data-f="option${k}" value="${esc(m["option" + k])}"></label>`).join("")}
        </div>
        <div class="admin-row">
          <label>Correct <select data-f="correctAnswer">${["A", "B", "C", "D"].map((k) => `<option ${m.correctAnswer === k ? "selected" : ""}>${k}</option>`).join("")}</select></label>
          <label>Difficulty <select data-f="difficulty">${["easy", "medium", "hard"].map((d) => `<option ${m.difficulty === d ? "selected" : ""}>${d}</option>`).join("")}</select></label>
        </div>
        <label style="font-size:.78rem;font-weight:700;color:var(--muted)">Explanation</label>
        <textarea data-f="detailedExplanation">${esc(m.detailedExplanation)}</textarea>
        <div class="mcq-actions">
          <button class="btn btn-sm btn-primary adm-save" data-id="${m.id}">Save</button>
          <button class="btn btn-sm btn-outline adm-del" data-id="${m.id}">Delete</button>
        </div>`;
      el.appendChild(card);
    });
    el.querySelectorAll(".adm-save").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.id;
      const m = mcqs.find((x) => x.id === id);
      const card = b.closest(".mcq-card");
      card.querySelectorAll("[data-f]").forEach((inp) => { m[inp.dataset.f] = inp.value; });
      m.updatedDate = new Date().toISOString().slice(0, 10);
      save();
      toast("Saved " + id);
    }));
    el.querySelectorAll(".adm-del").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("Delete " + b.dataset.id + "?")) return;
      mcqs = mcqs.filter((x) => x.id !== b.dataset.id);
      save();
      renderAdmList();
      toast("Deleted " + b.dataset.id);
    }));
  }

  /* ---------- duplicates ---------- */
  function findDups() {
    const seen = new Map();
    mcqs.forEach((m) => {
      const k = m.question.trim().toLowerCase();
      if (!seen.has(k)) seen.set(k, []);
      seen.get(k).push(m);
    });
    return [...seen.values()].filter((g) => g.length > 1);
  }

  function renderDups() {
    const groups = findDups();
    const el = $("dupList");
    el.innerHTML = "";
    if (!groups.length) { el.innerHTML = '<p class="muted">No duplicate questions found.</p>'; return; }
    groups.forEach((g) => {
      const card = document.createElement("div");
      card.className = "dup-card";
      card.innerHTML = `<div class="ids">${g.map((m) => esc(m.id)).join(" , ")}</div><div>${esc(g[0].question)}</div>`;
      el.appendChild(card);
    });
    $("dupRemoveAll").hidden = false;
  }

  /* ---------- import ---------- */
  function runImport(text) {
    const mode = $("impMode").value;
    const type = $("impType").value;
    const log = $("impLog");
    log.hidden = false;
    let imported = [];
    try {
      if (type === "json") {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array of MCQs");
        imported = parsed;
      } else {
        const rows = parseCSV(text);
        if (!rows.length) throw new Error("CSV is empty");
        const CANON = { optiona: "optionA", optionb: "optionB", optionc: "optionC", optiond: "optionD", correctanswer: "correctAnswer", detailedexplanation: "detailedExplanation", q: "question", answer: "correctAnswer", explanation: "detailedExplanation" };
        const head = rows[0].map((h) => CANON[h.trim().toLowerCase().replace(/[^a-z]/g, "")] || h.trim().toLowerCase());
        const body = rows.slice(1);
        imported = body.map((r) => {
          const m = {};
          head.forEach((h, i) => { if (h) m[h] = r[i] ?? ""; });
          return m;
        });
      }
      imported = normalize(imported);
      const errors = [];
      let added = 0, updated = 0, skipped = 0;
      const byId = new Map(mcqs.map((m) => [m.id, m]));
      const byQ = new Map();
      mcqs.forEach((m) => { const k = m.question.trim().toLowerCase(); if (!byQ.has(k)) byQ.set(k, m.id); });
      imported.forEach((m) => {
        const errs = validate(m);
        if (errs.length) { errors.push(`${m.id}: ${errs.join(", ")}`); return; }
        const existing = byId.get(m.id);
        const qdup = byQ.get(m.question.trim().toLowerCase());
        if (existing) {
          if (mode === "replace") { Object.assign(existing, m); existing.updatedDate = m.updatedDate; updated++; }
          else skipped++;
        } else if (qdup && qdup !== m.id) {
          errors.push(`${m.id}: duplicate question text matches ${qdup}`);
        } else {
          mcqs.push(m);
          byId.set(m.id, m);
          byQ.set(m.question.trim().toLowerCase(), m.id);
          added++;
        }
      });
      save();
      log.textContent = `Imported ${imported.length} rows\n  added: ${added}\n  updated: ${updated}\n  skipped (id exists, merge mode): ${skipped}\n${errors.length ? "errors (" + errors.length + "):\n  " + errors.join("\n  ") : "no errors"}`;
      renderStats();
      toast(`Imported ${added} MCQs`);
    } catch (e) {
      log.textContent = "IMPORT FAILED: " + e.message;
    }
  }

  /* ---------- export ---------- */
  function exportJson() {
    const sorted = [...mcqs].sort((a, b) => (a.id || "").localeCompare(b.id || ""));
    download("mcqs.json", JSON.stringify(sorted, null, 1), "application/json");
  }

  /* ---------- init ---------- */
  (async function () {
    try { await load(); } catch (e) { alert("Failed to load data: " + e.message); return; }
    document.documentElement.dataset.theme = localStorage.getItem("pmh_theme") || "light";
    $("darkToggle").textContent = document.documentElement.dataset.theme === "light" ? "🌙" : "☀️";
    $("darkToggle").addEventListener("click", () => {
      const t = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = t;
      localStorage.setItem("pmh_theme", t);
      $("darkToggle").textContent = t === "light" ? "🌙" : "☀️";
    });

    bindTabs();
    renderStats();

    const subjSel = $("admSubject");
    subjSel.innerHTML = '<option value="">All subjects</option>' + subjects.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
    $("admSearch").addEventListener("input", renderAdmList);
    $("admSubject").addEventListener("change", renderAdmList);
    $("admDifficulty").addEventListener("change", renderAdmList);

    $("impRun").addEventListener("click", () => runImport($("impText").value));

    $("catAdd").addEventListener("click", () => {
      const name = $("catName").value.trim();
      if (!name) { toast("Enter a category name"); return; }
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (categories.some((c) => c.id === id)) { toast("Category already exists"); return; }
      categories.push({ id, name, icon: ($("catIcon").value || name.slice(0, 2)).toUpperCase(), description: $("catDesc").value.trim(), subjects: [], order: categories.length + 1 });
      saveCats();
      $("catName").value = ""; $("catIcon").value = ""; $("catDesc").value = "";
      renderCats();
      toast("Category added");
    });

    $("subjCat").innerHTML = categories.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    $("subjAdd").addEventListener("click", () => {
      const name = $("subjName").value.trim();
      if (!name) { toast("Enter a subject name"); return; }
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (subjects.some((s) => s.id === id)) { toast("Subject already exists"); return; }
      subjects.push({ id, name, icon: ($("subjIcon").value || name.slice(0, 2)).toUpperCase(), category: $("subjCat").value, description: $("subjDesc").value.trim(), exams: [], order: subjects.length + 1, status: "active" });
      saveSubjects();
      $("subjName").value = ""; $("subjIcon").value = ""; $("subjDesc").value = "";
      renderSubjects();
      toast("Subject added");
    });

    $("topChapter").innerHTML = '<option value="">Select chapter...</option>' + chapters.map((c) => `<option value="${esc(c.id)}">${esc(subjects.find((s) => s.id === c.subject)?.name || c.subject)} - ${esc(c.name)}</option>`).join("");
    $("topChapter").addEventListener("change", renderTopics);
    $("topAdd").addEventListener("click", () => {
      const ch = $("topChapter").value;
      const name = $("topName").value.trim();
      if (!ch || !name) { toast("Select a chapter and enter a topic name"); return; }
      const subs = $("topSubtopics").value.split(",").map((s) => s.trim()).filter(Boolean);
      const id = "t-" + Date.now().toString(36);
      topics.push({ id, chapter: ch, name, subtopics: subs.length ? subs : ["fundamentals", "practice questions"] });
      saveTopics();
      $("topName").value = ""; $("topSubtopics").value = "";
      renderTopics();
      toast("Topic added");
    });

    $("expFilter").addEventListener("change", renderExplanations);
    $("expEnrich").addEventListener("click", () => {
      let n = 0;
      mcqs.forEach((m) => {
        if ((m.detailedExplanation || "").length >= 80) return;
        const subj = subjects.find((s) => s.id === m.subject)?.name || m.subject;
        const ch = chapters.find((c) => c.id === m.chapter)?.name || m.chapter;
        let ex = m.detailedExplanation || "";
        if (ex.length < 40) ex = "The correct answer is " + m.correctAnswer + ". " + ex;
        if (ex.length < 60) ex += " This topic is frequently tested in " + subj + " papers for PPSC, FPSC, NTS and related exams.";
        ex += " Tip: revise the chapter '" + ch + "' for related questions.";
        m.detailedExplanation = ex;
        m.updatedDate = new Date().toISOString().slice(0, 10);
        n++;
      });
      save();
      renderExplanations();
      renderStats();
      toast("Enriched " + n + " explanations");
    });

    const genSub = $("genSubject"), genCh = $("genChapter"), genTop = $("genTopic");
    genSub.addEventListener("change", () => {
      genCh.innerHTML = '<option value="">Select chapter...</option>' + chapters.filter((c) => c.subject === genSub.value).map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
      genCh.disabled = !genSub.value;
      genTop.innerHTML = '<option value="">Select chapter first</option>';
      genTop.disabled = true;
    });
    genCh.addEventListener("change", () => {
      genTop.innerHTML = '<option value="">Select topic...</option>' + topics.filter((t) => t.chapter === genCh.value).map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
      genTop.disabled = !genCh.value;
    });
    $("genRun").addEventListener("click", generateDrafts);

    $("imgAdd").addEventListener("click", () => {
      const f = $("imgFile").files[0];
      if (!f) { toast("Choose an image first"); return; }
      const name = $("imgName").value.trim() || f.name.replace(/\.[^.]+$/, "");
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result.length > 300000) { toast("Image too large (max ~300 KB)"); return; }
        images.unshift({ name, data: reader.result, added: new Date().toISOString().slice(0, 10) });
        saveImgs(); renderImgs(); toast("Image added");
      };
      reader.readAsDataURL(f);
    });

    $("impFile").addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => { $("impText").value = reader.result; runImport(reader.result); };
      reader.readAsText(f);
    });
    $("impSample").addEventListener("click", () => {
      $("impText").value = [
        "question,optionA,optionB,optionC,optionD,correctAnswer,detailedExplanation,difficulty,subject,chapter,topic,exam,tags",
        "\"Which planet is known as the Red Planet?\",Mars,Venus,Jupiter,Saturn,A,\"Mars appears red due to iron oxide (rust) on its surface.\",easy,general-knowledge,gk-geography,t-51,ppsc|fpsc|nts,planets|mars"
      ].join("\n");
    });

    $("dupRemoveAll").addEventListener("click", () => {
      const keep = new Set();
      const seen = new Set();
      mcqs.forEach((m) => {
        const k = m.question.trim().toLowerCase();
        if (seen.has(k)) return;
        seen.add(k);
        keep.add(m.id);
      });
      const before = mcqs.length;
      mcqs = mcqs.filter((m) => keep.has(m.id));
      save();
      renderDups();
      renderStats();
      toast(`Removed ${before - mcqs.length} duplicates`);
    });

    $("expJson").addEventListener("click", exportJson);
    $("expCsv").addEventListener("click", () => download("mcqs-all.csv", toCSV(mcqs), "text/csv"));
    $("expCategories").addEventListener("click", () => download("categories.json", JSON.stringify(categories, null, 1), "application/json"));
    $("expSubjects").addEventListener("click", () => download("subjects.json", JSON.stringify(subjects, null, 1), "application/json"));
    $("expTopics").addEventListener("click", () => download("topics.json", JSON.stringify(topics, null, 1), "application/json"));
    $("expReset").addEventListener("click", () => {
      if (!confirm("Clear all admin edits and restore the original data files?")) return;
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(CATS_KEY);
      localStorage.removeItem(IMGS_KEY);
      localStorage.removeItem(SUBJECTS_KEY);
      localStorage.removeItem(TOPICS_KEY);
      load().then(() => { renderStats(); renderAdmList(); renderCats(); renderImgs(); toast("Reset to original data"); });
    });
  })();
})();
