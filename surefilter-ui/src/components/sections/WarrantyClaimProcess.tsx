import Image from 'next/image';
import { PhoneIcon, EnvelopeIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const claimSteps = [
  {
    step: 1,
    title: 'Gather Information',
    description: 'Collect proof of purchase, product details, and document the issue',
    details: ['Receipt or invoice', 'Product part number', 'Installation date', 'Photos of defect']
  },
  {
    step: 2,
    title: 'Contact Support',
    description: 'Reach out to our warranty team with your claim details',
    details: ['Phone or email contact', 'Describe the problem', 'Provide documentation', 'Get claim number']
  },
  {
    step: 3,
    title: 'Investigation',
    description: 'Our team reviews your claim and conducts necessary testing',
    details: ['Technical review', 'Product inspection', 'Failure analysis', 'Claim validation']
  },
  {
    step: 4,
    title: 'Resolution',
    description: 'Receive replacement product and any applicable damage compensation',
    details: ['Product replacement', 'Damage assessment', 'Compensation processing', 'Follow-up support']
  },
];

const contactMethods = [
  {
    icon: PhoneIcon,
    title: 'Phone Support',
    contact: '1-800-SURE-FILTER',
    description: 'Monday - Friday, 8 AM - 5 PM EST',
    action: 'Call Now'
  },
  {
    icon: EnvelopeIcon,
    title: 'Email Support',
    contact: 'warranty@surefilter.com',
    description: 'Response within 24 hours',
    action: 'Send Email'
  },
  {
    icon: DocumentTextIcon,
    title: 'Online Form',
    contact: 'Submit Claim Online',
    description: 'Upload documents and track progress',
    action: 'Start Claim'
  },
];

export default function WarrantyClaimProcess() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Warranty Claim Process
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Filing a warranty claim is straightforward. Follow our step-by-step process to ensure 
            quick resolution of your issue.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {claimSteps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-50 rounded-xl p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-sure-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  {index < claimSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 -right-3 w-6 h-6">
                      <div className="w-0 h-0 border-l-[12px] border-l-sure-blue-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent"></div>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm">
                  {step.description}
                </p>
                
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left side - Contact Methods */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Our Warranty Team
            </h3>
            
            <div className="space-y-4 mb-8">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-start">
                    <div className="bg-sure-blue-100 p-3 rounded-lg mr-4">
                      <method.icon className="h-6 w-6 text-sure-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {method.title}
                      </h4>
                      <p className="text-sure-blue-600 font-medium mb-2">
                        {method.contact}
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        {method.description}
                      </p>
                      <button className="text-sure-blue-600 font-medium text-sm hover:text-sure-blue-700">
                        {method.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Response Time */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Fast Response Time</h4>
                  <p className="text-gray-700">
                    Most warranty claims are processed within 3-5 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image and Tips */}
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
              <Image
                src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=400&fit=crop&crop=center"
                alt="Customer service representative"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Support badge */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center mb-2">
                  <PhoneIcon className="h-5 w-5 text-sure-blue-600 mr-2" />
                  <span className="font-semibold text-gray-900">24/7 Support</span>
                </div>
                <p className="text-sm text-gray-600">Expert warranty assistance</p>
              </div>
            </div>
            
            {/* Tips */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Tips for Faster Processing
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Keep your receipt and product packaging until warranty expires</li>
                <li>• Take photos of the defect before removing the filter</li>
                <li>• Note the installation date and service intervals</li>
                <li>• Have your vehicle information ready (make, model, year)</li>
                <li>• Be prepared to describe the symptoms and failure mode</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-sure-blue-600 text-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">
              Ready to File Your Claim?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our warranty team is here to help you resolve any issues quickly and efficiently. 
              Get started with your claim today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-sure-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Start Online Claim
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
                Call 1-800-SURE-FILTER
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
