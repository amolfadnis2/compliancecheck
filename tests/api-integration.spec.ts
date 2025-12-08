import { test, expect } from '@playwright/test';

/**
 * API and Integration Tests
 */

test.describe('API Endpoint Tests', () => {

  test('POST /api/assessment/free-submit should accept valid assessment', async ({ request }) => {
    const response = await request.post('/api/assessment/free-submit', {
      data: {
        userDetails: {
          companyName: 'API Test Company',
          employeeCount: '20-49',
          state: 'Maharashtra',
          email: 'api-test@example.com'
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
  });

  test('POST /api/feedback should accept valid NPS feedback', async ({ request }) => {
    const response = await request.post('/api/feedback', {
      data: {
        assessment_type: 'statutory_health',
        nps_score: 8,
        value_provided: 'Clear and actionable',
        would_recommend: 'yes'
      }
    });

    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Database Integration Tests', () => {

  test('should persist assessment to database', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    
    await page.getByLabel(/full name/i).fill('DB Test User');
    await page.getByLabel(/email/i).fill('db@test.com');
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/company name/i).fill('DB Test Co');
    await page.getByLabel(/state/i).selectOption('Maharashtra');
    await page.getByLabel(/employee count/i).selectOption('20-49 employees');
    await page.getByLabel(/industry/i).selectOption('Information Technology');
    await page.getByRole('button', { name: /continue to assessment/i }).click();
    
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(800);
      await page.getByRole('button', { name: /^yes$/i }).first().click();
      await page.waitForTimeout(800);
    }
    
    await page.getByRole('button', { name: /get free report/i }).click();
    await page.waitForURL(/\/results\/[a-f0-9-]+/, { timeout: 10000 });
    
    const url = page.url();
    const assessmentId = url.match(/\/results\/([a-f0-9-]+)/)?.[1];
    expect(assessmentId).toBeTruthy();
    expect(assessmentId).toMatch(/^[a-f0-9-]{36}$/);
  });
});

test.describe('Error Handling Tests', () => {

  test('should validate email format', async ({ page }) => {
    await page.goto('/assessment/statutory-health');
    
    await page.getByLabel(/full name/i).fill('Validation Test');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/company name/i).fill('Test');
    await page.getByLabel(/state/i).selectOption('Delhi');
    await page.getByLabel(/employee count/i).selectOption('10-19 employees');
    await page.getByLabel(/industry/i).selectOption('Information Technology');
    await page.getByRole('button', { name: /continue to assessment/i }).click();
    
    await expect(page.getByText(/invalid.*email|valid.*email/i)).toBeVisible();
  });
});
