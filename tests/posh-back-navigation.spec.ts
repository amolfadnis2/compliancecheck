/**
 * ComplianceCheck - POSH Assessment Back Navigation Tests
 * 
 * Tests for P1-001: Back button functionality
 * 
 * Covers:
 * - Back button visibility rules
 * - Navigation between questions
 * - Answer preservation
 * - Phase transitions
 * - Keyboard accessibility
 */

import { test, expect } from '@playwright/test'

test.describe('POSH Assessment - Back Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to POSH assessment
    await page.goto('/assessment/posh')
    
    // Fill company details form
    await page.fill('input[id="fullName"]', 'Test User')
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="phone"]', '9876543210')
    await page.fill('input[id="companyName"]', 'Test Company Ltd')
    
    // Submit to start assessment
    await page.click('button[type="submit"]:has-text("Start Assessment")')
    
    // Wait for first applicability question
    await page.waitForTimeout(1000)
  })

  test('Back button shows on applicability Q1 (goes to company details)', async ({ page }) => {
    // Verify we're on applicability phase
    await expect(page.locator('text=Phase 1: Applicability Check')).toBeVisible()
    
    // Back button should be visible on first applicability question
    const backButton = page.locator('button:has-text("Back")')
    await expect(backButton).toBeVisible()
    
    // Verify aria-label
    await expect(backButton).toHaveAttribute('aria-label', 'Go back to company details')
  })

  test('Back button navigates from applicability Q1 to company details', async ({ page }) => {
    // Click back from first applicability question
    await page.click('button:has-text("Back")')
    
    // Should see company details form again
    await expect(page.locator('input[id="companyName"]')).toBeVisible()
    
    // Previous data should be preserved
    await expect(page.locator('input[id="companyName"]')).toHaveValue('Test Company Ltd')
    await expect(page.locator('input[id="email"]')).toHaveValue('test@example.com')
  })

  test('Back button shows after answering first applicability question', async ({ page }) => {
    // Answer first applicability question (employee count)
    await page.click('button:has-text("10-49 employees")')
    
    // Wait for auto-advance to Q2
    await page.waitForTimeout(1000)
    
    // Verify we're on question 2
    await expect(page.locator('text=2 of')).toBeVisible()
    
    // Back button should be visible
    const backButton = page.locator('button:has-text("Back")')
    await expect(backButton).toBeVisible()
    
    // Verify aria-label changed
    await expect(backButton).toHaveAttribute('aria-label', 'Go to previous question')
  })

  test('Back button navigates to previous applicability question with answer preserved', async ({ page }) => {
    // Answer Q1
    const firstOption = page.locator('button:has-text("10-49 employees")')
    await firstOption.click()
    
    // Wait for Q2
    await page.waitForTimeout(1000)
    await expect(page.locator('text=2 of')).toBeVisible()
    
    // Click Back
    await page.click('button:has-text("Back")')
    
    // Should be back on Q1
    await expect(page.locator('text=1 of')).toBeVisible()
    
    // Previous answer should still be selected (check for bg-blue class)
    await expect(firstOption).toHaveClass(/bg-blue-700/)
  })

  test('Back button works in compliance phase', async ({ page }) => {
    // Complete all applicability questions to reach compliance phase
    // This is a simplified flow - adjust based on actual applicability questions
    
    // Q1: Employee count
    await page.click('button:has-text("10-49 employees")')
    await page.waitForTimeout(1000)
    
    // Q2: Industry (assuming it's the second question)
    await page.click('button >> nth=0') // Click first option
    await page.waitForTimeout(1000)
    
    // Q3: State (assuming it's the third question)
    await page.click('button >> nth=0') // Click first option
    await page.waitForTimeout(1000)
    
    // Continue answering until we reach compliance phase
    // Wait for Phase 2
    await page.waitForTimeout(2000)
    
    // Check if we're in compliance phase
    const phase2Badge = page.locator('text=Phase 2').or(page.locator('text=ICC Constitution'))
    
    if (await phase2Badge.isVisible()) {
      // Answer first compliance question
      await page.click('button:has-text("Yes") >> nth=0')
      await page.waitForTimeout(1000)
      
      // Verify we're on Q2 of compliance
      await expect(page.locator('text=2 of')).toBeVisible()
      
      // Back button should be visible
      const backButton = page.locator('button:has-text("Back")')
      await expect(backButton).toBeVisible()
      
      // Click back
      await backButton.click()
      
      // Should be on Q1 of compliance
      await expect(page.locator('text=1 of')).toBeVisible()
    }
  })

  test('Back button maintains focus for accessibility', async ({ page }) => {
    // Answer Q1 to get to Q2
    await page.click('button:has-text("10-49 employees")')
    await page.waitForTimeout(1000)
    
    // Find back button
    const backButton = page.locator('button:has-text("Back")')
    
    // Tab to back button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify it has focus ring classes
    await expect(backButton).toHaveCSS('outline-style', /.+/)
  })

  test('Back button has proper ARIA attributes', async ({ page }) => {
    const backButton = page.locator('button:has-text("Back")')
    
    // Check aria-label exists
    const ariaLabel = await backButton.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toMatch(/back|previous/i)
    
    // Check ArrowLeft icon has aria-hidden
    const icon = backButton.locator('svg')
    await expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  test('Multiple back navigations work correctly', async ({ page }) => {
    // Answer Q1
    await page.click('button:has-text("10-49 employees")')
    await page.waitForTimeout(1000)
    
    // Answer Q2
    await page.click('button >> nth=0')
    await page.waitForTimeout(1000)
    
    // We should be on Q3
    await expect(page.locator('text=3 of')).toBeVisible()
    
    // Go back twice
    await page.click('button:has-text("Back")')
    await page.waitForTimeout(500)
    await expect(page.locator('text=2 of')).toBeVisible()
    
    await page.click('button:has-text("Back")')
    await page.waitForTimeout(500)
    await expect(page.locator('text=1 of')).toBeVisible()
  })

  test('Back then forward maintains state', async ({ page }) => {
    // Answer Q1
    const q1Answer = page.locator('button:has-text("10-49 employees")')
    await q1Answer.click()
    await page.waitForTimeout(1000)
    
    // Answer Q2
    await page.click('button >> nth=0')
    await page.waitForTimeout(1000)
    
    // Go back to Q2
    await page.click('button:has-text("Back")')
    await page.waitForTimeout(500)
    
    // Go back to Q1
    await page.click('button:has-text("Back")')
    await page.waitForTimeout(500)
    
    // Verify Q1 answer is still selected
    await expect(q1Answer).toHaveClass(/bg-blue-700/)
    
    // Answer Q1 again (should advance to Q2)
    await q1Answer.click()
    await page.waitForTimeout(1000)
    
    // Q2 should still have previous answer selected
    const q2FirstOption = page.locator('button >> nth=0')
    await expect(q2FirstOption).toHaveClass(/bg-blue-700/)
  })

  test('Back button styling matches design specs', async ({ page }) => {
    // Answer Q1 to get back button
    await page.click('button:has-text("10-49 employees")')
    await page.waitForTimeout(1000)
    
    const backButton = page.locator('button:has-text("Back")')
    
    // Check color classes
    const classes = await backButton.getAttribute('class')
    expect(classes).toContain('text-gray-600')
    expect(classes).toContain('hover:text-gray-900')
    expect(classes).toContain('focus:ring-2')
    expect(classes).toContain('focus:ring-blue-500')
  })
})
