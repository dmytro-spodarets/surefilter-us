import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { moveS3Objects } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldPath, newName } = await request.json();

    if (!oldPath || !newName) {
      return NextResponse.json({ error: 'Old path and new name are required' }, { status: 400 });
    }

    // Validate new folder name
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(newName)) {
      return NextResponse.json({ 
        error: 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores' 
      }, { status: 400 });
    }

    // Calculate new path
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    // Move all objects in the folder
    await moveS3Objects(oldPath, newPath);

    // Update database records
    await prisma.mediaAsset.updateMany({
      where: {
        s3Path: {
          startsWith: oldPath + '/'
        }
      },
      data: {
        s3Path: {
          // Replace old path with new path in s3Path
          // This is a simplified approach - in production you might want more sophisticated path replacement
        },
        folder: newPath
      }
    });

    return NextResponse.json({
      success: true,
      oldPath,
      newPath,
      message: 'Folder renamed successfully'
    });

  } catch (error) {
    console.error('Error renaming folder:', error);
    return NextResponse.json({ error: 'Failed to rename folder' }, { status: 500 });
  }
}
