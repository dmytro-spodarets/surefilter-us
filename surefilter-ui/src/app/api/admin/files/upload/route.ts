import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import mime from 'mime-types';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'application/pdf'
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || '';
    const altText = formData.get('altText') as string || '';
    const tags = formData.get('tags') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    // Validate file type
    const mimeType = mime.lookup(file.name) || file.type;
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Create S3 key with folder structure
    const timestamp = Date.now();
    
    // Handle files without proper names (e.g., from paste/drag-drop)
    let finalName = file.name;
    if (!finalName || finalName === 'blob' || finalName === 'image.png') {
      const ext = mime.extension(mimeType) || 'bin';
      finalName = `file-${timestamp}.${ext}`;
    } else {
      // For files with proper names, keep original name but sanitize it
      const nameParts = finalName.split('.');
      const extension = nameParts.pop();
      const baseName = nameParts.join('.').replace(/[^a-zA-Z0-9-]/g, '_');
      finalName = `${baseName}.${extension}`;
    }
    
    const s3Key = folder ? `${folder}/${finalName}` : finalName;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const cdnUrl = await uploadToS3(s3Key, buffer, mimeType);

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;

    if (mimeType.startsWith('image/') && mimeType !== 'image/svg+xml') {
      try {
        // For production, you might want to use a proper image processing library
        // For now, we'll skip dimensions extraction
      } catch (error) {
        console.warn('Could not extract image dimensions:', error);
      }
    }

    // Save metadata to database
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        s3Path: s3Key,
        cdnUrl,
        mimeType,
        fileSize: file.size,
        width,
        height,
        altText: altText || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        folder,
        uploadedBy: (session as any).userId,
      }
    });

    return NextResponse.json({
      success: true,
      file: {
        id: mediaAsset.id,
        filename: mediaAsset.filename,
        s3Path: mediaAsset.s3Path,
        cdnUrl: mediaAsset.cdnUrl,
        mimeType: mediaAsset.mimeType,
        fileSize: mediaAsset.fileSize,
        width: mediaAsset.width,
        height: mediaAsset.height,
        altText: mediaAsset.altText,
        tags: mediaAsset.tags,
        folder: mediaAsset.folder,
        createdAt: mediaAsset.createdAt,
      }
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
