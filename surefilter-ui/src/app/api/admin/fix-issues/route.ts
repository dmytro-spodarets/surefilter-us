import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const results = {
      timestamp: new Date().toISOString(),
      orphanedFixed: 0,
      duplicatesRemoved: 0,
      errors: []
    };

    // 1. Fix orphaned FilterTypes
    const filterTypes = await prisma.filterType.findMany({
      where: { pageSlug: { not: null } },
      select: { id: true, name: true, pageSlug: true, category: true }
    });

    const pages = await prisma.page.findMany({
      select: { slug: true }
    });

    const pageSlugs = new Set(pages.map(p => p.slug));
    const orphaned = filterTypes.filter(ft => !pageSlugs.has(ft.pageSlug));

    for (const ft of orphaned) {
      try {
        // Try to find a matching page
        const possibleSlug = ft.pageSlug.replace('-filters', '').replace('-filter', '');
        const matchingPage = pages.find(p => p.slug === possibleSlug);

        if (matchingPage) {
          await prisma.filterType.update({
            where: { id: ft.id },
            data: { pageSlug: matchingPage.slug }
          });
          results.orphanedFixed++;
        } else {
          await prisma.filterType.update({
            where: { id: ft.id },
            data: { pageSlug: null }
          });
          results.orphanedFixed++;
        }
      } catch (error: any) {
        results.errors.push(`Failed to fix ${ft.name}: ${error.message}`);
      }
    }

    // 2. Remove duplicate pages
    const allPages = await prisma.page.findMany({
      select: { id: true, title: true, slug: true, createdAt: true }
    });

    const groupedByTitle: Record<string, any[]> = {};
    allPages.forEach(page => {
      if (!groupedByTitle[page.title]) {
        groupedByTitle[page.title] = [];
      }
      groupedByTitle[page.title].push(page);
    });

    const duplicates = Object.entries(groupedByTitle)
      .filter(([title, pages]) => {
        if (pages.length <= 1) return false;
        const categories = pages.map(p => p.slug.split('/')[0]);
        const uniqueCategories = [...new Set(categories)];
        return !(uniqueCategories.length === pages.length && 
                uniqueCategories.every(cat => ['automotive', 'heavy-duty'].includes(cat)));
      });

    for (const [title, pages] of duplicates) {
      try {
        const sortedPages = pages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const keepPage = sortedPages[0];
        const deletePages = sortedPages.slice(1);

        for (const page of deletePages) {
          // Update FilterTypes that reference the deleted page
          await prisma.filterType.updateMany({
            where: { pageSlug: page.slug },
            data: { pageSlug: keepPage.slug }
          });

          // Delete the page
          await prisma.page.delete({
            where: { id: page.id }
          });

          results.duplicatesRemoved++;
        }
      } catch (error: any) {
        results.errors.push(`Failed to remove duplicates for ${title}: ${error.message}`);
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Fix failed', 
      details: error.message 
    }, { status: 500 });
  }
}
