'use client';

import { Share2, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics/tracking';

interface ShareButtonsProps {
  title: string;
  url: string;
  postSlug: string;
}

export function ShareButtons({ title, url, postSlug }: ShareButtonsProps) {
  function track(platform: string) {
    trackEvent('blog_share_clicked', { post_slug: postSlug, platform });
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        track('native');
      } catch {
        // User cancelled — no-op
      }
      return;
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url).catch(() => null);
    track('clipboard');
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Share:</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { window.open(twitterUrl, '_blank', 'noopener,noreferrer'); track('twitter'); }}
        aria-label="Share on Twitter / X"
        className="gap-1.5"
      >
        <Twitter className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { window.open(linkedinUrl, '_blank', 'noopener,noreferrer'); track('linkedin'); }}
        aria-label="Share on LinkedIn"
        className="gap-1.5"
      >
        <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => { window.open(whatsappUrl, '_blank', 'noopener,noreferrer'); track('whatsapp'); }}
        aria-label="Share on WhatsApp"
        className="gap-1.5"
      >
        <span aria-hidden="true" className="text-xs">💬</span>
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleNativeShare}
        aria-label="More share options"
        className="gap-1.5 sm:hidden"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
