'use client';

import { useMemo, useState } from 'react';
import { RESERVED_SLUGS } from '@/lib/pages';

export default function DeletePageButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const isProtected = useMemo(() => RESERVED_SLUGS.has(slug), [slug]);
  const onDelete = async () => {
    if (isProtected) return;
    if (!confirm(`Delete page /${slug}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const t = await res.text();
        alert(t || 'Delete failed');
        return;
      }
      window.location.href = '/admin/pages';
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={onDelete} className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60" disabled={loading || isProtected} title={isProtected ? 'Core page cannot be deleted' : undefined}>
      {loading ? 'Deleting…' : 'Delete page'}
    </button>
  );
}


