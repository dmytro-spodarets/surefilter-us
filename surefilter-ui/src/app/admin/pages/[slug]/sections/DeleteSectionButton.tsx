'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteSectionButton({ sectionId, slug }: { sectionId: string; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onDelete = async () => {
    if (!confirm('Delete this section?')) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/sections/${sectionId}`, { method: 'DELETE' });
      router.push(`/admin/pages/${slug}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onDelete} className="text-sm text-red-600 hover:underline" disabled={loading}>
      {loading ? 'Deleting…' : 'Delete section'}
    </button>
  );
}


