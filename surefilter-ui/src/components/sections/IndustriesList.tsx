"use client";

import Image from 'next/image';
import Link from 'next/link';

interface Industry {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  popularFilters: string[];
}

const industries: Industry[] = [
  {
    id: 1,
    name: "agriculture",
    title: "AGRICULTURE",
    description: "Tractors, harvesters, and farm equipment operating in dusty field conditions requiring reliable filtration to protect expensive engines and maximize uptime during critical seasons.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Air Filter A4567", "Fuel Filter F8901", "Hydraulic Filter H2345", "Oil Filter O6789"]
  },
  {
    id: 2,
    name: "construction",
    title: "CONSTRUCTION",
    description: "Heavy machinery and equipment operating in harsh construction environments requiring maximum protection against contamination to ensure project timeline completion.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Air Filter A7823", "Hydraulic Filter H9456", "Fuel Filter F2103", "Cabin Filter C8765"]
  },
  {
    id: 3,
    name: "mining",
    title: "MINING",
    description: "Equipment operating in extreme conditions with high contamination levels requiring superior filtration to protect valuable machinery in remote locations.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Air Filter A5674", "Oil Filter O1298", "Hydraulic Filter H7534", "Fuel Filter F4821"]
  },
  {
    id: 4,
    name: "marine",
    title: "MARINE",
    description: "Commercial vessels and offshore equipment requiring corrosion-resistant filtration solutions that perform reliably in saltwater environments.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Fuel Filter F9637", "Oil Filter O8142", "Air Filter A3695", "Coolant Filter C2847"]
  },
  {
    id: 5,
    name: "oil-gas",
    title: "OIL & GAS",
    description: "Critical equipment supporting energy production requiring filtration solutions that meet strict regulatory requirements and operate reliably in extreme environments.",
    image: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Fuel Filter F7159", "Hydraulic Filter H4926", "Air Filter A8351", "Oil Filter O6724"]
  },
  {
    id: 6,
    name: "power-generation",
    title: "POWER GENERATION",
    description: "Power plants and generators requiring consistent filtration performance to maintain electrical grid reliability and minimize costly unplanned downtime.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Fuel Filter F3827", "Oil Filter O9514", "Air Filter A1673", "Coolant Filter C5208"]
  },
  {
    id: 7,
    name: "transportation",
    title: "TRANSPORTATION",
    description: "Commercial trucking and logistics fleets requiring cost-effective filtration solutions that maximize vehicle uptime and reduce maintenance costs.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Air Filter A2951", "Fuel Filter F6384", "Oil Filter O4137", "Cabin Filter C7692"]
  },
  {
    id: 8,
    name: "waste-management",
    title: "WASTE MANAGEMENT",
    description: "Collection and processing equipment operating in challenging conditions requiring durable filtration to ensure consistent service delivery and equipment longevity.",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Air Filter A8463", "Hydraulic Filter H1925", "Fuel Filter F7038", "Oil Filter O5271"]
  },
  {
    id: 9,
    name: "rail",
    title: "RAIL",
    description: "Locomotives and rail equipment requiring long-lasting filtration solutions for reliable transportation and schedule maintenance optimization.",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    popularFilters: ["Fuel Filter F4692", "Air Filter A9157", "Oil Filter O3841", "Hydraulic Filter H6284"]
  }
];

export default function IndustriesList() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header - compact style like other internal components */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Industries
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Specialized filtration solutions tailored to the unique challenges of each industry
          </p>
        </div>

        {/* Industries Grid - 3 columns layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {industries.map((industry) => (
            <Link 
              key={industry.id} 
              href={`/industries/${industry.name}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-sure-blue-200"
            >
              {/* Image with overlay */}
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                <Image
                  src={industry.image}
                  alt={industry.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* Industry name overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sure-blue-100 transition-colors duration-200">
                    {industry.title}
                  </h3>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {industry.description}
                </p>
                
                {/* Popular Filters */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                    Popular Filters:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {industry.popularFilters.map((filter, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-sure-blue-50 text-sure-blue-700 px-3 py-1 rounded-full border border-sure-blue-200"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
