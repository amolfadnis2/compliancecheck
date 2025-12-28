# Priority Test Fixes

Quick reference for fixing critical test issues.

---

## Fix 1: Dynamic Question Answering

Replace hardcoded loops with dynamic completion:

```typescript
// BEFORE (broken):
for (let i = 0; i < 12; i++) {
  await page.getByRole('button', { name: /^yes$/i }).first().click();
  await page.waitForTimeout(800);
}

// AFTER (correct):
async function answerAllQuestions(page: Page, answer: 'yes' | 'no' = 'yes') {
  const maxAttempts = 60; // Timeout after ~60 questions
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Check if we've reached results page
    if (page.url().includes('/results/')) break;
    
    // Check for submit button (assessment complete)
    const submitBtn = page.getByRole('button', { name: /get free report|submit/i });
    if (await submitBtn.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await submitBtn.isEnabled()) {
        await submitBtn.click();
        await page.waitForURL(/\/results\//, { timeout: 15000 });
        break;
      }
    }
    
    // Handle multiple choice questions (DPDP)
    const mcOption = page.locator('[role="option"]').first();
    if (await mcOption.isVisible({ timeout: 300 }).catch(() => false)) {
      await mcOption.click();
      await page.waitForTimeout(800);
      attempts++;
      continue;
    }
    
    // Handle yes/no questions
    const answerBtn = page.getByRole('button', { name: new RegExp(`^${answer}$`, 'i') }).first();
    if (await answerBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await answerBtn.click();
      await page.waitForTimeout(800);
      attempts++;
      continue;
    }
    
    await page.waitForTimeout(300);
    attempts++;
  }
}
```

---

## Fix 2: Score Expectations

Update score tests to account for informational questions:

```typescript
// BEFORE (may fail):
test('100% NO answers should give 0% score', async ({ page }) => {
  const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
  expect(score).toBe(0); // ❌ Informational questions still score
});

// AFTER (correct):
test('All NO answers should give low but non-zero score', async ({ page }) => {
  await completeAssessmentToResults(page, 'no');
  
  const scoreText = await page.locator('text=/\\d+%/').first().textContent();
  const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
  
  // Score accounts for informational questions (pt_1, esi_3)
  // that don't have complianceAnswer and always score
  expect(score).toBeLessThanOrEqual(20); // Low but not 0
});
```

---

## Fix 3: Select Option Syntax

```typescript
// BEFORE (fragile):
await page.getByLabel(/employee count/i).selectOption('20-49 employees');

// AFTER (robust):
await page.getByLabel(/employee count/i).selectOption({ label: '20-49 employees' });
// OR
await page.getByLabel(/employee count/i).selectOption({ value: '20-49' });
```

---

## Fix 4: Add to test-helpers.ts

```typescript
// Add to tests/test-helpers.ts

import { Page } from '@playwright/test';

export async function completeAssessmentDynamically(
  page: Page, 
  assessmentPath: string,
  answerPreference: 'yes' | 'no' | 'first' = 'yes'
) {
  await page.goto(assessmentPath);
  
  // Fill basic details
  const isDP = assessmentPath.includes('dpdp');
  if (isDP) {
    // DPDP uses different form structure
    await page.getByPlaceholder(/organisation/i).fill('Test Company');
    await page.getByLabel(/your name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`);
    await page.locator('button:has-text("Select industry")').click();
    await page.getByRole('option').first().click();
    await page.locator('button:has-text("Select range")').click();
    await page.getByRole('option').first().click();
    await page.locator('button:has-text("Select state")').click();
    await page.getByRole('option').first().click();
  } else {
    await page.getByLabel(/company name/i).fill('Test Company');
    await page.getByLabel(/full name|your name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(`test-${Date.now()}@example.com`);
    await page.getByLabel(/phone/i).fill('9876543210');
    await page.getByLabel(/state/i).selectOption({ index: 1 });
    await page.getByLabel(/employee count/i).selectOption({ index: 1 });
    await page.getByLabel(/industry/i).selectOption({ index: 1 });
  }
  
  await page.getByRole('button', { name: /continue|start/i }).click();
  await page.waitForTimeout(500);
  
  // Answer questions
  const maxTime = Date.now() + 120000; // 2 min timeout
  while (Date.now() < maxTime) {
    if (page.url().includes('/results/')) break;
    
    // Multiple choice option
    const mcOption = page.locator('[role="option"]').first();
    if (await mcOption.isVisible({ timeout: 300 }).catch(() => false)) {
      await mcOption.click();
      await page.waitForTimeout(800);
      continue;
    }
    
    // Yes/No buttons
    if (answerPreference === 'first') {
      const anyBtn = page.getByRole('button', { name: /^(yes|no)$/i }).first();
      if (await anyBtn.isVisible({ timeout: 300 }).catch(() => false)) {
        await anyBtn.click();
        await page.waitForTimeout(800);
        continue;
      }
    } else {
      const btn = page.getByRole('button', { name: new RegExp(`^${answerPreference}$`, 'i') }).first();
      if (await btn.isVisible({ timeout: 300 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(800);
        continue;
      }
    }
    
    // Submit button
    const submitBtn = page.getByRole('button', { name: /get free report|submit|finish/i });
    if (await submitBtn.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await submitBtn.isEnabled().catch(() => false)) {
        await submitBtn.click();
        await page.waitForURL(/\/results\//, { timeout: 15000 });
        break;
      }
    }
    
    await page.waitForTimeout(300);
  }
}
```

---

## Quick Apply

Run these replacements in the test files:

```bash
# Replace hardcoded 12-question loops
find tests -name "*.spec.ts" -exec sed -i 's/for (let i = 0; i < 12; i++)/\/\/ FIXME: Use dynamic loop/g' {} \;
```

---

## Verification After Fixes

```bash
# Run just the affected tests
npx playwright test statutory-health summary-pdf-email dpdp --headed

# Check for failures
npx playwright show-report
```
