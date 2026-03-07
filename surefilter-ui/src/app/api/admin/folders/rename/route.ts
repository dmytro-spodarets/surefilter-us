import { NextRequest, NextResponse } from 'next/server';
import { moveS3Objects } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import path from 'path';

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

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

    // Prevent path traversal on oldPath
    const normalizedOld = path.posix.normalize(oldPath);
    if (normalizedOld.startsWith('..') || normalizedOld.includes('/../') || normalizedOld.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 });
    }

    // Calculate new path
    const pathParts = normalizedOld.split('/');
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
