import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const { type } = await req.json();
  if (!type) return NextResponse.json({ error: 'Type required' }, { status: 400 });

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const defaults: Record<string, any> = {
    page_hero: { title: page.title, description: page.description ?? '' },
    about_with_stats: { title: '', description: '', features: [], stats: [] },
    content_with_images: { title: '', subtitle: '', content: [], images: [] },
    quality_assurance: {},
    manufacturing_facilities: { title: 'Manufacturing Facilities', description: '', items: [] },
    our_company: { title: 'Our Company', subtitle: '', tabs: [] },
    stats_band: { title: 'Our Numbers', subtitle: '', items: [] },
    awards_carousel: { title: 'Awards', subtitle: '', items: [] },
    hero_full: { badge: '', title: '', titlePrefix: '', titleHighlight: '', subtitle: '', image: '' },
    featured_products: { title: 'Featured Products', description: '', fallbackHref: '/catalog', items: [] },
    why_choose: { title: 'Why Choose Sure Filter®?', description: '', items: [] },
    quick_search: { title: 'Find Your Filter Fast', description: '', placeholder: '', ctaLabel: 'Ask our team', ctaHref: '#' },
    industries: { title: 'Industries We Serve', description: '', items: [] },
    about_news: { aboutTitle: 'Who We Are', aboutParagraphs: [], stats: [], aboutCtaLabel: 'Learn More About Us', aboutCtaHref: '#', newsTitle: 'News & Updates', newsItems: [], newsCtaLabel: 'See All News', newsCtaHref: '#' },
    contact_hero: { title: 'Contact Us', description: '', image: '' },
    contact_form: { title: 'Send Us a Message', description: '', subjects: [] },
    contact_info: { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } },
    contact_details: { options: { phone: '', chatHref: '#', askHref: '#contact-form' }, info: { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } } },
    contact_form_info: { form: { title: 'Send Us a Message', description: '', subjects: [] }, info: { title: 'Get in Touch', general: { email: '', phone: '', fax: '' }, support: { email: '', phone: '', hours: '' }, address: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: '' } } },
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


