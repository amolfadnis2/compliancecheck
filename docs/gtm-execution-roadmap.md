# GTM Execution Roadmap

*Created 2026-09-28. Source strategy: `docs/ComplianceCheck_GTM_Strategy_and_Competition_Analysis.pdf` (Sep 2026).*
*This doc turns that strategy into a phased build and launch path, starting from the product, data and analytics we have today.*

---

## 1. Summary and target end-state

The strategy says ComplianceCheck should be sold as **"compliance clarity for Indian businesses"**, not as compliance software. It rests on three assets:

1. **The ComplianceCheck Score™**: a single 0–100 score with category sub-scores.
2. **The 15-Minute Compliance Health Check**: a free check across several compliance areas, and the main entry point to the product.
3. **A CA/CS Partner Network**: chartered accountants and company secretaries who bring clients to us.

The target customer journey:

```
"Am I compliant?" → Free 15-min Health Check → ComplianceCheck Score → Top gaps
   → ₹499 Detailed Report → Deep assessments / Readiness Pack → Compliance Workspace (₹/month)
```

How each stage of the journey maps to a product module:

| Stage | Customer question | Module | Exists today? |
|---|---|---|---|
| Discover | What applies to me? | Health Check + "Which laws apply" (`state_wise_compliance`) | Partly: only single-area assessments |
| Assess | Where am I exposed? | ComplianceCheck Score + Report | Partly: generic "Compliance Score" |
| Prioritise | What should I fix first? | Action Plan (paid report) | Yes, in the paid PDF |
| Remediate | How do I fix it? | Guidance + partner hand-off | No |
| Monitor | What is due next? | Workspace: calendar and reminders | No |
| Prove | Can I show I'm compliant? | Evidence, documents, audit trail | No |

**Decisions already taken** (2026-09-28):

- Build a **new cross-domain Health Check**. We are not stretching `statutory_health` to cover it.
- **Re-price** live assessments down to the GTM price tiers (§3.1).

---

## 2. Where we are today

### 2.1 Product gap analysis

| GTM element | Today | Gap |
|---|---|---|
| Hero: "Are you sure your business is compliant?" / CTA "Check my compliance" | H1 is "Know exactly where your business stands on Indian compliance — in 15 minutes". The primary CTA "See All Assessments & Pricing" goes to `#assessments` (`src/app/page.tsx`). | New copy, and one primary CTA that goes to the Health Check |
| 15-minute cross-domain Health Check | None. `statutory_health` is 12 payroll-only questions (PF, ESI, PT, Gratuity, Bonus) in `src/lib/assessments/statutory-health-questions.ts`. Auto-dealer is the only multi-area assessment, and it is sector-specific. | New assessment type |
| ComplianceCheck Score™ and report structure | A generic "Compliance Score": weighted category sum ÷ max, banded ≥90 / ≥70 / below by `getComplianceStatus` in `src/lib/constants/assessment-types.ts`. The free summary, full results page and paid PDF each use a different section order. The screen has no "critical gaps", "top 3 actions" or "legal references" block. | Branding, a shareable score card, and a single report structure across tiers. See **§5 Report structure**. |
| Pricing tiers | Payment is live for statutory (₹499), DPDP (₹2,499) and POSH (₹1,999), all one-time (`ASSESSMENT_PRICES`). | Re-price the live assessments and add a bundle ("Pack") entitlement. Also, `ASSESSMENT_PRICING` (free/paid tier used for OTP gating) disagrees with `ASSESSMENT_PRICES.live`. |
| Partner program | None. The only related thing is a "Partnership Enquiry" option in the contact form. There are no user accounts, and `/dashboard` doesn't exist. | Attribution first, then a partner dashboard, then co-branded reports |
| Email / WhatsApp journeys | Transactional Resend emails only (`src/app/api/email/send-report/route.ts`). WhatsApp exists only as a `wa.me` share link (`src/components/site/ShareButtons.tsx`). | Drip sequences and a WhatsApp provider |
| Workspace (calendar, reminders, documents) | Reminder consent is collected (`src/components/identity/ConsentCheckboxes.tsx`) but nothing sends reminders. No subscriptions. | The whole product |
| Live copy vs. subscription | "One-time. No subscription." appears in `src/components/results/payment-gate.tsx` and `src/app/page.tsx` (pricing and FAQ), plus `LandingPricingCard.tsx` and `AssessmentCTA.tsx`. | Reword when the Workspace launches (§3) |
| SEO | Strong base: 217 blog posts, 36 state guides at `/guides/[state]`, 7 assessment landing pages, `llms.txt` | Point CTAs at the Health Check. 5 of the GTM's 10 suggested landing pages are missing (§7). |

### 2.2 Analytics (PostHog project "Compliancecheck", audited 2026-09-28)

Last 30 days, excluding localhost:

| Event | Count |
|---|---|
| `$pageview` | 647 (518 people) |
| `assessment_started` | **5** (4 people) |
| `assessment_abandoned` | 27 (1 person, so noisy) |
| `penalty_calculator_viewed` / `_completed` | 8 / 1 |
| `assessment_completed`, `report_*`, `checkout_*`, any payment event | **none recorded** |
| `$identify` | none |

What this means:

- **None of the GTM funnel KPIs can be measured today.**
  - `assessment_started` and `assessment_completed` are only wired in POSH and auto-dealer.
  - `checkout_started` is fired with a hardcoded `plan: 'pro', billing_cycle: 'monthly'`.
  - No payment success or failure event fires anywhere, including `/api/payment/verify`.
  - Without `$identify`, an email or a payment can't be joined back to a visitor.
- Revenue analytics and marketing-analytics conversion goals are not configured. Base currency is still USD.
- Session replay and heatmaps are already on, which helps with the homepage work.

**Traffic reality check:** at ~520 visitors/month, even the top of the GTM's 8–15% visitor-to-assessment range gives ~75 assessments a month. The Phase 1 target of 1,000 assessments needs roughly 7,000–12,000 visitors over two months, or partner-driven volume. **The binding constraint is demand generation (SEO reach, partners, paid search), not product features.** Budget time accordingly.

### 2.3 Backend (Supabase) readiness

> ⚠️ The production database was **not** reachable from the audit session. The connected Supabase account has only two paused projects, and neither is ComplianceCheck. This section is based on `supabase/migrations/`. **Phase 0 includes checking the live schema against these migrations.**

| Need | Current schema | Change required | Size |
|---|---|---|---|
| New `compliance_health_check` type | `assessments.assessment_type` has a CHECK constraint (latest in `20260524000000_add_food_business_assessment_type.sql`) | Migration that extends the CHECK | S |
| Re-pricing | Prices live in code (`ASSESSMENT_PRICES`). `assessment_entitlements.amount_paise` records what was actually paid. | Code only | S |
| Readiness Pack (bundle) | One entitlement per assessment: `UNIQUE (assessment_id, assessment_type)` | `bundle_purchases` table (credits) + redemption, which writes normal entitlements with `payment_method = 'bundle'` | M |
| Partner attribution | No `ref` / UTM column on `assessments`, `posh_assessments` or `auto_dealer_assessments` | `partners` table + `referral_code` column on all three assessment tables + capture of `?ref=` | S–M |
| Partner discounts / revenue share | `promo_codes.kind` only allows `'full_waiver'` | Add `percent` / `flat` kinds, `partner_id` on `promo_codes`, and a `partner_payouts` ledger | M |
| User / partner dashboards | `users`, `profiles` and `companies` exist with owner RLS, but anonymous assessments aren't linked to users | Link assessments to a user by email at login; partner↔client relation with RLS | L |
| Reminders / calendar | Consent is logged (`consent_logs`). No obligations or reminders tables. Netlify scheduled functions already work (`netlify/functions/keep-alive.mts`). | `obligations` + `reminders` tables and a scheduled function that sends through Resend | M |
| Subscriptions (Workspace) | None. The legacy `payments` table is one-off only. | `subscriptions` table, Razorpay Subscriptions webhooks, entitlement by plan | L |
| Data moat (gap statistics) | Answers are stored per row across 3 tables | An anonymised aggregate view in the admin dashboard | M |

**🔴 Security issue: fix in Phase 0, regardless of the GTM work.**
`20260609000001_create_assessment_entitlements.sql` creates the policy `"Allow select by assessment_id" … FOR SELECT USING (true)`. That lets anyone with the public anon key read every entitlement row, including buyer `email` and Razorpay order and payment IDs.

- Entitlement reads already go through the admin client (`src/lib/payment/entitlement.ts`), so dropping or scoping this policy should not break anything.
- Confirm against the live DB before shipping the fix, and run the Supabase security advisor at the same time.

---

## 3. Decisions and conflicts to resolve

| # | Topic | Proposal | Conflicts with | Decide by |
|---|---|---|---|---|
| D-1 | Re-pricing (decided) | **Essential ₹999**: DPDP (from ₹2,499), POSH (from ₹1,999), Labour Code, Food Business. **Entry ₹499**: Health Check full report, Statutory Health, State-wise. **Professional**: Readiness Pack ₹2,999–3,999; Auto Dealer ₹2,999 moves here because it covers many areas. | `docs/PAYMENTS_FRAMEWORK.md`, `docs/superpowers/plans/2026-07-09-dpdp-payment-live.md`, ₹2,499 / ₹1,999 mentions in CLAUDE.md §11, `docs/SEO-LLM-recommendations-and-backlog.md`, `docs/blog-content-pipeline.md`, blog CTAs | Phase 0; update these docs in the same PR as the price change |
| D-2 | Lead with DPDP/POSH vs. the "trust gap" | Lead with the Health Check. DPDP and POSH become gap-driven upsells instead of cold entry points. | `docs/low-touch-product-roadmap.md`, which holds DPDP/POSH back until trust is established | Phase 1 |
| D-3 | CA-channel positioning | Retire or reframe blog idea O-06 "CA vs labour consultant vs compliance platform" as "how CAs use a compliance score" | `docs/blog-content-pipeline.md` | Phase 1 |
| D-4 | CA revenue share | Check ICAI rules on solicitation and fee-sharing. Fallback: white-label or co-branding plus bulk credits instead of cash revenue share. | `docs/Fixes as on 9 July.md` (20–30% rev-share idea) | Before partner recruitment |
| D-5 | "ComplianceCheck Score™" | Trademark search, then file. Use ™ only once filed. | — | Phase 1 |
| D-6 | DPDP non-payers leave no email | Capture email on the free summary for DPDP (soft, optional) | The open question in CLAUDE.md §11 | Phase 1 |
| D-7 | "No subscription" copy | Keep reports as one-time. Frame the Workspace as a separate, optional product. Reword FAQ and PaymentGate copy at Workspace launch. | Live copy (§2.1) | Phase 4 |
| D-8 | North-star metric | Completed assessments (GTM §12) | `docs/growth-strategy.md` uses `assessment_started` | Phase 0 |
| D-9 | Score interpretation bands | Add 5 reader-facing bands (§5.2) through a new `getScoreInterpretation()`. Keep the existing 3-band `getComplianceStatus` for colours and status, since it has 5 callers. | GTM §6 examples vs. the current 3 bands | Phase 1 |
| D-10 | POSH and auto-dealer reports | Move them to the v2 structure as a follow-up. They have their own renderers (`server-posh-report.ts`, auto-dealer server-side jsPDF), and CLAUDE.md §14 protects auto-dealer's differences. | — | After Phase 1 |

---

## 4. Phased roadmap

Each phase is written so it can become its own implementation plan in `docs/superpowers/plans/`.

### Phase 0: Measure, secure, re-price (weeks 0–2)

**Goal:** trustworthy funnel data and the new prices live before any growth spend.

| Workstream | Work | Touches |
|---|---|---|
| Instrumentation | Fire `assessment_started` / `assessment_completed` in all 7 flows via the typed `analytics` wrapper. Fix `checkout_started` props (`assessment_type`, `amount`). Add `payment_succeeded` / `payment_failed`, sent server-side (posthog-node, lazy-init) from `/api/payment/verify`. Call `$identify` when an email is captured. Register `utm_*` / `ref` as person properties. | `src/lib/analytics/events.ts`, `src/lib/analytics/tracking.ts`, each `src/app/assessment/*/page.tsx`, `src/app/api/payment/verify` |
| PostHog setup | Funnel dashboard (visit → start → complete → checkout → paid). Revenue analytics in INR. Conversion goals. Record the baseline. | PostHog project |
| Security | Drop or scope the entitlements `SELECT USING (true)` policy. Run the Supabase advisors. | New migration |
| Live DB check | Connect the correct Supabase org. Diff the live schema against `supabase/migrations/`. | — |
| Re-price | Update `ASSESSMENT_PRICES`. Reconcile `ASSESSMENT_PRICING` with it. Update landing pages, blog CTAs and the docs listed in D-1. | `src/lib/constants/assessment-types.ts`, `src/app/assessments/landing/*`, `content/blog` CTAs |

**Exit criteria:** a PostHog funnel shows real numbers for every step for 7 days; the RLS fix is deployed; new prices are live.

### Phase 1: Validate (months 1–2)

**Goal:** prove that people who take the Health Check buy the paid report.

| Workstream | Work | Touches |
|---|---|---|
| Health Check | New `compliance_health_check` type with ~25–30 questions across payroll (PF/ESI/PT/Gratuity/Bonus), labour codes, POSH, DPDP, Shops & Establishments, and state rules. Company-details Step 0 per CLAUDE.md §11. Reuses the scoring pattern, `<AssessmentHeader>`, `<PaymentGate>`, and `generateUnifiedReportBlob` via a new adapter in `report-data-adapter.ts`. DB write with local fallback. | New `src/lib/assessments/compliance-health-check-*.ts`, `src/app/assessment/compliance-health-check/`, `src/app/api/assessment/…`, migration extending the `assessment_type` CHECK, `ASSESSMENT_TYPES` |
| Report structure v2 | Apply the §5 hierarchy to the free summary, the full results page and the Essential PDF. Brand the ComplianceCheck Score and add `getScoreInterpretation()`. Each gap links to its deep assessment (e.g. POSH gap → POSH assessment). Consider merging the three near-duplicate render branches in `results/[id]/page.tsx` while doing this. The Health Check report uses v2 from the start. | `src/components/results/assessment-summary.tsx`, `src/app/results/[id]/page.tsx`, `src/lib/pdf/unified-report-generator.ts`, `src/lib/pdf/report-data-adapter.ts`, `src/lib/constants/assessment-types.ts` |
| Shareable score | OG image of the score card plus share buttons ("How compliant is your business out of 100?") | `src/app/results/[id]/opengraph-image.tsx` (new), `ShareButtons.tsx` |
| Paid report | ₹499 full report: detailed gaps, legal references, action plan | `ASSESSMENT_PRICES`, PDF adapter |
| Homepage | New hero: "Are you sure your business is compliant?"; primary CTA **Check my compliance** goes to the Health Check; reassurance line "Free summary • No credit card • No subscription". The assessments grid moves below the fold. | `src/app/page.tsx` |
| Partners (manual) | Hand-recruit 20 CA/CS partners. Each gets a promo code and a `?utm_source=partner&utm_campaign=<code>` link. Track in a spreadsheet; no product work yet. | Existing `promo_codes` |
| Paid search | Small Google Ads test (₹1–2k/month per `docs/Fixes as on 9 July.md`) on "are you compliant / does POSH apply / DPDP ready" queries | — |

**Exit criteria / targets:**
- Health Check start → complete ≥ 60%.
- Complete → paid ≥ 5%.
- The 1,000-assessment target is realistic only if traffic scales (§2.2). Track it, but judge the phase on the two conversion rates.

### Phase 2: Build the engine (months 3–4)

**Goal:** a repeatable acquisition and conversion loop.

| Workstream | Work | Touches |
|---|---|---|
| Content | Change blog and guide CTAs to the Health Check (keep topic-specific CTAs where they fit better). Question-led posts from GTM §8A. | `content/blog`, `src/components/site/AssessmentCTA.tsx` |
| Landing pages | The 5 missing GTM Appendix-B pages: Indian startups, SMEs 10–50 employees, manufacturing, IT/SaaS, Maharashtra SME | `src/app/assessments/landing/*`, `src/app/sitemap.ts` |
| Result journeys | Resend drip after a free result: day 0 summary, day 2 top gap explained, day 5 penalty exposure, day 10 offer. Unsubscribe handling. WhatsApp provider decision (e.g. Gupshup / Interakt / Meta Cloud API). | New `email_sequences` table + scheduled Netlify function |
| Readiness Pack | Bundle purchase (₹2,999–3,999) giving N assessment credits, plus the **consolidated Pack report** (§5.4: management summary, side-by-side scores, de-duplicated remediation roadmap) | `bundle_purchases` migration, `/api/payment/*`, `entitlement.ts` |
| Partner v1 | `partners` table; `?ref=` captured into `referral_code` on all assessment tables; partner landing page ("Give every client a measurable compliance score"); percent-off promo kinds | Migrations, middleware or cookie for `ref`, `src/app/partners/` |
| Calendar lead magnet | Free compliance calendar with email reminders (Tier 1 in `docs/low-touch-product-roadmap.md`). This is the seed of the Workspace. | `obligations` / `reminders` tables, scheduled function |

**Exit criteria / targets:** 5,000 cumulative assessments; the drip lifts complete → paid; ≥ 20% of assessments attributed to a channel.

### Phase 3: Scale distribution (months 5–8)

**Goal:** lower acquisition cost through partners.

| Workstream | Work |
|---|---|
| Accounts | User login linked to past assessments by email; `/dashboard` listing a user's assessments and reports |
| Partner dashboard | Client assessment links, consolidated client view, bulk credit packs, and a payouts ledger (or credits, per D-4) |
| Partner reports | Co-branded or white-label PDFs through a `ReportConfig.branding` field, and a consolidated **client-portfolio report** (§5.4) |
| Channels | Incubator and accelerator cohorts (bulk links), MSME / industry associations, monthly "Compliance Clinic" webinars, CA/CS co-hosted workshops |

**Exit criteria / targets:** 25–50 active partners (≥ 1 client assessment a month each).

### Phase 4: Build recurring (months 9–12)

**Goal:** raise customer lifetime value with the Compliance Workspace.

| Workstream | Work |
|---|---|
| Workspace | Obligations generated from Health Check answers, calendar, reminders (email, then WhatsApp), owners, evidence / document upload (Supabase Storage), periodic reassessment |
| Trend and evidence reports | **Reassessment report** (score over time, gaps closed vs. open) and an **evidence / audit-trail section** (GTM §15 "Prove") |
| Billing | Razorpay Subscriptions, `subscriptions` table, webhooks, entitlement by plan; Monitor tier ₹299–999/month (test the price) |
| Copy | Reword "no subscription" copy (D-7) |

**Exit criteria / targets:** paid report → recurring 15–30% as the product matures.

### Runs throughout: data moat

- Anonymised aggregate views: most common gaps by industry, size and state.
- Surface them in the admin dashboard (`src/app/admin/(dashboard)`).
- From ~month 6, publish a yearly **"State of SME Compliance in India"** report as a PR and SEO asset.

---

## 5. Report structure

The strategy changes the report as well as the funnel:

- GTM §6 sets a fixed result hierarchy and per-area score readings.
- GTM §10 defines what each price tier contains.
- GTM §9 asks for consolidated and co-branded partner reports.
- GTM §15 names an "Action Plan" step and later "Prove" (evidence).

This section sets one structure that every tier and surface follows.

### 5.1 Today

| Surface | File | Current section order |
|---|---|---|
| Free summary (web) | `src/components/results/assessment-summary.tsx` | Header → overall score → category breakdown → gap & penalty summary → locked "Top Issues Found" (category name only) → "What you get" list → PaymentGate |
| Full results (web) | `src/app/results/[id]/page.tsx` (three near-duplicate render branches) | Header → overall score → category breakdown → action items → download/share → disclaimer → "Also try" upsell |
| Essential PDF | `src/lib/pdf/unified-report-generator.ts` | Cover ("Pay-as-you-go Compliance Assessments for Indian SMEs") → Executive Summary (score, risk level, penalty exposure, category table, generic 4-bullet "Key Findings") → Action Items (priority, steps, `governmentRef`, `officialLink`, penalty, deadline) → Compliant Areas → Next Steps & Resources (timeline, government resources, legislation, deadlines) |
| POSH / auto-dealer PDFs | `src/lib/pdf/server-posh-report.ts`, auto-dealer server-side jsPDF | Own layouts (see D-10) |

The data model already carries almost everything the GTM structure needs:

- `UnifiedActionItem` has `priority`, `governmentRef`, `officialLink`, `penalty` and `deadline`.
- `UnifiedCategoryScore` has the score and status.

So v2 is mostly a matter of re-arranging and adding sections, not collecting new data.

### 5.2 Report hierarchy (v2): one spine for web and PDF

| # | Section | Content | Snapshot (free) | Essential (paid) |
|---|---|---|---|---|
| 1 | **ComplianceCheck Score** | Overall 0–100, a one-line reading, and risk level | ✅ | ✅ |
| 2 | **Critical gaps** | High-priority items with their penalty exposure | Count + category names | Full items |
| 3 | **Top 3 actions: fix first** | Ranked by priority, then penalty, then deadline | Titles only | Titles + steps + deadline |
| 4 | **Category scores** | Each area with its score and reading (e.g. "Labour 82/100: Good, monitor outstanding documentation") | ✅ basic view | ✅ + question counts |
| 5 | **Legal references** | Act and section list built from `governmentRef` / `officialLink` across gaps | Count only ("12 legal provisions cited") | Full list (appendix in the PDF) |
| 6 | **Action Plan** | Every gap, prioritised, on a 30/60/90-day timeline (the GTM "ComplianceCheck Action Plan") | 🔒 | ✅ |
| 7 | **Compliant areas** | What's already in place | — | ✅ |
| 8 | **Get help** | Remediation hand-off CTA (professional or partner; a contact form until the Phase 3 partner network exists) | — | ✅ |
| 9 | **Unlock CTA** | Price + what's included | ✅ | — |

**Score readings (D-9):**

| Score | Reading |
|---|---|
| ≥90 | Strong |
| 75–89 | Good: monitor |
| 60–74 | Review specific obligations |
| 40–59 | Needs attention |
| <40 | High-priority gaps |

These come from a new `getScoreInterpretation()`. The existing 3-band `getComplianceStatus` still drives colours.

### 5.3 Essential PDF changes (`unified-report-generator.ts`)

- **Cover:** replace the tagline with "Compliance clarity for Indian businesses", and title the score "ComplianceCheck Score".
- **Executive Summary:** replace the generic "Key Findings" bullets with **Critical Gaps** and **Top 3 Actions**, and add a reading line per category in the category table.
- **Action Items:** keep, ordered by the §5.2 ranking.
- **Next Steps & Resources:** rename to **Action Plan**, with the 30/60/90-day timeline first.
- **Legal References appendix:** new page, de-duplicated by Act.
- **Get help:** a closing block that replaces the "Schedule Your Next Assessment" box, or sits alongside it.
- All new text goes through `cleanText()` (CLAUDE.md §5).
- Check layout against `docs/PDF Export formatting design guide.pdf`.

### 5.4 New report types

| Report | Phase | Contents | Build notes |
|---|---|---|---|
| **Health Check report** | 1 | One ComplianceCheck Score across payroll, labour codes, POSH, DPDP, Shops & Establishments and state rules; each gap links to the matching deep assessment | New adapter in `report-data-adapter.ts`; v2 structure from day one |
| **Readiness Pack consolidated report** | 2 | **Management summary** (one page for founder or board), scores across assessments side by side, **consolidated remediation roadmap** (gaps de-duplicated across assessments, one timeline) | New multi-assessment input (e.g. `ConsolidatedReportData`) in the unified generator |
| **Partner co-branded report** | 3 | The standard Essential report with the partner's name and logo in the header and footer (co-branded) or ComplianceCheck branding removed (white-label) | `ReportConfig.branding` field; logo stored in Supabase Storage |
| **Partner client-portfolio report** | 3 | Score per client, most common gaps across clients, clients needing urgent attention | Reads across the partner's client assessments |
| **Reassessment / trend report** | 4 | Score over time, gaps closed vs. still open, new obligations | Needs assessments linked to a user or company |
| **Evidence / audit trail** | 4 | Uploaded proof per obligation, with dates and owners (GTM "Prove") | Workspace documents |

---

## 6. KPI framework

**North star:** completed assessments per week.

| Funnel stage | KPI | GTM target | PostHog definition |
|---|---|---|---|
| Website | Visitor → assessment start | 8–15% | unique `$pageview` persons → `assessment_started` |
| Assessment | Start → completion | 60–75% | `assessment_started` → `assessment_completed` (same `assessment_type`) |
| Free → paid | Completion → paid report | 5–15% | `assessment_completed` → `payment_succeeded` |
| Expansion | Paid → Pack / subscription | 15–30% (later) | `payment_succeeded` → bundle / subscription event |
| Partner | Assessments per partner | — | `assessment_completed` broken down by `ref` |
| SEO | Organic visitor → completed assessment | — | funnel filtered to organic `$referring_domain` |
| Paid | Cost per completed assessment | — | ad spend ÷ `assessment_completed` where `utm_medium=cpc` |
| Retention | Reassessment / subscription retention | — | repeat `assessment_completed` per person; subscription events |
| Report engagement | Which report sections come before payment | — | `report_viewed` / `report_downloaded` with a `tier` property (snapshot / essential / pack / partner), plus section-level scroll or click events on the summary |

Every event and property above is added in Phase 0. The Pack and subscription events are added in Phases 2 and 4.

---

## 7. Suggested landing pages (GTM Appendix B) vs. what exists

| Page | Status |
|---|---|
| POSH compliance assessment | ✅ `posh-act-compliance` |
| DPDP readiness assessment | ✅ `dpdp-gap-assessment` |
| Labour compliance assessment | ✅ `labour-code-readiness` |
| Restaurants / food businesses | ✅ `restaurant-food-business` |
| Auto dealerships | ✅ `auto-dealer-compliance` |
| Compliance checklist for Indian startups | ❌ Phase 2 |
| SMEs with 10–50 employees | ❌ Phase 2 |
| Manufacturing companies | ❌ Phase 2 |
| IT / SaaS companies | ❌ Phase 2 |
| Maharashtra SME compliance assessment | ❌ Phase 2 (can reuse the `/guides/[state]` data) |

---

## 8. Explicitly not doing

These are ranked P3 in the GTM strategy:

- Enterprise sales, until SME and partner acquisition is repeatable.
- Competing head-on with HRMS / payroll platforms.
- Adding compliance areas for breadth. The priority is making the existing assessments easy to find, share and convert.
