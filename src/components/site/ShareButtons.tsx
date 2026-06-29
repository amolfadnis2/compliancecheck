'use client'

import { useState } from 'react'

/**
 * ShareButtons — one-click sharing to LinkedIn, X, and WhatsApp plus copy-link.
 * Uses share intents (no SDKs/trackers). The branded OG image attached to each
 * URL is what renders in the shared card.
 */

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const shareText = `${title} — ComplianceCheck`

  const links = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    x: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`,
    whatsapp: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`,
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable; no-op
    }
  }

  const btn =
    'rounded-md border border-neutral-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Share:</span>
      <a className={btn} href={links.linkedin} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
      <a className={btn} href={links.x} target="_blank" rel="noopener noreferrer">
        X
      </a>
      <a className={btn} href={links.whatsapp} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <button type="button" className={btn} onClick={copy}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
