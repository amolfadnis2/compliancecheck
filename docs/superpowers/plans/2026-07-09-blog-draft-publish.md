# Blog Draft Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 3 finished-but-unpublished drafts in `content-drafts/blog/*.md` into live `content/blog/*.mdx` posts so they render at `/blog/[slug]`, appear in the blog index, and are picked up by `sitemap.xml` automatically — doubling live blog content from 3 to 6 posts.

**Architecture:** `src/lib/blog/posts.ts` already reads every `.mdx` file in `content/blog/` at build time via `gray-matter`, and both the blog index (`src/app/blog/page.tsx`) and `src/app/sitemap.ts` call `getAllPosts()` — so publishing is purely a matter of adding correctly-schemed `.mdx` files to `content/blog/`; no code changes are needed. The 3 drafts use a different (incompatible) frontmatter schema than what `PostFrontmatter` (`src/lib/blog/posts.ts:23-32`) expects, so each draft needs its frontmatter rewritten and its file renamed/moved.

**Tech Stack:** Next.js App Router (MDX via `content/blog/`), `gray-matter` for frontmatter parsing.

## Global Constraints

- Every commit must pass `npm run lint` (zero errors) and `npm run build` (zero errors) before being considered done.
- No raw apostrophes in body copy rendered as JSX (CLAUDE.md §6) — the existing drafts use plain straight apostrophes in prose (e.g. "Employer's"); MDX renders markdown text nodes as strings, not JSX attribute text, so this is not the same failure mode as raw `'` inside a `.tsx` JSX expression — no change needed to the prose itself, only frontmatter/structure.
- Do not edit `content/blog/dpdp-act-2023-readiness-checklist.mdx`, `labour-codes-2025-employer-checklist.mdx`, or `posh-act-icc-requirements.mdx` — those 3 are already live and correctly formatted; this plan only adds 3 new files alongside them.
- `relatedAssessment` must be a valid `AssessmentType` value from `@/lib/constants/assessment-types` (CLAUDE.md §9) — never a raw string.

---

### Task 1: Publish `fssai-license-2026-food-business-guide`

**Files:**
- Create: `content/blog/fssai-license-2026-food-business-guide.mdx`
- (Leave `content-drafts/blog/fssai-license-2026-food-business-guide.md` in place as the source-of-truth working copy — do not delete it; it's outside `content/blog/` so it has zero effect on the live site.)

**Interfaces:**
- Consumes: nothing.
- Produces: a post visible at `/blog/fssai-license-2026-food-business-guide`, listed in `getAllPosts()`, and included in `sitemap.xml`.

- [ ] **Step 1: Create the new file with converted frontmatter and the unchanged body**

Create `content/blog/fssai-license-2026-food-business-guide.mdx` with this exact frontmatter (converted from `content-drafts/blog/fssai-license-2026-food-business-guide.md`'s `title`/`meta_description`/`published`/`author` fields to the `PostFrontmatter` schema), followed by the draft's body content verbatim (everything after its closing `---` — the `# FSSAI Licence in 2026...` heading through the final "Sources:" line):

```mdx
---
title: "FSSAI Licence in 2026: New Turnover Limits & Perpetual Validity Explained"
description: "FSSAI rules changed in 2026 — Basic Registration now covers turnover up to Rs 1.5 crore, licences are perpetual, and renewal is abolished. Here's exactly what food businesses must do."
date: "2026-07-03"
lastReviewed: "2026-07-03"
author: "ComplianceCheck Team"
tags: ["fssai", "food-business", "compliance"]
relatedAssessment: "food_business"
draft: false
---

# FSSAI Licence in 2026: New Turnover Limits & Perpetual Validity Explained

*FSSAI changed the rules in March 2026 — the registration threshold jumped to Rs 1.5 crore, licences no longer expire, and the renewal system is gone. This guide explains what every food business must do now.*

ComplianceCheck Team · Published 3 July 2026

If you run a restaurant, cloud kitchen, food stall, packaged-food brand or any business that makes, stores, sells or transports food, you need an FSSAI registration or licence. In **March 2026 the Food Safety and Standards Authority of India (FSSAI) overhauled the system** — new turnover thresholds took effect from 1 April 2026, and licences became perpetual. This guide covers who needs what, the new limits, the fees, and how to stay compliant.

## Key facts at a glance

- **Every food business** needs an FSSAI registration or licence — there is no exemption.
- **Basic Registration** now covers annual turnover up to **Rs 1.5 crore** (raised from Rs 12 lakh).
- **State Licence** applies from **Rs 1.5 crore up to Rs 50 crore**.
- **Central Licence** is required **above Rs 50 crore**, and for importers, exporters and large operators.
- Licences are now **perpetual** — no expiry, no renewal — but the **annual fee must still be paid**, or the licence is deemed suspended.
- The **14-digit FSSAI number must be displayed** on your premises, menu, and every food package.

## The three FSSAI categories after the 2026 reform

FSSAI licensing is tiered by annual turnover. The Food Safety and Standards (Licensing and Registration of Food Businesses) Amendment Regulations, 2026 (notified 10 March 2026) revised the thresholds with effect from 1 April 2026.

| Category | Annual turnover | Typical businesses | Govt fee (per year) |
| --- | --- | --- | --- |
| Basic Registration | Up to Rs 1.5 crore | Petty vendors, small retailers, home kitchens, small eateries | Rs 100 |
| State Licence | Rs 1.5 crore to Rs 50 crore | Mid-size restaurants, chains, manufacturers, distributors | Rs 2,000 – Rs 5,000 |
| Central Licence | Above Rs 50 crore | Large manufacturers, importers, exporters, e-commerce, central govt operators | Rs 7,500 |

A **Central Licence is mandatory regardless of turnover** for importers, exporters, e-commerce food operators, businesses at ports/airports, and operators in central government establishments.

## What changed in 2026 — and why it matters

### 1. Higher registration threshold

The Basic Registration ceiling rose from Rs 12 lakh to **Rs 1.5 crore**. Many small businesses that previously needed a State Licence can now operate on a simpler, cheaper Basic Registration. If you are between Rs 12 lakh and Rs 1.5 crore in turnover, review whether you can downgrade at your next filing.

### 2. Perpetual validity — renewal abolished

The amendment replaced the old 1-to-5-year validity with **indefinite validity**. Once granted, a licence stays valid until it is surrendered, suspended for non-compliance, or cancelled. You no longer file renewal applications.

### 3. Annual fee is still compulsory

Perpetual does **not** mean free. Food business operators must **continue to pay the annual fee**. Missing the annual fee triggers **automatic deemed suspension** — so the compliance task shifts from "renew every few years" to "never miss the yearly payment."

## Who needs an FSSAI licence?

Every "food business operator" (FBO). That includes:

- Restaurants, cafes, bakeries, sweet shops, dhabas and food trucks
- Cloud kitchens and home-based food businesses
- Packaged-food manufacturers and processors
- Wholesalers, distributors, retailers and grocery stores
- Importers and exporters of food products
- Caterers, canteens, and food e-commerce sellers
- Transporters and storage/warehouse operators handling food

There is **no minimum size exemption** — even a single food cart needs at least a Basic Registration.

## Documents you'll typically need

- Photo ID and address proof of the proprietor / partners / directors
- Passport-size photograph
- Proof of business premises (rent agreement or ownership document)
- Food safety management plan (for State and Central licences)
- List of food products / categories
- Layout plan of the premises (for manufacturing units)
- Incorporation documents (for companies / LLPs)

Applications are filed online through the **FoSCoS portal** (foscos.fssai.gov.in).

## Penalties for operating without a licence

Running a food business without valid FSSAI registration is an offence under the Food Safety and Standards Act, 2006:

- Operating without a licence: **imprisonment up to 6 months and fine up to Rs 5 lakh**.
- Sub-standard food: fine up to **Rs 5 lakh**.
- Misbranded food: fine up to **Rs 3 lakh**.
- Unsafe food causing injury: fines from **Rs 1 lakh to Rs 10 lakh** and imprisonment, depending on severity.

Beyond fines, delivery platforms (Zomato, Swiggy) and marketplaces require a valid FSSAI number to list you at all.

## Your FSSAI compliance checklist

1. **Confirm your category** using the new 2026 turnover thresholds (Rs 1.5 crore / Rs 50 crore).
2. **Apply on FoSCoS** for the correct registration or licence, or migrate if your category changed.
3. **Display your 14-digit FSSAI number** on premises, menu cards, bills and packaging.
4. **Pay the annual fee on time** — set a reminder, because a missed fee now suspends your licence automatically.
5. **Keep a food safety management plan** and hygiene records current (State/Central).
6. **Match your licence to your actual activities** — add categories if you expand into manufacturing, import or e-commerce.
7. **Register every location separately** if you operate across multiple premises.

## Frequently asked questions

**Is FSSAI registration mandatory for small businesses?**
Yes. Every food business operator in India needs at least a Basic Registration, regardless of size. There is no exemption for small vendors or home kitchens.

**What is the FSSAI turnover limit in 2026?**
Basic Registration covers turnover up to Rs 1.5 crore, State Licence from Rs 1.5 crore to Rs 50 crore, and Central Licence above Rs 50 crore, effective 1 April 2026.

**Do I still need to renew my FSSAI licence?**
No. Since the March 2026 amendment, licences and registrations are perpetual. However, you must pay the annual fee, or the licence is deemed suspended.

**How much does an FSSAI licence cost?**
Government fees are Rs 100 per year for Basic Registration, Rs 2,000 to Rs 5,000 per year for a State Licence, and Rs 7,500 per year for a Central Licence, excluding any professional charges.

**What happens if I don't pay the FSSAI annual fee?**
The licence is automatically deemed suspended. Operating on a suspended licence is treated as operating without a licence, which carries fines up to Rs 5 lakh and possible imprisonment.

---

> This guide is general information, not legal advice. Your exact requirements depend on turnover, activities, and state. Verify on the official FoSCoS portal (foscos.fssai.gov.in).

### Check your food business compliance

**Restaurant & Food Business Assessment** — FSSAI, Fire NOC, Liquor Licence, GST and Labour compliance in one guided check. Get your free compliance summary instantly, then unlock the full report with every gap explained and the exact rule cited.

[Start free assessment →](https://compliancecheck.co.in/assessment/food-business) · Free during beta · no subscription

**Sources:** [FSSAI FoSCoS portal](https://foscos.fssai.gov.in/), [TaxGuru — FSSAI perpetual licence](https://taxguru.in/chartered-accountant/fssai-introduces-perpetual-license-validity-renewal-system-abolished.html), [SansaLegal — FSSAI 2026 amendment](https://www.sansalegal.com/post/fssai-licensing-amendment-2026-perpetual-food-license-new-turnover-thresholds-and-compliance-guid)
```

- [ ] **Step 2: Verify the post is picked up**

Run: `npm run build`
Expected: build succeeds. Then check the generated route exists: run `npx next build` output includes `/blog/fssai-license-2026-food-business-guide` as a static path (App Router logs generated static routes during `next build`).

- [ ] **Step 3: Commit**

```bash
git add content/blog/fssai-license-2026-food-business-guide.mdx
git commit -m "Publish FSSAI 2026 guide to the live blog"
```

---

### Task 2: Publish `pf-esi-applicability-employer-guide`

**Files:**
- Create: `content/blog/pf-esi-applicability-employer-guide.mdx`

**Interfaces:**
- Consumes: nothing.
- Produces: a post visible at `/blog/pf-esi-applicability-employer-guide`.

- [ ] **Step 1: Create the file with converted frontmatter and the unchanged body**

Create `content/blog/pf-esi-applicability-employer-guide.mdx`:

```mdx
---
title: "PF & ESI Applicability in India: The Employer's Plain-English Guide"
description: "When PF and ESI become mandatory, the wage ceilings, contribution rates, and what changes under the 2025 Labour Codes — a clear guide for Indian employers and HR teams."
date: "2026-07-03"
lastReviewed: "2026-07-03"
author: "ComplianceCheck Team"
tags: ["pf", "esi", "statutory-health", "compliance"]
relatedAssessment: "statutory_health"
draft: false
---

# PF & ESI Applicability in India: The Employer's Plain-English Guide

*When do PF and ESI become mandatory, what are the wage ceilings and rates, and what changes under the 2025 Labour Codes? Here's the clear version for founders and HR teams.*

ComplianceCheck Team · Published 3 July 2026

Provident Fund (EPF) and Employees' State Insurance (ESI) are the two statutory schemes almost every growing Indian employer has to deal with first. Get the thresholds wrong and you face back-contributions, interest, damages, and penalties. This guide explains exactly when each applies, what you pay, and how the new Labour Codes affect you.

## Key facts at a glance

- **EPF** becomes mandatory at **20 or more employees**. Wage ceiling: **Rs 15,000/month**. Rate: **12% employee + 12% employer**.
- **ESI** becomes mandatory at **10 or more employees** (1+ in hazardous units). Wage ceiling: **Rs 21,000/month** (Rs 25,000 for employees with disability). Rate: **0.75% employee + 3.25% employer**.
- Both schemes are administered centrally — **one registration covers all your states**.
- Once you cross a threshold, **coverage continues even if headcount later falls**.
- Registration is due **within 1 month** of becoming eligible, via the Shram Suvidha / EPFO / ESIC portals.

## EPF (Employees' Provident Fund) — when it applies

EPF is a retirement savings scheme under the Code on Social Security, 2020 (which subsumed the EPF Act, 1952).

| Parameter | Value |
| --- | --- |
| Applicability trigger | 20 or more employees |
| Wage ceiling | Rs 15,000/month (basic + DA) |
| Employee contribution | 12% |
| Employer contribution | 12% (split 3.67% EPF + 8.33% EPS + 0.5% EDLI) |
| Reduced rate | 10% for establishments with fewer than 20 employees or notified "sick" industries |
| Registration deadline | Within 1 month of crossing the threshold |

**Who counts as an employee?** Everyone on your rolls — including contract and casual workers — counts toward the 20. Employees earning above Rs 15,000 basic can be enrolled voluntarily but are not mandatorily covered; most employers cover them anyway for retention.

**Important:** Once registered, EPF coverage is **permanent** — it continues even if your headcount later drops below 20.

## ESI (Employees' State Insurance) — when it applies

ESI is a health-insurance and social-security scheme providing medical care, sickness, maternity and disablement benefits.

| Parameter | Value |
| --- | --- |
| Applicability trigger | 10 or more employees (1+ in hazardous industries) |
| Wage ceiling | Rs 21,000/month (Rs 25,000 for persons with disability) |
| Employee contribution | 0.75% |
| Employer contribution | 3.25% |
| Coverage | Pan-India, single registration |

ESI applies only to employees **earning Rs 21,000/month or less**. Employees above that ceiling are outside ESI (though many employers provide private group health cover instead). Contribution is calculated on **gross wages**, not just basic.

## What the 2025 Labour Codes change

The four Labour Codes took effect on **21 November 2025**, folding the EPF and ESI Acts into the Code on Social Security, 2020. The core thresholds above continue, but two changes matter for your cost base:

- **The 50% wage rule.** Allowances can no longer exceed 50% of total remuneration — the rest must count as "wages." For many companies this **raises the wage base** used for PF, pushing up contributions and changing take-home structures.
- **Wider coverage.** Gig and platform workers now have a social-security framework, and fixed-term employees get pro-rated benefits.

**On the EPF wage ceiling:** the long-standing **Rs 15,000 ceiling remains in force** under the EPF Scheme, 2026. Proposals to raise it to Rs 21,000 (or higher) are under active consideration, and in January 2026 the Supreme Court directed the EPFO to revisit it — but until a notification is issued, **Rs 15,000 is the number to use**. If it rises, both employer cost and employee deductions increase, so it is worth modelling the impact now.

## A quick contribution example

For an employee with basic wages of Rs 15,000 and gross wages of Rs 20,000:

- **EPF:** 12% of Rs 15,000 = Rs 1,800 employee + Rs 1,800 employer.
- **ESI:** 0.75% of Rs 20,000 = Rs 150 employee + 3.25% = Rs 650 employer.

The employer's statutory cost on top of gross is roughly **Rs 2,450/month** for this one employee — before gratuity and other benefits.

## Penalties for non-compliance

EPFO and ESIC both levy interest plus damages on late or missed contributions:

- **EPF late payment:** interest at 12% per annum under Section 7Q, **plus damages up to 100%** of the arrears under Section 14B (graded by delay).
- **ESI late payment:** interest at 12% per annum plus damages up to 25% per annum.
- **Failure to register or deduct** can attract prosecution, including imprisonment for repeat defaults.

These liabilities are calculated retrospectively from the date you should have registered — which is why getting applicability right early matters.

## Your PF & ESI compliance checklist

1. **Count all employees** — including contract and casual — to test the 20 (EPF) and 10 (ESI) thresholds.
2. **Register within 1 month** of crossing either threshold, via Shram Suvidha / EPFO / ESIC.
3. **Deduct correctly** — EPF on Rs 15,000 ceiling wages, ESI on gross up to Rs 21,000.
4. **Deposit by the 15th** of the following month; file monthly ECR (EPF) and returns (ESI).
5. **Review your wage structure** against the 50% rule so allowances don't exceed half of total pay.
6. **Keep coverage active** even if headcount drops — deregistration is not automatic.
7. **Model the ceiling change** — stress-test payroll for a possible Rs 21,000/Rs 25,000 EPF ceiling.

## Frequently asked questions

**Is PF mandatory for companies with less than 20 employees?**
Not mandatory — EPF is triggered at 20 or more employees. Smaller establishments can register voluntarily, and a reduced 10% rate applies to units with fewer than 20 employees once covered.

**What is the ESI wage limit in 2026?**
ESI covers employees earning up to Rs 21,000 per month (Rs 25,000 for persons with disability). Those earning above the ceiling are not covered by ESI.

**What are the current PF and ESI contribution rates?**
EPF is 12% employee + 12% employer. ESI is 0.75% employee + 3.25% employer.

**Has the EPF Rs 15,000 wage ceiling been increased?**
Not yet. The EPF Scheme 2026 retains the Rs 15,000 ceiling. Increases to Rs 21,000 or Rs 25,000 are under consideration following a January 2026 Supreme Court direction, but no notification has been issued.

**Does one PF/ESI registration cover multiple states?**
Yes. Both EPF and ESI are administered centrally, so a single registration and code number covers employees across all states.

---

> This guide is general information, not legal advice. Applicability depends on your headcount, wages, industry and state. Verify on epfindia.gov.in and esic.gov.in.

### Check your statutory compliance

**Statutory Health Check** — a quick 10-minute assessment for PF, ESI, Professional Tax, Gratuity and Bonus. Get your free compliance score instantly, then unlock the full report with every gap and the exact legal section cited.

[Start free assessment →](https://compliancecheck.co.in/assessment/statutory-health) · Free during beta · no subscription

**Sources:** [EPFO](https://epfindia.gov.in/), [ESIC](https://esic.gov.in/), [Code on Social Security, 2020 — labour.gov.in](https://labour.gov.in/)
```

- [ ] **Step 2: Verify the post is picked up**

Run: `npm run build`
Expected: build succeeds and `/blog/pf-esi-applicability-employer-guide` is generated.

- [ ] **Step 3: Commit**

```bash
git add content/blog/pf-esi-applicability-employer-guide.mdx
git commit -m "Publish PF/ESI applicability guide to the live blog"
```

---

### Task 3: Publish `professional-tax-state-wise-guide`

**Files:**
- Create: `content/blog/professional-tax-state-wise-guide.mdx`

**Interfaces:**
- Consumes: nothing.
- Produces: a post visible at `/blog/professional-tax-state-wise-guide`.

- [ ] **Step 1: Create the file with converted frontmatter and the unchanged body**

Create `content/blog/professional-tax-state-wise-guide.mdx`:

```mdx
---
title: "Professional Tax in India: State-Wise Rates, Slabs & Due Dates (2026)"
description: "Professional Tax is state-specific — some states charge it, some don't. Here are the states, salary slabs, the Rs 2,500 annual cap, due dates, and which states are exempt."
date: "2026-07-03"
lastReviewed: "2026-07-03"
author: "ComplianceCheck Team"
tags: ["professional-tax", "state-wise-compliance", "compliance"]
relatedAssessment: "state_wise_compliance"
draft: false
---

# Professional Tax in India: State-Wise Rates, Slabs & Due Dates (2026)

*Professional Tax is levied by states, not the Centre — so where you employ people decides whether you deduct it at all. Here's the state-by-state picture, the slabs, and the deadlines.*

ComplianceCheck Team · Published 3 July 2026

Professional Tax (PT) is a small but frequently-missed statutory deduction. Because it is a **state subject**, the rules differ everywhere — some states levy it, others don't, and the salary slabs and due dates vary. If you run payroll across multiple states, PT is one of the easiest things to get wrong. This guide gives you the full picture.

## Key facts at a glance

- Professional Tax is levied by **state governments**, not the central government.
- The **maximum PT is capped at Rs 2,500 per year** per person (a constitutional limit).
- The employer must **deduct PT from salaries and deposit it** with the state.
- Roughly **half of India's states levy PT**; major states like **Delhi, Haryana, UP and Rajasthan do not**.
- If you operate in multiple states, you must **register and file separately in each** applicable state.

## Who pays Professional Tax?

Anyone earning an income from a profession, trade, or employment in a state that levies PT — salaried employees, professionals, and businesses. For salaried staff, the **employer deducts PT** from the monthly salary and deposits it with the state government. Self-employed professionals pay it directly.

The amount depends on the employee's monthly salary slab, subject to the **Rs 2,500 per year statutory ceiling** set under Article 276 of the Constitution.

## States that levy Professional Tax (with thresholds)

The table below shows the states that levy PT, the annual maximum, the filing frequency, and the salary level at which PT begins to apply.

| State | Max per year | Frequency | Applies above |
| --- | --- | --- | --- |
| Maharashtra | Rs 2,500 | Monthly / Annual | Rs 7,500/month |
| Karnataka | Rs 2,500 | Monthly | Rs 25,000/month |
| Tamil Nadu | Rs 2,500 | Half-yearly | Rs 21,000/half-year |
| Telangana | Rs 2,500 | Monthly | Rs 15,000/month |
| Andhra Pradesh | Rs 2,500 | Monthly | Rs 15,000/month |
| Gujarat | Rs 2,500 | Monthly / Quarterly | Rs 12,000/month |
| Kerala | Rs 2,500 | Half-yearly | Rs 12,000/half-year |
| West Bengal | Rs 2,500 | Monthly | Rs 10,000/month |
| Madhya Pradesh | Rs 2,500 | Monthly | Rs 18,750/month |
| Odisha | Rs 2,500 | Monthly | Rs 13,333/month |
| Assam | Rs 2,500 | Monthly | Rs 10,000/month |
| Bihar | Rs 2,500 | Monthly | Rs 25,000/month |
| Jharkhand | Rs 2,500 | Monthly | Rs 25,000/month |
| Punjab | Rs 2,400 | Monthly | Rs 15,000/month |
| Meghalaya | Rs 2,500 | Monthly | Rs 4,167/month |
| Tripura | Rs 2,500 | Monthly | Rs 7,500/month |
| Sikkim | Rs 2,500 | Monthly | Rs 20,000/month |
| Manipur | Rs 2,500 | Monthly | Rs 6,250/month |

*Slabs are revised periodically by each state — always confirm the current schedule on your state's commercial tax / PT portal before finalising payroll.*

## States that do NOT levy Professional Tax

If all your employees are in these states, you have **no PT obligation at all**:

- Delhi
- Uttar Pradesh
- Haryana
- Rajasthan
- Uttarakhand
- Himachal Pradesh
- Jammu & Kashmir
- Chhattisgarh
- Goa

This is a common source of confusion for companies expanding — a Bengaluru business that opens a Gurugram office does **not** deduct PT for its Haryana staff.

## Due dates in the big states

| State | PT payment due |
| --- | --- |
| Maharashtra | 15th of the month |
| Karnataka | 20th of the month |
| Gujarat | 15th of the month |
| West Bengal | 21st of the month |
| Telangana | 10th of the month |

Frequencies differ — Tamil Nadu and Kerala file half-yearly, Gujarat allows quarterly for smaller employers — so build a **state-wise compliance calendar** rather than assuming one national deadline.

## Multi-state operations: what to do

If you employ people in more than one PT state:

1. **Register for PT in each applicable state** — there is no central PT registration.
2. **Obtain both certificates where required** — a Professional Tax Registration Certificate (PTRC, for deducting from employees) and a Professional Tax Enrolment Certificate (PTEC, for the entity itself).
3. **Deduct per each state's slab**, not a blended rate.
4. **File on each state's frequency and due date.**
5. **Skip PT entirely** for employees based in exempt states.

Centralised payroll software helps, but the deductions themselves must reflect each state's rules.

## Penalties for non-compliance

PT penalties are state-specific but generally include:

- A **penalty for late or non-registration** (often a per-day amount).
- **Interest on late payment**, typically 1.25% to 2% per month.
- A **penalty for late filing or non-filing** of returns.
- A **penalty for non-deduction**, usually equal to the tax amount plus interest.

The sums are small per employee but accumulate quickly across a workforce and multiple months, and they surface during due diligence and audits.

## Your Professional Tax checklist

1. **Map your employees by state** and identify which are in PT-levying states.
2. **Register (PTRC and PTEC)** in each applicable state within the state's timeline.
3. **Apply the correct slab** per state for each employee's salary band.
4. **Deposit and file** on each state's due date and frequency.
5. **Cap the annual deduction at Rs 2,500** per employee (Rs 2,400 in Punjab).
6. **Review when you hire in a new state** — applicability changes with location, not headcount.

## Frequently asked questions

**Which states have no Professional Tax?**
Delhi, Uttar Pradesh, Haryana, Rajasthan, Uttarakhand, Himachal Pradesh, Jammu & Kashmir, Chhattisgarh and Goa do not levy Professional Tax.

**What is the maximum Professional Tax in India?**
Professional Tax is capped at Rs 2,500 per person per year under Article 276 of the Constitution. Punjab's maximum is Rs 2,400.

**Who deducts and deposits Professional Tax?**
For salaried employees, the employer deducts PT from monthly salary and deposits it with the state government. Self-employed professionals pay it directly through enrolment.

**Do I need to register for Professional Tax in each state?**
Yes. Professional Tax has no central registration. If you employ people in multiple PT-levying states, you must register and file separately in each.

**Is Professional Tax the same across India?**
No. Rates, salary slabs, due dates and filing frequency all differ by state, and several states don't levy it at all.

---

> This guide is general information, not legal advice. Slabs and due dates are revised by individual states — verify on your state's commercial tax / Professional Tax portal.

### Find out exactly what applies in your state

**Which Laws Apply to My Business?** — a 10-minute check covering Professional Tax slabs, Labour Welfare Fund rates, Shops & Establishments deadlines and more, tailored to your state. Free compliance summary instantly; full report from Rs 499.

[Start free assessment →](https://compliancecheck.co.in/assessment/state-wise-compliance) · Free during beta · no subscription

**Sources:** state commercial tax / Professional Tax department portals; Article 276, Constitution of India.
```

- [ ] **Step 2: Verify the post is picked up**

Run: `npm run build`
Expected: build succeeds and `/blog/professional-tax-state-wise-guide` is generated.

- [ ] **Step 3: Commit**

```bash
git add content/blog/professional-tax-state-wise-guide.mdx
git commit -m "Publish professional tax state-wise guide to the live blog"
```

---

### Task 4: Verify all 6 posts are indexed and sitemapped together

**Files:**
- None (verification-only task).

- [ ] **Step 1: Confirm the blog index lists all 6 posts**

Run the dev server (`npm run dev`) and open `/blog`. Expected: 6 posts listed, newest first by `date` — the 3 new posts (`2026-07-03`) above the 3 existing posts (`2026-06-20`–`2026-06-22`).

- [ ] **Step 2: Confirm sitemap.xml includes all 6**

With the dev server running, fetch `/sitemap.xml` and confirm it contains all 6 `/blog/{slug}` URLs — 3 pre-existing plus the 3 added in Tasks 1-3.

- [ ] **Step 3: Submit the sitemap to Google Search Console**

This is a manual, one-time action outside the codebase — the site owner (not this agent) submits `https://compliancecheck.co.in/sitemap.xml` in Google Search Console once these changes are deployed. Note this as an outstanding manual step in the PR/commit description; it cannot be automated from this repo.

## Self-Review Notes

- **Spec coverage:** growth-plan fix #2 ("Fix blog discoverability... verify every article is in sitemap.xml; submit the sitemap in Google Search Console") — the discoverability/sitemap mechanism already worked correctly for existing posts (confirmed by research: index and sitemap both read `getAllPosts()` dynamically), so the actual gap was 3 unpublished drafts, not a code bug. This plan closes that real gap. The Search Console submission itself is manual (Task 4, Step 3) and is called out rather than silently dropped.
- **Placeholder scan:** none — each task creates one complete file with real content, not a stub.
- **Type consistency:** all 3 new `relatedAssessment` values (`food_business`, `statutory_health`, `state_wise_compliance`) are valid keys of `ASSESSMENT_TYPES` in `src/lib/constants/assessment-types.ts:17-25`.
- **Scope note:** this plan does not build a related-posts/cross-link component. With 6 total posts (up from 3), that's a smaller-yield item than getting the drafts live at all; treat it as a separate follow-up if the user wants it once more posts exist.
