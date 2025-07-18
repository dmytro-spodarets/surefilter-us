import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactUsPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] max-h-[700px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Левая часть - контент */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6">
                Contact Us
              </h1>
              <p className="text-base lg:text-xl text-gray-600 leading-relaxed">
                Get in touch with our team for technical support, product inquiries, or partnership opportunities. We're here to help you find the right filtration solution.
              </p>
            </div>
            
            {/* Правая часть - картинка */}
            <div className="relative w-full flex justify-center lg:justify-end">
              <div className="aspect-[4/3] w-full max-w-lg lg:max-w-xl rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixid=M3w2NzEyNTB8MHwxfHNlYXJjaHwxfHxRMXA3YmgzU0hqOHxlbnwwfHx8fDE3MzUxNzgyMjl8MA&ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Outer space view showing global connectivity and limitless reach"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="general">General Question</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-sure-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-sure-blue-600 transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">General Inquiries</h3>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                      Email: info@surefilter.com
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                      Phone: +1 (555) 123-4567
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 bg-sure-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                      Fax: +1 (555) 123-4568
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Support</h3>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>
                      Email: support@surefilter.com
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>
                      Phone: +1 (555) 123-4569
                    </p>
                    <p className="flex items-center text-gray-600">
                      <span className="w-5 h-5 bg-sure-red-500 rounded-full mr-3 flex-shrink-0"></span>
                      Hours: Mon-Fri 8AM-6PM EST
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Office Address</h3>
                  <div className="bg-gray-100 rounded-lg p-6">
                    <p className="text-gray-600 leading-relaxed">
                      Sure Filter® Headquarters<br />
                      123 Industrial Drive<br />
                      Manufacturing District<br />
                      City, State 12345<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 