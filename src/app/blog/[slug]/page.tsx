import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { getPost, getAllPostSlugs } from '@/lib/blog/posts'
import { mdxComponents } from '@/components/blog/mdx-components'
import { ContentShell } from '@/components/site/ContentShell'
import { ShareButtons } from '@/components/site/ShareButtons'
import { AssessmentCTA } from '@/components/site/AssessmentCTA'
import { JsonLd } from '@/lib/seo/JsonLd'
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/schema'
import { absoluteUrl } from '@/lib/seo/site'

interface Params {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug)
  if (!post) return {}
  const url = absoluteUrl(`/blog/${post.slug}`)
  return {
    title: `${post.title} | ComplianceCheck`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'ComplianceCheck',
      locale: 'en_IN',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastReviewed ?? post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPostPage({ params }: Params) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const url = absoluteUrl(`/blog/${post.slug}`)

  return (
    <ContentShell>
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.description,
          url: `/blog/${post.slug}`,
          datePublished: post.date,
          dateModified: post.lastReviewed,
          author: post.author,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      {post.faq && post.faq.length > 0 && <JsonLd data={faqSchema(post.faq)} />}

      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{post.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span>{post.author ?? 'ComplianceCheck Team'}</span>
            <span>·</span>
            <span>Published {formatDate(post.date)}</span>
            {post.lastReviewed && post.lastReviewed !== post.date && (
              <>
                <span>·</span>
                <span>Reviewed {formatDate(post.lastReviewed)}</span>
              </>
            )}
          </div>
        </header>

        <div>
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {post.faq && post.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="mt-10 mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-6">
              {post.faq.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.question}</dt>
                  <dd className="mt-2 leading-7 text-gray-700 dark:text-gray-300">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {post.relatedAssessment && <AssessmentCTA type={post.relatedAssessment} />}

        <div className="mt-10 border-t border-neutral-200 dark:border-gray-800 pt-6">
          <ShareButtons url={url} title={post.title} />
        </div>
      </article>
    </ContentShell>
  )
}
