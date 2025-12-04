import { Page } from '@playwright/test';

/**
 * Helper function to select from shadcn/ui Select component
 * These are custom dropdowns, not native <select> elements
 */
export async function selectShadcnOption(page: Page, label: string | RegExp, value: string) {
  // Click the combobox trigger to open dropdown
  await page.getByLabel(label).click();
  await page.waitForTimeout(300);
  
  // Click the option from the dropdown menu
  await page.getByRole('option', { name: new RegExp(value, 'i') }).click();
  await page.waitForTimeout(200);
}

/**
 * Alternative: Select by text content when role="option" doesn't work
 */
export async function selectByText(page: Page, label: string | RegExp, text: string) {
  await page.getByLabel(label).click();
  await page.waitForTimeout(300);
  await page.getByText(text, { exact: true }).click();
  await page.waitForTimeout(200);
}
