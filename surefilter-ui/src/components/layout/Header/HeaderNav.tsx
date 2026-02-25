'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavigationItem } from '@/lib/site-settings';

interface HeaderNavProps {
  navigation: NavigationItem[];
}

export default function HeaderNav({ navigation }: HeaderNavProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownItemsRef = useRef<Map<string, HTMLAnchorElement[]>>(new Map());

  const handleOpen = useCallback((label: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(label);
  }, []);

  const handleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }, []);

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openDropdown]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const hasChildren = (item: NavigationItem) => item.children && item.children.length > 0;

  const isItemActive = (item: NavigationItem) => {
    if (pathname === item.url) return true;
    if (item.children?.some(child => pathname === child.url)) return true;
    return false;
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if (!hasChildren(item)) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!openDropdown) {
        setOpenDropdown(item.label);
      }
      const items = dropdownItemsRef.current.get(item.label);
      if (items && items.length > 0) {
        items[0]?.focus();
      }
    }
  };

  const handleChildKeyDown = (e: React.KeyboardEvent, itemLabel: string, childIndex: number) => {
    const items = dropdownItemsRef.current.get(itemLabel);
    if (!items) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(childIndex + 1, items.length - 1);
      items[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(childIndex - 1, 0);
      items[prev]?.focus();
    }
  };

  const registerChildRef = (itemLabel: string, index: number, el: HTMLAnchorElement | null) => {
    if (!el) return;
    if (!dropdownItemsRef.current.has(itemLabel)) {
      dropdownItemsRef.current.set(itemLabel, []);
    }
    const arr = dropdownItemsRef.current.get(itemLabel)!;
    arr[index] = el;
  };

  return (
    <nav className="hidden lg:flex items-center space-x-5">
      {/* Click-outside overlay */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
          aria-hidden="true"
        />
      )}

      {navigation.map((item) => {
        const active = isItemActive(item);
        const isOpen = openDropdown === item.label;
        const withChildren = hasChildren(item);

        if (!withChildren) {
          // Simple link — exact existing behavior
          return (
            <a
              key={item.label}
              href={item.url}
              className={cn(
                'relative font-sans uppercase transition-all duration-500 ease-out group',
                active ? 'text-sure-red-600' : 'text-gray-900',
                'text-base px-2 py-1',
                'focus:outline-none',
              )}
            >
              <span className="inline-block uppercase transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-focus:-translate-y-0.5 group-hover:saturate-150 group-focus:saturate-150 group-hover:text-sure-red-600 group-focus:text-sure-red-600">
                {item.label}
              </span>
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 rounded-full transition-all duration-500 ease-out bg-sure-red-500",
                  active
                    ? "w-4/5 opacity-100"
                    : "w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100 group-focus:w-4/5 group-focus:opacity-100"
                )}
              />
            </a>
          );
        }

        // Dropdown item
        return (
          <div
            key={item.label}
            className="relative z-50"
            onMouseEnter={() => handleOpen(item.label)}
            onMouseLeave={handleClose}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setOpenDropdown(isOpen ? null : item.label)}
              onKeyDown={(e) => handleDropdownKeyDown(e, item)}
              className={cn(
                'relative font-sans uppercase transition-all duration-500 ease-out group/trigger inline-flex items-center gap-1 cursor-pointer',
                active ? 'text-sure-red-600' : 'text-gray-900',
                'text-base px-2 py-1',
                'focus:outline-none',
              )}
            >
              <span className="inline-block uppercase transition-all duration-500 ease-out group-hover/trigger:-translate-y-0.5 group-focus/trigger:-translate-y-0.5 group-hover/trigger:saturate-150 group-focus/trigger:saturate-150 group-hover/trigger:text-sure-red-600 group-focus/trigger:text-sure-red-600">
                {item.label}
              </span>
              <svg
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {/* Apple-style underline */}
              <span
                className={cn(
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-1 h-0.5 rounded-full transition-all duration-500 ease-out bg-sure-red-500",
                  active
                    ? "w-4/5 opacity-100"
                    : "w-0 opacity-0 group-hover/trigger:w-4/5 group-hover/trigger:opacity-100 group-focus/trigger:w-4/5 group-focus/trigger:opacity-100"
                )}
              />
            </button>

            {/* Dropdown panel — always in DOM for smooth CSS transitions */}
            <div
              role="menu"
              aria-label={`${item.label} submenu`}
              className={cn(
                'absolute left-1/2 -translate-x-1/2 top-full mt-3 min-w-52 bg-white border border-gray-200 rounded-lg',
                'transition-all duration-200 ease-out',
                isOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              )}
            >
              <div className="py-2">
                {item.children!.map((child, childIdx) => (
                  <a
                    key={child.label}
                    ref={(el) => registerChildRef(item.label, childIdx, el)}
                    href={child.url}
                    role="menuitem"
                    tabIndex={isOpen ? 0 : -1}
                    onKeyDown={(e) => handleChildKeyDown(e, item.label, childIdx)}
                    className={cn(
                      'block mx-2 px-3 py-2 text-sm rounded-md transition-colors duration-150',
                      pathname === child.url
                        ? 'text-sure-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
