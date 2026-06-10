import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiEye, FiX, FiPackage } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../redux/api/ordersApi'
import { Link } from 'react-router-dom'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled']

const statusColor: Record<string, string> = {
  Pending: 'badge-warning',
  Confirmed: 'badge-primary',
  Processing: 'badge bg-blue-100 text-blue-700',
  Shipped: 'badge bg-indigo-100 text-indigo-700',
  OutForDelivery: 'badge bg-cyan-100 text-cyan-700',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
}

function UpdateStatusModal({ order, onClose }: { order: any; onClose: () => void }) {
  const [status, setStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '')
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation()

  const handleSave = async () => {
    try {
      await updateStatus({ id: order.id, status, trackingNumber }).unwrap()
      toast.success('Order status updated!')
      onClose()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white">Update Order Status</h2>
          <button onClick={onClose}><FiX className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">Order: <span className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</span></p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Status</label>
            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Tracking Number</label>
            <input className="input-field" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Optional tracking number" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="btn-primary">
            {isLoading ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const { data, isLoading } = useGetAllOrdersQuery({ search, status: statusFilter, page, pageSize: 15 })
  const orders = data?.data?.items ?? []
  const totalPages = data?.data?.totalPages ?? 1

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Orders</h1>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-dark-border flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by order # or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input-field w-auto" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="p-10 text-center text-gray-400">No orders found.</td></tr>
                ) : orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-medium text-gray-900 dark:text-white">{o.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-white">{o.customerName}</p>
                      <p className="text-xs text-gray-400">{o.customerEmail}</p>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-dark-muted">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-700 dark:text-dark-text">{o.itemCount}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">${o.totalAmount?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium ${o.paymentStatus === 'Succeeded' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={statusColor[o.status] || 'badge-warning'}>{o.status}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/orders/${o.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Update status"
                        >
                          <FiPackage className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-bg'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && <UpdateStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </AnimatePresence>
    </div>
  )
}
