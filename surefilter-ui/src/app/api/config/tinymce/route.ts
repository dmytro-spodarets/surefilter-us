import { NextResponse } from 'next/server';

/**
 * GET /api/config/tinymce
 * Returns TinyMCE configuration including API key
 * This allows the API key to be read from runtime environment
 * instead of being baked into the build
 */
export async function GET() {
  return NextResponse.json({
    apiKey: process.env.TINYMCE_API_KEY || 'no-api-key',
  });
}
