import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { deleteFromS3 } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const s3Path = searchParams.get('s3Path');
    const mediaAssetId = searchParams.get('id');

    if (!s3Path && !mediaAssetId) {
      return NextResponse.json({ error: 'Missing s3Path or id parameter' }, { status: 400 });
    }

    let mediaAsset;

    // Find the media asset
    if (mediaAssetId) {
      mediaAsset = await prisma.mediaAsset.findUnique({
        where: { id: mediaAssetId }
      });
    } else if (s3Path) {
      mediaAsset = await prisma.mediaAsset.findUnique({
        where: { s3Path }
      });
    }

    if (!mediaAsset) {
      return NextResponse.json({ error: 'File not found in database' }, { status: 404 });
    }

    // Delete from S3
    await deleteFromS3(mediaAsset.s3Path);

    // Delete from database
    await prisma.mediaAsset.delete({
      where: { id: mediaAsset.id }
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
