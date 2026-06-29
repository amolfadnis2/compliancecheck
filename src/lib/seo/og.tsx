/**
 * Shared Open Graph image renderer (next/og). Produces a branded 1200x630 card
 * so links shared to LinkedIn/X/WhatsApp — and surfaced by answer engines —
 * render with a clean, on-brand preview.
 */

import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

export function renderOgImage({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          padding: '70px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#1E40AF',
              color: 'white',
              fontSize: '32px',
            }}
          >
            ✓
          </div>
          <div style={{ color: 'white', fontSize: '30px', fontWeight: 700 }}>
            ComplianceCheck
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              color: '#60A5FA',
              fontSize: '26px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '60px',
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ color: '#94A3B8', fontSize: '24px' }}>
          Compliance assessments for Indian SMEs · compliancecheck.co.in
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
