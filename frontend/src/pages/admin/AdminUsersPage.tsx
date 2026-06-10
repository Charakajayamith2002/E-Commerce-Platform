import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiSearch, FiShield, FiTrash2, FiX, FiUser } from 'react-icons/fi'
import { toast } from 'react-toastify'
import {
  useGetAdminUsersQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
  useChangeUserRoleMutation,
} from '../../redux/api/adminApi'

const ROLES = ['Customer', 'Manager', 'Admin']

function RoleModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [role, setRole] = useState(user.roles?.[0] ?? 'Customer')
  const [changeRole, { isLoading }] = useChangeUserRoleMutation()

  const handleSave = async () => {
    try {
      await changeRole({ userId: user.id, role }).unwrap()
      toast.success('Role updated!')
      onClose()
    } catch {
      toast.error('Failed to update role.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Change Role</h2>
          <button onClick={onClose}><FiX className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">{user.email}</p>
        <select className="input-field mb-5" value={role} onChange={e => setRole(e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="btn-primary">
            {isLoading ? 'Saving...' : 'Save Role'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleModal, setRoleModal] = useState<any>(null)
  const { data, isLoading } = useGetAdminUsersQuery({ search, page, pageSize: 15 })
  const [blockUser] = useBlockUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const users = data?.data?.items ?? []
  const totalPages = data?.data?.totalPages ?? 1

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await blockUser(userId).unwrap()
      toast.success(isBlocked ? 'User unblocked.' : 'User blocked.')
    } catch {
      toast.error('Failed to update user.')
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Permanently delete user "${email}"? This cannot be undone.`)) return
    try {
      await deleteUser(userId).unwrap()
      toast.success('User deleted.')
    } catch {
      toast.error('Failed to delete user.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Users</h1>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-dark-border">
          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  {['User', 'Email Verified', 'Role', 'Orders', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left p-4 text-gray-500 dark:text-dark-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400">No users found.</td></tr>
                ) : users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-white">
                              {`${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || <FiUser className="w-4 h-4" />}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {u.emailConfirmed
                        ? <span className="text-green-600 text-xs font-medium">Verified</span>
                        : <span className="text-yellow-600 text-xs font-medium">Pending</span>}
                    </td>
                    <td className="p-4">
                      <span className="badge-primary text-xs">{u.roles?.[0] ?? 'Customer'}</span>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-dark-text">{u.orderCount ?? 0}</td>
                    <td className="p-4 text-gray-500 dark:text-dark-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {u.isBlocked
                        ? <span className="badge-danger text-xs">Blocked</span>
                        : <span className="badge-success text-xs">Active</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRoleModal(u)}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Change role"
                        >
                          <FiShield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBlock(u.id, u.isBlocked)}
                          className={`p-2 rounded-lg transition-colors text-gray-400 ${u.isBlocked ? 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                          title={u.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {u.isBlocked ? '✓' : '⊘'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete user"
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
        {roleModal && <RoleModal user={roleModal} onClose={() => setRoleModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
