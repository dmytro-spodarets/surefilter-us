import { ScaleIcon, ShieldCheckIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { sanitize } from '@/lib/sanitize';

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

        <div className="max-w-4xl mx-auto mb-12">
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
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: sanitize(bottomText) }} />
              )}
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
                <p className="text-gray-600">
                  {ctaText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
