# Skill: new-assessment

Create a complete new assessment type end-to-end, covering all 8 touch-points required by CLAUDE.md §11.

## Inputs to gather from the user

Before starting, confirm:
1. **Assessment name** — e.g. "Cyber Security Compliance" (used for display names and file names)
2. **Type key** — e.g. `CYBER_SECURITY` (SCREAMING_SNAKE_CASE constant) and `cyber_security` (snake_case slug used in filenames, routes, and DB)
3. **Compliance categories** — e.g. ["Access Control", "Data Encryption", "Incident Response"] (3–8 categories)
4. **Pricing tier** — `free` or `paid`
5. **Governing legislation** — e.g. "IT Act, 2000 & CERT-In Guidelines"

If any of these are missing, ask the user before proceeding.

---

## Step 1 — Register the assessment type

**File:** `src/lib/constants/assessment-types.ts`

- Add `{TYPE_KEY}: '{slug}'` to the `ASSESSMENT_TYPES` object
- Add `[ASSESSMENT_TYPES.{TYPE_KEY}]: '{free|paid}'` to `ASSESSMENT_PRICING`
- Add `[ASSESSMENT_TYPES.{TYPE_KEY}]: '{Display Name}'` to `getAssessmentDisplayName()`

---

## Step 2 — Create the question library

**File:** `src/lib/assessments/{slug}-questions.ts`

Follow the exact pattern from `src/lib/assessments/dpdp-questions.ts` (read it first). Export:

```typescript
export interface {TypeName}Question {
  id: string
  text: string
  category: string
  weight: number
  complianceAnswer: 'yes' | 'no'
  helpText?: string
}

export const {TYPE_KEY}_QUESTIONS: {TypeName}Question[] = [
  // Minimum 15 questions, distributed across the supplied categories
  // Each question has a weight between 1–10
]

export function calculate{TypeName}Score(
  responses: Record<string, string>
): { overallScore: number; categoryScores: Record<string, number> }

export function generate{TypeName}ActionItems(
  responses: Record<string, string>
): Array<{ questionId: string; action: string; priority: 'high' | 'medium' | 'low' }>

export function getRelevant{TypeName}Questions(
  filters?: { employeeCount?: string; industry?: string }
): {TypeName}Question[]
```

Score arithmetic: always use `??` not `||` when reading scores that can be 0.

---

## Step 3 — Create the assessment page

**File:** `src/app/assessment/{slug}/page.tsx`

Read `src/app/assessment/dpdp/page.tsx` as the reference template. Apply all CLAUDE.md §11 standards:

- **Step 0 form fields** (exact order): `fullName → email → phone → companyName → state → employeeCount → industry`
- **Dropdowns**: import `INDIAN_STATES`, `EMPLOYEE_COUNT_OPTIONS`, `INDUSTRY_OPTIONS` from `@/lib/constants/india` — never hardcode
- **Yes button** (selected): `className="bg-green-700 hover:bg-green-800 text-white"`
- **No button** (selected): `className="bg-red-700 hover:bg-red-800 text-white"`
- **Icons**: `import { CheckCircle, XCircle } from 'lucide-react'` — NOT `CheckCircle2`
- **Auto-advance**: `setTimeout(() => handleNext(), 800)` — exactly 800ms, never change
- **Progress bar**:
  ```tsx
  <Progress
    value={progressPercentage}
    className="h-3 [&>div]:bg-green-600"
    aria-label={`Assessment progress: ${progressPercentage}% complete`}
  />
  ```
- **Required components**: `<AssessmentHeader>` from `@/components/assessment/assessment-header`
- **EmailGate**: `<EmailGate>` from `@/components/identity/EmailGate` must gate the results view
- **localStorage key**: `'{slug}_assessment_progress'` with 24-hour TTL
- **Score reads**: always `score ?? 0`, never `score || 0`

---

## Step 4 — Create the API submit endpoint

**File:** `src/app/api/assessment/{slug}-submit/route.ts`

Read `src/app/api/assessment/dpdp-submit/route.ts` as the reference. Key rules:

- **Lazy-init Supabase** (CLAUDE.md §3):
  ```typescript
  let _supabase: ReturnType<typeof createClient> | null = null
  function getSupabase() {
    if (!_supabase) _supabase = createClient(...)
    return _supabase
  }
  ```
- **Fallback ID**: set `let assessmentId = \`local_${Date.now()}\`` before the try block; only overwrite inside the successful Supabase path
- Wrap entire handler in `try/catch`; never let an unhandled rejection reach the client
- Return `{ success: true, assessmentId, scoreResults, actionItems }`
- Write to the generic `assessments` table using `ASSESSMENT_TYPES.{TYPE_KEY}` — only create a separate table if the assessment has columns that don't fit the generic schema (and then also create a migration in Step 9)

---

## Step 5 — Create PDF compliance rules

**File:** `src/lib/pdf/{slug}-compliance-rules.ts`

Read `src/lib/pdf/dpdp-compliance-rules.ts` as the reference. Export:

```typescript
export const {TYPE_KEY}_COMPLIANCE_RULES: ComplianceRule[] = [
  // One entry per question ID, containing:
  // questionId, category, requirement, governmentRef, officialLink,
  // deadline, penalty, actionIfNonCompliant[], actionIfCompliant, applicabilityNote?
]

export const {TYPE_KEY}_CATEGORY_LABELS: Record<string, string> = {
  // Maps internal category keys to display labels
}
```

---

## Step 6 — Add PDF report config

**File:** `src/lib/pdf/report-configs.ts`

Append a new config block following the existing pattern:

```typescript
export const {TYPE_KEY}_CONFIG: ReportConfig = {
  assessmentTitle: '{Display Name}',
  assessmentSubtitle: 'Gap Assessment Report',
  legislationDescription: '{governing legislation}',
  filenamePrefix: '{Slug-For-Filename}',
  resources: [{ name: '...', url: '...' }, ...],
  legislation: ['...Act...', ...],
  deadlines: [{ item: '...', date: '...' }, ...],
}
```

---

## Step 7 — Add PDF adapter

**File:** `src/lib/pdf/report-data-adapter.ts`

1. Import the new rules and config at the top of the file (alongside existing imports)
2. Append an `adapt{TypeName}Result(data: AssessmentData): UnifiedReportData` function following the 5-step pattern used by `adaptDPDP()`:
   - Step 1: `extractUserDetails(data)`
   - Step 2: parse category scores from `data.category_scores`
   - Step 3: iterate `data.responses` → match against `{TYPE_KEY}_COMPLIANCE_RULES`
   - Step 4: build `actionItems` (non-compliant) and `compliantItems` (compliant)
   - Step 5: return `UnifiedReportData` with config, risk level, penalty exposure

---

## Step 8 — Add landing page card

**File:** `src/app/assessments/landing/page.tsx`

Read the file first to find the assessment cards array/section. Add a new card for the new assessment type using the same structure as existing cards. Link to `/assessment/{slug}`.

---

## Step 9 — Database migration (only if needed)

Only create a migration if the assessment requires a **specialized table** (e.g., extra columns that don't fit `assessments`). Otherwise the generic `assessments` table is sufficient.

If needed, create: `supabase/migrations/{YYYYMMDDHHMMSS}_create_{slug}_assessments.sql`

Follow the pattern in `supabase/migrations/20260504000000_create_posh_assessments_table.sql`:
- UUID PK + timestamps
- `CREATE TRIGGER trg_{table}_updated_at`
- Indexes on `user_id`, `created_at DESC`
- `ALTER TABLE ENABLE ROW LEVEL SECURITY`
- Anonymous INSERT policy: `CREATE POLICY "Allow anonymous inserts" ON ... FOR INSERT WITH CHECK (true);`
- SELECT policy: users see own rows (`auth.uid() = user_id`)
- `GRANT` statements

---

## Validation

Run these in order and fix any errors before considering the task done:

```bash
npm run lint     # must be zero errors
npm run build    # must compile clean
```

Also verify manually:
- Navigate to `/assessment/{slug}` — Step 0 form renders with all 7 fields
- Complete a question and confirm 800ms auto-advance works
- Submit and confirm results page loads with EmailGate
- PDF download produces a file (not an error)
