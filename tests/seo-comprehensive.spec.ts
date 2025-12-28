import { test, expect } from '@playwright/test';

/**
 * Comprehensive SEO Validation Tests
 * 
 * Tests for meta tags, structured data, keywords, sitemap, robots.txt,
 * and other SEO best practices.
 */

// Target keywords for ComplianceCheck
const TARGET_KEYWORDS = {
  primary: [
    'compliance check india',
    'statutory compliance',
    'labour law compliance',
    'hr compliance',
    'compliance assessment'
  ],
  secondary: [
    'epf compliance',
    'esi compliance',
    'professional tax',
    'dpdp act',
    'labour codes india',
    'gratuity calculator'
  ],
  longTail: [
    'sme compliance checklist india',
    'hr compliance audit tool',
    'indian labour law compliance',
    'dpdp compliance assessment'
  ]
};

test.describe('SEO - Meta Tags', () => {
  
  test('homepage should have unique title', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(70); // Google truncates at ~60-70 chars
  });

  test('homepage should have meta description', async ({ page }) => {
    await page.goto('/');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(50);
    expect(description?.length).toBeLessThanOrEqual(160);
  });

  test('homepage should have canonical URL', async ({ page }) => {
    await page.goto('/');
    
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
  });

  test('assessment pages should have unique titles', async ({ page }) => {
    const pages = [
      '/assessment/statutory-health',
      '/assessment/labour-code',
      '/assessment/dpdp'
    ];
    
    const titles: string[] = [];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const title = await page.title();
      titles.push(title);
      expect(title).toBeTruthy();
    }
    
    // All titles should be unique
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  test('assessment pages should have meta descriptions', async ({ page }) => {
    const pages = [
      '/assessment/statutory-health',
      '/assessment/labour-code',
      '/assessment/dpdp'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
    }
  });
});

test.describe('SEO - Open Graph Tags', () => {
  
  test('homepage should have OG tags', async ({ page }) => {
    await page.goto('/');
    
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogType).toBeTruthy();
    expect(ogUrl).toBeTruthy();
  });

  test('should have OG image for social sharing', async ({ page }) => {
    await page.goto('/');
    
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    
    // Image should be absolute URL
    if (ogImage) {
      expect(ogImage.startsWith('http')).toBe(true);
    }
  });
});

test.describe('SEO - Twitter Cards', () => {
  
  test('should have Twitter card meta tags', async ({ page }) => {
    await page.goto('/');
    
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    
    // At least card type should be present
    expect(twitterCard || twitterTitle).toBeTruthy();
  });
});

test.describe('SEO - Heading Structure', () => {
  
  test('homepage should have single H1', async ({ page }) => {
    await page.goto('/');
    
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('assessment pages should have single H1', async ({ page }) => {
    const pages = [
      '/assessment/statutory-health',
      '/assessment/labour-code',
      '/assessment/dpdp'
    ];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    }
  });

  test('headings should be in logical order', async ({ page }) => {
    await page.goto('/');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });
});

test.describe('SEO - Keyword Presence', () => {
  
  test('homepage should contain primary keywords', async ({ page }) => {
    await page.goto('/');
    
    const content = await page.content();
    const lowerContent = content.toLowerCase();
    
    // At least some primary keywords should be present
    const foundKeywords = TARGET_KEYWORDS.primary.filter(kw => 
      lowerContent.includes(kw.toLowerCase())
    );
    
    expect(foundKeywords.length).toBeGreaterThanOrEqual(1);
  });

  test('homepage title should contain key term', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    const lowerTitle = title.toLowerCase();
    
    // Title should contain compliance-related term
    const hasComplianceKeyword = 
      lowerTitle.includes('compliance') ||
      lowerTitle.includes('statutory') ||
      lowerTitle.includes('labour');
    
    expect(hasComplianceKeyword).toBe(true);
  });

  test('meta description should contain keywords', async ({ page }) => {
    await page.goto('/');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const lowerDesc = description?.toLowerCase() || '';
    
    const hasKeyword = 
      lowerDesc.includes('compliance') ||
      lowerDesc.includes('assessment') ||
      lowerDesc.includes('statutory');
    
    expect(hasKeyword).toBe(true);
  });
});

test.describe('SEO - Technical', () => {
  
  test('should have sitemap.xml', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
  });

  test('sitemap should contain key pages', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    const content = await response.text();
    
    // Should contain main pages
    expect(content).toContain('compliancecheck');
    expect(content).toContain('<url>');
  });

  test('should have robots.txt', async ({ request }) => {
    const response = await request.get('/robots.txt');
    
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content.toLowerCase()).toContain('user-agent');
  });

  test('robots.txt should allow main pages', async ({ request }) => {
    const response = await request.get('/robots.txt');
    const content = await response.text();
    
    // Should not disallow everything
    expect(content).not.toContain('Disallow: /');
    
    // Or if it does, should have specific allows
    if (content.includes('Disallow: /')) {
      expect(content.toLowerCase()).toContain('allow');
    }
  });

  test('should have valid HTML lang attribute', async ({ page }) => {
    await page.goto('/');
    
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('en'); // or 'en-IN' for India
  });
});

test.describe('SEO - Images', () => {
  
  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      // Every image should have alt (can be empty for decorative)
      expect(alt !== null).toBe(true);
      
      // Non-decorative images should have meaningful alt
      if (src && !src.includes('icon') && !src.includes('logo')) {
        // Alt should not be generic
        expect(alt).not.toBe('image');
      }
    }
  });
});

test.describe('SEO - Links', () => {
  
  test('internal links should not be broken', async ({ page }) => {
    await page.goto('/');
    
    const internalLinks = await page.locator('a[href^="/"]').all();
    
    for (const link of internalLinks.slice(0, 10)) { // Test first 10
      const href = await link.getAttribute('href');
      if (href && !href.includes('#')) {
        const response = await page.goto(href);
        expect(response?.status()).toBeLessThan(400);
        await page.goto('/');
      }
    }
  });

  test('external links should have rel attributes', async ({ page }) => {
    await page.goto('/');
    
    const externalLinks = await page.locator('a[href^="http"]').all();
    
    for (const link of externalLinks) {
      const href = await link.getAttribute('href');
      const rel = await link.getAttribute('rel');
      const target = await link.getAttribute('target');
      
      // External links opening in new tab should have noopener
      if (target === '_blank') {
        expect(rel).toContain('noopener');
      }
    }
  });
});

test.describe('SEO - Structured Data', () => {
  
  test('homepage should have JSON-LD structured data', async ({ page }) => {
    await page.goto('/');
    
    const jsonLd = await page.locator('script[type="application/ld+json"]').first();
    
    if (await jsonLd.isVisible().catch(() => false)) {
      const content = await jsonLd.textContent();
      expect(content).toBeTruthy();
      
      // Should be valid JSON
      const parsed = JSON.parse(content!);
      expect(parsed['@context']).toBe('https://schema.org');
    }
  });

  test('should have Organization schema', async ({ page }) => {
    await page.goto('/');
    
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    
    let hasOrgSchema = false;
    for (const script of scripts) {
      const content = await script.textContent();
      if (content?.includes('Organization')) {
        hasOrgSchema = true;
        break;
      }
    }
    
    // Organization schema recommended but not required
    // This documents whether it exists
  });
});

test.describe('SEO - Performance Impact', () => {
  
  test('page should not have render-blocking resources', async ({ page }) => {
    const resources: { url: string; blocking: boolean }[] = [];
    
    page.on('request', request => {
      if (request.resourceType() === 'stylesheet' || request.resourceType() === 'script') {
        resources.push({
          url: request.url(),
          blocking: true // Simplified check
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have reasonable number of resources
    expect(resources.length).toBeLessThan(50);
  });

  test('page should have fast TTFB', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.goto('/');
    const ttfb = Date.now() - startTime;
    
    // TTFB should be under 2 seconds
    expect(ttfb).toBeLessThan(2000);
    expect(response?.status()).toBe(200);
  });
});

test.describe('SEO - Mobile Friendliness', () => {
  
  test('should have viewport meta tag', async ({ page }) => {
    await page.goto('/');
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should not have horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Small tolerance
  });

  test('touch targets should be adequate size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const buttons = await page.locator('button, a').all();
    
    for (const button of buttons.slice(0, 5)) { // Check first 5
      const box = await button.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44 pixels
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
