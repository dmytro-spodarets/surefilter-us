'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ScrollHeaderProps {
  children: React.ReactNode;
  logoSize: number;
}

export default function ScrollHeader({ children, logoSize }: ScrollHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-500 ease-out',
        isScrolled
          ? 'h-18 bg-white/98'
          : 'h-24 bg-white/95',
      )}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
        borderBottom: '1.5px solid #d1d5db',
      }}
    >
      <style jsx>{`
        header :global(.logo-container) {
          width: ${logoSize}px;
          height: ${logoSize}px;
          transform: ${isScrolled ? 'scale(0.75) translateY(-2px)' : 'scale(1) translateY(0)'};
          will-change: transform;
          transition: all 500ms ease-out;
        }
      `}</style>
      {children}
    </header>
  );
}

