interface LimitedWarrantyDetailsProps {
  warrantyTitle?: string;
  warrantyText1?: string;
  warrantyText2?: string;
  buttonsTitle?: string;
  buttonsDescription?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export default function LimitedWarrantyDetails({
  warrantyTitle,
  warrantyText1,
  warrantyText2,
  buttonsTitle,
  buttonsDescription,
  primaryButtonText,
  primaryButtonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
}: LimitedWarrantyDetailsProps) {
  if (!warrantyTitle) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {warrantyTitle}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">
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

          {(buttonsTitle || buttonsDescription) && (
            <div className="text-center mb-8">
              {buttonsTitle && (
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {buttonsTitle}
                </h3>
              )}
              {buttonsDescription && (
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {buttonsDescription}
                </p>
              )}
            </div>
          )}

          {(primaryButtonUrl || secondaryButtonUrl) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryButtonUrl && (
                <a href={primaryButtonUrl} target="_blank" rel="noopener noreferrer" className="bg-sure-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sure-blue-700 transition-colors duration-200 text-center">
                  {primaryButtonText || 'Download Warranty Certificate'}
                </a>
              )}
              {secondaryButtonUrl && (
                <a href={secondaryButtonUrl} target="_blank" rel="noopener noreferrer" className="border border-sure-blue-600 text-sure-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-sure-blue-50 transition-colors duration-200 text-center">
                  {secondaryButtonText || 'Download Claim Form'}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
