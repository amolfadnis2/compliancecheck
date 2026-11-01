/**
 * Partner-mode header for the summary and paid report pages: the preparing
 * firm's logo, name and credentials, with a small "Powered by ComplianceCheck"
 * credit. Renders nothing for normal (self-submitted) assessments.
 * No hooks, so it works in both server and client components.
 */

import { preparerContactLine, preparerLine, type PreparedBy } from '@/lib/partner/types'

export function PartnerBrandBar({
  preparedBy,
  clientName,
}: {
  preparedBy: PreparedBy | null | undefined
  clientName?: string
}) {
  if (!preparedBy) return null
  const accent = preparedBy.brandColor ?? '#1E40AF'
  return (
    <div className="max-w-3xl mx-auto mb-6 rounded-lg bg-white border overflow-hidden print:border-0">
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        {preparedBy.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preparedBy.logoUrl}
            alt={`${preparedBy.firmName} logo`}
            className="h-12 max-w-[160px] object-contain"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900" style={{ color: accent }}>
            {preparedBy.firmName}
          </p>
          <p className="text-sm text-gray-600">
            {[preparerLine(preparedBy), preparedBy.city].filter(Boolean).join(' · ')}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 break-words">{preparerContactLine(preparedBy).replace(/ {2}\| {2}/g, ' · ')}</p>
        </div>
        <div className="text-sm text-gray-600 sm:text-right">
          {clientName && clientName !== 'Not specified' && (
            <p>
              Prepared for <span className="font-semibold text-gray-900">{clientName}</span>
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">Powered by ComplianceCheck</p>
        </div>
      </div>
    </div>
  )
}
