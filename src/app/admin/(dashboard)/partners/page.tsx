/**
 * Admin: partners (CAs, CSs, lawyers, consultants) using partner mode.
 *
 * One row per report_preparers entry with how many client assessments they
 * submitted across the three assessment tables, how many were paid / waived,
 * and revenue — so we can spot heavy users to approach about volume pricing.
 * The (dashboard) layout already restricts this page to ADMIN_EMAIL.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { designationLabel } from '@/lib/partner/types'

export const dynamic = 'force-dynamic'

interface PreparerRow {
  id: string
  email: string
  firm_name: string
  preparer_name: string
  designation: string
  city: string | null
  created_at: string
  updated_at: string
}

interface PartnerStats {
  assessments: number
  byType: Record<string, number>
  paid: number
  waived: number
  revenueInr: number
  lastActivity: string | null
}

async function loadPartners(): Promise<{ rows: Array<PreparerRow & PartnerStats>; error?: string }> {
  try {
    const supabase = createAdminClient()
    const { data: preparers, error } = await supabase
      .from('report_preparers')
      .select('id, email, firm_name, preparer_name, designation, city, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500)
    if (error) return { rows: [], error: error.message }

    const stats = new Map<string, PartnerStats>()
    const get = (id: string) => {
      if (!stats.has(id)) stats.set(id, { assessments: 0, byType: {}, paid: 0, waived: 0, revenueInr: 0, lastActivity: null })
      return stats.get(id)!
    }

    const tables: Array<{ table: string; typeCol: string | null; fallbackType: string }> = [
      { table: 'assessments', typeCol: 'assessment_type', fallbackType: 'other' },
      { table: 'posh_assessments', typeCol: null, fallbackType: 'posh' },
      { table: 'auto_dealer_assessments', typeCol: null, fallbackType: 'auto_dealer' },
    ]
    for (const t of tables) {
      const cols = ['preparer_id', 'created_at', t.typeCol].filter(Boolean).join(', ')
      const { data } = await supabase.from(t.table).select(cols).not('preparer_id', 'is', null).limit(5000)
      for (const row of (data ?? []) as unknown as Array<Record<string, string>>) {
        const s = get(row.preparer_id)
        s.assessments++
        const type = (t.typeCol && row[t.typeCol]) || t.fallbackType
        s.byType[type] = (s.byType[type] ?? 0) + 1
        if (!s.lastActivity || row.created_at > s.lastActivity) s.lastActivity = row.created_at
      }
    }

    const { data: ents } = await supabase
      .from('assessment_entitlements')
      .select('preparer_id, status, amount_paise')
      .not('preparer_id', 'is', null)
      .in('status', ['paid', 'waived'])
      .limit(5000)
    for (const e of (ents ?? []) as Array<{ preparer_id: string; status: string; amount_paise: number | null }>) {
      const s = get(e.preparer_id)
      if (e.status === 'paid') {
        s.paid++
        s.revenueInr += Math.round((e.amount_paise ?? 0) / 100)
      } else {
        s.waived++
      }
    }

    const empty: PartnerStats = { assessments: 0, byType: {}, paid: 0, waived: 0, revenueInr: 0, lastActivity: null }
    const rows = (preparers ?? []).map((p) => ({ ...(p as PreparerRow), ...(stats.get(p.id) ?? empty) }))
    rows.sort((a, b) => b.assessments - a.assessments)
    return { rows }
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : 'Failed to load partners' }
  }
}

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
}

export default async function AdminPartnersPage() {
  const { rows, error } = await loadPartners()
  const totals = rows.reduce(
    (acc, r) => ({
      partners: acc.partners + 1,
      active: acc.active + (r.assessments > 0 ? 1 : 0),
      assessments: acc.assessments + r.assessments,
      paid: acc.paid + r.paid,
      revenue: acc.revenue + r.revenueInr,
    }),
    { partners: 0, active: 0, assessments: 0, paid: 0, revenue: 0 }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partners</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          CAs, CSs, lawyers and consultants who submitted assessments for clients in partner mode.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          Could not load partners: {error}. Has the partner-mode migration (20261101000000) been applied?
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          ['Partners', totals.partners],
          ['With a client report', totals.active],
          ['Client assessments', totals.assessments],
          ['Paid reports', totals.paid],
          ['Revenue', `Rs.${totals.revenue.toLocaleString('en-IN')}`],
        ].map(([label, value]) => (
          <div key={label as string} className="p-4 rounded-lg border bg-white dark:bg-gray-900">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">Firm</th>
              <th className="px-4 py-2">Preparer</th>
              <th className="px-4 py-2">Designation</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2 text-right">Assessments</th>
              <th className="px-4 py-2">By type</th>
              <th className="px-4 py-2 text-right">Paid</th>
              <th className="px-4 py-2 text-right">Waived</th>
              <th className="px-4 py-2 text-right">Revenue</th>
              <th className="px-4 py-2">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">No partners yet.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{r.firm_name}</td>
                <td className="px-4 py-2">
                  {r.preparer_name}
                  <div className="text-xs text-gray-500">{r.email}</div>
                </td>
                <td className="px-4 py-2">{designationLabel(r.designation)}</td>
                <td className="px-4 py-2">{r.city ?? '-'}</td>
                <td className="px-4 py-2 text-right">{r.assessments}</td>
                <td className="px-4 py-2 text-xs text-gray-600">
                  {Object.entries(r.byType).map(([t, n]) => `${t}: ${n}`).join(', ') || '-'}
                </td>
                <td className="px-4 py-2 text-right">{r.paid}</td>
                <td className="px-4 py-2 text-right">{r.waived}</td>
                <td className="px-4 py-2 text-right">Rs.{r.revenueInr.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2">{fmtDate(r.lastActivity ?? r.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
