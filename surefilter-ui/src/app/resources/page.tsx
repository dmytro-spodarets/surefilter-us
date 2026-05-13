import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesShell, { type Tile } from '@/components/resources/ResourcesShell';
import { prisma } from '@/lib/prisma';
import { getResourcesPageSettings } from '@/lib/site-settings';
import type { Metadata } from 'next';

export const revalidate = 86400;

const publishedResourceFilter = {
  status: 'PUBLISHED' as const,
  publishedAt: { lte: new Date() },
};

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
    alternates: { canonical: '/resources' },
  };
}

export default async function ResourcesPage() {
  let topCategories: any[] = [];
  let tiles: Tile[] = [];

  try {
    // Load top-level categories with their direct children + count
    topCategories = await prisma.resourceCategory.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: { select: { resources: { where: publishedResourceFilter } } },
        children: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
          include: { _count: { select: { resources: { where: publishedResourceFilter } } } },
        },
      },
      orderBy: { position: 'asc' },
    });

    // Build mixed tiles: for each top-level category in position order,
    // either expose its subcategories or its direct resources.
    for (const top of topCategories) {
      if (top.children.length > 0) {
        for (const child of top.children) {
          tiles.push({
            kind: 'subcategory',
            data: {
              id: child.id,
              name: child.name,
              slug: child.slug,
              parentSlug: top.slug,
              image: child.image,
              description: child.description,
              resourceCount: child._count.resources,
            },
          });
        }
      } else {
        const resources = await prisma.resource.findMany({
          where: { ...publishedResourceFilter, categoryId: top.id },
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
                parent: { select: { id: true, name: true, slug: true } },
              },
            },
          },
          orderBy: { publishedAt: 'desc' },
        });
        for (const r of resources) {
          tiles.push({ kind: 'resource', data: r as any });
        }
      }
    }
  } catch {
    // DB unavailable during build
  }

  return (
    <main>
      <Header />
      <DynamicResourcesHero />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
            <div className="flex gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-28" />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 h-72" />
              ))}
            </div>
          </div>
        }
      >
        <ResourcesShell
          topCategories={JSON.parse(JSON.stringify(topCategories))}
          activeTopSlug=""
          tiles={JSON.parse(JSON.stringify(tiles))}
        />
      </Suspense>
      <Footer />
    </main>
  );
}
