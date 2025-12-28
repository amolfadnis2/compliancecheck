import { test, expect, Page } from '@playwright/test';

/**
 * Cross-Assessment Consistency Tests
 * 
 * Verifies UI/UX consistency across all three assessment types:
 * - Statutory Health Check
 * - Labour Code Readiness
 * - DPDP Gap Assessment
 */

const ASSESSMENTS = [
  { path: '/assessment/statutory-health', name: 'Statutory Health Check' },
  { path: '/assessment/labour-code', name: 'Labour Code Readiness' },
  { path: '/assessment/dpdp', name: 'DPDP Gap Assessment' }
];

test.describe('Cross-Assessment - Navigation Consistency', () => {
  
  for (const assessment of ASSESSMENTS) {
    test(`${assessment.name} should be accessible from homepage`, async ({ page }) => {
      await page.goto('/');
      
      // Each assessment should have a link on homepage
      const assessmentLink = page.getByRole('link', { name: new RegExp(assessment.name.split(' ')[0], 'i') });
      await expect(assessmentLink.first()).toBeVisible();
    });

    test(`${assessment.name} should have back navigation`, async ({ page }) => {
      await page.goto(assessment.path);
      
      // Should have way to get back to home
      const homeLink = page.locator('a[href="/"], a:has-text("Home"), a:has-text("ComplianceCheck")').first();
      await expect(homeLink).toBeVisible();
    });
  }
});

test.describe('Cross-Assessment - Form Consistency', () => {
  
  test('all assessments should have company name field', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      
      const companyField = page.getByLabel(/company|organisation/i);
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
      
      const industryField = page.getByLabel(/industry/i);
      const industryButton = page.locator('button:has-text("Select industry")');
      
      const hasIndustry = 
        await industryField.isVisible().catch(() => false) ||
        await industryButton.isVisible().catch(() => false);
      
      expect(hasIndustry).toBe(true);
    }
  });

  test('all assessments should have state selector', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      
      const stateField = page.getByLabel(/state/i);
      const stateButton = page.locator('button:has-text("Select state")');
      
      const hasState = 
        await stateField.isVisible().catch(() => false) ||
        await stateButton.isVisible().catch(() => false);
      
      expect(hasState).toBe(true);
    }
  });

  test('all assessments should have continue/start button', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      
      const startButton = page.getByRole('button', { name: /continue|start|begin/i });
      await expect(startButton).toBeVisible();
    }
  });
});

test.describe('Cross-Assessment - Question UI Consistency', () => {
  
  // Helper to get past company details form
  async function fillBasicDetails(page: Page, assessmentType: string) {
    if (assessmentType === 'dpdp') {
      await page.getByPlaceholder(/organisation/i).fill('Test Co');
      await page.getByLabel(/your name/i).fill('Test User');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.locator('button:has-text("Select industry")').click();
      await page.getByRole('option').first().click();
      await page.locator('button:has-text("Select range")').click();
      await page.getByRole('option').first().click();
      await page.locator('button:has-text("Select state")').click();
      await page.getByRole('option').first().click();
    } else {
      await page.getByLabel(/company name/i).fill('Test Co');
      await page.getByLabel(/full name|your name/i).fill('Test User');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/phone/i).fill('9876543210');
      await page.getByLabel(/state/i).selectOption({ index: 1 });
      await page.getByLabel(/employee count/i).selectOption({ index: 1 });
      await page.getByLabel(/industry/i).selectOption({ index: 1 });
    }
    
    await page.getByRole('button', { name: /continue|start/i }).click();
    await page.waitForTimeout(1000);
  }

  test('all assessments should have YES button', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      await fillBasicDetails(page, assessment.path.split('/').pop()!);
      
      const yesButton = page.getByRole('button', { name: /^yes$/i });
      await expect(yesButton.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('all assessments should have NO button', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      await fillBasicDetails(page, assessment.path.split('/').pop()!);
      
      const noButton = page.getByRole('button', { name: /^no$/i });
      await expect(noButton.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('all assessments should have progress indicator', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      await fillBasicDetails(page, assessment.path.split('/').pop()!);
      
      // Should show progress (percentage or step indicator)
      const progressIndicator = page.getByText(/%|step|progress|complete/i);
      await expect(progressIndicator.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Cross-Assessment - Results Page Consistency', () => {
  
  // Helper to complete an assessment quickly
  async function completeAssessmentQuickly(page: Page, assessmentPath: string) {
    await page.goto(assessmentPath);
    
    const assessmentType = assessmentPath.split('/').pop();
    
    // Fill details
    if (assessmentType === 'dpdp') {
      await page.getByPlaceholder(/organisation/i).fill('Consistency Test Co');
      await page.getByLabel(/your name/i).fill('Test User');
      await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`);
      await page.locator('button:has-text("Select industry")').click();
      await page.getByRole('option').first().click();
      await page.locator('button:has-text("Select range")').click();
      await page.getByRole('option').first().click();
      await page.locator('button:has-text("Select state")').click();
      await page.getByRole('option').first().click();
    } else {
      await page.getByLabel(/company name/i).fill('Consistency Test Co');
      await page.getByLabel(/full name|your name/i).fill('Test User');
      await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`);
      await page.getByLabel(/phone/i).fill('9876543210');
      await page.getByLabel(/state/i).selectOption({ index: 1 });
      await page.getByLabel(/employee count/i).selectOption({ index: 1 });
      await page.getByLabel(/industry/i).selectOption({ index: 1 });
    }
    
    await page.getByRole('button', { name: /continue|start/i }).click();
    await page.waitForTimeout(500);
    
    // Answer all questions with YES
    const maxTime = Date.now() + 90000;
    while (Date.now() < maxTime) {
      if (page.url().includes('/results/')) break;
      
      const yesButton = page.getByRole('button', { name: /^yes$/i }).first();
      if (await yesButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await yesButton.click();
        await page.waitForTimeout(1000);
        continue;
      }
      
      const submitButton = page.getByRole('button', { name: /get free report|submit/i });
      if (await submitButton.isVisible({ timeout: 300 }).catch(() => false)) {
        if (await submitButton.isEnabled().catch(() => false)) {
          await submitButton.click();
          await page.waitForURL(/\/results\//, { timeout: 15000 });
          break;
        }
      }
      
      await page.waitForTimeout(500);
    }
  }

  test('all assessments should show compliance score', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await completeAssessmentQuickly(page, assessment.path);
      
      // Score should be visible
      const scoreElement = page.locator('text=/\\d+%/');
      await expect(scoreElement.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('all assessments should have PDF download button', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await completeAssessmentQuickly(page, assessment.path);
      
      const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
      await expect(downloadButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('all assessments should have email report button', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await completeAssessmentQuickly(page, assessment.path);
      
      const emailButton = page.getByRole('button', { name: /email.*report|send.*email/i });
      await expect(emailButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('all assessments should show company name in results', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await completeAssessmentQuickly(page, assessment.path);
      
      // Company name should appear on results
      await expect(page.getByText('Consistency Test Co')).toBeVisible({ timeout: 5000 });
    }
  });

  test('all assessments should have disclaimer', async ({ page }) => {
    for (const assessment of ASSESSMENTS) {
      await completeAssessmentQuickly(page, assessment.path);
      
      // Disclaimer about not being legal advice
      const disclaimer = page.getByText(/not.*legal.*advice|informational|professional|consult/i);
      await expect(disclaimer.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Cross-Assessment - Color Scheme Consistency', () => {
  
  test('all assessments should use consistent status colors', async ({ page }) => {
    // Check that the same CSS classes are used across assessments
    for (const assessment of ASSESSMENTS) {
      await page.goto(assessment.path);
      
      // Should use Tailwind's green/amber/red for status
      const pageContent = await page.content();
      
      // These classes should exist in the app's design system
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
      
      // Form should be visible and usable
      const form = page.locator('form, [role="form"]').first();
      await expect(form).toBeVisible();
      
      // No horizontal scroll
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
      
      // Try invalid email
      const emailField = page.getByLabel(/email/i).first();
      await emailField.fill('invalid-email');
      
      // Try to proceed
      await page.getByRole('button', { name: /continue|start/i }).click();
      
      // Should show error (may differ in wording but should exist)
      await page.waitForTimeout(1000);
      
      // Either stays on page or shows error
      const stillOnForm = page.url().includes(assessment.path);
      expect(stillOnForm).toBe(true);
    }
  });
});
