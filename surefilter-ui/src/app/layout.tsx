import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { getGaMeasurementId, getGtmId, getTermlyWebsiteUUID, getDefaultSeoMeta } from '@/lib/site-settings';
import TermlyCMP from '@/components/TermlyCMP';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  let seo: { title?: string; titleSuffix?: string; description?: string; keywords?: string } = {};
  try {
    seo = await getDefaultSeoMeta();
  } catch {
    // DB unavailable during build
  }

  const keywords = seo.keywords
    ? seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : undefined;

  return {
    title: {
      default: seo.title || '',
      template: seo.titleSuffix ? `%s ${seo.titleSuffix}` : '%s',
    },
    description: seo.description,
    keywords,
    robots: { index: true, follow: true },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    icons: {
      icon: [
        { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon/favicon.ico',
      apple: { url: '/favicon/apple-touch-icon.png', sizes: '180x180' },
    },
    manifest: '/favicon/site.webmanifest',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let gaId: string | undefined;
  let gtmId: string | undefined;
  let termlyUUID: string | undefined;
  try {
    gaId = await getGaMeasurementId();
    gtmId = await getGtmId();
    termlyUUID = await getTermlyWebsiteUUID();
  } catch {
    // DB unavailable during build — analytics will be injected at runtime via ISR
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {termlyUUID && (
        <head>
          <link
            rel="preload"
            href={`https://app.termly.io/resource-blocker/${termlyUUID}?autoBlock=on`}
            as="script"
          />
        </head>
      )}
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body suppressHydrationWarning>
        {children}
        {termlyUUID && (
          <Suspense fallback={null}>
            <TermlyCMP websiteUUID={termlyUUID} autoBlock />
          </Suspense>
        )}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
