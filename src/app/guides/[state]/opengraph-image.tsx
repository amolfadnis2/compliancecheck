import { getStateBySlug } from '@/lib/content/state-compliance'
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/seo/og'

export const alt = 'State compliance guide'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image({ params }: { params: { state: string } }) {
  const state = getStateBySlug(params.state)
  return renderOgImage({
    eyebrow: 'State Compliance Guide',
    title: state ? `${state} Compliance Requirements` : 'State Compliance Guide',
  })
}
