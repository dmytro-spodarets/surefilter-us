import React from 'react';
import { ManagedImage } from '@/components/ui/ManagedImage';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };
  const pxSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  return (
    <ManagedImage
      src="/images/sf-logo.png"
      alt="Sure Filter Logo"
      width={sizes[size]}
      height={sizes[size]}
      className={`${pxSizes[size]} ${className}`}
      priority={size === 'lg' || size === 'xl'}
      showPlaceholder={false}
    />
  );
};

export default Logo;