import { ReactNode } from 'react';

interface AdminContainerProps {
  children: ReactNode;
  className?: string;
}

export default function AdminContainer({ children, className = '' }: AdminContainerProps) {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className={`max-w-7xl mx-auto ${className}`}>
        {children}
      </div>
    </main>
  );
}
