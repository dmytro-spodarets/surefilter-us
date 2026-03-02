"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import Icon from '@/components/ui/Icon';

interface AwardsGalleryItem {
  title: string;
  image?: string;
}

interface AwardsGalleryProps {
  title?: string;
  subtitle?: string;
  items?: AwardsGalleryItem[];
}

export default function AwardsGallery({ title, subtitle, items = [] }: AwardsGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const speedRef = useRef(0.5); // px per frame
  const pausedRef = useRef(false);

  // Duplicate items for seamless infinite loop
  const loopedItems = items.length > 0 ? [...items, ...items, ...items] : [];

  // Reset scroll to middle set on mount
  const resetToMiddle = useCallback(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0) return;
    // Each set is 1/3 of total scrollWidth
    const oneSetWidth = el.scrollWidth / 3;
    el.scrollLeft = oneSetWidth;
  }, [items.length]);

  // Continuous auto-scroll animation
  useEffect(() => {
    if (items.length === 0) return;

    // Wait for layout, then reset to middle
    requestAnimationFrame(() => {
      resetToMiddle();
    });

    const animate = () => {
      const el = scrollRef.current;
      if (el && !pausedRef.current) {
        el.scrollLeft += speedRef.current;

        // If we scrolled past the 2nd set, jump back to 1st set seamlessly
        const oneSetWidth = el.scrollWidth / 3;
        if (el.scrollLeft >= oneSetWidth * 2) {
          el.scrollLeft -= oneSetWidth;
        }
        // If we scrolled before the 1st set, jump forward
        if (el.scrollLeft <= 0) {
          el.scrollLeft += oneSetWidth;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [items.length, resetToMiddle]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 250;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
          </div>
        )}

        <div
          className="relative px-12 sm:px-16"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden pb-4"
          >
            {loopedItems.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-52 sm:w-56 text-center">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-4">
                  {item.image ? (
                    <ManagedImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="160px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-sure-blue-100 to-sure-blue-200 flex items-center justify-center">
                      <Icon name="TrophyIcon" className="w-12 h-12 text-sure-blue-500" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm text-gray-900 leading-tight">{item.title}</h3>
              </div>
            ))}
          </div>

          {/* Navigation arrows — always visible */}
          <button
            className="absolute top-1/2 left-0 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <Icon name="ChevronLeftIcon" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
          <button
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <Icon name="ChevronRightIcon" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
}
