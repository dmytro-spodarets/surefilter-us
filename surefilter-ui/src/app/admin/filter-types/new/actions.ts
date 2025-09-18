'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

function buildFullSlug(category: 'HEAVY_DUTY' | 'AUTOMOTIVE', parentFull?: string, slug?: string) {
  const root = category === 'HEAVY_DUTY' ? 'heavy-duty' : 'automotive';
  if (parentFull) return `${parentFull}/${slug}`;
  return `${root}/${slug}`;
}

export type CreateFilterTypeState = { error?: string };

function normalizeSlug(input: string) {
  const s = (input || '').toLowerCase().trim()
    .replace(/\s+/g, '-')            // spaces -> dash
    .replace(/[^a-z0-9-]/g, '-')      // remove invalid to dash
    .replace(/-+/g, '-')              // collapse dashes
    .replace(/^-+|-+$/g, '');         // trim dashes
  return s;
}

// Single Server Action used by the client form (no chaining)
export async function submitCreateFilterType(
  prevState: CreateFilterTypeState,
  formData: FormData
): Promise<CreateFilterTypeState> {
  const category = formData.get('category') as 'HEAVY_DUTY' | 'AUTOMOTIVE';
  const parentId = (formData.get('parentId') as string) || undefined;
  const rawSlug = (formData.get('slug') as string) || '';
  const pageTitle = ((formData.get('pageTitle') as string) || '').trim();
  const description = (formData.get('description') as string) || undefined;

  if (!category || !rawSlug || !pageTitle) return { error: 'category, slug, pageTitle required' };
  const normalized = normalizeSlug(rawSlug);
  if (!normalized) return { error: 'Invalid slug: after normalization it becomes empty. Use letters, numbers, and dashes.' };
  if (normalized !== rawSlug) return { error: `Invalid slug. Suggested: "${normalized}"` };
  if (!/^[a-z0-9-]+$/.test(normalized)) return { error: 'Invalid slug (allowed: a-z, 0-9, -)' };

  const parent = parentId ? await prisma.filterType.findUnique({ where: { id: parentId } }) : null;
  const fullSlug = buildFullSlug(category, parent?.fullSlug, normalized);
  const pageSlug = fullSlug;

  try {
    await prisma.page.create({
      data: {
        slug: pageSlug,
        title: pageTitle,
        description: description || null,
        status: 'published',
        type: 'CUSTOM',
      },
    });
    await prisma.filterType.create({
      data: {
        category,
        parentId: parentId || null,
        slug: normalized,
        name: pageTitle,
        description: description || null,
        fullSlug,
        pageSlug,
      },
    });
  } catch (e: any) {
    const msg = e?.code === 'P2002'
      ? 'Duplicate detected (page slug or filter type already exists)'
      : (e?.message || 'Unknown error');
    return { error: `Failed to create: ${msg}` };
  }

  redirect('/admin/filter-types');
}

