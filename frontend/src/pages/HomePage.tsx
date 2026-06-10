import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi'
import { useAppDispatch } from '../redux/hooks'
import { fetchCart } from '../redux/slices/cartSlice'
import { fetchWishlist } from '../redux/slices/wishlistSlice'
import { useGetFeaturedProductsQuery } from '../redux/api/productsApi'
import { useGetCategoriesQuery } from '../redux/api/categoriesApi'
import { ProductCard } from '../components/product/ProductCard'
import { SkeletonGrid } from '../components/ui/SkeletonCard'

const featureItems = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $100' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer service' },
  { icon: FiShoppingBag, title: 'Easy Returns', desc: '30-day return policy' },
]

const heroSlides = [
  {
    title: 'Summer Sale is ON!',
    subtitle: 'Up to 70% off on selected items',
    cta: 'Shop Now',
    href: '/products',
    gradient: 'from-primary-600 to-secondary-500',
  },
  {
    title: 'New Arrivals',
    subtitle: 'Discover the latest trends in fashion & tech',
    cta: 'Explore Now',
    href: '/products?sortBy=createdAt',
    gradient: 'from-purple-600 to-pink-600',
  },
]

export function HomePage() {
  const dispatch = useAppDispatch()
  const { data: featuredData, isLoading } = useGetFeaturedProductsQuery(undefined)
  const { data: categoriesData } = useGetCategoriesQuery(undefined)
  const products = featuredData?.data?.items || []
  const categories = categoriesData?.data || []

  useEffect(() => {
    dispatch(fetchCart())
    dispatch(fetchWishlist())
  }, [dispatch])

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="container-fluid py-20 md:py-28">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                Summer Sale 2025
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                Shop the Best <br />
                <span className="text-yellow-300">Products</span> Online
              </h1>
              <p className="text-lg text-primary-100 mb-8 max-w-xl">
                Discover thousands of premium products at unbeatable prices.
                Free shipping on orders over $100.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                >
                  Shop Now
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/products?isFeatured=true"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors"
                >
                  View Deals
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 right-20 -translate-y-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-20 right-40 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 720 0 0 30L0 60Z" fill="white" className="dark:fill-dark-bg" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="container-fluid">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featureItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 text-center hover:shadow-glow transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 dark:text-dark-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="container-fluid">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="text-gray-500 dark:text-dark-muted mt-1">Browse our wide selection of categories</p>
            </div>
            <Link to="/products" className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat: any) => (
              <Link key={cat.id} to={`/products?categoryId=${cat.id}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="card p-4 text-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center mx-auto mb-3 group-hover:shadow-glow transition-all">
                    <FiShoppingBag className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{cat.productCount} items</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container-fluid">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="text-gray-500 dark:text-dark-muted mt-1">Handpicked products just for you</p>
          </div>
          <Link to="/products?isFeatured=true" className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View All <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">No featured products found</div>
        )}
      </section>

      {/* Flash Sale Banner */}
      <section className="container-fluid">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-600 p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Flash Sale!</h2>
          <p className="text-orange-100 mb-6 text-lg">Up to 50% off - Limited time only</p>
          <Link
            to="/products?sortBy=price&sortOrder=asc"
            className="inline-flex items-center gap-2 bg-white text-orange-700 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            Grab the Deal <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
