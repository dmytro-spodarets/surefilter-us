'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const settingsNavigation = [
  {
    name: 'Site Settings',
    href: '/admin/settings/site',
    icon: '🌐',
    description: 'Pages, navigation, SEO',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: '👥',
    description: 'Manage admin users',
  },
  {
    name: 'Activity Logs',
    href: '/admin/logs',
    icon: '📋',
    description: 'View admin actions',
  },
];

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {settingsNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-4 py-3 border-b border-gray-100 last:border-b-0
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-sure-blue-50 text-sure-blue-700 border-l-4 border-l-sure-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-l-transparent'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className={`font-medium ${isActive ? 'text-sure-blue-700' : 'text-gray-900'}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm">
            <div className="font-medium text-blue-900 mb-1">💡 Tip</div>
            <div className="text-blue-700 text-xs">
              Manage site content, users, and view admin activity logs from here.
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
