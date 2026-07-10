# Trust Signals & Shared Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the "zero trust signals site-wide" gap from `docs/Fixes as on 9 July.md` fix #3 — dedupe the footer into one shared component with a security/privacy line, add a privacy reassurance note next to PII capture, and add clearly-marked placeholder sections for testimonials and expert credentials (real content to be supplied later — this agent must not fabricate quotes or credentials).

**Architecture:** Extract the homepage's inline `Footer` function (`src/app/page.tsx:742-839`) into `src/components/site/footer.tsx`, fixing its in-page anchor links (`#assessments`, `#free-tools`, `#faq`) to be homepage-relative (`/#assessments`) so they work from any page, then use it everywhere a footer currently appears — including 3 pages that only had a bare copyright strip and 1 page with no footer at all. Add a one-line privacy reassurance to the two shared PII-capturing components (`CompanyDetailsForm`, `EmailGate`). Add a placeholder Testimonials section to the homepage with visually-obvious placeholder text (never fabricated quotes).

**Tech Stack:** Next.js App Router, Tailwind, lucide-react icons.

## Global Constraints

- Every commit must pass `npm run lint` (zero errors) and `npm run build` (zero errors) before being considered done.
- No raw apostrophes in JSX — use `&apos;` (CLAUDE.md §6).
- Never fabricate testimonial quotes, customer names, or expert credentials. Every placeholder must be visually and textually unambiguous as a placeholder (e.g. "Add a real customer quote here"), not a plausible-looking fake.
- Do not touch `src/components/assessment/company-details-form.tsx`'s validation schema or field set — only add a UI note.

---

### Task 1: Extract the shared Footer component

**Files:**
- Create: `src/components/site/footer.tsx`
- Modify: `src/app/page.tsx:742-839` (remove the inline `Footer` function, import the shared one)

**Interfaces:**
- Produces: `export function Footer()` — a zero-prop component usable from any page.

- [ ] **Step 1: Create the shared component**

Create `src/components/site/footer.tsx`:

```tsx
import Link from 'next/link'

// Shared site footer. Anchor links point at the homepage explicitly
// (`/#assessments` not `#assessments`) so they resolve correctly when this
// component renders on a page other than `/`.
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold">ComplianceCheck</span>
            </Link>
            <p className="text-gray-400 max-w-sm">
              Simplifying compliance for Indian businesses. Pay-as-you-go assessments that fit your budget.
            </p>
            <p className="text-gray-500 text-sm max-w-sm mt-3">
              Your data is encrypted in transit and at rest. We never sell your data to third parties.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#assessments" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  Assessments
                </Link>
              </li>
              <li>
                <Link href="/#free-tools" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  Free Tools
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} ComplianceCheck. Made in India <span aria-label="Indian flag">🇮🇳</span>
          </p>
          <p className="text-gray-500 text-sm">
            Contact: <a href="mailto:compliancecheck@zohomail.in" className="text-gray-400 hover:text-white transition-colors">compliancecheck@zohomail.in</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Point the homepage at the shared component**

In `src/app/page.tsx`, add the import near the top (alongside the other component imports, e.g. after the `ThemeToggle` import at line 5):

```ts
import { Footer } from '@/components/site/footer'
```

Delete the entire inline `function Footer() { ... }` block (originally lines 741-840, from the `// Footer Component` comment through its closing `}`) — the JSX at line 202 (`<Footer />`) now resolves to the imported shared component instead.

- [ ] **Step 3: Verify the homepage still builds and renders identically**

Run: `npm run build`
Expected: zero errors. Then `npm run dev` and open `/` — footer should render identically to before (same content, same layout), except the Quick Links anchors now read `/#assessments` etc. in the DOM instead of `#assessments`.

- [ ] **Step 4: Commit**

```bash
git add src/components/site/footer.tsx src/app/page.tsx
git commit -m "Extract shared Footer component with privacy/security line"
```

---

### Task 2: Use the shared Footer on every page that currently lacks it or duplicates a stub

**Files:**
- Modify: `src/app/terms/page.tsx` (replace minimal footer, ~lines 175-182)
- Modify: `src/app/privacy/page.tsx` (replace minimal footer, ~lines 185-192)
- Modify: `src/app/contact/page.tsx` (replace minimal footer, ~lines 193-200)
- Modify: `src/app/calculators/compliance-penalty-calculator/methodology/page.tsx` (add footer — currently has none)

**Interfaces:**
- Consumes: `Footer` from `@/components/site/footer` (Task 1).

- [ ] **Step 1: Replace the minimal footer in `terms/page.tsx`**

Add `import { Footer } from '@/components/site/footer'` near the top of `src/app/terms/page.tsx`. Replace the existing footer block:

```tsx
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ComplianceCheck. Made in India 🇮🇳
          </p>
        </div>
      </footer>
```

with:

```tsx
      <Footer />
```

- [ ] **Step 2: Replace the minimal footer in `privacy/page.tsx`**

Same change as Step 1, applied to `src/app/privacy/page.tsx` (identical existing footer block).

- [ ] **Step 3: Replace the minimal footer in `contact/page.tsx`**

Same change as Step 1, applied to `src/app/contact/page.tsx` (identical existing footer block).

- [ ] **Step 4: Add the footer to the methodology page, which currently has none**

In `src/app/calculators/compliance-penalty-calculator/methodology/page.tsx`, add `import { Footer } from '@/components/site/footer'` near the top, and add `<Footer />` immediately before the page's closing `</div>` (the outermost wrapping div, after the `</main>` tag).

- [ ] **Step 5: Verify all four pages build and render the full footer**

Run: `npm run build`
Expected: zero errors. Then visit `/terms`, `/privacy`, `/contact`, and `/calculators/compliance-penalty-calculator/methodology` in the dev server and confirm each now shows the full 4-column footer with the privacy/security line, not the old one-line copyright strip (or, for methodology, no footer at all).

- [ ] **Step 6: Commit**

```bash
git add src/app/terms/page.tsx src/app/privacy/page.tsx src/app/contact/page.tsx src/app/calculators/compliance-penalty-calculator/methodology/page.tsx
git commit -m "Use shared Footer with trust content on terms/privacy/contact/methodology pages"
```

---

### Task 3: Add a privacy reassurance note to the two shared PII-capture components

**Files:**
- Modify: `src/components/assessment/company-details-form.tsx:174-181` (Submit button area)
- Modify: `src/components/identity/EmailGate.tsx:183-204` (email-input step)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing new — purely additive UI copy.

- [ ] **Step 1: Add the note below the submit button in `CompanyDetailsForm`**

In `src/components/assessment/company-details-form.tsx`, replace the closing `Button` block (lines 174-180):

```tsx
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Please wait...' : (
          <>
            {submitLabel} <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        We only use this to personalise your assessment and send your report — never sold, never spammed.
      </p>
```

- [ ] **Step 2: Add the same note to `EmailGate`'s email-input step**

In `src/components/identity/EmailGate.tsx`, inside the `(step === 'idle' || step === 'ensuring_anon' || step === 'email_input')` block (lines 184-204), immediately after the closing `<ConsentCheckboxes .../>` tag and before the fragment's closing `</>`, add:

```tsx
            <p className="text-xs text-muted-foreground text-center">
              We only use this to send your report — never sold, never spammed.
            </p>
```

- [ ] **Step 3: Verify both components still render correctly**

Run: `npm run build`
Expected: zero errors. Manually spot-check one Step-0-gated assessment (e.g. `/assessment/statutory-health`) and one post-completion-gated results page (e.g. complete `/assessment/labour-code` through to its results page) to confirm the note appears and reads correctly in both light and dark mode (both components already use Tailwind dark-mode classes elsewhere).

- [ ] **Step 4: Commit**

```bash
git add src/components/assessment/company-details-form.tsx src/components/identity/EmailGate.tsx
git commit -m "Add privacy reassurance note next to PII capture fields"
```

---

### Task 4: Add a clearly-marked testimonials placeholder section to the homepage

**Files:**
- Modify: `src/app/page.tsx` (add a new `TestimonialsSection` component and render it between the FAQ section and the footer)

**Interfaces:**
- Consumes: `Footer` import already added in Task 1.
- Produces: a new `TestimonialsSection` function component in `page.tsx`.

- [ ] **Step 1: Add the `TestimonialsSection` component**

In `src/app/page.tsx`, add a new function component near the other section components (e.g. immediately above `function Header(...)`):

```tsx
// Testimonials — PLACEHOLDER CONTENT. Do not treat these as real quotes.
// Replace each card with a real beta-user testimonial (with permission to
// publish) before this section goes live. The dashed border and explicit
// "Add a real..." copy are intentional — they must stay visually obvious as
// placeholders until replaced.
function TestimonialsSection() {
  const placeholders = [
    { role: 'Founder, early beta user' },
    { role: 'HR Lead, early beta user' },
    { role: 'Compliance CS partner' },
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50" aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 id="testimonials-heading" className="text-3xl font-bold text-gray-900 dark:text-white">
            What early users say
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Checklists reviewed against the DPDP Act 2023, the 2025 Labour Codes, and the POSH Act 2013.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {placeholders.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center"
            >
              <p className="text-sm italic text-gray-400 dark:text-gray-500">
                &ldquo;Add a real customer quote here&rdquo;
              </p>
              <p className="mt-3 text-xs font-medium text-gray-400 dark:text-gray-600">
                — {p.role} (placeholder)
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Render it between the FAQ section and the footer**

In the `LandingPage` component's `<main>` (originally lines 197-199), add the new section right after `<FAQSection />` and before the closing `</main>`:

```tsx
        {/* FAQ Section */}
        <FAQSection />

        {/* Testimonials — placeholder, see TestimonialsSection for replacement instructions */}
        <TestimonialsSection />
      </main>
```

- [ ] **Step 3: Verify it renders and is unmistakably a placeholder**

Run: `npm run build`, then `npm run dev` and view `/`. Expected: a new section with 3 dashed-border cards reading "Add a real customer quote here" — visually distinct from real content (no drop shadow, dashed border, muted italic text), so nobody mistakes it for a shipped testimonial.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "Add clearly-marked testimonials placeholder section to homepage"
```

## Self-Review Notes

- **Spec coverage:** growth-plan fix #3 ("Add trust signals... 3-5 testimonials, a line naming the practising CS/labour-law experts, a privacy reassurance next to any data-capture field, a security/privacy note, and basic company/contact details in the footer") is covered as follows: security/privacy note → Task 1; privacy reassurance next to PII fields → Task 3; testimonials → Task 4 (placeholder, not fabricated). **Not covered, and intentionally deferred:** a named CS/labour-law expert credential line and a company registration number/physical address in the footer — both require real information (a real person's name/credentials, a real CIN/LLPIN/address) that this agent does not have and must not invent. Flag these to the user as outstanding manual inputs; do not add a placeholder line for them in the shipped footer copy, since an unfilled "[Add CIN here]" string live in production footer copy reads as broken, unlike the visually-obvious dashed-border testimonial placeholders.
- **Placeholder scan:** the testimonials section is a *deliberate, visually-obvious* placeholder (explicitly required by the chosen approach) — not a "TBD"/"implement later" plan gap. No other placeholders exist in this plan.
- **Type consistency:** `Footer` is imported the same way (`import { Footer } from '@/components/site/footer'`) in every task that uses it.
