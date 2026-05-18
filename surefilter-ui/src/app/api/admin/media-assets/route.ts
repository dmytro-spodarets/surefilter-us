import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
    }

    const ids = idsParam.split(',').filter(Boolean);
    
    const assets = await prisma.mediaAsset.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        s3Path: true,
        cdnUrl: true,
        filename: true,
        mimeType: true,
        width: true,
        height: true,
      },
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error fetching media assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media assets' },
      { status: 500 }
    );
  }
}
