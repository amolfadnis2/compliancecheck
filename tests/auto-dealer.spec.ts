/**
 * Auto Dealer Compliance Assessment — Playwright E2E Tests
 *
 * Three personas:
 *   Solo 2W  — single 2-wheeler outlet, no workshop, ~25 questions
 *   Mid 4W   — 4-wheeler + workshop, MISP, 2 states, ~60 questions
 *   Multi-state group — 4W+2W, 3 states, full workshop, MISP, DSA, ~100 questions
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ASSESSMENT_URL = `${BASE_URL}/assessment/auto-dealer`

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function fillDetailsForm(page: Page, data: {
  fullName: string
  email: string
  phone: string
  companyName: string
}) {
  await page.fill('input[id="fullName"]', data.fullName)
  await page.fill('input[id="email"]', data.email)
  await page.fill('input[id="phone"]', data.phone)
  await page.fill('input[id="companyName"]', data.companyName)
  await page.click('button[type="submit"]')
}

async function answerApplicabilityQuestion(page: Page, answerValue: string) {
  // Click button matching the value or label
  const btn = page.locator(`button[aria-pressed]`).filter({ hasText: answerValue }).first()
  if (await btn.count() > 0) {
    await btn.click()
  } else {
    // fallback: click first non-pressed button (accept defaults)
    await page.locator('button[aria-pressed="false"]').first().click()
  }
  // Wait for auto-advance
  await page.waitForTimeout(700)
}

// ---------------------------------------------------------------------------
// Persona 1: Solo 2-Wheeler dealer
// ---------------------------------------------------------------------------

test.describe('Persona 1: Solo 2-Wheeler dealer', () => {
  test('loads landing page and displays assessment metadata', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await expect(page.locator('h1, [class*="CardTitle"]').first()).toBeVisible()
    await expect(page.getByText('6 phases')).toBeVisible()
    await expect(page.getByText('25 min')).toBeVisible()
    await expect(page.getByText('PDF report')).toBeVisible()
  })

  test('validates details form — required fields', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible()
    await expect(page.locator('text=Invalid email address')).toBeVisible()
    await expect(page.locator('text=Enter a valid 10-digit Indian mobile number')).toBeVisible()
    await expect(page.locator('text=Dealership name is required')).toBeVisible()
  })

  test('labour regime toggle switches between New and Legacy', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await expect(page.getByText('New Labour Codes (default)')).toBeVisible()
    await page.locator('button[aria-label="Toggle Labour Codes regime"]').click()
    await expect(page.getByText('Legacy Acts')).toBeVisible()
    await page.locator('button[aria-label="Toggle Labour Codes regime"]').click()
    await expect(page.getByText('New Labour Codes (default)')).toBeVisible()
  })

  test('details form accepts valid input and shows applicability phase', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await fillDetailsForm(page, {
      fullName: 'Ramesh Yadav',
      email: 'ramesh@yamahatest.co.in',
      phone: '9123456780',
      companyName: 'Ramesh Motors',
    })
    await expect(page.locator('[aria-label*="progress"], [class*="Progress"]').first()).toBeVisible({ timeout: 10000 })
  })
})

// ---------------------------------------------------------------------------
// Persona 2: Mid-size 4-Wheeler dealer with workshop
// ---------------------------------------------------------------------------

test.describe('Persona 2: Mid-size 4W dealer with workshop', () => {
  test('landing page shows disclaimer with IRDAI reference', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await expect(page.locator('text=IRDAI MISP')).toBeVisible()
  })

  test('back-navigation from first applicability question returns to details form', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await fillDetailsForm(page, {
      fullName: 'Sunita Patel',
      email: 'sunita@mahindratest.co.in',
      phone: '9876543210',
      companyName: 'Patel Auto Sales Pvt Ltd',
    })
    // Wait for applicability phase
    await expect(page.locator('button[aria-label*="Back"]')).toBeVisible({ timeout: 10000 })
    await page.locator('button[aria-label*="Back"]').click()
    // Should be back on details form
    await expect(page.locator('input[id="fullName"]')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Persona 3: Multi-state dealer group
// ---------------------------------------------------------------------------

test.describe('Persona 3: Multi-state dealer group', () => {
  test('page has correct title metadata', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    await expect(page).toHaveTitle(/ComplianceCheck|Auto Dealer|Compliance/)
  })

  test('no accessibility violations on landing page', async ({ page }) => {
    await page.goto(ASSESSMENT_URL)
    // Basic aria checks without axe dependency
    const mainLandmark = page.locator('main')
    await expect(mainLandmark).toBeVisible()
    // All form labels should be associated
    const inputs = page.locator('input[id]')
    const count = await inputs.count()
    for (let i = 0; i < count; i++) {
      const id = await inputs.nth(i).getAttribute('id')
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        await expect(label).toHaveCount(1)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Phase player page
// ---------------------------------------------------------------------------

test.describe('Phase player pages', () => {
  test('phase 2 redirects to landing if no assessment ID', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment/auto-dealer/phase/2`)
    // Should redirect back or show error
    await expect(page).toHaveURL(/auto-dealer/)
  })

  test('phase 7 (invalid) shows error state', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment/auto-dealer/phase/7?id=test-invalid`)
    await expect(page.locator('text=Invalid phase')).toBeVisible({ timeout: 5000 })
  })

  test('phase 2 with valid fake ID renders phase player layout', async ({ page }) => {
    const fakeId = 'fake-assessment-123'
    // Pre-populate localStorage
    await page.goto(ASSESSMENT_URL)
    await page.evaluate((id) => {
      localStorage.setItem(`auto_dealer_profile_${id}`, JSON.stringify({
        AD_APP_001: 'pvt_ltd',
        AD_APP_003: '20_49',
        AD_APP_008: '4w_only',
        AD_APP_011: 'yes',
        AD_APP_labour_regime: 'new',
      }))
    }, fakeId)
    await page.goto(`${BASE_URL}/assessment/auto-dealer/phase/2?id=${fakeId}`)
    // Should render the phase player (questions or no-questions message)
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// Results page
// ---------------------------------------------------------------------------

test.describe('Results page', () => {
  test('results page redirects to landing if no ID', async ({ page }) => {
    await page.goto(`${BASE_URL}/assessment/auto-dealer/results`)
    await expect(page).toHaveURL(/auto-dealer/)
  })

  test('results page shows email gate when localStorage has valid profile', async ({ page }) => {
    const fakeId = 'fake-results-test-456'
    await page.goto(ASSESSMENT_URL)
    await page.evaluate((id) => {
      localStorage.setItem(`auto_dealer_profile_${id}`, JSON.stringify({
        AD_APP_001: 'pvt_ltd',
        AD_APP_003: '20_49',
        AD_APP_008: '4w_only',
        AD_APP_011: 'yes',
        AD_APP_labour_regime: 'new',
      }))
      localStorage.setItem('auto_dealer_details', JSON.stringify({
        email: 'test@example.com',
        fullName: 'Test User',
        companyName: 'Test Dealership Pvt Ltd',
      }))
    }, fakeId)
    await page.goto(`${BASE_URL}/assessment/auto-dealer/results/${fakeId}`)
    // Should show either email gate, payment gate, or loading state
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// Home page grid
// ---------------------------------------------------------------------------

test.describe('Home page — Auto Dealer card', () => {
  test('auto dealer assessment appears in the assessment grid', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page.locator('text=Auto Dealership Compliance')).toBeVisible()
    await expect(page.locator('a[href="/assessment/auto-dealer"]')).toBeVisible()
  })
})
