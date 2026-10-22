import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/seo/og'

export const alt = 'PF calculator with salary hikes — EPF corpus, EPS pension and real return'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({ eyebrow: 'Free PF Calculator', title: 'PF calculator with salary hikes: EPF corpus, EPS pension and real return' })
}
