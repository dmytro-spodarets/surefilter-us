import Image from 'next/image';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ManagedImage } from '@/components/ui/ManagedImage';

const filterTypes = [
  'air filters', 'cabin filters', 'coolant filters', 'fuel filters', 
  'hydraulic filters', 'oil filters', 'air/oil separators', 'water separators'
];

interface LimitedWarrantyDetailsProps {
  title?: string;
  subtitle?: string;
  image?: string;
  introText?: string;
  promiseTitle?: string;
  promiseText?: string;
  warrantyTitle?: string;
  warrantyText1?: string;
  warrantyText2?: string;
}

export default function LimitedWarrantyDetails({
  title,
  subtitle,
  image,
  introText,
  promiseTitle,
  promiseText,
  warrantyTitle,
  warrantyText1,
  warrantyText2,
}: LimitedWarrantyDetailsProps) {
  if (!title) return null;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left side - Content */}
          <div>
            <div className="prose prose-lg max-w-none">
              {introText && (
                <p className="text-gray-600 mb-6">
                  {introText}
                </p>
              )}
              
              {promiseTitle && (
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {promiseTitle}
                </h3>
              )}
              
              {promiseText && (
                <p className="text-gray-600 mb-6">
                  {promiseText}
                </p>
              )}
              
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
          {image && (
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <ManagedImage
                  src={image}
                  alt="Quality assurance documentation"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          )}
        </div>

        {/* Warranty Terms */}
        {warrantyTitle && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {warrantyTitle}
            </h3>
            
            <div className="prose prose-lg max-w-none mb-6">
              {warrantyText1 && (
                <p className="text-gray-600 mb-6">
                  {warrantyText1}
                </p>
              )}
              
              {warrantyText2 && (
                <p className="text-gray-600">
                  {warrantyText2}
                </p>
              )}
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
        )}
      </div>
    </section>
  );
}
