# MindFlow Journal Founding-Beta Plan

## Summary

Build and sell one focused product: a private, web-based 7-Day Emotional Reset for 20 founding users at ₹299.

Fixed funnel: **Carrd → Razorpay Payment Link → manual payment verification → email allowlist → Supabase magic link → seven-day web experience**.

Success means acquiring five paid users first, safely activating them, and observing completion before expanding to twenty. Voice, reminders, advanced insights, complex streaks, and automated payments remain deferred.

## Execution Plan

### Phase 0 — Establish the source of truth

- Preserve all current uncommitted work; do not reset or overwrite it.
- Create the missing operating brief, product blueprint, MVP specification, task ledger, acquisition plan, copy library, and launch runbook under `docs/`.
- Keep [PROJECT_LEDGER.md](<D:/Coding/JavaScript/Projects/Mindflow Journal/mindflow-journal/PROJECT_LEDGER.md>) as the live status record.
- Record every completed task, decision, blocker, and scope change there.

### Phase 1 — Stabilize and secure the product

- Review the current journal redesign and standardize the codebase around the real Supabase-backed flow.
- Implement Supabase email magic-link authentication.
- Add a manual beta allowlist keyed by normalized email.
- Reject authenticated users who have not been allowlisted.
- Replace the shared user ID with the authenticated user ID.
- Replace the open database policy with per-user row-level security.
- Standardize mood as an optional integer from 1–5.
- Remove mock data from the launch path and hide unfinished insight routes.
- Preserve journal entries, entry history, deletion, loading, empty, and error states.

### Phase 2 — Build the seven-day experience

Use one fixed sequence:

1. What thoughts are taking up the most space in your mind today?
2. What feels urgent, and what can safely wait?
3. Which parts of this situation are within your control?
4. What thought or concern keeps returning, and when does it usually appear?
5. What might you say to a friend carrying the same concern?
6. What is one small action that would create a little more clarity?
7. Looking back, what became clearer, and what do you want to carry forward?

Behavior:

- Day 1 unlocks immediately after onboarding.
- Each subsequent day unlocks 24 hours after the program start.
- Previously unlocked days remain available if the user misses one.
- Each day accepts one primary entry that can be edited.
- Completion means seven entries submitted within ten days.
- The dashboard shows the current day, completed days, and next unlock time without complex streak mechanics.

### Phase 3 — Add the AI reflection

- Call OpenAI only after an entry is saved successfully.
- Use the server-side Responses API with `OPENAI_API_KEY` and configurable `OPENAI_MODEL`.
- Default to the current cost-sensitive text model `gpt-5.6-luna`; keep the model in configuration so availability or cost changes do not require code changes. Current models are documented for use through the Responses API in the [official OpenAI model guide](https://developers.openai.com/api/docs/models).
- Return a structured result containing:
  - `reflection`: two or three sentences, maximum 80 words.
  - `question`: one optional follow-up question, maximum 20 words.
- Never diagnose, label conditions, prescribe treatment, or claim therapeutic outcomes.
- Run entry text through `omni-moderation-latest` before reflection generation.
- If immediate-harm content is flagged, skip interpretation and show: “MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.”
- If AI generation fails, keep the journal entry, show a neutral retry state, and allow one idempotent retry.

## Data and Interface Changes

- `beta_access`: normalized email, status, Razorpay payment reference, granted timestamp.
- `profiles`: authenticated user ID, email, onboarding timestamp, program start timestamp.
- `journal_entries`: authenticated user ID, program day, prompt identifier, content, mood score, timestamps.
- `ai_reflections`: entry ID, reflection, follow-up question, status, model, timestamps.
- Enforce one active program entry per user per program day.
- All private tables use authenticated-user row-level security.
- Add server operations for magic-link login, access verification, entry save/update/delete, reflection generation/retry, and progress retrieval.

## Sales and Access Flow

- Publish the existing sales copy as a Carrd page.
- Promise only the guided seven-day experience, private journaling, mood check-ins, and concise AI reflections.
- Link the primary CTA to a ₹299 Razorpay Standard Payment Link. Razorpay supports dashboard-created links without building checkout, as described in its [Payment Links documentation](https://razorpay.com/docs/payments/payment-links/create/?preferred-country=IN).
- Tell purchasers to use the same email for payment and product access.
- Set the expectation that access arrives within 12 hours.
- After verifying a captured payment:
  1. Record the payment reference and email.
  2. Add the email to the allowlist.
  3. Send the product login URL.
  4. Confirm successful first login.
- Do not build webhooks until manual access becomes an operational bottleneck.
- Add concise privacy, terms, refund, AI limitation, and non-clinical disclaimers before accepting payments.

## Measurement and Launch

Track through Supabase plus a lightweight prospect sheet:

- Landing-page visits and payment-link clicks.
- Successful payments.
- Access granted.
- First login.
- First entry and reflection viewed.
- Day-2 return.
- Seven-entry completion within ten days.
- Refunds, reported errors, and interview feedback.

Initial gates:

- Recruit five paid users before scaling outreach.
- Target at least 4/5 users activated within 24 hours.
- Target at least 3/5 returning for Day 2.
- Require zero cross-user data exposure.
- Interview every initial user after completion or abandonment.
- Expand toward twenty only after purchase, access, and entry flows are reliable.

Acquisition begins only after the payment-to-reflection journey passes testing:

1. Warm DMs.
2. Founder posts on X and Instagram.
3. Useful community participation.
4. Follow-ups using the existing scripts.
5. Typefully setup only if manual posting becomes inconsistent.

## Test Plan

- Verify allowlisted and non-allowlisted magic-link behavior.
- Prove that one user cannot read, modify, or delete another user’s entries or reflections.
- Test all seven day-unlock states, missed days, editing, and completion.
- Test empty input, invalid mood, duplicate submission, network failure, and deletion.
- Test AI success, moderation redirect, timeout, retry, and duplicate-request prevention.
- Test the manual Razorpay verification and access runbook with a test payment.
- Complete the full journey on mobile and desktop: Carrd → payment → access → login → onboarding → entry → reflection.
- Run the production build and TypeScript checks before launch.

## Assumptions and Defaults

- The beta is web-app-only.
- Payment is required before access.
- Razorpay is active and usable.
- Access is manually granted for the first twenty users.
- Authentication uses Supabase email magic links.
- Every user receives the same seven prompts.
- AI produces one reflection per entry.
- Carrd remains separate from the product repository.
- Supabase remains the application database and authentication provider.
- The first implementation task is Phase 0 followed immediately by authentication and row-level security; acquisition does not start while private journal data is exposed through the current open policy.
