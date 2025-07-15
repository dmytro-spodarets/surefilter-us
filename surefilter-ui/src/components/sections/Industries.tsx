"use client";

import Image from 'next/image';

interface Industry {
  id: number;
  name: string;
  description: string;
  image: string;
  icon: string;
}

const industries: Industry[] = [
  {
    id: 1,
    name: "On-Highway",
    description: "Trucks, buses, and commercial vehicles",
    image: "/images/industry-highway.jpg",
    icon: "TruckIcon"
  },
  {
    id: 2,
    name: "Agriculture",
    description: "Tractors, harvesters, and farm equipment",
    image: "/images/industry-agriculture.jpg",
    icon: "TractorIcon"
  },
  {
    id: 3,
    name: "Rental Equipment",
    description: "Construction and industrial rental fleets",
    image: "/images/industry-rental.jpg",
    icon: "WrenchScrewdriverIcon"
  },
  {
    id: 4,
    name: "Construction",
    description: "Excavators, bulldozers, and heavy machinery",
    image: "/images/industry-construction.jpg",
    icon: "BuildingOfficeIcon"
  }
];

export default function Industries() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Industries We Serve
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive filtration solutions for every heavy-duty application
          </p>
        </div>

        {/* Сетка индустрий */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry) => (
            <div key={industry.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
              {/* Изображение */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <Image
                  src={industry.image}
                  alt={industry.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Градиент поверх изображения */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              {/* Контент */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {industry.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {industry.description}
                </p>
                
                <button className="w-full px-4 py-2 text-sure-blue-600 font-medium border border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-colors duration-200">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 