import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePresignedUploadUrl } from '@/lib/s3';
import mime from 'mime-types';

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

    const { filename, folder = 'uploads', contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Generate unique S3 key
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `${folder}/${timestamp}_${sanitizedName}`;

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
