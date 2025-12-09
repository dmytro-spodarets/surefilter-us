import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use process.env directly for Docker builds where DATABASE_URL may not be set during `prisma generate`
    // See: https://www.prisma.io/docs/orm/reference/prisma-config-reference#handling-optional-environment-variables
    url: process.env.DATABASE_URL || '',
  },
});
