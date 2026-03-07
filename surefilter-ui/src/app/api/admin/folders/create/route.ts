import { NextRequest, NextResponse } from 'next/server';
import { createS3Folder } from '@/lib/s3';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import path from 'path';

function isSafePath(p: string): boolean {
  if (!p) return true;
  const normalized = path.posix.normalize(p);
  return !normalized.startsWith('..') && !normalized.includes('/../') && !normalized.startsWith('/');
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { folderName, parentPath = '' } = await request.json();

    if (!folderName) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    // Validate folder name (no special characters, spaces allowed)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(folderName)) {
      return NextResponse.json({
        error: 'Folder name can only contain letters, numbers, spaces, hyphens, and underscores'
      }, { status: 400 });
    }

    // Prevent path traversal
    if (!isSafePath(parentPath)) {
      return NextResponse.json({ error: 'Invalid parent path' }, { status: 400 });
    }

    // Create folder path
    const folderPath = path.posix.normalize(parentPath ? `${parentPath}/${folderName}` : folderName);

    // Create folder in S3 (creates a placeholder object)
    await createS3Folder(folderPath);

    return NextResponse.json({
      success: true,
      folder: {
        name: folderName,
        path: folderPath,
        parentPath
      }
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
