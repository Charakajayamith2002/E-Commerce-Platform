import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../redux/api/categoriesApi'

function CategoryModal({ category, categories, onClose }: { category?: any; categories: any[]; onClose: () => void }) {
  const isEdit = !!category
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    parentCategoryId: category?.parentCategoryId ?? '',
    isFeatured: category?.isFeatured ?? false,
  })
  const [image, setImage] = useState<File | null>(null)
  const [create, { isLoading: creating }] = useCreateCategoryMutation()
  const [update, { isLoading: updating }] = useUpdateCategoryMutation()
  const loading = creating || updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
        if (image) fd.append('image', image)
        await update({ id: category.id, data: fd }).unwrap()
        toast.success('Category updated!')
      } else {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
        if (image) fd.append('image', image)
        await create(fd).unwrap()
        toast.success('Category created!')
      }
      onClose()
    } catch {
      toast.error('Failed to save category.')
    }
  }

  const parents = categories.filter((c: any) => !c.parentCategoryId && c.id !== category?.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose}><FiX className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Parent Category</label>
            <select className="input-field" value={form.parentCategoryId} onChange={e => setForm(f => ({ ...f, parentCategoryId: e.target.value }))}>
              <option value="">None (top-level)</option>
              {parents.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Image</label>
            <input type="file" accept="image/*" className="input-field py-2" onChange={e => setImage(e.target.files?.[0] ?? null)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="rounded" />
            <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Featured Category</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Category'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export function AdminCategoriesPage() {
  const [modal, setModal] = useState<{ open: boolean; category?: any }>({ open: false })
  const { data, isLoading } = useGetCategoriesQuery({})
  const [deleteCategory] = useDeleteCategoryMutation()
  const categories: any[] = data?.data ?? []

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    try {
      await deleteCategory(id).unwrap()
      toast.success('Category deleted.')
    } catch {
      toast.error('Failed to delete category.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Categories</h1>
        <button onClick={() => setModal({ open: true })} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-28 skeleton" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-3 text-center py-20 text-gray-400">No categories yet.</div>
          ) : categories.map((c: any) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-bg flex items-center justify-center flex-shrink-0">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FiTag className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                    {c.parentCategoryId && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Sub of: {categories.find((p: any) => p.id === c.parentCategoryId)?.name ?? '—'}
                      </p>
                    )}
                    {c.isFeatured && (
                      <span className="badge-primary text-xs mt-1 inline-block">Featured</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ open: true, category: c })}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {c.description && (
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-1.5 line-clamp-2">{c.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <CategoryModal
            category={modal.category}
            categories={categories}
            onClose={() => setModal({ open: false })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
