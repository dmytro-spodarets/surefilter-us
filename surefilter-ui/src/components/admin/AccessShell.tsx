'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const accessNavigation = [
  {
    name: 'Tokens',
    href: '/admin/access/tokens',
    icon: '🔑',
    description: 'Personal access tokens',
  },
  {
    name: 'Scopes Reference',
    href: '/admin/access/scopes',
    icon: '📘',
    description: 'What each scope unlocks',
  },
  {
    name: 'Usage',
    href: '/admin/access/usage',
    icon: '📊',
    description: 'Tool calls + activity',
  },
  {
    name: 'Server Settings',
    href: '/admin/access/settings',
    icon: '⚙️',
    description: 'MCP global config + connection guide',
  },
];

export default function AccessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">API &amp; Access</h1>
      <p className="text-sm text-gray-600 mb-6">
        Manage personal access tokens, scope grants, and MCP server configuration. Tokens here authenticate AI
        agents (Claude Desktop, Claude Code, custom integrations) calling{' '}
        <code className="bg-gray-100 px-1 rounded">mcp.surefilter.us</code>.
      </p>

      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {accessNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                    isActive
                      ? 'bg-sure-blue-50 text-sure-blue-700 border-l-4 border-l-sure-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div
                        className={`font-medium ${isActive ? 'text-sure-blue-700' : 'text-gray-900'}`}
                      >
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 bg-amber-50 rounded-lg p-4 text-sm border border-amber-200">
            <div className="font-medium text-amber-900 mb-1">⚠️ Token plaintext is shown once</div>
            <div className="text-amber-800 text-xs">
              Copy it immediately after creation. If lost, regenerate the token — the old one cannot be
              recovered.
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
