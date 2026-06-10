import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX,
  FiSun, FiMoon, FiLogOut, FiPackage, FiSettings, FiChevronDown
} from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { toggleDarkMode, toggleCart, toggleMobileMenu } from '../../redux/slices/uiSlice'
import { logoutUser } from '../../redux/slices/authSlice'
import { useGetCategoriesQuery } from '../../redux/api/categoriesApi'

export function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isDarkMode, isCartOpen, isMobileMenuOpen } = useAppSelector((s) => s.ui)
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  const { totalItems } = useAppSelector((s) => s.cart)
  const { data: categoriesData } = useGetCategoriesQuery(undefined)
  const categories = categoriesData?.data || []

  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?searchTerm=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const isAdmin = user?.roles?.some((r) => r === 'Admin' || r === 'Manager')

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-gray-100 dark:border-dark-border shadow-sm">
      <div className="container-fluid">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => dispatch(toggleMobileMenu())}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-glow">
              E
            </div>
            <span className="hidden sm:block font-bold text-xl text-gray-900 dark:text-white">
              ECommerce
            </span>
          </Link>

          {/* Categories Mega Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-700 dark:text-dark-text font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                Categories
                <FiChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-card-hover py-3 min-w-[200px] z-50"
                  >
                    {categories.slice(0, 8).map((cat: any) => (
                      <Link
                        key={cat.id}
                        to={`/products?categoryId=${cat.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/products" className="px-4 py-2 rounded-xl text-gray-700 dark:text-dark-text font-medium hover:bg-gray-50 dark:hover:bg-dark-border">
              All Products
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-xl text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="p-2 rounded-xl text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <FiHeart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-xl text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
              aria-label="Cart"
            >
              <FiShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                        {user?.firstName?.[0]}
                      </span>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-card-hover py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{user?.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
                      >
                        <FiSettings className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/orders" onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border"
                      >
                        <FiPackage className="w-4 h-4" /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          <FiSettings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-dark-border mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                <FiUser className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
