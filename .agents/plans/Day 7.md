# Day 7 — Closing Review Experience

## Summary

Build Day 7 as the calm closing of the Emotional Reset: a focused, standalone review with no inline access to Days 1–6. It uses two reflection cards:

1. Required: what became clearer.
2. Optional: what the user wants to carry forward.

This is a closing reflection, not an assessment, summary, score, recommendation, or promise of improvement.

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
**Objective:** Add Day 7 structured JSON support to the database and types.
**Style Anchors:**
- [supabase/phase_4_day_3.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/phase_4_day_3.sql) (for incremental migration pattern)
- [supabase/supabase_schema.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/supabase_schema.sql) (for overall schema)

**Implementation Steps:**
1. Extend `StructuredResponseData` union and create `Day7ResponseData` type in source code.
2. Create `supabase/phase_4_day_7.sql` that:
   - Backfills generic Day 7 content into `became_clearer` (with empty `carry_forward`).
   - Adds JSON validation for Day 7 (`version = 1`, `became_clearer`, `carry_forward`).
3. Update `supabase/supabase_schema.sql` with these changes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck` to ensure union is valid.
- [ ] Ensure migration SQL is additive.

### Task 2: Server Action (Size: ~1.5h)
**Objective:** Create the authenticated save action for Day 7 and handle completion event.
**Style Anchors:**
- [src/app/actions.ts:L338](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/app/actions.ts#L338) (`saveDayTwoEntry` template).

**Implementation Steps:**
1. Create `saveDaySevenEntry(previousState, formData)` in `src/app/actions.ts`.
2. Authenticate user, verify beta access, onboarding, and Day 7 unlock time (>= 144 hours).
3. Validate inputs (trim, `became_clearer` required, `carry_forward` optional).
4. Construct `Day7ResponseData` and derive combined readable text.
5. Save entry and conditionally trigger `program_completed` if qualifying.
6. Trigger AI reflection and revalidate routes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck`.
- [ ] Verify validation logic passes all edge cases (especially completion event).

### Task 3: Composer UI & Dispatcher (Size: ~1.5h)
**Objective:** Build the Day 7 client interface with the closing spread composition.
**Style Anchors:**
- [src/components/day-2-composer.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-2-composer.tsx) (for form state)
- [src/components/day-experience-dispatcher.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-experience-dispatcher.tsx) (for routing)

**Implementation Steps:**
1. Create `Day7Composer` component with a large main card and a smaller Orchid Mist connected card.
2. Connect to `saveDaySevenEntry` via `useActionState`.
3. Add form validation (10k limit, required field).
4. Update `DayExperienceDispatcher` to render `Day7Composer` for Day 7.

**TDD / Validation Checklist:**
- [ ] Run `pnpm lint` and `pnpm typecheck`.
- [ ] Visual QA of the closing spread layout and mobile alignment.

### Task 4: Testing & Verification (Size: ~1h)
**Objective:** Ensure boundaries, unlock timings, and completion logic are solid.
**Implementation Steps:**
1. Follow the Testing checks outlined below using the `+mf-test-` disposable account.
2. Confirm unlock behavior (144 hours).
3. Confirm completion spread appears post-save.
4. Verify AI privacy and behavior rules.

**TDD / Validation Checklist:**
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`.
- [ ] Manual verification as per QA steps.

---

## Experience and UI

- Add a dedicated `Day7Composer` and route Day 7 through `DayExperienceDispatcher`.
- Use a distinct “closing spread” composition:
  - A large porcelain card for **“What became clearer?”**
  - A smaller Orchid Mist card below it for **“What do you want to carry forward?”**
  - Connect them with a restrained, quiet visual thread; do not reuse the Day 6 stepping-stone layout.
- Keep prior entries out of the composer. The Journal remains the only place to revisit earlier writing.
- Use the fixed Day 7 prompt and plain field copy:
  - “Looking back, what became clearer for you?”
  - “What would you like to carry forward from here?” — optional
- Preserve the shared optional mood selector, character count, explicit save state, discard confirmation, editing, reflection panel, and accessibility behavior.
- Do not add completion checkboxes, badges based on mood, aggregate insights, advice, or task-planning features.

## Data and Server Changes

- Add `Day7ResponseData` to the structured-response union:

  ```ts
  {
    version: 1,
    became_clearer: string,
    carry_forward: string
  }
  ```

- Require `became_clearer`; allow `carry_forward` to be blank.
- Add `saveDaySevenEntry`:
  - Derive the authenticated user, `program_day = 7`, and `prompt_id = day-7-review` on the server.
  - Validate the 144-hour unlock, onboarding, mood range, required input, and combined 10,000-character limit.
  - Create or update the sole Day 7 entry for the user.
  - Build readable `content` from the two fields, omitting the optional section when blank.
  - Save before moderation and Groq reflection generation; preserve the entry on AI failure or safety redirect.
  - Record `entry_saved`; record `program_completed` only for a newly created qualifying Day 7 entry through the existing ten-day completion logic.
- Add an additive `supabase/phase_4_day_7.sql` migration:
  - Backfill legacy generic Day 7 content to `became_clearer`, with `carry_forward` empty.
  - Enforce the exact Day 7 JSON structure, version, and required field.
  - Preserve existing RLS and the one-entry-per-user-per-program-day constraint.
- Update `supabase_schema.sql` with the final Day 7 rule.

## Completion Flow

- Do not immediately replace the saved Day 7 screen before its AI reflection can be read.
- After a successful Day 7 save, retain the Day 7 success/reflection state and show a clear **“View your completed journal”** action.
- That action refreshes or navigates to the existing completion spread, which already:
  - Appears only after all seven distinct entries are submitted within ten days.
  - Shows the quiet seven-day completion message and path.
  - Links the user to their private Journal.
- If AI consent was declined, generation fails, or safety handling applies, still allow the user to continue to the completion spread; completion depends on saved entries, not AI output.

## Testing

- Verify Day 7 locks before 144 hours and unlocks exactly at the boundary.
- Verify required/optional input validation, mood validation, save, edit, deletion, and reload persistence.
- Verify malformed Day 7 JSON is rejected and legacy Day 7 entries backfill correctly.
- Verify no Day 1–6 content appears in the Day 7 composer.
- Verify reflection success, no-consent, failure, timeout, retry, and safety-redirect states keep the saved entry intact.
- Verify Day 7 is available after missed earlier days and cannot be used to bypass the seven-entry completion requirement.
- Verify the completion event is emitted once for a qualifying first Day 7 save, not again on edits.
- Verify the final reflection remains readable before entering the completion spread.
- Test the complete Day 1–7 journey with the internal all-days-unlocked test account, then verify the real time-gated Day 7 boundary.
- Run TypeScript checks, tests, linting, and the production build.

## Assumptions

- Day 7 does not show previous entries inline, per your decision.
- “What became clearer?” is required; “what to carry forward” is optional.
- The existing completion screen remains the post-program destination, with only the Day 7 transition adjusted so the final reflection is not hidden.
- Suggested commit message:

  `feat(program): add structured Day 7 closing review experience`
