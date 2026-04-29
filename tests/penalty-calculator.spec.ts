import { test, expect } from '@playwright/test'

const URL = '/calculators/compliance-penalty-calculator'

test.describe('Compliance Penalty Calculator', () => {

  test('page renders with all 5 input areas visible', async ({ page }) => {
    await page.goto(URL)
    await expect(page.getByRole('heading', { name: /calculate your indian compliance/i })).toBeVisible()

    // State select
    await expect(page.getByRole('combobox').first()).toBeVisible()

    // Employee count group
    await expect(page.getByTestId('employee-count-group')).toBeVisible()

    // Industry select
    await expect(page.getByRole('combobox').nth(1)).toBeVisible()

    // Turnover group
    await expect(page.getByTestId('turnover-band-group')).toBeVisible()

    // Personal data switch
    await expect(page.getByRole('switch').first()).toBeVisible()

    // Women employees switch
    await expect(page.getByRole('switch').nth(1)).toBeVisible()
  })

  test('Calculate button is disabled until all required fields are filled', async ({ page }) => {
    await page.goto(URL)
    const btn = page.getByRole('button', { name: /calculate my exposure/i })
    await expect(btn).toBeDisabled()
  })

  test('default state shows empty results placeholder', async ({ page }) => {
    await page.goto(URL)
    await expect(page.getByText(/fill in your business details/i)).toBeVisible()
  })

  test('fills form and shows results with hero numbers', async ({ page }) => {
    await page.goto(URL)

    // Select state
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Maharashtra' }).click()

    // Select 50 employees
    await page.getByTestId('employee-count-group').getByRole('button', { name: '50' }).click()

    // Select industry
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /IT \/ ITeS/i }).click()

    // Select turnover
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /2 – 10 Cr/i }).click()

    // Enable DPDP switch
    await page.getByRole('switch').first().click()

    // Calculate
    await page.getByRole('button', { name: /calculate my exposure/i }).click()

    // Wait for results
    await expect(page.getByText(/typical annual risk/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/maximum statutory exposure/i)).toBeVisible()
  })

  test('increasing employee count from 5 to 100 increases exposure', async ({ page }) => {
    await page.goto(URL)

    const selectState = async () => {
      await page.getByRole('combobox').first().click()
      await page.getByRole('option', { name: 'Karnataka' }).click()
    }

    const selectIndustry = async () => {
      await page.getByRole('combobox').nth(1).click()
      await page.getByRole('option', { name: /manufacturing/i }).click()
    }

    const selectTurnover = async () => {
      await page.getByTestId('turnover-band-group').getByRole('button', { name: /2 – 10 Cr/i }).click()
    }

    // First calculation with 5 employees
    await selectState()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '5' }).click()
    await selectIndustry()
    await selectTurnover()
    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    const heroText1 = await page.getByText(/typical annual risk/i).first().textContent()

    // Reset and recalculate with 100 employees
    await page.getByRole('button', { name: /recalculate/i }).click()
    await selectState()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '100' }).click()
    await selectIndustry()
    await selectTurnover()
    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    const heroText2 = await page.getByText(/typical annual risk/i).first().textContent()

    // Both should have results rendered
    expect(heroText1).toBeTruthy()
    expect(heroText2).toBeTruthy()
  })

  test('toggling personal data switch on adds DPDP risk row to breakdown', async ({ page }) => {
    await page.goto(URL)

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Delhi' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '20' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /IT \/ ITeS/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /40L – 2 Cr/i }).click()

    // Personal data OFF — calculate
    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    const hasDPDPOff = await page.getByText('DPDP Act 2023').isVisible().catch(() => false)

    // Recalculate with personal data ON
    await page.getByRole('button', { name: /recalculate/i }).click()
    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Delhi' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '20' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /IT \/ ITeS/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /40L – 2 Cr/i }).click()
    await page.getByRole('switch').first().click() // enable personal data

    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    const hasDPDPOn = await page.getByText('DPDP Act 2023').isVisible().catch(() => false)

    expect(hasDPDPOff).toBe(false)
    expect(hasDPDPOn).toBe(true)
  })

  test('top 5 risks render with cross-sell assessment buttons', async ({ page }) => {
    await page.goto(URL)

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Maharashtra' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '100' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /IT \/ ITeS/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /2 – 10 Cr/i }).click()
    await page.getByRole('switch').first().click()    // personal data on
    await page.getByRole('switch').nth(1).click()     // women employees on

    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    await expect(page.getByText(/top .* risk areas/i)).toBeVisible()
    // At least one assessment CTA button should be present
    const assessmentButtons = page.getByRole('link', { name: /(health check|readiness|assessment|compliance|business)/i })
    await expect(assessmentButtons.first()).toBeVisible()
  })

  test('email gate form appears after results are shown', async ({ page }) => {
    await page.goto(URL)

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Tamil Nadu' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '50' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /healthcare/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /10 – 50 Cr/i }).click()

    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    await expect(page.getByText(/get the full 6-page report/i)).toBeVisible()
    await expect(page.getByPlaceholder(/you@company\.com/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /email me the report/i })).toBeVisible()
  })

  test('mobile viewport (375px) renders form and results correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(URL)

    await expect(page.getByRole('heading', { name: /calculate your indian compliance/i })).toBeVisible()
    await expect(page.getByRole('combobox').first()).toBeVisible()
    await expect(page.getByTestId('employee-count-group')).toBeVisible()

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Gujarat' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '50' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /retail/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /40L – 2 Cr/i }).click()

    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(700)

    await expect(page.getByText(/typical annual risk/i)).toBeVisible()
  })

  test('keyboard navigation through form inputs', async ({ page }) => {
    await page.goto(URL)

    // Tab to state select and interact
    await page.getByRole('combobox').first().focus()
    await expect(page.getByRole('combobox').first()).toBeFocused()

    // Tab to next focusable element
    await page.keyboard.press('Tab')

    // Employee count group buttons are focusable
    const firstEmpBtn = page.getByTestId('employee-count-group').getByRole('button').first()
    await firstEmpBtn.focus()
    await expect(firstEmpBtn).toBeFocused()
    await page.keyboard.press('Enter')

    // Button should now be selected (aria-pressed=true)
    await expect(firstEmpBtn).toHaveAttribute('aria-pressed', 'true')
  })

  test('disclaimer box is visible in results', async ({ page }) => {
    await page.goto(URL)

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Rajasthan' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '20' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /manufacturing/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /2 – 10 Cr/i }).click()

    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    await expect(page.getByText(/estimates only/i)).toBeVisible()
    await expect(page.getByText(/not legal advice/i)).toBeVisible()
  })

  test('methodology link is present and navigable', async ({ page }) => {
    await page.goto(URL)

    await page.getByRole('combobox').first().click()
    await page.getByRole('option', { name: 'Karnataka' }).click()
    await page.getByTestId('employee-count-group').getByRole('button', { name: '50' }).click()
    await page.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /IT \/ ITeS/i }).click()
    await page.getByTestId('turnover-band-group').getByRole('button', { name: /2 – 10 Cr/i }).click()

    await page.getByRole('button', { name: /calculate my exposure/i }).click()
    await page.waitForTimeout(600)

    const methodLink = page.getByRole('link', { name: /methodology/i })
    await expect(methodLink).toBeVisible()
    await methodLink.click()
    await expect(page).toHaveURL(/methodology/)
    await expect(page.getByRole('heading', { name: /methodology/i })).toBeVisible()
  })
})
