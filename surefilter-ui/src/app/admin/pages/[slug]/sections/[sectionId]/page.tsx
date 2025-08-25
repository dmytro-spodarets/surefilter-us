import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import DeleteSectionButton from '../DeleteSectionButton';
import HomeHeroForm from '../../sections/HomeHeroForm';
import FeaturedProductsForm from '../../sections/FeaturedProductsForm';
import WhyChooseForm from '../../sections/WhyChooseForm';
import QuickSearchForm from '../../sections/QuickSearchForm';
import IndustriesForm from '../../sections/IndustriesForm';
import AboutNewsForm from '../../sections/AboutNewsForm';
import PageHeroForm from '@/app/admin/pages/[slug]/sections/PageHeroForm';
import AboutWithStatsForm from '@/app/admin/pages/[slug]/sections/AboutWithStatsForm';
import ContentWithImagesForm from '@/app/admin/pages/[slug]/sections/ContentWithImagesForm';
import QualityAssuranceForm from '@/app/admin/pages/[slug]/sections/QualityAssuranceForm';
import ManufacturingFacilitiesForm from '../../sections/ManufacturingFacilitiesForm';
import OurCompanyForm from '../../sections/OurCompanyForm';
import StatsBandForm from '../../sections/StatsBandForm';
import AwardsCarouselForm from '../../sections/AwardsCarouselForm';
import ContactHeroForm from '../../sections/ContactHeroForm';
import ContactFormForm from '../../sections/ContactFormForm';
import ContactInfoForm from '../../sections/ContactInfoForm';
import ContactDetailsForm from '../../sections/ContactDetailsForm';
import ContactFormInfoForm from '../../sections/ContactFormInfoForm';
import ContactOptionsForm from '../../sections/ContactOptionsForm';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditSection({ params }: { params: Promise<{ slug: string; sectionId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const { slug, sectionId } = await params;

  const page = await prisma.page.findUnique({ where: { slug }, select: { title: true, slug: true } });
  if (!page) redirect('/admin/pages');
  const section = await prisma.section.findUnique({ where: { id: sectionId } });
  if (!section) redirect(`/admin/pages/${slug}`);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Section: {section.type}</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/admin/pages/${slug}`} className="text-sure-blue-600 hover:underline">← Back to page</Link>
          </div>
        </div>

        {section.type === 'hero_full' && (
          <HomeHeroForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'featured_products' && (
          <FeaturedProductsForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'why_choose' && (
          <WhyChooseForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'quick_search' && (
          <QuickSearchForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'industries' && (
          <IndustriesForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'about_news' && (
          <AboutNewsForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'page_hero' && (
          <PageHeroForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'about_with_stats' && (
          <AboutWithStatsForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'content_with_images' && (
          <ContentWithImagesForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'quality_assurance' && (
          <QualityAssuranceForm sectionId={section.id} />
        )}

        {section.type === 'manufacturing_facilities' && (
          <ManufacturingFacilitiesForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'our_company' && (
          <OurCompanyForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'stats_band' && (
          <StatsBandForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'awards_carousel' && (
          <AwardsCarouselForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'contact_hero' && (
          <ContactHeroForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'contact_form' && (
          <ContactFormForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'contact_info' && (
          <ContactInfoForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'contact_details' && (
          <ContactDetailsForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'contact_form_info' && (
          <ContactFormInfoForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type === 'contact_options' && (
          <ContactOptionsForm sectionId={section.id} initialData={section.data as any} />
        )}

        {section.type !== 'hero_full' && section.type !== 'featured_products' && section.type !== 'why_choose' && section.type !== 'quick_search' && section.type !== 'industries' && section.type !== 'about_news' && section.type !== 'page_hero' && section.type !== 'about_with_stats' && section.type !== 'content_with_images' && section.type !== 'quality_assurance' && section.type !== 'manufacturing_facilities' && section.type !== 'our_company' && section.type !== 'stats_band' && section.type !== 'awards_carousel' && section.type !== 'contact_hero' && section.type !== 'contact_form' && section.type !== 'contact_info' && section.type !== 'contact_details' && section.type !== 'contact_form_info' && section.type !== 'contact_options' && (
          <div className="text-sm text-gray-600">Editor for this section type is not yet implemented.</div>
        )}

        <div className="mt-6">
          <DeleteSectionButton sectionId={section.id} slug={slug} />
        </div>
      </div>
    </main>
  );
}


