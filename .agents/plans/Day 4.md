# Day 4 — Recurrence Loop Experience

## Summary

Build Day 4 as a structured “recurrence loop” exercise, not another generic two-column comparison.

Fixed prompt:

> What thought or concern keeps returning, and when does it usually appear?

The user names the recurring thought first, then optionally notices the moment, setting, or situation in which it returns. Day 4 remains standalone: no earlier entries are displayed, copied, or summarized.

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
**Objective:** Add Day 4 structured JSON support to the database and types.
**Style Anchors:**
- [supabase/phase_4_day_3.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/phase_4_day_3.sql) (for incremental migration pattern)
- [supabase/supabase_schema.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/supabase_schema.sql) (for overall schema)

**Implementation Steps:**
1. Extend `StructuredResponseData` union and create `Day4ResponseData` type.
2. Create `supabase/phase_4_day_4.sql` that:
   - Backfills generic Day 4 entries.
   - Adds JSON validation for Day 4 (`version = 1`, `recurring_thought`, `usual_moment`).
3. Update `supabase/supabase_schema.sql` with these changes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck` to ensure union is valid.
- [ ] Ensure migration SQL is additive.

### Task 2: Server Action (Size: ~1.5h)
**Objective:** Create the authenticated save action for Day 4.
**Style Anchors:**
- [src/app/actions.ts:L338](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/app/actions.ts#L338) (`saveDayTwoEntry` template).

**Implementation Steps:**
1. Create `saveDayFourEntry(previousState, formData)` in `src/app/actions.ts`.
2. Authenticate user, verify beta access, onboarding, and Day 4 unlock time (>= 72 hours).
3. Validate inputs (trim, `recurring_thought` required, `usual_moment` optional).
4. Construct `Day4ResponseData` and derive combined readable text.
5. Save entry and trigger AI reflection.
6. Revalidate routes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck`.
- [ ] Verify validation logic passes all edge cases.

### Task 3: Composer UI & Dispatcher (Size: ~1.5h)
**Objective:** Build the Day 4 client interface with vertical loop UI.
**Style Anchors:**
- [src/components/day-2-composer.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-2-composer.tsx) (for form state)
- [src/components/day-experience-dispatcher.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-experience-dispatcher.tsx) (for routing)

**Implementation Steps:**
1. Create `Day4Composer` component with stacked textareas connected by a visual thread.
2. Connect to `saveDayFourEntry` via `useActionState`.
3. Add form validation (10k limit, required thought field).
4. Update `DayExperienceDispatcher` to render `Day4Composer` for Day 4.

**TDD / Validation Checklist:**
- [ ] Run `pnpm lint` and `pnpm typecheck`.
- [ ] Visual QA of the vertical thread and mobile stacking.

### Task 4: Testing & Verification (Size: ~1h)
**Objective:** Ensure boundaries and constraints are solid.
**Implementation Steps:**
1. Follow the Test Plan outlined below using the `+mf-test-` disposable account.
2. Confirm save behaviors (empty vs full).
3. Confirm progression and data persistence.

**TDD / Validation Checklist:**
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`.
- [ ] Manual verification as per QA steps.

---

## Experience and Behavior

### Exercise structure

Display two connected writing steps:

1. **The thought that returns** — required  
   Helper: “What concern, question, or sentence keeps coming back?”  
   Placeholder: “Write the thought that keeps returning…”

2. **When it tends to return** — optional  
   Helper: “What time, place, situation, or moment do you notice it most?”  
   Placeholder: “Write when you tend to notice it…”

Supporting copy:

> A recurring thought often has a familiar moment. Name the thought, then notice when it tends to return.

Use a vertical loop/thread between the two cards rather than a Day 2/Day 3-style opposing grid:

```text
┌─────────────────────────────────────┐
│ The thought that returns             │
│ [required writing area]              │
└───────────────┬─────────────────────┘
                │ subtle looping thread
┌───────────────▼─────────────────────┐
│ When it tends to return              │
│ [optional writing area]              │
└─────────────────────────────────────┘
```

On desktop, keep the loop centered in a narrow editorial column; on mobile, stack naturally with the thread shortened between cards.

Visual rules:

- Recurring-thought card: warm porcelain with restrained Lilac focus treatment.
- Context card: Orchid Mist surface with subtle Ink border.
- The loop is a thin translucent contour line, not a chart or pattern score.
- Preserve the existing mood control, thought contour, reflection panel, typography, and reduced-motion behavior.
- Do not imply the thought is irrational, pathological, dangerous, or wrong.

### Completion and progression

- Day 4 unlocks exactly 72 hours after `program_started_at`.
- It does not require Days 1–3 to be complete.
- Once unlocked, it remains available permanently.
- The recurring-thought field is required.
- The timing/context field is optional.
- Mood remains one optional overall 1–5 selection.
- Day 4 uses one journal entry, one optional Groq reflection, and one editable saved record.
- Day 4 records `entry_saved` only; no new Day 4-specific product event is added.
- The existing disposable `+mf-test-` account fixture remains the approved way to unlock all days during development.

## Data and Server Changes

### Structured response type

Extend the shared union:

```ts
type Day4ResponseData = {
  version: 1
  recurring_thought: string
  usual_moment: string
}

type StructuredResponseData =
  | Day2ResponseData
  | Day3ResponseData
  | Day4ResponseData
  | null
```

Persist Day 4 as:

```json
{
  "version": 1,
  "recurring_thought": "User-authored text",
  "usual_moment": "Optional user-authored text"
}
```

Runtime parsing must select the shape based on `program_day`; do not trust raw JSON through a TypeScript cast.

### Readable combined content

Generate `content` only on the server.

When both fields contain text:

```text
The thought that returns:
[user text]

When it tends to return:
[user text]
```

When `usual_moment` is empty:

```text
The thought that returns:
[user text]
```

Rules:

- Never write placeholder text for the empty optional field.
- Normalize line endings.
- Preserve meaningful internal line breaks.
- Enforce the final serialized-content limit of 10,000 characters.
- Use the combined content for journal previews, history, safety screening, and the single Day 4 reflection.
- Editing must load from `response_data`, not reverse-parse combined content.

### Migration

Create a new additive migration through the project’s Supabase migration workflow for Day 4.

It must:

1. Backfill existing generic Day 4 entries:

   ```json
   {
     "version": 1,
     "recurring_thought": "<existing content>",
     "usual_moment": ""
   }
   ```

2. Add Day 4-specific validation:
   - `response_data` is present.
   - `version` is `1`.
   - `recurring_thought` is a string and contains trimmed text.
   - `usual_moment` is a string.
   - No keys beyond `version`, `recurring_thought`, and `usual_moment` are accepted.

3. Preserve Day 1–3 data, RLS policies, unique day-entry protection, prompt-ID constraints, and reflection cascade deletion.

4. Update the complete `supabase_schema.sql` and RLS verification SQL.

Provide the owner the incremental migration and full schema. The owner runs only the incremental migration against the existing project.

### Save action

Add:

```ts
saveDayFourEntry(previousState, formData)
```

It accepts only:

```text
recurring_thought
usual_moment
mood
```

The server must:

1. Authenticate and verify beta access.
2. Verify onboarding and program start.
3. Enforce Day 4 server-time unlocking.
4. Trim and normalize both fields.
5. Require `recurring_thought`.
6. Permit empty `usual_moment`.
7. Validate optional mood as integer 1–5.
8. Build `Day4ResponseData`.
9. Generate readable combined content server-side.
10. Enforce the 10,000-character combined limit.
11. Set `program_day = 4` and `prompt_id = day-4-recurrence` server-side.
12. Create or update the user’s sole Day 4 entry.
13. Record `entry_saved` with `{ program_day: 4 }`.
14. Start the existing optional safety/reflection flow only after save succeeds.
15. Revalidate Today, Journal, and entry-detail pages.

### Composer and routing

Create `Day4Composer`.

Update `DayExperienceDispatcher`:

- Day 1 → `Day1Composer`
- Day 2 → `Day2Composer`
- Day 3 → `Day3Composer`
- Day 4 → `Day4Composer`
- Days 5–7 → existing generic composer until their dedicated experiences are built

Use the same dispatcher in entry detail, so saved Day 4 entries reopen as the recurrence loop.

## AI, Error, and Privacy Behavior

- AI consent off: save Day 4 normally and display journal-only state.
- AI consent on: screen the combined Day 4 content before generating one reflection.
- Either field may trigger the existing safety redirect.
- Do not send earlier-day content to the Day 4 AI request.
- Mood-only edits retain an existing reflection.
- Editing either Day 4 text field produces a new content revision.
- Reflection failures never remove or undo the saved Day 4 entry.
- Never log entry text, combined content, response JSON, or reflection text.

User-facing messages:

- Save: `Save Day 4`
- Edit: `Save changes`
- Saved badge: `Day 4 saved`
- Required-field error: `Write the thought that keeps returning before saving Day 4.`
- Length error: `Keep your Day 4 entry under 10,000 characters.`
- Discard confirmation: `Discard the changes in this Day 4 exercise?`

## Test Plan

### Unlocking and progression

- Day 4 is locked one millisecond before 72 hours.
- Day 4 unlocks exactly at 72 hours.
- Day 4 does not require Days 1–3 completion.
- Day 4 remains available after Days 5–7 unlock.
- Direct Day 4 save before 72 hours fails.
- The disposable six-days-ago test account can access and save Day 4 through normal RLS behavior.

### Validation and persistence

- Recurring thought only saves.
- Both fields save.
- Empty recurring thought fails.
- Whitespace-only recurring thought fails.
- Empty optional context succeeds.
- Multiline values preserve line breaks.
- Valid and invalid mood values behave correctly.
- Exact 10,000-character serialized content succeeds.
- Content over 10,000 fails.
- Invalid JSON version, missing keys, extra keys, and non-string values fail.
- Legacy Day 4 content backfills into `recurring_thought`.
- Create saves one Day 4 row; later saves update it.
- Concurrent saves cannot create duplicate Day 4 rows.
- Deleting Day 4 removes its reflection and returns the day to available when unlocked.

### AI and privacy

- No consent produces zero Groq calls.
- Safe Day 4 content produces one combined reflection.
- Immediate-danger content in either field produces the fixed safety notice and skips reflection generation.
- Failed reflection preserves both fields.
- Retry uses current structured Day 4 content.
- User A cannot read, update, or delete User B’s Day 4 entry or reflection.
- Product event metadata contains only `program_day: 4`.

### Manual QA

Verify at 390px, 768px, 1024px, and 1440px:

- Loop layout is readable and not ornamental noise.
- Textareas remain comfortable with long writing.
- Keyboard focus and screen-reader labels work.
- Mobile order is thought first, then context.
- Saved, failed, pending, journal-only, complete-reflection, and safety states remain clear.
- Day 4 appears correctly in Today, Journal, entry detail, and seven-day progress.

Run:

```text
pnpm test
pnpm typecheck
pnpm build
```

## Completion

Update the product docs and ledgers after verification:

- Day 4 becomes `DONE` only after migration, runtime tests, manual all-days verification, and build checks pass.
- Phase 2 remains `IN PROGRESS`.
- Day 5 becomes the next experience.

Suggested commit message:

```text
feat(program): add structured Day 4 recurrence experience
```

Assumptions locked:

- Day 4 is standalone.
- The recurring thought is required.
- The recurring moment/context is optional.
- There is one optional mood and one optional combined reflection.
- No scoring, pattern analytics, reminders, diagnosis, or advice is added.
