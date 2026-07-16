# Phase 4 Verification Baseline & Preflight

## Execution Context
This directory contains the verification evidence for Phase 4 (Internal Beta Verification).

### Redaction Rules
- Never store private text, secret values, passwords, or full disposable emails in these reports.
- Use opaque fixture labels (e.g., `User A`, `User B`, `Delete Me`) instead of full identifiable emails.
- Redact SQL output to show only status or count.

### Fixture-Cleanup Ownership
- Tests and verification scripts using disposable `mindflow-phase4-*` accounts will clean up their own fixtures via permanent account deletion at the end of their lifecycle checks.
- Real user records or original `program_started_at` dates are strictly off-limits.

### Literal Approved Safety Notice
*(Source: `docs/mvp-specification.md:95-97`)*
> MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.

---

## Preflight Record

| Check | Status | Evidence/Notes |
|-------|--------|----------------|
| Owner-confirmed permitted Supabase project/environment safe for disposable accounts | **YES** | Owner confirmation received via prompt |
| Server-only availability of `GROQ_API_KEY`, `GROQ_REFLECTION_MODEL`, `GROQ_SAFETY_MODEL`, `SUPABASE_SERVICE_ROLE_KEY` | **YES** | Owner confirmation received |
| Owner evidence that Groq Zero Data Retention is enabled | **YES** | Owner confirmation received |
| Owner evidence that Phase 2 and Phase 3 SQL succeeded | **YES** | Owner confirmation received |
| Three clean, allowlisted disposable fixtures | **YES** | Created labels: `User A`, `User B`, `Delete Me` |
| Scan proving no configured secret exposed via `NEXT_PUBLIC_*` | **YES** | `rg "NEXT_PUBLIC_"` scan yielded no server keys |

### Baseline `git status --short`

```text
 M skills-lock.json
?? ".agents/plans/Phase 4.md"
?? .agents/plans/implementation-plan-review.yaml
?? .agents/skills/implementation-plan-review/
```
