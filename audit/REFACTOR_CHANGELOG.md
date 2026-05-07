# ComplianceCheck Refactor Changelog
*Branch: `claude/audit-compliancecheck-repo-2GEKV` — PR #32*
*Completed: 2026-05-07*

---

## Phase 1 — Discovery (commit `7ca313e6`)

Created `audit/REPO_AUDIT_REPORT.md`: 633-line audit covering 10 areas,
identifying 3 P0 bugs, 12 P1 issues, and 16 P2 issues. Key findings:

- `overall_score || 50` in local-storage-results was a data-corruption bug
  (a 0% compliant business would display as 50% compliant)
- `src/lib/constants.ts` (legacy flat file) was diverging from the canonical
  folder-based constants — 9 files still imported from the old path
- `auto_dealer` was missing from `ASSESSMENT_TYPES` canonical set
- Labour Code sub-types (`code_on_wages` etc.) were phantom types in
  `analytics/events.ts` with no live event backing them
- 3 dead submit API routes, 4 dead PDF generators, 2 dead components, and
  7 dead root-level dev scripts cluttered the repo

---

## Step 1 — CLAUDE.md constitution (commit `b7e626ee`)

Created `CLAUDE.md` with 16 non-negotiable rules encoding lessons from
production incidents. Key rules added:

- Branch is `master`, not `main`
- Lazy-init service clients (Supabase, Resend, Razorpay) — never module-level
- `??` not `||` for score arithmetic (0 is a valid compliance score)
- jsPDF ASCII-only — always run through `cleanText()` before `doc.text()`
- JSX apostrophes → `&apos;`
- `ASSESSMENT_TYPES` as single source of truth; never hardcode type strings
- `analytics.*` typed wrappers, never raw `posthog.capture`
- Assessment page baseline standard (7-field Step 0, Shadcn Select, 800ms auto-advance)

---

## Step 2 — P0 bug fixes (commits `269c68c3`, `eeee3191`)

### `||` → `??` score arithmetic fixes

| File | Line | Bug | Fix |
|------|------|-----|-----|
| `local-storage-results.tsx` | 673 | `assessment.overall_score \|\| 50` | `?? 0` |
| `results/[id]/page.tsx` | 147, 737 | `\|\| calculateScore()` | `?? calculateScore()` |
| `download-buttons.tsx` | 2 instances | `\|\| complianceScore \|\| 0` | `?? complianceScore ?? 0` |
| `download-with-feedback.tsx` | 1 instance | `\|\| data.overallScore \|\| 0` | `?? data.overallScore ?? 0` |

### Penalty calculator Supabase persistence added

`api/calculators/penalty-report/route.ts`: added best-effort non-blocking
Supabase write after successful email send. Uses `assessments` table with
`assessment_type = 'penalty_exposure'`. Also fixed pre-existing `null`
type error in `getResendClient()` return.

Also passed `input` and `summary` from the penalty calculator `EmailGate`
component to the API route so the DB record has meaningful data.

**CI failure and fix:** initial implementation used `ReturnType<typeof createClient>`
which fails TypeScript because Supabase's `createClient` generic resolves
differently without explicit type params. Fixed by using `any` pattern
(consistent with every other lazy-init client in the codebase).

---

## Step 3 — Type drift and constants consolidation (commit `907298a3`)

### `src/lib/constants/assessment-types.ts`
- Added `AUTO_DEALER: 'auto_dealer'` (was missing from canonical set despite
  the assessment being live)
- Added corresponding `ASSESSMENT_PRICING` and `getAssessmentDisplayName` entries

### `src/lib/analytics/events.ts`
- Simplified `AssessmentType` to re-use `BaseAssessmentType` directly
- Removed phantom Labour Code sub-types (`code_on_wages`, `social_security`,
  `osh_code`, `industrial_relations`) — never had live events

### `src/lib/constants/india.ts`
- Added `RUPEE` constant and `formatPrice()` function (moved from legacy flat file)

### `src/lib/constants/index.ts`
- Added `export * from './assessment-types'` for single entry-point import

### Legacy flat file migration
Migrated 9 files from `@/lib/constants` → `@/lib/constants/india` or
`@/lib/constants/assessment-types`:

```
src/app/assessment/dpdp/page.tsx
src/app/assessment/labour-code/page.tsx
src/app/assessment/statutory-health/page.tsx
src/app/calculators/compliance-penalty-calculator/components/InputForm.tsx
src/app/calculator/ctc/page.tsx
src/app/calculator/gratuity/page.tsx
src/lib/calculators/ctc-calculator.ts
src/lib/calculators/gratuity-calculator.ts
src/lib/assessments/statutory-health-questions.ts
```

Deleted `src/lib/constants.ts` (legacy flat file, 92 lines — superseded).

---

## Step 4 — CompanyDetailsForm shared component (commit `e322c834`)

Created `src/components/assessment/company-details-form.tsx`:
- Standard 7-field form: `fullName → email → phone → companyName → state →
  employeeCount → industry` per CLAUDE.md assessment standard
- Self-contained with react-hook-form + zod validation
- Shadcn `<Select>` for all three dropdown fields
- Exports `CompanyDetails` type and `companyDetailsSchema` for consumers
- Optional `onValuesChange` prop for real-time value observation (e.g. live
  question previews)

Applied to `statutory-health/page.tsx`:
- Removed ~80 lines of inline form JSX and schema/useForm boilerplate
- Upgraded native `<select>` to Shadcn Select consistently with the rest of app
- Uses `key` prop to correctly re-mount when progress is restored from localStorage

**Deferred with documented reasons:**

| Assessment | Reason deferred |
|---|---|
| `labour-code` | External "Start Assessment" button pattern with live question count preview requires form state visibility the component cannot expose cleanly |
| `dpdp` | 7 base fields + 4 DPDP-specific fields in one step; splitting would change UX |
| `food-business` | 4-field schema only; adding missing 3 fields would be a visible UX change requiring approval |
| `state-wise` | 4-field schema with `phoneNumber` (not `phone`); different field set |
| `posh` / `auto-dealer` | Excluded per CLAUDE.md rules 13 & 14 |

---

## Step 5 — Dead submit API routes deleted (commit `9bf42da5`)

Deleted 3 routes confirmed dead in CLAUDE.md dead code section (no callers):

| Route | Lines | Reason |
|-------|-------|--------|
| `api/assessment/submit/route.ts` | 202 | Superseded, no callers |
| `api/assessment/create/route.ts` | 121 | Superseded, no callers |
| `api/assessment/free-submit/route.ts` | 251 | Superseded, no callers |

**Total removed: 574 lines**

Full consolidation of the 6 live submit endpoints into a single discriminated
route was deferred: each handler has a different request shape, DB table
(`assessments` vs `posh_assessments`), and business logic. Merging without
local build verification was assessed as too high risk.

---

## Step 6 — Dead PDF generators deleted (commit `82d25054`)

Deleted 4 files confirmed dead in CLAUDE.md dead code section:

| File | Lines | Reason |
|------|-------|--------|
| `src/lib/pdf/report-generator.ts` | 350 | No callers |
| `src/lib/pdf/posh-report-generator.ts` | 770 | No callers (only in its own JSDoc) |
| `src/lib/pdf/report-template.tsx` | 342 | Only called by the dead API route below |
| `src/app/api/assessment/[id]/pdf/route.tsx` | 230 | react-pdf approach abandoned |

**Total removed: 1,692 lines**

Active PDF generation flows through `unified-report-generator.ts` →
`report-data-adapter.ts`. Active callers: `download-buttons.tsx` (client-side)
and `posh/page.tsx` (server-side blob generation).

---

## Step 7 — Dead results and assessment components deleted (commit `0fd57d89`)

| File | Lines | Reason |
|------|-------|--------|
| `components/results/download-buttons-with-feedback.tsx` | ~400 | Superseded by `download-with-feedback.tsx` (5 live call sites) |
| `components/assessment/auto-save.tsx` | ~207 | `useAutoSave`, `SaveStatusIndicator`, `ResumeBanner` — all unused |

**Total removed: 607 lines**

---

## Step 8 — PostHog standardised through analytics wrapper (commit `4db3ff49`)

All raw `posthog.capture`/`identify`/`reset` calls outside of auto-dealer
and the PostHog provider infrastructure are now gone.

| File | Change |
|------|--------|
| `feedback-form.tsx` | `posthog.capture('feedback_submitted')` → `analytics.trackEvent(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED)` |
| `EmailGate.tsx` | `posthog.capture('email_edit_attempted')` → `analytics.trackEvent(...)` |
| `posthog-provider.tsx` | `posthog.identify`/`posthog.reset` → `identifyUser`/`resetUser` wrappers; manual `__loaded` guards removed |
| `posh/page.tsx` | Local raw-posthog `trackEvent` replaced with `analytics.trackEvent`; direct `posthog-js` import removed |
| `tracking.ts` | Added `[key: string]: unknown` index signature to `UserProperties` to support custom assessment-specific person properties |

Auto-dealer analytics left as-is per CLAUDE.md rule 14.

---

## Step 9 — Dead files deleted, stale docs archived (commit `dd14dd29`)

**Deleted:**
- `posh-assessment-complete-example.tsx.bak`
- `posh-category-breakdown-component.tsx.bak`
- `posh-category-breakdown-utils.ts.bak`
- `analyze-dpdp.js` (one-off analysis script)
- `find-missing-compliance.js` (one-off analysis script)
- `fix-forward-ref.js` (one-off fix script)
- `scripts/setup-posthog-dashboard.ts` (dev setup utility)

**Archived to `docs/archive/`** (22 session-log `.md` files):
Accessibility fix notes, branding update summaries, CTC status,
DPDP corrections, POSH progress/implementation notes, testing summaries,
links-fixed logs — all historical snapshots that rot as the codebase evolves.

**Root `.md` files retained (10 live reference docs):**
`CLAUDE.md`, `README.md`, `QUICKSTART.md`, `ASSESSMENT_BASELINE_STANDARD.md`,
`ASSESSMENT_FRAMEWORK.md`, `NEW_ASSESSMENT_CHECKLIST.md`,
`DPDP-Legal-Review-Report.md`, `POSH_IMPLEMENTATION_GUIDE.md`,
`POSTHOG_SETUP.md`, `TESTING_BEST_PRACTICES.md`

---

## Step 10 — Playwright suite (skipped)

Playwright is configured to target `https://compliancecheck.co.in`
(production) with no local `webServer` defined. Running against production
would test the live site, not this branch's changes. `node_modules` was also
not installed in the execution environment.

**Recommended action:** Configure `webServer` in `playwright.config.ts` to
spin up a local Next.js dev server, or run the suite against the Netlify
preview deploy URL for this PR.

---

## Summary — Lines Changed

| Category | Removed | Added |
|----------|---------|-------|
| P0 bug fixes (`||` → `??`) | — | — |
| Legacy `constants.ts` deleted | 92 | — |
| Dead submit API routes | 574 | — |
| Dead PDF generators + route | 1,692 | — |
| Dead results/assessment components | 607 | — |
| Dead `.bak` files + root scripts | ~300 | — |
| Stale session-log `.md` files (archived) | 1,072 | — |
| `CompanyDetailsForm` component | 115 (inline JSX) | 162 (component) |
| **Net reduction** | **~4,200 lines** | |

---

## Known Gaps (follow-up work)

| Gap | Why deferred | Suggested action |
|-----|-------------|-----------------|
| `CompanyDetailsForm` not applied to `labour-code`, `dpdp`, `food-business`, `state-wise` | Different field sets or UX patterns | Address one assessment at a time with UX sign-off on field additions |
| Submit endpoint consolidation | 6 handlers with different shapes and DB tables | Plan a unified request schema first, then migrate one handler at a time |
| `food-business` and `state-wise` missing 3 standard fields | Would change UX | Confirm with product owner; add `state`/`employeeCount`/`industry` if approved |
| Playwright suite needs local server target | No `webServer` in config | Add `webServer: { command: 'npm run dev', port: 3000 }` to `playwright.config.ts` |
| `CheckCircle2` used in `labour-code` (non-standard icon) | Out of scope for this session | Replace with `CheckCircle` per CLAUDE.md rule |
