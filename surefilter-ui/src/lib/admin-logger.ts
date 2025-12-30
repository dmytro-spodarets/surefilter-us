import { prisma } from './prisma';
import { AdminAction } from '@/generated/prisma';

interface LogParams {
  userId: string;
  action: AdminAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin action to database
 */
export async function logAdminAction(params: LogParams) {
  try {
    await prisma.adminLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging should not break the main flow
  }
}

/**
 * Extract IP and User Agent from Next.js request
 */
export function getRequestMetadata(request: Request) {
  const headers = request.headers;
  const ipAddress = headers.get('x-forwarded-for')?.split(',')[0] || 
                    headers.get('x-real-ip') || 
                    'unknown';
  const userAgent = headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}
