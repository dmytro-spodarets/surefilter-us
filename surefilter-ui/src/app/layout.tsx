import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
    </html>
  );
} 