"use client";
import Image from 'next/image';

interface HeroCmsProps {
  badge?: string;
  title?: string;
  titlePrefix?: string;
  titleHighlight?: string;
  subtitle?: string;
  image?: string;
}

export default function HeroCms({ badge = '', title = '', titlePrefix = '', titleHighlight = '', subtitle = '', image = '' }: HeroCmsProps) {
  const imageSrc = image || '/images/image-4.jpg';
  const headingPrefix = titlePrefix || (title ? title : '');
  const headingHighlight = titleHighlight || '';

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-white">
      {/* Desktop diagonal image */}
      <div className="absolute top-24 bottom-0 right-0 z-0 hidden md:block w-[65vw] md:w-[60vw] lg:w-[55vw] max-w-[1400px]">
        <div className="relative h-full w-full">
          {/* Clip only the right panel area so the left edge is diagonal inside the panel */}
          <div
            className="absolute inset-0 bg-white"
            style={{ clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 25% 100%)' }}
          >
            <Image
              src={imageSrc}
              alt={title || 'Hero image'}
              fill
              priority
              quality={85}
              sizes="(min-width:1536px) 40vw, (min-width:1280px) 45vw, (min-width:768px) 50vw, 100vw"
              className="object-cover object-right-bottom brightness-75"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-24 pb-16 sm:pb-32">
        {/* Mobile image */}
        <div className="md:hidden mb-8">
          <Image
            src={imageSrc}
            alt={title || 'Hero image'}
            width={1200}
            height={900}
            quality={85}
            sizes="100vw"
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        <div className="max-w-xl text-center sm:text-left">
          {badge ? (
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 rounded-full bg-sure-blue-100 text-sure-blue-600 text-sm font-medium">
              <span className="w-2 h-2 bg-sure-blue-500 rounded-full"></span>
              {badge}
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

          {subtitle ? (
            <p className="font-sans text-base sm:text-lg text-gray-600 mb-6 sm:mb-4 leading-relaxed">
              {subtitle}
            </p>
          ) : null}

          {/* Search - TODO: Uncomment when catalog is ready */}
          {/* <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by OEM number or part number..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-sure-red-500 focus:ring-0 focus:outline-none transition-colors duration-200 text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-sure-red-500 text-white font-semibold rounded-lg hover:bg-sure-red-700 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form> */}

          <div className="text-center sm:text-left">
            <a
              href="#products"
              className="text-sure-blue-600 hover:text-sure-blue-700 hover:underline font-medium transition-colors duration-200"
            >
              Browse our complete catalog →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


