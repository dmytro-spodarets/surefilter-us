import prisma from '@/lib/prisma';
import RelatedFilters from './RelatedFilters';

export default async function FilterTypesCms({ title, description, category, sectionId }: { title?: string; description?: string; category?: 'HEAVY_DUTY' | 'AUTOMOTIVE'; sectionId: string }) {
  let resolvedCategory = category;
  if (!resolvedCategory) {
    const owning = await prisma.pageSection.findFirst({ where: { sectionId }, include: { page: true } });
    const slug = owning?.page?.slug || '';
    if (slug.startsWith('automotive')) resolvedCategory = 'AUTOMOTIVE';
    else resolvedCategory = 'HEAVY_DUTY';
  }

  // TODO: Update to use ProductCategory relation instead of enum
  const items = await prisma.filterType.findMany({
    where: { /* category: resolvedCategory, */ parentId: null, isActive: true },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
  });
  const pageSlugs = items.map((it) => it.pageSlug).filter((s): s is string => Boolean(s));
  const pages = pageSlugs.length
    ? await prisma.page.findMany({ where: { slug: { in: pageSlugs } }, include: { sections: { include: { section: true } } } })
    : [];
  const metaBySlug = new Map<string, any>();
  for (const p of pages) {
    const meta = p.sections.find((ps) => ps.section.type === 'listing_card_meta')?.section.data as any;
    if (meta) metaBySlug.set(p.slug, meta);
  }
  const filters = items.map((it) => {
    const meta = it.pageSlug ? metaBySlug.get(it.pageSlug) : undefined;
    return {
      name: (meta?.listTitle as string) || it.name,
      href: `/${it.fullSlug}`,
      icon: it.icon || 'Squares2X2Icon',
      description: (meta?.listDescription as string) || it.description || '',
    };
  });
  return <RelatedFilters title={title} description={description} filters={filters} />;
}



