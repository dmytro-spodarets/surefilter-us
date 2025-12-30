"use client";

import { useState } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import Icon from '@/components/ui/Icon';

interface AwardItem { title: string; subtitle: string; year: string; image?: string; description?: string }

export default function AwardsCarousel({ title, subtitle, items = [] as AwardItem[] }: { title?: string; subtitle?: string; items?: AwardItem[] }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title || 'Awards'}</h2>
          {subtitle ? <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p> : null}
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-lg">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
              {items.map((award, i) => (
                <div key={i} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl mx-auto">
                    <div className="relative h-80 overflow-hidden">
                      {award.image ? (
                        <ManagedImage 
                          src={award.image} 
                          alt={award.title} 
                          fill 
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-sure-blue-600 to-sure-red-500" />
                      )}
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1">
                        <div className="flex items-center space-x-2">
                          <Icon name="TrophyIcon" className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-900">{award.year}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{award.title}</h3>
                        <p className="text-lg text-white/90">{award.subtitle}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      {award.description ? <p className="text-gray-600 text-center leading-relaxed text-lg">{award.description}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {items.length > 1 ? (
            <>
              <button className="absolute top-1/2 left-4 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10" onClick={prev}>
                <Icon name="ChevronLeftIcon" className="w-6 h-6 text-gray-600" />
              </button>
              <button className="absolute top-1/2 right-4 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10" onClick={next}>
                <Icon name="ChevronRightIcon" className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex justify-center mt-8 space-x-2">
                {items.map((_, i) => (
                  <button key={i} className={`w-3 h-3 rounded-full transition-all duration-200 ${i === idx ? 'bg-sure-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} onClick={() => setIdx(i)} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}


