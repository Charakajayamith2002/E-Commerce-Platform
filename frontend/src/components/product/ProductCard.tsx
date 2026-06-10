import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { addToCart } from '../../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice'
import { toast } from 'react-toastify'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    shortDescription?: string
    price: number
    comparePrice?: number
    primaryImageUrl?: string
    averageRating: number
    reviewCount: number
    isInStock: boolean
    isFeatured: boolean
    categoryName: string
    brandName?: string
    stockQuantity: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const wishlistItems = useAppSelector((s) => s.wishlist.items)
  const [isHovered, setIsHovered] = useState(false)

  const isInWishlist = wishlistItems.some((w) => w.productId === product.id)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart')
      return
    }
    await dispatch(addToCart({ productId: product.id, quantity: 1 }))
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info('Please login to use wishlist')
      return
    }
    if (isInWishlist) {
      await dispatch(removeFromWishlist(product.id))
    } else {
      await dispatch(addToWishlist(product.id))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card group"
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-dark-bg">
          {product.primaryImageUrl ? (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-border">
              <FiShoppingCart className="w-16 h-16" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <span className="badge bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="badge-primary text-xs px-2 py-0.5 rounded-lg">Featured</span>
            )}
            {!product.isInStock && (
              <span className="badge bg-gray-500 text-white text-xs px-2 py-0.5 rounded-lg">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-200 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-colors ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:bg-red-500 hover:text-white'
              }`}
            >
              <FiHeart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:bg-primary-600 hover:text-white flex items-center justify-center shadow-md transition-colors"
            >
              <FiEye className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Add to Cart */}
          <div className={`absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-sm font-semibold py-2.5 text-center transition-all duration-200 ${isHovered && product.isInStock ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
            <button onClick={handleAddToCart} className="w-full flex items-center justify-center gap-2">
              <FiShoppingCart className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.categoryName && (
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">{product.categoryName}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= Math.round(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-dark-muted">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
