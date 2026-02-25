import { ReactNode } from 'react';

interface AdminContainerProps {
  children: ReactNode;
  className?: string;
}

export default function AdminContainer({ children, className = '' }: AdminContainerProps) {
  return (
    <div className={`p-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
