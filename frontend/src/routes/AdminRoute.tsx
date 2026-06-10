import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../redux/hooks'

export function AdminRoute() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const isAdmin = user?.roles?.some((r) => r === 'Admin' || r === 'Manager')
  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
