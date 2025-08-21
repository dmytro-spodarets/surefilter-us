'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import { DocumentTextIcon, CheckCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function HeavyDutyCatalogPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    industry: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const catalogFeatures = [
    'Complete product specifications',
    'Application guidelines',
    'Installation instructions',
    'Cross-reference tables',
    'Performance data',
    'Quality certifications',
    'Technical drawings',
    'Part number listings'
  ];

  const industries = [
    'Construction',
    'Mining',
    'Agriculture',
    'Transportation',
    'Oil & Gas',
    'Power Generation',
    'Marine',
    'Manufacturing',
    'Other'
  ];

  if (isSubmitted) {
    return (
      <main>
        <Header />
        
        <section className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <div className="text-center bg-white rounded-lg shadow-lg p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You for Your Interest!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Your Heavy Duty Filter Catalog download will begin shortly. 
                A copy has also been sent to your email address.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#"
                  className="inline-flex items-center px-6 py-3 bg-sure-blue-500 text-white font-semibold rounded-lg hover:bg-sure-blue-600 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download Now
                </a>
                <a
                  href="/resources"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse More Resources
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      
      {/* Compact Hero Section */}
      <CompactHero
        title="Heavy Duty Filtration Solutions"
        description="Download our comprehensive product catalog featuring the complete range of heavy duty filtration solutions with technical specifications and applications."
        backgroundImage="https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      />
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <a
              href="/resources"
              className="inline-flex items-center text-sure-blue-500 hover:text-sure-blue-600 font-medium transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Resources
            </a>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2">
              {/* Resource Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-sure-blue-100 rounded-lg mr-4">
                    <DocumentTextIcon className="h-8 w-8 text-sure-blue-600" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                      Product Catalog
                    </span>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      Heavy Duty Filter Catalog 2024
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <span>PDF Format</span>
                  <span>15.2 MB</span>
                  <span>124 Pages</span>
                  <span>Updated: December 2024</span>
                </div>
              </div>

              {/* Resource Description */}
              <div className="prose max-w-none mb-8">
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Our comprehensive Heavy Duty Filter Catalog features the complete range of Sure Filter® 
                  filtration solutions designed specifically for heavy-duty applications. This detailed 
                  catalog includes technical specifications, application guidelines, and performance data 
                  for all our heavy-duty filter products.
                </p>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  Whether you&#39;re working with construction equipment, mining machinery, agricultural 
                  vehicles, or transportation fleets, this catalog provides everything you need to 
                  select the right filtration solution for your specific application. Our heavy-duty 
                  filters are engineered to withstand the most demanding operating conditions while 
                  delivering exceptional performance and reliability.
                </p>

                <p className="text-gray-600 leading-relaxed mb-6">
                  The catalog covers our extensive range of oil filters, air filters, fuel filters, 
                  and hydraulic filters, each designed to meet or exceed OEM specifications. You&#39;ll 
                  find detailed technical drawings, performance charts, and application notes that 
                  help ensure proper filter selection and installation.
                </p>

                <p className="text-gray-600 leading-relaxed mb-6">
                  This resource is essential for fleet managers, mechanics, equipment operators, 
                  and procurement professionals who need reliable filtration solutions for their 
                  heavy-duty equipment. The catalog also includes cross-reference tables to help 
                  you find the exact Sure Filter® equivalent for your existing filter applications.
                </p>
              </div>

              {/* What's Inside */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What&#39;s Inside</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {catalogFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Lead Gen Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-sure-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowDownTrayIcon className="h-8 w-8 text-sure-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Download Free Catalog
                  </h3>
                  <p className="text-gray-600">
                    Get instant access to our Heavy Duty Filter Catalog
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-sure-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-sure-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-sure-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-sure-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-sure-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-sure-blue-500"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-sure-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sure-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Download Catalog'}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    By downloading, you agree to receive updates from Sure Filter®
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
