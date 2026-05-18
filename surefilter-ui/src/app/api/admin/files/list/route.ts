import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';
import { listS3Objects } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isUnauthorized(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '50');
    const continuationToken = searchParams.get('continuationToken') || undefined;
    const searchQuery = searchParams.get('search') || '';

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
    let filesWithMetadata = s3Result.files.map(file => {
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

    // Filter by search query if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filesWithMetadata = filesWithMetadata.filter(file => {
        const filename = file.metadata?.filename || file.key;
        return filename.toLowerCase().includes(query);
      });
    }

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
