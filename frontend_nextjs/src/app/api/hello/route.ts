import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export async function GET() {
  const res = await backendFetch('/api/hello')

  // 1. Read the raw text from the backend
  const textData = await res.text();

  // 2. Identify the backend content type (default to plain text if missing)
  const contentType = res.headers.get('content-type') || 'text/plain';

  // 3. Return the response with the exact same content type and status
  return new NextResponse(textData, {
    status: res.status,
    headers: {
      'content-type': contentType,
    },
  });
}
