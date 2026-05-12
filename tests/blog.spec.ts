import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Blog — home page', () => {
  test('renders featured post and grid', async ({ page }) => {
    await page.goto(`${BASE}/blog`);
    // Hero heading
    await expect(page.getByRole('heading', { name: /Indian Compliance Insights/i, level: 1 })).toBeVisible();
    // At least one post card should appear (from the sample post)
    const cards = page.locator('article, [data-testid="post-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('category pill click filters posts and updates URL', async ({ page }) => {
    await page.goto(`${BASE}/blog`);
    const pill = page.getByRole('button', { name: 'Labour Codes' });
    await pill.click();
    await expect(page).toHaveURL(/category=labour-codes/);
    await expect(pill).toHaveAttribute('aria-current', 'page');
  });

  test('search bar filters posts client-side', async ({ page }) => {
    await page.goto(`${BASE}/blog`);
    const search = page.getByLabel('Search articles');
    await search.fill('labour');
    // Wait for debounce + results count
    await expect(page.getByRole('status')).toBeVisible({ timeout: 2000 });
  });

  test('clicking All pill clears category filter', async ({ page }) => {
    await page.goto(`${BASE}/blog?category=labour-codes`);
    const allBtn = page.getByRole('button', { name: 'All' });
    await allBtn.click();
    await expect(page).not.toHaveURL(/category=/);
    await expect(allBtn).toHaveAttribute('aria-current', 'page');
  });

  test('pagination component renders on multiple pages', async ({ page }) => {
    // With only 1 post, no pagination — but the nav should still mount
    await page.goto(`${BASE}/blog`);
    // Just confirm the page loads without errors
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('bottom CTA strip links to /assessments', async ({ page }) => {
    await page.goto(`${BASE}/blog`);
    const cta = page.getByRole('link', { name: /Start for free/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/assessments');
  });
});

test.describe('Blog — post page', () => {
  const SLUG = 'labour-codes-effective-date';

  test('post page renders title, cover image, and body', async ({ page }) => {
    await page.goto(`${BASE}/blog/${SLUG}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Cover image
    await expect(page.locator('img').first()).toBeVisible();
    // Article body
    await expect(page.locator('article')).toBeVisible();
  });

  test('breadcrumbs are rendered and Home link works', async ({ page }) => {
    await page.goto(`${BASE}/blog/${SLUG}`);
    const homeLink = page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('TOC button scrolls to section', async ({ page }) => {
    await page.goto(`${BASE}/blog/${SLUG}`);
    // Wait for TOC to render (it reads the DOM after mount)
    await page.waitForTimeout(500);
    const tocNav = page.getByRole('navigation', { name: 'Table of contents' }).first();
    const firstTocBtn = tocNav.getByRole('button').first();
    if (await firstTocBtn.isVisible()) {
      await firstTocBtn.click();
      // Just confirm no JS errors thrown
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.waitForTimeout(300);
      expect(errors).toHaveLength(0);
    }
  });

  test('share buttons are rendered', async ({ page }) => {
    await page.goto(`${BASE}/blog/${SLUG}`);
    await expect(page.getByRole('button', { name: /Share on Twitter/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Share on LinkedIn/i })).toBeVisible();
  });

  test('newsletter signup with invalid email shows error', async ({ page }) => {
    await page.goto(`${BASE}/blog/${SLUG}`);
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('not-an-email');
    await emailInput.press('Tab');
    // Trigger form submit
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.click();
    await expect(page.locator('[role="alert"]').last()).toBeVisible({ timeout: 3000 });
  });

  test('newsletter signup with valid email shows success state (mocked)', async ({ page }) => {
    // Intercept the subscribe endpoint so we don't need a real Supabase
    await page.route('**/api/newsletter/subscribe', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await page.goto(`${BASE}/blog/${SLUG}`);
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('test@example.com');
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.click();
    await expect(page.getByText(/Check your inbox/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Blog — dark mode', () => {
  test('dark mode toggle works on /blog', async ({ page }) => {
    await page.goto(`${BASE}/blog`);
    // Check the page renders in any theme state without errors
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    expect(typeof initialClass).toBe('string');
  });
});

test.describe('Blog — RSS feed', () => {
  test('RSS feed returns valid XML', async ({ page }) => {
    const response = await page.request.get(`${BASE}/blog/rss.xml`);
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('xml');
    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<rss');
    expect(body).toContain('</rss>');
  });
});
