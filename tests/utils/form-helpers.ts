import { Page } from '@playwright/test';

/**
 * Helper to select from shadcn/ui Select components (Radix UI based)
 * These are NOT native HTML select elements, they use button+listbox pattern
 */
export async function selectFromDropdown(
  page: Page,
  fieldIdentifier: string | RegExp,
  optionText: string | RegExp
): Promise<boolean> {
  try {
    // Approach 1: Find combobox by placeholder text
    const comboboxes = page.getByRole('combobox');
    const count = await comboboxes.count();
    
    for (let i = 0; i < count; i++) {
      const cb = comboboxes.nth(i);
      const text = await cb.textContent().catch(() => '');
      const placeholder = await cb.getAttribute('data-placeholder').catch(() => '');
      const ariaLabel = await cb.getAttribute('aria-label').catch(() => '');
      
      const pattern = typeof fieldIdentifier === 'string' 
        ? new RegExp(fieldIdentifier, 'i') 
        : fieldIdentifier;
      
      if (pattern.test(text || '') || pattern.test(placeholder || '') || pattern.test(ariaLabel || '')) {
        await cb.click();
        await page.waitForTimeout(300);
        
        const optionPattern = typeof optionText === 'string' 
          ? new RegExp(optionText, 'i') 
          : optionText;
        
        const option = page.getByRole('option').filter({ hasText: optionPattern }).first();
        if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
          await option.click();
          await page.waitForTimeout(200);
          return true;
        }
      }
    }
    
    // Approach 2: Find by label association
    const label = page.locator('label').filter({ 
      hasText: typeof fieldIdentifier === 'string' ? new RegExp(fieldIdentifier, 'i') : fieldIdentifier 
    }).first();
    
    if (await label.isVisible().catch(() => false)) {
      const container = label.locator('..').first();
      const trigger = container.getByRole('combobox').first();
      
      await trigger.click();
      await page.waitForTimeout(300);
      
      const option = page.getByRole('option').filter({ hasText: optionText }).first();
      await option.click();
      await page.waitForTimeout(200);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Failed to select from dropdown: ${fieldIdentifier}`, error);
    return false;
  }
}

/**
 * Fill company details form used across all assessments
 */
export async function fillCompanyDetails(
  page: Page,
  profile: {
    name?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    state?: string;
    employeeCount?: string;
    industry?: string;
  }
): Promise<void> {
  // Text inputs
  if (profile.name) {
    await page.getByLabel(/full name|your name/i).fill(profile.name).catch(() => {});
  }
  if (profile.email) {
    await page.getByLabel(/email/i).fill(profile.email).catch(() => {});
  }
  if (profile.phone) {
    await page.getByLabel(/phone/i).fill(profile.phone).catch(() => {});
  }
  if (profile.companyName) {
    await page.getByLabel(/company name/i).fill(profile.companyName).catch(() => {});
  }
  
  // Dropdowns (shadcn/ui Select components)
  if (profile.state) {
    await selectFromDropdown(page, /state|select.*state/i, profile.state);
  }
  if (profile.employeeCount) {
    await selectFromDropdown(page, /employee|select.*employee/i, profile.employeeCount);
  }
  if (profile.industry) {
    await selectFromDropdown(page, /industry|select.*industry/i, profile.industry);
  }
}

/**
 * Answer all questions with specified answer (yes/no)
 */
export async function answerAllQuestions(
  page: Page,
  answer: 'yes' | 'no' = 'yes',
  maxQuestions = 30,
  timeoutMs = 90000
): Promise<{ success: boolean; questionCount: number }> {
  const startTime = Date.now();
  let questionCount = 0;
  
  while (questionCount < maxQuestions && (Date.now() - startTime) < timeoutMs) {
    // Check if we've reached results page
    if (page.url().includes('/results/')) {
      return { success: true, questionCount };
    }
    
    // Try to find and click the answer button
    const answerButton = page.getByRole('button', { name: new RegExp(`^${answer}$`, 'i') }).first();
    if (await answerButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await answerButton.click();
      questionCount++;
      await page.waitForTimeout(1000);
      continue;
    }
    
    // Check for submit button
    const submitButton = page.getByRole('button', { name: /get free report|submit|generate/i });
    if (await submitButton.isVisible({ timeout: 300 }).catch(() => false)) {
      if (await submitButton.isEnabled().catch(() => false)) {
        await submitButton.click();
        await page.waitForURL(/\/results\//, { timeout: 15000 }).catch(() => {});
        return { success: true, questionCount };
      }
    }
    
    await page.waitForTimeout(500);
  }
  
  return { success: false, questionCount };
}
