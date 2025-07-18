'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';

interface HeaderProps {
  className?: string;
}

const LOGO_SIZE = 64; // px, всегда одинаковый размер

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'HOME', href: '/' },
    { name: 'HEAVY DUTY', href: '/heavy-duty' },
    { name: 'AUTOMOTIVE', href: '/automotive' },
    { name: 'INDUSTRIES', href: '/industries' },
    { name: 'ABOUT US', href: '/about-us' },
    { name: 'CONTACT US', href: '/contact-us' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-500 ease-out',
        isScrolled
          ? 'h-18 bg-white/98'
          : 'h-24 bg-white/95',
        className
      )}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
        borderBottom: '1.5px solid #d1d5db',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center h-full select-none" tabIndex={-1}>
          <span
            className="flex items-center justify-center transition-all duration-500 ease-out"
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              transform: isScrolled ? 'scale(0.75) translateY(-2px)' : 'scale(1) translateY(0)',
              willChange: 'transform',
            }}
          >
            <Logo size="xl" />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-5">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                'relative font-sans transition-all duration-500 ease-out group',
                pathname === item.href ? 'text-sure-red-600' : 'text-gray-900',
                isScrolled ? 'text-base px-2 py-1 opacity-90' : 'text-base px-2 py-1 opacity-100',
                'focus:outline-none',
              )}
            >
              <span className="inline-block transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-focus:-translate-y-0.5 group-hover:saturate-150 group-focus:saturate-150 group-hover:text-sure-red-600 group-focus:text-sure-red-600">
                {item.name}
              </span>
              {/* Apple-style underline */}
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 rounded-full transition-all duration-500 ease-out bg-sure-red-500",
                  pathname === item.href
                    ? "w-4/5 opacity-100"
                    : "w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100 group-focus:w-4/5 group-focus:opacity-100"
                )}
              />
            </a>
          ))}
        </nav>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center ml-8"
        >
          <div className={cn(
            'relative flex items-center',
            isScrolled ? 'w-40 lg:w-52' : 'w-56 lg:w-72'
          )}>
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'border-0 border-b border-gray-300 rounded-none bg-transparent px-0 transition-all duration-500 ease-out placeholder-gray-400 shadow-none',
                isScrolled ? 'py-1.5 text-base opacity-90' : 'py-1.5 text-base opacity-100',
                'focus:border-sure-red-500 focus:ring-0 focus:outline-none'
              )}
              style={{ borderRadius: 0, fontFamily: 'inherit' }}
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sure-red-500 transition-all duration-500 ease-out p-1"
              tabIndex={-1}
            >
              <Icon name="MagnifyingGlassIcon" size="md" color="current" />
            </button>
          </div>
        </form>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <Icon name="Bars3Icon" size="lg" color="current" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-100" style={{ boxShadow: 'none' }}>
            {/* Header с кнопкой закрытия */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 rounded"
                aria-label="Close mobile menu"
              >
                <Icon name="XMarkIcon" size="lg" color="current" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center border-b border-gray-200 pb-2">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'border-0 border-b border-gray-300 rounded-none bg-transparent px-0 transition-all duration-200 placeholder-gray-400 shadow-none',
                    isScrolled ? 'py-1 text-sm' : 'py-1.5 text-base',
                    'focus:border-sure-red-500 focus:ring-0 focus:outline-none'
                  )}
                  style={{ borderRadius: 0 }}
                  autoComplete="off"
                />
                <button type="submit" className="ml-2 text-gray-400 hover:text-sure-red-500">
                  <Icon name="MagnifyingGlassIcon" size="md" color="current" />
                </button>
              </form>
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 text-gray-900 font-sans hover:text-sure-red-500 hover:bg-gray-50 transition-colors duration-200 text-lg focus:outline-none',
                      pathname === item.href ? 'text-sure-red-600' : 'text-gray-900'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;