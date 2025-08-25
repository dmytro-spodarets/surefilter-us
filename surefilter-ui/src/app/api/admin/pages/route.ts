import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const RESERVED_SLUGS = new Set([
  'admin', 'api', 'login', 'logout', 'health',
  // existing static routes
  'about-us', 'contact-us', 'catalog', 'filters', 'industries', 'resources', 'warranty', 'newsroom', 'heavy-duty', 'automotive', 'test-colors',
  // root
  '',
]);

function isValidSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  let { slug, title, description, ogImage } = body ?? {};
  if (typeof slug === 'string') slug = slug.trim();
  if (!isValidSlug(slug || '')) {
    return NextResponse.json({ error: 'Invalid or reserved slug. Use lowercase letters, numbers, and dashes only.' }, { status: 400 });
  }
  if (!title || typeof title !== 'string') title = slug.replace(/-/g, ' ').replace(/\b\w/g, (m: string) => m.toUpperCase());

  try {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

    const page = await prisma.page.create({
      data: { slug, title, description: description || null, ogImage: ogImage || null },
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


