import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const CreateSpecParamSchema = z.object({
  name: z.string().min(1),
  unit: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  position: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const active = searchParams.get('active');
  const where: any = {};
  if (category) where.category = category;
  if (active === 'true') where.isActive = true;
  if (active === 'false') where.isActive = false;
  const items = await prisma.specParameter.findMany({
    where,
    orderBy: [{ category: 'asc' }, { position: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await req.json();
  const parse = CreateSpecParamSchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: 'Invalid payload', issues: parse.error.flatten() }, { status: 400 });
  const data = parse.data;
  try {
    const created = await prisma.specParameter.create({
      data: {
        name: data.name,
        unit: data.unit ?? null,
        category: data.category ?? null,
        position: data.position ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json({ ok: true, item: created });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create', detail: e?.message }, { status: 400 });
  }
}
