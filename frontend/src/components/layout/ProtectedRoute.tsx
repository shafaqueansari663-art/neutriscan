import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, authLoading } = useAuth()
  const loc = useLocation()
  if (authLoading) return <div className="route-boot">Loading session…</div>
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return <>{children}</>
}
