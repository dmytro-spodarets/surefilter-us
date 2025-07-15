import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'feature' | 'product';
}

const Card: React.FC<CardProps> = ({ className, children, variant = 'default' }) => {
  const variants = {
    default: 'bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300',
    feature: 'text-center p-6 bg-sure-blue-100 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out',
    product: 'bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out hover:border-orange-200 border border-transparent',
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};

export default Card; 