import { Link } from 'react-router-dom'
import { FiPackage, FiHeart, FiUser, FiMapPin, FiArrowRight } from 'react-icons/fi'
import { useAppSelector } from '../../redux/hooks'
import { useGetOrdersQuery } from '../../redux/api/ordersApi'
import { motion } from 'framer-motion'

const statusColors: Record<string, string> = {
  Pending: 'badge-warning',
  Confirmed: 'badge-primary',
  Processing: 'badge-primary',
  Shipped: 'badge-success',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
}

export function UserDashboardPage() {
  const { user } = useAppSelector((s) => s.auth)
  const { data } = useGetOrdersQuery({ page: 1, pageSize: 5 })
  const orders = data?.data?.items || []

  const menuItems = [
    { icon: FiPackage, label: 'My Orders', desc: `${data?.data?.totalCount || 0} orders`, to: '/orders', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { icon: FiHeart, label: 'Wishlist', desc: 'Saved items', to: '/wishlist', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' },
    { icon: FiUser, label: 'Profile', desc: 'Manage account', to: '/profile', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { icon: FiMapPin, label: 'Addresses', desc: 'Shipping addresses', to: '/profile', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  ]

  return (
    <div className="container-fluid py-10">
      {/* Welcome */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-dark-muted">{user?.email}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={item.to} className="card p-5 flex flex-col items-center text-center hover:shadow-glow transition-all group">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</p>
              <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:gap-2 transition-all">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-dark-muted">No orders yet</p>
            <Link to="/products" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-dark-border">
            {orders.map((order: any) => (
              <Link key={order.id} to={`/orders/${order.id}`}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-dark-border overflow-hidden flex-shrink-0">
                  {order.primaryImage ? (
                    <img src={order.primaryImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-muted">
                    {order.itemCount} items • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                  <span className={`text-xs ${statusColors[order.status] || 'badge-warning'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
