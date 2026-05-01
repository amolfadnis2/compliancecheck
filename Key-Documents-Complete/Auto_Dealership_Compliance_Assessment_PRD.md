# Product Requirements Document (PRD)
## Auto Dealership Compliance Assessment — ComplianceCheck.co.in

**Version:** 1.0
**Author:** Amol Fadnis (Director of IT, insightsoftware India)
**Date:** 1 May 2026
**Status:** Proposed
**Source Research:** `Auto_Dealership_Compliance_Research_v1.1.md`

---

## 1. Background — How the POSH Assessment Is Designed (Reference Pattern)

The existing POSH assessment on ComplianceCheck follows the platform's standard **two-phase, dynamic, risk-weighted** model defined in `assessment-framework.md`:

| Layer | POSH Implementation |
|-------|---------------------|
| **Applicability filter** | Single trigger: `employee_count >= 10` (POSH Act 2013, §4) |
| **Compliance questions** | 6 yes/no/NA questions covering IC constitution, external member, annual training, District Officer report, vernacular policy display, complaint confidentiality |
| **Scoring** | Per-question weight (8–10 for IC constitution & annual report; 5–7 for training/display); overall % with status thresholds (Green ≥90, Yellow 70–89, Red <70) |
| **Gap analysis** | Each "No" → finding + risk level + penalty exposure (₹50,000 first / cancellation on repeat) + recommendation + timeline |
| **Output** | PDF report (jsPDF, ASCII-sanitised), email via Resend, optional Razorpay paywall for premium PDF |
| **Tech pattern** | TypeScript `Question[]` + `ConditionalRule[]` in `lib/assessments/posh-questions.ts`; page at `app/assessment/posh/page.tsx`; submit API at `app/api/assessment/posh-submit/route.ts`; Supabase + localStorage fallback |

**The Auto Dealership assessment will reuse this exact pattern, scaled from 1 trigger / 6 questions to ~25 triggers / 50–100 questions across 6 phases.**

---

## 2. Problem Statement

Indian auto dealerships (2W/4W, full-stack: showroom + workshop + spare parts + accessories) straddle three regulatory worlds — **labour, transport (MV Act/CMVR), and EHS** — plus horizontal layers (GST 2.0, DPDP, POSH, Consumer Protection, IRDAI MISP). No single self-service tool exists that lets a dealer assess applicability and gaps in under 30 minutes. ComplianceCheck.co.in's existing assessments (POSH, DPDP, Labour) cover slices; this PRD scales the pattern to the dealer use case.

---

## 3. Goals & Non-Goals

**Goals**
- Pay-per-use assessment producing an audit-ready gap report for SME dealers (10–500 staff).
- 25-question applicability filter that scales the compliance question set from ~30 (small 2W showroom) to ~100 (full multi-state 4W dealer).
- Risk-scored, branched-by-applicability report with penalty exposure and 30/90/365-day action timeline.
- Integration with platform's existing PDF, email, payment, and analytics stack — zero net-new infra.

**Non-Goals**
- Filing automation or e-form submission (out of scope v1).
- OEM-specific dealer-agreement review (purely contractual).
- Real-time regulatory tracking (assessment uses a refreshable rate/slab table; DB updates monthly).

---

## 4. Target Users & Personas

| Persona | Profile | Question Load | Price Tier |
|---------|---------|---------------|------------|
| **Solo 2W dealer** | Single outlet, 12 staff, no body-shop, no diesel storage, single state | 25–30 | Basic ₹999 |
| **Mid 4W dealer** | 1–3 outlets, 80–150 staff, full workshop, paint booth, MISP, single state | 50–65 | Standard ₹2,499 |
| **Multi-state dealer group** | 5+ outlets, 300+ staff, body-shop + EV charging + RVSF, multi-state, MISP + DSA | 90–100 | Premium ₹4,999 |

---

## 5. Functional Requirements

### 5.1 Six-Phase Assessment Architecture

| Phase | Coverage | Q-count | Conditional on |
|-------|----------|---------|----------------|
| **Phase 1 — Applicability filter** | Entity, scale, vehicle type, business mix, premises, workforce, cross-sell | 25 | Always shown |
| **Phase 2 — Generic Statutory** | Labour Codes, EPF, ESI, S&E, POSH, Maternity, Bonus, Gratuity, GST 2.0, TDS/TCS, Companies Act | ~30 | Threshold-driven |
| **Phase 3 — Workshop EHS** | Factories Act/OSH Code, SPCB CTE/CTO, HW Rules, PESO, Fire NOC, lifts, pressure vessels, PPE | ~25 | `has_workshop == true` |
| **Phase 4 — Auto-dealer specific** | Trade Certificate (CMVR Form 16/16A/17/19A), HSRP, BNCAP disclosure, BIS, CP Act, Right to Repair, IRDAI MISP, RBI DSA | ~20 | Branched per OEM/finance/insurance |
| **Phase 5 — EPR & circular economy** | Battery Waste 2022, E-Waste 2022, ELV Rules 2025, Plastic Waste, Used Oil | ~10 | `sells_under_own_brand` / `has_demo_fleet >100` |
| **Phase 6 — Data & corporate** | DPDP Act 2023 + Rules 2025, Companies Act, CSR, Lease registration | ~10 | `processes_personal_data == true` (auto-true) |

### 5.2 Applicability Logic (examples)

```
IF employee_count >= 10                            → POSH IC
IF employee_count >= 20                            → EPF, Bonus, S&E most states
IF workshop_workers + power >= 10                  → Factories Act / OSH hazardous-process
IF state IN PT_states                              → Professional Tax (PTRC + PTEC)
IF diesel_storage_litres > 5000                    → PESO Form XIV/XV
IF fleet_demo_vehicles > 100                       → ELV bulk consumer registration
IF sells_motor_insurance == true                   → MISP + IRDAI EoM Reg 2024
IF processes_personal_data == true                 → DPDP (auto-true for any dealership)
IF turnover > 5_cr                                 → e-invoicing
IF turnover > 1_cr (or 10_cr if >=95% digital)     → 44AB tax audit
```

### 5.3 Scoring Model

- **Weights:** 8–10 (registration/licence — Trade Certificate, CTO, Factory Licence, EPF, MISP UIN); 5–7 (returns/filings — Form 22, 27EQ, GSTR-9); 3–4 (display, awareness, voluntary disclosures — BNCAP, Right to Repair).
- **Status thresholds:** Green ≥90, Yellow 70–89, Red <70.
- **Phase-level sub-scores** displayed on report so a dealer can see "I'm green on labour but red on EHS".
- **Risk-weighted overall score** so a single Trade-Certificate breach (penalty + seizure under MV Act §177) materially drags the result while a deferred DPDP item (effective 13 May 2027) only nudges via "prepare-by-2027" advisory.

### 5.4 Report Output

Mirrors POSH report structure with auto-dealer extensions:
1. Executive summary + overall score badge
2. Applicability overview table (✅/❌ across 27 compliance areas with trigger reason)
3. Phase-wise scores (6 progress bars)
4. Gap analysis grouped Critical → Low with penalty exposure (₹ amounts from research §5)
5. **Compliance calendar** — auto-generated due dates: 15th (EPF/ESI), 20th (GSTR-3B), 30 Jun (HW Form 4), 31 Jan (POSH annual), 30 Apr (ELV producer declaration), CTO/PESO/Fire-NOC renewal dates from user input
6. State-specific annexure (PT slabs, S&E rules, SPCB category) pulled from maintained reference table
7. **Documentation checklist** (40+ items from research §7) with upload prompts in premium tier

### 5.5 State-Specific Reference Tables (DB-backed, refreshable)

| Table | Refresh cadence | Source |
|-------|-----------------|--------|
| `pt_slabs_by_state` | Quarterly (state Budgets) | State labour-dept portals |
| `s_and_e_rules_by_state` | Annual | State portals (e-Karmika, MahaShramm, LMS) |
| `gst_rates_by_hsn` | On notification | gst.gov.in PIB |
| `min_wages_by_state_schedule` | Semi-annual (VDA) | State labour notifications |
| `spcb_category_by_pi_code` | Annual | CPCB |

---

## 6. Non-Functional Requirements

| Dimension | Target |
|-----------|--------|
| **Performance** | First applicability question in <2 s (LCP); full report PDF in <8 s |
| **Scale** | 5,000 assessments/month (assumes 5% of FADA's ~15,000 dealers in year 1) |
| **Availability** | 99.5% (Netlify + Supabase SLA) |
| **Identity verification** | **Mandatory email OTP verification before assessment submission**. 6-digit OTP, 10-min TTL, max 5 attempts, rate-limited (3 OTPs / email / hour). Implemented via Supabase Auth (`signInWithOtp`) + Resend for delivery. Verified email becomes the canonical user identifier. |
| **Data persistence** | **All user data persisted in Supabase (Postgres, ap-south-1)** — applicability profile, every response, score breakdown, gap items, payment status, PDF generation log. RLS enforces per-user access. localStorage is a transient fallback only; on reconnect, data is flushed to Supabase. |
| **Security** | RLS on every Supabase table; OTP-verified email gates submission + paid PDF; Razorpay PCI handled by gateway; DPDP-aligned consent capture at intake |
| **Data residency** | Supabase Mumbai (ap-south-1) for DPDP compliance |
| **Accessibility** | WCAG 2.1 AA; mobile-first 375px; British English |
| **Observability** | **Full PostHog instrumentation** — page views, custom events for every phase transition, OTP request/verify, payment, PDF download; identified events post-OTP using verified email; session replay for support; funnel: landing → phase-1 start → phase-1 complete → OTP verified → payment → PDF download |

---

## 7. Architecture (ADR-style)

### 7.1 Decision: Reuse POSH/Labour assessment architecture, branch logic into a structured rules engine

**Status:** Accepted

**Context:** POSH (6 questions) and DPDP (~30 questions) use a flat array + simple `conditionalLogic[]`. Auto Dealership has ~100 questions across 25 applicability variables — flat array becomes unmaintainable.

**Decision:** Introduce a typed **rules engine** module `lib/assessments/auto-dealer/rules-engine.ts` that:
1. Accepts the Phase-1 answer set as `ApplicabilityProfile`
2. Returns an ordered `Question[]` for Phases 2–6 by evaluating each question's `appliesWhen: (p: ApplicabilityProfile) => boolean` predicate
3. Computes phase-level and overall scores in pure functions (testable)

### 7.2 Options Considered

| Option | Complexity | Maintainability | Performance | Recommendation |
|--------|------------|-----------------|-------------|----------------|
| **A. Flat array + nested conditionals** (POSH pattern) | Low | Poor at 100 Qs | Fast | Rejected |
| **B. Typed rules engine (chosen)** | Med | Strong — predicates are pure, testable | Fast | **Accepted** |
| **C. External rules DSL (e.g., json-rules-engine)** | High | Good but new dependency | OK | Rejected — overkill |

### 7.3 Trade-offs

- **Pros:** Each question's applicability is one pure function — unit-testable per Playwright scenario; new compliance areas added without touching existing predicates; researchers can author questions without engineering rebuild.
- **Cons:** ~3 days more dev than flat array; two new TypeScript files (predicates + question registry).
- **Revisit when:** Question count >150 or multi-jurisdiction (non-India) — then move to rules DSL.

### 7.3a Email OTP Verification Flow

```
User → enters email at start of Phase-1
     → POST /api/auth/otp/request { email }
        → Supabase Auth signInWithOtp() → Resend delivers 6-digit OTP
        → row inserted into otp_attempts (email, hash, expires_at, attempts=0)
     → User enters OTP
     → POST /api/auth/otp/verify { email, code }
        → On success: Supabase session established, email_verified=true persisted
                       on auto_dealer_assessments row; PostHog identify(email)
        → On failure: attempts++; lock after 5; cooldown 1 hr
Submission and paid PDF download both REQUIRE email_verified=true.
```

Rate limits: max 3 OTP requests per email per hour; max 10 per IP per hour. All OTP events logged to Supabase + emitted to PostHog.

### 7.4 Data Model (Supabase additions)

```sql
-- New tables
auto_dealer_assessments (id, user_email TEXT, email_verified BOOL DEFAULT false,
                          applicability_profile JSONB, responses JSONB, phase_scores JSONB,
                          gap_analysis JSONB, overall_score INT,
                          payment_status TEXT, razorpay_order_id TEXT,
                          pdf_generated_at TIMESTAMPTZ,
                          created_at TIMESTAMPTZ DEFAULT now(),
                          updated_at TIMESTAMPTZ DEFAULT now())
otp_attempts (id, email TEXT, code_hash TEXT, expires_at TIMESTAMPTZ,
              attempts INT DEFAULT 0, ip_address INET, created_at TIMESTAMPTZ)
state_pt_slabs (state_code, slab_min, slab_max, monthly_tax, effective_from)
state_s_and_e (state_code, registration_window_days, max_hours_per_day, weekly_off,
               women_closing_time, portal_url)
gst_rates_by_hsn (hsn, vehicle_category, rate, cess, effective_from)

-- RLS: anonymous can INSERT into auto_dealer_assessments and otp_attempts;
--      SELECT/UPDATE only when auth.email() = row.user_email AND email_verified = true.

-- Extend existing
companies (... add: dealer_oem TEXT[], dealer_outlet_count INT, has_workshop BOOL,
                     workshop_services TEXT[], states_of_operation TEXT[])
```

### 7.5 API Surface (Next.js 14 App Router)

```
POST /api/auth/otp/request                        → email → 6-digit OTP via Resend
POST /api/auth/otp/verify                         → email + code → Supabase session
POST /api/assessment/auto-dealer/start            → returns assessment_id + Phase-1 questions
POST /api/assessment/auto-dealer/applicability    → submits Phase-1 → returns Phase-2..6 set
POST /api/assessment/auto-dealer/submit           → REQUIRES email_verified=true → score + gaps
POST /api/assessment/auto-dealer/pay              → REQUIRES email_verified=true → Razorpay order
GET  /api/assessment/auto-dealer/[id]/report.pdf  → REQUIRES email_verified=true → jsPDF
```

### 7.6 Component Tree

```
app/assessment/auto-dealer/
  page.tsx                          # entry + applicability phase
  phase/[n]/page.tsx                # dynamic phase 2-6
  results/[id]/page.tsx             # report viewer
  components/
    ApplicabilityForm.tsx           # 25 Q wizard
    PhaseQuestionnaire.tsx          # generic phase player
    ScoreBadge.tsx                  # reused from POSH
    ComplianceCalendar.tsx          # NEW
    StateAnnexure.tsx               # NEW
    DocumentationChecklist.tsx      # NEW
lib/assessments/auto-dealer/
  applicability-questions.ts
  phase-2-statutory.ts
  phase-3-workshop-ehs.ts
  phase-4-dealer-specific.ts
  phase-5-epr.ts
  phase-6-data-corporate.ts
  rules-engine.ts
  scoring.ts
  recommendations.ts
```

---

## 8. Penalty-to-Risk Mapping (drives weights)

Source: Research §5 penalty schedule. Top weighted (10) are: HW/SPCB closure (₹1 lakh–1 cr + 5 yr imprisonment), DPDP (₹250 cr cap — but discounted to weight 7 since enforcement starts 13 May 2027), Trade Certificate breach (seizure + suspension), POSH IC absence (cancellation on repeat), Factory Licence absence.

---

## 9. Success Metrics

| KPI | Target (6 months post-launch) |
|-----|-------------------------------|
| Assessments completed | 2,500 |
| Conversion (start → paid) | 12% |
| Average completion time | <25 min |
| NPS from dealers | ≥40 |
| Gap-rate (dealers scoring <70%) | ≥60% — proves assessment surfaces real risk |
| FADA partnership signed | Yes |

---

## 10. Open Questions / Flags

1. **Dual regime (legacy Acts + Labour Codes)** — UI must let users select "old + new" mode until state rules gazette (~Apr 2026). Decision: default to **new** with toggle.
2. **GST 2.0 transitional cess credit** — pending FADA litigation. Decision: pull rates from `gst_rates_by_hsn` table; flag transitional ITC as advisory.
3. **MISP commission caps** — 22.5%/19.5% withdrawn (2023 IRDAI circular); replaced by EoM-Reg-2024 insurer-level 30%/35%. Question phrasing must reflect this nuance, not the legacy caps.
4. **Predominant activity test** — small showroom-with-tiny-workshop may still be a "shop". Provide guidance text, not black-and-white pass/fail.
5. **State reference table ownership** — who maintains? Decision: monthly Claude Code job + manual review by indian-compliance-expert before merge.

---

## 11. Phasing & Timeline (Estimate)

| Sprint | Deliverable |
|--------|-------------|
| Sprint 1 (2 wk) | DB schema, applicability questions (25), rules engine skeleton, Phase-1 UI |
| Sprint 2 (2 wk) | Phase 2 (statutory) + Phase 6 (data/corporate) — reuses POSH/DPDP/Labour patterns |
| Sprint 3 (2 wk) | Phase 3 (workshop EHS) + Phase 5 (EPR) — net-new content |
| Sprint 4 (2 wk) | Phase 4 (auto-dealer-specific) — Trade Cert, MISP, BNCAP, BIS |
| Sprint 5 (2 wk) | Scoring, gap analysis, PDF, state annexure, calendar, payment |
| Sprint 6 (1 wk) | Playwright test suite (target 60+ tests), accessibility audit, beta with 10 FADA dealers |
| Sprint 7 (1 wk) | Iteration + GA launch |

**Total: 12 weeks to GA.**

---

## 12. Citations

- Auto_Dealership_Compliance_Research_v1.1.md (uploaded)
- ComplianceCheck `assessment-framework.md` (`indian-compliance-expert` skill)
- ComplianceCheck `compliancecheck-developer` SKILL.md (technical stack)
- PIB PRID 2192463 (Labour Codes, 21 Nov 2025)
- PIB PRID 2164587 (GST 2.0, 22 Sep 2025)
- IRDAI EoM Regulations 2024 (eff. 1 Apr 2024)
- DPDP Rules 2025 (gazette 14 Nov 2025)
- ELV Rules 2025 — S.O. 98(E) dt. 6 Jan 2025
- CMVR GSR 703(E) dt. 14 Sep 2022 (Trade Certificate Form 16A)
