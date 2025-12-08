import { test, expect, Page } from '@playwright/test';

/**
 * Labour Code Readiness Assessment - End-to-End Test Suite
 * 
 * Tests the Labour Code assessment with dynamic filtering
 * based on industry type and employee count.
 * 
 * Key Features:
 * - Industry-based question filtering
 * - Employee threshold filtering
 * - Four Labour Codes: Wages, Social Security, OSH, Industrial Relations
 * - Auto-advance after answer selection (800ms delay)
 */

/**
 * Helper: Select from shadcn/ui Select component
 */
async function selectFromDropdown(page: Page, labelText: string, optionText: string) {
  const container = page.locator('.space-y-2').filter({ hasText: labelText });
  const trigger = container.getByRole('combobox');
  await trigger.click();
  await page.waitForTimeout(300);
  await page.getByRole('option', { name: optionText }).click();
  await page.waitForTimeout(200);
}

/**
 * Helper: Fill Labour Code user details form
 */
async function fillUserDetails(page: Page, details: {
  companyName: string;
  industry: string;
  employeeCount: string;
  state: string;
  contactName?: string;
  email: string;
}) {
  await page.getByLabel(/company name/i).fill(details.companyName);
  await selectFromDropdown(page, 'Industry', details.industry);
  await selectFromDropdown(page, 'Employee Count', details.employeeCount);
  await selectFromDropdown(page, 'Registered State', details.state);
  if (details.contactName) {
    await page.getByLabel(/your name/i).fill(details.contactName);
  }
  await page.getByLabel(/email/i).fill(details.email);
}

/**
 * Helper: Complete all questions with YES answers (auto-advances)
 * Returns true if assessment completed successfully
 */
async function answerAllQuestionsYes(page: Page, maxQuestions = 35, timeoutMs = 60000) {
  const startTime = Date.now();
  let questionCount = 0;
  
  while (questionCount < maxQuestions && (Date.now() - startTime) < timeoutMs) {
    // Check if we're on results page
    if (page.url().includes('/results/')) {
      return { success: true, questionCount };
    }
    
    // Try to click YES button
    const yesButton = page.getByRole('button', { name: /^yes$/i }).first();
    if (await yesButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await yesButton.click();
      questionCount++;
      // Wait for auto-advance
      await page.waitForTimeout(1000);
      continue;
    }
    
    // Check for ENABLED submit button (assessment complete)
    const submitButton = page.getByRole('button', { name: /get free report|submit/i });
    const isSubmitVisible = await submitButton.isVisible({ timeout: 300 }).catch(() => false);
    if (isSubmitVisible) {
      const isEnabled = await submitButton.isEnabled().catch(() => false);
      if (isEnabled) {
        await submitButton.click();
        await page.waitForURL(/\/results\//, { timeout: 15000 });
        return { success: true, questionCount };
      }
    }
    
    // Small wait before next iteration
    await page.waitForTimeout(500);
  }
  
  // Final attempt to click submit if visible and enabled
  const submitButton = page.getByRole('button', { name: /get free report|submit/i });
  if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    if (await submitButton.isEnabled().catch(() => false)) {
      await submitButton.click();
      await page.waitForURL(/\/results\//, { timeout: 15000 });
      return { success: true, questionCount };
    }
  }
  
  return { success: false, questionCount };
}

test.describe('Labour Code Readiness Assessment Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to Labour Code assessment', async ({ page }) => {
    await page.getByRole('link', { name: /labour code/i }).first().click();
    await expect(page).toHaveURL(/\/assessment\/labour-code/);
    await expect(page.getByRole('main').getByText(/labour code readiness/i)).toBeVisible();
  });

  test('should complete IT company assessment', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'TechStartup Solutions Pvt Ltd',
      industry: 'Information Technology',
      employeeCount: '20-49 employees',
      state: 'Karnataka',
      contactName: 'IT Test User',
      email: 'it-test@example.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    
    expect(result.success).toBe(true);
    expect(result.questionCount).toBeGreaterThan(0);
    
    await expect(page).toHaveURL(/\/results\//);
    await expect(page.getByText(/compliance|score/i).first()).toBeVisible();
  });

  test('should complete Manufacturing company assessment', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'IndiaManufacturing Ltd',
      industry: 'Manufacturing',
      employeeCount: '100-299 employees',
      state: 'Gujarat',
      contactName: 'Manufacturing Test User',
      email: 'mfg-test@example.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    
    expect(result.success).toBe(true);
    await expect(page).toHaveURL(/\/results\//);
  });

  test('should show Labour Code categories in results', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'Category Test Co',
      industry: 'Information Technology',
      employeeCount: '50-99 employees',
      state: 'Maharashtra',
      email: 'category@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    expect(result.success).toBe(true);
    
    // Check Labour Codes appear in results (at least one)
    const hasWages = await page.getByText(/wages/i).first().isVisible().catch(() => false);
    const hasSocialSecurity = await page.getByText(/social security/i).first().isVisible().catch(() => false);
    const hasOSH = await page.getByText(/occupational safety|osh|working conditions/i).first().isVisible().catch(() => false);
    const hasIR = await page.getByText(/industrial relations/i).first().isVisible().catch(() => false);
    
    expect(hasWages || hasSocialSecurity || hasOSH || hasIR).toBe(true);
  });

  test('should handle small company (10-19 employees)', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'SmallBiz Pvt Ltd',
      industry: 'Retail & E-commerce',
      employeeCount: '10-19 employees',
      state: 'Delhi',
      email: 'small@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    
    expect(result.success).toBe(true);
    await expect(page).toHaveURL(/\/results\//);
  });

  test('should handle large enterprise (500+ employees)', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'Enterprise Corp India',
      industry: 'Manufacturing',
      employeeCount: '500+ employees',
      state: 'Tamil Nadu',
      email: 'enterprise@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    
    expect(result.success).toBe(true);
    await expect(page).toHaveURL(/\/results\//);
  });

  test('should display progress indicator', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'Progress Test Co',
      industry: 'Information Technology',
      employeeCount: '20-49 employees',
      state: 'Karnataka',
      email: 'progress@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    // Progress indicator should be visible
    await expect(page.getByText(/complete/i)).toBeVisible();
    
    // Answer a few questions
    for (let i = 0; i < 3; i++) {
      const yesButton = page.getByRole('button', { name: /^yes$/i }).first();
      if (await yesButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await yesButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Progress text should exist
    const progressText = await page.getByText(/\d+%/).first().textContent();
    expect(progressText).toBeTruthy();
  });

  test('should trigger NPS modal after completion', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'NPS Test Co',
      industry: 'Information Technology',
      employeeCount: '20-49 employees',
      state: 'Maharashtra',
      email: 'nps@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    expect(result.success).toBe(true);
    
    // Click download PDF to trigger NPS
    const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
    await downloadButton.click();
    
    await expect(page.getByText(/how likely.*recommend/i)).toBeVisible({ timeout: 5000 });
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/assessment/labour-code');
    
    // Form should be visible on mobile
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    
    await fillUserDetails(page, {
      companyName: 'Mobile Test Co',
      industry: 'Information Technology',
      employeeCount: '10-19 employees',
      state: 'Karnataka',
      email: 'mobile@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    // Should show question with Yes button
    await expect(page.getByRole('button', { name: /^yes$/i }).first()).toBeVisible();
  });

  test('should persist assessment to database', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await fillUserDetails(page, {
      companyName: 'DB Persist Test Co',
      industry: 'Professional Services',
      employeeCount: '20-49 employees',
      state: 'Maharashtra',
      email: 'db-persist@test.com',
    });
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    const result = await answerAllQuestionsYes(page, 35, 90000);
    expect(result.success).toBe(true);
    
    // Verify we got a valid assessment ID in URL
    const url = page.url();
    const assessmentId = url.match(/\/results\/([a-f0-9-]+)/)?.[1];
    expect(assessmentId).toBeTruthy();
  });
});
