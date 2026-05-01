'use client'

import { useState } from 'react'
import { CheckCircle, Circle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApplicabilityProfile } from '@/types/auto-dealer'

interface ChecklistItem {
  id: string
  category: string
  title: string
  description: string
  required: (p: ApplicabilityProfile) => boolean
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Statutory registrations
  { id: 'pan', category: 'Statutory Registrations', title: 'PAN', description: 'Permanent Account Number from Income Tax', required: () => true },
  { id: 'gstin', category: 'Statutory Registrations', title: 'GSTIN (per state)', description: 'GST registration in every state of supply', required: () => true },
  { id: 'cin', category: 'Statutory Registrations', title: 'CIN / LLPIN', description: 'MCA registration for companies/LLPs', required: p => ['pvt_ltd','public_ltd','opc','llp'].includes(p.legalForm) },
  { id: 's_and_e', category: 'Statutory Registrations', title: 'S&E Registration Certificate', description: 'Shops & Establishments registration (per outlet)', required: () => true },
  { id: 'trade_licence', category: 'Statutory Registrations', title: 'Trade Licence (ULB)', description: 'Local body trade licence (per outlet)', required: () => true },
  { id: 'trade_cert_17', category: 'Statutory Registrations', title: 'Trade Certificate Form 17', description: 'CMVR Trade Certificate (VAHAN download per vehicle class)', required: () => true },
  { id: 'trade_cert_16a', category: 'Statutory Registrations', title: 'Form 16A OEM Authorisation', description: 'OEM dealer authorisation letter (VAHAN upload)', required: () => true },
  { id: 'epf_reg', category: 'Statutory Registrations', title: 'EPF Registration + Form 5A', description: 'EPFO Establishment Code and Return of Ownership', required: p => { const e: Record<string,number>={lt_10:5,'10_19':14,'20_49':34}; return (e[p.employeeCount]??99)>=20 } },
  { id: 'esi_reg', category: 'Statutory Registrations', title: 'ESIC Employer Code', description: 'ESIC 17-digit employer code', required: p => { const e: Record<string,number>={lt_10:5,'10_19':14,'20_49':34}; return (e[p.employeeCount]??99)>=10 } },
  { id: 'ptrc', category: 'Statutory Registrations', title: 'PTRC + PTEC (per PT state)', description: 'Professional Tax Registration + Enrolment certificates', required: p => p.statesOfOperation.some(s => ['MH','KA','WB','TN','AP','TS','GJ','OD','AS'].includes(s)) },
  { id: 'factory_licence', category: 'Statutory Registrations', title: 'Factory Licence Form 4', description: 'Factory licence from state Chief Inspector of Factories', required: p => p.hasWorkshop },
  { id: 'cte', category: 'Statutory Registrations', title: 'SPCB CTE (Consent to Establish)', description: 'Consent before workshop construction', required: p => p.hasWorkshop },
  { id: 'cto', category: 'Statutory Registrations', title: 'SPCB CTO (Consent to Operate)', description: 'Consent to Operate (Air + Water Acts)', required: p => p.hasWorkshop },
  { id: 'hw_auth', category: 'Statutory Registrations', title: 'HW Authorisation (SPCB)', description: 'Hazardous Waste Authorisation under HOWM 2016', required: p => p.hasWorkshop },
  { id: 'peso_licence', category: 'Statutory Registrations', title: 'PESO Licence (Form XIV/XV)', description: 'Petroleum storage licence from PESO', required: p => p.dieselStorageLitres > 2500 },
  { id: 'fire_noc', category: 'Statutory Registrations', title: 'Fire NOC', description: 'Fire NOC from State Fire Services', required: p => p.hasWorkshop || (p.showroomAreaSqft ?? 0) > 500 },
  { id: 'misp_appointment', category: 'Statutory Registrations', title: 'MISP Appointment Letter', description: 'Annexure 1 appointment from sponsor insurer/intermediary', required: p => p.misp },
  { id: 'misp_uin', category: 'Statutory Registrations', title: 'MISP UIN + PAN mapping on IIB', description: 'Unique Identification Number on IIB portal', required: p => p.misp },
  { id: 'posh_ic', category: 'Statutory Registrations', title: 'POSH IC Constitution Order', description: 'IC constitution order with members and external expert', required: p => { const e: Record<string,number>={lt_10:5,'10_19':14}; return (e[p.employeeCount]??99)>=10 } },

  // Returns & filings
  { id: 'gstr_3b', category: 'Returns & Filings', title: 'GSTR-3B (Monthly)', description: 'Monthly GST return', required: () => true },
  { id: 'gstr_9', category: 'Returns & Filings', title: 'GSTR-9 + 9C (Annual)', description: 'Annual GST return + reconciliation', required: () => true },
  { id: 'tds_24q', category: 'Returns & Filings', title: 'TDS 24Q/26Q/27EQ (Quarterly)', description: 'TDS returns for salary, vendor payments, TCS on vehicles', required: () => true },
  { id: 'epf_ecr', category: 'Returns & Filings', title: 'EPF ECR (Monthly)', description: 'Electronic Challan cum Return', required: p => { const e: Record<string,number>={lt_10:5,'10_19':14,'20_49':34}; return (e[p.employeeCount]??99)>=20 } },
  { id: 'esi_form6', category: 'Returns & Filings', title: 'ESI Form 6 (Half-Yearly)', description: '11 May and 11 Nov returns', required: p => { const e: Record<string,number>={lt_10:5,'10_19':14}; return (e[p.employeeCount]??99)>=10 } },
  { id: 'factory_form22', category: 'Returns & Filings', title: 'Factories Form 22 (Annual)', description: 'Annual return to Inspector of Factories', required: p => p.hasWorkshop },
  { id: 'hw_form4', category: 'Returns & Filings', title: 'HW Form 4 Annual Return', description: 'Annual Hazardous Waste return to SPCB by 30 Jun', required: p => p.hasWorkshop },
  { id: 'posh_annual', category: 'Returns & Filings', title: 'POSH Annual Report to DO', description: 'IC annual report to District Officer by 31 Jan', required: p => { const e: Record<string,number>={lt_10:5,'10_19':14}; return (e[p.employeeCount]??99)>=10 } },
  { id: 'elv_form1', category: 'Returns & Filings', title: 'ELV Form 1 Annual Declaration', description: 'ELV producer declaration by 30 Apr', required: () => true },
  { id: 'mgt7_aoc4', category: 'Returns & Filings', title: 'AOC-4 + MGT-7 (MCA Annual)', description: 'Annual financial statements + annual return', required: p => ['pvt_ltd','public_ltd','opc'].includes(p.legalForm) },

  // Operational registers
  { id: 'form19a', category: 'Operational Registers', title: 'Form 19A (VAHAN live inventory)', description: 'Digital inventory of all vehicles under Trade Certificate', required: () => true },
  { id: 'ksr_delivery', category: 'Operational Registers', title: 'Vehicle Delivery File', description: 'Form 20/21/22/23; HSRP; insurance; finance NOC; PUC', required: () => true },
  { id: 'dpdp_consent', category: 'Operational Registers', title: 'DPDP Consent Records', description: 'Customer consent log (DMS, test-drive, KYC)', required: () => true },
  { id: 'hw_manifest', category: 'Operational Registers', title: 'HW Form 10 Manifest Log', description: 'Manifest for every hazardous waste consignment', required: p => p.hasWorkshop },
  { id: 'ppe_register', category: 'Operational Registers', title: 'PPE Issue Register', description: 'Worker-wise PPE issue and replacement log', required: p => p.hasWorkshop },
  { id: 'lift_cert', category: 'Operational Registers', title: 'Lift / Hoist Form 8 Certificates', description: 'Annual Competent Person certificate for all lifts', required: p => p.hasLiftsOrHoists },
  { id: 'wage_form_x', category: 'Operational Registers', title: 'Wage Register Form X', description: 'Monthly wage register (Code on Wages)', required: () => true },
  { id: 'training_calendar', category: 'Operational Registers', title: 'Training Calendar', description: 'POSH, fire drill, EHS, OEM SOP training records', required: () => true },
  { id: 'lease_deed', category: 'Operational Registers', title: 'Registered Lease Deed', description: 'Stamped and registered lease for each leased premises', required: p => !p.premisesOwned },
]

interface DocumentationChecklistProps {
  profile: ApplicabilityProfile
}

export function DocumentationChecklist({ profile }: DocumentationChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const relevant = CHECKLIST_ITEMS.filter(item => item.required(profile))
  const categories = Array.from(new Set(relevant.map(i => i.category)))
  const checkedCount = relevant.filter(i => checked.has(i.id)).length

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
          Documentation Checklist
        </CardTitle>
        <p className="text-sm text-gray-500">
          {checkedCount} / {relevant.length} items confirmed (
          {Math.round((checkedCount / (relevant.length || 1)) * 100)}%)
        </p>
      </CardHeader>
      <CardContent>
        {categories.map(cat => {
          const catItems = relevant.filter(i => i.category === cat)
          return (
            <div key={cat} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{cat}</h3>
              <div className="space-y-2">
                {catItems.map(item => {
                  const isChecked = checked.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                        isChecked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-pressed={isChecked}
                      aria-label={`${item.title} — ${isChecked ? 'checked' : 'unchecked'}`}
                    >
                      {isChecked
                        ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        : <Circle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      }
                      <div>
                        <p className={`text-sm font-medium ${isChecked ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
