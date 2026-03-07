import { NextResponse } from 'next/server';
import { requireAdmin, isUnauthorized } from '@/lib/require-admin';

// GET /api/admin/config/tinymce - Get TinyMCE API key (admin only)
export async function GET() {
  const auth = await requireAdmin();
  if (isUnauthorized(auth)) return auth;

  const apiKey = process.env.TINYMCE_API_KEY || '';
  return NextResponse.json({ apiKey });
}
