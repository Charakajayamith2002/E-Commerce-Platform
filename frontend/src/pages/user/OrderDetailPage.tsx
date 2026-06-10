import { useParams, Link } from 'react-router-dom'
import { FiPackage, FiMapPin, FiCreditCard, FiArrowLeft } from 'react-icons/fi'
import { useGetOrderByIdQuery } from '../../redux/api/ordersApi'

const statusColors: Record<string, string> = {
  Pending: 'badge-warning',
  Confirmed: 'badge-primary',
  Shipped: 'badge bg-blue-100 text-blue-800',
  Delivered: 'badge-success',
  Cancelled: 'badge-danger',
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useGetOrderByIdQuery(id!, { skip: !id })
  const order = data?.data

  if (isLoading) {
    return (
      <div className="container-fluid py-10 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card p-6 h-32 skeleton" />)}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-fluid py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order not found</h2>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    )
  }

  return (
    <div className="container-fluid py-10">
      <Link to="/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <FiArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
          <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={statusColors[order.status] || 'badge-warning'}>{order.status}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-dark-border">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-primary-600" /> Order Items
              </h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-dark-border">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-5">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-dark-bg overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{item.productName}</p>
                    {item.variantName && <p className="text-sm text-gray-500 dark:text-dark-muted">{item.variantName}</p>}
                    <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">${item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <FiMapPin className="w-5 h-5 text-primary-600" /> Shipping Address
            </h2>
            <div className="text-sm text-gray-700 dark:text-dark-text space-y-1">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phoneNumber}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Tracking: {order.trackingNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
            <FiCreditCard className="w-5 h-5 text-primary-600" /> Payment Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-dark-muted">
              <span>Subtotal</span><span>${order.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-dark-muted">
              <span>Shipping</span>
              <span className={order.shippingAmount === 0 ? 'text-green-600' : ''}>
                {order.shippingAmount === 0 ? 'FREE' : `$${order.shippingAmount.toFixed(2)}`}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-dark-muted">
              <span>Tax</span><span>${order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-100 dark:border-dark-border pt-3">
              <span>Total</span><span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
            <p className="text-sm text-gray-600 dark:text-dark-muted">Payment Status</p>
            <p className={`font-semibold text-sm mt-0.5 ${order.paymentStatus === 'Succeeded' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
