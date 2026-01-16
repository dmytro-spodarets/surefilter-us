"use client";

import { useState } from 'react';

interface CompanyTab {
  key: string;
  title: string;
  content: string;
  image?: string;
}

export default function OurCompany({ title, subtitle, tabs = [] as CompanyTab[] }: { title?: string; subtitle?: string; tabs?: CompanyTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key || 'about-us');
  const activeTab = tabs.find((t) => t.key === active) || tabs[0];

  const toggleAccordion = (key: string) => {
    setActive(active === key ? '' : key);
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title || 'Our Company'}</h2>
          {subtitle ? <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p> : null}
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop: Vertical Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <nav className="space-y-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`w-full text-left px-6 py-4 rounded-lg font-medium transition-all duration-300 ${
                    active === t.key 
                      ? 'bg-sure-blue-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop: Content Area */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 transition-all duration-300">
              {activeTab ? (
                <>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                    {activeTab.title}
                  </h3>
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                      {activeTab.content}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Mobile/Tablet: Accordion */}
          <div className="lg:hidden lg:col-span-4 space-y-4">
            {tabs.map((tab) => {
              const isActive = active === tab.key;
              
              return (
                <div 
                  key={tab.key} 
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:border-gray-300"
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleAccordion(tab.key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base font-semibold">{tab.title}</span>
                    <svg 
                      className={`w-5 h-5 text-sure-blue-600 transition-transform duration-300 flex-shrink-0 ml-3 ${
                        isActive ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Accordion Content */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="prose prose-base max-w-none">
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {tab.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
