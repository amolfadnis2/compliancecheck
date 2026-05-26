import { test, expect } from '@playwright/test';
import { selectFromDropdown } from './utils/form-helpers';

/**
 * Restaurant & Food Business Compliance Assessment — E2E Test Suite
 */

const DETAILS_URL = '/assessment/food-business';

test.describe('Food Business Assessment — Step 0: Company Details', () => {

  test('should render the details form with all 6 required fields', async ({ page }) => {
    await page.goto(DETAILS_URL);

    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mobile number/i)).toBeVisible();
    await expect(page.getByLabel(/business name/i)).toBeVisible();
    await expect(page.getByLabel(/registered state/i)).toBeVisible();
    await expect(page.getByLabel(/employee count/i)).toBeVisible();
  });

  test('should show question count hint on submit button', async ({ page }) => {
    await page.goto(DETAILS_URL);
    const btn = page.getByRole('button', { name: /start assessment/i });
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('questions');
  });

  test('should block submission with empty form', async ({ page }) => {
    await page.goto(DETAILS_URL);
    await page.getByRole('button', { name: /start assessment/i }).click();
    // Form should not advance — still on details step
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test('should advance to applicability after valid Step 0 submission', async ({ page }) => {
    await page.goto(DETAILS_URL);

    await page.getByLabel(/full name/i).fill('Ramesh Sharma');
    await page.getByLabel(/email/i).fill('ramesh@restaurant.com');
    await page.getByLabel(/mobile number/i).fill('9876543210');
    await page.getByLabel(/business name/i).fill('Sharma Dhaba');
    await selectFromDropdown(page, /registered state/i, 'Maharashtra');
    await selectFromDropdown(page, /employee count/i, '11-20');
    await page.getByRole('button', { name: /start assessment/i }).click();

    // Should move to applicability phase — Step 1: Business Profile
    await expect(page.getByText(/business profile/i)).toBeVisible({ timeout: 5000 });
  });

});

test.describe('Food Business Assessment — Applicability Phase', () => {

  async function fillStep0AndProceed(page: import('@playwright/test').Page) {
    await page.goto(DETAILS_URL);
    await page.getByLabel(/full name/i).fill('Test Owner');
    await page.getByLabel(/email/i).fill('owner@testfood.com');
    await page.getByLabel(/mobile number/i).fill('9876543210');
    await page.getByLabel(/business name/i).fill('Test Restaurant');
    await selectFromDropdown(page, /registered state/i, 'Maharashtra');
    await selectFromDropdown(page, /employee count/i, '11-20');
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
  }

  test('should show progress bar during applicability', async ({ page }) => {
    await fillStep0AndProceed(page);
    const progressBar = page.getByRole('progressbar').first();
    await expect(progressBar).toBeVisible();
  });

  test('should auto-advance on Yes/No answer (no manual Next button)', async ({ page }) => {
    await fillStep0AndProceed(page);

    // Answer the first yes/no question
    const yesBtn = page.getByRole('button', { name: /^yes$/i }).first();
    if (await yesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const initialCount = await page.getByText(/1 of/i).textContent();
      await yesBtn.click();
      // Wait for auto-advance (800ms)
      await page.waitForTimeout(1000);
      const newCount = await page.getByText(/2 of/i).isVisible().catch(() => false);
      expect(newCount).toBeTruthy();
    }
  });

  test('should reach compliance summary after completing applicability', async ({ page }) => {
    await fillStep0AndProceed(page);

    // Answer up to 20 questions to get through applicability
    for (let i = 0; i < 20; i++) {
      const yesBtn = page.getByRole('button', { name: /^yes$/i }).first();
      const noBtn = page.getByRole('button', { name: /^no$/i }).first();

      if (await yesBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await yesBtn.click();
        await page.waitForTimeout(900);
      } else if (await noBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await noBtn.click();
        await page.waitForTimeout(900);
      } else {
        // Might be a single-choice question
        const firstOption = page.getByRole('button').filter({ hasText: /.+/ }).first();
        if (await firstOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await firstOption.click();
          await page.waitForTimeout(900);
        } else {
          break;
        }
      }

      // Check if we've reached the summary
      const summaryHeading = await page.getByText(/compliance profile/i).isVisible().catch(() => false);
      if (summaryHeading) break;
    }

    await expect(page.getByText(/compliance profile/i)).toBeVisible({ timeout: 5000 });
  });

});

test.describe('Food Business Assessment — Results', () => {

  test('should redirect to /results/ after assessment completion', async ({ page }) => {
    await page.goto(DETAILS_URL);

    await page.getByLabel(/full name/i).fill('Test Owner');
    await page.getByLabel(/email/i).fill('owner@testfood.com');
    await page.getByLabel(/mobile number/i).fill('9876543210');
    await page.getByLabel(/business name/i).fill('Test Restaurant');
    await selectFromDropdown(page, /registered state/i, 'Goa');
    await selectFromDropdown(page, /employee count/i, '1-10');
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);

    // Answer all applicability questions with 'No' to minimise compliance scope
    for (let i = 0; i < 25; i++) {
      const noBtn = page.getByRole('button', { name: /^no$/i }).first();
      const yesBtn = page.getByRole('button', { name: /^yes$/i }).first();
      const skipText = page.getByText(/skipping/i);

      if (await skipText.isVisible({ timeout: 500 }).catch(() => false)) {
        await page.waitForTimeout(200);
        continue;
      }
      if (await noBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await noBtn.click();
        await page.waitForTimeout(900);
      } else if (await yesBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await yesBtn.click();
        await page.waitForTimeout(900);
      } else {
        const firstOpt = page.getByRole('button').filter({ hasText: /.+/ }).first();
        if (await firstOpt.isVisible({ timeout: 1000 }).catch(() => false)) {
          await firstOpt.click();
          await page.waitForTimeout(900);
        }
      }

      const summary = await page.getByText(/compliance profile/i).isVisible().catch(() => false);
      if (summary) break;
    }

    // Continue to compliance questions from summary
    const continueBtn = page.getByRole('button', { name: /continue to assessment/i });
    if (await continueBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueBtn.click();
      await page.waitForTimeout(500);
    }

    // Answer compliance questions with 'Yes'
    for (let i = 0; i < 80; i++) {
      const yesBtn = page.getByRole('button', { name: /^yes$/i }).first();
      const noBtn = page.getByRole('button', { name: /^no$/i }).first();
      const submitting = await page.getByText(/analysing/i).isVisible().catch(() => false);
      if (submitting) break;

      if (await yesBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await yesBtn.click();
        await page.waitForTimeout(900);
      } else if (await noBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await noBtn.click();
        await page.waitForTimeout(900);
      } else {
        break;
      }
    }

    // Should redirect to /results/
    await page.waitForURL(/\/results\//, { timeout: 20000 });
    await expect(page).toHaveURL(/\/results\//);
  });

});

test.describe('Food Business Assessment — Score Thresholds', () => {

  test('score thresholds: 90+ = Compliant, 70-89 = Needs Attention, <70 = Non-Compliant', async () => {
    // Import the scoring function directly — unit-level check
    const { calculateFoodBusinessScore } = await import('../src/lib/assessments/food-business-questions');
    const { filterQuestionsByApplicability } = await import('../src/lib/assessments/food-business-questions');

    const allQuestions = filterQuestionsByApplicability(['FSSAI', 'GST', 'Business_Registration', 'Fire_Safety']);

    // All yes = should be Compliant (>= 90)
    const allYes: Record<string, string> = {};
    allQuestions.forEach(q => { allYes[q.id] = 'yes'; });
    const compliantResult = calculateFoodBusinessScore(allQuestions, allYes);
    expect(compliantResult.complianceStatus).toBe('compliant');
    expect(compliantResult.overallScore).toBeGreaterThanOrEqual(90);

    // All no = should be Non-Compliant (< 70)
    const allNo: Record<string, string> = {};
    allQuestions.forEach(q => { allNo[q.id] = 'no'; });
    const nonCompliantResult = calculateFoodBusinessScore(allQuestions, allNo);
    expect(nonCompliantResult.complianceStatus).toBe('non_compliant');
    expect(nonCompliantResult.overallScore).toBeLessThan(70);
  });

});
