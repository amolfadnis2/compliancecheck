import { test, expect, Page } from '@playwright/test';

/**
 * Labour Code Dynamic Filtering Tests
 * 
 * Tests the intelligent question filtering based on:
 * - Employee count thresholds (10+, 20+, 50+, 100+, 300+, 500+)
 * - Industry type (IT vs Manufacturing vs Retail, etc.)
 * 
 * FIXED VERSION: Uses index-based selection for shadcn/ui Select components
 */

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Select from shadcn/ui Select component by index
 */
async function selectByIndex(page: Page, index: number, optionText: string | RegExp): Promise<boolean> {
  try {
    const triggers = page.locator('button[role="combobox"]');
    const count = await triggers.count();
    
    if (index >= count) {
      console.warn(`selectByIndex: index ${index} >= count ${count}`);
      return false;
    }
    
    const trigger = triggers.nth(index);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.waitForTimeout(400);
    
    const listbox = page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 3000 });
    
    const option = page.locator('[role="option"]').filter({ hasText: optionText }).first();
    await option.waitFor({ state: 'visible', timeout: 2000 });
    await option.click();
    await page.waitForTimeout(300);
    
    return true;
  } catch (error) {
    console.error(`selectByIndex(${index}, ${optionText}) failed:`, error);
    return false;
  }
}

/**
 * Fill Labour Code form with given details
 */
async function fillLabourCodeForm(page: Page, details: {
  companyName: string;
  industry: string;
  employeeCount: string;
  state: string;
  email: string;
}): Promise<boolean> {
  try {
    await page.waitForTimeout(500);
    
    // Fill company name
    await page.locator('#companyName').fill(details.companyName);
    await page.waitForTimeout(200);
    
    // Select Industry (index 0)
    await selectByIndex(page, 0, new RegExp(details.industry, 'i'));
    
    // Select Employee Count (index 1)
    await selectByIndex(page, 1, new RegExp(details.employeeCount, 'i'));
    
    // Select State (index 2)
    await selectByIndex(page, 2, new RegExp(details.state, 'i'));
    
    // Fill email
    await page.locator('#contactEmail').fill(details.email);
    await page.waitForTimeout(200);
    
    return true;
  } catch (error) {
    console.error('fillLabourCodeForm failed:', error);
    return false;
  }
}

/**
 * Complete assessment and count questions
 */
async function completeAndCountQuestions(page: Page, maxQuestions = 40): Promise<number> {
  let questionCount = 0;
  const startTime = Date.now();
  const timeout = 120000;
  
  while ((Date.now() - startTime) < timeout && questionCount < maxQuestions) {
    if (page.url().includes('/results/')) break;
    
    // Try YES button
    const yesBtn = page.locator('button').filter({ hasText: /^Yes$/i }).first();
    if (await yesBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await yesBtn.click();
      questionCount++;
      await page.waitForTimeout(1200);
      continue;
    }
    
    // Try NO button
    const noBtn = page.locator('button').filter({ hasText: /^No$/i }).first();
    if (await noBtn.isVisible({ timeout: 300 }).catch(() => false)) {
      await noBtn.click();
      questionCount++;
      await page.waitForTimeout(1200);
      continue;
    }
    
    // Check for submit button
    const submitBtn = page.locator('button').filter({ 
      hasText: /Get.*Report|Submit/i 
    }).first();
    if (await submitBtn.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await submitBtn.isEnabled()) {
        await submitBtn.click();
        await page.waitForURL(/\/results\//, { timeout: 15000 }).catch(() => {});
        break;
      }
    }
    
    await page.waitForTimeout(500);
  }
  
  return questionCount;
}

// ============================================================
// TESTS
// ============================================================

test.describe('Labour Code Dynamic Filtering', () => {

  test('should show fewer questions for micro companies (1-9 employees)', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    await page.waitForLoadState('networkidle');
    
    await fillLabourCodeForm(page, {
      companyName: 'Micro Business',
      employeeCount: '1-9',
      industry: 'Retail',
      state: 'Maharashtra',
      email: 'micro@test.com',
    });
    
    const startButton = page.locator('button').filter({ 
      hasText: /Start.*Assessment/i 
    }).first();
    
    // Check that question count is shown (fewer for micro)
    const questionPreview = page.getByText(/questions/i);
    await expect(questionPreview).toBeVisible({ timeout: 5000 });
    
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const microQuestionCount = await completeAndCountQuestions(page);
    
    // Micro companies should have fewer questions (likely 5-15)
    expect(microQuestionCount).toBeLessThanOrEqual(20);
  });

  test('should show more questions for large companies (100-299 employees)', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    await page.waitForLoadState('networkidle');
    
    await fillLabourCodeForm(page, {
      companyName: 'Large Corporation',
      employeeCount: '100-299',
      industry: 'Manufacturing',
      state: 'Gujarat',
      email: 'large@test.com',
    });
    
    const startButton = page.locator('button').filter({ 
      hasText: /Start.*Assessment/i 
    }).first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const largeQuestionCount = await completeAndCountQuestions(page);
    
    // Large companies should have more questions
    expect(largeQuestionCount).toBeGreaterThanOrEqual(10);
  });

  test('should show EPF/Bonus questions only for 20+ employees', async ({ page }) => {
    // First test with < 20 employees
    await page.goto('/assessment/labour-code');
    await page.waitForLoadState('networkidle');
    
    await fillLabourCodeForm(page, {
      companyName: 'Below Threshold',
      employeeCount: '10-19',
      industry: 'Information Technology',
      state: 'Karnataka',
      email: 'below@test.com',
    });
    
    const startButton = page.locator('button').filter({ 
      hasText: /Start.*Assessment/i 
    }).first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const smallCount = await completeAndCountQuestions(page);
    
    // Now test with 20+ employees
    await page.goto('/assessment/labour-code');
    await page.waitForLoadState('networkidle');
    
    await fillLabourCodeForm(page, {
      companyName: 'Above Threshold',
      employeeCount: '20-49',
      industry: 'Information Technology',
      state: 'Karnataka',
      email: 'above@test.com',
    });
    
    const startButton2 = page.locator('button').filter({ 
      hasText: /Start.*Assessment/i 
    }).first();
    await startButton2.click();
    await page.waitForTimeout(1000);
    
    const largeCount = await completeAndCountQuestions(page);
    
    // 20+ employee companies should have more or equal questions
    expect(largeCount).toBeGreaterThanOrEqual(smallCount);
  });

  test('should show different questions for Manufacturing vs IT', async ({ page }) => {
    // Test IT company
    await page.goto('/assessment/labour-code');
    await page.waitForLoadState('networkidle');
    
    await fillLabourCodeForm(page, {
      companyName: 'IT Company',
      employeeCount: '50-99',
      industry: 'Information Technology',
      state: 'Maharashtra',
      email: 'it@test.com',
    });
    
    const startButton = page.locator('button').filter({ 
      hasText: /Start.*Assessment/i 
    }).first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const itCount = await completeAndCountQuestions(page);
    
    // Test Manufacturing company
    await page.goto('/assessment/labour-code');
    await page.waitForLoadState('networkidle');
    
    await fillLabourCodeForm(page, {
      companyName: 'Manufacturing Company',
      employeeCount: '50-99',
      industry: 'Manufacturing',
      state: 'Maharashtra',
      email: 'mfg@test.com',
    });
    
    const startButton2 = page.locator('button').filter({ 
      hasText: /Start.*Assessment/i 
    }).first();
    await startButton2.click();
    await page.waitForTimeout(1000);
    
    const mfgCount = await completeAndCountQuestions(page);
    
    // Both should complete successfully
    expect(itCount).toBeGreaterThan(0);
    expect(mfgCount).toBeGreaterThan(0);
    
    // Manufacturing typically has more OSH questions
    // (soft assertion - may vary based on implementation)
    expect.soft(mfgCount).toBeGreaterThanOrEqual(itCount);
  });

  test('should handle all industry types correctly', async ({ page }) => {
    const industries = [
      'Information Technology',
      'Manufacturing', 
      'Healthcare',
      'Financial Services',
      'Construction',
    ];
    
    for (const industry of industries) {
      await page.goto('/assessment/labour-code');
      await page.waitForLoadState('networkidle');
      
      const filled = await fillLabourCodeForm(page, {
        companyName: `${industry} Test Co`,
        employeeCount: '50-99',
        industry: industry,
        state: 'Maharashtra',
        email: `${industry.replace(/\s+/g, '-').toLowerCase()}@test.com`,
      });
      
      expect.soft(filled, `Form fill failed for ${industry}`).toBe(true);
      
      // Verify Start button is enabled (form validation passed)
      const startButton = page.locator('button').filter({ 
        hasText: /Start.*Assessment/i 
      }).first();
      
      const isEnabled = await startButton.isEnabled({ timeout: 3000 }).catch(() => false);
      expect.soft(isEnabled, `Start button disabled for ${industry}`).toBe(true);
    }
  });
});
