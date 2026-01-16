'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top immediately on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return <>{children}</>;
}
