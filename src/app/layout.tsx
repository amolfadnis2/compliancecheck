import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ComplianceCheck - Instant Compliance Reports for Indian SMEs | Labour Code & DPDP Assessments",
  description: "Get instant compliance assessments for Indian Labour Codes, DPDP Act, PF, ESI & more. Pay per use (₹999-2,499). No subscriptions. Professional PDF reports in 10 minutes.",
  keywords: [
    "labour code compliance India",
    "DPDP compliance assessment",
    "PF ESI compliance check",
    "statutory compliance India",
    "labour law compliance tool",
    "DPDP Act 2023",
    "CTC calculator India",
    "gratuity calculator India"
  ],
  authors: [{ name: "ComplianceCheck" }],
  openGraph: {
    title: "ComplianceCheck - Instant Compliance Reports for Indian SMEs",
    description: "Get instant compliance assessments for Indian Labour Codes, DPDP Act, PF, ESI & more. Pay per use. No subscriptions.",
    type: "website",
    url: "https://compliancecheck.co.in",
    images: [
      {
        url: "https://compliancecheck.co.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ComplianceCheck - Compliance Assessments for Indian SMEs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ComplianceCheck - Instant Compliance Reports for Indian SMEs",
    description: "Get instant compliance assessments for Indian Labour Codes, DPDP Act & more. Pay per use.",
    images: ["https://compliancecheck.co.in/og-image.jpg"],
  },
  alternates: {
    canonical: "https://compliancecheck.co.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ComplianceCheck",
              applicationCategory: "BusinessApplication",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "999",
                highPrice: "2499",
                priceCurrency: "INR",
              },
              description:
                "Instant compliance assessments for Indian SMEs covering Labour Codes, DPDP Act, and statutory requirements",
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
