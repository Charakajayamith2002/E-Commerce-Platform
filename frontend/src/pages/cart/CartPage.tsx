import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiTag } from 'react-icons/fi'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { removeFromCart, updateCartItem, clearCart, setCoupon, removeCoupon } from '../../redux/slices/cartSlice'
import { cartApi } from '../../services/cartService'
import { toast } from 'react-toastify'

export function CartPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, subTotal, shippingAmount, taxAmount, discountAmount, totalAmount, appliedCoupon } = useAppSelector((s) => s.cart)
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await cartApi.applyCoupon(couponCode)
      const couponData = res.data.data
      if (couponData.type === 'Percentage') {
        const discount = Math.min(
          subTotal * couponData.discountValue / 100,
          couponData.maximumDiscountAmount || Infinity
        )
        dispatch(setCoupon({ code: couponCode, discount }))
      } else if (couponData.type === 'FixedAmount') {
        dispatch(setCoupon({ code: couponCode, discount: Math.min(couponData.discountValue, subTotal) }))
      } else {
        dispatch(setCoupon({ code: couponCode, discount: shippingAmount }))
      }
      toast.success('Coupon applied!')
      setCouponCode('')
    } catch (error: any) {
      toast.error(error.response?.data?.errors?.[0] || 'Invalid coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-fluid py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center mx-auto mb-6">
          <FiShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-dark-muted mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-fluid py-10">
      <h1 className="section-title mb-8">Shopping Cart <span className="text-gray-400 font-normal text-xl">({items.length} items)</span></h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end">
            <button onClick={() => dispatch(clearCart())} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1.5 font-medium">
              <FiTrash2 className="w-4 h-4" /> Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <div key={item.id} className="card p-5 flex gap-5">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-dark-bg flex-shrink-0">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FiShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link to={`/products/${item.productSlug}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{item.variantName}</p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex-shrink-0"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border text-gray-600"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                      disabled={item.quantity >= item.maxStock}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border text-gray-600 disabled:opacity-40"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">${item.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">${item.unitPrice.toFixed(2)} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input-field pl-9 py-2.5 text-sm"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode}
                  className="btn-secondary text-sm px-4 py-2.5 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-green-600 font-medium">{appliedCoupon} applied!</span>
                  <button onClick={() => dispatch(removeCoupon())} className="text-red-500 hover:underline text-xs">Remove</button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 dark:border-dark-border pt-5">
              <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                <span>Subtotal</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                <span>Shipping</span>
                <span className={shippingAmount === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingAmount === 0 ? 'FREE' : `$${shippingAmount.toFixed(2)}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                <span>Tax (8%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-100 dark:border-dark-border pt-3">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
              className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2"
            >
              Checkout <FiArrowRight className="w-5 h-5" />
            </button>

            <Link to="/products" className="block text-center text-sm text-primary-600 dark:text-primary-400 mt-3 hover:underline">
              Continue Shopping
            </Link>

            {shippingAmount > 0 && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Add ${(100 - subTotal).toFixed(2)} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
