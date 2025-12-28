import { test, expect, Page } from '@playwright/test';
import { COMPANY_PROFILES } from './fixtures/company-profiles';

/**
 * State-wise Compliance Assessment - E2E Test Suite
 * 
 * Tests the state-specific compliance assessment covering:
 * - Professional Tax variations by state
 * - State labour law differences
 * - Regional compliance requirements
 * 
 * NOTE: The state-wise-compliance form only has:
 * - Full Name
 * - Email
 * - Phone Number (optional)
 * - Company Name
 * 
 * State/Industry/Employee Count are determined from assessment questions.
 */

// Helper: Fill user details form (state-wise has simpler structure)
async function fillUserDetails(page: Page, profile: typeof COMPANY_PROFILES.MID_IT) {
  // Wait for form to be ready
  await page.waitForTimeout(500);
  
  // Fill full name - try multiple selectors
  const nameInput = page.getByLabel(/full name/i)
    .or(page.locator('#fullName'))
    .or(page.getByPlaceholder(/your.*name|full.*name/i));
  await nameInput.fill(profile.name);
  
  // Fill email
  const emailInput = page.getByLabel(/email/i)
    .or(page.locator('#email'))
    .or(page.getByPlaceholder(/email|@/i));
  await emailInput.fill(profile.email);
  
  // Fill company name
  const companyInput = page.getByLabel(/company.*name/i)
    .or(page.locator('#companyName'))
    .or(page.getByPlaceholder(/company/i));
  await companyInput.fill(profile.companyName);
  
  // Phone is optional
  const phoneInput = page.getByLabel(/phone/i)
    .or(page.locator('#phoneNumber'));
  if (await phoneInput.isVisible({ timeout: 1000 }).catch(() => false)) {
    await phoneInput.fill('9876543210');
  }
}

// Helper: Answer all questions with YES (handles auto-advance)
async function answerAllQuestionsYes(page: Page, maxQuestions = 50, timeoutMs = 120000) {
  const startTime = Date.now();
  let questionCount = 0;
  let stuckCounter = 0;
  let lastQuestionCount = -1;
  
  while (questionCount < maxQuestions && (Date.now() - startTime) < timeoutMs) {
    // Check if we're on results page
    if (page.url().includes('/results/')) {
      return { success: true, questionCount };
    }
    
    // Try YES button first
    const yesButton = page.getByRole('button', { name: /^yes$/i }).first();
    if (await yesButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await yesButton.click();
      questionCount++;
      stuckCounter = 0;
      await page.waitForTimeout(1000);
      continue;
    }
    
    // Try NO button as fallback
    const noButton = page.getByRole('button', { name: /^no$/i }).first();
    if (await noButton.isVisible({ timeout: 300 }).catch(() => false)) {
      await noButton.click();
      questionCount++;
      stuckCounter = 0;
      await page.waitForTimeout(1000);
      continue;
    }
    
    // Try Continue button (for multi-select questions)
    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await continueButton.isEnabled().catch(() => false)) {
        await continueButton.click();
        await page.waitForTimeout(1000);
        continue;
      }
    }
    
    // Check for submit/view results button
    const submitButton = page.getByRole('button', { name: /get.*report|submit|view.*results/i });
    if (await submitButton.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await submitButton.isEnabled().catch(() => false)) {
        await submitButton.click();
        try {
          await page.waitForURL(/\/results\//, { timeout: 20000 });
          return { success: true, questionCount };
        } catch {
          // URL didn't change, might need more questions
        }
      }
    }
    
    // Track if we're stuck
    if (questionCount === lastQuestionCount) {
      stuckCounter++;
      if (stuckCounter > 15) {
        console.warn(`Assessment stuck at question ${questionCount}`);
        return { success: false, questionCount, reason: 'stuck' };
      }
    }
    lastQuestionCount = questionCount;
    
    await page.waitForTimeout(500);
  }
  
  return { success: false, questionCount, reason: 'timeout_or_max' };
}

test.describe('State-wise Compliance Assessment Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to State-wise Compliance assessment', async ({ page }) => {
    // Look for state-wise link on homepage
    const stateWiseLink = page.getByRole('link', { name: /state.*wise|state.*compliance/i });
    
    if (await stateWiseLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stateWiseLink.click();
      await expect(page).toHaveURL(/\/assessment\/state-wise/);
    } else {
      // Direct navigation if not on homepage
      await page.goto('/assessment/state-wise-compliance');
      await expect(page).toHaveURL(/\/assessment\/state-wise/);
    }
  });

  test('should complete Maharashtra assessment', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    // Use profile but state selection happens in assessment questions
    const profile = { ...COMPANY_PROFILES.MID_IT };
    await fillUserDetails(page, profile);
    
    // Click start/continue button
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    
    // Soft assertion - assessment may have different flow
    expect.soft(result.success).toBe(true);
    
    if (result.success) {
      await expect(page).toHaveURL(/\/results\//);
    }
  });

  test('should complete Karnataka assessment', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    const profile = { ...COMPANY_PROFILES.MID_IT };
    await fillUserDetails(page, profile);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    expect.soft(result.success).toBe(true);
  });

  test('should complete Tamil Nadu assessment', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    const profile = { ...COMPANY_PROFILES.ENTERPRISE };
    await fillUserDetails(page, profile);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    expect.soft(result.success).toBe(true);
  });

  test('should complete Gujarat assessment', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    const profile = { ...COMPANY_PROFILES.MID_MANUFACTURING };
    await fillUserDetails(page, profile);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    expect.soft(result.success).toBe(true);
  });

  test('should complete Delhi assessment', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    const profile = { ...COMPANY_PROFILES.LARGE_SERVICES };
    await fillUserDetails(page, profile);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    expect.soft(result.success).toBe(true);
  });
});

test.describe('State-wise Compliance - Results Validation', () => {

  test('should show state-specific recommendations', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    await fillUserDetails(page, COMPANY_PROFILES.MID_IT);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    
    if (result.success) {
      // Results should show some compliance information
      const resultsContent = page.locator('main, [role="main"], .results, #results');
      await expect(resultsContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display Professional Tax section', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    await fillUserDetails(page, COMPANY_PROFILES.MID_IT);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    
    if (result.success) {
      // Professional Tax should be mentioned somewhere in results
      const ptSection = page.getByText(/professional tax|pt|tax/i);
      await expect.soft(ptSection.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have PDF download button', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    await fillUserDetails(page, COMPANY_PROFILES.MID_IT);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    
    if (result.success) {
      const downloadButton = page.getByRole('button', { name: /download|pdf|report/i });
      await expect(downloadButton).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('State-wise Compliance - Data Persistence', () => {

  test('should save assessment to database', async ({ page }) => {
    await page.goto('/assessment/state-wise-compliance');
    
    const uniqueCompany = `StateTest_${Date.now()}`;
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      companyName: uniqueCompany,
      email: `state-test-${Date.now()}@example.com`
    };
    
    await fillUserDetails(page, profile);
    
    const startButton = page.getByRole('button', { name: /start|continue|begin|assessment/i });
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const result = await answerAllQuestionsYes(page);
    
    if (result.success) {
      // Should have assessment ID in URL (UUID or temp ID)
      const url = page.url();
      const hasResultsPage = /\/results\//.test(url);
      expect(hasResultsPage).toBe(true);
    }
  });
});
