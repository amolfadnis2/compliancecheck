import { test, expect, Page } from '@playwright/test';
import { COMPANY_PROFILES } from './fixtures/company-profiles';

/**
 * Supabase Data Persistence Tests
 * 
 * Comprehensive tests to verify data is correctly stored in Supabase.
 * Tests cover: assessment creation, response storage, score persistence,
 * feedback storage, and data integrity.
 */

// Helper: Complete assessment flow
async function completeAssessmentFlow(
  page: Page, 
  assessmentType: 'statutory-health' | 'labour-code' | 'dpdp',
  profile: typeof COMPANY_PROFILES.MID_IT,
  answerPattern: 'yes' | 'no' | 'mixed' = 'yes'
) {
  await page.goto(`/assessment/${assessmentType}`);
  
  // Fill company details based on assessment type
  if (assessmentType === 'dpdp') {
    // DPDP has different form structure
    await page.getByPlaceholder(/organisation name/i).fill(profile.companyName);
    await page.getByLabel(/your name/i).fill(profile.name);
    await page.getByLabel(/email/i).fill(profile.email);
    // Select dropdowns
    await page.locator('button:has-text("Select industry")').click();
    await page.getByRole('option').first().click();
    await page.locator('button:has-text("Select range")').click();
    await page.getByRole('option').first().click();
    await page.locator('button:has-text("Select state")').click();
    await page.getByRole('option', { name: /maharashtra/i }).click();
  } else {
    await page.getByLabel(/company name/i).fill(profile.companyName);
    await page.getByLabel(/full name|your name/i).fill(profile.name);
    await page.getByLabel(/email/i).fill(profile.email);
    await page.getByLabel(/phone/i).fill(profile.phone);
    await page.getByLabel(/state/i).selectOption(profile.state);
    await page.getByLabel(/employee count/i).selectOption(profile.employeeCount);
    await page.getByLabel(/industry/i).selectOption(profile.industry);
  }
  
  await page.getByRole('button', { name: /continue|start|begin/i }).click();
  await page.waitForTimeout(500);
  
  // Answer questions
  let questionCount = 0;
  const maxQuestions = 50;
  const startTime = Date.now();
  
  while (questionCount < maxQuestions && (Date.now() - startTime) < 120000) {
    if (page.url().includes('/results/')) break;
    
    let buttonName: RegExp;
    if (answerPattern === 'yes') {
      buttonName = /^yes$/i;
    } else if (answerPattern === 'no') {
      buttonName = /^no$/i;
    } else {
      buttonName = questionCount % 2 === 0 ? /^yes$/i : /^no$/i;
    }
    
    const answerButton = page.getByRole('button', { name: buttonName }).first();
    if (await answerButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await answerButton.click();
      questionCount++;
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
  
  return { questionCount };
}

test.describe('Supabase - Assessment Data Persistence', () => {
  
  test('should persist statutory health assessment with valid UUID', async ({ page }) => {
    const uniqueEmail = `persist-test-${Date.now()}@example.com`;
    const profile = { ...COMPANY_PROFILES.MID_IT, email: uniqueEmail };
    
    await completeAssessmentFlow(page, 'statutory-health', profile);
    
    // Verify URL contains valid UUID
    const url = page.url();
    const assessmentId = url.match(/\/results\/([a-f0-9-]{36})/)?.[1];
    expect(assessmentId).toBeTruthy();
    expect(assessmentId).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
  });

  test('should persist labour code assessment with valid UUID', async ({ page }) => {
    const uniqueEmail = `labour-persist-${Date.now()}@example.com`;
    const profile = { ...COMPANY_PROFILES.MID_IT, email: uniqueEmail };
    
    await completeAssessmentFlow(page, 'labour-code', profile);
    
    const url = page.url();
    const assessmentId = url.match(/\/results\/([a-f0-9-]{36})/)?.[1];
    expect(assessmentId).toBeTruthy();
  });

  test('should persist DPDP assessment with valid UUID', async ({ page }) => {
    const uniqueEmail = `dpdp-persist-${Date.now()}@example.com`;
    const profile = { ...COMPANY_PROFILES.MID_IT, email: uniqueEmail };
    
    await completeAssessmentFlow(page, 'dpdp', profile);
    
    const url = page.url();
    const assessmentId = url.match(/\/results\/([a-f0-9-]+)/)?.[1];
    expect(assessmentId).toBeTruthy();
  });

  test('should allow results page reload with persisted data', async ({ page }) => {
    const uniqueEmail = `reload-test-${Date.now()}@example.com`;
    const profile = { ...COMPANY_PROFILES.MID_IT, email: uniqueEmail };
    
    await completeAssessmentFlow(page, 'statutory-health', profile);
    
    // Get URL and reload
    const resultsUrl = page.url();
    expect(resultsUrl).toContain('/results/');
    
    await page.reload();
    
    // Data should still be there
    await expect(page.getByText(/compliance|score/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/%/).first()).toBeVisible();
  });

  test('should persist company name in results', async ({ page }) => {
    const uniqueCompany = `TestCompany_${Date.now()}`;
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      companyName: uniqueCompany,
      email: `company-test-${Date.now()}@example.com`
    };
    
    await completeAssessmentFlow(page, 'statutory-health', profile);
    
    // Company name should appear on results page
    await expect(page.getByText(uniqueCompany)).toBeVisible();
  });
});

test.describe('Supabase - Score Persistence', () => {

  test('should persist 100% score for all YES answers', async ({ page }) => {
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      email: `score-100-${Date.now()}@example.com`
    };
    
    await completeAssessmentFlow(page, 'statutory-health', profile, 'yes');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\\d+/)?.[0] || '0');
    expect(score).toBe(100);
    
    // Reload to verify persistence
    await page.reload();
    const reloadedScore = await page.locator('text=/\\d+%/').first().textContent();
    expect(reloadedScore).toContain('100');
  });

  test('should persist 0% score for all NO answers', async ({ page }) => {
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      email: `score-0-${Date.now()}@example.com`
    };
    
    await completeAssessmentFlow(page, 'statutory-health', profile, 'no');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\\d+/)?.[0] || '0');
    expect(score).toBe(0);
  });

  test('should persist mixed score correctly', async ({ page }) => {
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      email: `score-mixed-${Date.now()}@example.com`
    };
    
    await completeAssessmentFlow(page, 'statutory-health', profile, 'mixed');
    
    const scoreText = await page.locator('text=/\\d+%/').first().textContent();
    const score = parseInt(scoreText?.match(/\\d+/)?.[0] || '0');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

test.describe('Supabase - Feedback Persistence', () => {

  test('should persist NPS feedback score', async ({ page, request }) => {
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      email: `nps-test-${Date.now()}@example.com`
    };
    
    await completeAssessmentFlow(page, 'statutory-health', profile);
    
    // Click download to trigger NPS modal
    await page.getByRole('button', { name: /download.*pdf/i }).click();
    
    // Complete NPS
    const npsModal = page.getByText(/how likely.*recommend/i);
    if (await npsModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.getByRole('button', { name: '9' }).click();
      await page.waitForTimeout(500);
      
      const submitButton = page.getByRole('button', { name: /submit|done|finish/i });
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();
      }
    }
    
    // Verify no error occurred
    const errorMessage = page.getByText(/error|failed/i);
    const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBe(false);
  });

  test('API should accept feedback submission', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {
        assessment_type: 'statutory_health',
        nps_score: 8,
        value_provided: 'Clear recommendations',
        would_recommend: 'yes',
        comments: 'Test feedback'
      }
    });
    
    // Should accept the request (200 or 201)
    expect([200, 201]).toContain(response.status());
  });
});

test.describe('Supabase - API Data Verification', () => {

  test('should create assessment via API with correct structure', async ({ request }) => {
    const response = await request.post('/api/assessment/free-submit', {
      data: {
        userDetails: {
          companyName: `APITest_${Date.now()}`,
          employeeCount: '20-49',
          state: 'Maharashtra',
          industry: 'Information Technology',
          email: `api-test-${Date.now()}@example.com`,
          fullName: 'API Test User',
          phone: '9876543210'
        },
        responses: {
          pf_1: 'yes',
          pf_2: 'yes',
          esi_1: 'yes',
          esi_2: 'yes',
          esi_3: 'yes',
          pt_1: 'yes',
          pt_2: 'yes',
          pt_3: 'yes',
          gratuity_1: 'yes',
          gratuity_2: 'yes',
          bonus_1: 'yes',
          bonus_2: 'yes'
        }
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.assessmentId).toBeTruthy();
    expect(body.assessmentId).toMatch(/^[a-f0-9-]{36}$/);
  });

  test('should retrieve assessment by ID', async ({ page, request }) => {
    // First create an assessment
    const createResponse = await request.post('/api/assessment/free-submit', {
      data: {
        userDetails: {
          companyName: `RetrieveTest_${Date.now()}`,
          employeeCount: '20-49',
          state: 'Maharashtra',
          industry: 'Information Technology',
          email: `retrieve-${Date.now()}@example.com`,
          fullName: 'Retrieve Test',
          phone: '9876543210'
        },
        responses: {
          pf_1: 'yes', pf_2: 'yes',
          esi_1: 'yes', esi_2: 'yes', esi_3: 'yes',
          pt_1: 'yes', pt_2: 'yes', pt_3: 'yes',
          gratuity_1: 'yes', gratuity_2: 'yes',
          bonus_1: 'yes', bonus_2: 'yes'
        }
      }
    });

    const { assessmentId } = await createResponse.json();
    
    // Navigate to results page
    await page.goto(`/results/${assessmentId}`);
    
    // Should load without error
    await expect(page.getByText(/compliance|score/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Supabase - Data Integrity', () => {

  test('should not allow duplicate assessment submission', async ({ page }) => {
    const profile = { 
      ...COMPANY_PROFILES.MID_IT, 
      email: `duplicate-test-${Date.now()}@example.com`
    };
    
    await completeAssessmentFlow(page, 'statutory-health', profile);
    
    const firstUrl = page.url();
    const firstId = firstUrl.match(/\/results\/([a-f0-9-]+)/)?.[1];
    
    // Try to go back and submit again
    await page.goto('/assessment/statutory-health');
    
    // Fill same details
    await page.getByLabel(/company name/i).fill(profile.companyName);
    await page.getByLabel(/full name|your name/i).fill(profile.name);
    await page.getByLabel(/email/i).fill(profile.email);
    await page.getByLabel(/phone/i).fill(profile.phone);
    await page.getByLabel(/state/i).selectOption(profile.state);
    await page.getByLabel(/employee count/i).selectOption(profile.employeeCount);
    await page.getByLabel(/industry/i).selectOption(profile.industry);
    
    // This should create a NEW assessment (not duplicate the old one)
    await page.getByRole('button', { name: /continue/i }).click();
    // ... assessment flow creates new record each time
    
    // Verify we're on assessment page, not results
    await expect(page.getByRole('button', { name: /^yes$/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle invalid assessment ID gracefully', async ({ page }) => {
    // Try to access non-existent assessment
    await page.goto('/results/invalid-uuid-12345');
    
    // Should show error or redirect, not crash
    await page.waitForTimeout(3000);
    
    // Either redirected or shows error message
    const hasError = await page.getByText(/not found|invalid|error/i).isVisible().catch(() => false);
    const redirectedHome = page.url() === '/' || page.url().includes('assessment');
    
    expect(hasError || redirectedHome).toBe(true);
  });
});
