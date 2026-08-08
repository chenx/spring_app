import { NextResponse } from 'next/server'
import { setSessionToken } from '@/lib/session'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(request: Request) {
  const body = await request.json()

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const contentType = backendRes.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await backendRes.json().catch(() => null)
    : await backendRes.text().catch(() => null)

  if (!backendRes.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || 'Invalid username or password.'
    return NextResponse.json({ message }, { status: backendRes.status })
  }

  // The demo backend's login payload shape varies (raw token, {token}, or an
  // ApiResponse<{token}> envelope) — look for a token wherever it lives.
  const token = typeof payload === 'object' && payload !== null ? payload.token ?? payload.data?.token : undefined

  if (token) {
    await setSessionToken(token)
  }

  // Only a plain success message goes back to the browser — the token itself
  // never leaves the server, since the cookie holding it is httpOnly.
  return NextResponse.json({ message: 'Login successful!' })
}
