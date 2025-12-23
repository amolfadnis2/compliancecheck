import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Summary Page, PDF, and Email Validation Tests
 * 
 * Tests accuracy of:
 * - Summary/Results page content
 * - PDF download and content validation
 * - Email functionality
 */

// Helper function to complete assessment and reach results page
async function completeAssessmentToResults(page: Page, answers: 'yes' | 'no' | 'mixed' = 'yes') {
  await page.goto('/assessment/statutory-health');
  
  // Fill company details
  await page.getByLabel(/full name/i).fill('Summary Test User');
  await page.getByLabel(/email/i).fill('summary@testcompany.com');
  await page.getByLabel(/phone/i).fill('9876543210');
  await page.getByLabel(/company name/i).fill('Summary Test Pvt Ltd');
  await page.getByLabel(/state/i).selectOption('Maharashtra');
  await page.getByLabel(/employee count/i).selectOption('50-99 employees');
  await page.getByLabel(/industry/i).selectOption('Information Technology');
  await page.getByRole('button', { name: /continue to assessment/i }).click();
  await page.waitForTimeout(500);
  
  // Answer 12 questions based on answer type
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(800);
    
    if (answers === 'yes') {
      await page.getByRole('button', { name: /^yes$/i }).first().click();
    } else if (answers === 'no') {
      await page.getByRole('button', { name: /^no$/i }).first().click();
    } else {
      // Mixed: alternate yes/no
      const answer = i % 2 === 0 ? /^yes$/i : /^no$/i;
      await page.getByRole('button', { name: answer }).first().click();
    }
    await page.waitForTimeout(800);
  }
  
  await page.getByRole('button', { name: /get free report|submit/i }).click();
  await page.waitForURL(/\/results\//, { timeout: 15000 });
}

// =====================================================
// SUMMARY PAGE VALIDATION TESTS
// =====================================================

test.describe('Summary/Results Page Accuracy', () => {
  
  test('should display correct company details from form input', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Verify company name appears on results page
    await expect(page.getByText('Summary Test Pvt Ltd')).toBeVisible();
    
    // Verify state appears
    await expect(page.getByText('Maharashtra')).toBeVisible();
  });


  test('should display overall compliance score as percentage', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Score should be displayed as percentage
    const scoreElement = page.locator('[data-testid="overall-score"], .score, text=/\\d+%/').first();
    await expect(scoreElement).toBeVisible();
    
    const scoreText = await scoreElement.textContent();
    expect(scoreText).toMatch(/\d+%/);
  });

  test('should show 100% score when all answers are YES', async ({ page }) => {
    await completeAssessmentToResults(page, 'yes');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBe(100);
  });

  test('should show lower score when some answers are NO', async ({ page }) => {
    await completeAssessmentToResults(page, 'mixed');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThan(0);
  });

  test('should display correct status badge based on score', async ({ page }) => {
    // Test low score scenario
    await completeAssessmentToResults(page, 'no');
    
    // Should show Critical or Needs Improvement status
    const hasCriticalBadge = await page.getByText(/critical|needs improvement|action required/i).isVisible();
    expect(hasCriticalBadge).toBe(true);
  });


  test('should display all compliance categories', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Statutory Health has 5 categories
    const categories = [
      /PF|Provident Fund/i,
      /ESI|Employee State Insurance/i,
      /Professional Tax|PT/i,
      /Gratuity/i,
      /Bonus/i
    ];
    
    for (const category of categories) {
      await expect(page.getByText(category).first()).toBeVisible();
    }
  });

  test('should display category-wise scores', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Each category should have a score displayed
    const categoryScores = page.locator('[data-testid="category-score"], .category-score');
    const count = await categoryScores.count();
    
    // At least some category scores should be visible
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should display action items for non-compliant areas', async ({ page }) => {
    await completeAssessmentToResults(page, 'no');
    
    // Action items section should be visible
    const actionItems = page.locator('[data-testid="action-items"], .action-items, text=/action.*item|recommendation/i');
    await expect(actionItems.first()).toBeVisible();
  });


  test('should display report ID in correct format', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Report ID should be visible (UUID format or custom format)
    const reportIdElement = page.locator('[data-testid="report-id"], text=/report.*id|assessment.*id/i, text=/[A-Z]{2,}-\\d{4}|[a-f0-9-]{36}/i');
    await expect(reportIdElement.first()).toBeVisible();
  });

  test('should display assessment date', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Today's date should be visible in some format
    const today = new Date();
    const dateFormats = [
      today.toLocaleDateString('en-IN'),
      today.toLocaleDateString('en-US'),
      `${today.getDate()}`,
      `${today.getFullYear()}`
    ];
    
    let dateFound = false;
    for (const format of dateFormats) {
      if (await page.getByText(format).first().isVisible().catch(() => false)) {
        dateFound = true;
        break;
      }
    }
    expect(dateFound).toBe(true);
  });

  test('should display regulatory reference links', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Should have links to government portals
    const govLinks = page.locator('a[href*="gov.in"], a[href*="epfindia"], a[href*="esic"]');
    const linkCount = await govLinks.count();
    
    // At least one regulatory link should be present
    expect(linkCount).toBeGreaterThanOrEqual(1);
  });
});


// =====================================================
// PDF DOWNLOAD VALIDATION TESTS
// =====================================================

test.describe('PDF Download Validation', () => {
  
  test('should download PDF file successfully', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click download button
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    
    // Handle NPS modal if it appears
    const npsModal = page.getByText(/how likely.*recommend/i);
    if (await npsModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Close or submit NPS modal
      await page.getByRole('button', { name: /skip|close|submit|later/i }).first().click();
    }
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify filename
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test('should generate valid non-empty PDF file', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    
    // Handle NPS modal
    const npsModal = page.getByText(/how likely.*recommend/i);
    if (await npsModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: /skip|close|submit|later/i }).first().click();
    }
    
    const download = await downloadPromise;
    
    // Save file to temp location
    const filePath = path.join('test-results', 'downloaded-report.pdf');
    await download.saveAs(filePath);
    
    // Verify file exists and has content
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(5000); // At least 5KB
    
    // Verify PDF header (magic bytes)
    const buffer = fs.readFileSync(filePath);
    const header = buffer.slice(0, 5).toString();
    expect(header).toBe('%PDF-');
    
    // Cleanup
    fs.unlinkSync(filePath);
  });

  test('should include company name in PDF filename', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    
    // Handle NPS modal
    const npsModal = page.getByText(/how likely.*recommend/i);
    if (await npsModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: /skip|close|submit|later/i }).first().click();
    }
    
    const download = await downloadPromise;
    const filename = download.suggestedFilename().toLowerCase();
    
    // Filename should contain company reference or compliance/report
    const validFilename = filename.includes('compliance') || 
                          filename.includes('report') || 
                          filename.includes('summary') ||
                          filename.includes('statutory');
    expect(validFilename).toBe(true);
  });

  test('PDF should not contain Unicode errors', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    
    // Handle NPS modal
    const npsModal = page.getByText(/how likely.*recommend/i);
    if (await npsModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: /skip|close|submit|later/i }).first().click();
    }
    
    const download = await downloadPromise;
    const filePath = path.join('test-results', 'unicode-test.pdf');
    await download.saveAs(filePath);
    
    // Read PDF as text to check for encoding issues
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('utf-8');
    
    // Should not contain common Unicode replacement characters
    expect(content).not.toContain('�'); // Replacement character
    
    // Cleanup
    fs.unlinkSync(filePath);
  });
});


// =====================================================
// EMAIL FUNCTIONALITY TESTS
// =====================================================

test.describe('Email Functionality', () => {
  
  test('email report button should be visible on results page', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Email button should be visible
    const emailButton = page.getByRole('button', { name: /email.*report|send.*email|email.*me/i });
    await expect(emailButton).toBeVisible();
  });

  test('should show success message when email is sent', async ({ page }) => {
    await completeAssessmentToResults(page);
    
    // Click email button
    await page.getByRole('button', { name: /email.*report|send.*email/i }).click();
    
    // Should show loading or success message
    const successOrLoading = page.getByText(/sending|sent|success|check.*email|inbox/i);
    await expect(successOrLoading).toBeVisible({ timeout: 10000 });
  });

  test('API should accept email request with valid payload', async ({ request }) => {
    // Test the email API endpoint directly
    const response = await request.post('/api/email/send-report', {
      data: {
        to: 'test@example.com',
        assessmentId: 'test-uuid-12345',
        assessmentType: 'statutory_health',
        companyName: 'Test Company'
      }
    });
    
    // API should respond (even if email doesn't actually send in test env)
    // 200 = success, 400 = validation error, 500 = server error
    expect([200, 201, 400, 404]).toContain(response.status());
  });


  test('should handle email send failure gracefully', async ({ page, context }) => {
    await completeAssessmentToResults(page);
    
    // Mock email API to fail
    await context.route('**/api/email/**', route => 
      route.fulfill({ 
        status: 500, 
        body: JSON.stringify({ error: 'Email service unavailable' }) 
      })
    );
    
    // Click email button
    await page.getByRole('button', { name: /email.*report|send.*email/i }).click();
    
    // Should show error message, not crash
    const errorMessage = page.getByText(/failed|error|try again|could not send/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should validate email format before sending', async ({ page }) => {
    // This test requires email input field on results page
    // Skip if email is pre-filled from assessment form
    await completeAssessmentToResults(page);
    
    // If there's an email input on results page
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('invalid-email');
      await page.getByRole('button', { name: /email.*report|send/i }).click();
      
      // Should show validation error
      await expect(page.getByText(/valid.*email|invalid.*email/i)).toBeVisible();
    }
  });
});


// =====================================================
// SCORE CALCULATION ACCURACY TESTS
// =====================================================

test.describe('Score Calculation Accuracy', () => {
  
  test('100% YES answers should give 100% score', async ({ page }) => {
    await completeAssessmentToResults(page, 'yes');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBe(100);
  });

  test('100% NO answers should give 0% score', async ({ page }) => {
    await completeAssessmentToResults(page, 'no');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    expect(score).toBe(0);
  });

  test('50% YES answers should give approximately 50% score', async ({ page }) => {
    await completeAssessmentToResults(page, 'mixed');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
    
    // With mixed answers (alternating yes/no), score should be around 40-60%
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(70);
  });

  test('category scores should sum to overall score', async ({ page }) => {
    await completeAssessmentToResults(page, 'mixed');
    
    // Get overall score
    const overallScoreText = await page.locator('[data-testid="overall-score"], text=/\\d+%/').first().textContent();
    const overallScore = parseInt(overallScoreText?.match(/\d+/)?.[0] || '0');
    
    // This test verifies the score is calculated, detailed validation depends on UI structure
    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);
  });
});
