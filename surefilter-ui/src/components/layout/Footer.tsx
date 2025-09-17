"use client";

import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { FaLinkedin, FaFacebook, FaApple, FaGooglePlay } from 'react-icons/fa';

const companyLinks = [
  { name: 'About Us', href: '/about-us' },
  { name: 'Contact Us', href: '/contact-us' },
  { name: 'Newsroom', href: '/newsroom' },
  { name: 'Warranty', href: '/warranty' },
  { name: 'Resources', href: '/resources' },
  { name: 'Catalog', href: '/catalog' },
];

const socialLinks = [
  { name: 'LinkedIn', href: '#', icon: FaLinkedin },
  { name: 'Facebook', href: '#', icon: FaFacebook },

];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
            Your trusted partner for superior filtration solutions. Premium quality, performance, and reliability for the world's toughest applications.
            </p>
            
            {/* Контактная информация */}
            <div className="space-y-2 text-sm text-gray-300">
              <p>1470 Civic Dr. STE 309</p>
              <p>Concord, CA 94520</p>
              <p className="mt-4">
                <span className="font-medium">Phone:</span> +1 (925) 566-8863/73
              </p>
              <p>
                <span className="font-medium">Fax:</span> +1 (925) 566-8893
              </p>
              <p>
                +1 8448 BE SURE 
              </p>
              <p>
              <span className="font-medium">Phil, our AI Service Agent:</span> +1-651-273-9232
              </p>
              <p>
                <span className="font-medium">Email:</span> order@surefilter.us
              </p>
            </div>
          </div>

          {/* Навигация по компании */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <nav className="space-y-2">
              {companyLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Социальные сети и приложения */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
            
            <div>
              <h4 className="text-base font-semibold mb-3">Get our app</h4>
              <div className="flex items-center space-x-3">
                <a
                  href="#"
                  className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2"
                  aria-label="Download on the App Store"
                >
                  <FaApple className="w-5 h-5" />
                  <span className="text-sm">App Store</span>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg px-3 py-2"
                  aria-label="Get it on Google Play"
                >
                  <FaGooglePlay className="w-5 h-5" />
                  <span className="text-sm">Google Play</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Sure Filter®. All rights reserved.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Terms of Use
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 