# Skill: ideation

Generate prioritised ideas for new features and assessments. Combines reading the current platform state, researching competitors, scanning the Indian compliance landscape, and analysing both visible and latent user needs. Always distinguishes free-tier ideas (volume and reach) from paid-tier ideas (high value, high penalty exposure).

## Step 1 — Understand the trigger context

The user will invoke this with context about what was just built or what they're planning:
- `/ideation` — general platform review
- `/ideation we just added DPDP assessment`
- `/ideation we just built compliance calendar reminders`

If invoked without context, ask:
> "What did you just build or what are you planning? This helps me suggest the most relevant adjacent ideas."

---

## Step 2 — Read the current platform state

Read these to understand what already exists:

- `src/app/` — list all routes (ls, don't read every file)
- `src/lib/constants/assessment-types.ts` — which assessment types exist and their pricing tier
- `src/app/api/` — which API endpoints exist
- `CLAUDE.md §18` — project structure quick reference

Build a clear picture: what does the platform currently do? What user journeys exist? What's free vs. paid?

---

## Step 3 — Research competitors and the compliance landscape

Use WebSearch and WebFetch. Do not skip this step — competitor research is the most valuable input to the ideation output.

### Competitor landscape

Search for:
- `"India compliance assessment tool SaaS site:linkedin.com OR site:producthunt.com"`
- `"Indian labour law compliance software HR"`
- `"DPDP compliance tool India 2024"`
- `"HR compliance platform India startup"`

Key players to check (WebFetch their features/pricing pages):
- Simpliance (simpliance.in)
- Complianceship
- LegalWiz compliance tools
- VakilSearch compliance
- TeamLease compliance products
- Digicompli

For each competitor found, note:
- What assessments/checks do they offer?
- What is free vs. paid?
- What features do they have that ComplianceCheck doesn't?
- What's their primary user persona (HR, founder, CA, legal team)?

### Compliance landscape gaps

Search for:
- `"India compliance requirements businesses 2024 2025 new"`
- `"MCA annual compliance requirements India"`
- `"SEBI compliance startups India"`
- `"India sector specific compliance manufacturing healthcare fintech"`
- `"gazette notification India compliance law 2024 2025"`

Goal: identify which Indian compliance areas affect businesses but are NOT yet covered by the platform.

---

## Step 4 — Analyse user needs (visible and latent)

Think about the user who just used/built [the trigger context]. Apply both lenses:

### Visible needs (users would explicitly ask for these)
- What's the natural next step after using this feature?
- What data was just collected that could power another feature?
- What question will users have after seeing this result?
- What would make this feature feel complete?

### Latent needs (users haven't articulated these but would immediately value them)
- What compliance area is adjacent to this one?
- What does this user's role demand beyond what we showed them? (e.g. HR manager needs to assign tasks to team members)
- What would save them time next time? (e.g. pre-filled company details across all assessments)
- What would make them look good to leadership? (e.g. shareable compliance score certificate)
- What would reduce their compliance anxiety most? (e.g. "alert me if this law changes")
- What would a CA/CS consultant charge ₹50,000 for that we could automate?
- What do they do after they download the PDF that we're not helping with?

### Net-new assessment opportunities (think beyond adjacent)
- Which Indian laws affect businesses that we have zero coverage for?
- Which compliance areas do competitors cover that we don't?
- Are there sector-specific compliance needs (manufacturing, healthcare, fintech, edtech, real estate) not yet covered?
- Which compliance areas generate the highest penalty exposure and therefore the most user anxiety?
- Which compliance areas are newly legislated (2022–2025) with no good digital tool yet?

---

## Step 5 — Generate the ideation report

Output in this exact format:

```
Ideation Report
Context: {what was just built / general platform}
Date: {today}
Competitors researched: {list of competitors checked}
========================================

🔴 HIGH IMPACT / QUICK WIN (build these first)

  1. {Feature/idea name}
     User need: [visible / latent] — {what problem it solves in one sentence}
     Connection to trigger: {how it extends what was just built}
     Existing infrastructure to reuse: {Supabase table / Resend / action items / etc.}
     Rough effort: {days}
     Revenue: {free tier value builder / natural paid upsell at ₹X}

  2. ...

🟡 HIGH IMPACT / MEDIUM EFFORT

  1. {Feature/idea name}
     ...

🟢 NICE TO HAVE / LOWER EFFORT
  ...

💡 BIGGER BETS (explore when capacity allows)
  ...

─────────────────────────────────────
NEW ASSESSMENT IDEAS — FREE TIER
(volume and reach; funnel to paid)

  - {Assessment name}
    Who needs it: {persona}
    Audience size: {rough estimate of Indian businesses affected}
    Key laws covered: {act names}
    Competitor gap: {does any competitor cover this well? yes/no + who}
    First file to create: src/lib/assessments/{slug}-questions.ts

  - ...

NEW ASSESSMENT IDEAS — PAID TIER
(high value; high penalty exposure; users will pay to know)

  - {Assessment name}
    Who needs it: {persona}
    Why they'd pay: {penalty exposure or business risk that makes it urgent}
    Key laws covered: {act names}
    Competitor gap: {yes/no + who}
    First file to create: src/lib/assessments/{slug}-questions.ts

  - ...

─────────────────────────────────────
WHAT NOT TO BUILD NEXT
  - {Idea}: {reason — dilutes focus / duplicates existing feature / not Indian-market relevant}
```

---

## Step 6 — Brief the top 3 ideas

For the top 3 ideas from the 🔴 section, write a one-paragraph implementation brief:

```
Brief: {Idea name}
─────────────────
{What it does in one sentence.} {The key user moment it addresses.}
It builds on {existing platform pieces — be specific: which Supabase table, which component, which API}.
Start by {first concrete action: create/modify which file, what function to call}.
```

---

## Principles

- **Research first**: always complete Step 3 before generating ideas — competitor research is the most valuable input
- **Specificity beats breadth**: "weekly email of top 3 overdue tasks" beats "better notifications"
- **Reuse over build**: always check existing infrastructure (Resend, Supabase action items, analytics events) before suggesting net-new infra
- **Indian compliance lens**: ideas must be relevant to Indian SMBs, MSMEs, HR teams, and compliance officers
- **Latent > visible**: the highest-value ideas are ones users haven't asked for but immediately recognise as valuable
- **Competitor gaps are gold**: if a compliance area has no good digital tool yet, that's the best opportunity
- **Separate tiers clearly**: free ideas build volume and funnel; paid ideas need clear penalty/business risk justification for why users pay
