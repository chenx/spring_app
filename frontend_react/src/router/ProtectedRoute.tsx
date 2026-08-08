import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

// Equivalent of the router.beforeEach "requiresAuth" guard in the Vue version.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isAuthenticated = !!localStorage.getItem('token')

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />
  }

  return <>{children}</>
}
