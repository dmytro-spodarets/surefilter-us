"use client";

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
  }
];

export default function AboutNews() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Левая колонка - About Us */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Sure Filter® is a trusted global manufacturer of premium filtration products for heavy-duty and automotive applications. With over 20 years of experience and 8,000+ SKUs, we deliver quality, performance, and reliability.
            </p>
            
            <button className="px-8 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-600 transition-colors duration-200">
              Learn More
            </button>
          </div>

          {/* Правая колонка - News & Updates */}
          <div>
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
            
            <button className="px-8 py-3 text-sure-blue-600 font-semibold border-2 border-sure-blue-600 rounded-lg hover:bg-sure-blue-50 hover:text-sure-blue-700 transition-all duration-200">
              See All News
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 