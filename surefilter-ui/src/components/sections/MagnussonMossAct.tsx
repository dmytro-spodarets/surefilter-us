import Image from 'next/image';
import { ScaleIcon, ShieldCheckIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ManagedImage } from '@/components/ui/ManagedImage';

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

interface MagnussonMossActProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  mainText?: string;
  lawQuote?: string;
  lawReference?: string;
  bottomText?: string;
  ctaTitle?: string;
  ctaText?: string;
}

export default function MagnussonMossAct({
  badge,
  title,
  subtitle,
  image,
  mainText,
  lawQuote,
  lawReference,
  bottomText,
  ctaTitle,
  ctaText,
}: MagnussonMossActProps) {
  if (!title) return null;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          {badge && (
            <div className="inline-flex items-center bg-sure-blue-100 rounded-full px-4 py-2 mb-4">
              <ScaleIcon className="h-5 w-5 text-sure-blue-600 mr-2" />
              <span className="text-sure-blue-600 font-semibold text-sm">{badge}</span>
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left side - Image */}
          {image && (
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <ManagedImage
                  src={image}
                  alt="Legal documents and justice scale"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          )}

          {/* Right side - Content */}
          <div>
            <div className="prose prose-lg max-w-none">
              {mainText && (
                <p className="text-gray-600 mb-6">
                  {mainText}
                </p>
              )}
              
              {lawQuote && (
                <div className="bg-sure-blue-50 border-l-4 border-sure-blue-600 p-6 rounded-r-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">What the Law Says</h4>
                  <p className="text-gray-700 text-sm italic mb-3">
                    &quot;{lawQuote}&quot;
                  </p>
                  {lawReference && (
                    <p className="text-xs text-gray-500">
                      {lawReference}
                    </p>
                  )}
                </div>
              )}
              
              {bottomText && (
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: bottomText }} />
              )}
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
        {ctaTitle && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {ctaTitle}
              </h3>
              {ctaText && (
                <p className="text-gray-600 mb-6">
                  {ctaText}
                </p>
              )}
              <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">The Law is on Your Side</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
