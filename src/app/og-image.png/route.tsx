import { renderOgImage } from '@/lib/seo/og'

// Serves the sitewide default share image referenced by DEFAULT_OPEN_GRAPH and
// the root layout's twitter card. Rendered once at build time.
export const dynamic = 'force-static'

export function GET() {
  return renderOgImage({
    eyebrow: 'Free summary with every assessment',
    title: 'Know exactly where your business stands on compliance',
  })
}
