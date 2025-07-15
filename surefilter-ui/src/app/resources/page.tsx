import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ResourcesPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Resources
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Access technical documentation, installation guides, product catalogs, and educational 
              materials to help you get the most from your Sure Filter® products.
            </p>
          </div>
        </div>
      </section>

      {/* Resources Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Catalogs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-sure-blue-500 to-sure-blue-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">CATALOGS</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Product Catalogs</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive product catalogs with specifications, applications, and technical data.
                </p>
                <div className="space-y-2">
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Automotive Catalog 2024 →
                  </a>
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Heavy Duty Catalog 2024 →
                  </a>
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Industrial Solutions →
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Documentation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-sure-red-500 to-sure-red-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">TECH</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Technical Documentation</h3>
                <p className="text-gray-600 mb-4">
                  Detailed technical specifications, installation guides, and maintenance procedures.
                </p>
                <div className="space-y-2">
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Installation Guides →
                  </a>
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Technical Specifications →
                  </a>
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Maintenance Procedures →
                  </a>
                </div>
              </div>
            </div>

            {/* Educational Materials */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">EDU</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Educational Materials</h3>
                <p className="text-gray-600 mb-4">
                  Educational content, whitepapers, and industry insights to expand your knowledge.
                </p>
                <div className="space-y-2">
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Filtration Basics →
                  </a>
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Industry Whitepapers →
                  </a>
                  <a href="#" className="block text-sure-blue-500 hover:text-sure-blue-600 font-medium">
                    Best Practices →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Center Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Download Center</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-sure-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-sure-blue-500 text-2xl font-bold">PDF</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Product Brochures</h3>
                <p className="text-sm text-gray-600 mb-4">Detailed product information and specifications</p>
                <a href="#" className="text-sure-blue-500 font-medium hover:text-sure-blue-600">
                  Download All →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-sure-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-sure-red-500 text-2xl font-bold">DOC</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Installation Manuals</h3>
                <p className="text-sm text-gray-600 mb-4">Step-by-step installation instructions</p>
                <a href="#" className="text-sure-blue-500 font-medium hover:text-sure-blue-600">
                  Download All →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-2xl font-bold">VID</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Video Guides</h3>
                <p className="text-sm text-gray-600 mb-4">Visual installation and maintenance guides</p>
                <a href="#" className="text-sure-blue-500 font-medium hover:text-sure-blue-600">
                  Watch All →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-500 text-2xl font-bold">APP</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Apps</h3>
                <p className="text-sm text-gray-600 mb-4">Product lookup and technical support apps</p>
                <a href="#" className="text-sure-blue-500 font-medium hover:text-sure-blue-600">
                  Download Apps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Resources Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Technical Support Resources
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our technical support team is here to help you with product selection, installation, 
                troubleshooting, and maintenance questions. Access our comprehensive support resources.
              </p>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-sure-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Product Selection Guide</h3>
                    <p className="text-gray-600">Find the right filter for your application</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-sure-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Troubleshooting Guide</h3>
                    <p className="text-gray-600">Common issues and solutions</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-sure-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Contact Technical Support</h3>
                    <p className="text-gray-600">Get expert help when you need it</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Quick Access
              </h3>
              <div className="space-y-4">
                <a href="#" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-1">Cross Reference Guide</h4>
                  <p className="text-gray-600">Find Sure Filter® equivalents for other brands</p>
                </a>
                <a href="#" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-1">Size Charts</h4>
                  <p className="text-gray-600">Filter dimensions and specifications</p>
                </a>
                <a href="#" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-1">Performance Data</h4>
                  <p className="text-gray-600">Efficiency ratings and test results</p>
                </a>
                <a href="#" className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-1">Certifications</h4>
                  <p className="text-gray-600">Industry certifications and approvals</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 