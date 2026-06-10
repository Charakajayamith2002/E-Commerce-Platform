import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../redux/api/productsApi'
import { useGetCategoriesQuery } from '../../redux/api/categoriesApi'

function ProductModal({ product, onClose }: { product?: any; onClose: () => void }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: '',
    price: product?.price ?? '',
    comparePrice: product?.comparePrice ?? '',
    sku: '',
    stockQuantity: product?.stockQuantity ?? 0,
    categoryId: '',
    brandId: '',
    isFeatured: product?.isFeatured ?? false,
    tags: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const { data: catData } = useGetCategoriesQuery(false)
  const categories = catData?.data ?? []

  const { data: fullProductData } = useGetProductBySlugQuery(product?.slug, { skip: !isEdit || !product?.slug })
  const fullProduct = (fullProductData as any)?.data

  useEffect(() => {
    if (fullProduct) {
      setForm({
        name: fullProduct.name ?? '',
        description: fullProduct.description ?? '',
        price: fullProduct.price ?? '',
        comparePrice: fullProduct.comparePrice ?? '',
        sku: fullProduct.sku ?? '',
        stockQuantity: fullProduct.stockQuantity ?? 0,
        categoryId: fullProduct.categoryId ?? '',
        brandId: fullProduct.brandId ?? '',
        isFeatured: fullProduct.isFeatured ?? false,
        tags: fullProduct.tags ?? '',
      })
    }
  }, [fullProduct])

  const loading = creating || updating

  const buildFormData = () => {
    const fd = new FormData()
    if (form.name) fd.append('name', form.name)
    if (form.description) fd.append('description', form.description)
    if (form.price) fd.append('price', String(form.price))
    fd.append('stockQuantity', String(form.stockQuantity))
    if (form.categoryId) fd.append('categoryId', form.categoryId)
    fd.append('isFeatured', String(form.isFeatured))
    if (form.comparePrice) fd.append('comparePrice', String(form.comparePrice))
    if (form.sku) fd.append('sku', form.sku)
    if (form.brandId) fd.append('brandId', form.brandId)
    if (form.tags) fd.append('tags', form.tags)
    images.forEach(img => fd.append('images', img))
    return fd
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoryId) { toast.error('Please select a category.'); return }
    try {
      if (isEdit) {
        const fd = buildFormData()
        await updateProduct({ id: product.id, formData: fd }).unwrap()
        toast.success('Product updated!')
      } else {
        const fd = buildFormData()
        fd.append('isActive', 'true')
        fd.append('isDigital', 'false')
        fd.append('requiresShipping', 'true')
        fd.append('lowStockThreshold', '5')
        await createProduct(fd).unwrap()
        toast.success('Product created!')
      }
      onClose()
    } catch {
      toast.error('Failed to save product.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Product Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Description</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Price *</label>
              <input type="number" step="0.01" className="input-field" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Compare Price</label>
              <input type="number" step="0.01" className="input-field" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">SKU</label>
              <input className="input-field" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Stock</label>
              <input type="number" className="input-field" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Category</label>
            <select className="input-field" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Select category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Tags (comma separated)</label>
            <input className="input-field" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="electronics, featured, new" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              {isEdit ? 'Replace Image (optional)' : 'Images'}
            </label>
            <input type="file" multiple accept="image/*" className="input-field py-2" onChange={e => setImages(Array.from(e.target.files ?? []))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="rounded" />
            <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Featured Product</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{ open: boolean; product?: any }>({ open: false })
  const { data, isLoading } = useGetProductsQuery({ search, page, pageSize: 10 })
  const [deleteProduct] = useDeleteProductMutation()
  const products = data?.data?.items ?? []
  const totalPages = data?.data?.totalPages ?? 1

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await deleteProduct(id).unwrap()
      toast.success('Product deleted.')
    } catch {
      toast.error('Failed to delete product.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Products</h1>
        <button onClick={() => setModal({ open: true })} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-dark-border">
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">Product</th>
                  <th className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">SKU</th>
                  <th className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">Price</th>
                  <th className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">Stock</th>
                  <th className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">Status</th>
                  <th className="text-right p-4 text-gray-500 dark:text-dark-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-400">No products found.</td></tr>
                ) : products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-bg overflow-hidden flex-shrink-0">
                          {p.primaryImage ? (
                            <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-dark-muted font-mono text-xs">{p.sku}</td>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">${p.price?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`font-medium ${p.stockQuantity <= 5 ? 'text-red-500' : 'text-gray-700 dark:text-dark-text'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.isActive
                        ? <span className="badge-success text-xs">Active</span>
                        : <span className="badge-danger text-xs">Inactive</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ open: true, product: p })}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-bg'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal.open && <ProductModal product={modal.product} onClose={() => setModal({ open: false })} />}
      </AnimatePresence>
    </div>
  )
}
