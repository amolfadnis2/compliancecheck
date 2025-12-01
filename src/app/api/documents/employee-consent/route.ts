import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { 
  DATA_CATEGORIES, 
  PROCESSING_PURPOSES, 
  LEGAL_CLAUSES,
  RETENTION_PERIODS 
} from '@/lib/templates/employee-consent-data'

// ASCII-safe text replacement (matches download-buttons.tsx pattern)
function toASCII(text: string): string {
  return text
    .replace(/✓/g, '[PASS]')
    .replace(/✗/g, '[FAIL]')
    .replace(/⚠/g, '[WARNING]')
    .replace(/₹/g, 'Rs.')
    .replace(/•/g, '*')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
}

// Text wrapping for PDF
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = doc.getTextWidth(testLine)
    
    if (width > maxWidth) {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })
  
  if (currentLine) lines.push(currentLine)
  return lines
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Initialize PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - (2 * margin)
    let yPos = margin

    // Helper to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage()
        yPos = margin
        return true
      }
      return false
    }

    // Helper to write wrapped text
    const writeText = (text: string, fontSize: number, isBold = false, indent = 0) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = wrapText(doc, toASCII(text), contentWidth - indent)
      lines.forEach(line => {
        checkPageBreak(7)
        doc.text(line, margin + indent, yPos)
        yPos += fontSize * 0.5
      })
    }

    // ============================================================
    // PAGE 1: HEADER & TITLE
    // ============================================================
    
    // Header bar
    doc.setFillColor(30, 64, 175) // Blue
    doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('EMPLOYEE DATA CONSENT FORM', pageWidth / 2, 12, { align: 'center' })
    
    yPos = 35
    doc.setTextColor(0, 0, 0)

    // Company Details Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('COMPANY DETAILS', margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Company Name: ${toASCII(formData.companyName)}`, margin, yPos)
    yPos += 6
    doc.text(`Address: ${toASCII(formData.companyAddress)}`, margin, yPos)
    yPos += 6
    doc.text(`${toASCII(formData.companyCity)}, ${toASCII(formData.companyState)} - ${formData.companyPincode}`, margin, yPos)
    yPos += 6

    if (formData.gstin) {
      doc.text(`GSTIN: ${formData.gstin}`, margin, yPos)
      yPos += 6
    }
    if (formData.pan) {
      doc.text(`PAN: ${formData.pan}`, margin, yPos)
      yPos += 6
    }

    yPos += 5

    // Separator line
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    // ============================================================
    // INTRODUCTION
    // ============================================================
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('PURPOSE OF THIS FORM', margin, yPos)
    yPos += 8

    const introText = `This consent form is issued in compliance with the Digital Personal Data Protection Act, 2023. By signing this form, you authorize ${formData.companyName} to collect, process, and store your personal data for specified lawful purposes related to your employment.`
    writeText(introText, 10, false, 0)
    yPos += 10

    // ============================================================
    // EMPLOYEE INFORMATION SECTION
    // ============================================================
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 1: EMPLOYEE INFORMATION', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const employeeFields = [
      'Full Name (as per Aadhaar): _________________________________',
      'Employee ID: _________________________________',
      'Department: _________________________________',
      'Designation: _________________________________',
      'Date of Joining: _________________________________',
      'Email Address: _________________________________',
      'Mobile Number: _________________________________'
    ]

    employeeFields.forEach(field => {
      checkPageBreak(6)
      doc.text(field, margin, yPos)
      yPos += 7
    })

    yPos += 5

    // ============================================================
    // DATA CATEGORIES BEING COLLECTED
    // ============================================================
    
    checkPageBreak(20)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 2: PERSONAL DATA BEING COLLECTED', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    writeText('The Company will collect and process the following categories of your personal data:', 10, false, 0)
    yPos += 3

    formData.dataCategories.forEach((catId: string) => {
      const category = DATA_CATEGORIES.find(c => c.id === catId)
      if (!category) return

      checkPageBreak(15)
      
      // Category name (bold)
      doc.setFont('helvetica', 'bold')
      doc.text(`* ${toASCII(category.label)}`, margin + 3, yPos)
      yPos += 5
      
      // Description
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      writeText(`  ${category.description}`, 9, false, 5)
      
      // Examples
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      writeText(`  Includes: ${category.examples.join(', ')}`, 9, false, 5)
      doc.setTextColor(0, 0, 0)
      yPos += 3
    })

    yPos += 5

    // ============================================================
    // PROCESSING PURPOSES
    // ============================================================
    
    checkPageBreak(20)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 3: PURPOSE OF DATA PROCESSING', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    writeText('Your personal data will be processed for the following lawful purposes:', 10, false, 0)
    yPos += 3

    formData.processingPurposes.forEach((purposeId: string) => {
      const purpose = PROCESSING_PURPOSES.find(p => p.id === purposeId)
      if (!purpose) return

      checkPageBreak(10)
      
      doc.setFont('helvetica', 'bold')
      doc.text(`* ${toASCII(purpose.label)}`, margin + 3, yPos)
      yPos += 5
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      writeText(`  ${purpose.description}`, 9, false, 5)
      yPos += 2
    })

    yPos += 5

    // ============================================================
    // THIRD PARTY DISCLOSURE
    // ============================================================
    
    checkPageBreak(25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 4: THIRD PARTY DISCLOSURE', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    if (formData.sharesWithThirdParties && formData.thirdPartyCategories.length > 0) {
      writeText('The Company may share your personal data with the following categories of third parties:', 10, false, 0)
      yPos += 3

      formData.thirdPartyCategories.forEach((category: string) => {
        checkPageBreak(6)
        doc.text(`* ${toASCII(category)}`, margin + 3, yPos)
        yPos += 5
      })

      yPos += 3
      writeText('Third parties are contractually bound to maintain confidentiality and use your data only for the specified purposes.', 10, false, 0)
    } else {
      writeText('The Company does not share your personal data with any third parties, except as required by law or for statutory compliance (e.g., EPF, ESI, Income Tax authorities).', 10, false, 0)
    }

    yPos += 10

    // ============================================================
    // DATA SECURITY STATEMENT
    // ============================================================
    
    checkPageBreak(40)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 5: DATA SECURITY MEASURES', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    writeText(LEGAL_CLAUSES.dataSecurityStatement, 10, false, 0)
    yPos += 10

    // ============================================================
    // DATA RETENTION
    // ============================================================
    
    checkPageBreak(15)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 6: DATA RETENTION PERIOD', margin, yPos)
    yPos += 8

    const retentionLabel = RETENTION_PERIODS.find(p => p.value === formData.retentionPeriod)?.label || '7 years post-employment'
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    writeText(`Your personal data will be retained for ${retentionLabel}. After this period, data will be securely deleted or anonymized, except where longer retention is required by law.`, 10, false, 0)
    
    yPos += 3
    writeText('Legal retention requirements: EPF/ESI records (7 years), Income Tax records (7 years), Employment contracts (Permanent).', 9, false, 0)
    yPos += 10

    // ============================================================
    // DATA SUBJECT RIGHTS
    // ============================================================
    
    checkPageBreak(50)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 7: YOUR RIGHTS AS DATA PRINCIPAL', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    writeText(LEGAL_CLAUSES.dataSubjectRights, 10, false, 0)
    yPos += 10

    // ============================================================
    // CONSENT WITHDRAWAL
    // ============================================================
    
    checkPageBreak(30)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 8: WITHDRAWAL OF CONSENT', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    const withdrawalText = LEGAL_CLAUSES.consentWithdrawal
      .replace('[Company Email]', formData.grievanceOfficerEmail)
      .replace('[Company Address]', `${formData.companyAddress}, ${formData.companyCity}, ${formData.companyState} - ${formData.companyPincode}`)
    
    writeText(withdrawalText, 10, false, 0)
    yPos += 10

    // ============================================================
    // GRIEVANCE REDRESSAL
    // ============================================================
    
    checkPageBreak(25)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SECTION 9: GRIEVANCE REDRESSAL', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Grievance Officer: ${toASCII(formData.grievanceOfficerName)}`, margin, yPos)
    yPos += 6
    doc.text(`Email: ${formData.grievanceOfficerEmail}`, margin, yPos)
    yPos += 6
    doc.text(`Phone: ${formData.grievanceOfficerPhone}`, margin, yPos)
    yPos += 6
    doc.text(`Address: ${toASCII(formData.companyAddress)}, ${toASCII(formData.companyCity)}`, margin, yPos)
    yPos += 10

    writeText('We will acknowledge your complaint within 48 hours and resolve it within 30 days. If unsatisfied, you may escalate to the Data Protection Board of India.', 9, false, 0)
    yPos += 10

    // ============================================================
    // CONSENT DECLARATION
    // ============================================================
    
    checkPageBreak(50)
    doc.setFillColor(240, 248, 255) // Light blue background
    doc.rect(margin, yPos, contentWidth, 45, 'F')
    yPos += 5
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('CONSENT DECLARATION', margin + 3, yPos)
    yPos += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    const consentText = `I hereby give my free, specific, informed, and unambiguous consent to ${formData.companyName} to collect, process, store, and use my personal data as described in this form. I understand that this consent is voluntary and can be withdrawn at any time by following the procedure mentioned above. I acknowledge that I have read and understood the purpose of data collection, processing activities, my rights as a data principal, and the grievance redressal mechanism.`
    
    const consentLines = wrapText(doc, toASCII(consentText), contentWidth - 6)
    consentLines.forEach(line => {
      doc.text(line, margin + 3, yPos)
      yPos += 4
    })

    yPos += 10

    // ============================================================
    // SIGNATURE SECTION
    // ============================================================
    
    checkPageBreak(60)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('SIGNATURES', margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    // Employee signature
    doc.text('EMPLOYEE', margin, yPos)
    yPos += 8
    doc.text('Signature: _________________________________', margin, yPos)
    yPos += 8
    doc.text('Name: _________________________________', margin, yPos)
    yPos += 8
    doc.text('Date: _________________________________', margin, yPos)
    yPos += 15

    // Company representative signature
    doc.text('COMPANY REPRESENTATIVE', margin, yPos)
    yPos += 8
    doc.text('Signature: _________________________________', margin, yPos)
    yPos += 8
    doc.text('Name: _________________________________', margin, yPos)
    yPos += 8
    doc.text('Designation: _________________________________', margin, yPos)
    yPos += 8
    doc.text('Date: _________________________________', margin, yPos)
    yPos += 15

    // ============================================================
    // FOOTER DISCLAIMER
    // ============================================================
    
    checkPageBreak(30)
    doc.setFillColor(255, 243, 205) // Light amber
    doc.rect(margin, yPos, contentWidth, 25, 'F')
    yPos += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(133, 77, 14) // Amber text
    doc.text('[IMPORTANT NOTE]', margin + 3, yPos)
    yPos += 5

    doc.setFont('helvetica', 'normal')
    const disclaimerText = 'This consent form is generated by ComplianceCheck and is intended to comply with the Digital Personal Data Protection Act, 2023. This is a template document and should be reviewed by a qualified legal professional before use. ComplianceCheck is not liable for any legal consequences arising from the use of this template.'
    
    const disclaimerLines = wrapText(doc, toASCII(disclaimerText), contentWidth - 6)
    disclaimerLines.forEach(line => {
      doc.text(line, margin + 3, yPos)
      yPos += 3.5
    })
    doc.setTextColor(0, 0, 0)

    // ============================================================
    // FOOTER ON EVERY PAGE
    // ============================================================
    
    const totalPages = doc.getNumberOfPages()
    const currentDate = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated by ComplianceCheck on ${currentDate}`, margin, pageHeight - 10)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
    }

    // ============================================================
    // RETURN PDF
    // ============================================================
    
    const pdfOutput = doc.output('arraybuffer')
    
    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Employee_Consent_Form_${formData.companyName.replace(/\s+/g, '_')}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating consent form:', error)
    return NextResponse.json(
      { error: 'Failed to generate consent form' },
      { status: 500 }
    )
  }
}
