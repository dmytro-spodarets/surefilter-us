import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteS3Folder } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('path');

    if (!folderPath) {
      return NextResponse.json({ error: 'Folder path is required' }, { status: 400 });
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
