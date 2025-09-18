'use client';

import { useActionState } from 'react';
import { submitCreateFilterType, type CreateFilterTypeState } from './actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="bg-sure-blue-600 text-white px-3 py-2 rounded-lg" disabled={pending}>
      {pending ? 'Creating…' : 'Create'}
    </button>
  );
}

export default function NewFilterTypeForm({ defaultCategory }: { defaultCategory: 'HEAVY_DUTY' | 'AUTOMOTIVE' }) {
  const [state, formAction] = useActionState<CreateFilterTypeState, FormData>(submitCreateFilterType, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select name="category" defaultValue={defaultCategory} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="HEAVY_DUTY">Heavy Duty</option>
          <option value="AUTOMOTIVE">Automotive</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Parent ID (optional)</label>
        <input name="parentId" placeholder="parent type id" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Slug</label>
        <input name="slug" placeholder="air" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Page Title</label>
        <input name="pageTitle" placeholder="Heavy Duty Air Filters" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea name="description" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
      </div>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
