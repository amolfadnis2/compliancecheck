import { test, expect } from '@playwright/test'

/**
 * Site-wide SEO / copy consistency checks. Request-level only (no DB), so they
 * run against `next start` or any deploy preview.
 */

const LANDING_SLUGS = [
  'statutory-health-check',
  'labour-code-readiness',
  'dpdp-gap-assessment',
  'state-wise-compliance',
  'restaurant-food-business',
  'posh-act-compliance',
  'auto-dealer-compliance',
]

const meta = (html: string, attr: string, key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1] ?? null

test.describe('site consistency', () => {
  test('default share image /og-image.png exists', async ({ request }) => {
    const res = await request.get('/og-image.png')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/png')
  })

  for (const path of ['/', '/how-it-works', '/about', '/blog', '/guides', '/calculator/ctc', ...LANDING_SLUGS.map((s) => `/assessments/landing/${s}`)]) {
    test(`${path} has an og:image and a description of at most 160 chars`, async ({ request }) => {
      const html = await (await request.get(path)).text()
      expect(meta(html, 'property', 'og:image')).toBeTruthy()
      const description = meta(html, 'name', 'description')
      expect(description).toBeTruthy()
      if (path.startsWith('/assessments/landing/')) expect(description!.length).toBeLessThanOrEqual(160)
    })
  }

  test('every sitemap URL is indexable and has its own title', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const paths = [...xml.matchAll(/<loc>https:\/\/compliancecheck\.co\.in([^<]*)<\/loc>/g)]
      .map((m) => m[1] || '/')
      .filter((p) => !p.startsWith('/blog/') && !p.startsWith('/guides/'))
    const titles = new Map<string, string>()
    for (const path of paths) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(200)
      const html = await res.text()
      expect(meta(html, 'name', 'robots') ?? '', path).not.toContain('noindex')
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''
      expect(titles.get(title), `${path} reuses the title of ${titles.get(title)}`).toBeUndefined()
      titles.set(title, path)
    }
  })

  for (const path of ['/login', '/register', '/results/demo', '/suggestions']) {
    test(`${path} is noindex`, async ({ request }) => {
      const html = await (await request.get(path)).text()
      expect(meta(html, 'name', 'robots')).toContain('noindex')
    })
  }

  test('no page still treats the Labour Codes as upcoming', async ({ request }) => {
    for (const path of ['/', '/how-it-works', '/assessments/landing/labour-code-readiness', '/llms.txt']) {
      const html = await (await request.get(path)).text()
      expect(html, path).not.toMatch(/Nov(ember)? 2025 Deadline|Deadline: November 2025|expected to take effect from November 2025/)
    }
  })

  test('how-it-works does not call a paid assessment free', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.getByText(/Statutory Health Check is free/i)).toHaveCount(0)
  })
})
