import type { Metadata } from 'next';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { getGaMeasurementId, getGtmId } from '@/lib/site-settings';
import './globals.css';

// Force dynamic rendering for all pages (data from database)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Sure Filter® - Premium Automotive & Industrial Filters',
    template: '%s | Sure Filter®',
  },
  description: 'Sure Filter® provides you with the best selection of aftermarket filters and separators, each designed to combat containments, improve efficiency, and deliver world-class results.',
  keywords: ['automotive filters', 'industrial filters', 'air filters', 'oil filters', 'fuel filters', 'hydraulic filters', 'sure filter', 'aftermarket filters', 'filter separators'],
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = await getGaMeasurementId();
  const gtmId = await getGtmId();

  return (
    <html lang="en" suppressHydrationWarning>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <head>
        {/* Preload critical assets for faster LCP */}
        <link
          rel="preload"
          href="/images/sf-logo.png"
          as="image"
          type="image/png"
        />
      </head>
      <body>
        {children}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
} 