import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesShell, { type Tile } from '@/components/resources/ResourcesShell';
import { prisma } from '@/lib/prisma';

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ category: string }>;
}

const publishedResourceFilter = {
  status: 'PUBLISHED' as const,
  publishedAt: { lte: new Date() },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  let cat: { name: string; description: string | null } | null = null;
  try {
    cat = await prisma.resourceCategory.findFirst({
      where: { slug: category, isActive: true, parentId: null },
      select: { name: true, description: true },
    });
  } catch {
    // DB unavailable during build
  }
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description || undefined,
    alternates: { canonical: `/resources/${category}` },
  };
}

export default async function ResourcesCategoryPage({ params }: PageProps) {
  const { category } = await params;

  const categoryData = await prisma.resourceCategory.findFirst({
    where: { slug: category, isActive: true, parentId: null },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
        include: { _count: { select: { resources: { where: publishedResourceFilter } } } },
      },
    },
  });

  if (!categoryData) {
    notFound();
  }

  const topCategories = await prisma.resourceCategory.findMany({
    where: { isActive: true, parentId: null },
    include: { _count: { select: { resources: { where: publishedResourceFilter } } } },
    orderBy: { position: 'asc' },
  });

  const hasChildren = categoryData.children.length > 0;
  const tiles: Tile[] = [];

  if (hasChildren) {
    for (const c of categoryData.children) {
      tiles.push({
        kind: 'subcategory',
        data: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          parentSlug: category,
          image: c.image,
          description: c.description,
          resourceCount: c._count.resources,
        },
      });
    }
  } else {
    const resources = await prisma.resource.findMany({
      where: {
        ...publishedResourceFilter,
        category: { slug: category, isActive: true },
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

  const subcategoryNav = hasChildren
    ? {
        parentSlug: category,
        parentName: categoryData.name,
        activeSubSlug: '',
        items: categoryData.children.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          resourceCount: c._count.resources,
        })),
      }
    : null;

  return (
    <main>
      <Header />
      <DynamicResourcesHero />
      <ResourcesShell
        topCategories={JSON.parse(JSON.stringify(topCategories))}
        activeTopSlug={category}
        subcategoryNav={subcategoryNav ? JSON.parse(JSON.stringify(subcategoryNav)) : null}
        tiles={JSON.parse(JSON.stringify(tiles))}
      />
      <Footer />
    </main>
  );
}
