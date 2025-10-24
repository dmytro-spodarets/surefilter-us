import NewsForm from '@/components/admin/NewsForm';

export default function NewArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
          <p className="text-gray-600 mt-1">Create a new news article or event</p>
        </div>

        <NewsForm />
      </div>
    </div>
  );
}

