'use client';

import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-semibold text-gray-900">Admin</Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/admin/pages" className="text-gray-700 hover:text-gray-900">Pages</Link>
                <span className="text-gray-300">|</span>
                <Link href="/admin/industries" className="text-gray-700 hover:text-gray-900">Industries</Link>
                <span className="text-gray-300">|</span>
                <Link href="/admin/filter-types" className="text-gray-700 hover:text-gray-900">Filter Types</Link>
                <span className="text-gray-300">|</span>
                <Link href="/admin/spec-parameters" className="text-gray-700 hover:text-gray-900">Specs</Link>
                <span className="text-gray-300">|</span>
                <Link href="/admin/products" className="text-gray-700 hover:text-gray-900">Products</Link>
                <span className="text-gray-300">|</span>
                <Link href="/admin/files" className="text-gray-700 hover:text-gray-900">Files</Link>
                <span className="text-gray-300">|</span>
                <Link href="/admin/settings" className="text-gray-700 hover:text-gray-900">Settings</Link>
              </nav>
            </div>
            <Link href="/" className="text-sm text-sure-blue-600 hover:underline">← Back to site</Link>
          </div>
        </header>
        <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}



