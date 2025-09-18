'use client';

import { useActionState } from 'react';
import { submitCreateFilterType, type CreateFilterTypeState } from './actions';
import { useFormStatus } from 'react-dom';
import { useMemo, useState } from 'react';

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
  const [slug, setSlug] = useState('');
  const [touched, setTouched] = useState(false);

  const normalized = useMemo(() => normalizeSlug(slug), [slug]);
  const isValid = useMemo(() => /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug === normalized, [slug, normalized]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state?.error ? (
        <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div>
        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select name="category" required defaultValue={defaultCategory} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
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
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="air"
          required
          pattern="^[a-z0-9-]+$"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          aria-invalid={touched && !isValid}
        />
        {touched && !isValid && (
          <div className="mt-1 text-xs text-red-600">
            Slug can contain only lowercase letters, numbers and dashes. Suggested: <button type="button" className="underline" onClick={() => setSlug(normalized)}>{normalized || '—'}</button>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Page Title</label>
        <input name="pageTitle" required placeholder="Heavy Duty Air Filters" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
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

function normalizeSlug(input: string) {
  const s = (input || '').toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s;
}
