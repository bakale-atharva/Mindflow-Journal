# MindFlow Journal — Founding Beta MVP Specification

Status: Approved for implementation  
Version: 1.0  
Last updated: 2026-07-13

## Goal

Deliver a secure seven-day guided journaling experience that a founding user can purchase, access, begin, and complete without founder intervention after access is granted.

## Included Scope

- Carrd sales page and Razorpay payment link.
- Manual email allowlist.
- Supabase email magic-link authentication.
- Minimal onboarding and program start.
- An 18+ eligibility confirmation.
- Explicit AI-processing consent with a journal-without-AI path.
- Seven fixed prompts.
- One editable primary entry per day.
- Optional mood value from 1 to 5.
- One concise AI reflection per saved entry.
- Progress, next unlock time, and real entry history.
- Entry update and deletion.
- Essential privacy, terms, refund, AI limitation, and non-clinical copy.
- Minimal product-event tracking.

## Excluded Scope

- Password and social-login authentication.
- Razorpay webhooks or automated entitlement.
- Voice entry.
- Notifications or reminders.
- Generated or personalized prompts.
- Advanced mood charts, pattern detection, or streaks.
- Daily or weekly aggregate summaries.
- Sharing, community, clinician, or crisis-support functionality.
- Native mobile apps.
- Licensed-professional access or support workflows.

## Functional Requirements

### Access and authentication

- Email input is trimmed and normalized to lowercase.
- A magic link may be requested only for an active allowlisted email.
- An authenticated but non-allowlisted user is signed out or blocked from private routes.
- Login errors explain the next action without revealing the full allowlist.
- Private routes redirect unauthenticated users to login.
- Sign-out is available from the authenticated shell.

### Onboarding

- First login shows the product promise, privacy boundary, seven-day structure, and non-clinical limitation.
- The user confirms they are at least 18 years old.
- The user chooses whether entry text may be sent to Groq for reflections.
- The user explicitly starts the program.
- Starting records a single immutable program start timestamp.
- Day 1 becomes available immediately.
- Returning users skip completed onboarding.

### Daily progression

- Unlock day is `floor((now - program_started_at) / 24 hours) + 1`, capped from 1 to 7.
- Previously unlocked days remain open.
- Future days show their unlock time and cannot accept entries.
- A user may create one primary entry for each program day.
- An existing day entry may be edited without creating a duplicate.
- Seven entries submitted within 10×24 hours of program start mark the program complete.
- Missing the ten-day window does not delete or hide entries; it records non-completion for beta measurement.

### Mood and entry

- Mood is optional and limited to integer values 1–5.
- Content is required after trimming.
- Content length limit is 10,000 characters.
- The app saves content before requesting an AI reflection.
- Save, update, and delete actions authenticate the user on the server.
- A user cannot address an entry owned by another user.
- Deletion also removes its associated AI reflection.

### AI reflection

- Moderation runs before generation.
- Reflection generation runs only when the user has explicitly consented to Groq processing.
- A user who declines consent can save and manage entries without AI reflections.
- Normal output contains `reflection` of 2–3 sentences and at most 80 words.
- `question` is optional and at most 20 words.
- Output is calm, direct, non-clinical, and grounded only in the submitted entry.
- Immediate-harm content receives no interpretation and shows the approved safety notice.
- A generation failure leaves the entry saved with a retry control.
- Only one retry may execute at a time; repeated requests return the existing successful reflection.
- API keys and model calls remain server-side.

Approved notice:

> MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.

### Dashboard and history

- The primary screen shows the current prompt, seven-day progress, completed days, and next unlock time.
- Entry history contains only real entries for the authenticated user.
- Each entry displays its day, prompt, mood when present, saved content, and reflection state.
- No random insight, fake trend, or fabricated streak appears in the paid path.

### Measurement

- Record: first login, program started, entry saved, reflection viewed, Day-2 return, and program completed.
- Do not store journal content in event metadata.
- Event writes must not block the core journal action.

### Account deletion and beta end

- An authenticated user can request permanent deletion of their profile, entries, reflections, and product events attributable to them.
- Deletion requires an explicit confirmation step and cannot expose administrative credentials to the browser.
- The founder does not inspect journal content for routine support.
- At beta end, users receive a 30-day migration window.
- If a user does not migrate, beta account and journal data are automatically deleted after the window.
- Payment and accounting records remain outside journal-data deletion when legally required.

## Data Contract

### `beta_access`

- `email`: normalized text, primary key.
- `status`: `active`, `revoked`, or `refunded`.
- `razorpay_payment_reference`: nullable text until verified.
- `granted_at`: timestamp.
- `created_at`: timestamp.

### `profiles`

- `user_id`: UUID primary key referencing the authenticated user.
- `email`: normalized text.
- `onboarding_completed_at`: nullable timestamp.
- `program_started_at`: nullable timestamp.
- `is_18_or_older`: boolean required before program start.
- `ai_processing_consent_at`: nullable timestamp.
- `created_at` and `updated_at`: timestamps.

### `journal_entries`

- `id`: UUID primary key.
- `user_id`: authenticated user UUID.
- `program_day`: integer constrained from 1 to 7.
- `prompt_id`: stable text identifier such as `day-1-mental-load`.
- `content`: non-empty text with application limit of 10,000 characters.
- `mood`: nullable integer constrained from 1 to 5.
- `created_at` and `updated_at`: timestamps.
- Unique key: `(user_id, program_day)`.

### `ai_reflections`

- `entry_id`: UUID primary key referencing a journal entry with cascade delete.
- `user_id`: authenticated user UUID.
- `reflection`: nullable text.
- `question`: nullable text.
- `status`: `pending`, `complete`, `failed`, or `safety_redirect`.
- `model`: nullable text.
- `attempt_count`: integer constrained to the supported retry policy.
- `created_at` and `updated_at`: timestamps.

### `product_events`

- `id`: UUID primary key.
- `user_id`: nullable authenticated user UUID.
- `event_name`: allowlisted event name.
- `metadata`: small JSON object without journal content.
- `created_at`: timestamp.

## Acceptance Criteria

- An allowlisted purchaser can request a magic link, sign in, start the program, save Day 1, and view a reflection.
- A non-allowlisted email cannot reach private routes.
- Two test users cannot read, update, or delete each other’s records through browser or direct Supabase requests.
- Day unlock, missed-day, edit, delete, completion, and expiry states behave as specified.
- AI success, safety redirect, timeout, failure, and retry states preserve the journal entry.
- Mobile and desktop flows work without horizontal overflow or inaccessible controls.
- The production build and TypeScript checks pass.
- The payment-to-first-reflection runbook succeeds with a Razorpay test payment before launch.
- A user who declines AI consent can complete entries without any Groq request.
- Account deletion removes the authenticated user’s private product data and blocks subsequent access.
