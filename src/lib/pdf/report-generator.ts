/**
 * PDF Report Generator for ComplianceCheck
 * Uses jsPDF for server-side PDF generation
 * 
 * Install: npm install jspdf
 */

import { jsPDF } from 'jspdf';

// Rupee symbol - using Unicode directly (used in price displays)
export const RUPEE_SYMBOL = '\u20B9';

interface ReportData {
  assessmentId: string;
  assessmentType: 'statutory_health' | 'labour_code' | 'dpdp';
  companyDetails: {
    companyName: string;
    industry: string;
    employeeCount: string;
    state: string;
    email: string;
  };
  scores: {
    overall: number;
    categories: Record<string, number>;
  };
  actionItems: Array<{
    priority: string;
    text: string;
    category: string;
  }>;
  completedAt: string;
}

// Colour palette
const COLOURS = {
  primary: [30, 64, 175] as [number, number, number],
  success: [5, 150, 105] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  neutral: [107, 114, 128] as [number, number, number],
  black: [17, 24, 39] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
};

function getStatusColour(score: number): [number, number, number] {
  if (score >= 80) return COLOURS.success;
  if (score >= 50) return COLOURS.warning;
  return COLOURS.danger;
}

function getStatusText(score: number): string {
  if (score >= 80) return 'Compliant';
  if (score >= 50) return 'Needs Attention';
  return 'Non-Compliant';
}


function getAssessmentTitle(type: string): string {
  switch (type) {
    case 'statutory_health': return 'Statutory Compliance Health Check';
    case 'labour_code': return 'Labour Code Readiness Assessment';
    case 'dpdp': return 'DPDP Act Gap Assessment';
    default: return 'Compliance Assessment';
  }
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generatePDFReport(data: ReportData): Promise<string> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // ===== COVER PAGE =====
  
  // Header bar
  doc.setFillColor(...COLOURS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ComplianceCheck', margin, 25);
  
  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Simplifying compliance for Indian businesses', margin, 33);
  
  yPos = 60;
  
  // Report title
  doc.setTextColor(...COLOURS.black);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(getAssessmentTitle(data.assessmentType), margin, yPos);
  yPos += 15;
  
  // Company name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOURS.neutral);
  doc.text(`Prepared for: ${data.companyDetails.companyName}`, margin, yPos);
  yPos += 8;
  
  // Date
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(data.completedAt)}`, margin, yPos);
  yPos += 20;

  // Overall Score Box
  const scoreBoxY = yPos;
  const scoreBoxHeight = 60;
  
  doc.setFillColor(...COLOURS.lightGray);
  doc.roundedRect(margin, scoreBoxY, contentWidth, scoreBoxHeight, 5, 5, 'F');
  
  // Score circle
  const circleX = margin + 50;
  const circleY = scoreBoxY + scoreBoxHeight / 2;
  const circleRadius = 22;
  
  doc.setFillColor(...getStatusColour(data.scores.overall));
  doc.circle(circleX, circleY, circleRadius, 'F');
  
  // Score text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.scores.overall}%`, circleX, circleY + 3, { align: 'center' });
  
  // Status text
  doc.setTextColor(...COLOURS.black);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(getStatusText(data.scores.overall), margin + 90, circleY - 5);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOURS.neutral);
  doc.text('Overall Compliance Score', margin + 90, circleY + 8);
  
  yPos = scoreBoxY + scoreBoxHeight + 25;
  
  // Company Details Section
  doc.setTextColor(...COLOURS.black);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Company Details', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOURS.neutral);
  
  const details = [
    ['Industry', formatCategory(data.companyDetails.industry)],
    ['Employee Count', data.companyDetails.employeeCount],
    ['Registered State', data.companyDetails.state],
    ['Assessment ID', data.assessmentId],
  ];
  
  details.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, margin, yPos);
    yPos += 6;
  });

  // ===== NEW PAGE: CATEGORY BREAKDOWN =====
  doc.addPage();
  yPos = margin;
  
  doc.setFillColor(...COLOURS.primary);
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Category-wise Breakdown', margin, 10);
  
  yPos = 30;
  
  const categories = Object.entries(data.scores.categories);
  
  categories.forEach(([category, score]) => {
    checkPageBreak(25);
    
    doc.setTextColor(...COLOURS.black);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCategory(category), margin, yPos);
    
    const scoreText = `${score}%`;
    doc.setFillColor(...getStatusColour(score));
    doc.roundedRect(pageWidth - margin - 25, yPos - 5, 25, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(scoreText, pageWidth - margin - 12.5, yPos, { align: 'center' });
    
    yPos += 8;
    
    const barWidth = contentWidth - 40;
    const barHeight = 6;
    doc.setFillColor(...COLOURS.lightGray);
    doc.roundedRect(margin, yPos, barWidth, barHeight, 2, 2, 'F');
    
    const fillWidth = (score / 100) * barWidth;
    doc.setFillColor(...getStatusColour(score));
    doc.roundedRect(margin, yPos, fillWidth, barHeight, 2, 2, 'F');
    
    yPos += 18;
  });

  // ===== ACTION ITEMS SECTION =====
  yPos += 10;
  checkPageBreak(40);
  
  doc.setTextColor(...COLOURS.black);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Prioritised Action Items', margin, yPos);
  yPos += 10;
  
  const priorityOrder = ['high', 'medium', 'low'];
  const priorityLabels: Record<string, string> = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  };
  const priorityColours: Record<string, [number, number, number]> = {
    high: COLOURS.danger,
    medium: COLOURS.warning,
    low: COLOURS.success,
  };
  
  priorityOrder.forEach((priority) => {
    const items = data.actionItems.filter((item) => item.priority === priority);
    if (items.length === 0) return;
    
    checkPageBreak(30);
    
    doc.setFillColor(...priorityColours[priority]);
    doc.roundedRect(margin, yPos, 5, 5, 1, 1, 'F');
    doc.setTextColor(...COLOURS.black);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(priorityLabels[priority], margin + 10, yPos + 4);
    yPos += 12;
    
    items.forEach((item) => {
      checkPageBreak(15);
      
      doc.setTextColor(...COLOURS.neutral);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      doc.circle(margin + 3, yPos - 1, 1.5, 'F');
      
      const textLines = doc.splitTextToSize(item.text, contentWidth - 15);
      doc.text(textLines, margin + 10, yPos);
      yPos += textLines.length * 5 + 3;
    });
    
    yPos += 5;
  });

  // ===== FOOTER =====
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setPage(pageNum);
    doc.setTextColor(...COLOURS.neutral);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    doc.setDrawColor(...COLOURS.lightGray);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.text('Generated by ComplianceCheck | compliancecheck.in', margin, pageHeight - 8);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };
  
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    addFooter(i, totalPages);
  }
  
  // Generate PDF as base64
  const pdfBase64 = doc.output('datauristring');
  
  return pdfBase64;
}

// Export PDF as blob for download
export function generatePDFBlob(data: ReportData): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add basic content with the provided data
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ComplianceCheck Report', margin, 30);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Company: ${data.companyDetails.companyName}`, margin, 50);
  doc.text(`Overall Score: ${data.scores.overall}%`, margin, 60);
  doc.text(`Assessment ID: ${data.assessmentId}`, margin, 70);
  
  doc.setFontSize(8);
  doc.text('Generated by ComplianceCheck', margin, doc.internal.pageSize.getHeight() - 10);
  doc.text(`Page 1 of 1`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  
  return doc.output('blob');
}
