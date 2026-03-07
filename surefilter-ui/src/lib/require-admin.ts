import 'server-only';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export type AdminSession = {
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'ADMIN';
  };
};

/**
 * Checks that the current request has a valid admin session.
 * Returns the typed session on success, or a 401 NextResponse on failure.
 */
export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return {
    user: {
      id: (session as any).userId ?? session.user.id,
      email: session.user.email!,
      name: session.user.name ?? undefined,
      role: 'ADMIN',
    },
  } as AdminSession;
}

/** Type guard: true when requireAdmin() returned an error response */
export function isUnauthorized(
  result: AdminSession | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
