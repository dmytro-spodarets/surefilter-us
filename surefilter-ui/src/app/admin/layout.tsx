'use client';

import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pagesMenuOpen, setPagesMenuOpen] = useState(false);
  const [formsMenuOpen, setFormsMenuOpen] = useState(false);
  const [resourcesMenuOpen, setResourcesMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === path;
    return pathname?.startsWith(path);
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-sure-blue-100 text-sure-blue-700'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <html lang="en">
      <body>
        <SessionProvider>
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Main Navigation */}
            <div className="flex items-center justify-between h-16">
              {/* Left: Brand + Nav */}
              <div className="flex items-center gap-8">
                <Link href="/admin" className="flex items-center gap-2">
                  <span className="text-xl font-bold text-sure-blue-600">SF</span>
                  <span className="text-sm font-semibold text-gray-900">Admin</span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-1">
                  {/* Pages Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setPagesMenuOpen(!pagesMenuOpen)}
                      onBlur={() => setTimeout(() => setPagesMenuOpen(false), 200)}
                      className={`${linkClass('/admin/pages')} flex items-center gap-1`}
                    >
                      Pages
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {pagesMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                        <Link
                          href="/admin/pages"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          📄 All Pages
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <Link
                          href="/admin/industries"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🏭 Industries
                        </Link>
                        <Link
                          href="/admin/filter-types"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🔧 Filter Types
                        </Link>
                        <Link
                          href="/admin/shared-sections"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🔗 Shared Sections
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <Link href="/admin/news" className={linkClass('/admin/news')}>
                    News
                  </Link>

                  {/* Products */}
                  <Link href="/admin/products" className={linkClass('/admin/products')}>
                    Products
                  </Link>

                  {/* Forms Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setFormsMenuOpen(!formsMenuOpen)}
                      onBlur={() => setTimeout(() => setFormsMenuOpen(false), 200)}
                      className={`${linkClass('/admin/forms')} flex items-center gap-1`}
                    >
                      Forms
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {formsMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                        <Link
                          href="/admin/forms"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          📋 All Forms
                        </Link>
                        <Link
                          href="/admin/forms/new"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ➕ Create Form
                        </Link>
                        <Link
                          href="/admin/form-submissions"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          📥 All Submissions
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Resources Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setResourcesMenuOpen(!resourcesMenuOpen)}
                      onBlur={() => setTimeout(() => setResourcesMenuOpen(false), 200)}
                      className={`${linkClass('/admin/resources')} flex items-center gap-1`}
                    >
                      Resources
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {resourcesMenuOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                        <Link
                          href="/admin/resources"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          📄 All Resources
                        </Link>
                        <Link
                          href="/admin/resources/new"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ➕ Add Resource
                        </Link>
                        <Link
                          href="/admin/resource-categories"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          🏷️ Categories
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Media & Settings */}
                  <Link href="/admin/files" className={linkClass('/admin/files')}>
                    Files
                  </Link>
                  <Link href="/admin/settings" className={linkClass('/admin/settings')}>
                    Settings
                  </Link>
                </nav>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  target="_blank"
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Site
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}



