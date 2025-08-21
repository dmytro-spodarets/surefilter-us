import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import { ArrowLeftIcon, CalendarDaysIcon, TagIcon, ShareIcon } from '@heroicons/react/24/outline';

export default function PressReleasePage() {
  return (
    <main>
      <Header />
      
      {/* Compact Hero Section */}
      <CompactHero
        title="Press Release"
        description="Stay updated with the latest news and announcements from Sure Filter®"
        backgroundImage="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      />
      
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <a
              href="/newsroom"
              className="inline-flex items-center text-sure-blue-500 hover:text-sure-blue-600 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Newsroom
            </a>
          </div>

          {/* Press Release Content */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-sure-blue-100 text-sure-blue-800 text-sm font-medium rounded-full">
                  Product Launch
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  December 15, 2024
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Sure Filter® Launches Revolutionary Heavy Duty Filtration System
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Our latest innovation in heavy duty filtration technology sets new industry standards 
                for performance and durability, delivering unprecedented protection for heavy equipment.
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  <strong>Las Vegas, NV – December 15, 2024</strong> – Sure Filter® is a leading manufacturer 
                  of premium filtration solutions, today announced the launch of its revolutionary Heavy Duty 
                  Filtration System, designed to deliver superior performance in the most demanding industrial 
                  applications.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  The new filtration system incorporates advanced nano-fiber technology and multi-stage 
                  filtration processes to achieve industry-leading efficiency ratings of 99.9% for particles 
                  as small as 0.3 microns. This breakthrough technology provides unprecedented protection for 
                  heavy equipment engines, hydraulic systems, and fuel systems.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features and Benefits</h2>
                
                <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                  <li><strong>Advanced Nano-Fiber Technology:</strong> Delivers superior filtration efficiency while maintaining optimal flow rates</li>
                  <li><strong>Extended Service Life:</strong> Up to 50% longer service intervals compared to conventional filters</li>
                  <li><strong>Enhanced Durability:</strong> Engineered to withstand extreme operating conditions and temperature variations</li>
                  <li><strong>Universal Compatibility:</strong> Designed to fit major heavy equipment brands and models</li>
                  <li><strong>Environmental Benefits:</strong> Reduced waste and improved fuel efficiency contribute to lower emissions</li>
                </ul>

                <p className="text-gray-700 leading-relaxed mb-6">
                  &quot;This launch represents a significant milestone in our commitment to innovation and 
                  customer satisfaction,&quot; said John Smith, CEO of Sure Filter®. &quot;Our research and 
                  development team has worked tirelessly to create a filtration solution that not only 
                  meets but exceeds the demanding requirements of today&#39;s heavy equipment operators.&quot;
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Industry Impact</h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  The heavy duty filtration market has seen increasing demand for more efficient and 
                  durable solutions as equipment manufacturers continue to push the boundaries of 
                  performance and reliability. Sure Filter®&#39;s new system addresses these challenges 
                  while providing cost-effective operation for fleet managers and equipment operators.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Independent testing conducted by certified laboratories has validated the system&#39;s 
                  performance claims, with results showing significant improvements in contaminant 
                  removal efficiency and filter life compared to leading competitive products.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability and Pricing</h2>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  The Heavy Duty Filtration System is now available through Sure Filter®&#39;s extensive 
                  network of authorized distributors and service centers worldwide. The system is 
                  competitively priced to deliver exceptional value while maintaining the premium 
                  quality standards that customers expect from Sure Filter®.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  For more information about the Heavy Duty Filtration System, including technical 
                  specifications and application guidelines, visit our website or contact your local 
                  Sure Filter® representative.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About Sure Filter®</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Sure Filter® is a leading manufacturer of premium filtration solutions for automotive, 
                    heavy duty, and industrial applications. With over 30 years of experience in filtration 
                    technology, Sure Filter® is committed to delivering innovative products that protect 
                    equipment, improve performance, and reduce operating costs. The company serves customers 
                    in more than 50 countries through its global network of distributors and service centers.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    Published: December 15, 2024
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TagIcon className="h-4 w-4 mr-1" />
                    Product Launch
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Share:</span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <ShareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Related Press Releases */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Press Releases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Partnership
                  </span>
                  <span className="ml-3 text-sm text-gray-500">November 20, 2024</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sure Filter® Expands Global Distribution Network
                </h3>
                <p className="text-gray-600 text-sm">
                  Strategic partnerships established in key markets to better serve our international customers.
                </p>
                <a href="#" className="text-sure-blue-500 font-medium hover:text-sure-blue-600 text-sm mt-2 inline-block">
                  Read More →
                </a>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Innovation
                  </span>
                  <span className="ml-3 text-sm text-gray-500">November 15, 2024</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  New Research & Development Center Opening
                </h3>
                <p className="text-gray-600 text-sm">
                  State-of-the-art facility to accelerate innovation in filtration technology.
                </p>
                <a href="#" className="text-sure-blue-500 font-medium hover:text-sure-blue-600 text-sm mt-2 inline-block">
                  Read More →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
