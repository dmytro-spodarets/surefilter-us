'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NewsForm from '@/components/admin/NewsForm';

export default function EditArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/admin/news/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else {
        setError('Article not found');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Article not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-gray-600 mt-1">Update {article.title}</p>
        </div>

        <NewsForm articleId={id} initialData={article} />
      </div>
    </div>
  );
}

