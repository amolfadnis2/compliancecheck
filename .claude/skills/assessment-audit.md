# Skill: assessment-audit

Audit an existing assessment page against the CLAUDE.md §11 standards and report every violation with file:line references. Use before committing or after making changes to an assessment page.

## Inputs to gather from the user

1. **Assessment slug** — e.g. `dpdp`, `food-business`, `labour-code`

---

## Procedure

Read the following files:
- `src/app/assessment/{slug}/page.tsx` — the assessment page
- `src/app/api/assessment/{slug}-submit/route.ts` — the submit endpoint

Then check every item below. For each item, output **PASS** or **FAIL**. For failures, include the file path and line number.

---

## Checklist

### A. Company Details Form (Step 0)

- [ ] **A1 — 7 fields present**: `fullName`, `email`, `phone`, `companyName`, `state`, `employeeCount`, `industry` all exist in the form
- [ ] **A2 — Field order**: fields appear in exactly the above order in the JSX
- [ ] **A3 — State dropdown**: uses `INDIAN_STATES` from `@/lib/constants/india` (not a hardcoded array)
- [ ] **A4 — Employee count dropdown**: uses `EMPLOYEE_COUNT_OPTIONS` from `@/lib/constants/india`
- [ ] **A5 — Industry dropdown**: uses `INDUSTRY_OPTIONS` from `@/lib/constants/india`

### B. Yes/No Buttons

- [ ] **B1 — Yes selected class**: `className` contains exactly `bg-green-700 hover:bg-green-800 text-white`
- [ ] **B2 — No selected class**: `className` contains exactly `bg-red-700 hover:bg-red-800 text-white`

### C. Icons

- [ ] **C1 — Correct icon**: imports `CheckCircle` and `XCircle` from `lucide-react`
- [ ] **C2 — No CheckCircle2**: `CheckCircle2` does NOT appear in any import

### D. Auto-advance

- [ ] **D1 — 800ms timing**: `setTimeout(() => handleNext(), 800)` — exactly 800, not 600 or 1000
- [ ] **D2 — No other setTimeout delays**: no other auto-advance timers with different durations (unless this is the auto-dealer assessment, which intentionally uses 600ms)

### E. Progress Bar

- [ ] **E1 — Height class**: `<Progress>` has `h-3`
- [ ] **E2 — Color override**: `<Progress>` has `[&>div]:bg-green-600`
- [ ] **E3 — aria-label**: `<Progress>` has an `aria-label` prop (e.g. `aria-label={\`Assessment progress: ${progressPercentage}% complete\`}`)

### F. Score Arithmetic

- [ ] **F1 — No `||` for scores**: search for `|| 0`, `|| 50`, `|| 100` near score variables — none should appear; all must use `??`
- [ ] **F2 — `??` used**: score reads use `?? 0` pattern

### G. Required Shared Components

- [ ] **G1 — AssessmentHeader**: `<AssessmentHeader>` is imported from `@/components/assessment/assessment-header` and rendered
- [ ] **G2 — EmailGate**: `<EmailGate>` is imported from `@/components/identity/EmailGate` and wraps the results view

### H. API Route

- [ ] **H1 — try/catch**: the entire submit handler body is wrapped in `try/catch`
- [ ] **H2 — Fallback ID**: `let assessmentId = \`local_${Date.now()}\`` is set before the Supabase call
- [ ] **H3 — Lazy-init Supabase**: no `createClient(...)` call at module level — must be inside a function or lazy-init pattern
- [ ] **H4 — No module-level Resend/Razorpay**: same lazy-init rule applies to `new Resend(...)` and `new Razorpay(...)`

### I. Dead Code Imports

Check that NONE of these dead files are imported (CLAUDE.md §12):
- [ ] **I1**: `src/lib/pdf/report-generator.ts`
- [ ] **I2**: `src/lib/pdf/posh-report-generator.ts`
- [ ] **I3**: `src/lib/pdf/report-template.tsx`
- [ ] **I4**: `src/components/results/download-buttons-with-feedback.tsx`
- [ ] **I5**: `src/components/assessment/auto-save.tsx`

### J. JSX Safety

- [ ] **J1 — No raw apostrophes**: search JSX text nodes for `'` — should be `&apos;` instead
- [ ] **J2 — No raw `<` or `>`** in JSX text nodes

### K. Constants

- [ ] **K1 — No hardcoded assessment type strings**: no string literals like `'statutory_health'`, `'dpdp'`, etc. — must use `ASSESSMENT_TYPES.*`

---

## Output format

```
Assessment Audit: {slug}
========================

A. Company Details Form
  A1 PASS
  A2 FAIL  src/app/assessment/{slug}/page.tsx:142 — field order wrong (phone before email)
  ...

B. Yes/No Buttons
  B1 PASS
  B2 FAIL  src/app/assessment/{slug}/page.tsx:287 — uses bg-red-600 instead of bg-red-700
  ...

[continue for all sections]

Summary: {N} PASS / {M} FAIL
```

For each FAIL, include a brief explanation of what was found vs. what was expected.

---

## After the audit

If there are failures, ask the user: "Would you like me to fix these violations now?"

If yes, fix each violation in place, then re-run:
```bash
npm run lint
npm run build
```

Both must pass with zero errors before marking the task complete.
