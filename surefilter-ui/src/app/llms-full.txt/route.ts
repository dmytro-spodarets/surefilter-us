import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';
  const settings = await getSiteSettings();

  const description = settings.llmsSiteDescription ||
    'Sure Filter US is a manufacturer and distributor of premium aftermarket automotive and industrial filtration products, including air filters, oil filters, fuel filters, hydraulic filters, and cabin air filters for heavy duty and automotive applications.';

  // Fetch all data in parallel
  const [pages, products, articles, resources] = await Promise.all([
    prisma.page.findMany({
      where: { status: 'published' },
      select: { slug: true, title: true, description: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.findMany({
      select: {
        code: true,
        name: true,
        filterType: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { code: 'asc' },
      take: 500,
    }),
    prisma.newsArticle.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
      },
      select: { slug: true, title: true, excerpt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    }),
    prisma.resource.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        title: true,
        shortDescription: true,
        category: { select: { slug: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const lines: string[] = [];

  lines.push('# Sure Filter US');
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');

  // Main Pages with descriptions
  if (pages.length > 0) {
    lines.push('## Main Pages');
    for (const page of pages) {
      const desc = page.description ? `: ${page.description}` : '';
      lines.push(`- [${page.title}](${baseUrl}/${page.slug})${desc}`);
    }
    lines.push('');
  }

  // Products section with details
  if (products.length > 0) {
    lines.push('## Products');
    lines.push(`- [Product Catalog](${baseUrl}/catalog): Full product catalog with search and filtering`);
    lines.push('');

    // Group by filter type
    const byType = new Map<string, typeof products>();
    for (const p of products) {
      const typeName = p.filterType?.name || 'Other';
      if (!byType.has(typeName)) byType.set(typeName, []);
      byType.get(typeName)!.push(p);
    }

    for (const [typeName, typeProducts] of byType) {
      lines.push(`### ${typeName} (${typeProducts.length} products)`);
      for (const p of typeProducts.slice(0, 50)) {
        const name = p.name ? ` - ${p.name}` : '';
        const brand = p.brand?.name ? ` (${p.brand.name})` : '';
        lines.push(`- [${p.code}](${baseUrl}/products/${p.code})${name}${brand}`);
      }
      if (typeProducts.length > 50) {
        lines.push(`- ... and ${typeProducts.length - 50} more ${typeName} products`);
      }
      lines.push('');
    }
  }

  // News articles with excerpts
  if (articles.length > 0) {
    lines.push('## News & Events');
    lines.push(`- [Newsroom](${baseUrl}/newsroom): Latest news, press releases, and events`);
    lines.push('');
    for (const article of articles) {
      const date = article.publishedAt.toISOString().split('T')[0];
      lines.push(`### ${article.title}`);
      lines.push(`- Date: ${date}`);
      lines.push(`- Link: [Read more](${baseUrl}/newsroom/${article.slug})`);
      if (article.excerpt) {
        lines.push(`- ${article.excerpt}`);
      }
      lines.push('');
    }
  }

  // Resources with descriptions
  if (resources.length > 0) {
    lines.push('## Resources');
    lines.push(`- [Resources](${baseUrl}/resources): Technical documents, catalogs, and guides`);
    lines.push('');

    // Group by category
    const byCategory = new Map<string, { categorySlug: string; items: typeof resources }>();
    for (const r of resources) {
      const catName = r.category.name;
      if (!byCategory.has(catName)) {
        byCategory.set(catName, { categorySlug: r.category.slug, items: [] });
      }
      byCategory.get(catName)!.items.push(r);
    }

    for (const [catName, { categorySlug, items }] of byCategory) {
      lines.push(`### ${catName}`);
      for (const r of items) {
        const desc = r.shortDescription ? `: ${r.shortDescription}` : '';
        lines.push(`- [${r.title}](${baseUrl}/resources/${categorySlug}/${r.slug})${desc}`);
      }
      lines.push('');
    }
  }

  // Optional
  lines.push('## Optional');
  lines.push(`- [Contact Us](${baseUrl}/contact-us): Contact form and company information`);
  lines.push(`- [Warranty](${baseUrl}/warranty): Warranty information and policy`);
  lines.push('');

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
