import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Global for singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Lazy initialization to avoid errors during build
function createPrismaClient() {
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


