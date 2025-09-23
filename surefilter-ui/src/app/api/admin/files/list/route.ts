import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listS3Objects } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '50');
    const continuationToken = searchParams.get('continuationToken') || undefined;

    // Get files from S3
    const s3Result = await listS3Objects(prefix, maxKeys, continuationToken);

    // Get metadata from database for these files
    const fileKeys = s3Result.files.map(f => f.key);
    const mediaAssets = await prisma.mediaAsset.findMany({
      where: {
        s3Path: {
          in: fileKeys
        }
      }
    });

    // Merge S3 data with database metadata
    const filesWithMetadata = s3Result.files.map(file => {
      const metadata = mediaAssets.find(asset => asset.s3Path === file.key);
      return {
        ...file,
        metadata: metadata ? {
          id: metadata.id,
          filename: metadata.filename,
          altText: metadata.altText,
          tags: metadata.tags,
          width: metadata.width,
          height: metadata.height,
          mimeType: metadata.mimeType,
          cdnUrl: metadata.cdnUrl,
        } : null
      };
    });

    return NextResponse.json({
      files: filesWithMetadata,
      folders: s3Result.folders,
      hasMore: s3Result.hasMore,
      nextToken: s3Result.nextToken,
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
