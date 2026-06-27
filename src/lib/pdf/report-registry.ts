/**
 * Report Registry
 *
 * Single source of truth mapping an assessment type to the adapter that
 * turns its stored data into UnifiedReportData. Both the download and the
 * email handlers route through buildReportData() so adding a new assessment
 * type only requires one change here.
 *
 * Note: POSH is intentionally absent — it is computed in-memory and uses
 * adaptPOSHResult (different signature), not the DB-row adapters below.
 */

import { ASSESSMENT_TYPES } from '@/lib/constants/assessment-types'
import type { UnifiedReportData } from './unified-report-generator'
import {
  type AssessmentData,
  adaptStatutoryHealth,
  adaptLabourCode,
  adaptDPDP,
  adaptStateWise,
  adaptFoodBusiness,
} from './report-data-adapter'

type ReportAdapter = (data: AssessmentData) => UnifiedReportData

export const REPORT_ADAPTERS: Record<string, ReportAdapter> = {
  [ASSESSMENT_TYPES.DPDP]: adaptDPDP,
  [ASSESSMENT_TYPES.LABOUR_CODE]: adaptLabourCode,
  [ASSESSMENT_TYPES.STATE_WISE_COMPLIANCE]: adaptStateWise,
  [ASSESSMENT_TYPES.FOOD_BUSINESS]: adaptFoodBusiness,
  [ASSESSMENT_TYPES.STATUTORY_HEALTH]: adaptStatutoryHealth,
}

/**
 * Resolve the right adapter for an assessment type and build the report data.
 * Falls back to Statutory Health (the original default) for unknown types.
 */
export function buildReportData(type: string | undefined, data: AssessmentData): UnifiedReportData {
  const adapter = (type && REPORT_ADAPTERS[type]) || adaptStatutoryHealth
  return adapter(data)
}
