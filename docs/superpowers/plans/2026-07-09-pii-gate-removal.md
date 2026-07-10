# PII Gate Removal (DPDP + Gratuity Calculator) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the front-loaded contact-info (name/email/phone/company) gate from the DPDP assessment and the Gratuity calculator so users see value before being asked for personal details, per `docs/Fixes as on 9 July.md` fix #1 and #4.

**Architecture:** DPDP keeps a shorter Step 0 (business-profile fields only — state/employeeCount/industry/revenue/4 data-processing questions — these personalise which questions are shown, so they stay). Contact info moves to the *existing* post-completion `<GatedResults>` email-OTP gate on the results page — no new gate infrastructure needed there. Gratuity drops its contact-info gate entirely with no replacement: calculator inputs appear first, results show immediately, matching the homepage's "No signup required. Free forever." promise and fix #4 (resolve the calculator contradiction) in the same change.

**Tech Stack:** Next.js App Router, react-hook-form + zod, Supabase (service-role), Vitest, Playwright.

## Global Constraints

- Every commit must pass `npm run lint` (zero errors) and `npm run build` (zero errors) before being considered done.
- Use `??` not `||` for any numeric score/count that could legitimately be 0 (CLAUDE.md §4). Not directly touched by this plan, but if any step brushes scoring code, preserve existing `??` usage.
- No raw apostrophes in JSX — use `&apos;` (CLAUDE.md §6).
- Never hardcode assessment type strings — import from `@/lib/constants/assessment-types` (CLAUDE.md §9).
- Do not touch any other assessment type's Step 0 (`statutory_health`, `labour_code`, `state_wise_compliance`, `food_business`, `posh`, `auto_dealer`) — this plan is scoped to DPDP and Gratuity only.

---

### Task 1: DPDP — shrink Step 0 to business-profile fields only

**Files:**
- Modify: `src/app/assessment/dpdp/page.tsx:37-50` (schema), `:322-638` (Step 0 JSX)
- Modify: `src/app/api/assessment/dpdp-submit/route.ts:26-40` (interface), `:85-132` (users upsert + assessments insert)
- Modify: `tests/dpdp-assessment.spec.ts:471-485` (existing Playwright assertion that hard-codes the old field set)
- Test: `tests/unit/dpdp-submit.test.ts` (new)

**Interfaces:**
- Consumes: nothing from other tasks in this plan.
- Produces: `organizationProfileSchema` in `dpdp/page.tsx` no longer has `fullName`/`email`/`phone`/`companyName` keys. Any later task touching this file must not reintroduce them without also updating `dpdp-submit/route.ts`'s `OrganizationProfile` interface.

- [ ] **Step 1: Remove contact fields from the Zod schema**

In `src/app/assessment/dpdp/page.tsx`, replace lines 37-50:

```ts
// Form validation schema for organization profile
const organizationProfileSchema = z.object({
  state: z.string().min(1, 'Please select your state'),
  employeeCount: z.string().min(1, 'Please select employee count'),
  industry: z.string().min(1, 'Please select your industry'),
  revenue: z.string().min(1, 'Please select annual revenue'),
  processesChildrenData: z.enum(['yes', 'no']),
  processesHealthData: z.enum(['yes', 'no']),
  processesSensitiveData: z.enum(['yes', 'no']),
  crossBorderTransfers: z.enum(['yes', 'no'])
})
```

- [ ] **Step 2: Remove the contact-info JSX rows and update the card copy**

Delete the "Row 1: Full Name + Company Name" block (original lines 335-360) and the "Row 2: Email + Phone" block (original lines 362-395) entirely — the form now starts directly with the "Row 3: State + Employee Count" grid (which becomes the first row).

Replace the `CardDescription` (original line 329-331):

```tsx
              <CardDescription>
                Tell us a bit about your business so we can personalise your assessment questions — no personal details required yet.
              </CardDescription>
```

- [ ] **Step 3: Verify the page still compiles and the profile-only form renders**

Run: `npm run build`
Expected: build succeeds with zero TypeScript errors (no leftover references to `errors.fullName`, `errors.email`, `errors.phone`, `errors.companyName`, or `register('fullName')` etc. — the whole JSX blocks from Step 2 must be fully removed, not just the schema fields).

- [ ] **Step 4: Make contact fields optional server-side in the submit route**

In `src/app/api/assessment/dpdp-submit/route.ts`, replace the `OrganizationProfile` interface (lines 26-40):

```ts
// Type definition for organization profile.
// fullName/email/phone/companyName are optional: DPDP no longer collects them
// before the assessment — they're captured post-completion via the results
// page's email-OTP gate (GatedResults/EmailGate), so this route must accept a
// payload that omits them entirely.
interface OrganizationProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  state: string;
  employeeCount: string;
  industry: string;
  revenue: string;
  processesChildrenData: string;
  processesHealthData: string;
  processesSensitiveData: string;
  crossBorderTransfers: string;
}
```

- [ ] **Step 5: Guard the `users` upsert on email being present**

Replace lines 85-104 (the `const supabase = getSupabase()` through the `.select('id').single()` call) with:

```ts
      const supabase = getSupabase()

      // Contact info is optional now — only upsert a users row when an email
      // is actually present, so this never fires an upsert with an empty
      // email (which would collide against the `onConflict: 'email'` unique
      // constraint for every anonymous submission).
      let userId: string | null = null
      if (organizationProfile.email) {
        const { data: user } = await supabase
          .from('users')
          .upsert(
            {
              email: organizationProfile.email,
              full_name: organizationProfile.fullName,
              phone: organizationProfile.phone || null,
              company_name: organizationProfile.companyName,
              employee_count: organizationProfile.employeeCount,
              registered_state: organizationProfile.state,
              industry_type: organizationProfile.industry,
            },
            { onConflict: 'email' }
          )
          .select('id')
          .single()
        userId = user?.id ?? null
      }
```

Then update the `assessments` insert immediately below (originally line 105-108) to use `userId` instead of `user?.id ?? null`:

```ts
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
```

(The rest of the `.insert({...})` object — `user_details`, `assessment_type`, `responses`, scores, etc. — is unchanged; the fields it reads off `organizationProfile` are simply `undefined` when absent, which is valid JSON.)

- [ ] **Step 6: Write the unit test for the optional-contact-info path**

Create `tests/unit/dpdp-submit.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mock = vi.hoisted(() => {
  const state = {
    usersUpsertCalls: 0,
    insertedRow: null as null | Record<string, unknown>,
  }
  const client = {
    from: (table: string) => {
      if (table === 'users') {
        return {
          upsert: () => {
            state.usersUpsertCalls += 1
            return {
              select: () => ({
                single: async () => ({ data: { id: 'user-1' }, error: null }),
              }),
            }
          },
        }
      }
      return {
        insert: (row: Record<string, unknown>) => {
          state.insertedRow = row
          return {
            select: () => ({
              single: async () => ({ data: { id: 'assessment-1', ...row }, error: null }),
            }),
          }
        },
      }
    },
  }
  return { state, client }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mock.client,
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: () => true,
}))

import { POST } from '@/app/api/assessment/dpdp-submit/route'

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/assessment/dpdp-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )
}

const BASE_PROFILE = {
  state: 'Maharashtra',
  employeeCount: '50-99 employees',
  industry: 'it_services',
  revenue: '₹5-10 crore',
  processesChildrenData: 'no',
  processesHealthData: 'no',
  processesSensitiveData: 'no',
  crossBorderTransfers: 'no',
}

describe('POST /api/assessment/dpdp-submit — contact info is optional', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    mock.state.usersUpsertCalls = 0
    mock.state.insertedRow = null
  })

  it('accepts a payload with no contact info and does not upsert a users row', async () => {
    const res = await post({ organizationProfile: BASE_PROFILE, responses: {} })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mock.state.usersUpsertCalls).toBe(0)
    expect(mock.state.insertedRow?.user_id).toBeNull()
  })

  it('still upserts a users row when email is present', async () => {
    const res = await post({
      organizationProfile: { ...BASE_PROFILE, email: 'user@example.com', fullName: 'Test User' },
      responses: {},
    })
    expect(res.status).toBe(200)
    expect(mock.state.usersUpsertCalls).toBe(1)
    expect(mock.state.insertedRow?.user_id).toBe('user-1')
  })
})
```

- [ ] **Step 7: Run the new test and verify both cases pass**

Run: `npx vitest run tests/unit/dpdp-submit.test.ts`
Expected: 2 passed, 0 failed.

- [ ] **Step 8: Update the Playwright assertion that hard-codes the old field set**

In `tests/dpdp-assessment.spec.ts`, replace the test at lines 471-485 (`'should match form field structure of other assessments'`) with:

```ts
  test('should show business-profile fields without asking for contact info upfront', async ({ page }) => {
    await page.goto('/assessment/dpdp');

    await page.waitForLoadState('networkidle');

    // Contact info now moves to the post-completion email gate — must NOT
    // appear before the questions start.
    await expect(page.getByLabel(/your full name/i)).not.toBeVisible();
    await expect(page.getByLabel(/company name/i)).not.toBeVisible();
    await expect(page.getByLabel(/email address/i)).not.toBeVisible();
    await expect(page.getByLabel(/phone number/i)).not.toBeVisible();

    // Business-profile fields (needed to personalise the assessment) still
    // gate Step 0.
    await expect(page.getByRole('combobox').filter({ hasText: /select your state/i })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: /select employee count/i })).toBeVisible();

    const startButton = page.getByRole('button', { name: /start assessment/i });
    await expect(startButton).toBeVisible();
  });
```

Leave every other test in this file untouched — `fillCompanyDetails()` (lines 928-1058) already guards each contact field with `.isVisible({ timeout: 2000 }).catch(() => false)` before filling it, so it silently skips fullName/companyName/email/phone once those inputs no longer exist, and the rest of the flow (state/employeeCount/industry/revenue selects, data-processing radios, "Start Assessment" click) is unaffected.

- [ ] **Step 9: Commit**

```bash
git add src/app/assessment/dpdp/page.tsx src/app/api/assessment/dpdp-submit/route.ts tests/dpdp-assessment.spec.ts tests/unit/dpdp-submit.test.ts
git commit -m "Move DPDP contact-info capture to post-completion email gate"
```

---

### Task 2: Gratuity Calculator — remove the contact-info gate entirely

**Files:**
- Modify: `src/app/calculator/gratuity/page.tsx` (whole-file restructure: schema/step removal, step renumbering)
- Modify: `src/app/api/calculator/gratuity-submit/route.ts:7-11, 100-156` (make `userDetails` optional, guard the `users` insert)
- Test: `tests/unit/gratuity-submit.test.ts` (new)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `/api/calculator/gratuity-submit` accepts a payload where `userDetails` is `undefined`.

- [ ] **Step 1: Remove the contact-info schema and step-1 state**

In `src/app/calculator/gratuity/page.tsx`, delete the `userDetailsSchema` (lines 28-32) and the `UserDetails` type (line 34) entirely. In the `SavedProgress` interface (lines 39-43), remove `userDetails: UserDetails | null`:

```ts
interface SavedProgress {
  step: number
  savedAt: string
}
```

- [ ] **Step 2: Renumber steps — calculator inputs become step 1, results become step 2**

Replace the component's initial state (lines 45-63): remove `userDetails` state and the `register`/`handleSubmit`/`errors`/`reset` destructuring for the contact form, and start on the calculator-inputs step:

```ts
export default function GratuityCalculatorPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false)

  // Calculator input states
  const [employmentType, setEmploymentType] = useState<'regular' | 'fixed_term' | 'journalist' | null>(null)
  const [basicDA, setBasicDA] = useState<string>('')
  const [dateOfJoining, setDateOfJoining] = useState<string>('')
  const [lastWorkingDate, setLastWorkingDate] = useState<string>('')

  // Result state
  const [result, setResult] = useState<GratuityResult | null>(null)
```

- [ ] **Step 3: Simplify the saved-progress load effect**

Replace the "Load saved progress on mount" effect (lines 66-85):

```ts
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const progress: SavedProgress = JSON.parse(saved)
        const savedTime = new Date(progress.savedAt).getTime()
        const now = Date.now()
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          setStep(progress.step)
          setHasRestoredProgress(true)
        }
      }
    } catch (e) {
      console.error('Error loading saved progress:', e)
    }
  }, [])
```

- [ ] **Step 4: Simplify `saveProgress` and `getProgress`**

Replace `saveProgress` (lines 87-103):

```ts
  const saveProgress = useCallback(() => {
    setSaveStatus('saving')
    try {
      const progress: SavedProgress = {
        step,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      console.error('Error saving progress:', e)
      setSaveStatus('idle')
    }
  }, [step])
```

Replace `getProgress` (lines 111-115):

```ts
  const getProgress = () => {
    if (step === 1) return 50
    return 100
  }
```

Delete `onUserDetailsSubmit` (lines 118-122) entirely — there is no longer a user-details step to submit.

- [ ] **Step 5: Simplify `saveToDatabase` — no `userDetails` guard, no `userDetails` in the request body**

Replace lines 124-149:

```ts
  // Auto-save to database (anonymous — no contact info required)
  const saveToDatabase = async (calcResult: GratuityResult, inputs: {
    employmentType: string
    basicDA: number
    dateOfJoining: string
    lastWorkingDate: string
  }) => {
    try {
      await fetch('/api/calculator/gratuity-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          result: calcResult,
        }),
      })
      clearProgress()
    } catch (error) {
      console.error('Auto-save error:', error)
      // Silent fail - calculation still shown to user
    }
  }
```

- [ ] **Step 6: Update `handleCalculate` to target step 2 instead of step 3**

In `handleCalculate` (originally lines 152-179), change `setStep(3)` to `setStep(2)`. No other change needed in this function.

- [ ] **Step 7: Update the "Start Fresh" reset handler**

In the "Restored Progress Notice" block (originally lines 229-249), remove the `setUserDetails(null)` call and change the reset target from `setStep(1)` (unchanged — 1 is still the first step) — just delete the now-nonexistent `setUserDetails(null)` line from the `onClick` handler.

- [ ] **Step 8: Delete the Step-1 contact-info Card entirely**

Delete the whole "Step 1: User Details - Simplified" block (originally lines 251-301) — the `{step === 1 && (<Card>...form...</Card>)}` JSX.

- [ ] **Step 9: Renumber the remaining two JSX steps**

Change the "Step 2: Calculator Inputs" condition (originally line 304) from `{step === 2 && (` to `{step === 1 && (`, and its "Back to Details" button (originally line 438, `onClick={() => setStep(1)}`) now has nowhere to go back to — delete that button entirely (calculator inputs are now the first step).

Change the "Step 3: Results" condition (originally line 448) from `{step === 3 && result && (` to `{step === 2 && result && (`, and its "Modify Inputs" button (originally line 615, `onClick={() => setStep(2)}`) to `onClick={() => setStep(1)}`.

- [ ] **Step 10: Verify the page builds**

Run: `npm run build`
Expected: zero TypeScript errors — in particular no leftover reference to `userDetails`, `register`, `errors`, `reset`, or `handleSubmit` from the deleted contact form.

- [ ] **Step 11: Make `userDetails` optional server-side**

In `src/app/api/calculator/gratuity-submit/route.ts`, replace the schema block (lines 7-11):

```ts
// Server-side validation schema — contact info is optional: the calculator no
// longer collects it before showing results, so most submissions arrive with
// no userDetails at all.
const userDetailsSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^[6-9]\d{9}$/),
})
```

Replace the `submissionSchema` (lines 47-51):

```ts
const submissionSchema = z.object({
  userDetails: userDetailsSchema.optional(),
  inputs: calculatorInputsSchema,
  result: resultSchema,
})
```

- [ ] **Step 12: Guard the `users` insert on `userDetails` being present**

Replace the body of `POST` from `const { userDetails, inputs, result } = validationResult.data` (line 100) through the end of the `users` insert block (line 156) with:

```ts
    const { userDetails, inputs, result } = validationResult.data

    // Sanitize inputs
    const sanitizedUserDetails = userDetails
      ? (sanitizeObject(userDetails as unknown as Record<string, unknown>) as unknown as typeof userDetails)
      : null
    const sanitizedInputs = sanitizeObject(inputs as Record<string, unknown>)

    // If Supabase is not configured, return success without saving
    if (!supabaseUrl || !supabaseKey) {
      const localId = `local_calc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      console.log('Supabase not configured, using local ID:', localId)

      return NextResponse.json({
        success: true,
        calculationId: localId,
        storageType: 'local',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let finalUserId = ANONYMOUS_USER_ID

    // Only create/find a user row when contact info was actually provided —
    // most gratuity-calculator submissions are now anonymous.
    if (sanitizedUserDetails) {
      const newUserId = randomUUID()
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          email: sanitizedUserDetails.email,
          full_name: sanitizedUserDetails.fullName,
          phone: sanitizedUserDetails.phone,
          is_deleted: false,
          marketing_consent: false,
        })
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)

        if (userError.code === '23505') {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', sanitizedUserDetails.email)
            .single()

          finalUserId = existingUser ? existingUser.id : ANONYMOUS_USER_ID
        }
      } else {
        finalUserId = newUserId
      }
    }
```

- [ ] **Step 13: Update the `assessments` insert to store `userDetails: null` when absent**

Immediately below (originally lines 158-179), change the `responses` object's `userDetails` key to use `sanitizedUserDetails` (which is now `null` rather than always-present):

```ts
    const { data: calculation, error: calcError } = await supabase
      .from('assessments')
      .insert({
        user_id: finalUserId,
        company_id: null,
        payment_id: null,
        assessment_type: 'gratuity_calculator',
        status: 'completed',
        responses: {
          userDetails: sanitizedUserDetails,
          inputs: sanitizedInputs,
          result: result,
        },
        overall_score: null,
        category_scores: null,
        action_items: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()
```

- [ ] **Step 14: Write the unit test for the anonymous path**

Create `tests/unit/gratuity-submit.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mock = vi.hoisted(() => {
  const state = {
    usersInsertCalls: 0,
    insertedAssessment: null as null | Record<string, unknown>,
  }
  const client = {
    from: (table: string) => {
      if (table === 'users') {
        return {
          insert: () => {
            state.usersInsertCalls += 1
            return {
              select: () => ({
                single: async () => ({ data: null, error: null }),
              }),
            }
          },
        }
      }
      return {
        insert: (row: Record<string, unknown>) => {
          state.insertedAssessment = row
          return {
            select: () => ({
              single: async () => ({ data: { id: 'calc-1', ...row }, error: null }),
            }),
          }
        },
      }
    },
  }
  return { state, client }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mock.client,
}))

import { POST } from '@/app/api/calculator/gratuity-submit/route'

const BASE_INPUTS = {
  employmentType: 'regular' as const,
  basicDA: 50000,
  dateOfJoining: '2015-01-01',
  lastWorkingDate: '2026-01-01',
}

const BASE_RESULT = {
  isEligible: true,
  eligibilityReason: 'Completed 5+ years',
  calculatedAmount: 317307,
  cappedAmount: 317307,
  formula: '(50000 x 15 x 11) / 26',
  breakdown: { dailyWage: 1923, totalDays: 165, grossAmount: 317307 },
  serviceDetails: { years: 11, months: 0, days: 0, totalYearsForCalculation: 11 },
  effectiveYears: 11,
  isCapped: false,
  compliance: {
    paymentDueDate: '2026-01-31',
    paymentDeadline: 'Within 30 days',
    employerInsuranceRequired: false,
    taxExemption: 'Fully exempt',
  },
}

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/calculator/gratuity-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  )
}

describe('POST /api/calculator/gratuity-submit — anonymous by default', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
    mock.state.usersInsertCalls = 0
    mock.state.insertedAssessment = null
  })

  it('accepts a payload with no userDetails and does not insert a users row', async () => {
    const res = await post({ inputs: BASE_INPUTS, result: BASE_RESULT })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mock.state.usersInsertCalls).toBe(0)
    expect((mock.state.insertedAssessment?.responses as { userDetails: unknown }).userDetails).toBeNull()
  })

  it('still inserts a users row when userDetails is present', async () => {
    const res = await post({
      userDetails: { fullName: 'Test User', email: 'user@example.com', phone: '9876543210' },
      inputs: BASE_INPUTS,
      result: BASE_RESULT,
    })
    expect(res.status).toBe(200)
    expect(mock.state.usersInsertCalls).toBe(1)
  })
})
```

- [ ] **Step 15: Run the new test and verify both cases pass**

Run: `npx vitest run tests/unit/gratuity-submit.test.ts`
Expected: 2 passed, 0 failed.

- [ ] **Step 16: Leave `tests/calculator.spec.ts` untouched**

`tests/calculator.spec.ts`'s Gratuity Calculator describe block (lines 113-234) never fills a name/email/phone field before looking for salary/date inputs — it goes straight for `getByLabel(/salary|basic|last.*drawn/i)`. Removing the contact-info step makes those fields reachable one step sooner than before; no change needed here. Confirm this by running it after Task 2 Steps 1-13 are done: `npx playwright test tests/calculator.spec.ts --grep "Gratuity"` (informational — do not block the plan on pre-existing weak assertions in this file, several of which are no-op `expect(true).toBe(true)` placeholders that predate this plan).

- [ ] **Step 17: Commit**

```bash
git add src/app/calculator/gratuity/page.tsx src/app/api/calculator/gratuity-submit/route.ts tests/unit/gratuity-submit.test.ts
git commit -m "Remove gratuity calculator's contact-info gate — show results with no signup"
```

---

### Task 3: Document the exception in CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (section 11, "Assessment Page Standards")

**Interfaces:**
- Consumes: nothing.
- Produces: nothing (documentation only).

- [ ] **Step 1: Add an exception paragraph directly under the Step 0 code block in section 11**

In `CLAUDE.md`, immediately after the "Step 0 — Company Details Form" code block (the ```` ```\nfullName → email → phone → companyName → state → employeeCount → industry\n``` ```` block) and before the "### Yes/No Buttons" heading, insert:

```markdown
**Exception — DPDP and Gratuity Calculator:** these two flows intentionally do **not** collect `fullName`/`email`/`phone`/`companyName` before showing value, per the 2026-07 growth-plan fix (`docs/Fixes as on 9 July.md`, fix #1 and #4). DPDP's Step 0 still collects `state`/`employeeCount`/`industry`/`revenue` and the 4 data-processing yes/no questions — these genuinely personalise which assessment questions are shown, so they stay — but contact info is deferred to the existing post-completion `<GatedResults>` email-OTP gate on the results page (no new gate was built; the mechanism already existed and is now DPDP's only identity gate). The Gratuity Calculator drops the gate entirely: calculator inputs and results show immediately, matching the homepage's "No signup required. Free forever." promise for calculators. Do not extend this exception to any other assessment type without an explicit decision — every other assessment (`statutory_health`, `labour_code`, `state_wise_compliance`, `food_business`, `posh`, `auto_dealer`) still follows the full 7-field Step 0 above.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Document DPDP/Gratuity contact-info-gate exception in CLAUDE.md"
```

---

## Self-Review Notes

- **Spec coverage:** Growth-plan fix #1 (DPDP PII gate) → Task 1. Fix #4 (calculator contradiction) → Task 2. CLAUDE.md §11 conflict → Task 3. All three covered.
- **Placeholder scan:** none found — every step has literal code or an exact command.
- **Type consistency:** `OrganizationProfile` in `dpdp-submit/route.ts` matches the trimmed client-side schema (both now treat `fullName`/`email`/`phone`/`companyName` as optional). `GratuitySubmissionSchema`'s `userDetails` is `.optional()` matching the client no longer sending it.
- **Known trade-off (flagged, not hidden):** DPDP's results-page company name display (`DPDPResultsView`, `src/app/results/[id]/page.tsx:895`) will now usually be blank since `companyName` is never collected pre-completion. The JSX already guards this (`{companyName && (...)}` at line 924) — no crash, just no company name shown in the report header. This is an accepted consequence of moving contact info out of Step 0, not a regression to fix in this plan.
