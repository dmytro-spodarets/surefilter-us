import { z } from 'zod';

export const HeroFullSchema = z.object({
  badge: z.string().optional().default(''),
  // Back-compat: keep single title as fallback
  title: z.string().optional().default(''),
  titlePrefix: z.string().optional().default(''),
  titleHighlight: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  image: z.string().optional().default(''),
});

export type HeroFullInput = z.infer<typeof HeroFullSchema>;

export const FeaturedProductItemSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  category: z.string().optional().default(''),
  href: z.string().optional().default(''),
});

export const FeaturedProductsSchema = z.object({
  title: z.string().optional().default('Featured Products'),
  description: z.string().optional().default(''),
  fallbackHref: z.string().optional().default('/catalog'),
  items: z.array(FeaturedProductItemSchema).default([]),
});

export type FeaturedProductsInput = z.infer<typeof FeaturedProductsSchema>;

export const WhyChooseItemSchema = z.object({
  icon: z.string().optional().default('CheckCircleIcon'),
  title: z.string(),
  text: z.string().optional().default(''),
});

export const WhyChooseSchema = z.object({
  title: z.string().optional().default('Why Choose Sure Filter®?'),
  description: z.string().optional().default('Experience the difference with our premium filtration solutions designed for extreme performance.'),
  items: z.array(WhyChooseItemSchema).default([]),
});

export type WhyChooseInput = z.infer<typeof WhyChooseSchema>;

export const QuickSearchSchema = z.object({
  title: z.string().optional().default('Find Your Filter Fast'),
  description: z.string().optional().default('Enter OEM number or competitor reference to find the right filter'),
  placeholder: z.string().optional().default('Enter OEM number or competitor reference...'),
  ctaLabel: z.string().optional().default('Ask our team'),
  ctaHref: z.string().optional().default('#'),
});
export const SimpleSearchSchema = z.object({
  title: z.string().optional().default('Find Your Filter'),
  description: z.string().optional().default('Search by part number or equipment model'),
  placeholder: z.string().optional().default('Enter part number or equipment model...'),
  buttonText: z.string().optional().default('Search'),
});
export type SimpleSearchInput = z.infer<typeof SimpleSearchSchema>;


export type QuickSearchInput = z.infer<typeof QuickSearchSchema>;

export const IndustriesItemSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  href: z.string().optional().default(''),
});

export const IndustriesSchema = z.object({
  title: z.string().optional().default('Industries We Serve'),
  description: z.string().optional().default('Comprehensive filtration solutions for every heavy-duty application'),
  items: z.array(IndustriesItemSchema).default([]),
});

export type IndustriesInput = z.infer<typeof IndustriesSchema>;

// Industries list section (dynamic, no fields now, kept for future settings)
export const IndustriesListSchema = z.object({
  title: z.string().optional().default('Our Industries'),
  description: z.string().optional().default('Specialized filtration solutions tailored to the unique challenges of each industry'),
});
export type IndustriesListInput = z.infer<typeof IndustriesListSchema>;

// AboutNews
// Note: newsItems are now loaded automatically from the database (latest N published articles)
export const AboutNewsStatSchema = z.object({ number: z.string(), label: z.string() });

export const AboutNewsSchema = z.object({
  aboutTitle: z.string().optional().default('Who We Are'),
  aboutParagraphs: z.array(z.string()).default([]),
  stats: z.array(AboutNewsStatSchema).default([]),
  aboutCtaLabel: z.string().optional().default('Learn More About Us'),
  aboutCtaHref: z.string().optional().default('#'),
  newsTitle: z.string().optional().default('News & Updates'),
  newsCount: z.number().min(3).max(5).optional().default(5), // Number of news items to display (3, 4, or 5)
  newsCtaLabel: z.string().optional().default('See All News'),
  newsCtaHref: z.string().optional().default('/newsroom'),
});

export type AboutNewsInput = z.infer<typeof AboutNewsSchema>;

// PageHero
export const PageHeroSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
});

export type PageHeroInput = z.infer<typeof PageHeroSchema>;

// SingleImageHero / FullScreenHero
export const SingleImageHeroSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
});
export type SingleImageHeroInput = z.infer<typeof SingleImageHeroSchema>;

// SearchHero (full-width hero with search styling)
export const SearchHeroSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
});
export type SearchHeroInput = z.infer<typeof SearchHeroSchema>;

// AboutWithStats
export const AboutWithStatsFeatureSchema = z.object({ icon: z.string(), text: z.string() });
export const AboutWithStatsStatSchema = z.object({ icon: z.string(), title: z.string(), subtitle: z.string() });
export const AboutWithStatsSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  features: z.array(AboutWithStatsFeatureSchema).default([]),
  stats: z.array(AboutWithStatsStatSchema).default([]),
});

export type AboutWithStatsInput = z.infer<typeof AboutWithStatsSchema>;

// ContentWithImages
export const ContentImageSchema = z.object({ src: z.string(), alt: z.string(), position: z.number().int().min(1) });
export const ContentWithImagesSchema = z.object({
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  content: z.array(z.string()).default([]),
  images: z.array(ContentImageSchema).default([]),
});

export type ContentWithImagesInput = z.infer<typeof ContentWithImagesSchema>;

// QualityAssurance (static content component, schema kept for consistency)
export const QualityAssuranceSchema = z.object({});
export type QualityAssuranceInput = z.infer<typeof QualityAssuranceSchema>;

// Manufacturing Facilities
export const ManufacturingFacilityItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional().default('BuildingOffice2Icon'),
  image: z.string().optional().default(''),
});
export const ManufacturingFacilitiesSchema = z.object({
  title: z.string().optional().default('Manufacturing Facilities'),
  description: z.string().optional().default(''),
  items: z.array(ManufacturingFacilityItemSchema).default([]),
});
export type ManufacturingFacilitiesInput = z.infer<typeof ManufacturingFacilitiesSchema>;

// Our Company (tabs)
export const CompanyTabSchema = z.object({
  key: z.string(),
  title: z.string(),
  content: z.string(),
});
export const OurCompanySchema = z.object({
  title: z.string().optional().default('Our Company'),
  subtitle: z.string().optional().default(''),
  tabs: z.array(CompanyTabSchema).default([]),
});
export type OurCompanyInput = z.infer<typeof OurCompanySchema>;

// Stats band
export const StatsBandItemSchema = z.object({ icon: z.string(), value: z.string(), label: z.string() });
export const StatsBandSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional().default(''),
  items: z.array(StatsBandItemSchema).default([]),
});
export type StatsBandInput = z.infer<typeof StatsBandSchema>;

// Awards carousel
export const AwardItemSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  year: z.string(),
  image: z.string().optional().default(''),
  description: z.string().optional().default(''),
});
export const AwardsCarouselSchema = z.object({
  title: z.string().optional().default('Awards'),
  subtitle: z.string().optional().default(''),
  items: z.array(AwardItemSchema).default([]),
});
export type AwardsCarouselInput = z.infer<typeof AwardsCarouselSchema>;

// Contact Us
export const ContactHeroSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
});
export type ContactHeroInput = z.infer<typeof ContactHeroSchema>;

export const ContactFormSchema = z.object({
  title: z.string().optional().default('Send Us a Message'),
  description: z.string().optional().default(''),
  subjects: z.array(z.object({ value: z.string(), label: z.string() })).default([
    { value: 'product-inquiry', label: 'Product Inquiry' },
    { value: 'technical-support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'general', label: 'General Question' },
  ]),
});
export type ContactFormInput = z.infer<typeof ContactFormSchema>;

export const ContactInfoSchema = z.object({
  title: z.string().optional().default('Get in Touch'),
  general: z.object({ email: z.string().optional().default(''), phone: z.string().optional().default(''), fax: z.string().optional().default('') }),
  support: z.object({ email: z.string().optional().default(''), phone: z.string().optional().default(''), hours: z.string().optional().default('') }),
  address: z.object({
    name: z.string().optional().default(''),
    line1: z.string().optional().default(''),
    line2: z.string().optional().default(''),
    city: z.string().optional().default(''),
    region: z.string().optional().default(''),
    postal: z.string().optional().default(''),
    country: z.string().optional().default(''),
  }),
});
export type ContactInfoInput = z.infer<typeof ContactInfoSchema>;

// Contact details (ContactOptions + info block)
export const ContactDetailsSchema = z.object({
  options: z.object({ phone: z.string().optional().default(''), chatHref: z.string().optional().default('#'), askHref: z.string().optional().default('#contact-form') }),
  info: ContactInfoSchema,
});
export type ContactDetailsInput = z.infer<typeof ContactDetailsSchema>;

// Contact options (standalone)
export const ContactOptionItemSchema = z.object({
  icon: z.string().optional().default('PhoneIcon'),
  title: z.string(),
  description: z.string().optional().default(''),
  href: z.string().optional().default('#'),
  cta: z.string().optional().default(''),
});
// Popular filters
export const PopularFilterItemSchema = z.object({
  name: z.string(),
  category: z.string().optional().default(''),
  applications: z.string().optional().default(''),
  image: z.string().optional().default(''),
  href: z.string().optional().default('#'),
});
export const PopularFiltersSchema = z.object({
  title: z.string().optional().default('Popular Filters'),
  description: z.string().optional().default(''),
  catalogHref: z.string().optional().default('/catalog'),
  catalogText: z.string().optional().default('Browse All Filters'),
  columnsPerRow: z.number().int().min(1).max(6).optional().default(5),
  items: z.array(PopularFilterItemSchema).default([]),
});
export type PopularFiltersInput = z.infer<typeof PopularFiltersSchema>;

// Related Filters (auto from catalog category)
export const RelatedFiltersSchema = z.object({
  title: z.string().optional().default('Related Filter Types'),
  description: z.string().optional().default(''),
  category: z.enum(['HEAVY_DUTY', 'AUTOMOTIVE']).optional(),
});
export type RelatedFiltersInput = z.infer<typeof RelatedFiltersSchema>;

// Filter Types Grid
export const FilterTypesGridItemSchema = z.object({ name: z.string(), icon: z.string().optional().default(''), href: z.string().optional().default('#') });
export const FilterTypesGridSchema = z.object({
  title: z.string().optional().default('Filter Types'),
  description: z.string().optional().default('Choose the right filter type'),
  items: z.array(FilterTypesGridItemSchema).default([]),
});
export type FilterTypesGridInput = z.infer<typeof FilterTypesGridSchema>;

// Filter Types Image Grid
export const FilterTypesImageGridItemSchema = z.object({ 
  name: z.string(), 
  image: z.string().optional().default(''), 
  href: z.string().optional().default('#') 
});
export const FilterTypesImageGridSchema = z.object({
  title: z.string().optional().default('Filter Types'),
  description: z.string().optional().default('Choose the right filter type for your equipment'),
  columns: z.number().min(2).max(8).optional().default(4),
  variant: z.enum(['card', 'simple']).optional().default('card'),
  items: z.array(FilterTypesImageGridItemSchema).default([]),
});
export type FilterTypesImageGridInput = z.infer<typeof FilterTypesImageGridSchema>;


export const ContactOptionsSchema = z.object({
  items: z.array(ContactOptionItemSchema).default([]),
  // Back-compat fallbacks (will be ignored if items provided)
  phone: z.string().optional(),
  chatHref: z.string().optional(),
  askHref: z.string().optional(),
});
export type ContactOptionsInput = z.infer<typeof ContactOptionsSchema>;

// Combined Contact Form + Info
export const ContactFormInfoSchema = z.object({
  form: ContactFormSchema,
  info: ContactInfoSchema,
});
export type ContactFormInfoInput = z.infer<typeof ContactFormInfoSchema>;

// Per-industry page meta for listing cards
export const IndustryMetaSchema = z.object({
  listTitle: z.string().optional().default(''),
  listDescription: z.string().optional().default(''),
  listImage: z.string().optional().default(''),
  popularFilters: z.array(z.string()).default([]),
});
export type IndustryMetaInput = z.infer<typeof IndustryMetaSchema>;

// Generic listing meta (same shape as industry_meta)
export const ListingCardMetaSchema = IndustryMetaSchema;
export type ListingCardMetaInput = IndustryMetaInput;


