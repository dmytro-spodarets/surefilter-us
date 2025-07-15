import Header from '@/components/layout/Header';
import FullScreenHero from '@/components/sections/FullScreenHero';
import Footer from '@/components/layout/Footer';

export default function IndustryPage() {
  return (
    <main>
      <Header />
      
      <FullScreenHero 
        title="Industrial Filters"
        description="Comprehensive filtration solutions for manufacturing, processing, and industrial operations. From air purification to liquid filtration, we support your production needs."
        backgroundImage="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Industrial Process Filtration
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our industrial filtration systems are designed to handle the most demanding applications 
                in manufacturing and processing environments. We provide solutions that improve product 
                quality, reduce maintenance costs, and ensure regulatory compliance.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Custom filtration solutions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  High-efficiency particulate air (HEPA) filters
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Chemical and solvent filtration
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3"></span>
                  Process optimization support
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Industrial Applications
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Manufacturing</h4>
                  <p className="text-gray-600">Clean room air filtration and process fluids</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Food & Beverage</h4>
                  <p className="text-gray-600">Sanitary filtration for food processing</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Pharmaceutical</h4>
                  <p className="text-gray-600">Sterile filtration and clean room systems</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Chemical Processing</h4>
                  <p className="text-gray-600">Corrosive and high-temperature applications</p>
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