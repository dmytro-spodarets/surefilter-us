"use client";

import Icon from '@/components/ui/Icon';

interface WhyChooseItem {
  icon: string;
  title: string;
  description: string;
}

interface WhyChooseProps {
  title?: string;
  description?: string;
  items?: WhyChooseItem[];
  className?: string;
}

const features: WhyChooseItem[] = [
  {
    title: "Premium Quality",
    description: "Manufactured with the highest quality materials and precision engineering.",
    icon: "CheckCircleIcon"
  },
  {
    title: "Global Coverage",
    description: "Comprehensive range covering 8,000+ SKUs for worldwide applications.",
    icon: "GlobeAltIcon"
  },
  {
    title: "Expert Support",
    description: "Technical expertise and customer service backed by 20+ years of experience.",
    icon: "UserGroupIcon"
  }
];

export default function WhyChoose({ 
  title = "Why Choose Sure Filter®?", 
  description = "Experience the difference with our premium filtration solutions designed for extreme performance.",
  items = features,
  className = ""
}: WhyChooseProps) {
  return (
    <section className={`py-16 sm:py-24 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {items.map((item, index) => (
            <div key={index} className="group text-center p-8 bg-white rounded-xl border border-gray-100 hover:border-sure-blue-200 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden w-full md:w-[calc(33.333%-1.33rem)] md:max-w-[350px]">
              {/* Subtle gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-sure-blue-50/0 to-sure-red-50/0 group-hover:from-sure-blue-50/30 group-hover:to-sure-red-50/30 transition-all duration-300"></div>
              
              {/* Icon with animation */}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-sure-blue-50 text-sure-blue-500 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300">
                  <Icon name={item.icon} size="lg" className="w-10 h-10" />
                </div>
              </div>
              
              <h3 className="relative z-10 text-xl font-semibold text-gray-900 mb-4 group-hover:text-sure-blue-600 transition-colors duration-300">
                {item.title}
              </h3>
              <p className="relative z-10 text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {item.description}
              </p>
              
              {/* Decorative line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-sure-blue-500 to-sure-red-500 group-hover:w-1/2 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}