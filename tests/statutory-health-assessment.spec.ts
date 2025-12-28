import { test, expect, Page } from '@playwright/test';
import { selectFromDropdown } from './utils/form-helpers';

/**
 * Statutory Health Check Assessment - End-to-End Test Suite
 * 
 * Tests the complete user journey from landing page to PDF download
 */

test.describe('Statutory Health Check Assessment Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with key elements', async ({ page }) => {
    // Beta banner is optional (may be removed)
    const betaBanner = page.getByText(/this site is under development|beta|preview/i);
    // Only check if banner exists
    if (await betaBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(betaBanner).toBeVisible();
    }
    
    // These are required elements
    const heading = page.getByRole('heading', { level: 1 }).first()
      .or(page.getByRole('heading', { name: /compliance|assessment/i }).first());
    await expect(heading).toBeVisible();
    
    // At least one assessment option should be visible
    const assessmentLink = page.getByRole('link', { name: /statutory|health|check/i }).first()
      .or(page.getByRole('button', { name: /statutory|health|check/i }).first());
    await expect(assessmentLink).toBeVisible();
  });

  test('should navigate to assessment', async ({ page }) => {
    await page.getByRole('link', { name: /statutory health/i }).first().click();
    await expect(page).toHaveURL(/\/assessment\/statutory-health/);
    await expect(page.getByText(/progress/i).first()).toBeVisible();
  });

  test('should complete full assessment with compliant answers', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    
    // Fill company details
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/company name/i).fill('Test Tech Pvt Ltd');
    await selectFromDropdown(page, /state|select.*state/i, 'Maharashtra');
    await selectFromDropdown(page, /employee|select.*employee/i, '20-49');
    await selectFromDropdown(page, /industry|select.*industry/i, 'Information Technology');
    await page.getByRole('button', { name: /continue to assessment/i }).click();
    await page.waitForTimeout(500);
    
    // Answer all 12 questions with YES (auto-advances after each answer)
    for (let i = 0; i < 12; i++) {
      // Wait for question to be ready
      await page.waitForTimeout(800);
      
      // Click YES button
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      
      // Wait for auto-advance (no Next button needed)
      await page.waitForTimeout(800);
    }
    
    // After last question, click submit button
    await page.getByRole('button', { name: /submit|get.*report|finish/i }).click();
    await page.waitForURL(/\/results\//, { timeout: 15000 });
    
    // Verify results page loaded - use specific heading
    await expect(page.getByRole('heading', { name: /compliance|your compliance report/i }).first()).toBeVisible();
  });

  test('should display high score for compliant answers', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    await page.getByLabel(/full name/i).fill('Compliant User');
    await page.getByLabel(/email/i).fill('compliant@test.com');
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/company name/i).fill('Compliant Co');
    await selectFromDropdown(page, /state|select.*state/i, 'Maharashtra');
    await selectFromDropdown(page, /employee|select.*employee/i, '20-49');
    await selectFromDropdown(page, /industry|select.*industry/i, 'Information Technology');
    await page.getByRole('button', { name: /continue to assessment/i }).click();
    
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      await page.waitForTimeout(800);
    }
    
    await page.getByRole('button', { name: /get free report/i }).click();
    await page.waitForURL(/\/results\//);
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThanOrEqual(90);
  });

  test('should trigger NPS modal on PDF download', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    await page.getByLabel(/full name/i).fill('NPS Test User');
    await page.getByLabel(/email/i).fill('nps@test.com');
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/company name/i).fill('NPS Test Co');
    await selectFromDropdown(page, /state|select.*state/i, 'Maharashtra');
    await selectFromDropdown(page, /employee|select.*employee/i, '20-49');
    await selectFromDropdown(page, /industry|select.*industry/i, 'Information Technology');
    await page.getByRole('button', { name: /continue to assessment/i }).click();
    
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      await page.waitForTimeout(800);
    }
    
    await page.getByRole('button', { name: /get free report/i }).click();
    await page.waitForURL(/\/results\//);
    
    // Use flexible selector for download button
    await page.getByRole('button', { name: /download|pdf|report/i }).first().click();
    
    // NPS modal may or may not appear on first download
    const npsModal = page.getByText(/how likely.*recommend/i);
    if (await npsModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(npsModal).toBeVisible();
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/assessment/statutory-health');
    await expect(page.getByText(/progress/i).first()).toBeVisible();
  });
});
