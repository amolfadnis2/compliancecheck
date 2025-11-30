'use client'

import { useState } from 'react'
import { FeedbackForm } from '@/components/feedback/feedback-form'
import { posthog } from '@/components/providers/posthog-provider'

interface DownloadButtonsProps {
  assessmentId: string
  assessmentType: string
  companyName: string
  employeeCount: string
  state: string
  overallScore: number
  categoryScores: Record<string, number>
  actionItems: Array<{
    priority: string
    text: string
    category: string
  }>
  responses: Record<string, string>
}

export function DownloadButtonsWithFeedback({
  assessmentId,
  assessmentType,
  companyName,
  employeeCount,
  state,
  overallScore,
  categoryScores,
  actionItems,
  responses,
}: DownloadButtonsProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackCompleted, setFeedbackCompleted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadClick = () => {
    // Track download intent
    posthog.capture('download_report_clicked', {
      assessment_type: assessmentType,
      assessment_id: assessmentId,
      feedback_completed: feedbackCompleted,
    })

    // If feedback not yet given, show form first
    if (!feedbackCompleted) {
      setShowFeedback(true)
    } else {
      generateAndDownloadPDF()
    }
  }

  const handleFeedbackComplete = () => {
    setFeedbackCompleted(true)
    setShowFeedback(false)
    // Auto-trigger download after feedback
    generateAndDownloadPDF()
  }

  const handleSkipFeedback = () => {
    posthog.capture('feedback_skipped', {
      assessment_type: assessmentType,
      assessment_id: assessmentId,
    })
    setFeedbackCompleted(true)
    setShowFeedback(false)
    generateAndDownloadPDF()
  }

  const generateAndDownloadPDF = async () => {
    setIsGenerating(true)
    
    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let y = margin

      // Helper functions
      const addText = (text: string, x: number, yPos: number, options: { fontSize?: number; fontStyle?: string; color?: number[] } = {}) => {
        doc.setFontSize(options.fontSize || 10)
        doc.setFont('helvetica', options.fontStyle || 'normal')
        if (options.color) {
          doc.setTextColor(options.color[0], options.color[1], options.color[2])
        } else {
          doc.setTextColor(0, 0, 0)
        }
        doc.text(text, x, yPos)
      }

      const addNewPage = () => {
        doc.addPage()
        y = margin
      }

      const checkPageBreak = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - margin) {
          addNewPage()
        }
      }

      // --- COVER PAGE ---
      // Header bar
      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, pageWidth, 40, 'F')
      
      addText('ComplianceCheck', margin, 20, { fontSize: 20, fontStyle: 'bold', color: [255, 255, 255] })
      addText('Compliance Assessment Report', margin, 30, { fontSize: 12, color: [200, 220, 255] })

      y = 60

      // Report title
      const reportTitle = assessmentType === 'statutory_health' 
        ? 'Statutory Compliance Health Check'
        : 'Labour Code Readiness Assessment'
      addText(reportTitle, margin, y, { fontSize: 18, fontStyle: 'bold' })
      y += 15

      // Company info box
      doc.setFillColor(249, 250, 251)
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 3, 3, 'F')
      y += 10
      addText(`Company: ${companyName}`, margin + 5, y, { fontSize: 11 })
      y += 8
      addText(`Employees: ${employeeCount}`, margin + 5, y, { fontSize: 10, color: [100, 100, 100] })
      addText(`State: ${state}`, margin + 80, y, { fontSize: 10, color: [100, 100, 100] })
      y += 8
      addText(`Report ID: ${assessmentId.slice(0, 8).toUpperCase()}`, margin + 5, y, { fontSize: 10, color: [100, 100, 100] })
      addText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, margin + 80, y, { fontSize: 10, color: [100, 100, 100] })
      y += 20

      // Overall Score
      const scoreColor = overallScore >= 80 ? [5, 150, 105] : overallScore >= 50 ? [217, 119, 6] : [220, 38, 38]
      const statusText = overallScore >= 80 ? 'COMPLIANT' : overallScore >= 50 ? 'NEEDS ATTENTION' : 'AT RISK'
      
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2])
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 3, 3, 'F')
      
      addText('Overall Compliance Score', margin + 10, y + 15, { fontSize: 12, color: [255, 255, 255] })
      addText(`${overallScore}%`, margin + 10, y + 35, { fontSize: 28, fontStyle: 'bold', color: [255, 255, 255] })
      addText(statusText, pageWidth - margin - 50, y + 30, { fontSize: 14, fontStyle: 'bold', color: [255, 255, 255] })
      y += 65

      // Category Scores
      addText('Category Breakdown', margin, y, { fontSize: 14, fontStyle: 'bold' })
      y += 10

      Object.entries(categoryScores).forEach(([category, score]) => {
        checkPageBreak(15)
        const catColor = score >= 80 ? [5, 150, 105] : score >= 50 ? [217, 119, 6] : [220, 38, 38]
        
        // Category name
        const displayName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        addText(displayName, margin, y, { fontSize: 10 })
        
        // Score bar background
        doc.setFillColor(229, 231, 235)
        doc.roundedRect(margin + 70, y - 4, 80, 6, 2, 2, 'F')
        
        // Score bar fill
        doc.setFillColor(catColor[0], catColor[1], catColor[2])
        doc.roundedRect(margin + 70, y - 4, (score / 100) * 80, 6, 2, 2, 'F')
        
        // Score text
        addText(`${score}%`, margin + 155, y, { fontSize: 10, fontStyle: 'bold', color: catColor })
        y += 12
      })

      // --- ACTION ITEMS PAGE ---
      addNewPage()
      addText('Action Items', margin, y, { fontSize: 16, fontStyle: 'bold' })
      y += 15

      const highPriority = actionItems.filter(item => item.priority === 'high')
      const mediumPriority = actionItems.filter(item => item.priority === 'medium')
      const lowPriority = actionItems.filter(item => item.priority === 'low')

      const renderActionItems = (items: typeof actionItems, priorityLabel: string, color: number[]) => {
        if (items.length === 0) return

        checkPageBreak(20)
        doc.setFillColor(color[0], color[1], color[2])
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 8, 2, 2, 'F')
        addText(`${priorityLabel} PRIORITY (${items.length})`, margin + 5, y + 6, { fontSize: 10, fontStyle: 'bold', color: [255, 255, 255] })
        y += 15

        items.forEach(item => {
          checkPageBreak(20)
          const lines = doc.splitTextToSize(item.text, pageWidth - 2 * margin - 10)
          lines.forEach((line: string, idx: number) => {
            if (idx === 0) {
              addText('*', margin, y, { fontSize: 10 })
            }
            addText(line, margin + 8, y, { fontSize: 9 })
            y += 5
          })
          addText(`Category: ${item.category.replace(/_/g, ' ')}`, margin + 8, y, { fontSize: 8, color: [100, 100, 100] })
          y += 10
        })
      }

      renderActionItems(highPriority, 'HIGH', [220, 38, 38])
      renderActionItems(mediumPriority, 'MEDIUM', [217, 119, 6])
      renderActionItems(lowPriority, 'LOW', [100, 116, 139])

      // --- COMPLIANT ITEMS ---
      if (Object.values(responses).some(r => r === 'yes')) {
        checkPageBreak(30)
        y += 10
        addText('Compliant Areas', margin, y, { fontSize: 14, fontStyle: 'bold', color: [5, 150, 105] })
        y += 10

        Object.entries(responses).forEach(([questionId, answer]) => {
          if (answer === 'yes') {
            checkPageBreak(10)
            addText('[PASS] ' + questionId.replace(/_/g, ' ').toUpperCase(), margin, y, { fontSize: 9, color: [5, 150, 105] })
            y += 7
          }
        })
      }

      // --- FOOTER ---
      addNewPage()
      addText('Important Resources', margin, y, { fontSize: 14, fontStyle: 'bold' })
      y += 12

      const resources = [
        { name: 'EPFO Unified Portal', url: 'unifiedportal-mem.epfindia.gov.in' },
        { name: 'ESIC Portal', url: 'esic.gov.in' },
        { name: 'Ministry of Labour', url: 'labour.gov.in' },
        { name: 'Shram Suvidha Portal', url: 'shramsuvidha.gov.in' },
      ]

      resources.forEach(res => {
        addText(`* ${res.name}: ${res.url}`, margin, y, { fontSize: 9 })
        y += 7
      })

      y += 15

      // Disclaimer
      doc.setFillColor(254, 243, 199)
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 35, 3, 3, 'F')
      y += 8
      addText('DISCLAIMER', margin + 5, y, { fontSize: 10, fontStyle: 'bold', color: [146, 64, 14] })
      y += 7
      const disclaimerText = 'This report is for informational purposes only and does not constitute legal advice. Consult a qualified professional for specific compliance guidance.'
      const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin - 10)
      disclaimerLines.forEach((line: string) => {
        addText(line, margin + 5, y, { fontSize: 8, color: [146, 64, 14] })
        y += 5
      })

      // Footer on all pages
      const totalPages = doc.internal.pages.length - 1
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.text('Generated by ComplianceCheck | compliancecheck-app.netlify.app', pageWidth / 2, pageHeight - 5, { align: 'center' })
      }

      // Save the PDF
      const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

      // Track successful download
      posthog.capture('report_downloaded', {
        assessment_type: assessmentType,
        assessment_id: assessmentId,
        overall_score: overallScore,
        file_name: fileName,
      })

    } catch (error) {
      console.error('PDF generation failed:', error)
      posthog.capture('report_download_failed', {
        assessment_type: assessmentType,
        assessment_id: assessmentId,
        error: String(error),
      })
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {showFeedback && (
        <FeedbackForm
          assessmentType={assessmentType}
          assessmentId={assessmentId}
          onComplete={handleFeedbackComplete}
          onSkip={handleSkipFeedback}
        />
      )}

      <button
        onClick={handleDownloadClick}
        disabled={isGenerating}
        className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
        }`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF Report
          </>
        )}
      </button>
    </>
  )
}
