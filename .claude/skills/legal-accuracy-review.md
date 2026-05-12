# Skill: legal-accuracy-review

Act as an in-house legal expert. Read all legal claims embedded in an assessment (thresholds, penalties, act sections, deadlines) and cross-check them against live government sources. Flag anything outdated or incorrect with specific file:line references and recommended fixes.

## Step 1 — Identify the assessment to review

Ask the user which assessment type to audit:
`dpdp` | `labour-code` | `statutory-health` | `posh` | `food-business` | `state-wise-compliance` | `auto-dealer`

If not provided, ask before proceeding.

---

## Step 2 — Extract all legal claims from the codebase

Read these files and extract every legal claim (threshold, penalty, deadline, act section):

| Assessment | Questions file | Rules file |
|---|---|---|
| `dpdp` | `src/lib/assessments/dpdp-questions.ts` | `src/lib/pdf/dpdp-compliance-rules.ts` |
| `labour-code` | `src/lib/assessments/labour-code-questions.ts` | `src/lib/assessments/labour-code-rules.ts` |
| `statutory-health` | `src/lib/assessments/statutory-health-questions.ts` | (inline in `src/components/results/download-buttons.tsx`) |
| `posh` | `src/lib/assessments/posh/` (all files) | — |
| `food-business` | `src/lib/assessments/food-business-questions.ts` | `src/lib/pdf/food-business-compliance-rules.ts` |
| `state-wise-compliance` | `src/lib/assessments/state-wise-questions.ts` | `src/lib/pdf/state-wise-compliance-rules.ts` |
| `auto-dealer` | `src/lib/assessments/auto-dealer/` (all files) | — |

Also read `src/lib/pdf/report-configs.ts` — pull `legislation`, `deadlines`, and `resources` for this assessment type.

For each claim found, record:
```
Claim: "{exact claim text}"
Source in code: {file}:{line}
Act reference: {act name, year, section if present}
Official URL: {url cited in code, or best-known government source}
```

Pull from:
- `helpText` fields in questions — employee thresholds, penalty amounts, act references
- `complianceAnswer` context — what the "correct" answer implies legally
- `requirement`, `governmentRef`, `officialLink`, `deadline`, `penalty` fields in compliance rules
- `legislation` and `deadlines` arrays in report configs

---

## Step 3 — Verify against official government sources

For each claim, use WebFetch to check the official URL. If the URL cited in code doesn't yield useful content, try the canonical government source listed below.

**Canonical sources per assessment:**

| Assessment | Primary sources |
|---|---|
| DPDP | meity.gov.in, India Gazette DPDP Act 2023, DPDP Rules 2025 |
| Labour Code | labour.gov.in, India Gazette (Code on Wages 2019, SS Code 2020, OSH Code 2020, IR Code 2020) |
| Statutory Health | epfindia.gov.in, esic.gov.in, incometaxindia.gov.in (PT via state acts) |
| POSH | shramsuvidha.gov.in, Ministry of Women & Child Development circulars |
| Food Business | fssai.gov.in, state food authority portals |
| Auto Dealer | relevant state RTO portals, labour department portals |

**For each claim, verify:**
- Is the threshold still current? (e.g. EPF: 20 employees — unchanged since 1952 amendment)
- Is the penalty amount correct and current? (e.g. DPDP consent penalty: matches enacted Schedule)
- Is the deadline accurate? (e.g. DPDP enforcement date — any gazette notification changing it?)
- Is the act section reference correct? (e.g. Section 8(4) — does it actually say what we claim?)
- Has any amendment, notification, or circular superseded this rule since the code was written?

---

## Step 4 — Report findings

Output a structured report in this exact format:

```
Legal Accuracy Review: {Assessment Type}
Date: {today's date}
========================================

✅ VERIFIED ({N} claims checked and confirmed current)
  - {Claim summary} — CONFIRMED ({source + date})
  - ...

⚠️ NEEDS ATTENTION ({N} claims that may be outdated or need manual check)
  - Claim: "{claim text}"
    Code location: {file}:{line}
    Issue: {what the official source shows vs what code says}
    Recommended fix: {specific change to make}
  - ...

❌ INCORRECT ({N} claims found to be definitively wrong)
  - Claim: "{claim text}"
    Code locations: {file}:{line}, {file}:{line}
    What's wrong: {explanation with official source citation}
    Correct value: {what it should say}
    Fix: {exact field/string to change}
  - ...

📋 MANUAL VERIFICATION NEEDED ({N} claims where WebFetch returned no useful content)
  - Claim: "{claim text}"
    Code location: {file}:{line}
    Suggested source to check manually: {URL}
  - ...

Summary: {V} verified / {A} needs attention / {I} incorrect / {M} manual check needed
```

---

## Step 5 — Offer to fix

After delivering the report, ask:

> "Would you like me to apply the corrections for the ❌ INCORRECT items now?"

If yes:
1. Edit the specific `penalty`, `deadline`, `governmentRef`, `helpText`, or `requirement` fields in the compliance rules and questions files
2. Run:
   ```bash
   npm run lint
   npm run build
   ```
3. Both must pass with zero errors before marking done

Do not make changes to passing (✅) items. Only fix confirmed incorrect claims.

---

## Notes on scope

- This skill covers factual accuracy of legal claims, not question quality or UX.
- If a government site is down or returns no useful content, mark as 📋 MANUAL rather than guessing.
- When in doubt, mark ⚠️ NEEDS ATTENTION rather than ❌ INCORRECT — only flag as incorrect when the official source clearly contradicts the code.
- State-specific rules (Professional Tax slabs, S&E thresholds) vary by state — flag any that appear to use a generic national value where state-specific values are required.
