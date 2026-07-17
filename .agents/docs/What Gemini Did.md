# What Gemini Did: Waitlist Implementation & Core Experiences (Days 1–7) & Analytics

**Date:** July 15, 2026

## Phase 9: NVIDIA AI Reflections Integration

I completed the migration from Groq to NVIDIA's OpenAI-compatible API for entry reflections and seven-day program reviews, continuing to prioritize strict data privacy and versioned user consent.

### Key Changes & Additions

### 1. Centralized NVIDIA Configuration (`src/lib/nvidia-ai.ts`)
- **Server-Only Module**: Implemented a secure `server-only` configuration module (`getNvidiaAiConfig`) that centralizes the NVIDIA API key validation and models (`meta/llama-3.1-70b-instruct` and `meta/llama-3.1-8b-instruct`).
- **Robust JSON Parsing**: Added `parseJsonObject` which safely wraps `JSON.parse` and explicitly throws an error if the output is not a generic JSON object (e.g., rejecting arrays or malformed strings), ensuring strict downstream expectations.
- **Strict Consent Rules**: Defined `hasActiveNvidiaConsent` to explicitly require `ai_processing_provider === 'nvidia'` and `ai_consent_version === 3`.

### 2. Frontend Consent Updates
- **Onboarding & Settings**: Migrated all onboarding language and settings panels from "Groq" to "NVIDIA".
- **Legacy Consent Handling**: Version 2 Groq consent is now treated strictly as legacy. Existing users are presented with a clear warning in their settings panel explaining their legacy consent is no longer valid and they must actively "Update to NVIDIA AI reflections".

### 3. Backend & Generation Flow
- **Dual-Model Generation**: Refactored `generateReflection` and `generateProgramReview` to depend entirely on `getNvidiaAiConfig` and the new parser, completely decoupling the system from the deprecated `groq-sdk`.
- **Cleanup**: Removed `groq-sdk` from dependencies, deleted Groq API key configuration, and renamed `test-groq` route to `test-nvidia`.

## Phase 3: Groq AI Integration (Legacy)

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
- Introduced the `DayTwoResponseData` typing for the JSONB data.
- Built a dedicated `saveDayTwoEntry` server action that accepts the two-part inputs and securely generates the deterministic text combined payload for older read layers (like History and the AI moderation layer).
- Ensured a 10,000 combined-character limit and correct duplicate protection mechanisms.

### 3. Frontend Architecture (`src/components/*`)
- Extracted the reusable `MoodSelector` so both Day 1 and Day 2 can share the identical interaction logic and UI.
- Renamed the legacy `EntryComposer` to `DayOneComposer`.
- Built the `DayTwoComposer` consisting of a responsive two-column grid (coral tint for "Feels urgent" and seafoam tint for "Can safely wait").
- Introduced `DayExperienceDispatcher` to cleanly switch between the single-input Day 1 experience and the dual-input Day 2 experience without cluttering the main Today screen.
- Enhanced the `SevenDayPath` sidebar so the **actively viewed day** perfectly highlights in pink (`bg-orchid-mist`), while the inactive ones revert to standard styles, responding directly to user design feedback.

## Phase 8: Analytics (Seven-Day Completion Reflection)

I successfully implemented the Seven-Day Completion Reflection plan, ensuring the completion flow remains calm and private, with no intrusive numerical scores or dashboards.

### 1. Database Schema & Migration (`supabase/phase_5_analytics.sql`)
- Authored an additive SQL migration that builds the `ai_program_reviews` table.
- Added strict Row-Level Security (RLS) policies allowing users to read only their own reviews while generation workflows operate safely from the service role.
- Updated `supabase_schema.sql` to integrate these final programmatic additions into the canonical schema.

### 2. Backend Logic (`src/app/actions.ts` & `src/lib/program-review.ts`)
- Added `ProgramReviewStatus` and `ProgramReview` types.
- Extended the `DashboardData` payload in `getDashboard` to include the user's review and a deterministic source hash.
- Built a deterministic `hashJournalEntries` helper in `src/lib/program-review.ts` that safely digests the sorted seven-day content text for detecting future journal edits (stale reviews).
- Created robust explicit generation pathways (`generateProgramReview`, `retryProgramReview`) relying on Groq generation and integrating the existing immediate-danger safety screens.
- Included a `keepProgramPractice` action allowing users to explicitly note when they intend to carry forward a generated gentle practice.

### 3. Frontend Components (`src/components/program-review-panel.tsx`)
- Designed and injected the `ProgramReviewPanel` to silently append below the final completed journal presentation in `TodayView`.
- Developed precise, state-driven UI blocks for users without AI consent, guiding them to enable reflections transparently if they wish.
- Surfaced clear visual indicators (via CSS pulsing and intuitive status text) when the long-running review generation is pending.
- Included a specialized stale-review notice which prompts the user to refresh their synthesis if they navigate back and edit a past entry.

## Phase 7: Day 7 Closing Review Experience

I successfully built Day 7 (the "Closing Review" exercise), which serves as the calm closing of the Emotional Reset program.

### 1. Database Schema & Migration (`supabase/phase_4_day_7.sql`)
- Authored an additive SQL migration to validate Day 7's specific structure (`became_clearer` and `carry_forward`).
- Enforced `became_clearer` as a strictly required field while leaving `carry_forward` optional.
- Backfilled legacy Day 7 generic text entries correctly into the `became_clearer` property.
- Updated the canonical `supabase_schema.sql` constraint rules.

### 2. Backend Logic (`src/app/actions.ts`)
- Extended the `StructuredResponseData` union with `DaySevenResponseData`.
- Authored the `saveDaySevenEntry` server action, incorporating the 144-hour unlock progression.
- Carefully executed the `program_completed` product event logic by guaranteeing it triggers correctly when the 7th and final entry is submitted.

### 3. Frontend Architecture (`src/components/day-7-composer.tsx`)
- Designed a distinct "closing spread" layout, distinguishing Day 7 from the earlier analytical maps and the Day 6 stepping-stone layout.
- The main required card "What became clearer?" uses a large porcelain design.
- The optional card "Carry forward" is connected directly below it as an Orchid Mist section.
- Designed a specific post-save completion transition flow: the AI reflection remains fully visible, accompanied by a new "View your completed journal" link that smoothly guides users to the final journal completion state.
- Interfaced seamlessly with `DayExperienceDispatcher`.

## Phase 6: Day 6 Small Movement Experience

I successfully built Day 6 (the "Small Movement" exercise), introducing a visually distinct "stepping-stone" composition to gently transition the user from reflection into action.

### 1. Database Schema & Migration (`supabase/phase_4_day_6.sql`)
- Authored an additive SQL migration to validate Day 6's specific structure (`small_action` and `first_moment`).
- Enforced `small_action` as a strictly required field while leaving `first_moment` (making starting lighter) optional.
- Backfilled legacy Day 6 generic text entries correctly into the `small_action` property.
- Updated the canonical `supabase_schema.sql` constraint rules.

### 2. Backend Logic (`src/app/actions.ts`)
- Extended the `StructuredResponseData` union with `DaySixResponseData`.
- Authored the `saveDaySixEntry` server action, incorporating the 120-hour unlock progression.
- Handled the AI compilation formatting elegantly to combine the action and the optional "lighter moment" note.

### 3. Frontend Architecture (`src/components/day-6-composer.tsx`)
- Designed the "stepping-stone" layout to distinguish Day 6 from previous days.
- The main required card "One small action" sits boldly at the top using a structured Porcelain design.
- The optional card "Make starting lighter" sits below and offset to the right, utilizing Seafoam accents (`bg-[#f0fbf4]`) to represent a forward step.
- Connected the two cards aesthetically with a beautiful gradient thread (`from-lilac/40 to-seafoam/40`) to reinforce the path metaphor, meticulously avoiding any task manager tropes (no checkboxes, no due dates).
- Interfaced seamlessly with `DayExperienceDispatcher`.

## Phase 5: Day 5 Perspective Note Experience

I successfully built Day 5 (the "Perspective Note" exercise), shifting from the analytical map structures of the earlier days to a more intimate "letter-card" composition.

### 1. Database Schema & Migration (`supabase/phase_4_day_5.sql`)
- Authored an additive SQL migration to validate Day 5's unique structure (`note_to_friend` and `line_to_keep`).
- Enforced `note_to_friend` as a strictly required field while leaving `line_to_keep` entirely optional.
- Backfilled legacy Day 5 generic text entries safely.
- Updated the canonical `supabase_schema.sql` constraint rules.

### 2. Backend Logic (`src/app/actions.ts`)
- Extended the `StructuredResponseData` union with `DayFiveResponseData`.
- Authored the `saveDayFiveEntry` server action, incorporating the 96-hour unlock progression.
- Ensured the `content` field for AI generation neatly formats the note without introducing messy artifacts if the optional line is omitted.

### 3. Frontend Architecture (`src/components/day-5-composer.tsx`)
- Designed a distinct letter-card UI. The main "What you would say" area uses a large warm porcelain editorial canvas with subtle horizontal ruling lines (like a notepad).
- Built a bespoke CSS "folded paper corner" detail on the top right to anchor the letter metaphor without relying on explicit send/envelope semantics.
- Positioned the optional "A line to keep" as a smaller Orchid Mist inset card slightly offset below the main note.
- Integrated `DayFiveComposer` seamlessly into `DayExperienceDispatcher`.

## Phase 4, Part 4: Day 4 Recurrence Loop Experience

I successfully built Day 4 (the "Recurrence Loop" exercise), introducing a vertical interface distinct from the side-by-side view used in Day 3.

### 1. Database Schema & Migration (`supabase/phase_4_day_4.sql`)
- Authored an additive SQL migration to validate Day 4's structure (`recurring_thought` and `usual_moment`).
- Enforced `recurring_thought` as a required field while leaving `usual_moment` strictly optional.
- Backfilled legacy Day 4 generic text entries into the new structured JSON `recurring_thought` field.
- Updated the canonical `supabase_schema.sql` constraint rules.

### 2. Backend Logic (`src/app/actions.ts`)
- Extended the `StructuredResponseData` union with `DayFourResponseData`.
- Authored the `saveDayFourEntry` server action, incorporating the 72-hour unlock progression.
- Ensured the `content` field for AI generation only includes `usual_moment` text if it was actually provided, preventing messy formatting on empty optional inputs.

### 3. Frontend Architecture (`src/components/day-4-composer.tsx`)
- Designed a stacked, vertical loop composer UI. The top card uses a warm porcelain style with Lilac accents for the required "recurring thought", while the optional "usual moment" context card sits below on Orchid Mist.
- Connected the two components with a subtle vertical thread to visualize the recurrence loop.
- Integrated `DayFourComposer` seamlessly into `DayExperienceDispatcher` to continue the progressive unlocked journey.

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
- Integrated `DayThreeComposer` into the existing `DayExperienceDispatcher`.
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
