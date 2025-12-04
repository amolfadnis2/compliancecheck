import { test, expect, Page } from '@playwright/test';

/**
 * Labour Code Readiness Assessment - End-to-End Test Suite
 * 
 * Tests the 30-question Labour Code assessment with dynamic filtering
 * based on industry type and employee count.
 * 
 * Key Features:
 * - Industry-based question filtering (IT: ~18 questions, Manufacturing: ~28 questions)
 * - Employee threshold filtering (20+, 50+, 100+, 300+ thresholds)
 * - Four Labour Codes: Wages, Social Security, OSH, Industrial Relations
 */

/**
 * Helper: Select from shadcn/ui combobox dropdown
 */
async function selectFromDropdown(page: Page, fieldName: string, optionText: string) {
  // Click the dropdown trigger (looks for "Select X" placeholder text)
  await page.locator(`text=/select ${fieldName}/i`).or(page.locator(`text=/${fieldName}/i`).locator('..').locator('button')).first().click();
  await page.waitForTimeout(300);
  
  // Click the option from the list
  await page.getByRole('option', { name: new RegExp(optionText, 'i') }).click();
  await page.waitForTimeout(200);
}

test.describe('Labour Code Readiness Assessment Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to Labour Code assessment', async ({ page }) => {
    await page.getByRole('link', { name: /labour code/i }).first().click();
    await expect(page).toHaveURL(/\/assessment\/labour-code/);
    // Check for main heading specifically to avoid strict mode violation
    await expect(page.getByRole('main').getByText(/labour code readiness/i)).toBeVisible();
  });

  test('should complete IT company assessment with ~18 questions', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    // Fill company details - IT Services, small company
    await page.getByLabel(/full name/i).fill('IT Test User');
    await page.getByLabel(/email/i).fill('it-test@example.com');
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/company name/i).fill('TechStartup Solutions Pvt Ltd');
    await page.getByLabel(/state/i).selectOption('Karnataka');
    await page.getByLabel(/employee count/i).selectOption('21-50 employees');
    await page.getByLabel(/industry/i).selectOption('IT / Software');
    
    await page.getByRole('button', { name: /start assessment/i }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    // Count questions presented (should be ~18 for small IT company)
    let questionCount = 0;
    const maxQuestions = 35; // Safety limit
    
    while (questionCount < maxQuestions) {
      // Check if we're on results page
      const isResultsPage = await page.url().includes('/results/');
      if (isResultsPage) break;
      
      // Answer question (select first option or YES)
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        // Multiple choice - select first option
        const firstOption = await page.locator('button[type="button"]').first();
        await firstOption.click();
      }
      
      questionCount++;
      
      // Check if this is the last question
      const hasSubmitButton = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      
      if (hasSubmitButton) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      } else {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(500);
      }
    }
    
    // Wait for results
    await page.waitForURL(/\/results\//, { timeout: 10000 });
    
    // Verify IT company got filtered questions (15-22 questions typical)
    expect(questionCount).toBeGreaterThan(12);
    expect(questionCount).toBeLessThan(25);
    
    // Verify results page loaded
    await expect(page.getByRole('main').getByText(/compliance|labour code/i).first()).toBeVisible();
  });

  test('should complete Manufacturing company assessment with ~28 questions', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    // Fill company details - Manufacturing, larger company
    await page.getByLabel(/company name/i).fill('Heavy Industries Manufacturing Ltd');
    await selectFromDropdown(page, /employee count/i, /100-249/);
    await selectFromDropdown(page, /industry/i, /manufacturing/i);
    await selectFromDropdown(page, /state/i, /Maharashtra/i);
    await page.getByLabel(/email/i).fill('manufacturing@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    // Count questions (should be ~28 for large manufacturing company)
    let questionCount = 0;
    const maxQuestions = 35;
    
    while (questionCount < maxQuestions) {
      const isResultsPage = await page.url().includes('/results/');
      if (isResultsPage) break;
      
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        const firstOption = await page.locator('button[type="button"]').first();
        await firstOption.click();
      }
      
      questionCount++;
      
      const hasSubmitButton = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmitButton) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      } else {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(500);
      }
    }
    
    await page.waitForURL(/\/results\//, { timeout: 10000 });
    
    // Manufacturing should get MORE questions than IT
    expect(questionCount).toBeGreaterThan(22);
    expect(questionCount).toBeLessThanOrEqual(32);
    
    await expect(page.getByRole('main').getByText(/compliance|labour code/i).first()).toBeVisible();
  });

  test('should show all four Labour Code categories in results', async ({ page }) => {
    await completeLabourCodeAssessment(page, {
      companyName: 'Category Test Co',
      employeeCount: '50-99',
      industry: 'retail',
      state: 'Delhi',
      email: 'categories@test.com'
    });
    
    await page.waitForURL(/\/results\//);
    
    // Check all 4 categories are displayed
    await expect(page.getByRole('main').locator('text=/code on wages|wages/i').first()).toBeVisible();
    await expect(page.getByRole('main').locator('text=/social security|epf|esi/i').first()).toBeVisible();
    await expect(page.getByRole('main').locator('text=/osh|safety|health|working conditions/i').first()).toBeVisible();
    await expect(page.getByRole('main').locator('text=/industrial relations|standing orders/i').first()).toBeVisible();
  });

  test('should handle small company (10-19 employees) with fewer questions', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    // Small company - should have fewest questions
    await page.getByLabel(/company name/i).fill('Small Business LLP');
    await selectFromDropdown(page, /employee count/i, /10-19/);
    await selectFromDropdown(page, /industry/i, /professional_services/i);
    await selectFromDropdown(page, /state/i, /Gujarat/i);
    await page.getByLabel(/email/i).fill('small@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let questionCount = 0;
    const maxQuestions = 30;
    
    while (questionCount < maxQuestions) {
      const isResultsPage = await page.url().includes('/results/');
      if (isResultsPage) break;
      
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        const firstOption = await page.locator('button[type="button"]').first();
        await firstOption.click();
      }
      
      questionCount++;
      
      const hasSubmitButton = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmitButton) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      } else {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(500);
      }
    }
    
    await page.waitForURL(/\/results\//, { timeout: 10000 });
    
    // Small company should have fewer questions (10-19 employees)
    expect(questionCount).toBeGreaterThan(8);
    expect(questionCount).toBeLessThan(22);
  });

  test('should handle large enterprise (500+ employees) with most questions', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    // Large enterprise - should get almost all questions
    await page.getByLabel(/company name/i).fill('MegaCorp Industries Ltd');
    await selectFromDropdown(page, /employee count/i, /500+/);
    await selectFromDropdown(page, /industry/i, /manufacturing/i);
    await selectFromDropdown(page, /state/i, /Tamil Nadu/i);
    await page.getByLabel(/email/i).fill('megacorp@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let questionCount = 0;
    const maxQuestions = 35;
    
    while (questionCount < maxQuestions) {
      const isResultsPage = await page.url().includes('/results/');
      if (isResultsPage) break;
      
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        const firstOption = await page.locator('button[type="button"]').first();
        await firstOption.click();
      }
      
      questionCount++;
      
      const hasSubmitButton = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmitButton) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      } else {
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(500);
      }
    }
    
    await page.waitForURL(/\/results\//, { timeout: 10000 });
    
    // Large company should get MOST questions (28-32)
    expect(questionCount).toBeGreaterThan(25);
    expect(questionCount).toBeLessThanOrEqual(35);
  });

  test('should validate dynamic filtering works correctly', async ({ page }) => {
    // Test that IT services gets fewer questions than manufacturing
    
    // First: Count IT questions
    await page.goto('/assessment/labour-code');
    await page.getByLabel(/company name/i).fill('IT Test');
    await selectFromDropdown(page, /employee count/i, /50-99/);
    await selectFromDropdown(page, /industry/i, /it_services/i);
    await selectFromDropdown(page, /state/i, /Karnataka/i);
    await page.getByLabel(/email/i).fill('dynamic1@test.com');
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let itQuestions = 0;
    while (itQuestions < 35) {
      if (await page.url().includes('/results/')) break;
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      itQuestions++;
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }
    
    // Second: Count Manufacturing questions
    await page.goto('/assessment/labour-code');
    await page.getByLabel(/company name/i).fill('Manufacturing Test');
    await selectFromDropdown(page, /employee count/i, /50-99/);
    await selectFromDropdown(page, /industry/i, /manufacturing/i);
    await selectFromDropdown(page, /state/i, /Maharashtra/i);
    await page.getByLabel(/email/i).fill('dynamic2@test.com');
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let mfgQuestions = 0;
    while (mfgQuestions < 35) {
      if (await page.url().includes('/results/')) break;
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      mfgQuestions++;
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }
    
    // Manufacturing should have MORE questions than IT
    expect(mfgQuestions).toBeGreaterThan(itQuestions);
  });

  test('should display progress indicator throughout assessment', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await page.getByLabel(/company name/i).fill('Progress Test');
    await selectFromDropdown(page, /employee count/i, /20-49/);
    await selectFromDropdown(page, /industry/i, /it_services/i);
    await selectFromDropdown(page, /state/i, /Karnataka/i);
    await page.getByLabel(/email/i).fill('progress@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    // Check progress bar exists
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    
    // Answer 5 questions and check progress increases
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }
    
    // Progress should be visible and increasing
    const progressText = await page.locator('text=/\\d+%/').first().textContent();
    const progress = parseInt(progressText?.match(/\d+/)?.[0] || '0');
    expect(progress).toBeGreaterThan(0);
  });

  test('should trigger NPS modal after assessment completion', async ({ page }) => {
    await completeLabourCodeAssessment(page, {
      companyName: 'NPS Test Co',
      employeeCount: '20-49',
      industry: 'healthcare',
      state: 'Maharashtra',
      email: 'nps-labour@test.com'
    });
    
    await page.waitForURL(/\/results\//);
    
    // Click Download PDF
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    
    // NPS modal should appear
    await expect(page.getByText(/how likely.*recommend/i)).toBeVisible();
    await expect(page.getByText(/^10$/)).toBeVisible();
    await expect(page.getByText(/^0$/)).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/assessment/labour-code');
    
    await expect(page.getByRole('main').getByText(/company details|labour code/i).first()).toBeVisible();
    
    await page.getByLabel(/company name/i).fill('Mobile Test');
    await selectFromDropdown(page, /employee count/i, /20-49/);
    await selectFromDropdown(page, /industry/i, /retail/i);
    await selectFromDropdown(page, /state/i, /Delhi/i);
    await page.getByLabel(/email/i).fill('mobile@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    
    // Should show first question
    await expect(page.getByRole('button', { name: /yes|no/i })).toBeVisible();
  });

  test('should persist assessment to database', async ({ page }) => {
    await completeLabourCodeAssessment(page, {
      companyName: 'Database Test Co',
      employeeCount: '50-99',
      industry: 'fintech',
      state: 'Karnataka',
      email: 'db-labour@test.com'
    });
    
    await page.waitForURL(/\/results\/[a-f0-9-]+/, { timeout: 15000 });
    
    const url = page.url();
    const assessmentId = url.match(/\/results\/([a-f0-9-]+)/)?.[1];
    
    expect(assessmentId).toBeTruthy();
    expect(assessmentId).toMatch(/^[a-f0-9-]{36}$/);
  });

  test('should handle navigation back and forth', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await page.getByLabel(/company name/i).fill('Navigation Test');
    await selectFromDropdown(page, /employee count/i, /20-49/);
    await selectFromDropdown(page, /industry/i, /it_services/i);
    await selectFromDropdown(page, /state/i, /Delhi/i);
    await page.getByLabel(/email/i).fill('nav@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    // Answer 3 questions
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }
    
    // Click Previous
    await page.getByRole('button', { name: /previous/i }).click();
    
    // Should still be in assessment
    const isStillInAssessment = await page.url().includes('/assessment/labour-code');
    expect(isStillInAssessment).toBe(true);
  });

});

/**
 * Helper Functions
 */

async function completeLabourCodeAssessment(
  page: Page,
  details: {
    companyName: string;
    employeeCount: string;
    industry: string;
    state: string;
    email: string;
  }
) {
  await page.goto('/assessment/labour-code');
  
  // Fill company details using shadcn/ui dropdowns
  await page.getByLabel(/company name/i).fill(details.companyName);
  await selectFromDropdown(page, /employee count/i, new RegExp(details.employeeCount.replace('+', '\\+')));
  await selectFromDropdown(page, /industry/i, new RegExp(details.industry.replace('_', '.*'), 'i'));
  await selectFromDropdown(page, /state/i, new RegExp(details.state, 'i'));
  await page.getByLabel(/email/i).fill(details.email);
  
  await page.getByRole('button', { name: /next|start/i }).click();
  await page.waitForTimeout(500);
  
  // Answer all questions (adaptive)
  const maxQuestions = 35;
  let count = 0;
  
  while (count < maxQuestions) {
    const isResultsPage = await page.url().includes('/results/');
    if (isResultsPage) break;
    
    const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
    if (hasYesButton) {
      await page.getByRole('button', { name: /^yes$/i }).first().click();
    } else {
      const firstOption = await page.locator('button[type="button"]').first();
      await firstOption.click();
    }
    
    count++;
    
    const hasSubmitButton = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
    if (hasSubmitButton) {
      await page.getByRole('button', { name: /submit|get.*report/i }).click();
      break;
    } else {
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(300);
    }
  }
}
