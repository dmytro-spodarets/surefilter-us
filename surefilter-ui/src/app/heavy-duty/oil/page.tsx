import Header from '@/components/layout/Header';
import CompactSearchHero from '@/components/sections/CompactSearchHero';
import Footer from '@/components/layout/Footer';
import ContentWithImages from '@/components/sections/ContentWithImages';
import PopularFilters from '@/components/sections/PopularFilters';
import SimpleSearch from '@/components/sections/SimpleSearch';
import RelatedFilters from '@/components/sections/RelatedFilters';
import Industries from '@/components/sections/Industries';

export const metadata = {
  title: 'Heavy Duty Oil Filters | Sure Filter®',
  description: 'Premium heavy duty oil filters for construction, mining, and industrial equipment. Superior engine protection with extended service life.',
};

export default function HeavyDutyOilFiltersPage() {
  // Content paragraphs with images
  const contentParagraphs = [
    "Heavy machinery and off-road vehicles face a continuous battle against dirty engine oil. Heavy-duty oil filters from Sure Filter® can help in the fight. Whether it's an engine or a piece of construction machinery, there are all sorts of contaminants that can get into the oil. Dirty oil means a less efficient engine and one that may face unnecessary repairs. Keep it clean with quality Sure Filter® brand products.",
    
    "Sure Filter® has been developed by a global manufacturer that has been in business for almost four decades producing a variety of filtration products including oil filters, air filters, fuel filters, hydraulic filters, and more for a wide range of applications. The automotive, construction, and mining industries are among a few that utilize the high quality filtration solutions provided by the company.",
    
    "All of the Sure Filter® brand products are designed and manufactured in accordance with SAE, JIS, and DIN standards. All filters are made in adherence to international industry standards and examined by the company to ensure quality. Sure Filter® tests each and every product to make sure they hold up to efficiency and life expectancy standards. When a customer chooses a Sure Filter® brand product, he or she can be sure that it is of the highest quality and brings tremendous value.",
    
    "Sure Filter® brand products feature quality design elements such as a steel tension spring, thicker body, and high performance filtration media. The steel tension spring is manufactured with a heat treatment process so that it will maintain the element support. The thicker body increases the structural integrity of the filter and the high performance media ensures the free flow of air or fluids. Sure Filter® products are also made to withstand intra-plastisol leakage. The results are high quality, efficient, and effective filtration solutions.",
    
    "Premium heavy-duty oil filters from Sure Filter® offer many benefits. The value provided by Sure Filter® products is well worth the cost. For quality and reliability that you can trust, choose filters by Sure Filter®. Don's settle for anything less than the best. Get tremendous value for products that perform.",
    
    "To be sure – use SURE®."
  ];

  const contentImages = [
    {
      src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Heavy duty construction equipment",
      position: 1
    },
    {
      src: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Industrial filtration technology",
      position: 3
    },
    {
      src: "https://images.unsplash.com/photo-1559123041-64f56cdc2c3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Quality control and testing",
      position: 5
    }
  ];

  // Popular oil filters - 10 filters
  const popularOilFilters = [
    { name: "OF-1001 Oil Filter", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop&q=80", href: "/products/of-1001" },
    { name: "OF-2002 Oil Filter", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&q=80", href: "/products/of-2002" },
    { name: "OF-3003 Oil Filter", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop&q=80", href: "/products/of-3003" },
    { name: "OF-4004 Oil Filter", image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=300&h=200&fit=crop&q=80", href: "/products/of-4004" },
    { name: "OF-5005 Oil Filter", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop&q=80", href: "/products/of-5005" },
    { name: "OF-6006 Oil Filter", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop&q=80", href: "/products/of-6006" },
    { name: "OF-7007 Oil Filter", image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=200&fit=crop&q=80", href: "/products/of-7007" },
    { name: "OF-8008 Oil Filter", image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=300&h=200&fit=crop&q=80", href: "/products/of-8008" },
    { name: "OF-9009 Oil Filter", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop&q=80", href: "/products/of-9009" },
    { name: "OF-1010 Oil Filter", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&h=200&fit=crop&q=80", href: "/products/of-1010" }
  ];

  // Related filter types
  const relatedFilters = [
    { 
      name: 'Air Filters', 
      href: '/heavy-duty/air',
      icon: 'CloudArrowUpIcon',
      description: 'Protect your engine with premium air filtration for heavy duty applications.'
    },
    { 
      name: 'Fuel Filters', 
      href: '/heavy-duty/fuel',
      icon: 'BeakerIcon',
      description: 'Clean fuel delivery systems for optimal engine performance and longevity.'
    },
    { 
      name: 'Hydraulic Filters', 
      href: '/heavy-duty/hydraulic',
      icon: 'CogIcon',
      description: 'Maintain hydraulic system efficiency with advanced filtration solutions.'
    },
    { 
      name: 'Oil Filters', 
      href: '/heavy-duty/oil',
      icon: 'OilCanIcon',
      description: 'Superior engine protection with premium oil filtration for heavy duty applications.'
    },
    { 
      name: 'Transmission Filters', 
      href: '/heavy-duty/transmission',
      icon: 'GearIcon',
      description: 'Ensure smooth transmission performance with high-quality filtration solutions.'
    },
    { 
      name: 'Coolant Filters', 
      href: '/heavy-duty/coolant',
      icon: 'SnowflakeIcon',
      description: 'Maintain optimal engine temperature with advanced coolant filtration systems.'
    },
    { 
      name: 'Cabin Air Filters', 
      href: '/heavy-duty/cabin-air',
      icon: 'HouseIcon',
      description: 'Improve in-cabin air quality with premium cabin air filtration solutions.'
    },
    { 
      name: 'Diesel Particulate Filters', 
      href: '/heavy-duty/diesel-particulate',
      icon: 'TruckIcon',
      description: 'Reduce emissions and improve engine performance with high-quality diesel particulate filtration.'
    }
  ];

  return (
    <main>
      <Header />
      
      {/* Compact Hero Section */}
      <CompactSearchHero
        title="Heavy Duty Oil Filters"
        description="Superior engine protection for extreme conditions. Premium filtration solutions for construction, mining, and industrial equipment."
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      />

      {/* Content with Images */}
      <ContentWithImages
        content={contentParagraphs}
        images={contentImages}
      />

      {/* Popular Heavy Duty Oil Filters */}
      <PopularFilters
        title="Popular Heavy Duty Oil Filters"
        description="Top-selling oil filters for heavy duty applications"
        filters={popularOilFilters}
        catalogHref="/heavy-duty/oil/catalog"
        catalogText="Browse Oil Filter Catalog"
        columnsPerRow={5}
      />

      {/* Find Your Oil Filter - Dark Background Search */}
      <SimpleSearch
        title="Find Your Oil Filter"
        description="Search by part number or equipment model"
        placeholder="Enter part number or equipment model..."
        buttonText="Search"
      />

      {/* Other Filter Types */}
      <RelatedFilters
        title="Other Filter Types"
        description="Explore our complete range of heavy duty filtration solutions"
        filters={relatedFilters}
      />

      {/* Industries We Serve */}
      <Industries />

      <Footer />
    </main>
  );
}
