'use client'

import { useEffect, useState } from 'react'
import { LocalStorageResultsPage } from '@/components/results/local-storage-results'
import { ASSESSMENT_TYPES, getLocalStorageKey } from '@/lib/constants/assessment-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FlaskConical } from 'lucide-react'

// ============================================================================
// DEMO DATA - Realistic sample data for each assessment type
// ============================================================================

const DEMO_DATA = {
  [ASSESSMENT_TYPES.STATUTORY_HEALTH]: {
    id: 'demo-statutory-health',
    assessment_type: ASSESSMENT_TYPES.STATUTORY_HEALTH,
    status: 'completed',
    overall_score: 67,
    category_scores: {
      pf: { score: 20, max: 20, percentage: 100 },
      esi: { score: 18, max: 25, percentage: 72 },
      pt: { score: 10, max: 20, percentage: 50 },
      gratuity: { score: 8, max: 15, percentage: 53 },
      bonus: { score: 12, max: 20, percentage: 60 }
    },
    responses: {
      userDetails: {
        companyName: 'Demo Tech Solutions Pvt Ltd',
        employeeCount: '50-99',
        state: 'Maharashtra',
        email: 'demo@example.com'
      },
      answers: {
        pf_1: 'yes',
        pf_2: 'yes',
        esi_1: 'yes',
        esi_2: 'no',
        esi_3: 'yes',
        pt_1: 'yes',
        pt_2: 'no',
        pt_3: 'no',
        gratuity_1: 'no',
        gratuity_2: 'no',
        bonus_1: 'yes',
        bonus_2: 'no'
      }
    },
    userDetails: {
      companyName: 'Demo Tech Solutions Pvt Ltd',
      employeeCount: '50-99',
      state: 'Maharashtra',
      email: 'demo@example.com'
    },
    created_at: new Date().toISOString()
  },

  [ASSESSMENT_TYPES.LABOUR_CODE]: {
    id: 'demo-labour-code',
    assessment_type: ASSESSMENT_TYPES.LABOUR_CODE,
    status: 'completed',
    overall_score: 72,
    category_scores: {
      wages: { score: 15, max: 20, percentage: 75 },
      social_security: { score: 18, max: 25, percentage: 74 },
      osh: { score: 20, max: 20, percentage: 100 },
      industrial_relations: { score: 8, max: 15, percentage: 49 }
    },
    responses: {
      userDetails: {
        companyName: 'Demo Manufacturing Ltd',
        industry: 'manufacturing',
        employeeCount: '100-299',
        state: 'Gujarat',
        email: 'demo@example.com'
      },
      answers: {
        wages_1: 'yes',
        wages_2: 'yes',
        wages_3: 'no',
        wages_4: 'yes',
        wages_5: 'no',
        wages_6: 'yes',
        wages_7: 'yes',
        ss_1: 'yes',
        ss_2: 'yes',
        ss_3: 'no',
        ss_4: 'yes',
        ss_5: 'no',
        ss_6: 'no',
        ss_7: 'yes',
        ss_8: 'yes',
        osh_1: 'yes',
        osh_2: 'yes',
        osh_3: 'yes',
        osh_4: 'yes',
        osh_5: 'yes',
        osh_6: 'yes',
        osh_7: 'yes',
        osh_8: 'yes',
        industrial_relations_1: 'no',
        industrial_relations_2: 'no',
        industrial_relations_3: 'no',
        industrial_relations_4: 'yes',
        industrial_relations_5: 'no',
        industrial_relations_6: 'yes',
        industrial_relations_7: 'yes'
      }
    },
    userDetails: {
      companyName: 'Demo Manufacturing Ltd',
      industry: 'manufacturing',
      employeeCount: '100-299',
      state: 'Gujarat',
      email: 'demo@example.com'
    },
    created_at: new Date().toISOString()
  },

  [ASSESSMENT_TYPES.DPDP]: {
    id: 'demo-dpdp',
    assessment_type: ASSESSMENT_TYPES.DPDP,
    status: 'completed',
    overall_score: 58,
    category_scores: {
      consent: { score: 14, max: 20, percentage: 70 },
      security: { score: 12, max: 20, percentage: 60 },
      rights: { score: 8, max: 15, percentage: 53 },
      breach: { score: 10, max: 15, percentage: 67 },
      children: { score: 6, max: 15, percentage: 40 },
      governance: { score: 8, max: 15, percentage: 53 }
    },
    responses: {
      userDetails: {
        companyName: 'Demo Fintech Startup',
        industry: 'bfsi',
        employeeCount: '20-49',
        state: 'Karnataka',
        email: 'demo@example.com'
      },
      answers: {
        consent_1: 'Explicit consent with granular purpose-specific options',
        consent_2: 'Yes, through same mechanism used to give consent (equally easy)',
        consent_3: 'no',
        consent_4: 'yes',
        consent_5: 'no',
        consent_6: 'no',
        consent_7: 'no',
        consent_8: 'yes',
        consent_9: 'no',
        security_1: 'Yes, AES-256 or equivalent encryption for all personal data',
        security_2: 'Yes, TLS 1.3 for all data transfers',
        security_3: 'no',
        security_4: 'yes',
        security_5: 'no',
        security_6: 'no',
        security_7: 'yes',
        security_8: 'no',
        security_9: 'no',
        rights_1: 'no',
        rights_2: 'yes',
        rights_3: 'no',
        rights_4: 'yes',
        rights_5: 'no',
        rights_6: 'no',
        breach_1: 'yes',
        breach_2: 'no',
        breach_3: 'yes',
        breach_4: 'yes',
        breach_5: 'no',
        children_1: 'no',
        children_2: 'no',
        children_3: 'yes',
        children_4: 'no',
        children_5: 'no',
        gov_1: 'no',
        gov_2: 'no',
        gov_3: 'yes',
        gov_4: 'no'
      }
    },
    userDetails: {
      companyName: 'Demo Fintech Startup',
      industry: 'bfsi',
      employeeCount: '20-49',
      state: 'Karnataka',
      email: 'demo@example.com'
    },
    created_at: new Date().toISOString()
  },

  [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE]: {
    id: 'demo-state-wise',
    assessment_type: ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE,
    status: 'completed',
    overall_score: 61,
    userDetails: {
      companyName: 'Demo Retail Chain',
      employeeCount: '50-99',
      state: 'Tamil Nadu',
      email: 'demo@example.com'
    },
    phase2Responses: {},
    scoreResult: {
      overallScore: 61,
      categoryScores: {
        'Labour Welfare Fund': { percentage: 80 },
        'Shops & Establishments': { percentage: 100 },
        'Professional Tax': { percentage: 45 },
        'Contract Labour': { percentage: 60 },
        'Factory Compliance': { percentage: 40 }
      },
      gaps: [
        { question: { category: 'Professional Tax', text: 'Monthly PT returns not filed' }, recommendation: 'File monthly PT returns by 20th of each month' },
        { question: { category: 'Professional Tax', text: 'PTEC registration missing' }, recommendation: 'Obtain PT Enrollment Certificate from state authorities' },
        { question: { category: 'Factory Compliance', text: 'Annual factory license renewal pending' }, recommendation: 'Renew factory license before expiry to avoid penalties' },
        { question: { category: 'Contract Labour', text: 'Contract labour register not maintained' }, recommendation: 'Maintain Form XIII register for all contract workers' }
      ],
      compliantItems: [
        { question: { category: 'Shops & Establishments', text: 'S&E registration valid and displayed' } },
        { question: { category: 'Shops & Establishments', text: 'Working hours within prescribed limits' } },
        { question: { category: 'Labour Welfare Fund', text: 'LWF contributions paid on time' } }
      ]
    },
    created_at: new Date().toISOString()
  },

  [ASSESSMENT_TYPES.POSH]: {
    id: 'demo-posh',
    assessment_type: ASSESSMENT_TYPES.POSH,
    status: 'completed',
    overall_score: 68,
    category_scores: {
      icc_constitution: { score: 20, max: 25, percentage: 80 },
      policy_documentation: { score: 14, max: 20, percentage: 70 },
      training_awareness: { score: 12, max: 20, percentage: 60 },
      display_communication: { score: 8, max: 10, percentage: 80 },
      reporting_monitoring: { score: 9, max: 15, percentage: 60 },
      complaint_handling: { score: 5, max: 10, percentage: 50 }
    },
    responses: {
      userDetails: {
        companyName: 'Demo IT Services Pvt Ltd',
        industry: 'it_services',
        employeeCount: '100-299',
        state: 'Karnataka',
        email: 'demo@example.com'
      },
      answers: {
        // ICC Constitution - mostly compliant
        posh_icc_1: 'yes',
        posh_icc_2: 'yes',
        posh_icc_3: 'no',
        posh_icc_4: 'yes',
        posh_icc_5: 'yes',
        // Policy - partial
        posh_policy_1: 'yes',
        posh_policy_2: 'no',
        posh_policy_3: 'yes',
        posh_policy_4: 'no',
        // Training - needs work
        posh_training_1: 'no',
        posh_training_2: 'yes',
        posh_training_3: 'no',
        posh_training_4: 'yes',
        // Display - good
        posh_display_1: 'yes',
        posh_display_2: 'yes',
        // Reporting - partial
        posh_reporting_1: 'yes',
        posh_reporting_2: 'no',
        posh_reporting_3: 'yes',
        // Complaint handling - needs attention
        posh_complaint_1: 'no',
        posh_complaint_2: 'yes'
      }
    },
    userDetails: {
      companyName: 'Demo IT Services Pvt Ltd',
      industry: 'it_services',
      employeeCount: '100-299',
      state: 'Karnataka',
      email: 'demo@example.com'
    },
    created_at: new Date().toISOString()
  },

  [ASSESSMENT_TYPES.FOOD_BUSINESS]: {
    id: 'demo-food-business',
    assessment_type: ASSESSMENT_TYPES.FOOD_BUSINESS,
    status: 'completed',
    overall_score: 71,
    category_scores: {
      FSSAI: { score: 18, max: 20, percentage: 90 },
      GST: { score: 8, max: 10, percentage: 80 },
      BUSINESS_REG: { score: 12, max: 15, percentage: 80 },
      FIRE_SAFETY: { score: 6, max: 10, percentage: 60 },
      LABOR: { score: 9, max: 15, percentage: 60 },
      LIQUOR: { score: 10, max: 15, percentage: 67 },
      HEALTH: { score: 7, max: 10, percentage: 70 },
      SPECIAL: { score: 2, max: 5, percentage: 40 }
    },
    responses: {
      userDetails: {
        companyName: 'Demo Cuisine Restaurant',
        businessFormat: 'restaurant',
        employeeCount: '10-19',
        state: 'Maharashtra',
        email: 'demo@example.com',
        servesAlcohol: true,
        seatingCapacity: '50-100'
      },
      answers: {
        // FSSAI - strong
        food_fssai_1: 'yes',
        food_fssai_2: 'yes',
        food_fssai_3: 'yes',
        food_fssai_4: 'no',
        // GST - good
        food_gst_1: 'yes',
        food_gst_2: 'yes',
        // Business Reg - good
        food_reg_1: 'yes',
        food_reg_2: 'yes',
        food_reg_3: 'no',
        // Fire Safety - needs work
        food_fire_1: 'yes',
        food_fire_2: 'no',
        food_fire_3: 'no',
        // Labor - partial
        food_labor_1: 'yes',
        food_labor_2: 'no',
        food_labor_3: 'yes',
        // Liquor - partial
        food_liquor_1: 'yes',
        food_liquor_2: 'yes',
        food_liquor_3: 'no',
        // Health - good
        food_health_1: 'yes',
        food_health_2: 'yes',
        food_health_3: 'no',
        // Special - weak
        food_special_1: 'no',
        food_special_2: 'no'
      }
    },
    userDetails: {
      companyName: 'Demo Cuisine Restaurant',
      businessFormat: 'restaurant',
      employeeCount: '10-19',
      state: 'Maharashtra',
      email: 'demo@example.com'
    },
    created_at: new Date().toISOString()
  }
}

// ============================================================================
// DEMO PAGE COMPONENT
// ============================================================================

type AssessmentTypeKey = keyof typeof DEMO_DATA

export default function DemoResultsPage() {
  const [selectedType, setSelectedType] = useState<AssessmentTypeKey>(ASSESSMENT_TYPES.LABOUR_CODE)
  const [isReady, setIsReady] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  // Inject demo data into localStorage when type changes
  useEffect(() => {
    // Reset ready state first
    setIsReady(false)
    
    const demoData = DEMO_DATA[selectedType]
    if (demoData) {
      const storageKey = getLocalStorageKey(demoData.id)
      localStorage.setItem(storageKey, JSON.stringify(demoData))
      
      // Small delay to ensure localStorage is updated, then trigger re-render
      const timer = setTimeout(() => {
        setRenderKey(prev => prev + 1)
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [selectedType])
  
  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      Object.values(DEMO_DATA).forEach(data => {
        const key = getLocalStorageKey(data.id)
        localStorage.removeItem(key)
      })
    }
  }, [])

  const assessmentTypes = [
    { key: ASSESSMENT_TYPES.STATUTORY_HEALTH, label: 'Statutory Health', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { key: ASSESSMENT_TYPES.LABOUR_CODE, label: 'Labour Code', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { key: ASSESSMENT_TYPES.DPDP, label: 'DPDP Gap', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { key: ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE, label: 'State-Wise', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
    { key: ASSESSMENT_TYPES.POSH, label: 'POSH', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200' },
    { key: ASSESSMENT_TYPES.FOOD_BUSINESS, label: 'Food Business', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' }
  ]

  const currentDemo = DEMO_DATA[selectedType]
  
  // Get category count safely for any assessment type
  const getCategoryCount = () => {
    if ('category_scores' in currentDemo && currentDemo.category_scores) {
      return Object.keys(currentDemo.category_scores).length
    }
    if ('scoreResult' in currentDemo && currentDemo.scoreResult?.categoryScores) {
      return Object.keys(currentDemo.scoreResult.categoryScores).length
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo Mode Banner */}
      <div className="bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium sticky top-0 z-50">
        <FlaskConical className="w-4 h-4 inline-block mr-2" />
        DEMO MODE - This page shows sample data for design iteration. Not real assessment results.
      </div>

      {/* Type Selector */}
      <div className="bg-white border-b shadow-sm sticky top-8 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 mr-2">Assessment Type:</span>
              {assessmentTypes.map((type) => (
                <Button
                  key={type.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType(type.key as AssessmentTypeKey)}
                  className={`${
                    selectedType === type.key 
                      ? type.color + ' ring-2 ring-offset-1 ring-gray-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Info Card */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Card className="border-amber-200 bg-amber-50 mb-4">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <FlaskConical className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  <strong>Demo Data:</strong> {currentDemo.userDetails?.companyName || 'Demo Company'} | 
                  Score: {currentDemo.overall_score}% | 
                  {getCategoryCount()} categories
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  This component uses the same <code className="bg-amber-100 px-1 rounded">LocalStorageResultsPage</code> as production - any changes there will reflect here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actual Results Component - Same as production */}
      {isReady && (
        <LocalStorageResultsPage 
          key={renderKey}
          id={currentDemo.id} 
          assessmentType={selectedType} 
        />
      )}
    </div>
  )
}
