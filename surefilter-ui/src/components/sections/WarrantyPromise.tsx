import { ManagedImage } from '@/components/ui/ManagedImage';
import { ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const filterTypes = [
  { name: 'Air Filters', warranty: '3 years', icon: '🌬️' },
  { name: 'Oil Filters', warranty: '3 years', icon: '🛢️' },
  { name: 'Fuel Filters', warranty: '3 years', icon: '⛽' },
  { name: 'Cabin Air Filters', warranty: '2 years', icon: '🏠' },
  { name: 'Hydraulic Filters', warranty: '2 years', icon: '⚙️' },
  { name: 'Coolant Filters', warranty: '2 years', icon: '❄️' },
  { name: 'Air/Oil Separators', warranty: '2 years', icon: '🔧' },
  { name: 'Water Separators', warranty: '2 years', icon: '💧' },
];

export default function WarrantyPromise() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-sure-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">
                Our Promise
              </h2>
            </div>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Sure Filter® guarantees that our products will be free from defects. Each carefully 
              manufactured filter will enhance efficiency and ensure optimum performance for every vehicle.
            </p>
            
            <div className="bg-sure-blue-50 border-l-4 border-sure-blue-600 p-6 rounded-r-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Guarantee
              </h3>
              <p className="text-gray-700">
                <strong>To be sure - use SURE®.</strong> We stand behind every filter with comprehensive 
                warranty coverage and immediate replacement for any manufacturing defects.
              </p>
            </div>
            
            {/* Filter Types Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filterTypes.map((filter, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl mr-3">{filter.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{filter.name}</h4>
                    <p className="text-sure-blue-600 text-sm font-medium">{filter.warranty} warranty</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <ManagedImage
                src="https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=600&h=400&fit=crop&crop=center"
                alt="Quality control and testing laboratory"
                width={600}
                height={400}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Floating quality badge */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center mb-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-semibold text-gray-900">Quality Tested</span>
                </div>
                <p className="text-sm text-gray-600">Every filter undergoes rigorous testing</p>
              </div>
              
              {/* Warranty stats */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sure-blue-600">96M+</div>
                  <div className="text-sm text-gray-600">Filters per year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
