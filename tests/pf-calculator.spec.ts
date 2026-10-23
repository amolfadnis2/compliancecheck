import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * PF calculator (/calculator/pf) end-to-end.
 *
 * PostHog network calls are stubbed; events are asserted through the
 * window.__pfEvents seam in src/lib/analytics/pf-events.ts.
 * Run: BASE_URL=<preview or http://localhost:3000> npx playwright test pf-calculator --project=chromium
 */

const PATH = '/calculator/pf'

type PfEvent = { event: string; properties: Record<string, unknown> }

async function open(page: Page, query = '', opts: { theme?: 'light' | 'dark' } = {}) {
  await page.route(/posthog\.com|\/ingest\/|\/flags\/|\/decide\//, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))
  await page.addInitScript((theme) => {
    ;(window as unknown as { __pfEvents: unknown[] }).__pfEvents = []
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, opts.theme ?? 'light')
  await page.goto(`${PATH}${query}`)
  await expect(page.getByTestId('pf-headline')).toContainText('your PF could grow to')
}

const events = (page: Page) => page.evaluate(() => (window as unknown as { __pfEvents: PfEvent[] }).__pfEvents)
const tableRow = (page: Page, i: number) => page.getByTestId('pf-year-table').locator('tbody tr').nth(i)
const callouts = (page: Page) => page.locator('[data-callout]').evaluateAll((n) => n.map((x) => (x as HTMLElement).dataset.callout))
const openMoreOptions = (page: Page) => page.locator('summary', { hasText: 'More options' }).click()

test.describe('PF calculator', () => {
  test('default render: headline, chart, table, sources', async ({ page }) => {
    await open(page)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('PF calculator with salary hikes')
    await expect(page.getByTestId('pf-headline')).toContainText('By 58')
    await expect(page.locator('svg.recharts-surface')).toBeVisible()
    await expect(page.getByTestId('pf-year-table').locator('tbody tr')).toHaveCount(31)
    await expect(page.getByTestId('pf-last-updated')).toContainText('Last updated')
    await expect(page.getByRole('cell', { name: 'Future rate (your choice)' })).toBeVisible()
    // Full Basic is the default and sits outside More options.
    await expect(page.getByRole('button', { name: /Full Basic/ })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: /Full Basic/ })).toBeVisible()
    expect(await callouts(page)).not.toContain('cap_freeze')
  })

  test('hike and appraisal month update the table', async ({ page }) => {
    await open(page)
    const before = await tableRow(page, 1).innerText()
    await page.getByLabel('Salary hike each year').fill('15')
    await expect(tableRow(page, 1)).not.toHaveText(before)
    const afterHike = await tableRow(page, 1).innerText()
    await page.getByLabel('Appraisal month').selectOption('10')
    await expect(tableRow(page, 1)).not.toHaveText(afterHike)
  })

  test('capped vs full Basic shows and hides the cap-freeze callout', async ({ page }) => {
    await open(page)
    await expect(page.locator('[data-callout="cap_freeze"]')).toHaveCount(0)
    await page.getByRole('button', { name: /Capped wage/ }).click()
    await expect(page.locator('[data-callout="cap_freeze"]')).toHaveCount(1)
    await expect(page).toHaveURL(/bs=capped/)
    await page.getByRole('button', { name: /Full Basic/ }).click()
    await expect(page.locator('[data-callout="cap_freeze"]')).toHaveCount(0)
  })

  test('EPS ceiling reading changes the pension', async ({ page }) => {
    await open(page)
    await openMoreOptions(page)
    const before = await page.getByTestId('pf-pension').innerText()
    await page.getByLabel(/EPS wage ceiling after/).selectOption('15000')
    await expect(page.getByTestId('pf-pension')).not.toHaveText(before)
  })

  test('URL state round-trips', async ({ page, context }) => {
    await open(page)
    await page.getByLabel('Monthly Basic + DA').fill('55000')
    await page.getByLabel('Salary hike each year').fill('10')
    await expect(page).toHaveURL(/b=55000/)
    await expect(page).toHaveURL(/h=10/)
    const headline = await page.getByTestId('pf-headline').innerText()
    const second = await context.newPage()
    await open(second, new URL(page.url()).search)
    await expect(second.getByTestId('pf-headline')).toHaveText(headline)
    await expect(second.getByLabel('Monthly Basic + DA')).toHaveValue('55,000')
  })

  test('share link restores state', async ({ page, context }) => {
    await open(page, '?b=61000&h=9')
    const headline = await page.getByTestId('pf-headline').innerText()
    await page.getByRole('button', { name: 'Share', exact: true }).click()
    const link = page.getByLabel('Share link (valid for 90 days)')
    const failed = page.getByText('Couldn’t create a link right now')
    await expect(link.or(failed)).toBeVisible()
    test.skip(await failed.isVisible(), 'Supabase unreachable from this environment')
    const url = await link.inputValue()
    expect(url).toMatch(/\/calculator\/pf\?s=[A-Za-z0-9_-]{8,}/)
    const second = await context.newPage()
    await open(second, new URL(url).search)
    await expect(second.getByTestId('pf-headline')).toHaveText(headline)
  })

  test('PDF and CSV download', async ({ page }) => {
    await open(page)
    const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download CSV' }).click()])
    expect(csv.suggestedFilename()).toMatch(/^pf-forecast-.*\.csv$/)
    // pf_pdf_gate: 'none' downloads straight away; 'optional' shows a skippable email step (dialog loads lazily).
    const download = page.waitForEvent('download', { timeout: 30000 })
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const skip = page.getByRole('button', { name: 'Skip and download' })
    await Promise.race([skip.waitFor({ timeout: 10000 }).then(() => skip.click()).catch(() => {}), download])
    const pdf = await download
    expect(pdf.suggestedFilename()).toMatch(/^pf-forecast-.*\.pdf$/)
  })

  test('lead form requires consent', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Download PDF' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Email').fill('test@example.com')
    await dialog.getByRole('button', { name: /Email me and download/ }).click()
    await expect(dialog.getByText('Tick the box to agree before we store your email.')).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy')
    await expect(dialog).toContainText('Withdraw consent')
  })

  test('keyboard-only completion', async ({ page }) => {
    await open(page)
    const age = page.getByLabel('Your age')
    await age.focus()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('35')
    await page.keyboard.press('Tab') // Retire at
    await page.keyboard.press('Tab') // Basic
    await page.keyboard.press('Control+A')
    await page.keyboard.type('30000')
    await expect(page.getByTestId('pf-headline')).toContainText('By 58')
    // Segmented controls are buttons: reachable by Tab, operable with Enter, state in aria-pressed.
    const high = page.getByRole('button', { name: /8\.50%\s*High/ })
    await high.focus()
    await page.keyboard.press('Enter')
    await expect(high).toHaveAttribute('aria-pressed', 'true')
    await expect(page).toHaveURL(/sc=optimistic/)
    // More options opens from the keyboard.
    await page.locator('summary', { hasText: 'More options' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByLabel('EPS service so far (years)')).toBeVisible()
  })

  test('inline validation is announced and linked', async ({ page }) => {
    await open(page)
    const age = page.getByLabel('Your age')
    await age.fill('70')
    await expect(age).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await age.getAttribute('aria-describedby')
    await expect(page.locator(`#${describedBy!.split(' ').pop()!.replace(/:/g, '\\:')}`)).toHaveText('Enter an age between 18 and 57.')
  })

  test('390 px mobile viewport has no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page)
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }))
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
    const box = await page.getByRole('button', { name: /8\.25%\s*Current/ }).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('dark mode renders', async ({ page }) => {
    await open(page, '', { theme: 'dark' })
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.locator('svg.recharts-surface')).toBeVisible()
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`axe: no serious or critical violations (${theme})`, async ({ page }) => {
      await open(page, '', { theme })
      await openMoreOptions(page)
      await expect(page.locator('svg.recharts-surface')).toBeVisible()
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).include('main').analyze()
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(bad.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([])
    })
  }

  test('PostHog events are sent with common props and no PII', async ({ page }) => {
    await open(page)
    await page.getByLabel('Salary hike each year').fill('12')
    await expect.poll(async () => (await events(page)).map((e) => e.event)).toContain('pf_inputs_changed')
    await page.getByRole('button', { name: 'Today’s ₹' }).click()
    await openMoreOptions(page)
    await page.getByRole('link', { name: 'Gratuity calculator' }).evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()))
    await page.getByRole('link', { name: 'Gratuity calculator' }).click()

    const all = await events(page)
    const names = all.map((e) => e.event)
    for (const name of ['pf_calculator_viewed', 'pf_calculation_completed', 'pf_inputs_changed', 'pf_view_toggled', 'pf_advanced_opened', 'pf_cross_link_clicked']) {
      expect(names).toContain(name)
    }
    const changed = all.find((e) => e.event === 'pf_inputs_changed')!
    expect(changed.properties).toMatchObject({ fields_changed: ['hikePct'], salary_band: '25k-50k', hike_pct: 12 })
    for (const e of all) {
      expect(e.properties.calc_version).toBe('1.0.0')
      expect(e.properties.params_version).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const k of Object.keys(e.properties)) expect(/email|name|phone|salary|balance/i.test(k) && k !== 'salary_band', `${e.event}.${k}`).toBe(false)
      expect(JSON.stringify(e.properties)).not.toContain('40000')
    }
  })
})
