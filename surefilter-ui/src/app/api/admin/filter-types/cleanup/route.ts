import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Find all filter types with no linked page
    const orphanedFilterTypes = await prisma.filterType.findMany({
      where: { pageSlug: null },
      select: { id: true, name: true, category: true }
    });

    if (orphanedFilterTypes.length === 0) {
      return NextResponse.json({ ok: true, message: 'No orphaned filter types found' });
    }

    // Delete orphaned filter types
    const deletedCount = await prisma.filterType.deleteMany({
      where: { pageSlug: null }
    });

    return NextResponse.json({ 
      ok: true, 
      message: `Deleted ${deletedCount.count} orphaned filter types`,
      deleted: orphanedFilterTypes.map(ft => ({
        name: ft.name,
        category: ft.category
      }))
    });
  } catch (e: any) {
    console.error('Cleanup orphaned filter types error:', e);
    return NextResponse.json({ error: 'Failed to cleanup', detail: e?.message }, { status: 500 });
  }
}
