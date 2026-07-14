# MindFlow “Living Field Journal” Redesign

## Summary

Redesign the complete seven-day founding-beta experience in a luminous, responsive visual system. The design will combine the references’ atmospheric gradients, structured cards, tactile mood selection, and editorial journaling character without copying their layouts or introducing medical-style analytics.

The redesigned journey remains focused on:

**Daily prompt → private entry → optional AI reflection → seven-day progress**

Advanced charts, health metrics, recommendations, streaks, and fabricated insights remain excluded.

## Original Design Direction

- **Concept:** A living field journal—precise and structured around the edges, expressive where the user is writing or reflecting.
- **Signature element:** A layered “thought contour” made from translucent CSS/SVG shapes. Its color and form respond to the selected mood but never imply a health score or diagnosis.
- **Palette:** Porcelain `#F7F4FB`, Ink `#242135`, Lilac `#A77BEF`, Orchid Mist `#E8D9FF`, Coral `#FF8C7A`, Seafoam `#BDF4D1`.
- **Typography:** Bricolage Grotesque for expressive headings, Instrument Sans for reading and controls, and IBM Plex Mono for dates, day labels, and compact status information. Load through `next/font`.
- **Surfaces:** Warm-white cards, soft hairline borders, 14–32px radii, minimal shadows, and controlled translucency. Avoid glass effects on text-heavy areas.
- **Motion:** One orchestrated contour-settling transition when opening a day or receiving a reflection. Ordinary controls use restrained 150–220ms transitions. Respect reduced-motion preferences.
- **Mood control:** Five labeled abstract swatches—Heavy, Low, Steady, Light, Energized—replacing emoji as the primary visual language while retaining accessible text and the existing 1–5 data model.

## Experience and Layout

Desktop:

```text
┌──────────────┬──────────────────────────────┬───────────────────┐
│ MindFlow     │ Day 3 · Today               │ Seven-day path    │
│ Today        │                              │ ● ● ◉ ○ ○ ○ ○     │
│ Journal      │ Daily prompt                 │ Next unlock       │
│ Settings     │ Thought-contour canvas       │ Recent entries    │
│              │ [Begin / Continue entry]     │ Privacy reminder  │
└──────────────┴──────────────────────────────┴───────────────────┘
```

Mobile:

```text
┌─────────────────────────┐
│ Day 3             Menu  │
│ Seven-day progress      │
│                         │
│ Daily prompt            │
│ Thought contour         │
│ [Begin entry]           │
│                         │
│ Today  Journal  Settings│
└─────────────────────────┘
```

- **Login:** Recompose the existing magic-link flow as a split editorial welcome on desktop and a focused single-column card on mobile. Preserve all allowlist and error behavior.
- **Onboarding:** Three short stages: product promise and boundary; 18+ confirmation; AI-consent choice and explicit program start. Explain that declining AI still allows journaling.
- **Today:** Make the current unlocked prompt the dominant element. Show real seven-day progress, completed/unlocked/locked days, and the exact next unlock time.
- **Entry composer:** Use a focused writing canvas with the fixed prompt, optional mood selector, autosized text area, character boundary, explicit save state, and discard confirmation. Remove the prototype’s user-controlled date/time field.
- **Reflection:** Save the journal entry first, then transition the same screen through pending, complete, no-consent, failed/retry, and safety-redirect states. Visually separate the user’s words from the automated reflection.
- **Journal:** Present real entries as an archival chronological index with day, prompt, mood, excerpt, reflection status, and saved date. No synthetic summaries or charts.
- **Entry detail:** Provide complete reading, edit, retry-reflection where eligible, and confirmed deletion flows.
- **Completion:** After seven entries within the ten-day window, transform the seven-day path into a quiet completion spread with links back to each entry; do not calculate aggregate mood claims.
- **Settings and privacy:** Include AI-consent status, privacy and non-clinical boundaries, sign-out, and a two-step permanent account/data deletion flow.
- **Navigation:** Use only Today, Journal, and Settings. Remove the placeholder Insights destination.

## Implementation Changes

- Replace the current dark-only tokens in `globals.css` with the light design system, semantic mood tokens, typography variables, elevation, radii, focus, and motion rules. Keep global CSS limited to tokens and true global behavior; use Tailwind utilities and scoped component styles elsewhere.
- Refactor the authenticated shell into mostly server-rendered structure with small client boundaries for navigation state, dialogs, form state, and animation.
- Introduce shared primitives for the thought contour, seven-day path, prompt panel, mood selector, entry card, reflection panel, status notice, confirmation dialog, and responsive navigation.
- Define the seven fixed prompts as a typed, immutable program configuration keyed by `day-1` through `day-7`.
- Add a server-derived dashboard model containing profile/onboarding state, current program day, unlock timestamps, day states, entries, and reflection statuses. Never calculate authoritative unlock state from the browser clock.
- Extend `JournalEntry` to require `program_day` and `prompt_id` for beta entries and associate an optional typed reflection:
  - `pending`
  - `complete`
  - `failed`
  - `safety_redirect`
  - absent because AI consent was declined
- Add authenticated server operations for onboarding/program start, dashboard loading, create-or-update entry, delete entry, reflection generation/retry, AI-consent changes where permitted, and permanent account deletion.
- Enforce one entry per program day, immutable program start, server-side ownership checks, 10,000-character validation, and save-before-reflection ordering.
- Use the existing `profiles`, `journal_entries`, `ai_reflections`, and `product_events` schema. Reflection and event writes remain server-only; account deletion removes the auth user and relies on the existing cascades for private data.
- Record the approved product events without journal content: first login, program started, entry saved, reflection viewed, Day-2 return, and program completed.
- Keep the existing magic-link and allowlist implementation intact while applying the redesigned presentation.
- Build abstract visuals with CSS/SVG rather than generated imagery so the identity remains original, responsive, and lightweight.

## Test Plan

- Verify onboarding gating, 18+ requirement, both AI-consent paths, immutable program start, and returning-user routing.
- Unit-test day calculation at exact 24-hour boundaries, future-day locking, missed-day access, ten-day completion, and timezone-safe timestamps.
- Test create, edit, delete, duplicate-day prevention, content validation, optional moods, and cross-user ownership failures.
- Test reflection success, pending, no-consent, moderation redirect, timeout, failure, idempotent retry, and preservation of the saved entry.
- Test empty, loading, partial-history, completed-program, expired-window, and backend-error presentations.
- Confirm keyboard navigation, visible focus, dialog focus management, screen-reader labels, contrast, touch targets, and reduced-motion behavior.
- Perform visual QA at approximately 390px, 768px, 1024px, and 1440px, including long entries and large text scaling.
- Run the production build and TypeScript checks, then manually verify login → onboarding → Day 1 entry → reflection on mobile and desktop.
- Repeat the existing two-user RLS isolation verification before any founding user receives access.

## Assumptions

- The redesign covers the complete approved founding beta, including currently unimplemented product screens and states.
- The beta ships with the luminous light theme only; a dark-mode toggle is deferred.
- Supabase, magic-link authentication, manual allowlisting, and the existing secured schema remain the platform foundation.
- Carrd and Razorpay experiences remain outside this repository.
- Advanced analytics, voice input, reminders, generated prompts, streaks, sharing, and clinical or health framing remain out of scope.
- The supplied references guide atmosphere and interaction quality only; no screen, illustration, or branded composition will be copied directly.
