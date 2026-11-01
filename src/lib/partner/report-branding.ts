/**
 * Attach a partner (partner mode) to report data built by a PDF adapter.
 * Kept free of jsPDF so the adapters stay importable without the generator.
 */

import { cleanText } from '@/lib/pdf/pdf-primitives'
import type { UnifiedReportData } from '@/lib/pdf/unified-report-generator'
import type { PreparedBy } from './types'

/**
 * Sets `preparedBy` and renames the PDF to "<Firm>-<Client>-<Type>" so the
 * file a partner forwards carries their name. No-op without a partner.
 */
export function withPreparedBy<T extends UnifiedReportData>(data: T, preparedBy: PreparedBy | null | undefined): T {
  if (!preparedBy) return data
  const slug = (v: string) =>
    cleanText(v).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  const typePart = data.config.filenamePrefix.replace(/^ComplianceCheck-/, '')
  const filenamePrefix = [slug(preparedBy.firmName), slug(data.userDetails.companyName), typePart]
    .filter(Boolean)
    .join('-')
  return { ...data, preparedBy, config: { ...data.config, filenamePrefix } }
}
