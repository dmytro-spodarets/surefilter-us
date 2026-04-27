import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const bannerId = searchParams.get('bannerId');

    const where: any = {};
    if (bannerId) where.bannerId = bannerId;

    const submissions = await prisma.bannerSubmission.findMany({
      where,
      include: { banner: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (submissions.length === 0) {
      return NextResponse.json({ error: 'No submissions found' }, { status: 404 });
    }

    const headers = [
      'Submission ID', 'Banner Name', 'Banner Slug', 'Email', 'Submitted At',
      'Page URL', 'Referer', 'UTM Source', 'UTM Medium', 'UTM Campaign',
      'IP Address', 'User Agent', 'Email Sent', 'Email Error',
    ];

    const rows = submissions.map((s) => {
      const utm = (s.utmParams as Record<string, string> | null) || {};
      return [
        s.id,
        s.banner.name,
        s.banner.slug,
        s.email,
        s.createdAt.toISOString(),
        s.pageUrl || '',
        s.referer || '',
        utm.utm_source || '',
        utm.utm_medium || '',
        utm.utm_campaign || '',
        s.ipAddress || '',
        s.userAgent || '',
        s.emailSent ? 'Yes' : 'No',
        s.emailError || '',
      ];
    });

    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="banner-submissions-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting banner submissions:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
