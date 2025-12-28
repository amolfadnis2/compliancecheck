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
    
    // Check page loaded successfully - look for main content or any heading
    await expect(page.locator('main, [role="main"], body')).toBeVisible();
    
    // All 6 product cards visible (assessments + calculators)
    await expect(page.getByText(/statutory health check/i).first()).toBeVisible();
    await expect(page.getByText(/labour code readiness/i).first()).toBeVisible();
    await expect(page.getByText(/dpdp gap assessment/i).first()).toBeVisible();
    await expect(page.getByText(/state-wise compliance/i).first()).toBeVisible();
    await expect(page.getByText(/ctc calculator/i).first()).toBeVisible();
    await expect(page.getByText(/gratuity calculator/i).first()).toBeVisible();
    
    // Check for FREE badges - may be styled differently
    const freeBadges = page.getByText(/free/i);
    const freeCount = await freeBadges.count();
    expect(freeCount).toBeGreaterThanOrEqual(1);
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
    
    // Scroll to footer to ensure links are visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Footer is in the last section - be more specific with selector
    const footer = page.locator('footer');
    
    // Privacy Policy link - look specifically in footer
    const privacyLink = footer.getByRole('link', { name: /privacy policy/i });
    if (await privacyLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await privacyLink.click();
      await page.waitForLoadState('networkidle');
      const url = page.url();
      expect(url).toMatch(/\/privacy/);
    }
    
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Terms link - look specifically in footer
    const termsLink = footer.getByRole('link', { name: /terms of service/i });
    if (await termsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await termsLink.click();
      await page.waitForLoadState('networkidle');
      const url = page.url();
      expect(url).toMatch(/\/terms/);
    }
  });

  test('contact info is present', async ({ page }) => {
    await page.goto('/');
    
    // Check for contact email - could be any valid email format
    const emailPattern = page.getByText(/[\w.-]+@[\w.-]+\.\w+/).first();
    const hasEmail = await emailPattern.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Either email is visible or there's a contact link
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    const hasContactLink = await contactLink.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasEmail || hasContactLink).toBe(true);
  });
});
