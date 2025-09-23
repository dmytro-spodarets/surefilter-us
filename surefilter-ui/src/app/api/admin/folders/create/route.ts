import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createS3Folder } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Create folder path
    const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;

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
