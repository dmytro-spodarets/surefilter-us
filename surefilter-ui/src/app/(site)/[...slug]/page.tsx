import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { loadPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function joinSlug(segments: string[] | string | undefined) {
  if (Array.isArray(segments)) return segments.join('/');
  if (typeof segments === 'string') return segments;
  return '';
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] | string }> }): Promise<Metadata> {
  const { slug } = await params;
  const key = joinSlug(slug);
  if (!key) {
    // Пустой ключ — вернем пустые метаданные, применятся значения по умолчанию из RootLayout
    return {};
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
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
      url: base && key ? `${base}/${key}` : undefined,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug?: string[] | string }> }) {
  const { slug } = await params;
  const key = joinSlug(slug);
  // Use uncached fetch to avoid stale/null cache when pages are created/seeded in dev
  const page = await loadPageBySlug(key);
  if (!page) {
    notFound();
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
