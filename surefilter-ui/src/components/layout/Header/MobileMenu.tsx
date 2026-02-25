'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/Icon';
import type { NavigationItem } from '@/lib/site-settings';

interface MobileMenuProps {
  navigation: NavigationItem[];
}

export default function MobileMenu({ navigation }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const hasChildren = (item: NavigationItem) => item.children && item.children.length > 0;

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
          <div className="absolute top-0 left-0 right-0 bg-gray-50 border-b border-gray-200">
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
            <nav className="px-4 py-4 space-y-1 max-h-[calc(100dvh-80px)] overflow-y-auto">
              {navigation.map((item) => {
                const withChildren = hasChildren(item);
                const isExpanded = expandedItems.has(item.label);

                if (!withChildren) {
                  // Simple link — same as before
                  return (
                    <a
                      key={item.label}
                      href={item.url}
                      className={cn(
                        'block px-3 py-3 text-gray-900 font-sans uppercase hover:text-sure-red-500 hover:bg-gray-50 transition-colors duration-200 text-lg focus:outline-none rounded-lg',
                        pathname === item.url && 'text-sure-red-600'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                }

                // Item with children — click to expand accordion
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.label)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label} submenu`}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-3 text-gray-900 font-sans uppercase hover:text-sure-red-500 hover:bg-gray-100 transition-colors duration-200 text-lg focus:outline-none rounded-lg',
                        (pathname === item.url || item.children?.some(c => pathname === c.url)) && 'text-sure-red-600'
                      )}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={cn(
                          'w-5 h-5 transition-transform duration-200 text-gray-500',
                          isExpanded && 'rotate-180'
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Accordion children */}
                    <div
                      role="menu"
                      aria-label={`${item.label} submenu`}
                      className={cn(
                        'overflow-hidden transition-all duration-200 ease-out',
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="pl-6 pb-2 ml-3 border-l-2 border-sure-red-500">
                        {item.children!.map((child) => (
                          <a
                            key={child.label}
                            href={child.url}
                            role="menuitem"
                            className={cn(
                              'block px-3 py-2.5 text-base transition-colors duration-200 rounded-lg',
                              pathname === child.url
                                ? 'text-sure-red-600'
                                : 'text-gray-700 hover:text-sure-red-500'
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Browse Catalog CTA */}
              <div className="border-t border-gray-200 mt-2 pt-4">
                <a
                  href="/catalog"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-sure-red-500 text-white font-medium rounded-lg hover:bg-sure-red-700 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name="MagnifyingGlassIcon" size="sm" color="white" />
                  Browse Catalog
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
