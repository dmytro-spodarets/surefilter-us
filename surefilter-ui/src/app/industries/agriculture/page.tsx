import Header from '@/components/layout/Header';
import CompactSearchHero from '@/components/sections/CompactSearchHero';
import Footer from '@/components/layout/Footer';
import AboutWithStats from '@/components/sections/AboutWithStats';
import ContentWithImages from '@/components/sections/ContentWithImages';
import PopularFilters from '@/components/sections/PopularFilters';
import SimpleSearch from '@/components/sections/SimpleSearch';
import RelatedFilters from '@/components/sections/RelatedFilters';
import IndustriesCms from '@/components/sections/IndustriesCms';

export const metadata = {
  title: 'Agriculture Filtration Solutions | Sure Filter',
  description: 'Heavy-duty filters for tractors, harvesters, and farm equipment. Reliable filtration solutions for agricultural machinery operating in dusty field conditions.',
};

export default function AgriculturePage() {
  const aboutFeatures = [
    { icon: 'CheckIcon', text: 'Engineered for extreme dust and field conditions' },
    { icon: 'ShieldCheckIcon', text: 'Tested to SAE, JIS, and DIN standards' },
    { icon: 'ClockIcon', text: 'Extended service intervals and reduced downtime' },
    { icon: 'WrenchScrewdriverIcon', text: 'Reinforced construction for heavy-duty use' },
  ];

  const qualityStats = [
    { icon: 'StarIcon', title: 'ISO 9001:2015', subtitle: 'Certified Quality' },
    { icon: 'GlobeAltIcon', title: 'Global Coverage', subtitle: '50+ Countries' },
    { icon: 'Squares2X2Icon', title: '8,000+ SKUs', subtitle: 'Comprehensive Range' },
    { icon: 'BoltIcon', title: 'High Efficiency', subtitle: 'Optimized Protection' },
  ];

  // Descriptive content with images
  const contentParagraphs = [
    'Agricultural equipment operates in some of the harshest conditions with extreme dust, dirt, and debris. Heavy-duty filters from Sure Filter® are specifically designed to protect expensive engines and hydraulic systems, maximizing uptime during critical seasonal operations when every hour counts.',
    
    'Farm equipment faces unique challenges including seasonal demands, remote operation locations, and extreme dust conditions. Our agricultural filtration solutions are engineered to withstand these harsh environments while maintaining peak performance. From tractors to harvesters, Sure Filter® provides reliable protection for all your agricultural machinery.',
    
    'All Sure Filter® agricultural products are designed and manufactured in accordance with SAE, JIS, and DIN standards. Our filters are specifically tested for agricultural applications to ensure they meet the demanding requirements of farm equipment operating in dusty field conditions.',
    
    'Sure Filter® agricultural filtration products feature reinforced construction, extended service intervals, and superior filtration media designed for heavy-duty applications. The robust design ensures maximum protection for your valuable equipment while reducing maintenance costs and downtime.',
    
    'For agricultural operations that demand reliability and performance, choose Sure Filter®. Our commitment to quality ensures your equipment runs longer, works harder, and delivers the performance you need during critical harvest seasons.',
    
    'To be sure – use SURE®.'
  ];

  const contentImages = [
    {
      src: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      alt: 'Agricultural equipment in field',
      position: 1,
    },
    {
      src: 'https://images.unsplash.com/photo-1566151098783-dac1b565bb35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      alt: 'Tractor working in dusty conditions',
      position: 3,
    },
    {
      src: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      alt: 'Harvester in wheat field',
      position: 5,
    },
  ];

  // Popular filters for agriculture - 10 filters
  const popularAgricultureFilters = [
    {
      id: 1,
      name: 'Air Filter A4567',
      category: 'Air Filters',
      applications: 'Tractors, Harvesters',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty/air',
    },
    {
      id: 2,
      name: 'Fuel Filter F8901',
      category: 'Fuel Filters', 
      applications: 'Diesel Farm Equipment',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty/fuel',
    },
    {
      id: 3,
      name: 'Hydraulic Filter H2345',
      category: 'Hydraulic Filters',
      applications: 'Precision Farming Equipment',
      image: 'https://images.unsplash.com/photo-1559123041-64f56cdc2c3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty',
    },
    {
      id: 4,
      name: 'Oil Filter O6789',
      category: 'Oil Filters',
      applications: 'Agricultural Engines',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty/oil',
    },
    {
      id: 5,
      name: 'Cabin Air Filter C3456',
      category: 'Cabin Filters',
      applications: 'Operator Comfort',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty/cabin',
    },
    {
      id: 6,
      name: 'Transmission Filter T7890',
      category: 'Transmission Filters',
      applications: 'Automatic Transmissions',
      image: 'https://images.unsplash.com/photo-1559123041-64f56cdc2c3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty',
    },
    {
      id: 7,
      name: 'Coolant Filter C1234',
      category: 'Coolant Filters',
      applications: 'Engine Cooling Systems',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty',
    },
    {
      id: 8,
      name: 'Breather Filter B5678',
      category: 'Breather Filters',
      applications: 'Tank Ventilation',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty',
    },
    {
      id: 9,
      name: 'Air Filter A9012',
      category: 'Air Filters',
      applications: 'Combine Harvesters',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty/air',
    },
    {
      id: 10,
      name: 'Fuel Filter F3456',
      category: 'Fuel Filters',
      applications: 'Agricultural Tractors',
      image: 'https://images.unsplash.com/photo-1559123041-64f56cdc2c3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      href: '/heavy-duty/fuel',
    },
  ];

  // Related filter types
  const relatedFilterTypes = [
    {
      id: 1,
      name: 'Air Filters',
      description: 'Engine air filtration solutions',
      href: '/heavy-duty/air',
      icon: 'CloudIcon',
    },
    {
      id: 2,
      name: 'Fuel Filters',
      description: 'Clean fuel delivery systems',
      href: '/heavy-duty/fuel',
      icon: 'FireIcon',
    },
    {
      id: 3,
      name: 'Hydraulic Filters',
      description: 'Hydraulic system protection',
      href: '/heavy-duty',
      icon: 'CogIcon',
    },
    {
      id: 4,
      name: 'Oil Filters',
      description: 'Engine oil purification',
      href: '/heavy-duty/oil',
      icon: 'BeakerIcon',
    },
    {
      id: 5,
      name: 'Cabin Filters',
      description: 'Operator air quality',
      href: '/heavy-duty/cabin',
      icon: 'HomeIcon',
    },
    {
      id: 6,
      name: 'Transmission Filters',
      description: 'Transmission fluid filtration',
      href: '/heavy-duty',
      icon: 'WrenchScrewdriverIcon',
    },
    {
      id: 7,
      name: 'Coolant Filters',
      description: 'Engine cooling protection',
      href: '/heavy-duty',
      icon: 'ArrowPathIcon',
    },
    {
      id: 8,
      name: 'Breather Filters',
      description: 'Tank ventilation systems',
      href: '/heavy-duty',
      icon: 'ArrowUpIcon',
    },
  ];

  return (
    <main>
      <Header />
      
      <CompactSearchHero 
        title="Sure Filter® Filters for the Agriculture Industry"
        description="Reliable filtration solutions for tractors, harvesters, and farm equipment operating in dusty field conditions."
        backgroundImage="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      <AboutWithStats
        title="Agriculture Industry Filters"
        description="Our agricultural filters are engineered to withstand harsh field environments while delivering superior protection for engines and hydraulic systems."
        features={aboutFeatures}
        stats={qualityStats}
        className="bg-white"
      />

      <ContentWithImages 
        title="Sure Filter® Filters for the Agriculture Industry"
        subtitle="Reliable filtration solutions engineered for agricultural applications"
        content={contentParagraphs}
        images={contentImages}
        className="bg-white"
      />

      <PopularFilters 
        title="Popular Agriculture Filters"
        description="Top-performing filtration solutions for agricultural equipment"
        filters={popularAgricultureFilters}
        catalogHref="/heavy-duty"
        catalogText="Browse All Filters"
        columnsPerRow={5}
      />

      <SimpleSearch 
        title="Find Your Agriculture Filter"
        description="Search by part number, OEM number, or equipment model"
        placeholder="Enter part number or equipment model"
        buttonText="Search Agriculture Filters"
      />

      <RelatedFilters 
        title="Related Filter Types"
        description="Explore filtration solutions for other applications"
        filters={relatedFilterTypes}
        className="bg-gray-50"
      />

      <IndustriesCms title="Other Industries We Serve" description="Comprehensive filtration solutions for every heavy-duty application" />

      <Footer />
    </main>
  );
}
