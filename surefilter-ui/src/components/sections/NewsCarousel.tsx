'use client';

import React from 'react';

const facts = [
  {
    icon: '🧪',
    title: 'Tested',
    desc: 'Each filter undergoes rigorous laboratory and field testing.'
  },
  {
    icon: '📜',
    title: 'Certified',
    desc: 'Meets or exceeds international quality standards.'
  },
  {
    icon: '🤝',
    title: 'Trusted',
    desc: 'Relied on by professionals worldwide.'
  },
];

export default function QualityStandards() {
  return (
    <section className="py-20 bg-sure-blue-50/30">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">Quality Standards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {facts.map(fact => (
            <div key={fact.title} className="flex flex-col items-center text-center p-8 rounded-lg bg-white border border-gray-200 shadow-none">
              <span className="text-5xl mb-4 text-sure-blue-600">{fact.icon}</span>
              <span className="text-xl font-semibold mb-2 text-gray-900">{fact.title}</span>
              <span className="text-gray-600 text-sm">{fact.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 