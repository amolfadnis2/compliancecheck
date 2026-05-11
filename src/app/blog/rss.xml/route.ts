import { NextResponse } from 'next/server';
import { generateRssFeed } from '@/lib/blog/rss';

export function GET() {
  const xml = generateRssFeed();
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
