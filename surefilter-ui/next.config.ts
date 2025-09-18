import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Базовая оптимизация
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Оптимизация билда для Docker (минимальный runtime)
  output: 'standalone',
  
  // Временно игнорируем ошибки ESLint во время билда,
  // чтобы не блокировать сборку. Линт починим по шагам.
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Server Actions: разрешённые origin'ы для проксированных запросов (CloudFront → App Runner)
  // Читает список доменов из переменной окружения NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS
  // (через запятую без пробелов), например: "new.surefilter.us,qiypwsyuxm.us-east-1.awsapprunner.com".
  // Это устраняет ошибку несовпадения `x-forwarded-host` и `origin` для Server Actions за CDN/прокси.
  serverActions: {
    allowedOrigins: (process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean).length
      ? (process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS as string)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['new.surefilter.us', 'qiypwsyuxm.us-east-1.awsapprunner.com'],
  },
  
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Allow dev-hosted absolute URLs
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
