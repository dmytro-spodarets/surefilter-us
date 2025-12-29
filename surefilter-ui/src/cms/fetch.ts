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

  const sections: CmsSection[] = await Promise.all(page.sections.map(async (ps) => {
    let sectionData = ps.section.data as any;
    
    // For content_with_images, load sidebar widget data if specified
    if (ps.section.type === 'content_with_images' && sectionData?.sidebarSharedSectionId) {
      const sharedSection = await prisma.sharedSection.findUnique({
        where: { id: sectionData.sidebarSharedSectionId },
      });
      
      if (sharedSection) {
        sectionData = {
          ...sectionData,
          sidebarData: sharedSection.data as any,
        };
      }
    }
    
    return {
      id: ps.section.id,
      type: ps.section.type as any,
      data: sectionData,
      position: ps.position,
      sharedSection: ps.section.sharedSection ? {
        id: ps.section.sharedSection.id,
        name: ps.section.sharedSection.name,
        type: ps.section.sharedSection.type as any,
        data: ps.section.sharedSection.data as any,
      } : undefined,
    } as any;
  }));

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


