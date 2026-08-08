import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

// Equivalent of the router.beforeEach "already logged in, skip /login" rule in the Vue version.
export default function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('token')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
