import { ManagedImage } from '@/components/ui/ManagedImage';
import { CheckBadgeIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface TestingProcedure {
  name?: string;
  description?: string;
}

interface QualityAssuranceProps {
  title?: string;
  subtitle?: string;
  manufacturingImage?: string;
  manufacturingText1?: string;
  manufacturingText2?: string;
  certificationTitle?: string;
  certificationText?: string;
  testingTitle?: string;
  testingSubtitle?: string;
  testingProcedures?: TestingProcedure[];
  promiseText?: string;
  promiseTagline?: string;
}

export default function QualityAssurance({
  title,
  subtitle,
  manufacturingImage,
  manufacturingText1,
  manufacturingText2,
  certificationTitle,
  certificationText,
  testingTitle,
  testingSubtitle,
  testingProcedures = [],
  promiseText,
  promiseTagline,
}: QualityAssuranceProps) {
  if (!title) return null;
  return (
    <section className="py-16 bg-white">
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

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left side - Manufacturing */}
          <div>
            {manufacturingImage && (
              <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
                <ManagedImage
                  src={manufacturingImage}
                  alt="Manufacturing facility"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">
              {manufacturingText1 && (
                <p className="text-gray-600">
                  {manufacturingText1}
                </p>
              )}
              
              {manufacturingText2 && (
                <p className="text-gray-600">
                  {manufacturingText2}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Certifications */}
          <div>
            {certificationTitle && (
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {certificationTitle}
              </h3>
            )}
            
            {certificationText && (
              <div className="prose prose-lg max-w-none mb-6">
                <p className="text-gray-600">
                  {certificationText}
                </p>
              </div>
            )}
            
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
        {testingProcedures.length > 0 && (
          <div>
            {testingTitle && (
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {testingTitle}
              </h3>
            )}
            
            {testingSubtitle && (
              <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                {testingSubtitle}
              </p>
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              {testingProcedures.map((test, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="bg-sure-blue-100 p-2 rounded-lg mr-4 flex-shrink-0">
                      <BeakerIcon className="h-5 w-5 text-sure-blue-600" />
                    </div>
                    <div>
                      {test.name && <h4 className="font-semibold text-gray-900 mb-2">{test.name}</h4>}
                      {test.description && <p className="text-gray-600 text-sm">{test.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Promise */}
        {(promiseText || promiseTagline) && (
          <div className="mt-12 text-center">
            <div className="bg-sure-blue-600 text-white rounded-xl p-8 shadow-lg">
              {promiseText && (
                <p className="text-lg mb-4">
                  {promiseText}
                </p>
              )}
              {promiseTagline && (
                <div className="text-xl font-bold">
                  {promiseTagline}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
