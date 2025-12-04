import { test, expect, Page } from '@playwright/test';

/**
 * Labour Code Assessment - Simplified Robust Tests
 * 
 * Uses adaptive selectors that work with your actual implementation
 */

test.describe('Labour Code Assessment - Core Flow', () => {

  test('should load Labour Code assessment page', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    await expect(page.getByRole('main').getByText(/labour code/i).first()).toBeVisible();
  });

  test('should have company details form with all required fields', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    // Check all form fields exist
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.locator('text=/employee count/i').first()).toBeVisible();
    await expect(page.locator('text=/industry/i').first()).toBeVisible();
    await expect(page.locator('text=/state/i').first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should enable Start Assessment button when form is complete', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    // Fill company name
    await page.getByLabel(/company name/i).fill('Test Company Pvt Ltd');
    
    // Click and select from Employee Count dropdown
    const empCountTrigger = page.locator('text=/employee count/i').locator('..')locator('button').first();
