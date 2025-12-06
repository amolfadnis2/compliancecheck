# ComplianceCheck - Assessment Development Baseline Standard

**Version:** 1.0  
**Purpose:** Standard template and requirements for building new assessments  
**Last Updated:** December 4, 2025

---

## 🎯 Assessment Design Principles

### Core Requirements

Every assessment MUST have:
1. ✅ User details collection (Step 0)
2. ✅ Dynamic question filtering (based on company characteristics)
3. ✅ Progress indicator with percentage
4. ✅ Auto-advance navigation (no manual Next button)
5. ✅ Score calculation with category breakdown
6. ✅ Results page with actionable insights
7. ✅ PDF report generation
8. ✅ NPS feedback collection
9. ✅ Database persistence
10. ✅ WCAG 2.0 AA accessibility compliance

---

## 📋 Standard Assessment Structure

### Step 0: User Details Form (Company Profile)

**Required Fields:**

```typescript
interface UserDetails {
  fullName: string;           // "John Doe"
  email: string;              // Validated email format
  phone: string;              // 10 digits (UI adds +91 prefix)
  companyName: string;        // "Acme Pvt Ltd"
  state: string;              // Dropdown of Indian states
  employeeCount: string;      // Dropdown with ranges
  industry: string;           // Dropdown of industries
}
```

**Employee Count Options (Standard):**
```typescript
const EMPLOYEE_RANGES = [
  '1-10 employees',
  '11-20 employees',
  '21-50 employees',
  '51-100 employees',
  '101-500 employees',
  '500+ employees',
];
```

**Industry Options (Standard):**
```typescript
const INDUSTRIES = [
  'IT / Software',
  'Manufacturing',
  'Retail / E-commerce',
  'Healthcare',
  'Fintech / BFSI',
  'Consulting / Professional Services',
  'Education',
  'Hospitality',
  'Construction',
  'Other'
];
```

**Validation Rules:**
- Full Name: 2-100 characters
- Email: Valid email format (regex)
- Phone: Exactly 10 digits
- All dropdowns: Must select (not "Select...")

**Submit Button:**
- Text: "Start Assessment (X questions)" or "Continue to Assessment"
- Disabled until all fields valid
- Shows dynamic question count based on filtering

---

### Step 1-N: Assessment Questions

**Question Types (Standard):**

1. **Yes/No Questions**
```typescript
interface YesNoQuestion {
  id: string;                    // 'pf_1', 'wages_1', etc.
  text: string;                  // Question text
  type: 'yes_no';
  category: string;              // 'PF', 'Wages', etc.
  weight: number;                // 1-10 for scoring
  complianceAnswer?: 'yes' | 'no'; // Expected compliant answer
  helpText?: string;             // Contextual help
  
  // Filtering (optional)
  industryFilter?: string[];     // Show only for these industries
  employeeThreshold?: number;    // Show only if employees >= threshold
}
```

2. **Multiple Choice Questions**
```typescript
interface MultipleChoiceQuestion {
  id: string;
  text: string;
  type: 'multiple_choice';
  category: string;
  weight: number;
  options: string[];             // First = compliant, Last = N/A
  helpText?: string;
  
  // Filtering (optional)
  industryFilter?: string[];
  employeeThreshold?: number;
}
```

**UI Standards for Questions:**
- Large clickable buttons (h-16 for yes/no)
- Clear visual feedback on selection
- Help text below question (if applicable)
- Auto-advance after selection (800ms delay)
- Progress bar always visible
- Category indicator visible

**Auto-Advance Implementation:**
```typescript
const handleResponse = (questionId: string, value: string) => {
  // Save response
  setResponses(prev => ({ ...prev, [questionId]: value }));
  
  // Auto-advance after 800ms
  setTimeout(() => {
    handleNext();
  }, 800);
};
```

**Do NOT include manual Next button** - auto-advance handles navigation

---

### Step Final: Results Page

**Required Elements:**

1. **Overall Score (Prominent)**
```typescript
<div className="text-center">
  <h1 className="text-6xl font-bold text-green-600">{overallScore}%</h1>
  <p className="text-xl text-gray-600">Overall Compliance Score</p>
</div>
```

2. **Status Badge**
- 90-100%: "Compliant" (green)
- 70-89%: "Needs Attention" (amber)
- <70%: "Action Required" (red)

3. **Category Breakdown**
```typescript
categories.map(cat => (
  <Card>
    <CardHeader>
      <CardTitle>{cat.name}</CardTitle>
      <Badge variant={cat.score >= 90 ? 'success' : 'warning'}>
        {cat.score}%
      </Badge>
    </CardHeader>
    <CardContent>
      <Progress value={cat.score} />
      <p>{cat.description}</p>
    </CardContent>
  </Card>
))
```

4. **Action Items List**
```typescript
interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  category: string;
  text: string;
  impact?: string;              // Legal/financial impact
  remediation?: string;         // How to fix
  governmentLink?: string;      // Official reference
}
```

5. **Download Buttons**
- "Download PDF Report" (triggers NPS modal)
- "Email Report" (optional)
- "Save as Bookmark" (optional)

6. **NPS Feedback Modal**
- Triggered on first Download PDF click
- 3-step process:
  - Step 1: NPS score (0-10)
  - Step 2: Multiple choice questions
  - Step 3: Optional comments
- Saved to database with assessment_id link

---

## 🧮 Scoring Algorithm (Standard)

### Calculation Method

```typescript
function calculateScore(
  responses: Record<string, string>, 
  questions: Question[]
): number {
  let totalPoints = 0;
  let maxPoints = 0;

  questions.forEach(q => {
    maxPoints += q.weight;
    const answer = responses[q.id];
    
    if (q.type === 'yes_no') {
      if (!q.complianceAnswer) {
        // Informational question - full points for any answer
        totalPoints += q.weight;
      } else {
        // Compliance question - points only if answer matches
        if (answer === q.complianceAnswer) {
          totalPoints += q.weight;
        }
      }
    } else if (q.type === 'multiple_choice') {
      // First option = compliant (full points)
      // Last option = N/A (full points)
      // Middle options = partial points based on position
      const optionIndex = q.options.findIndex(o => o === answer);
      const optionCount = q.options.length;
      
      if (optionIndex === 0 || optionIndex === optionCount - 1) {
        totalPoints += q.weight;
      } else {
        // Partial points for middle options
        const partialPoints = q.weight * (0.5 - (optionIndex / optionCount));
        totalPoints += Math.max(0, partialPoints);
      }
    }
  });

  return Math.round((totalPoints / maxPoints) * 100);
}
```

### Category Scoring

Each category gets individual score:
```typescript
interface CategoryScore {
  category: string;
  score: number;               // 0-100
  maxScore: number;
  questionsAnswered: number;
  totalQuestions: number;
  status: 'compliant' | 'needs_attention' | 'non_compliant';
}
```

**Status thresholds:**
- 90-100% = Compliant
- 70-89% = Needs Attention
- 0-69% = Non-Compliant

---

## 🔍 Dynamic Question Filtering

### Purpose

Show only relevant questions based on company characteristics to:
- Reduce assessment time
- Improve accuracy
- Reduce user frustration
- Increase completion rates

### Implementation Pattern

```typescript
function getRelevantQuestions(
  industry: string,
  employeeCount: string,
  allQuestions: Question[]
): Question[] {
  const empCount = parseEmployeeCount(employeeCount);
  
  return allQuestions.filter(question => {
    // Industry filter
    if (question.industryFilter && 
        !question.industryFilter.includes(industry)) {
      return false;
    }
    
    // Employee threshold filter
    if (question.employeeThreshold && 
        empCount < question.employeeThreshold) {
      return false;
    }
    
    return true;
  });
}

function parseEmployeeCount(range: string): number {
  // '1-10 employees' → 5
  // '11-20 employees' → 15
  // '21-50 employees' → 35
  // etc.
  const matches = range.match(/(\d+)-(\d+)/);
  if (matches) {
    return (parseInt(matches[1]) + parseInt(matches[2])) / 2;
  }
  if (range.includes('500+')) return 600;
  return 0;
}
```

### Standard Thresholds (Indian Labour Law)

| Threshold | Applicable Provisions |
|-----------|----------------------|
| **1+ employee** | Minimum wages, Payment of Wages, ESI (hazardous) |
| **10+ employees** | ESI (general), Gratuity, Maternity Benefits |
| **20+ employees** | EPF, Bonus, Grievance Redressal Committee |
| **50+ employees** | Crèche, Contract Labour Registration |
| **100+ employees** | Canteen, Works Committee |
| **250+ employees** | Welfare Officer (hazardous industries) |
| **300+ employees** | Standing Orders, Prior Retrenchment Permission |
| **500+ employees** | Safety Committee (general industries) |

### Industry-Specific Provisions

**Manufacturing:**
- Factory registration (20+ with power, 40+ without)
- Hazardous process provisions
- Machinery safety requirements
- Emergency exits, fire safety

**IT Services:**
- Fewer OSH requirements
- No factory provisions
- Focus on Wages, Social Security codes

**Construction:**
- BOCW registration (10+ workers)
- Building cess (projects >₹50 lakh)
- Site safety requirements

---

## 📄 PDF Report Standards

### Required Sections

1. **Header**
   - Company name
   - Assessment type
   - Date of assessment
   - Assessment ID (for reference)

2. **Executive Summary**
   - Overall compliance score (large, prominent)
   - Status (Compliant / Needs Attention / Non-Compliant)
   - Key highlights (2-3 bullet points)

3. **Category Breakdown**
   - Each category with individual score
   - Visual progress bars
   - Category description

4. **Detailed Findings**
   - Question-by-question results
   - Compliant items (green checkmarks)
   - Non-compliant items (red crosses)

5. **Action Items**
   - Prioritized list (High → Medium → Low)
   - Each with:
     - What needs fixing
     - Why it matters (legal/financial impact)
     - How to fix (remediation steps)
     - Government portal link (if applicable)

6. **Government References**
   - Relevant act/code citations
   - Section numbers
   - Penalty information
   - Official portal links

7. **Footer**
   - ComplianceCheck branding
   - Disclaimer (not legal advice)
   - Contact information
   - Generated timestamp

### PDF Technical Requirements

**Library:** jsPDF (client-side generation)

**Character handling:**
```typescript
// CRITICAL: Replace Unicode before PDF generation
// jsPDF doesn't support many Unicode characters

const cleanText = (text: string): string => {
  return text
    .replace(/✓/g, '[✓]')
    .replace(/✗/g, '[X]')
    .replace(/₹/g, 'Rs.')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"');
};
```

**Font sizing:**
- Title: 20pt
- Headings: 16pt, bold
- Body: 11pt
- Small text: 9pt

**Colors:**
- Success: RGB(34, 197, 94) - green-600
- Warning: RGB(245, 158, 11) - amber-500
- Danger: RGB(239, 68, 68) - red-500
- Text: RGB(31, 41, 55) - gray-800

---

## 🗄️ Database Schema (Standard)

### Assessment Table

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- User details
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT NOT NULL,
  state TEXT NOT NULL,
  employee_count TEXT NOT NULL,
  industry TEXT NOT NULL,
  
  -- Assessment data
  assessment_type TEXT NOT NULL,  -- 'statutory_health', 'labour_code', 'dpdp'
  status TEXT DEFAULT 'completed',
  responses JSONB NOT NULL,
  
  -- Scores
  overall_score INTEGER NOT NULL,
  category_scores JSONB NOT NULL,
  
  -- Action items
  action_items JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Feedback Table

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id),
  assessment_type TEXT NOT NULL,
  
  -- NPS data
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  value_provided TEXT,
  would_recommend TEXT,
  ui_experience TEXT,
  report_quality TEXT,
  time_spent TEXT,
  desired_features TEXT[],
  additional_comments TEXT,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI/UX Standards

### Color Scheme (Per Assessment Type)

**Statutory Health Check:**
- Primary: Green (`bg-green-700`, `text-green-700`)
- Border: `border-green-600`
- Success: `bg-green-100`

**Labour Code Readiness:**
- Primary: Blue (`bg-blue-700`, `text-blue-700`)
- Border: `border-blue-600`
- Success: `bg-blue-100`

**DPDP Gap Assessment:**
- Primary: Purple (`bg-purple-700`, `text-purple-700`)
- Border: `border-purple-600`
- Success: `bg-purple-100`

**Future Assessments:**
- Orange, Teal, Indigo, Pink (use -700 shades for text)

### Component Hierarchy

```typescript
<div className="min-h-screen bg-white">
  {/* Beta Banner - Fixed top */}
  <BetaBanner />
  
  {/* Assessment Header - Fixed below banner */}
  <AssessmentHeader 
    title={assessmentType}
    badge="FREE Assessment"
  />
  
  {/* Progress Indicator - Always visible */}
  <ProgressSection 
    currentStep={step}
    totalSteps={total}
    percentage={progress}
  />
  
  {/* Main Content - Scrollable */}
  <main>
    {step === 0 && <CompanyDetailsForm />}
    {step > 0 && <QuestionCard />}
  </main>
  
  {/* Navigation - Fixed bottom */}
  <NavigationFooter>
    <BackButton />
    {isLastQuestion && <SubmitButton />}
  </NavigationFooter>
</div>
```

### Button States

**Primary action buttons:**
```typescript
// Default
className="bg-{color}-700 hover:bg-{color}-800 text-white"

// Disabled
className="bg-gray-300 text-gray-500 cursor-not-allowed"

// Loading
<Button disabled>
  <Loader2 className="animate-spin" />
  Processing...
</Button>
```

**Selection buttons (Yes/No):**
```typescript
// Unselected
variant="outline"

// Selected
variant="default"
className="bg-green-700 hover:bg-green-800"

// For NO
className="bg-red-700 hover:bg-red-800"
```

---

## ⚡ Performance Standards

### Required Optimization

1. **Code Splitting**
```typescript
// Lazy load assessment modules
const StatutoryHealthAssessment = dynamic(
  () => import('./assessment/statutory-health'),
  { loading: () => <AssessmentSkeleton /> }
);
```

2. **Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="ComplianceCheck"
  width={32}
  height={32}
  loading="lazy"
/>
```

3. **Database Queries**
- Use Supabase connection pooling
- Index frequently queried fields
- Limit result sets (pagination)

4. **Client-Side Caching**
```typescript
// Save progress to localStorage
localStorage.setItem(`assessment_${id}`, JSON.stringify(data));

// Restore on return
const saved = localStorage.getItem(`assessment_${id}`);
```

### Performance Targets

| Metric | Target | Acceptable | Action if Exceeded |
|--------|--------|------------|-------------------|
| First Contentful Paint (FCP) | <1.5s | <2s | Optimize above-fold content |
| Largest Contentful Paint (LCP) | <2.5s | <3s | Optimize images, reduce JS |
| Time to Interactive (TTI) | <3s | <4s | Code splitting, lazy loading |
| Cumulative Layout Shift (CLS) | <0.1 | <0.15 | Reserve space for dynamic content |

---

## 🔒 Security Standards

### Input Validation

**Client-side (UX):**
```typescript
const schema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\d{10}$/, '10 digits required'),
  companyName: z.string().min(2).max(200),
  // ... etc
});
```

**Server-side (Security):**
```typescript
// API route - ALWAYS validate
export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate with Zod
  const validatedData = schema.parse(body);
  
  // Sanitize
  const sanitized = {
    ...validatedData,
    companyName: sanitizeHtml(validatedData.companyName)
  };
  
  // Process
}
```

### Data Protection

**PII Handling:**
- Email, phone, name → Encrypted at rest (Supabase handles)
- Never log PII in console
- Never expose in URLs (use UUIDs only)
- Comply with DPDP Act 2023

**DPDP Compliance:**
- Consent checkbox before data collection
- Privacy policy link visible
- Data deletion on request (implement endpoint)
- Data export on request (implement endpoint)

---

## 📱 Mobile Responsiveness Standards

### Breakpoints (Tailwind)

- Mobile: 375px - 640px (`default`, no prefix)
- Tablet: 641px - 1024px (`md:`)
- Desktop: 1025px+ (`lg:`, `xl:`)

### Mobile-Specific Requirements

1. **Touch Targets**
- Minimum 44×44px for all interactive elements
- Adequate spacing between buttons (gap-4 minimum)

2. **Form Fields**
- Full width on mobile (`className="w-full"`)
- Larger text (16px minimum to prevent zoom)
- Native mobile inputs where possible

3. **Progress Indicator**
- Always visible (sticky top)
- Condensed on mobile (show percentage only)

4. **Buttons**
- Full width on mobile
- Stacked vertically (grid-cols-1)
- Clear tap feedback

### Testing on Mobile

```bash
# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"

# Both
npx playwright test --grep "mobile"
```

---

## 🧩 Reusable Components

### Standard Components (Create Once, Use Everywhere)

**1. CompanyDetailsForm**
```typescript
interface CompanyDetailsFormProps {
  onSubmit: (details: UserDetails) => void;
  questionCount?: number;  // For dynamic button text
  assessmentType: string;  // For analytics tracking
}
```

**2. QuestionCard**
```typescript
interface QuestionCardProps {
  question: Question;
  value?: string;
  onResponse: (questionId: string, value: string) => void;
  helpText?: string;
}
```

**3. ProgressIndicator**
```typescript
interface ProgressIndicatorProps {
  current: number;
  total: number;
  categoryName?: string;
}
```

**4. ResultsCard**
```typescript
interface ResultsCardProps {
  overallScore: number;
  categoryScores: CategoryScore[];
  actionItems: ActionItem[];
  assessmentId: string;
  assessmentType: string;
}
```

**5. NPSFeedbackModal**
```typescript
interface NPSFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => Promise<void>;
  assessmentType: string;
}
```

---

## 📊 Analytics Standards (PostHog)

### Required Events

```typescript
// Assessment lifecycle
posthog.capture('assessment_started', {
  type: assessmentType,
  industry: userDetails.industry,
  employeeCount: userDetails.employeeCount,
  questionCount: filteredQuestions.length
});

posthog.capture('assessment_completed', {
  type: assessmentType,
  score: overallScore,
  timeSpent: completionTime,
  questionsAnswered: Object.keys(responses).length
});

posthog.capture('assessment_abandoned', {
  type: assessmentType,
  step: currentStep,
  progress: progressPercentage
});

// Report actions
posthog.capture('report_downloaded', {
  type: assessmentType,
  score: overallScore,
  format: 'pdf'
});

posthog.capture('feedback_submitted', {
  type: assessmentType,
  nps_score: feedback.npsScore,
  would_recommend: feedback.wouldRecommend
});
```

### User Properties

```typescript
posthog.identify(userId, {
  industry: userDetails.industry,
  employeeCount: userDetails.employeeCount,
  state: userDetails.state,
  assessments_completed: count
});
```

---

## 🧪 Testing Requirements for New Assessments

### Minimum Test Coverage

Every new assessment MUST have:

**1. Main Flow Test (1 test minimum)**
```typescript
test('should complete {assessment} with compliant answers', async ({ page }) => {
  // Fill company details
  // Answer all questions
  // Verify results page
  // Check score calculation
});
```

**2. Dynamic Filtering Tests (if applicable)**
```typescript
test('should show different questions for different industries');
test('should filter based on employee count');
```

**3. Accessibility Test**
```typescript
test('{assessment} should have no critical accessibility violations');
```

**4. Mobile Test**
```typescript
test('should work on mobile viewport');
```

**5. Database Test**
```typescript
test('should persist assessment to database');
```

**Minimum:** 5 tests per assessment  
**Recommended:** 10-15 tests per assessment  
**Across browsers:** 25-75 total tests per assessment

---

## 🚀 New Assessment Checklist

When building a new assessment type:

### Planning Phase
- [ ] Define scope (which compliance area)
- [ ] Research applicable thresholds
- [ ] Design question set (25-50 questions typical)
- [ ] Map categories (3-5 categories)
- [ ] Define scoring algorithm
- [ ] Identify dynamic filtering rules

### Development Phase
- [ ] Create assessment route (`/assessment/{type}`)
- [ ] Build company details form (Step 0)
- [ ] Implement question components
- [ ] Add auto-advance logic (800ms timeout)
- [ ] Remove manual Next button
- [ ] Add progress indicator with aria-label
- [ ] Implement score calculation
- [ ] Build results page
- [ ] Add category breakdown
- [ ] Generate action items
- [ ] Create PDF template
- [ ] Add NPS feedback modal

### Testing Phase
- [ ] Write minimum 5 tests
- [ ] Test across 3 browsers minimum
- [ ] Test mobile responsiveness
- [ ] Run accessibility audit
- [ ] Verify color contrast (all >4.5:1)
- [ ] Test dynamic filtering
- [ ] Verify database persistence
- [ ] Check PDF generation

### Quality Assurance
- [ ] All tests passing (100%)
- [ ] Zero critical accessibility violations
- [ ] Page load <3 seconds
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (iPhone, Android)
- [ ] No console errors
- [ ] SEO meta tags present

### Deployment
- [ ] Commit code + tests together
- [ ] Push to GitHub
- [ ] Wait for Netlify build (2-3 min)
- [ ] Run tests against live site
- [ ] Verify manually (complete one assessment)
- [ ] Monitor PostHog for errors
- [ ] Check user feedback (NPS)

---

## 📐 Code Standards

### File Structure

```typescript
src/app/assessment/{type}/
├── page.tsx                    // Main assessment component
├── questions.ts                // Question definitions
├── scoring.ts                  // Score calculation logic
├── filtering.ts                // Dynamic filtering (if complex)
└── constants.ts                // Categories, thresholds, etc.
```

### Component Pattern

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// ... other imports

// Type definitions
interface AssessmentProps {}
interface UserDetails {}
interface Question {}

// Validation schema
const userDetailsSchema = z.object({...});

export default function AssessmentPage() {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  
  // Form handling
  const form = useForm({
    resolver: zodResolver(userDetailsSchema)
  });
  
  // Core functions
  const handleResponse = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    setTimeout(() => handleNext(), 800);
  };
  
  const handleNext = () => {
    // Navigation logic
  };
  
  const handleSubmit = async () => {
    // Submission logic
  };
  
  // Render
  return (
    <div className="min-h-screen">
      {/* Components */}
    </div>
  );
}
```

---

## 🎓 Learning from Past Issues

### Key Lessons

**1. Auto-Advance > Manual Navigation**
- Users prefer fewer clicks
- Feels more modern and polished
- Reduces friction
- Improves completion rates

**2. Accessibility is Non-Negotiable**
- Test EVERY deployment
- Use darker color shades by default
- Always add aria-labels to progress bars
- Check contrast ratio before using new colors

**3. Form Field Consistency**
- Always use same field order
- Always use same dropdown options
- Always use same validation rules
- Makes testing easier, reduces bugs

**4. Test Against Live Site, Not Localhost**
- Catches caching issues
- Catches build/deployment issues
- Validates actual user experience

**5. Test Data Matters**
- Use realistic but clearly fake data
- Cover edge cases (special characters, long names)
- Test all dropdown combinations
- Test boundary values (min/max employees)

---

## 📅 Release Cycle

### Weekly Release (Fridays)

**Thursday:**
- Code freeze at 5 PM
- Run full test suite
- Fix any failing tests

**Friday Morning:**
- Final test run
- Deploy to production
- Monitor for 2 hours
- Rollback if issues

**Friday Afternoon:**
- Document changes
- Update test baselines if needed
- Plan next week's work

### Hotfix Process

For critical production bugs:
1. Create hotfix branch
2. Fix bug + add regression test
3. Run affected test suite only
4. Deploy immediately
5. Run full suite after hours

---

## 🏆 Quality Gates

### Cannot Deploy If:

- ❌ Any functional test failing
- ❌ Critical accessibility violations
- ❌ Database save failures
- ❌ Security vulnerabilities found
- ❌ Build errors or warnings

### Should Not Deploy If:

- ⚠️ >10% tests failing
- ⚠️ Performance degraded >20%
- ⚠️ Mobile tests failing
- ⚠️ SEO score decreased

### Can Deploy With:

- ✅ 1-2 non-critical tests failing (with tickets created)
- ✅ Minor performance issues (<10% degradation)
- ✅ Edge case failures (documented)

---

## 📖 Documentation Requirements

### For Each New Assessment

Create these files:
1. `{TYPE}_ASSESSMENT_SPEC.md` - Requirements, questions, scoring
2. `{TYPE}_TESTS.md` - Test coverage, how to run
3. Update main `README.md` - Add assessment to list
4. Update `TESTING_BEST_PRACTICES.md` - Add any new patterns

### Code Comments

```typescript
/**
 * Assessment: Labour Code Readiness
 * Questions: 30 (filtered dynamically to 15-28 based on company)
 * Categories: 4 (Wages, Social Security, OSH, Industrial Relations)
 * Scoring: Weighted by question importance (1-10 scale)
 * Filtering: Industry type + employee count thresholds
 */
```

---

## 🔄 Continuous Improvement

### Monthly Review

**Check:**
- Test flakiness (any tests failing >5% of runs?)
- Test execution time (any tests >30s?)
- Coverage gaps (new features without tests?)
- Accessibility regressions
- Performance trends

**Update:**
- Refactor slow tests
- Remove flaky tests or fix them
- Add tests for uncovered scenarios
- Update test data
- Optimize test execution

### Quarterly Assessment

- Review all test documentation
- Update best practices based on learnings
- Train team on new patterns
- Evaluate new testing tools
- Plan test infrastructure improvements

---

**This document is a living guide. Update it as we learn and improve!**

**Maintained by:** ComplianceCheck Development Team  
**Questions?** Email: compliancecheck@zohomail.in
