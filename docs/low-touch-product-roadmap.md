# Low-touch compliance products: ideas and priority

## Context
POSH, DPDP and similar assessments only sell when buyers trust the source, and that trust comes with a compliance-leader partner who isn't on board yet. Until then, ComplianceCheck needs **low-touch** products. These are rules-based and driven by thresholds, with little room for interpretation and low liability if a number is slightly off. They should pull traffic, capture leads and earn revenue on their own, and the partner can review them cheaply later.

## Evidence used (and its limits)
- **Our own traffic (PostHog, last 90 days).** Payroll content leads by a wide margin: `/blog/pf-esi-applicability-employer-guide` (78 visitors, #1 after the homepage), `professional-tax-state-wise-guide` (44), leave rules (37), interns/apprentices PF-ESI (19), ESIC inspections (17), EPFO 7A (9). Content on sector checklists and NOCs also draws steady visits: DG sets/building NOCs (12), hospitals and clinics (8), hotels (7), restaurants (7), NGOs (6). By contrast the POSH/DPDP assessment pages get only 7–8 visitors each, which supports the trust-gap theory. Total volume is small (~1k visitors), so these numbers show direction, not proof.
- **Web signals.** Pain points repeat across Indian MSME and startup sources: many overlapping licences (trade licence vs Shop & Establishment vs fire NOC vs FSSAI), deadlines missed on PF/ESI/GST/TDS, and 5–10 separate registrations to open a clinic.
- **Gap:** my searches did not surface actual Reddit, Quora or LinkedIn threads, so I **can't cite counts of social-media requests**. The validation step below closes this gap.

## Scoring lens
Each idea is scored on four things: demand (our traffic plus search signals), trust needed (lower is better), build effort (how much existing code we can reuse) and monetisation.

## Tier 1: build now
1. **Payroll statutory suite (PF/ESI applicability + contribution calculator, PT + LWF by state).** This has the strongest demand signal we have. Everything is a threshold or a slab table. The calculator is free, with a paid "monthly payroll compliance pack" PDF. Reuse: the pattern in `src/app/calculator/ctc`, `INDIAN_STATES` from `@/lib/constants/india`, and the `/guides/[state]` programmatic pages.
2. **Licence Finder: "What licences does my business need?"** Inputs are business type, state, headcount, premises area and floors. The output is a checklist covering Shop & Establishment, trade licence, FSSAI, **fire NOC**, GST, Udyam, PT, PF/ESI, pollution-board consent, and, for clinics, **clinical establishment registration and biomedical-waste authorisation**. This single product covers the fire, FSSAI and health areas you listed. It says "likely required, verify with authority" rather than giving a legal opinion, which keeps the trust bar low. The existing "complete checklist for hospitals/hotels/restaurants/NGOs" posts link straight into it.
3. **Compliance calendar with email reminders.** It covers PF/ESI on the 15th, PT, LWF, GST, TDS, the FSSAI annual return (31 May), and the POSH annual report. It's pure dates, so it needs almost no trust, and it creates **recurring touchpoints** that later feed the paid assessments. It sends through Resend, which is already in the stack.

## Tier 2: next
4. **Fire NOC applicability checker.** Based on NBC 2016 thresholds for occupancy, height and area. It varies by state, so position it as indicative, or fold it into #2 first and split it out only if demand justifies a standalone tool.
5. **Clinic/healthcare starter checker.** Covers CEA or the state act, BMW, PCPNDT for ultrasound, AERB for X-ray, pharmacy and fire. Again, this can start as a vertical inside #2.
6. **Minimum wage checker (state × zone × skill).** Search demand is high, but rates are revised twice a year (VDA changes in April and October), so it carries an ongoing data cost.
7. **Statutory registers and record-retention generator.** The blog already has traffic on this topic. It outputs a registers list by state and headcount, with templates.

## Other ideas beyond your list
- **Labour Code wage-structure check (the 50% "wages" rule)** as an add-on to the CTC calculator. It's very timely because the codes are now notified. It shows how basic pay affects PF and gratuity, the maths is deterministic, and the leave-rules and gratuity posts already draw traffic.
- **Worker classification checker** covering employee vs consultant vs contractor, and interns. The blog already has traffic on this.
- **MSME 45-day payment / Sec 43B(h) checker.** It flags whether unpaid supplier invoices risk being disallowed as a tax deduction. It's rules-based and peaks at tax season, and it appeals to CAs, who are also a distribution channel.
- **A trust layer that works without the partner.** Every result cites its section and source link and shows "last reviewed" and "methodology". When the partner joins, add a "Reviewed by" badge. This raises trust across the whole site.
- **Deprioritise** GST and TDS calculators. ClearTax and the tax-software players already own that space.

## Validation step (1–2 hours, before building)
- Run a PostHog survey on the blog and calculators asking "Which tool should we build next?", with options #1–#7 above.
- Search Reddit (r/IndiaTax, r/CAIndia, r/IndianStartups, r/humanresourcesindia), Quora and LinkedIn HR groups for "PF ESI applicable", "professional tax", "fire NOC", "shop act", "which licence". Record the counts in a sheet to confirm or reorder Tier 1.

## First build: Payroll statutory suite (v1 shipped 2026-09-27)

v1 shipped at `/calculator/pf-esi-pt` with PF/ESI applicability, per-employee contributions and PT. **Deferred from v1:** LWF (the repo's state LWF data is inconsistent), the due-date email capture (it needs a new table and an RLS policy), and the paid PDF pack.

Original scope:
- New route `src/app/calculator/pf-esi-pt/` following the CTC calculator pattern. It has no gate, which matches the calculator promise already made for the gratuity calculator.
- Rules live in `src/lib/calculators/payroll-statutory-calculator.ts` (reuses the PT slabs and PF/ESI constants from `ctc-calculator.ts`): PF/ESI thresholds and rates, plus state PT and LWF slabs with statute citations and a `lastReviewed` date. Add unit tests with vitest.
- Analytics events go through `src/lib/analytics/tracking.ts`, never as string literals.
- Add an optional "email me the monthly due dates" capture, which becomes the seed for the calendar (#3).
- Link the PF/ESI and PT blog posts and the `/guides/[state]` pages to the new calculator.

## Verification
- `npx vitest run` covers the rule tests: PF/ESI edge thresholds (19/20 employees, the ₹21k ESI ceiling) and PT slabs for Maharashtra, Karnataka, West Bengal and Tamil Nadu.
- `npm run lint` and `npm run build` must be clean.
- Manual check in `npm run dev`: calculator results match the worked examples in the existing blog guides.
- After launch, compare PostHog blog→calculator click-through and email-capture rate against the gratuity calculator.
