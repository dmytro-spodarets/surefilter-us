import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const UpdateSpecParamSchema = z.object({
  name: z.string().min(1).optional(),
  unit: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  position: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await prisma.specParameter.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: Request, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await req.json();
  const parse = UpdateSpecParamSchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: 'Invalid payload', issues: parse.error.flatten() }, { status: 400 });
  try {
    const updated = await prisma.specParameter.update({ where: { id: params.id }, data: parse.data });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update', detail: e?.message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await prisma.specParameter.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete', detail: e?.message }, { status: 400 });
  }
}
