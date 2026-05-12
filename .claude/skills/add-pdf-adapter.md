# Skill: add-pdf-adapter

Wire an existing assessment type into the unified PDF report system. Use this when an assessment page already exists but lacks a PDF download.

## Inputs to gather from the user

Before starting, confirm:
1. **Assessment type key** — e.g. `CYBER_SECURITY` / `cyber_security`
2. **Legislation name** — e.g. "IT Act, 2000 & CERT-In Guidelines"
3. **Key penalty amounts** — e.g. "Up to Rs. 5 Cr per violation"
4. **Official resources** — government portal URLs to include in the report
5. **Key deadlines** — compliance filing deadlines if any

If any are missing, ask the user before proceeding.

---

## Step 1 — Read the existing assessment

Read `src/lib/assessments/{slug}-questions.ts` to understand:
- The full list of question IDs
- The categories used
- What `complianceAnswer` is for each question (yes/no)

This is the source of truth for building compliance rules.

---

## Step 2 — Create compliance rules file

**File:** `src/lib/pdf/{slug}-compliance-rules.ts`

Reference: `src/lib/pdf/dpdp-compliance-rules.ts`

For every question in the assessment, add a `ComplianceRule` entry:

```typescript
export interface ComplianceRule {
  questionId: string
  category: string
  requirement: string       // What the law requires
  governmentRef: string     // Act name + section
  officialLink: string      // URL to official portal or act
  deadline: string          // Filing/compliance deadline
  penalty: string           // Penalty text if non-compliant
  actionIfNonCompliant: string[]  // 2-4 remediation steps
  actionIfCompliant: string       // Confirmation text
  applicabilityNote?: string      // Optional threshold note
}

export const {TYPE_KEY}_COMPLIANCE_RULES: ComplianceRule[] = [ ... ]

export const {TYPE_KEY}_CATEGORY_LABELS: Record<string, string> = {
  // internal_key: 'Display Label'
}
```

---

## Step 3 — Add report config

**File:** `src/lib/pdf/report-configs.ts`

Append (do not modify existing configs):

```typescript
export const {TYPE_KEY}_CONFIG: ReportConfig = {
  assessmentTitle: '{Display Name}',
  assessmentSubtitle: 'Gap Assessment Report',
  legislationDescription: '{legislation name}',
  filenamePrefix: '{Hyphenated-Filename-Prefix}',
  resources: [
    { name: '{Portal Name}', url: '{url}' },
    // add 2–5 entries
  ],
  legislation: [
    '{Full Act Name, Year}',
    // add relevant acts
  ],
  deadlines: [
    { item: '{Compliance item}', date: '{deadline}' },
    // add relevant deadlines
  ],
}
```

---

## Step 4 — Add adapter function

**File:** `src/lib/pdf/report-data-adapter.ts`

1. At the top of the file, add the new imports alongside existing ones:
   ```typescript
   import { {TYPE_KEY}_COMPLIANCE_RULES, {TYPE_KEY}_CATEGORY_LABELS } from './{slug}-compliance-rules'
   import { {TYPE_KEY}_CONFIG } from './report-configs'
   ```

2. Append the adapter function following the 5-step pattern used by `adaptDPDP()` (read lines 200–310 of `report-data-adapter.ts` for the exact template):

```typescript
export function adapt{TypeName}Result(data: AssessmentData): UnifiedReportData {
  // Step 1: Extract user details
  const userDetails = extractUserDetails(data)

  // Step 2: Parse category scores
  const categoryScores: UnifiedCategoryScore[] = Object.entries(
    data.category_scores ?? {}
  ).map(([key, score]) => ({
    category: {TYPE_KEY}_CATEGORY_LABELS[key] ?? key,
    score: (score as number) ?? 0,
    status: ((score as number) ?? 0) >= 80 ? 'compliant'
           : ((score as number) ?? 0) >= 50 ? 'needs_attention'
           : 'non_compliant',
  }))

  // Step 3–4: Build action items and compliant items
  const actionItems: UnifiedActionItem[] = []
  const compliantItems: UnifiedCompliantItem[] = []

  for (const rule of {TYPE_KEY}_COMPLIANCE_RULES) {
    const answer = data.responses?.[rule.questionId]
    if (answer === 'no') {
      actionItems.push({
        questionId: rule.questionId,
        category: rule.category,
        requirement: rule.requirement,
        governmentRef: rule.governmentRef,
        officialLink: rule.officialLink,
        deadline: rule.deadline,
        penalty: rule.penalty,
        actions: rule.actionIfNonCompliant,
        priority: 'high', // refine based on category score if desired
      })
    } else if (answer === 'yes') {
      compliantItems.push({
        questionId: rule.questionId,
        category: rule.category,
        requirement: rule.requirement,
        confirmation: rule.actionIfCompliant,
      })
    }
  }

  // Step 5: Return unified structure
  const overallScore = (data.overall_score) ?? 0
  return {
    assessmentId: data.id ?? `local_${Date.now()}`,
    overallScore,
    riskLevel: overallScore >= 80 ? 'Low Risk'
              : overallScore >= 60 ? 'Moderate Risk'
              : overallScore >= 40 ? 'High Risk'
              : 'Critical Risk',
    penaltyExposure: overallScore >= 80 ? 'Minimal' : '{key penalty text}',
    categoryScores,
    actionItems,
    compliantItems,
    userDetails,
    config: {TYPE_KEY}_CONFIG,
  }
}
```

---

## Step 5 — Wire into results page

Check `src/app/results/[id]/page.tsx` and the relevant download-buttons component to confirm `adapt{TypeName}Result` is called when `assessment_type === ASSESSMENT_TYPES.{TYPE_KEY}`.

If it's missing, add the condition following the same `switch`/`if` pattern used for `ASSESSMENT_TYPES.DPDP`.

---

## Validation

```bash
npm run lint     # zero errors
npm run build    # compiles clean
```

Manual check: complete the `{slug}` assessment and download the PDF — confirm it renders title, category scores, action items, and the legislation section correctly.
