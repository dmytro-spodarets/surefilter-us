import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DynamicResourcesHero from '@/components/sections/DynamicResourcesHero';
import ResourcesShell, { type Tile } from '@/components/resources/ResourcesShell';
import ResourceDetailView from '@/components/resources/ResourceDetailView';
import { prisma } from '@/lib/prisma';
import { getAssetUrl } from '@/lib/assets';

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ category: string; path: string[] }>;
}

const publishedResourceFilter = {
  status: 'PUBLISHED' as const,
  publishedAt: { lte: new Date() },
};

const resourceDetailSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  shortDescription: true,
  thumbnailImage: true,
  file: true,
  fileType: true,
  fileSize: true,
  fileMeta: true,
  categoryId: true,
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
  form: { select: { id: true, name: true, slug: true, description: true } },
};

async function resolve(category: string, path: string[]) {
  if (path.length === 1) {
    const [first] = path;
    const subcategory = await prisma.resourceCategory.findFirst({
      where: {
        slug: first,
        isActive: true,
        parent: { slug: category, isActive: true },
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { resources: { where: publishedResourceFilter } } },
      },
    });
    if (subcategory) return { kind: 'subcategory' as const, subcategory };

    const resource = await prisma.resource.findFirst({
      where: {
        slug: first,
        ...publishedResourceFilter,
        category: { slug: category, isActive: true, parentId: null },
      },
      select: resourceDetailSelect,
    });
    if (resource) return { kind: 'resource' as const, resource };
  } else if (path.length === 2) {
    const [subSlug, slug] = path;
    const resource = await prisma.resource.findFirst({
      where: {
        slug,
        ...publishedResourceFilter,
        category: {
          slug: subSlug,
          isActive: true,
          parent: { slug: category, isActive: true },
        },
      },
      select: resourceDetailSelect,
    });
    if (resource) return { kind: 'resource' as const, resource };
  }

  return { kind: 'notfound' as const };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, path } = await params;
  try {
    const result = await resolve(category, path);
    if (result.kind === 'subcategory') {
      const sub = result.subcategory;
      return {
        title: sub.name,
        description: sub.description || undefined,
        alternates: { canonical: `/resources/${category}/${sub.slug}` },
      };
    }
    if (result.kind === 'resource') {
      const r = result.resource;
      const canonical = r.category.parent
        ? `/resources/${r.category.parent.slug}/${r.category.slug}/${r.slug}`
        : `/resources/${r.category.slug}/${r.slug}`;
      const image = r.thumbnailImage ? getAssetUrl(r.thumbnailImage) : undefined;
      return {
        title: r.title,
        description: r.shortDescription || undefined,
        openGraph: {
          title: r.title,
          ...(r.shortDescription ? { description: r.shortDescription } : {}),
          ...(image ? { images: [image] } : {}),
          type: 'website',
        },
        alternates: { canonical },
      };
    }
  } catch {
    // DB unavailable during build
  }
  return {};
}

export default async function Page({ params }: PageProps) {
  const { category, path } = await params;
  const result = await resolve(category, path);

  if (result.kind === 'notfound') {
    notFound();
  }

  if (result.kind === 'subcategory') {
    const sub = result.subcategory;
    const parentName = sub.parent?.name || category;

    const [resources, topCategories, siblings] = await Promise.all([
      prisma.resource.findMany({
        where: { ...publishedResourceFilter, categoryId: sub.id },
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
      }),
      prisma.resourceCategory.findMany({
        where: { isActive: true, parentId: null },
        include: { _count: { select: { resources: { where: publishedResourceFilter } } } },
        orderBy: { position: 'asc' },
      }),
      prisma.resourceCategory.findMany({
        where: {
          isActive: true,
          parent: { slug: category, isActive: true },
        },
        include: { _count: { select: { resources: { where: publishedResourceFilter } } } },
        orderBy: { position: 'asc' },
      }),
    ]);

    const tiles: Tile[] = resources.map((r) => ({ kind: 'resource' as const, data: r as any }));

    const subcategoryNav = {
      parentSlug: category,
      parentName,
      activeSubSlug: sub.slug,
      items: siblings.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        resourceCount: s._count.resources,
      })),
    };

    return (
      <main>
        <Header />
        <DynamicResourcesHero />
        <ResourcesShell
          topCategories={JSON.parse(JSON.stringify(topCategories))}
          activeTopSlug={category}
          subcategoryNav={JSON.parse(JSON.stringify(subcategoryNav))}
          breadcrumbs={[
            { label: 'Resources', href: '/resources' },
            { label: parentName, href: `/resources/${category}` },
            { label: sub.name },
          ]}
          tiles={JSON.parse(JSON.stringify(tiles))}
          heading={sub.name}
          headingDescription={sub.description || undefined}
        />
        <Footer />
      </main>
    );
  }

  // Resource detail
  const r = result.resource;
  const related = await prisma.resource.findMany({
    where: {
      ...publishedResourceFilter,
      categoryId: r.categoryId,
      slug: { not: r.slug },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      shortDescription: true,
      thumbnailImage: true,
      fileType: true,
      category: {
        select: {
          slug: true,
          name: true,
          parent: { select: { slug: true } },
        },
      },
    },
  });

  return (
    <main>
      <Header />
      <ResourceDetailView resource={r} related={related} />
      <Footer />
    </main>
  );
}
