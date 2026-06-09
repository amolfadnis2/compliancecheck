# Payments Framework — Design Doc

> Status: **Design / approved for phased build**
> Owner: ComplianceCheck
> Goal: Go live with payments across all 7 assessments, with a free summary → pay → detailed report flow, an optional email-PDF action, and a server-validated promo-code "door" for testers.

---

## 1. Objective

1. **Monetise all 7 assessments.** Every assessment becomes paid.
2. **Uniform funnel for all 7:** free summary page (the lure) → pay to unlock → detailed report with on-screen view, PDF download, and an *optional* "email me the PDF" button.
3. **Tester door:** a promo code that fully waives the charge, validated server-side, managed via a `promo_codes` table (create/expire/limit without redeploy).

This is built **one assessment at a time**, starting with a POC, behind a per-assessment switch so we can roll out gradually.

---

## 2. Pricing (decided)

| # | Assessment | Type constant | Price (INR) | Amount (paise) |
|---|------------|---------------|------------:|---------------:|
| 1 | Statutory Health Check | `statutory_health` | 499 | 49900 |
| 2 | Labour Code Readiness | `labour_code` | 999 | 99900 |
| 3 | DPDP Gap Assessment | `dpdp` | 2499 | 249900 |
| 4 | State-Wise Compliance ("Which laws apply") | `state_wise_compliance` | 499 | 49900 |
| 5 | Restaurant & Food Business | `food_business` | 999 | 99900 |
| 6 | POSH Act 2013 | `posh` | 1999 | 199900 |
| 7 | Auto Dealership | `auto_dealer` | 2999 | 299900 |

Notes:
- Auto-dealer currently uses a 3-tier model (₹999 / ₹2,499 / ₹4,999). **Decision:** move it to the single flat price of **₹2,999** to match the others, OR keep its tiers and treat ₹2,999 as the default/standard. (See open item O-1.)
- Prices are GST-inclusive on the storefront; `gst_amount` is recorded on the entitlement for accounting.

---

## 3. Current state (starting point)

### The 7 assessments

| Type | Today | Results path | Storage table |
|------|-------|--------------|---------------|
| `statutory_health` | free | `/results/[id]` → `StatutoryHealthResultsView` | `assessments` |
| `labour_code` | free | `/results/[id]` → `LabourCodeResultsView` | `assessments` |
| `dpdp` | free | `/results/[id]` → `DPDPResultsView` | `assessments` |
| `state_wise_compliance` | free | `/results/[id]` → `StateWiseResultsView` | `assessments` |
| `food_business` | free | `LocalStorageResultsPage` | `assessments` |
| `posh` | paid (UI only) | POSH page renders own results | `posh_assessments` |
| `auto_dealer` | paid ("free in beta") | `/assessment/auto-dealer/results/[id]` | `auto_dealer_assessments` |

### Two maturity levels

- **Auto-dealer (#7)** already implements the full target shape: OTP email gate → score teaser + pricing → `PaymentGate` → server-side gated PDF (`report.pdf/route.ts:746` only loads premium data when `payment_status === 'paid'`). It only lacks the live payment call — the button reads *"Free in beta — View Report"* and calls `setPaid(true)` locally (`auto-dealer/results/[id]/page.tsx:346`). Its order endpoint `/api/assessment/auto-dealer/pay` is built.
- **The other 6** have **no paywall**. Today: assessment → `EmailGate` (OTP) → full results + download/email immediately. No summary/detailed split. Full report data lives client-side (localStorage + client-side `generateUnifiedReportBlob`).

### Existing payment plumbing

- `/api/payment/verify/route.ts` — HMAC-SHA256 signature verify, but writes to **legacy** `payments` + `assessments` tables (needs rewrite).
- Legacy `payments` table (migration `001`) — `razorpay_*`, `amount`, `gst_amount`, `product_type` enum (missing `posh`/`auto_dealer`).
- **No coupon / promo / waiver code exists anywhere.**
- No rupee price defined for #1–6 today.

### Key files

| Concern | Path |
|---------|------|
| Assessment type + pricing config | `src/lib/constants/assessment-types.ts` |
| Shared results page | `src/app/results/[id]/page.tsx` |
| Email/OTP gate | `src/components/identity/EmailGate.tsx` |
| Gated wrapper | `src/components/results/gated-results.tsx` |
| Existing payment-gate component | `src/components/results/payment-gate.tsx` |
| Download + feedback | `src/components/results/download-with-feedback.tsx` |
| PDF generator (shared) | `src/lib/pdf/unified-report-generator.ts` |
| Email-report API (Resend) | `src/app/api/email/send-report/route.ts` |
| Auto-dealer order endpoint | `src/app/api/assessment/auto-dealer/pay/route.ts` |
| Auto-dealer gated PDF | `src/app/api/assessment/auto-dealer/[id]/report.pdf/route.ts` |
| Legacy verify | `src/app/api/payment/verify/route.ts` |

---

## 4. Target flow (all 7)

```
Assessment questions
      │
      ▼
[SUMMARY PAGE]  ← public, no email, no payment   ← THE LURE
  • Overall score + risk band
  • Category bars (where you're weak)
  • "X gaps found, Y critical"
  • Penalty exposure range (₹)
  • Locked/blurred detailed fixes
      │  "Unlock full report — ₹___"
      ▼
[EMAIL + PAYMENT GATE]
  • Email capture (for receipt + optional delivery)
  • Razorpay checkout
  • "Have a code?" → promo/waiver field
      │
      ├─ pays  ──────────────► entitlement = paid
      └─ valid promo code ───► entitlement = waived
      │
      ▼
[DETAILED REPORT]  ← server-verified entitlement
  • Full action plan, remediation, deadlines, citations
  • Download branded PDF
  • [Email me the PDF]  ← OPTIONAL, button-triggered
```

Auto-dealer already matches this shape — the work is bringing #1–6 up to it and flipping auto-dealer to live.

---

## 5. The critical architectural point

For #1–6, **the full report is already on the client** (localStorage + client-side PDF generation). Hiding the detailed UI only is **not a real paywall** — the data is in the network payload / localStorage. A real paywall needs a **server-side entitlement gate**, mirroring auto-dealer.

**Decision — split the data contract:**
- **Summary data** (teaser fields) — served publicly: score, category %, gap counts, penalty range, issue *titles*.
- **Detailed data** (full remediation, citations, deadlines, compliant-items, PDF input) — served **only after the server verifies entitlement is `paid` or `waived`**.
- For paid reports, generate the PDF server-side, or have the client fetch detailed data from the gated endpoint just-in-time before calling `generateUnifiedReportBlob`.

This is the biggest lift and the line between a real paywall and a cosmetic one.

---

## 6. Data model

### 6.1 `assessment_entitlements` (new — unified across all 7)

Keyed by the assessment record so paid/waived state is decoupled from the per-type tables.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `assessment_id` | text | the assessment's id (uuid or `local_*`) |
| `assessment_type` | text | one of the 7 type constants |
| `amount_paise` | integer | price charged (0 for waiver) |
| `currency` | text | default `INR` |
| `gst_amount` | integer | nullable |
| `status` | text | `initiated` \| `paid` \| `failed` \| `waived` |
| `payment_method` | text | `razorpay` \| `waiver` |
| `razorpay_order_id` | text | nullable |
| `razorpay_payment_id` | text | nullable |
| `razorpay_signature` | text | nullable |
| `promo_code` | text | nullable; set when `status='waived'` |
| `email` | text | captured at gate (receipt + optional delivery) |
| `created_at` / `paid_at` | timestamptz | |

- Unique index on `(assessment_id, assessment_type)`.
- RLS: anonymous **INSERT** + **SELECT by id** (per CLAUDE.md §8). Status transitions to `paid`/`waived` are written only by API routes using the admin (service-role) client, never from the browser.
- Auto-dealer may keep its inline `payment_status` columns for now and be migrated to this table later (open item O-2).

### 6.2 `promo_codes` (new — the tester door)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `code` | text UNIQUE | case-insensitive match (store uppercased) |
| `kind` | text | `full_waiver` (v1); room for `percent`/`fixed` later |
| `applies_to` | text[] | array of assessment types, or `['all']` |
| `max_uses` | integer | nullable = unlimited |
| `used_count` | integer | default 0 |
| `expires_at` | timestamptz | nullable = no expiry |
| `active` | boolean | default true |
| `note` | text | nullable (e.g. "QA team", "beta cohort") |
| `created_at` | timestamptz | |

Optional companion `promo_redemptions` (audit): `promo_code`, `assessment_id`, `assessment_type`, `email`, `redeemed_at`.

- RLS: **no anonymous SELECT** on `promo_codes` (codes must not be enumerable). Validation happens only inside `/api/payment/redeem-waiver` via the admin client.

### 6.3 Migrations

New files under `supabase/migrations/`:
- `*_create_assessment_entitlements.sql`
- `*_create_promo_codes.sql` (+ `promo_redemptions` if adopted)

---

## 7. Config changes — `assessment-types.ts`

Extend pricing from `'free'|'paid'` to carry the amount and a live switch:

```ts
export interface AssessmentPricing {
  mode: 'free' | 'paid';
  amountPaise: number;
  live: boolean;        // per-assessment rollout switch
}

export const ASSESSMENT_PRICING: Record<AssessmentType, AssessmentPricing> = {
  statutory_health:       { mode: 'paid', amountPaise: 49900,  live: false },
  labour_code:            { mode: 'paid', amountPaise: 99900,  live: false },
  dpdp:                   { mode: 'paid', amountPaise: 249900, live: false },
  state_wise_compliance:  { mode: 'paid', amountPaise: 49900,  live: false },
  food_business:          { mode: 'paid', amountPaise: 99900,  live: false },
  posh:                   { mode: 'paid', amountPaise: 199900, live: false },
  auto_dealer:            { mode: 'paid', amountPaise: 299900, live: false },
};
```

`live: false` ⇒ behaves as today (or shows summary without charging) until we flip it per assessment. Keep `isPaidAssessment()` working and add `getAssessmentPricePaise(type)`.

---

## 8. API endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payment/create-order` | POST | `{ assessmentId, assessmentType, email }` → look up price → create Razorpay order → upsert entitlement `status='initiated'`. Generalises auto-dealer `/pay`. |
| `/api/payment/verify` | POST | **Rewrite** legacy route: verify HMAC signature → set entitlement `status='paid'`, `paid_at`. |
| `/api/payment/redeem-waiver` | POST | `{ assessmentId, assessmentType, code, email }` → **server-side** validate against `promo_codes` (active, not expired, `used_count < max_uses`, `applies_to` includes type) → set `status='waived'`, increment `used_count`, write redemption row. |
| `/api/payment/webhook` | POST | **New (recommended).** Razorpay `payment.captured` webhook, signature-verified, as a backstop if the user closes the tab before client verify. |
| detailed-data / PDF routes | GET | Gate on entitlement `status IN ('paid','waived')`. Return 402/403 otherwise. |

All clients lazy-init (CLAUDE.md §3). Use `??` for any 0-amount logic (§4). All handlers wrapped in try/catch; never 500 on missing env (§11).

---

## 9. UI components

- **`<AssessmentSummary>`** (new, shared) — the teaser. Each results view renders this when unpaid. Content in §10.
- **`<PaymentGate>`** — consolidate `src/components/results/payment-gate.tsx` and the auto-dealer local gate into one shared component: Razorpay checkout + a **"Have a code?"** promo field that calls `/api/payment/redeem-waiver`.
- **`<GatedResults>`** — extend so the sequence is **email → payment/waiver → detailed**, centralising logic so each of the 6 results views changes minimally.
- **Detailed report view** — adds an **optional** "Email me the PDF" button (the email is *not* sent automatically). Reuses `/api/email/send-report`.
- Reuse as-is: `EmailGate`, `DownloadWithFeedback`, `generateUnifiedReportBlob`, `/api/email/send-report`.

---

## 10. Summary page content (the lure) & post-payment value

All fields below already come from existing scoring + `UnifiedReportData` (`overallScore`, `riskLevel`, `penaltyExposure`, `categoryScores`, `actionItems`, `compliantItems`).

### Free summary (creates urgency)
- **Headline score** + risk band — *"Your compliance score: 42% — High Risk"*.
- **Risk/maturity label** + one-line interpretation.
- **Category bars** — names + % per area (shows *where* they're exposed, not *how* to fix).
- **Gap counter** — *"12 gaps found — 4 critical, 5 high."*
- **Penalty exposure range (₹)** — strongest motivator; already computed.
- **Applicability summary** — which laws/sections apply to this business.
- **Locked top issues** — titles of the top 3 critical gaps with remediation **blurred/locked** behind 🔒.
- **Personalisation + trust** — *"Prepared for {Company}, {date}"*, count of government references, "based on your N answers."

### After payment / waiver (show next to the pay button to convert)
- ✅ **Full detailed report** — every gap with severity, exact legal provision/section, step-by-step remediation, deadline.
- ✅ **Prioritised action plan** (critical → low).
- ✅ **Per-issue penalty exposure.**
- ✅ **"What you're doing right"** — compliant-items list (audit evidence).
- ✅ **Downloadable branded PDF.**
- ✅ **Optional emailed copy** — sent only when they click "Email me the PDF."
- ✅ **Re-download anytime** for this assessment.

Gate pitch: *"You've seen the gaps. Unlock the fixes, citations, and your downloadable action plan — ₹___ (or enter a code)."*

---

## 11. Tester door (promo codes)

- Tester clicks **"Have a code?"** on the gate, enters a code → report unlocks for free.
- Validation is **100% server-side** (`/api/payment/redeem-waiver` against `promo_codes`). UI only reflects the server verdict; the real protection is the entitlement gate on the detailed/PDF endpoints.
- Redemption sets entitlement `status='waived'` with the code recorded (paid vs comped is distinguishable in analytics/admin).
- Codes support `expires_at` + `max_uses` ⇒ time-boxed tester codes that can't leak permanently.
- `promo_codes` is **not** anonymously readable (codes must not be enumerable).

---

## 12. Razorpay go-live checklist

- Swap test → **live** keys in Netlify (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`); complete Razorpay KYC/activation.
- Register webhook URL + secret in the Razorpay dashboard.
- Confirm GST handling: storefront price is GST-inclusive; record `gst_amount`.
- Flip auto-dealer off "Free in beta" (`auto-dealer/results/[id]/page.tsx:346`) and add `payment_status === 'paid'` check to its PDF route (currently only checks `email_verified`, `report.pdf/route.ts:781`).
- Per-assessment `live` flag flipped one at a time after QA.

---

## 13. Build sequence (one assessment at a time)

**POC first** (recommended target: POSH or Statutory Health — single-table, client-side PDF, representative of the 6):

0. **POC scope** — `assessment_entitlements` + `promo_codes` tables, `create-order` + `verify` + `redeem-waiver` endpoints, summary/detail split for ONE assessment, shared `<PaymentGate>` with promo field, optional email button. Validate the full pay + waiver path end-to-end in Razorpay test mode.

Then generalise:
1. **Config + DB** — pricing config with `live` flag; entitlement + promo tables (+ RLS).
2. **API** — create-order, rewrite verify, redeem-waiver, webhook; entitlement gate on detailed/PDF endpoints.
3. **Summary/detail data split** (§5) — the architectural core.
4. **Shared UI** — `<AssessmentSummary>`, consolidated `<PaymentGate>`, extended `<GatedResults>`, optional email button.
5. **Wire each assessment** to summary-then-gate; flip auto-dealer to live + add its paid check.
6. **Go-live** — live keys, webhook, end-to-end test (pay + waiver), flip `live` flag per assessment.

---

## 14. Open items

- **O-1 (auto-dealer pricing):** flat ₹2,999 vs keep existing 3 tiers with ₹2,999 default. *Recommend:* keep tiers internally but default/display ₹2,999 unless the tier logic still adds value; confirm during the auto-dealer step.
- **O-2 (entitlement consolidation):** migrate auto-dealer's inline `payment_status` into `assessment_entitlements`, or leave it. *Recommend:* leave for v1, unify later.
- **O-3 (email at gate vs OTP):** capture email with light validation at the gate vs full OTP (auto-dealer does OTP). *Recommend:* light capture for #1–6 (less friction); revisit if fraud/abuse appears.
- **O-4 (refunds):** define a refund/`failed` handling policy and whether admin needs a refund action.

---

*Design doc — created for phased implementation. Build one assessment at a time starting with a POC.*
