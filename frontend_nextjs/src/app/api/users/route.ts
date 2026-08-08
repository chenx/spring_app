import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export async function GET() {
  const res = await backendFetch('/api/users')
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: Request) {
  const body = await request.json()
  const res = await backendFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
