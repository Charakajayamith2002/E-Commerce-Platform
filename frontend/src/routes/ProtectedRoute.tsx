import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../redux/hooks'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
