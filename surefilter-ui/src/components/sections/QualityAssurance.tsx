import Image from 'next/image';
import { CheckBadgeIcon, BeakerIcon } from '@heroicons/react/24/outline';

const testingProcedures = [
  {
    name: 'Triple Loop MultiPass Test',
    description: 'Micron-sized liquid particles are filtered through all products. This is to identify any leakage or drain-back issues.'
  },
  {
    name: 'Air Filter Tester Stand',
    description: 'Air filters are subjected to efficiency tests, including: terminal pressure resistance, airflow resistance, and pressure drop resistance.'
  },
  {
    name: 'Vibration Test',
    description: 'Testing filter resilience under various vibration conditions to ensure structural integrity.'
  },
  {
    name: 'Cold and Hot Chambers Tests',
    description: 'To test the resilience of each product in different weather conditions, we use chambers with temperatures reaching up to +130°C and plummeting to -60°C.'
  },
  {
    name: 'Impulse Test',
    description: 'Seal performance is key with all filters and separators. Uses fluctuating cycles to see how each seal responds to motor activity.'
  },
  {
    name: 'Salt Spray Test',
    description: 'Corrosion testing. Allows us to see how each product performs when exposed to high-levels of salt (up to 72 hours for spin-on applications).'
  },
  {
    name: 'Burst Strength Test',
    description: 'Each product faces pressure resistance testing during the seaming phase of production to control seal and gasket integrity.'
  },
  {
    name: 'Burst Strength Test',
    description: 'Each product faces pressure resistance testing during the seaming phase of production to control seal and gasket integrity.'
  },
];

export default function QualityAssurance() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quality Assurance Excellence
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our commitment to quality is backed by world-class manufacturing, rigorous testing, 
            and partnerships with leading global brands.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left side - Manufacturing */}
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
              <Image
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=300&fit=crop&crop=center"
                alt="Manufacturing facility"
                width={600}
                height={300}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600">
                Sure Filter® brand products manufactured at the world-class production facility, that makes approximately 96 million filters each year, some of them in OEM and OES partnership with leading global automotive and heavy-duty brands.
              </p>
              
              <p className="text-gray-600">
                At Sure Filter®, we are committed to continual product and process improvements, and support internationally recognized quality certifications.
              </p>
            </div>
          </div>

          {/* Right side - Certifications */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Certification
            </h3>
            
            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-gray-600">
                At Sure Filter®, we strictly adhere to internal technical product specifications, as well as the standards of ISO/TS 16949 and ISO 9001, original equipment manufacturers and SAE, JIS and DIN. Both manufacturing facility and manufacturing process for the Sure Filter® brand products are ISO certified.
              </p>
            </div>
            
            <div className="bg-sure-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <CheckBadgeIcon className="h-6 w-6 text-sure-blue-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-900">Quality Standards</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-900">ISO/TS 16949</div>
                  <div className="text-gray-600">Automotive Quality</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-900">ISO 9001</div>
                  <div className="text-gray-600">Quality Management</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-900">SAE Standards</div>
                  <div className="text-gray-600">Automotive Engineering</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-gray-900">JIS & DIN</div>
                  <div className="text-gray-600">International Standards</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Laboratory Testing */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Laboratory Testing
          </h3>
          
          <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
            Each filtration system tested to meet the efficiency, life expectancy and industry quality standards. These tests include:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {testingProcedures.map((test, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="bg-sure-blue-100 p-2 rounded-lg mr-4 flex-shrink-0">
                    <BeakerIcon className="h-5 w-5 text-sure-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{test.name}</h4>
                    <p className="text-gray-600 text-sm">{test.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Promise */}
        <div className="mt-12 text-center">
          <div className="bg-sure-blue-600 text-white rounded-xl p-8 shadow-lg">
            <p className="text-lg mb-4">
              Through these steps, we can monitor each product&#39;s performance, bringing our customers superior filtration products.
            </p>
            <div className="text-xl font-bold">
              To be sure - use SURE®!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
