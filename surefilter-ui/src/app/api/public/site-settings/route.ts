import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/site-settings';

// GET /api/public/site-settings - Public endpoint for client-side components
export async function GET(request: NextRequest) {
  try {
    const settings = await getSiteSettings();
    
    // Return only public-facing settings
    return NextResponse.json({
      newsroom: {
        title: settings.newsroomTitle || 'Newsroom',
        description: settings.newsroomDescription || 'Stay updated with our upcoming events, exhibitions, and latest press releases.',
        heroImage: settings.newsroomHeroImage,
      },
      resources: {
        title: settings.resourcesTitle || 'Resources',
        description: settings.resourcesDescription || 'Access technical documentation, installation guides, product catalogs, and educational materials to help you get the most from your Sure Filter® products.',
        heroImage: settings.resourcesHeroImage,
      },
      navigation: settings.headerNavigation?.filter(item => item.isActive).sort((a, b) => a.order - b.order) || [],
      footer: settings.footerContent || {},
    });
  } catch (error) {
    console.error('Error fetching public site settings:', error);
    
    // Return defaults on error
    return NextResponse.json({
      newsroom: {
        title: 'Newsroom',
        description: 'Stay updated with our upcoming events, exhibitions, and latest press releases.',
        heroImage: null,
      },
      resources: {
        title: 'Resources',
        description: 'Access technical documentation, installation guides, product catalogs, and educational materials.',
        heroImage: null,
      },
      navigation: [
        { label: 'HOME', url: '/', order: 0, isActive: true },
        { label: 'HEAVY DUTY', url: '/heavy-duty', order: 1, isActive: true },
        { label: 'AUTOMOTIVE', url: '/automotive', order: 2, isActive: true },
        { label: 'INDUSTRIES', url: '/industries', order: 3, isActive: true },
        { label: 'ABOUT US', url: '/about-us', order: 4, isActive: true },
        { label: 'CONTACT US', url: '/contact-us', order: 5, isActive: true },
      ],
      footer: {},
    });
  }
}

