'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CompactHero from '@/components/sections/CompactHero';
import { CalendarDaysIcon, MapPinIcon, UserGroupIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const upcomingEvents = [
  {
    id: 1,
    name: 'CONEXPO-CON/AGG 2025',
    date: '2025-03-10',
    endDate: '2025-03-14',
    location: 'Las Vegas, NV',
    venue: 'Las Vegas Convention Center',
    description: 'The largest international trade show for the construction, aggregates, and ready-mix concrete industries.',
    booth: 'Booth #C4521',
    type: 'Trade Show',
    attendees: '140,000+'
  },
  {
    id: 2,
    name: 'SEMA Show 2025',
    date: '2025-04-15',
    endDate: '2025-04-18',
    location: 'Las Vegas, NV',
    venue: 'Las Vegas Convention Center',
    description: 'The premier automotive specialty products trade event in the world.',
    booth: 'Booth #24567',
    type: 'Automotive',
    attendees: '70,000+'
  },
  {
    id: 3,
    name: 'BAUMA 2025',
    date: '2025-05-20',
    endDate: '2025-05-26',
    location: 'Munich, Germany',
    venue: 'Messe München',
    description: 'World\'s leading trade fair for construction machinery, building material machines, and mining machines.',
    booth: 'Hall A4, Booth #401',
    type: 'Construction',
    attendees: '600,000+'
  },
  {
    id: 4,
    name: 'Heavy Duty Expo 2025',
    date: '2025-06-12',
    endDate: '2025-06-14',
    location: 'Dallas, TX',
    venue: 'Kay Bailey Hutchison Convention Center',
    description: 'The premier event for heavy-duty truck and equipment professionals.',
    booth: 'Booth #1245',
    type: 'Heavy Duty',
    attendees: '25,000+'
  }
];

const pressReleases = [
  {
    id: 1,
    title: 'Sure Filter® Launches Revolutionary Heavy Duty Filtration System',
    excerpt: 'Our latest innovation in heavy duty filtration technology sets new industry standards for performance and durability.',
    date: '2024-12-15',
    category: 'Product Launch',
    link: '/newsroom/heavy-duty-filter-launch'
  },
  {
    id: 2,
    title: 'Sure Filter® Expands Global Distribution Network',
    excerpt: 'Strategic partnerships established in key markets to better serve our international customers.',
    date: '2024-11-20',
    category: 'Business',
    link: '#'
  },
  {
    id: 3,
    title: 'New Research & Development Center Opening',
    excerpt: 'State-of-the-art facility to accelerate innovation in filtration technology.',
    date: '2024-11-15',
    category: 'Innovation',
    link: '#'
  },
  {
    id: 4,
    title: 'Sure Filter® Wins Industry Excellence Award',
    excerpt: 'Recognition for our commitment to innovation and quality in the filtration industry.',
    date: '2024-11-05',
    category: 'Awards',
    link: '#'
  },
  {
    id: 5,
    title: 'Sustainable Manufacturing Initiatives Launch',
    excerpt: 'Our commitment to environmental responsibility and sustainable manufacturing practices.',
    date: '2024-10-28',
    category: 'Sustainability',
    link: '#'
  },
  {
    id: 6,
    title: 'Partnership with Leading OEM Manufacturer',
    excerpt: 'Strategic alliance to enhance product quality and market reach.',
    date: '2024-10-15',
    category: 'Partnership',
    link: '#'
  },
  {
    id: 7,
    title: 'Q3 2024 Financial Results Announced',
    excerpt: 'Strong performance driven by innovation and market expansion.',
    date: '2024-10-10',
    category: 'Financial',
    link: '#'
  },
  {
    id: 8,
    title: 'New Automotive Filter Line Introduction',
    excerpt: 'Advanced filtration solutions for modern automotive applications.',
    date: '2024-09-25',
    category: 'Product Launch',
    link: '#'
  },
  {
    id: 9,
    title: 'ISO 9001:2015 Certification Renewed',
    excerpt: 'Continued commitment to quality management excellence.',
    date: '2024-09-12',
    category: 'Certification',
    link: '#'
  },
  {
    id: 10,
    title: 'Industrial Filtration Solutions Expansion',
    excerpt: 'Enhanced offerings for industrial and commercial applications.',
    date: '2024-08-30',
    category: 'Product Line',
    link: '#'
  }
];

export default function NewsroomPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const eventsPerSlide = 2;
  const totalSlides = Math.ceil(upcomingEvents.length / eventsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentEvents = () => {
    const startIndex = currentSlide * eventsPerSlide;
    return upcomingEvents.slice(startIndex, startIndex + eventsPerSlide);
  };

  return (
    <main>
      <Header />
      
      {/* Compact Hero Section */}
      <CompactHero
        title="Newsroom"
        description="Stay updated with our upcoming events, exhibitions, and latest press releases."
        backgroundImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      />

      {/* Upcoming Events Section with Carousel */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events & Exhibitions</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                disabled={totalSlides <= 1}
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm text-gray-500">
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                disabled={totalSlides <= 1}
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Events Carousel */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid md:grid-cols-2 gap-8">
                    {upcomingEvents
                      .slice(slideIndex * eventsPerSlide, (slideIndex + 1) * eventsPerSlide)
                      .map((event) => (
                        <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                          <div className="h-48 bg-gradient-to-br from-sure-blue-500 to-sure-blue-600 flex items-center justify-center relative">
                            <div className="text-center text-white">
                              <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2" />
                              <div className="text-sm font-medium">{event.type}</div>
                            </div>
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                              <div className="text-white text-sm font-medium">{event.attendees}</div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <CalendarDaysIcon className="h-4 w-4 mr-1" />
                              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}</span>
                              {event.endDate && (
                                <>
                                  <span className="mx-2">-</span>
                                  <span>{new Date(event.endDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}</span>
                                </>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              {event.name}
                            </h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {event.description}
                            </p>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{event.venue}, {event.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{event.booth}</span>
                              </div>
                            </div>
                            <div className="bg-sure-blue-50 rounded-lg p-3">
                              <div className="text-sure-blue-800 font-semibold text-sm">
                                Visit us at {event.booth}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-sure-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release) => (
              <div key={release.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sure-blue-100 text-sure-blue-800">
                        {release.category}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        {new Date(release.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {release.title}
                    </h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {release.excerpt}
                    </p>
                  </div>
                  <a href={release.link} className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors ml-4 flex-shrink-0">
                    Read Full Release →
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center space-x-2">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200">
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            <div className="flex space-x-1">
              <button className="px-3 py-2 text-sm font-medium text-white bg-sure-blue-500 border border-sure-blue-500 rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                2
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                3
              </button>
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                12
              </button>
            </div>
            
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200">
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}