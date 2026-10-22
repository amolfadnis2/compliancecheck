/**
 * CalculatorGuide — server-rendered explainer shown below a calculator: how
 * it's calculated, a worked example, eligibility, FAQ (+ FAQPage JSON-LD from
 * the same array) and related guides. Content lives in
 * @/lib/calculators/guide-content so every figure comes from the calculator code.
 */

import Link from 'next/link'
import { getPost, type Post } from '@/lib/blog/posts'
import { JsonLd } from '@/lib/seo/JsonLd'
import { faqSchema } from '@/lib/seo/schema'
import { getCalculatorGuide, type CalculatorGuideId } from '@/lib/calculators/guide-content'

const sectionTitle = 'mt-10 mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100'
const para = 'leading-7 text-gray-700 dark:text-gray-300'

/** Links to existing blog posts; slugs that don't resolve are skipped. */
export function RelatedGuides({ slugs }: { slugs: string[] }) {
  const posts = slugs.map((slug) => getPost(slug)).filter((p): p is Post => p !== null)
  if (posts.length === 0) return null

  return (
    <section>
      <h2 className={sectionTitle}>Related guides</h2>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              {post.title}
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">{post.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CalculatorGuide({ id }: { id: CalculatorGuideId }) {
  const guide = getCalculatorGuide(id)

  return (
    <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <JsonLd data={faqSchema(guide.faqs)} />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <section>
          <h2 className={sectionTitle}>How it&apos;s calculated</h2>
          <ol className={`list-decimal space-y-2 pl-6 ${para}`}>
            {guide.howItWorks.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className={sectionTitle}>Worked example</h2>
          <p className={para}>{guide.example.intro}</p>
          <dl className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {guide.example.rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 px-4 py-2 text-sm">
                <dt className="text-gray-600 dark:text-gray-400">{row.label}</dt>
                <dd className="text-right font-medium text-gray-900 dark:text-gray-100">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-4 font-semibold ${para}`}>{guide.example.result}</p>
        </section>

        <section>
          <h2 className={sectionTitle}>Eligibility</h2>
          <ul className={`list-disc space-y-2 pl-6 ${para}`}>
            {guide.eligibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={sectionTitle}>Frequently Asked Questions</h2>
          <dl className="space-y-6">
            {guide.faqs.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-gray-900 dark:text-gray-100">{item.question}</dt>
                <dd className={`mt-2 ${para}`}>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {guide.relatedTools && guide.relatedTools.length > 0 && (
          <section>
            <h2 className={sectionTitle}>Related calculators</h2>
            <ul className="space-y-3">
              {guide.relatedTools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {tool.label}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RelatedGuides slugs={guide.relatedSlugs} />
      </div>
    </div>
  )
}
