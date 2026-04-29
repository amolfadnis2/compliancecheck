'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { LawExposure, AssessmentKey } from '@/lib/calculators/penalty-exposure/types'
import { formatRupees } from '@/lib/calculators/penalty-exposure/calculator'
import { trackEvent } from '@/lib/analytics'

interface Props {
  topRisks: LawExposure[]
}

const ASSESSMENT_CONFIG: Record<
  AssessmentKey,
  { name: string; href: string; price: string; free: boolean }
> = {
  'statutory-health-check': {
    name: 'Statutory Health Check',
    href: '/assessment/statutory-health',
    price: 'FREE',
    free: true,
  },
  'labour-code-readiness': {
    name: 'Labour Code Readiness',
    href: '/assessment/labour-code',
    price: 'FREE',
    free: true,
  },
  'dpdp-gap-assessment': {
    name: 'DPDP Gap Assessment',
    href: '/assessment/dpdp',
    price: '₹2,499',
    free: false,
  },
  'posh-compliance': {
    name: 'POSH Compliance',
    href: '/assessment/posh',
    price: 'FREE',
    free: true,
  },
  'state-wise-compliance': {
    name: 'State-Wise Compliance',
    href: '/assessment/state-wise-compliance',
    price: 'FREE',
    free: true,
  },
  'food-business': {
    name: 'Food Business',
    href: '/assessment/food-business',
    price: 'FREE',
    free: true,
  },
}

const RISK_REMEDIATION: Record<string, string> = {
  dpdp_security: 'Conduct a DPDP gap assessment; appoint a Data Protection Officer; implement access controls and encryption.',
  dpdp_breach_notification: 'Draft and test an incident response plan with a 72-hour DPB notification workflow.',
  dpdp_children: 'Map data flows for minors; implement verifiable parental consent before processing.',
  dpdp_sdf: 'Register as Significant Data Fiduciary; complete Data Protection Impact Assessment (DPIA).',
  dpdp_rights: 'Build a Data Principal rights portal with automated erasure and correction workflows.',
  posh_no_icc: 'Constitute an Internal Committee immediately; include an external member; display IC contact details at workplace.',
  posh_annual_return: 'File annual return to District Officer by January 31; maintain records of all proceedings.',
  epf_late_payment: 'Automate EPF ECR and remittance via EPFO portal by the 15th of each month.',
  esi_late_payment: 'Set up auto-debit on ESIC portal; audit covered employee count quarterly.',
  code_on_wages: 'Audit all wage components against the 50% basic wage rule under Code on Wages.',
  fssai_no_license: 'Apply for FSSAI State licence via FoSCoS portal immediately; display licence at premises.',
  factories_act: 'Register factory with state Inspector of Factories; renew all hazardous process permits.',
  osh_hazardous: 'Designate a safety officer; constitute a safety committee; conduct quarterly safety audits.',
  gratuity_non_payment: 'Set up Group Gratuity Insurance; pay within 30 days of employee separation.',
  gst_late_filing: 'Enable auto-debit on GST portal; set reminders for 11th (GSTR-1) and 20th (GSTR-3B).',
  companies_act_late_filing: 'Use MCA21 reminder service; file AOC-4 and MGT-7 before October 31 each year.',
  epf_wilful_default: 'Ensure no false declarations are filed with EPFO; maintain accurate ECR records.',
  esi_late_payment_criminal: 'Maintain ESIC filing records; avoid wilful default which carries criminal liability.',
  osh_standing_orders: 'Draft and register Standing Orders under OSH Code; display at workplace.',
}

export function TopRisksList({ topRisks }: Props) {
  if (topRisks.length === 0) return null

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Top {topRisks.length} Risk Areas
      </h3>
      <div className="space-y-3">
        {topRisks.map((risk, idx) => {
          const assessment = risk.relatedAssessment
            ? ASSESSMENT_CONFIG[risk.relatedAssessment]
            : null

          return (
            <div
              key={risk.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900/40 dark:text-red-400">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {risk.law}
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {formatRupees(risk.typicalAnnualRisk)} typical
                      </Badge>
                      {risk.isCriminal && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          Criminal risk
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                      {risk.violation}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                      {RISK_REMEDIATION[risk.id] ?? 'Consult a compliance professional for remediation steps.'}
                    </p>
                    {risk.note && (
                      <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Note: {risk.note}
                      </p>
                    )}
                  </div>
                </div>
                {assessment && (
                  <div className="flex-shrink-0">
                    <Button
                      asChild
                      size="sm"
                      variant={assessment.free ? 'default' : 'outline'}
                      className={
                        assessment.free
                          ? 'bg-blue-700 hover:bg-blue-800 text-white'
                          : 'border-blue-700 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400'
                      }
                      onClick={() =>
                        trackEvent('penalty_assessment_cta_clicked', {
                          assessment_type: risk.relatedAssessment ?? '',
                          law: risk.law,
                          typical_risk: risk.typicalAnnualRisk,
                        })
                      }
                    >
                      <Link href={assessment.href}>
                        {assessment.name}
                        <span className="ml-1 text-xs opacity-75">
                          {assessment.free ? '(FREE)' : `(${assessment.price})`}
                        </span>
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600">
                <ExternalLink className="h-3 w-3" />
                <span>{risk.governmentRef}</span>
                <span>·</span>
                <span>Max statutory: {risk.isCriminal ? 'Criminal liability' : formatRupees(risk.maxStatutoryPenalty)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
