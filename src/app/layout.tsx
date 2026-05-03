import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://compliancecheck.co.in'),
  title: "ComplianceCheck - Pay-as-you-go Compliance Assessments for Indian SMEs",
  description: "Get instant compliance reports for Rs.999-2,499. Assessments for Labour Codes 2025, DPDP Act 2023, POSH Act, Food Business & more. No subscriptions. Free during beta.",
  keywords: [
    "compliance assessment India",
    "labour code compliance",
    "DPDP Act compliance",
    "POSH Act compliance",
    "food business license India",
    "SME compliance India",
    "statutory compliance check",
    "PF ESI compliance",
    "professional tax compliance",
    "Indian business compliance",
    "HR compliance India",
    "gratuity calculator",
    "CTC calculator"
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ComplianceCheck - Instant Compliance Assessments for Indian Businesses",
    description: "Pay-as-you-go compliance assessments. Get gap analysis, action items & PDF reports in 15 minutes. Free during beta.",
    url: 'https://compliancecheck.co.in',
    siteName: 'ComplianceCheck',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ComplianceCheck - Pay-as-you-go Assessments for Indian SMEs'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ComplianceCheck - Compliance Assessments for Indian SMEs',
    description: 'Get instant compliance reports. No subscriptions. Free during beta.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ComplianceCheck",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "999",
                highPrice: "2499",
                priceCurrency: "INR",
                offerCount: 6
              },
              description:
                "Pay-as-you-go compliance assessments for Indian SMEs. Labour Codes, DPDP Act, POSH, Food Business & more.",
              provider: {
                "@type": "Organization",
                name: "ComplianceCheck",
                url: "https://compliancecheck.co.in"
              },
              areaServed: {
                "@type": "Country",
                name: "India"
              }
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors overflow-x-hidden`}>
        <ThemeProvider>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
