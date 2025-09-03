import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

function buildFullSlug(category: 'HEAVY_DUTY' | 'AUTOMOTIVE', parentFull?: string, slug?: string) {
  const root = category === 'HEAVY_DUTY' ? 'heavy-duty' : 'automotive';
  if (parentFull) return `${parentFull}/${slug}`;
  return `${root}/${slug}`;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') as 'HEAVY_DUTY' | 'AUTOMOTIVE') || 'HEAVY_DUTY';
  const items = await prisma.filterType.findMany({ where: { category }, orderBy: [{ parentId: 'asc' }, { position: 'asc' }, { name: 'asc' }] });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { category, parentId, slug, name, description, icon, heroImage, position } = body ?? {};
  if (!category || !slug || !name) return NextResponse.json({ error: 'category, slug, name required' }, { status: 400 });
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  const parent = parentId ? await prisma.filterType.findUnique({ where: { id: parentId } }) : null;
  const fullSlug = buildFullSlug(category, parent?.fullSlug, slug);
  try {
    const created = await prisma.filterType.create({
      data: { category, parentId: parentId || null, slug, name, description: description || null, icon: icon || null, heroImage: heroImage || null, position: position || 0, fullSlug },
    });
    return NextResponse.json({ ok: true, item: created });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create', detail: e?.message }, { status: 400 });
  }
}


