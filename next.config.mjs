import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    // Playwright must not be bundled by webpack — it uses native binaries
    // and is only called from API routes (server-side).
    config.externals = [...(Array.isArray(config.externals) ? config.externals : []), 'playwright-core']
    return config;
  },
  experimental: {
    // Playwright is a server-only package; exclude it from the Next.js bundle
    serverComponentsExternalPackages: ['playwright-core'],
  },
  async redirects() {
    return [
      // Redirect orphan/duplicate landing page to canonical SEO landing page
      {
        source: '/assessment/Landing',
        destination: '/assessments/landing/statutory-health-check',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      // Security headers for admin routes
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Admin API routes
      {
        source: '/api/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
};

export default nextConfig;
