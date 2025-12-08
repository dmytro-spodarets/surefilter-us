import { defineConfig } from 'prisma/config';

// Debug: check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set in prisma.config.ts');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // DATABASE_URL will be read from environment variable
    url: process.env.DATABASE_URL || '',
  },
});
