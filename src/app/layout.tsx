import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/posthog-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ComplianceCheck - Labour Code & DPDP Compliance for Indian SMEs",
  description: "Instant compliance assessments for Indian SMEs covering Labour Codes 2025, DPDP Act 2023, and statutory requirements. Get audit-ready reports in minutes.",
  keywords: ["labour code compliance", "DPDP compliance", "Indian SME compliance", "statutory compliance", "HR compliance India"],
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
      <body className={inter.className}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
