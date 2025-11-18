import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  HeroFullSchema,
  HeroCarouselSchema,
  FeaturedProductsSchema,
  WhyChooseSchema,
  QuickSearchSchema,
  SimpleSearchSchema,
  IndustriesSchema,
  IndustriesListSchema,
  AboutNewsSchema,
  PageHeroSchema,
  SingleImageHeroSchema,
  SearchHeroSchema,
  AboutWithStatsSchema,
  ContentWithImagesSchema,
  QualityAssuranceSchema,
  ManufacturingFacilitiesSchema,
  OurCompanySchema,
  StatsBandSchema,
  AwardsCarouselSchema,
  ContactHeroSchema,
  ContactFormSchema,
  ContactInfoSchema,
  ContactDetailsSchema,
  ContactFormInfoSchema,
  ContactOptionsSchema,
  ListingCardMetaSchema,
  PopularFiltersSchema,
  FilterTypesGridSchema,
  FilterTypesImageGridSchema,
} from '@/cms/schemas';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, data } = body ?? {};
  const { id } = await params;
  if (type === 'hero_full') {
    const parsed = HeroFullSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'hero_carousel') {
    const parsed = HeroCarouselSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'featured_products') {
    const parsed = FeaturedProductsSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'why_choose') {
    const parsed = WhyChooseSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'quick_search') {
    const parsed = QuickSearchSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'simple_search') {
    const parsed = SimpleSearchSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'industries') {
    const parsed = IndustriesSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'industries_list') {
    const parsed = IndustriesListSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'about_news') {
    const parsed = AboutNewsSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'page_hero') {
    const parsed = PageHeroSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'single_image_hero') {
    const parsed = SingleImageHeroSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'search_hero') {
    const parsed = SearchHeroSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'about_with_stats') {
    const parsed = AboutWithStatsSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'content_with_images') {
    const parsed = ContentWithImagesSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'quality_assurance') {
    const parsed = QualityAssuranceSchema.safeParse(data ?? {});
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'manufacturing_facilities') {
    const parsed = ManufacturingFacilitiesSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'our_company') {
    const parsed = OurCompanySchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'stats_band') {
    const parsed = StatsBandSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'awards_carousel') {
    const parsed = AwardsCarouselSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'contact_hero') {
    const parsed = ContactHeroSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'contact_form') {
    const parsed = ContactFormSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'contact_info') {
    const parsed = ContactInfoSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'contact_details') {
    const parsed = ContactDetailsSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'contact_form_info') {
    const parsed = ContactFormInfoSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'contact_options') {
    const parsed = ContactOptionsSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'popular_filters') {
    const parsed = PopularFiltersSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'filter_types_grid') {
    const parsed = FilterTypesGridSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'filter_types_image_grid') {
    const parsed = FilterTypesImageGridSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else if (type === 'listing_card_meta') {
    const parsed = ListingCardMetaSchema.safeParse(data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    await prisma.section.update({ where: { id }, data: { data: parsed.data } });
  } else {
    return NextResponse.json({ error: 'Unsupported section type' }, { status: 400 });
  }
  try {
    // Revalidate all pages containing this section
    const pages = await prisma.pageSection.findMany({ where: { sectionId: id }, include: { page: true } });
    const { revalidateTag } = await import('next/cache');
    for (const ps of pages) {
      revalidateTag(`page:${ps.page.slug}`);
    }
  } catch {}
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  // Get related pages before deletion
  const related = await prisma.pageSection.findMany({ where: { sectionId: id }, include: { page: true } });
  await prisma.pageSection.deleteMany({ where: { sectionId: id } });
  await prisma.section.delete({ where: { id } });
  try {
    const { revalidateTag } = await import('next/cache');
    for (const ps of related) {
      revalidateTag(`page:${ps.page.slug}`);
    }
  } catch {}
  return NextResponse.json({ ok: true });
}


