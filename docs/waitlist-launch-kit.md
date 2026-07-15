# MindFlow Journal — Waitlist Launch Kit

Status: Ready to configure  
Last updated: 2026-07-15

## Purpose

Collect a small, qualified interest list before the founding-beta readiness gate closes, then invite the strongest fits to the ₹299 paid experience. The first operating target is 30 prospects, 15 conversations, 10 qualified waitlist signups, and five paid founding users.

Do not accept payment or promise product access until the privacy, payment-to-access, and first-reflection checks in `launch-runbook.md` pass.

## Audience and positioning

Primary audience: English-speaking adults in India, initially young professionals aged roughly 22–35, who want to journal but struggle with blank-page friction or consistency.

Promise: one focused prompt, one private entry, and one concise AI reflection each day for seven days when the user consents to AI processing.

Boundary: MindFlow is a journaling and self-reflection product. It is not therapy, diagnosis, medical advice, or crisis support.

## Waitlist page

The public waitlist is implemented at `/waitlist`. Deploy and use that route for the campaign links below; it intentionally has no payment button until the readiness gate closes. If a separate Carrd campaign page is added later, it must send its form submission to this same route or reproduce the approved fields and privacy boundary exactly.

### Hero

**Untangle what’s on your mind—one guided entry at a time.**

MindFlow Journal is a private seven-day journaling experience for people who want to write but get stuck at the blank page. Get one focused prompt each day and, when you choose, a concise AI reflection based on what you wrote.

Primary CTA: **Join the interest list**

Support line: For adults 18+. Founding beta planned at ₹299 one-time. Joining the interest list does not require payment or guarantee access.

### What participants receive

- Seven focused daily prompts.
- Private journal entries.
- Optional mood check-ins.
- One concise AI reflection after each entry when the participant consents to AI processing.
- A simple view of seven-day progress.

### Product boundary

MindFlow is a journaling and self-reflection tool. It does not provide therapy, diagnosis, medical advice, or crisis support.

### Trust note

Journal content is not requested on the waitlist. The founder does not read journal entries for routine support. Entry text is sent to Groq only after explicit consent to receive a reflection.

## Waitlist form

Use these fields and no others:

| Field | Type | Required | Purpose |
|---|---|---:|---|
| First name | Short text | Yes | Personal follow-up |
| Email | Email | Yes | Access invitation |
| I am 18 or older | Checkbox | Yes | Beta eligibility |
| How often do you currently journal? | Single select | Yes | Qualification |
| What usually makes journaling difficult? | Single select | Yes | Message research |
| Would you consider paying ₹299 for the seven-day founding beta? | Single select | No | Purchase-intent signal |

Journaling-frequency options: Never started; Tried a few times; A few times per month; A few times per week; Most days.

Difficulty options: I do not know where to begin; I overthink what to write; I forget or lose consistency; Writing feels too time-consuming; I have not found a useful format; Other.

Willingness options: Yes; Maybe, depending on details; Not right now.

Do not ask for health conditions, diagnoses, therapy history, crisis information, or journal content.

### Confirmation message

You’re on the MindFlow interest list.

I’m opening the founding beta in a small group after the privacy and product checks are complete. I’ll email you with the full details before asking you to decide.

One optional question: what usually stops you from journaling consistently?

## Tracking links

Use one base waitlist URL and add source tags to every public link:

`[WAITLIST_URL]?utm_source=[source]&utm_medium=[medium]&utm_campaign=founding_waitlist&utm_content=[content_id]`

Approved source and medium pairs:

| Channel | `utm_source` | `utm_medium` |
|---|---|---|
| LinkedIn founder profile | `linkedin` | `organic_social` |
| Instagram | `instagram` | `organic_social` |
| WhatsApp Status | `whatsapp` | `organic_social` |
| Direct message | `direct` | `dm` |
| Community partnership | Partner slug | `community` |

Use the calendar ID as `utm_content`, for example `w1_mon_blank_page`.

## Channel operating system

### LinkedIn — primary public channel

- Publish Monday, Wednesday, and Friday from the founder profile.
- Lead with a specific observation or useful exercise, not a product announcement.
- End with one conversational question.
- Add the waitlist CTA only where it naturally follows from the post.
- Reply to every substantive comment within one working day.

### Instagram — repurposing channel

- Turn Monday posts into five-slide carousels.
- Turn Wednesday posts into 30–45 second founder-to-camera Reels.
- Turn Friday prompts into a simple prompt card and Story.
- Use the profile link for the tagged waitlist URL; do not rely on “link in comments.”

### WhatsApp and direct outreach — conversion channel

- Send five personalized messages on Day 1 and five on Day 2.
- State why the specific person came to mind.
- Ask permission to send details; do not lead with a link.
- Follow up once after 48–72 hours. Send a second follow-up only after explicit interest.

### Reddit and external communities — trust channel

- Read each community’s current rules before participating.
- Contribute useful answers and standalone exercises without a link.
- Ask a moderator before posting research, a beta invitation, or a workshop.
- Keep at least nine helpful contributions for each promotional contribution where promotion is permitted.

### Deferred channels

Defer X, YouTube, paid ads, influencer fees, and a separate brand account until the first five customers reveal a repeatable message and the paid funnel activates reliably.

## Outreach copy

### Warm invitation

Hey [Name] — I’m building MindFlow Journal, a private seven-day guided journaling experience for adults who want to write but get stuck at the blank page. You came to mind because [specific, non-sensitive reason]. I’m putting together a small interest list before the founding beta opens. Would you like the details?

### Details requested

Here they are: [TAGGED WAITLIST LINK]

It explains the seven-day experience, privacy boundary, and planned ₹299 founding price. Joining the list is free and does not commit you to buying.

### First follow-up

Quick follow-up in case this got buried. No pressure—if guided journaling feels relevant right now, I can resend the details.

### Referral request

Thanks. Is there one person you know who has already talked about wanting to journal more consistently? An introduction would help; please do not share anyone’s private situation or health information.

### Community-manager pitch

Subject: A practical 20-minute reflection session for [Community]

Hi [Name] — I’m building MindFlow Journal, a private, non-clinical guided journaling product. I’d like to offer [Community] a free 20-minute session on reducing blank-page friction: one short framework, one prompt, and time for questions. There would be no journal sharing and no hard sell. If members find the exercise useful, I can make the optional founding-beta interest link available afterward. Would that fit your programming?

### Waitlist acknowledgement

Subject: You’re on the MindFlow interest list

Hi [First name],

You’re on the list. I’m completing the privacy and product checks before inviting a small founding group. I’ll send the complete details before asking you to decide.

If you feel like replying, what usually stops you from journaling consistently? Please do not send journal content or private health information.

## Qualification and invitation order

A qualified signup is an adult who identifies a concrete journaling-friction problem, provides a usable email, and expresses “Yes” or “Maybe” interest in the ₹299 founding beta.

When the readiness gate closes, invite in this order:

1. Warm prospects who said “Yes” to ₹299.
2. Warm prospects who said “Maybe” and had a specific problem fit.
3. Referred prospects with the same signals.
4. Community signups ordered by signup date and fit.

Never qualify or prioritize someone using inferred mental-health information.

## Weekly scorecard and decision rules

Track raw counts while the cohort is small:

- Prospects added.
- Personalized messages sent.
- Replies.
- Genuine conversations.
- Waitlist signups.
- Qualified signups.
- Paid conversions after launch.
- First-entry activation.
- Day-2 return.

Decision rules:

- Fewer than three conversations from the first ten personalized messages: rewrite the opening hook and problem-fit reason.
- Conversations but fewer than five signups: review the landing-page promise, privacy note, and CTA.
- Signups but weak willingness to pay: interview five prospects about the offer before changing price.
- Purchases but fewer than four of five first-entry activations: pause acquisition and repair access or onboarding.
- Fewer than three of five Day-2 returns: investigate the first reflection and return experience before increasing volume.
- Any private-data exposure: pause invitations and payments immediately.

## Launch checklist

- [ ] The deployed `/waitlist` page contains the approved copy and no payment button.
- [ ] Form contains only the approved non-sensitive fields.
- [ ] Confirmation message and acknowledgement email are active.
- [ ] Tagged links exist for LinkedIn, Instagram, WhatsApp, DMs, and each partner.
- [ ] Acquisition tracker owner and daily review time are set.
- [ ] Nine social posts are scheduled or ready to publish manually.
- [ ] Ten warm names are entered with a specific problem-fit reason.
- [ ] No public promotion begins before the waitlist page is tested on mobile and desktop.
- [ ] No paid-beta invitation begins before the launch-readiness gate closes.

## Current platform references

- LinkedIn newsletter and publishing guidance: https://www.linkedin.com/help/linkedin/answer/a517940/linkedin-newsletters-best-practices?lang=en
- Reddit spam and community-promotion guidance: https://support.reddithelp.com/hc/en-us/articles/28012014962580-How-do-I-keep-spam-out-of-my-community
