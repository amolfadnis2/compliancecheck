/**
 * Partner-mode drawing helpers shared by the unified report generator and the
 * auto-dealer generator, so a CA / CS / lawyer / consultant's branding looks
 * the same on every report. Only called when a report has `preparedBy`; a
 * normal report never reaches this file.
 *
 * Every string goes through cleanText (jsPDF Helvetica is ASCII-only, CLAUDE.md §5).
 */

import type { jsPDF } from 'jspdf'
import { cleanText } from './pdf-primitives'
import { preparerLine, type ReportPreparer } from '@/lib/partner/types'

type RGB = [number, number, number]

const PAGE_WIDTH = 210
const MARGIN = 15
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const WHITE: RGB = [255, 255, 255]
const TEXT: RGB = [31, 41, 55]
const MUTED: RGB = [107, 114, 128]
const LIGHT: RGB = [243, 244, 246]

export function partnerFooterText(preparer: ReportPreparer): string {
  return `Prepared by ${cleanText(preparer.firmName)} | Powered by ComplianceCheck.co.in | Not legal advice`
}

/** Draw the partner logo fitted inside a box; returns false if it could not be drawn. */
function drawLogo(doc: jsPDF, dataUrl: string, x: number, y: number, maxW: number, maxH: number): boolean {
  try {
    const props = doc.getImageProperties(dataUrl)
    const ratio = Math.min(maxW / props.width, maxH / props.height)
    const w = props.width * ratio
    const h = props.height * ratio
    doc.addImage(dataUrl, props.fileType || 'PNG', x + (maxW - w) / 2, y + (maxH - h) / 2, w, h)
    return true
  } catch {
    return false
  }
}

/** Branded cover header (0-60mm): logo + firm name + preparer line on the partner's colour. */
export function drawPartnerCoverHeader(doc: jsPDF, preparer: ReportPreparer, color: RGB): void {
  doc.setFillColor(...color)
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F')

  let textX = PAGE_WIDTH / 2
  let align: 'center' | 'left' = 'center'
  if (preparer.logoDataUrl) {
    doc.setFillColor(...WHITE)
    doc.roundedRect(MARGIN, 12, 50, 36, 2, 2, 'F')
    if (drawLogo(doc, preparer.logoDataUrl, MARGIN + 3, 15, 44, 30)) {
      textX = MARGIN + 58
      align = 'left'
    }
  }

  const maxWidth = align === 'left' ? PAGE_WIDTH - textX - MARGIN : CONTENT_WIDTH
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  const firmLines = (doc.splitTextToSize(cleanText(preparer.firmName), maxWidth) as string[]).slice(0, 2)
  doc.text(firmLines, textX, firmLines.length > 1 ? 26 : 32, { align })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const sub = [preparerLine(preparer), preparer.city].filter(Boolean).map((t) => cleanText(t as string)).join('  |  ')
  doc.text(sub, textX, 46, { align })
}

/** "Prepared By" box on the cover, drawn beside the (half-width) "Prepared For" box. */
export function drawPreparedByBox(
  doc: jsPDF,
  preparer: ReportPreparer,
  x: number,
  y: number,
  width: number,
  height = 50
): void {
  doc.setFillColor(...LIGHT)
  doc.rect(x, y, width, height, 'F')

  let currentY = y + 5
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text('Prepared By', x + 5, currentY)

  currentY += 8
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT)
  const firmLines = (doc.splitTextToSize(cleanText(preparer.firmName), width - 10) as string[]).slice(0, 2)
  doc.text(firmLines, x + 5, currentY)
  currentY += (firmLines.length - 1) * 6 + 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text(cleanText(preparerLine(preparer)), x + 5, currentY)

  doc.setFontSize(9)
  for (const line of [preparer.phone, preparer.email, preparer.website].filter(Boolean) as string[]) {
    currentY += 5
    if (currentY > y + height - 3) break
    doc.text((doc.splitTextToSize(cleanText(line), width - 10) as string[])[0], x + 5, currentY)
  }
}
