'use client';

import { CalendarDaysIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Link from 'next/link';

interface Category {
  name: string;
  color: string | null;
  icon: string | null;
}

interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  eventStartDate: string | null;
  eventEndDate: string | null;
  eventUrl: string | null;
  venue: string | null;
  location: string | null;
  booth: string | null;
  attendees: string | null;
  eventType: string | null;
  category: Category | null;
}

interface NewsroomClientProps {
  initialEvents: NewsArticle[];
  initialNews: NewsArticle[];
}

export default function NewsroomClient({ initialEvents, initialNews }: NewsroomClientProps) {
  const [upcomingEvents] = useState<NewsArticle[]>(initialEvents);
  const [pressReleases] = useState<NewsArticle[]>(initialNews);
  const [currentSlide, setCurrentSlide] = useState(0);

  const eventsPerSlide = 2; // 2 события на слайд (оригинальный дизайн)
  const totalSlides = Math.ceil(upcomingEvents.length / eventsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <>
      {/* Upcoming Events Section with Carousel */}
      {upcomingEvents.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events & Exhibitions</h2>
              {totalSlides > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentSlide + 1} / {totalSlides}
                  </span>
                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Events Carousel */}
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid md:grid-cols-2 gap-8 py-2">
                      {upcomingEvents
                        .slice(slideIndex * eventsPerSlide, (slideIndex + 1) * eventsPerSlide)
                        .map((event) => {
                          const EventCard = (
                            <>
                              <div className="h-48 bg-gradient-to-br from-sure-blue-500 to-sure-blue-600 flex items-center justify-center relative">
                                <div className="text-center text-white">
                                  <CalendarDaysIcon className="h-12 w-12 mx-auto mb-2" />
                                  <div className="text-sm font-medium">{event.eventType || 'Event'}</div>
                                </div>
                                {event.attendees && (
                                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                                    <div className="text-white text-sm font-medium">{event.attendees}</div>
                                  </div>
                                )}
                              </div>
                              <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                  <span>
                                    {event.eventStartDate && new Date(event.eventStartDate).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}
                                  </span>
                                  {event.eventEndDate && (
                                    <>
                                      <span className="mx-2">-</span>
                                      <span>
                                        {new Date(event.eventEndDate).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                  {event.title}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                  {event.excerpt}
                                </p>
                                <div className="space-y-2 mb-4">
                                  {(event.venue || event.location) && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{[event.venue, event.location].filter(Boolean).join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                                {event.booth && (
                                  <div className="bg-sure-blue-500 rounded-lg p-3">
                                    <div className="text-white font-semibold text-sm">
                                      Visit us at {event.booth}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          );

                          // Если есть eventUrl, оборачиваем в ссылку
                          if (event.eventUrl) {
                            return (
                              <a
                                key={event.id}
                                href={event.eventUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                              >
                                {EventCard}
                              </a>
                            );
                          }

                          // Если нет eventUrl, просто div
                          return (
                            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                              {EventCard}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            {totalSlides > 1 && (
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
            )}
          </div>
        </section>
      )}

      {/* Latest News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest News</h2>
          {pressReleases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No news available at this time.</p>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {pressReleases.map((release) => (
                <Link 
                  key={release.id} 
                  href={`/newsroom/${release.slug}`}
                  className="group block bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        {release.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sure-blue-100 text-sure-blue-800">
                            {release.category.name}
                          </span>
                        )}
                        <span className="ml-3 text-sm text-gray-500">
                          {new Date(release.publishedAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sure-blue-600 transition-colors">
                        {release.title}
                      </h3>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {release.excerpt}
                      </p>
                    </div>
                    <div className="text-sure-blue-500 font-semibold group-hover:text-sure-blue-600 transition-colors ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Read More →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Pagination - будет работать позже */}
          {pressReleases.length > 0 && (
            <div className="mt-12 flex items-center justify-center space-x-2">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200">
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <div className="flex space-x-1">
                <button className="px-3 py-2 text-sm font-medium text-white bg-sure-blue-500 border border-sure-blue-500 rounded-lg">
                  1
                </button>
              </div>
              
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200">
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
