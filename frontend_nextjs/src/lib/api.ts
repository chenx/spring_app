import type { ApiResponse, User, UserRequest } from '@/types'

// Client components call these — they hit our own Next.js API routes
// (the BFF), never the Spring Boot backend directly, so no Authorization
// header handling is needed here; the server attaches it from the cookie.
async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      // Clear the httpOnly session cookie server-side before redirecting —
      // otherwise proxy.ts still sees a (stale) token on /login and bounces
      // back to /dashboard, causing an infinite redirect loop.
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please log in again.')
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data as ApiResponse<T>
}

export function getUsers(): Promise<ApiResponse<User[]>> {
  return request('/api/users')
}

export function createUser(data: UserRequest): Promise<ApiResponse<User>> {
  return request('/api/users', { method: 'POST', body: JSON.stringify(data) })
}

export function updateUser(id: number, data: UserRequest): Promise<ApiResponse<User>> {
  return request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteUser(id: number): Promise<ApiResponse<void>> {
  return request(`/api/users/${id}`, { method: 'DELETE' })
}

export function healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; service: string, sysinfo: string }>> {
  return request('/api/health')
}
