import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Calendar, Clock, ArrowRight, Info } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, getAllSlugs } from '@/lib/blog/posts';
import { AUTHOR } from '@/lib/blog/author';
import { BLOG_URL, BASE_URL, CATEGORIES } from '@/config/blog';
import { mdxComponents, Callout, Stat, AssessmentCTA } from '@/components/blog/MDXComponents';
import { BlogBreadcrumbs } from '@/components/blog/BlogBreadcrumbs';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { NewsletterCTA } from '@/components/blog/NewsletterCTA';
import { CategoryPill } from '@/components/blog/CategoryPill';
import { Alert, AlertDescription } from '@/components/ui/alert';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: post.seoTitle ?? `${post.title} | ComplianceCheck`,
    description: post.seoDescription ?? post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [AUTHOR.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.coverImageAlt,
        },
      ],
      url: `${BLOG_URL}/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
    alternates: { canonical: `${BLOG_URL}/${post.slug}` },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mdxOptions: any = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor'] } }],
      [rehypePrettyCode, { theme: 'github-dark', keepBackground: false }],
    ],
  },
};

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post.slug, post.category, post.tags);
  const category = CATEGORIES.find((c) => c.slug === post.category);
  const pubDate = new Date(post.publishedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const updDate =
    post.updatedAt && post.updatedAt !== post.publishedAt
      ? new Date(post.updatedAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;
  const postUrl = `${BLOG_URL}/${post.slug}`;

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `${BASE_URL}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Person', name: AUTHOR.name },
    publisher: {
      '@type': 'Organization',
      name: 'ComplianceCheck',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: postUrl,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: BLOG_URL },
      {
        '@type': 'ListItem',
        position: 3,
        name: category?.label ?? post.category,
        item: `${BLOG_URL}?category=${post.category}`,
      },
      { '@type': 'ListItem', position: 4, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BlogBreadcrumbs
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: category?.label ?? post.category, href: `/blog?category=${post.category}` },
            { label: post.title },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <header className="mb-6">
          <div className="mb-3">
            <CategoryPill slug={post.category} href={`/blog?category=${post.category}`} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 max-w-3xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image
                src={AUTHOR.avatar}
                alt={AUTHOR.name}
                width={28}
                height={28}
                className="rounded-full"
              />
              <span>{AUTHOR.name}</span>
            </div>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt}>{pubDate}</time>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readingTime}
            </span>
            {updDate && <span className="text-xs italic">Updated {updDate}</span>}
          </div>
        </header>

        {/* Cover image */}
        <div className="relative aspect-video max-w-[1200px] mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          />
        </div>

        {/* Two-column layout */}
        <div className="flex gap-10">
          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents postSlug={post.slug} />
            </div>
          </aside>

          {/* Article body */}
          <div id="main-content" className="flex-1 min-w-0 max-w-[720px]">
            {/* Mobile TOC */}
            <details className="lg:hidden mb-6 rounded-lg border p-4">
              <summary className="font-semibold cursor-pointer">On this page</summary>
              <div className="mt-3">
                <TableOfContents postSlug={post.slug} />
              </div>
            </details>

            <article
              className="prose prose-base dark:prose-invert max-w-none leading-7
                prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:rounded-xl
                prose-table:text-sm
                prose-img:rounded-lg
                [&>p:first-child]:text-lg [&>p:first-child]:leading-8"
            >
              <MDXRemote
                source={post.content}
                options={mdxOptions}
                components={{
                  ...mdxComponents,
                  Callout,
                  Stat,
                  AssessmentCTA,
                }}
              />
            </article>

            {/* Disclaimer */}
            <Alert className="mt-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                This article is for informational purposes only and does not constitute legal
                advice. Consult a qualified professional for your specific situation.
              </AlertDescription>
            </Alert>

            {/* Author bio */}
            <div className="mt-8">
              <AuthorBio />
            </div>

            {/* Related assessment CTA */}
            {post.relatedAssessment && (
              <div className="mt-8 rounded-xl border-2 border-green-600 bg-green-50 dark:bg-green-900/20 p-6">
                <p className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                  Test your compliance readiness
                </p>
                <p className="text-green-700 dark:text-green-400 mb-4">
                  Answer 40 questions and get a personalised gap report — free, takes under
                  10 minutes.
                </p>
                <Link
                  href={`/assessment/${post.relatedAssessment}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 font-medium transition-colors"
                >
                  Start free assessment
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}

            {/* Share buttons */}
            <div className="mt-8 pt-6 border-t">
              <ShareButtons title={post.title} url={postUrl} postSlug={post.slug} />
            </div>

            {/* Newsletter */}
            <div className="mt-8 rounded-xl border bg-muted/40 p-5">
              <p className="font-semibold mb-1">Stay updated on Indian compliance</p>
              <p className="text-sm text-muted-foreground mb-3">
                Get practical guides delivered to your inbox — no spam, unsubscribe anytime.
              </p>
              <NewsletterCTA source="blog_post_end" />
            </div>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <RelatedPosts posts={relatedPosts} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
