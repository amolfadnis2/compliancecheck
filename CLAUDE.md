# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# ComplianceCheck Development Constitution

> **Read this first in every session.** These rules are non-negotiable and encode lessons learned from production incidents. Violating any of them will cause build failures, data loss, or incorrect UI.

---

## Thinking Framework

These principles govern how to approach every task in this project:

1. **Ask, don't assume.** If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements.

2. **Simplest solution first.** Always implement the simplest thing that could work. Do not add abstractions or flexibility that weren't explicitly requested.

3. **Don't touch unrelated code.** If a file or function is not directly part of the current task, do not modify it, even if you think it could be improved.

4. **Flag uncertainty explicitly.** If you are not confident about an approach or technical detail, say so before proceeding. Confidence without certainty causes more damage than admitting a gap.

5. **Suggest better approaches.** Always be open to — and proactively surface — ideas that are cleaner, more durable, or have longer-lasting impact than a tactical fix.

---

## 0. Commands

```bash
npm run dev      # Start Next.js dev server on localhost:3000
npm run build    # Production build (type-check + compile)
npm run lint     # ESLint — must be zero errors before committing
npx vitest       # Run unit tests (vitest — no npm test script defined)
npx vitest run src/path/to/file.test.ts  # Run a single test file
```

Required environment variables (create `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

---

## 1. Git & Branch Rules

- **Active branch is `master`** — not `main`. Always confirm with `git branch` before pushing.
- Push to `origin master` only unless you have been explicitly told to use a feature branch.
- Never force-push to `master`. Never skip hooks (`--no-verify`).
- Commit message format: imperative mood, present tense, one line summary + optional body.

---

## 2. Build & Lint Gate

Every commit that touches source files MUST pass both before pushing:

```bash
npm run lint    # zero errors — ESLint errors block Netlify build
npm run build   # zero errors — type errors block deployment
```

ESLint config: `.eslintrc.json` — extends `next/core-web-vitals` + `next/typescript`.  
Unused variables prefixed with `_` are exempt. No other exceptions.

---

## 3. Service Client Initialisation (Netlify Build Safety)

**Never instantiate service clients at module level.** Netlify evaluates module-level code at build time when env vars are absent, causing build failures.

**Wrong:**
```typescript
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
```

**Correct (lazy-init pattern):**
```typescript
let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabase
}
```

Applies to: Supabase (`createClient`), Resend (`new Resend(...)`), Razorpay (`new Razorpay(...)`).

---

## 4. Score Arithmetic — `??` Not `||`

A score of **0 is a valid, meaningful value** (0% compliant = worst case). Using `||` will treat 0 as falsy and substitute the default, corrupting results.

**Wrong:**
```typescript
const score = data.overall_score || 0      // 0 → 0  (ok by accident)
const score = assessment.overall_score || 50  // 0 → 50  (WRONG — shows 50% for 0% compliant!)
```

**Correct:**
```typescript
const score = data.overall_score ?? 0
const score = assessment.overall_score ?? 0
```

Use `??` everywhere a number could legitimately be 0: scores, counts, indices.

---

## 5. jsPDF — ASCII Only

jsPDF's default font (Helvetica) cannot render non-ASCII characters. They appear as blank boxes or cause silent truncation.

**Always run text through `cleanText()` before any `doc.text()` call:**

```typescript
function cleanText(text: string): string {
  return text
    .replace(/[‘’‚‛]/g, "'")   // Smart single quotes
    .replace(/[“”„‟]/g, '"')   // Smart double quotes
    .replace(/–/g, '-')                        // En-dash
    .replace(/—/g, '--')                       // Em-dash
    .replace(/•/g, '*')                        // Bullet
    .replace(/ /g, ' ')                        // Non-breaking space
    .replace(/…/g, '...')                      // Ellipsis
    .replace(/₹/g, 'Rs.')                      // ₹ (Unicode escape)
    .replace(/₹/g, 'Rs.')                           // ₹ (literal)
    .replace(/[^\x00-\x7F]/g, '')                  // Strip remaining non-ASCII
}
```

This function exists in `src/lib/pdf/unified-report-generator.ts`. Do not duplicate it; import it.

---

## 6. JSX — No Raw Apostrophes

Unescaped apostrophes inside JSX text cause ESLint errors that **block the Netlify build**.

**Wrong:**
```tsx
<p>Don't miss this step</p>
<p>Company's details</p>
```

**Correct:**
```tsx
<p>Don&apos;t miss this step</p>
<p>Company&apos;s details</p>
```

---

## 7. Shell — `cmd` Not PowerShell

When running npm or git commands in terminal, use `cmd` shell syntax. PowerShell uses different quoting, path separators, and environment variable syntax that can break commands.

---

## 8. Supabase — Every Anonymous-Write Table Needs an RLS INSERT Policy

Any table that receives writes from unauthenticated users MUST have an explicit RLS INSERT policy, or the write will be silently rejected.

```sql
-- Pattern for anonymous assessment inserts:
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.my_table
  FOR INSERT WITH CHECK (true);
```

After adding any new table that will receive anonymous writes, verify the policy exists before deploying.

---

## 9. Constants — Single Source of Truth

| What | Import From |
|------|-------------|
| `ASSESSMENT_TYPES`, `ASSESSMENT_PRICING`, `getAssessmentDisplayName` | `@/lib/constants/assessment-types` |
| `INDIAN_STATES`, `EMPLOYEE_COUNT_OPTIONS`, `INDUSTRY_OPTIONS`, `RUPEE` | `@/lib/constants/india` |
| `ANALYTICS_EVENTS` | `@/lib/analytics/events` |

**Never** hardcode assessment type strings like `'statutory_health'`. Always use `ASSESSMENT_TYPES.STATUTORY_HEALTH`.  
**Never** import from the legacy flat file `@/lib/constants` (it is being phased out).

---

## 10. Analytics — Use Typed Constants, Not String Literals

**Wrong:**
```typescript
posthog.capture('assessment_completed', { ... })
posthog.capture('report_downloaded', { ... })
```

**Correct:**
```typescript
import { analytics } from '@/lib/analytics'
analytics.assessmentCompleted({ assessment_type: ASSESSMENT_TYPES.DPDP, ... })
analytics.reportDownloaded({ ... })
```

The `analytics` object in `src/lib/analytics/tracking.ts` wraps every event with type-safe props and guards against PostHog not being loaded. Use it everywhere.

---

## 11. Assessment Page Standards (from `ASSESSMENT_BASELINE_STANDARD.md`)

Every assessment page MUST conform to all of the following:

### Step 0 — Company Details Form (7 fields, exact order)
```
fullName → email → phone → companyName → state → employeeCount → industry
```
Use `INDIAN_STATES`, `EMPLOYEE_COUNT_OPTIONS`, `INDUSTRY_OPTIONS` from `@/lib/constants/india`. Never hardcode dropdown lists.

### Yes/No Buttons
```typescript
// Yes (selected)
className="bg-green-700 hover:bg-green-800 text-white"
// No (selected)
className="bg-red-700 hover:bg-red-800 text-white"
```

### Icons
```typescript
import { CheckCircle, XCircle } from 'lucide-react'  // NOT CheckCircle2
```

### Auto-Advance
```typescript
setTimeout(() => handleNext(), 800)  // Always 800ms — do not change
```

### Progress Bar
```tsx
<Progress
  value={progressPercentage}
  className="h-3 [&>div]:bg-green-600"
  aria-label={`Assessment progress: ${progressPercentage}% complete`}
/>
```
Always `h-3`. Always `aria-label`. Always `[&>div]:bg-green-600`. Both applicability and compliance phases.

### Required Shared Components
- `<AssessmentHeader>` from `@/components/assessment/assessment-header`
- `<EmailGate>` from `@/components/identity/EmailGate` (gates results behind email)
- `<FeedbackForm>` accessible via results page after completion

### PDF Generation
All assessments use `generateUnifiedReportBlob` from `src/lib/pdf/unified-report-generator.ts` via the `report-data-adapter.ts` adapters. Never create a new standalone PDF generator.

### Database Persistence
Every assessment submit handler MUST:
1. Write to Supabase (not just localStorage)
2. Return a local fallback ID (`local_${Date.now()}`) if Supabase is unconfigured — never return a 500 on missing env vars
3. Be wrapped in `try/catch` — never let an unhandled rejection reach the client

---

## 12. Dead Code Policy

As of 2026-06-12 all files in the original dead-code list have been deleted. The policy stands: if you confirm a file has zero importers and no callers, add it to this list before deleting.

Historical list (confirmed gone):
- `src/lib/pdf/report-generator.ts`
- `src/lib/pdf/posh-report-generator.ts`
- `src/lib/pdf/report-template.tsx`
- `src/components/results/download-buttons-with-feedback.tsx`
- `src/components/assessment/auto-save.tsx`
- `src/app/api/assessment/submit/route.ts`
- `src/app/api/assessment/create/route.ts`
- `src/app/api/assessment/free-submit/route.ts`
- `src/app/api/assessment/[id]/pdf/route.tsx`
- `src/lib/analytics/useAssessmentAnalytics.ts` (zero importers — deleted 2026-06-12)

---

## 13. POSH Assessment Specifics

POSH writes to a **separate** `posh_assessments` table (not the generic `assessments` table). This is intentional — POSH has extra columns (applicability_responses, full_name, phone) that don't fit the generic schema cleanly.

RLS policy in `supabase/migrations/20260504000000_create_posh_assessments_table.sql`.

Do not fold `posh_assessments` into `assessments` without a deliberate schema migration plan.

---

## 14. Auto Dealer Assessment Specifics

The auto-dealer assessment is **intentionally different** from all other assessments:
- Multi-phase architecture (applicability → 4 compliance phases)
- OTP-based email verification (not the general `<EmailGate>`)
- Server-side PDF generation (jsPDF in API route, not client-side)
- Writes to `auto_dealer_assessments` table (not `assessments`)
- 600ms auto-advance (by design for its phase structure)
- Razorpay payment gate before report delivery

Do not attempt to standardise these divergences — they are architectural decisions, not bugs.

---

## 15. Penalty Exposure Calculator

Writes nothing to Supabase by design (email-only flow via Resend). If DB persistence is added, use `assessments` table with `assessment_type = 'penalty_exposure'` and add the type to the relevant migration.

---

## 16. Supabase Client Selection

Three distinct clients in `src/lib/supabase/` — pick the right one:

| Client | File | Use When |
|--------|------|----------|
| Browser | `client.ts` | Client components (uses anon key) |
| Server | `server.ts` | Server Components, reads cookies for auth session |
| Admin | `admin.ts` | API routes that need to bypass RLS (service role key) |

`createAdminClient()` throws if env vars are missing — never call it from client components.

---

## 17. Admin Dashboard

Protected route at `/admin` — uses a separate auth flow in `src/app/admin/(auth)/login`. The dashboard at `/admin/(dashboard)/assessments` reads from all assessment tables via `src/app/api/admin/stats/`. TypeScript types for admin data live in `src/types/` (not in lib).

---

## 18. Project Structure Quick Reference

```
src/
├── app/
│   ├── (auth)/                  # User auth routes (login, register, forgot-password)
│   ├── admin/                   # Admin dashboard (separate auth at admin/(auth)/login)
│   ├── api/assessment/          # Submit endpoints (one per assessment type)
│   │   └── auto-dealer/         # Multi-phase endpoints (keep separate)
│   ├── assessment/              # Assessment page routes
│   ├── assessments/landing/     # SEO landing pages per assessment type
│   ├── calculator/              # CTC, Gratuity calculators
│   ├── calculators/             # Penalty Exposure calculator
│   └── results/[id]/            # Shared results page (reads from Supabase by ID)
├── components/
│   ├── assessment/              # Shared assessment components (AssessmentHeader, etc.)
│   ├── identity/                # EmailGate, OTPInput, ConsentCheckboxes
│   ├── results/                 # DownloadButtons, GatedResults, LocalStorageResults
│   └── feedback/                # FeedbackForm (NPS)
├── lib/
│   ├── analytics/               # PostHog events, tracking, hooks
│   ├── assessments/             # Question definitions and scoring logic per type
│   ├── constants/               # assessment-types.ts, india.ts (single sources of truth)
│   ├── feature-flags/           # Env-var-backed flags (no runtime dependency)
│   ├── pdf/                     # unified-report-generator.ts + report-data-adapter.ts
│   └── supabase/                # browser.ts, server.ts, admin.ts clients
├── types/                       # Admin dashboard TypeScript types
└── supabase/migrations/         # All schema changes — never edit live DB directly
```

---

*Last updated: 2026-05-07 by Claude Code (Phase 2 — Step 1)*  
*This file supersedes any conflicting instructions in other docs.*
