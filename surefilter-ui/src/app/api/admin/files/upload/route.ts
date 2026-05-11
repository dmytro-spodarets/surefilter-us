import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';
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
    // Read JWT via cookies() + decode() — neither touches the request body.
    // getServerSession() and getToken({ req }) both peek at the request object,
    // which on a multipart POST locks the undici stream before request.formData()
    // can read it (Next.js 15.5.x bug #83453, next-auth #11389). Middleware already
    // enforces auth for /api/admin/*, this is defense-in-depth role check.
    const cookieStore = await cookies();
    const sessionCookie =
      cookieStore.get('__Secure-next-auth.session-token')?.value ||
      cookieStore.get('next-auth.session-token')?.value;
    const token = sessionCookie
      ? await decode({ token: sessionCookie, secret: process.env.NEXTAUTH_SECRET! })
      : null;
    if (!token || (token as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const rawFolder = (formData.get('folder') as string || '').replace(/\\/g, '/');
    const altText = formData.get('altText') as string || '';
    const tags = formData.get('tags') as string || '';

    // Prevent path traversal in folder param
    const folder = rawFolder.split('/').filter(seg => seg && seg !== '.' && seg !== '..').join('/');
    if (rawFolder !== folder && rawFolder !== '') {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 });
    }

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
        uploadedBy: (token as any).userId ?? (token.sub as string),
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
