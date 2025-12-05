'use client';

import { useEffect, useState } from 'react';

interface SharedSectionFormWrapperProps {
  sharedSectionId: string;
  initialData: any;
  children: (props: { sectionId: string; initialData: any }) => React.ReactNode;
}

export default function SharedSectionFormWrapper({
  sharedSectionId,
  initialData,
  children,
}: SharedSectionFormWrapperProps) {
  const [saved, setSaved] = useState(false);

  // Intercept form submissions by overriding the fetch function temporarily
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Intercept PUT requests to /api/admin/sections/[id]
      if (init?.method === 'PUT' && url.includes('/api/admin/sections/')) {
        try {
          const body = init.body ? JSON.parse(init.body as string) : {};
          
          // Redirect to shared section API
          const response = await originalFetch(`/api/admin/shared-sections/${sharedSectionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: body.data }),
          });
          
          if (response.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }
          
          return response;
        } catch (error) {
          console.error('Error saving shared section:', error);
          return originalFetch(input, init);
        }
      }
      
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [sharedSectionId]);

  return (
    <>
      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-800">
          ✓ Shared section saved successfully
        </div>
      )}
      {children({ sectionId: `temp-${sharedSectionId}`, initialData })}
    </>
  );
}
