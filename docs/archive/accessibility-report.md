# Accessibility Report — Pakistan MCQs Hub

*Generated 2026-07-31 · Phase 3*

## Checks performed

| Check | Status |
|---|---|
| Skip-to-content link on both pages | OK |
| Semantic landmarks (header / nav / main / footer) | OK |
| All views hidden with `hidden` attribute (not display:none hacks) | OK |
| Buttons have accessible names (icon buttons carry `aria-label`) | OK |
| Selects have `<label>` wrappers (subject, chapter, topic, subtopic, difficulty, exam, year, type) | OK |
| aria-live regions for dynamic lists (`browseList`) | OK |
| Toast notifications use `role="status"` | OK |
| Palette question buttons carry `aria-label="Go to question N"` | OK |
| Color contrast — dark green (#01411c) / white and gold text on dark backgrounds | OK (checked against WCAG AA) |
| Focus styles on interactive elements | OK (visible outlines retained) |
| Dark/light theme toggle persisted | OK |

## Phase 3 additions (built accessible from the start)

| Feature | Accessibility notes |
|---|---|
| Subtopic filter | Label-wrapped select; disabled until chapter selected |
| Related questions | Real `<button>` elements with `title` tooltip; full question text in the accessible name |
| AI Study Planner | Semantic list (`planner-day` rows) with labeled buttons |
| Monthly / Weekly challenges | Text updates in paragraphs (readable by AT); claim buttons are real buttons |
| Papers as quick quiz | Grid cards with labeled buttons, same pattern as existing quiz cards |
| Admin tabs | `role="tablist"` + `role="tab"` (existing pattern kept) |

## Verified via DOM-stub integration tests

- 20/20 frontend smoke tests pass (browse subtopic cascade, related view, planner rows, challenges, paper quizzes).
- 11/11 admin smoke tests pass (subject/topic managers, explanation manager, AI generator, TSV import).
- All buttons created by JS handlers have text content or aria-labels; no new icon-only buttons added.

## Recommendations

1. Run a real screen-reader pass (NVDA/VoiceOver) on the quiz timer and exam palette flows.
2. Consider `prefers-reduced-motion` for the progress-fill transition (minor).
3. Keyboard-flow check: all views are reachable via tab; the certificate modal traps focus only implicitly — add explicit focus management if modal use grows.

## Verdict

No new accessibility regressions introduced in Phase 3; existing AA-grade baseline maintained across all new UI (filters, challenges, planner, generator).
