export default function ContactInfo({ title, general, support, address, className = '', bare = false }: { title?: string; general?: any; support?: any; address?: any; className?: string; bare?: boolean }) {
  const Inner = (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">General Inquiries</h3>
        <div className="space-y-3">
          {general?.email ? <p className="flex items-center text-gray-600"><span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>Email: {general.email}</p> : null}
          {general?.phone ? <p className="flex items-center text-gray-600"><span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>Phone: {general.phone}</p> : null}
          {general?.fax ? <p className="flex items-center text-gray-600"><span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>Fax: {general.fax}</p> : null}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Support</h3>
        <div className="space-y-3">
          {support?.email ? <p className="flex items-center text-gray-600"><span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>Email: {support.email}</p> : null}
          {support?.phone ? <p className="flex items-center text-gray-600"><span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>Phone: {support.phone}</p> : null}
          {support?.hours ? <p className="flex items-center text-gray-600"><span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>Hours: {support.hours}</p> : null}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Office Address</h3>
        <div className="bg-gray-100 rounded-lg p-6">
          <p className="text-gray-600 leading-relaxed">
            {address?.name && (<>{address.name}<br /></>)}
            {address?.line1 && (<>{address.line1}<br /></>)}
            {address?.line2 && (<>{address.line2}<br /></>)}
            {(address?.city || address?.region || address?.postal) && (<>{address?.city ? address.city : ''}{address?.region ? `, ${address.region}` : ''} {address?.postal || ''}<br /></>)}
            {address?.country || ''}
          </p>
        </div>
      </div>
    </div>
  );

  if (bare) return Inner;

  return (
    <section className={`pt-0 pb-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div />
          <div>
            {title ? <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2> : null}
            {Inner}
          </div>
        </div>
      </div>
    </section>
  );
}


