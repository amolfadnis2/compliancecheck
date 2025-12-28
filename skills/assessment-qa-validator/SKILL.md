---
name: assessment-qa-validator
description: "Quality assurance validator for ComplianceCheck assessments. Use when: (1) Validating assessment questions against legislation, (2) Auditing PDF reports for completeness, (3) Verifying thresholds, penalties, and deadlines, (4) Testing scoring algorithms, (5) Reviewing new assessments before launch, (6) Periodic accuracy checks of existing assessments. This skill ensures all assessments meet quality standards: accurate legal citations, complete PDF sections, current penalties/deadlines, and actionable remediation steps."
---

# Assessment QA Validator

Systematic quality assurance for ComplianceCheck compliance assessments. Use this skill to validate questions, PDFs, and scoring before launch or during periodic reviews.

## Validation Framework

### 1. Question Validation Checklist

For EACH question in an assessment, verify:

| Check | Requirement | Pass Criteria |
|-------|-------------|---------------|
| **Legal Basis** | Cites specific Act/Section/Rule | e.g., "EPF Act 1952, Section 6" |
| **Threshold Accuracy** | Employee/wage limits correct | Cross-reference `references/thresholds.md` |
| **Penalty Current** | Fine/imprisonment amounts updated | Check against latest amendments |
| **Deadline Valid** | Filing/registration dates accurate | Verify with official portals |
| **Compliance Answer** | Expected answer clearly defined | `complianceAnswer: 'yes'` or `'no'` |
| **Weight Justified** | Scoring weight reflects severity | High penalty = higher weight (7-10) |
| **Help Text Useful** | Provides actionable context | Not just restating the question |

### 2. PDF Report Completeness Matrix

Every generated PDF MUST contain these sections:

```
┌─────────────────────────────────────────────────────────────────┐
│ SECTION              │ REQUIRED ELEMENTS                       │
├─────────────────────────────────────────────────────────────────┤
│ Executive Summary    │ □ Overall score (prominent)             │
│                      │ □ Status badge                          │
│                      │ □ 2-3 key highlights                    │
├─────────────────────────────────────────────────────────────────┤
│ Requirements         │ □ What the law mandates                 │
│                      │ □ Who it applies to                     │
│                      │ □ Applicability triggers                │
├─────────────────────────────────────────────────────────────────┤
│ Benefits             │ □ Exemptions if compliant               │
│                      │ □ Incentives/rebates available          │
│                      │ □ Risk mitigation achieved              │
├─────────────────────────────────────────────────────────────────┤
│ Penalties            │ □ Fine amounts (Rs. X to Rs. Y)         │
│                      │ □ Imprisonment terms (if applicable)    │
│                      │ □ Responsible persons (Director/HR)     │
│                      │ □ Compounding provisions                │
├─────────────────────────────────────────────────────────────────┤
│ Deadlines            │ □ Registration timelines                │
│                      │ □ Filing due dates                      │
│                      │ □ Renewal periods                       │
│                      │ □ Grace periods if any                  │
├─────────────────────────────────────────────────────────────────┤
│ Action Items         │ □ Priority (High/Medium/Low)            │
│                      │ □ What to fix                           │
│                      │ □ Why it matters (impact)               │
│                      │ □ How to fix (steps)                    │
│                      │ □ Government portal link                │
├─────────────────────────────────────────────────────────────────┤
│ Government Refs      │ □ Act/Code name                         │
│                      │ □ Section numbers                       │
│                      │ □ Official portal URLs                  │
│                      │ □ Form numbers if applicable            │
├─────────────────────────────────────────────────────────────────┤
│ Disclaimer           │ □ "Not legal advice" statement          │
│                      │ □ Recommendation to consult expert      │
│                      │ □ Generated timestamp                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Threshold Validation Reference

Cross-check all employee/wage thresholds against:

**Employee Thresholds (Labour Codes)**
| Count | Provision | Source |
|-------|-----------|--------|
| 1+ | Minimum Wages Act | Code on Wages, S.3 |
| 10+ | ESI (general), Gratuity, Maternity | SS Code S.1(4), Payment of Gratuity Act S.1(3)(b) |
| 20+ | EPF, Bonus | EPF Act S.1(3), Bonus Act S.1(3)(b) |
| 50+ | Creche, Contract Labour | OSH Code S.24, CLRA S.1(4)(a) |
| 100+ | Canteen, Works Committee | OSH Code S.24, IR Code S.3 |
| 300+ | Standing Orders | IR Code S.29 |

**Wage Thresholds**
| Amount | Provision | Source |
|--------|-----------|--------|
| Rs.15,000/month | EPF ceiling | EPF Scheme Para 26A |
| Rs.18,000/month | Supervisor exclusion | Code on Wages S.2(z) |
| Rs.21,000/month | ESI, Bonus ceiling | ESI Act S.2(9), Bonus Act S.2(13) |

### 4. Scoring Algorithm Validation

Test scoring with edge cases:

```typescript
// Test Case 1: Perfect compliance
Input: All questions answered with complianceAnswer
Expected: 100% score, "Compliant" status

// Test Case 2: Zero compliance
Input: All questions answered opposite to complianceAnswer
Expected: 0% score, "Non-Compliant" status

// Test Case 3: Partial compliance (50%)
Input: Half correct, half incorrect
Expected: ~50% score, "Needs Attention" status

// Test Case 4: N/A heavy
Input: Most questions marked N/A
Expected: Score based only on applicable questions

// Test Case 5: Category isolation
Input: One category fully compliant, others not
Expected: 100% for that category, lower overall
```

## Validation Workflow

### Pre-Launch Validation (New Assessment)

```
Step 1: Question Audit
├── Export questions to spreadsheet
├── Add columns: Legal Ref, Threshold, Penalty, Deadline, Verified
├── Fill each cell with authoritative source
├── Flag any gaps or outdated info
└── Update questions.ts with corrections

Step 2: PDF Generation Test
├── Complete assessment with test data
├── Generate PDF
├── Check against completeness matrix above
├── Verify all sections render correctly
├── Test Unicode characters (Rs., checkmarks)
└── Confirm government links are clickable

Step 3: Scoring Validation
├── Run 5 edge case scenarios
├── Verify scores calculate correctly
├── Check category breakdown accuracy
├── Confirm status thresholds (90%/70%)
└── Validate action items generate for gaps

Step 4: Applicability Filter Test
├── Test with 5-employee IT company
├── Test with 100-employee manufacturing
├── Test with 500-employee multi-state
├── Verify correct questions shown/hidden
└── Check question counts are accurate
```

### Periodic Review (Existing Assessment)

```
Quarterly Check:
□ Verify wage ceilings haven't changed (check epfindia.gov.in, esic.gov.in)
□ Confirm penalty amounts are current (check recent amendments)
□ Validate government portal URLs are active
□ Review any new notifications affecting thresholds

Annual Deep Audit:
□ Full question-by-question legal verification
□ PDF template review for completeness
□ Scoring algorithm edge case testing
□ User feedback analysis for accuracy complaints
```

## Validation Report Template

After validation, generate report:

```markdown
# Assessment Validation Report

**Assessment:** [Name]
**Validated By:** Claude QA Validator
**Date:** [Date]
**Version:** [X.X]

## Summary
- Total Questions: X
- Questions Validated: X
- Issues Found: X (High: X, Medium: X, Low: X)

## Question Audit Results

| ID | Issue | Severity | Current | Should Be | Source |
|----|-------|----------|---------|-----------|--------|
| q1 | Penalty outdated | High | Rs.5,000 | Rs.10,000 | Amendment 2024 |
| q7 | Missing threshold | Medium | - | 20+ employees | EPF Act S.1(3) |

## PDF Completeness

| Section | Status | Notes |
|---------|--------|-------|
| Requirements | ✓ Complete | |
| Benefits | ✗ Missing | Add exemption criteria |
| Penalties | ✓ Complete | |
| Deadlines | ⚠ Partial | Missing renewal dates |
| Action Items | ✓ Complete | |
| Government Refs | ✗ Missing | Add portal links |

## Scoring Validation

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Perfect compliance | 100% | 100% | ✓ Pass |
| Zero compliance | 0% | 0% | ✓ Pass |
| 50% compliance | 50% | 48% | ⚠ Check weights |

## Recommended Actions

1. [HIGH] Update penalty in q1 from Rs.5,000 to Rs.10,000
2. [MEDIUM] Add employee threshold context to q7
3. [LOW] Include renewal deadlines in PDF template
```

## Quick Commands

### Validate Single Question
```
Check question [ID] against:
1. Legal basis (Act, Section)
2. Current threshold
3. Latest penalty amount
4. Filing deadline
5. Government portal
```

### Audit Assessment PDF
```
Generate PDF for [assessment] and verify:
1. All 7 required sections present
2. Unicode characters render correctly
3. Links are functional
4. Disclaimer included
```

### Test Scoring Edge Cases
```
Run scoring validation for [assessment]:
1. 100% compliant scenario
2. 0% compliant scenario
3. 50% mixed scenario
4. Heavy N/A scenario
5. Single category perfect
```

## Government Sources for Verification

| Domain | Primary Source | Amendments |
|--------|---------------|------------|
| EPF | epfindia.gov.in | Check Circulars section |
| ESI | esic.gov.in | Check Notifications |
| Labour Codes | labour.gov.in | Check What's New |
| GST | gst.gov.in | Check Notifications |
| DPDP | meity.gov.in | Check DPDP Rules page |
| Companies Act | mca.gov.in | Check Notifications |
