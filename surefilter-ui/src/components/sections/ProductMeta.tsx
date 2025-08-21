'use client';

import Icon from '@/components/ui/Icon';

interface ProductMetaProps {
  code: string; // e.g., SFO241
  name: string; // e.g., Engine Oil Filter
  category: string; // e.g., Oil Filter
  status?: string; // e.g., Release Product
  filterType?: string; // e.g., Spin-On
}

export default function ProductMeta({ code, name, category, status, filterType }: ProductMetaProps) {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sure-blue-100 text-sure-blue-700">{category}</span>
              {status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{code}</h1>
            <p className="text-gray-600 mt-1">{name}{filterType ? ` • ${filterType}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Icon name="ShareIcon" className="w-4 h-4" />
              Share
            </button>
            <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2" onClick={() => window.print()}>
              <Icon name="PrinterIcon" className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
