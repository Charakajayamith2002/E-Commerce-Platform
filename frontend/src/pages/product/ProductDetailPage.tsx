import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiStar, FiHeart, FiShoppingCart, FiShare2, FiTruck,
  FiShield, FiMinus, FiPlus, FiCheck
} from 'react-icons/fi'
import { useGetProductBySlugQuery, useGetProductReviewsQuery } from '../../redux/api/productsApi'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { addToCart } from '../../redux/slices/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice'
import { toast } from 'react-toastify'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((s) => s.auth)
  const wishlistItems = useAppSelector((s) => s.wishlist.items)

  const { data, isLoading } = useGetProductBySlugQuery(slug!)
  const product = data?.data
  const { data: reviewsData } = useGetProductReviewsQuery(
    { productId: product?.id || '', page: 1 },
    { skip: !product?.id }
  )
  const reviews = reviewsData?.data?.items || []

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')

  if (isLoading) {
    return (
      <div className="container-fluid py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-5 skeleton rounded-lg" style={{ width: `${60 + i * 8}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-fluid py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  const isInWishlist = wishlistItems.some((w) => w.productId === product.id)
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Please login to add items to cart'); return }
    await dispatch(addToCart({
      productId: product.id,
      variantId: selectedVariant,
      quantity,
    }))
  }

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.info('Please login to use wishlist'); return }
    if (isInWishlist) await dispatch(removeFromWishlist(product.id))
    else await dispatch(addToWishlist(product.id))
  }

  const primaryImages = product.images.length > 0 ? product.images : []
  const currentImage = primaryImages[selectedImage]?.imageUrl

  return (
    <div className="container-fluid py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-muted mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border"
          >
            {currentImage ? (
              <img src={currentImage} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FiShoppingCart className="w-24 h-24" />
              </div>
            )}
          </motion.div>

          {primaryImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {primaryImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === i
                      ? 'border-primary-500'
                      : 'border-gray-100 dark:border-dark-border hover:border-gray-300'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.brandName && (
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-1">{product.brandName}</p>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
              </div>
              <button onClick={handleWishlist} className="flex-shrink-0 p-3 rounded-xl border border-gray-200 dark:border-dark-border hover:border-red-300 transition-colors">
                <FiHeart className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-dark-muted">
                ({product.reviewCount} reviews)
              </span>
              <span className="text-sm text-gray-500 dark:text-dark-muted">
                {product.salesCount} sold
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-xl text-gray-400 line-through">${product.comparePrice.toFixed(2)}</span>
            )}
            {discount && (
              <span className="badge bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-bold text-base px-3 py-1">
                -{discount}%
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-gray-600 dark:text-dark-muted leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Variants */}
          {product.variants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id === selectedVariant ? undefined : v.id)}
                    disabled={v.stockQuantity === 0}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedVariant === v.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:border-primary-400 disabled:opacity-40'
                    }`}
                  >
                    {v.name}{v.value ? ` - ${v.value}` : ''}
                    {v.priceMod > 0 && ` (+$${v.priceMod})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-dark-text"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-dark-text disabled:opacity-40"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <span className={`text-sm font-medium ${product.isInStock ? 'text-green-600' : 'text-red-500'}`}>
                {product.isInStock ? (
                  <span className="flex items-center gap-1.5">
                    <FiCheck className="w-4 h-4" /> In Stock ({product.stockQuantity})
                  </span>
                ) : 'Out of Stock'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.isInStock}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                className="btn-outline flex items-center gap-2"
              >
                <FiHeart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            {[
              { icon: FiTruck, text: 'Free Shipping over $100' },
              { icon: FiShield, text: '2-Year Warranty' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-muted">
                <f.icon className="w-4 h-4 text-primary-600" />
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-1 border-b border-gray-200 dark:border-dark-border mb-8">
          {(['description', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'reviews' && `(${product.reviewCount})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-dark-text leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-dark-muted py-10">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      {review.userAvatar ? (
                        <img src={review.userAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                          {review.userName?.[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{review.userName}</span>
                        {review.isVerifiedPurchase && (
                          <span className="badge-success text-xs">Verified Purchase</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{review.title}</h4>
                      )}
                      <p className="text-sm text-gray-600 dark:text-dark-muted">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
