'use client';

export default function QualityAssuranceForm({ sectionId }: { sectionId: string }) {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quality_assurance', data: {} }),
    });
    alert('Saved');
  };

  return (
    <section className="border border-gray-200 rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quality Assurance</h2>
      <form onSubmit={onSubmit} className="grid gap-4">
        <p className="text-sm text-gray-600">This section has predefined content. Click save to keep an empty config.</p>
        <div>
          <button type="submit" className="bg-sure-orange-500 text-white rounded-lg px-4 py-2 hover:bg-sure-orange-600">Save</button>
        </div>
      </form>
    </section>
  );
}


