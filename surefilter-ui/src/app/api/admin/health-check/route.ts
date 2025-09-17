import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const results = {
      timestamp: new Date().toISOString(),
      database: { status: 'unknown', error: null },
      duplicates: { count: 0, items: [] },
      orphaned: { count: 0, items: [] },
      criticalPages: { missing: [], status: 'unknown' },
      filterTypes: { withoutPageSlug: 0, total: 0 }
    };

    // 1. Database connection test
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database.status = 'connected';
    } catch (error: any) {
      results.database.status = 'error';
      results.database.error = error.message;
    }

    // 2. Check for duplicates
    const pages = await prisma.page.findMany({
      select: { id: true, title: true, slug: true, createdAt: true }
    });

    const groupedByTitle: Record<string, any[]> = {};
    pages.forEach(page => {
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

    results.duplicates.count = duplicates.length;
    results.duplicates.items = duplicates.map(([title, pages]) => ({
      title,
      pages: pages.map(p => ({ slug: p.slug, createdAt: p.createdAt }))
    }));

    // 3. Check for orphaned FilterTypes
    const filterTypes = await prisma.filterType.findMany({
      where: { pageSlug: { not: null } },
      select: { name: true, pageSlug: true, category: true }
    });

    const pageSlugs = new Set(pages.map(p => p.slug));
    const orphaned = filterTypes.filter(ft => !pageSlugs.has(ft.pageSlug));

    results.orphaned.count = orphaned.length;
    results.orphaned.items = orphaned.map(ft => ({
      name: ft.name,
      category: ft.category,
      pageSlug: ft.pageSlug
    }));

    // 4. Check critical pages
    const criticalPages = [
      'home', 'about-us', 'contact-us', 'industries', 'heavy-duty', 'automotive'
    ];
    const existingPages = pages.map(p => p.slug);
    const missingPages = criticalPages.filter(slug => !existingPages.includes(slug));
    
    results.criticalPages.missing = missingPages;
    results.criticalPages.status = missingPages.length === 0 ? 'ok' : 'missing';

    // 5. Check FilterTypes pageSlug status
    const allFilterTypes = await prisma.filterType.findMany({
      select: { pageSlug: true }
    });
    
    results.filterTypes.total = allFilterTypes.length;
    results.filterTypes.withoutPageSlug = allFilterTypes.filter(ft => !ft.pageSlug).length;

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Health check failed', 
      details: error.message 
    }, { status: 500 });
  }
}
