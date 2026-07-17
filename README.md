# MindFlow Journal

**A private, guided journal for making space in a busy mind.**

MindFlow Journal is a calm, non-clinical self-reflection product for people who overthink, feel mentally cluttered, or struggle with the blank page. It replaces an open-ended daily journal with a focused seven-day sequence: one prompt, one private entry, and—when the user consents—a concise AI reflection grounded in their own words.

> MindFlow is a journaling and self-reflection tool. It does not provide therapy, diagnosis, medical advice, or crisis support.

## What users experience

- A private, email magic-link sign-in for allowlisted founding-beta users.
- A seven-day **Emotional Reset** with time-based daily unlocks. Previously unlocked days remain available forever.
- One editable private entry per day, with an optional 1–5 mood check-in.
- Seven distinct writing experiences: mental load, urgency, control, recurrence, perspective, movement, and review.
- Optional NVIDIA-powered safety screening and concise per-entry reflections.
- A completion review synthesising the seven entries for users who consented to AI processing.
- A private journal archive, entry editing/deletion, AI-consent controls, and permanent account deletion.
- A public waitlist for the founding beta.

Completion is permanent: the program completes whenever all seven distinct entries have been saved. There is no completion deadline and journal entries are not removed by the program.

## Product principles

- **Private by default.** Journal data is isolated with Supabase Row Level Security; users can only access their own entries and reflections.
- **Consent before AI.** Entries are sent to NVIDIA only after explicit consent. Journaling continues normally without AI.
- **No fabricated wellness claims.** MindFlow does not score people, infer diagnoses, or claim treatment outcomes.
- **Small, deliberate scope.** Voice input, reminders, streaks, social features, and advanced analytics are intentionally out of scope for this beta.

## Technology

| Area | Choice |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI, Framer Motion |
| Authentication and data | Supabase Auth, Postgres, Row Level Security |
| AI reflections | NVIDIA API with server-only credentials and a safety screen |
| Deployment target | Vercel-compatible Next.js deployment |

## Architecture at a glance

```text
Allowlisted email
       |
Supabase magic link
       |
MindFlow web app
       |
   private entry ────────────────> Supabase Postgres + RLS
       |
explicit AI consent
       |
NVIDIA safety screen → concise reflection / seven-day review
```

The browser never receives the Supabase service-role key or NVIDIA API key. Server actions authenticate the user, authorise the operation, validate input, persist the entry, and only then request an AI response.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A Supabase project
- An NVIDIA API key for AI reflections (optional for journal-only development)

### Install and run

```bash
git clone <your-repository-url>
cd mindflow-journal
pnpm install
# Create .env.local using the environment-variable template below.
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` with the following values. Never commit this file or paste its contents into issues, pull requests, or client-side code.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
# Legacy projects may use NEXT_PUBLIC_SUPABASE_ANON_KEY instead.
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional AI reflections and seven-day review
NVIDIA_API_KEY=<server-only-nvidia-key>
NVIDIA_REFLECTION_MODEL=openai/gpt-oss-20b
NVIDIA_SAFETY_MODEL=nvidia/llama-3.1-nemoguard-8b-content-safety
```

`SUPABASE_SERVICE_ROLE_KEY` and `NVIDIA_API_KEY` must remain server-only. Do not prefix either value with `NEXT_PUBLIC_`.

## Supabase setup

Run the repository SQL files in the Supabase SQL Editor in their documented order. The repository includes schemas for:

- founding-beta access and profiles;
- private journal entries and AI reflections;
- the seven-day completion review;
- the public waitlist.

Before inviting anyone, verify all of the following in a non-production test account:

1. Add a normalised email to the beta allowlist.
2. Request and use a magic link for that exact email.
3. Confirm a non-allowlisted email cannot enter private routes.
4. Confirm one test user cannot read, edit, or delete another user’s entries or reflections.
5. Confirm journal-only and AI-consented onboarding paths both work.

## Development commands

```bash
pnpm dev       # Start the local development server
pnpm test      # Run unit tests
pnpm typecheck # Run TypeScript without emitting files
pnpm build     # Create a production build
pnpm start     # Serve the production build
```

## Seven-day program

| Day | Theme | Prompt |
| --- | --- | --- |
| 1 | Mental load | What thoughts are taking up the most space in your mind today? |
| 2 | Urgency | What feels urgent, and what can safely wait? |
| 3 | Control | Which parts of this situation are within your control? |
| 4 | Recurrence | What thought or concern keeps returning, and when does it usually appear? |
| 5 | Perspective | What might you say to a friend carrying the same concern? |
| 6 | Movement | What is one small action that would create a little more clarity? |
| 7 | Review | Looking back, what became clearer, and what do you want to carry forward? |

Day 1 is available after onboarding. Each later day unlocks 24 hours after the program start. Missing a day never removes access to previously unlocked prompts or saved writing.

## Privacy and safety

- The app uses authenticated, per-user Row Level Security policies for private product data.
- AI processing is opt-in and can be turned off in Settings.
- AI input is safety-screened before a reflection or completion review is generated.
- If immediate-danger content is detected, MindFlow does not interpret it and displays a direct emergency-support message instead.
- Deleting an account permanently removes the user’s account, entries, reflections, and attributable product events.

## Founding-beta operations

The planned founding-beta access path is:

```text
Carrd / waitlist → Razorpay payment → manual verification → allowlist → magic link → seven-day journal
```

Manual payment verification and access granting are intentional for the first small cohort. Automated billing, webhooks, reminders, and acquisition tooling should only be added when they become a real operational bottleneck.

## Repository guide

```text
src/app/          Routes, server actions, and public/authenticated pages
src/components/   Journal, onboarding, navigation, and reflection UI
src/lib/          Supabase clients, auth boundaries, program rules, AI helpers
supabase/         Database schemas, migrations, and verification SQL
```

## Contributing

Keep changes focused on the founding beta. Before opening a pull request:

1. Run `pnpm test` and `pnpm typecheck`.
2. Run `pnpm build` when network access to Google Fonts is available.
3. Never add real journal content, API keys, service-role keys, or screenshots containing personal data.
4. Preserve the non-clinical product boundary in UI copy, prompts, and AI instructions.

## Status

MindFlow Journal is an active founding-beta product. The current priority is a reliable, private completion journey and learning from the first paid users—not expanding the feature list.
