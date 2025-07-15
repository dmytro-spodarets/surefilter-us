"use client";

import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const companyLinks = [
  { name: 'About Us', href: '/about-us' },
  { name: 'Contact Us', href: '/contact-us' },
  { name: 'Newsroom', href: '/newsroom' },
  { name: 'Warranty', href: '/warranty' },
  { name: 'Resources', href: '/resources' },
];

const socialLinks = [
  { name: 'LinkedIn', href: '#', icon: 'LinkedInIcon' },
  { name: 'Facebook', href: '#', icon: 'FacebookIcon' },
  { name: 'Twitter', href: '#', icon: 'TwitterIcon' },
  { name: 'YouTube', href: '#', icon: 'YouTubeIcon' },
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
              Your trusted partner for premium filtration solutions. Quality, performance, and reliability for the world's toughest applications.
            </p>
            
            {/* Контактная информация */}
            <div className="space-y-2 text-sm text-gray-300">
              <p>123 Industrial Blvd, Suite 100</p>
              <p>Manufacturing District, CA 90210</p>
              <p className="mt-4">
                <span className="font-medium">Phone:</span> +1 (555) 123-4567
              </p>
              <p>
                <span className="font-medium">Email:</span> info@surefilter.com
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

          {/* Социальные сети */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <span className="sr-only">{social.name}</span>
                  {/* Здесь можно добавить иконки */}
                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                </a>
              ))}
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