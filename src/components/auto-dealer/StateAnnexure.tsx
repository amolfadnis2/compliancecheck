'use client'

import { MapPin, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PTSlab, StateAndE, GSTRate } from '@/types/auto-dealer'

interface StateAnnexureProps {
  statesOfOperation: string[]
  ptSlabs: PTSlab[]
  sandE: StateAndE[]
  gstRates: GSTRate[]
}

const STATE_NAMES: Record<string, string> = {
  MH: 'Maharashtra', KA: 'Karnataka', DL: 'Delhi NCT', TN: 'Tamil Nadu',
  TS: 'Telangana', AP: 'Andhra Pradesh', GJ: 'Gujarat', HR: 'Haryana',
  RJ: 'Rajasthan', UP: 'Uttar Pradesh', WB: 'West Bengal', MP: 'Madhya Pradesh',
  PB: 'Punjab', OD: 'Odisha', AS: 'Assam',
}

export function StateAnnexure({ statesOfOperation, ptSlabs, sandE, gstRates }: StateAnnexureProps) {
  const statesToShow = statesOfOperation.filter(s => s !== 'other')

  return (
    <div className="space-y-6">
      {/* Professional Tax slabs */}
      {ptSlabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Professional Tax Slabs — Your States
            </CardTitle>
            <p className="text-xs text-gray-500">Verify current slabs with state authority; rates change with state Budgets (quarterly)</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statesToShow.map(stateCode => {
                const slabs = ptSlabs.filter(s => s.stateCode === stateCode)
                if (!slabs.length) return (
                  <div key={stateCode} className="text-sm text-gray-500">
                    <strong>{STATE_NAMES[stateCode] ?? stateCode}</strong>: Professional Tax does not apply.
                  </div>
                )
                return (
                  <div key={stateCode}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">{STATE_NAMES[stateCode] ?? stateCode}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm" aria-label={`PT slabs for ${STATE_NAMES[stateCode] ?? stateCode}`}>
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Monthly Salary (Rs.)</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Monthly Tax (Rs.)</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Effective From</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {slabs.map((slab, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-700">
                                {slab.slabMin.toLocaleString('en-IN')} – {slab.slabMax ? slab.slabMax.toLocaleString('en-IN') : 'and above'}
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-900">
                                {slab.monthlyTax === 0 ? 'Nil' : `Rs.${slab.monthlyTax}`}
                              </td>
                              <td className="px-3 py-2 text-gray-500 text-xs">{slab.effectiveFrom}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {slabs[0]?.notes && (
                      <p className="text-xs text-gray-500 mt-1">{slabs[0].notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* S&E reference */}
      {sandE.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-teal-600" aria-hidden="true" />
              Shops &amp; Establishments Rules — Your States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" aria-label="S&E rules by state">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">State</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Registration (days)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Max Hours/Day</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Women Closing Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sandE.map(row => (
                    <tr key={row.stateCode} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{row.stateName}</td>
                      <td className="px-3 py-2 text-gray-600">{row.registrationWindowDays ?? 'N/A'}</td>
                      <td className="px-3 py-2 text-gray-600">{row.maxHoursPerDay ?? 'N/A'}</td>
                      <td className="px-3 py-2 text-gray-600">{row.womenClosingTime ?? 'N/A'}</td>
                      <td className="px-3 py-2">
                        {row.portalUrl
                          ? <a href={row.portalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                              Visit <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          : <span className="text-gray-400 text-xs">N/A</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GST rates */}
      {gstRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              GST 2.0 Rates — Vehicle Categories
            </CardTitle>
            <p className="text-xs text-gray-500">Effective 22 Sep 2025 | Source: PIB PRID 2164587, 56th GST Council</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" aria-label="GST rates by vehicle category">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">HSN</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Rate (%)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Cess (%)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase">Total (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gstRates.map((rate, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-800">{rate.description}</td>
                      <td className="px-3 py-2 text-gray-500 font-mono text-xs">{rate.hsn}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{rate.rate}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{rate.cess}</td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900">{rate.totalRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-amber-700 mt-3">
              * FADA litigation on transitional cess credit under GST 2.0 is ongoing. Consult CA for ITC position.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
