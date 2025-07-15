import React from 'react';

export default function CustomerService() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">Dedicated to Customer Service</h2>
        <p className="text-lg text-gray-700 mb-6">Your questions, our priority. Warranty and support you can trust.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
          <div className="flex-1 bg-sure-blue-50/50 rounded-lg p-6 border border-gray-200">
            <div className="text-2xl font-semibold text-sure-blue-700 mb-2">Warranty</div>
            <div className="text-gray-600 text-sm">All Sure Filter® products are covered by our limited warranty. <a href="#warranty" className="text-sure-orange-500 underline ml-1">Learn more</a></div>
          </div>
          <div className="flex-1 bg-sure-orange-50/50 rounded-lg p-6 border border-gray-200">
            <div className="text-2xl font-semibold text-sure-orange-600 mb-2">Support</div>
            <div className="text-gray-600 text-sm">Contact our team for any questions or support. <a href="#contact" className="text-sure-blue-500 underline ml-1">Contact us</a></div>
          </div>
        </div>
      </div>
    </section>
  );
} 