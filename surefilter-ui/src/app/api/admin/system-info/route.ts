import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Test database connection
    let databaseStatus = 'unknown';
    let databaseError = null;
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error: any) {
      databaseStatus = 'error';
      databaseError = error.message;
    }

    // Get basic system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: databaseStatus,
        error: databaseError
      },
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
      memory: {
        used: process.memoryUsage ? `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB` : 'unknown',
        total: process.memoryUsage ? `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB` : 'unknown'
      }
    };

    return NextResponse.json(systemInfo);

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to get system info', 
      details: error.message 
    }, { status: 500 });
  }
}
