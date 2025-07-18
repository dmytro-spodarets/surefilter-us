import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function WarrantyContact() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Need to File a Warranty Claim?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our warranty team is ready to help you with any product issues. Contact us through 
            any of the methods below for fast and professional service.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <PhoneIcon className="h-8 w-8 text-sure-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-sure-blue-600 font-medium mb-2">1-800-SURE-FILTER</p>
              <p className="text-gray-600 text-sm">Monday - Friday, 8 AM - 5 PM EST</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <EnvelopeIcon className="h-8 w-8 text-sure-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sure-blue-600 font-medium mb-2">warranty@surefilter.com</p>
              <p className="text-gray-600 text-sm">Response within 24 hours</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <ArrowRightIcon className="h-8 w-8 text-sure-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Our Contacts</h3>
              <p className="text-gray-600 text-sm mb-4">Full contact information and office locations</p>
              <Link 
                href="/contact-us" 
                className="text-sure-blue-600 font-medium hover:text-sure-blue-700"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}