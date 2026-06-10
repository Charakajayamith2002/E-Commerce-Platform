import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi'
import { useGetOrderByIdQuery } from '../../redux/api/ordersApi'

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const { data } = useGetOrderByIdQuery(id!, { skip: !id })
  const order = data?.data

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-gray-50 dark:bg-dark-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="card p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Order Placed!
          </h1>
          <p className="text-gray-500 dark:text-dark-muted mb-6">
            Thank you for your purchase. Your order has been placed successfully.
          </p>

          {order && (
            <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-muted">Order Number</span>
                <span className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-muted">Total Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-muted">Status</span>
                <span className="badge-success">{order.status}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link to={`/orders/${id}`} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiPackage className="w-5 h-5" /> Track Order
            </Link>
            <Link to="/products" className="btn-secondary w-full flex items-center justify-center gap-2">
              Continue Shopping <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
