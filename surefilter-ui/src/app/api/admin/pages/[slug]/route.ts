import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { isProtectedSlug, isValidNewSlug, RESERVED_SLUGS } from '@/lib/pages';

// keep using shared helpers

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const { title, description, ogImage, slug: newSlug } = body ?? {};

  // If slug change requested, validate and ensure uniqueness
  if (newSlug && newSlug !== slug) {
    if (!isValidNewSlug(newSlug)) return NextResponse.json({ error: 'Invalid or reserved slug' }, { status: 400 });
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

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const { type } = await req.json();
  if (!type) return NextResponse.json({ error: 'Type required' }, { status: 400 });

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  // Minimal defaults per type
  const defaults: Record<string, any> = {
    page_hero: { title: page.title, description: page.description ?? '' },
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

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
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


