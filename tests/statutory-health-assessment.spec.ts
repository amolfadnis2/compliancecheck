import { test, expect, Page } from '@playwright/test';

/**
 * Statutory Health Check Assessment - End-to-End Test Suite
 * 
 * Tests the complete user journey from landing page to PDF download
 */

test.describe('Statutory Health Check Assessment Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with beta banner', async ({ page }) => {
    await expect(page.getByText(/this site is under development/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /instant compliance reports/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /statutory health check/i })).toBeVisible();
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
    await page.getByLabel(/state/i).selectOption('Maharashtra');
    await page.getByLabel(/employee count/i).selectOption('21-50 employees');
    await page.getByLabel(/industry/i).selectOption('IT / Software');
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
    await page.getByLabel(/state/i).selectOption('Maharashtra');
    await page.getByLabel(/employee count/i).selectOption('21-50 employees');
    await page.getByLabel(/industry/i).selectOption('IT / Software');
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
    await page.getByLabel(/state/i).selectOption('Maharashtra');
    await page.getByLabel(/employee count/i).selectOption('21-50 employees');
    await page.getByLabel(/industry/i).selectOption('IT / Software');
    await page.getByRole('button', { name: /continue to assessment/i }).click();
    
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      await page.waitForTimeout(800);
    }
    
    await page.getByRole('button', { name: /get free report/i }).click();
    await page.waitForURL(/\/results\//);
    
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    await expect(page.getByText(/how likely.*recommend/i)).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/assessment/statutory-health');
    await expect(page.getByText(/progress/i).first()).toBeVisible();
  });
});
