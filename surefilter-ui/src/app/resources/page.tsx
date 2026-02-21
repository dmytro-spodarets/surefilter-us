import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesClient from './ResourcesClient';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;
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
      <Suspense>
        <ResourcesClient
          initialResources={JSON.parse(JSON.stringify(resources))}
          initialCategories={JSON.parse(JSON.stringify(categories))}
        />
      </Suspense>

      <Footer />
    </main>
  );
}
