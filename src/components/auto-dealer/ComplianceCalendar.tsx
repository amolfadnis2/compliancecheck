'use client'

import { Calendar, Clock, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ComplianceCalendarEntry, ComplianceArea } from '@/types/auto-dealer'

interface ComplianceCalendarProps {
  entries: ComplianceCalendarEntry[]
}

const AREA_LABELS: Record<ComplianceArea, string> = {
  trade_certificate: 'Trade Certificate',
  hsrp: 'HSRP',
  bncap_bis: 'BNCAP / BIS',
  misp: 'IRDAI MISP',
  dsa: 'DSA',
  epf: 'EPF',
  esi: 'ESI',
  professional_tax: 'Professional Tax',
  posh: 'POSH',
  maternity: 'Maternity',
  bonus: 'Bonus',
  gratuity: 'Gratuity',
  wages: 'Wages / Code on Wages',
  s_and_e: 'Shops & Establishments',
  gst: 'GST',
  tds_tcs: 'TDS / TCS',
  factories_osh: 'Factories / OSH',
  contract_labour: 'Contract Labour',
  spcb: 'SPCB',
  hazardous_waste: 'Hazardous Waste',
  peso_fire: 'PESO / Fire',
  battery_waste: 'Battery Waste',
  e_waste: 'E-Waste',
  elv: 'ELV Rules',
  dpdp: 'DPDP',
  consumer_protection: 'Consumer Protection',
  companies_act: 'Companies Act',
  csr: 'CSR',
  lease: 'Lease',
}

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half-Yearly',
  annual: 'Annual',
  once: 'One-time',
  on_renewal: 'On Renewal',
}

const PHASE_COLOURS: Record<number, string> = {
  2: 'blue',
  3: 'orange',
  4: 'purple',
  5: 'green',
  6: 'indigo',
}

function groupByFrequency(entries: ComplianceCalendarEntry[]) {
  const groups: Record<string, ComplianceCalendarEntry[]> = {}
  for (const e of entries) {
    const key = e.recurring
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  const ORDER = ['monthly', 'quarterly', 'half_yearly', 'annual', 'on_renewal', 'once']
  return ORDER
    .filter(k => groups[k]?.length)
    .map(k => ({ freq: k, entries: groups[k] }))
}

export function ComplianceCalendar({ entries }: ComplianceCalendarProps) {
  const grouped = groupByFrequency(entries)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" aria-hidden="true" />
          Compliance Calendar
        </CardTitle>
        <p className="text-sm text-gray-500">{entries.length} obligations generated from your applicability profile</p>
      </CardHeader>
      <CardContent>
        {grouped.map(({ freq, entries: items }) => (
          <div key={freq} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
              {FREQ_LABELS[freq] ?? freq}
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-normal">
                {items.length}
              </span>
            </h3>
            <div className="space-y-2">
              {items.map(entry => {
                const colour = PHASE_COLOURS[entry.phase] ?? 'blue'
                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-lg border border-${colour}-100 bg-${colour}-50`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{entry.description}</p>
                      </div>
                      <span className={`text-xs font-medium text-${colour}-700 bg-${colour}-100 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0`}>
                        {AREA_LABELS[entry.complianceArea] ?? entry.complianceArea}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {entry.dueDate}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3" aria-hidden="true" />
                        {entry.authority}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No calendar entries generated for your profile.</p>
        )}
      </CardContent>
    </Card>
  )
}
