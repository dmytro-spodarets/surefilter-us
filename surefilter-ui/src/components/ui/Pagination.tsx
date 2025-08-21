"use client";

import Icon from '@/components/ui/Icon';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function getPageRange(current: number, total: number): (number | string)[] {
  const delta = 1; // neighbors
  const range: (number | string)[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
}

export default function Pagination({ currentPage, totalPages, onChange, className = '' }: PaginationProps) {
  const pages = getPageRange(currentPage, totalPages);

  return (
    <nav className={`mt-12 flex items-center justify-center space-x-2 ${className}`} aria-label="Pagination">
      <button
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        aria-label="Previous page"
      >
        <Icon name="ChevronLeftIcon" className="h-4 w-4 mr-1" />
        Previous
      </button>

      <div className="flex space-x-1">
        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={idx}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                p === currentPage
                  ? 'text-white bg-sure-blue-500 border border-sure-blue-500'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-3 py-2 text-sm text-gray-500">{p}</span>
          )
        )}
      </div>

      <button
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        aria-label="Next page"
      >
        Next
        <Icon name="ChevronRightIcon" className="h-4 w-4 ml-1" />
      </button>
    </nav>
  );
}
