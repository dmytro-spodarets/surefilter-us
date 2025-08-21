import Header from '@/components/layout/Header';
import SearchHero from '@/components/sections/SearchHero';
import Footer from '@/components/layout/Footer';

export default function AutomotivePage() {
  return (
    <main>
      <Header />
      
      <SearchHero 
        title="Automotive Filters"
        description="High-performance filtration solutions for passenger vehicles, commercial trucks, and specialty automotive applications."
        backgroundImage="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Engine Protection & Performance
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our automotive filters are engineered to meet or exceed OEM specifications, providing 
                superior protection for your vehicle&#39;s critical systems. From air and oil filters to 
                fuel and cabin air filters, we&#39;ve got you covered.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  OE-quality filtration media
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Extended service life
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Improved fuel efficiency
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Enhanced engine performance
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Filter Types
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Air Filters</h4>
                  <p className="text-gray-600">Engine air intake and cabin air filtration</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Oil Filters</h4>
                  <p className="text-gray-600">Engine oil and transmission fluid filtration</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Fuel Filters</h4>
                  <p className="text-gray-600">Gasoline and diesel fuel system protection</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Hydraulic Filters</h4>
                  <p className="text-gray-600">Power steering and brake system filtration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 