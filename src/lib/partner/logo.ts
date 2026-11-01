/**
 * Fetch a partner logo as a data URL for jsPDF (which needs the bytes inline).
 * Works in the browser and on the server.
 *
 * Only URLs inside this project's public `report-logos` bucket are fetched —
 * `preparedBy.logoUrl` comes from the browser, so anything else (another host,
 * an internal address) is ignored rather than requested. Never throws: a logo
 * that cannot be loaded just leaves the report without one.
 */

import type { UnifiedReportData } from '@/lib/pdf/unified-report-generator'
import type { ReportPreparer } from './types'

const MAX_BYTES = 400 * 1024

export function isAllowedLogoUrl(url: string | undefined): url is string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!url || !base) return false
  return url.startsWith(`${base}/storage/v1/object/public/report-logos/`) && !url.includes('..')
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64')
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)))
  }
  return btoa(binary)
}

export async function loadLogoDataUrl(url: string | undefined): Promise<string | undefined> {
  if (!isAllowedLogoUrl(url)) return undefined
  try {
    const res = await fetch(url, { cache: 'force-cache' })
    if (!res.ok) return undefined
    const type = res.headers.get('content-type')?.split(';')[0].trim()
    if (type !== 'image/png' && type !== 'image/jpeg') return undefined
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.length === 0 || bytes.length > MAX_BYTES) return undefined
    return `data:${type};base64,${toBase64(bytes)}`
  } catch {
    return undefined
  }
}

/** Resolve the partner logo on report data before calling the PDF generator. */
export async function withReportLogo<T extends UnifiedReportData>(data: T): Promise<T> {
  const pb = data.preparedBy
  if (!pb?.logoUrl || pb.logoDataUrl) return data
  const logoDataUrl = await loadLogoDataUrl(pb.logoUrl)
  if (!logoDataUrl) return data
  const preparedBy: ReportPreparer = { ...pb, logoDataUrl }
  return { ...data, preparedBy }
}
