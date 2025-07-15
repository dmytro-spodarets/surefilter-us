import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NewsroomPage() {
  return (
    <main>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Newsroom
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest news, product launches, industry insights, and company updates 
              from Sure Filter®. Discover our innovations and industry leadership.
            </p>
          </div>
        </div>
      </section>

      {/* Featured News Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Article */}
            <div className="md:col-span-2 lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-sure-blue-500 to-sure-blue-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">NEW</span>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>December 15, 2024</span>
                  <span className="mx-2">•</span>
                  <span>Press Release</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Sure Filter® Launches Revolutionary Heavy Duty Filtration System
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Our latest innovation in heavy duty filtration technology sets new industry standards 
                  for performance and durability. The new system provides 40% longer service life while 
                  maintaining superior filtration efficiency.
                </p>
                <a href="#" className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors">
                  Read More →
                </a>
              </div>
            </div>

            {/* Regular Articles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-sure-red-500 to-sure-red-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">TECH</span>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>December 10, 2024</span>
                  <span className="mx-2">•</span>
                  <span>Technology</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Advancements in Automotive Filtration Technology
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Exploring the latest developments in automotive filtration and their impact on 
                  engine performance and fuel efficiency.
                </p>
                <a href="#" className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors">
                  Read More →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">AWARD</span>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>December 5, 2024</span>
                  <span className="mx-2">•</span>
                  <span>Awards</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sure Filter® Wins Industry Excellence Award
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Recognition for our commitment to innovation and quality in the filtration industry.
                </p>
                <a href="#" className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors">
                  Read More →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">ECO</span>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>November 28, 2024</span>
                  <span className="mx-2">•</span>
                  <span>Sustainability</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sustainable Manufacturing Initiatives
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Our commitment to environmental responsibility and sustainable manufacturing practices.
                </p>
                <a href="#" className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors">
                  Read More →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Press Releases</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sure Filter® Expands Global Distribution Network
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Strategic partnerships established in key markets to better serve our international customers.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>November 20, 2024</span>
                    <span className="mx-2">•</span>
                    <span>Business</span>
                  </div>
                </div>
                <a href="#" className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors ml-4">
                  Read Full Release →
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    New Research & Development Center Opening
                  </h3>
                  <p className="text-gray-600 mb-3">
                    State-of-the-art facility to accelerate innovation in filtration technology.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>November 15, 2024</span>
                    <span className="mx-2">•</span>
                    <span>Innovation</span>
                  </div>
                </div>
                <a href="#" className="text-sure-blue-500 font-semibold hover:text-sure-blue-600 transition-colors ml-4">
                  Read Full Release →
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