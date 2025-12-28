# Assessment QA Validator - Main Instructions

**Skill Name:** ComplianceCheck Tester
**Purpose:** Quality assurance validator for ComplianceCheck assessments

## When to Use This Skill

Use when:
1. Validating assessment questions against legislation
2. Auditing PDF reports for completeness
3. Verifying thresholds, penalties, and deadlines
4. Testing scoring algorithms
5. Reviewing new assessments before launch
6. Periodic accuracy checks of existing assessments

---

## Validation Framework

### 1. Question Validation Checklist

For EACH question in an assessment, verify:

| Check | Requirement | Pass Criteria |
|-------|-------------|---------------|
| **Legal Basis** | Cites specific Act/Section/Rule | e.g., "EPF Act 1952, Section 6" |
| **Threshold Accuracy** | Employee/wage limits correct | Cross-reference Thresholds Reference doc |
| **Penalty Current** | Fine/imprisonment amounts updated | Cross-reference Penalties Reference doc |
| **Deadline Valid** | Filing/registration dates accurate | Verify with official portals |
| **Compliance Answer** | Expected answer clearly defined | `complianceAnswer: 'yes'` or `'no'` |
| **Weight Justified** | Scoring weight reflects severity | High penalty = higher weight (7-10) |
| **Help Text Useful** | Provides actionable context | Not just restating the question |

### 2. PDF Report Completeness Matrix

Every generated PDF MUST contain these sections:

| Section | Required Elements |
|---------|-------------------|
| **Executive Summary** | Overall score (prominent), Status badge, 2-3 key highlights |
| **Requirements** | What the law mandates, Who it applies to, Applicability triggers |
| **Benefits** | Exemptions if compliant, Incentives/rebates, Risk mitigation |
| **Penalties** | Fine amounts, Imprisonment terms, Responsible persons, Compounding |
| **Deadlines** | Registration timelines, Filing due dates, Renewal periods, Grace periods |
| **Action Items** | Priority, What to fix, Why it matters, How to fix, Portal links |
| **Government Refs** | Act/Code name, Section numbers, Official URLs, Form numbers |
| **Disclaimer** | "Not legal advice", Consult expert recommendation, Timestamp |

### 3. Scoring Algorithm Validation

Test with these edge cases:

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Perfect compliance | All correct answers | 100%, "Compliant" |
| Zero compliance | All wrong answers | 0%, "Non-Compliant" |
| Partial (50%) | Half correct | ~50%, "Needs Attention" |
| N/A heavy | Most N/A | Score on applicable only |
| Category isolation | One category perfect | 100% for that category |

---

## Validation Workflows

### Pre-Launch (New Assessment)

**Step 1: Question Audit**
- Export questions to spreadsheet
- Add columns: Legal Ref, Threshold, Penalty, Deadline, Verified
- Fill each cell with authoritative source
- Flag gaps or outdated info

**Step 2: PDF Generation Test**
- Complete assessment with test data
- Generate PDF
- Check against completeness matrix
- Test Unicode (Rs., checkmarks)
- Verify links are clickable

**Step 3: Scoring Validation**
- Run 5 edge case scenarios
- Verify category breakdown accuracy
- Confirm status thresholds (90%/70%)

**Step 4: Applicability Filter Test**
- Test: 5-employee IT company
- Test: 100-employee manufacturing
- Test: 500-employee multi-state
- Verify correct questions shown/hidden

### Periodic Review (Existing)

**Quarterly:**
- Verify wage ceilings (epfindia.gov.in, esic.gov.in)
- Confirm penalty amounts current
- Validate government portal URLs active

**Annual:**
- Full question-by-question legal verification
- PDF template completeness review
- Scoring edge case testing
- User feedback analysis

---

## Validation Report Template

```markdown
# Assessment Validation Report

**Assessment:** [Name]
**Validated By:** Claude QA Validator
**Date:** [Date]

## Summary
- Total Questions: X
- Issues Found: X (High: X, Medium: X, Low: X)

## Question Audit Results

| ID | Issue | Severity | Current | Should Be | Source |
|----|-------|----------|---------|-----------|--------|

## PDF Completeness

| Section | Status | Notes |
|---------|--------|-------|

## Scoring Validation

| Test Case | Expected | Actual | Status |
|-----------|----------|--------|--------|

## Recommended Actions
1. [HIGH] ...
2. [MEDIUM] ...
3. [LOW] ...
```

---

## Quick Commands

**Validate Single Question:**
"Check question [ID] for: legal basis, threshold, penalty, deadline, portal link"

**Audit PDF:**
"Verify PDF has all 8 required sections and Unicode renders correctly"

**Test Scoring:**
"Run 5 scoring edge cases: 100%, 0%, 50%, N/A heavy, single category"

---

## Government Sources

| Domain | Portal | Check |
|--------|--------|-------|
| EPF | epfindia.gov.in | Circulars |
| ESI | esic.gov.in | Notifications |
| Labour Codes | labour.gov.in | What's New |
| GST | gst.gov.in | Notifications |
| DPDP | meity.gov.in | DPDP Rules |
| Companies | mca.gov.in | Notifications |
