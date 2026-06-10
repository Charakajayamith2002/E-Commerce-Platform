import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiChevronRight } from 'react-icons/fi'
import { useGetOrdersQuery } from '../../redux/api/ordersApi'

const statusBadge: Record<string, string> = {
  Pending: 'badge-warning',
  Confirmed: 'badge-primary',
  Processing: 'badge-primary',
  Shipped: 'badge bg-blue-100 text-blue-800',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
}

export function OrderHistoryPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetOrdersQuery({ page, pageSize: 10 })
  const orders = data?.data?.items || []
  const totalPages = data?.data?.totalPages || 1

  return (
    <div className="container-fluid py-10">
      <h1 className="section-title mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="w-16 h-16 skeleton rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-1/3" />
                <div className="h-3 skeleton rounded w-1/5" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-500 dark:text-dark-muted mb-6">You haven't placed any orders.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 flex items-center gap-5 hover:shadow-card-hover transition-all block">
                <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-dark-bg overflow-hidden flex-shrink-0">
                  {order.primaryImage ? (
                    <img src={order.primaryImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">{order.orderNumber}</p>
                    <span className={statusBadge[order.status] || 'badge-warning'}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-muted">
                    {order.itemCount} item{order.itemCount !== 1 ? 's' : ''} •{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 justify-end mt-1">
                    Details <FiChevronRight className="w-4 h-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-50">
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-dark-muted px-4">
                Page {page} of {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-secondary text-sm disabled:opacity-50">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
