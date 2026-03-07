import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSiteSettingsCache } from '@/lib/site-settings';
import { z } from 'zod';
import { logAdminAction, getRequestMetadata } from '@/lib/admin-logger';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

const UpdateSettingsSchema = z.object({
  // Branding
  logoUrl: z.string().nullable().optional(),

  // Newsroom
  newsroomTitle: z.string().nullable().optional(),
  newsroomDescription: z.string().nullable().optional(),
  newsroomHeroImage: z.string().nullable().optional(),
  newsroomMetaTitle: z.string().nullable().optional(),
  newsroomMetaDesc: z.string().nullable().optional(),
  newsroomOgImage: z.string().nullable().optional(),

  // News Article Page
  newsArticleTitle: z.string().nullable().optional(),
  newsArticleDescription: z.string().nullable().optional(),
  newsArticleHeroImage: z.string().nullable().optional(),

  // Event Article Page
  eventArticleTitle: z.string().nullable().optional(),
  eventArticleDescription: z.string().nullable().optional(),
  eventArticleHeroImage: z.string().nullable().optional(),

  // Resources
  resourcesTitle: z.string().nullable().optional(),
  resourcesDescription: z.string().nullable().optional(),
  resourcesHeroImage: z.string().nullable().optional(),
  resourcesMetaTitle: z.string().nullable().optional(),
  resourcesMetaDesc: z.string().nullable().optional(),
  resourcesOgImage: z.string().nullable().optional(),
  
  // Navigation
  headerNavigation: z.array(z.object({
    label: z.string(),
    url: z.string(),
    order: z.number(),
    isActive: z.boolean().default(true),
    children: z.array(z.object({
      label: z.string(),
      url: z.string(),
      order: z.number(),
      isActive: z.boolean().default(true),
    })).optional(),
  })).optional(),
  
  // Footer
  footerContent: z.object({
    description: z.string().nullable().optional(),
    address: z.array(z.string()).optional(),
    phone: z.string().nullable().optional(),
    fax: z.string().nullable().optional(),
    phoneTollFree: z.string().nullable().optional(),
    aiAgent: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    companyLinks: z.array(z.object({
      name: z.string(),
      href: z.string(),
    })).optional(),
    socialLinks: z.array(z.object({
      name: z.string(),
      href: z.string(),
    })).optional(),
    appLinks: z.object({
      appStore: z.string().nullable().optional(),
      googlePlay: z.string().nullable().optional(),
    }).optional(),
    copyright: z.string().nullable().optional(),
    legalLinks: z.array(z.object({
      name: z.string(),
      href: z.string(),
    })).optional(),
  }).optional(),
  
  // Analytics
  gaMeasurementId: z.string().nullable().optional(),
  gtmId: z.string().nullable().optional(),
  termlyWebsiteUUID: z.string().nullable().optional(),

  // SEO
  seoRobotsBlock: z.boolean().optional(),
  llmsSiteDescription: z.string().nullable().optional(),

  // Default SEO Meta
  defaultMetaTitle: z.string().nullable().optional(),
  defaultMetaTitleSuffix: z.string().nullable().optional(),
  defaultMetaDesc: z.string().nullable().optional(),
  defaultMetaKeywords: z.string().nullable().optional(),

  // Security
  catalogPassword: z.string().nullable().optional(),
  catalogPasswordEnabled: z.boolean().optional(),

  // Redirects
  redirects: z.array(z.object({
    id: z.string().min(1),
    source: z.string().min(1).refine(val => val.startsWith('/'), {
      message: 'Source must start with /',
    }),
    destination: z.string().min(1).refine(val => val.startsWith('/') || val.startsWith('http'), {
      message: 'Destination must start with / or http',
    }),
    statusCode: z.union([z.literal(301), z.literal(302)]),
    isActive: z.boolean(),
    comment: z.string().optional(),
  })).optional(),
}).strict();

// GET /api/admin/site-settings - Get current settings
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'site_settings' },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'site_settings',
          logoUrl: 'images/sf-logo.png',
          newsroomTitle: 'Newsroom',
          newsroomDescription: 'Latest news and updates from Sure Filter',
          resourcesTitle: 'Resources',
          resourcesDescription: 'Download our catalogs, guides, and technical documentation',
          headerNavigation: [
            { label: 'Home', url: '/', order: 1, isActive: true },
            { label: 'Heavy Duty', url: '/heavy-duty', order: 2, isActive: true },
            { label: 'Automotive', url: '/automotive', order: 3, isActive: true },
            { label: 'Industries', url: '/industries', order: 4, isActive: true },
            { label: 'About Us', url: '/about-us', order: 5, isActive: true },
            { label: 'Contact Us', url: '/contact-us', order: 6, isActive: true },
          ],
          footerContent: {
            description: 'Your trusted partner for superior filtration solutions. Premium quality, performance, and reliability for the world\'s toughest applications.',
            address: [
              '1470 Civic Dr. STE 309',
              'Concord, CA 94520',
            ],
            phone: '+1 (925) 566-8863/73',
            fax: '+1 (925) 566-8893',
            phoneTollFree: '+1 8448 BE SURE',
            aiAgent: 'Phil, our AI Service Agent: +1-651-273-9232',
            email: 'order@surefilter.us',
            companyLinks: [
              { name: 'About Us', href: '/about-us' },
              { name: 'Contact Us', href: '/contact-us' },
              { name: 'Newsroom', href: '/newsroom' },
              { name: 'Warranty', href: '/warranty' },
              { name: 'Resources', href: '/resources' },
              { name: 'Catalog', href: '/catalog' },
            ],
            socialLinks: [
              { name: 'LinkedIn', href: '#' },
              { name: 'Facebook', href: '#' },
            ],
            appLinks: {
              appStore: '#',
              googlePlay: '#',
            },
            copyright: '© 2025 Sure Filter®. All rights reserved.',
            legalLinks: [
              { name: 'Privacy Policy', href: '/privacy' },
              { name: 'Terms of Use', href: '/terms' },
            ],
          },
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/site-settings - Update settings
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  try {

    const body = await request.json();
    const data = UpdateSettingsSchema.parse(body);

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'site_settings' },
      update: data,
      create: {
        id: 'site_settings',
        ...data,
      },
    });

    // Log action
    const metadata = getRequestMetadata(request);
    await logAdminAction({
      userId: auth.user.id,
      action: 'UPDATE',
      entityType: 'Settings',
      entityId: 'site_settings',
      entityName: 'Site Settings',
      details: { changedFields: Object.keys(data) },
      ...metadata,
    });

    // Clear in-memory cache
    clearSiteSettingsCache();
    // Invalidate ISR + CloudFront — site settings affect all pages (header, footer, meta, logo)
    try {
      const { revalidatePath } = await import('next/cache');
      revalidatePath('/', 'layout'); // Invalidates ALL ISR pages under root layout

      // CloudFront wildcard invalidation
      const distId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
      if (distId) {
        const { CloudFrontClient, CreateInvalidationCommand } = await import('@aws-sdk/client-cloudfront');
        const cf = new CloudFrontClient({ region: process.env.AWS_REGION || 'us-east-1' });
        await cf.send(new CreateInvalidationCommand({
          DistributionId: distId,
          InvalidationBatch: {
            Paths: { Quantity: 1, Items: ['/*'] },
            CallerReference: `settings-${Date.now()}`,
          },
        }));
      }
    } catch (e) {
      console.error('Revalidation error:', e);
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

