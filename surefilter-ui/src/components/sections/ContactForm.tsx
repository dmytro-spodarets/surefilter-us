export default function ContactForm({ title, description, subjects = [] as { value: string; label: string }[], bare = false, className = '' }: { title?: string; description?: string; subjects?: { value: string; label: string }[]; bare?: boolean; className?: string }) {
  const FormInner = (
    <>
      {title ? (<h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>) : null}
      {description ? <p className="text-sm text-gray-500 mb-6">{description}</p> : null}
      <form id="contact-form" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" id="firstName" name="firstName" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" placeholder="Your first name" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" id="lastName" name="lastName" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" placeholder="Your last name" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input type="email" id="email" name="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" placeholder="your.email@example.com" />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <input type="text" id="company" name="company" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" placeholder="Your company name" />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select id="subject" name="subject" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent">
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea id="message" name="message" rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent" placeholder="Tell us how we can help you..."></textarea>
        </div>
        <button type="submit" className="w-full bg-sure-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-sure-blue-600 transition-colors duration-200">Send Message</button>
      </form>
    </>
  );

  if (bare) return <div className={`w-full ${className}`}>{FormInner}</div>;

  return (
    <section className={`pt-0 pb-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {FormInner}
          </div>
          <div />
        </div>
      </div>
    </section>
  );
}


