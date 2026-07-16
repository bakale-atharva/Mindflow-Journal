# Seven-Day Completion Reflection Plan

## Summary

Add a minimal, design-compatible exception to the existing quiet completion spread: a user-controlled Groq **seven-day reflection** and one optional, entry-grounded gentle practice. Keep the current Today, Journal, and Settings navigation; do not create an Insights page, charts, scores, aggregate mood claims, or a recommendations dashboard.

## Drift Policy & Stop Criteria

**STOP IMMEDIATELY AND REVERT if any of the following occur:**
- You need to introduce a new dependency (e.g. `npm install`).
- You touch more than 3 unexpected files outside of the target scope.
- Unresolvable TypeScript/linting errors arise.
- Existing tests fail and you are tempted to change the tests instead of the implementation.

**Revert Instructions:**
- Use `git reset --hard` and `git clean -fd` to revert to a clean state.
- Document the issue in `docs/drift-incidents/`.

## Task Breakdown

### Task 1: Database Migration & Schema (Size: ~1h)
**Objective:** Add `ai_program_reviews` table and types for the completion reflection.
**Style Anchors:**
- [supabase/phase_4_day_3.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/phase_4_day_3.sql) (for migration pattern)
- [supabase/supabase_schema.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/supabase_schema.sql) (for overall schema)

**Implementation Steps:**
1. Create `supabase/phase_5_analytics.sql` that:
   - Creates the `ai_program_reviews` table.
   - Defines columns: user ownership, source-content hash, status, provider/model/safety metadata, generated reflection, generated practice, saved-practice timestamp, and standard timestamps.
   - Applies RLS so users can read only their own review (generation writes are service-role only).
2. Update `supabase_schema.sql` with these changes.
3. Add `ProgramReviewStatus` and typed `ProgramReview` data to source types.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck`.
- [ ] Ensure migration SQL is additive and correct.

### Task 2: Server Action & Groq Generation Path (Size: ~2h)
**Objective:** Create the authenticated actions for program review generation.
**Style Anchors:**
- [src/app/actions.ts:L338](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/app/actions.ts#L338) (for standard action structure).

**Implementation Steps:**
1. Add `generateProgramReview`, `retryProgramReview`, and `keepProgramPractice` actions.
2. Require completed-program status, Groq consent, and ownership.
3. Derive source hash from the seven entries. If hash changes, mark stale.
4. Implement combined safety screening before calling Groq.
5. Request strict JSON output with `reflection` and `practice`. Enforce rejection rules (no diagnoses, etc).
6. Emit `program_review_created` product event without content metadata.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck` and write unit tests for source hashing and completion eligibility.
- [ ] Verify validation logic passes all edge cases (stale vs fresh).

### Task 3: Dashboard UI Updates (Size: ~1.5h)
**Objective:** Add the reflection panel to the completion spread in the Today view.
**Style Anchors:**
- [src/components/today-view.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/today-view.tsx) (for UI layout)

**Implementation Steps:**
1. In `src/components/today-view.tsx`, extend the completion spread with a compact "Looking back" panel.
2. Offer "Create my seven-day reflection" for AI-enabled users. For non-enabled, prompt for consent then offer explicit generation.
3. Render pending, generated, failed/retry, and safety-redirect states.
4. If source entries change (stale review), show "entries changed" notice until regenerated.

**TDD / Validation Checklist:**
- [ ] Run `pnpm lint` and `pnpm typecheck`.
- [ ] Visual QA of the reflection panel and AI-consent flow.

### Task 4: Testing & Verification (Size: ~1h)
**Objective:** Ensure boundaries, unlock timings, and constraints are solid.
**Implementation Steps:**
1. Follow the Test Plan outlined below using the `+mf-test-` disposable account.
2. Confirm the exact behavior for stale vs active states.
3. Confirm RLS and privacy constraints.

**TDD / Validation Checklist:**
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`.
- [ ] Manual verification as per QA steps.

---

## Implementation Changes

- Extend the completed state in `src/components/today-view.tsx`:
  - Retain the completion message, seven-day path, and links to the user’s entries.
  - Add a compact “Looking back” reflection panel below the completion spread.
  - Show the factual statement “7 of 7 entries completed” only; do not interpret moods or derive analytics.
  - For AI-enabled users, offer an explicit **Create my seven-day reflection** action.
  - For users without Groq consent, preserve the completion spread and explain that creating the optional reflection requires consent; use the existing AI-consent action, then require a separate explicit generation action.
  - Render pending, generated, failed/retry, and safety-redirect states without blocking entry access.

- Add a dedicated, server-only program-review model and persistence:
  - Create a Supabase migration for `ai_program_reviews`, scoped to one current review per user, with user ownership, source-content hash, status, provider/model/safety metadata, generated reflection, generated practice, saved-practice timestamp, and standard timestamps.
  - Apply RLS so users can read only their own review; generation and lifecycle writes remain service-role only.
  - Add typed `ProgramReview` and completion-review data to the dashboard loader.
  - Derive the source hash from the seven ordered program entries. If an entry changes, retain and display the previous review with an “entries changed” notice until the user explicitly regenerates it.

- Add a Groq generation path alongside entry reflections:
  - Require completed-program status, current Groq consent, and ownership before any call.
  - Safety-screen the combined seven-entry source first, using the existing Groq safety approach and immediate-danger handling.
  - Request strict JSON with only:
    - `reflection`: a brief, calm synthesis of explicit themes across the entries.
    - `practice`: one optional, concrete action grounded in the user’s stated Day 6 action, Day 7 carry-forward, or other explicit wording.
  - Enforce server-side length and shape limits; reject outputs that add diagnoses, health claims, certainty, hidden-motive inference, generic wellbeing techniques, or directive coaching.
  - Add actions to generate/retry the reflection and to mark the suggested practice as kept. Generation is always explicit; editing never triggers an automatic call.

- Keep the design system and product boundary intact:
  - Use the existing living-field-journal palette, typography, surfaces, contour treatment, restrained motion, accessibility behavior, and reduced-motion support.
  - Label AI content as a “reflection” and “gentle practice,” never analytics, assessment, advice, score, or recommendation.
  - Do not modify `.agents/plans/Design.md`; treat this as the user-approved minimal implementation exception.

## Public Interfaces and Data

- Add `ProgramReviewStatus` (`pending`, `complete`, `failed`, `safety_redirect`) and typed `ProgramReview` data to `DashboardData`.
- Add authenticated server actions for `generateProgramReview`, `retryProgramReview`, and `keepProgramPractice`.
- Add server-only generation helpers that accept the completed ordered entries and return the constrained reflection/practice result.
- Add a `program_review_created` product event with no journal text or generated content in event metadata.

## Test Plan

- Unit-test completion eligibility, deterministic ordered source hashing, stale-review detection after each entry edit, and rejection for incomplete programs.
- Test consent-off, consent-on, pending, success, malformed Groq output, timeout/failure, retry, and safety-redirect behavior.
- Test that no Groq request occurs until the user explicitly generates or regenerates the review.
- Test RLS/ownership isolation and that one user cannot generate, view, retry, or save another user’s review.
- Test the completion UI for consent-off, empty/pending/complete/failed/stale review states, keyboard operation, focus visibility, screen-reader labels, reduced motion, long generated text, and mobile/desktop layouts.
- Run `pnpm test`, `pnpm typecheck`, and `pnpm build`; manually verify Day 7 save → completion spread → explicit review generation → entry edit → stale notice → explicit regeneration.

## Assumptions

- A completed program remains seven unique entries submitted within the existing ten-day window.
- The only factual completion metric shown is completion itself; optional mood data is not aggregated or interpreted.
- One current generated review is stored per user; regenerating replaces it only after the user explicitly requests a fresh version.
- The optional practice is saved only as an acknowledgement on the review, not as an eighth journal entry or an ongoing journaling feature.
