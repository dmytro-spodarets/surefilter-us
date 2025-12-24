import HeroCms from '@/components/sections/HeroCms';
import HeroCarouselCms from '@/components/sections/HeroCarouselCms';
import FeaturedProductsCms from '@/components/sections/FeaturedProductsCms';
import FeaturedProductsCatalogCms from '@/components/sections/FeaturedProductsCatalogCms';
import PopularFiltersCatalogCms from '@/components/sections/PopularFiltersCatalogCms';
import WhyChooseCms from '@/components/sections/WhyChooseCms';
import QuickSearchCms from '@/components/sections/QuickSearchCms';
import SimpleSearch from '@/components/sections/SimpleSearch';
import IndustriesCms from '@/components/sections/IndustriesCms';
import IndustriesList from '@/components/sections/IndustriesList';
import IndustryShowcase from '@/components/sections/IndustryShowcase';
import AboutNewsCms from '@/components/sections/AboutNewsCms';
import PageHero from '@/components/sections/PageHero';
import FullScreenHero from '@/components/sections/FullScreenHero';
import CompactSearchHero from '@/components/sections/CompactSearchHero';
import SearchHero from '@/components/sections/SearchHero';
import AboutWithStats from '@/components/sections/AboutWithStats';
import ContentWithImages from '@/components/sections/ContentWithImages';
import QualityAssurance from '@/components/sections/QualityAssurance';
import ManufacturingFacilities from '../components/sections/ManufacturingFacilities';
import OurCompany from '../components/sections/OurCompany';
import StatsBand from '../components/sections/StatsBand';
import AwardsCarousel from '../components/sections/AwardsCarousel';
import ContactHero from '@/components/sections/ContactHero';
import ContactForm from '@/components/sections/ContactForm';
import ContactInfo from '@/components/sections/ContactInfo';
import ContactDetails from '@/components/sections/ContactDetails';
import ContactFormInfo from '@/components/sections/ContactFormInfo';
import FilterTypesCms from '@/components/sections/FilterTypesCms';
import prisma from '@/lib/prisma';
import PopularFilters from '@/components/sections/PopularFilters';
import ContactOptions from '@/components/sections/ContactOptions';
import type { CmsSection } from './types';
import { HeroFullSchema } from './schemas';
import FilterTypesGrid from '@/components/sections/FilterTypesGrid';
import FilterTypesImageGrid from '@/components/sections/FilterTypesImageGrid';
import FormEmbed from '@/components/forms/FormEmbed';

export function renderSection(section: CmsSection) {
  // If section uses a shared section, use its data instead
  const sectionData = (section as any).sharedSection 
    ? (section as any).sharedSection.data 
    : section.data;
  
  const sectionType = (section as any).sharedSection 
    ? (section as any).sharedSection.type 
    : (section as any).type;

  // Debug logging for shared sections (can be removed in production)
  // if ((section as any).sharedSection) {
  //   console.log('Rendering shared section:', {
  //     sharedSectionId: (section as any).sharedSection.id,
  //     sharedSectionName: (section as any).sharedSection.name,
  //     type: sectionType,
  //     hasData: !!sectionData,
  //     dataKeys: Object.keys(sectionData || {})
  //   });
  // }

  switch (sectionType) {
    case 'hero_full': {
      const parsed = HeroFullSchema.safeParse(sectionData);
      if (!parsed.success) return null;
      const { badge, title, titlePrefix, titleHighlight, subtitle, image } = parsed.data;
      return (
        <HeroCms
          badge={badge}
          title={title}
          titlePrefix={titlePrefix}
          titleHighlight={titleHighlight}
          subtitle={subtitle}
          image={image}
        />
      );
    }
    case 'hero_carousel': {
      const d = sectionData as any;
      return (
        <HeroCarouselCms
          slides={Array.isArray(d?.slides) ? d.slides : []}
          autoplayDelay={d?.autoplayDelay}
          showNavigation={d?.showNavigation}
          showPagination={d?.showPagination}
        />
      );
    }
    case 'filter_types_grid': {
      const d = sectionData as any;
      return <FilterTypesGrid title={d?.title} description={d?.description} filterTypes={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'filter_types_image_grid': {
      const d = sectionData as any;
      return <FilterTypesImageGrid title={d?.title} description={d?.description} columns={d?.columns} variant={d?.variant} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'featured_products': {
      // Dynamic featured products from DB
      const data = sectionData as any;
      return (
        <FeaturedProductsCms
          title={data?.title}
          description={data?.description}
          fallbackHref={data?.fallbackHref}
          items={Array.isArray(data?.items) ? data.items : []}
        />
      );
    }
    case 'featured_products_catalog': {
      // Featured products from catalog
      const data = sectionData as any;
      return (
        <FeaturedProductsCatalogCms
          title={data?.title}
          description={data?.description}
          fallbackHref={data?.fallbackHref}
          productIds={Array.isArray(data?.productIds) ? data.productIds : []}
        />
      );
    }
    case 'popular_filters_catalog': {
      // Popular filters from catalog
      const data = sectionData as any;
      return (
        <PopularFiltersCatalogCms
          title={data?.title}
          description={data?.description}
          catalogHref={data?.catalogHref}
          catalogText={data?.catalogText}
          columnsPerRow={data?.columnsPerRow || 5}
          productIds={Array.isArray(data?.productIds) ? data.productIds : []}
        />
      );
    }
    case 'why_choose': {
      const data = sectionData as any;
      return <WhyChooseCms title={data?.title} description={data?.description} items={Array.isArray(data?.items) ? data.items : []} />;
    }
    case 'quick_search': {
      const d = sectionData as any;
      return <QuickSearchCms title={d?.title} description={d?.description} placeholder={d?.placeholder} ctaLabel={d?.ctaLabel} ctaHref={d?.ctaHref} />;
    }
    case 'simple_search': {
      const d = sectionData as any;
      return <SimpleSearch title={d?.title} description={d?.description} placeholder={d?.placeholder} buttonText={d?.buttonText} />;
    }
    case 'industries': {
      const d = sectionData as any;
      return <IndustriesCms title={d?.title} description={d?.description} />;
    }
    case 'industries_list': {
      const d = sectionData as any;
      return <IndustriesList title={d?.title} description={d?.description} />;
    }
    case 'industry_showcase': {
      const d = sectionData as any;
      // Allow page-level overrides
      const pageOverride = section.data as any;
      const industryTitle = pageOverride?.industryTitleOverride || d?.industryTitle || '';
      const industryDescription = pageOverride?.industryDescriptionOverride || d?.industryDescription || '';
      
      return (
        <IndustryShowcase
          industryTitle={industryTitle}
          industryDescription={industryDescription}
          brandPromise={d?.brandPromise || ''}
          keyFeatures={Array.isArray(d?.keyFeatures) ? d.keyFeatures : []}
          metrics={Array.isArray(d?.metrics) ? d.metrics : []}
        />
      );
    }
    case 'about_news': {
      const d = sectionData as any;
      return (
        <AboutNewsCms
          aboutTitle={d?.aboutTitle}
          aboutParagraphs={Array.isArray(d?.aboutParagraphs) ? d.aboutParagraphs : []}
          stats={Array.isArray(d?.stats) ? d.stats : []}
          aboutCtaLabel={d?.aboutCtaLabel}
          aboutCtaHref={d?.aboutCtaHref}
          newsTitle={d?.newsTitle}
          newsCount={d?.newsCount}
          newsCtaLabel={d?.newsCtaLabel}
          newsCtaHref={d?.newsCtaHref}
        />
      );
    }
    case 'page_hero': {
      const d = sectionData as any;
      return <PageHero title={d?.title || ''} description={d?.description || ''} />;
    }
    case 'single_image_hero': {
      const d = sectionData as any;
      return <FullScreenHero title={d?.title || ''} description={d?.description || ''} backgroundImage={d?.image || ''} />;
    }
    case 'compact_search_hero': {
      const d = sectionData as any;
      return <CompactSearchHero title={d?.title || ''} description={d?.description || ''} backgroundImage={d?.image || ''} />;
    }
    case 'search_hero': {
      const d = sectionData as any;
      return <SearchHero title={d?.title || ''} description={d?.description || ''} backgroundImage={d?.image || ''} />;
    }
    case 'about_with_stats': {
      const d = sectionData as any;
      return (
        <AboutWithStats
          title={d?.title || ''}
          description={d?.description || ''}
          features={Array.isArray(d?.features) ? d.features : []}
          stats={Array.isArray(d?.stats) ? d.stats : []}
        />
      );
    }
    case 'content_with_images': {
      const d = sectionData as any;
      return (
        <ContentWithImages
          title={d?.title || ''}
          subtitle={d?.subtitle || ''}
          content={Array.isArray(d?.content) ? d.content : []}
          images={Array.isArray(d?.images) ? d.images : []}
        />
      );
    }
    case 'quality_assurance': {
      return <QualityAssurance />;
    }
    case 'manufacturing_facilities': {
      const d = sectionData as any;
      return <ManufacturingFacilities title={d?.title} description={d?.description} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'our_company': {
      const d = sectionData as any;
      return <OurCompany title={d?.title} subtitle={d?.subtitle} tabs={Array.isArray(d?.tabs) ? d.tabs : []} />;
    }
    case 'stats_band': {
      const d = sectionData as any;
      return <StatsBand title={d?.title} subtitle={d?.subtitle} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'awards_carousel': {
      const d = sectionData as any;
      return <AwardsCarousel title={d?.title} subtitle={d?.subtitle} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'contact_hero': {
      const d = sectionData as any;
      return <ContactHero title={d?.title} description={d?.description} image={d?.image} />;
    }
    case 'contact_form': {
      const d = sectionData as any;
      return <ContactForm title={d?.title} description={d?.description} subjects={Array.isArray(d?.subjects) ? d.subjects : []} />;
    }
    case 'contact_info': {
      const d = sectionData as any;
      return <ContactInfo title={d?.title} general={d?.general} support={d?.support} address={d?.address} />;
    }
    case 'contact_details': {
      const d = sectionData as any;
      return <ContactDetails options={d?.options || {}} info={d?.info || {}} />;
    }
    case 'contact_form_info': {
      const d = sectionData as any;
      return <ContactFormInfo form={d?.form || {}} info={d?.info || {}} />;
    }
    case 'contact_options': {
      const d = sectionData as any;
      return <ContactOptions items={Array.isArray(d?.items) ? d.items : undefined} phone={d?.phone || ''} chatHref={d?.chatHref || '#'} askHref={d?.askHref || ''} />;
    }
    case 'related_filters': {
      const d = sectionData as any;
      const category = d?.category as 'HEAVY_DUTY' | 'AUTOMOTIVE' | undefined;
      return <FilterTypesCms title={d?.title} description={d?.description} category={category} sectionId={(section as any).id} />;
    }
    case 'popular_filters': {
      const d = sectionData as any;
      return <PopularFilters title={d?.title} description={d?.description} filters={Array.isArray(d?.items) ? d.items : []} catalogHref={d?.catalogHref} catalogText={d?.catalogText} columnsPerRow={d?.columnsPerRow} />;
    }
    case 'form_embed': {
      const d = sectionData as any;
      return <FormEmbed formId={d?.formId} title={d?.title} description={d?.description} />;
    }
    default:
      return null;
  }
}


