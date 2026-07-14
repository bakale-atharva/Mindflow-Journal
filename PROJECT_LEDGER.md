# MindFlow Journal — Project Ledger

Last updated: 2026-07-13

## Project Snapshot

MindFlow Journal is a calm, direct, non-clinical AI-guided journaling product for people who overthink, feel mentally cluttered, or struggle with journaling consistency. The immediate business goal is to acquire paying founding users quickly, using free distribution by default and removing product work that does not directly improve activation, learning, or revenue.

Current stage: Phase 1 code and database schema are active; authentication URL setup, allowlist testing, and live two-user isolation verification remain before the security gate can close.

Confidence: high for the approved founding-beta scope and repository state. Historical drafts were not available, so the canonical documents were reconstructed and approved from the supplied context and grilling decisions.

## Current Focus

- Verify the completed security gate in the connected Supabase project.
- Turn the current single-user prototype into a safe, testable paid beta.
- Launch the founding offer and begin direct customer acquisition before polishing growth features.

## Done So Far

### Strategy and planning

- Defined product direction and ownership model.
- Established profitability and customer acquisition as the first priority.
- Set a default preference for free tools and free resources.
- Defined the product as self-reflection and journaling, not therapy, diagnosis, or crisis support.
- Drafted a product blueprint spanning MVP, growth, and scale phases.
- Documented proposed features: smart prompts, voice-to-entry, AI daily summaries, mood tracking, streaks, cloud sync, and reminders.
- Drafted technical architecture and stack direction.
- Defined onboarding and key user flows.
- Documented positioning, target segments, SWOT, monetization, go-to-market, risks, team, milestones, and success metrics.
- Drafted a development task list.
- Drafted a 90-day customer acquisition plan targeting 1,000 paying customers.
- Drafted warm DMs, short DMs, follow-ups, objection responses, X posts, Instagram content, and Reddit/community posts.
- Drafted Carrd early-access sales copy.
- Drafted Typefully setup and platform guidance.
- Defined the initial founding beta concept: 20 users, ₹299 one-time, early access, and a 7-Day Emotional Reset; an early lifetime-discount idea was later removed from public copy.
- Completed the Phase 0 source-of-truth set under `docs/`: operating brief, product blueprint, MVP specification, task ledger, customer acquisition plan, copy library, and launch runbook.
- Locked the founding-beta funnel: Carrd, Razorpay, manual allowlist, email magic link, and web app.
- Locked the beta as 18+ with a seven-day refund window.
- Locked explicit OpenAI-processing consent and a private journaling path without AI.
- Locked no founder access to journal content for routine support.
- Locked permanent user-controlled account/data deletion.
- Locked a 30-day migrate-or-delete window when beta ends.
- Removed the undefined lifetime Pro discount from public beta copy until pricing and unit economics are known.

### Repository and implementation

- Created and connected a Git repository.
- Scaffolded a Next.js 16.2.9, React 19, TypeScript, and Tailwind CSS application.
- Added UI/component foundations, animation support, Supabase packages, and the OpenAI SDK dependency.
- Added a Supabase client and initial `journal_entries` schema.
- Built an onboarding UI prototype with goal, reminder-time, and first-prompt steps.
- Built responsive navigation/layout components.
- Built a journal entry list and entry composer.
- Implemented entry creation, retrieval, and deletion against Supabase.
- Added mood selection and custom entry date/time to the current working tree.
- Built entry cards and a journal list/form transition in the current working tree.
- Built prototype insight, streak, mood-trend, and entry-detail screens using mock or placeholder data.
- Created an investor dashboard mockup asset.
- Verified on 2026-07-13 that the current production build compiles and passes TypeScript.
- Read the bundled Next.js 16 authentication, cookies, forms, redirect, and Proxy guidance before implementing Phase 1.
- Added a complete migration-aware Supabase schema covering beta access, profiles, secured journal entries, future reflections, product events, constraints, grants, and RLS.
- Added a two-user SQL isolation verification script.
- Implemented email magic-link request, PKCE callback exchange, session refresh Proxy, and sign-out.
- Implemented server-side active-allowlist checks without exposing the allowlist table.
- Replaced the shared hard-coded journal identity with the authenticated Supabase user in create, read, and delete operations.
- Standardized current journal mood values to the 1–5 database contract.
- Removed prototype-only navigation and redirected mock insight, onboarding, and entry-detail routes out of the launch path.
- Added a dedicated public authentication experience and clear access/error states.
- Verified the Phase 1 application with a successful production build and TypeScript check.
- Verified locally that `/` redirects unauthenticated requests to `/auth/login` and that the login page renders successfully.
- Applied the complete Phase 1 schema to the connected Supabase project without SQL errors on 2026-07-14.

## In Progress / Uncommitted Work

- Journal UI redesign and real Supabase-backed list flow.
- Mood and custom date/time persistence.
- Delete-entry flow.
- Associated database migration and schema updates.
- Styling and layout adjustments.

These changes exist locally but are not committed. They must be reviewed and tested before being treated as a stable milestone.

## Decisions Made

- Optimize for early revenue and customer learning, not feature completeness.
- Use free acquisition channels first.
- Avoid clinical, therapy, diagnosis, and crisis-support positioning.
- Use a paid founding beta rather than waiting for a polished public product.
- Initial offer concept: 20 founding users at ₹299 one-time.
- Use “7-Day Emotional Reset” as the offer; do not promise a lifetime Pro discount until Pro pricing and unit economics are defined.
- Treat speculative growth features as deferrable when they slow the first paid launch.
- Keep “7-Day Emotional Reset” as the founding-beta offer name.
- Make previously unlocked prompts available when a user misses a day.
- Treat future licensed-professional access as a separate product and compliance track.

## Still To Do

### Stabilize the current prototype — next dependency

- Review and finish the current uncommitted journal changes.
- Replace permissive database access with authenticated per-user access before accepting real private journal data.
- Add a complete authentication flow; client/server helpers exist but no usable sign-up/login route is present.
- Resolve the mismatch between mock mood scores and stored emoji values.
- Replace or remove mock insight, streak, trend, and entry-detail data.
- Connect onboarding answers to stored user state, or simplify onboarding for the beta.
- Add useful empty, loading, validation, and failure states.
- Add focused tests for private-data isolation and the core entry flow.
- Test the production build and primary flow in a browser on mobile and desktop.
- Implement 18+ confirmation, AI consent, account deletion, and beta-end data lifecycle.

### Core founding-beta experience — depends on safe user accounts

- Implement the selected daily prompt / 7-day program flow.
- Implement the smallest useful AI reflection after an entry, with clear non-clinical wording.
- Add entry history and a usable individual entry view backed by real data.
- Decide whether basic mood logging remains in the beta; if retained, use one consistent scale.
- Decide whether streaks are essential to the 7-day promise; otherwise defer them.

### Revenue path — can proceed alongside prototype stabilization

- Turn the Carrd copy into a live landing/sales page.
- Add a clear founding-offer checkout or payment link.
- Define how payment grants beta access.
- Add confirmation, onboarding, and support messages for purchasers.
- Add basic privacy, terms, refund, and non-clinical disclaimer pages/copy.
- Instrument visits, checkout starts, purchases, onboarding completion, first entry, AI reflection viewed, day-2 return, and day-7 completion.

### Acquisition and beta operations — depends on a working sales path

- Set up Typefully or choose a simpler manual posting workflow.
- Establish a small repeatable content schedule.
- Start warm outreach and founder-led DMs.
- Begin useful community participation without promotional spam.
- Track prospects, replies, objections, payments, activation, and feedback in one lightweight system.
- Recruit and onboard the first 5 users before expanding toward 20.
- Run short feedback conversations and record changes by impact on conversion or retention.

### Explicitly deferred unless user evidence changes the priority

- Voice-to-entry.
- Advanced mood analytics and charts.
- Complex streak gamification.
- Multi-channel reminders.
- Marketed multi-device cloud-sync features beyond necessary account persistence.
- Broad AI daily/weekly summaries beyond the smallest useful reflection.
- Scale architecture and extensive polish.

## Open Questions

- Does the connected Supabase project contain any real user data?
- Which managed host and production URL will be used?
- What support email or contact will receive refund and access requests?
- When will the beta formally end and start the 30-day migration window?

## Blockers and Risks

- The Phase 1 schema is active, but live magic-link behavior and cross-user isolation are not yet certified.
- Several impressive-looking screens use random or mock data and may create false confidence about product readiness.
- AI functionality is named in the product promise but is not yet implemented in the inspected core flow.
- Landing page, payment, access granting, and analytics are not evidenced in the repository.
- The current working tree has substantial uncommitted work, increasing the chance of accidental loss or unclear ownership.
- Some current copy uses mental-wellness/anxiety language that should be reviewed against the non-clinical positioning.
- The 1,000-paying-customer/90-day goal is not an appropriate immediate execution target before proving conversion and retention with the first 5–20 customers.

## Next Best Action

Configure the Supabase Site URL and local `/auth/callback` redirect, then create an allowlisted test user and prove the magic-link journey before running the two-user isolation test.

## Suggested Execution Plan

1. Preserve and review the current uncommitted work; fix the core journal flow and data model.
2. Add real user authentication and private per-user database policies.
4. Build the 7-day prompt sequence and the smallest safe AI reflection flow.
5. Replace mock data in the paid path; remove nonessential prototype routes from launch navigation.
6. Publish the landing page, payment path, access-grant process, and essential policies.
7. Add lightweight funnel and product-event tracking.
8. Manually test the complete purchase-to-first-reflection journey on mobile and desktop.
9. Recruit the first 5 paid users through warm outreach and existing scripts.
10. Fix only issues that block purchase, activation, trust, or 7-day completion.
11. Expand to 20 founding users and review conversion, activation, day-2 return, day-7 completion, qualitative value, and refund requests.
12. Decide the next build based on observed retention and buyer feedback, then update this ledger.

## Change Log

- 2026-07-13: Initial ledger reconstructed from owner-provided status and repository audit. Production build verified. Repository implementation found to be materially ahead of the supplied “still to do” list.
- 2026-07-13: Phase 0 completed. Seven canonical documents created. Grilling session locked age, refund, consent, founder-access, deletion, data-lifecycle, missed-day, and discount decisions.
- 2026-07-13: Phase 1 implemented locally. Secure auth, allowlist boundary, authenticated journal operations, complete database SQL, and RLS verification script added. Production build passed; remote database application and isolation verification remain.
- 2026-07-14: The complete Phase 1 schema was applied to the connected Supabase project without errors. Authentication and isolation verification remain.
