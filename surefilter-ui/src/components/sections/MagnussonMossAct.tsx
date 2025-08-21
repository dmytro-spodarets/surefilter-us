import Image from 'next/image';
import { ScaleIcon, ShieldCheckIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const protections = [
  {
    icon: ShieldCheckIcon,
    title: 'Warranty Protection',
    description: 'Aftermarket parts cannot automatically void your warranty'
  },
  {
    icon: DocumentTextIcon,
    title: 'Fair Terms',
    description: 'All warranty terms must be clear and understandable'
  },
  {
    icon: CheckCircleIcon,
    title: 'Your Choice',
    description: 'Right to choose quality aftermarket filters and parts'
  }
];

export default function MagnussonMossAct() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-sure-blue-100 rounded-full px-4 py-2 mb-4">
            <ScaleIcon className="h-5 w-5 text-sure-blue-600 mr-2" />
            <span className="text-sure-blue-600 font-semibold text-sm">Federal Law Since 1975</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Magnuson-Moss Warranty Act
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Federal protection ensuring your right to choose quality aftermarket parts 
            without voiding your warranty.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left side - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop&crop=center"
                alt="Legal documents and justice scale"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>

          {/* Right side - Content */}
          <div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                When dealers claim that using aftermarket parts will void your warranty, 
                they may not be telling the whole truth. The Magnuson-Moss Warranty Act 
                provides important consumer protections.
              </p>
              
              <div className="bg-sure-blue-50 border-l-4 border-sure-blue-600 p-6 rounded-r-lg mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">What the Law Says</h4>
                <p className="text-gray-700 text-sm italic mb-3">
                  &quot;No warrantor may condition warranty coverage on the consumer&#39;s using any article or service identified by brand, trade, or corporate name.&quot;
                </p>
                <p className="text-xs text-gray-500">
                  US Code - Title 15, Chapter 50, Section 2302
                </p>
              </div>
              
              <p className="text-gray-600">
                Simply put: <strong>Sure Filter®</strong> aftermarket products will not automatically 
                void warranties, thanks to this federal protection.
              </p>
            </div>
          </div>
        </div>

        {/* Protection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {protections.map((protection, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-sure-blue-100 p-3 rounded-lg mr-4">
                  <protection.icon className="h-6 w-6 text-sure-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{protection.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{protection.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Your Rights Are Protected
            </h3>
            <p className="text-gray-600 mb-6">
              The Filter Manufacturer&#39;s Council Technical Service Bulletin (TSB-85-1R2) confirms 
              that manufacturers cannot require specific filter brands unless provided free of charge.
            </p>
            <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">The Law is on Your Side</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
