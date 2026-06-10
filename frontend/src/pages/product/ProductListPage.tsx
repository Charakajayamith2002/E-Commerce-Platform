import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFilter, FiChevronDown, FiX, FiGrid, FiList } from 'react-icons/fi'
import { useGetProductsQuery } from '../../redux/api/productsApi'
import { useGetCategoriesQuery } from '../../redux/api/categoriesApi'
import { ProductCard } from '../../components/product/ProductCard'
import { SkeletonGrid } from '../../components/ui/SkeletonCard'

const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'sales-desc', label: 'Best Sellers' },
]

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt-desc')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [page, setPage] = useState(1)

  const { data: categoriesData } = useGetCategoriesQuery(undefined)
  const categories = categoriesData?.data || []

  const filters = {
    searchTerm: searchParams.get('searchTerm') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    brandId: searchParams.get('brandId') || undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
    sortBy: sortBy.split('-')[0],
    sortOrder: sortBy.split('-')[1],
    pageIndex: page,
    pageSize: 12,
  }

  const { data, isLoading, isFetching } = useGetProductsQuery(filters)
  const products = data?.data?.items || []
  const totalPages = data?.data?.totalPages || 1
  const totalCount = data?.data?.totalCount || 0

  useEffect(() => { setPage(1) }, [searchParams])

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  return (
    <div className="container-fluid py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">
            {searchParams.get('searchTerm')
              ? `Search: "${searchParams.get('searchTerm')}"`
              : 'All Products'}
          </h1>
          <p className="text-gray-500 dark:text-dark-muted mt-1">
            {totalCount} products found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-secondary text-sm"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-sm py-2 max-w-[180px]"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <motion.aside
          initial={false}
          animate={{ width: showFilters ? 280 : 0, opacity: showFilters ? 1 : 0 }}
          className="flex-shrink-0 overflow-hidden"
        >
          {showFilters && (
            <div className="w-[280px] space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('categoryId', undefined)}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      !searchParams.get('categoryId')
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('categoryId', cat.id)}
                      className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                        searchParams.get('categoryId') === cat.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border'
                      }`}
                    >
                      {cat.name} ({cat.productCount})
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                    className="input-field text-sm py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams())
                  setPriceRange({ min: '', max: '' })
                }}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <FiX className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </motion.aside>

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading || isFetching ? (
            <SkeletonGrid count={12} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
                <FiGrid className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-dark-muted">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          page === p
                            ? 'bg-primary-600 text-white'
                            : 'btn-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
