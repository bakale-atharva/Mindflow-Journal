# MindFlow Journal — Project Ledger

Last updated: 2026-07-14

## Project Snapshot

MindFlow Journal is a calm, direct, non-clinical AI-guided journaling product for people who overthink, feel mentally cluttered, or struggle with journaling consistency. The immediate business goal is to acquire paying founding users quickly, using free distribution by default and removing product work that does not directly improve activation, learning, or revenue.

Current stage: Phase 1 is complete and the owner has verified the Phase 2 application journey. Confirmation of the live Phase 2 migration and post-migration RLS test remains before the phase formally closes.

Confidence: high for the approved founding-beta scope and repository state. Historical drafts were not available, so the canonical documents were reconstructed and approved from the supplied context and grilling decisions.

## Current Focus

- Activate and verify the completed seven-day program migration in the connected Supabase project.
- Validate the authenticated onboarding-to-Day-1 journey on mobile and desktop.
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
- Locked explicit Groq-processing consent and a private journaling path without AI.
- Locked no founder access to journal content for routine support.
- Locked permanent user-controlled account/data deletion.
- Locked a 30-day migrate-or-delete window when beta ends.
- Removed the undefined lifetime Pro discount from public beta copy until pricing and unit economics are known.

### Repository and implementation

- Created and connected a Git repository.
- Scaffolded a Next.js 16.2.9, React 19, TypeScript, and Tailwind CSS application.
- Added UI/component foundations, animation support, Supabase packages, and the Groq SDK dependency.
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
- Verified an allowlisted user can receive a magic link, sign in, persist the session, and create and view a journal entry.
- Verified a non-allowlisted email is rejected from founding-beta access.
- Verified two-user database isolation: User B could not read, update, or delete User A’s entry, while User A retained access to the unchanged entry.
- Implemented the fixed seven-prompt program, server-derived 24-hour unlocks, missed-day access, and one editable entry per day.
- Implemented three-stage 18+ onboarding, optional AI-processing consent, and an explicit immutable program start.
- Implemented real progress, current/available/complete/locked day states, exact next unlock time, journal archive, entry detail, editing, deletion, and completion presentation.
- Applied the Living Field Journal design system from `Design.md`, including the responsive thought contour, labeled five-point mood control, and light porcelain/lilac visual language.
- Added database-enforced program start immutability, day/prompt identity, and server-time unlock eligibility in the Phase 2 migration.
- Added program loading, failure, expired-window, and responsive next-unlock states.
- Added eight passing program tests covering exact unlock boundaries, missed days, immutable unlock schedule, completion deadline, distinct days, and late completion.
- Verified the Phase 2 production build and TypeScript checks on 2026-07-14.
- Owner verified the Phase 2 application journey on 2026-07-14.

## In Progress / Uncommitted Work

- Phase 2 hardening, program tests, responsive states, and database migration.
- A pre-existing onboarding layout adjustment remains preserved in the working tree.

These changes must be committed after the live migration and journey checks, or intentionally committed as a local implementation milestone.

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

### Phase 4 Verification — next dependency

- Execute deterministic regression tests and manual browser QA.
- Phase 2 and 3 SQL confirmed successful by owner.
- Repeat the two-user isolation test with two clean test accounts.
- Verify fresh-user onboarding, both consent paths, Day 1 save/edit/delete, future-day rejection, and returning-user routing.
- Complete visual QA at mobile, tablet, laptop, and wide-desktop widths.
- Configure the service-role key before relying on product events or account deletion.

### Core founding-beta experience — after Phase 2 verification

- Complete Phase 3 AI configuration and safety-path testing.
- Finish and verify permanent account deletion and the beta-end data lifecycle.

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

- Phase 1 private-data isolation and allowlist authentication are certified against the connected Supabase project.
- Phase 2 program invariants are not live until its Supabase migration is applied.
- AI functionality exists but is not configured or verified against a live Groq key.
- Landing page, payment, access granting, and analytics are not evidenced in the repository.
- Product-event and account-deletion operations require a Supabase service-role key that is not configured locally.
- Some current copy uses mental-wellness/anxiety language that should be reviewed against the non-clinical positioning.
- The 1,000-paying-customer/90-day goal is not an appropriate immediate execution target before proving conversion and retention with the first 5–20 customers.

## Next Best Action

Proceed with Phase 4 Internal Beta Verification: create regression tests and perform live browser verification against the confirmed safe environment.

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
- 2026-07-14: Diagnosed the allowlist failure as an obsolete or incorrect Supabase project URL. The owner replaced it with the active project configuration and confirmed the connection works.
- 2026-07-14: Allowlisted magic-link login, session persistence, journal entry creation/read, and non-allowlisted rejection were verified successfully. Two-user RLS isolation remains.
- 2026-07-14: Two-user RLS verification passed without a setup or isolation failure. Phase 1 security gate closed; Phase 2 is ready to begin.
- 2026-07-14: Phase 2 implemented locally using the Living Field Journal design. Eight program tests, TypeScript, and the production build pass; live migration and authenticated browser verification remain.
- 2026-07-14: Owner reported the Phase 2 application journey verified. Database-migration and post-migration isolation confirmation remain before closing the phase.
