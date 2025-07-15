import React from 'react';
import { cn } from '@/lib/utils';
import * as Heroicons from '@heroicons/react/24/outline';
import * as HeroiconsSolid from '@heroicons/react/24/solid';

interface IconProps {
  name: keyof typeof Heroicons;
  variant?: 'outline' | 'solid';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  color?: 'sure-blue' | 'sure-orange' | 'gray' | 'white' | 'current';
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  variant = 'outline', 
  size = 'md', 
  className = '',
  color = 'current'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const colorClasses = {
    'sure-blue': 'text-sure-blue-500',
    'sure-orange': 'text-sure-orange-500',
    'gray': 'text-gray-500',
    'white': 'text-white',
    'current': 'text-current',
  };

  const IconComponent = variant === 'solid' 
    ? HeroiconsSolid[name as keyof typeof HeroiconsSolid]
    : Heroicons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Heroicons`);
    return null;
  }

  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      aria-hidden="true"
    />
  );
};

export default Icon; 