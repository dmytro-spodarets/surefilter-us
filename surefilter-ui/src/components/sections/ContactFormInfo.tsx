import DynamicForm from '@/components/forms/DynamicForm';

export default function ContactFormInfo({ 
  formId,
  formSlug,
  formTitle = 'Send Us a Message',
  formDescription,
  generalTitle = 'General Inquiries',
  generalEmail,
  generalPhone,
  generalFax,
  supportTitle = 'Technical Support',
  supportEmail,
  supportPhone,
  supportHours,
  addressTitle = 'Office Address',
  addressName,
  addressLine1,
  addressLine2,
  addressCity,
  addressRegion,
  addressPostal,
  addressCountry,
}: any) {
  return (
    <section className="pt-0 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left: Form */}
          <div className="md:col-span-2">
            {/* Form Title & Description */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{formTitle}</h2>
              {formDescription && (
                <p className="text-sm text-gray-600">{formDescription}</p>
              )}
            </div>

            {(formId || formSlug) ? (
              <DynamicForm 
                formId={formId}
                formSlug={formSlug}
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No form selected. Please configure a form in the admin panel.</p>
              </div>
            )}
          </div>
          
          {/* Right: Contact Info (3 blocks) */}
          <div className="md:col-span-1 space-y-8">
            {/* Block 1: General Inquiries */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{generalTitle}</h3>
              <div className="space-y-3">
                {generalEmail && (
                  <p className="flex items-center text-gray-600">
                    <span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Email: {generalEmail}</span>
                  </p>
                )}
                {generalPhone && (
                  <p className="flex items-center text-gray-600">
                    <span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Phone: {generalPhone}</span>
                  </p>
                )}
                {generalFax && (
                  <p className="flex items-center text-gray-600">
                    <span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Fax: {generalFax}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Block 2: Technical Support */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{supportTitle}</h3>
              <div className="space-y-3">
                {supportEmail && (
                  <p className="flex items-center text-gray-600">
                    <span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Email: {supportEmail}</span>
                  </p>
                )}
                {supportPhone && (
                  <p className="flex items-center text-gray-600">
                    <span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Phone: {supportPhone}</span>
                  </p>
                )}
                {supportHours && (
                  <p className="flex items-center text-gray-600">
                    <span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Hours: {supportHours}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Block 3: Office Address */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{addressTitle}</h3>
              <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-gray-600 leading-relaxed text-sm">
                  {addressName && (<>{addressName}<br /></>)}
                  {addressLine1 && (<>{addressLine1}<br /></>)}
                  {addressLine2 && (<>{addressLine2}<br /></>)}
                  {(addressCity || addressRegion || addressPostal) && (
                    <>{addressCity ? addressCity : ''}{addressRegion ? `, ${addressRegion}` : ''} {addressPostal || ''}<br /></>
                  )}
                  {addressCountry || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
