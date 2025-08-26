import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { isProtectedSlug, RESERVED_SLUGS } from '@/lib/pages';

function joinSlug(parts: string[]) {
  return (parts || []).join('/');
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug: parts } = await params;
  const slug = joinSlug(parts);
  const body = await req.json();
  const { title, description, ogImage, slug: newSlug, action } = body ?? {};

  // Support action=reorder via PUT to avoid separate path after catch-all
  if (action === 'reorder') {
    const { sectionId, direction } = body ?? {};
    if (!sectionId || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    const page = await prisma.page.findUnique({ where: { slug }, include: { sections: { orderBy: { position: 'asc' } } } });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    const list = page.sections;
    const idx = list.findIndex((ps) => ps.sectionId === sectionId);
    if (idx === -1) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= list.length) {
      return NextResponse.json({ ok: true, noop: true });
    }
    const a = list[idx];
    const b = list[swapWith];
    await prisma.$transaction([
      prisma.pageSection.update({ where: { id: a.id }, data: { position: b.position } }),
      prisma.pageSection.update({ where: { id: b.id }, data: { position: a.position } }),
    ]);
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`page:${slug}`);
    } catch {}
    return NextResponse.json({ ok: true });
  }

  if (newSlug && newSlug !== slug) {
    const first = (newSlug.split('/')?.[0] || '');
    const valid = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(newSlug) && !RESERVED_SLUGS.has(first);
    if (!valid) return NextResponse.json({ error: 'Invalid or reserved slug' }, { status: 400 });
    const exists = await prisma.page.findUnique({ where: { slug: newSlug } });
    if (exists) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
  }

  const updated = await prisma.page.update({
    where: { slug },
    data: {
      title: title ?? undefined,
      description: description ?? undefined,
      ogImage: ogImage ?? undefined,
      ...(newSlug && newSlug !== slug ? { slug: newSlug } : {}),
    },
  });

  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(`page:${slug}`);
    if (newSlug && newSlug !== slug) revalidateTag(`page:${newSlug}`);
  } catch {}

  return NextResponse.json({ ok: true, slug: updated.slug });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug: parts } = await params;
  const slug = joinSlug(parts);
  const { type } = await req.json();
  if (!type) return NextResponse.json({ error: 'Type required' }, { status: 400 });

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const defaults: Record<string, any> = {
    page_hero: { title: page.title, description: page.description ?? '' },
    single_image_hero: { title: page.title, description: page.description ?? '', image: '' },
    compact_search_hero: { title: page.title, description: page.description ?? '', image: '' },
    simple_search: { title: 'Find Your Filter', description: 'Search by part number or equipment model', placeholder: 'Enter part number or equipment model...', buttonText: 'Search' },
    about_with_stats: { title: '', description: '', features: [], stats: [] },
    content_with_images: { title: '', subtitle: '', content: [], images: [] },
    quality_assurance: {},
    manufacturing_facilities: { title: 'Manufacturing Facilities', description: '', items: [] },
    our_company: { title: 'Our Company', subtitle: '', tabs: [] },
    stats_band: { title: 'Our Numbers', subtitle: '', items: [] },
    awards_carousel: { title: 'Awards', subtitle: '', items: [] },
    contact_hero: { title: 'Contact Us', description: '', image: '' },
    contact_form: { title: 'Send Us a Message', description: '', subjects: [] },
    contact_info: { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } },
    contact_details: { options: { phone: '', chatHref: '#', askHref: '#contact-form' }, info: { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } } },
    contact_form_info: { form: { title: 'Send Us a Message', description: '', subjects: [] }, info: { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } } },
    hero_full: { badge: '', title: '', titlePrefix: '', titleHighlight: '', subtitle: '', image: '' },
    featured_products: { title: 'Featured Products', description: '', fallbackHref: '/catalog', items: [] },
    why_choose: { title: 'Why Choose Sure Filter®?', description: '', items: [] },
    quick_search: { title: 'Find Your Filter Fast', description: '', placeholder: '', ctaLabel: 'Ask our team', ctaHref: '#' },
    industries: { title: 'Industries We Serve', description: '', items: [] },
    industries_list: { title: 'Our Industries', description: 'Specialized filtration solutions tailored to the unique challenges of each industry' },
    industry_meta: { listTitle: '', listDescription: '', listImage: '', popularFilters: [] },
    popular_filters: { title: 'Popular Filters', description: '', catalogHref: '/catalog', catalogText: 'Browse All Filters', columnsPerRow: 5, items: [] },
    related_filters: { title: 'Related Filter Types', description: '', filters: [] },
    about_news: { aboutTitle: 'Who We Are', aboutParagraphs: [], stats: [], aboutCtaLabel: 'Learn More About Us', aboutCtaHref: '#', newsTitle: 'News & Updates', newsItems: [], newsCtaLabel: 'See All News', newsCtaHref: '#' },
  };
  const data = defaults[type] ?? {};

  const sec = await prisma.section.create({ data: { type, data } });
  const last = await prisma.pageSection.findFirst({ where: { pageId: page.id }, orderBy: { position: 'desc' } });
  const position = (last?.position ?? 0) + 1;
  await prisma.pageSection.create({ data: { pageId: page.id, sectionId: sec.id, position } });

  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(`page:${slug}`);
  } catch {}

  return NextResponse.json({ ok: true, id: sec.id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug: parts } = await params;
  const slug = joinSlug(parts);
  if (isProtectedSlug(slug)) return NextResponse.json({ error: 'This page is protected and cannot be deleted' }, { status: 400 });
  try {
    await prisma.page.delete({ where: { slug } });
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`page:${slug}`);
    } catch {}
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}


