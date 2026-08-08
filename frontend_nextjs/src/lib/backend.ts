import { getSessionToken } from '@/lib/session'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

// The one place that talks to the real Spring Boot API. Every Next.js route
// handler under app/api/* goes through this instead of the browser calling
// the backend directly — that's the BFF layer: the session token lives in an
// httpOnly cookie and only ever gets attached to outbound requests here.
export async function backendFetch(path: string, init: RequestInit = {}) {
  const token = await getSessionToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })
}
