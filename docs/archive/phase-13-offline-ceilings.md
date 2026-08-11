# Phase 13 — Offline Generation: Reachability & Honest Ceilings

**Date:** 2026-08-04
**Constraint:** Fully offline, deterministic, no external LLM/API. Every MCQ must
pass Quality Engine 2.0 (10 dimensions, weighted mean ≥ 95) before insertion.
**Policy chosen by owner:** *Reachable-first, honest ceilings.* Expand only where
7,000 genuine MCQs are achievable offline; fill fact-capped subjects to their real
ceiling and document the gap. **Never fabricate volume by recycling/padding.**

---

## The core reality

Offline, the number of MCQs a subject can yield is bounded by **authored
knowledge**, not by compute. Two generator archetypes exist:

| Archetype | Uniqueness comes from | Offline ceiling |
|---|---|---|
| **Parametric** (numeric enumeration) | loop ranges over value tuples | high — thousands, if the underlying quantity is genuinely computed |
| **Fact-pool / KB** (authored facts) | number of authored facts/concepts | low — plateaus at pack size |

Crucially, **the seed does not diversify a parametric question** — the stem is a
pure function of the loop indices. Re-running with a fresh seed only reshuffles
option order and produces the same `qhash` → 0 new rows (the "botany trap"). The
**only** lever for more unique parametric MCQs is a larger enumeration cap over a
range that genuinely extends past what is already in the DB.

## Quality-gated yield (the only number that matters)

Measured as *unique candidates that PASS Quality Engine 2.0*, with the same
metadata enrichment run.js applies at insert time:

| Subject | In DB | Gated-unique available | Reaches 7k offline? |
|---|---:|---:|:--:|
| **physics** | 9,326 ✅ | ~12,978 | **Yes — genuine kinematics/electricity numericals** |
| chemistry | 5,045 | ~577 | No — already above current-generator ceiling |
| biology | 5,013 | ~812 | No — above ceiling |
| computer-science | 5,312 | ~837 | No — above ceiling |
| electronics | 5,049 | ~1,247 | No — above ceiling |
| general-knowledge | 5,086 | ~585 | No — above ceiling |
| cpp / python / java / csharp / c | 5.1k–6.7k | ~9,000 *nominal* | **Illusory** — see below |

### The language "20,000" is illusory
`cpp/python/java/csharp/c` appear to yield ~9k–20k, but that headroom is almost
entirely one template: `In C++, what is the value of 2 + 4?` — arithmetic wearing
a language label, near-identical across all six languages. It clears the gate only
because metadata is perfect and one weak dimension (educational value 80) is
outweighed. Raw (pre-metadata) it scores 92 and QE 2.0 rejects **100%** of it. It
is exactly the padding the mandate forbids, so it is **excluded** from expansion.
The genuine ceiling for these subjects is their concept pools (dozens), i.e. they
are effectively at ceiling until a real code-semantics generator is authored.

## What was done this session (all offline, verified)

1. **run.js infra** — fixed the stale `totals`→`TARGET` early-exit (per-subject
   runs no longer trip the lifetime gate); inject a generous `_cap` so parametric
   enumeration runs deep past existing tuples for exact dup-skip.
2. **Quality Engine 2.0** — 10 dimensions incl. metadata-authenticity &
   fact-consistency; filler banks; distractor category-coherence.
3. **`lib.polishParametric`** — brings bare parametric MCQs to QE 2.0 standard
   (terminal punctuation incl. valid `:` lead-in, causal full-length explanation,
   genuine topic-specific memory trick + exam tip) **without altering the computed
   fact** — so regenerated existing tuples keep hash-identity and are dup-skipped.
4. **Physics expanded 6,210 → 9,326** (+3,116) — genuine, quality-gated, fully
   referenced, **0 duplicate stems**. Proven end-to-end on the production DB.

## Next levers (require authoring, not just running the pipeline)

- **Languages → genuine reachability:** replace the arithmetic code-output template
  with real code-semantics per language (string ops, integer/float division quirks,
  modulo, boolean short-circuit, array indexing, increment/ternary, type coercion).
  Each is a genuine "what does this print" item that differs by language. Estimated
  a few thousand genuine unique per language.
- **Humanities/niche fact-capped subjects (~71, e.g. sociology ~12, anthropology
  ~10):** raising their ceiling requires hand-authored KB packs (concept graph +
  semantic distractor pools). Realistically a handful of subjects per session,
  ~1,000–3,000 genuine each — nowhere near 7,000 without an external knowledge
  source, which the offline constraint forbids.

## Exam-hub stubs — DO NOT bulk-expand
Real exam coverage is via `mcqs.exam_ids` (already >7,000 per exam). These subject
ids are 4-MCQ landing stubs and must be excluded from per-subject expansion:
`ppsc, fpsc, nts, ots, cts, pts, army, issb, police, fia, fia-inspector, ib, nab,
railway, css-exam, pms, navy, paf, punjab-police, asf, anf, sub-inspector,
inspector, assistant-director, election-officer, rescue-1122, pakistan-post,
custom-inspector, income-tax-inspector, motorway-police, sbp, fbr, pma, mod,
teaching, nadra, lesco, mepco, sepco, sngpl, hesco, ssgc, wapda, banking,
educators, lecturer, headmaster, sst, est, teaching-jobs, ajkpsc, bpsc, spsc, kppsc`.
