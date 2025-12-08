# Pre-Tester Code Review & Test Gap Analysis

**Date:** December 7, 2025  
**Reviewer:** Claude (Code Review)  
**Scope:** Complete codebase review against test coverage

---

## Executive Summary

The proposed quick tests cover **~40% of critical user flows**. While they test the Statutory Health assessment adequately, they miss Labour Code, DPDP, and Document Generator features that are **live and FREE on the homepage**.

### Verdict: ⚠️ **Expand Test Coverage Before Testers**

---

## Current Test Coverage Analysis

### What the Quick Tests Cover ✅

| Test Suite | Coverage | Time |
|------------|----------|------|
| `statutory-health-assessment` | 6 tests | ~30s |
| `accessibility-performance` | 6 tests | ~30s |

**Total Quick Tests: 12 tests (~1 min)**

### What's Actually Live on Homepage

| Feature | Status | Has Tests? | Included in Quick Run? |
|---------|--------|------------|------------------------|
| Statutory Health Check | ✅ FREE | ✅ 6 tests | ✅ YES |
| Labour Code Readiness | ✅ FREE | ✅ 12 tests | ❌ NO |
| DPDP Gap Assessment | ✅ FREE (NEW) | ✅ 25+ tests | ❌ NO |
| Employee Consent Form | ✅ FREE | ❌ 0 tests | ❌ NO |
| Results Page | ✅ Used by all | ❌ 0 dedicated | ❌ NO |
| PDF Download | ✅ Core feature | ⚠️ Partial | ⚠️ NPS only |
| Homepage | ✅ Entry point | ⚠️ Basic | ✅ YES |

---

## Gap Analysis by Feature

### 1. Labour Code Assessment (⚠️ HIGH RISK)

**Status:** Live, FREE, "MOST POPULAR" badge  
**Tests exist:** Yes (`labour-code-assessment.spec.ts`)  
**Included in quick run:** NO

**Risk:** Users will test this - it's prominently featured. If broken, bad first impression.

```
Tests available but not in quick run:
- Navigation to assessment
- IT company flow (~18 questions)
- Manufacturing company flow (~28 questions)  
- Four Labour Code categories display
- Dynamic filtering by industry/size
- Progress indicator
- NPS modal
- Mobile viewport
- Database persistence
```

### 2. DPDP Gap Assessment (⚠️ HIGH RISK)

**Status:** Live, FREE, "NEW" badge  
**Tests exist:** Yes (`dpdp-assessment.spec.ts` - 1163 lines)  
**Included in quick run:** NO

**Risk:** Newest feature, most complex (45 questions, 6 phases). If broken, damages credibility.

```
Tests available but not in quick run:
- Complete assessment flow
- Partial compliance scoring
- Children's data conditional questions
- SDF designation risk
- Phase navigation
- Maturity level calculations
- Action items generation
- PDF download with NPS
```

### 3. Employee Consent Form (🔴 NO TESTS)

**Status:** Live, FREE, linked from homepage  
**Tests exist:** NO  
**Risk:** If form breaks, users can't generate documents.

**Missing tests needed:**
- Form loads correctly
- Step 1: Company details validation
- Step 2: Data categories selection
- Step 3: Grievance officer validation
- PDF generation
- Download functionality

### 4. Results Page (⚠️ GAPS)

**Status:** Core feature, all assessments redirect here  
**Tests exist:** Covered indirectly via assessment tests  
**Dedicated tests:** NO

**Missing tests:**
- Results load for each assessment type
- Score display accuracy
- Category breakdown display
- Action items display
- PDF download button works
- "Back to Home" navigation

### 5. API Endpoints (✅ Partially Covered)

| Endpoint | Tested? | Notes |
|----------|---------|-------|
| `/api/assessment/free-submit` | ✅ | Statutory only |
| `/api/assessment/labour-code-submit` | ❌ | Not tested |
| `/api/assessment/dpdp-submit` | ❌ | Not tested |
| `/api/feedback` | ✅ | Covered |
| `/api/documents/employee-consent` | ❌ | Not tested |
| `/api/email/send-report` | ❌ | Not tested |

---

## Recommended Test Strategy

### Option A: Quick Pre-Tester Run (5-7 min)
Add Labour Code and DPDP navigation tests:

```bash
# Core tests (5 tests each × 3 assessments = ~5 min)
npx playwright test statutory-health-assessment --project=chromium
npx playwright test labour-code-assessment --grep "navigate|complete" --project=chromium
npx playwright test dpdp-assessment --grep "complete.*compliant" --project=chromium

# Accessibility (30s)
npx playwright test accessibility-performance --project=chromium
```

### Option B: Comprehensive Pre-Tester Run (15-20 min)
Full coverage across all browsers:

```bash
npx playwright test --project=chromium
```

### Option C: Minimum Viable Testing (3 min)
If time-constrained, at least verify all features load:

```bash
# Create new test: all-features-smoke.spec.ts
npx playwright test all-features-smoke --project=chromium
```

---

## Critical Missing Test: All Features Smoke Test

I recommend adding this before testers arrive:

```typescript
// tests/all-features-smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('All Features Smoke Test', () => {
  test('homepage loads with all product cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/statutory health/i)).toBeVisible();
    await expect(page.getByText(/labour code/i)).toBeVisible();
    await expect(page.getByText(/dpdp/i)).toBeVisible();
    await expect(page.getByText(/employee consent/i)).toBeVisible();
  });

  test('statutory health assessment loads', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    await expect(page.getByText(/statutory health check/i)).toBeVisible();
  });

  test('labour code assessment loads', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    await expect(page.getByText(/labour code/i).first()).toBeVisible();
  });

  test('dpdp assessment loads', async ({ page }) => {
    await page.goto('/assessment/dpdp');
    await expect(page.getByText(/dpdp/i).first()).toBeVisible();
  });

  test('employee consent form loads', async ({ page }) => {
    await page.goto('/documents/employee-consent');
    await expect(page.getByText(/employee.*consent/i).first()).toBeVisible();
  });

  test('privacy policy loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/privacy policy/i)).toBeVisible();
  });

  test('terms of service loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText(/terms/i)).toBeVisible();
  });
});
```

---

## Summary: What to Run Before Testers

### Minimum (Must Do):
```bash
npx playwright test statutory-health-assessment --project=chromium
npx playwright test accessibility-performance --project=chromium
```

### Recommended (Should Do):
```bash
npx playwright test statutory-health-assessment labour-code-assessment accessibility-performance --project=chromium
```

### Ideal (Best Coverage):
```bash
npx playwright test --project=chromium
```

---

## Test File Inventory

| File | Tests | Lines | Status |
|------|-------|-------|--------|
| `statutory-health-assessment.spec.ts` | 6 | 116 | ✅ Ready |
| `labour-code-assessment.spec.ts` | 12 | 499 | ✅ Ready |
| `labour-code-filtering.spec.ts` | 5 | ~200 | ✅ Ready |
| `dpdp-assessment.spec.ts` | 25+ | 1163 | ✅ Ready |
| `accessibility-performance.spec.ts` | 6 | 83 | ✅ Ready |
| `api-integration.spec.ts` | 4 | 102 | ✅ Ready |
| `all-features-smoke.spec.ts` | 0 | N/A | ❌ MISSING |
| `employee-consent.spec.ts` | 0 | N/A | ❌ MISSING |

---

**Recommendation:** Before engaging testers, run at minimum:

```bash
npx playwright test statutory-health-assessment labour-code-assessment accessibility-performance api-integration --project=chromium
```

This covers the 3 main assessments + accessibility + API (~5 minutes).
