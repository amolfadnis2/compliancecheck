/**
 * PF calculator PDF (client-side jsPDF). Every string goes through the shared
 * cleanText() — Helvetica can't render ₹, smart quotes etc. (CLAUDE.md §5).
 */

import { jsPDF } from 'jspdf'
import { cleanText } from '@/lib/pdf/unified-report-generator'
import { ENGINE_VERSION, type ProjectionResult } from './types'
import type { PfState } from './url-state'
import { compact, inr, pct, tableRow, type Callout, type SourceRow } from './view'

const W = 210
const H = 297
const ML = 14
const CW = W - ML * 2
const BRAND: [number, number, number] = [30, 64, 175]
const ACCENT: [number, number, number] = [21, 128, 61]
const TEXT: [number, number, number] = [31, 41, 55]
const MUTED: [number, number, number] = [107, 114, 128]
const LIGHT: [number, number, number] = [243, 244, 246]

// Short labels that fit A4 columns; same order as TABLE_HEADERS on the page.
const PDF_HEADERS = ['Year', 'Age', 'Rate', 'PF wage/mo', 'You + VPF', 'Employer', 'To EPS', 'Interest', 'Balance', "Today's Rs."]
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export interface PfPdfInput {
  state: PfState
  result: ProjectionResult
  headline: string
  callouts: Callout[]
  sources: SourceRow[]
  paramsVersion: string
  verifiedAt: string
  futureRateLabel: string
  chartPng: string | null
  generatedAt?: Date
}

export function buildPfPdf(input: PfPdfInput): jsPDF {
  const { state, result } = input
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const t = (s: string) => cleanText(s)
  let y = 0

  const footer = () => {
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(7.5)
      doc.setTextColor(...MUTED)
      doc.text(t(`ComplianceCheck PF calculator - engine ${ENGINE_VERSION} - params ${input.paramsVersion} - compliancecheck.co.in/calculator/pf`), ML, H - 8)
      doc.text(`Page ${i} of ${pages}`, W - ML, H - 8, { align: 'right' })
    }
  }
  const ensure = (needed: number) => {
    if (y + needed > H - 16) {
      doc.addPage()
      y = 18
    }
  }
  const heading = (s: string) => {
    ensure(12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...BRAND)
    doc.text(t(s), ML, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT)
  }
  const para = (s: string, size = 9.5) => {
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(t(s), CW) as string[]
    ensure(lines.length * size * 0.45 + 2)
    doc.text(lines, ML, y)
    y += lines.length * size * 0.45 + 2
  }
  const kv = (rows: [string, string][]) => {
    doc.setFontSize(9)
    for (const [k, v] of rows) {
      ensure(5.5)
      doc.setTextColor(...MUTED)
      doc.text(t(k), ML, y)
      doc.setTextColor(...TEXT)
      doc.text(t(v), ML + 70, y)
      y += 5
    }
    y += 2
  }

  // Header band
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, W, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('ComplianceCheck', ML, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(t('PF calculator with salary hikes - your EPF forecast'), ML, 19)
  doc.setFontSize(8)
  const when = input.generatedAt ?? new Date()
  doc.text(t(`Generated ${when.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`), W - ML, 19, { align: 'right' })
  y = 36

  // Headline + stats
  doc.setTextColor(...TEXT)
  doc.setFont('helvetica', 'bold')
  para(input.headline, 11)
  doc.setFont('helvetica', 'normal')
  const stats: [string, string][] = [
    ['Effective PF return', pct(result.xirrCorpus, 2)],
    ['Your return after inflation', pct(result.realXirr)],
    ['Total you put in', compact(result.totals.own)],
    ['Interest earned', compact(result.totals.interest)],
    ['Pension from EPS', result.pension != null ? `${inr(result.pension)} / month` : 'None'],
    ['Life cover (EDLI)', result.edliCover != null ? inr(result.edliCover) : '-'],
    ["Employer's monthly cost", result.first ? inr(result.first.empCost) : '-'],
  ]
  kv(stats)

  if (input.callouts.length) {
    heading('Things to know')
    for (const c of input.callouts) {
      doc.setFont('helvetica', 'bold')
      para(c.title, 9.5)
      doc.setFont('helvetica', 'normal')
      para(c.body, 9)
    }
  }

  heading('Your inputs')
  kv([
    ['Your age / retire at', `${state.age} / ${state.retirementAge}`],
    ['Monthly Basic + DA', inr(state.basic)],
    ['Salary hike each year', `${state.hikePct}% in ${MONTHS[state.stepUpMonth - 1]}`],
    ['Current PF balance', inr(state.opening)],
    ['Voluntary PF (VPF)', `${state.vpfPct}% of Basic + DA`],
    ['Employer pays PF on', state.basis === 'capped' ? 'Capped wage' : 'Full Basic'],
    ['EPS member / past EPS service', `${state.epsMember ? 'Yes' : 'No'} / ${state.pastEpsYears} years`],
    ['Employer contribution', state.reduced ? '10%' : '12%'],
    ['Labour Code 50% wage rule', state.labourCode ? `Applied (allowances ${inr(state.allowances)})` : 'Not applied'],
    ['EPS wage ceiling reading', inr(Number(state.epsCeilingReading))],
    ['Tax regime / slab', `${state.taxRegime === 'new' ? 'New' : 'Old'} / ${state.slabPct}%`],
  ])

  heading('Assumptions')
  kv([
    ['Future interest rate', input.futureRateLabel],
    ['Inflation (for today’s-money values)', `${state.inflationPct}%`],
    ['Interest on monthly contributions from', state.interestTiming === 'next_month' ? 'The following month' : 'The same month'],
  ])

  if (input.chartPng) {
    const h = CW * (300 / 760)
    ensure(h + 20) // keep the heading with the chart
    heading('How your PF builds up')
    doc.addImage(input.chartPng, 'JPEG', ML, y, CW, h)
    y += h + 3
    para('Blue: your contributions. Light blue: employer’s share to PF. Green: interest earned. The year-by-year table has the same data.', 8)
  }

  // Year table
  heading('Year by year')
  const colW = [20, 10, 14, 19, 19, 19, 17, 17, 23, 24]
  const drawHeader = () => {
    doc.setFillColor(...LIGHT)
    doc.rect(ML, y - 4, CW, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(...MUTED)
    let x = ML
    PDF_HEADERS.forEach((hd, i) => {
      doc.text(t(hd), i === 0 ? x + 1 : x + colW[i] - 1, y, { align: i === 0 ? 'left' : 'right' })
      x += colW[i]
    })
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT)
  }
  ensure(14)
  drawHeader()
  for (const r of result.rows) {
    if (y + 5 > H - 16) {
      doc.addPage()
      y = 18
      drawHeader()
    }
    doc.setFontSize(7)
    let x = ML
    tableRow(r).forEach((cell, i) => {
      doc.text(t(cell), i === 0 ? x + 1 : x + colW[i] - 1, y, { align: i === 0 ? 'left' : 'right' })
      x += colW[i]
    })
    y += 4.6
  }
  y += 3

  heading(`Sources (params version ${input.paramsVersion}, last verified ${input.verifiedAt})`)
  doc.setFontSize(7.5)
  for (const s of input.sources) {
    const line = `${s.value}: ${s.used} - ${s.source}${s.effective ? ` (${s.effective})` : ''}`
    const lines = doc.splitTextToSize(t(line), CW) as string[]
    ensure(lines.length * 3.4 + 1)
    doc.text(lines, ML, y)
    y += lines.length * 3.4 + 1
  }
  y += 3

  heading('Disclaimer')
  doc.setTextColor(...MUTED)
  para(
    'Estimates for planning only. Actual PF credits depend on your employer’s filings and the rate EPFO declares each year. Future interest rates are assumptions, not guarantees. The EPS pension figure is an estimate while the 2026 EPS paragraph text is being confirmed. This is not tax or legal advice.',
    8.5
  )
  doc.setTextColor(...ACCENT)
  para('Check your company’s PF compliance free at compliancecheck.co.in', 8.5)

  footer()
  return doc
}

/**
 * Rasterise the chart's SVG to a JPEG data URL for the PDF (JPEG keeps the
 * file small). `recolor` maps on-screen fills (e.g. dark-mode series) to the
 * PDF's light palette. Null if anything fails.
 */
export async function svgToImage(svg: SVGSVGElement, recolor: Record<string, string> = {}, width = 1520, height = 600): Promise<string | null> {
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(svg.clientWidth || 760))
    clone.setAttribute('height', String(svg.clientHeight || 300))
    // Resolve CSS variables / currentColor in the PDF's light palette.
    clone.querySelectorAll('text').forEach((n) => n.setAttribute('fill', '#6B7280'))
    clone.querySelectorAll('[fill]').forEach((n) => {
      const to = recolor[(n.getAttribute('fill') ?? '').toUpperCase()]
      if (to) n.setAttribute('fill', to)
    })
    clone.querySelectorAll('[stroke]').forEach((n) => {
      const to = recolor[(n.getAttribute('stroke') ?? '').toUpperCase()]
      if (to) n.setAttribute('stroke', to)
    })
    const xml = new XMLSerializer().serializeToString(clone)
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('svg load failed'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    return null
  }
}
