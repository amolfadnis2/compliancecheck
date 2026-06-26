/**
 * Generates the print-CSS design system for compliance report PDFs.
 * All design tokens come from the PDF Export Design Guide v1.0 (June 2026).
 *
 * @param accentColor - Per-assessment accent hex (e.g. '#0E7C86' for POSH).
 *   Used for the cover accent rule, section kickers, and CONFIDENTIAL footer.
 */
export function getReportStyles(accentColor: string): string {
  return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Serif:wght@600&display=swap" rel="stylesheet">

<style>
/* =========================================================
   DESIGN TOKENS
   ========================================================= */
:root {
  --cc-ink-900:   #101D33;
  --cc-ink-700:   #1C3055;   /* primary / nav bar */
  --cc-ink-500:   #3B5688;
  --cc-accent:    #2C5BD6;   /* hyperlinks */
  --cc-critical:  #8A1C12;
  --cc-high:      #B42318;
  --cc-medium:    #A86A1B;
  --cc-success:   #1B7A55;
  --cc-low:       #5A6B8C;
  --cc-fill:      #F6F8FA;
  --cc-border:    #E2E6EC;
  --cc-body:      #1A2230;
  --cc-muted:     #5C6675;
  --cc-white:     #FFFFFF;
  --cc-theme:     ${accentColor};
}

/* =========================================================
   BASE RESET
   ========================================================= */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--cc-body);
  background: var(--cc-white);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* =========================================================
   PAGE RULES
   ========================================================= */
@page {
  size: A4;
  margin: 18mm;
}

/* Cover page — full bleed (no margin, so Playwright header/footer don't appear) */
@page :first {
  margin: 0;
}

/* =========================================================
   TYPOGRAPHY SCALE
   ========================================================= */
.t-display {
  font-family: 'IBM Plex Serif', Georgia, serif;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.15;
  color: var(--cc-ink-900);
}

.t-heading {
  font-family: 'IBM Plex Serif', Georgia, serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--cc-ink-700);
}

.t-subhead {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--cc-ink-700);
}

.t-body  { font-size: 14.5px; line-height: 1.65; }
.t-caption { font-size: 12px; line-height: 1.5; }
.t-micro { font-size: 10.5px; line-height: 1.4; }

.t-mono {
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
}

.t-muted  { color: var(--cc-muted); }
.t-italic { font-style: italic; }
.t-bold   { font-weight: 600; }
.t-center { text-align: center; }

/* =========================================================
   SECTION / PAGE BREAKS
   ========================================================= */
.section {
  break-before: page;
  padding: 0;          /* sections under @page margin 18mm need no extra padding */
}

/* =========================================================
   COVER PAGE  (lives inside @page :first — no margin)
   ========================================================= */
.cover {
  width: 210mm;
  min-height: 297mm;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--cc-white);
}

.cover-bar {
  background: var(--cc-ink-700);
  padding: 22mm 18mm 14mm;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cover-wordmark {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--cc-white);
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-tagline {
  font-size: 11px;
  color: rgba(255,255,255,0.75);
}

.cover-accent-rule {
  height: 3px;
  background: var(--cc-theme);
  width: 100%;
}

.cover-body {
  padding: 20mm 18mm;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cover-title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.entity-card {
  background: var(--cc-fill);
  border-left: 3px solid var(--cc-theme);
  border-radius: 4px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.entity-card-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cc-muted);
}

.score-hero {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 8px;
}

.gauge-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.gauge-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-score {
  font-family: 'IBM Plex Serif', serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

.gauge-unit {
  font-size: 11px;
  color: var(--cc-muted);
}

.score-hero-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-footer {
  padding: 10mm 18mm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--cc-border);
}

/* =========================================================
   RISK BADGE
   ========================================================= */
.risk-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cc-white);
}
.risk-badge.status-success { background: var(--cc-success); }
.risk-badge.status-medium  { background: var(--cc-medium); }
.risk-badge.status-danger  { background: var(--cc-high); }

/* =========================================================
   SECTION HEADER (used inside sections after cover)
   ========================================================= */
.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--cc-theme);
}

.section-kicker {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--cc-theme);
}

/* =========================================================
   EXECUTIVE SUMMARY
   ========================================================= */
.exec-hero {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}

.exec-gauge-wrap {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
}

.exec-gauge-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.exec-score-num {
  font-family: 'IBM Plex Serif', serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1;
}

.exec-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.stat-box {
  background: var(--cc-fill);
  border: 1px solid var(--cc-border);
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--cc-muted);
}

.stat-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 16px;
  font-weight: 600;
}

/* =========================================================
   CATEGORY TABLE
   ========================================================= */
.cat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
  margin-bottom: 24px;
}

.cat-table th {
  background: var(--cc-ink-700);
  color: var(--cc-white);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 7px 10px;
  text-align: left;
}

.cat-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--cc-border);
  vertical-align: middle;
}

.cat-table tr:nth-child(even) td { background: var(--cc-fill); }

.score-bar-bg {
  height: 6px;
  border-radius: 3px;
  background: var(--cc-border);
  width: 80px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 3px;
}

/* =========================================================
   KEY FINDINGS
   ========================================================= */
.findings-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.findings-list li::before {
  content: '\\2192';   /* → */
  color: var(--cc-theme);
  margin-right: 8px;
  font-weight: 600;
}

/* =========================================================
   METHODOLOGY PAGE
   ========================================================= */
.score-band-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 20px;
}
.score-band-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--cc-border);
  font-size: 13px;
}
.band-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--cc-white);
  white-space: nowrap;
}
.band-pill.success { background: var(--cc-success); }
.band-pill.medium  { background: var(--cc-medium); }
.band-pill.danger  { background: var(--cc-high); }

.severity-dl {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 0 20px;
}
.severity-dl-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--cc-border);
}
.severity-dl dd { font-size: 13px; }

.status-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* =========================================================
   SEVERITY & STATUS TAGS
   ========================================================= */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
}

/* Priority — solid fills */
.sev-critical { background: var(--cc-critical); color: var(--cc-white); }
.sev-high     { background: var(--cc-high);     color: var(--cc-white); }
.sev-medium   { background: var(--cc-medium);   color: var(--cc-white); }
.sev-low      { background: var(--cc-low);      color: var(--cc-white); }

/* Status — tinted fills */
.st-compliant { background: #E8F5EF; color: var(--cc-success); }
.st-gap       { background: #FDECEA; color: var(--cc-high); }
.st-na        { background: var(--cc-fill); color: var(--cc-muted); border: 1px solid var(--cc-border); }

/* =========================================================
   ACTION ITEM CARDS
   ========================================================= */
.priority-group-heading {
  font-family: 'IBM Plex Serif', serif;
  font-size: 19px;
  font-weight: 600;
  margin-bottom: 6px;
}
.priority-group-sub {
  font-size: 12.5px;
  color: var(--cc-muted);
  margin-bottom: 16px;
}

.action-card {
  border-left: 4px solid var(--cc-border);
  background: var(--cc-white);
  border-radius: 0 4px 4px 0;
  padding: 12px 14px;
  margin-bottom: 12px;
  break-inside: avoid;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

.action-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.action-card-title {
  font-family: 'IBM Plex Serif', serif;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--cc-ink-900);
}

.action-card-desc {
  font-style: italic;
  color: var(--cc-muted);
  font-size: 12.5px;
  margin-bottom: 10px;
  padding-left: 2px;
}

.steps-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--cc-ink-500);
  margin-bottom: 6px;
}

.steps-list {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  font-size: 13px;
}

.action-card-trio {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid var(--cc-border);
  padding-top: 8px;
  margin-top: 4px;
}

.trio-item {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  color: var(--cc-muted);
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.trio-item strong {
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cc-ink-500);
}

.trio-item.penalty { color: var(--cc-high); }

/* Card border colours by severity */
.card-critical { border-left-color: var(--cc-critical); }
.card-high     { border-left-color: var(--cc-high); }
.card-medium   { border-left-color: var(--cc-medium); }
.card-low      { border-left-color: var(--cc-low); }

/* =========================================================
   COMPLIANT AREAS
   ========================================================= */
.compliant-section { margin-bottom: 16px; }

.compliant-category {
  font-weight: 600;
  font-size: 13.5px;
  color: var(--cc-ink-700);
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--cc-border);
}

.compliant-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--cc-fill);
}

.compliant-check {
  color: var(--cc-success);
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* =========================================================
   NEXT STEPS
   ========================================================= */
.timeline-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 12px 0 24px;
}
.timeline-table th {
  background: var(--cc-fill);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--cc-ink-500);
  padding: 7px 10px;
  text-align: left;
  border-bottom: 2px solid var(--cc-border);
}
.timeline-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--cc-border);
  vertical-align: top;
}
.timeline-table tr:nth-child(even) td { background: var(--cc-fill); }
.timeline-period {
  font-weight: 600;
  white-space: nowrap;
}

.resource-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 12px 0 24px;
}
.resource-item {
  background: var(--cc-fill);
  border: 1px solid var(--cc-border);
  border-radius: 4px;
  padding: 10px 12px;
  break-inside: avoid;
}
.resource-name {
  font-weight: 600;
  font-size: 12.5px;
  margin-bottom: 3px;
}
.resource-url {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: var(--cc-accent);
  word-break: break-all;
}

.legislation-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 10px 0 20px;
}
.legislation-list li {
  font-size: 13px;
  padding-left: 16px;
  position: relative;
}
.legislation-list li::before {
  content: '\\25AA';
  position: absolute;
  left: 0;
  color: var(--cc-theme);
}

.deadlines-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 10px 0 20px;
}
.deadlines-list li {
  display: flex;
  gap: 8px;
  font-size: 13px;
  padding: 5px 0;
  border-bottom: 1px solid var(--cc-fill);
}
.deadline-item-text { flex: 1; }
.deadline-date {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--cc-muted);
  white-space: nowrap;
}

.reassess-box {
  background: var(--cc-fill);
  border: 1px solid var(--cc-border);
  border-radius: 6px;
  padding: 14px 16px;
  font-size: 13px;
  margin-top: 16px;
  break-inside: avoid;
}
.reassess-box strong { display: block; margin-bottom: 4px; }

/* =========================================================
   DISCLAIMER PAGE
   ========================================================= */
.disclaimer-block {
  background: var(--cc-fill);
  border: 1px solid var(--cc-border);
  border-radius: 6px;
  padding: 16px 18px;
  font-size: 12.5px;
  line-height: 1.6;
  margin-bottom: 20px;
  color: var(--cc-body);
}

.disclaimer-warning {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--cc-border);
  font-weight: 600;
  color: var(--cc-medium);
}

.metadata-block {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  color: var(--cc-muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid var(--cc-border);
  padding-top: 12px;
}
</style>`
}
