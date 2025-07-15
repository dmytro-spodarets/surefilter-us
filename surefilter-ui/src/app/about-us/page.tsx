import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/sections/PageHero';

export default function AboutUsPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <PageHero
        title="About Sure Filter®"
        description="Leading manufacturer of premium filtration solutions for automotive, heavy duty, and industrial applications. Committed to innovation, quality, and customer satisfaction since our founding."
      />

      {/* Company Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Sure Filter® was founded with a simple mission: to provide the highest quality filtration 
                solutions that protect equipment, improve performance, and reduce operating costs. 
                Today, we serve customers worldwide with innovative products backed by exceptional service.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our commitment to research and development has made us a trusted partner for OEMs, 
                distributors, and end-users across multiple industries. We continue to invest in 
                advanced manufacturing technologies and quality control systems.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Why Choose Sure Filter®
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Quality Assurance</h4>
                  <p className="text-gray-600">Rigorous testing and quality control processes</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
                  <p className="text-gray-600">Continuous R&D and product improvement</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Global Support</h4>
                  <p className="text-gray-600">Worldwide distribution and technical support</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Sustainability</h4>
                  <p className="text-gray-600">Environmentally responsible manufacturing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">Q</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600">
                We never compromise on quality. Every product meets or exceeds industry standards.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">I</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Continuous improvement and cutting-edge technology drive our product development.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-sure-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">S</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Service</h3>
              <p className="text-gray-600">
                Exceptional customer service and technical support are our hallmarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 