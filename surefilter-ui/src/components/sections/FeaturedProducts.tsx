"use client";

import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "Heavy Duty Air Filter",
    description: "Premium air filtration for extreme conditions",
    image: "/images/filter-1.jpg",
    category: "Air Filters"
  },
  {
    id: 2,
    name: "Oil Filter Pro Series",
    description: "Advanced oil filtration technology",
    image: "/images/filter-2.jpg",
    category: "Oil Filters"
  },
  {
    id: 3,
    name: "Fuel Filter Elite",
    description: "Ultra-clean fuel delivery system",
    image: "/images/filter-3.jpg",
    category: "Fuel Filters"
  },
  {
    id: 4,
    name: "Hydraulic Filter Max",
    description: "Heavy-duty hydraulic protection",
    image: "/images/filter-4.jpg",
    category: "Hydraulic Filters"
  },
  {
    id: 5,
    name: "Cabin Air Filter Plus",
    description: "Clean air for operator comfort",
    image: "/images/filter-5.jpg",
    category: "Cabin Filters"
  },
  {
    id: 6,
    name: "Transmission Filter Pro",
    description: "Reliable transmission protection",
    image: "/images/filter-6.jpg",
    category: "Transmission Filters"
  },
  {
    id: 7,
    name: "Coolant Filter Supreme",
    description: "Optimal engine cooling protection",
    image: "/images/filter-7.jpg",
    category: "Coolant Filters"
  },
  {
    id: 8,
    name: "Water Filter Advanced",
    description: "Pure water filtration technology",
    image: "/images/filter-8.jpg",
    category: "Water Filters"
  }
];

export default function FeaturedProducts() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-sure-blue-500 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-sure-blue-600 max-w-2xl mx-auto">
            Discover our most popular filtration solutions for heavy-duty applications
          </p>
        </div>

        {/* Сетка продуктов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="block bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-sure-blue-200 transition-all duration-200 group"
            >
              {/* Изображение */}
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Контент */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-sure-blue-100 text-sure-blue-600 text-xs font-medium rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-sure-blue-500 mb-2 group-hover:text-sure-blue-600 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Кнопка View Full Catalog */}
        <div className="text-center">
          <button className="px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200">
            View Full Catalog
          </button>
        </div>
      </div>
    </section>
  );
} 