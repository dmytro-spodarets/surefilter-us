import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function WarrantyPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Warranty Information
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sure Filter® stands behind the quality of our products with comprehensive warranty coverage. 
              Learn about our warranty terms, registration process, and how to make a claim.
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Warranty Commitment
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every Sure Filter® product is backed by our comprehensive warranty program. We're confident 
                in the quality and durability of our filters, and we stand behind them with industry-leading 
                warranty coverage.
              </p>
              <div className="bg-sure-blue-50 border-l-4 border-sure-blue-500 p-6 rounded-r-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Quality Guarantee
                </h3>
                <p className="text-gray-600">
                  If any Sure Filter® product fails due to defects in materials or workmanship during 
                  the warranty period, we will replace it at no cost to you.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Warranty Coverage
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Automotive Filters</h4>
                  <p className="text-gray-600">3-year limited warranty</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Heavy Duty Filters</h4>
                  <p className="text-gray-600">2-year limited warranty</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Industrial Filters</h4>
                  <p className="text-gray-600">1-year limited warranty</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Specialty Filters</h4>
                  <p className="text-gray-600">Varies by product type</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Terms Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Warranty Terms & Conditions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Covered</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Defects in materials and workmanship
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Manufacturing defects
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Structural integrity issues
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Premature failure under normal use
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Not Covered</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Damage from improper installation
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Normal wear and tear
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Damage from accidents or misuse
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-sure-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  Failure due to contaminated fluids
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Registration Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Register Your Warranty
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Register your Sure Filter® product to activate your warranty coverage and receive 
              important product updates and notifications.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
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
                <label htmlFor="productNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Number
                </label>
                <input
                  type="text"
                  id="productNumber"
                  name="productNumber"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                  placeholder="Enter product number from packaging"
                />
              </div>
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sure-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sure-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-sure-blue-600 transition-colors duration-200"
              >
                Register Warranty
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 