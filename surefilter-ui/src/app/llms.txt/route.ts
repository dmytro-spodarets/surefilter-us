import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';
  const settings = await getSiteSettings();

  const description = settings.llmsSiteDescription ||
    'Sure Filter US is a manufacturer and distributor of premium aftermarket automotive and industrial filtration products, including air filters, oil filters, fuel filters, hydraulic filters, and cabin air filters for heavy duty and automotive applications.';

  // Get published CMS pages
  const pages = await prisma.page.findMany({
    where: { status: 'published' },
    select: { slug: true, title: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Build llms.txt in standard format (llmstxt.org)
  const lines: string[] = [];

  lines.push('# Sure Filter US');
  lines.push('');
  lines.push(`> ${description}`);
  lines.push('');

  // Main Pages (CMS pages)
  if (pages.length > 0) {
    lines.push('## Main Pages');
    for (const page of pages) {
      lines.push(`- [${page.title}](${baseUrl}/${page.slug})`);
    }
    lines.push('');
  }

  // Products
  lines.push('## Products');
  lines.push(`- [Product Catalog](${baseUrl}/catalog): Full product catalog with search and filtering`);
  lines.push('');

  // Resources & News
  lines.push('## Resources');
  lines.push(`- [Newsroom](${baseUrl}/newsroom): Latest news, press releases, and events`);
  lines.push(`- [Resources](${baseUrl}/resources): Technical documents, catalogs, and guides`);
  lines.push('');

  // Optional
  lines.push('## Optional');
  lines.push(`- [Contact Us](${baseUrl}/contact-us): Contact form and company information`);
  lines.push(`- [Warranty](${baseUrl}/warranty): Warranty information and policy`);
  lines.push(`- [Full Content](${baseUrl}/llms-full.txt): Extended version with product details and news`);
  lines.push('');

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
