import Header from '@/components/layout/Header';
import SearchHero from '@/components/sections/SearchHero';
import Footer from '@/components/layout/Footer';
import AboutWithStats from '@/components/sections/AboutWithStats';
import FilterTypesGrid from '@/components/sections/FilterTypesGrid';
import PopularFilters from '@/components/sections/PopularFilters';
import SimpleSearch from '@/components/sections/SimpleSearch';
import Industries from '@/components/sections/Industries';
import WhyChoose from '@/components/sections/WhyChoose';

export default function HeavyDutyPage() {
  const filterTypes = [
    { name: 'Oil Filters', icon: 'CogIcon', href: '/heavy-duty/oil' },
    { name: 'Air Filters', icon: 'CloudArrowUpIcon', href: '/heavy-duty/air' },
    { name: 'Fuel Filters', icon: 'BeakerIcon', href: '/heavy-duty/fuel' },
    { name: 'Cabin Filters', icon: 'ShieldCheckIcon', href: '/heavy-duty/cabin' },
    { name: 'Cartridge Filters', icon: 'CircleStackIcon', href: '/heavy-duty/cartridge' },
    { name: 'Hydraulic Filters', icon: 'WrenchScrewdriverIcon', href: '/heavy-duty/hydraulic' },
  ];

  const popularFilters = [
    { name: 'LF3325', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop', href: '/filters/LF3325' },
    { name: 'AF25550', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', href: '/filters/AF25550' },
    { name: 'FF5320', image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=200&h=200&fit=crop', href: '/filters/FF5320' },
    { name: 'CF1000', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop', href: '/filters/CF1000' },
    { name: 'HF6177', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=200&fit=crop', href: '/filters/HF6177' },
  ];

  const aboutFeatures = [
    { icon: 'CheckIcon', text: 'High-capacity filtration systems' },
    { icon: 'CheckIcon', text: 'Extended service intervals' },
    { icon: 'CheckIcon', text: 'Corrosion-resistant materials' },
    { icon: 'CheckIcon', text: 'Temperature and pressure rated' },
  ];

  const qualityStats = [
    { icon: 'StarIcon', title: 'ISO 9001:2015', subtitle: 'Certified Quality' },
    { icon: 'StarIcon', title: '99.9% Efficiency', subtitle: 'Filtration Rate' },
    { icon: 'ClockIcon', title: '2X Longer Life', subtitle: 'Service Intervals' },
    { icon: 'GlobeAltIcon', title: '50+ Countries', subtitle: 'Global Presence' },
  ];

  const whyChooseItems = [
    {
      icon: 'ShieldCheckIcon',
      title: 'Proven Reliability',
      description: 'Tested in the harshest conditions to ensure consistent performance and protection.'
    },
    {
      icon: 'CogIcon',
      title: 'Advanced Technology',
      description: 'State-of-the-art filtration media and construction for maximum efficiency.'
    },
    {
      icon: 'UserGroupIcon',
      title: 'Expert Support',
      description: 'Dedicated technical support team to help you choose the right filter solution.'
    }
  ];

  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <SearchHero
        title="Heavy Duty Filters"
        description="Engineered for extreme conditions and heavy machinery. Superior filtration solutions for construction, mining, agriculture, and industrial equipment."
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      />

      {/* About Heavy Duty Section with Stats */}
      <AboutWithStats
        title="Professional Grade Filtration"
        description="Our heavy duty filters are designed to withstand extreme conditions while providing superior filtration performance. From construction sites to mining operations, our filters deliver reliable protection for your valuable equipment."
        features={aboutFeatures}
        stats={qualityStats}
      />

      {/* Heavy Duty Filter Types */}
      <FilterTypesGrid
        title="Heavy Duty Filter Types"
        description="Choose the right filter type for your heavy duty equipment"
        filterTypes={filterTypes}
        className="bg-gray-50"
      />

      {/* Popular Heavy Duty Filters */}
      <PopularFilters
        title="Popular Heavy Duty Filters"
        description="Top-selling filters for heavy duty applications"
        filters={popularFilters}
        catalogHref="/heavy-duty/catalog"
        catalogText="Browse Heavy Duty Catalog"
      />

      {/* Find Your Heavy Duty Filter */}
      <SimpleSearch
        title="Find Your Heavy Duty Filter"
        description="Search by part number or equipment model"
        placeholder="Enter part number or equipment model..."
        buttonText="Search"
      />

      {/* Industries We Serve */}
      <Industries />

      {/* Why Choose Sure Filter® Heavy Duty */}
      <WhyChoose
        title="Why Choose Sure Filter® Heavy Duty"
        description="Superior filtration performance you can trust for your most demanding applications"
        items={whyChooseItems}
        className="bg-gray-50"
      />

      <Footer />
    </main>
  );
}