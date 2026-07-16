# What Gemini Did: Waitlist Implementation & Core Experiences (Days 1–3)

**Date:** July 15, 2026

## Phase 3: Groq AI Integration

I completed the implementation of Phase 3, successfully migrating the AI reflections architecture from OpenAI to Groq, prioritizing data privacy and structured safety measures.

### Key Changes & Additions

### 1. Database Schema & State Machine
- **Consent Versioning**: Migrated the `profiles` table to track explicit `ai_processing_provider` (Groq), `ai_consent_version` (Version 2), and revocation timestamps. Legacy OpenAI consent is deliberately invalidated.
- **Reflection Telemetry & Safety Logging**: Expanded the `ai_reflections` table to securely track generation tokens, latency (ms), token usage, error codes, and strict state flags without storing private user text.
- **Atomic Locking**: Authored a Postgres RPC (`claim_reflection_generation`) to eliminate race conditions, properly lock reflection jobs for exactly 90 seconds, and control retry logic (maximum 2 retries per content revision, 4 retries total).

### 2. Backend Operations (`src/lib/reflections.ts` & `src/app/actions.ts`)
- **Dual-Model Generation**: Installed `groq-sdk` and implemented a strict, sequential pipeline:
  1. A required pre-screening using `openai/gpt-oss-safeguard-20b`.
  2. If deemed safe, the actual reflection uses `openai/gpt-oss-20b` via structured JSON output formatting.
- **Secure Handling**: Entry content is hashed locally (`SHA-256`) to ensure the reflection state machine knows if the user has revised their text before re-triggering API calls. 
- **View Tracking**: Implemented the server action to securely log `reflection_viewed` events only once per entry.

### 3. Frontend Consent & UI (`src/components/*`)
- **Updated Settings & Onboarding**: Replaced all mentions of OpenAI with Groq. Legacy users are presented with a clear warning explaining that their previous consent is voided and they must manually opt-in to Groq.

### 4. Canonical Documentation
- Searched across all Markdown docs (`docs/` and `PROJECT_LEDGER.md`) and systematically replaced OpenAI terminologies with Groq, solidifying the new privacy-first strategy.

## Phase 4: Verification & Internal Beta Setup

I initiated Phase 4 to strictly verify the application logic and infrastructure before handoff.

### Testing & Verification
- **Test Infrastructure Setup**: Created a test runner `scratch/test-groq-matrix.js` to simulate the full state machine of the Groq integration directly against the live backend (hitting a dev-only API route to bypass Next.js middleware).
- **Groq Reflection Defect Fix**: Discovered and fixed a defect where the Groq API would fail to return a JSON object (returning an empty `failed_generation`) because the system prompt lacked the explicit word "JSON". Added explicit JSON formatting requirements to `src/lib/reflections.ts`.
- **Live Groq Verification (G-01 to G-11)**: Successfully executed the 11-step Groq matrix test suite, verifying consented saves, immediate danger triggers (correctly classifying intent to harm and returning `safety_redirect`), locking behavior (gracefully rejecting duplicate requests), and handling API errors/timeouts without data loss. 
- Documented all results in `docs/verification/phase-4/groq-results.md`.

## Phase 4, Part 2: Day 2 Urgency Experience

I successfully implemented the structured "Day 2: Urgency" exercise which introduces a two-part writing exercise ("Feels urgent" vs "Can safely wait").

### Key Changes & Additions

### 1. Database Schema (`supabase/phase_4_day_2.sql`)
- Created an additive migration to introduce a `response_data` JSONB column to the `journal_entries` table.
- Backfilled existing Day 2 generic test entries into the structured JSON format safely.
- Added strict shape-checking constraints for Day 2 to ensure `urgent` and `can_wait` are strings and at least one has content.

### 2. Backend Logic (`src/app/actions.ts`)
- Introduced the `Day2ResponseData` typing for the JSONB data.
- Built a dedicated `saveDayTwoEntry` server action that accepts the two-part inputs and securely generates the deterministic text combined payload for older read layers (like History and the AI moderation layer).
- Ensured a 10,000 combined-character limit and correct duplicate protection mechanisms.

### 3. Frontend Architecture (`src/components/*`)
- Extracted the reusable `MoodSelector` so both Day 1 and Day 2 can share the identical interaction logic and UI.
- Renamed the legacy `EntryComposer` to `Day1Composer`.
- Built the `Day2Composer` consisting of a responsive two-column grid (coral tint for "Feels urgent" and seafoam tint for "Can safely wait").
- Introduced `DayExperienceDispatcher` to cleanly switch between the single-input Day 1 experience and the dual-input Day 2 experience without cluttering the main Today screen.
- Enhanced the `SevenDayPath` sidebar so the **actively viewed day** perfectly highlights in pink (`bg-orchid-mist`), while the inactive ones revert to standard styles, responding directly to user design feedback.


## Phase 4, Part 3: Day 3 Control Boundary Experience

I successfully built Day 3 (the "Control" exercise), keeping true to the Seven-Day path architecture and distinct UI patterns.

### 1. Database Schema & Migration (`supabase/phase_4_day_3.sql`)
- Authored an additive SQL migration to validate Day 3's two-part structure (`within_control` and `outside_control`).
- Backfilled all existing legacy generic Day 3 entries into the new structured JSON.
- Re-locked the Day 2 JSON schema check to disallow raw `null` bypassing (previously permitted for incremental updates).
- Created a developer-only internal tool (`supabase/internal_test_unlock_all_days.sql`) to safely time-travel test accounts back 6 days to bypass real-time locks.

### 2. Backend Logic (`src/app/actions.ts`)
- Upgraded `response_data` typing to a unified `StructuredResponseData` discriminated union, establishing a scalable pattern for Days 4–7.
- Patched a critical omission in `getDashboard()` to ensure `response_data` is explicitly queried from the database so UI views load successfully.
- Added `saveDayThreeEntry` implementing strict validation (10k character limits, 48-hour timeline enforcement) and mapping inputs into `within_control` and `outside_control` strings.

### 3. Frontend Architecture (`src/components/day-3-composer.tsx`)
- Constructed a two-pane layout to emphasize contrast: "Within your control" (seafoam styling) vs "Outside your control" (orchid styling).
- Integrated `Day3Composer` into the existing `DayExperienceDispatcher`.
- Connected the form with `saveDayThreeEntry`, inheriting auto-save state, reflection generation, and exact character-limit counting logic.

## Phase 1 & 2: Overview (Historical)
I implemented the waitlist and user acquisition foundation as outlined in `User Acquisition.md` while strictly adhering to the visual constraints from `Design.md`.

### 1. Waitlist Application Frontend
- **Created `src/app/waitlist/page.tsx`**: A luminous, soft-themed waitlist landing page built with the defined MindFlow color palette (`var(--porcelain)`, `var(--ink)`, `var(--seafoam)`) and typography (Bricolage Grotesque, Instrument Sans).
- **Form Requirements**: The waitlist form accurately collects First Name, Email, Journaling Frequency, Biggest Difficulty, 18+ Confirmation, and Willingness to Pay, explicitly omitting any clinical or mental-health-related fields.
- **Created `src/app/waitlist/success/page.tsx`**: A confirmation screen providing a personalized prompt ("What usually stops you from journaling consistently?") to encourage organic connection over email or LinkedIn.

### 2. Backend & Database Schema
- **Created `src/app/waitlist/actions.ts`**: A Next.js Server Action to safely validate the user inputs and interact with the Supabase database.
- **Created `supabase/waitlist_schema.sql`**: Added the SQL schema for `waitlist_signups` which includes Row Level Security (RLS) policies allowing anonymous form submissions while strictly restricting read access to admins/service roles.

### 3. User Acquisition Artifacts
- Generated a **Social Content Calendar**: A 3-week Markdown schedule breaking down specific messaging themes (Problem of the Blank Page, Action over Overthinking, Privacy & Intentional Design) across LinkedIn, Instagram, and WhatsApp.
- Generated a **Prospect Tracker**: A 30-row CRM CSV tailored for tracking 10 warm individuals, 10 second-degree prospects, and 10 community leads.

## Status
- **Build**: Verified `pnpm build` output to ensure the application compiles cleanly.
- **Pending User Action**: The SQL migration (`supabase/phase_3_groq.sql`) must be executed manually in the Supabase Dashboard SQL Editor to allow the updated consent schema and locking mechanisms to work. Ensure you add `GROQ_API_KEY` to your environment configurations.
