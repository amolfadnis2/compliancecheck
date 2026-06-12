# ComplianceCheck Codebase Audit — 2026-06-11

**Branch:** `claude/exciting-cannon-o4wtfv` @ `d9e5075f` (clean tree)
**Scope:** Phase 1 — read-only analysis. No source changes made.
**Method:** Full-repo static review (architecture, security, correctness, build, analytics, payments) + `npm run lint`, `npx tsc --noEmit`, and a full `npm run build` executed in this container. Prior audit (`audit/REPO_AUDIT_REPORT.md`, 2026-05-07) used as baseline; recurring items are marked **[recurring]**.

---

## 1. Executive Summary

**Overall health: C+.** The build is green (lint zero errors; production build succeeds *with no env vars set*, proving the lazy-init rule holds everywhere), and the constitution (CLAUDE.md) is respected in most newer code. But the platform currently **exposes assessment PII to unauthenticated users via four independent paths**, and the payment plumbing has a dead end that would silently drop revenue the day Razorpay is switched on.

Top 5 risks:
1. **POSH table is world-readable** — `USING (true)` SELECT policy lets anyone dump every row of `posh_assessments` (names, emails, phones, sexual-harassment compliance answers). (SEC-01)
2. **IDOR on assessment reads** — `/api/assessment/[id]`, `/results/[id]`, and the auto-dealer JSON results endpoint return full PII to anyone holding (or guessing) a UUID, with the auto-dealer path even bypassing its own email-verification gate. (SEC-02/03/04)
3. **No code path ever marks a Razorpay payment as `paid`** — order creation exists, verification/webhook does not; paid customers would never get their report. (PAY-01)
4. **OTP codes stored in plaintext, generated with `Math.random()`** — the identity gate protecting reports is weaker than it looks. (SEC-06)
5. **Status-band chaos** — at least five different score→status threshold sets across pages, PDFs, and emails mean the same score reads "Compliant" in one artifact and "Needs Attention" in another. (COR-02)

---

## 2. Findings Table

| ID | Severity | Area | File | Summary |
|----|----------|------|------|---------|
| SEC-01 | CRITICAL | Security/RLS | `supabase/migrations/20260504000000_create_posh_assessments_table.sql:48-50` | `USING (true)` SELECT policy — whole-table anonymous read of POSH PII |
| SEC-02 | CRITICAL | Security/IDOR | `src/app/api/assessment/[id]/route.ts:21-91` | Service-role read of any assessment + joined user/company PII, no ownership check |
| SEC-03 | CRITICAL | Security/IDOR | `src/app/results/[id]/page.tsx:100-105` | Results page renders any assessment's PII to whoever has the UUID |
| SEC-04 | CRITICAL | Security/IDOR | `src/app/api/assessment/auto-dealer/[id]/report.pdf/route.ts:758-783` | JSON branch returns full report + PII without the `email_verified` check the PDF branch enforces |
| SEC-05 | CRITICAL | Security | `src/app/api/debug/db-test/route.ts` (whole file) | Unauthenticated debug endpoint using service-role key, live in production |
| SEC-06 | CRITICAL | Security/OTP | `src/app/api/auth/otp/request/route.ts:28-29,96`; `verify/route.ts:66-67` | OTP via `Math.random()`, stored plaintext in `otp_hash`, non-constant-time compare |
| COR-01 | CRITICAL | Data integrity | `src/app/assessment/posh/page.tsx:783` vs `:472`; `src/app/api/assessment/posh-submit/route.ts:52` | Same table receives `assessment_type` `'posh'` or `'posh_compliance'` depending on code path; `'posh_compliance'` fails `isValidAssessmentType()` |
| PAY-01 | CRITICAL | Revenue | `src/app/api/assessment/auto-dealer/pay/route.ts:86-92`; no verify/webhook exists | `payment_status` goes `pending → initiated` and stops; nothing ever sets `'paid'`; `/api/payment/verify` has zero callers |
| SEC-07 | IMPORTANT | Security | `src/app/api/email/send-report/route.ts:373-459` | Open relay: unauthenticated, arbitrary recipient + arbitrary PDF attachment, no rate limit |
| SEC-08 | IMPORTANT | Security | `src/app/api/assessment/auto-dealer/{submit,applicability,pay}/route.ts` | Mutations keyed on client-supplied `assessmentId`, no caller verification |
| SEC-09 | IMPORTANT | Security | All `*-submit`, `feedback`, `suggestions`, `calculator/*`, `email/*` routes | No rate limiting anywhere except OTP routes |
| SEC-10 | IMPORTANT | Security/DPDP | `src/components/identity/EmailGate.tsx:130-131`; migration `20260429000000:27-29` | Consent timestamps are client-supplied — forgeable audit evidence |
| SEC-11 | IMPORTANT | Security | `statutory-health/labour-code/food-business/state-wise-submit` routes | `users` rows upserted on unverified client-supplied email |
| SEC-12 | IMPORTANT | Repo hygiene | `.netlify/` (24,905 tracked files) | Entire build output committed; only anon JWT embedded (verified — no service-role leak), but future secret-inlining risk + repo bloat |
| COR-02 | IMPORTANT | Correctness | See §3.2 COR-02 (≥10 sites) | ≥5 distinct score→status band sets (90/70, 90/60, 80/50, 80/60, 70-only) across pages, PDFs, emails |
| COR-03 | IMPORTANT | Correctness/UI | `src/lib/assessments/posh/posh-compliance-questions.ts:235,242,832,1164,1186,1196,1227,1243,1259,1275` | Mojibake `â‚¹` (double-encoded ₹) renders as garbage in UI; silently stripped in PDFs (currency lost) |
| COR-04 | IMPORTANT | Correctness | `src/lib/calculators/penalty-exposure/pdf-generator.ts:8` | `cleanText()` duplicated — violates CLAUDE.md §5 single-source rule (third copy in auto-dealer PDF route:75-83 lacks `§` handling) |
| COR-05 | IMPORTANT | Content currency | `src/lib/pdf/state-wise-compliance-rules.ts:596,635` | "expected November 2025" presented as upcoming — stale as of 2026-06 |
| COR-06 | IMPORTANT | Correctness | `src/app/assessment/posh/page.tsx:1434` | `ctaLabel="Verify email &amp; get full report"` — entity renders literally as "&amp;" in the button |
| COR-07 | IMPORTANT | §11 violation | `src/app/api/assessment/posh-submit/route.ts:16-24,120-129` | Throws 500 on missing env vars instead of `local_` fallback |
| COR-08 | IMPORTANT | Data/UX | `src/app/assessment/posh/page.tsx:791`; `posh-submit/route.ts:208` | Emailed "View Full Report" links to `/results/[id]`, which reads `assessments`, not `posh_assessments` — UNVERIFIED at runtime, structurally mismatched |
| AN-01 | IMPORTANT | Analytics | `src/app/assessment/posh/page.tsx:132-142` + call sites | POSH fires `posh_*`-prefixed event names — fragments every funnel; violates §10 |
| AN-02 | IMPORTANT | Analytics | `src/app/assessment/auto-dealer/page.tsx:78`, `phase/[n]/page.tsx:76`, `results/[id]/page.tsx:425` | Auto-dealer uses raw `posthog.capture` with bespoke `auto_dealer_*` names; canonical lifecycle events missing |
| AN-03 | IMPORTANT | Analytics | `src/components/results/payment-gate.tsx:35` | `checkout_started` fires on the free-beta stub button — pollutes conversion metrics |
| ARCH-01 | IMPORTANT | Duplication | 6 of 7 assessment pages | Shared `CompanyDetailsForm` used by only statutory-health; ~500 duplicated Step-0 lines; field-order violations in LC/DPDP/POSH/SW (+FB missing `industry`) |
| ARCH-02 | IMPORTANT | Reliability | All assessment pages except `dpdp/page.tsx:176-201` | 7 of 8 auto-advance copies lack ref-guard/cleanup — double-advance + fire-after-unmount risk |
| ARCH-03 | IMPORTANT | UX parity | POSH, State-Wise, Food Business pages | No localStorage progress save/restore (SH/LC/DPDP have it) — longest assessment loses all progress on refresh |
| ARCH-04 | IMPORTANT | UI standard | `posh/page.tsx:1137-1150`; `food-business/page.tsx:459,651`; `auto-dealer/phase/[n]/page.tsx:188` | Progress bars off-standard: POSH blue h-2 sub-bar, FB missing `[&>div]:bg-green-600` ×2, AD `bg-blue-600` (not in §14 exemptions) |
| ARCH-05 | IMPORTANT | §9 violation | `results/[id]/page.tsx:279,699,926,1011`; auto-dealer pages; `types/database.ts:4` | Hardcoded assessment-type string literals; `types/database.ts` uses `'labor_code'` (American spelling — silent mismatch; liveness UNVERIFIED) |
| BLD-01 | IMPORTANT | Build/tests | `tests/dpdp-assessment.spec.ts` (25 errors), `posh-assessment.spec.ts:16`, `posthog-analytics.spec.ts:225,243` | 29 tsc errors in test suite (drifted helper types, missing `./utils/axe-helper`); `next build` unaffected (verified) but any tsc gate fails |
| BLD-02 | IMPORTANT | Dependencies | `package.json` | `@react-pdf/renderer` has zero imports in `src/` — heavy unused dep (react-pdf approach abandoned per §12) |
| BLD-03 | IMPORTANT | Bundle | `src/components/results/download-buttons.tsx:7-8` | jsPDF + all adapters statically imported in client component — `/results/[id]` first-load 453 kB; should be dynamic import |
| BLD-04 | IMPORTANT | Repo hygiene | `playwright-report/` (2.3 MB), `test-results/` (1.8 MB), 5 `*.backup` files, `src/app/assessment/files.zip` | Test artifacts and backups tracked in git |
| PAY-02 | IMPORTANT | Payments | `src/app/api/payment/verify/route.ts:39-98` | Orphaned route: marks client-supplied `assessmentId` completed without linking order↔assessment, no amount check, non-timing-safe signature compare |
| AN-04 | NICE-TO-HAVE | Analytics | `src/lib/analytics/useAssessmentAnalytics.ts` | Orphaned near-duplicate of `hooks.ts` — zero importers |
| COR-09 | NICE-TO-HAVE | §4 style | `state-wise-compliance-questions.ts:1319,1378` (`weight \|\| 5`), `dpdp-questions.ts:850` (`\|\| 0.10`), `labour-code/page.tsx:123` (`\|\| 30`), `dpdp/page.tsx:112` (`\|\| 45`), + ~14 `\|\| 0` sites | `\|\|` on numerics; non-zero defaults are real (a 0-weight question would score as 5); `\|\| 0` sites are harmless-by-accident but violate §4 |
| SEC-13 | NICE-TO-HAVE | Security | `src/app/api/health/route.ts:31-45` | Exact per-table row counts disclosed unauthenticated |
| SEC-14 | NICE-TO-HAVE | Security | `src/app/api/me/delete/route.ts` | Irreversible deletion with no confirmation token (session-auth is correct) |
| SEC-15 | NICE-TO-HAVE | Logging | e.g. `email/send-report/route.ts:469`, `api/assessment/[id]/route.ts:44` | Full error objects / Resend IDs logged; can carry PII into logs |
| ARCH-06 | NICE-TO-HAVE | Duplication | `posh/page.tsx:849-888` vs `930-969` | 45-line state/industry label maps pasted twice in one file, duplicating `@/lib/constants/india` |
| ARCH-07 | NICE-TO-HAVE | UI standard | `src/components/results/payment-gate.tsx:4`; `auto-dealer/results/[id]/page.tsx:9` | `CheckCircle2` used (CLAUDE.md §11 mandates `CheckCircle`) |
| ARCH-08 | NICE-TO-HAVE | Code quality | `state-wise-compliance/page.tsx:334-343`; `posh/page.tsx:307,1123` | `setState` in `setTimeout(...,0)` during render to skip questions; leftover `console.log('[POSH]...')` |
| BLD-05 | NICE-TO-HAVE | Repo hygiene | Root: 8 `.bat`/`.ps1`, 3 `.py`, `tsconfig_hex.txt`, `ALL-36-DOCS/`, `Key-Documents-Complete/` | One-time fix scripts and doc dumps tracked in repo root |
| BLD-06 | NICE-TO-HAVE | Docs drift | `CLAUDE.md §12`; `skills/assessment-developer/SKILL.md:100,157-164,178` | §12 dead-file list is stale (all already deleted); SKILL.md teaches banned `@/lib/constants` import, `h-2` progress bar, and raw `posthog.capture` — contradicts CLAUDE.md |
| ARCH-09 | NICE-TO-HAVE | Routing | `src/app/assessment/Landing/` | Capitalised route dir (redirect exists in `next.config.mjs:14-20`, so harmless) |

---

## 3. Detailed Findings

### 3.1 CRITICAL

**SEC-01 — `posh_assessments` world-readable.**
`supabase/migrations/20260504000000_create_posh_assessments_table.sql:48-50` creates `"Anyone can read posh assessments by id" FOR SELECT USING (true)`. Despite the policy's name, nothing scopes it to an ID: any anonymous client with the public anon key can `SELECT *` on the entire table — `full_name`, `email`, `phone`, `company_name`, and sexual-harassment compliance responses. This is the single worst exposure in the codebase.
*Fix:* drop the policy; serve POSH results only through a server route using the admin client after ownership/email verification.

**SEC-02 / SEC-03 — Assessment IDOR.**
`src/app/api/assessment/[id]/route.ts:21-91` uses the service-role client (bypassing RLS) to fetch any assessment by client-supplied ID, joining `users`/`companies` PII, with no auth or ownership check. `src/app/results/[id]/page.tsx:100-105` does the same server-side and renders the PII. Possession of a UUID (shared link, browser history, logs) = full access to someone else's data.
*Fix:* gate both behind verified ownership (session user or OTP-verified email matching the row) before returning PII.

**SEC-04 — Auto-dealer EmailGate bypass.**
`src/app/api/assessment/auto-dealer/[id]/report.pdf/route.ts`: the PDF branch checks `email_verified` (line 781-783), but the JSON branch (lines 758-778, selected via `Accept: application/json` — exactly what the results page sends at `results/[id]/page.tsx:443`) returns `responses`, scores, `gapAnalysis`, `email`, `fullName`, `companyName` with **no** verification check. The client-side EmailGate is therefore decorative.
*Fix:* hoist the `email_verified` check above the `acceptJson` branch.

**SEC-05 — Live debug endpoint.**
`src/app/api/debug/db-test/route.ts` is an unauthenticated GET exercising the DB with the service-role key and returning connectivity/schema/error detail. Reachable in production (confirmed in build route table).
*Fix:* return 404 when `NODE_ENV === 'production'`, or delete it.

**SEC-06 — OTP weaknesses.**
`otp/request/route.ts:28-29` generates codes with `Math.random()`; `:96` stores the raw code in a column named `otp_hash`; `otp/verify/route.ts:66-67` compares with `!==`. Mitigations already present and verified: 3/email/hr + 10/IP/hr rate limits, 10-min TTL, 5-attempt cap, OTP not returned in prod responses. Still: any DB read path (including SEC-05) exposes live codes for the gate that protects report access.
*Fix:* `crypto.randomInt` + store SHA-256/bcrypt hash + `crypto.timingSafeEqual`.

**COR-01 — POSH `assessment_type` split.** **[recurring class — type drift]**
`posh/page.tsx:783` sends `'posh_compliance'`; the LCC path at `:472` sends `ASSESSMENT_TYPES.POSH` (`'posh'`); `posh-submit/route.ts:52` defaults to `'posh_compliance'`, which fails `isValidAssessmentType()`. Admin stats, analytics, and any type-filtered query silently split or drop POSH rows.
*Fix:* use `ASSESSMENT_TYPES.POSH` everywhere + one-off data migration for existing rows.

**PAY-01 — Payment state machine dead-ends at `initiated`.**
`auto-dealer/pay/route.ts:86-92` creates the Razorpay order and sets `payment_status: 'initiated'`. Grep of the entire codebase finds **no** writer of `payment_status: 'paid'`, no Razorpay webhook route, and zero callers of `/api/payment/verify`. The report-unlock check (`report.pdf/route.ts:746`) requires `payment_status === 'paid'`, which is unreachable. The moment real payments are enabled, customers pay and receive nothing.
*Fix:* add a signature-verified `payment/webhook` (or auto-dealer verify) route that idempotently flips `payment_status` to `'paid'` keyed on `razorpay_order_id`.

### 3.2 IMPORTANT

**SEC-07 — Open email relay.** `email/send-report/route.ts:373-459` accepts unauthenticated `{email, pdfBase64, companyName, assessmentType}` and sends a branded email with the attacker's attachment to any recipient. Spam/phishing from `compliancecheck.co.in` + Resend quota burn. *Fix:* bind sends to an OTP-verified email/assessment pair and rate-limit.

**SEC-08 — Auto-dealer mutations trust `assessmentId`.** `submit`, `applicability`, and `pay` routes read/update rows via service-role with only the UUID as the key. *Fix:* require verified-session email to match `user_email`.

**SEC-09 — No rate limiting** on any submit/feedback/suggestions/calculator/email route (only OTP routes are limited). *Fix:* shared IP+route limiter (middleware or per-route helper).

**SEC-10 — Forgeable consent timestamps.** `EmailGate.tsx:130-131` sends `marketing_consent_at` etc. as client-generated ISO strings, stored verbatim (migration `20260429000000:27-29`). Weak DPDP audit evidence. *Fix:* set server-side `now()`, ignore client values.

**SEC-11 — Users upserted on unverified emails** in four submit routes — anyone can create/pollute records for arbitrary addresses. *Fix:* separate anonymous leads from verified users.

**SEC-12 — `.netlify/` committed (24,905 files).** Verified every embedded JWT is `role:"anon"` only — no service-role leak today — but the next build could inline something worse, and the repo carries megabytes of stale compiled code. *Fix:* `.gitignore` + `git rm -r --cached .netlify`.

**COR-02 — Threshold-band drift.** SKILL.md specifies 90/70. Found in live code:
- 90/70: `food-business-questions.ts:988-989`, `posh-submit/route.ts:184`, `food-business-submit/route.ts:59`, `posh/page.tsx:736,1520-1521`
- 90/60: `posh/posh-compliance-questions.ts:1060-1068` (same assessment, different file!)
- 80/50: `labour-code-questions.ts:847-853`, `dpdp-questions.ts:763-770`, `state-wise-compliance-questions.ts:1366-1368`, `unified-report-generator.ts:131-132`, `email/send-report/route.ts:436-441`, `local-storage-results.tsx:542-544`, `results/[id]/page.tsx:330-331`
- 80/60, 80/60/40, 70-only: `report-data-adapter.ts:82-95,127-128`, `results/[id]/page.tsx:545,562,848`, `local-storage-results.tsx:530-532`, `statutory-health/page.tsx:423` (70/40)
The same POSH score can be labelled differently on the page, in the PDF, and in the email. *Fix:* one `getComplianceStatus(score)` in `@/lib/constants` (or per-assessment config) imported everywhere.

**COR-03 — POSH mojibake.** 10× `â‚¹` (UTF-8 ₹ double-encoded) in `posh-compliance-questions.ts` (lines listed in table). In the browser users literally see "â‚¹200/day"; in PDFs `cleanText`'s `₹→Rs.` rule can't match the mangled bytes, so the catch-all strips them and amounts lose their currency marker. Also a BOM at `posh-compliance-rules.ts:1`. *Fix:* re-encode the file, replace `â‚¹` with `₹` (or `Rs.` directly).

**COR-04 — `cleanText` triplicated.** Canonical copy in `unified-report-generator.ts:104`; duplicate at `penalty-exposure/pdf-generator.ts:8` (violates §5's "Do not duplicate it; import it"); a third variant in `auto-dealer/[id]/report.pdf/route.ts:75-83` that handles `→` but the question banks it feeds contain `§` 200+ times (handled only by its catch-all strip → "Factories Act §28" becomes "Factories Act 28"). *Fix:* export one `cleanText` from a shared module; add `§→S.` mapping.

**COR-05 — Stale statutory content.** `state-wise-compliance-rules.ts:596,635`: "expected November 2025" is 7 months past. Statutory filing dates (15th, Jan 31, Sep 30…) are scattered as prose across `state-wise-compliance-rules.ts`, `report-configs.ts`, and question helpTexts with no single source. *Fix:* sweep for stale "expected" language; move recurring deadlines into a constants module.

**COR-06 / COR-07 / COR-08 — POSH polish + persistence.** `&amp;` rendered literally in EmailGate CTA (`posh/page.tsx:1434`); posh-submit 500s when Supabase env vars missing (violates §11.2's `local_` fallback rule); emailed report link points to `/results/[id]` which reads the `assessments` table while POSH writes to `posh_assessments` (UNVERIFIED at runtime; structurally wrong). *Fixes:* literal `&`; add local-fallback response; point email link at a POSH-aware results route.

**AN-01/02/03 — Analytics fragmentation.** Event coverage matrix (✓ typed via `analytics`/`useAssessmentTracking`, ⚠ non-canonical, ✗ missing):

| Event | SH | LC | DPDP | SW | FB | POSH | AD |
|---|---|---|---|---|---|---|---|
| assessment_started | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠ `posh_assessment_started` (page:276) | ✗ (bespoke `auto_dealer_landing_view`) |
| assessment_completed | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠ `posh_assessment_completed` (page:607) | ⚠ `auto_dealer_phase_complete` |
| assessment_abandoned | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠ `posh_assessment_abandoned` | ✗ |
| report_viewed | ✓ (hook + `report-view-tracker.tsx:15`) | ✓ | ✓ | ✓ | ✓ | ✗ (in-page results, no canonical event) | ⚠ `auto_dealer_results_view` |
| report_downloaded | ✓ (`download-buttons.tsx:512`) | ✓ | ✓ | ✓ | ✓ | ⚠ `posh_report_downloaded` | ⚠ `auto_dealer_pdf_downloaded` |
| feedback_submitted | ✓ (`feedback-form.tsx:27`) | ✓ | ✓ | ✓ | ✓ | ✓ (shared form) | ✗ UNVERIFIED |

The five standard assessments are fully covered through `useAssessmentTracking` (`src/lib/analytics/hooks.ts:42-134`) + shared components. POSH (`page.tsx:132-142`) and auto-dealer (raw `posthog.capture` at the three files listed) fragment every cross-assessment funnel and violate §10. No PII found in event properties (clean). `payment-gate.tsx:35` fires `checkout_started` for a free-beta button. *Fix:* map POSH/AD onto canonical events with `assessment_type` props (keep bespoke extras as additional events if wanted).

**ARCH-01…05 — Duplication & convention drift.** Summarised; full detail in §4. Step-0 form re-implemented in 6 pages with wrong field order in 4 (`labour-code/page.tsx:461-570`, `dpdp/page.tsx:334-477`, `posh/page.tsx:1029-1113` — 4 fields only, `state-wise/page.tsx:246-293` — 4 fields only; `food-business/page.tsx:51-58` missing `industry`). Auto-advance unguarded in 7 of 8 copies (only `dpdp/page.tsx:176-201` is correct). Progress-save absent from the three longest assessments. Progress bars off-standard in POSH/FB/AD. Hardcoded type literals in `results/[id]/page.tsx` and auto-dealer; `types/database.ts:4` spells `'labor_code'`.

**BLD-01…04 — Build & repo health.**
- Verified: `npm run lint` ✅ zero errors; `npm run build` ✅ succeeds with **no env vars** (lazy-init rule fully honoured — zero module-level clients found anywhere, including Resend/Razorpay); `npx tsc --noEmit` ❌ 29 errors, all in `tests/` (25× phantom `employees` field vs `tests/utils/form-helpers.ts` type; missing `tests/utils/axe-helper` module; 2 type errors in `posthog-analytics.spec.ts`). Build is not blocked (verified empirically), but the Playwright suite cannot be trusted in this state.
- `@react-pdf/renderer` in `dependencies` with zero imports — slows every `npm ci` on Netlify's 180s budget.
- `download-buttons.tsx:7-8` statically imports jsPDF + every adapter into the client bundle (`/results/[id]` = 453 kB, `/assessment/posh` = 479 kB first-load). *Fix:* `const { generateUnifiedReportBlob } = await import(...)` inside the click handler.
- Tracked artifacts: `playwright-report/` 2.3 MB, `test-results/` 1.8 MB, 5 `*.backup` files, `src/app/assessment/files.zip`, `tsconfig_hex.txt`, 11 one-time fix scripts at root.

**PAY-02 — `/api/payment/verify` latent flaws.** Orphaned today (zero callers), but as-written it: accepts an `assessmentId` unrelated to the verified order and marks it completed (`route.ts:79-93`); never checks the paid amount against expected price; compares HMAC with `!==` instead of `crypto.timingSafeEqual` (`:52`). If revived for the Razorpay rollout it would ship these bugs. *Fix:* derive the assessment from the `payments` row by `razorpay_order_id`; verify amount; timing-safe compare.

### 3.3 NICE-TO-HAVE

Listed in the findings table (SEC-13/14/15, COR-09, AN-04, ARCH-06/07/08/09, BLD-05/06). Notes:
- **COR-09:** the dangerous non-zero-default cases are `q.weight || 5` (×2, state-wise — a deliberate weight of 0 becomes 5) and `phaseWeight || 0.10` (dpdp). The ~14 `|| 0` sites (e.g. `results/[id]/page.tsx:449,847`, `local-storage-results.tsx:698,761`, `email/send-report` ×5, `state-wise-submit` ×7) are functionally harmless but violate §4 and invite regressions — batch-convert to `??`.
- **BLD-06:** CLAUDE.md §12's dead-file list is fully stale (all 9 files already deleted — verified). SKILL.md still teaches three patterns CLAUDE.md bans (legacy `@/lib/constants` import at line 100, `h-2` progress bar at 157-164, raw `posthog.capture` at 178+). Future sessions reading the skill will reintroduce violations.

### 3.4 Verified-clean (coverage statement)

- **No module-level service clients** anywhere (Supabase/Resend/Razorpay all lazy) — §3 fully honoured.
- **No secrets committed**: no `.env*` tracked; no live key literals in `src/`; every JWT in tracked files decoded — anon-role only.
- **Service-role key never reaches client code** — all usages in API routes/server components; no `NEXT_PUBLIC_` misuse beyond the intentionally-public Razorpay key id.
- **Admin API correctly gated** (`api/admin/stats/route.ts:18-49` checks session email against `ADMIN_EMAIL`; brittle single-email model but enforced server-side).
- **`me/export`/`me/delete`** use server session identity, not client-supplied email.
- The previous audit's headline bug (`overall_score || 50`) is fixed — no `|| 50` remains.
- **UNVERIFIED / partially audited:** exhaustive cross-reference of every conditional-filter question ID across all 7 question banks (~6,800 lines) was spot-checked only — no broken references found in samples, but not exhaustively proven. `ProductType`/`'labor_code'` liveness, POSH email-link runtime behaviour, and auto-dealer Yes/No colours at line level are marked UNVERIFIED above.

---

## 4. Consolidation Opportunities (assessment dedup)

| # | Opportunity | Detail | Effort |
|---|------------|--------|--------|
| 1 | **Adopt `CompanyDetailsForm` in all 7** | Component exists (`src/components/assessment/company-details-form.tsx`, 183 lines, correct order/constants); add props for hidden/extra fields. Kills ~500 duplicated lines and all Step-0 order violations at once. | S–M |
| 2 | **`<YesNoButtons>` + `<QuestionCard>`** | One source for the 9+ copies of the 25-line button block; §11 colours/icons enforceable by construction. | S |
| 3 | **`useAutoAdvance(delayMs)`** | Lift DPDP's correct ref-guarded implementation; parameterise 800/600ms; fixes ARCH-02 in 7 pages. | S |
| 4 | **`<AssessmentProgress>`** | Hardcodes `h-3 [&>div]:bg-green-600` + aria-label; fixes ARCH-04 by construction. | S |
| 5 | **`useAssessmentProgress(storageKey)`** | Extract SH/LC/DPDP's localStorage save/restore; apply to POSH/SW/FB (ARCH-03). | M |
| 6 | **Unified submit-with-fallback helper** | Normalise the 4 divergent fallback semantics (incl. COR-07). | M |
| 7 | **Shared `getComplianceStatus(score)`** | Single threshold-band source (COR-02). | S |
| 8 | **Two-phase assessment engine** | POSH/SW/FB (and structurally LC/DPDP) all implement Step 0 → applicability → filtered questions → score → submit → results. A config-driven `<TwoPhaseAssessment>` shrinks 700–1,800-line pages to ~100-line configs. Do **after** items 1–7; auto-dealer stays bespoke per §14. | L |

---

## 5. Recommended Fix Sequence (batches for `/features/queue/` specs)

Each batch is independent and sized for a single Claude Code run.

**Batch 1 — Security hotfixes (CRITICAL, do first)**
SEC-01 (replace POSH SELECT policy), SEC-04 (hoist email_verified check), SEC-05 (kill debug route), SEC-02/SEC-03 (ownership checks on assessment reads — agree gating model: session vs OTP-verified email). Acceptance: anonymous client cannot read any row of `posh_assessments`; unverified `Accept: application/json` request to auto-dealer report returns 403; `/api/debug/db-test` 404s in prod.

**Batch 2 — Identity & abuse hardening**
SEC-06 (crypto-random + hashed OTP + timing-safe compare), SEC-07 (lock down send-report), SEC-09 (shared rate limiter), SEC-10 (server-side consent timestamps), SEC-08, SEC-11.

**Batch 3 — Data integrity & content correctness**
COR-01 (POSH type unification + data migration), COR-03 (mojibake re-encode), COR-06 (`&amp;`), COR-07 (posh-submit fallback), COR-08 (email link target), COR-05 (stale Nov-2025 copy).

**Batch 4 — Scoring/status consistency**
COR-02 (single `getComplianceStatus`), COR-09 (`||`→`??` sweep), COR-04 (single `cleanText` + `§` handling).

**Batch 5 — Analytics unification**
AN-01 (POSH → canonical events), AN-02 (auto-dealer → typed `analytics`), AN-03 (stub gate event), ARCH-05 type-literal cleanup, AN-04 (delete orphan hook). Acceptance: 7×6 matrix all ✓.

**Batch 6 — Repo & build hygiene**
SEC-12 (untrack `.netlify/`), BLD-04/BLD-05 (untrack artifacts/backups/scripts; extend `.gitignore`), BLD-02 (drop `@react-pdf/renderer`), BLD-01 (fix test-suite types), BLD-03 (dynamic-import jsPDF), BLD-06 (update CLAUDE.md §12 + SKILL.md), SEC-13/14/15.

**Batch 7 — Shared assessment components (consolidation 1–5)**
CompanyDetailsForm rollout, YesNoButtons/QuestionCard, useAutoAdvance, AssessmentProgress, useAssessmentProgress. Fixes ARCH-01…04, ARCH-06/07/08 mechanically.

**Batch 8 — Razorpay entitlement architecture (design + build when payments launch)**
PAY-01/PAY-02: add `payment/webhook` route (signature-verified, idempotent on `razorpay_order_id`), link orders→assessments server-side, store entitlement in DB (never localStorage), make `/results/[id]`/download flow consult entitlement state. The PaymentGate stub (`payment-gate.tsx`) and `report.pdf` paid-check are the two hook points; current friction: no `payments` row creation for generic assessments, client-state-only unlock, no idempotency story.

**Batch 9 (optional, last) — Two-phase engine (consolidation #8).**

---

*Audit complete. No files modified, no fixes applied. Findings marked UNVERIFIED require confirmation before acting.*
