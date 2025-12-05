'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import SharedSectionFormWrapper from './SharedSectionFormWrapper';

// Import all section forms
import HomeHeroForm from '@/app/admin/pages/[slug]/sections/HomeHeroForm';
import HeroCarouselForm from '@/app/admin/pages/[slug]/sections/HeroCarouselForm';
import PageHeroForm from '@/app/admin/pages/[slug]/sections/PageHeroForm';
import SearchHeroForm from '@/app/admin/pages/[slug]/sections/SearchHeroForm';
import SingleImageHeroForm from '@/app/admin/pages/[slug]/sections/SingleImageHeroForm';
import CompactSearchHeroForm from '@/app/admin/pages/[slug]/sections/CompactSearchHeroForm';
import SimpleSearchForm from '@/app/admin/pages/[slug]/sections/SimpleSearchForm';
import QuickSearchForm from '@/app/admin/pages/[slug]/sections/QuickSearchForm';
import AboutWithStatsForm from '@/app/admin/pages/[slug]/sections/AboutWithStatsForm';
import IndustryShowcaseForm from '@/app/admin/pages/[slug]/sections/IndustryShowcaseForm';
import IndustriesForm from '@/app/admin/pages/[slug]/sections/IndustriesForm';
import IndustriesListForm from '@/app/admin/pages/[slug]/sections/IndustriesListForm';
import AboutNewsForm from '@/app/admin/pages/[slug]/sections/AboutNewsForm';
import ContactFormForm from '@/app/admin/pages/[slug]/sections/ContactFormForm';
import ContactHeroForm from '@/app/admin/pages/[slug]/sections/ContactHeroForm';
import ContactInfoForm from '@/app/admin/pages/[slug]/sections/ContactInfoForm';
import ContactDetailsForm from '@/app/admin/pages/[slug]/sections/ContactDetailsForm';
import ContactFormInfoForm from '@/app/admin/pages/[slug]/sections/ContactFormInfoForm';
import ContactOptionsForm from '@/app/admin/pages/[slug]/sections/ContactOptionsForm';
import WhyChooseForm from '@/app/admin/pages/[slug]/sections/WhyChooseForm';
import FeaturedProductsForm from '@/app/admin/pages/[slug]/sections/FeaturedProductsForm';
import PopularFiltersForm from '@/app/admin/pages/[slug]/sections/PopularFiltersForm';
import RelatedFiltersForm from '@/app/admin/pages/[slug]/sections/RelatedFiltersForm';
import FilterTypesGridForm from '@/app/admin/pages/[slug]/sections/FilterTypesGridForm';
import FilterTypesImageGridForm from '@/app/admin/pages/[slug]/sections/FilterTypesImageGridForm';
import ContentWithImagesForm from '@/app/admin/pages/[slug]/sections/ContentWithImagesForm';
import ManufacturingFacilitiesForm from '@/app/admin/pages/[slug]/sections/ManufacturingFacilitiesForm';
import OurCompanyForm from '@/app/admin/pages/[slug]/sections/OurCompanyForm';
import StatsBandForm from '@/app/admin/pages/[slug]/sections/StatsBandForm';
import AwardsCarouselForm from '@/app/admin/pages/[slug]/sections/AwardsCarouselForm';
import QualityAssuranceForm from '@/app/admin/pages/[slug]/sections/QualityAssuranceForm';
import FormEmbedForm from '@/app/admin/pages/[slug]/sections/FormEmbedForm';

interface SharedSection {
  id: string;
  name: string;
  type: string;
  description?: string;
  data: any;
  _count: {
    sections: number;
  };
  sections: Array<{
    pages: Array<{
      page: {
        id: string;
        title: string;
        slug: string;
      };
    }>;
  }>;
}

export default function EditSharedSectionPage() {
  const params = useParams();
  const router = useRouter();
  const [sharedSection, setSharedSection] = useState<SharedSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadSharedSection();
    }
  }, [params.id]);

  const loadSharedSection = async () => {
    try {
      const response = await fetch(`/api/admin/shared-sections/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSharedSection(data.sharedSection);
        setName(data.sharedSection.name);
        setDescription(data.sharedSection.description || '');
      } else {
        alert('Failed to load shared section');
        router.push('/admin/shared-sections');
      }
    } catch (error) {
      console.error('Error loading shared section:', error);
      alert('Failed to load shared section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMeta(true);

    try {
      const response = await fetch(`/api/admin/shared-sections/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      });

      if (response.ok) {
        alert('Metadata updated successfully');
        loadSharedSection();
      } else {
        alert('Failed to update metadata');
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
      alert('Failed to update metadata');
    } finally {
      setSavingMeta(false);
    }
  };

  const renderSectionForm = () => {
    if (!sharedSection) return null;

    return (
      <SharedSectionFormWrapper
        sharedSectionId={sharedSection.id}
        initialData={sharedSection.data}
      >
        {(formProps) => renderFormByType(sharedSection.type, formProps)}
      </SharedSectionFormWrapper>
    );
  };

  const renderFormByType = (type: string, formProps: { sectionId: string; initialData: any }) => {
    switch (type) {
      case 'hero_full':
        return <HomeHeroForm {...formProps} />;
      case 'hero_carousel':
        return <HeroCarouselForm {...formProps} />;
      case 'page_hero':
        return <PageHeroForm {...formProps} />;
      case 'search_hero':
        return <SearchHeroForm {...formProps} />;
      case 'single_image_hero':
        return <SingleImageHeroForm {...formProps} />;
      case 'compact_search_hero':
        return <CompactSearchHeroForm {...formProps} />;
      case 'simple_search':
        return <SimpleSearchForm {...formProps} />;
      case 'quick_search':
        return <QuickSearchForm {...formProps} />;
      case 'about_with_stats':
        return <AboutWithStatsForm {...formProps} />;
      case 'industry_showcase':
        return <IndustryShowcaseForm {...formProps} />;
      case 'industries':
        return <IndustriesForm {...formProps} />;
      case 'industries_list':
        return <IndustriesListForm {...formProps} />;
      case 'about_news':
        return <AboutNewsForm {...formProps} />;
      case 'contact_form':
        return <ContactFormForm {...formProps} />;
      case 'contact_hero':
        return <ContactHeroForm {...formProps} />;
      case 'contact_info':
        return <ContactInfoForm {...formProps} />;
      case 'contact_details':
        return <ContactDetailsForm {...formProps} />;
      case 'contact_form_info':
        return <ContactFormInfoForm {...formProps} />;
      case 'contact_options':
        return <ContactOptionsForm {...formProps} />;
      case 'why_choose':
        return <WhyChooseForm {...formProps} />;
      case 'featured_products':
        return <FeaturedProductsForm {...formProps} />;
      case 'popular_filters':
        return <PopularFiltersForm {...formProps} />;
      case 'related_filters':
        return <RelatedFiltersForm {...formProps} />;
      case 'filter_types_grid':
        return <FilterTypesGridForm {...formProps} />;
      case 'filter_types_image_grid':
        return <FilterTypesImageGridForm {...formProps} />;
      case 'content_with_images':
        return <ContentWithImagesForm {...formProps} />;
      case 'manufacturing_facilities':
        return <ManufacturingFacilitiesForm {...formProps} />;
      case 'our_company':
        return <OurCompanyForm {...formProps} />;
      case 'stats_band':
        return <StatsBandForm {...formProps} />;
      case 'awards_carousel':
        return <AwardsCarouselForm {...formProps} />;
      case 'quality_assurance':
        return <QualityAssuranceForm {...formProps} />;
      case 'form_embed':
        return <FormEmbedForm {...formProps} />;
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Form for section type "{type}" is not yet implemented.
            </p>
          </div>
        );
    }
  };

  const getUsedOnPages = () => {
    if (!sharedSection) return [];
    
    const pages = new Map();
    sharedSection.sections.forEach(section => {
      section.pages.forEach(pageSection => {
        const page = pageSection.page;
        if (!pages.has(page.id)) {
          pages.set(page.id, page);
        }
      });
    });
    
    return Array.from(pages.values());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sharedSection) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-600">Shared section not found</p>
        </div>
      </div>
    );
  }

  const usedOnPages = getUsedOnPages();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/admin/shared-sections"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Shared Sections
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{sharedSection.name}</h1>
          <p className="text-gray-600 mt-2">
            Type: <span className="font-medium">{sharedSection.type}</span>
          </p>
        </div>

        {/* Warning if used on pages */}
        {usedOnPages.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">
                  This shared section is used on {usedOnPages.length} page{usedOnPages.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-yellow-800 mt-1">
                  Changes will be reflected on all pages that use this section:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                  {usedOnPages.map(page => (
                    <li key={page.id}>
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className="underline hover:text-yellow-900"
                      >
                        {page.title} ({page.slug})
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Metadata Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
          <form onSubmit={handleUpdateMeta} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingMeta}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {savingMeta ? 'Saving...' : 'Save Metadata'}
              </button>
            </div>
          </form>
        </div>

        {/* Section Content Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Section Content</h2>
          {renderSectionForm()}
        </div>
      </div>
    </div>
  );
}
