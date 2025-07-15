import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function HeavyDutyPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Heavy Duty Filters
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Premium filtration solutions for heavy machinery, construction equipment, and industrial applications. 
              Engineered for maximum performance and durability in the most demanding environments.
            </p>
          </div>
        </div>
      </section>

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