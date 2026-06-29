/**
 * ContentShell — lightweight nav + footer wrapper for content pages
 * (blog, guides). Keeps these pages visually consistent without depending on
 * the assessment-landing CSS modules.
 */

import Link from 'next/link'

export function ContentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="border-b border-neutral-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-white">
              ✓
            </span>
            ComplianceCheck
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/blog" className="text-gray-600 hover:text-primary dark:text-gray-300">
              Guides
            </Link>
            <Link
              href="/"
              className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark"
            >
              Start an Assessment
            </Link>
          </div>
        </div>
      </nav>

      {children}

      <footer className="mt-16 border-t border-neutral-200 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500 dark:text-gray-400">
          <div className="mb-3 flex flex-wrap gap-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/blog" className="hover:text-primary">Guides</Link>
            <Link href="/contact" className="hover:text-primary">Contact</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
          </div>
          <p>© {new Date().getFullYear()} ComplianceCheck. Compliance assessments for Indian SMEs.</p>
        </div>
      </footer>
    </div>
  )
}
