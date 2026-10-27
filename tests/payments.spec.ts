import { test, expect, type APIRequestContext } from '@playwright/test'
import { ASSESSMENT_TYPES, ASSESSMENT_PRICES, type AssessmentType } from '../src/lib/constants/assessment-types'

/**
 * Paywall end-to-end.
 *
 * "public" tests need only a running app (no DB): pricing copy, sample
 * reports, free calculators, the save-failed guard and the webhook guard.
 *
 * "paid flow" tests create REAL assessment rows through the submit APIs and
 * unlock them with a promo code, so they only run when E2E_PROMO_CODE is set
 * and BASE_URL points at a deployment with Supabase configured (e.g. a Netlify
 * deploy preview). They write rows — never point them at production casually.
 */

const priceLabel = (type: AssessmentType) =>
  `₹${Math.round(ASSESSMENT_PRICES[type].amountPaise / 100).toLocaleString('en-IN')}`

const LANDING: [AssessmentType, string][] = [
  [ASSESSMENT_TYPES.STATUTORY_HEALTH, 'statutory-health-check'],
  [ASSESSMENT_TYPES.LABOUR_CODE, 'labour-code-readiness'],
  [ASSESSMENT_TYPES.DPDP, 'dpdp-gap-assessment'],
  [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE, 'state-wise-compliance'],
  [ASSESSMENT_TYPES.FOOD_BUSINESS, 'restaurant-food-business'],
  [ASSESSMENT_TYPES.POSH, 'posh-act-compliance'],
  [ASSESSMENT_TYPES.AUTO_DEALER, 'auto-dealer-compliance'],
]

test.describe('paywall — public', () => {
  for (const [type, slug] of LANDING) {
    test(`${slug} landing shows the live price and no beta copy`, async ({ page }) => {
      await page.goto(`/assessments/landing/${slug}`)
      await expect(page.getByText('Free summary - pay only to unlock the full report')).toBeVisible()
      await expect(page.getByText(priceLabel(type)).first()).toBeVisible()
      await expect(page.getByText(/free during (beta|early access)|post-beta/i)).toHaveCount(0)
    })
  }

  test('home page lists every assessment price with no early-access badge', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#assessments')
    for (const [type] of LANDING) {
      await expect(section.getByText(`Full report: ${priceLabel(type)}`).first()).toBeVisible()
    }
    await expect(section.getByText(/early access/i)).toHaveCount(0)
  })

  for (const slug of ['statutory-health', 'dpdp', 'posh', 'labour-code', 'state-wise-compliance', 'food-business']) {
    test(`sample report ${slug} is a PDF`, async ({ request }) => {
      const res = await request.get(`/api/sample-report/${slug}`)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toContain('application/pdf')
    })
  }

  for (const path of ['/calculator/gratuity', '/calculator/pf', '/calculator/ctc', '/calculators/compliance-penalty-calculator']) {
    test(`free calculator ${path} has no paywall`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByText(/Pay ₹[\d,]+ & Unlock/)).toHaveCount(0)
      await expect(page.getByText('Unlock your full compliance report')).toHaveCount(0)
    })
  }

  for (const type of [
    ASSESSMENT_TYPES.STATUTORY_HEALTH,
    ASSESSMENT_TYPES.LABOUR_CODE,
    ASSESSMENT_TYPES.DPDP,
    ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
    ASSESSMENT_TYPES.FOOD_BUSINESS,
  ]) {
    test(`${type}: a local_ fallback id never shows a free report`, async ({ page }) => {
      await page.goto(`/results/local_${Date.now()}?type=${type}`)
      await expect(page.getByText(/couldn.t save your assessment/i)).toBeVisible()
    })
  }

  test('webhook rejects unsigned calls', async ({ request }) => {
    const res = await request.post('/api/payment/webhook', { data: { event: 'payment.captured' } })
    // 400 = bad signature; 503 = webhook secret not configured in this env.
    expect([400, 503]).toContain(res.status())
  })
})

// ---------------------------------------------------------------------------
// Paid flow (DB-backed) — opt-in
// ---------------------------------------------------------------------------

const PROMO = process.env.E2E_PROMO_CODE

const person = () => {
  const email = `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@compliancecheck.co.in`
  return {
    email,
    details: {
      fullName: 'E2E Tester',
      email,
      phone: '9876543210',
      companyName: 'E2E Demo Pvt Ltd',
      state: 'Maharashtra',
      employeeCount: '20-49',
      industry: 'Manufacturing',
    },
  }
}

async function submit(request: APIRequestContext, type: AssessmentType, p: ReturnType<typeof person>): Promise<string> {
  const d = p.details
  const routes: Record<string, [string, unknown]> = {
    [ASSESSMENT_TYPES.STATUTORY_HEALTH]: ['statutory-health-submit', { userDetails: d, responses: { pf_1: 'yes', pf_2: 'no', esi_1: 'no', pt_2: 'no', bonus_1: 'yes' } }],
    [ASSESSMENT_TYPES.LABOUR_CODE]: ['labour-code-submit', {
      userDetails: { ...d, contactName: d.fullName, contactEmail: d.email },
      responses: { wages_1: 'yes', wages_2: 'no', wages_4: 'no', ss_1: 'yes', ss_2: 'no' },
    }],
    [ASSESSMENT_TYPES.DPDP]: ['dpdp-submit', {
      organizationProfile: { processesChildrenData: 'no', processesHealthData: 'no', processesSensitiveData: 'no', crossBorderTransfers: 'no', state: 'Maharashtra', employeeCount: '20-49', industry: 'Manufacturing' },
      responses: { consent_4: 'yes', consent_5: 'no', security_3: 'no', gov_3: 'no' },
    }],
    [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE]: ['state-wise-submit', {
      userDetails: d,
      phase1Responses: { APP_02: 'maharashtra', APP_06: '20-49' },
      phase2Responses: { EPF_01: 'yes', EPF_02: 'no', ESI_01: 'no' },
      scoreResult: { overallScore: 33, categoryScores: {}, status: 'Non-Compliant', gaps: [], compliantItems: [] },
    }],
    [ASSESSMENT_TYPES.FOOD_BUSINESS]: ['food-business-submit', {
      userDetails: d,
      responses: { fssai_license_obtained: 'yes', fssai_displayed: 'no', fire_noc_obtained: 'no' },
      score: 33,
    }],
  }
  const [route, body] = routes[type]
  const res = await request.post(`/api/assessment/${route}`, { data: body })
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  expect(json.assessmentId, `${type} must save to Supabase, not fall back to local_`).toMatch(/^[0-9a-f-]{36}$/)
  return json.assessmentId
}

test.describe('paywall — paid flow (promo code)', () => {
  test.skip(!PROMO, 'Set E2E_PROMO_CODE (and BASE_URL with Supabase) to run')

  for (const type of [
    ASSESSMENT_TYPES.STATUTORY_HEALTH,
    ASSESSMENT_TYPES.LABOUR_CODE,
    ASSESSMENT_TYPES.DPDP,
    ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
    ASSESSMENT_TYPES.FOOD_BUSINESS,
  ]) {
    test(`${type}: summary → promo → full report → PDF`, async ({ page, request }) => {
      const p = person()
      const id = await submit(request, type, p)
      const pdfUrl = `/api/report/${id}/pdf?email=${encodeURIComponent(p.email)}`

      // DPDP collects no contact details at submit, so its PDF ownership check
      // is by entitlement email only; the others must refuse with 402.
      if (type !== ASSESSMENT_TYPES.DPDP) {
        expect((await request.get(pdfUrl)).status()).toBe(402)
      }

      await page.goto(`/results/${id}?type=${type}`)
      await expect(page.getByText('Unlock your full compliance report')).toBeVisible()
      await expect(page.getByRole('button', { name: `Pay ${priceLabel(type)} & Unlock` })).toBeVisible()

      await page.getByPlaceholder('Your email (for receipt)').fill(p.email)
      await page.getByRole('button', { name: 'Have a promo code?' }).click()
      await page.getByPlaceholder('Enter promo code').fill(PROMO!)
      await page.getByRole('button', { name: 'Apply code' }).click()

      await expect(page.getByText('Unlock your full compliance report')).toHaveCount(0, { timeout: 15_000 })

      if (type !== ASSESSMENT_TYPES.DPDP) {
        const res = await request.get(pdfUrl)
        expect(res.status()).toBe(200)
        expect(res.headers()['content-type']).toContain('application/pdf')
      }
    })
  }

  test('Razorpay checkout opens with the configured amount', async ({ page, request }) => {
    const p = person()
    const id = await submit(request, ASSESSMENT_TYPES.LABOUR_CODE, p)

    // Stub the Razorpay widget: capture the options instead of opening checkout.
    await page.route('https://checkout.razorpay.com/v1/checkout.js', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `window.Razorpay = function (opts) { window.__rzp = opts; return { open() {}, on() {} } }`,
      })
    )

    await page.goto(`/results/${id}?type=${ASSESSMENT_TYPES.LABOUR_CODE}`)
    await page.getByPlaceholder('Your email (for receipt)').fill(p.email)
    await page.getByRole('button', { name: `Pay ${priceLabel(ASSESSMENT_TYPES.LABOUR_CODE)} & Unlock` }).click()

    const opts = await page.waitForFunction(() => (window as unknown as { __rzp?: { amount: number; order_id: string } }).__rzp)
    const { amount, order_id } = (await opts.jsonValue()) as { amount: number; order_id: string }
    expect(amount).toBe(ASSESSMENT_PRICES[ASSESSMENT_TYPES.LABOUR_CODE].amountPaise)
    expect(order_id).toMatch(/^order_/)
  })
})
