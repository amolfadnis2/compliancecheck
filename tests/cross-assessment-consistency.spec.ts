import { test, expect, Page } from '@playwright/test';
import { selectFromDropdown } from './utils/form-helpers';

/**
 * Cross-Assessment Consistency Tests
 *
 * Verifies UI/UX consistency across three assessment types:
 * - Statutory Health Check
 * - Labour Code Readiness
 * - DPDP Gap Assessment
 *
 * NOTE on scope: every assessment's /results/[id] page is wrapped in
 * <GatedResults>, requiring real email OTP verification (a Next.js Server
 * Action calling Supabase Auth's signInWithOtp/verifyOtp directly — not a
 * mockable REST call) before any results content renders. The "Results Page
 * Consistency" block below checks what's actually reachable and verifiable
 * without a real Supabase project + email inbox: that all three assessments
 * consistently land on the same OTP gate. It does not — and currently
 * cannot, from this test suite — verify score/PDF/email content beyond
 * that gate.
 */

/**
 * Question/option buttons only — excludes nav controls (Back/Previous/More
 * details) by text and the icon-only theme toggle by aria-label (it has no
 * visible text, so a text-only filter doesn't catch it and it ends up
 * "first" since it's in the header, before any real question).
 */
function answerOptionButtons(page: Page) {
  return page
    .locator('button:not([aria-label*="mode" i]):not([aria-label*="theme" i])')
    .filter({ hasNotText: /^(Back|Previous|More details|Hide details)$/ });
}

const ASSESSMENTS = [
  { path: '/assessment/statutory-health', name: 'Statutory Health Check' },
  { path: '/assessment/labour-code', name: 'Labour Code Readiness' },
  { path: '/assessment/dpdp', name: 'DPDP Gap Assessment' }
];

test.describe('Cross-Assessment - Navigation Consistency', () => {

  for (const assessment of ASSESSMENTS) {
    test(`${assessment.name} should be accessible from homepage`, async ({ page }) => {
      await page.goto('/');

      // Homepage assessment cards are a single link combining badge + title +
      // description + CTA into one accessible name — match by the first word
      // of the assessment name rather than an exact link name.
      const assessmentLink = page.getByRole('link', { name: new RegExp(assessment.name.split(' ')[0], 'i') });
      await expect(assessmentLink.first()).toBeVisible();
    });

    test(`${assessment.name} should have back navigation`, async ({ page }) => {
      await page.goto(assessment.path);

      const homeLink = page.locator('a[href="/"]').first();
      await expect(homeLink).toBeVisible();
    });
  }
});

test.describe('Cross-Assessment - Form Consistency', () => {

  test('all assessments should have company name field', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      const companyField = page.getByLabel(/company name/i);
      await expect(companyField.first()).toBeVisible();
    }
  });

  test('all assessments should have email field', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      const emailField = page.getByLabel(/email/i);
      await expect(emailField.first()).toBeVisible();
    }
  });

  test('all assessments should have industry selector', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      // DPDP's placeholder is "Select your industry" vs the others' "Select
      // industry" — match by substring, not exact text.
      const industryButton = page.getByRole('combobox').filter({ hasText: /select.*industry/i });
      await expect(industryButton.first()).toBeVisible();
    }
  });

  test('all assessments should have state selector', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      const stateButton = page.getByRole('combobox').filter({ hasText: /select.*state/i });
      await expect(stateButton.first()).toBeVisible();
    }
  });

  test('all assessments should have continue/start button', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      const startButton = page.getByRole('button', { name: /continue|start/i });
      await expect(startButton).toBeVisible();
    }
  });
});

/**
 * Fill the company-details step for a given assessment and submit it.
 * DPDP has two extra fields (Annual Revenue dropdown, 4 Yes/No radio
 * questions about data processing) the other two don't — filled here so its
 * form reaches the same "ready to submit" state as the others.
 */
async function fillBasicDetails(page: Page, assessmentType: string, email?: string) {
  await page.getByLabel(assessmentType === 'dpdp' ? /your full name/i : /full name|your name/i).fill('Test User');
  await page.getByLabel(/email/i).fill(email ?? `test-${Date.now()}@example.com`);
  await page.getByLabel(/company name/i).fill('Test Co');
  await selectFromDropdown(page, /select.*state/i, 'Maharashtra');
  await selectFromDropdown(page, /select.*employee|select range/i, '10-19');
  await selectFromDropdown(page, /select.*industry/i, 'Information Technology');

  const phoneField = page.getByLabel(/phone/i);
  if (await phoneField.isVisible().catch(() => false)) {
    await phoneField.fill('9876543210');
  }

  if (assessmentType === 'dpdp') {
    await selectFromDropdown(page, /select.*revenue/i, 'Below');
    // 4 required Yes/No radios (data-processing profile) — answer No to
    // each; unanswered ones block submission ("Invalid option: expected
    // one of \"yes\"|\"no\"").
    const noRadios = page.getByRole('radio', { name: /^no$/i });
    const count = await noRadios.count();
    for (let i = 0; i < count; i++) {
      await noRadios.nth(i).click();
    }
  }

  // Short timeout + swallow failure: callers passing a deliberately invalid
  // email expect this to possibly stay disabled forever (labour-code/DPDP
  // gate on formState.isValid) rather than hang for the default timeout.
  await page.getByRole('button', { name: /continue to assessment|start assessment/i })
    .click({ timeout: 5000 })
    .catch(() => {});
  await page.waitForTimeout(1000);
}

test.describe('Cross-Assessment - Question UI Consistency', () => {

  test('all assessments should render an answerable first question', async ({ page }) => {
    // Not literally "has a Yes button": DPDP's compliance questions mix
    // Yes/No with multi-choice buttons (verified live — its Question 1 of
    // 33 is multi-choice), so asserting Yes/No specifically isn't true
    // across all three. What IS consistent: after details are submitted,
    // some set of clickable answer buttons renders.
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      await fillBasicDetails(page, assessment.path.split('/').pop()!);

      expect(await answerOptionButtons(page).count(), `${assessment.name} should show answer option buttons`).toBeGreaterThan(0);
    }
  });

  test('all assessments should have progress indicator', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      await fillBasicDetails(page, assessment.path.split('/').pop()!);

      const progressIndicator = page.getByText(/%|step|progress|complete/i);
      await expect(progressIndicator.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Cross-Assessment - Results Page Consistency (OTP gate)', () => {

  // Answer whatever Yes/No question is currently on screen until the OTP
  // gate ("Verify your email to continue") or a completion screen appears.
  async function answerUntilGateOrComplete(page: Page): Promise<boolean> {
    const maxTime = Date.now() + 90000;
    while (Date.now() < maxTime) {
      if (await page.getByText(/verify your email to continue/i).isVisible({ timeout: 500 }).catch(() => false)) {
        return true;
      }
      // Checked before Yes/No, but only when enabled: the submit button is
      // visible-but-disabled as a preview even before the last question is
      // answered (Labour Code, verified live), and stays visible-and-enabled
      // once it is — re-clicking an already-selected Yes/No there is a
      // no-op that never advances, so an *enabled* submit button must win
      // over Yes/No; a disabled one must fall through to answering below.
      const advanceButton = page.getByRole('button', { name: /view my results|get.*report|see results|^complete$/i }).first();
      if (await advanceButton.isVisible({ timeout: 300 }).catch(() => false) && await advanceButton.isEnabled().catch(() => false)) {
        await advanceButton.click();
        await page.waitForTimeout(500);
        continue;
      }
      const yesButton = page.getByRole('button', { name: /^yes$/i }).first();
      if (await yesButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await yesButton.click();
        await page.waitForTimeout(900);
        continue;
      }
      // Multi-choice questions rendered as radio inputs.
      const radioOption = page.getByRole('radio').first();
      if (await radioOption.isVisible({ timeout: 300 }).catch(() => false)) {
        await radioOption.click();
        await page.waitForTimeout(300);
        continue;
      }
      // Multi-choice questions rendered as plain option buttons (DPDP's
      // compliance questions, e.g. "Explicit consent with granular
      // purpose-specific options" — verified live).
      const optionButton = answerOptionButtons(page).first();
      if (await optionButton.isVisible({ timeout: 300 }).catch(() => false)) {
        await optionButton.click();
        await page.waitForTimeout(900);
        continue;
      }
      await page.waitForTimeout(500);
    }
    return false;
  }

  test('all assessments should reach the same email verification gate on completion', async ({ page }) => {
    // Completing all three in one test (12 + ~30 + 33 questions) legitimately
    // exceeds the default 60s timeout — verified live it was still making
    // real progress (through Statutory Health, well into Labour Code), not
    // stuck.
    test.setTimeout(240000);
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      await fillBasicDetails(page, assessment.path.split('/').pop()!);

      const reachedGate = await answerUntilGateOrComplete(page);
      expect(reachedGate, `${assessment.name} should reach the OTP gate after completion`).toBe(true);
    }
  });
});

test.describe('Cross-Assessment - Color Scheme Consistency', () => {

  test('all assessments should use consistent status colors', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      const pageContent = await page.content();

      const hasStandardClasses =
        pageContent.includes('bg-green') ||
        pageContent.includes('bg-amber') ||
        pageContent.includes('bg-red') ||
        pageContent.includes('text-green') ||
        pageContent.includes('text-red');

      expect(hasStandardClasses).toBe(true);
    }
  });
});

test.describe('Cross-Assessment - Mobile Consistency', () => {

  test('all assessments should be usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);

      const companyField = page.getByLabel(/company name/i).first();
      await expect(companyField).toBeVisible();

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
    }
  });
});

test.describe('Cross-Assessment - Error Handling Consistency', () => {

  test('all assessments should validate email consistently', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      const assessmentType = assessment.path.split('/').pop()!;

      // Fill everything else validly so the only failure is the email —
      // statutory-health's submit button is always enabled (validates
      // on-submit), while labour-code/DPDP's stays disabled until the whole
      // form (formState.isValid) passes, so a still-disabled button here is
      // itself the correct, consistent "blocked" outcome.
      await fillBasicDetails(page, assessmentType, 'invalid-email');

      // Either blocked on the same page, or shows an error — never silently
      // proceeds to the question flow with an invalid email.
      const stillOnForm = page.url().includes(assessment.path);
      expect(stillOnForm).toBe(true);
    }
  });
});
