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
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title || 'Our Company'}</h2>
          {subtitle ? <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p> : null}
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`w-full text-left px-6 py-4 rounded-lg font-medium transition-all duration-300 relative overflow-hidden group ${
                    active === t.key ? 'bg-sure-blue-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="relative z-10">{t.title}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-lg p-8">
              {activeTab ? (
                <>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">{activeTab.title}</h3>
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">{activeTab.content}</div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


