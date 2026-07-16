# Day 6 — Small Movement Experience

## Summary

Create Day 6 as a distinct, non-productivity-focused “small movement” exercise around the fixed prompt: “What is one small action that would create a little more clarity?”

Default chosen: one required small action and one optional note for making the first moment lighter. This creates a gentle bridge from reflection to action without introducing tasks, deadlines, checklists, reminders, or streak mechanics.

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
**Objective:** Add Day 6 structured JSON support to the database and types.
**Style Anchors:**
- [supabase/phase_4_day_3.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/phase_4_day_3.sql) (for incremental migration pattern)
- [supabase/supabase_schema.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/supabase_schema.sql) (for overall schema)

**Implementation Steps:**
1. Extend `StructuredResponseData` union and create `Day6ResponseData` type in source code.
2. Create `supabase/phase_4_day_6.sql` that:
   - Backfills generic Day 6 content into `small_action` (with empty `first_moment`).
   - Adds JSON validation for Day 6 (`version = 1`, `small_action`, `first_moment`).
3. Update `supabase/supabase_schema.sql` with these changes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck` to ensure union is valid.
- [ ] Ensure migration SQL is additive.

### Task 2: Server Action (Size: ~1.5h)
**Objective:** Create the authenticated save action for Day 6.
**Style Anchors:**
- [src/app/actions.ts:L338](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/app/actions.ts#L338) (`saveDayTwoEntry` template).

**Implementation Steps:**
1. Create `saveDaySixEntry(previousState, formData)` in `src/app/actions.ts`.
2. Authenticate user, verify beta access, onboarding, and Day 6 unlock time (>= 120 hours).
3. Validate inputs (trim, `small_action` required, `first_moment` optional).
4. Construct `Day6ResponseData` and derive combined readable text.
5. Save entry and trigger AI reflection.
6. Revalidate routes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck`.
- [ ] Verify validation logic passes all edge cases.

### Task 3: Composer UI & Dispatcher (Size: ~1.5h)
**Objective:** Build the Day 6 client interface using the "stepping-stone" composition.
**Style Anchors:**
- [src/components/day-2-composer.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-2-composer.tsx) (for form state)
- [src/components/day-experience-dispatcher.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-experience-dispatcher.tsx) (for routing)

**Implementation Steps:**
1. Create `Day6Composer` component with a large main card and a smaller connected card.
2. Connect to `saveDaySixEntry` via `useActionState`.
3. Add form validation (10k limit, required `small_action` field).
4. Update `DayExperienceDispatcher` to render `Day6Composer` for Day 6.

**TDD / Validation Checklist:**
- [ ] Run `pnpm lint` and `pnpm typecheck`.
- [ ] Visual QA of the stepping-stone layout and mobile alignment.

### Task 4: Testing & Verification (Size: ~1h)
**Objective:** Ensure boundaries, unlock timings, and constraints are solid.
**Implementation Steps:**
1. Follow the Testing and Acceptance Checks outlined below using the `+mf-test-` disposable account.
2. Confirm unlock behavior (120 hours).
3. Confirm save behaviors (empty vs full optional line).
4. Verify AI privacy and behavior rules.

**TDD / Validation Checklist:**
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`.
- [ ] Manual verification as per QA steps.

---

## Experience and UI

- Add a dedicated `Day6Composer` and route Day 6 through `DayExperienceDispatcher`; do not reuse the generic composer.
- Keep Day 6 standalone: never display, quote, or require previous-day entries.
- Use a visual “stepping-stone” composition:
  - Main large card: “One small action” — required.
  - Smaller connected card: “Make the first moment lighter” — optional.
  - The two cards read as a path forward, not as a to-do list.
- Use existing Living Field Journal design tokens, with a fresh layout and restrained motion. Maintain mobile usability, keyboard focus visibility, and reduced-motion support.
- Use plain, non-pressuring labels and copy:
  - Required field: “What is one small action that could create a little more clarity?”
  - Optional field: “What could make starting feel a little lighter?”
  - Save button: “Save today’s entry”
- Do not add checkboxes, completion states, dates, time estimates, goal metrics, notifications, or task-management language.

## Data, Validation, and Persistence

- Add a Day 6 structured response shape:

  ```ts
  {
    version: 1,
    small_action: string,
    first_moment: string
  }
  ```

- Require `small_action` after trimming whitespace; allow `first_moment` to be blank.
- Apply the existing entry length limit to both fields and preserve the existing optional 1–5 mood check-in.
- Generate readable journal-entry content from the structured data:
  - Always include “One small action”.
  - Include “Make starting lighter” only when the optional field has content.
- Add an additive `supabase/phase_4_day_6.sql` migration:
  - Backfill legacy Day 6 content into `small_action`, with an empty `first_moment`.
  - Add a Day 6 `response_data` constraint requiring the exact expected shape and version.
  - Preserve existing row-level security and the one-entry-per-user-per-program-day rule.
- Update `supabase_schema.sql` to include the Day 6 constraint and migration-equivalent final schema.

## Server Behavior

- Add a dedicated Day 6 save/update server action.
- Derive `user_id`, `program_day = 6`, and `prompt_id = day-6-movement` on the server; never trust client-provided identity or day values.
- Permit access once Day 6 has unlocked: 120 hours after `program_started_at`.
- Do not require Days 1–5 to be completed. Once unlocked, Day 6 remains available permanently.
- Create or update the user’s sole Day 6 entry, safely preserving the existing unique-entry behavior.
- Save the entry before requesting its AI reflection.
- Reuse the established moderated reflection workflow:
  - One concise reflection for the combined Day 6 response.
  - Never prescribe, diagnose, promise outcomes, or turn the action into a directive.
  - Preserve the saved entry if moderation or AI generation fails.
  - Preserve the existing idempotent retry behavior.
- Emit the existing `entry_saved` product event; do not add a false “task completed” event.

## Testing and Acceptance Checks

- Day 6 remains locked before the 120-hour boundary and becomes available exactly at/after it.
- An unlocked user can save with a valid required action and no optional note.
- Blank or whitespace-only required action is rejected with a clear field-level message.
- Optional text, mood, editing, deletion, loading, empty, network-error, and retry states all work.
- A Day 6 entry persists correctly after refresh and displays the structured response in the same visual format.
- Legacy Day 6 content is safely backfilled by the migration.
- The database rejects malformed Day 6 `response_data`.
- A user cannot read, update, or delete another user’s Day 6 entry or reflection.
- Test with the existing all-days-unlocked test account, then verify the normal time-gated flow separately.
- Run the project’s type checks, tests, linting, and production build before marking Day 6 complete.

## Documentation and Handoff

- Update the live project ledger after implementation:
  - Mark Day 6 complete only after migration, automated checks, and manual mobile/desktop verification pass.
  - Record the deliberate scope boundary: Day 6 is an action prompt, not a task manager.
  - Keep Phase 2 in progress; Day 7 remains next.
- Suggested implementation commit message:

  `feat(program): add structured Day 6 movement experience`

## Assumptions

- The recommended “action + lighter start” format is used because no alternate choice was returned.
- Existing authentication, RLS, mood behavior, reflection safety rules, and time-based unlock logic remain unchanged.
