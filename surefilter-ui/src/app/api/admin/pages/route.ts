import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { RESERVED_SLUGS } from '@/lib/pages';

function isValidSlugForType(slug: string, type?: 'CUSTOM' | 'INDUSTRY') {
  // allow multi-segment slugs like industries/agriculture or heavy-duty/oil
  if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(slug)) return false;
  const first = (slug.split('/')?.[0] || '') as string;
  const allowedPrefixed = new Set(['industries', 'heavy-duty', 'automotive']);
  if (slug.includes('/') && allowedPrefixed.has(first)) return true;
  // INDUSTRY pages must be under industries
  if (type === 'INDUSTRY') return first === 'industries';
  // Otherwise, first segment must not be reserved
  return !RESERVED_SLUGS.has(first);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  let { slug, title, description, ogImage, type } = body ?? {};
  if (typeof slug === 'string') slug = slug.trim();
  if (!isValidSlugForType(slug || '', type)) {
    return NextResponse.json({ error: 'Invalid or reserved slug. Use lowercase letters, numbers, and dashes only.' }, { status: 400 });
  }
  if (!title || typeof title !== 'string') title = slug.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase());

  try {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

    const page = await prisma.page.create({
      data: { slug, title, description: description || null, ogImage: ogImage || null, type: type === 'INDUSTRY' ? 'INDUSTRY' : 'CUSTOM' },
    });

    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`page:${slug}`);
    } catch {}

    return NextResponse.json({ ok: true, page });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}


