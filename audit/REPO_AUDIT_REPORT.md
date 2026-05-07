# ComplianceCheck Repository Audit Report

**Date:** 2026-05-07  
**Branch:** `master` @ `57fce7ec`  
**Scope:** Phase 1 — Discovery only, no source changes  
**Auditor:** Claude Code (claude-sonnet-4-6)

---

## Table of Contents

1. [Cleanup Targets](#1-cleanup-targets)
2. [Architectural Duplication](#2-architectural-duplication)
3. [Type Drift](#3-type-drift)
4. [UI/UX Inconsistency Matrix](#4-uiux-inconsistency-matrix)
5. [Supabase Persistence Audit](#5-supabase-persistence-audit)
6. [PostHog Observability Audit](#6-posthog-observability-audit)
7. [Common-Component Extraction Candidates](#7-common-component-extraction-candidates)
8. [Stability Risks](#8-stability-risks)
9. [Branch Hygiene](#9-branch-hygiene)
10. [Prioritized Fix Plan](#10-prioritized-fix-plan)

---

## 1. Cleanup Targets

### 1.1 Backup Files

All backup files are safe to delete — no source file references them (verified via `grep`).

| File | Size | Safe to Delete |
|------|------|----------------|
| `posh-assessment-complete-example.tsx.bak` | 11 KB | Yes — content superseded by `src/app/assessment/posh/page.tsx` |
| `posh-category-breakdown-component.tsx.bak` | 2.3 KB | Yes — no references |
| `posh-category-breakdown-utils.ts.bak` | 1.5 KB | Yes — no references |
| `tailwind.config.ts.backup` | 1.7 KB | Yes — active config is `tailwind.config.ts` |
| `src/app/globals.css.backup` | unknown | Yes — no references |
| `src/app/layout.tsx.backup` | unknown | Yes — no references |
| `src/app/page.tsx.backup` | unknown | Yes — no references |
| `src/app/page.tsx.old-backup` | unknown | Yes — no references |

**Deletion plan:** `git rm` all 8 files in a single commit.

---

### 1.2 Root Helper Scripts

One-time migration/fix scripts that have served their purpose. Propose moving to `scripts/legacy/` (not deleting, in case history is needed for reference).

| File | Original Purpose | Disposition |
|------|-----------------|-------------|
| `complete-dpdp-file.bat` | DPDP file completion helper | → `scripts/legacy/` |
| `copy-dpdp-tests.bat` | Copy DPDP test files | → `scripts/legacy/` |
| `fix-rupee.bat` | Fix Rupee symbol encoding | → `scripts/legacy/` (Rupee now handled via `₹`) |
| `run-posh-fix.bat` | Run POSH ESLint fix | → `scripts/legacy/` |
| `verify-landing-build.bat` | Verify landing page build | → `scripts/legacy/` |
| `COPY-ALL-DOCS.ps1` | Copy all docs | → `scripts/legacy/` |
| `fix-posh-eslint.ps1` | Fix POSH ESLint issues | → `scripts/legacy/` |
| `fix-rupee-symbols.ps1` | Fix Rupee symbols in PS | → `scripts/legacy/` |
| `check-dpdp-questions.py` | Validate DPDP question file | → `scripts/legacy/` |
| `fix_forward_reference.py` | Fix forward references | → `scripts/legacy/` |
| `analyze-dpdp.js` | Analyze DPDP structure | → `scripts/legacy/` |
| `find-missing-compliance.js` | Find missing compliance items | → `scripts/legacy/` |
| `fix-forward-ref.js` | Fix React forward refs | → `scripts/legacy/` |
| `tsconfig_hex.txt` | Hex-encoded tsconfig (debugging artifact) | Delete — no value |
| `verify-database.sql` | DB verification script | → `scripts/legacy/` |

**Keep:** `setup-tests.bat`, `scripts/setup-posthog-dashboard.ts`

---

### 1.3 Markdown Clutter at Root

25+ `.md` files at root. The **authoritative** ones to keep at root:

| File | Status |
|------|--------|
| `README.md` | **Keep** |
| `QUICKSTART.md` | **Keep** |
| `ASSESSMENT_BASELINE_STANDARD.md` | **Keep** |
| `ASSESSMENT_FRAMEWORK.md` | **Keep** |
| `NEW_ASSESSMENT_CHECKLIST.md` | **Keep** |
| `TESTING_BEST_PRACTICES.md` | **Keep** |

Move to `docs/archive/` (session notes / one-time fix logs / historical):

| File | Reason for archival |
|------|---------------------|
| `ACCESSIBILITY_FIXES.md` | Fix applied, historical |
| `ACCESSIBILITY_FIXES_APPLIED.md` | Fix applied, historical |
| `ACCESSIBILITY_FIX_LOCATIONS.md` | Fix applied, historical |
| `AUTO_ADVANCE_FIX.md` | Fix applied, historical |
| `BRANDING_UPDATE_SUMMARY.md` | Historical summary |
| `CTC in hand calculator.md` | Planning doc, feature shipped |
| `CTC_CALCULATOR_STATUS.md` | Status note, feature shipped |
| `DOCS_INDEX.md` | Meta-doc, low value |
| `DOCUMENTATION_COMPLETE.md` | Milestone marker |
| `DPDP-CORRECTIONS-2025-12-02.md` | Historical correction log |
| `DPDP-Legal-Review-Report.md` | Archive — review done |
| `FINAL_TEST_FIXES.md` | Historical |
| `HOW-TO-GET-ALL-DOCS.md` | Internal process note |
| `IMPLEMENTATION_SUMMARY.md` | Historical |
| `LABOUR_CODE_TESTING_SUMMARY.md` | Historical |
| `LANDING_PAGE_CONVERSION_COMPLETE.md` | Historical |
| `LINKS_FIXED.md` | Historical |
| `POSH_BACK_NAVIGATION_COMPLETE.md` | Historical |
| `POSH_IMPLEMENTATION_GUIDE.md` | Move to `docs/` (still useful reference) |
| `POSH_PDF_INTEGRATION.md` | Historical |
| `POSH_PROGRESS_FINAL_IMPLEMENTATION.md` | Historical |
| `POSH_PROGRESS_IMPLEMENTATION_COMPLETE.md` | Historical |
| `POSTHOG_SETUP.md` | Archive — setup done |
| `TESTING_SUMMARY.md` | Historical |
| `TEST_UPDATES_SUMMARY.md` | Historical |

Also consider: `ALL-36-DOCS/`, `Key-Documents-Complete/`, `code-review/` directories are entirely historical reference folders. Move to `docs/archive/`.

---

## 2. Architectural Duplication

### 2.1 Submit Endpoints

**Current structure:**
```
src/app/api/assessment/
├── submit/             POST — generic (Zod-validated). CALLERS: NONE FOUND
├── create/             POST — Razorpay order + assessments insert. CALLERS: NONE FOUND
├── [id]/               GET + PATCH — read/update from assessments table. CALLERS: results/[id]/page.tsx
├── [id]/pdf/           GET — react-pdf (old approach). CALLERS: appears unused post-migration
├── auto-dealer/        Multi-phase. INTENTIONALLY SEPARATE.
│   ├── applicability/  POST — save Phase 1 responses
│   ├── start/          POST — create assessment record + send OTP
│   ├── submit/         PATCH — save phase results  
│   ├── pay/            POST — Razorpay order
│   └── [id]/report.pdf GET — generate PDF
├── dpdp-submit/        POST — called by /assessment/dpdp
├── food-business-submit/ POST — called by /assessment/food-business
├── free-submit/        POST — CALLERS: NONE FOUND (legacy name)
├── labour-code-submit/ POST — called by /assessment/labour-code
├── posh-submit/        POST — called by /assessment/posh (twice!)
├── state-wise-submit/  POST — called by /assessment/state-wise-compliance
└── statutory-health-submit/ POST — called by /assessment/statutory-health
```

**Findings:**
- `submit/route.ts` — generic endpoint with Zod validation, only accepts 3 types (`statutory_health`, `labour_code`, `dpdp`). **No callers found** in any page or component. Likely dead code.
- `create/route.ts` — creates Razorpay order. **No callers found** in any page. Possibly dead code from an early POSH payment prototype (POSH now uses `auto-dealer/pay` pattern or direct embed).
- `free-submit/route.ts` — generic free submit. **No callers found**. Dead code.
- `[id]/pdf/route.tsx` — uses `react-pdf/renderer` + `report-template.tsx` (the old PDF approach). No clear caller found; superseded by client-side jsPDF in `unified-report-generator.ts`.

**Three endpoints called from POSH:** `posh-submit` is called twice (line 472 in a fire-and-forget for auto-save, and line 784 for final submission). This is intentional but fragile — same endpoint does double duty.

**Consolidation plan:**
- Retire `submit/`, `create/`, `free-submit/` (no callers, confirmed dead)
- Retire `[id]/pdf/` endpoint (superseded by client-side jsPDF)
- Create `POST /api/assessment/submit` with `assessment_type` discriminator routing to a `persistAssessment()` helper
- Keep all auto-dealer endpoints separate (multi-phase architecture is intentional)
- POSH: fix the double-call pattern — use the final call only, with an explicit auto-save endpoint if needed

---

### 2.2 PDF Generators

**Current state:**

| File | Lines | Used By | Status |
|------|-------|---------|--------|
| `report-generator.ts` | ~250 | **NOTHING** (no imports found) | Dead code |
| `unified-report-generator.ts` | ~400 | `download-buttons.tsx`, `posh/page.tsx` | Active — the successor |
| `posh-report-generator.ts` | ~300 | **NOTHING** (only self-referential comment) | Dead code |
| `report-template.tsx` | ~? | `[id]/pdf/route.tsx` only | Dead (if route retired) |
| `report-data-adapter.ts` | ~200 | `download-buttons.tsx`, `posh/page.tsx` | Active — adapts data for unified generator |
| `report-configs.ts` | ~? | `report-data-adapter.ts` | Active — supporting file |

**Assessment → Generator mapping:**

| Assessment | PDF Entry Point |
|------------|----------------|
| Statutory Health | `download-buttons.tsx` → `unified-report-generator` via `adaptStatutoryHealth()` |
| Labour Code | `download-buttons.tsx` → `unified-report-generator` via `adaptLabourCode()` |
| DPDP | `download-buttons.tsx` → `unified-report-generator` via `adaptDPDP()` |
| State-Wise | `download-buttons.tsx` → `unified-report-generator` via `adaptStateWise()` |
| Food Business | `download-buttons.tsx` → `unified-report-generator` via `adaptFoodBusiness()` |
| POSH | `posh/page.tsx` → `unified-report-generator` via `adaptPOSHResult()` (inline) |
| Auto Dealer | `auto-dealer/[id]/report.pdf/route.ts` → raw jsPDF (server-side) |

**Consolidation plan:**
- Delete `report-generator.ts` (no callers)
- Delete `posh-report-generator.ts` (no callers)
- Retire `[id]/pdf/route.tsx` + `report-template.tsx` (react-pdf approach abandoned)
- Auto-dealer's server-side jsPDF can stay (different use case — server-rendered)
- The `report-data-adapter.ts` + `unified-report-generator.ts` + `report-configs.ts` triad becomes the canonical PDF stack

---

### 2.3 Results Components

**Current state:**

| Component | Imported By | Status |
|-----------|-------------|--------|
| `download-buttons.tsx` | `local-storage-results.tsx`, `download-with-feedback.tsx` | Active |
| `download-buttons-with-feedback.tsx` | **NOTHING** | Dead code |
| `download-with-feedback.tsx` | `results/[id]/page.tsx` | Active |
| `gated-results.tsx` | `results/[id]/page.tsx` | Active |
| `local-storage-results.tsx` | `results/[id]/page.tsx`, `results/demo/page.tsx` | Active |
| `payment-gate.tsx` | `assessment/posh/page.tsx` | Active (POSH only) |

**Findings:**
- `download-buttons-with-feedback.tsx` — **100% dead code**. Has raw `posthog.capture` calls with string literals; is not imported anywhere. Delete it.
- `download-buttons.tsx` — the base component, used transitively. Contains raw `posthog.capture` string literals that should use `ANALYTICS_EVENTS` constants.
- The 5 active components serve different result rendering contexts (localStorage vs Supabase, gated vs open, with/without feedback). Consolidation is feasible but needs care.

**Consolidation plan:**
- Delete `download-buttons-with-feedback.tsx` (dead code)
- Keep `download-buttons.tsx` as base
- Goal state: one `<ResultsCard>` + one `<DownloadButtons>` per `ASSESSMENT_BASELINE_STANDARD.md`

---

### 2.4 Constants Duplication

**Two competing constant sets:**

| Location | Contains | Used By |
|----------|----------|---------|
| `src/lib/constants.ts` (legacy flat) | `RUPEE`, `ASSESSMENT_TYPES` (only 3), `INDIAN_STATES`, `EMPLOYEE_COUNT_OPTIONS` (7), `INDUSTRY_OPTIONS` (11), `PRICING` | 9 files |
| `src/lib/constants/india.ts` (current) | `INDIAN_STATES`, `EMPLOYEE_COUNT_OPTIONS` (7), `INDUSTRY_OPTIONS` (16!), `REVENUE_OPTIONS`, `PT_EXEMPT_STATES` | re-exported from `constants/index.ts` |
| `src/lib/constants/assessment-types.ts` (current) | `ASSESSMENT_TYPES` (6 types), `ASSESSMENT_PRICING`, helpers | all assessment pages |

**Inconsistency:** The legacy file has 11 `INDUSTRY_OPTIONS`; the current file has 16. Assessment pages importing from the legacy file may show a narrower industry list than intended.

**Files still importing from legacy flat `@/lib/constants`:**
```
src/app/assessment/dpdp/page.tsx:33
src/app/assessment/labour-code/page.tsx:26
src/app/assessment/statutory-health/page.tsx:20
src/app/calculators/compliance-penalty-calculator/components/InputForm.tsx:14
src/app/calculator/ctc/page.tsx:23
src/app/calculator/gratuity/page.tsx:16
src/lib/calculators/ctc-calculator.ts:13
src/lib/calculators/gratuity-calculator.ts:12
src/lib/assessments/statutory-health-questions.ts:257 (re-exports from it!)
```

**Migration plan:**
1. Move `RUPEE` constant into `src/lib/constants/india.ts`
2. Remove duplicate `ASSESSMENT_TYPES` and `PRICING` from `src/lib/constants.ts`
3. Update all 9 imports to use `@/lib/constants/india` (for `INDIAN_STATES`, `EMPLOYEE_COUNT_OPTIONS`, `INDUSTRY_OPTIONS`, `RUPEE`) and `@/lib/constants/assessment-types` (for `ASSESSMENT_TYPES`)
4. Delete `src/lib/constants.ts`

---

## 3. Type Drift

### 3.1 The Discrepancy

`src/lib/constants/assessment-types.ts` defines 6 types:
```typescript
STATUTORY_HEALTH | LABOUR_CODE | DPDP | STATE_WISE_COMPLIANCE | FOOD_BUSINESS | POSH
```

`src/lib/analytics/events.ts` extends with a local workaround:
```typescript
export type AssessmentType = BaseAssessmentType | 'auto_dealer' | 'code_on_wages' | 'social_security' | 'osh_code' | 'industrial_relations';
```

### 3.2 Resolution

**`auto_dealer`** — This is a real, live assessment. It must be added to the canonical `ASSESSMENT_TYPES` and `ASSESSMENT_PRICING` maps in `assessment-types.ts`. Also needs `getAssessmentDisplayName()` entry.

**`code_on_wages`, `social_security`, `osh_code`, `industrial_relations`** — These are the 4 Labour Codes that the Labour Code assessment covers (Code on Wages, Social Security Code, OSH Code, Industrial Relations Code). They appear to be sub-categories of `LABOUR_CODE` that were once considered separate assessment types. They are **not live assessments** — no `src/app/assessment/` page exists for any of them, and no DB migration creates them. **Recommend removing** them from the `AssessmentType` union and documenting them as internal categories within the Labour Code assessment if needed.

### 3.3 Changes Required

In `src/lib/constants/assessment-types.ts`:
```typescript
// Add:
AUTO_DEALER: 'auto_dealer',

// Add to ASSESSMENT_PRICING:
[ASSESSMENT_TYPES.AUTO_DEALER]: 'paid',

// Add to getAssessmentDisplayName:
[ASSESSMENT_TYPES.AUTO_DEALER]: 'Auto Dealer Compliance Assessment',
```

In `src/lib/analytics/events.ts`:
```typescript
// Change from:
export type AssessmentType = BaseAssessmentType | 'auto_dealer' | 'code_on_wages' | 'social_security' | 'osh_code' | 'industrial_relations';
// Change to:
export type AssessmentType = BaseAssessmentType;  // auto_dealer now in BaseAssessmentType
```

---

## 4. UI/UX Inconsistency Matrix

Standard per `ASSESSMENT_BASELINE_STANDARD.md`.

| Axis | Standard | statutory-health | labour-code | dpdp | state-wise | posh | food-business | auto-dealer |
|------|----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Yes button class** | `bg-green-700 hover:bg-green-800` | ✅ | ✅ | ✅ | ✅ `bg-green-700` | ✅ | ⚠️ `variant='default'` only | N/A multi-choice |
| **No button class** | `bg-red-700 hover:bg-red-800` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ `variant='default'` only | N/A |
| **Auto-advance delay** | 800ms | ✅ | ✅ (no explicit setTimeout — uses handleResponse flow) | ✅ 800ms | ✅ 800ms | ✅ 800ms | ✅ 800ms | ❌ 600ms |
| **Progress bar height** | `h-3` | ✅ `h-3` | ✅ `h-3` | ✅ `h-3` | ✅ `h-3` | ✅ `h-3` (main), ⚠️ `h-2` (applicability) | ❌ `h-2` (applicability), `h-3` (main) | N/A |
| **Progress bar aria-label** | required | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| **Progress bar fill** | `[&>div]:bg-green-600` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| **Yes icon** | `CheckCircle` | ✅ CheckCircle | ❌ CheckCircle**2** | ✅ CheckCircle | ❌ CheckCircle**2** | ✅ CheckCircle | ✅ CheckCircle | ✅ |
| **No icon** | `XCircle` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **INDIAN_STATES from `@/lib/constants`** | folder import | ❌ flat import | ❌ flat import | ❌ flat import | ✅ | ✅ | ✅ (not needed) | ✅ |
| **Uses `<AssessmentHeader>`** | yes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Uses `<FeedbackForm>` directly** | yes | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Uses `<EmailGate>` from identity** | yes | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ (OTP) |
| **PDF generator** | `unified-report-generator` | ✅ (via download-buttons) | ✅ (via download-buttons) | ✅ (via download-buttons) | ✅ (via download-buttons) | ✅ (inline import) | ✅ (via download-buttons) | ❌ server-side jsPDF (intentional) |

**Key deviations to fix in Phase 2:**
1. **Food-business** Yes/No buttons use Shadcn `variant='default'/'outline'` without explicit color classes → deviates from green/red standard
2. **Labour-code** and **state-wise** import `CheckCircle2` instead of `CheckCircle`
3. **Food-business** uses `h-2` for applicability progress bar
4. **DPDP, labour-code, statutory-health** import from legacy flat `@/lib/constants`
5. **No assessment** uses `<FeedbackForm>` directly — it's only accessible via the results page (`/results/[id]`), not inline after assessment. This is a gap vs `ASSESSMENT_BASELINE_STANDARD.md`.
6. **Only POSH and Auto-dealer** use `<EmailGate>` — other 5 assessments collect email in Step 0 form but don't gate results behind email verification.
7. **Auto-dealer** legitimately diverges on multi-phase structure, server-side PDF, OTP flow — this is intentional architecture.

---

## 5. Supabase Persistence Audit

### 5.1 Flow Coverage

| Flow | Submit Endpoint | Target Table | RLS INSERT Policy | Fallback on Supabase Fail |
|------|----------------|--------------|-------------------|--------------------------|
| Statutory Health | `statutory-health-submit` | `assessments` + `users` + `companies` | `Allow anonymous assessment inserts` (001) | Returns 500 error |
| Labour Code | `labour-code-submit` | `assessments` + `users` + `companies` | `Allow anonymous assessment inserts` (001) | Returns 500 error |
| DPDP | `dpdp-submit` | `assessments` + `users` | `Allow anonymous assessment inserts` (001) | Returns 500 error |
| State-Wise | `state-wise-submit` | `assessments` | `Allow anonymous assessment inserts` (001) | Returns `local_${timestamp}` ID |
| Food Business | `food-business-submit` | `assessments` + `users` | `Allow anonymous assessment inserts` (001) | Returns 500 error |
| POSH | `posh-submit` | `posh_assessments` | `Anyone can insert posh assessments` (20260504) | No fallback — throws on null supabase |
| Auto Dealer | `auto-dealer/start` + `auto-dealer/submit` + `auto-dealer/pay` | `auto_dealer_assessments` + `otp_attempts` | Anonymous INSERT (20260501) | Returns 500 error |
| CTC Calculator | `calculator/ctc-submit` | `assessments` (type=`ctc_calculator`) | `Allow anonymous assessment inserts` (001) | localStorage only |
| Gratuity Calculator | `calculator/gratuity-submit` | `assessments` (type=`gratuity_calculator`) | `Allow anonymous assessment inserts` (001) | localStorage only |
| **Penalty Exposure Calculator** | `calculators/penalty-report` | **NONE** | N/A | **No DB write at all — email only** |
| NPS Feedback | `feedback` | `feedback` | `Allow anonymous feedback inserts` (001) | Returns 500 error |
| Identity OTP request | `auth/otp/request` | `otp_attempts` | Anonymous INSERT (20260501) | Returns 500 error |
| Identity OTP verify | `auth/otp/verify` | `otp_attempts` (update) | — | Returns 500 error |
| Email Gate | n/a (client-side) | none | n/a | n/a |
| `/me/export` | `me/export` | reads `assessments` | Users view own | Returns 500 error |
| `/me/delete` | `me/delete` | deletes `users` + sends email | Users can update own | Returns 500 error |

### 5.2 Findings

**P0: Penalty Exposure Calculator has NO Supabase persistence.**  
`src/app/api/calculators/penalty-report/route.ts` sends an email via Resend but writes nothing to any database table. All other calculators write to `assessments`. This means zero analytics, zero admin visibility, and no audit trail for penalty exposure reports.

**P1: POSH writes to a separate `posh_assessments` table.**  
Reason documented in migration `20260504000000_create_posh_assessments_table.sql`: the generic `assessments` table CHECK constraint blocked `posh_compliance` as an assessment_type, and POSH has extra columns (applicability_responses, full_name, phone). Options:
- **Recommend keeping separate** for now — POSH schema genuinely differs (two-phase applicability + compliance, phone, full_name). Folding into `assessments` would require adding 8+ nullable columns to that table or restructuring JSONB storage. Accept the separation and document it.
- Future: consolidate if a v2 `assessments` schema uses `JSONB responses` as the canonical pattern.

**P1: `state-wise-submit` falls back to `local_${timestamp}` ID** (line 30 of route) when Supabase is unconfigured. This is the correct pattern but makes it inconsistent with other routes that return 500. Standardize the fallback behavior.

**P2: POSH double-submission** — `posh/page.tsx` calls `posh-submit` at line 472 (fire-and-forget draft save) and again at line 784 (final submission). The draft save has no error handling (`fetch()` with no `.catch()`). If the first call fails silently, the state is unclear.

**Schema coverage note:** `food_business` and `state_wise_compliance` are written to the generic `assessments` table using TEXT for `assessment_type` (no constraint). They do **not** appear in the `006_add_calculator_types.sql` migration, which only adds `ctc_calculator` and `gratuity_calculator`. This means the `assessments` table currently accepts any string for `assessment_type` — the CHECK constraint from `001_initial_schema.sql` was for a different set and has been relaxed or dropped over time.

---

## 6. PostHog Observability Audit

### 6.1 Event Coverage by Assessment

| Assessment | `assessment_started` | `assessment_progress` | `assessment_completed` | `assessment_abandoned` | `report_viewed` | `report_downloaded` | `feedback_submitted` |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Statutory Health | ✅ (hook) | ✅ (hook, milestones) | ✅ (hook) | ✅ (hook, unload) | ❌ | ✅ (download-buttons.tsx) | ❌ (via results page only) |
| Labour Code | ✅ (hook) | ✅ (hook) | ✅ (hook) | ✅ (hook) | ❌ | ✅ (download-buttons.tsx) | ❌ |
| DPDP | ✅ (hook) | ✅ (hook) | ✅ (hook) | ✅ (hook) | ❌ | ✅ (download-buttons.tsx) | ❌ |
| State-Wise | ✅ (hook) | ✅ (hook) | ✅ (hook) | ✅ (hook) | ❌ | ✅ (download-buttons.tsx) | ❌ |
| Food Business | ✅ (hook) | ✅ (hook) | ✅ (hook) | ✅ (hook) | ❌ | ✅ (download-buttons.tsx) | ❌ |
| POSH | ✅ (raw posthog.capture) | ✅ (raw) | ✅ (raw) | ⚠️ partial | ❌ | ✅ (`analytics.reportDownloaded`) | ✅ (inline feedback) |
| Auto Dealer | ✅ (raw, phase-aware) | ✅ (raw) | ✅ (raw) | ❌ | ❌ | ✅ (`analytics.reportDownloaded`) | ❌ |
| CTC Calculator | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gratuity Calculator | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Penalty Exposure | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 6.2 String Literal Events (Should Use ANALYTICS_EVENTS Constants)

All of these bypass the type system and could silently diverge from the canonical event name:

| File | Line | String Literal | Should Be |
|------|------|---------------|-----------|
| `feedback-form.tsx` | 27 | `'feedback_submitted'` | `ANALYTICS_EVENTS.FEEDBACK_SUBMITTED` |
| `download-buttons-with-feedback.tsx` | 274 | `'report_downloaded'` | `ANALYTICS_EVENTS.REPORT_DOWNLOADED` |
| `download-buttons-with-feedback.tsx` | 40 | `'download_report_clicked'` | Add to `ANALYTICS_EVENTS` or remove |
| `download-buttons-with-feedback.tsx` | 62 | `'feedback_skipped'` | Add to `ANALYTICS_EVENTS` or remove |
| `download-buttons-with-feedback.tsx` | 283 | `'report_download_failed'` | Add to `ANALYTICS_EVENTS` or remove |
| `identity/EmailGate.tsx` | 145 | `'email_edit_attempted'` | Add to `ANALYTICS_EVENTS` |
| `posh/page.tsx` | 273 | Raw `posthog.capture(event, {...})` | Use `analytics.*` functions |
| `auto-dealer/page.tsx` | 78 | Raw `posthog.capture(event, {...})` | Use `analytics.*` functions |
| `auto-dealer/phase/[n]/page.tsx` | 76 | Raw `posthog.capture(event, {...})` | Use `analytics.*` functions |
| `auto-dealer/results/[id]/page.tsx` | 425 | Raw `posthog.capture(event, {...})` | Use `analytics.*` functions |

### 6.3 Platform-Wide Events — Coverage

| Event | Implementation Status |
|-------|----------------------|
| `user_signed_up` | ❌ Not found — auth pages don't call `trackUserSignedUp` |
| `user_logged_in` | ❌ Not found — auth pages don't call `trackUserLoggedIn` |
| `organization_created` | ❌ Not found |
| `pricing_page_viewed` | ❌ Not found in pricing page |
| `checkout_started` | ❌ Not found — payment pages don't call `trackCheckoutStarted` |
| `feature_gate_hit` | ❌ Not found — payment-gate.tsx doesn't fire this |
| `$pageview` | ✅ Fired by PostHog provider on route change |

### 6.4 Identity Layer Events

The `EmailGate` component only tracks `email_edit_attempted`. Missing:
- OTP requested (no tracking in `auth/otp/request/route.ts`)
- OTP verified (no tracking in `auth/otp/verify/route.ts`)
- Email gate completed (no tracking when user passes the gate)

### 6.5 Property Completeness

The `useAssessmentTracking` hook populates `assessment_type`, `organization_industry`, `organization_size`, `question_count` on start, and `compliance_score`, `gap_count`, `time_to_complete_seconds` on completion. This is correct for the 5 assessments using the hook.

POSH and auto-dealer use raw `posthog.capture` with `assessment_type: 'posh'` or `'auto_dealer'` hardcoded. They include custom properties but don't follow the typed schema (`AssessmentCompletedProps` etc.).

---

## 7. Common-Component Extraction Candidates

**Current shared assessment components:**
```
src/components/assessment/
├── assessment-header.tsx     ← used by all 7 assessments ✅
├── auto-save.tsx             ← appears unused (no imports found)
└── posh-progress-section.tsx ← POSH-only; should be in assessment/posh/ not shared
```

**Inline copies that should be extracted:**

| Component | Inline In | Lines (approx.) | Priority |
|-----------|-----------|-----------------|----------|
| `<CompanyDetailsForm>` (Step 0) | All 6 non-auto-dealer assessment pages | ~60–120 lines each | P1 |
| `<QuestionCard>` (Yes/No card) | All 7 assessment pages | ~30–50 lines each | P1 |
| `<ProgressIndicator>` | All 7 assessment pages | ~5–10 lines each | P2 |
| `<ResultsCard>` | `local-storage-results.tsx` + per-assessment inline | Large | P1 |
| `<NPSFeedbackModal>` | `download-with-feedback.tsx` + `posh/page.tsx` | ~30–50 lines | P2 |

**`<CompanyDetailsForm>` field order per baseline (7 fields):**
Each assessment page inlines a Step 0 form. Current implementations vary:
- Statutory Health: fullName, email, phone, companyName, state, employeeCount, industry
- Labour Code: similar but with additional fields
- DPDP: organizationName, contactName, contactEmail, phone, state, employeeCount, industry
- POSH: fullName, email, phone, companyName, state, employeeCount (no industry)

**Extraction migration order** (simplest → most complex):
1. `statutory-health` (596 lines, simplest structure)
2. `state-wise-compliance` (735 lines)
3. `labour-code` (733 lines)
4. `dpdp` (775 lines)
5. `food-business` (880 lines, two-phase applicability)
6. `posh` (1,794 lines, most complex)
7. `auto-dealer` (359 + 775 lines, intentionally different architecture)

**Note:** `auto-save.tsx` has no imports found — likely dead code. Should be deleted.
**Note:** `posh-progress-section.tsx` should move to `src/app/assessment/posh/components/` since it's POSH-specific.

---

## 8. Stability Risks

### 8.1 Module-Level Service Initializations

**Good pattern (lazy-init):** Most API routes correctly use a module-level `let _client = null` + getter function. Examples: `posh-submit`, all `auto-dealer/*`, `auth/otp/*`.

**Bad pattern (module-level init):** Found in:

| File | Issue |
|------|-------|
| `src/app/api/assessment/create/route.ts:6-7` | `const supabaseUrl = process.env...` and `const supabaseKey = process.env...` captured at module load — if env vars are absent during build, this is fine (just `undefined`), but the subsequent `createClient(supabaseUrl, supabaseKey)` inside the handler will fail at runtime rather than build time. Low risk but inconsistent. |
| `src/app/api/assessment/[id]/pdf/route.tsx:12-13` | Same pattern — `supabaseUrl` and `supabaseServiceKey` captured at module level. |

All `Resend` and `Razorpay` instantiations correctly use lazy-init patterns — no module-level violations for external service clients.

### 8.2 `||` Where `??` Is Correct

Score values of `0` are semantically valid (0% compliant) but `||` will treat them as falsy and fall back to the default.

**Confirmed problematic instances:**

| File | Line | Code | Impact |
|------|------|------|--------|
| `download-with-feedback.tsx` | 37 | `data.overall_score \|\| data.overallScore \|\| 0` | If score is legitimately 0, falls back to 0 (same result, but conceptually wrong) |
| `download-buttons.tsx` | 515, 678, 692 | `data.overall_score \|\| complianceScore \|\| 0` | Could mask a real 0 score |
| `local-storage-results.tsx` | 673 | `assessment.overall_score \|\| 50` | **Most dangerous** — a 0% score is replaced with 50%! This shows wrong score in UI. |
| `results/[id]/page.tsx` | 147, 737 | `assessment.overall_score \|\| calculateScore(...)` | Recalculates when score is 0 — masks potential storage bug |
| `email/send-report/route.ts` | 440, 452 | `score \|\| 0` | Fine (0 \|\| 0 = 0) |

**`local-storage-results.tsx:673` is a P0 bug** — a business with 0% compliance will see 50% in their results.

### 8.3 Unicode Hazards in jsPDF

Both `unified-report-generator.ts` and `posh-report-generator.ts` have a `cleanText()` function that correctly handles:
- `₹` → `Rs.`
- Em-dash `—` → `--`
- Smart quotes → straight quotes
- Non-ASCII catchall strip

**No unicode hazards found in active PDF generators.**

Note: `report-generator.ts` (dead code) uses `RUPEE_SYMBOL = '₹'` inline without a `cleanText()` function — but since it's dead code, no risk.

### 8.4 Missing try/catch Around External API Calls

| File | Missing Protection |
|------|-------------------|
| `posh/page.tsx:472` | `fetch('/api/assessment/posh-submit', ...)` — fire-and-forget with NO `.catch()`. If the draft save fails, the error is silently swallowed. |
| `download-buttons.tsx` | PDF generation uses `try/catch` — OK. |
| Most submit routes | Wrapped in try/catch — OK. |

### 8.5 Tables With No RLS Policy

The `users` table had no INSERT policy in `001_initial_schema.sql` — fixed by `005_fix_insert_policies.sql`. The `companies` table had a broken policy (required `auth.uid()` for anonymous) — also fixed by `005`.

Current coverage appears complete for the tables that receive writes. The `events` table (created in `20260429000000_phase1_identity_foundation.sql`) — need to verify its RLS policy.

### 8.6 ESLint

`eslint` binary not available in the environment (node_modules not installed). Config in `.eslintrc.json` extends `next/core-web-vitals` + `next/typescript`. Custom rule: unused variables with `^_` prefix are exempt.

Known patterns that may generate warnings:
- `// eslint-disable-next-line @typescript-eslint/no-explicit-any` in lazy-init getter functions (`posh-submit`, all `auto-dealer/*`)
- `let _supabase: any = null` — `any` type used for lazy-init clients

### 8.7 Unused Exports

Without `npx ts-prune` (no node_modules), identified dead exports via import analysis:
- `report-generator.ts` — entire file is dead
- `posh-report-generator.ts` — entire file is dead
- `download-buttons-with-feedback.tsx` — entire component is dead
- `auto-save.tsx` — no callers found
- `src/app/api/assessment/submit/route.ts` — no callers
- `src/app/api/assessment/create/route.ts` — no callers
- `src/app/api/assessment/free-submit/route.ts` — no callers
- `src/app/api/assessment/[id]/pdf/route.tsx` — no clear callers post-migration

---

## 9. Branch Hygiene

**Remote branches found:**
```
origin/claude/audit-compliancecheck-repo-2GEKV  ← current audit branch
origin/master
```

The repository is **very clean** — only 2 remote branches. All previous `claude/*` and `fix/*` branches visible in the prompt appear to have already been deleted after their PRs merged. No action needed.

---

## 10. Prioritized Fix Plan

### P0 — Security / Data Loss / Launch Blocker

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| P0-1 | `local-storage-results.tsx:673` — `overall_score \|\| 50` corrupts score display for 0% compliant businesses | `src/components/results/local-storage-results.tsx` | S |
| P0-2 | Penalty Exposure Calculator writes nothing to Supabase — zero admin visibility, no audit trail | `src/app/api/calculators/penalty-report/route.ts` | S |
| P0-3 | POSH fire-and-forget draft save at `posh/page.tsx:472` has no `.catch()` — silent failures | `src/app/assessment/posh/page.tsx` | S |

### P1 — UX or Consistency Violation Against Baseline

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| P1-1 | Add `AUTO_DEALER` to `ASSESSMENT_TYPES`, `ASSESSMENT_PRICING`, `getAssessmentDisplayName` | `src/lib/constants/assessment-types.ts`, `src/lib/analytics/events.ts` | S |
| P1-2 | Food-business Yes/No buttons use `variant='default'` without explicit green/red color classes | `src/app/assessment/food-business/page.tsx` | S |
| P1-3 | Labour-code and state-wise use `CheckCircle2` instead of `CheckCircle` | `src/app/assessment/labour-code/page.tsx`, `src/app/assessment/state-wise-compliance/page.tsx` | S |
| P1-4 | Food-business applicability progress bar uses `h-2` instead of `h-3` | `src/app/assessment/food-business/page.tsx` | S |
| P1-5 | POSH applicability progress uses `h-2` instead of `h-3` | `src/app/assessment/posh/page.tsx` | S |
| P1-6 | 5 assessments missing `<EmailGate>` — email collected in form but results not gated | All assessment pages except POSH + auto-dealer | L |
| P1-7 | No assessment has inline `<FeedbackForm>` — feedback only accessible via `/results/[id]` | All assessment pages | M |
| P1-8 | `score \|\| 0` anti-pattern in `download-buttons.tsx`, `download-with-feedback.tsx`, `results/[id]/page.tsx` | Multiple | S |
| P1-9 | 3 assessments import `INDIAN_STATES` from legacy flat `@/lib/constants` (only 11 industries, not 16) | `dpdp/page.tsx`, `labour-code/page.tsx`, `statutory-health/page.tsx` | S |
| P1-10 | User signup/login/checkout/pricing events never fired — platform funnel is blind | Auth pages, payment pages, pricing page | M |
| P1-11 | CTC and Gratuity calculators have zero PostHog tracking | Calculator pages + routes | M |
| P1-12 | Penalty Exposure calculator has zero PostHog tracking | Penalty calculator | S |

### P2 — Dead Code / Cleanup / Docs

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| P2-1 | Delete 8 `.bak`/`.backup` files | Root + `src/app/` | S |
| P2-2 | Delete dead PDF generators: `report-generator.ts`, `posh-report-generator.ts` | `src/lib/pdf/` | S |
| P2-3 | Delete dead results component: `download-buttons-with-feedback.tsx` | `src/components/results/` | S |
| P2-4 | Delete dead auto-save component: `auto-save.tsx` | `src/components/assessment/` | S |
| P2-5 | Delete dead API routes: `submit/`, `create/`, `free-submit/`, `[id]/pdf/` | `src/app/api/assessment/` | M |
| P2-6 | Move root helper scripts to `scripts/legacy/` | Root | S |
| P2-7 | Move 19 stale `.md` files to `docs/archive/` | Root | S |
| P2-8 | Migrate 9 legacy `@/lib/constants` imports to folder imports, delete `constants.ts` | Multiple | S |
| P2-9 | Remove `code_on_wages \| social_security \| osh_code \| industrial_relations` from `AssessmentType` union | `src/lib/analytics/events.ts` | S |
| P2-10 | Move `posh-progress-section.tsx` from shared components to `src/app/assessment/posh/components/` | `src/components/assessment/` | S |
| P2-11 | Replace all string-literal `posthog.capture` calls with `ANALYTICS_EVENTS` constants | `feedback-form.tsx`, `download-buttons.tsx`, `posh/page.tsx`, auto-dealer pages | M |
| P2-12 | Extract `<CompanyDetailsForm>` shared component, migrate one assessment at a time | All assessment pages | L |
| P2-13 | Extract `<QuestionCard>` shared component | All assessment pages | L |
| P2-14 | Consolidate all per-assessment submit endpoints into single `POST /api/assessment/submit` | All submit routes | L |
| P2-15 | Create `CLAUDE.md` with constitution rules | Root | S |
| P2-16 | Delete `ALL-36-DOCS/`, `Key-Documents-Complete/`, `code-review/` or move to `docs/archive/` | Root | S |

---

## Summary of Key Numbers

| Category | Count |
|----------|-------|
| Files to delete (bak/backup) | 8 |
| Root scripts to move | 15 |
| Root .md files to archive | 19 |
| Dead API routes | 4 |
| Dead PDF generator files | 2 + 1 (report-template) |
| Dead results components | 1 |
| Dead shared components | 1 |
| Legacy constants imports to migrate | 9 |
| Raw `posthog.capture` calls to fix | 10+ |
| Assessment pages missing EmailGate | 5 |
| P0 issues | 3 |
| P1 issues | 12 |
| P2 issues | 16 |

---

**STOP — Phase 1 complete. Awaiting approval before beginning Phase 2.**
