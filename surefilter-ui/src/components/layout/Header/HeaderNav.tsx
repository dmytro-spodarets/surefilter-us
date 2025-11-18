'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
}

interface HeaderNavProps {
  navigation: NavigationItem[];
}

export default function HeaderNav({ navigation }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center space-x-5">
      {navigation.map((item) => (
        <a
          key={item.label}
          href={item.url}
          className={cn(
            'relative font-sans uppercase transition-all duration-500 ease-out group',
            pathname === item.url ? 'text-sure-red-600' : 'text-gray-900',
            'text-base px-2 py-1',
            'focus:outline-none',
          )}
        >
          <span className="inline-block uppercase transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-focus:-translate-y-0.5 group-hover:saturate-150 group-focus:saturate-150 group-hover:text-sure-red-600 group-focus:text-sure-red-600">
            {item.label}
          </span>
          {/* Apple-style underline */}
          <span
            className={cn(
              "pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 rounded-full transition-all duration-500 ease-out bg-sure-red-500",
              pathname === item.url
                ? "w-4/5 opacity-100"
                : "w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100 group-focus:w-4/5 group-focus:opacity-100"
            )}
          />
        </a>
      ))}
    </nav>
  );
}

