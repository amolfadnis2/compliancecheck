# ComplianceCheck - New Assessment Development Framework

**Version:** 1.0 | **Updated:** December 2025

---

## Quick Reference Card

### Required Files for New Assessment

| File | Purpose |
|------|---------|
| `src/app/assessment/{type}/page.tsx` | Main assessment page |
| `src/lib/assessments/{type}-questions.ts` | Question definitions |
| `src/lib/constants/assessment-types.ts` | Add new type constant |
| `src/app/api/assessment/{type}-submit/route.ts` | API submission route |
| `src/app/sitemap.ts` | Add URL for SEO |
| `tests/{type}-assessment.spec.ts` | Playwright tests (min 5) |

---

## 1. Add Assessment Type Constant

```typescript
// src/lib/constants/assessment-types.ts
export const ASSESSMENT_TYPES = {
  STATUTORY_HEALTH: 'statutory_health',
  LABOUR_CODE: 'labour_code',
  DPDP: 'dpdp',
  STATE_WISE_COMPLIANCE: 'state_wise_compliance',
  NEW_ASSESSMENT: 'new_assessment',  // ← Add here
} as const;
```

**Also update:**
- `getAssessmentDisplayName()` function in same file
- `AssessmentType` in `src/lib/analytics/events.ts` if needed

---

## 2. Question Interface

```typescript
interface Question {
  id: string;                              // Unique, snake_case
  text: string;                            // Question text
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  category: string;                        // For grouping
  weight: number;                          // For scoring (1-5)
  complianceAnswer?: string;               // Expected compliant answer
  helpText?: string;                       // Additional guidance
  options?: string[];                      // For multiple_choice
  conditionalFilter?: (details: UserDetails) => boolean;  // Dynamic filtering
}
```

---

## 3. Company Details Form (Step 0)

**Required 7 fields - NEVER change order or validation:**

| Field | Type | Validation |
|-------|------|------------|
| Full Name | Text | 2-100 chars |
| Email | Email | Valid format |
| Phone | Tel | 10 digits, starts 6-9 |
| Company Name | Text | 2-200 chars |
| State | Select | INDIAN_STATES |
| Employee Count | Select | EMPLOYEE_COUNT_OPTIONS |
| Industry | Select | INDUSTRY_OPTIONS |

**Start Button:** `"Start Assessment (X questions)"` where X = filtered count

---

## 4. UI Standards

### Colors (WCAG 2.0 AA Compliant)

```typescript
// Use -700 shades for buttons (NOT -600!)
const PRIMARY = "bg-{theme}-700 hover:bg-{theme}-800";
const YES = "bg-green-700 hover:bg-green-800";
const NO = "bg-red-700 hover:bg-red-800";
const DISABLED = "bg-gray-300 text-gray-500";
```

### Auto-Advance

```typescript
const handleAnswer = (answer: string) => {
  setResponses(prev => ({ ...prev, [currentQuestion.id]: answer }));
  setTimeout(() => handleNext(), 800);  // 800ms delay
};
```

### Progress Bar

```tsx
<Progress 
  value={progressPercent} 
  aria-label="Assessment progress"  // REQUIRED
  className="h-2"
/>
```

---

## 5. Required PostHog Events

```typescript
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import posthog from 'posthog-js';

// 1. On assessment start (after company details)
posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_STARTED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  industry: userDetails.industry,
  employee_count: userDetails.employeeCount,
  question_count: filteredQuestions.length
});

// 2. On completion
posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_COMPLETED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  compliance_score: score,
  gap_count: gaps.length,
  time_to_complete_seconds: Math.floor((Date.now() - startTime) / 1000)
});

// 3. On PDF download
posthog.capture(ANALYTICS_EVENTS.REPORT_DOWNLOADED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  format: 'pdf',
  compliance_score: score
});

// 4. On feedback submission
posthog.capture(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  nps_score: feedback.npsScore,
  would_recommend: feedback.wouldRecommend
});

// 5. On abandonment (in useEffect cleanup)
posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_ABANDONED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  last_question_id: currentQuestion?.id,
  completion_percentage: progressPercent
});
```

---

## 6. Sitemap Update

```typescript
// src/app/sitemap.ts
{
  url: `${BASE_URL}/assessment/new-type`,
  lastModified: currentDate,
  changeFrequency: 'monthly',
  priority: 0.8,
},
```

---

## 7. Minimum Playwright Tests

```typescript
// tests/new-assessment.spec.ts
import { test, expect } from '@playwright/test';
import { fillCompanyDetails } from './utils/form-helpers';
import { COMPANY_PROFILES } from './fixtures/company-profiles';

test.describe('New Assessment', () => {
  // TEST 1: Page loads
  test('loads assessment page correctly', async ({ page }) => {
    await page.goto('/assessment/new-type');
    await expect(page).toHaveTitle(/New Assessment/);
    await expect(page.getByRole('heading')).toContainText('New Assessment');
  });

  // TEST 2: Form validation
  test('validates company details form', async ({ page }) => {
    await page.goto('/assessment/new-type');
    await page.click('button:has-text("Start Assessment")');
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  // TEST 3: Full flow
  test('completes full assessment flow', async ({ page }) => {
    await page.goto('/assessment/new-type');
    await fillCompanyDetails(page, COMPANY_PROFILES.MID_IT);
    await page.click('button:has-text("Start Assessment")');
    // Answer all questions...
    await expect(page).toHaveURL(/\/results\//);
  });

  // TEST 4: PDF download
  test('generates PDF report', async ({ page }) => {
    // Complete assessment first, then:
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download")'),
    ]);
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  // TEST 5: Accessibility
  test('passes accessibility scan', async ({ page }) => {
    const AxeBuilder = require('@axe-core/playwright').default;
    await page.goto('/assessment/new-type');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

## 8. PDF Unicode Cleaning

```typescript
function cleanText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")    // Smart quotes
    .replace(/[\u201C\u201D]/g, '"')    // Smart double quotes
    .replace(/\u2013/g, '-')            // En dash
    .replace(/\u2014/g, '--')           // Em dash
    .replace(/\u2022/g, '*')            // Bullet
    .replace(/\u00A0/g, ' ')            // Non-breaking space
    .replace(/\u00B7/g, '*');           // Middle dot
}
```

---

## 9. Deployment Checklist

### Code Quality
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No console.log in production

### Testing
- [ ] All 5+ Playwright tests pass
- [ ] Accessibility tests pass
- [ ] Mobile responsive verified

### Database
- [ ] Assessment type in constants
- [ ] API route works with valid/invalid data

### Analytics
- [ ] 5 PostHog events implemented
- [ ] Events verified in dashboard

### SEO
- [ ] Added to sitemap.ts
- [ ] Metadata export configured

### Final
- [ ] Netlify preview works
- [ ] PDF generates correctly

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `ASSESSMENT_BASELINE_STANDARD.md` | Detailed UI patterns |
| `NEW_ASSESSMENT_CHECKLIST.md` | Step-by-step checklist |
| `TESTING_BEST_PRACTICES.md` | Testing guidelines |
| `ComplianceCheck_Configuration_Reference.md` | Config reference |

---

*For detailed implementation, see the full Word document: `ComplianceCheck_Assessment_Framework_v1.docx`*
