/**
 * POSH Assessment End-to-End Tests
 *
 * Tests the complete POSH Act 2013 Compliance Assessment flow:
 * - Company details step
 * - Applicability phase (one question per screen, yes_no + single_choice)
 * - Compliance phase (one question per screen, yes_no + single_choice)
 * - Scoring and report generation
 * - Database persistence (localStorage fallback)
 * - Accessibility compliance
 *
 * Rewritten against the live one-question-per-screen UI (verified via source
 * + a driven browser session) — the previous version assumed a bulk
 * applicability form with <select> elements and Yes/No-only questions,
 * neither of which match the current page.
 *
 * @see https://playwright.dev/docs/intro
 */

import { test, expect, type Page } from '@playwright/test';
import { axeAccessibility } from './utils/axe-helper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const TEST_COMPANY = {
  fullName: 'Priya Sharma',
  email: 'priya.sharma@testcompany.co.in',
  phone: '9876543210',
  companyName: 'Test Tech Solutions Pvt Ltd',
};

const RESULTS_HEADING = 'POSH Compliance Assessment Results';

/**
 * Navigate to the POSH assessment page.
 */
async function navigateToPOSHAssessment(page: Page) {
  await page.goto(`${BASE_URL}/assessment/posh`);
  await expect(page).toHaveTitle(/POSH Act 2013/i);
}

/**
 * Fill the company-details step (the only step with real form fields —
 * industry/employee-count/state are asked one-at-a-time later, in the
 * applicability phase) and submit it.
 */
async function fillCompanyDetails(page: Page) {
  await page.fill('input[name="fullName"]', TEST_COMPANY.fullName);
  await page.fill('input[name="email"]', TEST_COMPANY.email);
  await page.fill('input[name="phone"]', TEST_COMPANY.phone);
  await page.fill('input[name="companyName"]', TEST_COMPANY.companyName);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500);
}

/**
 * Answer whichever question is currently on screen. Applicability and
 * compliance both render the same two shapes: a Yes/No pair, or a list of
 * single_choice option buttons. Scoped to <main> so the header's theme
 * toggle and the "Back"/"More details" controls are never picked up.
 *
 * For single_choice questions, `singleChoiceStrategy` picks which option to
 * click: 'last' during applicability, because those options are typically
 * ordered smallest-to-largest (employee count, location count, ...) and the
 * *first* one ("fewer than 10 employees", etc.) can trigger a genuine
 * small-business exemption branch (see renderLCCInfo) that dead-ends the
 * flow before the compliance phase or the CTA button ("Explore Other
 * Assessments") navigates away entirely. 'first' is fine during compliance,
 * where single_choice questions are about compliance detail, not
 * eligibility, so they don't gate the flow the same way.
 */
async function answerCurrentQuestion(
  page: Page,
  choice: 'yes' | 'no' = 'yes',
  singleChoiceStrategy: 'first' | 'last' = 'first'
) {
  const mainButtons = page.locator('main').getByRole('button');
  const yesButton = mainButtons.filter({ hasText: /^Yes$/ });

  if (await yesButton.count() > 0) {
    const noButton = mainButtons.filter({ hasText: /^No$/ });
    await (choice === 'no' ? noButton : yesButton).first().click();
  } else {
    const optionButtons = mainButtons.filter({ hasNotText: /^(Back|More details|Hide details)$/ });
    await (singleChoiceStrategy === 'last' ? optionButtons.last() : optionButtons.first()).click();
  }
  await page.waitForTimeout(900); // auto-advance is 800ms (CLAUDE.md baseline)
}

/**
 * Walk the applicability phase (Phase 1). Always answers inclusively (Yes /
 * most-inclusive option) so the assessment reliably reaches the compliance
 * phase — applicability determines profile & eligibility, not compliance,
 * so unlike the compliance phase it isn't varied by answerPattern.
 */
async function answerApplicabilityPhase(page: Page) {
  for (let guard = 0; guard < 40; guard++) {
    const onApplicability = await page.getByText('Phase 1: Applicability').count() > 0;
    if (!onApplicability) return;
    await answerCurrentQuestion(page, 'yes', 'last');
  }
}

/**
 * Walk the compliance phase (Phase 2) until the results page appears.
 * Returns the number of questions answered.
 */
async function answerCompliancePhase(
  page: Page,
  answerPattern: 'all_yes' | 'mixed' | 'all_no'
): Promise<number> {
  let answered = 0;
  for (let guard = 0; guard < 80; guard++) {
    const onResults = await page.getByText(RESULTS_HEADING).count() > 0;
    if (onResults) break;

    const hasYesNo = await page.locator('main').getByRole('button', { name: 'Yes', exact: true }).count() > 0;
    if (hasYesNo) {
      const choice =
        answerPattern === 'all_no' ? 'no' :
        answerPattern === 'mixed' ? (answered % 2 === 0 ? 'yes' : 'no') :
        'yes';
      await answerCurrentQuestion(page, choice);
    } else {
      await answerCurrentQuestion(page);
    }
    answered++;
  }
  return answered;
}

/**
 * Complete company details + the full applicability and compliance flow.
 */
async function completeAssessment(page: Page, answerPattern: 'all_yes' | 'mixed' | 'all_no'): Promise<number> {
  await answerApplicabilityPhase(page);
  return answerCompliancePhase(page, answerPattern);
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('POSH Assessment', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // --------------------------------------------------------------------------
  // Test 1: Page Accessibility
  // --------------------------------------------------------------------------

  test('meets WCAG 2.0 accessibility standards', async ({ page }) => {
    await navigateToPOSHAssessment(page);

    const violations = await axeAccessibility(page);
    expect(violations).toHaveLength(0);

    await expect(page.locator('[aria-label]').first()).toBeVisible();

    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // Test 2: Authentication NOT Required (Anonymous Assessment)
  // --------------------------------------------------------------------------

  test('allows anonymous assessment without login', async ({ page }) => {
    await navigateToPOSHAssessment(page);

    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page).not.toHaveURL(/login/);
  });

  // --------------------------------------------------------------------------
  // Test 3: Applicability Flow Starts After Company Details
  // --------------------------------------------------------------------------

  test('enters the applicability phase after submitting company details', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);

    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();
    await expect(page.getByText('Phase 1: Applicability')).toBeVisible();
    await expect(page.locator('[role="progressbar"]').first()).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 4: Full Assessment - All Compliant
  // --------------------------------------------------------------------------

  test('completes full assessment with all compliant answers', async ({ page }) => {
    test.setTimeout(120000);

    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);

    const questionCount = await completeAssessment(page, 'all_yes');
    console.log(`Answered ${questionCount} compliance questions`);

    await expect(page.getByText(RESULTS_HEADING)).toBeVisible({ timeout: 10000 });

    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThan(80);

    await expect(page.getByRole('button', { name: /download full report/i })).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 5: Full Assessment - All-No Answer Pattern
  // --------------------------------------------------------------------------
  //
  // Deliberately does NOT assert "all-No scores low": POSH's compliance
  // questions mix phrasing polarity (some are risk/gap questions where "No"
  // is the compliant answer, e.g. "have complaints gone unresolved..."), so
  // answering No throughout does not reliably produce a low score — verified
  // live (it scored *higher* than the all-Yes run). Asserting a direction
  // without enumerating every question's complianceAnswer polarity would be
  // exactly the brittle-assumption trap flagged in the pre-existing
  // PLAYWRIGHT_TEST_REVIEW.md for a different assessment. This test instead
  // verifies the flow completes and renders a coherent results view for any
  // answer pattern.

  test('completes the full assessment for an all-No answer pattern', async ({ page }) => {
    test.setTimeout(120000);

    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);

    const questionCount = await completeAssessment(page, 'all_no');
    console.log(`Answered ${questionCount} compliance questions`);

    await expect(page.getByText(RESULTS_HEADING)).toBeVisible({ timeout: 10000 });

    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);

    await expect(page.getByText('Category Breakdown')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 6: PDF Report Generation
  // --------------------------------------------------------------------------

  test('generates PDF report successfully', async ({ page }) => {
    test.setTimeout(120000);

    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);
    await completeAssessment(page, 'mixed');

    await expect(page.getByText(RESULTS_HEADING)).toBeVisible({ timeout: 10000 });

    const downloadButton = page.getByRole('button', { name: /download full report/i });
    await downloadButton.click();
    await page.waitForTimeout(3000);

    const errorMessage = await page.locator('text=/failed to generate report/i').count();
    expect(errorMessage).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Test 7: Result Persistence (localStorage)
  // --------------------------------------------------------------------------
  //
  // POSH renders its results inline on /assessment/posh — unlike the
  // DB-backed assessments it never navigates to /results/[id], so
  // persistence here means the local cache the results view is restored
  // from, not a URL/reload round-trip.

  test('caches completed assessment results in localStorage', async ({ page }) => {
    test.setTimeout(120000);

    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);
    await completeAssessment(page, 'all_yes');

    await expect(page.getByText(RESULTS_HEADING)).toBeVisible({ timeout: 10000 });

    const localStorageKeys = await page.evaluate(() => Object.keys(window.localStorage));
    expect(localStorageKeys.some(key => key.startsWith('posh_assessment_'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Test 8: Auto-Advance Navigation
  // --------------------------------------------------------------------------

  test('auto-advances after answering question', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);

    // Question text renders in a styled <div> (shadcn CardTitle), not a
    // semantic heading — target it by its stable Tailwind class instead.
    const questionText = page.locator('main .tracking-tight').first();
    const firstQuestion = await questionText.textContent();

    await answerCurrentQuestion(page, 'yes', 'last');

    const secondQuestion = await questionText.textContent();
    expect(secondQuestion).not.toBe(firstQuestion);
  });

  // --------------------------------------------------------------------------
  // Test 9: Progress Tracking
  // --------------------------------------------------------------------------

  test('tracks and displays progress correctly', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);

    let progressText = await page.locator('text=/\\d+%|progress/i').first().textContent();
    console.log('Initial progress:', progressText);

    for (let i = 0; i < 5; i++) {
      await answerCurrentQuestion(page, 'yes', 'last');
    }

    progressText = await page.locator('text=/\\d+%/').first().textContent();
    const progress = parseInt(progressText?.match(/\d+/)?.[0] || '0');
    expect(progress).toBeGreaterThan(0);
    console.log('After 5 questions:', progress + '%');
  });

  // --------------------------------------------------------------------------
  // Test 10: Mobile Responsiveness
  // --------------------------------------------------------------------------

  test('works correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await navigateToPOSHAssessment(page);

    await expect(page.locator('input[name="companyName"]')).toBeVisible();

    await fillCompanyDetails(page);

    // Now on the applicability phase — check a real answer button's touch
    // target size (WCAG 44x44px minimum). Exclude "More details"/"Back",
    // which are small text-link-style controls, not answer buttons.
    const button = page.locator('main').getByRole('button')
      .filter({ hasNotText: /^(Back|More details|Hide details)$/ })
      .first();
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  // --------------------------------------------------------------------------
  // Test 11: LocalStorage Fallback
  // --------------------------------------------------------------------------

  test('uses localStorage when database is unavailable', async ({ page }) => {
    await page.route('**/api/assessment/**', route => route.abort());

    await navigateToPOSHAssessment(page);
    await fillCompanyDetails(page);

    for (let i = 0; i < 5; i++) {
      await answerCurrentQuestion(page, 'yes', 'last');
    }

    const localStorage = await page.evaluate(() => Object.keys(window.localStorage));
    expect(localStorage.some(key => key.includes('posh') || key.includes('assessment'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Test 12: Input Validation
  // --------------------------------------------------------------------------

  test('validates user inputs correctly', async ({ page }) => {
    await navigateToPOSHAssessment(page);

    // Submit without filling required fields.
    await page.click('button[type="submit"]');
    const errorCount = await page.locator('#fullName-error, #email-error, #phone-error, #companyName-error').count();
    expect(errorCount).toBeGreaterThan(0);

    // Invalid email.
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#email-error')).toContainText(/invalid email/i);

    // Invalid phone (not a 10-digit Indian mobile number starting 6-9).
    await page.fill('input[name="phone"]', '12345');
    await page.click('button[type="submit"]');
    await expect(page.locator('#phone-error')).toBeVisible();
    await expect(page.locator('#phone-error')).toContainText(/invalid indian mobile number/i);
  });

});
