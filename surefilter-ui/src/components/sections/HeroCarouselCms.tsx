"use client";

import { useEffect } from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Keyboard } from 'swiper/modules';
import { getAssetUrl, isAssetPath } from '@/lib/assets';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSlide {
  badge?: string;
  title?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaHref?: string;
}

interface HeroCarouselCmsProps {
  slides: HeroSlide[];
  autoplayDelay?: number; // в миллисекундах
  showNavigation?: boolean;
  showPagination?: boolean;
}

export default function HeroCarouselCms({
  slides = [],
  autoplayDelay = 3000,
  showNavigation = true,
  showPagination = true
}: HeroCarouselCmsProps) {

  // Если только один слайд, показываем как статичный hero без навигации
  const isSingleSlide = slides.length === 1;
  // Loop работает корректно только с 3+ слайдами
  const enableLoop = slides.length >= 3;

  // Preload images for subsequent slides after component mounts
  useEffect(() => {
    if (slides.length <= 1) return;

    // Preload remaining slide images after a short delay (let first slide load first)
    const preloadTimeout = setTimeout(() => {
      slides.slice(1).forEach((slide) => {
        if (slide.image) {
          const imageUrl = isAssetPath(slide.image) ? getAssetUrl(slide.image) : slide.image;
          const img = new window.Image();
          img.src = imageUrl;
        }
      });
    }, 100);

    return () => clearTimeout(preloadTimeout);
  }, [slides]);

  // Если нет слайдов, показываем fallback
  if (slides.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No slides configured</h2>
          <p className="text-gray-600">Please add slides in the admin panel to display the carousel.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden bg-white">
      {/* Preload hints for next slides - helps browser prioritize these images */}
      {slides.slice(1, 3).map((slide, index) => {
        if (!slide.image) return null;
        const imageUrl = isAssetPath(slide.image) ? getAssetUrl(slide.image) : slide.image;
        return (
          <link
            key={`preload-${index}`}
            rel="preload"
            as="image"
            href={imageUrl}
          />
        );
      })}

      <Swiper
        modules={[Autoplay, Pagination, Navigation, Keyboard]}
        spaceBetween={0}
        slidesPerView={1}
        loop={enableLoop} // Loop только если слайдов >= 3
        speed={800}
        autoplay={isSingleSlide ? false : {
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        pagination={isSingleSlide || !showPagination ? false : {
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-gray-400 !opacity-100',
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-sure-blue-600 !scale-125',
        }}
        navigation={isSingleSlide || !showNavigation ? false : {
          nextEl: '.hero-carousel-next',
          prevEl: '.hero-carousel-prev',
        }}
        keyboard={{
          enabled: !isSingleSlide,
          onlyInViewport: true,
        }}
        className="h-full w-full"
      >
        {slides.map((slide, index) => {
          const imageSrc = slide.image || '/images/image-4.jpg';
          const headingPrefix = slide.titlePrefix || (slide.title ? slide.title : '');
          const headingHighlight = slide.titleHighlight || '';
          const isFirstSlide = index === 0;

          return (
            <SwiperSlide key={index}>
              <div className="relative h-full flex items-center">
                {/* Desktop diagonal image */}
                <div className="absolute top-24 bottom-0 right-0 z-0 hidden md:block w-[65vw] md:w-[60vw] lg:w-[55vw] max-w-[1400px]">
                  <div className="relative h-full w-full">
                    {/* Clip only the right panel area so the left edge is diagonal inside the panel */}
                    <div
                      className="absolute inset-0 bg-white"
                      style={{ clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 25% 100%)' }}
                    >
                      <ManagedImage
                        src={imageSrc}
                        alt={slide.title || 'Hero image'}
                        fill
                        priority={isFirstSlide}
                        quality={90}
                        sizes="(min-width: 1920px) 1400px, (min-width: 1280px) 80vw, (min-width: 768px) 70vw, 100vw"
                        className="object-cover object-right-bottom brightness-75"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-16 sm:pb-32">
                  {/* Mobile image */}
                  <div className="md:hidden mb-8">
                    <ManagedImage
                      src={imageSrc}
                      alt={slide.title || 'Hero image'}
                      width={1200}
                      height={900}
                      quality={90}
                      sizes="(max-width: 640px) 100vw, 100vw"
                      className="w-full h-auto object-contain"
                      priority={isFirstSlide}
                    />
                  </div>

                  <div className="max-w-xl text-center sm:text-left">
                    {slide.badge ? (
                      <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 rounded-full bg-sure-blue-100 text-sure-blue-600 text-sm font-medium">
                        <span className="w-2 h-2 bg-sure-blue-500 rounded-full"></span>
                        {slide.badge}
                      </div>
                    ) : null}

                    {(headingPrefix || headingHighlight) ? (
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                        {headingPrefix}
                        {headingHighlight ? (
                          <><br /><span className="text-sure-red-500">{headingHighlight}</span></>
                        ) : null}
                      </h1>
                    ) : null}

                    {slide.subtitle ? (
                      <p className="font-sans text-base sm:text-lg text-gray-600 mb-6 sm:mb-4 leading-relaxed">
                        {slide.subtitle}
                      </p>
                    ) : null}

                    {/* CTA Link - customizable */}
                    {(slide.ctaText || slide.ctaHref) && (
                      <div className="text-center sm:text-left">
                        <a
                          href={slide.ctaHref || '#products'}
                          className="text-sure-blue-600 hover:text-sure-blue-700 hover:underline font-medium transition-colors duration-200"
                        >
                          {slide.ctaText || 'Browse our complete catalog'} →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Navigation Arrows - показываем только если слайдов > 1 */}
      {!isSingleSlide && showNavigation && (
        <>
          <button 
            className="hero-carousel-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="hero-carousel-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}

