# MindFlow Journal Day 2 — Urgency and Permission to Wait

## Summary

Build Day 2 as the second complete chapter of the Seven-Day Emotional Reset.

Day 2 is not merely Day 1 with a different prompt. It is a structured two-part writing exercise that helps the user separate what feels urgent from what can safely remain unresolved.

Fixed prompt:

> What feels urgent, and what can safely wait?

Day 2 is complete when the user writes in at least one of these sections:

1. **Feels urgent**
2. **Can safely wait**

Day 2 remains:

- Calm and non-clinical.
- Standalone, with no Day 1 content displayed.
- One journal entry.
- One optional mood.
- One optional Groq reflection.
- Permanently available after it unlocks.
- Independent of whether Day 1 was completed.

Phase 2 remains in progress after Day 2. Only Day 2 moves to done; Day 3 becomes next.

---

## 1. Day 2 Product Purpose

Day 1 lets the user put their mental load into words.

Day 2 should help them notice that everything occupying attention does not necessarily require action today.

The exercise must not:

- Decide priorities for the user.
- Rank their concerns.
- Create deadlines.
- Generate a task list.
- Tell them what is actually urgent.
- Suggest that postponing something is objectively safe.
- Diagnose why something feels urgent.
- Compare their answers with other users.
- Turn their answers into a score.
- Require Day 1 completion.

The product’s job is only to provide two clear places for the user’s own judgment.

---

## 2. Unlock and Progression Rules

### Before 24 hours

Until exactly 24 hours have passed since `program_started_at`:

- Day 2 remains locked.
- Its progress marker shows a lock.
- It is not clickable.
- Direct requests such as `/?day=2` must not reveal the Day 2 composer.
- Server actions must reject attempts to create a Day 2 entry.
- The interface shows the exact Day 2 unlock time.
- Day 1 remains current or complete.

### At exactly 24 hours

At:

```text
program_started_at + 24 hours
```

Day 2 becomes available.

This must use the server’s timestamp, not the browser clock.

The user does not need to complete Day 1 first.

Day 2 becomes:

- `current` when it is the latest time-unlocked day.
- `complete` after a Day 2 entry is saved.
- `available` later if it remains unfinished after Day 3 or another day unlocks.

### Permanent missed-day access

Once Day 2 unlocks, it never locks again.

Examples:

- Day 1 incomplete, Day 2 unlocked: user may complete Day 2 first.
- Day 3 unlocked, Day 2 incomplete: user may still open Day 2.
- Day 4 unlocked: user may complete Days 2, 3, and 4 in one session.
- Completing a later day does not remove access to Day 2.
- Editing Day 2 remains possible throughout the beta.

### Day 3 relationship

At 48 hours:

- Day 3 becomes the current time-based day.
- Day 2 remains available or complete.
- Day 2 shows no artificial deadline.
- Day 2 completion does not automatically open Day 3 early.

This plan does not build or certify the Day 3 experience.

---

## 3. Day 2 Screen Structure

Day 2 continues using the authenticated Today screen and shared seven-day path.

It must not introduce an unrelated standalone visual system.

### Header

Display:

```text
Day 2 · Urgency
```

The primary prompt remains:

> What feels urgent, and what can safely wait?

Supporting copy:

> Not everything asking for your attention needs an answer today. Place each thought where it belongs for now.

The supporting copy must appear beneath or near the main prompt without competing with it.

### Mood check-in

Reuse the existing optional five-point mood control:

1. Heavy
2. Low
3. Steady
4. Light
5. Energized

Rules:

- Mood remains optional.
- Only one overall mood is stored for Day 2.
- Do not collect a separate mood for each section.
- Selecting the active mood again clears it.
- Mood changes alone must not trigger a new AI reflection.
- Mood remains descriptive, not a health score.

### Two-part writing exercise

The writing canvas contains two equal conceptual sections.

#### Section A — Feels urgent

Label:

> Feels urgent

Helper text:

> What seems to need your attention now?

Placeholder:

> Write the thought, task, decision, or conversation that feels pressing…

#### Section B — Can safely wait

Label:

> Can safely wait

Helper text:

> What does not need to be solved today?

Placeholder:

> Write what you can leave alone for now…

### Completion requirement

At least one section must contain non-whitespace text.

Valid:

- Urgent filled, can-wait empty.
- Urgent empty, can-wait filled.
- Both filled.

Invalid:

- Both empty.
- Both contain only whitespace.

The application must never invent content for an empty section.

### Actions and messages

Primary button:

> Save Day 2

When editing:

> Save changes

Saved badge:

> Day 2 saved

Empty error:

> Write in at least one section before saving Day 2.

Length error:

> Keep your Day 2 entry under 10,000 characters.

Generic save failure:

> Your Day 2 entry could not be saved. Try again.

Discard action:

> Discard changes

Discard confirmation:

> Discard the changes in this Day 2 exercise?

A section must retain its text if the other section fails validation.

---

## 4. Responsive Visual Design

Use the Living Field Journal design without redesigning the application.

### Mobile

Order:

1. Mobile brand/navigation context.
2. `Day 2 · Urgency`.
3. Seven-day progress.
4. Next-unlock information.
5. Main Day 2 prompt.
6. Thought contour.
7. Optional mood selector.
8. Feels-urgent section.
9. Can-safely-wait section.
10. Character count and save controls.
11. Reflection state.
12. Bottom navigation.

The two writing sections stack vertically with “Feels urgent” first.

Textareas must be large enough to write comfortably without occupying multiple screen heights while empty.

### Desktop

Use:

```text
┌─────────────────────────────────────────────────────┐
│ Day 2 · Urgency                         Progress    │
├─────────────────────────────────────────────────────┤
│ What feels urgent, and what can safely wait?        │
│ Thought contour                                     │
├──────────────────────────┬──────────────────────────┤
│ Feels urgent             │ Can safely wait          │
│                          │                          │
│ Writing area             │ Writing area             │
│                          │                          │
├──────────────────────────┴──────────────────────────┤
│ Mood · character count · discard · save             │
├─────────────────────────────────────────────────────┤
│ Optional AI reflection                              │
└─────────────────────────────────────────────────────┘
```

The two writing cards must have equal width and visual importance.

### Visual treatment

- Porcelain remains the page background.
- Ink remains the primary text color.
- The urgent card may use a restrained coral tint.
- The can-wait card may use a restrained seafoam tint.
- Do not use strong red-versus-green semantics.
- Neither answer is presented as wrong, dangerous, or successful.
- Use Orchid Mist and Lilac for focus and transition states.
- Preserve Bricolage Grotesque, Instrument Sans, and IBM Plex Mono roles.
- Preserve the thought contour as the signature visual.
- Continue letting the contour respond to the optional mood.
- Use one restrained contour-settling transition when Day 2 opens.
- Respect reduced-motion preferences.
- Ordinary controls use 150–220ms transitions.
- Avoid decorative animation inside the writing areas.

---

## 5. Component Architecture

### Daily experience selection

Introduce a small day-experience boundary.

The Today screen should select the composer by `program_day`:

- Day 1 continues using the existing single-entry composer.
- Day 2 uses a dedicated structured urgency composer.
- Later days remain outside this implementation plan.

Suggested responsibility:

```ts
type DayExperienceProps = {
  day: ProgramDayView
  entry: JournalEntry | null
  aiConsentEnabled: boolean
}
```

The dispatcher chooses the correct experience without placing Day 2-specific branching throughout the main Today layout.

### Day 2 composer

Create a focused Day 2 component responsible for:

- Urgent text state.
- Can-wait text state.
- Mood state.
- Combined character count.
- Dirty-state detection.
- Discard confirmation.
- Save submission.
- Save errors.
- Saved confirmation.
- Reflection presentation.

Do not duplicate the entire application shell.

### Shared mood control

Extract or reuse the existing mood selector so Day 1 and Day 2 use identical:

- Labels.
- Accessibility attributes.
- Selection behavior.
- Mood values.
- Colors.

Do not create a Day 2-specific mood scale.

### Shared reflection panel

Reuse the existing reflection panel.

Day 2 must support:

- Journal-only state.
- Pending reflection.
- Complete reflection.
- Failed reflection.
- One retry.
- Safety redirect.
- Retry exhausted.

Do not create a separate AI-reflection design for Day 2.

---

## 6. Structured Day 2 Data

### Database addition

Add a nullable JSONB column to `journal_entries`:

```text
response_data jsonb
```

Day 1 entries keep:

```text
response_data = null
```

Day 2 entries use:

```json
{
  "version": 1,
  "urgent": "User-authored text",
  "can_wait": "User-authored text"
}
```

Use snake case in persisted JSON.

### TypeScript contract

Add:

```ts
type Day2ResponseData = {
  version: 1
  urgent: string
  can_wait: string
}
```

The journal-entry type receives:

```ts
response_data: Day2ResponseData | null
```

Runtime validation remains mandatory because database JSON must not be trusted solely through TypeScript types.

### JSON requirements

For Day 2:

- `response_data` must be an object.
- It must contain `version`, `urgent`, and `can_wait`.
- `version` must equal `1`.
- `urgent` must be a string.
- `can_wait` must be a string.
- At least one trimmed string must be nonempty.
- Unknown keys should be rejected.
- Neither value may contain server-generated interpretation.

Future days may define their own versioned response shapes later.

Do not try to design Days 3–7 inside the Day 2 JSON contract.

---

## 7. Readable Combined Content

Keep the existing `content` column.

For Day 2, the server derives `content` from the structured response.

If both sections contain text:

```text
Feels urgent:
[user’s urgent text]

Can safely wait:
[user’s can-wait text]
```

If only urgent contains text:

```text
Feels urgent:
[user’s urgent text]
```

If only can-wait contains text:

```text
Can safely wait:
[user’s can-wait text]
```

Rules:

- Omit the heading for an empty section.
- Never store “Nothing entered” or similar invented content.
- Never trust combined content supplied by the browser.
- Generate combined content on the server from validated structured fields.
- Use the same deterministic serializer in validation tests.
- Store only trimmed section values.
- Preserve internal line breaks written by the user.
- Normalize Windows line endings to Unix line endings.

The combined content exists for:

- Journal previews.
- Entry history.
- AI safety screening.
- AI reflection context.
- Backward compatibility with existing journal presentation.

Editing uses `response_data`, not parsing the combined content.

---

## 8. Character Limit

The final serialized `content` must not exceed 10,000 characters.

The character counter must reflect the serialized Day 2 entry, including section headings only when their corresponding section contains text.

Rules:

- Each textarea may accept up to 10,000 characters locally.
- The combined serialized result may not exceed 10,000.
- The server is authoritative.
- Client validation provides immediate feedback but cannot replace server validation.
- Saving is disabled or rejected when the combined limit is exceeded.
- Show the current combined count as:

```text
2,418 / 10,000
```

Do not silently truncate either section.

---

## 9. Legacy Day 2 Compatibility

The database may already contain generic Day 2 test entries created through the shared composer.

The migration must preserve them.

For each existing Day 2 row where `response_data` is null:

```json
{
  "version": 1,
  "urgent": "<existing content>",
  "can_wait": ""
}
```

Rules:

- Preserve the existing `content` verbatim during migration.
- Do not send migrated entries to Groq automatically.
- Do not reset existing timestamps.
- Do not generate product events during migration.
- Do not change ownership.
- On the next user edit, save the entry using the new deterministic serializer.
- Existing reflections remain attached until the user changes entry text.
- A mood-only edit must not invalidate the reflection.

---

## 10. Database Migration

Create a new additive Day 2 migration. Do not edit or pretend to reapply previously executed migrations.

The migration must:

1. Add nullable `response_data jsonb`.
2. Backfill existing Day 2 test entries.
3. Add a general JSON-object constraint when `response_data` is present.
4. Add Day 2-specific shape validation.
5. Require at least one nonempty Day 2 response value.
6. Preserve existing RLS policies.
7. Preserve the unique `(user_id, program_day)` constraint.
8. Preserve entry-to-reflection cascade deletion.
9. Update the canonical full schema.
10. Update verification SQL.

No new public write path is needed.

Authenticated users remain limited by existing ownership RLS.

The owner must receive:

- The incremental Day 2 SQL migration.
- The complete updated `supabase_schema.sql`.
- The updated verification SQL.
- Clear instructions to run only the incremental migration on the existing project.

Day 2 cannot be marked database-verified until the owner confirms that SQL ran successfully.

---

## 11. Server Save Operation

Implement a dedicated Day 2 save operation or a clearly isolated Day 2 branch behind the existing authenticated save boundary.

Recommended public interface:

```ts
saveDayTwoEntry(
  previousState: Day2SaveState,
  formData: FormData
): Promise<Day2SaveState>
```

Expected form fields:

```text
urgent
can_wait
mood
```

Do not accept the following from the browser:

- User ID.
- Prompt ID.
- Combined content.
- Unlock timestamp.
- Ownership.
- Reflection status.

The server supplies:

```text
program_day = 2
prompt_id = day-2-urgency
```

### Save sequence

1. Authenticate the user.
2. Verify active beta access.
3. Load the user’s profile.
4. Verify onboarding is complete.
5. Verify `program_started_at` exists.
6. Calculate current day using server time.
7. Reject the request if Day 2 has not unlocked.
8. Read and normalize both text fields.
9. Validate that at least one field is nonempty.
10. Validate mood as absent or an integer from one to five.
11. Build `Day2ResponseData`.
12. Serialize readable combined content.
13. Validate the final 10,000-character limit.
14. Look for the user’s existing Day 2 entry.
15. Insert when none exists.
16. Update the same row when one exists.
17. Return the saved entry ID and safe UI state.
18. Record product events without journal content.
19. Trigger or expose the existing optional reflection flow.
20. Revalidate Today, Journal, and entry-detail routes.

### Duplicate protection

A user may have only one Day 2 entry.

Concurrent initial saves must not create duplicates.

The database unique constraint remains the final protection.

If a duplicate race occurs:

- Fetch the existing Day 2 entry.
- Return a controlled state or safely retry as an update.
- Never expose a raw Postgres constraint error.

---

## 12. Day 2 Product Events

On the first successful creation of Day 2:

```text
entry_saved
day_2_return
```

Metadata may contain:

```json
{
  "program_day": 2
}
```

It must not contain:

- Urgent text.
- Can-wait text.
- Combined content.
- Mood commentary.
- Reflection text.
- Email.

On later edits:

- Record `entry_saved` according to the existing event policy.
- Do not record `day_2_return` again.

`day_2_return` means the first successful Day 2 entry creation, not merely viewing the Day 2 screen.

---

## 13. AI Reflection Behavior

Day 2 receives one combined reflection, not separate reflections for each section.

### Consent

If valid Groq consent is absent:

- Save the complete Day 2 entry.
- Make no Groq request.
- Display the journal-only state.
- Keep both Day 2 sections editable.

### Safety

When consent is present:

1. Save the Day 2 entry first.
2. Send the readable combined content through the configured safety model.
3. If immediate-danger content is flagged, do not call the reflection model.
4. Show the approved fixed notice.
5. Preserve both saved sections.

Both sections are treated as untrusted user content.

Headings are context, not model instructions.

### Reflection

When safety passes, the reflection model receives:

- Day 2 prompt identity.
- The user-authored urgent section when present.
- The user-authored can-wait section when present.

The response remains:

- Two or three sentences.
- No more than 80 words.
- One optional question.
- No more than 20 question words.
- Calm and non-clinical.
- Grounded only in what the user wrote.
- Free from priority decisions or prescriptive advice.

The AI must not:

- Decide that something is or is not urgent.
- Tell the user to ignore a concern.
- Convert the response into a task list.
- Diagnose urgency or anxiety.
- Infer why something feels pressing.
- Introduce content from Day 1.

### Editing and reflection reuse

- Changing `urgent` or `can_wait` changes the content hash and permits a new reflection revision.
- Changing mood alone preserves the current reflection.
- Emptying one section while retaining the other counts as a content edit.
- Deleting Day 2 deletes its reflection.
- AI failure never reverses or removes the saved Day 2 entry.

---

## 14. Journal and Entry Detail

### Journal index

Day 2 entries display:

```text
Day 2 · Urgency
```

The preview uses the readable combined content.

It may show both headings when both sections exist.

It must continue showing:

- Optional mood.
- Saved or updated date.
- Reflection status.
- Entry excerpt.

Do not expose raw JSON.

### Entry detail

Opening a saved Day 2 entry must show:

- Day 2 prompt.
- Optional mood.
- Urgent response in the urgent field.
- Can-wait response in the can-wait field.
- Existing reflection state.
- Save changes.
- Discard changes.
- Confirmed deletion.

Editing must use structured JSON directly.

Do not reconstruct fields by parsing the readable content except for the documented legacy fallback.

### Delete behavior

Deletion must:

- Authenticate the user.
- Verify ownership.
- Delete the Day 2 entry.
- Cascade-delete its reflection.
- Update progress from complete to available when Day 2 remains unlocked.
- Preserve all other days.
- Return the user to the journal or current Today state.

---

## 15. Loading, Empty, and Failure States

### Loading

While Day 2 data loads:

- Show a stable skeleton matching the final layout.
- Avoid shifting from one column to two columns after paint.
- Do not show empty editable fields before ownership and unlock checks finish.

### Empty unlocked state

Show both blank writing sections and the Day 2 guidance.

Do not display an empty-state illustration or motivational claim.

### Save pending

- Disable Save.
- Show `Saving Day 2…`.
- Keep both fields visible.
- Do not clear either field.
- Prevent duplicate submissions.

### Save failure

- Keep both unsaved field values.
- Show the controlled save error.
- Restore the Save action.
- Do not begin AI generation.

### Reflection pending

- Clearly separate saved journal content from pending AI output.
- The user must understand the entry is already safe in their journal.
- Do not block navigation.

### Network loss

If the save request fails:

- Retain client-side text.
- Show a retryable save error.
- Do not claim the entry was saved.
- Do not call Groq.

### Stale or malformed structured data

If a Day 2 row contains malformed `response_data`:

- Do not crash the page.
- Fall back to the readable `content` in the urgent section.
- Leave can-wait empty.
- Log only the entry ID and safe internal error code.
- Never log the content or malformed JSON payload.

---

## 16. Accessibility Requirements

- Use real `<label>` elements for both textareas.
- Associate helper text using `aria-describedby`.
- Group the exercise under a meaningful heading.
- Keep mood selection in a fieldset with a legend.
- Use `aria-pressed` for mood choices.
- Provide visible keyboard focus for every control.
- Keep logical tab order: mood, urgent, can-wait, discard, save.
- Announce save errors using `role="alert"`.
- Announce successful save and reflection progress using a polite live region.
- Do not rely on coral or seafoam color alone to distinguish the two sections.
- Ensure touch targets are at least approximately 44px.
- Preserve text readability at 200% zoom.
- Respect reduced-motion preferences.
- Confirm the two-column layout becomes one column before either textarea becomes too narrow.

---

## 17. Automated Tests

### Program timing

Test:

- Day 2 locked one millisecond before 24 hours.
- Day 2 unlocked exactly at 24 hours.
- Day 2 unlocked after 24 hours.
- Day 1 completion is not required.
- Day 2 remains available after Day 3 unlocks.
- Day 2 remains available after Day 4 unlocks.
- Completed Day 2 becomes `complete`.
- Deleting Day 2 returns it to `available`.
- Future-day access remains server-controlled.
- Browser timezone does not change unlock time.

### Response validation

Test:

- Both sections populated.
- Only urgent populated.
- Only can-wait populated.
- Both empty.
- Both whitespace.
- Leading and trailing whitespace.
- Internal line breaks.
- Valid mood values.
- Missing mood.
- Invalid mood.
- Exact 10,000-character serialized content.
- Content exceeding 10,000.
- Unknown JSON keys.
- Incorrect JSON version.
- Non-string section values.
- Null response data.
- Malformed response data.

### Serialization

Test exact readable output for:

- Both sections.
- Urgent only.
- Can-wait only.
- Multiline urgent content.
- Multiline can-wait content.
- Normalized line endings.
- No invented empty-section text.
- Deterministic output for content hashing.

### Persistence

Test:

- First Day 2 save creates one row.
- Second save updates the same row.
- Concurrent creation cannot produce two rows.
- Stored program day is always two.
- Stored prompt ID is always `day-2-urgency`.
- Browser-supplied prompt or user identifiers are ignored.
- Structured JSON and readable content remain synchronized.
- Mood-only edit retains structured responses.
- Text edit updates both JSON and readable content.

### AI behavior

Test:

- No consent produces zero Groq calls.
- Safe Day 2 entry produces one reflection.
- Both sections reach safety screening.
- Immediate-danger content in either section prevents reflection generation.
- AI failure preserves both saved sections.
- Retry uses the current structured content.
- Mood-only edit does not produce a new reflection.
- Section edit invalidates the old content hash.
- No Day 1 content is included.

### Product events

Test:

- Initial creation records `entry_saved`.
- Initial creation records `day_2_return`.
- Editing does not record another `day_2_return`.
- Event metadata contains only safe fields.
- Event failure does not block saving.

### Ownership and RLS

With two test users, prove:

- User A cannot read User B’s Day 2 entry.
- User A cannot update User B’s structured responses.
- User A cannot delete User B’s Day 2 entry.
- User A cannot read User B’s reflection.
- A direct future-day insert before 24 hours fails.
- A direct duplicate Day 2 insert fails.
- Existing Day 1 isolation remains intact.

---

## 18. Manual Verification

Use a disposable allowlisted test account.

Do not change the program start of an account that has already started because it is intentionally immutable.

Prepare a fresh test profile with a controlled start time or use a dedicated fixture before program start.

### Locked-state test

Set the effective time immediately before the 24-hour boundary.

Verify:

- Day 2 appears locked.
- Day 2 has no link.
- `/?day=2` does not expose the composer.
- Direct save is rejected.
- Exact unlock time is correct.

### Unlock test

Set the program start slightly more than 24 hours in the past.

Verify:

- Day 2 is current.
- Day 1 remains accessible whether complete or incomplete.
- Day 3 remains time-locked until 48 hours.
- Header, prompt, helper copy, and sections are correct.

### Writing test

Test:

- Urgent only.
- Can-wait only.
- Both.
- Optional mood.
- No mood.
- Multiline writing.
- Character limit.
- Discard changes.
- Save.
- Reload.
- Edit.
- Reflection.
- Delete.

### Missed-day test

Use a time after Day 3 or Day 4 has unlocked.

Verify:

- Day 2 remains selectable.
- Day 2 can be saved after later days become available.
- The entry is assigned to Day 2, not the current calendar day.
- Progress updates correctly.
- Completing Day 2 does not alter entries for other days.

### Responsive QA

Verify at approximately:

- 390px.
- 768px.
- 1024px.
- 1440px.

Check:

- No horizontal overflow.
- Textareas remain comfortable.
- Two-column layout is balanced.
- Mobile stacking order is correct.
- Keyboard focus is visible.
- Long content does not break cards.
- Error messages do not shift controls unpredictably.
- Reflection remains visually separate from user writing.

---

## 19. Documentation and Ledger Updates

Update the MVP specification with:

- Day 2’s two-part structure.
- At-least-one-section completion rule.
- `response_data` contract.
- Standalone behavior.
- Permanent missed-day availability.

Update the product blueprint’s Day 2 description to state that it is a structured urgency-versus-wait exercise.

Update the task ledger:

- Day 1: `DONE`.
- Day 2: `IN PROGRESS` during implementation.
- Day 2 becomes `DONE` only after code, SQL, live verification, and responsive QA pass.
- Day 3 becomes `NEXT`.
- Days 4–7 remain `LATER` or `PENDING`.
- Phase 2 remains `IN PROGRESS`.

Update the project ledger with:

- Decisions made.
- Migration status.
- Test evidence.
- Known issues.
- Exact next action.

Do not mark the complete Seven-Day Emotional Reset done.

---

## 20. Implementation Order

1. Add Day 2 response types and pure validation/serialization functions.
2. Write failing tests for validation and serialization.
3. Implement the smallest functions that pass those tests.
4. Create the additive Supabase migration.
5. Update the full schema and RLS verification SQL.
6. Extend journal-entry loading with `response_data`.
7. Add the Day 2 authenticated save operation.
8. Add action-level validation tests.
9. Extract or reuse the shared mood selector.
10. Build the Day 2 two-part composer.
11. Connect it through the daily-experience dispatcher.
12. Add journal and entry-detail structured rendering.
13. Connect the existing reflection flow.
14. Verify product events.
15. Run unit tests and TypeScript.
16. Run the production build.
17. Give the owner the incremental SQL.
18. Wait for confirmation that SQL ran successfully.
19. Run live unlock, persistence, AI, RLS, mobile, and desktop verification.
20. Fix only Day 2 defects found during verification.
21. Update the ledgers.
22. Commit the verified Day 2 milestone.

Suggested commit message:

```text
feat(program): build structured Day 2 urgency experience
```

---

## 21. Day 2 Completion Gate

Day 2 is complete only when:

- It unlocks at exactly 24 hours.
- It never requires Day 1 completion.
- It remains permanently available after unlocking.
- It presents the approved two-part exercise.
- At least one section is required.
- Both sections persist separately.
- Readable combined content is correct.
- Existing generic Day 2 data is preserved.
- Optional mood works.
- Create, edit, reload, history, and delete work.
- One reflection covers the complete Day 2 entry.
- AI failure never loses the entry.
- Mood-only edits do not regenerate AI.
- `day_2_return` records once.
- Direct early access is rejected.
- Cross-user access is impossible.
- Mobile and desktop QA pass.
- Incremental SQL runs successfully.
- Tests, TypeScript, and production build pass.
- The ledger marks only Day 2 complete.
- Day 3 is identified as the next product task.

## Assumptions Locked

- Day 2 is a two-part guided exercise.
- Structured JSON storage is approved.
- At least one section is sufficient.
- Day 2 does not display Day 1.
- There is one overall optional mood.
- There is one combined optional AI reflection.
- Day unlocks remain time-based.
- Once a day unlocks, it remains available permanently.
- Users may complete multiple missed unlocked days together.
- Day 2 does not include checklists, scores, deadlines, reminders, or prioritization advice.
- Day 3 is outside this implementation.
