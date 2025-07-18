"use client";

import Icon from '@/components/ui/Icon';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "New Heavy Duty Series Launched",
    date: "July 2025",
    category: "Product Launch"
  },
  {
    id: 2,
    title: "Meet us at AAPEX 2025 – Booth #XYZ",
    date: "October 2025",
    category: "Events"
  },
  {
    id: 3,
    title: "Expanded coverage for CAT and Ford trucks",
    date: "June 2025",
    category: "Product Update"
  },
  {
    id: 4,
    title: "ISO 9001:2015 Certification Renewed",
    date: "May 2025",
    category: "Quality"
  }
];

const companyStats = [
  { number: "40+", label: "Years Experience" },
  { number: "8,000+", label: "Filter Types" },
  { number: "50+", label: "Countries Served" },
  { number: "ISO", label: "9001:2015 Certified" }
];

export default function AboutNews() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-sure-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Левая колонка - About Us */}
          <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Sure Filter® is a trusted global manufacturer of premium filtration products for heavy-duty and automotive applications. With over 40 years of experience and 8,000+ SKUs, we deliver quality, performance, and reliability that keeps your equipment running at peak efficiency.
            </p>

            <p className="text-base text-gray-600 leading-relaxed mb-8">
              From construction sites to mining operations, from agricultural fields to marine environments, our filters protect the world's most demanding equipment. We understand that every particle matters, every minute of uptime counts, and every customer deserves the best protection for their investment. Our commitment to innovation and customer satisfaction drives us to continuously improve our products and services.
            </p>

            {/* Company Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {companyStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-sure-blue-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-auto">
              <button className="px-8 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-600 transition-colors duration-200">
                Learn More About Us
              </button>
            </div>
          </div>

          {/* Правая колонка - News & Updates */}
          <div className="flex flex-col bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              News & Updates
            </h2>
            
            <div className="space-y-6 mb-8">
              {newsItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <span className="text-sm text-gray-500 ml-4">
                      {item.date}
                    </span>
                  </div>
                  <span className="inline-block px-2 py-1 bg-sure-blue-100 text-sure-blue-600 text-xs font-medium rounded-full">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-auto">
              <button className="px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200">
                See All News
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 