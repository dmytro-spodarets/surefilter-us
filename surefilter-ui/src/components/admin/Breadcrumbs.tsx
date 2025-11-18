'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs if not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast || !item.href ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-sure-blue-600 transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function generateBreadcrumbs(pathname: string | null): BreadcrumbItem[] {
  if (!pathname) return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin' }];

  // Build breadcrumbs from path segments
  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip 'admin' as it's already the root
    if (segment === 'admin') continue;

    // Handle different path patterns
    let label = formatLabel(segment);
    let href: string | undefined = currentPath;

    // IDs in paths (e.g., /forms/clx123/edit)
    if (segment.startsWith('cl') || segment.startsWith('cm') || /^[a-z0-9]{20,}$/i.test(segment)) {
      // Skip IDs in breadcrumbs or show as "..."
      continue;
    }

    // Last segment (current page) - no href
    if (i === segments.length - 1) {
      href = undefined;
    }

    breadcrumbs.push({ label, href });
  }

  return breadcrumbs;
}

function formatLabel(segment: string): string {
  // Common replacements
  const replacements: Record<string, string> = {
    'pages': 'Pages',
    'forms': 'Forms',
    'form-submissions': 'Form Submissions',
    'resources': 'Resources',
    'resource-categories': 'Resource Categories',
    'news': 'News',
    'industries': 'Industries',
    'filter-types': 'Filter Types',
    'spec-parameters': 'Spec Parameters',
    'products': 'Products',
    'files': 'Files',
    'settings': 'Settings',
    'new': 'New',
    'edit': 'Edit',
    'submissions': 'Submissions',
    'categories': 'Categories',
  };

  if (replacements[segment]) {
    return replacements[segment];
  }

  // Convert slug to title case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

