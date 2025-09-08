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

const CreateProductSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(['HEAVY_DUTY', 'AUTOMOTIVE']).optional().nullable(),
  filterTypeId: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  images: z.array(ImageSchema).default([]),
  specsLeft: z.array(SpecSchema).default([]),
  specsRight: z.array(SpecSchema).default([]),
  oems: z.array(OemSchema).default([]),
  tags: z.array(z.string()).optional().default([]),
  manufacturer: z.string().optional().nullable(),
  industries: z.array(z.string()).optional().default([]),
  heightMm: z.number().optional().nullable(),
  odMm: z.number().optional().nullable(),
  idMm: z.number().optional().nullable(),
  thread: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  specValues: z.array(SpecValueSchema).optional().default([]),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') as 'HEAVY_DUTY' | 'AUTOMOTIVE' | null;
  const filterTypeId = searchParams.get('filterTypeId');
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '20', 10), 1), 100);
  const sort = (searchParams.get('sort') ?? 'code') as 'code' | 'name' | 'createdAt';
  const dir = (searchParams.get('dir') ?? 'asc') as 'asc' | 'desc';

  const where: any = {};
  if (q) {
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (category === 'HEAVY_DUTY' || category === 'AUTOMOTIVE') {
    where.category = category;
  }
  if (filterTypeId) where.filterTypeId = filterTypeId;

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        filterType: true,
        specValues: { include: { parameter: true }, orderBy: { position: 'asc' } },
      },
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          code: data.code,
          name: data.name,
          description: data.description ?? null,
          category: data.category ?? null,
          filterTypeId: data.filterTypeId ?? null,
          status: data.status ?? null,
          images: data.images,
          specsLeft: data.specsLeft,
          specsRight: data.specsRight,
          oems: data.oems,
          tags: data.tags ?? [],
          manufacturer: data.manufacturer ?? null,
          industries: data.industries ?? [],
          heightMm: data.heightMm ?? null,
          odMm: data.odMm ?? null,
          idMm: data.idMm ?? null,
          thread: data.thread ?? null,
          model: data.model ?? null,
        },
      });
      if ((data.specValues || []).length) {
        await tx.productSpecValue.createMany({
          data: (data.specValues || []).map((sv) => ({
            productId: p.id,
            parameterId: sv.parameterId,
            value: sv.value,
            unitOverride: sv.unitOverride ?? null,
            position: sv.position ?? 0,
          })),
          skipDuplicates: true,
        });
      }
      return p;
    });
    return NextResponse.json({ ok: true, item: created });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create', detail: e?.message }, { status: 400 });
  }
}
