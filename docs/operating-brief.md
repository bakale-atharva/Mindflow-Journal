# MindFlow Journal — Operating Brief

Status: Canonical  
Owner: Project owner  
Last updated: 2026-07-13

## Purpose

MindFlow Journal is a private, AI-guided journaling product for people who overthink, feel mentally cluttered, or struggle to journal consistently. It removes blank-page friction through a short guided sequence and helps users reflect on what they wrote in calm, plain language.

MindFlow is a self-reflection tool. It is not therapy, a diagnostic service, medical advice, or crisis support.

## Current Business Objective

Sell a focused founding beta to 20 users at ₹299 one-time. Prove that people will pay, complete the first reflection, return on Day 2, and finish the seven-entry program before expanding the feature set or acquisition target.

The immediate gate is five paid users. The previous 1,000-paying-customer target remains a long-term ambition, not the current operating target.

## Founding Offer

- Name: MindFlow Journal — 7-Day Emotional Reset.
- Audience: people who overthink, feel mentally cluttered, or find open-ended journaling difficult.
- Format: private web app.
- Price: ₹299 paid before access.
- Capacity: 20 founding users.
- Included: seven fixed prompts, one private entry per day, optional mood check-in, one concise AI reflection per entry, and entry history.
- Access: Razorpay Payment Link followed by manual payment verification and email allowlisting within 12 hours.
- Sign-in: Supabase email magic link.
- Eligibility: 18 years or older during the founding beta.
- Refunds: available for seven days from purchase.

## Operating Principles

- Revenue and customer learning come before polish.
- Use free tools and manual operations until automation removes a demonstrated bottleneck.
- Add work only when it improves purchase, trust, activation, completion, or learning.
- Protect private journal data before inviting real users.
- Use calm, direct, non-clinical language.
- Make assumptions explicit and decisions reversible where possible.
- Recruit five paid users, repair the journey, then expand toward twenty.
- Do not present mock or random data as a real user insight.

## Product Boundaries

The founding beta includes only the paid seven-day experience. Voice-to-entry, advanced analytics, complex streaks, reminders, broad summaries, marketed multi-device sync, community features, and scale architecture are deferred.

AI may summarize or gently reflect what a user wrote. It must not diagnose, label conditions, prescribe treatment, claim therapeutic outcomes, or assume facts not present in the entry.

## Current State

- A Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase prototype exists.
- Journal creation, retrieval, and deletion are implemented in the current working tree.
- Mood and custom entry-date changes are present locally but uncommitted.
- Onboarding, navigation, insights, and entry-detail prototypes exist.
- Some insight and entry-detail screens use mock or random data.
- Authentication is not complete.
- Entries currently use a shared hard-coded user ID.
- The database policy currently allows unrestricted operations.
- AI reflection, beta access, payment operations, and product analytics are not implemented.
- The production build passed on 2026-07-13.

No real beta user should be invited until authentication and per-user row-level security are verified.

## Locked Decisions

- Web-app-only beta.
- ₹299 payment before access.
- Razorpay Standard Payment Link.
- Manual payment verification and allowlist for the first 20 users.
- Email magic-link authentication.
- One fixed seven-prompt sequence for all users.
- One AI reflection after each saved entry.
- Carrd remains outside the product repository.
- Supabase remains the database and authentication provider.
- Acquisition starts only after the payment-to-reflection journey passes testing.
- Explicit Groq-processing consent is required before the first AI reflection.
- Users who decline AI processing may still save private entries without reflections.
- The founder does not read journal entries for routine operations or support.
- Users can permanently delete their account and journal data.
- At the end of beta, users receive 30 days to migrate into the full app; data is automatically deleted if they do not migrate.
- The undefined lifetime Pro discount is removed from public copy until pricing and unit economics are known.

## Success Measures

- First gate: five captured payments.
- Activation: at least four of the first five users view their first reflection within 24 hours of receiving access.
- Day-2 return: at least three of the first five users return.
- Completion: track seven submitted entries within ten days; do not set a scale target until the first five are observed.
- Privacy: zero cross-user data exposure.
- Learning: every initial user is interviewed after completion or abandonment.

## Decision Rule

When a new task is proposed, ask:

1. Does it help a qualified person buy?
2. Does it protect private data or trust?
3. Does it help a purchaser reach their first useful reflection?
4. Does it help them return and complete the seven entries?
5. Does it produce evidence needed for the next decision?

If the answer is no to all five, defer it.

## Sources of Truth

- This document: strategy, positioning, constraints, and locked decisions.
- `product-blueprint.md`: phased product direction and system shape.
- `mvp-specification.md`: founding-beta behavior and acceptance criteria.
- `task-ledger.md`: executable work status and dependencies.
- `customer-acquisition-plan.md`: recruitment and measurement process.
- `copy-library.md`: approved launch and outreach language.
- `launch-runbook.md`: payment, access, launch, support, and incident operations.
- `../PROJECT_LEDGER.md`: living cross-project status and change history.
