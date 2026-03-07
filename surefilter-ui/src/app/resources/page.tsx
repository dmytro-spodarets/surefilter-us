import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesClient from './ResourcesClient';
import { prisma } from '@/lib/prisma';
import { getResourcesPageSettings } from '@/lib/site-settings';
import type { Metadata } from 'next';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  let settings: { metaTitle?: string; metaDescription?: string; ogImage?: string } = {};
  try {
    settings = await getResourcesPageSettings();
  } catch {
    // DB unavailable during build
  }
  const title = settings.metaTitle || undefined;
  const description = settings.metaDescription || undefined;
  const image = settings.ogImage || undefined;
  return {
    ...(title && { title }),
    ...(description && { description }),
    openGraph: {
      ...(title && { title }),
      ...(description && { description }),
      ...(image && { images: [image] }),
      type: 'website',
    },
  };
}
export default async function ResourcesPage() {
  let resources: any[] = [];
  let categories: any[] = [];
  try {
    [resources, categories] = await Promise.all([
      prisma.resource.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: { lte: new Date() },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          thumbnailImage: true,
          file: true,
          fileType: true,
          fileSize: true,
          fileMeta: true,
          allowDirectDownload: true,
          allowPreview: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.resourceCategory.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              resources: {
                where: {
                  status: 'PUBLISHED',
                  publishedAt: { lte: new Date() },
                },
              },
            },
          },
        },
        orderBy: { position: 'asc' },
      }),
    ]);
  } catch {
    // DB unavailable during build — render with empty data, ISR will populate at runtime
  }

  return (
    <main>
      <Header />

      {/* Hero Section - Server Component, данные в HTML */}
      <DynamicResourcesHero />

      {/* Interactive Content - Client Component с server data */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
          <div className="flex gap-3 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-full w-28" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-48" />
            ))}
          </div>
        </div>
      }>
        <ResourcesClient
          initialResources={JSON.parse(JSON.stringify(resources))}
          initialCategories={JSON.parse(JSON.stringify(categories))}
        />
      </Suspense>

      <Footer />
    </main>
  );
}
