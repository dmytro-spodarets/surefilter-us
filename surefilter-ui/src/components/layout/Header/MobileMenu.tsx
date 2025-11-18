'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

interface NavigationItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
}

interface MobileMenuProps {
  navigation: NavigationItem[];
}

export default function MobileMenu({ navigation }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
      >
        <Icon name="Bars3Icon" size="lg" color="current" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-100">
            {/* Header с кнопкой закрытия */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded"
                aria-label="Close mobile menu"
              >
                <Icon name="XMarkIcon" size="lg" color="current" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  className={cn(
                    'block px-3 py-2 text-gray-900 font-sans uppercase hover:text-sure-red-500 hover:bg-gray-50 transition-colors duration-200 text-lg focus:outline-none',
                    pathname === item.url ? 'text-sure-red-600' : 'text-gray-900'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

