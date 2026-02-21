import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Global for singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Build-time stub: returns a Proxy that throws on any model method call
// without attempting a real DB connection (no TLS errors in build logs).
// Pages catch these errors and render with empty data during build.
// Post-deploy warm-up (/api/warm-up) calls revalidatePath to refresh ISR cache.
function createBuildTimeStub(): PrismaClient {
  const buildError = new Error('Database not available during build');
  const modelProxy = new Proxy({}, {
    get() {
      return () => { throw buildError; };
    },
  });
  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (typeof prop === 'string' && prop.startsWith('$')) {
        return () => Promise.resolve();
      }
      return modelProxy;
    },
  });
}

// Lazy initialization to avoid errors during build
function createPrismaClient(): PrismaClient {
  // During Docker build, skip real DB connections entirely
  if (process.env.NEXT_BUILD_SKIP_DB === '1') {
    return createBuildTimeStub();
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // SSL configuration for AWS RDS
  // In production, require SSL but don't verify certificate (AWS RDS uses self-signed certs)
  // This still encrypts the connection, which is the main security goal
  const sslConfig = process.env.NODE_ENV === 'production'
    ? {
        rejectUnauthorized: false,
        // AWS RDS certificates are self-signed and not in Node.js CA bundle
        // Connection is still encrypted, just not verified against CA
      }
    : false; // Local development without SSL

  // Reuse pool across hot reloads
  const pool = globalForPrisma.pool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool;
  }

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create Prisma Client with adapter
  return new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  });
}

// Export prisma client
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;


