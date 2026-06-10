import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { useGetDashboardStatsQuery } from '../../redux/api/adminApi'
import { Link } from 'react-router-dom'

const COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#14b8a6']

function StatCard({ title, value, change, icon: Icon, color }: any) {
  const positive = change >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">{title}</p>
    </motion.div>
  )
}

export function AdminDashboardPage() {
  const { data, isLoading } = useGetDashboardStatsQuery()
  const stats = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-6 h-32 skeleton" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="card p-6 h-80 skeleton" />)}
        </div>
      </div>
    )
  }

  const statCards = [
    { title: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, change: stats?.revenueGrowth ?? 0, icon: FiDollarSign, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { title: 'Total Orders', value: (stats?.totalOrders ?? 0).toLocaleString(), change: stats?.ordersGrowth ?? 0, icon: FiShoppingBag, color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { title: 'Total Users', value: (stats?.totalUsers ?? 0).toLocaleString(), change: stats?.usersGrowth ?? 0, icon: FiUsers, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { title: 'Total Products', value: (stats?.totalProducts ?? 0).toLocaleString(), change: 0, icon: FiPackage, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats?.revenueChart ?? []}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders Bar Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.ordersByStatus ?? []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(stats?.ordersByStatus ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(stats?.topProducts ?? []).map((p: any, i: number) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center text-xs font-bold text-gray-500">
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-dark-bg overflow-hidden flex-shrink-0">
                  {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.totalSold} sold</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">${p.revenue.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentOrders ?? []).map((o: any) => (
              <div key={o.orderId} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{o.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${o.totalAmount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
