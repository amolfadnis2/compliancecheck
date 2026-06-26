/**
 * HTML Report Builder — replaces unified-report-generator.ts for HTML+Playwright pipeline.
 * Builds a complete HTML document from UnifiedReportData.
 * Rendered to PDF via html-renderer.ts (server-side only).
 */

import type { UnifiedReportData, UnifiedActionItem, UnifiedCategoryScore } from './unified-report-generator'
import { getReportStyles } from './report-styles'

// ============================================================================
// HELPERS
// ============================================================================

function esc(s: string | undefined | null): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function scoreStatusCss(score: number): string {
  if (score >= 80) return 'status-success'
  if (score >= 50) return 'status-medium'
  return 'status-danger'
}

function scoreStatusColor(score: number): string {
  if (score >= 80) return 'var(--cc-success)'
  if (score >= 50) return 'var(--cc-medium)'
  return 'var(--cc-high)'
}

function riskLabel(score: number): string {
  if (score >= 80) return 'LOW RISK'
  if (score >= 50) return 'MODERATE RISK'
  return 'NEEDS ATTENTION'
}

function severityCssClass(priority: UnifiedActionItem['priority']): string {
  switch (priority) {
    case 'critical': return 'sev-critical'
    case 'high':     return 'sev-high'
    case 'medium':   return 'sev-medium'
    case 'low':      return 'sev-low'
    default:         return 'sev-low'
  }
}

function cardBorderClass(priority: UnifiedActionItem['priority']): string {
  switch (priority) {
    case 'critical': return 'card-critical'
    case 'high':     return 'card-high'
    case 'medium':   return 'card-medium'
    case 'low':      return 'card-low'
    default:         return 'card-low'
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ============================================================================
// GAUGE RING SVG
// ============================================================================

function gaugeRingHtml(score: number, color: string, size: number = 120): string {
  const r = size * 0.42
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const fill = Math.max(0, Math.min(100, score)) / 100 * circumference
  const gap = circumference - fill
  // Rotate -90deg so arc starts at 12-o'clock position
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
    <circle cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="#E2E6EC" stroke-width="${size * 0.083}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="${color}" stroke-width="${size * 0.083}"
      stroke-dasharray="${fill.toFixed(2)} ${gap.toFixed(2)}"
      stroke-linecap="round"/>
  </svg>`
}

// ============================================================================
// COVER PAGE
// ============================================================================

function coverPageHtml(data: UnifiedReportData): string {
  const config = data.config
  const score = data.overallScore ?? 0
  const statusColor = scoreStatusColor(score)
  const accent = config.accentColor ?? '#1C3055'

  return `
<div class="cover">
  <div class="cover-bar">
    <div class="cover-wordmark">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="11" fill="rgba(255,255,255,0.15)"/>
        <polyline points="5,11 9,15 17,7" stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ComplianceCheck
    </div>
    <div class="cover-tagline">India&apos;s #1 Compliance Tool for Growing Businesses</div>
  </div>

  <div class="cover-accent-rule" style="background:${accent}"></div>

  <div class="cover-body">
    <div class="cover-title-block">
      <div class="t-display" style="margin-bottom:6px">${esc(config.assessmentTitle)}</div>
      <div class="t-subhead t-muted" style="font-weight:400">${esc(config.assessmentSubtitle)}</div>
      <div class="t-caption t-muted" style="margin-top:4px">${esc(config.legislationDescription)}</div>
      ${config.legislationLine2 ? `<div class="t-caption t-muted">${esc(config.legislationLine2)}</div>` : ''}
    </div>

    <div class="entity-card">
      <div class="entity-card-label">Prepared For</div>
      <div class="t-subhead" style="margin-top:4px">${esc(data.userDetails.companyName)}</div>
      <div class="t-caption t-muted">
        ${esc(data.userDetails.state)}${data.userDetails.industry ? ` &middot; ${esc(data.userDetails.industry)}` : ''}
      </div>
      ${data.userDetails.employeeCount ? `<div class="t-caption t-muted">${esc(data.userDetails.employeeCount)} employees</div>` : ''}
      <div class="t-caption t-muted" style="margin-top:4px">${formatDate(new Date())}</div>
    </div>

    <div class="score-hero">
      <div class="gauge-wrap">
        ${gaugeRingHtml(score, statusColor, 120)}
        <div class="gauge-label">
          <span class="gauge-score" style="color:${statusColor}">${score}%</span>
          <span class="gauge-unit">score</span>
        </div>
      </div>
      <div class="score-hero-right">
        <div class="t-caption t-muted">Overall Compliance Score</div>
        <span class="risk-badge ${scoreStatusCss(score)}">${riskLabel(score)}</span>
        ${data.penaltyExposure ? `
          <div style="margin-top:4px">
            <div class="t-micro t-muted" style="font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.06em">Penalty Exposure</div>
            <div class="t-mono t-bold" style="color:var(--cc-high);font-size:13px">${esc(data.penaltyExposure)}</div>
          </div>` : ''}
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <span class="t-mono t-bold t-caption" style="color:${accent};letter-spacing:.06em;text-transform:uppercase">CONFIDENTIAL</span>
    <span class="t-mono t-micro t-muted">${esc(data.assessmentId)}</span>
  </div>
</div>`
}

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================

function executiveSummaryHtml(data: UnifiedReportData): string {
  const score = data.overallScore ?? 0
  const statusColor = scoreStatusColor(score)

  const categoryRows = data.categoryScores.map((cat: UnifiedCategoryScore) => {
    const catColor = scoreStatusColor(cat.score)
    const barFill = Math.min(100, cat.score)
    return `
    <tr>
      <td class="t-body">${esc(cat.category)}</td>
      <td>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width:${barFill}%;background:${catColor}"></div>
        </div>
      </td>
      <td class="t-mono t-caption t-bold" style="color:${catColor}">${cat.score}%</td>
      <td class="t-mono t-caption t-muted">${cat.compliantCount}/${cat.questionCount}</td>
    </tr>`
  }).join('')

  const highCount = data.actionItems.filter((a) => a.priority === 'critical' || a.priority === 'high').length
  const medCount  = data.actionItems.filter((a) => a.priority === 'medium').length
  const findings = [
    `Overall Compliance Score: <strong>${score}%</strong>`,
    `Risk Level: <strong>${esc(data.riskLevel)}</strong>`,
    `Critical &amp; High Priority Actions: <strong>${highCount} items</strong>`,
    `Medium Priority Actions: <strong>${medCount} items</strong>`,
    `Areas Meeting Requirements: <strong>${data.compliantItems.length} items</strong>`,
  ]

  return `
<div class="section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">Assessment Report</div>
      <h2 class="t-heading">Executive Summary</h2>
    </div>
  </div>

  <div class="exec-hero">
    <div class="exec-gauge-wrap">
      ${gaugeRingHtml(score, statusColor, 90)}
      <div class="exec-gauge-label">
        <span class="exec-score-num" style="color:${statusColor}">${score}%</span>
        <span class="t-micro t-muted">score</span>
      </div>
    </div>
    <div class="exec-right">
      <div class="t-subhead" style="color:${statusColor}">${riskLabel(score)}</div>
      <div class="t-body t-muted">${esc(data.riskLevel)}</div>
      ${data.penaltyExposure ? `
        <div style="margin-top:6px">
          <div class="t-micro t-muted" style="font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.06em">Penalty Exposure</div>
          <div class="t-mono t-bold" style="color:var(--cc-high);font-size:16px">${esc(data.penaltyExposure)}</div>
        </div>` : ''}
    </div>
  </div>

  <h3 class="t-subhead" style="margin-bottom:10px;font-size:16px">Category-wise Compliance</h3>
  <table class="cat-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Score</th>
        <th>%</th>
        <th>Compliant</th>
      </tr>
    </thead>
    <tbody>${categoryRows}</tbody>
  </table>

  <h3 class="t-subhead" style="margin-bottom:10px;font-size:16px">Key Findings</h3>
  <ul class="findings-list">
    ${findings.map((f) => `<li class="t-body">${f}</li>`).join('')}
  </ul>
</div>`
}

// ============================================================================
// METHODOLOGY PAGE
// ============================================================================

function methodologyPageHtml(): string {
  return `
<div class="section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">Guide</div>
      <h2 class="t-heading">How to Read This Report</h2>
    </div>
  </div>

  <p class="t-body" style="margin-bottom:20px">
    Your score reflects your responses across all applicable compliance areas.
    Scores are calculated as <strong>(compliant items &divide; total applicable items) &times; 100</strong>.
    Use this report to identify gaps, prioritise actions, and track improvement over time.
  </p>

  <h3 class="t-subhead" style="margin-bottom:10px">Score Bands</h3>
  <table class="score-band-table">
    <tbody>
      <tr>
        <td style="width:110px"><span class="band-pill success">80 &ndash; 100</span></td>
        <td><strong>Low Risk</strong> &mdash; You meet most requirements. Maintain practices and re-assess annually.</td>
      </tr>
      <tr>
        <td><span class="band-pill medium">50 &ndash; 79</span></td>
        <td><strong>Moderate Risk</strong> &mdash; Significant gaps exist. Address within 30&ndash;60 days to reduce penalty exposure.</td>
      </tr>
      <tr>
        <td><span class="band-pill danger">0 &ndash; 49</span></td>
        <td><strong>High Risk</strong> &mdash; Immediate action required. Multiple areas of non-compliance pose regulatory risk.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="t-subhead" style="margin-bottom:10px">Severity Definitions</h3>
  <div class="severity-dl">
    <div class="severity-dl-row">
      <dt><span class="tag sev-critical">Critical</span></dt>
      <dd class="t-body">Criminal liability or licence cancellation risk. Address within <strong>7 days</strong>.</dd>
    </div>
    <div class="severity-dl-row">
      <dt><span class="tag sev-high">High</span></dt>
      <dd class="t-body">Significant financial penalty likely. Address <strong>immediately</strong>.</dd>
    </div>
    <div class="severity-dl-row">
      <dt><span class="tag sev-medium">Medium</span></dt>
      <dd class="t-body">Regulatory non-conformance. Address within <strong>30&ndash;60 days</strong>.</dd>
    </div>
    <div class="severity-dl-row">
      <dt><span class="tag sev-low">Low</span></dt>
      <dd class="t-body">Best-practice gap. Address <strong>as resources permit</strong>.</dd>
    </div>
  </div>

  <h3 class="t-subhead" style="margin-bottom:10px">Status Indicators</h3>
  <div class="status-legend">
    <span class="tag st-compliant">&#10003; Compliant</span>
    <span class="tag st-gap">&#9651; Gap Identified</span>
    <span class="tag st-na">N/A</span>
  </div>
</div>`
}

// ============================================================================
// ACTION ITEM CARD
// ============================================================================

function actionCardHtml(item: UnifiedActionItem): string {
  const borderClass = cardBorderClass(item.priority)
  const tagClass    = severityCssClass(item.priority)
  const priorityLabel = item.priority.toUpperCase()

  const steps = item.remediation
    .map((step, i) => `<li>${esc((i + 1) + '. ' + step)}</li>`)
    .join('')

  const trio = `
    <div class="action-card-trio">
      <div class="trio-item">
        <strong>Deadline</strong>
        <span>${esc(item.deadline ?? 'Ongoing')}</span>
      </div>
      <div class="trio-item penalty">
        <strong>Penalty</strong>
        <span>${esc(item.penalty ?? 'N/A')}</span>
      </div>
      <div class="trio-item">
        <strong>Reference</strong>
        <span>${esc(item.governmentRef ?? '—')}</span>
      </div>
    </div>`

  return `
  <div class="action-card ${borderClass}">
    <div class="action-card-header">
      <span class="tag ${tagClass}">${priorityLabel}</span>
      <span class="t-mono t-muted t-caption">${esc(item.category)}</span>
    </div>
    <div class="action-card-title">${esc(item.title)}</div>
    <div class="action-card-desc">&ldquo;${esc(item.description)}&rdquo;</div>
    <div class="steps-label">Steps to Address</div>
    <ol class="steps-list">${steps}</ol>
    ${trio}
  </div>`
}

// ============================================================================
// ACTION ITEMS PAGES
// ============================================================================

function actionItemsHtml(data: UnifiedReportData): string {
  const priorities: Array<{ key: UnifiedActionItem['priority']; label: string; sub: string }> = [
    { key: 'critical', label: 'Critical Priority Actions',
      sub: 'Criminal liability or licence cancellation risk — address within 7 days.' },
    { key: 'high',     label: 'High Priority Actions',
      sub: 'Significant financial penalties likely — address immediately.' },
    { key: 'medium',   label: 'Medium Priority Actions',
      sub: 'Regulatory non-conformance — address within 30–60 days.' },
    { key: 'low',      label: 'Low Priority Actions',
      sub: 'Best-practice improvements — address as resources permit.' },
  ]

  return priorities
    .map(({ key, label, sub }) => {
      const items = data.actionItems.filter((a) => a.priority === key)
      if (items.length === 0) return ''
      const colorMap: Record<string, string> = {
        critical: 'var(--cc-critical)',
        high:     'var(--cc-high)',
        medium:   'var(--cc-medium)',
        low:      'var(--cc-low)',
      }
      return `
<div class="section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">Action Items</div>
      <h2 class="priority-group-heading" style="color:${colorMap[key]}">${label}</h2>
    </div>
  </div>
  <p class="priority-group-sub">${sub}</p>
  ${items.map(actionCardHtml).join('')}
</div>`
    })
    .join('')
}

// ============================================================================
// COMPLIANT AREAS
// ============================================================================

function compliantAreasHtml(data: UnifiedReportData): string {
  if (data.compliantItems.length === 0) return ''

  const byCategory: Record<string, typeof data.compliantItems> = {}
  for (const item of data.compliantItems) {
    if (!byCategory[item.category]) byCategory[item.category] = []
    byCategory[item.category].push(item)
  }

  const categorySections = Object.entries(byCategory).map(([category, items]) => `
    <div class="compliant-section">
      <div class="compliant-category">${esc(category)}</div>
      ${items.map((item) => `
        <div class="compliant-item">
          <span class="compliant-check">&#10003;</span>
          <span class="t-body">${esc(item.text)}</span>
        </div>`).join('')}
    </div>`).join('')

  return `
<div class="section">
  <div class="section-heading">
    <div>
      <div class="section-kicker" style="color:var(--cc-success)">Compliant Areas</div>
      <h2 class="t-heading" style="color:var(--cc-success)">
        Compliant Areas (${data.compliantItems.length})
      </h2>
    </div>
  </div>
  <p class="t-body t-muted" style="margin-bottom:20px">
    These areas meet ${esc(data.config.legislationDescription)} requirements based on your responses.
  </p>
  ${categorySections}
</div>`
}

// ============================================================================
// NEXT STEPS & RESOURCES
// ============================================================================

function nextStepsHtml(data: UnifiedReportData): string {
  const config = data.config

  const timelineRows = [
    { period: 'Immediate (0–7 days)',    action: 'Address CRITICAL priority items to eliminate criminal or licence risk.' },
    { period: 'Short-term (7–30 days)', action: 'Address HIGH priority items with significant financial penalty exposure.' },
    { period: '30–60 days',             action: 'Work through MEDIUM priority items to achieve full regulatory conformance.' },
    { period: 'Ongoing / Annual',       action: 'Address LOW priority items and schedule a re-assessment every 6–12 months.' },
  ]

  const resourceItems = config.resources.map((r) => `
    <div class="resource-item">
      <div class="resource-name">${esc(r.name)}</div>
      <div class="resource-url">${esc(r.url)}</div>
    </div>`).join('')

  const legislationItems = config.legislation.map((l) => `
    <li>${esc(l)}</li>`).join('')

  const deadlineItems = config.deadlines.map((d) => `
    <li>
      <span class="deadline-item-text">${esc(d.item)}</span>
      <span class="deadline-date">${esc(d.date)}</span>
    </li>`).join('')

  return `
<div class="section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">What to Do Next</div>
      <h2 class="t-heading">Next Steps &amp; Resources</h2>
    </div>
  </div>

  <h3 class="t-subhead" style="margin-bottom:8px;font-size:16px">Recommended Timeline</h3>
  <table class="timeline-table">
    <thead>
      <tr>
        <th style="width:38%">Timeframe</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${timelineRows.map((row, _i) => `
      <tr>
        <td class="timeline-period">${row.period}</td>
        <td>${row.action}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h3 class="t-subhead" style="margin-bottom:8px;font-size:16px">Government Resources</h3>
  <div class="resource-grid">${resourceItems}</div>

  <h3 class="t-subhead" style="margin-bottom:8px;font-size:16px">Applicable Legislation</h3>
  <ul class="legislation-list">${legislationItems}</ul>

  <h3 class="t-subhead" style="margin-bottom:8px;font-size:16px">Key Compliance Deadlines</h3>
  <ul class="deadlines-list">${deadlineItems}</ul>

  <div class="reassess-box">
    <strong>Schedule Your Next Assessment</strong>
    Re-assess your compliance status every 6–12 months. Visit compliancecheck.in to get started.
  </div>
</div>`
}

// ============================================================================
// DISCLAIMER & METADATA
// ============================================================================

function disclaimerHtml(data: UnifiedReportData): string {
  const config = data.config
  return `
<div class="section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">Legal Notice</div>
      <h2 class="t-heading">Disclaimer &amp; Report Metadata</h2>
    </div>
  </div>

  <div class="disclaimer-block">
    <p>
      This report is generated for informational purposes only and does not constitute legal advice.
      Compliance requirements vary by state, industry classification, and business size.
      Applicable regulations are subject to change; please verify current requirements with qualified legal or compliance counsel before acting on the findings in this report.
    </p>
    ${config.deadlineWarning ? `
    <p class="disclaimer-warning">
      ${esc(config.deadlineWarning.text)}
    </p>` : ''}
  </div>

  <div class="metadata-block">
    <div>Report ID: ${esc(data.assessmentId)}</div>
    <div>Generated: ${formatDate(new Date())}</div>
    <div>Assessment: ${esc(config.assessmentTitle)}</div>
    <div>Company: ${esc(data.userDetails.companyName)}</div>
  </div>
</div>`
}

// ============================================================================
// MAIN BUILDER
// ============================================================================

/**
 * Builds a complete HTML document string from UnifiedReportData.
 * Pass the result to renderHtmlToPdf() in html-renderer.ts.
 */
export function buildReportHtml(data: UnifiedReportData): string {
  const accent = data.config.accentColor ?? '#1C3055'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(data.config.assessmentTitle)} — ${esc(data.userDetails.companyName)}</title>
  ${getReportStyles(accent)}
</head>
<body>
  ${coverPageHtml(data)}
  ${executiveSummaryHtml(data)}
  ${methodologyPageHtml()}
  ${actionItemsHtml(data)}
  ${compliantAreasHtml(data)}
  ${nextStepsHtml(data)}
  ${disclaimerHtml(data)}
</body>
</html>`
}

/**
 * Returns the PdfRenderOptions needed by renderHtmlToPdf() from a UnifiedReportData.
 */
export function getPdfRenderOptions(data: UnifiedReportData) {
  return {
    assessmentTitle: data.config.assessmentTitle,
    companyName: data.userDetails.companyName,
    assessmentId: data.assessmentId,
    generatedDate: formatDate(new Date()),
  }
}
