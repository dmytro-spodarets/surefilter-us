'use client';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';

export default function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <div>© {year} Sure Filter® US. All rights reserved.</div>
        <div className="flex items-center gap-2">
          <span>Version:</span>
          <code className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono">{APP_VERSION}</code>
        </div>
      </div>
    </footer>
  );
}
