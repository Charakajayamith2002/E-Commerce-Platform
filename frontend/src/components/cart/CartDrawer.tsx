import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiShoppingBag, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { setCartOpen } from '../../redux/slices/uiSlice'
import { removeFromCart, updateCartItem } from '../../redux/slices/cartSlice'

export function CartDrawer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isCartOpen } = useAppSelector((s) => s.ui)
  const { items, subTotal, shippingAmount, taxAmount, totalAmount, totalItems } = useAppSelector((s) => s.cart)
  const { isAuthenticated } = useAppSelector((s) => s.auth)

  const handleCheckout = () => {
    dispatch(setCartOpen(false))
    if (isAuthenticated) {
      navigate('/checkout')
    } else {
      navigate('/login?redirect=/checkout')
    }
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setCartOpen(false))}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-card shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                {totalItems > 0 && (
                  <span className="badge-primary text-xs">{totalItems} items</span>
                )}
              </div>
              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center">
                    <FiShoppingBag className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Cart is empty</p>
                    <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
                      Add some products to get started
                    </p>
                  </div>
                  <Link
                    to="/products"
                    onClick={() => dispatch(setCartOpen(false))}
                    className="btn-primary text-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-dark-border flex items-center justify-center">
                          <FiShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.productSlug}`}
                        onClick={() => dispatch(setCartOpen(false))}
                        className="text-sm font-semibold text-gray-900 dark:text-white truncate block hover:text-primary-600 transition-colors"
                      >
                        {item.productName}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{item.variantName}</p>
                      )}
                      <p className="text-sm font-bold text-primary-600 mt-1">
                        ${item.totalPrice.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1 }))}
                            className="w-6 h-6 rounded-lg border border-gray-200 dark:border-dark-border flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity + 1 }))}
                            disabled={item.quantity >= item.maxStock}
                            className="w-6 h-6 rounded-lg border border-gray-200 dark:border-dark-border flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-colors disabled:opacity-50"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 dark:border-dark-border space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                    <span>Subtotal</span>
                    <span>${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                    <span>Shipping</span>
                    <span className={shippingAmount === 0 ? 'text-green-600' : ''}>
                      {shippingAmount === 0 ? 'FREE' : `$${shippingAmount.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-dark-muted">
                    <span>Tax</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-100 dark:border-dark-border pt-2">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full text-center">
                  Proceed to Checkout
                </button>
                <Link
                  to="/cart"
                  onClick={() => dispatch(setCartOpen(false))}
                  className="btn-secondary w-full text-center text-sm block"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
