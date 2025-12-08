import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import DeleteSectionButton from '@/app/admin/pages/[slug]/sections/DeleteSectionButton';
import HomeHeroForm from '@/app/admin/pages/[slug]/sections/HomeHeroForm';
import HeroCarouselForm from '@/app/admin/pages/[slug]/sections/HeroCarouselForm';
import FeaturedProductsForm from '@/app/admin/pages/[slug]/sections/FeaturedProductsForm';
import FeaturedProductsCatalogForm from '@/app/admin/pages/[slug]/sections/FeaturedProductsCatalogForm';
import WhyChooseForm from '@/app/admin/pages/[slug]/sections/WhyChooseForm';
import QuickSearchForm from '@/app/admin/pages/[slug]/sections/QuickSearchForm';
import IndustriesForm from '@/app/admin/pages/[slug]/sections/IndustriesForm';
import AboutNewsForm from '@/app/admin/pages/[slug]/sections/AboutNewsForm';
import PageHeroForm from '@/app/admin/pages/[slug]/sections/PageHeroForm';
import SingleImageHeroForm from '@/app/admin/pages/[slug]/sections/SingleImageHeroForm';
import SearchHeroForm from '@/app/admin/pages/[slug]/sections/SearchHeroForm';
import CompactSearchHeroForm from '@/app/admin/pages/[slug]/sections/CompactSearchHeroForm';
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
import IndustryShowcaseForm from '@/app/admin/pages/[slug]/sections/IndustryShowcaseForm';
import RelatedFiltersForm from '@/app/admin/pages/[slug]/sections/RelatedFiltersForm';
import FilterTypesGridForm from '@/app/admin/pages/[slug]/sections/FilterTypesGridForm';
import FilterTypesImageGridForm from '@/app/admin/pages/[slug]/sections/FilterTypesImageGridForm';
import PopularFiltersForm from '@/app/admin/pages/[slug]/sections/PopularFiltersForm';
import SimpleSearchForm from '@/app/admin/pages/[slug]/sections/SimpleSearchForm';
import FormEmbedForm from '@/app/admin/pages/[slug]/sections/FormEmbedForm';
import AdminContainer from '@/components/admin/AdminContainer';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EditSectionById({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  const { id } = await params;

  const section = await prisma.section.findUnique({ 
    where: { id },
    include: {
      sharedSection: true
    }
  });
  if (!section) redirect('/admin/pages');
  // Find parent page to enable back link and delete redirect
  const pageSection = await prisma.pageSection.findFirst({ where: { sectionId: id }, include: { page: true } as any });
  const parentSlug = (pageSection as any)?.page?.slug as string | undefined;

  // If this section uses a shared section, show info and redirect link
  if (section.sharedSection) {
    return (
      <AdminContainer className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Shared Section</h1>
          <div className="flex items-center gap-4 text-sm">
            {parentSlug ? (
              <Link href={`/admin/pages/${parentSlug}`} className="text-sure-blue-600 hover:underline">← Back to Page</Link>
            ) : (
              <Link href="/admin/pages" className="text-sure-blue-600 hover:underline">← Back</Link>
            )}
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8">
          <div className="flex items-start gap-4">
            <svg className="w-12 h-12 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">
                This is a Shared Section
              </h2>
              <p className="text-purple-800 mb-4">
                This section is linked to a shared section: <strong>{section.sharedSection.name}</strong>
              </p>
              <p className="text-purple-700 text-sm mb-6">
                Shared sections are managed centrally and can be used across multiple pages. 
                Any changes made to the shared section will automatically apply to all pages that use it.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/shared-sections/${section.sharedSection.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Shared Section
                </Link>
                <Link
                  href="/admin/shared-sections"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  View All Shared Sections
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-purple-200">
                <p className="text-sm text-purple-700 mb-3">
                  <strong>Remove from this page:</strong> This will only remove the section from this page. 
                  The shared section itself will remain available for other pages.
                </p>
                <DeleteSectionButton sectionId={section.id} slug={parentSlug || ''} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Information</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{section.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Shared Section Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{section.sharedSection.name}</dd>
            </div>
            {section.sharedSection.description && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{section.sharedSection.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Section: {section.type}</h1>
          <div className="flex items-center gap-4 text-sm">
            {parentSlug ? (
              <Link href={`/admin/pages/${parentSlug}`} className="text-sure-blue-600 hover:underline">← Back</Link>
            ) : (
              <Link href="/admin/pages" className="text-sure-blue-600 hover:underline">← Back</Link>
            )}
            <DeleteSectionButton sectionId={section.id} slug={parentSlug || ''} />
          </div>
        </div>

        {section.type === 'hero_full' && (
          <HomeHeroForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'hero_carousel' && (
          <HeroCarouselForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'featured_products' && (
          <FeaturedProductsForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'featured_products_catalog' && (
          <FeaturedProductsCatalogForm sectionId={section.id} initialData={section.data as any} />
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
        {section.type === 'search_hero' && (
          <SearchHeroForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'compact_search_hero' && (
          <CompactSearchHeroForm sectionId={section.id} initialData={section.data as any} />
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
        {section.type === 'listing_card_meta' && (
          <IndustryMetaForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'industry_showcase' && (
          <IndustryShowcaseForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'related_filters' && (
          <RelatedFiltersForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'filter_types_grid' && (
          <FilterTypesGridForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'filter_types_image_grid' && (
          <FilterTypesImageGridForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'popular_filters' && (
          <PopularFiltersForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'simple_search' && (
          <SimpleSearchForm sectionId={section.id} initialData={section.data as any} />
        )}
        {section.type === 'form_embed' && (
          <FormEmbedForm sectionId={section.id} initialData={section.data as any} />
        )}
    </AdminContainer>
  );
}


