# MindFlow Journal — Founding Beta Launch Runbook

Status: Canonical operating procedure  
Last updated: 2026-07-13

## Objective

Move an eligible founding user safely from Carrd to captured Razorpay payment, verified access, first login, first entry, and—when consented—first AI reflection. Start with five users and expand toward twenty only after the journey is reliable.

## Owner Responsibilities

- Publish Carrd and operate Razorpay.
- Verify captured payments and manage the allowlist.
- Grant access within 12 hours.
- Send access and support messages.
- Monitor the customer tracker without reading journal entries.
- Conduct interviews and declare launch pause or resume.

## Pre-Launch Checklist

### Hard privacy and product gates

- [ ] 18+ confirmation and explicit AI-processing consent work.
- [ ] Journaling still works when AI consent is declined.
- [ ] Magic-link authentication works for an allowlisted email.
- [ ] Non-allowlisted, refunded, and revoked emails cannot enter.
- [ ] Cross-user read, update, and delete attempts fail.
- [ ] No shared hard-coded user ID remains.
- [ ] Day 1–7 unlock behavior and missed-day availability pass.
- [ ] Entry save, edit, delete, history, and account deletion use real data.
- [ ] AI success, safety redirect, failure, and retry states pass.
- [ ] Mock insights and random trends are absent from the paid path.
- [ ] Privacy, AI limitation, seven-day refund, 18+, data lifecycle, and non-clinical copy are published.
- [ ] Production build, TypeScript, mobile, and desktop checks pass.

### Sales and operations

- [ ] Carrd shows ₹299, 20-user limit, 18+, seven-day refund, and 12-hour access expectation.
- [ ] Carrd CTA points to the correct Razorpay Standard Payment Link.
- [ ] Razorpay test payment succeeds.
- [ ] Payment success tells the user to keep using the same email.
- [ ] Product login URL and support contact are correct.
- [ ] Customer tracker exists and excludes journal content.
- [ ] Access, refund, and problem-resolution messages are ready.

Any unchecked privacy or access item is a no-go condition.

## Payment-to-Access Procedure

1. Confirm in Razorpay that payment is captured, not attempted or merely created.
2. Record payment reference, payer email, amount, and captured timestamp.
3. Confirm ₹299, purchaser is 18+, refund terms were available, and fewer than 20 active founding users exist.
4. Normalize email by trimming whitespace and converting to lowercase.
5. Add or update `beta_access` with `active` status, payment reference, and grant timestamp.
6. Send the access-granted message from `copy-library.md`.
7. Record the message timestamp; complete this within 12 hours of capture.
8. Confirm first login. After 24 hours without login, send one technical check-in.

Never grant access from a screenshot alone. Verify payment inside Razorpay.

## Email Mismatch

1. Request the Razorpay reference and payer email, never journal content.
2. Verify the captured payment in Razorpay.
3. Record the requested access email and reason.
4. Revoke the incorrect allowlist record.
5. Grant the corrected normalized email and confirm only that account can enter.

## Refund and Revocation

1. Accept requests submitted within seven calendar days of purchase through the published support contact.
2. Verify customer and payment reference.
3. Process the refund in Razorpay.
4. Set allowlist status to `refunded`; confirm private access is blocked.
5. Record reason and timestamp.
6. Handle product-data deletion separately when requested.

## Account Deletion and Beta End

- Users may permanently delete their product account, entries, reflections, and attributable product events at any time.
- Routine support uses IDs, timestamps, logs, and user-provided error details; the founder does not inspect entry content.
- At beta end, notify users that they have 30 days to migrate into the full app.
- After 30 days, automatically delete non-migrated beta account and journal data.
- Keep legally required financial records separate from journal data.
- Test deletion with a non-production account before enabling it for users.

## Daily Operations

Morning:

- Process captured payments approaching the 12-hour deadline.
- Review authentication, reflection, and application errors.
- Check whether any user is blocked before their first entry or reflection.

Evening:

- Update activation, Day-2 return, completion, refund, and issue fields.
- Respond to technical blockers.
- Record recurring objections using the customer’s words.

## Incident Response

### Privacy or cross-user access

1. Pause acquisition and disable new access immediately.
2. Preserve logs and record discovery time.
3. Identify affected records and users without broadening entry access.
4. Fix and repeat independent cross-user isolation tests.
5. Notify affected users according to confirmed impact.
6. Resume only after the owner records an explicit go decision.

### AI unavailable

- Keep entries saved and available.
- Show one retry to consenting users.
- Do not call OpenAI for users who declined consent.
- Pause acquisition only if first-use value is consistently unavailable.

### Unsafe or clinical AI output

- Hide or replace the reflection when appropriate.
- Preserve only the technical information required to reproduce safely.
- Review prompts and safety tests.
- Pause reflection generation if the failure can repeat broadly.

### Access delay

- Prioritize the oldest captured payment.
- Acknowledge a likely delay before the 12-hour deadline.
- Grant access after verification and record the cause.
- Automate only after repeated delays prove a bottleneck.

## First-Five Review

Proceed toward users 6–20 only when:

- No cross-user exposure occurred.
- At least four users activated within 24 hours.
- At least three returned on Day 2.
- Payment and access reliably met the 12-hour promise.
- Every severe purchase, login, entry, consent, or reflection blocker is resolved.

If a gate fails, pause volume, repair the failing step, and retest with the smallest safe cohort.

## Feedback Procedure

- Interview every user after completion or abandonment using `customer-acquisition-plan.md`.
- Record the underlying problem, not only the requested feature.
- Tag feedback as purchase, access, privacy, activation, reflection, return, completion, or deferred.
- Update `task-ledger.md` only when evidence changes priority.
- Update `../PROJECT_LEDGER.md` whenever a task completes, decision changes, or blocker appears.

## Post-Beta Decision

At twenty users, review raw funnel counts, completion, refunds, incidents, support load, feedback, and willingness to continue paying. Choose whether to iterate the loop, add one evidence-backed retention feature, change the offer/audience, or stop and reassess.

Licensed-professional access is not a beta extension. If pursued later, it requires a separate product, consent, privacy, safeguarding, security, and compliance plan.

