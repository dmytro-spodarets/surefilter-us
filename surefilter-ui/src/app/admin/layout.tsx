import Link from 'next/link';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
                {/* Future: */}
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">Products</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">Settings</span>
              </nav>
            </div>
            <Link href="/" className="text-sm text-sure-blue-600 hover:underline">← Back to site</Link>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}


