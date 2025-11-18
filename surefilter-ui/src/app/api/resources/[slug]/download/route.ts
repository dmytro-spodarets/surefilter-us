import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePresignedDownloadUrl } from '@/lib/s3';

// POST /api/resources/[slug]/download - Generate presigned download URL
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Get resource
    const resource = await prisma.resource.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(),
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Verify submission exists and belongs to this resource's form
    const submission = await prisma.formSubmission.findFirst({
      where: {
        id: submissionId,
        form: {
          resources: {
            some: {
              id: resource.id,
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 403 }
      );
    }

    // Generate presigned download URL (15 minutes expiry)
    const downloadUrl = await generatePresignedDownloadUrl(resource.file, 900);

    return NextResponse.json({
      downloadUrl,
      fileName: resource.file.split('/').pop(),
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      expiresIn: 900, // 15 minutes
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

