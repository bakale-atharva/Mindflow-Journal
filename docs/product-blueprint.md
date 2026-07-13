# MindFlow Journal — Product Blueprint

Status: Canonical  
Last updated: 2026-07-13

## Product Thesis

People who feel mentally cluttered often want to reflect but do not know where to begin. MindFlow replaces the blank page with one focused prompt, a private place to answer, and a concise reflection that helps the user notice what they already expressed.

The founding beta validates one loop:

**Prompt → private entry → concise reflection → return the next day.**

## Target Customer

Primary customer:

- Thinks repeatedly about unresolved decisions, responsibilities, or conversations.
- Wants clarity rather than clinical treatment.
- Has tried journaling but struggles to begin or remain consistent.
- Is comfortable using a private web app and paying ₹299 for a bounded seven-day experience.
- Is 18 years or older during the founding beta.

Not the target for the founding beta:

- Someone seeking diagnosis, therapy, medical advice, or crisis intervention.
- Someone primarily looking for voice capture, social journaling, or advanced mood analytics.

## Experience Architecture

### Sales and access

1. User reads the Carrd sales page.
2. User pays ₹299 through Razorpay using the same email intended for access.
3. Owner verifies the captured payment.
4. Owner adds the normalized email to the beta allowlist within 12 hours.
5. User opens the product and requests a Supabase magic link.
6. The app admits allowlisted users and rejects others with clear next steps.

### Product loop

1. User completes lightweight onboarding.
2. Day 1 unlocks immediately.
3. User reads the day prompt, selects an optional mood from 1–5, and writes an entry.
4. The entry is saved before any AI request begins.
5. A consenting user’s safe input receives one concise AI reflection and optional follow-up question; a user who declines AI processing can continue without a reflection.
6. Day N+1 unlocks 24 hours after program start; previously unlocked days stay available.
7. The program is complete when all seven entries are submitted within ten days.

## Seven-Day Sequence

1. Mental load: What thoughts are taking up the most space in your mind today?
2. Urgency: What feels urgent, and what can safely wait?
3. Control: Which parts of this situation are within your control?
4. Recurrence: What thought or concern keeps returning, and when does it usually appear?
5. Perspective: What might you say to a friend carrying the same concern?
6. Movement: What is one small action that would create a little more clarity?
7. Review: Looking back, what became clearer, and what do you want to carry forward?

## Product Phases

### Founding beta — current

- Secure accounts and private data.
- Manual paid access.
- Fixed seven-day sequence.
- Optional 1–5 mood check-in.
- One AI reflection per entry.
- Basic progress and entry history.
- Essential measurement and support operations.

### Growth — unlocked by evidence

Consider only after paid conversion and return behavior are demonstrated:

- Additional guided programs or goal-based tracks.
- Reminders.
- Lightweight weekly summaries.
- Improved progress views.
- Automated payment access.
- Referral mechanics.

### Scale — explicitly deferred

- Voice-to-entry.
- Advanced mood and pattern analytics.
- Complex streaks or gamification.
- Broad personalization and generated prompts.
- Community or sharing features.
- Native mobile applications.
- Enterprise or practitioner workflows.

## Technical Direction

- Application: Next.js 16 App Router and React 19.
- Language: TypeScript.
- Styling: Tailwind CSS with existing component primitives.
- Authentication and database: Supabase.
- AI: OpenAI Responses API, server-side only.
- Payments: Razorpay Standard Payment Link, manually verified during beta.
- Landing page: Carrd, maintained outside this repository.
- Deployment: a managed Next.js host compatible with the existing application; final environment is not yet evidenced in the repository.

## Core Data Domains

- Beta access: normalized email, status, Razorpay reference, access timestamp.
- Profile: authenticated user, email, onboarding state, program start.
- Journal entry: user, program day, prompt, content, optional mood, timestamps.
- AI reflection: entry, reflection text, optional question, status, model, timestamps.
- Product event: user, event name, timestamp, minimal metadata.

Every private record must be protected by authenticated-user row-level security. Administrative allowlist operations must not be exposed through the public browser client.

## AI Product Boundary

The AI reflects the entry rather than evaluating the person. A successful response contains two or three short sentences, no more than 80 words, plus at most one short follow-up question.

The system must:

- Avoid diagnosis, labels, treatment, and certainty about motives.
- Avoid introducing events or emotions not present in the entry.
- Preserve the entry when reflection generation fails.
- Run moderation before reflection generation.
- Replace interpretation with the approved immediate-danger notice when required.
- Permit one idempotent retry after a technical failure.

## Data Lifecycle and Access

- Require explicit consent before sending entry text to OpenAI.
- Allow private journaling without AI processing when consent is declined.
- Users may permanently delete their account and journal data at any time.
- The founder must not read entry content for routine support; diagnose issues from IDs, timestamps, logs, and user-provided error details.
- At beta end, users receive 30 days to migrate into the full app.
- Users who do not migrate have their beta journal content and account data automatically deleted after that window, excluding financial records that must be retained separately.
- Any future licensed-professional workflow is a separate product and compliance track, not an extension of founding-beta permissions.

## Measurement Model

Funnel events:

- Landing visit.
- Payment-link click.
- Captured payment.
- Access granted.
- First login.
- Program started.
- Entry saved.
- Reflection viewed.
- Day-2 return.
- Program completed.
- Refund or reported error.

The founding beta uses Supabase product events and one lightweight prospect/customer sheet. Analytics infrastructure must remain smaller than the product being measured.

## Strategic Risks

- Private data exposure would invalidate the launch; security is a hard gate.
- Mock insights can create false confidence; they must not appear in the paid path.
- Overbuilding personalization can delay revenue without improving the core loop.
- AI copy can drift into clinical claims; prompts, outputs, and public copy require a consistent boundary.
- Manual access may be slow; the published 12-hour expectation must be met.
- A sample of five is directional, not statistically conclusive; use it to find severe friction and value signals.
