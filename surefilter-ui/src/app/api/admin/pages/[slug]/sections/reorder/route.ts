import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { sectionId, direction } = await req.json();
  if (!sectionId || !['up', 'down'].includes(direction)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { slug },
    include: { sections: { orderBy: { position: 'asc' } } },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const list = page.sections;
  const idx = list.findIndex((ps) => ps.sectionId === sectionId);
  if (idx === -1) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

  const swapWith = direction === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= list.length) {
    return NextResponse.json({ ok: true, noop: true });
  }

  const a = list[idx];
  const b = list[swapWith];

  await prisma.$transaction([
    prisma.pageSection.update({ where: { id: a.id }, data: { position: b.position } }),
    prisma.pageSection.update({ where: { id: b.id }, data: { position: a.position } }),
  ]);

  try {
    const { revalidateTag } = await import('next/cache');
    revalidateTag(`page:${slug}`);
  } catch {}

  return NextResponse.json({ ok: true });
}


