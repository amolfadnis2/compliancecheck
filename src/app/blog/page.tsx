import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/blog/posts';
import { PostCard } from '@/components/blog/PostCard';
import { NewsletterCTA } from '@/components/blog/NewsletterCTA';
import { BlogHomeClient } from '@/components/blog/BlogHomeClient';
import { BLOG_URL } from '@/config/blog';

export const metadata: Metadata = {
  title: 'Indian Compliance Insights | ComplianceCheck Blog',
  description:
    'Practical guides on Labour Codes, DPDP Act, POSH, and statutory compliance — written for SME founders and HR teams.',
  openGraph: {
    title: 'Indian Compliance Insights | ComplianceCheck Blog',
    description:
      'Practical guides on Labour Codes, DPDP Act, POSH, and statutory compliance — written for SME founders and HR teams.',
    url: BLOG_URL,
    type: 'website',
  },
  alternates: { canonical: BLOG_URL },
};

export default function BlogPage() {
  const allPosts = getAllPosts();
  const featuredPost = allPosts[0] ?? null;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Indian Compliance Insights
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8">
            Practical guides on Labour Codes, DPDP Act, POSH, and statutory compliance —
            written for SME founders and HR teams.
          </p>
          <div className="max-w-md">
            <p className="text-sm font-medium mb-2">
              Get compliance updates in your inbox — free.
            </p>
            <NewsletterCTA source="blog_home_hero" variant="hero" />
          </div>
        </div>
      </section>

      {/* Featured post */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="sr-only">Featured article</h2>
          <PostCard post={featuredPost} featured />
        </section>
      )}

      {/* Category filter + search + grid + pagination */}
      <BlogHomeClient allPosts={allPosts} featuredPost={featuredPost} />

      {/* Bottom CTA */}
      <section className="border-t bg-gradient-to-r from-green-700 to-green-800 text-white mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg font-semibold text-center sm:text-left">
            Not sure where you stand? Take a free compliance assessment.
          </p>
          <Link
            href="/assessments"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-green-800 font-semibold px-5 py-2.5 hover:bg-green-50 transition-colors flex-shrink-0"
          >
            Start for free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
