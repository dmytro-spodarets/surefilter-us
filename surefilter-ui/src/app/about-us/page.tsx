"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/sections/PageHero';
import Icon from '@/components/ui/Icon';
import { useState } from 'react';

export default function AboutUsPage() {
  const [activeSection, setActiveSection] = useState('about-us');
  const [currentAward, setCurrentAward] = useState(0);

  const manufacturingFacilities = [
    {
      id: 1,
      title: "Manufacturing Facilities",
      description: "State-of-the-art production facilities equipped with advanced machinery and automated systems for consistent quality and efficiency. Our facilities span over 150,000 square feet with ISO 9001:2015 certified production lines.",
      icon: "BuildingOffice2Icon",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80"
    },
    {
      id: 2,
      title: "Locations",
      description: "Strategic global presence with manufacturing and distribution centers across multiple continents to serve customers worldwide. Production facilities in North America, Europe, and Asia with 24/7 customer support.",
      icon: "GlobeAltIcon",
      image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=600&fit=crop&q=80"
    },
    {
      id: 3,
      title: "Product Types",
      description: "Comprehensive range of filtration solutions including air, fuel, oil, hydraulic, and specialized filters for various applications. Over 15,000 different filter types covering automotive, heavy duty, and industrial applications.",
      icon: "CogIcon",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80"
    },
    {
      id: 4,
      title: "Quality Guarantee",
      description: "Rigorous quality control processes and testing procedures ensure every product meets or exceeds industry standards. 100% quality testing with comprehensive warranty coverage and performance guarantee.",
      icon: "ShieldCheckIcon",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&q=80"
    }
  ];

  const companyContent = {
    'about-us': {
      title: "About Us",
      content: `On the highway of life, there are many unwelcome passengers - dust and dirt, pollen and pollutants. These nasty little travelers latch themselves to every passing vehicle, hiding in the intake systems, burrowing deep within the mechanicals. They see the world from the inside of an engine and wreak havoc with every passing mile.

Sure Filter® can provide the protection needed to keep your engines running clean and efficient.`,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=400&fit=crop&q=80"
    },
    'our-mission': {
      title: "Our Mission",
      content: `All machines - from cars to construction equipment - need protection. Every moment exposes them to countless pollutants, each attacking their efficiency and power. Combustion chambers infiltrated; piston seals wear thin; and hydraulic pressure weakens. It's a constant battle against the open road.

Sure Filter® helps you win that battle. Our mission is to provide you with exceptional filtration products to ensure world-class performance. Sure Filter® brand delivers a complete range of automotive and heavy-duty filters, each engineered to withstand the rigors of environment every day.`,
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop&q=80"
    },
    'our-products': {
      title: "Our Products",
      content: `High performance results demand high performance products. Sure Filter® brand providing you with air filters, cabin filters, oil filters, fuel filters, hydraulic filters, coolant filters, water separators, and air/oil separators. We offer commercial, industrial, automotive and marine applications to give you a one-stop shop for all of your filtration needs.

All Sure Filter® products tested in accordance with industry standards to meet and exceed engine manufacturer's requirements.`,
      image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&h=400&fit=crop&q=80"
    },
    'our-quality': {
      title: "Our Quality",
      content: `Sure Filter® believes in more than an ever-expanding inventory. We also believe in quality - which is why our products are shaped by the best materials and design standards. We blend steel tension designs with double spiral tubing, in-bond seaming with long-lasting filtration media. These elements promote superior strength and structural integrity.`,
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=400&fit=crop&q=80"
    },
    'our-promise': {
      title: "Our Promise",
      content: `Engines - despite their imposing collections of wires and gears - are fragile, and a single speck of dust can undo the delicate balance. Sure Filter® protect that balance and deliver you a new level of confidence.

To be sure - use SURE®`,
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=400&fit=crop&q=80"
    }
  };

  const awards = [
    {
      id: 1,
      title: "Primaniyarta Award",
      subtitle: "Outstanding Global Brand Development",
      year: "2009, 2011, 2012, 2013",
      image: "https://images.unsplash.com/photo-1606159068539-43f36b99d1b5?w=800&h=400&fit=crop&q=80",
      description: "Multiple awards recognizing outstanding global brand development and international market expansion achievements."
    },
    {
      id: 2,
      title: "Business Week Magazine",
      subtitle: "Most Admired Company in Indonesia",
      year: "2011-2012",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&q=80",
      description: "Recognized as one of the most admired companies in Indonesia for outstanding business practices and innovation."
    }
  ];

  const prevAward = () => {
    setCurrentAward((prev) => (prev - 1 + awards.length) % awards.length);
  };

  const nextAward = () => {
    setCurrentAward((prev) => (prev + 1) % awards.length);
  };

  const goToAward = (index: number) => {
    setCurrentAward(index);
  };

  return (
    <main>
      <Header />
      
      <PageHero
        title="About Sure Filter®"
        description="Leading manufacturer of premium filtration solutions for automotive, heavy duty, and industrial applications. Committed to innovation, quality, and customer satisfaction since our founding."
      />

      {/* Manufacturing Facilities Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Manufacturing Facilities
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              World-class manufacturing capabilities with global reach and uncompromising quality standards
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {manufacturingFacilities.map((facility) => (
              <div key={facility.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                {/* Full-width Image at Top */}
                <div className="h-48 overflow-hidden">
                  <img 
                    src={facility.image} 
                    alt={facility.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content Section */}
                <div className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-sure-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name={facility.icon} className="w-6 h-6 text-sure-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {facility.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {facility.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Company Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Company
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our story, mission, and commitment to excellence in filtration solutions
            </p>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <nav className="space-y-3">
                {Object.entries(companyContent).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full text-left px-6 py-4 rounded-lg font-medium transition-all duration-300 relative overflow-hidden group ${
                      activeSection === key
                        ? 'bg-sure-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    style={{
                      backgroundImage: activeSection !== key ? `url(${section.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {activeSection !== key && (
                      <div className="absolute inset-0 bg-white bg-opacity-85 group-hover:bg-opacity-75 transition-all duration-300"></div>
                    )}
                    <span className="relative z-10">
                      {section.title}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  {companyContent[activeSection].title}
                </h3>
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {companyContent[activeSection].content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 sm:py-24 bg-sure-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our Numbers Tell the Story
            </h2>
            <p className="text-lg text-sure-blue-100 max-w-3xl mx-auto">
              Decades of experience, global reach, and unwavering commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <Icon name="CalendarIcon" className="w-12 h-12 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">40+</div>
                <div className="text-sure-blue-100 font-medium text-lg">Years of Experience</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <Icon name="GlobeAltIcon" className="w-12 h-12 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-sure-blue-100 font-medium text-lg">Countries Served</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <Icon name="CogIcon" className="w-12 h-12 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">15,000+</div>
                <div className="text-sure-blue-100 font-medium text-lg">Filter Types</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 flex items-center justify-center">
                  <Icon name="ShieldCheckIcon" className="w-12 h-12 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">ISO</div>
                <div className="text-sure-blue-100 font-medium text-lg">9001:2015 Certified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Awards
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Celebrating our achievements and commitment to excellence in the filtration industry
            </p>
          </div>
          
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentAward * 100}%)` }}
              >
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl mx-auto">
                      {/* Award Image */}
                      <div className="relative h-80 overflow-hidden">
                        <img 
                          src={award.image} 
                          alt={award.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient background if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.style.background = 'linear-gradient(135deg, #1e40af 0%, #dc2626 100%)';
                          }}
                        />
                        {/* Overlay for better text readability */}
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                        
                        {/* Award Badge */}
                        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1">
                          <div className="flex items-center space-x-2">
                            <Icon name="TrophyIcon" className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-900">{award.year}</span>
                          </div>
                        </div>
                        
                        {/* Award Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{award.title}</h3>
                          <p className="text-lg text-white opacity-90">{award.subtitle}</p>
                        </div>
                      </div>
                      
                      {/* Award Content */}
                      <div className="p-6">
                        <p className="text-gray-600 text-center leading-relaxed text-lg">
                          {award.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
              onClick={prevAward}
            >
              <Icon name="ChevronLeftIcon" className="w-6 h-6 text-gray-600" />
            </button>

            <button
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
              onClick={nextAward}
            >
              <Icon name="ChevronRightIcon" className="w-6 h-6 text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {awards.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentAward 
                      ? 'bg-sure-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => goToAward(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}