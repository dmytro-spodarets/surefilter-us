import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadCachedPageBySlug, loadPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

function joinSlug(segments: string[]) {
  return (segments || []).join('/');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const key = joinSlug(slug);
  const page = await prisma.page.findUnique({ where: { slug: key } });
  const title = page?.title || key;
  const description = page?.description || undefined;
  const image = page?.ogImage || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/${key}` : undefined,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = joinSlug(slug);
  // Use uncached fetch to avoid stale/null cache when pages are created/seeded in dev
  const page = await loadPageBySlug(key);
  if (!page) {
    // Next.js notFound
    // @ts-expect-error Async notFound available in app router
    return (await import('next/navigation')).notFound();
  }
  return (
    <main>
      <Header />
      {(page.sections || []).map((s) => (
        <div key={s.id}>{renderSection(s)}</div>
      ))}
      <Footer />
    </main>
  );
}


