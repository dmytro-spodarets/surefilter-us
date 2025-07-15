import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  className = '', 
  error = false,
  style,
  ...props 
}) => {
  return (
    <input
      className={cn(
        'w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 placeholder-gray-400',
        'border-0 border-b border-gray-300 rounded-none bg-transparent px-0 py-1.5 text-base',
        'transition-all duration-200',
        'focus:outline-none focus:ring-0 focus:border-b-2 focus:border-sure-orange-500',
        'focus:shadow-[0_2px_0_0_rgba(255,152,0,0.15)]',
        error && 'border-red-500 focus:border-red-500 focus:shadow-[0_2px_0_0_rgba(239,68,68,0.15)]',
        className
      )}
      style={{
        outline: 'none',
        boxShadow: 'none',
        ...style,
      }}
      {...props}
    />
  );
};

export default Input; 