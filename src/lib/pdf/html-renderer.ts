import { chromium } from 'playwright-core'
import type { Browser } from 'playwright-core'

// Lazy-init browser instance (CLAUDE.md rule 3 — never at module level)
let _browser: Browser | null = null

function getExecutablePath(): string | undefined {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH
  if (!browsersPath) return undefined
  // Match the installed Chromium revision directory
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path')
  try {
    const entries = fs.readdirSync(browsersPath)
    const chromiumDir = entries.find((e: string) => e.startsWith('chromium-'))
    if (chromiumDir) {
      return path.join(browsersPath, chromiumDir, 'chrome-linux', 'chrome')
    }
  } catch {
    // ignore — will fall back to undefined (use PATH)
  }
  return undefined
}

async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.isConnected()) {
    const executablePath = getExecutablePath()
    _browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return _browser
}

export interface PdfRenderOptions {
  /** Assessment title shown in the running page header */
  assessmentTitle: string
  /** Company name shown in the running page header */
  companyName: string
  /** Assessment ID + generation date shown in running footer */
  assessmentId: string
  generatedDate: string
}

/**
 * Renders an HTML string to a PDF Buffer using Playwright/Chromium.
 * Must only be called from Node.js API routes — never from client components.
 *
 * The HTML should include all styles (including @import for web fonts).
 * Playwright waits for networkidle so Google Fonts load before capture.
 *
 * The running header/footer is injected via Playwright's displayHeaderFooter;
 * the cover page suppresses them via @page :first { margin: 0 } in the HTML.
 */
export async function renderHtmlToPdf(
  html: string,
  opts: PdfRenderOptions
): Promise<Uint8Array> {
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 30_000 })

    // Running header — appears on every page except the cover (which has @page :first { margin:0 })
    const headerHtml = `
      <div style="font-family:sans-serif;font-size:8px;width:100%;padding:0 18mm;
                  box-sizing:border-box;display:flex;justify-content:space-between;
                  align-items:center;color:#5C6675;border-bottom:1px solid #E2E6EC;
                  height:100%;">
        <span>&#10003; ComplianceCheck &nbsp;&middot;&nbsp; ${escapeHtml(opts.assessmentTitle)}</span>
        <span>${escapeHtml(opts.companyName)}</span>
      </div>`

    // Running footer — appears on every page except the cover
    const footerHtml = `
      <div style="font-family:monospace;font-size:7.5px;width:100%;padding:0 18mm;
                  box-sizing:border-box;display:flex;justify-content:space-between;
                  align-items:center;color:#5C6675;border-top:1px solid #E2E6EC;
                  height:100%;">
        <span>compliancecheck.in &nbsp;&middot;&nbsp; does not constitute legal advice</span>
        <span>${escapeHtml(opts.assessmentId)} &nbsp;&middot;&nbsp; ${escapeHtml(opts.generatedDate)} &nbsp;&middot;&nbsp; Page <span class="pageNumber"></span>&thinsp;/&thinsp;<span class="totalPages"></span></span>
      </div>`

    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
      margin: {
        top: '18mm',
        right: '18mm',
        bottom: '18mm',
        left: '18mm',
      },
    })

    return new Uint8Array(pdfBytes)
  } finally {
    await page.close()
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
