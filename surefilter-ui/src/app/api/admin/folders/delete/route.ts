import { NextRequest, NextResponse } from 'next/server';
import { deleteS3Folder } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('path');

    if (!folderPath) {
      return NextResponse.json({ error: 'Folder path is required' }, { status: 400 });
    }

    // Prevent path traversal
    const normalized = path.posix.normalize(folderPath);
    if (normalized.startsWith('..') || normalized.includes('/../') || normalized.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 });
    }

    // Check if folder contains files
    const filesInFolder = await prisma.mediaAsset.findMany({
      where: {
        s3Path: {
          startsWith: folderPath + '/'
        }
      }
    });

    if (filesInFolder.length > 0) {
      // Delete all files in the folder first
      for (const file of filesInFolder) {
        await prisma.mediaAsset.delete({
          where: { id: file.id }
        });
      }
    }

    // Delete folder from S3
    await deleteS3Folder(folderPath);

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
