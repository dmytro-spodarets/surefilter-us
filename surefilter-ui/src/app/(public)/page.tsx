import { loadCachedPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: 'home' } });
  const title = page?.title || 'Sure Filter® - Premium Automotive & Industrial Filters';
  const description = page?.description || 'Sure Filter® provides you with the best selection of aftermarket filters and separators, each designed to combat containments, improve efficiency, and deliver world-class results.';
  const image = page?.ogImage || '/images/sf-logo.png';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      url: process.env.NEXT_PUBLIC_SITE_URL,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

// All content sections are rendered from CMS in stored order
// Header and Footer are in (public)/layout.tsx
export default async function Home() {
  const page = await loadCachedPageBySlug('home');
  const sections = page?.sections ?? [];
  
  return (
    <>
      {sections.map((s) => (
        <div key={s.id}>{renderSection(s)}</div>
      ))}
    </>
  );
}

