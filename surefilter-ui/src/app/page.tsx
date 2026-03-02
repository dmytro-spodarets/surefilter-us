import Header from '@/components/layout/Header';
import { loadCachedPageBySlug } from '@/cms/fetch';
import { renderSection } from '@/cms/renderer';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  let page: any = null;
  try {
    page = await prisma.page.findUnique({ where: { slug: 'home' } });
  } catch {
    // DB unavailable during build
  }
  const title = page?.title || undefined;
  const description = page?.description || undefined;
  const image = page?.ogImage || undefined;
  return {
    ...(title && { title }),
    ...(description && { description }),
    openGraph: {
      ...(title && { title }),
      ...(description && { description }),
      ...(image && { images: [image] }),
      url: process.env.NEXT_PUBLIC_SITE_URL,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}
// All content sections are rendered from CMS in stored order
import Footer from '@/components/layout/Footer';

export default async function Home() {
  const page = await loadCachedPageBySlug('home');
  const sections = page?.sections ?? [];
  return (
    <main>
      <Header />
      {sections.map((s) => (
        <div key={s.id}>{renderSection(s)}</div>
      ))}
      <Footer />
    </main>
  );
}