# DPDP Payment Go-Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn on live Razorpay payment for the DPDP assessment (currently free-in-beta) at its already-configured price of ₹2,499, per `docs/Fixes as on 9 July.md`'s "Confirm Razorpay + PDF delivery + Resend email work end-to-end" pre-flight item.

**Architecture:** The generic paywall infrastructure (`<PaymentGate>`, `/api/payment/create-order`, `/api/payment/verify`, `assessment_entitlements`, the `isPaymentLive()` branch in `src/app/results/[id]/page.tsx:160-171`) already exists and is live today for `statutory_health`. DPDP already has a registered PDF/summary adapter (`adaptDPDP` in `src/lib/pdf/report-registry.ts`) that the paywall's teaser (`buildSummaryData`) and full report both depend on — so this is primarily a config flip (`ASSESSMENT_PRICES.dpdp.live: false → true`) plus fixing every place that currently displays DPDP as free, so the UI doesn't contradict the real charge.

**Tech Stack:** Next.js App Router, Razorpay Checkout, Supabase, Vitest.

## Global Constraints

- Every commit must pass `npm run lint` (zero errors) and `npm run build` (zero errors) before being considered done.
- This plan makes DPDP a real, chargeable product. **The final end-to-end verification with real (or Razorpay test-mode) payment credentials must be performed by the site owner, not this agent** — this agent can verify everything up to and including automated tests and a dry run against mocked Razorpay responses, but cannot complete an actual checkout.
- Never hardcode assessment type strings — use `ASSESSMENT_TYPES.DPDP` (CLAUDE.md §9).

---

### Task 1: Flip the DPDP payment-live flag and pricing tier

**Files:**
- Modify: `src/lib/constants/assessment-types.ts:33` (`ASSESSMENT_PRICING`), `:56` (`ASSESSMENT_PRICES`)

**Interfaces:**
- Produces: `isPaymentLive(ASSESSMENT_TYPES.DPDP)` returns `true`; `isPaidAssessment(ASSESSMENT_TYPES.DPDP)` returns `true`.

- [ ] **Step 1: Flip `live: false` to `live: true` for DPDP**

In `src/lib/constants/assessment-types.ts`, change line 56:

```ts
  [ASSESSMENT_TYPES.DPDP]:                  { amountPaise: 249900, live: true },
```

- [ ] **Step 2: Mark DPDP as a paid-tier assessment**

Change line 33 (in `ASSESSMENT_PRICING`):

```ts
  [ASSESSMENT_TYPES.DPDP]: 'paid',
```

This keeps `isPaidAssessment()` (consumed by `src/lib/feature-flags/index.ts:31`) and the SEO `isFree` flag (`src/lib/seo/assessment-meta.ts:152`) truthful now that DPDP actually charges.

- [ ] **Step 3: Verify the build picks up the change with no type errors**

Run: `npm run build`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants/assessment-types.ts
git commit -m "Flip DPDP payment live at Rs 2,499"
```

---

### Task 2: Fix every UI surface that currently claims DPDP is free

**Files:**
- Modify: `src/app/page.tsx:75` (homepage assessments array — `isLive` flag)
- Modify: `src/app/assessment/dpdp/page.tsx:297-302` (`AssessmentHeader` badge)

**Interfaces:**
- Consumes: Task 1 (the flag is now `true`, but the UI must stop contradicting it independently — these are separate hardcoded strings, not derived from `isPaymentLive()`).

- [ ] **Step 1: Flip the homepage's DPDP card from "Early access — free now" to reflect the live charge**

In `src/app/page.tsx`, change the DPDP entry in the `assessments` array (line 75) from `isLive: false` to `isLive: true`:

```ts
    isLive: true,
```

This is the same field that already renders "Start — Free Summary" vs. "Start Assessment" and suppresses the "Early access — free now" badge (`src/app/page.tsx:503-504,511`) — no other homepage change is needed since that logic is already generic across all 7 assessment cards.

- [ ] **Step 2: Update the DPDP page's own header badge**

In `src/app/assessment/dpdp/page.tsx`, change the `AssessmentHeader` props (lines 297-302) from:

```tsx
      <AssessmentHeader 
        title="ComplianceCheck"
        subtitle="DPDP Gap Assessment"
        badgeText="FREE during Beta"
        badgeVariant="free"
      />
```

to:

```tsx
      <AssessmentHeader 
        title="ComplianceCheck"
        subtitle="DPDP Gap Assessment"
        badgeText="DPDP Compliance Report"
        badgeVariant="paid"
      />
```

(This matches the existing pattern on the one other live-payment assessment, `src/app/assessment/statutory-health/page.tsx:271-272`.)

- [ ] **Step 3: Verify visually**

Run `npm run dev`, open `/` and confirm the DPDP card no longer shows "Early access — free now". Open `/assessment/dpdp` and confirm the header badge reads "DPDP Compliance Report" in blue (paid styling), not green "FREE during Beta".

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/assessment/dpdp/page.tsx
git commit -m "Stop showing DPDP as free now that payment is live"
```

---

### Task 3: Verify the paywall path end-to-end with automated tests

**Files:**
- Test: `tests/unit/dpdp-payment-live.test.ts` (new)

**Interfaces:**
- Consumes: `isPaymentLive`, `getAssessmentPricePaise` from `@/lib/constants/assessment-types`; `buildSummaryData` from `@/lib/payment/summary-registry`.

- [ ] **Step 1: Write a focused unit test confirming the config + summary-adapter wiring**

Create `tests/unit/dpdp-payment-live.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ASSESSMENT_TYPES, isPaymentLive, isPaidAssessment, getAssessmentPricePaise } from '@/lib/constants/assessment-types'
import { buildSummaryData } from '@/lib/payment/summary-registry'

describe('DPDP payment go-live', () => {
  it('is flagged live at Rs 2,499', () => {
    expect(isPaymentLive(ASSESSMENT_TYPES.DPDP)).toBe(true)
    expect(isPaidAssessment(ASSESSMENT_TYPES.DPDP)).toBe(true)
    expect(getAssessmentPricePaise(ASSESSMENT_TYPES.DPDP)).toBe(249900)
  })

  it('builds a teaser summary via the registered adapter without throwing', () => {
    const summary = buildSummaryData(ASSESSMENT_TYPES.DPDP, {
      id: 'test-1',
      assessment_type: ASSESSMENT_TYPES.DPDP,
      overall_score: 42,
      category_scores: {},
      responses: { answers: {} },
      user_details: {},
    })
    expect(summary.assessmentType).toBe(ASSESSMENT_TYPES.DPDP)
    expect(summary.priceINR).toBe(2499)
  })
})
```

- [ ] **Step 2: Run it and verify it passes**

Run: `npx vitest run tests/unit/dpdp-payment-live.test.ts`
Expected: 2 passed, 0 failed.

- [ ] **Step 3: Run the full existing payment test suite to confirm no regression**

Run: `npx vitest run tests/unit/payment-verify.test.ts tests/unit/payment-summary-data.test.ts`
Expected: all pre-existing tests still pass unchanged — these tests are parametrised by `assessmentType` in their request payloads and don't hardcode which types are live, so flipping DPDP's flag should not affect them. If any test in `payment-verify.test.ts` implicitly assumed only `statutory_health` could reach the verify route, investigate and report back before proceeding — do not silently loosen that test's assertions.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/dpdp-payment-live.test.ts
git commit -m "Add automated coverage for DPDP payment go-live"
```

---

### Task 4: Manual, real-money verification (site owner only — not this agent)

**Files:** none — this is a manual runbook, not a code task.

- [ ] **Step 1: Confirm Razorpay environment variables are set for the deploy target**

`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` must be set in the production/Netlify environment (CLAUDE.md's required env var list). This agent cannot read or set these — the site owner must confirm they're present before this flag flip actually functions in production (locally, `PaymentGate`'s `isLiveMode` check will otherwise still call `/api/payment/create-order`, which will fail without real credentials).

- [ ] **Step 2: Run one real (or Razorpay test-mode) purchase against the deployed DPDP assessment**

Complete a DPDP assessment through to the results page, click through `<AssessmentSummary>` → `<PaymentGate>`, pay ₹2,499 (or the Razorpay test-mode equivalent), and confirm: (a) the Razorpay checkout modal opens with the correct amount, (b) after payment, `/api/payment/verify` returns 200 and the full `DPDPResultsView` renders (not the teaser), (c) the PDF download and any report email still work.

- [ ] **Step 3: Report back**

Once verified, the DPDP row in `ASSESSMENT_PRICES` needs no further code change — `live: true` is now the correct, confirmed-working state. If verification fails at any point, do not roll back the flag silently — report the specific failure so the root cause can be fixed (per CLAUDE.md's debugging principle of fixing root causes rather than reverting to hide a broken state).

## Self-Review Notes

- **Spec coverage:** the growth-plan's Week 1-2 item "Confirm Razorpay + PDF delivery + Resend email work end-to-end with a test purchase" is split correctly: everything code/config-side this agent can verify is in Tasks 1-3; the actual real-money confirmation is explicitly called out as a manual, non-automatable step in Task 4, not silently skipped or falsely claimed as done.
- **Placeholder scan:** none.
- **Type consistency:** `buildSummaryData`'s second argument matches the `AssessmentData` shape from `@/lib/pdf/report-data-adapter` (`id`, `assessment_type`, `overall_score`, `category_scores`, `responses`, `user_details`) as already used at the call site in `src/app/results/[id]/page.tsx:189-196`.
- **Consistency check (not in original scope, added during research):** `src/app/page.tsx`'s homepage assessment card for DPDP already shows `fullPrice: '₹2,499'` (line 74) — this was already correct before this plan; only the `isLive` flag (which drives the "Early access — free now" vs. real badge) was out of sync with the actual price shown, and Task 2 Step 1 fixes exactly that.
