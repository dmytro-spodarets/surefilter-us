import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AdminContainer from '@/components/admin/AdminContainer';
import {
  CubeIcon,
  DocumentTextIcon,
  NewspaperIcon,
  InboxIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const metadata = {
  robots: { index: false, follow: false },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function extractSubmissionPreview(data: Record<string, unknown>): { name?: string; email?: string } {
  const entries = Object.entries(data);
  const findValue = (...keys: string[]) => {
    for (const key of keys) {
      const entry = entries.find(([k]) => k.toLowerCase().replace(/[_\s]/g, '') === key);
      if (entry && typeof entry[1] === 'string') return entry[1];
    }
    return undefined;
  };
  const firstName = findValue('firstname', 'name', 'fullname');
  const lastName = findValue('lastname');
  const email = findValue('email', 'emailaddress');
  return {
    name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
    email,
  };
}

function getActionColor(action: string): string {
  switch (action) {
    case 'CREATE': return 'bg-green-100 text-green-800';
    case 'UPDATE': return 'bg-blue-100 text-blue-800';
    case 'DELETE': return 'bg-red-100 text-red-800';
    case 'LOGIN': return 'bg-purple-100 text-purple-800';
    case 'LOGOUT': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getActionVerb(action: string): string {
  switch (action) {
    case 'CREATE': return 'created';
    case 'UPDATE': return 'updated';
    case 'DELETE': return 'deleted';
    case 'LOGIN': return 'logged in';
    case 'LOGOUT': return 'logged out';
    default: return action.toLowerCase();
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let data = null;
  try {
    const [
      productCount,
      pageCount,
      publishedNewsCount,
      submissionCount,
      recentSubmissions,
      recentLogs,
      productsNoImage,
      draftNewsCount,
      failedWebhooks,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.page.count(),
      prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
      prisma.formSubmission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.formSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { form: { select: { name: true } } },
      }),
      prisma.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.product.count({ where: { media: { none: {} } } }),
      prisma.newsArticle.count({ where: { status: 'DRAFT' } }),
      prisma.formSubmission.count({ where: { webhookSent: false, webhookError: { not: null } } }),
    ]);

    data = {
      productCount, pageCount, publishedNewsCount, submissionCount,
      recentSubmissions, recentLogs,
      productsNoImage, draftNewsCount, failedWebhooks,
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
  }

  if (!data) {
    return (
      <AdminContainer>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-yellow-800 font-medium">Unable to load dashboard data</p>
          <p className="text-yellow-600 text-sm mt-1">The database may be temporarily unreachable. Try refreshing the page.</p>
        </div>
      </AdminContainer>
    );
  }

  const healthWarnings: { label: string; count: number; href: string }[] = [];
  if (data.productsNoImage > 0) {
    healthWarnings.push({ label: 'products without images', count: data.productsNoImage, href: '/admin/products' });
  }
  if (data.draftNewsCount > 0) {
    healthWarnings.push({ label: 'draft news articles', count: data.draftNewsCount, href: '/admin/news' });
  }
  if (data.failedWebhooks > 0) {
    healthWarnings.push({ label: 'failed webhook deliveries', count: data.failedWebhooks, href: '/admin/form-submissions' });
  }

  return (
    <AdminContainer>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={CubeIcon} label="Products" count={data.productCount} href="/admin/products" />
        <StatsCard icon={DocumentTextIcon} label="Pages" count={data.pageCount} href="/admin/pages" />
        <StatsCard icon={NewspaperIcon} label="News" count={data.publishedNewsCount} href="/admin/news" subtitle="published" />
        <StatsCard icon={InboxIcon} label="Submissions" count={data.submissionCount} href="/admin/form-submissions" subtitle="last 30 days" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-3 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <PlusIcon className="h-4 w-4" />
            New Product
          </Link>
          <Link href="/admin/news/new" className="flex items-center gap-2 px-4 py-3 bg-sure-blue-600 hover:bg-sure-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <PlusIcon className="h-4 w-4" />
            New News
          </Link>
          <Link href="/admin/pages" className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <PlusIcon className="h-4 w-4" />
            New Page
          </Link>
          <Link href="/admin/files" className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <ArrowUpTrayIcon className="h-4 w-4" />
            Upload File
          </Link>
        </div>
      </div>

      {/* Content Health */}
      {healthWarnings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Health</h2>
          <div className="space-y-3">
            {healthWarnings.map((warning) => (
              <Link
                key={warning.label}
                href={warning.href}
                className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 shrink-0" />
                <span className="text-sm text-yellow-800">
                  <span className="font-semibold">{warning.count}</span> {warning.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {data.recentSubmissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
            <Link href="/admin/form-submissions" className="text-sm text-sure-blue-600 hover:text-sure-blue-900">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mt-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentSubmissions.map((sub) => {
                  const preview = extractSubmissionPreview(sub.data as Record<string, unknown>);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{preview.name || '—'}</div>
                        {preview.email && <div className="text-xs text-gray-500">{preview.email}</div>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-600">{sub.form.name}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{timeAgo(new Date(sub.createdAt))}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex gap-1">
                          {sub.webhookSent ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Webhook ✓</span>
                          ) : sub.webhookError ? (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Webhook ✗</span>
                          ) : null}
                          {sub.emailSent && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Email ✓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data.recentLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/admin/logs" className="text-sm text-sure-blue-600 hover:text-sure-blue-900">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 mt-4">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-5 py-3">
                <span className={`shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0 text-sm truncate">
                  <span className="font-medium text-gray-900">{log.user.name || log.user.email}</span>
                  {' '}
                  <span className="text-gray-500">{getActionVerb(log.action)} {log.entityType}</span>
                  {log.entityName && <span className="text-gray-700"> &apos;{log.entityName}&apos;</span>}
                </div>
                <span className="shrink-0 text-xs text-gray-400">{timeAgo(new Date(log.createdAt))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminContainer>
  );
}

function StatsCard({
  icon: Icon,
  label,
  count,
  href,
  subtitle,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  count: number;
  href: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-sure-blue-50 rounded-lg">
          <Icon className="h-5 w-5 text-sure-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-600">
            {label}
            {subtitle && <span className="text-xs text-gray-400 ml-1">({subtitle})</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
