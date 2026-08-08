import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/backend'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const res = await backendFetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const res = await backendFetch(`/api/users/${id}`, { method: 'DELETE' })
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
