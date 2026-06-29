import { getPost } from '@/lib/blog/posts'
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/seo/og'

export const alt = 'ComplianceCheck guide'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  return renderOgImage({
    eyebrow: 'Compliance Guide',
    title: post?.title ?? 'Compliance Guides for Indian Businesses',
  })
}
