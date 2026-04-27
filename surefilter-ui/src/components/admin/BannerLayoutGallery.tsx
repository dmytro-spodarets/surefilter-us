'use client';

import { listLayouts } from '@/components/banners/layouts';
import type { BannerType } from '@/types/banners';

interface BannerLayoutGalleryProps {
  selectedId: string;
  onSelect: (id: string) => void;
  filterType?: BannerType;
}

export default function BannerLayoutGallery({ selectedId, onSelect, filterType }: BannerLayoutGalleryProps) {
  const layouts = listLayouts(filterType);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {layouts.map((layout) => {
        const active = layout.id === selectedId;
        return (
          <button
            type="button"
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className={`text-left rounded-lg border-2 transition-all overflow-hidden ${
              active ? 'border-sure-blue-600 ring-2 ring-sure-blue-200' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={layout.thumbnail} alt={layout.name} className="w-full h-full object-contain" />
            </div>
            <div className="p-3">
              <div className="font-semibold text-sm text-gray-900">{layout.name}</div>
              <div className="text-xs text-gray-500 mt-1">{layout.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
