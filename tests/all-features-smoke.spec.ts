import { test, expect } from '@playwright/test';

/**
 * All Features Smoke Test
 * 
 * Quick verification that all live features are accessible.
 * Run this before engaging beta testers.
 * 
 * Runtime: ~1 minute
 */

test.describe('All Features Smoke Test', () => {
  
  test('homepage loads with all product cards', async ({ page }) => {
    await page.goto('/');
    
    // Beta banner visible (use first() to avoid strict mode with multiple matches)
    await expect(page.getByText(/under development/i).first()).toBeVisible();
    
    // All 4 product cards visible
    await expect(page.getByText(/statutory health check/i).first()).toBeVisible();
    await expect(page.getByText(/labour code readiness/i).first()).toBeVisible();
    await expect(page.getByText(/dpdp gap assessment/i).first()).toBeVisible();
    await expect(page.getByText(/employee consent form/i).first()).toBeVisible();
    
    // All show FREE badge
    const freeBadges = page.getByText(/free/i);
    expect(await freeBadges.count()).toBeGreaterThanOrEqual(3);
  });

  test('statutory health assessment page loads', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    await expect(page.getByText(/statutory health check/i).first()).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue|start/i })).toBeVisible();
  });

  test('labour code assessment page loads', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    await expect(page.getByText(/labour code/i).first()).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
  });

  test('dpdp assessment page loads', async ({ page }) => {
    await page.goto('/assessment/dpdp');
    await expect(page.getByText(/dpdp/i).first()).toBeVisible();
    // DPDP has organisation name field
    await expect(page.getByPlaceholder(/organisation name|enter your/i).or(page.getByLabel(/company|organisation/i).first())).toBeVisible();
  });

  test('employee consent form page loads', async ({ page }) => {
    await page.goto('/documents/employee-consent');
    await expect(page.getByText(/employee.*consent|consent.*form/i).first()).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
  });

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy');
    // Use text selector instead of heading role (page may use different structure)
    await expect(page.getByText(/privacy policy/i).first()).toBeVisible();
    await expect(page.getByText(/personal data|data protection/i).first()).toBeVisible();
  });

  test('terms of service page loads', async ({ page }) => {
    await page.goto('/terms');
    // Use text selector instead of heading role
    await expect(page.getByText(/terms of service|terms and conditions/i).first()).toBeVisible();
  });

  test('navigation links work from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Click Statutory Health link
    await page.getByRole('link', { name: /statutory health/i }).first().click();
    await expect(page).toHaveURL(/\/assessment\/statutory-health/);
    
    // Go back
    await page.goto('/');
    
    // Click Labour Code link
    await page.getByRole('link', { name: /labour code/i }).first().click();
    await expect(page).toHaveURL(/\/assessment\/labour-code/);
    
    // Go back
    await page.goto('/');
    
    // Click DPDP link
    await page.getByRole('link', { name: /dpdp/i }).first().click();
    await expect(page).toHaveURL(/\/assessment\/dpdp/);
  });

  test('footer links work', async ({ page }) => {
    await page.goto('/');
    
    // Privacy Policy link
    await page.getByRole('link', { name: /privacy policy/i }).click();
    await expect(page).toHaveURL(/\/privacy/);
    
    await page.goto('/');
    
    // Terms link
    await page.getByRole('link', { name: /terms/i }).click();
    await expect(page).toHaveURL(/\/terms/);
  });

  test('contact email is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/compliancecheck@zohomail.in/i)).toBeVisible();
  });
});
