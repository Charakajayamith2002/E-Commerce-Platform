import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiMenu, FiX, FiLogOut, FiChevronRight, FiBell, FiExternalLink
} from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { logoutUser } from '../redux/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
  { to: '/admin/products', label: 'Products', icon: FiPackage },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-0 h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border z-40 overflow-hidden"
          >
            <div className="flex flex-col h-full p-4">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">
                  ECommerce Admin
                </span>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group whitespace-nowrap ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Back to Store */}
              <NavLink
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border hover:text-gray-900 dark:hover:text-white transition-all duration-200 whitespace-nowrap mb-2"
              >
                <FiExternalLink className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Back to Store</span>
              </NavLink>

              {/* User Info */}
              <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-4">
                <div className="flex items-center gap-3 px-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? 256 : 0 }}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border h-16 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-muted transition-colors"
          >
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-muted relative">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
