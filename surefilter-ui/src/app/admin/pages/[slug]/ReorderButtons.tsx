'use client';

import { useState } from 'react';

export default function ReorderButtons({ slug, sectionId, isFirst, isLast }: { slug: string; sectionId: string; isFirst: boolean; isLast: boolean }) {
  const [loading, setLoading] = useState<'up' | 'down' | null>(null);

  const move = async (direction: 'up' | 'down') => {
    setLoading(direction);
    try {
      await fetch(`/api/admin/pages/${slug}/sections/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, direction }),
      });
      // Soft refresh
      window.location.reload();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="text-sm text-gray-600 hover:underline disabled:opacity-40"
        onClick={() => move('up')}
        disabled={isFirst || loading !== null}
      >
        {loading === 'up' ? 'Moving…' : 'Up'}
      </button>
      <button
        type="button"
        className="text-sm text-gray-600 hover:underline disabled:opacity-40"
        onClick={() => move('down')}
        disabled={isLast || loading !== null}
      >
        {loading === 'down' ? 'Moving…' : 'Down'}
      </button>
    </div>
  );
}


