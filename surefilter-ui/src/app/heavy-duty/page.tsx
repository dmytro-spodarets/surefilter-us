import Header from '@/components/layout/Header';
import SearchHero from '@/components/sections/SearchHero';
import Footer from '@/components/layout/Footer';

export default function HeavyDutyPage() {
  return (
    <main>
      <Header />
      
      <SearchHero 
        title="Heavy Duty Filters"
        description="Engineered for extreme conditions and heavy machinery. Superior filtration solutions for construction, mining, agriculture, and industrial equipment."
        backgroundImage="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Professional Grade Filtration
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our heavy duty filters are designed to withstand extreme conditions while providing superior 
                filtration performance. From construction sites to mining operations, our filters deliver 
                reliable protection for your valuable equipment.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  High-capacity filtration systems
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Extended service intervals
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Corrosion-resistant materials
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Temperature and pressure rated
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Applications
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Construction Equipment</h4>
                  <p className="text-gray-600">Excavators, bulldozers, cranes, and loaders</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Mining Machinery</h4>
                  <p className="text-gray-600">Drills, haul trucks, and processing equipment</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Agricultural Equipment</h4>
                  <p className="text-gray-600">Tractors, combines, and irrigation systems</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Marine Applications</h4>
                  <p className="text-gray-600">Ship engines and offshore equipment</p>
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