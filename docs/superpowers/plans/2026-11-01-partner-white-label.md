# Partner / White-Label Mode (CA, CS, Lawyers, GRC Consultants)

## Context
We want CAs, CSs, lawyers and compliance consultants to use ComplianceCheck to produce reports **under their own brand** for their clients. Agreed model (from the user):
- **No new pricing.** Same retail price (`ASSESSMENT_PRICES`); the partner pays through the normal `<PaymentGate>` and charges their client whatever they like.
- On the intake form, a checkbox **"I'm submitting this for a client"** reveals a "Your details (shown on report)" section. The summary page, the detailed PDF and the emails then carry the partner's branding.
- **Full branding with a small credit line**: partner logo, firm name, colour, contact details and signatory everywhere. Only a footer line "Powered by ComplianceCheck.co.in" remains.
- **Both ways of filling in**: the partner fills it in for the client, or sends a branded link and the client fills it in.
- **Fully self-serve**: no approval step.
- **Scope: only the 7 paid assessments** (statutory_health, labour_code, state_wise_compliance, food_business, posh, dpdp, auto_dealer). The free tools (Gratuity, CTC, PF and Penalty Exposure calculators) stay **unchanged**.
- **No membership number** is collected or shown anywhere.

Today there's nothing like this. There is no partner/org table, the brand is hardcoded in about 15 places (two PDF generators, three email templates, results pages, Razorpay checkout name), the 7 assessments each have their own inline Step 0, and PostHog has no super properties or groups.

### My view on the "same price, no credits" choice
It's the right model for launch: it needs the least code, carries no pricing risk, and lets us see whether partners actually show up. Three things to watch:
1. **No volume incentive.** A CA with 30 clients pays retail every time. Track reports-per-partner in PostHog. When partners regularly go past about 5 reports a month, add a `percent_off` kind to the existing `promo_codes` table and give them a personal code. That's a small change later.
2. **Re-typing friction.** Remember the partner's details in the browser (Phase 1) and offer a saved, verified profile (Phase 2), so they don't type them for every client.
3. **Impersonation / liability.** Self-serve means anyone can put "XYZ & Co., Chartered Accountants" on a report. Mitigations: a required attestation checkbox ("these details are mine and I'm authorised to issue this report"), a report disclaimer saying the preparer's details were self-declared and not verified by ComplianceCheck, and a short "Partner terms" page. Please run that copy past a lawyer.

---

## Phase 1 — Partner fills in for the client (MVP)

### 1. Database (new migration `supabase/migrations/20261101000000_partner_mode.sql`)
- New table **`report_preparers`**, written only by the service role (no anon policies; same reasoning as `assessment_entitlements`):
  `id uuid pk, email citext not null, firm_name, preparer_name, designation` (CHECK in `CA|CS|CMA|Advocate|Consultant|Other`)`, phone, contact_email, website, city, logo_path, brand_color, slug unique (Phase 2), verified_at (Phase 2), attested_at, created_at, updated_at`.
- Add to **`assessments`, `posh_assessments`, `auto_dealer_assessments`**:
  - `submission_mode text not null default 'self'` CHECK in `self | partner_on_behalf | client_via_partner_link`
  - `preparer_id uuid null references report_preparers(id)`
  - `prepared_by jsonb null`: a **snapshot** of the branding at submit time, so the report doesn't change if the partner edits their profile later.
- Add `preparer_id uuid null` and `submission_mode text` to **`assessment_entitlements`**, so revenue-by-partner is one query instead of a join across three tables.
- Index `(preparer_id)` on all four tables.
- Storage bucket **`report-logos`** (public read). Uploads go only through an API route.
- Existing anon INSERT policies already cover the new columns. Nothing else changes in RLS.

### 2. Intake form (Step 0) — one shared component dropped into each form
- New `src/components/assessment/prepared-for-client-section.tsx`:
  - A checkbox "I'm a CA / CS / lawyer / consultant filling this in for a client".
  - When checked:
    - The existing 7 fields are relabelled to the client ("Client's company name", "Client contact name"…). Order stays as §11 requires. Client email and phone become **optional**: partners often won't share client contacts, and it reduces DPDP exposure.
    - A **"Your details (shown on report)"** block appears:
      - Required: firm name, your name, designation (dropdown), your email (used for payment and report delivery).
      - Optional: phone, website, city, logo upload (PNG/JPG ≤ 300 KB), brand colour (preset swatches plus hex).
      - Required attestation checkbox.
  - Partner details are prefilled from `localStorage` (wrapped in try/catch) after the first use.
- New constants `PREPARER_DESIGNATIONS` in `@/lib/constants/india.ts`. Shared type `PreparedBy` in `src/lib/partner/types.ts`.
- Wire it into every Step 0:
  - `src/components/assessment/company-details-form.tsx` (statutory-health)
  - Inline forms in `labour-code`, `dpdp`, `food-business`, `state-wise-compliance`, `posh` pages
  - `src/components/auto-dealer/ApplicabilityForm.tsx`
- DPDP keeps its no-contact-upfront exception for the client. The partner's own details aren't client contact info, so the section still applies there.
- Only these 7 paid Step 0 forms change. Free calculators (`src/app/calculator/*`, `src/app/calculators/*`) are not touched.
- New `POST /api/partner/logo`: checks the file's magic bytes for PNG/JPEG and its size, stores it at `report-logos/<uuid>.<ext>` using `createAdminClient()` (lazily initialised), and returns the path. Rate-limit by IP.

### 3. Submit routes
In every `src/app/api/assessment/*-submit` route plus `auto-dealer/start`:
- Accept optional `preparedBy` and `submissionMode`, and validate them with zod.
- Upsert `report_preparers` by email. Write `preparer_id`, `submission_mode` and the `prepared_by` snapshot on the row.
- Keep the existing try/catch and the `local_` fallback. For `local_` rows, branding lives in the localStorage payload.
- Put the shared logic in `src/lib/partner/persist-preparer.ts` so each route adds about 3 lines.
- Submit-route confirmation emails (food, posh, state-wise): when `submission_mode !== 'self'`, send them to the partner email, with the partner's branding.

### 4. Detailed PDF report
- Add an optional `preparedBy?: PreparedBy & { logoDataUrl?: string }` to `UnifiedReportData` (`src/lib/pdf/unified-report-generator.ts:93`). When it's absent, the output must be **exactly as it is today**.
- When it's present:
  - **Cover** (`:238-252`): the partner logo (`doc.addImage`) and firm name replace the "ComplianceCheck" wordmark. The header bar uses `brand_color`. The tagline becomes "Prepared by {preparer_name}, {designation}".
  - **New "Prepared By" box** beside "Prepared For" (`:298-330`).
  - **Footer** (`addPageFooter` `:166`): "Prepared by {firm} · Powered by ComplianceCheck.co.in | Not legal advice".
  - **"Schedule your next assessment"** (`:964-979`) becomes "Contact {firm}: {phone} / {email}".
  - **Disclaimer** (`:981`): add the preparer clause (self-declared, not verified; the preparer is responsible for advice to the client).
  - **Filename**: `{Firm}-{Client}-{Type}-Report.pdf` (`report-configs.ts`, `download-buttons.tsx:320`).
  - Every string goes through the existing `cleanText()` (§5).
- Mirror the same changes in `src/lib/pdf/auto-dealer-report.ts` (cover `:235`, footer `:158`, disclaimer `:787`).
- Plumbing:
  - The adapters in `report-data-adapter.ts` copy `prepared_by` from the row.
  - The server side (`src/lib/report/paid-report.ts`, `server-report.ts`, `server-posh-report.ts`) downloads the logo with the admin client and converts it to a data URL.
  - The client side fetches the public logo URL and converts it to a data URL.
  - New helper `src/lib/partner/logo.ts` handles both.

### 5. Summary page, results pages, delivery
- `UnifiedSummaryData` / `buildSummaryData` / `toSummary` / `toAutoDealerSummary`: add an optional `preparedBy`.
- `<AssessmentSummary>`: a branded header strip (logo, firm name, "Prepared for {client}") and the partner's colour as an accent. No other layout change.
- Show the same strip on the full report views: `src/app/results/[id]/page.tsx`, the POSH results view and `auto-dealer/results/[id]`. Support contact text becomes the partner's contact. A small "Powered by ComplianceCheck" stays.
- `<PaymentGate>`: prefill email with the partner's email. The Razorpay `name` **stays "ComplianceCheck"** because we're the merchant of record and the GST invoice comes from us. Add one line explaining that, so partners know to bill their client separately.
- `/api/email/send-report`:
  - When branded: the header becomes the partner logo and firm name, the CTA and contact block become the partner's, and `from` is `"{Firm} via ComplianceCheck <noreply@…>"` with `reply_to` set to the partner email.
  - Pull the three templates' brand bits into a shared `brand` object first. That's a small refactor scoped to this file.
- `whatsapp-share-button.tsx:78`: the share text uses the firm name. The share-link token and route are unchanged.

### 6. PostHog (usage specifics)
- **Super properties**: on toggle and submit, call `posthog.register({ submission_mode, is_partner, preparer_designation, preparer_id })`. They then ride on every later event (paywall, checkout, download, share). Unregister when the box is unticked.
- **Group analytics**: `posthog.group('preparer', preparer_id, { firm_name, designation, city, first_seen })` gives per-firm usage. ⚠️ Group analytics is a paid PostHog add-on. Without it, the super properties still allow breakdown by `preparer_id`.
- **Identify**: in on-behalf mode the person typing is the partner, so identify by the partner's email, which is consistent with the current email-as-distinct-id pattern. Client company names and emails are **never** sent to PostHog; only the firm is.
- **New events** go in `src/lib/analytics/events.ts`, with typed wrappers in `tracking.ts` (§10):
  - `partner_mode_toggled` {on, assessment_type}
  - `partner_details_prefilled`
  - `partner_logo_uploaded` {size_kb, type}
  - `partner_details_submitted` {designation, has_logo, has_brand_color}
  - `branded_report_generated` {assessment_type, channel: client|server}
  - `branded_report_emailed`
- **Existing events** get `submission_mode`, `preparer_id`, `preparer_designation` (mostly via the super properties).
- **Server events**: `captureServerEvent` for `payment_succeeded` / `payment_failed` in `verify` / `webhook` / `redeem-waiver` reads `preparer_id` and `submission_mode` from the entitlement row.
- **Dashboard** "Partner program" (create in PostHog once events flow):
  - Weekly active partners
  - Reports per partner (distribution)
  - Partner vs direct funnel (started → completed → paywall → paid)
  - Revenue by designation
  - Partners with 2 or more clients in 30 days (retention)
  - Top assessment types used by partners

### 7. Admin
- `src/app/api/admin/stats/route.ts`: add a `partners` block (count, active in period, reports, paid, revenue from `assessment_entitlements` grouped by `preparer_id`).
- New page `src/app/admin/(dashboard)/partners/page.tsx` listing preparers with counts, so you can spot partners to approach about volume deals.

---

## Phase 2 — Client fills in via the partner's link, plus a saved profile
- **Verified profile**: `/partners/profile`. Email OTP reuses `src/lib/identity/verify-otp.ts` and `EmailGate`. It saves `report_preparers` with `verified_at` and generates a `slug`. Editing needs OTP, so nobody can hijack another person's profile or link by typing their email.
- **Branded link**: `/p/<slug>` resolves through a public API that returns display fields only (firm, logo, colour, designation). The partner context is stored in sessionStorage, and the assessment pages show "Assessment by {firm}". Submit sends `submission_mode='client_via_partner_link'` and `preparer_id`. The client sees the normal 7 fields and pays the same price. A consent checkbox "Share my results with {firm}" is **required** before the partner is notified or gets a copy (DPDP).
- **Partner dashboard** `/partners/dashboard` (behind OTP): a list of their clients' assessments, payment status and download / resend links, read through a service-role API filtered by the verified email.
- Events: `partner_profile_saved`, `partner_link_copied`, `partner_link_visited`, `partner_link_assessment_started/completed`, `partner_dashboard_viewed`, `partner_report_redownloaded`.

## Phase 3 — Go-to-market
- A `/partners` landing page (for CA / CS / law firms): a sample branded report PDF, the "same price, you set your fee" message, and FAQs. Schema.org copy derives from `ASSESSMENT_PRICES`.
- A volume discount via a `percent_off` promo kind, triggered by PostHog data.
- Outreach: ICAI/ICSI study circles, CA WhatsApp groups, LinkedIn. Track it with UTMs captured on `/partners` and `/p/<slug>` and stored in `report_preparers.first_source`.

---

## Docs to update
- CLAUDE.md §11: Step 0 now allows the optional "Prepared for client" section, and the report generator accepts `preparedBy`.
- CLAUDE.md: a new §19 "Partner mode".

## Verification
- `npm run lint` and `npm run build` with zero errors. `npx vitest`, plus new tests:
  - `tests/unit/partner-branding.test.ts`: (a) without `preparedBy`, the PDF text is identical to today; (b) with it, the cover, footer and "Prepared By" text contain the firm name, and non-ASCII firm names are cleaned.
  - zod validation of `preparedBy` in `persist-preparer`.
  - The existing `report-adapters.test.ts` still passes.
- Manual check with `npm run dev`, for each of the 7 types:
  - Tick "for a client", fill partner details with a logo, submit.
  - Check the DB row for `prepared_by`, `preparer_id` and `submission_mode`.
  - The summary shows the branding. Pay with a waiver promo code.
  - The PDF (client-side download and the email attachment) shows the partner cover, footer and disclaimer.
  - The email arrives with the partner header and a reply-to to the partner.
  - The WhatsApp text uses the firm name.
- Repeat unticked and confirm the output is unchanged.
- PostHog live events: check that the super properties appear on `paywall_viewed` / `payment_succeeded`, and that no client PII is sent.
