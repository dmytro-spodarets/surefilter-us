'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

function buildFullSlug(category: 'HEAVY_DUTY' | 'AUTOMOTIVE', parentFull?: string, slug?: string) {
  const root = category === 'HEAVY_DUTY' ? 'heavy-duty' : 'automotive';
  if (parentFull) return `${parentFull}/${slug}`;
  return `${root}/${slug}`;
}

export async function createFilterType(formData: FormData) {
  const category = formData.get('category') as 'HEAVY_DUTY' | 'AUTOMOTIVE';
  const parentId = formData.get('parentId') as string;
  const slug = formData.get('slug') as string;
  const pageTitle = formData.get('pageTitle') as string;
  const description = formData.get('description') as string;

  if (!category || !slug || !pageTitle) {
    throw new Error('category, slug, pageTitle required');
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Invalid slug');
  }

  const parent = parentId ? await prisma.filterType.findUnique({ where: { id: parentId } }) : null;
  const fullSlug = buildFullSlug(category, parent?.fullSlug, slug);
  
  // Generate page slug from fullSlug
  const pageSlug = fullSlug;

  try {
    // Create page first
    const page = await prisma.page.create({
      data: {
        slug: pageSlug,
        title: pageTitle,
        description: description || null,
        status: 'published',
        type: 'CUSTOM',
      },
    });

    // Create filter type with pageSlug
    await prisma.filterType.create({
      data: {
        category,
        parentId: parentId || null,
        slug,
        name: pageTitle, // Use pageTitle as name for consistency
        description: description || null,
        fullSlug,
        pageSlug: pageSlug,
      },
    });
  } catch (e: any) {
    throw new Error(`Failed to create: ${e?.message}`);
  }

  redirect('/admin/filter-types');
}
