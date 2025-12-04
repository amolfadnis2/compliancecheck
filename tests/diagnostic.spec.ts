import { test } from '@playwright/test';

/**
 * DIAGNOSTIC TEST
 * Run this to see your actual form structure
 * Run with: npx playwright test diagnostic --headed
 */

test('DIAGNOSTIC: Show Labour Code form structure', async ({ page }) => {
  await page.goto('/assessment/labour-code');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Get all form elements
  const formHTML = await page.locator('form, main').first().innerHTML();
  console.log('=== FORM HTML ===');
  console.log(formHTML);
  
  // Get all labels
  const labels = await page.locator('label, text=/employee count/i').all();
  console.log('\n=== LABELS FOUND ===');
  for (let i = 0; i < labels.length; i++) {
    const text = await labels[i].textContent();
    console.log(`${i}: "${text}"`);
  }
  
  // Get all buttons
  const buttons = await page.locator('button').all();
  console.log('\n=== BUTTONS FOUND ===');
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    const isDisabled = await buttons[i].isDisabled();
    console.log(`${i}: "${text}" - Disabled: ${isDisabled}`);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'labour-code-form.png', fullPage: true });
  console.log('\n✅ Screenshot saved to: labour-code-form.png');
  
  // Pause to let you inspect
  await page.pause();
});
