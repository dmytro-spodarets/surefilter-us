import HeroCms from '@/components/sections/HeroCms';
import FeaturedProductsCms from '@/components/sections/FeaturedProductsCms';
import WhyChooseCms from '@/components/sections/WhyChooseCms';
import QuickSearchCms from '@/components/sections/QuickSearchCms';
import SimpleSearch from '@/components/sections/SimpleSearch';
import IndustriesCms from '@/components/sections/IndustriesCms';
import IndustriesList from '@/components/sections/IndustriesList';
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

export function renderSection(section: CmsSection) {
  switch ((section as any).type) {
    case 'hero_full': {
      const parsed = HeroFullSchema.safeParse(section.data);
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
    case 'filter_types_grid': {
      const d = section.data as any;
      return <FilterTypesGrid title={d?.title} description={d?.description} filterTypes={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'filter_types_image_grid': {
      const d = section.data as any;
      return <FilterTypesImageGrid title={d?.title} description={d?.description} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'featured_products': {
      // Dynamic featured products from DB
      const data = section.data as any;
      return (
        <FeaturedProductsCms
          title={data?.title}
          description={data?.description}
          fallbackHref={data?.fallbackHref}
          items={Array.isArray(data?.items) ? data.items : []}
        />
      );
    }
    case 'why_choose': {
      const data = section.data as any;
      return <WhyChooseCms title={data?.title} description={data?.description} items={Array.isArray(data?.items) ? data.items : []} />;
    }
    case 'quick_search': {
      const d = section.data as any;
      return <QuickSearchCms title={d?.title} description={d?.description} placeholder={d?.placeholder} ctaLabel={d?.ctaLabel} ctaHref={d?.ctaHref} />;
    }
    case 'simple_search': {
      const d = section.data as any;
      return <SimpleSearch title={d?.title} description={d?.description} placeholder={d?.placeholder} buttonText={d?.buttonText} />;
    }
    case 'industries': {
      const d = section.data as any;
      return <IndustriesCms title={d?.title} description={d?.description} />;
    }
    case 'industries_list': {
      const d = section.data as any;
      return <IndustriesList title={d?.title} description={d?.description} />;
    }
    case 'about_news': {
      const d = section.data as any;
      return (
        <AboutNewsCms
          aboutTitle={d?.aboutTitle}
          aboutParagraphs={Array.isArray(d?.aboutParagraphs) ? d.aboutParagraphs : []}
          stats={Array.isArray(d?.stats) ? d.stats : []}
          aboutCtaLabel={d?.aboutCtaLabel}
          aboutCtaHref={d?.aboutCtaHref}
          newsTitle={d?.newsTitle}
          newsItems={Array.isArray(d?.newsItems) ? d.newsItems : []}
          newsCtaLabel={d?.newsCtaLabel}
          newsCtaHref={d?.newsCtaHref}
        />
      );
    }
    case 'page_hero': {
      const d = section.data as any;
      return <PageHero title={d?.title || ''} description={d?.description || ''} />;
    }
    case 'single_image_hero': {
      const d = section.data as any;
      return <FullScreenHero title={d?.title || ''} description={d?.description || ''} backgroundImage={d?.image || ''} />;
    }
    case 'compact_search_hero': {
      const d = section.data as any;
      return <CompactSearchHero title={d?.title || ''} description={d?.description || ''} backgroundImage={d?.image || ''} />;
    }
    case 'search_hero': {
      const d = section.data as any;
      return <SearchHero title={d?.title || ''} description={d?.description || ''} backgroundImage={d?.image || ''} />;
    }
    case 'about_with_stats': {
      const d = section.data as any;
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
      const d = section.data as any;
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
      const d = section.data as any;
      return <ManufacturingFacilities title={d?.title} description={d?.description} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'our_company': {
      const d = section.data as any;
      return <OurCompany title={d?.title} subtitle={d?.subtitle} tabs={Array.isArray(d?.tabs) ? d.tabs : []} />;
    }
    case 'stats_band': {
      const d = section.data as any;
      return <StatsBand title={d?.title} subtitle={d?.subtitle} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'awards_carousel': {
      const d = section.data as any;
      return <AwardsCarousel title={d?.title} subtitle={d?.subtitle} items={Array.isArray(d?.items) ? d.items : []} />;
    }
    case 'contact_hero': {
      const d = section.data as any;
      return <ContactHero title={d?.title} description={d?.description} image={d?.image} />;
    }
    case 'contact_form': {
      const d = section.data as any;
      return <ContactForm title={d?.title} description={d?.description} subjects={Array.isArray(d?.subjects) ? d.subjects : []} />;
    }
    case 'contact_info': {
      const d = section.data as any;
      return <ContactInfo title={d?.title} general={d?.general} support={d?.support} address={d?.address} />;
    }
    case 'contact_details': {
      const d = section.data as any;
      return <ContactDetails options={d?.options || {}} info={d?.info || {}} />;
    }
    case 'contact_form_info': {
      const d = section.data as any;
      return <ContactFormInfo form={d?.form || {}} info={d?.info || {}} />;
    }
    case 'contact_options': {
      const d = section.data as any;
      return <ContactOptions items={Array.isArray(d?.items) ? d.items : undefined} phone={d?.phone || ''} chatHref={d?.chatHref || '#'} askHref={d?.askHref || '#contact-form'} />;
    }
    case 'related_filters': {
      const d = section.data as any;
      const category = d?.category as 'HEAVY_DUTY' | 'AUTOMOTIVE' | undefined;
      return <FilterTypesCms title={d?.title} description={d?.description} category={category} sectionId={(section as any).id} />;
    }
    case 'popular_filters': {
      const d = section.data as any;
      return <PopularFilters title={d?.title} description={d?.description} filters={Array.isArray(d?.items) ? d.items : []} catalogHref={d?.catalogHref} catalogText={d?.catalogText} columnsPerRow={d?.columnsPerRow} />;
    }
    default:
      return null;
  }
}


