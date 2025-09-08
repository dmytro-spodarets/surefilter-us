import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ImageSchema = z.object({ src: z.string().min(1), alt: z.string().optional().default('') });
const SpecSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });
const OemSchema = z.object({ number: z.string().min(1), manufacturer: z.string().optional().default('') });

const SpecValueSchema = z.object({
  parameterId: z.string().min(1),
  value: z.string().min(1),
  unitOverride: z.string().optional().nullable(),
  position: z.number().int().optional().default(0),
});

const UpdateProductSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.enum(['HEAVY_DUTY', 'AUTOMOTIVE']).optional().nullable(),
  filterTypeId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  images: z.array(ImageSchema).optional(),
  specsLeft: z.array(SpecSchema).optional(),
  specsRight: z.array(SpecSchema).optional(),
  oems: z.array(OemSchema).optional(),
  tags: z.array(z.string()).optional(),
  manufacturer: z.string().optional().nullable(),
  industries: z.array(z.string()).optional(),
  heightMm: z.number().optional().nullable(),
  odMm: z.number().optional().nullable(),
  idMm: z.number().optional().nullable(),
  thread: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  specValues: z.array(SpecValueSchema).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const item = await prisma.product.findUnique({
      where: { id },
      include: {
        filterType: true,
        specValues: { include: { parameter: true }, orderBy: { position: 'asc' } },
      },
    });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch', detail: e?.message }, { status: 400 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          code: data.code ?? undefined,
          name: data.name ?? undefined,
          description: data.description ?? undefined,
          category: data.category ?? undefined,
          filterTypeId: data.filterTypeId ?? undefined,
          status: data.status ?? undefined,
          images: data.images ?? undefined,
          specsLeft: data.specsLeft ?? undefined,
          specsRight: data.specsRight ?? undefined,
          oems: data.oems ?? undefined,
          tags: data.tags ?? undefined,
          manufacturer: data.manufacturer ?? undefined,
          industries: data.industries ?? undefined,
          heightMm: data.heightMm ?? undefined,
          odMm: data.odMm ?? undefined,
          idMm: data.idMm ?? undefined,
          thread: data.thread ?? undefined,
          model: data.model ?? undefined,
        },
      });
      if (data.specValues) {
        await tx.productSpecValue.deleteMany({ where: { productId: id } });
        if (data.specValues.length) {
          await tx.productSpecValue.createMany({
            data: data.specValues.map((sv) => ({
              productId: id,
              parameterId: sv.parameterId,
              value: sv.value,
              unitOverride: sv.unitOverride ?? null,
              position: sv.position ?? 0,
            })),
          });
        }
      }
      return p;
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update', detail: e?.message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete', detail: e?.message }, { status: 400 });
  }
}
