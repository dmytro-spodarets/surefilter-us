import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { generatePresignedUploadUrl } from '@/lib/s3';
import mime from 'mime-types';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'application/pdf',
  // Spreadsheets (Excel + CSV)
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/csv', // .csv
];

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { filename, folder = 'uploads', contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Validate folder path against traversal attacks
    const normalizedFolder = folder.replace(/\\/g, '/');
    if (normalizedFolder.includes('..') || normalizedFolder.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 });
    }

    // Generate unique S3 key
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `${normalizedFolder}/${timestamp}_${sanitizedName}`;

    // Generate presigned URL
    const presignedUrl = await generatePresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({
      presignedUrl,
      s3Key,
      filename: sanitizedName,
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
