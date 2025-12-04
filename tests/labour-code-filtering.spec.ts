import { test, expect } from '@playwright/test';

/**
 * Labour Code Dynamic Filtering Tests
 * 
 * Tests the intelligent question filtering based on:
 * - Employee count thresholds (10+, 20+, 50+, 100+, 300+, 500+)
 * - Industry type (IT vs Manufacturing vs Retail, etc.)
 * - Combined filtering (both factors)
 */

test.describe('Labour Code Dynamic Filtering', () => {

  test('should show fewer questions for micro companies (1-9 employees)', async ({ page }) => {
    await page.goto('/assessment/labour-code');
    
    await page.getByLabel(/company name/i).fill('Micro Business');
    await selectFromDropdown(page, /employee count/i, /1-9/);
    await selectFromDropdown(page, /industry/i, /retail/i);
    await selectFromDropdown(page, /state/i, /Maharashtra/i);
    await page.getByLabel(/email/i).fill('micro@test.com');
    
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let questionCount = 0;
    while (questionCount < 30) {
      if (await page.url().includes('/results/')) break;
      
      const hasYesButton = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYesButton) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      
      questionCount++;
      
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(200);
    }
    
    // Micro companies should get 8-15 questions (basic compliance only)
    expect(questionCount).toBeGreaterThan(5);
    expect(questionCount).toBeLessThan(18);
  });

  test('should show EPF/Bonus questions only for 20+ employees', async ({ page }) => {
    // Test that 10-19 employees DON'T get EPF/Bonus questions
    // But 20-49 employees DO get them
    
    // This is implicit in the question count difference
    // 10-19 should have fewer questions than 20-49
    
    // Small company (10-19)
    await page.goto('/assessment/labour-code');
    await page.getByLabel(/company name/i).fill('Below Threshold');
    await selectFromDropdown(page, /employee count/i, /10-19/);
    await selectFromDropdown(page, /industry/i, /it_services/i);
    await selectFromDropdown(page, /state/i, /Karnataka/i);
    await page.getByLabel(/email/i).fill('below@test.com');
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let smallCompanyQuestions = 0;
    while (smallCompanyQuestions < 30) {
      if (await page.url().includes('/results/')) break;
      const hasYes = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYes) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      smallCompanyQuestions++;
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(200);
    }
    
    // Medium company (20-49) - should get MORE questions
    await page.goto('/assessment/labour-code');
    await page.getByLabel(/company name/i).fill('Above Threshold');
    await selectFromDropdown(page, /employee count/i, /20-49/);
    await selectFromDropdown(page, /industry/i, /it_services/i);
    await selectFromDropdown(page, /state/i, /Karnataka/i);
    await page.getByLabel(/email/i).fill('above@test.com');
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let mediumCompanyQuestions = 0;
    while (mediumCompanyQuestions < 30) {
      if (await page.url().includes('/results/')) break;
      const hasYes = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYes) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      mediumCompanyQuestions++;
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(200);
    }
    
    // 20-49 employees should get 2-4 MORE questions (EPF, Bonus, GRC)
    expect(mediumCompanyQuestions).toBeGreaterThan(smallCompanyQuestions);
    expect(mediumCompanyQuestions - smallCompanyQuestions).toBeGreaterThanOrEqual(2);
  });

  test('should show additional OSH questions for manufacturing vs IT', async ({ page }) => {
    // Manufacturing gets factory-specific questions that IT doesn't
    
    // IT company
    await page.goto('/assessment/labour-code');
    await page.getByLabel(/company name/i).fill('IT Company');
    await selectFromDropdown(page, /employee count/i, /50-99/);
    await selectFromDropdown(page, /industry/i, /it_services/i);
    await selectFromDropdown(page, /state/i, /Maharashtra/i);
    await page.getByLabel(/email/i).fill('it-industry@test.com');
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let itQuestionCount = 0;
    while (itQuestionCount < 35) {
      if (await page.url().includes('/results/')) break;
      const hasYes = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYes) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      itQuestionCount++;
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(200);
    }
    
    // Manufacturing company
    await page.goto('/assessment/labour-code');
    await page.getByLabel(/company name/i).fill('Manufacturing Co');
    await selectFromDropdown(page, /employee count/i, /50-99/);
    await selectFromDropdown(page, /industry/i, /manufacturing/i);
    await selectFromDropdown(page, /state/i, /Maharashtra/i);
    await page.getByLabel(/email/i).fill('mfg-industry@test.com');
    await page.getByRole('button', { name: /next|start/i }).click();
    await page.waitForTimeout(500);
    
    let mfgQuestionCount = 0;
    while (mfgQuestionCount < 35) {
      if (await page.url().includes('/results/')) break;
      const hasYes = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
      if (hasYes) {
        await page.getByRole('button', { name: /^yes$/i }).first().click();
      } else {
        await page.locator('button[type="button"]').first().click();
      }
      mfgQuestionCount++;
      const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
      if (hasSubmit) {
        await page.getByRole('button', { name: /submit|get.*report/i }).click();
        break;
      }
      await page.getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(200);
    }
    
    // Manufacturing should get 5-10 MORE questions (factory, safety, etc.)
    expect(mfgQuestionCount).toBeGreaterThan(itQuestionCount);
    expect(mfgQuestionCount - itQuestionCount).toBeGreaterThanOrEqual(4);
  });

  test('should scale questions appropriately across all size categories', async ({ page }) => {
    const sizes = [
      { range: '1-9', expected: { min: 8, max: 15 } },
      { range: '10-19', expected: { min: 12, max: 20 } },
      { range: '20-49', expected: { min: 15, max: 23 } },
      { range: '50-99', expected: { min: 18, max: 26 } },
      { range: '100-249', expected: { min: 22, max: 30 } },
      { range: '500+', expected: { min: 26, max: 33 } },
    ];
    
    const results: { size: string; count: number }[] = [];
    
    for (const size of sizes) {
      await page.goto('/assessment/labour-code');
      await page.getByLabel(/company name/i).fill(`Size Test ${size.range}`);
      await page.getByLabel(/employee count/i).selectOption(size.range);
      await selectFromDropdown(page, /industry/i, /it_services/i);
      await selectFromDropdown(page, /state/i, /Karnataka/i);
      await page.getByLabel(/email/i).fill(`size-${size.range}@test.com`);
      await page.getByRole('button', { name: /next|start/i }).click();
      await page.waitForTimeout(500);
      
      let count = 0;
      while (count < 35) {
        if (await page.url().includes('/results/')) break;
        const hasYes = await page.getByRole('button', { name: /^yes$/i }).first().isVisible();
        if (hasYes) {
          await page.getByRole('button', { name: /^yes$/i }).first().click();
        } else {
          await page.locator('button[type="button"]').first().click();
        }
        count++;
        const hasSubmit = await page.getByRole('button', { name: /submit|get.*report/i }).isVisible();
        if (hasSubmit) {
          await page.getByRole('button', { name: /submit|get.*report/i }).click();
          break;
        }
        await page.getByRole('button', { name: /next/i }).click();
        await page.waitForTimeout(200);
      }
      
      results.push({ size: size.range, count });
      
      // Verify within expected range
      expect(count).toBeGreaterThanOrEqual(size.expected.min);
      expect(count).toBeLessThanOrEqual(size.expected.max);
    }
    
    // Verify progressive increase
    for (let i = 1; i < results.length; i++) {
      expect(results[i].count).toBeGreaterThanOrEqual(results[i - 1].count);
    }
  });

  test('should handle all industry types correctly', async ({ page }) => {
    const industries = [
      'it_services',
      'manufacturing',
      'retail',
      'healthcare',
      'fintech',
      'construction',
      'hospitality',
      'education',
      'professional_services'
    ];
    
    for (const industry of industries) {
      await page.goto('/assessment/labour-code');
      await page.getByLabel(/company name/i).fill(`${industry} Test Co`);
      await selectFromDropdown(page, /employee count/i, /50-99/);
      await page.getByLabel(/industry/i).selectOption(industry);
      await selectFromDropdown(page, /state/i, /Maharashtra/i);
      await page.getByLabel(/email/i).fill(`${industry}@test.com`);
      await page.getByRole('button', { name: /next|start/i }).click();
      await page.waitForTimeout(500);
      
      // Should reach first question without errors
      await expect(page.getByRole('button', { name: /yes|no/i })).toBeVisible({ timeout: 5000 });
    }
  });

});
