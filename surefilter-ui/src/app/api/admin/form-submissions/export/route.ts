import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/form-submissions/export - Export submissions to CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');

    const where: any = {};

    if (formId) {
      where.formId = formId;
    }

    // Get submissions
    const submissions = await prisma.formSubmission.findMany({
      where,
      include: {
        form: {
          select: {
            name: true,
            fields: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (submissions.length === 0) {
      return NextResponse.json(
        { error: 'No submissions found' },
        { status: 404 }
      );
    }

    // Extract all unique field keys from submissions
    const fieldKeys = new Set<string>();
    submissions.forEach(sub => {
      const data = sub.data as Record<string, any>;
      Object.keys(data).forEach(key => fieldKeys.add(key));
    });

    // Build CSV header
    const headers = [
      'Submission ID',
      'Form Name',
      'Submitted At',
      ...Array.from(fieldKeys),
      'IP Address',
      'User Agent',
      'Referer',
      'Webhook Sent',
      'Webhook Error',
      'Email Sent',
      'Email Error',
    ];

    // Build CSV rows
    const rows = submissions.map(sub => {
      const data = sub.data as Record<string, any>;
      return [
        sub.id,
        sub.form.name,
        sub.createdAt.toISOString(),
        ...Array.from(fieldKeys).map(key => {
          const value = data[key];
          // Handle different data types
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        }),
        sub.ipAddress || '',
        sub.userAgent || '',
        sub.referer || '',
        sub.webhookSent ? 'Yes' : 'No',
        sub.webhookError || '',
        sub.emailSent ? 'Yes' : 'No',
        sub.emailError || '',
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="form-submissions-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting submissions:', error);
    return NextResponse.json(
      { error: 'Failed to export submissions' },
      { status: 500 }
    );
  }
}

