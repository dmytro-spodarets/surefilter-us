import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://surefilter.us';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/newsroom`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // CMS pages
  const pages = await prisma.page.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  });

  const cmsPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Products
  const products = await prisma.product.findMany({
    select: { code: true, updatedAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.code}`,
    lastModified: product.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // News articles
  const articles = await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    select: { slug: true, updatedAt: true },
  });

  const newsPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/newsroom/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Resources
  const resources = await prisma.resource.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      slug: true,
      updatedAt: true,
      category: { select: { slug: true } },
    },
  });

  const resourcePages: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${baseUrl}/resources/${resource.category.slug}/${resource.slug}`,
    lastModified: resource.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...cmsPages, ...productPages, ...newsPages, ...resourcePages];
}
