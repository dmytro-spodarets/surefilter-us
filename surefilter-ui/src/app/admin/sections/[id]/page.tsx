import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import HomeHeroForm from '@/app/admin/pages/[slug]/sections/HomeHeroForm';
import FeaturedProductsForm from '@/app/admin/pages/[slug]/sections/FeaturedProductsForm';
import WhyChooseForm from '@/app/admin/pages/[slug]/sections/WhyChooseForm';
import QuickSearchForm from '@/app/admin/pages/[slug]/sections/QuickSearchForm';
import IndustriesForm from '@/app/admin/pages/[slug]/sections/IndustriesForm';
import AboutNewsForm from '@/app/admin/pages/[slug]/sections/AboutNewsForm';
import PageHeroForm from '@/app/admin/pages/[slug]/sections/PageHeroForm';
import SingleImageHeroForm from '@/app/admin/pages/[slug]/sections/SingleImageHeroForm';
import AboutWithStatsForm from '@/app/admin/pages/[slug]/sections/AboutWithStatsForm';
import ContentWithImagesForm from '@/app/admin/pages/[slug]/sections/ContentWithImagesForm';
import QualityAssuranceForm from '@/app/admin/pages/[slug]/sections/QualityAssuranceForm';
import ManufacturingFacilitiesForm from '@/app/admin/pages/[slug]/sections/ManufacturingFacilitiesForm';
import OurCompanyForm from '@/app/admin/pages/[slug]/sections/OurCompanyForm';
import StatsBandForm from '@/app/admin/pages/[slug]/sections/StatsBandForm';
import AwardsCarouselForm from '@/app/admin/pages/[slug]/sections/AwardsCarouselForm';
import ContactHeroForm from '@/app/admin/pages/[slug]/sections/ContactHeroForm';
import ContactFormForm from '@/app/admin/pages/[slug]/sections/ContactFormForm';
import ContactInfoForm from '@/app/admin/pages/[slug]/sections/ContactInfoForm';
import ContactDetailsForm from '@/app/admin/pages/[slug]/sections/ContactDetailsForm';
import ContactFormInfoForm from '@/app/admin/pages/[slug]/sections/ContactFormInfoForm';
import ContactOptionsForm from '@/app/admin/pages/[slug]/sections/ContactOptionsForm';
import IndustriesListForm from '@/app/admin/pages/[slug]/sections/IndustriesListForm';
import IndustryMetaForm from '@/app/admin/pages/[slug]/sections/IndustryMetaForm';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditSectionById({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const { id } = await params;

  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) redirect('/admin/pages');

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Section: {section.type}</h1>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/industries" className="text-sure-blue-600 hover:underline">← Back</Link>
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
        {section.type === 'single_image_hero' && (
          <SingleImageHeroForm sectionId={section.id} initialData={section.data as any} />
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
        {section.type === 'industries_list' && (
          <IndustriesListForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'industry_meta' && (
          <IndustryMetaForm sectionId={section.id} initialData={section.data as any} />
        )}
      </div>
    </main>
  );
}


