import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import type { CmsPage, CmsSection } from './types';

export async function loadPageBySlug(slug: string): Promise<CmsPage | null> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: { 
          section: {
            include: {
              sharedSection: true
            }
          }
        },
      },
    },
  });

  if (!page) return null;

  const sections: CmsSection[] = page.sections.map((ps) => ({
    id: ps.section.id,
    type: ps.section.type as any,
    data: ps.section.data as any,
    position: ps.position,
    sharedSection: ps.section.sharedSection ? {
      id: ps.section.sharedSection.id,
      name: ps.section.sharedSection.name,
      type: ps.section.sharedSection.type as any,
      data: ps.section.sharedSection.data as any,
    } : undefined,
  } as any));

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.description,
    ogImage: page.ogImage,
    sections,
  };
}

export async function loadCachedPageBySlug(slug: string): Promise<CmsPage | null> {
  const cached = unstable_cache(
    async () => loadPageBySlug(slug),
    ['cms-page', slug],
    { tags: [`page:${slug}`] }
  );
  return cached();
}


