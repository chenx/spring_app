import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

const PROTECTED_PATHS = ['/dashboard', '/users']

// Server-side equivalent of the Vue router.beforeEach guard: the httpOnly
// session cookie can only be read here (or in Server Components/route
// handlers), never by client JS, so route protection lives in this proxy.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/login'],
}
