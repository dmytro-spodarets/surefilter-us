import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadCachedPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  const title = page?.title || slug;
  const description = page?.description || undefined;
  const image = page?.ogImage || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}` : undefined,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await loadCachedPageBySlug(slug);
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


