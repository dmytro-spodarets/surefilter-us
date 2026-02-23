'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <a href="/" className="inline-block mb-8">
          <img src="/images/sf-logo.png" alt="Sure Filter" className="h-10 mx-auto" />
        </a>
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-3 text-gray-600">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#f97316] hover:bg-[#ea580c] transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316]"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
