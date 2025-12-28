---
name: assessment-developer
description: "Technical development guide for building new ComplianceCheck assessments. Use when: (1) Creating a new assessment module (ESI, ZED, GST, etc.), (2) Adding questions to existing assessments, (3) Implementing scoring algorithms, (4) Setting up PostHog analytics for assessments, (5) Writing Playwright tests for assessments, (6) Generating PDF reports, (7) Updating sitemap/SEO. This skill ensures code consistency, prevents regression bugs, and maintains quality across all assessment modules."
---

# Assessment Developer Skill

Technical patterns and requirements for building ComplianceCheck assessments. Use this skill to create new assessments that follow established patterns and don't break existing code.

## Quick Start Checklist

When creating a new assessment, you MUST:

1. Add type to `src/lib/constants/assessment-types.ts`
2. Create `src/app/assessment/{type}/page.tsx`
3. Create `src/lib/assessments/{type}-questions.ts`
4. Create `src/app/api/assessment/{type}-submit/route.ts`
5. Update `src/app/sitemap.ts`
6. Write minimum 5 Playwright tests
7. Implement 6 PostHog events

---

## 1. Assessment Type Registration

```typescript
// src/lib/constants/assessment-types.ts
export const ASSESSMENT_TYPES = {
  STATUTORY_HEALTH: 'statutory_health',
  LABOUR_CODE: 'labour_code',
  DPDP: 'dpdp',
  STATE_WISE_COMPLIANCE: 'state_wise_compliance',
  NEW_ASSESSMENT: 'new_assessment',  // ← Add here
} as const;

// Also update getAssessmentDisplayName()
export function getAssessmentDisplayName(type: AssessmentType): string {
  const displayNames: Record<AssessmentType, string> = {
    // ... existing ...
    [ASSESSMENT_TYPES.NEW_ASSESSMENT]: 'New Assessment Name',
  };
  return displayNames[type] || type;
}
```

---

## 2. Question Interface (Mandatory)

Every question MUST implement this interface:

```typescript
interface Question {
  id: string;              // Unique, snake_case (e.g., 'epf_registration')
  text: string;            // Question text displayed to user
  type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  category: string;        // For grouping and scoring
  weight: number;          // 1-10, higher = more important
  complianceAnswer?: string;  // Expected compliant answer
  helpText?: string;       // Tooltip/guidance text
  options?: string[];      // For multiple_choice only
  conditionalFilter?: (details: UserDetails) => boolean;  // Dynamic filtering
}
```

### Filtering Example

```typescript
{
  id: 'canteen_facility',
  text: 'Do you have a canteen facility?',
  type: 'yes_no',
  category: 'Welfare',
  weight: 5,
  complianceAnswer: 'yes',
  conditionalFilter: (details) => {
    const count = parseInt(details.employeeCount.split('-')[0]) || 0;
    return count >= 100;  // Only show for 100+ employees
  }
}
```

---

## 3. Company Details Form (Step 0)

ALWAYS collect these 7 fields with this exact validation:

| Field | Type | Validation | Import From |
|-------|------|------------|-------------|
| Full Name | Text | 2-100 chars | - |
| Email | Email | Valid format | - |
| Phone | Tel | 10 digits, starts 6-9 | - |
| Company Name | Text | 2-200 chars | - |
| State | Select | - | `INDIAN_STATES` |
| Employee Count | Select | - | `EMPLOYEE_COUNT_OPTIONS` |
| Industry | Select | - | `INDUSTRY_OPTIONS` |

```typescript
import { INDIAN_STATES, EMPLOYEE_COUNT_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants';

const userDetailsSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  companyName: z.string().min(2).max(200),
  state: z.string().min(1),
  employeeCount: z.string().min(1),
  industry: z.string().min(1),
});
```

---

## 4. Auto-Advance Pattern

For yes_no and multiple_choice questions, use 800ms auto-advance:

```typescript
const handleAnswer = (answer: string) => {
  setResponses(prev => ({ ...prev, [currentQuestion.id]: answer }));
  
  // Auto-advance after 800ms
  setTimeout(() => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }, 800);
};
```

---

## 5. UI Color Standards (WCAG 2.0 AA)

**CRITICAL:** Use `-700` shades for buttons, NOT `-600`:

```typescript
// Primary action
className="bg-{theme}-700 hover:bg-{theme}-800 text-white"

// Yes button (selected)
className="bg-green-700 hover:bg-green-800 text-white"

// No button (selected)  
className="bg-red-700 hover:bg-red-800 text-white"

// Disabled
className="bg-gray-300 text-gray-500 cursor-not-allowed"
```

### Progress Bar

```tsx
<Progress 
  value={progressPercent} 
  aria-label="Assessment progress"  // REQUIRED for accessibility
  className="h-2"
/>
<span className="text-sm text-gray-500">
  {currentQuestionIndex + 1} of {filteredQuestions.length}
</span>
```

---

## 6. PostHog Analytics (Required Events)

Every assessment MUST track these 6 events:

```typescript
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import posthog from 'posthog-js';

// 1. Assessment started (after Step 0)
posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_STARTED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  industry: userDetails.industry,
  employee_count: userDetails.employeeCount,
  question_count: filteredQuestions.length,
  user_tier: 'free'
});

// 2. Assessment completed
posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_COMPLETED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  compliance_score: score,
  gap_count: actionItems.length,
  high_priority_gaps: actionItems.filter(a => a.priority === 'high').length,
  time_to_complete_seconds: Math.floor((Date.now() - startTime) / 1000),
  questions_answered: Object.keys(responses).length,
  questions_skipped: 0
});

// 3. Report downloaded
posthog.capture(ANALYTICS_EVENTS.REPORT_DOWNLOADED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  format: 'pdf',
  compliance_score: score,
  user_tier: 'free'
});

// 4. Feedback submitted
posthog.capture(ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  nps_score: feedback.npsScore,
  would_recommend: feedback.wouldRecommend,
  has_comments: !!feedback.comments
});

// 5. Assessment abandoned (in useEffect cleanup or beforeunload)
posthog.capture(ANALYTICS_EVENTS.ASSESSMENT_ABANDONED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  completion_percentage: Math.round((currentQuestionIndex / filteredQuestions.length) * 100),
  last_question_id: currentQuestion?.id,
  time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
});

// 6. Report viewed (on results page load)
posthog.capture(ANALYTICS_EVENTS.REPORT_VIEWED, {
  assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
  compliance_score: score,
  assessment_id: assessmentId
});
```

---

## 7. Scoring Algorithm

Standard scoring pattern:

```typescript
const calculateScore = () => {
  let totalWeight = 0;
  let earnedWeight = 0;

  filteredQuestions.forEach(q => {
    if (!q.complianceAnswer) return;  // Skip informational questions
    
    totalWeight += q.weight;
    const answer = responses[q.id];
    
    if (answer === q.complianceAnswer) {
      earnedWeight += q.weight;
    }
  });

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
};

// Status thresholds
const getStatus = (score: number) => {
  if (score >= 90) return 'Compliant';
  if (score >= 70) return 'Needs Attention';
  return 'Non-Compliant';
};
```

---

## 8. PDF Generation (jsPDF)

### Unicode Cleaning (CRITICAL)

jsPDF doesn't support Unicode. Clean ALL text:

```typescript
function cleanText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")    // Smart quotes
    .replace(/[\u201C\u201D]/g, '"')    // Smart double quotes
    .replace(/\u2013/g, '-')            // En dash
    .replace(/\u2014/g, '--')           // Em dash
    .replace(/\u2022/g, '*')            // Bullet
    .replace(/\u00A0/g, ' ')            // Non-breaking space
    .replace(/\u20B9/g, 'Rs.')          // Rupee symbol
    .replace(/[^\x00-\x7F]/g, '');      // Remove any remaining non-ASCII
}
```

### Required PDF Sections

1. Header with ComplianceCheck branding
2. Assessment date and company details
3. Overall compliance score (large, prominent)
4. Category-wise breakdown table
5. Gap analysis with severity levels
6. Prioritized action items
7. Government references and legal citations
8. Disclaimer and footer

---

## 9. Sitemap Update

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

## 10. Playwright Tests (Minimum 5)

Create `tests/new-assessment.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { fillCompanyDetails } from './utils/form-helpers';
import { COMPANY_PROFILES } from './fixtures/company-profiles';

test.describe('New Assessment', () => {
  const BASE_URL = 'https://compliancecheck-app.netlify.app';

  // TEST 1: Page loads
  test('loads assessment page', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment/new-type`);
    await expect(page).toHaveTitle(/New Assessment/);
    await expect(page.getByRole('heading')).toContainText('New Assessment');
  });

  // TEST 2: Form validation
  test('validates company details', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment/new-type`);
    const startBtn = page.getByRole('button', { name: /start assessment/i });
    await startBtn.click();
    await expect(page.getByText(/required|invalid/i)).toBeVisible();
  });

  // TEST 3: Full flow
  test('completes full assessment', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment/new-type`);
    await fillCompanyDetails(page, COMPANY_PROFILES.MID_IT);
    await page.click('button:has-text("Start Assessment")');
    
    // Answer questions (auto-advance)
    while (await page.getByRole('button', { name: /^yes$/i }).isVisible().catch(() => false)) {
      await page.click('button:has-text("Yes")');
      await page.waitForTimeout(1000);
    }
    
    await expect(page).toHaveURL(/\/results\//);
  });

  // TEST 4: PDF download
  test('generates PDF', async ({ page }) => {
    // After completing assessment...
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  // TEST 5: Accessibility
  test('passes accessibility scan', async ({ page }) => {
    const AxeBuilder = require('@axe-core/playwright').default;
    await page.goto(`${BASE_URL}/assessment/new-type`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

## 11. API Route Template

```typescript
// src/app/api/assessment/new-type-submit/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userDetails, responses } = body;

    // Validate input
    if (!userDetails || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create or get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        email: userDetails.email,
        full_name: userDetails.fullName,
        phone: userDetails.phone,
      }, { onConflict: 'email' })
      .select()
      .single();

    if (userError) throw userError;

    // Save assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        assessment_type: ASSESSMENT_TYPES.NEW_ASSESSMENT,
        status: 'completed',
        responses,
        overall_score: body.score,
        category_scores: body.categoryScores,
        action_items: body.actionItems,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}
```

---

## Deployment Checklist

Before deploying a new assessment:

### Code Quality
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No console.log in production code
- [ ] All imports use `@/` alias paths

### Testing
- [ ] All 5+ Playwright tests pass
- [ ] Accessibility tests pass (axe-core)
- [ ] Mobile responsive verified
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

### Database
- [ ] Assessment type in constants
- [ ] API route handles valid/invalid data
- [ ] RLS policies allow anonymous submissions

### Analytics
- [ ] All 6 PostHog events implemented
- [ ] Events verified in PostHog dashboard

### SEO
- [ ] Added to sitemap.ts
- [ ] Metadata export configured in page.tsx
- [ ] Homepage card added (if applicable)

### Final
- [ ] Netlify preview deployment works
- [ ] PDF generates correctly with no Unicode errors
- [ ] NPS feedback modal triggers on download

---

## Related Skills

| Skill | Purpose |
|-------|---------|
| `assessment-qa-validator` | Validate legal accuracy, penalties, thresholds |
| `indian-compliance-expert` | Domain knowledge for compliance questions |
| `compliancecheck-developer` | General platform development patterns |

---

## Reference Documents

| Document | Location |
|----------|----------|
| Full Framework (Word) | `ComplianceCheck_Assessment_Framework_v1.docx` |
| Quick Reference | `ASSESSMENT_FRAMEWORK.md` |
| Baseline Standard | `ASSESSMENT_BASELINE_STANDARD.md` |
| Checklist | `NEW_ASSESSMENT_CHECKLIST.md` |
| Testing Guide | `TESTING_BEST_PRACTICES.md` |
