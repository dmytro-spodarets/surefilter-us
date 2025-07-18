import Image from 'next/image';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const filterTypes = [
  'air filters', 'cabin filters', 'coolant filters', 'fuel filters', 
  'hydraulic filters', 'oil filters', 'air/oil separators', 'water separators'
];

export default function LimitedWarrantyDetails() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Limited Warranty Details
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            To achieve optimum performance, machines must be maintained well, which is why Sure Filter® brand offers consumers the best available aftermarket filters and separators.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Content */}
          <div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                We understand that every vehicle (from cars to mining apparatuses, construction equipment to marine gear) requires protection against contaminants, and we strive to provide that protection through state-of-the-art engineering and rigorous testing.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Our Promise
              </h3>
              
              <p className="text-gray-600 mb-6">
                Sure Filter® guarantees that our products will be free from defects. Each carefully manufactured filter will enhance efficiency and ensure optimum performance for every vehicle.
              </p>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Products Covered</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filterTypes.map((filter, index) => (
                    <div key={index} className="flex items-center p-2">
                      <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 capitalize">{filter}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop&crop=center"
                alt="Quality assurance documentation"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Warranty Terms */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Limited Warranty
          </h3>
          
          <div className="prose prose-lg max-w-none mb-6">
            <p className="text-gray-600 mb-6">
              Should a Sure Filter® product suffer from a provable defect or production flaw, we will replace that product, as well as repair any damage it may have caused. Please follow the Warranty Claim Procedure to ensure proper care.
            </p>
            
            <p className="text-gray-600">
              Note that this warranty does not extend to products that were damaged by external factors (such as improper installation, improper application, usage past an expiration date, or a failure to adhere to maintenance requirements). All complaints are subject to in-house investigations to determine their validities.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-sure-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sure-blue-700 transition-colors duration-200">
              Download Warranty Certificate
            </button>
            <button className="border border-sure-blue-600 text-sure-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-sure-blue-50 transition-colors duration-200">
              Download Claim Form
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
