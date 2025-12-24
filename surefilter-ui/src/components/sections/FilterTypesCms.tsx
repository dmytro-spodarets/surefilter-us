import prisma from '@/lib/prisma';
import RelatedFilters from './RelatedFilters';

export default async function FilterTypesCms({ 
  title, 
  description, 
  filterTypeIds 
}: { 
  title?: string; 
  description?: string; 
  filterTypeIds?: string[];
}) {
  // If no filterTypeIds provided, return empty
  if (!filterTypeIds || filterTypeIds.length === 0) {
    return <RelatedFilters title={title} description={description} filters={[]} />;
  }

  // Load selected FilterTypes
  const items = await prisma.filterType.findMany({
    where: { 
      id: { in: filterTypeIds },
      isActive: true 
    },
  });

  // Sort by the order in filterTypeIds
  const sortedItems = filterTypeIds
    .map(id => items.find(item => item.id === id))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  // Load metadata from pages
  const pageSlugs = sortedItems.map((it) => it.pageSlug).filter((s): s is string => Boolean(s));
  const pages = pageSlugs.length
    ? await prisma.page.findMany({ 
        where: { slug: { in: pageSlugs } }, 
        include: { sections: { include: { section: true } } } 
      })
    : [];
  
  const metaBySlug = new Map<string, any>();
  for (const p of pages) {
    const meta = p.sections.find((ps) => ps.section.type === 'listing_card_meta')?.section.data as any;
    if (meta) metaBySlug.set(p.slug, meta);
  }

  // Build filters array with metadata
  const filters = sortedItems.map((it) => {
    const meta = it.pageSlug ? metaBySlug.get(it.pageSlug) : undefined;
    return {
      name: (meta?.listTitle as string) || it.name,
      href: `/${it.fullSlug}`,
      image: (meta?.listImage as string) || it.heroImage || '',
      description: (meta?.listDescription as string) || it.description || '',
    };
  });

  return <RelatedFilters title={title} description={description} filters={filters} />;
}



