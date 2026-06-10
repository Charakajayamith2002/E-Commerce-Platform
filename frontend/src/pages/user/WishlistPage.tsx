import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { removeFromWishlist } from '../../redux/slices/wishlistSlice'
import { addToCart } from '../../redux/slices/cartSlice'

export function WishlistPage() {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector(s => s.wishlist)

  const handleRemove = (productId: string) => dispatch(removeFromWishlist(productId))

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({ productId: item.productId, quantity: 1 }))
  }

  if (loading) {
    return (
      <div className="container-fluid py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-80 skeleton" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <Link to="/products" className="btn-outline text-sm">
            Continue Shopping <FiArrowRight className="inline w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="w-24 h-24 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mx-auto mb-6">
            <FiHeart className="w-12 h-12 text-pink-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-dark-muted mb-8">Save items you love and come back to them anytime.</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((item: any) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card overflow-hidden group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-dark-bg">
                  <Link to={`/products/${item.productSlug}`}>
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiHeart className="w-12 h-12 text-gray-200 dark:text-dark-border" />
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-dark-card shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <Link to={`/products/${item.productSlug}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 hover:text-primary-600 transition-colors mb-2">
                      {item.productName}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${item.price?.toFixed(2) ?? '—'}
                    </p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                    >
                      <FiShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
