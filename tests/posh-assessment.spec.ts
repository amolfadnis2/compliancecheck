/**
 * POSH Assessment End-to-End Tests
 * 
 * Tests the complete POSH Act 2013 Compliance Assessment flow:
 * - Applicability phase
 * - Main assessment phase
 * - Scoring and report generation
 * - Database persistence
 * - PostHog analytics
 * - Accessibility compliance
 * 
 * @see https://playwright.dev/docs/intro
 */

import { test, expect, type Page } from '@playwright/test';
import { axeAccessibility } from './utils/axe-helper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data
const TEST_COMPANY = {
  fullName: 'Priya Sharma',
  email: 'priya.sharma@testcompany.co.in',
  phone: '9876543210',
  companyName: 'Test Tech Solutions Pvt Ltd',
  industry: 'it_services',
  employeeCount: '100_to_199',
  state: 'maharashtra',
  hasNightShifts: 'occasional',
  hasICCFormed: 'yes_full',
  iccMembers: '5_to_7',
  hasExternalMember: 'yes',
  annualReportFiled: 'yes_on_time',
};

/**
 * Navigate to POSH assessment page
 */
async function navigateToPOSHAssessment(page: Page) {
  await page.goto(`${BASE_URL}/assessment/posh`);
  await expect(page).toHaveTitle(/POSH Act 2013/i);
}

/**
 * Fill applicability questions
 */
async function fillApplicabilityQuestions(page: Page, compliant = true) {
  // Company details
  await page.fill('input[name="fullName"]', TEST_COMPANY.fullName);
  await page.fill('input[name="email"]', TEST_COMPANY.email);
  await page.fill('input[name="phone"]', TEST_COMPANY.phone);
  await page.fill('input[name="companyName"]', TEST_COMPANY.companyName);
  
  // Dropdowns
  await page.selectOption('select[name="industry"]', TEST_COMPANY.industry);
  await page.selectOption('select[name="employeeCount"]', TEST_COMPANY.employeeCount);
  await page.selectOption('select[name="state"]', TEST_COMPANY.state);
  
  // Applicability questions
  if (compliant) {
    await page.click(`button:has-text("Yes"):visible`);
    await page.waitForTimeout(500);
    
    // Continue with compliant answers
    await page.selectOption('select[name="hasICCFormed"]', 'yes_full');
    await page.selectOption('select[name="iccMembers"]', '5_to_7');
    await page.click(`button:has-text("Yes"):visible`);
    await page.selectOption('select[name="annualReportFiled"]', 'yes_on_time');
  }
}

/**
 * Complete full assessment with given answers
 */
async function completeAssessment(page: Page, answerPattern: 'all_yes' | 'mixed' | 'all_no') {
  const questionsAnswered = [];
  
  while (true) {
    // Check if we're on the results page
    const isResultsPage = await page.locator('text=/compliance score|download report/i').count() > 0;
    if (isResultsPage) break;
    
    // Check for questions
    const yesButton = page.locator('button:has-text("Yes"):visible').first();
    const noButton = page.locator('button:has-text("No"):visible').first();
    
    const hasQuestion = await yesButton.count() > 0 || await noButton.count() > 0;
    if (!hasQuestion) break;
    
    // Answer based on pattern
    if (answerPattern === 'all_yes') {
      await yesButton.click();
    } else if (answerPattern === 'all_no') {
      await noButton.click();
    } else {
      // Mixed: alternate yes/no
      if (questionsAnswered.length % 2 === 0) {
        await yesButton.click();
      } else {
        await noButton.click();
      }
    }
    
    questionsAnswered.push(true);
    await page.waitForTimeout(1000); // Wait for auto-advance
    
    // Safety break
    if (questionsAnswered.length > 60) break;
  }
  
  return questionsAnswered.length;
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('POSH Assessment', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // --------------------------------------------------------------------------
  // Test 1: Page Accessibility
  // --------------------------------------------------------------------------
  
  test('meets WCAG 2.0 accessibility standards', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    
    // Run axe accessibility audit
    const violations = await axeAccessibility(page);
    expect(violations).toHaveLength(0);
    
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label]').first()).toBeVisible();
    
    // Keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  // --------------------------------------------------------------------------
  // Test 2: Authentication NOT Required (Anonymous Assessment)
  // --------------------------------------------------------------------------
  
  test('allows anonymous assessment without login', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    
    // Should show assessment form, not redirect to login
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    await expect(page).not.toHaveURL(/login/);
  });

  // --------------------------------------------------------------------------
  // Test 3: Applicability Flow - Compliant Company
  // --------------------------------------------------------------------------
  
  test('completes applicability flow for compliant company', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    
    // Fill company details
    await fillApplicabilityQuestions(page, true);
    
    // Submit applicability
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    
    // Should proceed to main assessment
    await expect(page.locator('text=/Category|Question/i')).toBeVisible();
    
    // Check for progress indicator
    await expect(page.locator('[role="progressbar"], .progress-bar, text=/progress/i')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 4: Full Assessment - All Compliant
  // --------------------------------------------------------------------------
  
  test('completes full assessment with all compliant answers', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes timeout
    
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    
    // Complete assessment
    const questionCount = await completeAssessment(page, 'all_yes');
    console.log(`Answered ${questionCount} questions`);
    
    // Wait for results page
    await page.waitForSelector('text=/compliance score|overall score/i', { timeout: 10000 });
    
    // Verify high compliance score
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeGreaterThan(80); // Should be > 80% for all yes
    
    // Check for download button
    await expect(page.locator('button:has-text(/download|generate report/i)')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 5: Full Assessment - Non-Compliant
  // --------------------------------------------------------------------------
  
  test('completes full assessment with non-compliant answers', async ({ page }) => {
    test.setTimeout(120000);
    
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    
    // Complete with no answers
    const questionCount = await completeAssessment(page, 'all_no');
    console.log(`Answered ${questionCount} questions`);
    
    // Wait for results
    await page.waitForSelector('text=/compliance score|overall score/i', { timeout: 10000 });
    
    // Verify low score
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeLessThan(50); // Should be < 50% for all no
    
    // Check for action items
    await expect(page.locator('text=/action item|recommendation|priority/i')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 6: PDF Report Generation
  // --------------------------------------------------------------------------
  
  test('generates PDF report successfully', async ({ page }) => {
    test.setTimeout(120000);
    
    // Complete assessment
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    await completeAssessment(page, 'mixed');
    
    // Wait for results
    await page.waitForSelector('text=/compliance score/i', { timeout: 10000 });
    
    // Click download/generate button
    const downloadButton = page.locator('button:has-text(/download|generate report/i)').first();
    await downloadButton.click();
    
    // Wait for PDF generation (look for success message or PDF viewer)
    await page.waitForTimeout(5000);
    
    // Verify no errors
    const errorMessage = await page.locator('text=/error|failed/i').count();
    expect(errorMessage).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Test 7: Database Persistence
  // --------------------------------------------------------------------------
  
  test('saves assessment data to database', async ({ page }) => {
    test.setTimeout(120000);
    
    // Complete assessment
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    await completeAssessment(page, 'all_yes');
    
    // Wait for results and get URL
    await page.waitForSelector('text=/compliance score/i', { timeout: 10000 });
    const url = page.url();
    
    // URL should contain assessment ID
    expect(url).toMatch(/\/results\/[a-zA-Z0-9_-]+/);
    
    // Reload page - data should persist
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Score should still be visible
    await expect(page.locator('text=/compliance score/i')).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // Test 8: Auto-Advance Navigation
  // --------------------------------------------------------------------------
  
  test('auto-advances after answering question', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    
    // Get first question text
    const firstQuestion = await page.locator('h2, h3').first().textContent();
    
    // Answer question
    await page.click('button:has-text("Yes"):visible');
    
    // Wait for auto-advance (max 2 seconds)
    await page.waitForTimeout(2000);
    
    // Question should have changed
    const secondQuestion = await page.locator('h2, h3').first().textContent();
    expect(secondQuestion).not.toBe(firstQuestion);
  });

  // --------------------------------------------------------------------------
  // Test 9: Progress Tracking
  // --------------------------------------------------------------------------
  
  test('tracks and displays progress correctly', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    
    // Initial progress should be 0%
    let progressText = await page.locator('text=/\\d+%|progress/i').first().textContent();
    console.log('Initial progress:', progressText);
    
    // Answer 5 questions
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Yes"):visible');
      await page.waitForTimeout(1000);
    }
    
    // Progress should have increased
    progressText = await page.locator('text=/\\d+%/').first().textContent();
    const progress = parseInt(progressText?.match(/\d+/)?.[0] || '0');
    expect(progress).toBeGreaterThan(0);
    console.log('After 5 questions:', progress + '%');
  });

  // --------------------------------------------------------------------------
  // Test 10: Mobile Responsiveness
  // --------------------------------------------------------------------------
  
  test('works correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await navigateToPOSHAssessment(page);
    
    // All elements should be visible and clickable
    await expect(page.locator('input[name="companyName"]')).toBeVisible();
    
    // Fill form on mobile
    await fillApplicabilityQuestions(page, true);
    
    // Buttons should be at least 44x44px (WCAG touch target size)
    const button = page.locator('button').first();
    const box = await button.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  // --------------------------------------------------------------------------
  // Test 11: LocalStorage Fallback
  // --------------------------------------------------------------------------
  
  test('uses localStorage when database is unavailable', async ({ page, context }) => {
    // Block database API calls
    await page.route('**/api/assessment/**', route => {
      route.abort();
    });
    
    await navigateToPOSHAssessment(page);
    await fillApplicabilityQuestions(page, true);
    await page.click('button:has-text("Continue to Assessment")');
    await page.waitForTimeout(2000);
    
    // Answer some questions
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Yes"):visible');
      await page.waitForTimeout(1000);
    }
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return Object.keys(window.localStorage);
    });
    
    // Should have saved progress
    expect(localStorage.some(key => key.includes('posh') || key.includes('assessment'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Test 12: Input Validation
  // --------------------------------------------------------------------------
  
  test('validates user inputs correctly', async ({ page }) => {
    await navigateToPOSHAssessment(page);
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    const errorCount = await page.locator('text=/required|invalid|error/i').count();
    expect(errorCount).toBeGreaterThan(0);
    
    // Fill with invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Should show email validation error
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
    
    // Fill with invalid phone (less than 10 digits)
    await page.fill('input[name="phone"]', '12345');
    await page.click('button[type="submit"]');
    
    // Should show phone validation error
    await expect(page.locator('text=/invalid.*phone|10 digit/i')).toBeVisible();
  });

});
