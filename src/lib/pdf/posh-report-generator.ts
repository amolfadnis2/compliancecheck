/**
 * ComplianceCheck - POSH Compliance Assessment PDF Report Generator
 * 
 * Generates comprehensive 8-12 page PDF report with:
 * - Cover page with company details
 * - Executive summary with scores and risk level
 * - Prioritized action items with full remediation steps
 * - Compliant areas checklist
 * - Next steps and resources
 * 
 * Usage:
 *   import { generatePOSHReport } from '@/lib/pdf/posh-report-generator';
 *   await generatePOSHReport(assessmentResult, userDetails);
 */

import { jsPDF } from 'jspdf';

// ============================================================================
// INTERFACES
// ============================================================================

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  state: string;
  employeeCount: string;
  industry: string;
}

interface CategoryScore {
  category: string;
  score: number;
  status: 'compliant' | 'needs_attention' | 'non_compliant';
  questionCount: number;
  compliantCount: number;
}

interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  category: string;
  questionId: string;
  title: string;
  description: string;
  remediation: string[];
  governmentRef?: string;
  officialLink?: string;
  penalty?: string;
  deadline?: string;
}

interface CompliantItem {
  questionId: string;
  category: string;
  text: string;
}

interface POSHAssessmentResult {
  overallScore: number;
  riskLevel: string;
  penaltyExposure: string;
  categoryScores: CategoryScore[];
  actionItems: ActionItem[];
  compliantItems: CompliantItem[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 15;
const MARGIN_RIGHT = 15;
const MARGIN_TOP = 15;
const MARGIN_BOTTOM = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

const COLORS = {
  primary: [30, 64, 175] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  textLight: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const FONTS = {
  title: 24,
  heading: 16,
  subheading: 14,
  body: 11,
  small: 9,
  tiny: 8,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u2015/g, '--')
    .replace(/\u2022/g, '*')
    .replace(/\u00A0/g, ' ')
    .replace(/\u00B7/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u20B9/g, 'Rs.')
    .replace(/₹/g, 'Rs.')
    .replace(/\u2713/g, '[Y]')
    .replace(/\u2714/g, '[Y]')
    .replace(/\u2717/g, '[X]')
    .replace(/\u2718/g, '[X]')
    .replace(/✓/g, '[Y]')
    .replace(/✗/g, '[X]')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/→/g, '->')
    .replace(/[^\x00-\x7F]/g, '');
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 90) return COLORS.success;
  if (score >= 70) return COLORS.warning;
  return COLORS.danger;
}

function getPriorityColor(priority: 'high' | 'medium' | 'low'): [number, number, number] {
  switch (priority) {
    case 'high': return COLORS.danger;
    case 'medium': return COLORS.warning;
    case 'low': return COLORS.success;
  }
}

function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function checkPageBreak(
  doc: jsPDF,
  yPos: number,
  neededSpace: number
): { yPos: number; newPage: boolean } {
  if (yPos + neededSpace > PAGE_HEIGHT - MARGIN_BOTTOM) {
    doc.addPage();
    return { yPos: MARGIN_TOP, newPage: true };
  }
  return { yPos, newPage: false };
}

function addPageHeader(
  doc: jsPDF,
  companyName: string,
  pageNum: number,
  totalPages?: number
): void {
  const cleanCompany = cleanText(companyName);
  
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(0, 0, PAGE_WIDTH, 12, 'F');
  
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text(cleanCompany, MARGIN_LEFT, 8);
  
  const pageText = totalPages ? `Page ${pageNum} of ${totalPages}` : `Page ${pageNum}`;
  doc.text(pageText, PAGE_WIDTH - MARGIN_RIGHT, 8, { align: 'right' });
  
  doc.setTextColor(...COLORS.text);
}

function addPageFooter(doc: jsPDF): void {
  doc.setFontSize(FONTS.tiny);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    'Generated by ComplianceCheck.co.in | This report does not constitute legal advice',
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 10,
    { align: 'center' }
  );
  doc.setTextColor(...COLORS.text);
}

function drawLine(doc: jsPDF, yPos: number): void {
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, yPos, PAGE_WIDTH - MARGIN_RIGHT, yPos);
}

// ============================================================================
// PAGE GENERATORS
// ============================================================================

function generateCoverPage(
  doc: jsPDF,
  userDetails: UserDetails,
  result: POSHAssessmentResult
): void {
  const centerX = PAGE_WIDTH / 2;
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('ComplianceCheck', centerX, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Pay-as-you-go Compliance Assessments for Indian SMEs', centerX, 48, { align: 'center' });
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(FONTS.title);
  doc.setFont('helvetica', 'bold');
  doc.text('POSH Compliance', centerX, 90, { align: 'center' });
  doc.text('Assessment Report', centerX, 102, { align: 'center' });
  
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text('Sexual Harassment of Women at Workplace', centerX, 118, { align: 'center' });
  doc.text('(Prevention, Prohibition and Redressal) Act, 2013', centerX, 126, { align: 'center' });
  
  const boxY = 150;
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(MARGIN_LEFT + 20, boxY, CONTENT_WIDTH - 40, 70, 3, 3, 'F');
  
  doc.setFontSize(FONTS.subheading);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared For', centerX, boxY + 15, { align: 'center' });
  
  doc.setFontSize(FONTS.heading);
  doc.text(cleanText(userDetails.companyName), centerX, boxY + 32, { align: 'center' });
  
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${cleanText(userDetails.state)} | ${cleanText(userDetails.industry)}`, centerX, boxY + 45, { align: 'center' });
  doc.text(`${cleanText(userDetails.employeeCount)}`, centerX, boxY + 55, { align: 'center' });
  
  doc.setFontSize(FONTS.body);
  doc.setTextColor(...COLORS.text);
  doc.text(`Assessment Date: ${formatDate()}`, centerX, 240, { align: 'center' });
  
  const scoreColor = getScoreColor(result.overallScore);
  doc.setFontSize(FONTS.subheading);
  doc.setTextColor(...scoreColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Overall Score: ${result.overallScore}%`, centerX, 255, { align: 'center' });
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'italic');
  doc.text('CONFIDENTIAL - For Internal Use Only', centerX, PAGE_HEIGHT - 25, { align: 'center' });
}

function generateExecutiveSummary(
  doc: jsPDF,
  userDetails: UserDetails,
  result: POSHAssessmentResult
): void {
  doc.addPage();
  addPageHeader(doc, userDetails.companyName, 2);
  
  let yPos = 25;
  
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Executive Summary', MARGIN_LEFT, yPos);
  yPos += 15;
  
  drawLine(doc, yPos);
  yPos += 15;
  
  const scoreColor = getScoreColor(result.overallScore);
  doc.setFontSize(48);
  doc.setTextColor(...scoreColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.overallScore}%`, PAGE_WIDTH / 2, yPos + 15, { align: 'center' });
  
  doc.setFontSize(FONTS.subheading);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.text('Overall Compliance Score', PAGE_WIDTH / 2, yPos + 28, { align: 'center' });
  yPos += 45;
  
  doc.setFillColor(...COLORS.danger);
  doc.roundedRect(MARGIN_LEFT + 20, yPos, (CONTENT_WIDTH - 50) / 2, 30, 2, 2, 'F');
  
  doc.setFillColor(...COLORS.warning);
  doc.roundedRect(PAGE_WIDTH / 2 + 5, yPos, (CONTENT_WIDTH - 50) / 2, 30, 2, 2, 'F');
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Level', MARGIN_LEFT + 20 + (CONTENT_WIDTH - 50) / 4, yPos + 10, { align: 'center' });
  doc.text(cleanText(result.riskLevel), MARGIN_LEFT + 20 + (CONTENT_WIDTH - 50) / 4, yPos + 22, { align: 'center' });
  
  doc.text('Penalty Exposure', PAGE_WIDTH / 2 + 5 + (CONTENT_WIDTH - 50) / 4, yPos + 10, { align: 'center' });
  doc.text(cleanText(result.penaltyExposure), PAGE_WIDTH / 2 + 5 + (CONTENT_WIDTH - 50) / 4, yPos + 22, { align: 'center' });
  
  yPos += 45;
  
  doc.setFontSize(FONTS.subheading);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Category-wise Compliance', MARGIN_LEFT, yPos);
  yPos += 10;
  
  doc.setFillColor(...COLORS.lightGray);
  doc.rect(MARGIN_LEFT, yPos, CONTENT_WIDTH, 10, 'F');
  
  doc.setFontSize(FONTS.small);
  doc.setFont('helvetica', 'bold');
  doc.text('Category', MARGIN_LEFT + 3, yPos + 7);
  doc.text('Score', MARGIN_LEFT + 110, yPos + 7);
  doc.text('Status', MARGIN_LEFT + 140, yPos + 7);
  yPos += 12;
  
  doc.setFont('helvetica', 'normal');
  result.categoryScores.forEach((cat) => {
    const catColor = getScoreColor(cat.score);
    
    doc.setTextColor(...COLORS.text);
    doc.text(cleanText(cat.category), MARGIN_LEFT + 3, yPos + 5);
    
    doc.setTextColor(...catColor);
    doc.text(`${cat.score}%`, MARGIN_LEFT + 110, yPos + 5);
    
    doc.setTextColor(...COLORS.textLight);
    doc.text(`${cat.compliantCount}/${cat.questionCount} compliant`, MARGIN_LEFT + 140, yPos + 5);
    
    yPos += 10;
  });
  
  yPos += 10;
  drawLine(doc, yPos);
  yPos += 15;
  
  doc.setFontSize(FONTS.subheading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Key Findings', MARGIN_LEFT, yPos);
  yPos += 10;
  
  const highPriorityCount = result.actionItems.filter(a => a.priority === 'high').length;
  const mediumPriorityCount = result.actionItems.filter(a => a.priority === 'medium').length;
  
  const findings = [
    `${result.actionItems.length} compliance gaps identified requiring remediation`,
    `${highPriorityCount} high-priority issues requiring immediate attention`,
    `${mediumPriorityCount} medium-priority items for near-term resolution`,
    `${result.compliantItems.length} areas already meeting POSH requirements`,
    result.overallScore < 70 
      ? 'Organization faces significant compliance risk under POSH Act 2013'
      : result.overallScore < 90
        ? 'Organization has moderate compliance gaps to address'
        : 'Organization demonstrates strong POSH compliance posture'
  ];
  
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  findings.forEach((finding) => {
    doc.setTextColor(...COLORS.textLight);
    doc.text('*', MARGIN_LEFT + 5, yPos);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(cleanText(finding), CONTENT_WIDTH - 15);
    doc.text(lines, MARGIN_LEFT + 12, yPos);
    yPos += lines.length * 6 + 3;
  });
  
  addPageFooter(doc);
}

function generateActionItemsPages(
  doc: jsPDF,
  userDetails: UserDetails,
  items: ActionItem[],
  priority: 'high' | 'medium' | 'low',
  startPage: number
): number {
  if (items.length === 0) return startPage;
  
  doc.addPage();
  let currentPage = startPage;
  addPageHeader(doc, userDetails.companyName, currentPage);
  
  let yPos = 25;
  
  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
  const priorityColor = getPriorityColor(priority);
  
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...priorityColor);
  doc.text(`${priorityLabel} Priority Action Items (${items.length})`, MARGIN_LEFT, yPos);
  yPos += 8;
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(
    priority === 'high' 
      ? 'Address immediately to avoid penalties and legal risk'
      : priority === 'medium'
        ? 'Address within 30-60 days to strengthen compliance'
        : 'Address as resources permit to achieve full compliance',
    MARGIN_LEFT,
    yPos
  );
  yPos += 10;
  
  drawLine(doc, yPos);
  yPos += 10;
  
  items.forEach((item, index) => {
    const stepsSpace = item.remediation.length * 6;
    const estimatedHeight = 70 + stepsSpace;
    
    const pageCheck = checkPageBreak(doc, yPos, estimatedHeight);
    if (pageCheck.newPage) {
      currentPage++;
      addPageHeader(doc, userDetails.companyName, currentPage);
      addPageFooter(doc);
      yPos = pageCheck.yPos + 10;
    }
    
    doc.setFillColor(...priorityColor);
    doc.roundedRect(MARGIN_LEFT, yPos, 40, 7, 1, 1, 'F');
    doc.setFontSize(FONTS.tiny);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text(`${priority.toUpperCase()}`, MARGIN_LEFT + 3, yPos + 5);
    
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(cleanText(item.category), MARGIN_LEFT + 45, yPos + 5);
    yPos += 12;
    
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(cleanText(item.title), CONTENT_WIDTH);
    doc.text(titleLines, MARGIN_LEFT, yPos);
    yPos += titleLines.length * 5 + 3;
    
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'italic');
    const descLines = doc.splitTextToSize(`"${cleanText(item.description)}"`, CONTENT_WIDTH - 5);
    doc.text(descLines, MARGIN_LEFT + 3, yPos);
    yPos += descLines.length * 4 + 5;
    
    doc.setFontSize(FONTS.small);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Steps to Address:', MARGIN_LEFT, yPos);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    item.remediation.forEach((step, stepIdx) => {
      const stepText = `${stepIdx + 1}. ${cleanText(step)}`;
      const stepLines = doc.splitTextToSize(stepText, CONTENT_WIDTH - 10);
      doc.text(stepLines, MARGIN_LEFT + 5, yPos);
      yPos += stepLines.length * 4 + 2;
    });
    yPos += 3;
    
    if (item.deadline) {
      doc.setFontSize(FONTS.small);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`Deadline: ${cleanText(item.deadline)}`, MARGIN_LEFT, yPos);
      yPos += 5;
    }
    
    if (item.penalty) {
      doc.setTextColor(...COLORS.danger);
      doc.setFont('helvetica', 'bold');
      const penaltyLines = doc.splitTextToSize(`Penalty: ${cleanText(item.penalty)}`, CONTENT_WIDTH);
      doc.text(penaltyLines, MARGIN_LEFT, yPos);
      yPos += penaltyLines.length * 4 + 2;
    }
    
    if (item.governmentRef) {
      doc.setTextColor(...COLORS.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ref: ${cleanText(item.governmentRef)}`, MARGIN_LEFT, yPos);
      yPos += 5;
    }
    
    yPos += 8;
    
    if (index < items.length - 1) {
      doc.setDrawColor(...COLORS.lightGray);
      doc.setLineWidth(0.3);
      doc.line(MARGIN_LEFT + 20, yPos, PAGE_WIDTH - MARGIN_RIGHT - 20, yPos);
      yPos += 8;
    }
  });
  
  addPageFooter(doc);
  return currentPage;
}

function generateCompliantAreasPage(
  doc: jsPDF,
  userDetails: UserDetails,
  compliantItems: CompliantItem[],
  pageNum: number
): number {
  doc.addPage();
  let currentPage = pageNum;
  addPageHeader(doc, userDetails.companyName, currentPage);
  
  let yPos = 25;
  
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.success);
  doc.text(`Compliant Areas (${compliantItems.length})`, MARGIN_LEFT, yPos);
  yPos += 8;
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text('These areas meet POSH Act 2013 requirements based on your responses', MARGIN_LEFT, yPos);
  yPos += 10;
  
  drawLine(doc, yPos);
  yPos += 10;
  
  const groupedByCategory: Record<string, CompliantItem[]> = {};
  compliantItems.forEach(item => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });
  
  Object.entries(groupedByCategory).forEach(([category, items]) => {
    const pageCheck = checkPageBreak(doc, yPos, 15 + items.length * 8);
    if (pageCheck.newPage) {
      currentPage++;
      addPageHeader(doc, userDetails.companyName, currentPage);
      yPos = pageCheck.yPos + 10;
    }
    
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(cleanText(category), MARGIN_LEFT, yPos);
    yPos += 7;
    
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'normal');
    items.forEach(item => {
      doc.setTextColor(...COLORS.success);
      doc.text('[Y]', MARGIN_LEFT + 5, yPos);
      doc.setTextColor(...COLORS.text);
      
      const textLines = doc.splitTextToSize(cleanText(item.text), CONTENT_WIDTH - 20);
      doc.text(textLines, MARGIN_LEFT + 15, yPos);
      yPos += textLines.length * 4 + 3;
    });
    
    yPos += 5;
  });
  
  addPageFooter(doc);
  return currentPage;
}

function generateNextStepsPage(
  doc: jsPDF,
  userDetails: UserDetails,
  result: POSHAssessmentResult,
  pageNum: number
): void {
  doc.addPage();
  addPageHeader(doc, userDetails.companyName, pageNum);
  
  let yPos = 25;
  
  doc.setFontSize(FONTS.heading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Next Steps & Resources', MARGIN_LEFT, yPos);
  yPos += 10;
  
  drawLine(doc, yPos);
  yPos += 15;
  
  doc.setFontSize(FONTS.subheading);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Timeline', MARGIN_LEFT, yPos);
  yPos += 10;
  
  const timeline = [
    { period: 'Immediate (Week 1)', action: 'Address all HIGH priority items to mitigate penalty risk' },
    { period: 'Short-term (30 days)', action: 'Complete MEDIUM priority items to strengthen compliance' },
    { period: 'Ongoing (Quarterly)', action: 'Review LOW priority items and maintain documentation' },
    { period: 'Annual', action: 'Re-assess compliance, update ICC if needed, submit annual report' },
  ];
  
  doc.setFontSize(FONTS.body);
  timeline.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(cleanText(item.period), MARGIN_LEFT + 5, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const actionLines = doc.splitTextToSize(cleanText(item.action), CONTENT_WIDTH - 60);
    doc.text(actionLines, MARGIN_LEFT + 55, yPos);
    yPos += actionLines.length * 5 + 5;
  });
  
  yPos += 10;
  
  doc.setFontSize(FONTS.subheading);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Government Resources', MARGIN_LEFT, yPos);
  yPos += 10;
  
  const resources = [
    { name: 'SHe-Box (Online Complaints Portal)', url: 'shebox.wcd.gov.in' },
    { name: 'Ministry of Women & Child Development', url: 'wcd.nic.in' },
    { name: 'POSH Act Full Text', url: 'indiacode.nic.in (Act No. 14 of 2013)' },
    { name: 'State Women Commissions', url: 'Check your state government website' },
  ];
  
  doc.setFontSize(FONTS.body);
  resources.forEach(res => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(cleanText(res.name), MARGIN_LEFT + 5, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.primary);
    doc.text(cleanText(res.url), MARGIN_LEFT + 5, yPos + 5);
    yPos += 12;
  });
  
  yPos += 10;
  
  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(MARGIN_LEFT, yPos, CONTENT_WIDTH, 35, 3, 3, 'F');
  
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Re-assess After Remediation', MARGIN_LEFT + 10, yPos + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.textLight);
  doc.text('After addressing the gaps identified in this report, take the assessment', MARGIN_LEFT + 10, yPos + 22);
  doc.text('again at compliancecheck.co.in to track your improvement.', MARGIN_LEFT + 10, yPos + 30);
  
  yPos += 50;
  
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'italic');
  const disclaimerText = 'Disclaimer: This assessment report is generated based on self-reported responses and is intended for informational purposes only. It does not constitute legal advice. For specific legal guidance on POSH Act compliance, please consult a qualified legal professional. ComplianceCheck is not responsible for any actions taken based solely on this report.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, CONTENT_WIDTH);
  doc.text(disclaimerLines, MARGIN_LEFT, yPos);
  
  yPos += disclaimerLines.length * 4 + 15;
  
  doc.setFontSize(FONTS.tiny);
  doc.text(`Report generated: ${new Date().toLocaleString('en-IN')}`, MARGIN_LEFT, yPos);
  doc.text('Assessment ID: ' + Math.random().toString(36).substring(2, 10).toUpperCase(), MARGIN_LEFT, yPos + 5);
  
  addPageFooter(doc);
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export function generatePOSHReport(
  result: POSHAssessmentResult,
  userDetails: UserDetails
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const highPriorityItems = result.actionItems.filter(a => a.priority === 'high');
  const mediumPriorityItems = result.actionItems.filter(a => a.priority === 'medium');
  const lowPriorityItems = result.actionItems.filter(a => a.priority === 'low');
  
  generateCoverPage(doc, userDetails, result);
  generateExecutiveSummary(doc, userDetails, result);
  
  let currentPage = 3;
  currentPage = generateActionItemsPages(doc, userDetails, highPriorityItems, 'high', currentPage);
  
  currentPage++;
  currentPage = generateActionItemsPages(doc, userDetails, mediumPriorityItems, 'medium', currentPage);
  
  currentPage++;
  currentPage = generateActionItemsPages(doc, userDetails, lowPriorityItems, 'low', currentPage);
  
  currentPage++;
  currentPage = generateCompliantAreasPage(doc, userDetails, result.compliantItems, currentPage);
  
  currentPage++;
  generateNextStepsPage(doc, userDetails, result, currentPage);
  
  const cleanCompany = userDetails.companyName
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 30);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `POSH_Compliance_Report_${cleanCompany}_${dateStr}.pdf`;
  
  doc.save(filename);
}

export function generatePOSHReportBlob(
  result: POSHAssessmentResult,
  userDetails: UserDetails
): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const highPriorityItems = result.actionItems.filter(a => a.priority === 'high');
  const mediumPriorityItems = result.actionItems.filter(a => a.priority === 'medium');
  const lowPriorityItems = result.actionItems.filter(a => a.priority === 'low');
  
  generateCoverPage(doc, userDetails, result);
  generateExecutiveSummary(doc, userDetails, result);
  
  let currentPage = 3;
  currentPage = generateActionItemsPages(doc, userDetails, highPriorityItems, 'high', currentPage);
  currentPage++;
  currentPage = generateActionItemsPages(doc, userDetails, mediumPriorityItems, 'medium', currentPage);
  currentPage++;
  currentPage = generateActionItemsPages(doc, userDetails, lowPriorityItems, 'low', currentPage);
  currentPage++;
  currentPage = generateCompliantAreasPage(doc, userDetails, result.compliantItems, currentPage);
  currentPage++;
  generateNextStepsPage(doc, userDetails, result, currentPage);
  
  return doc.output('blob');
}
